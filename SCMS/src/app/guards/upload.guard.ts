import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UploadGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(): boolean {
    console.log('UploadGuard: Checking if user can upload files');
    const isLoggedIn = this.authService.isLoggedIn();
    const canUpload = this.authService.canUploadFiles();
    
    console.log('UploadGuard: isLoggedIn =', isLoggedIn, 'canUpload =', canUpload);
    
    if (isLoggedIn && canUpload) {
      return true;
    } else {
      console.log('UploadGuard: User not authorized to upload, redirecting to files');
      
      this.snackBar.open('ليس لديك صلاحية لرفع الملفات!', 'إغلاق', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      
      this.router.navigate(['/files']);
      return false;
    }
  }
}