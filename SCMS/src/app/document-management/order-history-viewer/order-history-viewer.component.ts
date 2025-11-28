import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { DepartmentService } from '../department.service';
import { OrderHistory, OrderAction } from '../department.model';

@Component({
  selector: 'app-order-history-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './order-history-viewer.component.html',
  styleUrls: ['./order-history-viewer.component.scss'],
})
export class OrderHistoryViewerComponent implements OnInit {
  @Input() orderId!: string;
  private readonly route = inject(ActivatedRoute);

  history: OrderHistory[] = [];
  isLoading = false;
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;

  displayedColumns = ['icon', 'action', 'performedBy', 'performedAt', 'notes'];

  actionLabels: { [key in OrderAction]: string } = {
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

  actionIcons: { [key in OrderAction]: string } = {
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

  actionColors: { [key in OrderAction]: string } = {
    [OrderAction.Created]: 'primary',
    [OrderAction.Updated]: 'accent',
    [OrderAction.StatusChanged]: 'accent',
    [OrderAction.PriorityChanged]: 'warn',
    [OrderAction.Assigned]: 'primary',
    [OrderAction.AttachmentAdded]: 'primary',
    [OrderAction.AttachmentRemoved]: 'warn',
    [OrderAction.PermissionGranted]: 'primary',
    [OrderAction.PermissionRevoked]: 'warn',
    [OrderAction.DepartmentAccessGranted]: 'primary',
    [OrderAction.DepartmentAccessRevoked]: 'warn',
    [OrderAction.UserExcluded]: 'warn',
    [OrderAction.UserExclusionRemoved]: 'primary',
    [OrderAction.ExpirationSet]: 'accent',
    [OrderAction.Archived]: 'accent',
    [OrderAction.Restored]: 'primary',
    [OrderAction.Deleted]: 'warn',
  };

  constructor(private departmentService: DepartmentService) {}

  ngOnInit(): void {
    if (this.orderId) {
      this.loadHistory();
      return;
    }

    // Attempt to resolve orderId from route parameters or query parameters
    const routeParamId = this.route.snapshot.paramMap.get('orderId');
    const queryParamId = this.route.snapshot.queryParamMap.get('orderId');

    if (routeParamId) {
      this.orderId = routeParamId;
      this.loadHistory();
      return;
    }

    if (queryParamId) {
      this.orderId = queryParamId;
      this.loadHistory();
    }
  }

  loadHistory(): void {
    if (!this.orderId) {
      return;
    }

    this.isLoading = true;
    this.departmentService.getOrderHistory(this.orderId, this.pageNumber, this.pageSize).subscribe({
      next: (response) => {
        this.history = response.history;
        this.totalCount = response.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading history:', error);
        this.isLoading = false;
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadHistory();
  }

  getActionLabel(action: OrderAction): string {
    return this.actionLabels[action] || 'إجراء غير معروف';
  }

  getActionIcon(action: OrderAction): string {
    return this.actionIcons[action] || 'help';
  }

  getActionColor(action: OrderAction): string {
    return this.actionColors[action] || '';
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return this.formatDate(date);
  }

  refresh(): void {
    this.loadHistory();
  }
}

