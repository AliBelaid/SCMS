import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from 'src/assets/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const requiredRoles = route.data['roles'] as Array<string>;

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          console.log('User is not logged in');
          console.log(user);
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }
        console.log(user);
        
        // Give tpa-admin full access to all pages
        if (user.roles.includes('tpa-admin')) {
          return true;
        }
        
        const hasRequiredRole = requiredRoles.some(role => user.roles.includes(role));
        if (!hasRequiredRole) {
          console.log('Access denied to:', state.url);
          console.log('Required roles:', requiredRoles);
          console.log('User roles:', user.roles);
          this.router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  }
} 