import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { MaterialModule } from '../../../material.module';
import { DepartmentService } from '../../../services/department.service';
import { AuthService } from '../../../services/auth.service';
import { Order, Department } from '../../../models/department.model';
import { TranslateModule } from '@ngx-translate/core';
import { SharedHeaderComponent } from '../../../components/shared-header/shared-header.component';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, TranslateModule, SharedHeaderComponent],
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
  displayedColumns: string[] = ['referenceNumber', 'title', 'department', 'subject', 'status', 'priority', 'date', 'actions'];
  
  departments: Department[] = [];
  currentUser: any;
  
  // Filters
  searchTerm: string = '';
  selectedDepartment: string = '';
  selectedStatus: string = '';
  selectedPriority: string = '';

  statuses = ['pending', 'in-progress', 'completed', 'archived'];
  priorities = ['low', 'medium', 'high', 'urgent'];

  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private departmentService: DepartmentService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
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
      .subscribe(orders => {
        this.orders = orders;
        this.filteredOrders = [...orders];
        this.initializeDataSource();
        this.isLoading = false;
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
    this.router.navigate(['/orders/details', order.id]);
  }

  editOrder(order: Order): void {
    // Check permissions
    if (this.canEditOrder(order)) {
      this.router.navigate(['/orders/edit', order.id]);
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

  canEditOrder(order: Order): boolean {
    return order.permissions.canEdit.includes(this.currentUser?.code) || this.authService.isAdmin();
  }

  canDeleteOrder(order: Order): boolean {
    return order.permissions.canDelete.includes(this.currentUser?.code) || this.authService.isAdmin();
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
    this.router.navigate(['/orders/create']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}