import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { DepartmentService } from 'src/app/document-management/department.service';
import { AuthService } from 'src/assets/services/auth.service';
import { Order, Department, UserPermission, OrderPermission } from 'src/app/document-management/department.model';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderPermissionsComponent } from '../order-permissions/order-permissions.component';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule
  ],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  orderType: 'incoming' | 'outgoing' | 'all' = 'all';
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  dataSource!: MatTableDataSource<Order>;
  displayedColumns: string[] = ['referenceNumber', 'title', 'department', 'subject', 'status', 'priority', 'access', 'date', 'actions'];
  
  departments: Department[] = [];
  currentUser: any;
  
  // Filters
  searchTerm: string = '';
  selectedDepartment: string = '';
  selectedStatus: string = '';
  selectedPriority: string = '';

  statuses = ['pending', 'in-progress', 'completed', 'archived', 'cancelled'];
  priorities = ['low', 'medium', 'high', 'urgent'];

  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private departmentService: DepartmentService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    // Get order type from route
    this.route.data.subscribe(data => {
      this.orderType = data['type'] || 'all';
      this.loadOrders();
    });

    this.loadDepartments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe(departments => {
        this.departments = departments;
      });
  }

  loadOrders(): void {
    this.isLoading = true;

    let ordersObservable;
    if (this.orderType === 'all') {
      ordersObservable = this.departmentService.getAllOrders();
    } else {
      ordersObservable = this.departmentService.getOrdersByType(this.orderType);
    }

    ordersObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          // Ensure all orders have attachments array initialized
          this.orders = orders.map(order => ({
            ...order,
            attachments: order.attachments || []
          }));
          this.filteredOrders = [...this.orders];
          this.initializeDataSource();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.isLoading = false;
          // Initialize empty arrays to prevent template errors
          this.orders = [];
          this.filteredOrders = [];
          this.initializeDataSource();
        }
      });
  }

  initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.filteredOrders);
    
    setTimeout(() => {
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }, 100);
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    // Search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.referenceNumber.toLowerCase().includes(searchLower) ||
        order.title.toLowerCase().includes(searchLower) ||
        order.description.toLowerCase().includes(searchLower)
      );
    }

    // Department filter
    if (this.selectedDepartment) {
      filtered = filtered.filter(order => order.departmentId === this.selectedDepartment);
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }

    // Priority filter
    if (this.selectedPriority) {
      filtered = filtered.filter(order => order.priority === this.selectedPriority);
    }

    this.filteredOrders = filtered;
    if (this.dataSource) {
      this.dataSource.data = this.filteredOrders;
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.applyFilters();
  }

  viewOrder(order: Order): void {
    this.router.navigate([
      '/app/document-management/orders/details',
      order.id
    ]);
  }

  editOrder(order: Order): void {
    // Check permissions
    if (this.canEditOrder(order)) {
      this.router.navigate([
        '/app/document-management/orders/edit',
        order.id
      ]);
    }
  }

  deleteOrder(order: Order): void {
    // Check permissions
    if (this.canDeleteOrder(order)) {
      if (confirm(`هل أنت متأكد من حذف المعاملة "${order.title}"؟`)) {
        this.departmentService.deleteOrder(order.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe(success => {
            if (success) {
              this.loadOrders();
            }
          });
      }
    }
  }

  openManageAccess(order: Order): void {
    if (!this.canManageAccess(order)) {
      return;
    }

    this.dialog.open(OrderPermissionsComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: {
        orderId: order.id,
        orderTitle: order.title
      }
    });
  }

  viewOrderHistory(order: Order): void {
    this.router.navigate(
      ['/app/document-management/orders/details', order.id],
      { queryParams: { highlight: 'history' } }
    );
  }

  canEditOrder(order: Order): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }

    const userCode: string | undefined = this.currentUser?.code;
    if (!userCode) {
      return false;
    }

    const permission = order.userPermissions?.find(
      (p) => p.userCode === userCode
    ) || order.permissions?.find(
      (p) => p.userCode === userCode
    );

    return !!permission && (permission.canEdit || permission.canApprove);
  }

  canDeleteOrder(order: Order): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }

    const userCode: string | undefined = this.currentUser?.code;
    if (!userCode) {
      return false;
    }

    const permission = order.userPermissions?.find(
      (p) => p.userCode === userCode
    ) || order.permissions?.find(
      (p) => p.userCode === userCode
    );

    return !!permission && permission.canDelete;
  }

  canManageAccess(order: Order): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }

    const isOwner =
      !!this.currentUser?.userName &&
      order.createdBy?.toLowerCase() === this.currentUser.userName.toLowerCase();

    if (isOwner) {
      return true;
    }

    const permission = this.getCurrentUserPermission(order);
    return !!permission && (permission.canEdit || permission.canApprove || permission.canDelete);
  }

  private getCurrentUserPermission(order: Order): UserPermission | OrderPermission | undefined {
    if (!this.currentUser?.code) {
      return undefined;
    }

    // Try userPermissions first (UserPermission type), then permissions (OrderPermission type)
    const userPerm = order.userPermissions?.find(
      (p) => p.userCode === this.currentUser.code
    );
    if (userPerm) return userPerm;

    const orderPerm = order.permissions?.find(
      (p) => p.userCode === this.currentUser.code
    );
    return orderPerm;
  }

  getUserAccessSummary(order: Order): string[] {
    if (this.authService.isAdmin()) {
      return ['عرض', 'تعديل', 'حذف'];
    }

    const permission = this.getCurrentUserPermission(order);

    if (!permission) {
      return order.isPublic ? ['عرض عام'] : ['لا صلاحيات مباشرة'];
    }

    const chips: string[] = [];
    if (permission.canView) chips.push('عرض');
    if (permission.canEdit) chips.push('تعديل');
    if (permission.canApprove) chips.push('موافقة');
    if (permission.canDelete) chips.push('حذف');
    if (permission.canDownload) chips.push('تحميل');

    return chips.length ? chips : ['عرض'];
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'warn',
      'in-progress': 'accent',
      'completed': 'primary',
      'archived': ''
    };
    return colors[status] || '';
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'low': 'primary',
      'medium': 'accent',
      'high': 'warn',
      'urgent': 'warn'
    };
    return colors[priority] || '';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'قيد الانتظار',
      'in-progress': 'قيد التنفيذ',
      'completed': 'مكتملة',
      'archived': 'مؤرشفة'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'low': 'منخفضة',
      'medium': 'متوسطة',
      'high': 'عالية',
      'urgent': 'عاجلة'
    };
    return labels[priority] || priority;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/app/document-management/orders/create']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/app/document-management/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}