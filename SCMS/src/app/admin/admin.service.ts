import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from 'src/assets/environments/environment';
import { 
  User, 
  medicalProvider, 
  medical_provider_dto,
  UserSearchParams, 
  UserListResponse, 
  user_dto,
  CreateUserRequest,
  updateUserRequest,
  medicalProviderSearchParams,
  MedicalProviderListResponse,
  MedicalProviderWithUsers,
  createMedicalProviderRequest,
  updateMedicalProviderRequest,
  MoveUserToMedicalProviderRequest,
  userStatus,
  BulkUserOperation,
  userType,
  ModelUtils,
  ApiResponse,
  MedicalProviderDto,
  user_search_params_dto,
  update_user_request_dto,
  MedicalProviderApprovalSettings
} from 'src/assets/models/medical-provider.model';

 

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/`;
  
  // Cache management
  private medicalProvidersCache$ = new BehaviorSubject<medical_provider_dto[]>([]);
  private usersCache$ = new BehaviorSubject<User[]>([]);
  private systemStatsCache$ = new BehaviorSubject<any>(null);

  public medicalProviders$ = this.medicalProvidersCache$.asObservable();
  public users$ = this.usersCache$.asObservable();
  public systemStats$ = this.systemStatsCache$.asObservable();

  constructor(private http: HttpClient) {}

  // ==================== ERROR HANDLING ====================

  private handleError(error: any): Observable<never> {
    console.error('Admin Service Error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 409:
          errorMessage = error.error?.message || 'Resource already exists';
          break;
        case 404:
          errorMessage = error.error?.message || 'Resource not found';
          break;
        case 400:
          if (Array.isArray(error.error)) {
            errorMessage = error.error.join(', ');
          } else {
            errorMessage = error.error?.message || 'Bad request';
          }
          break;
        case 401:
          errorMessage = 'Unauthorized access';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        default:
          errorMessage = error.error?.message || `Server error: ${error.status}`;
      }
    }

    throw new Error(errorMessage);
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Get all users with filtering
   */
  getUsers(params?: UserSearchParams): Observable<UserListResponse> {
    let httpParams = new HttpParams();

    // Map frontend params to backend AdminController's expected query params
    // AdminController expects: searchTerm, medicalProviderId, active, pageNumber, pageSize
    if (params) {
      if (params.search) httpParams = httpParams.set('searchTerm', params.search);
      if (params.medicalProviderId !== undefined && params.medicalProviderId !== null) {
        httpParams = httpParams.set('medicalProviderId', params.medicalProviderId.toString());
      }
      if (params.isActive !== undefined && params.isActive !== null) {
        httpParams = httpParams.set('active', params.isActive.toString());
      }
      if (params.page) httpParams = httpParams.set('pageNumber', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      // userType/status are not supported by backend; keep client-side filtering
    }

    return this.http.get<user_dto[]>(`${this.apiUrl}/Admin/users`, { params: httpParams })
      .pipe(
        map(userDtos => {
          const data = userDtos.map(dto => this.mapuser_dto(dto));
          const page = Number(httpParams.get('pageNumber') || 1);
          const pageSize = Number(httpParams.get('pageSize') || data.length);
          return { data, total: data.length, page, pageSize, totalPages: 1 } as UserListResponse;
        }),
        tap(response => {
          if (!params?.page || params.page === 1) {
            this.usersCache$.next(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get specific user by ID
   */
  getUser(id: number): Observable<User> {
    return this.http.get<user_dto>(`${this.apiUrl}/Admin/users/${id}`)
      .pipe(
        map(dto => this.mapuser_dto(dto)),
        catchError(this.handleError)
      );
  }

  /**
   * Create new user
   */
  createUser(userData: CreateUserRequest): Observable<User> {
    console.log('AdminService: Creating user:', userData.userName, 'for medical provider:', userData.medicalProviderId);
    
    return this.http.post<User>(`${this.apiUrl}/users`, userData)
      .pipe(
        tap(user => {
          console.log('AdminService: Created user:', user.userName);
          this.refreshUsersCache();
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update existing user
   */
  updateUser(id: number, userData: updateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, userData)
      .pipe(
        tap(user => {
          console.log('AdminService: Updated user:', user.userName);
          this.refreshUsersCache();
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete user
   */
  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/Admin/users/${id}`)
      .pipe(
        tap(() => {
          console.log('AdminService: Deleted user:', id);
          this.refreshUsersCache();
        }),
        catchError(this.handleError)
      );
  }

  // ==================== MEDICAL PROVIDER MANAGEMENT ====================

  /**
   * Get all medical providers with filtering
   */
  getmedical_provider_dtos(params?: medicalProviderSearchParams, forceRefresh = false): Observable<MedicalProviderListResponse> {
    if (!forceRefresh && this.medicalProvidersCache$.value.length > 0 && !params) {
      return new Observable(observer => {
        observer.next({
          data: this.medicalProvidersCache$.value as any,
          total: this.medicalProvidersCache$.value.length,
          page: 1,
          pageSize: this.medicalProvidersCache$.value.length,
          totalPages: 1
        });
        observer.complete();
      });
    }

    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof medicalProviderSearchParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<MedicalProviderListResponse>(`${this.apiUrl}/medical-providers`, { params: httpParams })
      .pipe(
        tap(response => {
          if (!params?.page || params.page === 1) {
            this.medicalProvidersCache$.next(response.data as unknown as medical_provider_dto[]);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get specific medical provider by ID
   */
  getmedical_provider_dto(id: number): Observable<medical_provider_dto> {
    return this.http.get<medical_provider_dto>(`${this.apiUrl}/medical-providers/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get medical provider with its users
   */
  getMedicalProviderWithUsers(medicalProviderId: number): Observable<MedicalProviderWithUsers> {
    return this.http.get<MedicalProviderWithUsers>(`${this.apiUrl}/medical-providers/${medicalProviderId}/with-users`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new medical provider
   */
  createmedical_provider_dto(medicalProviderData: createMedicalProviderRequest): Observable<medical_provider_dto> {
    return this.http.post<medical_provider_dto>(`${this.apiUrl}/medical-providers`, medicalProviderData)
      .pipe(
        tap(medicalProvider => {
          console.log('AdminService: Created medical provider:', medicalProvider.name);
          this.refreshmedical_provider_dtosCache();
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update existing medical provider
   */
  updatemedical_provider_dto(id: number , medicalProviderData: updateMedicalProviderRequest): Observable<medical_provider_dto> {
    return this.http.put<medical_provider_dto>(`${this.apiUrl}/medical-providers/${id}`, medicalProviderData)
      .pipe(
        tap(medicalProvider => {
          console.log('AdminService: Updated medical provider:', medicalProvider.name);
          this.refreshmedical_provider_dtosCache();
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete medical provider
   */
  deletemedical_provider_dto(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/medical-providers/${id}`)
      .pipe(
        tap(() => {
          console.log('AdminService: Deleted medical provider:', id);
          this.refreshmedical_provider_dtosCache();
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get users in specific medical provider
   */
  getmedical_provider_dtoUsers(medicalProviderId: number, params?: UserSearchParams): Observable<UserListResponse> {
    let httpParams = new HttpParams();
    // Only supported param on backend is 'active' and pagination
    if (params?.isActive !== undefined && params.isActive !== null) {
      httpParams = httpParams.set('active', params.isActive.toString());
    }
    if (params?.page) httpParams = httpParams.set('pageNumber', params.page.toString());
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<user_dto[]>(`${this.apiUrl}/Admin/medical-providers/${medicalProviderId}/users`, { params: httpParams })
      .pipe(
        map(userDtos => {
          const data = userDtos.map(dto => this.mapuser_dto(dto));
          const page = Number(httpParams.get('pageNumber') || 1);
          const pageSize = Number(httpParams.get('pageSize') || data.length);
          return { data, total: data.length, page, pageSize, totalPages: 1 } as UserListResponse;
        }),
        catchError(this.handleError)
      );
  }

  // Maps backend user_dto to app User model
  private mapuser_dto(dto: user_dto): User {
    return {
      id: Number(dto.id),
      userName: dto.userName,
      displayName: dto.displayName || dto.userName,
      fullName: dto.fullName || dto.displayName || dto.userName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      userType: dto.userType as userType,
      status: dto.status as any,
      isActive: dto.isActive,
      medicalProviderId: Number(dto.medicalProviderId),
      medicalProviderName: dto.medicalProviderName,
      roles: dto.roles || [],
      permissions: dto.permissions || [],
      profileImage: dto.profileImage,
      lastLogin: dto.lastLogin ? new Date(dto.lastLogin) : undefined,
      lastActive: dto.lastActive ? new Date(dto.lastActive) : undefined,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
      isPrimaryUser: dto.isPrimaryUser,
      token: undefined
    };
  }

  // ==================== USER ASSIGNMENT & MOVEMENT ====================

  /**
   * Move user to different medical provider
   */
  moveUserTomedical_provider_dto(userId: number, request: MoveUserToMedicalProviderRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/${userId}/move-medical-provider`, request)
      .pipe(
        tap(() => this.refreshUsersCache()),
        catchError(this.handleError)
      );
  }

  /**
   * Assign multiple users to medical provider
   */
  assignUsersTomedical_provider_dto(medicalProviderId: number, userIds: number[], isPrimary: boolean = false): Observable<{ assigned: number; failed: string[] }> {
    return this.http.post<{ assigned: number; failed: string[] }>(`${this.apiUrl}/medical-providers/${medicalProviderId}/assign-users`, {
      userIds,
      isPrimary
    }).pipe(
      tap(() => this.refreshUsersCache()),
      catchError(this.handleError)
    );
  }

  /**
   * Set medical provider primary manager
   */
  setmedical_provider_dtoManager(medicalProviderId: number, userId: number): Observable<medical_provider_dto> {
    return this.http.post<medical_provider_dto>(`${this.apiUrl}/medical-providers/${medicalProviderId}/set-manager`, { userId })
      .pipe(
        tap(() => {
          this.refreshmedical_provider_dtosCache();
          this.refreshUsersCache();
        }),
        catchError(this.handleError)
      );
  }

  // ==================== PASSWORD MANAGEMENT ====================

  /**
   * Reset user password and return new password
   */
  resetUserPassword(id: number): Observable<{ message: string; newPassword: string }> {
    return this.http.post<{ message: string; newPassword: string }>(`${this.apiUrl}/Admin/users/${id}/reset-password`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Update user password to specific value
   */
  updateUserPassword(id: number, newPassword: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/users/${id}/password`, { newPassword })
      .pipe(catchError(this.handleError));
  }

  // ==================== STATUS MANAGEMENT ====================

  /**
   * Toggle user active status
   */
  toggleuserStatus(id: number, active: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/Admin/users/${id}/status`, { active })
      .pipe(
        tap(() => this.refreshUsersCache()),
        catchError(this.handleError)
      );
  }

  /**
   * Change user status (active/inactive/suspended)
   */
  changeuserStatus(id: number, status: userStatus, reason?: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/change-status`, { status, reason })
      .pipe(
        tap(() => this.refreshUsersCache()),
        catchError(this.handleError)
      );
  }

  /**
   * Toggle medical provider active status
   */
  togglemedical_provider_dtoStatus(id: number, active: boolean): Observable<medical_provider_dto> {
    return this.http.patch<medical_provider_dto>(`${this.apiUrl}/medical-providers/${id}/status`, { active })
      .pipe(
        tap(() => this.refreshmedical_provider_dtosCache()),
        catchError(this.handleError)
      );
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Perform bulk operations on users
   */
  bulkUserOperation(operation: BulkUserOperation): Observable<{ 
    success: number; 
    failed: { id: number; error: string }[] 
  }> {
    return this.http.post<{ success: number; failed: { id: number; error: string }[] }>
      (`${this.apiUrl}/users/bulk-operation`, operation)
      .pipe(
        tap(() => this.refreshUsersCache()),
        catchError(this.handleError)
      );
  }

  /**
   * Bulk update user status
   */
  bulkUpdateuserStatus(userIds: number[], isActive: boolean): Observable<{ updated: number; failed: number[] }> {
    return this.bulkUserOperation({
      userIds,
      operation: isActive ? 'activate' : 'deactivate',
      parameters: { isActive }
    }).pipe(
      map(result => ({ updated: result.success, failed: result.failed.map(f => f.id) }))
    );
  }

  /**
   * Bulk move users to medical provider
   */
  bulkMoveUsersTomedical_provider_dto(userIds: number[], medicalProviderId: number): Observable<{ moved: number; failed: number[] }> {
    return this.bulkUserOperation({
      userIds,
      operation: 'moveMedicalProvider',
      parameters: { medicalProviderId: medicalProviderId.toString() }
    }).pipe(
      map(result => ({ moved: result.success, failed: result.failed.map(f => f.id) }))
    );
  }

  // ==================== STATISTICS & ANALYTICS ====================

  /**
   * Get system-wide statistics
   */
  getSystemStatistics(): Observable<{
    users: {
      total: number;
      active: number;
      inactive: number;
      suspended: number;
      byuserType: { [key: string]: number };
      recentlyCreated: number;
      lastLogin: {
        today: number;
        thisWeek: number;
        thisMonth: number;
      };
    };
    medicalProviders: {
      total: number;
      active: number;
      inactive: number;
      withManagers: number;
      averageUsersPermedical_provider_dto: number;
      topmedical_provider_dtosByUsers: { medicalProviderName: string; userCount: number }[];
    };
    system: {
      totalSessions: number;
      activeSessions: number;
      lastDataUpdate: Date;
    };
  }> {
    return this.http.get<any>(`${this.apiUrl}/statistics`)
      .pipe(
        tap(stats => this.systemStatsCache$.next(stats)),
        catchError(this.handleError)
      );
  }

  /**
   * Get medical provider statistics
   */
  getmedical_provider_dtoStatistics(medicalProviderId: number): Observable<{
    medicalProviderInfo: medical_provider_dto;
    userStats: {
      total: number;
      active: number;
      inactive: number;
      byuserType: { [key: string]: number };
    };
    activity: {
      lastWeekLogins: number;
      averageSessionTime: number;
      topActiveUsers: { userName: string; lastLogin: Date }[];
    };
  }> {
    return this.http.get<any>(`${this.apiUrl}/medical-providers/${medicalProviderId}/statistics`)
      .pipe(catchError(this.handleError));
  }

  // ==================== VALIDATION & UTILITIES ====================

  /**
   * Check if userName is available
   */
  checkUserNameAvailability(userName: string, excludeUserId?: number): Observable<{ 
    available: boolean; 
    suggestions?: string[] 
  }> {
    let params = new HttpParams().set('userName', userName);
    if (excludeUserId) {
      params = params.set('excludeUserId', excludeUserId.toString());
    }
    
    return this.http.get<{ available: boolean; suggestions?: string[] }>
      (`${this.apiUrl}/users/check-username`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Check if medical provider code is available
   */
  checkmedical_provider_dtoCodeAvailability(code: string, excludemedical_provider_dtoId?: number): Observable<{ 
    available: boolean; 
    suggestions?: string[] 
  }> {
    let params = new HttpParams().set('code', code);
    if (excludemedical_provider_dtoId) {
      params = params.set('excludemedical_provider_dtoId', excludemedical_provider_dtoId.toString());
    }
    
    return this.http.get<{ available: boolean; suggestions?: string[] }>
      (`${this.apiUrl}/medical-providers/check-code`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Generate random password
   */
  generateRandomPassword(length: number = 8): Observable<{ password: string }> {
    return this.http.post<{ password: string }>(`${this.apiUrl}/generate-password`, { length })
      .pipe(catchError(this.handleError));
  }

  // ==================== DATA EXPORT ====================

  /**
   * Export users data
   */
  exportUsers(params?: UserSearchParams, format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof UserSearchParams];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            httpParams = httpParams.set(key, value.join(','));
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get(`${this.apiUrl}/users/export`, { 
      params: httpParams,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  /**
   * Export medical providers data
   */
  exportmedical_provider_dtos(params?: medicalProviderSearchParams, format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof medicalProviderSearchParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get(`${this.apiUrl}/medical-providers/export`, { 
      params: httpParams,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  // ==================== CACHE MANAGEMENT ====================

  /**
   * Refresh users cache
   */
  refreshUsersCache(): void {
    this.getUsers().subscribe();
  }

  /**
   * Refresh medical providers cache
   */
  refreshmedical_provider_dtosCache(): void {
    this.getmedical_provider_dtos(undefined, true).subscribe();
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.medicalProvidersCache$.next([]);
    this.usersCache$.next([]);
    this.systemStatsCache$.next(null);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get user type display name
   */
  getUserTypeDisplayName(userType: userType): string {
    return ModelUtils.getUserTypeDisplayName(userType);
  }

  /**
   * Get active medical providers only
   */
  getActivemedical_provider_dtos(): Observable<medical_provider_dto[]> {
    return this.getmedical_provider_dtos().pipe(
      map(response => response.data.filter(medicalProvider => ModelUtils.isActiveMedicalProvider(medicalProvider)) as unknown as medical_provider_dto[])
    );
  }

  /**
   * Get active users only
   */
  getActiveUsers(): Observable<User[]> {
    return this.getUsers({ isActive: true }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get users by type
   */
  getUsersByType(userType: userType): Observable<User[]> {
    return this.getUsers({ userType }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Search users by name
   */
  searchUsersByName(searchTerm: string): Observable<User[]> {
    return this.getUsers({ search: searchTerm, pageSize: 50 }).pipe(
      map(response => response.data)
    );
  }

  // ==================== LEGACY COMPATIBILITY METHODS ====================

  // Maintaining backward compatibility with existing code

  /**
   * Legacy: Reset password (alias)
   */
  restPassword(userId: number, pwd: string): Observable<any> {
    return this.updateUserPassword(userId, pwd);
  }

  /**
   * Legacy: Delete admin (alias)
   */
  deleteAdmin(user: User | number): Observable<any> {
    const userId = typeof user === 'number' ? user : user.id;
    return this.deleteUser(userId);
  }

  /**
   * Legacy: Toggle branch user status (alias)
   */
  toggleBranchuserStatus(userId: number, isActive: boolean): Observable<any> {
    return this.toggleuserStatus(userId, isActive);
  }

  /**
   * Legacy: Reset branch user password (alias)
   */
  resetBranchUserPassword(userId: number): Observable<any> {
    return this.resetUserPassword(userId);
  }

  /**
   * Legacy: Create medical provider user (compatibility)
   */
  createmedical_provider_dtoUser(userData: any): Observable<User> {
    const request: CreateUserRequest = {
      userName: userData.userName,
      displayName: userData.displayName,
      password: userData.password,
      phoneNumber: userData.phoneNumber,
      email: userData.email,
      userType: userData.userType || userType.HospitalStaff,
      medicalProviderId: userData.medicalProviderId,
      isPrimaryUser: userData.isPrimary,
      roles: userData.roles || [],
      permissions: userData.permissions || [],
      isActive: userData.active !== undefined ? userData.active : true
    };
    return this.createUser(request);
  }

  /**
   * Legacy: Update medical provider user (compatibility)
   */
  updatemedical_provider_dtoUser(id: number, userData: any): Observable<User> {
    const request: updateUserRequest = {
      id: id,
      displayName: userData.displayName,
      phoneNumber: userData.phoneNumber,
      email: userData.email,
      userType: userData.userType,
      status: userData.active ? userStatus.Active : userStatus.Inactive,
      isActive: userData.active,
      medicalProviderId: userData.medicalProviderId,
      isPrimaryUser: userData.isPrimary
    };
    return this.updateUser(id, request);
  }

  // ==================== NEW API METHODS (BACKEND INTEGRATION) ====================

  /**
   * Get all medical providers with optional filtering (New API)
   */
  getmedical_provider_dtosNew(params?: {
    search?: string;
    city?: string;
    active?: boolean;
    sortBy?: string;
  }): Observable<ApiResponse<MedicalProviderDto[]>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.city) httpParams = httpParams.set('city', params.city);
      if (params.active !== undefined) httpParams = httpParams.set('active', params.active.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    }

    return this.http.get<ApiResponse<MedicalProviderDto[]>>(`${this.apiUrl}/medical_provider_dtos`, { params: httpParams });
  }

  /**
   * Get single medical provider by ID (New API)
   */
  getmedical_provider_dtoNew(id: number): Observable<ApiResponse<MedicalProviderDto>> {
    return this.http.get<ApiResponse<MedicalProviderDto>>(`${this.apiUrl}/medical_provider_dtos/${id}`);
  }

  /**
   * Create new medical provider (New API)
   */
  createmedical_provider_dtoNew(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/medical-providers`, request).pipe(
      tap(response => console.log('Medical provider created:', response)),
      catchError(error => {
        console.error('Error creating medical provider:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update existing medical provider (New API)
   */
  updatemedical_provider_dtoNew(id: number, request: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/medical-providers/${id}`, request).pipe(
      tap(response => console.log('Medical provider updated:', response)),
      catchError(error => {
        console.error('Error updating medical provider:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete medical provider (New API)
   */
  deletemedical_provider_dtoNew(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/medical-providers/${id}`).pipe(
      tap(response => console.log('Medical provider deleted:', response)),
      catchError(error => {
        console.error('Error deleting medical provider:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Toggle medical provider active status (New API)
   */
  togglemedical_provider_dtoStatusNew(id: number, active: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/medical-providers/${id}`, { active }).pipe(
      tap(response => console.log('Medical provider status toggled:', response)),
      catchError(error => {
        console.error('Error toggling medical provider status:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get medical provider auto-approval statistics (New API)
   */
  getmedical_provider_dtoAutoApprovalStats(
    medicalProviderId: number, 
    startDate?: Date, 
    endDate?: Date
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());

    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/Reception/medical-providers/${medicalProviderId}/auto-approval-stats`,
      { params }
    );
  }

  /**
   * Get medical provider approval settings (New API)
   */
  getMedicalProviderApprovalSettings(medicalProviderId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/medical_provider_dtos/${medicalProviderId}/approval-settings`
    );
  }

  /**
   * Update medical provider approval settings (New API)
   */
  updateMedicalProviderApprovalSettings(
    medicalProviderId: number, 
    settings: Partial<MedicalProviderApprovalSettings>
  ): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/medical_provider_dtos/${medicalProviderId}/approval-settings`,
      settings
    );
  }

  /**
   * Get users with optional filtering (New API)
   */
  getUsersNew(params?: user_search_params_dto): Observable<ApiResponse<user_dto[]>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.medicalProviderId) httpParams = httpParams.set('medicalProviderId', params.medicalProviderId.toString());
      if (params.userType !== undefined) httpParams = httpParams.set('userType', params.userType.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http.get<ApiResponse<user_dto[]>>(`${this.apiUrl}/Admin/users`, { params: httpParams });
  }

  /**
   * Get single user by ID (New API)
   */
  getUserNew(id: string): Observable<ApiResponse<user_dto>> {
    return this.http.get<ApiResponse<user_dto>>(`${this.apiUrl}/Admin/users/${id}`);
  }

  /**
   * Create new user (New API)
   */
  createUserNew(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/users`, request).pipe(
      tap(response => console.log('User created:', response)),
      catchError(error => {
        console.error('Error creating user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update existing user (New API)
   */
  updateUserNew(id: string, request: update_user_request_dto): Observable<user_dto> {
    return this.http.put<user_dto>(`${this.apiUrl}/Admin/users/${id}`, request);
  }

  /**
   * Delete user (New API)
   */
  deleteUserNew(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Admin/users/${id}`);
  }

  /**
   * Toggle user status (New API)
   */
  toggleuserStatusNew(id: string, isActive: boolean): Observable<ApiResponse<user_dto>> {
    return this.http.patch<ApiResponse<user_dto>>(
      `${this.apiUrl}/Admin/users/${id}/status`,
      { isActive }
    );
  }

  /**
   * Reset user password (New API)
   */
  resetUserPasswordNew(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/users/${userId}/reset-password`, {}).pipe(
      tap(response => console.log('Password reset:', response)),
      catchError(error => {
        console.error('Error resetting password:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Move user to different medical provider (New API)
   */
  moveUserTomedical_provider_dtoNew(userId: string, medicalProviderId: number, isPrimary: boolean = false): Observable<user_dto> {
    return this.http.patch<user_dto>(`${this.apiUrl}/Admin/users/${userId}/move-to-medical-provider`, {
      medicalProviderId,
      isPrimary
    });
  }

  /**
   * Bulk update user status (New API)
   */
  bulkUpdateuserStatusNew(userIds: string[], isActive: boolean): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/Admin/users/bulk-status`, {
      userIds,
      isActive
    });
  }

  /**
   * Check username availability (New API)
   */
  checkUserNameAvailabilityNew(userName: string, excludeId?: string): Observable<boolean> {
    let params = new HttpParams().set('userName', userName);
    if (excludeId) {
      params = params.set('excludeId', excludeId);
    }
    return this.http.get<boolean>(`${this.apiUrl}/Admin/users/check-username`, { params });
  }

  /**
   * Generate random password (New API)
   */
  generateRandomPasswordNew(length: number = 12): Observable<{ password: string }> {
    return this.http.get<{ password: string }>(
      `${this.apiUrl}/Admin/users/generate-password?length=${length}`
    );
  }

  /**
   * Get users for a specific medical provider (New API)
   */
  getmedical_provider_dtoUsersNew(medicalProviderId: number): Observable<ApiResponse<user_dto[]>> {
    return this.http.get<ApiResponse<user_dto[]>>(
      `${this.apiUrl}/Admin/medical-providers/${medicalProviderId}/users`
    );
  }

  /**
   * Add users to medical provider (New API)
   */
  addUsersTomedical_provider_dto(medicalProviderId: number, userIds: string[]): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/medical_provider_dtos/${medicalProviderId}/staff`,
      { userIds }
    );
  }

  /**
   * Remove user from medical provider (New API)
   */
  removeUserFrommedical_provider_dto(medicalProviderId: number, userId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/medical_provider_dtos/${medicalProviderId}/staff/${userId}`
    );
  }

  /**
   * Set user as primary for medical provider (New API)
   */
  setPrimaryUser(medicalProviderId: number, userId: string): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/medical_provider_dtos/${medicalProviderId}/staff/${userId}/set-primary`,
      {}
    );
  }

  /**
   * Get medical provider statistics (New API)
   */
  getmedical_provider_dtoStatisticsNew(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/medical_provider_dtos/statistics`);
  }

  /**
   * Get user statistics (New API)
   */
  getUserStatisticsNew(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/Admin/statistics`);
  }

  /**
   * Export medical providers to CSV (New API)
   */
  exportmedical_provider_dtosNew(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/medical_provider_dtos/export?format=${format}`, {
      responseType: 'blob'
    });
  }

  /**
   * Export users to CSV (New API)
   */
  exportUsersNew(format: 'csv' | 'excel' = 'csv', medicalProviderId?: number): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (medicalProviderId) {
      params = params.set('medicalProviderId', medicalProviderId.toString());
    }
    
    return this.http.get(`${this.apiUrl}/Admin/users/export`, {
      params,
      responseType: 'blob'
    });
  }

}