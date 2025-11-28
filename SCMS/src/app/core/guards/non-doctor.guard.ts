import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UserService } from '../../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class NonDoctorGuard implements CanActivate {
  
  constructor(
    private userService: UserService,
    private router: Router
  ) {}
  
  canActivate(): Observable<boolean | UrlTree> {
    return this.userService.currentUser$.pipe(
      take(1),
      map(user => {
        // Check if user exists and is not a doctor
        if (user) {
          const isDoctor = user.roles?.includes('Doctor') || user.accountType === 'Doctor';
          
          if (isDoctor) {
            // Redirect doctors to their specific profile page
            return this.router.createUrlTree([`/doctor/${user.id}/settings`]);
          }
          
          // Allow non-doctors
          return true;
        }
        
        // Redirect to login if no user
        return this.router.createUrlTree(['/login']);
      })
    );
  }
} 