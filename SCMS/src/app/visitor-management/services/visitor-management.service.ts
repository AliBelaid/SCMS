import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, debounceTime, shareReplay } from 'rxjs/operators';
import { environment } from '../../../assets/environments/environment';
import {
  Visitor,
  Visit,
  VisitorDepartment,
  CreateVisitorDto,
  CreateVisitDto,
  UpdateVisitDto,
  DashboardStats,
  VisitFilters,
  PaginationParams,
  PaginatedResult,
  VisitorProfile,
  VisitReport,
  ReportType,
  TimePeriod,
  VisitStatus,
  HourlyDistribution,
  CacheEntry,
  ApiResponse,
  ExportOptions,
  VisitorSearchResult,
  VisitSearchResult,
  VisitorDtoWithBase64
} from '../models/visitor-management.model';

@Injectable({
  providedIn: 'root'
})
export class VisitorManagementService {
  private apiUrl = environment.apiUrl;
  
  // BehaviorSubjects for state management
  private visitsSubject = new BehaviorSubject<Visit[]>([]);
  private departmentsSubject = new BehaviorSubject<VisitorDepartment[]>([]);
  private statsSubject = new BehaviorSubject<DashboardStats | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  visits$ = this.visitsSubject.asObservable();
  departments$ = this.departmentsSubject.asObservable();
  stats$ = this.statsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  // Cache
  private cache = new Map<string, CacheEntry<any>>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  // ==================== Initialization ====================

  private loadInitialData(): void {
    this.loadDepartments().subscribe();
  }

  // ==================== Visitors CRUD ====================

