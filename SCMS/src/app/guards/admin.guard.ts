import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('AdminGuard: Checking if user is logged in and has admin privileges');
    const isLoggedIn = this.authService.isLoggedIn();
    const isAdmin = this.authService.isAdmin();
    const canUpload = this.authService.canUploadFiles();
    
    console.log('AdminGuard: isLoggedIn =', isLoggedIn, 'isAdmin =', isAdmin, 'canUpload =', canUpload);
    
    // Allow access if user is logged in and either Admin or has upload permissions
    if (isLoggedIn && (isAdmin || canUpload)) {
      return true;
    } else {
      console.log('AdminGuard: User not authorized, redirecting to files');
      this.router.navigate(['/files']);
      return false;
    }
  }
} 