import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get token from localStorage with multiple fallback keys
    const token = localStorage.getItem('hems_access_token') || 
                  localStorage.getItem('access_token') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('authToken') ||
                  localStorage.getItem('jwt_token');

    // Skip token attachment for authentication endpoints
    const isAuthEndpoint = req.url.includes('/login') || 
                          req.url.includes('/register') || 
                          req.url.includes('/forgot-password');

    if (token && !isAuthEndpoint) {
      console.log('🔐 JwtInterceptor: Attaching JWT token to request:', req.url);
      
      // Clone request and add authorization header
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return next.handle(clonedReq);
    }

    if (!token && !isAuthEndpoint) {
      console.warn('⚠️ JwtInterceptor: No token found for request:', req.url);
    }
    
    return next.handle(req);
  }
}