  /**
   * Get visitor by National ID or Phone
   */
  getVisitorByIdentifier(nationalId?: string, phone?: string): Observable<Visitor> {
    const params = new HttpParams()
      .set('nationalId', nationalId || '')
      .set('phone', phone || '');

    return this.http.get<Visitor>(`${this.apiUrl}/Visitors/lookup`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get visitor profile with history
   */
  getVisitorProfile(visitorId: number): Observable<VisitorProfile> {
    const cacheKey = `visitor-profile-${visitorId}`;
    const cached = this.getFromCache<VisitorProfile>(cacheKey);
    if (cached) return of(cached);

    return this.http.get<VisitorProfile>(`${this.apiUrl}/Visitors/${visitorId}/profile`).pipe(
      tap(profile => this.setCache(cacheKey, profile)),
      catchError(this.handleError)
    );
  }

  /**
   * Block/Unblock visitor
   */
  updateVisitorBlockStatus(visitorId: number, isBlocked: boolean): Observable<Visitor> {
    return this.http.put<Visitor>(`${this.apiUrl}/Visitors/${visitorId}/block`, isBlocked).pipe(
      tap(() => this.invalidateCache(`visitor-profile-${visitorId}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Search visitors
   */
  searchVisitors(searchTerm: string): Observable<VisitorSearchResult[]> {
    const params = new HttpParams().set('query', searchTerm);
    
    return this.http.get<VisitorSearchResult[]>(`${this.apiUrl}/Visitors/search`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get all visitors with optional department filter
   */
  getVisitors(departmentId?: number, search?: string): Observable<any[]> {
    let params = new HttpParams();
    if (departmentId) {
      params = params.set('departmentId', departmentId.toString());
    }
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<any[]>(`${this.apiUrl}/Visitors`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get comprehensive visitor profile with visit history, statistics, and image gallery
   */
  getVisitorProfileDetailed(visitorId: number): Observable<any> {
    const cacheKey = `visitor-profile-detailed-${visitorId}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return of(cached);

    return this.http.get<any>(`${this.apiUrl}/Visitors/${visitorId}/profile`).pipe(
      tap(profile => this.setCache(cacheKey, profile, 2 * 60 * 1000)), // 2 minutes cache
      catchError(this.handleError)
    );
  }

  /**
   * Create a new visitor (pre-registration)
   */
  createVisitor(visitorData: any): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.apiUrl}/Visitors`, visitorData).pipe(
      tap(() => {
        // Invalidate visitors cache
        this.clearCache();
      }),
      catchError(this.handleError)
    );
  }

  // ==================== Visits CRUD ====================

  /**
   * Get all active visits
   */
  getActiveVisits(search?: string): Observable<Visit[]> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<Visit[]>(`${this.apiUrl}/Visits/active`, { params }).pipe(
      tap(visits => {
        this.visitsSubject.next(visits);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get visit history (completed visits)
   */
  getVisitHistory(search?: string): Observable<Visit[]> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<Visit[]>(`${this.apiUrl}/Visits/history`, { params }).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(error => {
        this.loadingSubject.next(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get visit by visit number
   */
  getVisitByNumber(visitNumber: string): Observable<Visit> {
    return this.http.get<Visit>(`${this.apiUrl}/Visits/number/${visitNumber}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new visit (check-in)
   */
  createVisit(createDto: CreateVisitDto): Observable<Visit> {
    this.loadingSubject.next(true);
    return this.http.post<Visit>(`${this.apiUrl}/Visits`, createDto).pipe(
      tap(visit => {
        // Update local state
        const currentVisits = this.visitsSubject.value;
        this.visitsSubject.next([visit, ...currentVisits]);
        this.loadingSubject.next(false);
        this.invalidateStatsCache();
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Block or unblock a visitor
   */
  blockVisitor(visitorId: number, isBlocked: boolean, blockReason: string | null): Observable<Visitor> {
    return this.http.put<Visitor>(`${this.apiUrl}/Visitors/${visitorId}/block`, {
      isBlocked,
      blockReason
    }).pipe(
      tap(() => {
        this.invalidateCache('visitors');
        this.invalidateCache(`visitor-${visitorId}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Checkout visit
   */
  checkoutVisit(visitNumber: string): Observable<Visit> {
    return this.http.post<Visit>(`${this.apiUrl}/Visits/checkout/${visitNumber}`, {}).pipe(
      tap(visit => {
        // Update local state
        const currentVisits = this.visitsSubject.value;
        const index = currentVisits.findIndex(v => v.visitNumber === visitNumber);
        if (index !== -1) {
          currentVisits[index] = visit;
          this.visitsSubject.next([...currentVisits]);
        }
        this.invalidateStatsCache();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update visit
   */
  updateVisit(visitNumber: string, updateDto: UpdateVisitDto): Observable<Visit> {
    return this.http.put<Visit>(`${this.apiUrl}/Visits/${visitNumber}`, updateDto).pipe(
      tap(visit => {
        const currentVisits = this.visitsSubject.value;
        const index = currentVisits.findIndex(v => v.visitNumber === visitNumber);
        if (index !== -1) {
          currentVisits[index] = visit;
          this.visitsSubject.next([...currentVisits]);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cancel visit
   */
  cancelVisit(visitNumber: string, reason: string): Observable<Visit> {
    return this.http.post<Visit>(`${this.apiUrl}/Visits/${visitNumber}/cancel`, { reason }).pipe(
      tap(() => this.invalidateStatsCache()),
      catchError(this.handleError)
    );
  }

  /**
   * Get recent visits
   */
  getRecentVisits(count: number = 10): Observable<Visit[]> {
    const params = new HttpParams().set('count', count.toString());
    
    return this.http.get<Visit[]>(`${this.apiUrl}/Visits/recent`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Search visits
   */
  searchVisits(searchTerm: string): Observable<VisitSearchResult[]> {
    const params = new HttpParams().set('search', searchTerm);
    
    return this.http.get<VisitSearchResult[]>(`${this.apiUrl}/Visits/search`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== Departments ====================

  /**
   * Get all departments
   */
  loadDepartments(): Observable<VisitorDepartment[]> {
    const cacheKey = 'departments';
    const cached = this.getFromCache<VisitorDepartment[]>(cacheKey);
    if (cached) {
      this.departmentsSubject.next(cached);
      return of(cached);
    }

    return this.http.get<VisitorDepartment[]>(`${this.apiUrl}/VisitorDepartments`).pipe(
      tap(departments => {
        this.departmentsSubject.next(departments);
        this.setCache(cacheKey, departments);
      }),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  /**
   * Get department by ID
   */
  getDepartmentById(departmentId: number): Observable<VisitorDepartment> {
    return this.http.get<VisitorDepartment>(`${this.apiUrl}/VisitorDepartments/${departmentId}`).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== Statistics & Dashboard ====================

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    const cacheKey = 'dashboard-stats';
    const cached = this.getFromCache<DashboardStats>(cacheKey);
    if (cached) {
      this.statsSubject.next(cached);
      return of(cached);
    }

    return this.http.get<DashboardStats>(`${this.apiUrl}/Visits/stats`).pipe(
      tap(stats => {
        this.statsSubject.next(stats);
        this.setCache(cacheKey, stats, 2 * 60 * 1000); // 2 minutes cache
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get hourly distribution
   */
  getHourlyDistribution(date?: Date): Observable<HourlyDistribution[]> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date.toISOString());
    }

    return this.http.get<HourlyDistribution[]>(`${this.apiUrl}/Visits/hourly-distribution`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get visits by time period
   */
  getVisitsByPeriod(period: TimePeriod, dateFrom?: Date, dateTo?: Date): Observable<Visit[]> {
    let params = new HttpParams().set('period', period);
    
    if (period === TimePeriod.Custom && dateFrom && dateTo) {
      params = params.set('dateFrom', dateFrom.toISOString());
      params = params.set('dateTo', dateTo.toISOString());
    }

    return this.http.get<Visit[]>(`${this.apiUrl}/Visits/by-period`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== Filtering & Pagination ====================

  /**
   * Filter visits locally
   */
  filterVisits(visits: Visit[], filters: VisitFilters): Visit[] {
    let filtered = [...visits];

    // Search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(visit =>
        visit.visitNumber.toLowerCase().includes(term) ||
        visit.visitorName.toLowerCase().includes(term) ||
        visit.departmentName.toLowerCase().includes(term) ||
        visit.employeeToVisit.toLowerCase().includes(term) ||
        (visit.carPlate && visit.carPlate.toLowerCase().includes(term))
      );
    }

    // Department filter
    if (filters.departmentId) {
      filtered = filtered.filter(visit => visit.departmentId === filters.departmentId);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(visit => visit.status === filters.status);
    }

    // Date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(visit => new Date(visit.checkInAt) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(visit => new Date(visit.checkInAt) <= toDate);
    }

    // Created by user
    if (filters.createdByUserId) {
      filtered = filtered.filter(visit => visit.createdByUserId === filters.createdByUserId);
    }

    // Has car plate
    if (filters.hasCarPlate !== undefined) {
      filtered = filtered.filter(visit => 
        filters.hasCarPlate ? !!visit.carPlate : !visit.carPlate
      );
    }

    return filtered;
  }

  /**
   * Get paginated visits
   */
  getPaginatedVisits(
    filters?: VisitFilters, 
    pagination?: PaginationParams
  ): Observable<PaginatedResult<Visit>> {
    let params = new HttpParams();

    // Add filters to params
    if (filters) {
      if (filters.searchTerm) params = params.set('search', filters.searchTerm);
      if (filters.departmentId) params = params.set('departmentId', filters.departmentId.toString());
      if (filters.status && filters.status !== 'all') params = params.set('status', filters.status);
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo.toISOString());
      if (filters.createdByUserId) params = params.set('createdBy', filters.createdByUserId.toString());
      if (filters.hasCarPlate !== undefined) params = params.set('hasCarPlate', filters.hasCarPlate.toString());
    }

    // Add pagination to params
    if (pagination) {
      params = params.set('pageNumber', pagination.pageNumber.toString());
      params = params.set('pageSize', pagination.pageSize.toString());
      if (pagination.sortBy) params = params.set('sortBy', pagination.sortBy);
      if (pagination.sortOrder) params = params.set('sortOrder', pagination.sortOrder);
    }

    return this.http.get<PaginatedResult<Visit>>(`${this.apiUrl}/Visits/paginated`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== Reports ====================

  /**
   * Generate visit report
   */
  generateReport(
    reportType: ReportType,
    dateFrom: Date,
    dateTo: Date,
    filters?: VisitFilters
  ): Observable<VisitReport> {
    const body = {
      reportType,
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      filters
    };

    return this.http.post<VisitReport>(`${this.apiUrl}/Visits/reports/generate`, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Export visits
   */
  exportVisits(options: ExportOptions): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/Visits/export`, options, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Download export file
   */
  downloadExport(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // ==================== Badge Printing ====================

  /**
   * Print visitor badge
   */
  printVisitorBadge(visitNumber: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/Visits/${visitNumber}/badge`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== Helpers ====================

  /**
   * Format time duration
   */
  formatDuration(startDate: Date, endDate?: Date): string {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}س ${minutes}د`;
    }
    return `${minutes}د`;
  }

  /**
   * Get time since
   */
  getTimeSince(date: Date): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  }

  /**
   * Get status label in Arabic
   */
  getStatusLabel(status: VisitStatus | string): string {
    const statusStr = typeof status === 'string' ? status : (status as VisitStatus);
    switch (statusStr?.toLowerCase()) {
      case 'checkedin':
      case VisitStatus.CheckedIn:
      case 'ongoing': // Legacy support
        return 'جارية';
      case 'checkedout':
      case VisitStatus.CheckedOut:
      case 'completed': // Legacy support
        return 'مكتملة';
      case 'rejected':
      case VisitStatus.Rejected:
      case 'incomplete': // Legacy support
        return 'مرفوضة';
      case 'cancelled':
      case VisitStatus.Cancelled:
        return 'ملغاة';
      default:
        return statusStr || 'غير معروف';
    }
  }

  /**
   * Get status color
   */
  getStatusColor(status: VisitStatus | string): string {
    const statusStr = typeof status === 'string' ? status : (status as VisitStatus);
    switch (statusStr?.toLowerCase()) {
      case 'checkedin':
      case VisitStatus.CheckedIn:
      case 'ongoing': // Legacy support
        return 'primary';
      case 'checkedout':
      case VisitStatus.CheckedOut:
      case 'completed': // Legacy support
        return 'accent';
      case 'rejected':
      case VisitStatus.Rejected:
      case 'incomplete': // Legacy support
        return 'warn';
      default:
        return '';
    }
  }

  // ==================== Cache Management ====================

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = new Date();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.cacheTTL): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  private invalidateStatsCache(): void {
    this.invalidateCache('dashboard-stats');
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // ==================== Error Handling ====================

  private handleError(error: any): Observable<never> {
    console.error('Visitor Management Service Error:', error);
    
    let errorMessage = 'حدث خطأ غير متوقع';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `خطأ: ${error.error.message}`;
    } else if (error.status) {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'بيانات غير صحيحة';
          break;
        case 401:
          errorMessage = 'غير مصرح - يرجى تسجيل الدخول';
          break;
        case 403:
          errorMessage = 'ليس لديك صلاحية للقيام بهذا الإجراء';
          break;
        case 404:
          errorMessage = 'البيانات المطلوبة غير موجودة';
          break;
        case 500:
          errorMessage = 'خطأ في الخادم - يرجى المحاولة لاحقاً';
          break;
        default:
          errorMessage = error.error?.message || `خطأ: ${error.status}`;
      }
    }

    return throwError(() => ({
      statusCode: error.status || 0,
      message: errorMessage,
      details: error.error?.details || error.message,
      timestamp: new Date()
    }));
  }

  // ==================== Utility Methods ====================

  /**
   * Refresh all data
   */
  refreshAllData(): void {
    this.clearCache();
    this.loadDepartments().subscribe();
    this.getDashboardStats().subscribe();
    this.getActiveVisits().subscribe();
  }

  /**
   * Get current visits
   */
  getCurrentVisits(): Visit[] {
    return this.visitsSubject.value;
  }

  /**
   * Get current departments
   */
  getCurrentDepartments(): VisitorDepartment[] {
    return this.departmentsSubject.value;
  }

  /**
   * Get current stats
   */
  getCurrentStats(): DashboardStats | null {
    return this.statsSubject.value;
  }
}

