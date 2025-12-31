import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, interval, firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeManagementService, EmployeeAttendance, Employee } from '../services/employee-management.service';
import { environment } from '../../../assets/environments/environment';
import { SignalRService, EmployeeAttendanceUpdatedEvent } from '../../core/services/signalr.service';

interface AttendanceStats {
  totalToday: number;
  totalMonth: number;
  checkedInNow: number;
  checkedOutToday: number;
  attendancePerDepartment: { departmentId: number; departmentName: string; count: number }[];
  attendancePerEmployee: { employeeId: number; employeeName: string; count: number }[];
}

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-employee-attendance-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './employee-attendance-dashboard.component.html',
  styleUrls: ['./employee-attendance-dashboard.component.scss']
})
export class EmployeeAttendanceDashboardComponent implements OnInit, OnDestroy {
  // Stats
  stats: AttendanceStats = {
    totalToday: 0,
    totalMonth: 0,
    checkedInNow: 0,
    checkedOutToday: 0,
    attendancePerDepartment: [],
    attendancePerEmployee: []
  };

  // Recent attendance (last 10)
  recentAttendance: EmployeeAttendance[] = [];
  checkedInNow: EmployeeAttendance[] = [];

  // Departments
  departments: Department[] = [];
  selectedDepartment: number | null = null;
  searchTerm: string = '';

  // Filter
  dateFilter: 'today' | 'month' = 'today';

  // Hourly distribution
  hourlyDistribution: { hour: string; count: number }[] = [];

  // Loading states
  isLoading = true;
  isRefreshing = false;

  // Current time
  currentTime = new Date();

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private employeeService: EmployeeManagementService,
    private snackBar: MatSnackBar,
    private signalRService: SignalRService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.initializeSignalR();
    this.loadDashboardData();
    this.startTimeUpdater();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== SignalR Setup ====================

  private async initializeSignalR(): Promise<void> {
    try {
      await this.signalRService.startConnection();
      
      // Listen for employee attendance updates
      this.signalRService.employeeAttendanceUpdated$
        .pipe(takeUntil(this.destroy$))
        .subscribe(event => {
          console.log('Employee attendance updated:', event);
          this.handleAttendanceUpdate(event);
        });
    } catch (error) {
      console.error('Error initializing SignalR:', error);
    }
  }

  private handleAttendanceUpdate(event: EmployeeAttendanceUpdatedEvent): void {
    // Refresh dashboard data to reflect the update
    this.loadDashboardData();
    
    // Show notification
    const actionText = event.action === 'CheckedIn' ? 'تم تسجيل الدخول' : 'تم تسجيل الخروج';
    this.showNotification(`${actionText}: ${event.employeeName}`, 'success');
  }

  // ==================== Data Loading ====================

  loadDashboardData(): void {
    this.isLoading = true;

    Promise.all([
      this.loadStats(),
      this.loadRecentAttendance(),
      this.loadCheckedInNow(),
      this.loadDepartments(),
      this.loadHourlyDistribution()
    ]).then(() => {
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.isLoading = false;
    });
  }

