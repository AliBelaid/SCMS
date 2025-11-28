import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Log outgoing request
    console.log(`[API Request] ${request.method} ${request.url}`, request);
    
    return next.handle(request).pipe(
      // Log successful responses
      tap(event => {
        if (event.type !== 0) { // Skip HttpEventType.Sent events
          console.log('[API Response]', event);
        }
      }),
      // Catch and log errors
      catchError((error: HttpErrorResponse) => {
        console.error('[API Error]', error);
        
        // Format error message
        let errorMessage = 'An unknown error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          
          // Additional error details if available
          if (error.error) {
            console.error('Error details:', error.error);
            
            if (error.error.details) {
              errorMessage += `\nDetails: ${error.error.details}`;
            }
            
            if (error.error.message) {
              errorMessage += `\nServer message: ${error.error.message}`;
            }
          }
        }
        
        return throwError(() => ({
          status: error.status,
          message: errorMessage,
          details: error.error?.details || error.message,
          originalError: error
        }));
      })
    );
  }
} 