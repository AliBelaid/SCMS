// auth.service.ts - Simplified Authentication Service
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/assets/environments/environment';
import {
  User,
  userType,
  userStatus,
  LoginRequest
} from 'src/assets/models/medical-provider.model';

type JwtPayload = {
  sub?: string | number;
  userId?: string | number;
  id?: string | number;
  nameid?: string | number;
  unique_name?: string;
  given_name?: string;
  username?: string;
  name?: string;
  fullName?: string;
  email?: string;
  branchid?: string | number;
  branchId?: string | number;
  branch_id?: string | number;
  medicalProviderId?: string | number;
  branchName?: string;
  branch_name?: string;
  medicalProviderName?: string;
  role?: string | string[];
  roles?: string | string[];
  permissions?: string[];
  isActive?: boolean;
  status?: userStatus;
  userType?: number | string;
  user_type?: number | string;
  exp?: number;
  code?: string;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private baseUrl = `${environment.apiUrl}/Account`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  getAuthToken(): string {
    const tokenKeys = ['hems_access_token', 'access_token', 'token', 'authToken', 'jwt_token'];
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token && this.isValidToken(token)) {
        return token;
      }
    }
    return '';
  }

  getToken(): string {
    return this.getAuthToken();
  }

  getAccessToken(): string {
    return this.getAuthToken();
  }

  private isValidToken(token: string): boolean {
    try {
      if (!token || token.length < 10) return false;
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload: JwtPayload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  isTokenExpired(): boolean {
    const token = this.getAuthToken();
    if (!token) return true;
    try {
      const payload: JwtPayload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return !!payload.exp && payload.exp < now;
    } catch {
      return true;
    }
  }

  getHttpHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getAuthHeaders(): HttpHeaders {
    return this.getHttpHeaders();
  }

  getHttpOptions() {
    return { headers: this.getHttpHeaders() };
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get currentUserValue(): User | null {
    return this.getCurrentUser();
  }

  private loadUserFromStorage(): void {
    const userKeys = ['hems_user', 'user', 'currentUser'];
    for (const key of userKeys) {
      const userStr = localStorage.getItem(key);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (this.isValidUser(user)) {
            this.currentUserSubject.next(user);
            return;
          }
        } catch {
          // ignore malformed entries
        }
      }
    }
    this.loadUserFromToken();
  }

  private loadUserFromToken(): void {
    const token = this.getAuthToken();
    if (!token) return;
    try {
      const payload: JwtPayload = JSON.parse(atob(token.split('.')[1]));
      const user = this.payloadToUser(payload);
      if (this.isValidUser(user)) {
        this.currentUserSubject.next(user);
        localStorage.setItem('hems_user', JSON.stringify(user));
      }
    } catch {
      // ignore decoding errors
    }
  }

  private payloadToUser(payload: JwtPayload): User {
    const rawType = payload.userType ?? payload.user_type;
    let resolvedType = userType.HospitalStaff;
    if (typeof rawType === 'number') {
      resolvedType = rawType as userType;
    } else if (typeof rawType === 'string' && rawType in userType) {
      resolvedType = (userType as any)[rawType] as userType;
    }

    const providerId = Number(
      payload.branchid ?? payload.branchId ?? payload.branch_id ?? payload.medicalProviderId ?? 1
    );

    const userName = payload.unique_name ?? payload.given_name ?? payload.username ?? payload.name ?? 'Unknown User';
    const codeValue = (payload as any).code ?? (payload as any).Code ?? (payload as any).codeUser ?? (payload as any).CodeUser;

    return {
      id: Number(payload.sub ?? payload.userId ?? payload.id ?? payload.nameid ?? 0),
      userName,
      code: typeof codeValue === 'string' ? codeValue : undefined,
      displayName: payload.given_name ?? payload.name ?? 'Unknown User',
      fullName: payload.name ?? payload.fullName ?? 'Unknown User',
      email: payload.email ?? '',
      medicalProviderId: providerId,
      medicalProviderName: payload.branchName ?? payload.branch_name ?? payload.medicalProviderName ?? 'Main Branch',
      roles: this.extractRolesFromPayload(payload),
      permissions: payload.permissions ?? [],
      userType: resolvedType,
      status: payload.status ?? userStatus.Active,
      isActive: payload.isActive !== false,
      additionalBranches: [],
      isPrimaryUser: false,
      token: undefined,
      profileImage: undefined,
      phoneNumber: undefined,
      lastLogin: undefined,
      lastActive: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private extractRolesFromPayload(payload: JwtPayload): string[] {
    if (Array.isArray(payload.role)) {
      return payload.role;
    }
    if (typeof payload.role === 'string') {
      return [payload.role];
    }
    if (Array.isArray(payload.roles)) {
      return payload.roles;
    }
    if (typeof payload.roles === 'string') {
      return [payload.roles];
    }
    return [];
  }

  private isValidUser(user: any): user is User {
    const providerId = user?.medicalProviderId ?? user?.branchId;
    return !!(
      user &&
      typeof user.id === 'number' &&
      typeof user.userName === 'string' &&
      typeof providerId === 'number'
    );
  }

  hasValidUserData(): boolean {
    return this.isValidUser(this.getCurrentUser());
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials).pipe(
      tap((response: any) => {
        const token = response.token ?? response.accessToken ?? response.Token ?? response.access_token;
        if (token) {
          localStorage.setItem('hems_access_token', token);
          localStorage.setItem('access_token', token);
          localStorage.setItem('token', token);
        }

        if (response.user) {
          const user = this.normalizeUser(response.user);
          localStorage.setItem('hems_user', JSON.stringify(user));
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        } else if (response.id || response.username || response.email) {
          const user = this.normalizeUser(response);
          localStorage.setItem('hems_user', JSON.stringify(user));
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        } else {
          this.loadUserFromToken();
        }
      }),
      catchError(error => throwError(() => error))
    );
  }

  private normalizeUser(userData: any): User {
    let resolvedType = userType.HospitalStaff;
    if (typeof userData.userType === 'number') {
      resolvedType = userData.userType;
    } else if (typeof userData.userType === 'string' && userData.userType in userType) {
      resolvedType = (userType as any)[userData.userType] as userType;
    }

    const providerId = Number(userData.branchId ?? userData.BranchId ?? userData.medicalProviderId ?? userData.MedicalProviderId ?? 1);

    const resolvedRoles = Array.isArray(userData.roles)
      ? userData.roles
      : userData.role
      ? [userData.role]
      : userData.Role
      ? [userData.Role]
      : [];

    const isActive = userData.isActive ?? userData.IsActive;

    return {
      id: Number(userData.id ?? userData.userId ?? 0),
      userName: userData.userName ?? userData.userLogin ?? userData.code ?? userData.Code ?? userData.username ?? 'Unknown',
      code: userData.code ?? userData.Code ?? userData.userLogin ?? userData.userName ?? userData.username,
      displayName: userData.displayName ?? userData.DisplayName ?? userData.fullName ?? userData.Description ?? userData.userName ?? 'Unknown',
      fullName: userData.fullName ?? userData.FullName ?? userData.displayName ?? userData.Description ?? userData.userName ?? 'Unknown',
      email: userData.email ?? userData.Email ?? '',
      phoneNumber: userData.phoneNumber ?? userData.PhoneNumber,
      medicalProviderId: providerId,
      medicalProviderName: userData.branchName ?? userData.BranchName ?? userData.medicalProviderName ?? 'Main Branch',
      roles: resolvedRoles,
      permissions: userData.permissions ?? userData.Permissions ?? [],
      userType: resolvedType,
      status: userData.status ?? userData.Status ?? (isActive === false ? userStatus.Inactive : userStatus.Active),
      isActive: isActive !== false,
      isPrimaryUser: userData.isPrimaryUser ?? userData.IsPrimaryUser ?? false,
      additionalBranches: userData.additionalBranches ?? userData.AdditionalBranches ?? [],
      token: userData.token ?? userData.Token,
      profileImage: userData.profileImage ?? userData.ProfileImage,
      lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : userData.LastLogin ? new Date(userData.LastLogin) : undefined,
      lastActive: userData.lastActive ? new Date(userData.lastActive) : userData.LastActive ? new Date(userData.LastActive) : undefined,
      createdAt: userData.createdAt ? new Date(userData.createdAt) : userData.CreatedAt ? new Date(userData.CreatedAt) : new Date(),
      updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : userData.UpdatedAt ? new Date(userData.UpdatedAt) : new Date()
    };
  }

  clearAuthData(): void {
    const keys = [
      'hems_access_token',
      'access_token',
      'token',
      'authToken',
      'jwt_token',
      'hems_user',
      'user',
      'currentUser',
      'hems_refresh_token',
      'hems_branch'
    ];
    keys.forEach(key => localStorage.removeItem(key));
    this.currentUserSubject.next(null);
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    const user = this.getCurrentUser();
    return !!(token && user && !this.isTokenExpired());
  }

  hasRole(role: string): boolean {
    return this.getCurrentUser()?.roles?.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  isAdmin(): boolean {
    return this.hasRole('Admin') || this.hasRole('BranchManager');
  }

  isBranchManager(): boolean {
    return this.hasRole('BranchManager');
  }

  refreshAuth(): void {
    this.loadUserFromStorage();
  }

  getUserDisplayName(): string {
    const user = this.getCurrentUser();
    return user?.displayName ?? user?.userName ?? user?.code ?? 'Unknown User';
  }

  getBranchDisplayName(): string {
    const user = this.getCurrentUser();
    return user?.medicalProviderName ?? 'Unknown Medical Provider';
  }

  debugAuth(): void {
    console.log('=== AUTH DEBUG ===');
    console.log('Token exists:', !!this.getAuthToken());
    console.log('Token expired:', this.isTokenExpired());
    console.log('User:', this.getCurrentUser());
    console.log('Authenticated:', this.isAuthenticated());
  }

  getUserRoles(): string[] {
    return this.getCurrentUser()?.roles ?? [];
  }

  hasPermission(permission: string): boolean {
    return this.getCurrentUser()?.permissions?.includes(permission) ?? false;
  }

  isOrganizationType(_orgType: string): boolean {
    return true;
  }

  hasMinimumRoleLevel(level: number): boolean {
    const user = this.getCurrentUser();
    return user ? user.userType <= level : false;
  }

  debugCurrentUser(): void {
    this.debugAuth();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        const hasToken = !!this.getAuthToken();
        const tokenValid = !this.isTokenExpired();
        return hasToken && !!user && tokenValid;
      })
    );
  }

  loginAsAdmin(): Observable<never> {
    return throwError(() => new Error('loginAsAdmin not implemented'));
  }

  updateProfile(profileData: any): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/update-profile`, profileData).pipe(
      tap(user => {
        const normalized = this.normalizeUser(user);
        localStorage.setItem('hems_user', JSON.stringify(normalized));
        localStorage.setItem('user', JSON.stringify(normalized));
        this.currentUserSubject.next(normalized);
      }),
      catchError(error => throwError(() => error))
    );
  }

  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/change-password`, passwordData).pipe(
      catchError(error => throwError(() => error))
    );
  }

  uploadProfileImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/upload-profile-image`, formData).pipe(
      tap(response => {
        const user = this.getCurrentUser();
        if (user) {
          const updated = { ...user, profileImage: response.imageUrl };
          localStorage.setItem('hems_user', JSON.stringify(updated));
          localStorage.setItem('user', JSON.stringify(updated));
          this.currentUserSubject.next(updated);
        }
      }),
      catchError(error => throwError(() => error))
    );
  }
}
