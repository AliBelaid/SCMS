import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getAuthToken();
    
    console.log('AuthInterceptor: Processing request to', request.url);
    console.log('AuthInterceptor: Token available:', !!token);
    
    if (token && token.trim() !== '') {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('AuthInterceptor: Token added to request', request.url);
    } else {
      console.log('AuthInterceptor: No token found for request', request.url);
    }
    
    return next.handle(request);
  }
} 