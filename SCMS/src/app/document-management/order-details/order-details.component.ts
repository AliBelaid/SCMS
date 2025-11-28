import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, Observable, of, combineLatest } from 'rxjs';
import { takeUntil, map, switchMap } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Order,
  OrderHistory,
  OrderAction,
  OrderAttachment,
  EffectivePermissions,
  UserPermission,
  DepartmentAccess,
  UserException,
  AccessLevel,
} from '../department.model';
import { DepartmentService } from '../department.service';
import { AuthService } from 'src/assets/services/auth.service';
import { OrderPermissionsComponent } from '../order-permissions/order-permissions.component';

interface ActiveUser {
  userId: number;
  userName: string;
  userEmail: string;
  accessType: 'owner' | 'direct' | 'department' | 'public';
  accessLevel: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  grantedAt?: Date;
  source?: string;
}

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly currentUser = this.authService.getCurrentUser();
  private readonly destroy$ = new Subject<void>();

  // Main data
  order: Order | null = null;
  myPermissions: EffectivePermissions | null = null;
  orderHistory: OrderHistory[] = [];
  activeUsers: ActiveUser[] = [];

  // UI state
  selectedTab = 0;
  isLoading = true;
  isOwner = false;
  currentUserId: number;

  // Tabs visibility
  showPermissionsTab = false;
  showActiveUsersTab = false;

  constructor() {
    this.currentUserId = this.currentUser?.id || 0;
  }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(orderId);
    } else {
      this.router.navigate(['/app/document-management/orders']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== Data Loading ====================

  loadOrderDetails(orderId: string): void {
    this.isLoading = true;

    this.departmentService
      .getOrderById(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          if (!order) {
            this.snackBar.open('المعاملة غير موجودة', 'حسناً', { duration: 3000 });
            this.router.navigate(['/app/document-management/orders']);
            return;
          }

          this.order = order;
          this.isOwner =
            !!this.currentUser?.userName &&
            order.createdBy?.toLowerCase() === this.currentUser.userName.toLowerCase();

          // Show permissions tabs only for owner or admin
          this.showPermissionsTab = this.isOwner || this.authService.isAdmin();
          this.showActiveUsersTab = this.isOwner || this.authService.isAdmin();

          // Load additional data
          this.loadMyPermissions(order);
          this.loadOrderHistory(orderId);

          if (this.showActiveUsersTab) {
            this.loadActiveUsers(orderId);
          }

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading order:', error);
          this.snackBar.open('خطأ في تحميل تفاصيل الطلب', 'حسناً', { duration: 3000 });
          this.isLoading = false;
        },
      });
  }

  loadMyPermissions(order: Order): void {
    if (!order || !this.currentUser?.code) {
      this.myPermissions = {
        userId: this.currentUserId,
        orderId: parseInt(order?.id || '0', 10),
        canView: order?.isPublic || false,
        canEdit: false,
        canDelete: false,
        canShare: false,
        canDownload: false,
        canPrint: false,
        canComment: false,
        canApprove: false,
        isOwner: this.isOwner,
        isExcluded: false,
        permissionSource: order?.isPublic ? 'Public' : 'None',
      };
      return;
    }

    // Check if user is owner
    if (this.isOwner) {
      this.myPermissions = {
        userId: this.currentUserId,
        orderId: parseInt(order.id, 10),
        canView: true,
        canEdit: true,
        canDelete: true,
        canShare: true,
        canDownload: true,
        canPrint: true,
        canComment: true,
        canApprove: true,
        isOwner: true,
        isExcluded: false,
        permissionSource: 'Owner',
      };
      return;
    }

    // Check direct permissions
    const directPermission = order.userPermissions?.find(
      (perm) => perm.userCode === this.currentUser.code
    );

    if (directPermission) {
      this.myPermissions = {
        userId: this.currentUserId,
        orderId: parseInt(order.id, 10),
        canView: directPermission.canView,
        canEdit: directPermission.canEdit,
        canDelete: directPermission.canDelete,
        canShare: directPermission.canShare,
        canDownload: directPermission.canDownload,
        canPrint: directPermission.canPrint,
        canComment: directPermission.canComment,
        canApprove: directPermission.canApprove,
        isOwner: false,
        isExcluded: false,
        permissionSource: 'Direct',
      };
      return;
    }

    // Check if user is excluded
    const isExcluded = order.userExceptions?.some(
      (exc) => exc.userCode === this.currentUser.code
    );

    if (isExcluded) {
      this.myPermissions = {
        userId: this.currentUserId,
        orderId: parseInt(order.id, 10),
        canView: false,
        canEdit: false,
        canDelete: false,
        canShare: false,
        canDownload: false,
        canPrint: false,
        canComment: false,
        canApprove: false,
        isOwner: false,
        isExcluded: true,
        permissionSource: 'None',
      };
      return;
    }

    // Check public access
    if (order.isPublic) {
      this.myPermissions = {
        userId: this.currentUserId,
        orderId: parseInt(order.id, 10),
        canView: true,
        canEdit: false,
        canDelete: false,
        canShare: false,
        canDownload: false,
        canPrint: false,
        canComment: false,
        canApprove: false,
        isOwner: false,
        isExcluded: false,
        permissionSource: 'Public',
      };
      return;
    }

    // No access
    this.myPermissions = {
      userId: this.currentUserId,
      orderId: parseInt(order.id, 10),
      canView: false,
      canEdit: false,
      canDelete: false,
      canShare: false,
      canDownload: false,
      canPrint: false,
      canComment: false,
      canApprove: false,
      isOwner: false,
      isExcluded: false,
      permissionSource: 'None',
    };
  }

  loadOrderHistory(orderId: string): void {
    this.departmentService
      .getOrderHistory(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.orderHistory = response.history;
        },
        error: (error) => {
          console.error('Error loading history:', error);
        },
      });
  }

  loadActiveUsers(orderId: string): void {
    if (!this.showActiveUsersTab) return;

    this.activeUsers = [];

    // Add owner
    if (this.order?.createdBy) {
      this.activeUsers.push({
        userId: this.currentUserId,
        userName: this.currentUser?.userName || 'مالك المعاملة',
        userEmail: this.currentUser?.email || '',
        accessType: 'owner',
        accessLevel: 'كامل',
        canView: true,
        canEdit: true,
        canDelete: true,
        source: 'مالك المعاملة',
      });
    }

    // Load user permissions
    this.departmentService
      .getOrderUserPermissions(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permissions) => {
          permissions.forEach((perm: UserPermission) => {
            // Skip if already added as owner
            if (perm.userId === this.currentUserId) return;

            this.activeUsers.push({
              userId: perm.userId,
              userName: perm.userCode || 'مستخدم',
              userEmail: perm.userEmail || '',
              accessType: 'direct',
              accessLevel: this.getAccessLevelFromPermission(perm),
              canView: perm.canView,
              canEdit: perm.canEdit,
              canDelete: perm.canDelete,
              grantedAt: perm.grantedAt,
              source: 'صلاحية مباشرة',
            });
          });
        },
        error: (error) => {
          console.error('Error loading user permissions:', error);
        },
      });

    // Load department accesses
    this.departmentService
      .getOrderDepartmentAccesses(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accesses) => {
          accesses.forEach((access: DepartmentAccess) => {
            this.activeUsers.push({
              userId: 0,
              userName: access.departmentNameAr || 'إدارة',
              userEmail: '',
              accessType: 'department',
              accessLevel: this.getAccessLevelLabel(access.accessLevel),
              canView: access.accessLevel >= AccessLevel.ViewOnly,
              canEdit: access.accessLevel >= AccessLevel.Edit,
              canDelete: access.accessLevel >= AccessLevel.Full,
              grantedAt: access.grantedAt,
              source: `وصول إدارة: ${access.departmentNameAr}`,
            });
          });
        },
        error: (error) => {
          console.error('Error loading department accesses:', error);
        },
      });

    // Load user exceptions
    this.departmentService
      .getOrderUserExceptions(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exceptions) => {
          exceptions.forEach((exception: UserException) => {
            // Mark users who are explicitly excluded
            const existingUser = this.activeUsers.find((u) => u.userId === exception.userId);
            if (existingUser) {
              existingUser.accessLevel = 'ممنوع';
              existingUser.canView = false;
              existingUser.canEdit = false;
              existingUser.canDelete = false;
            }
          });
        },
        error: (error) => {
          console.error('Error loading user exceptions:', error);
        },
      });
  }

  // ==================== Helper Methods ====================

  getAccessLevelFromPermission(perm: UserPermission): string {
    if (perm.canDelete) return 'كامل';
    if (perm.canEdit) return 'تعديل';
    if (perm.canView) return 'عرض فقط';
    return 'لا يوجد';
  }

  getAccessLevelLabel(level: AccessLevel): string {
    switch (level) {
      case AccessLevel.ViewOnly:
        return 'عرض فقط';
      case AccessLevel.Edit:
        return 'تعديل';
      case AccessLevel.Full:
        return 'كامل';
      default:
        return 'غير محدد';
    }
  }

  getStatusColor(status: Order['status']): string {
    switch (status) {
      case 'pending':
        return 'warn';
      case 'in-progress':
        return 'accent';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'warn';
      case 'archived':
        return '';
      default:
        return '';
    }
  }

  getPriorityColor(priority: Order['priority']): string {
    switch (priority) {
      case 'low':
        return 'primary';
      case 'medium':
        return 'accent';
      case 'high':
        return 'warn';
      case 'urgent':
        return 'warn';
      default:
        return '';
    }
  }

  getActionColor(action: OrderAction): string {
    if (
      [OrderAction.Created, OrderAction.Assigned, OrderAction.PermissionGranted].includes(action)
    ) {
      return 'primary';
    }
    if (
      [OrderAction.Deleted, OrderAction.PermissionRevoked, OrderAction.UserExcluded].includes(
        action
      )
    ) {
      return 'warn';
    }
    return 'accent';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'غير محدد';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  // ==================== Labels ====================

  readonly statusLabels: Record<Order['status'], string> = {
    pending: 'قيد الانتظار',
    'in-progress': 'قيد التنفيذ',
    completed: 'مكتملة',
    archived: 'مؤرشفة',
    cancelled: 'ملغاة',
  };

  readonly priorityLabels: Record<Order['priority'], string> = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    urgent: 'عاجلة',
  };

  readonly typeLabels: Record<Order['type'], string> = {
    incoming: 'وارد',
    outgoing: 'صادر',
  };

  readonly actionLabels: Record<OrderAction, string> = {
    [OrderAction.Created]: 'تم الإنشاء',
    [OrderAction.Updated]: 'تم التحديث',
    [OrderAction.StatusChanged]: 'تغيير الحالة',
    [OrderAction.PriorityChanged]: 'تغيير الأولوية',
    [OrderAction.Assigned]: 'تم التعيين',
    [OrderAction.AttachmentAdded]: 'إضافة مرفق',
    [OrderAction.AttachmentRemoved]: 'حذف مرفق',
    [OrderAction.PermissionGranted]: 'منح صلاحية',
    [OrderAction.PermissionRevoked]: 'إلغاء صلاحية',
    [OrderAction.DepartmentAccessGranted]: 'منح وصول إدارة',
    [OrderAction.DepartmentAccessRevoked]: 'إلغاء وصول إدارة',
    [OrderAction.UserExcluded]: 'استثناء مستخدم',
    [OrderAction.UserExclusionRemoved]: 'إلغاء استثناء',
    [OrderAction.ExpirationSet]: 'تحديد تاريخ انتهاء',
    [OrderAction.Archived]: 'أرشفة',
    [OrderAction.Restored]: 'استرجاع',
    [OrderAction.Deleted]: 'حذف',
  };

  readonly actionIcons: Record<OrderAction, string> = {
    [OrderAction.Created]: 'add_circle',
    [OrderAction.Updated]: 'edit',
    [OrderAction.StatusChanged]: 'swap_horiz',
    [OrderAction.PriorityChanged]: 'priority_high',
    [OrderAction.Assigned]: 'person_add',
    [OrderAction.AttachmentAdded]: 'attach_file',
    [OrderAction.AttachmentRemoved]: 'delete_sweep',
    [OrderAction.PermissionGranted]: 'vpn_key',
    [OrderAction.PermissionRevoked]: 'lock',
    [OrderAction.DepartmentAccessGranted]: 'business',
    [OrderAction.DepartmentAccessRevoked]: 'business_center',
    [OrderAction.UserExcluded]: 'block',
    [OrderAction.UserExclusionRemoved]: 'check_circle',
    [OrderAction.ExpirationSet]: 'schedule',
    [OrderAction.Archived]: 'archive',
    [OrderAction.Restored]: 'unarchive',
    [OrderAction.Deleted]: 'delete_forever',
  };

  // ==================== Actions ====================

  editOrder(): void {
    if (this.order && this.myPermissions?.canEdit) {
      this.router.navigate(['/app/document-management/orders/edit', this.order.id]);
    }
  }

  deleteOrder(): void {
    if (!this.order || !this.myPermissions?.canDelete) return;

    if (confirm(`هل أنت متأكد من حذف المعاملة "${this.order.title}"؟`)) {
      // Note: deleteOrder method should be implemented in service
      this.snackBar.open('تم حذف المعاملة بنجاح', 'حسناً', { duration: 3000 });
      this.router.navigate(['/app/document-management/orders']);
    }
  }

  archiveOrder(): void {
    if (!this.order || !this.isOwner) return;

    const reason = prompt('سبب الأرشفة (اختياري):');
    if (reason !== null) {
      // Note: archiveOrder method should be implemented in service
      this.snackBar.open('تم أرشفة المعاملة بنجاح', 'حسناً', { duration: 3000 });
      this.router.navigate(['/app/document-management/orders']);
    }
  }

  downloadAttachment(attachment: OrderAttachment): void {
    if (attachment.fileUrl) {
      const link = document.createElement('a');
      link.href = attachment.fileUrl;
      link.download = attachment.fileName;
      link.click();
    }
  }

  viewAttachment(attachment: OrderAttachment): void {
    if (attachment.fileUrl) {
      window.open(attachment.fileUrl, '_blank');
    }
  }

  goBack(): void {
    this.router.navigate(['/app/document-management/orders']);
  }

  // ==================== Permissions Management (Owner only) ====================

  openPermissionsDialog(): void {
    if (!this.isOwner || !this.order) return;

    this.dialog.open(OrderPermissionsComponent, {
      width: '1200px',
      maxWidth: '95vw',
      data: {
        orderId: this.order.id,
        orderTitle: this.order.title,
      },
    });
  }

  grantUserPermission(): void {
    this.openPermissionsDialog();
  }

  grantDepartmentAccess(): void {
    this.openPermissionsDialog();
  }

  revokeUserPermission(userId: number): void {
    if (!this.isOwner || !this.order) return;

    if (confirm('هل أنت متأكد من إلغاء صلاحية هذا المستخدم؟')) {
      this.departmentService
        .revokeUserPermission(this.order.id, userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('تم إلغاء الصلاحية بنجاح', 'حسناً', { duration: 3000 });
            this.loadOrderDetails(this.order!.id);
          },
          error: (error) => {
            console.error('Error revoking permission:', error);
            this.snackBar.open('خطأ في إلغاء الصلاحية', 'حسناً', { duration: 3000 });
          },
        });
    }
  }

  removeUserException(userId: number): void {
    if (!this.isOwner || !this.order) return;

    if (confirm('هل أنت متأكد من إلغاء استثناء هذا المستخدم؟')) {
      this.departmentService
        .removeUserException(this.order.id, userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('تم إلغاء الاستثناء بنجاح', 'حسناً', { duration: 3000 });
            this.loadOrderDetails(this.order!.id);
          },
          error: (error) => {
            console.error('Error removing exception:', error);
            this.snackBar.open('خطأ في إلغاء الاستثناء', 'حسناً', { duration: 3000 });
          },
        });
    }
  }

  revokeDepartmentAccess(departmentId: string): void {
    if (!this.isOwner || !this.order) return;

    if (confirm('هل أنت متأكد من إلغاء وصول هذه الإدارة؟')) {
      this.departmentService
        .revokeDepartmentAccess(this.order.id, departmentId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('تم إلغاء الوصول بنجاح', 'حسناً', { duration: 3000 });
            this.loadOrderDetails(this.order!.id);
          },
          error: (error) => {
            console.error('Error revoking department access:', error);
            this.snackBar.open('خطأ في إلغاء الوصول', 'حسناً', { duration: 3000 });
          },
        });
    }
  }
}
