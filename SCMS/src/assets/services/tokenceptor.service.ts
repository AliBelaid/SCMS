import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class TokenceptorService implements HttpInterceptor {
  private authService: AuthService | null = null;

  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Lazy load AuthService to avoid circular dependency issues
    if (!this.authService) {
      this.authService = this.injector.get(AuthService);
    }

    // Get token using AuthService method which handles multiple storage keys
    const token = this.authService.getAuthToken();
    
    if (token && !req.headers.has('Authorization')) {
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(clonedReq);
    }
    
    return next.handle(req);
  }
}


