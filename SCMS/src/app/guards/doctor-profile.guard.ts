import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorProfileGuard {
  
  constructor(
    private userService: UserService,
    private router: Router
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Get the doctor ID from the route
    const doctorId = route.paramMap.get('id');
    
    // Get the current user from the service
    return this.userService.currentUser$.pipe(
      map(user => {
        // If the user is not logged in, redirect to login
        if (!user) {
          return this.router.createUrlTree(['/login']);
        }
        
        // If user is admin, they can access any doctor profile
        if (user.roles && user.roles.includes('Admin')) {
          return true;
        }
        
        // If user is a doctor, they can only access their own profile
        if (user.roles && user.roles.includes('Doctor')) {
          // Check if the doctor is accessing their own profile
          if (user.id.toString() === doctorId) {
            return true;
          }
          
          // If not their own profile, redirect to their own profile
          return this.router.createUrlTree([`/doctor/${user.id}/details`]);
        }
        
        // For reception, finance, etc., they can also access doctor profiles 
        if (user.roles && 
           (user.roles.includes('Reception') || 
            user.roles.includes('Finance'))) {
          return true;
        }
        
        // For all other roles, redirect to home
        return this.router.createUrlTree(['/']);
      })
    );
  }
} 