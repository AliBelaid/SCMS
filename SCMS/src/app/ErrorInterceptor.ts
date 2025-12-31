import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/assets/services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private authService: AuthService | null = null;
  
  constructor(
    private router: Router, 
    private toastr: ToastrService,
    private injector: Injector
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error) {
          let errorMessage = 'An unexpected error occurred.';

          if (error.error instanceof ProgressEvent) {
            // Handle network errors
            errorMessage = 'Network error: Unable to reach the server.';
          } else if (typeof error.error === 'string') {
            // Handle plain text errors
            errorMessage = error.error;
          } else if (error.error && error.error.message) {
            // Handle JSON errors
            errorMessage = error.error.message;
          } else if (error.error && error.error.errors) {
            // Handle validation errors
            const errors = error.error.errors;
            for (const key in errors) {
              if (errors[key]) {
                this.toastr.error(errors[key], 'Validation Error');
              }
            }
            return throwError(() => new Error(error.message));
          }

          // Handle 401 errors
          if (error.status === 401) {
            // Lazy load AuthService to avoid circular dependency
            if (!this.authService) {
              this.authService = this.injector.get(AuthService);
            }
            
            // Clear invalid auth data
            if (this.authService) {
              this.authService.clearAuthData();
            }
            
            // Don't show toast or redirect for initial account check during app initialization
            // The userInitializerFactory will handle this gracefully
            const isInitialAccountCheck = request.url.includes('/account') && 
                                         (error.error?.message?.includes('NameIdentifier') || 
                                          error.error?.message?.includes('Not authenticated'));
            
            if (!isInitialAccountCheck) {
              // Show error and redirect for other 401 errors
              this.toastr.error('Session expired. Please login again.', 'Authentication Error');
              setTimeout(() => {
                this.router.navigateByUrl('/login');
              }, 100);
            }
          } else {
            // Show error for non-401 errors
            this.toastr.error(errorMessage, `Error ${error.status}`);
          }
        }
        return throwError(() => new Error(error.message));
      })
    );
  }


  interceptxx(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error) {
          let errorMessage = 'An unexpected error occurred.';
          if (error.error instanceof ProgressEvent) {
            // Handle network errors
            errorMessage = 'Network error: Unable to reach the server.';
          } else if (typeof error.error === 'string') {
            // Handle plain text errors
            errorMessage = error.error;
          } else if (error.error && error.error.message) {
            // Handle JSON errors
            errorMessage = error.error.message;
          }
          this.toastr.error(errorMessage, error.status.toString());
          if (error.status === 401) {
            this.router.navigateByUrl('/login');
          } else if (error.status === 404) {
            this.router.navigateByUrl('/error-404');
          } else if (error.status === 500) {
            const navigationExtras: NavigationExtras = { state: { error: error.error } };
            this.router.navigateByUrl('/error-500', navigationExtras);
          }
        }
        return throwError(() => new Error(error.message));
      })
    );
  }

}
