import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MaterialModule } from '../../../material.module';
import { DepartmentService } from '../../../services/department.service';
import { AuthService } from '../../../services/auth.service';
import { DashboardStats, Order } from '../../../models/department.model';
import { TranslateModule } from '@ngx-translate/core';
import { SharedHeaderComponent } from '../../../components/shared-header/shared-header.component';

@Component({
  selector: 'app-orders-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule, TranslateModule, SharedHeaderComponent],
  templateUrl: './orders-dashboard.component.html',
  styleUrls: ['./orders-dashboard.component.scss']
})
export class OrdersDashboardComponent implements OnInit, OnDestroy {
  dashboardStats: DashboardStats | null = null;
  isLoading = true;
  currentUser: any;
  readonly statusLabels: Record<Order['status'], string> = {
    'pending': 'قيد الانتظار',
    'in-progress': 'قيد التنفيذ',
    'completed': 'مكتملة',
    'archived': 'مؤرشفة'
  };

  // Chart data
  departmentChartData: any[] = [];
  monthlyChartData: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private departmentService: DepartmentService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.departmentService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.dashboardStats = stats;
          this.prepareDepartmentChartData(stats);
          this.prepareMonthlyChartData(stats);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.isLoading = false;
        }
      });
  }

  prepareDepartmentChartData(stats: DashboardStats): void {
    this.departmentChartData = stats.ordersByDepartment.map(item => ({
      name: item.department,
      value: item.count
    }));
  }

  prepareMonthlyChartData(stats: DashboardStats): void {
    this.monthlyChartData = stats.ordersByMonth.map(item => ({
      name: item.month,
      series: [
        { name: 'واردة', value: item.incoming },
        { name: 'صادرة', value: item.outgoing }
      ]
    }));
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

  viewOrder(order: Order): void {
    this.router.navigate(['/orders/details', order.id]);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  navigateToIncoming(): void {
    this.router.navigate(['/orders/incoming']);
  }

  navigateToOutgoing(): void {
    this.router.navigate(['/orders/outgoing']);
  }

  navigateToDepartments(): void {
    this.router.navigate(['/departments']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}