import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from '../../assets/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state);
  }

  private checkAuth(state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      tap(isAuthenticated => {
        if (!isAuthenticated) {
          // Store the attempted URL for redirecting after login
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url } 
          });
        }
      }),
      map(isAuthenticated => isAuthenticated)
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      tap(isAuthenticated => {
        if (isAuthenticated) {
          // User is already logged in, redirect to appropriate dashboard
          this.redirectToDashboard();
        }
      }),
      map(isAuthenticated => !isAuthenticated)
    );
  }

  private redirectToDashboard(): void {
    const userRoles = this.authService.getUserRoles();
    
    if (userRoles.length === 0) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Redirect based on highest priority role
    if (this.authService.hasRole('Admin') || this.authService.hasRole('tpa-admin')) {
      this.router.navigate(['/app/insurance/tpa-admin/dashboard']);
    } else if (this.authService.hasRole('super_admin') || this.authService.hasRole('tpa_admin')) {
      this.router.navigate(['/app/insurance/tpa-admin/dashboard']);
    } else if (this.authService.hasRole('insurance_admin')) {
      this.router.navigate(['/app/insurance/company/dashboard']);
    } else if (this.authService.hasRole('provider_admin') || this.authService.hasRole('provider')) {
      this.router.navigate(['/app/insurance/provider/dashboard']);
    } else if (this.authService.hasRole('subscriber')) {
      this.router.navigate(['/app/insurance/subscriber/dashboard']);
    } else {
      this.router.navigate(['/app/insurance/dashboard']);
    }
  }
} 