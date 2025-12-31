import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { VisitorManagementService } from '../services/visitor-management.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../assets/environments/environment';

interface Visit {
  id: number;
  visitNumber: string;
  visitorId: number;
  visitorName: string;
  carPlate?: string;
  carImageUrl?: string;
  departmentId: number;
  departmentName: string;
  employeeToVisit: string;
  visitReason?: string;
  expectedDurationHours?: number;
  status: string;
  checkInAt: string;
  checkOutAt?: string;
  createdByUserName: string;
  createdAt: string;
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedByUserId?: number;
}

interface Visitor {
  id: number;
  fullName: string;
  nationalId?: string;
  phone?: string;
  company?: string;
  personImageUrl?: string;
  idCardImageUrl?: string;
  isBlocked: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-visit-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './visit-details.component.html',
  styleUrls: ['./visit-details.component.scss']
})
export class VisitDetailsComponent implements OnInit, OnDestroy {
  visit: Visit | null = null;
  visitor: Visitor | null = null;
  visitNumber!: string;
  isLoading = true;
  private destroy$ = new Subject<void>();

  // Track failed image loads
  private failedImages = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private visitorService: VisitorManagementService
  ) {}

  ngOnInit(): void {
    const visitNumberParam = this.route.snapshot.paramMap.get('visitNumber');
    if (visitNumberParam) {
      this.visitNumber = visitNumberParam;
      this.loadVisitDetails();
    } else {
      this.showNotification('رقم الزيارة غير صحيح', 'error');
      this.router.navigate(['/app/visitor-management/visits/active']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVisitDetails(): void {
    this.isLoading = true;
    
    this.http.get<Visit>(`${environment.apiUrl}/Visits/number/${this.visitNumber}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (visit) => {
          this.visit = visit;
          this.loadVisitorDetails(visit.visitorId);
        },
        error: (error) => {
          console.error('Error loading visit:', error);
          this.showNotification('فشل تحميل تفاصيل الزيارة', 'error');
          this.isLoading = false;
          this.router.navigate(['/app/visitor-management/visits/active']);
        }
      });
  }

  loadVisitorDetails(visitorId: number): void {
    this.http.get<Visitor>(`${environment.apiUrl}/Visitors/${visitorId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (visitor) => {
          this.visitor = visitor;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading visitor:', error);
          this.isLoading = false;
        }
      });
  }

  // ==================== Actions ====================

  checkout(): void {
    if (!this.visit) return;

    if (confirm(`هل أنت متأكد من تسجيل خروج ${this.visit.visitorName}؟`)) {
      this.http.post(`${environment.apiUrl}/Visits/checkout/${this.visit.visitNumber}`, {})
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('تم تسجيل الخروج بنجاح', 'success');
            this.loadVisitDetails();
          },
          error: (error) => {
            console.error('Checkout error:', error);
            this.showNotification('فشل تسجيل الخروج', 'error');
          }
        });
    }
  }

  rejectVisit(): void {
    if (!this.visit) return;

    const dialogRef = this.dialog.open(RejectVisitDialogComponent, {
      width: '400px',
      direction: 'rtl'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post(`${environment.apiUrl}/Visits/${this.visit!.visitNumber}/reject`, {
          rejectionReason: result
        })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showNotification('تم رفض الزيارة بنجاح', 'success');
              this.loadVisitDetails();
            },
            error: (error) => {
              console.error('Reject error:', error);
              this.showNotification('فشل رفض الزيارة', 'error');
            }
          });
      }
    });
  }

  viewVisitorProfile(): void {
    if (this.visit) {
      this.router.navigate(['/app/visitor-management/visitors/profile', this.visit.visitorId]);
    }
  }

  blockVisitor(): void {
    if (!this.visit || !this.visitor) return;

    if (this.visitor.isBlocked) {
      // Unblock visitor
      if (confirm('هل أنت متأكد من إلغاء حظر هذا الزائر؟')) {
        this.performBlockAction(false, null);
      }
    } else {
      // Block visitor - show dialog to get reason
      const dialogRef = this.dialog.open(BlockVisitorDialogComponent, {
        width: '400px',
        direction: 'rtl'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.performBlockAction(true, result);
        }
      });
    }
  }

  private performBlockAction(isBlocked: boolean, blockReason: string | null): void {
    if (!this.visit || !this.visitor) return;

    this.visitorService.blockVisitor(this.visitor.id, isBlocked, blockReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showNotification(
            isBlocked ? 'تم حظر الزائر بنجاح' : 'تم إلغاء حظر الزائر بنجاح',
            'success'
          );
          // Reload visitor details
          this.loadVisitorDetails(this.visit!.visitorId);
        },
        error: (error) => {
          console.error('Error updating block status:', error);
          this.showNotification('فشل تحديث حالة الحظر', 'error');
        }
      });
  }

  viewCarImage(): void {
    if (this.visit?.carImageUrl) {
      window.open(this.visit.carImageUrl, '_blank');
    }
  }

  printVisit(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/app/visitor-management/visits/active']);
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

  getDuration(): string {
    if (!this.visit?.checkInAt) return '-';
    
    const checkIn = new Date(this.visit.checkInAt);
    const checkOut = this.visit.checkOutAt ? new Date(this.visit.checkOutAt) : new Date();
    
    const durationMs = checkOut.getTime() - checkIn.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}س ${minutes}د`;
    }
    return `${minutes}د`;
  }

  getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'checkedin': return 'جارية';
      case 'checkedout': return 'مكتملة';
      case 'rejected': return 'مرفوضة';
      case 'ongoing': return 'جارية'; // Legacy support
      case 'completed': return 'مكتملة'; // Legacy support
      default: return status || 'غير معروف';
    }
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'checkedin': return 'primary';
      case 'checkedout': return 'accent';
      case 'rejected': return 'warn';
      case 'ongoing': return 'primary'; // Legacy support
      case 'completed': return 'accent'; // Legacy support
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

  shouldShowImage(imageUrl?: string): boolean {
    if (!this.hasImage(imageUrl)) return false;
    return !this.failedImages.has(imageUrl || '');
  }

  onImageError(imageUrl?: string): void {
    if (imageUrl) {
      this.failedImages.add(imageUrl);
    }
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

// Reject Visit Dialog Component
@Component({
  selector: 'app-reject-visit-dialog',
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
    <h2 mat-dialog-title>رفض الزيارة</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>سبب الرفض</mat-label>
        <textarea matInput [(ngModel)]="rejectionReason" rows="4" 
                  placeholder="أدخل سبب رفض الزيارة"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">إلغاء</button>
      <button mat-raised-button color="warn" (click)="onConfirm()" 
              [disabled]="!rejectionReason || rejectionReason.trim() === ''">
        رفض الزيارة
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
  `]
})
export class RejectVisitDialogComponent {
  rejectionReason = '';

  constructor(public dialogRef: MatDialogRef<RejectVisitDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.rejectionReason);
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

  constructor(
    public dialogRef: MatDialogRef<BlockVisitorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.blockReason);
  }
}