  private async loadStats(): Promise<void> {
    try {
      // Load today's attendance (grouped format)
      const todayAttendance = await firstValueFrom(this.employeeService.getTodayAttendance()) || [];
      this.stats.totalToday = todayAttendance.length;
      // Use isCheckedIn flag from grouped DTO, or check checkOutTime
      this.stats.checkedInNow = todayAttendance.filter(a => a.isCheckedIn !== false && !a._checkOutTime).length;
      this.stats.checkedOutToday = todayAttendance.filter(a => a.isCheckedIn === false || a._checkOutTime).length;

      // Load monthly stats (last 30 days)
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      // Get all employees and calculate monthly attendance
      const employees = await firstValueFrom(this.employeeService.getEmployees()) || [];
      let monthlyCount = 0;
      
      for (const employee of employees) {
        const attendance = await firstValueFrom(this.employeeService.getEmployeeAttendance(
          employee.id,
          monthStart,
          monthEnd
        )) || [];
        monthlyCount += attendance.length;
      }
      
      this.stats.totalMonth = monthlyCount;

      // Calculate stats by department
      const deptMap = new Map<number, { name: string; count: number }>();
      for (const attendance of todayAttendance) {
        // Get employee info to find department
        const employee = employees.find(e => e.id === attendance.employeeId);
        if (employee && employee.departmentId) {
          const deptId = employee.departmentId;
          const dept = deptMap.get(deptId) || { name: employee.departmentName || 'غير محدد', count: 0 };
          dept.count++;
          deptMap.set(deptId, dept);
        }
      }

      this.stats.attendancePerDepartment = Array.from(deptMap.entries()).map(([id, data]) => ({
        departmentId: id,
        departmentName: data.name,
        count: data.count
      }));

    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  private async loadRecentAttendance(): Promise<void> {
    try {
      const attendance = await firstValueFrom(this.employeeService.getTodayAttendance()) || [];
      // Sort by check-in time (most recent first) and take last 10
      this.recentAttendance = attendance
        .sort((a, b) => {
          const timeA = a._checkInTime || a.checkInTime || a.firstCheckInTime || '';
          const timeB = b._checkInTime || b.checkInTime || b.firstCheckInTime || '';
          return new Date(timeB).getTime() - new Date(timeA).getTime();
        })
        .slice(0, 10);
    } catch (error) {
      console.error('Error loading recent attendance:', error);
    }
  }

  private async loadCheckedInNow(): Promise<void> {
    try {
      const attendance = await firstValueFrom(this.employeeService.getTodayAttendance()) || [];
      this.checkedInNow = attendance.filter(a => !a.checkOutTime);
    } catch (error) {
      console.error('Error loading checked-in employees:', error);
    }
  }

  private async loadDepartments(): Promise<void> {
    try {
      this.departments = await firstValueFrom(this.http.get<Department[]>(
        `${environment.apiUrl}/VisitorDepartments`
      )) || [];
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  }

  private async loadHourlyDistribution(): Promise<void> {
    try {
      const todayAttendance = await firstValueFrom(this.employeeService.getTodayAttendance()) || [];
      
      // Group by hour (8 AM to 6 PM)
      const hourMap = new Map<number, number>();
      for (let hour = 8; hour <= 18; hour++) {
        hourMap.set(hour, 0);
      }

      todayAttendance.forEach(attendance => {
        const checkInTime = attendance._checkInTime || attendance.checkInTime || attendance.firstCheckInTime;
        if (checkInTime) {
          const checkInHour = new Date(checkInTime).getHours();
          if (hourMap.has(checkInHour)) {
            hourMap.set(checkInHour, (hourMap.get(checkInHour) || 0) + 1);
          }
        }
      });

      this.hourlyDistribution = Array.from(hourMap.entries())
        .map(([hour, count]) => ({
          hour: `${hour}:00`,
          count
        }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    } catch (error) {
      console.error('Error loading hourly distribution:', error);
    }
  }

  // ==================== Filters ====================

  onDepartmentChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onDateFilterChange(): void {
    this.loadDashboardData();
  }

  applyFilters(): void {
    // Filter recent attendance based on department and search term
    this.loadRecentAttendance().then(() => {
      let filtered = [...this.recentAttendance];

      if (this.selectedDepartment) {
        // Filter by department (would need to get employee info)
      }

      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        filtered = filtered.filter(a =>
          a.employeeName?.toLowerCase().includes(search) ||
          a.employeeEmployeeId?.toLowerCase().includes(search)
        );
      }

      this.recentAttendance = filtered;
    });
  }

  clearFilters(): void {
    this.selectedDepartment = null;
    this.searchTerm = '';
    this.loadDashboardData();
  }

  // ==================== Refresh ====================

  refreshDashboard(): void {
    this.isRefreshing = true;
    this.loadDashboardData();
    setTimeout(() => {
      this.isRefreshing = false;
    }, 1000);
  }

  private startAutoRefresh(): void {
    // Auto refresh every 5 minutes
    interval(5 * 60 * 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshDashboard();
      });
  }

  private startTimeUpdater(): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentTime = new Date();
      });
  }

  // ==================== Export ====================

  exportReport(): void {
    try {
      const data = this.getExportData();
      const csv = this.convertToCSV(data);
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `employee-attendance-${this.dateFilter}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showNotification('تم تصدير التقرير بنجاح', 'success');
    } catch (error) {
      console.error('Error exporting report:', error);
      this.showNotification('فشل تصدير التقرير', 'error');
    }
  }

  private getExportData(): any[] {
    return this.recentAttendance.map(attendance => ({
      'رقم الموظف': attendance.employeeEmployeeId || '',
      'اسم الموظف': attendance.employeeName || '',
      'وقت الدخول': this.formatDateTime(attendance.checkInTime),
      'وقت الخروج': attendance.checkOutTime ? this.formatDateTime(attendance.checkOutTime) : 'لم يخرج بعد',
      'المدة': this.getDuration(attendance),
      'الإدارة': attendance.departmentName || ''
    }));
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row =>
      headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  }

  // ==================== Helpers ====================

  getCurrentTimeFormatted(): string {
    return this.currentTime.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getCurrentDateFormatted(): string {
    return this.currentTime.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTimeSince(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `منذ ${diffMins} دقيقة`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  }

  getDuration(attendance: EmployeeAttendance): string {
    const checkOut = attendance._checkOutTime || attendance.checkOutTime || attendance.lastCheckOutTime;
    if (!checkOut) return 'لم يخرج بعد';
    const checkIn = attendance._checkInTime || attendance.checkInTime || attendance.firstCheckInTime;
    if (!checkIn) return '-';
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}س ${minutes}د`;
  }

  getDepartmentProgress(count: number): number {
    const max = Math.max(...this.stats.attendancePerDepartment.map(d => d.count), 1);
    return (count / max) * 100;
  }

  getHourBarWidth(count: number): number {
    const max = Math.max(...this.hourlyDistribution.map(h => h.count), 1);
    return (count / max) * 100;
  }

  // ==================== Navigation ====================

  navigateToEmployees(): void {
    this.router.navigate(['/app/visitor-management/employees']);
  }

  navigateToAttendance(): void {
    this.router.navigate(['/app/visitor-management/employee-attendance']);
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

