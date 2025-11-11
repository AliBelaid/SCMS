import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { FileService } from '../../services/file.service';
import { AuthService } from '../../services/auth.service';
import { SignalRService } from '../../services/signalr.service';
import { RoleMonitorService } from '../../services/role-monitor.service';
import { FileEntry } from '../../models/file-entry';
import { FilePreviewDialogComponent } from '../file-preview-dialog/file-preview-dialog.component';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { SharedHeaderComponent } from '../shared-header/shared-header.component';
import { Clipboard } from '@angular/cdk/clipboard';

interface FileWithProgress extends FileEntry {
  downloadProgress?: number;
  isDownloading?: boolean;
}

type ViewMode = 'grid' | 'table';

@Component({
  selector: 'app-file-table',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MaterialModule, 
    TranslateModule, 
    SharedHeaderComponent
  ],
  templateUrl: './file-table.component.html',
  styleUrls: ['./file-table.component.scss']
})
export class FileTableComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // All properties must be public to be accessible in template
  files: FileWithProgress[] = [];
  filteredFiles: FileWithProgress[] = [];
  dataSource!: MatTableDataSource<FileWithProgress>;
  displayedColumns: string[] = ['fileName', 'fileSize', 'dateUploaded', 'uploadedBy', 'status', 'actions'];
  
  // View and Search properties - PUBLIC for template access
  viewMode: ViewMode = 'table';
  searchTerm: string = '';
  selectedFilters: string[] = [];
  isToggling = false; // PUBLIC - used in template for button state
  
  currentUser: any;
  userPermissions = {
    isAdmin: false,
    canUploadFiles: false
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private fileService: FileService,
    private authService: AuthService,
    private signalRService: SignalRService,
    private roleMonitorService: RoleMonitorService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private clipboard: Clipboard
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    // Initialize view mode based on current route
    this.initializeViewMode();
    this.updateUserPermissions();
    this.loadFiles();
    this.setupNotifications();
    this.setupRoleChangeListening();
  }

  private initializeViewMode(): void {
    const currentUrl = this.router.url.split('?')[0];
    if (currentUrl.includes('/files/table')) {
      this.viewMode = 'table';
      console.log('Initialized in table view mode');
    } else {
      this.viewMode = 'table'; // Default to table view for this component
      console.log('Initialized in table view mode (default)');
    }
    this.updateDisplayColumns();
    console.log('View mode set to:', this.viewMode);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFiles(): void {
    this.fileService.getFilesForCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(files => {
        this.files = files.map(file => ({
          ...file,
          downloadProgress: 0,
          isDownloading: false
        }));
        this.filteredFiles = [...this.files];
        this.initializeDataSource();
      });
  }

  initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.filteredFiles);
    console.log('DataSource initialized with', this.filteredFiles.length, 'files');
    console.log('Files data:', this.filteredFiles);
    
    // Force change detection
    this.cdr.detectChanges();
    
    // Set sort and paginator after view init
    setTimeout(() => {
      if (this.sort) {
        this.dataSource.sort = this.sort;
        console.log('Sort applied to dataSource');
      }
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        console.log('Paginator applied to dataSource');
      }
      // Force another change detection after setting sort and paginator
      this.cdr.detectChanges();
    }, 100);
  }

  setupNotifications(): void {
    this.signalRService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        if (notification.type === 'fileUploaded') {
          this.loadFiles();
          this.snackBar.open(`تم رفع ملف جديد: ${notification.data.fileName}`, 'إغلاق', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
  }

  setupRoleChangeListening(): void {
    this.signalRService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        console.log('File table: Received notification:', notification);
        if (notification.type === 'roleChanged') {
          const currentUser = this.authService.getCurrentUser();
          console.log('File table: Role change notification data:', notification.data);
          console.log('File table: Current user:', currentUser);
          
          if (currentUser && notification.data.userCode === currentUser.code) {
            console.log('File table: Role change detected for current user - updating permissions');
            this.currentUser = this.authService.getCurrentUser();
            this.updateUserPermissions();
            console.log('File table: User permissions updated due to role change');
          }
        }
      });

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          console.log('File table: AuthService user changed:', user);
          this.currentUser = user;
          this.updateUserPermissions();
        }
      });
  }

  updateUserPermissions(): void {
    setTimeout(() => {
      this.userPermissions = {
        isAdmin: this.authService.isAdmin(),
        canUploadFiles: this.authService.canUploadFiles()
      };
      console.log('File table: Updated permissions:', this.userPermissions);
      this.cdr.detectChanges();
    }, 0);
  }

  // IMPROVED View Toggle - Stays on same component for both views
  toggleView(mode: ViewMode): void {
    // Prevent rapid clicking
    if (this.isToggling) {
      console.log('Toggle already in progress, ignoring...');
      return;
    }

    console.log('Toggle view requested:', mode);
    
    // Set toggling flag
    this.isToggling = true;
    
    // Update view mode
    this.viewMode = mode;
    this.updateDisplayColumns();
    
    // For table view, reinitialize data source
    if (mode === 'table') {
      this.initializeDataSource();
      
      // Force table refresh
      if (this.dataSource) {
        this.dataSource.data = [...this.filteredFiles];
      }
    }
    
    this.cdr.detectChanges(); // Force change detection
    
    // Reset toggle flag after animation completes
    setTimeout(() => {
      this.isToggling = false;
      console.log(`${mode} view activated, toggle flag reset`);
      console.log('Current view mode:', this.viewMode);
      console.log('Filtered files count:', this.filteredFiles.length);
    }, 300);
  }

  private updateDisplayColumns(): void {
    if (this.viewMode === 'table') {
      this.displayedColumns = ['fileName', 'fileSize', 'dateUploaded', 'uploadedBy', 'status', 'actions'];
    }
    // Grid view doesn't use columns
  }

  // Search and Filter Methods - PUBLIC
  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.files];

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(file => 
        file.fileName.toLowerCase().includes(searchLower) ||
        file.uploadedBy.toLowerCase().includes(searchLower) ||
        this.getFileType(file).toLowerCase().includes(searchLower)
      );
    }

    // Apply selected filters
    if (this.selectedFilters.length > 0) {
      filtered = filtered.filter(file => 
        this.selectedFilters.some(filter => 
          this.getFileType(file).toLowerCase() === filter.toLowerCase()
        )
      );
    }

    this.filteredFiles = filtered;
    if (this.dataSource) {
      this.dataSource.data = this.filteredFiles;
    }
  }

  removeFilter(filter: string): void {
    this.selectedFilters = this.selectedFilters.filter(f => f !== filter);
    this.applyFilters();
  }

  getFileType(file: FileWithProgress): 'pdf' | 'word' | 'excel' | 'image' | 'audio' | 'video' | 'text' | 'archive' | 'unknown' {
    const extension = file.fileName.split('.').pop()?.toLowerCase() || 'unknown';
    const typeMap: { [key: string]: 'pdf' | 'word' | 'excel' | 'image' | 'audio' | 'video' | 'text' | 'archive' | 'unknown' } = {
      'pdf': 'pdf',
      'doc': 'word',
      'docx': 'word',
      'xls': 'excel',
      'xlsx': 'excel',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'mp3': 'audio',
      'wav': 'audio',
      'mp4': 'video',
      'avi': 'video',
      'txt': 'text',
      'zip': 'archive',
      'rar': 'archive'
    };
    return typeMap[extension] || 'unknown';
  }

  // File Actions - PUBLIC
  viewFile(file: FileWithProgress): void {
    const dialogRef = this.dialog.open(FilePreviewDialogComponent, {
      width: '95%',
      height: '95%',
      maxWidth: '1400px',
      maxHeight: '90vh',
      data: { file },
      panelClass: 'full-width-dialog'
    });
  }

  downloadFile(file: FileWithProgress): void {
    if (file.isDownloading) return;

    file.isDownloading = true;
    file.downloadProgress = 0;

    const interval = setInterval(() => {
      file.downloadProgress! += Math.random() * 20;
      if (file.downloadProgress! >= 100) {
        file.downloadProgress = 100;
        file.isDownloading = false;
        clearInterval(interval);
        
        this.fileService.downloadFile(file).pipe(takeUntil(this.destroy$)).subscribe({
          next: (success) => {
            if (success) {
              this.snackBar.open(`تم تحميل الملف: ${file.fileName}`, 'إغلاق', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            } else {
              this.snackBar.open(`فشل في تحميل الملف: ${file.fileName}`, 'إغلاق', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
              });
            }
          },
          error: (error) => {
            console.error('Error downloading file:', error);
            this.snackBar.open(`خطأ في تحميل الملف: ${file.fileName}`, 'إغلاق', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    }, 200);
  }

  deleteFile(file: FileWithProgress): void {
    if (!this.isAdmin()) {
      this.snackBar.open('فقط المدير يمكنه حذف الملفات', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (confirm(`هل أنت متأكد من حذف الملف "${file.fileName}"؟`)) {
      this.fileService.deleteFile(file.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: (success) => {
          if (success) {
            console.log('File deleted successfully');
            this.snackBar.open(`تم حذف الملف: ${file.fileName}`, 'إغلاق', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.loadFiles();
          } else {
            console.error('Failed to delete file');
            this.snackBar.open(`فشل في حذف الملف: ${file.fileName}`, 'إغلاق', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          console.error('Error deleting file:', error);
          this.snackBar.open(`خطأ في حذف الملف: ${file.fileName}`, 'إغلاق', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  shareFile(file: FileWithProgress): void {
    // Implement share functionality
    this.snackBar.open('جاري تطوير ميزة المشاركة', 'إغلاق', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  copyLink(file: FileWithProgress): void {
    const link = `${window.location.origin}/files/${file.id}`;
    this.clipboard.copy(link);
    this.snackBar.open('تم نسخ رابط الملف', 'إغلاق', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  getFileInfo(file: FileWithProgress): void {
    const info = `
      اسم الملف: ${file.fileName}
      الحجم: ${this.getFileSize(file)}
      تاريخ الرفع: ${this.formatDate(file.dateUploaded)}
      رفع بواسطة: ${file.uploadedBy}
      النوع: ${this.getFileType(file)}
    `;
    
    alert(info);
  }

  // Utility Methods - PUBLIC
  isViewDisabled(file: FileWithProgress): boolean {
    const fileName = file.fileName.toLowerCase();
    return fileName.endsWith('.docx') || fileName.endsWith('.xlsx') || 
           fileName.endsWith('.doc') || fileName.endsWith('.xls');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // NEW METHOD: Short date format for grid view
  formatDateShort(date: string): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // NEW METHOD: Get file type icon
  getFileTypeIcon(file: FileWithProgress): string {
    const fileType = this.getFileType(file);
    const iconMap: { [key: string]: string } = {
      'pdf': 'picture_as_pdf',
      'word': 'description',
      'excel': 'table_chart',
      'image': 'image',
      'audio': 'audiotrack',
      'video': 'videocam',
      'text': 'text_snippet',
      'archive': 'archive',
      'unknown': 'insert_drive_file'
    };
    return iconMap[fileType] || 'insert_drive_file';
  }

  getFileSize(file: FileWithProgress): string {
    const hash = file.id.toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const sizes = ['2.5 كيلوبايت', '1.2 ميجابايت', '856 كيلوبايت', '3.1 ميجابايت', '512 كيلوبايت'];
    return sizes[Math.abs(hash) % sizes.length];
  }

  // Navigation Methods - PUBLIC
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.userPermissions.isAdmin;
  }

  canUploadFiles(): boolean {
    return this.userPermissions.canUploadFiles;
  }

  navigateToUpload(): void {
    this.router.navigate(['/admin/upload']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin/users']);
  }

  testSignalR(): void {
    console.log('=== Manual SignalR Test Started ===');
    this.signalRService.testConnection();
  }
}