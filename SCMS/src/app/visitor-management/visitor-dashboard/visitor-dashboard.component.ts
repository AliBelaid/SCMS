import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, interval } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SignalRService } from '../../core/services/signalr.service';
import { environment } from '../../../assets/environments/environment';

interface DashboardStats {
  totalVisits: number;
  totalCompleted: number;
  totalOngoing: number;
  visitsPerDepartment: { departmentId: number; departmentName: string; visitCount: number }[];
  visitsPerUser: { userId: number; userName: string; visitCount: number }[];
}

interface Visit {
  id: number;
  visitNumber: string;
  visitorName: string;
  carPlate?: string;
  departmentName: string;
  employeeToVisit: string;
  status: string;
  checkInAt: string;
  createdAt: string;
}

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-visitor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './visitor-dashboard.component.html',
  styleUrls: ['./visitor-dashboard.component.scss']
})
export class VisitorDashboardComponent implements OnInit, OnDestroy {
  // Stats
  stats: DashboardStats = {
    totalVisits: 0,
    totalCompleted: 0,
    totalOngoing: 0,
    visitsPerDepartment: [],
    visitsPerUser: []
  };

  // Recent visits
  recentVisits: Visit[] = [];
  ongoingVisits: Visit[] = [];

  // Departments
  departments: Department[] = [];

  // Time-based stats
  todayVisits = 0;
  weekVisits = 0;
  monthVisits = 0;

  // Charts data
  departmentChartData: { name: string; value: number }[] = [];
  userChartData: { name: string; value: number }[] = [];
  
  // Hourly distribution (for timeline)
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
      
      // Listen for new visits
      this.signalRService.visitCreated$
        .pipe(takeUntil(this.destroy$))
        .subscribe((event) => {
          this.handleVisitCreated(event);
        });

      // Listen for visit updates
      this.signalRService.visitUpdated$
        .pipe(takeUntil(this.destroy$))
        .subscribe((event) => {
          this.handleVisitUpdate(event);
        });

