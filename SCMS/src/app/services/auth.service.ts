import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';
import { AppUser } from '../models/app-user';
import { environment } from '../../assets/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AppUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = environment.apiUrl + 'account'; // Update with your API URL

  constructor(private http: HttpClient) {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as AppUser;
        // Normalize: if code looks like email but description has CodeUser, use CodeUser for code
        if (parsed && parsed.code && parsed.description && parsed.code.includes('@')) {
          parsed.code = parsed.description;
          localStorage.setItem('currentUser', JSON.stringify(parsed));
        }
        this.currentUserSubject.next(parsed);
      } catch {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  login(code: string, password: string): Observable<{ success: boolean; message: string; user?: AppUser }> {
    return this.http.post<any>(`${this.apiUrl}/login`, { code, password })
      .pipe(
        tap(response => {
          console.log(response);
          if (response) {
         
            const normalizedCode = response.code && response.code.includes('@') && response.description
              ? response.description
              : response.code;

            const user: AppUser = {
              id: response.id,
              code: normalizedCode,
              description: response.description,
              role: response.role,
              isActive: response.isActive,
              preferredLanguage: response.preferredLanguage || 'ar', // Default to Arabic
              token: response.token
            };
            
            this.currentUserSubject.next(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Store token - check both response root and user object
            const token = response.token || response.accessToken || response.access_token || response.user?.token;
            if (token) {
              localStorage.setItem('authToken', token);
              console.log('AuthService: Token stored:', token);
            } else {
              console.log('AuthService: No token found in response');
              console.log('AuthService: Response structure:', response);
            }
          }
        }),
        map(response => ({ 
          success: true, 
          message: 'Login successful',
          user: response.user 
        })),
        catchError(error => {
          console.error('Login error:', error);
          return of({ 
            success: false, 
            message: error.error?.error || 'Login failed' 
          });
        })
      );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }

  getCurrentUser(): AppUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    const isLoggedIn = this.currentUserSubject.value !== null;
    console.log('AuthService.isLoggedIn():', isLoggedIn, 'Current user:', this.currentUserSubject.value);
    return isLoggedIn;
  }

  getAuthToken(): string | null {
    const token = localStorage.getItem('authToken');
    console.log('AuthService.getAuthToken():', token ? 'Token found' : 'No token');
    return token;
  }

  refreshCurrentUser(): Observable<AppUser | null> {
    return this.http.get<any>(`${this.apiUrl}/current`)
      .pipe(
        tap(user => {
          if (user) {
            const appUser: AppUser = {
              id: user.id,
              code: user.code,
              description: user.description,
              role: user.role,
              isActive: user.isActive,
              preferredLanguage: user.preferredLanguage || 'ar', // Default to Arabic
            };
            this.currentUserSubject.next(appUser);
            localStorage.setItem('currentUser', JSON.stringify(appUser));
          }
        }),
        catchError(error => {
          console.error('Error refreshing user:', error);
          this.logout();
          return of(null);
        })
      );
  }

  // Update current user from localStorage immediately (for real-time role changes)
  updateCurrentUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        console.log('AuthService: Updating current user from localStorage:', user);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('AuthService: Error parsing user from localStorage:', error);
      }
    }
  }

  // Update user role immediately
  updateUserRole(newRole: string): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      // Ensure code is normalized to CodeUser (non-email) for consistent comparisons
      const normalizedCode = currentUser.code && currentUser.code.includes('@') && currentUser.description
        ? currentUser.description
        : currentUser.code;

      const updatedUser: AppUser = { ...currentUser, code: normalizedCode, role: newRole as any, preferredLanguage: currentUser.preferredLanguage || 'ar' };
      this.currentUserSubject.next(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'Admin';
  }

  isUploader(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'Uploader';
  }

  isMember(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'Member';
  }

  canUploadFiles(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'Admin' || user?.role === 'Uploader';
  }

  getUserRole(): string {
    const user = this.getCurrentUser();
    return user?.role || '';
  }
} 