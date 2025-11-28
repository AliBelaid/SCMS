import { Injectable } from '@angular/core';
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

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toastr: ToastrService) {}

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
          } else if (error.error.errors) {
            // Handle validation errors
            const errors = error.error.errors;
            for (const key in errors) {
              if (errors[key]) {
                this.toastr.error(errors[key], 'Validation Error');
              }
            }
            return throwError(() => new Error(error.message));
          }

          // Show error using Toastr
          this.toastr.error(errorMessage, `Error ${error.status}`);

          // Only redirect to login for 401 errors
          if (error.status === 401) {
            this.router.navigateByUrl('/login');
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