      // Listen for visitor blocked events
      this.signalRService.visitorBlocked$
        .pipe(takeUntil(this.destroy$))
        .subscribe((event) => {
          this.handleVisitorBlocked(event);
        });

    } catch (error) {
      console.error('SignalR connection failed:', error);
    }
  }

  // ==================== Real-time Event Handlers ====================

  private handleVisitUpdate(event: any): void {
    const updatedVisit = event.visit;
    if (!updatedVisit) {
      this.refreshDashboard();
      return;
    }

    // Update ongoing visits list
    const ongoingIndex = this.ongoingVisits.findIndex(v => v.visitNumber === updatedVisit.visitNumber);
    if (ongoingIndex !== -1) {
      // Visit was in ongoing list
      if (updatedVisit.status === 'checkedout' || updatedVisit.status === 'rejected') {
        // Remove from ongoing list
        this.ongoingVisits = this.ongoingVisits.filter(v => v.visitNumber !== updatedVisit.visitNumber);
      } else {
        // Update in place
        this.ongoingVisits[ongoingIndex] = updatedVisit;
      }
    } else if (updatedVisit.status === 'checkedin') {
      // Add to ongoing list if it's now checked in
      this.ongoingVisits = [updatedVisit, ...this.ongoingVisits];
    }

    // Update recent visits list
    const recentIndex = this.recentVisits.findIndex(v => v.visitNumber === updatedVisit.visitNumber);
    if (recentIndex !== -1) {
      this.recentVisits[recentIndex] = updatedVisit;
    } else {
      // Add to top of recent visits
      this.recentVisits = [updatedVisit, ...this.recentVisits].slice(0, 10);
    }

    // Refresh stats to get accurate counts
    this.loadStats();
  }

  private handleVisitCreated(event: any): void {
    const newVisit = event.visit;
    if (!newVisit) {
      this.refreshDashboard();
      return;
    }

    // Add to ongoing visits if it's checked in
    if (newVisit.status === 'checkedin') {
      this.ongoingVisits = [newVisit, ...this.ongoingVisits];
    }

    // Add to recent visits
    this.recentVisits = [newVisit, ...this.recentVisits].slice(0, 10);

    // Refresh stats
    this.loadStats();
  }

  private handleVisitorBlocked(event: any): void {
    // When a visitor is blocked, we need to:
    // 1. Refresh ongoing visits (blocked visitors' visits should be removed or marked)
    // 2. Refresh stats
    this.loadOngoingVisits();
    this.loadStats();
  }

  // ==================== Data Loading ====================

  loadDashboardData(): void {
    this.isLoading = true;

    // Load all data in parallel
    Promise.all([
      this.loadStats(),
      this.loadRecentVisits(),
      this.loadOngoingVisits(),
      this.loadDepartments(),
      this.loadTimeBasedStats()
    ]).then(() => {
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.isLoading = false;
    });
  }

  private async loadStats(): Promise<void> {
    try {
      this.stats = await this.http.get<DashboardStats>(
        `${environment.apiUrl}/Visits/stats`
      ).toPromise() || this.stats;

      // Prepare chart data
      this.departmentChartData = this.stats.visitsPerDepartment.map(d => ({
        name: d.departmentName,
        value: d.visitCount
      }));

      this.userChartData = this.stats.visitsPerUser.slice(0, 10).map(u => ({
        name: u.userName,
        value: u.visitCount
      }));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  private async loadRecentVisits(): Promise<void> {
    try {
      const visits = await this.http.get<Visit[]>(
        `${environment.apiUrl}/Visits/recent?count=10`
      ).toPromise() || [];
      
      this.recentVisits = visits;
    } catch (error) {
      console.error('Error loading recent visits:', error);
    }
  }

  private async loadOngoingVisits(): Promise<void> {
    try {
      // Get all visits, then filter for checkedin status on frontend
      const allVisits = await this.http.get<Visit[]>(
        `${environment.apiUrl}/Visits/active`
      ).toPromise() || [];
      
      // Filter for ongoing (checkedin) visits only
      this.ongoingVisits = allVisits.filter(v => v.status === 'checkedin');
    } catch (error) {
      console.error('Error loading ongoing visits:', error);
    }
  }

  private async loadDepartments(): Promise<void> {
    try {
      this.departments = await this.http.get<Department[]>(
        `${environment.apiUrl}/VisitorDepartments`
      ).toPromise() || [];
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  }

  private async loadTimeBasedStats(): Promise<void> {
    try {
      // Get visits for different time periods
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // TODO: Implement backend endpoints for time-based queries
      // For now, using total stats
      this.todayVisits = Math.floor(this.stats.totalVisits * 0.1);
      this.weekVisits = Math.floor(this.stats.totalVisits * 0.3);
      this.monthVisits = this.stats.totalVisits;

      // Generate hourly distribution
      this.generateHourlyDistribution();
    } catch (error) {
      console.error('Error loading time-based stats:', error);
    }
  }

  private generateHourlyDistribution(): void {
    // Generate sample hourly data (8 AM to 6 PM)
    this.hourlyDistribution = [];
    for (let hour = 8; hour <= 18; hour++) {
      this.hourlyDistribution.push({
        hour: `${hour}:00`,
        count: Math.floor(Math.random() * 15)
      });
    }
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
    // Update current time every second
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentTime = new Date();
      });
  }

  // ==================== Navigation ====================

  navigateToVisits(status?: string): void {
    if (status) {
      // Map legacy status values
      const statusMap: { [key: string]: string } = {
        'ongoing': 'checkedin',
        'completed': 'checkedout'
      };
      const mappedStatus = statusMap[status] || status;
      this.router.navigate(['/app/visitor-management/visits/active'], {
        queryParams: { status: mappedStatus }
      });
    } else {
      this.router.navigate(['/app/visitor-management/visits/active']);
    }
  }

  navigateToCheckin(): void {
    this.router.navigate(['/app/visitor-management/visits/checkin']);
  }

  navigateToReports(): void {
    this.router.navigate(['/app/visitor-management/reports']);
  }

  viewVisit(visit: Visit): void {
    this.router.navigate(['/app/visitor-management/visits/details', visit.visitNumber]);
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

  getTimeSince(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  }

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

  getDepartmentProgress(deptVisits: number): number {
    if (this.stats.totalVisits === 0) return 0;
    return (deptVisits / this.stats.totalVisits) * 100;
  }

  getMaxVisitsInHour(): number {
    if (this.hourlyDistribution.length === 0) return 1;
    return Math.max(...this.hourlyDistribution.map(h => h.count));
  }

  getHourBarWidth(count: number): number {
    const max = this.getMaxVisitsInHour();
    return (count / max) * 100;
  }
}
