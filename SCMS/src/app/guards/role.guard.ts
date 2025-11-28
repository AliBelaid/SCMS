import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from 'src/assets/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAccess(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAccess(childRoute, state);
  }

  private checkAccess(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url } 
          });
          return false;
        }

        // Get required roles and permissions from route data
        const requiredRoles = route.data['roles'] as string[] || [];
        const requiredPermissions = route.data['permissions'] as { resource: string; action: string }[] || [];
        const minimumLevel = route.data['minimumLevel'] as number;
        const organizationType = route.data['organizationType'] as string;
        const requireAll = route.data['requireAll'] as boolean || false; // If true, user must have ALL roles/permissions

        // Check organization type if specified
        if (organizationType && !this.authService.isOrganizationType(organizationType)) {
          this.handleUnauthorized(state.url);
          return false;
        }

        // Check minimum role level if specified
        if (minimumLevel && !this.authService.hasMinimumRoleLevel(minimumLevel)) {
          this.handleUnauthorized(state.url);
          return false;
        }

        // Check roles if specified
        if (requiredRoles.length > 0) {
          // Admin and tpa-admin should have access to everything
          if (this.authService.hasRole('Admin') || this.authService.hasRole('tpa-admin')) {
            // Admin and tpa-admin bypass all role checks
            return true;
          }

          const hasRequiredRoles = requireAll 
            ? requiredRoles.every(role => this.authService.hasRole(role))
            : this.authService.hasAnyRole(requiredRoles);

          if (!hasRequiredRoles) {
            this.handleUnauthorized(state.url);
            return false;
          }
        }

        // Check permissions if specified
        if (requiredPermissions.length > 0) {
          const hasRequiredPermissions = requireAll
            ? requiredPermissions.every(perm => this.authService.hasPermission(perm.resource))
            : requiredPermissions.some(perm => this.authService.hasPermission(perm.resource));

          if (!hasRequiredPermissions) {
            this.handleUnauthorized(state.url);
            return false;
          }
        }

        // Special route-specific checks
        const routePath = route.routeConfig?.path || '';
        
        // Admin and tpa-admin have full access to all routes
        if (this.authService.hasRole('Admin') || this.authService.hasRole('tpa-admin')) {
          return true;
        }

        // TPA Admin routes
        if (routePath.includes('tpa-admin')) {
          if (!this.authService.hasAnyRole(['Admin', 'tpa-admin'])) {
            this.handleUnauthorized(state.url);
            return false;
          }
        }

        // Insurance Company routes
        if (routePath.includes('insurance-company')) {
          if (!this.authService.hasAnyRole(['Admin', 'tpa-admin', 'insurance-company'])) {
            this.handleUnauthorized(state.url);
            return false;
          }
        }

        // Provider routes
        if (routePath.includes('provider')) {
          if (!this.authService.hasAnyRole(['Admin', 'tpa-admin', 'provider'])) {
            this.handleUnauthorized(state.url);
            return false;
          }
        }

        // Subscriber routes
        if (routePath.includes('subscriber')) {
          if (!this.authService.hasAnyRole(['Admin', 'tpa-admin', 'subscriber'])) {
            this.handleUnauthorized(state.url);
            return false;
          }
        }

        // Claims processing routes
        if (routePath.includes('process-claims') || routePath.includes('claim-review')) {
          if (!this.authService.hasAnyRole(['Admin', 'tpa-admin', 'claims-processor'])) {
            this.handleUnauthorized(state.url);
            return false;
          }
        }

        // Reports routes
        if (routePath.includes('reports')) {
          if (!this.authService.hasAnyRole(['Admin', 'tpa-admin', 'reports-viewer'])) {
            this.handleUnauthorized(state.url);
            return false;
          }
        }

        // User management routes
        if (routePath.includes('user-management') || routePath.includes('manage-users')) {
          if (!this.authService.hasAnyRole(['Admin', 'tpa-admin'])) {
            this.handleUnauthorized(state.url);
            return false;
          }
        }

        return true;
      })
    );
  }

  private handleUnauthorized(attemptedUrl: string): void {
    console.warn(`Access denied to: ${attemptedUrl}`);
    
    // Redirect based on user's role
    const userRoles = this.authService.getUserRoles();
    
    if (userRoles.length === 0) {
      this.router.navigate(['/login']);
      return;
    }

    // Determine appropriate redirect based on user roles
    // Note: userRoles is an array of strings, not objects with level property
    
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
      // Fallback to main dashboard
      this.router.navigate(['/app/insurance/dashboard']);
    }
  }
}

// Helper guard for specific access patterns
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user || !this.authService.hasAnyRole(['Admin', 'super_admin', 'tpa_admin', 'insurance_admin'])) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
        return true;
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user || !this.authService.hasAnyRole(['Admin', 'super_admin'])) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
        return true;
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class ClaimsProcessorGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user || (!this.authService.hasRole('Admin') && !this.authService.hasAnyRole(['tpa-admin', 'claims-processor']))) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
        return true;
      })
    );
  }
} 