import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { SignalRService } from '../../core/services/signalr.service';
import { environment } from '../../../assets/environments/environment';

interface Visit {
  id: number;
  visitNumber: string;
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
}

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-visits-list-enhanced',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './visits-list-enhanced.component.html',
  styleUrls: ['./visits-list-enhanced.component.scss']
})
export class VisitsListEnhancedComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  visits: Visit[] = [];
  filteredVisits: Visit[] = [];
  dataSource!: MatTableDataSource<Visit>;
  displayedColumns: string[] = [
    'visitNumber',
    'visitorName',
    'carPlate',
    'department',
    'employeeToVisit',
    'checkInAt',
    'duration',
    'actions'
  ];

  departments: Department[] = [];
  
  // Filters
  searchTerm: string = '';
  selectedDepartment: number | null = null;
  selectedStatus: string = 'ongoing';
  dateFilter: 'today' | 'week' | 'month' | 'all' = 'today';

  // Stats
  totalVisits = 0;
  ongoingVisits = 0;
  completedToday = 0;
  avgDuration = 0;

  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private signalRService: SignalRService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    await this.initializeSignalR();
    this.loadDepartments();
    this.loadVisits();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== SignalR Setup ====================

  private async initializeSignalR(): Promise<void> {
    try {
      await this.signalRService.startConnection();
      
      // Listen for new visits
      this.signalRService.visitCreated$
        .pipe(takeUntil(this.destroy$))
        .subscribe(event => {
          this.showNotification(`زيارة جديدة: ${event.visit.visitorName}`, 'success');
          this.loadVisits();
        });

      // Listen for visit updates
      this.signalRService.visitUpdated$
        .pipe(takeUntil(this.destroy$))
        .subscribe(event => {
          if (event.action === 'checkout') {
            this.showNotification(`تم تسجيل خروج: ${event.visit.visitorName}`, 'info');
          }
          this.loadVisits();
        });

    } catch (error) {
      console.error('SignalR connection failed:', error);
      this.showNotification('فشل الاتصال بالخادم للتحديثات المباشرة', 'error');
    }
  }

  // ==================== Data Loading ====================

  loadDepartments(): void {
    this.http.get<Department[]>(`${environment.apiUrl}/VisitorDepartments`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (departments) => {
          this.departments = departments;
        },
        error: (error) => {
          console.error('Error loading departments:', error);
        }
      });
  }

  loadVisits(): void {
    this.isLoading = true;
    
    // Use /Visits/active endpoint - returns ALL visits (all statuses)
    // Status filtering is done on the frontend in applyFilters()
    const params: any = {};
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.http.get<Visit[]>(`${environment.apiUrl}/Visits/active`, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (visits) => {
          console.log('✅ Visits loaded:', visits.length, 'visits');
          this.visits = visits || [];
          this.applyFilters(); // Apply status and other filters on frontend
          this.calculateStats();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading visits:', error);
          this.showNotification('فشل تحميل الزيارات', 'error');
          this.visits = [];
          this.filteredVisits = [];
          this.initializeDataSource();
          this.isLoading = false;
        }
      });
  }

  // ==================== Filtering ====================

  applyFilters(): void {
    let filtered = [...this.visits];

    // Status filter (frontend filtering)
    // Map legacy status values to actual API status values
    if (this.selectedStatus && this.selectedStatus !== 'all') {
      const statusMap: { [key: string]: string } = {
        'ongoing': 'checkedin',    // Map 'ongoing' to 'checkedin'
        'completed': 'checkedout'  // Map 'completed' to 'checkedout'
      };
      const mappedStatus = statusMap[this.selectedStatus] || this.selectedStatus;
      filtered = filtered.filter(visit => visit.status === mappedStatus);
    }

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(visit =>
        visit.visitNumber.toLowerCase().includes(search) ||
        visit.visitorName.toLowerCase().includes(search) ||
        visit.departmentName.toLowerCase().includes(search) ||
        visit.employeeToVisit.toLowerCase().includes(search) ||
        (visit.carPlate && visit.carPlate.toLowerCase().includes(search))
      );
    }

    // Department filter
    if (this.selectedDepartment) {
      filtered = filtered.filter(visit => visit.departmentId === this.selectedDepartment);
    }

    // Date filter
    const now = new Date();
    switch (this.dateFilter) {
      case 'today':
        filtered = filtered.filter(visit => {
          const visitDate = new Date(visit.checkInAt);
          return visitDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(visit => new Date(visit.checkInAt) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(visit => new Date(visit.checkInAt) >= monthAgo);
        break;
    }

    this.filteredVisits = filtered;
    this.initializeDataSource();
  }

  initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.filteredVisits);
    
    setTimeout(() => {
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }, 100);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = null;
    this.dateFilter = 'today';
    this.applyFilters();
  }

  // ==================== Statistics ====================

  calculateStats(): void {
    this.totalVisits = this.visits.length;
    // Use actual API status values: 'checkedin' for ongoing, 'checkedout' for completed
    this.ongoingVisits = this.visits.filter(v => v.status === 'checkedin').length;
    
    const today = new Date().toDateString();
    const completedToday = this.visits.filter(v => 
      v.status === 'checkedout' && 
      v.checkOutAt && 
      new Date(v.checkOutAt).toDateString() === today
    );
    this.completedToday = completedToday.length;

    // Calculate average duration
    const durationsInMinutes = completedToday
      .filter(v => v.checkInAt && v.checkOutAt)
      .map(v => {
        const checkIn = new Date(v.checkInAt);
        const checkOut = new Date(v.checkOutAt!);
        return (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);
      });

    if (durationsInMinutes.length > 0) {
      const sum = durationsInMinutes.reduce((a, b) => a + b, 0);
      this.avgDuration = Math.round(sum / durationsInMinutes.length);
    } else {
      this.avgDuration = 0;
    }
  }

  // ==================== Actions ====================

  viewVisit(visit: Visit): void {
    // Navigate to visit details
    this.router.navigate(['/app/visitor-management/visits/details', visit.visitNumber]);
  }

  checkout(visit: Visit): void {
    if (confirm(`هل أنت متأكد من تسجيل خروج ${visit.visitorName}؟`)) {
      this.http.post(`${environment.apiUrl}/Visits/checkout/${visit.visitNumber}`, {})
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('تم تسجيل الخروج بنجاح', 'success');
            this.loadVisits();
          },
          error: (error) => {
            console.error('Checkout error:', error);
            this.showNotification('فشل تسجيل الخروج', 'error');
          }
        });
    }
  }

  navigateToCheckin(): void {
    this.router.navigate(['/app/visitor-management/visits/checkin']);
  }

  // ==================== Helpers ====================

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateStr: string): string {
    return `${this.formatDate(dateStr)} - ${this.formatTime(dateStr)}`;
  }

  getDuration(visit: Visit): string {
    if (!visit.checkInAt) return '-';
    
    const checkIn = new Date(visit.checkInAt);
    const checkOut = visit.checkOutAt ? new Date(visit.checkOutAt) : new Date();
    
    const durationMs = checkOut.getTime() - checkIn.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}س ${minutes}د`;
    }
    return `${minutes}د`;
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'checkedin': return 'primary';
      case 'checkedout': return 'accent';
      case 'rejected': return 'warn';
      // Legacy support
      case 'ongoing': return 'primary';
      case 'completed': return 'accent';
      case 'incomplete': return 'warn';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'checkedin': return 'جارية';
      case 'checkedout': return 'مكتملة';
      case 'rejected': return 'مرفوضة';
      // Legacy support
      case 'ongoing': return 'جارية';
      case 'completed': return 'مكتملة';
      case 'incomplete': return 'غير مكتملة';
      default: return status || 'غير معروف';
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

  exportToExcel(): void {
    // TODO: Implement Excel export
    this.showNotification('سيتم تصدير البيانات قريباً', 'info');
  }

  printReport(): void {
    window.print();
  }

  viewCarImage(visit: Visit): void {
    if (!visit.carImageUrl) {
      this.showNotification('لا توجد صورة للسيارة', 'info');
      return;
    }

    // Open car image in a new window for now (can be enhanced with dialog later)
    window.open(visit.carImageUrl, '_blank');
  }
}