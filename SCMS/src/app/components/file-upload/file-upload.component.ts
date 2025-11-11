import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { FileService } from '../../services/file.service';
import { AuthService } from '../../services/auth.service';
import { SignalRService } from '../../services/signalr.service';
import { UserService } from '../../services/user.service';
import { FileEntry } from '../../models/file-entry';
import { AppUser } from '../../models/app-user';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { SharedHeaderComponent } from '../shared-header/shared-header.component';

interface UploadFile {
  file: File;
  fileName: string;
  fileType: 'pdf' | 'word' | 'excel' | 'image' | 'audio' | 'video' | 'text' | 'archive' | 'unknown';
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, TranslateModule, SharedHeaderComponent],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('dropZone') dropZone!: ElementRef;

  uploadForm: FormGroup;
  users: AppUser[] = [];
  currentUser: any;
  uploadFiles: UploadFile[] = [];
  isDragOver = false;
  isUploading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private fileService: FileService,
    private userService: UserService,
    private signalRService: SignalRService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.uploadForm = this.fb.group({
      excludedUsers: [[]] // Only excluded users, no required validation
    });
  }

  ngOnInit(): void {
    // Check if user has upload permissions
    if (!this.authService.canUploadFiles()) {
      this.snackBar.open('ليس لديك صلاحية لرفع الملفات!', 'إغلاق', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/files']);
      return;
    }
    
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.userService.getAllUsers().pipe(takeUntil(this.destroy$)).subscribe(users => {
      this.users = users.filter(user => user.role !== 'Admin');
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    this.addFiles(Array.from(files));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.addFiles(Array.from(files));
    }
  }

  addFiles(files: File[]): void {
    files.forEach(file => {
      // Check file size (300MB limit)
      const maxSize = 300 * 1024 * 1024; // 300MB in bytes
      if (file.size > maxSize) {
        this.snackBar.open(`الملف "${file.name}" كبير جداً. الحد الأقصى للحجم هو 300 ميجابايت.`, 'إغلاق', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      const fileType = this.getFileType(file.name);
      const uploadFile: UploadFile = {
        file,
        fileName: file.name,
        fileType,
        progress: 0,
        status: 'pending'
      };
      this.uploadFiles.push(uploadFile);
    });
  }

  getFileType(fileName: string): 'pdf' | 'word' | 'excel' | 'image' | 'audio' | 'video' | 'text' | 'archive' | 'unknown' {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'txt':
        return 'text';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
      case 'svg':
        return 'image';
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'aac':
      case 'flac':
        return 'audio';
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
      case 'webm':
      case 'mkv':
        return 'video';
      case 'zip':
      case 'rar':
      case '7z':
        return 'archive';
      default:
        return 'unknown';
    }
  }

  removeFile(index: number): void {
    this.uploadFiles.splice(index, 1);
  }

  clearAllFiles(): void {
    this.uploadFiles = [];
  }

  onUpload(): void {
    if (this.uploadFiles.length > 0) {
      this.isUploading = true;
      const formData = this.uploadForm.value;
      
      // Upload each file
      this.uploadFiles.forEach((uploadFile, index) => {
        if (uploadFile.status === 'pending') {
          this.simulateUpload(uploadFile, formData, index);
        }
      });
    } else {
      this.snackBar.open('يرجى اختيار ملف واحد على الأقل للرفع', 'إغلاق', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  simulateUpload(uploadFile: UploadFile, formData: any, index: number): void {
    uploadFile.status = 'uploading';
    
    console.log('FileUploadComponent: Starting upload for file:', uploadFile.fileName);
    console.log('FileUploadComponent: File object:', uploadFile.file);
    console.log('FileUploadComponent: File size:', uploadFile.file.size);
    console.log('FileUploadComponent: File type:', uploadFile.file.type);
    
    // Create file entry for upload
    const fileEntry = {
      fileName: uploadFile.fileName,
      fileType: uploadFile.fileType,
      uploadedBy: this.currentUser?.code || 'Unknown',
      excludedUsers: formData.excludedUsers || []
    };

    console.log('FileUploadComponent: File entry created:', fileEntry);

    // Simulate upload progress
    const interval = setInterval(() => {
      uploadFile.progress += Math.random() * 20;
      if (uploadFile.progress >= 100) {
        uploadFile.progress = 100;
        uploadFile.status = 'completed';
        clearInterval(interval);
        
        console.log('FileUploadComponent: Calling fileService.addFile with:', fileEntry, uploadFile.file);
        
        // Actually upload the file
        this.fileService.addFile(fileEntry, uploadFile.file).pipe(takeUntil(this.destroy$)).subscribe({
          next: (success) => {
            console.log('FileUploadComponent: Upload result:', success);
            if (success) {
              this.snackBar.open(`تم رفع الملف: ${uploadFile.fileName}`, 'إغلاق', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
              
              // Check if all uploads are complete
              const allCompleted = this.uploadFiles.every(file => file.status === 'completed');
              if (allCompleted) {
                this.isUploading = false;
                this.uploadFiles = []; // Clear the list after successful upload
                this.uploadForm.reset();
                this.snackBar.open('تم رفع جميع الملفات بنجاح!', 'إغلاق', {
                  duration: 5000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top'
                });
              }
            } else {
              uploadFile.status = 'error';
              uploadFile.error = 'Upload failed';
              this.snackBar.open(`فشل في رفع الملف: ${uploadFile.fileName}`, 'إغلاق', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
              });
            }
          },
          error: (error) => {
            console.error('FileUploadComponent: Upload error:', error);
            uploadFile.status = 'error';
            uploadFile.error = 'Upload failed';
            this.snackBar.open(`خطأ في رفع الملف: ${uploadFile.fileName}`, 'إغلاق', {
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

  openFileBrowser(): void {
    this.fileInput.nativeElement.click();
  }

  testAuthentication(): void {
    console.log('FileUploadComponent: Testing authentication...');
    console.log('FileUploadComponent: Current user:', this.currentUser);
    console.log('FileUploadComponent: Auth token:', this.authService.getAuthToken());
    
    this.fileService.testAuthentication().pipe(takeUntil(this.destroy$)).subscribe(
      result => {
        if (result) {
          this.snackBar.open('تم اختبار المصادقة بنجاح!', 'إغلاق', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        } else {
          this.snackBar.open('فشل اختبار المصادقة!', 'إغلاق', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      },
      error => {
        console.error('FileUploadComponent: Authentication test error:', error);
        this.snackBar.open('خطأ في اختبار المصادقة!', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    );
  }

  debugDocuments(): void {
    console.log('FileUploadComponent: Debugging documents...');
    
    this.fileService.debugDocuments().pipe(takeUntil(this.destroy$)).subscribe(
      result => {
        if (result) {
          console.log('FileUploadComponent: Debug documents result:', result);
          this.snackBar.open(`تصحيح: ${result.totalDocuments} إجمالي، ${result.userDocuments} متاح`, 'إغلاق', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        } else {
          this.snackBar.open('فشل تصحيح المستندات!', 'إغلاق', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      },
      error => {
        console.error('FileUploadComponent: Debug documents error:', error);
        this.snackBar.open('خطأ في تصحيح المستندات!', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    );
  }

  createTestDocument(): void {
    console.log('FileUploadComponent: Creating test document...');
    
    this.fileService.createTestDocument().pipe(takeUntil(this.destroy$)).subscribe(
      result => {
        if (result) {
          console.log('FileUploadComponent: Create test document result:', result);
          this.snackBar.open('تم إنشاء المستند التجريبي بنجاح!', 'إغلاق', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        } else {
          this.snackBar.open('فشل في إنشاء المستند التجريبي!', 'إغلاق', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      },
      error => {
        console.error('FileUploadComponent: Create test document error:', error);
        this.snackBar.open('خطأ في إنشاء المستند التجريبي!', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToFiles(): void {
    this.router.navigate(['/files']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin/users']);
  }
} 