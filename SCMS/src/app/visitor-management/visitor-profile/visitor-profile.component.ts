import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { VisitorManagementService } from '../services/visitor-management.service';
import { trigger, transition, style, animate, state } from '@angular/animations';

interface VisitorProfile {
  visitor: {
    id: number;
    fullName: string;
    nationalId?: string;
    phone?: string;
    company?: string;
    medicalNotes?: string;
    personImageUrl?: string;
    idCardImageUrl?: string;
    isBlocked: boolean;
    createdAt: string;
  };
  totalVisits: number;
  completedVisits: number;
  ongoingVisits: number;
  firstVisitDate?: string;
  lastVisitDate?: string;
  averageVisitDurationMinutes?: number;
  profileImageUrl?: string;
  imageGallery: VisitorImage[];
  visitHistory: VisitHistoryItem[];
  departmentStats: DepartmentStat[];
}

interface VisitorImage {
  imageUrl: string;
  imageType: number; // 1=Person, 2=IdCard, 3=Car
  visitNumber: string;
  visitDate: string;
  visitInfo: string;
  carPlate?: string;
}

interface VisitHistoryItem {
  id: number;
  visitNumber: string;
  departmentId: number;
  departmentName: string;
  employeeToVisit: string;
  visitReason?: string;
  status: string;
  checkInAt: string;
  checkOutAt?: string;
  durationMinutes?: number;
  carPlate?: string;
  carImageUrl?: string;
}

interface DepartmentStat {
  departmentId: number;
  departmentName: string;
  visitCount: number;
  percentage: number;
}

@Component({
  selector: 'app-visitor-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './visitor-profile.component.html',
  styleUrls: ['./visitor-profile.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class VisitorProfileComponent implements OnInit, OnDestroy {
  profile: VisitorProfile | null = null;
  visitorId!: number;
  isLoading = true;
  selectedTabIndex = 0;
  currentImageIndex = 0;

  displayedColumns: string[] = [
    'visitNumber',
    'departmentName',
    'employeeToVisit',
    'checkInAt',
    'checkOutAt',
    'duration',
    'status'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private visitorService: VisitorManagementService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.visitorId = +idParam;
      this.loadProfile();
    } else {
      this.showNotification('معرف الزائر غير صحيح', 'error');
      this.router.navigate(['/app/visitor-management/visitors']);
    }

    // Check for tab query parameter
    const tabParam = this.route.snapshot.queryParamMap.get('tab');
    if (tabParam === 'history') {
      this.selectedTabIndex = 1;
    } else if (tabParam === 'gallery') {
      this.selectedTabIndex = 2;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(): void {
    this.isLoading = true;
    
    this.visitorService.getVisitorProfileDetailed(this.visitorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading visitor profile:', error);
          this.showNotification('فشل تحميل الملف الشخصي', 'error');
          this.isLoading = false;
          this.router.navigate(['/app/visitor-management/visitors']);
        }
      });
  }

  // ==================== Image Gallery ====================

  nextImage(): void {
    if (this.profile && this.profile.imageGallery.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.profile.imageGallery.length;
    }
  }

  previousImage(): void {
    if (this.profile && this.profile.imageGallery.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.profile.imageGallery.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  goToImage(index: number): void {
    this.currentImageIndex = index;
  }

  getCurrentImage(): VisitorImage | null {
    if (!this.profile || this.profile.imageGallery.length === 0) return null;
    return this.profile.imageGallery[this.currentImageIndex];
  }

  getImageTypeLabel(imageType: number): string {
    switch (imageType) {
      case 1: return 'صورة شخصية';
      case 2: return 'بطاقة هوية';
      case 3: return 'صورة سيارة';
      default: return 'صورة';
    }
  }

  getImageTypeIcon(imageType: number): string {
    switch (imageType) {
      case 1: return 'person';
      case 2: return 'badge';
      case 3: return 'directions_car';
      default: return 'image';
    }
  }

  // ==================== Helpers ====================

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatDuration(minutes?: number): string {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}س ${mins}د`;
    }
    return `${mins}د`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ongoing': return 'جارية';
      case 'completed': return 'مكتملة';
      case 'incomplete': return 'غير مكتملة';
      case 'cancelled': return 'ملغاة';
      default: return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ongoing': return 'primary';
      case 'completed': return 'accent';
      case 'incomplete': return 'warn';
      default: return '';
    }
  }

  getImageUrl(imageUrl?: string): string | null {
    if (!imageUrl || imageUrl.trim() === '') return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return imageUrl;
  }

  hasImage(imageUrl?: string): boolean {
    return imageUrl != null && imageUrl.trim() !== '';
  }

  // Track failed image loads
  private failedImages = new Set<string>();

  shouldShowImage(imageUrl?: string): boolean {
    if (!this.hasImage(imageUrl)) return false;
    return !this.failedImages.has(imageUrl || '');
  }

  onImageError(imageUrl?: string): void {
    if (imageUrl) {
      this.failedImages.add(imageUrl);
    }
  }

  viewVisit(visitNumber: string): void {
    this.router.navigate(['/app/visitor-management/visits/details', visitNumber]);
  }

  goBack(): void {
    this.router.navigate(['/app/visitor-management/visitors']);
  }

  toggleBlockStatus(): void {
    if (!this.profile) return;

    const isBlocking = !this.profile.visitor.isBlocked;
    const action = isBlocking ? 'حظر' : 'إلغاء حظر';
    
    if (isBlocking) {
      // Show dialog to get block reason
      const dialogRef = this.dialog.open(BlockVisitorDialogComponent, {
        width: '400px',
        direction: 'rtl'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.performBlockAction(true, result);
        }
      });
    } else {
      // Confirm unblock
      if (confirm(`هل أنت متأكد من ${action} هذا الزائر؟`)) {
        this.performBlockAction(false, null);
      }
    }
  }

  private performBlockAction(isBlocked: boolean, blockReason: string | null): void {
    if (!this.profile) return;

    this.visitorService.blockVisitor(this.visitorId, isBlocked, blockReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showNotification(
            isBlocked ? 'تم حظر الزائر بنجاح' : 'تم إلغاء حظر الزائر بنجاح',
            'success'
          );
          this.loadProfile();
        },
        error: (error) => {
          console.error('Error updating block status:', error);
          this.showNotification('فشل تحديث حالة الحظر', 'error');
        }
      });
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'إغلاق', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }
}

// Block Visitor Dialog Component
@Component({
  selector: 'app-block-visitor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>حظر الزائر</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>سبب الحظر</mat-label>
        <textarea matInput [(ngModel)]="blockReason" rows="4" 
                  placeholder="أدخل سبب حظر الزائر"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">إلغاء</button>
      <button mat-raised-button color="warn" (click)="onConfirm()" 
              [disabled]="!blockReason || blockReason.trim() === ''">
        حظر الزائر
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
  `]
})
export class BlockVisitorDialogComponent {
  blockReason = '';

  constructor(public dialogRef: MatDialogRef<BlockVisitorDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.blockReason);
  }
}

