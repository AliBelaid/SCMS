import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../material.module';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      code: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { code, password } = this.loginForm.value;
      
      this.authService.login(code, password).subscribe(result => {
        console.log('Login result:', result);
        if (result.success) {
          this.snackBar.open(result.message, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          
          // Check user role and navigate
          const currentUser = this.authService.getCurrentUser();
          console.log('Current user:', currentUser);
          console.log('Is admin:', this.authService.isAdmin());
          
          if (this.authService.isAdmin()) {
            console.log('Navigating to admin upload');
            this.router.navigate(['/admin/upload']);
          } else {
            console.log('Navigating to files');
            this.router.navigate(['/files']);
          }
        } else {
          this.snackBar.open(result.message, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
        
        this.isLoading = false;
      });
    }
  }
}