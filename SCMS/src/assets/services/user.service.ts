import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../assets/environments/environment';
import { ChangePasswordRequest, CreateUserRequest, ModelUtils, UpdateUserRequest, User, UserListResponse, UserSearchParams, userStatus, userType } from 'src/assets/models/medical-provider.model';

// Import consolidated models
 

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/users`;
  
  // State management for current user profile
  private currentUserProfileSubject = new BehaviorSubject<User | null>(null);
  public currentUserProfile$ = this.currentUserProfileSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ==================== CURRENT USER PROFILE ====================

  /**
   * Get current user profile from server
   */
  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/profile`)
      .pipe(
        tap(user => {
          console.log('UserService: Retrieved current user profile:', user.userName);
          this.currentUserProfileSubject.next(user);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update current user's profile
   */
  updateCurrentUserProfile(updates: Partial<UpdateUserRequest>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/profile`, updates)
      .pipe(
        tap(user => {
          console.log('UserService: Updated current user profile:', user.userName);
          this.currentUserProfileSubject.next(user);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Upload profile image for current user
   */
  uploadProfileImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/profile/image`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete current user's profile image
   */
  deleteProfileImage(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/profile/image`)
      .pipe(catchError(this.handleError));
  }

  // ==================== USER SEARCH & LISTING ====================

  /**
   * Search users with filters
   */
  searchUsers(params?: UserSearchParams): Observable<UserListResponse> {
    let httpParams = new HttpParams();
    
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

    return this.http.get<UserListResponse>(`${this.baseUrl}/search`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get users by branch
   */
  getUsersByBranch(branchId: number, params?: Omit<UserSearchParams, 'branchId'>): Observable<UserListResponse> {
    return this.searchUsers({ ...params, medicalProviderId: branchId });
  }

  /**
   * Get single user by ID
   */
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get user by userName
   */
  getUserByUserName(userName: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/by-username/${userName}`)
      .pipe(catchError(this.handleError));
  }
  
  /**
   * Get single user by ID (number)
   */
  getUserByIdNumber(userId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Create new user
   */
  createUser(userData: CreateUserRequest): Observable<User> {
    console.log('UserService: Creating user:', userData.userName, 'for medical provider:', userData.medicalProviderId);
    
    return this.http.post<User>(`${this.baseUrl}`, userData)
      .pipe(
        tap(user => console.log('UserService: Created user:', user.userName)),
        catchError(this.handleError)
      );
  }

  /**
   * Update existing user
   */
  updateUser(userId: string, updates: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${userId}`, updates)
      .pipe(
        tap(user => console.log('UserService: Updated user:', user.userName)),
        catchError(this.handleError)
      );
  }
  
  /**
   * Update existing user by number ID
   */
  updateUserByNumber(userId: number, updates: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${userId}`, updates)
      .pipe(
        tap(user => console.log('UserService: Updated user:', user.userName)),
        catchError(this.handleError)
      );
  }

  /**
   * Delete user
   */
  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }
  
  /**
   * Delete user by number ID
   */
  deleteUserByNumber(userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Activate user
   */
  activateUser(userId: string): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${userId}/activate`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Deactivate user
   */
  deactivateUser(userId: string, reason?: string): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${userId}/deactivate`, { reason })
      .pipe(catchError(this.handleError));
  }

  /**
   * Suspend user
   */
  suspendUser(userId: string, reason?: string, duration?: number): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${userId}/suspend`, { reason, duration })
      .pipe(catchError(this.handleError));
  }

  // ==================== BRANCH ASSIGNMENT ====================

  /**
   * Move user to different branch
   */
  moveUserToBranch(userId: string, branchId: string, isPrimary: boolean = false): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/${userId}/move-branch`, { 
      branchId, 
      isPrimary 
    }).pipe(catchError(this.handleError));
  }

  /**
   * Add user to additional branch (multi-branch access)
   */
  addUserToBranch(userId: string, branchId: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/${userId}/add-branch`, { branchId })
      .pipe(catchError(this.handleError));
  }

  /**
   * Remove user from additional branch
   */
  removeUserFromBranch(userId: string, branchId: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/${userId}/remove-branch`, { branchId })
      .pipe(catchError(this.handleError));
  }

  /**
   * Set user as primary manager of branch
   */
  setBranchPrimaryUser(userId: string, branchId: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/${userId}/set-primary`, { branchId })
      .pipe(catchError(this.handleError));
  }

  // ==================== PASSWORD MANAGEMENT ====================

  /**
   * Change current user's password
   */
  changePassword( request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/change-password`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Reset user password (admin function)
   */
  resetUserPassword(userId: string, sendNotification: boolean = true): Observable<{ message: string; temporaryPassword?: string }> {
    return this.http.post<{ message: string; temporaryPassword?: string }>(`${this.baseUrl}/${userId}/reset-password`, {
      sendNotification
    }).pipe(catchError(this.handleError));
  }

  /**
   * Update user password (admin function)
   */
  updateUserPassword(userId: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${userId}/update-password`, {
      newPassword
    }).pipe(catchError(this.handleError));
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk update users
   */
  bulkUpdateUsers(userIds: string[], updates: Partial<UpdateUserRequest>): Observable<{ updated: number; failed: string[] }> {
    return this.http.patch<{ updated: number; failed: string[] }>(`${this.baseUrl}/bulk-update`, {
      userIds,
      updates
    }).pipe(catchError(this.handleError));
  }

  /**
   * Bulk activate users
   */
  bulkActivateUsers(userIds: string[]): Observable<{ activated: number; failed: string[] }> {
    return this.http.patch<{ activated: number; failed: string[] }>(`${this.baseUrl}/bulk-activate`, {
      userIds
    }).pipe(catchError(this.handleError));
  }

  /**
   * Bulk deactivate users
   */
  bulkDeactivateUsers(userIds: string[], reason?: string): Observable<{ deactivated: number; failed: string[] }> {
    return this.http.patch<{ deactivated: number; failed: string[] }>(`${this.baseUrl}/bulk-deactivate`, {
      userIds,
      reason
    }).pipe(catchError(this.handleError));
  }

  /**
   * Bulk move users to branch
   */
  bulkMoveUsersToBranch(userIds: string[], branchId: string): Observable<{ moved: number; failed: string[] }> {
    return this.http.patch<{ moved: number; failed: string[] }>(`${this.baseUrl}/bulk-move-branch`, {
      userIds,
      branchId
    }).pipe(catchError(this.handleError));
  }

  // ==================== VALIDATION & UTILITIES ====================

  /**
   * Check if userName is available
   */
  checkUserNameAvailability(userName: string, excludeUserId?: string): Observable<{ available: boolean; suggestions?: string[] }> {
    let params = new HttpParams().set('userName', userName);
    if (excludeUserId) {
      params = params.set('excludeUserId', excludeUserId);
    }
    
    return this.http.get<{ available: boolean; suggestions?: string[] }>(`${this.baseUrl}/check-username`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Generate userName suggestions
   */
  generateUserNameSuggestions(fullName: string, branchCode: string): Observable<{ suggestions: string[] }> {
    return this.http.post<{ suggestions: string[] }>(`${this.baseUrl}/generate-username`, {
      fullName,
      branchCode
    }).pipe(catchError(this.handleError));
  }

  /**
   * Validate user data
   */
  validateUserData(userData: Partial<CreateUserRequest | UpdateUserRequest>): Observable<{ valid: boolean; errors: string[] }> {
    return this.http.post<{ valid: boolean; errors: string[] }>(`${this.baseUrl}/validate`, userData)
      .pipe(catchError(this.handleError));
  }

  // ==================== USER STATISTICS ====================

  /**
   * Get user statistics
   */
  getUserStatistics(branchId?: string): Observable<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    byUserType: { [key: string]: number };
    byBranch: { [key: string]: number };
    recentRegistrations: number;
    lastLoginStats: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
  }> {
    let params = new HttpParams();
    if (branchId) {
      params = params.set('branchId', branchId);
    }
    
    return this.http.get<any>(`${this.baseUrl}/statistics`, { params })
      .pipe(catchError(this.handleError));
  }

  // ==================== USER ACTIVITY & AUDIT ====================

  /**
   * Get user activity log
   */
  getUserActivity(userId: string, params?: { 
    startDate?: Date; 
    endDate?: Date; 
    action?: string; 
    page?: number; 
    limit?: number; 
  }): Observable<{ activities: any[]; total: number }> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            httpParams = httpParams.set(key, value.toISOString());
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<{ activities: any[]; total: number }>(`${this.baseUrl}/${userId}/activity`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get current user's activity
   */
  getCurrentUserActivity(params?: any): Observable<{ activities: any[]; total: number }> {
    return this.getUserActivity('me', params);
  }

  // ==================== USER SESSIONS ====================

  /**
   * Get user active sessions
   */
  getUserSessions(userId?: string): Observable<any[]> {
    const url = userId ? `${this.baseUrl}/${userId}/sessions` : `${this.baseUrl}/profile/sessions`;
    return this.http.get<any[]>(url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Terminate specific session
   */
  terminateSession(sessionId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/sessions/${sessionId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Terminate all user sessions
   */
  terminateAllSessions(userId?: string, excludeCurrent: boolean = true): Observable<{ message: string; terminated: number }> {
    const url = userId ? `${this.baseUrl}/${userId}/sessions` : `${this.baseUrl}/profile/sessions`;
    return this.http.delete<{ message: string; terminated: number }>(url, {
      body: { excludeCurrent }
    }).pipe(catchError(this.handleError));
  }

  // ==================== EXPORT & IMPORT ====================

  /**
   * Export users to file
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

    return this.http.get(`${this.baseUrl}/export`, { 
      params: httpParams,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  /**
   * Import users from file
   */
  importUsers(file: File, branchId: string, options?: { 
    updateExisting: boolean; 
    sendWelcomeEmails: boolean; 
  }): Observable<{ imported: number; updated: number; failed: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('branchId', branchId);
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    return this.http.post<{ imported: number; updated: number; failed: any[] }>(`${this.baseUrl}/import`, formData)
      .pipe(catchError(this.handleError));
  }

  // ==================== LEGACY COMPATIBILITY METHODS ====================
  
  // Keep some methods for backward compatibility
  get currentUser$() { return this.currentUserProfile$; }
  get currentUserValue() { return this.currentUserProfileSubject.value; }

  /**
   * Set current user (compatibility method)
   */
  setUpdateCurrentUser(user: any): void {
    console.log('UserService: Setting current user (legacy):', user.userName || user.id);
    
    // Normalize user data to match current User interface
    const normalizedUser: User = {
      id: Number(user.id || 0),
      userName: user.userName || user.userLogin || user.email || '',
      displayName: user.displayName || user.fullName || user.firstName + ' ' + user.lastName || '',
      fullName: user.fullName || user.displayName || '',
      phoneNumber: user.phoneNumber || user.phone || user.mobile,
      email: user.email,
      userType: user.userType || userType.HospitalStaff,
      status: user.status || (user.isActive ? userStatus.Active : userStatus.Inactive),
      isActive: user.isActive !== false,
      medicalProviderId: Number(user.branchId || 0),
      medicalProviderName: user.branchName,
      additionalBranches: user.additionalBranches || [],
      isPrimaryUser: user.isPrimaryUser || false,
      roles: user.roles || [],
      permissions: user.permissions || ModelUtils.getUserPermissions(user.userType || userType.HospitalStaff),
      profileImage: user.profileImage,
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
      lastActive: user.lastActive ? new Date(user.lastActive) : undefined,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
      createdBy: user.createdBy
    };

    this.currentUserProfileSubject.next(normalizedUser);
  }

  /**
   * Load current user (compatibility)
   */
  loadCurrentUser(): Observable<User> {
    return this.getCurrentUserProfile();
  }

  /**
   * Check if user has roles (compatibility)
   */
  hasRole(roles: string[]): Observable<boolean> {
    return this.currentUserProfile$.pipe(
      map(user => {
        if (!user || !user.roles) return false;
        return roles.some(role => user.roles!.includes(role));
      })
    );
  }

  /**
   * Logout (compatibility - delegates to AuthService)
   */
  logout(): void {
    this.currentUserProfileSubject.next(null);
  }

  private handleError(error: any): Observable<never> {
    console.error('User Service Error:', error);
    throw error;
  }
}