// auth.interceptor.ts - HTTP Interceptor for Authentication
import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get token from multiple possible storage keys
    const token = this.getAuthToken();
    
    // Clone request and add authentication header if token exists
    let authReq = request;
    if (token && this.shouldAddToken(request.url)) {
      authReq = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔑 Adding auth token to request:', {
        url: request.url,
        method: request.method,
        hasToken: !!token,
        tokenLength: token.length
      });
    } else if (!token && !this.shouldAddToken(request.url)) {
      console.log('⏭️  Skipping auth for URL:', request.url);
    } else if (!token) {
      console.warn('⚠️  No valid token found for authenticated request:', request.url);
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('🚨 HTTP Error intercepted:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        
        this.handleHttpError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get authentication token with fallback keys
   */
  private getAuthToken(): string {
    const tokenKeys = [
      'hems_access_token',
      'access_token',
      'token',
      'authToken',
      'jwt_token'
    ];
    
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token && this.isValidToken(token)) {
        return token;
      }
    }
    
    return '';
  }

  /**
   * Validate if token is properly formatted and not expired
   */
  private isValidToken(token: string): boolean {
    try {
      if (!token || token.length < 10) return false;
      
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) {
        console.warn('🕒 Token is expired, removing from storage');
        this.clearExpiredTokens();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Invalid token format:', error);
      return false;
    }
  }

  /**
   * Determine if token should be added to this request
   */
  private shouldAddToken(url: string): boolean {
    // Don't add token to external APIs or auth endpoints
    const excludePatterns = [
      '/account/login',
      '/account/register',
      '/public/',
      'oauth',
      'external-api'
    ];
    
    return !excludePatterns.some(pattern => url.toLowerCase().includes(pattern.toLowerCase()));
  }

  /**
   * Handle HTTP errors globally
   */
  private handleHttpError(error: HttpErrorResponse): void {
    switch (error.status) {
      case 401:
        console.warn('🔒 Unauthorized - clearing auth and redirecting to login');
        this.clearAuth();
        this.showError('Session expired. Please login again.');
        setTimeout(() => this.router.navigate(['/login']), 1000);
        break;
        
      case 403:
        console.warn('🚫 Forbidden - insufficient permissions');
        this.showError('You do not have permission to perform this action.');
        break;
        
      case 500:
        console.error('🔥 Server error');
        this.showError('Server error. Please try again later.');
        break;
        
      case 0:
        console.error('🌐 Network error - server may be offline');
        this.showError('Unable to connect to server. Please check your connection.');
        break;
        
      default:
        if (error.status >= 400) {
          console.error(`❌ HTTP ${error.status} error:`, error.message);
          const message = error.error?.message || error.message || 'Unknown error occurred';
          this.showError(`Error: ${message}`);
        }
        break;
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    const keysToRemove = [
      'hems_access_token', 'access_token', 'token', 'authToken', 'jwt_token',
      'hems_user', 'user', 'currentUser', 'hems_refresh_token', 'hems_branch'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Clear expired tokens from storage
   */
  private clearExpiredTokens(): void {
    const tokenKeys = [
      'hems_access_token', 'access_token', 'token', 'authToken', 'jwt_token'
    ];
    
    tokenKeys.forEach(key => {
      const token = localStorage.getItem(key);
      if (token && !this.isValidToken(token)) {
        console.log(`🗑️  Removing expired token from: ${key}`);
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Show error message to user
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}

// Provider for the interceptor
export const authInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
};
