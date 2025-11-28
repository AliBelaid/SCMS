import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DepartmentService } from 'src/app/document-management/department.service';
import { AuthService } from 'src/assets/services/auth.service';
import { DashboardStats, Order } from 'src/app/document-management/department.model';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-orders-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
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
    'archived': 'مؤرشفة',
    'cancelled': 'ملغاة'
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
    this.router.navigate([
      '/app/document-management/orders/details',
      order.id
    ]);
  }

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  navigateToIncoming(): void {
    this.router.navigate(['/app/document-management/orders/incoming']);
  }

  navigateToOutgoing(): void {
    this.router.navigate(['/app/document-management/orders/outgoing']);
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