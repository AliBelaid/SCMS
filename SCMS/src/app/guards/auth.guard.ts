import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('AuthGuard: Checking if user is logged in');
    const isLoggedIn = this.authService.isLoggedIn();
    console.log('AuthGuard: isLoggedIn =', isLoggedIn);
    
    if (isLoggedIn) {
      return true;
    } else {
      console.log('AuthGuard: User not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }
  }
} 