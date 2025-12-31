import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';
import { EmployeeManagementService, EmployeeAttendance, Employee } from '../services/employee-management.service';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './employee-attendance.component.html',
  styleUrls: ['./employee-attendance.component.scss']
})
export class EmployeeAttendanceComponent implements OnInit, OnDestroy {
  employee: Employee | null = null;
  attendances: EmployeeAttendance[] = [];
  displayedColumns: string[] = ['date', 'checkInTime', 'checkOutTime', 'duration'];
  isLoading = true;
  isExporting = false;
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  selectedFilter: 'today' | 'week' | 'month' | 'year' | 'custom' = 'month';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeManagementService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const employeeId = this.route.snapshot.paramMap.get('id');
    if (employeeId) {
      this.applyQuickFilter('month'); // Default to current month
      this.loadEmployeeData(+employeeId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployeeData(employeeId: number): void {
    this.isLoading = true;
    this.employeeService.getEmployee(employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (emp) => {
          this.employee = emp;
          this.loadAttendance(employeeId);
        },
        error: (error) => {
          console.error('Error loading employee:', error);
          this.showNotification('فشل تحميل بيانات الموظف', 'error');
          this.isLoading = false;
        }
      });
  }

  loadAttendance(employeeId: number): void {
    this.isLoading = true;
    this.employeeService.getEmployeeAttendance(
      employeeId,
      this.dateFrom || undefined,
      this.dateTo || undefined
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (attendances) => {
          this.attendances = attendances;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading attendance:', error);
          this.showNotification('فشل تحميل سجل الحضور', 'error');
          this.isLoading = false;
        }
      });
  }

  applyQuickFilter(filter: 'today' | 'week' | 'month' | 'year'): void {
    this.selectedFilter = filter;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'today':
        this.dateFrom = new Date(today);
        this.dateTo = new Date(today);
        this.dateTo.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
        this.dateFrom = new Date(today.setDate(diff));
        this.dateTo = new Date(this.dateFrom);
        this.dateTo.setDate(this.dateTo.getDate() + 6);
        this.dateTo.setHours(23, 59, 59, 999);
        break;
      case 'month':
        this.dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        this.dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'year':
        this.dateFrom = new Date(now.getFullYear(), 0, 1);
        this.dateTo = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
    }

    const employeeId = this.route.snapshot.paramMap.get('id');
    if (employeeId) {
      this.loadAttendance(+employeeId);
    }
  }

  onDateFilterChange(): void {
    if (this.dateFrom && this.dateTo) {
      this.selectedFilter = 'custom';
      const employeeId = this.route.snapshot.paramMap.get('id');
      if (employeeId) {
        this.loadAttendance(+employeeId);
      }
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDateDay(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('ar-SA', { day: 'numeric' });
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDuration(attendance: EmployeeAttendance): string {
    const checkIn = attendance._checkInTime || attendance.checkInTime || attendance.firstCheckInTime;
    const checkOut = attendance._checkOutTime || attendance.checkOutTime || attendance.lastCheckOutTime;
    
    if (!checkOut) return 'جاري...';
    
    if (!checkIn) return '-';
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}س ${minutes}د`;
    }
    return `${minutes}د`;
  }

  getCompletedCount(): number {
    return this.attendances.filter(a => {
      const checkOut = a._checkOutTime || a.checkOutTime || a.lastCheckOutTime;
      return checkOut != null;
    }).length;
  }

  getTotalHours(): string {
    let totalMinutes = 0;
    this.attendances.forEach(a => {
      const checkIn = a._checkInTime || a.checkInTime || a.firstCheckInTime;
      const checkOut = a._checkOutTime || a.checkOutTime || a.lastCheckOutTime;
      
      if (checkIn && checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const diffMs = checkOutDate.getTime() - checkInDate.getTime();
        totalMinutes += Math.floor(diffMs / (1000 * 60));
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}س ${minutes}د`;
    }
    return `${minutes}د`;
  }

  exportAttendance(): void {
    if (this.attendances.length === 0) {
      this.showNotification('لا توجد بيانات للتصدير', 'info');
      return;
    }

    this.isExporting = true;

    try {
      // Prepare CSV data
      const headers = ['التاريخ', 'وقت الدخول', 'وقت الخروج', 'المدة (ساعة:دقيقة)'];
      const rows = this.attendances.map(a => {
        const checkIn = a._checkInTime || a.checkInTime || a.firstCheckInTime || '';
        const checkOut = a._checkOutTime || a.checkOutTime || a.lastCheckOutTime || '';
        
        return [
          this.formatDate(checkIn),
          checkIn ? this.formatTime(checkIn) : '-',
          checkOut ? this.formatTime(checkOut) : '-',
          this.getDuration(a)
        ];
      });

      // Add employee info header
      const employeeInfo = [];
      if (this.employee) {
        employeeInfo.push(`اسم الموظف: ${this.employee.employeeName}`);
        employeeInfo.push(`رقم الموظف: ${this.employee.employeeId}`);
        if (this.employee.departmentName) {
          employeeInfo.push(`القسم: ${this.employee.departmentName}`);
        }
        employeeInfo.push(`فترة التقرير: ${this.dateFrom ? this.formatDate(this.dateFrom.toISOString()) : '-'} - ${this.dateTo ? this.formatDate(this.dateTo.toISOString()) : '-'}`);
        employeeInfo.push(`إجمالي السجلات: ${this.attendances.length}`);
        employeeInfo.push(''); // Empty line
      }

      // Combine all data
      const csvContent = [
        ...employeeInfo,
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const fileName = `حضور_${this.employee?.employeeName || 'موظف'}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.showNotification('تم تصدير البيانات بنجاح', 'success');
    } catch (error) {
      console.error('Error exporting attendance:', error);
      this.showNotification('فشل تصدير البيانات', 'error');
    } finally {
      this.isExporting = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/app/visitor-management/employees']);
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

