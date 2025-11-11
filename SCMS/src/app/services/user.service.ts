import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AppUser } from '../models/app-user';
import { environment } from '../../assets/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl + 'admin';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllUsers(): Observable<AppUser[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users-with-roles`, { headers: this.getHeaders() })
      .pipe(
        map(users => users.map(user => ({
          id: user.id,
          code: user.code,
          description: user.description,
          country: user.country,
          role: user.role,
          isActive: user.isActive,
          preferredLanguage: user.preferredLanguage || 'ar', // Default to Arabic
          token: user.token
        }))),
        catchError(error => {
          console.error('Error fetching users:', error);
          return of([]);
        })
      );
  }

  getActiveUsers(): Observable<AppUser[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(user => user.isActive))
    );
  }

  addUser(user: AppUser): Observable<boolean> {
    const createUserDto = {
      code: user.code,
      password: user.password || 'defaultPassword123',
      description: user.description,
      role: user.role,
      isActive: user.isActive,
      country: user.country,
      preferredLanguage: user.preferredLanguage || 'ar' // Default to Arabic
    };

    return this.http.post<any>(`${this.apiUrl}/create`, createUserDto, { headers: this.getHeaders() })
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Error adding user:', error);
          return of(false);
        })
      );
  }

  updateUser(user: AppUser): Observable<boolean> {
    const updateUserDto = {
      code: user.code,
      description: user.description,
      country: user.country,
      role: user.role,
      isActive: user.isActive,
      
    };

    return this.http.put<any>(`${this.apiUrl}/update-user/${user.id}`, updateUserDto, { headers: this.getHeaders() })
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Error updating user:', error);
          return of(false);
        })
      );
  }

  deleteUser(userCode: string): Observable<boolean> {
    return this.getAllUsers().pipe(
      switchMap(users => {
        const user = users.find(u => u.code === userCode);
        if (user && user.id) {
          return this.http.delete(`${this.apiUrl}/delete-user/${user.id}`, { headers: this.getHeaders() })
            .pipe(
              map(() => true),
              catchError(error => {
                console.error('Error deleting user:', error);
                return of(false);
              })
            );
        }
        return of(false);
      }),
      catchError(() => of(false))
    );
  }

  activateUser(userCode: string): Observable<boolean> {
    return this.getAllUsers().pipe(
      switchMap(users => {
        const user = users.find(u => u.code === userCode);
        if (user && user.id) {
          return this.http.post(`${this.apiUrl}/activate-user/${user.id}`, {}, { headers: this.getHeaders() })
            .pipe(
              map(() => true),
              catchError(error => {
                console.error('Error activating user:', error);
                return of(false);
              })
            );
        }
        return of(false);
      }),
      catchError(() => of(false))
    );
  }

  deactivateUser(userCode: string): Observable<boolean> {
    return this.getAllUsers().pipe(
      switchMap(users => {
        const user = users.find(u => u.code === userCode);
        if (user && user.id) {
          return this.http.post(`${this.apiUrl}/deactivate-user/${user.id}`, {}, { headers: this.getHeaders() })
            .pipe(
              map(() => true),
              catchError(error => {
                console.error('Error deactivating user:', error);
                return of(false);
              })
            );
        }
        return of(false);
      }),
      catchError(() => of(false))
    );
  }

  resetUserPassword(userCode: string, newPassword: string): Observable<boolean> {
    return this.getAllUsers().pipe(
      switchMap(users => {
        const user = users.find(u => u.code === userCode);
        if (user && user.id) {
          return this.http.post(`${this.apiUrl}/reset-password`, 
            { userId: user.id.toString(), newPassword }, { headers: this.getHeaders() })
            .pipe(
              map(() => true),
              catchError(error => {
                console.error('Error resetting password:', error);
                return of(false);
              })
            );
        }
        return of(false);
      }),
      catchError(() => of(false))
    );
  }

  isUserCodeUnique(code: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-code/${code}`, { headers: this.getHeaders() })
      .pipe(
        map(exists => !exists), // API returns true if exists, we want to return true if unique
        catchError(error => {
          console.error('Error checking user code:', error);
          return of(true); // Assume unique on error
        })
      );
  }

  generateUserCode(): string {
    return 'USER' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  ensureRolesExist(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ensure-roles`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error ensuring roles exist:', error);
          return of(null);
        })
      );
  }

  toggleUploaderRole(userCode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/toggle-uploader-role/${userCode}`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error toggling uploader role:', error);
          return of(null);
        })
      );
  }

  updateUserLanguage(userCode: string, preferredLanguage: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/update-user-language/${userCode}`, preferredLanguage, { headers: this.getHeaders() })
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Error updating user language:', error);
          return of(false);
        })
      );
  }
} 