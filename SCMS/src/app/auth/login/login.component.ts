import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { VexConfigService } from '@vex/config/vex-config.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BackendApiService } from 'src/assets/services/backend-api.service';
import { AuthService } from 'src/assets/services/auth.service';
import { LoginRequest, User, userType } from 'src/assets/models/medical-provider.model';


@Component({
  selector: 'vex-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInUp400ms],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    RouterModule,
    TranslateModule
  ]
})
export class LoginComponent implements OnInit {
  inputType = 'password';
  visible = false;
  isLoading = false;
  selectedLang = 'ar';
  
  // Updated form using consolidated models - FIXED to match AuthService
  loginForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
    branchCode: ['']
  });
  
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private API: BackendApiService,
    private authService: AuthService,
    private toastr: ToastrService,
    private configService: VexConfigService,
    public translate: TranslateService
  ) {
    this.initializeLanguage();
  }

  ngOnInit(): void {
    console.log('LoginComponent initialized');
    
    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      console.log('User already authenticated, redirecting...');
      this.navigateBasedOnCurrentUser();
      return;
    }

    // Test translation
    this.translate.get('WELCOME_TO_HEMS').subscribe(
      (translation) => console.log('Login component translation test:', translation),
      (error) => console.warn('Login component translation failed:', error)
    );

    // Get return URL from route parameters or query string
    this.route.queryParams.subscribe(params => {
      // Could be used for redirect after login
    });
  }

  private initializeLanguage(): void {
    this.selectedLang = localStorage.getItem('userLang') || 'ar';
    this.translate.setDefaultLang(this.selectedLang);
    this.translate.use(this.selectedLang);
    
    // Update page direction based on language
    const direction = this.selectedLang === 'ar' ? 'rtl' : 'ltr';
    this.configService.updateConfig({ direction });
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('userLang', lang);
    this.selectedLang = lang;
    
    // Update page direction
    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    this.configService.updateConfig({ direction });
  }

  // UPDATED: Simplified login method using AuthService
  login(): void {
    console.log('Login method called');

    // Prevent multiple login attempts
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      this.toastr.error('Please fill in all required fields correctly', 'Validation Error');
      return;
    }

    if (this.isLoading) {
      console.log('Login already in progress, preventing duplicate request');
      return;
    }

    this.isLoading = true;
    console.log('Starting login process...');

    const formValue = this.loginForm.value;
    
    // Create login request that matches AuthService interface
    const loginRequest: LoginRequest = {
      code: formValue.code!,
      password: formValue.password!
    };

    console.log('Login request prepared:', { code: loginRequest.code });

    // Use AuthService login method
    this.authService.login(loginRequest).subscribe({
      next: () => {
        console.log('AuthService login successful');

        setTimeout(() => {
          const currentUser = this.authService.getCurrentUser();
          console.log('Current user after login:', currentUser);
          this.handleLoginSuccess(currentUser);
        }, 100);
      },
      error: (error) => {
        console.error('AuthService login failed:', error);
        this.handleLoginError(error);
      }
    });
  }

  // UPDATED: Quick login methods for development/testing
  quickAdminLogin(): void {
    console.log('Quick admin login initiated');
    this.isLoading = true;

    const adminCredentials: LoginRequest = {
      code: 'ADMIN001',
      password: 'Admin123'
    };

    this.authService.login(adminCredentials).subscribe({
      next: () => {
        console.log('Quick admin login successful');
        this.handleLoginSuccess(this.authService.getCurrentUser());
      },
      error: (error) => {
        console.error('Quick admin login failed:', error);
        this.handleLoginError(error);
      }
    });
  }

  quickReceptionLogin(): void {
    console.log('Quick reception login initiated');
    this.isLoading = true;
    
    const receptionCredentials: LoginRequest = {
      code: 'MEMBER001',
      password: 'Member123!'
    };
    
    this.authService.login(receptionCredentials).subscribe({
      next: () => {
        console.log('Quick reception login successful');
        this.handleLoginSuccess(this.authService.getCurrentUser());
      },
      error: (error) => {
        console.error('Quick reception login failed:', error);
        this.handleLoginError(error);
      }
    });
  }

  private handleLoginSuccess(user: User | null | undefined): void {
    console.log('Login successful for user:', user?.userName || user?.displayName);
    this.isLoading = false;
    
    // Navigate based on user role/type
    this.navigateBasedOnUserRole(user);
    
    this.cd.markForCheck();
  }

  private handleLoginError(error: any): void {
    console.error('Login error:', error);
    this.isLoading = false;
    
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.status === 401) {
      errorMessage = 'Invalid user code or password';
    } else if (error.status === 403) {
      errorMessage = 'Account is not active or lacks proper permissions';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    this.toastr.error(errorMessage, 'Login Failed');
    this.cd.markForCheck();
  }

  private navigateBasedOnCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.navigateBasedOnUserRole(user);
    } else {
      console.log('No current user found, staying on login page');
    }
  }

  private navigateBasedOnUserRole(user: User | null | undefined): void {
    if (!user) {
      console.error('navigateBasedOnUserRole called with undefined user');
      this.navigateToRoute('/app', 'Dashboard');
      return;
    }

    const userTypeName = typeof user.userType === 'number'
      ? (userType[user.userType] ?? '').toString().toLowerCase()
      : String(user.userType ?? '').toLowerCase();
    const roles = this.getUserRoles(user).map(r => r.toLowerCase());
    
    console.log('Navigation - User roles:', roles);
    console.log('Navigation - User type:', userTypeName);
    console.log('Navigation - User ID:', user.id);

    const { route, name } = this.resolveLandingRoute(roles, userTypeName);
    console.log(`Navigating to resolved landing route: ${route}`);
    this.navigateToRoute(route, name);
  }

  private getUserRoles(user: User | null | undefined): string[] {
    if (!user) {
      console.warn('getUserRoles called with undefined user');
      return [];
    }

    return Array.isArray(user.roles) ? user.roles : [];
  }

  private resolveLandingRoute(roles: string[], userType: string): { route: string; name: string } {
    const hasRole = (role: string) => roles.includes(role.toLowerCase()) || userType === role.toLowerCase();

    // Navigate to visitor management for all users (main feature)
    // You can customize this based on roles if needed
    if (hasRole('admin') || hasRole('tpa-admin') || hasRole('tpa_admin') || hasRole('reception') || hasRole('dataentry')) {
      return { route: '/app/visitor-management', name: 'Visitor Management Dashboard' };
    }

    // Default to visitor management
    return { route: '/app/visitor-management', name: 'Visitor Management Dashboard' };
  }

  private navigateToRoute(route: string, routeName: string): void {
    console.log(`Attempting to navigate to: ${route}`);
    
    this.router.navigateByUrl(route, { replaceUrl: true }).then((success) => {
      if (success) {
        console.log(`Successfully navigated to ${routeName}`);
        this.toastr.success('Login successful!', 'Welcome');
      } else {
        console.warn(`Navigation to ${routeName} returned false`);
        this.toastr.warning('Navigation completed with warnings', 'Notice');
      }
    }).catch(err => {
      console.error(`Navigation failed for ${routeName}:`, err);
      this.toastr.error('Navigation failed', 'Error');
      // Fallback navigation
      this.router.navigate(['/app']);
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  toggleVisibility(): void {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
    } else {
      this.inputType = 'text';
      this.visible = true;
    }
    this.cd.markForCheck();
  }

  // Validation helpers for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${fieldName} is required`;
    }
    if (field.errors['minlength']) {
      return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return 'Invalid input';
  }

  // UPDATED: User type checking methods for template use
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getCurrentUserName(): string {
    return this.authService.getUserDisplayName();
  }

  logout(): void {
    console.log('Logout initiated');
    this.authService.logout();
  }

  // Development helper methods
  fillDemoCredentials(userType: 'admin' | 'reception' | 'custom' = 'admin'): void {
    let credentials = { code: '', password: '' };

    switch (userType) {
      case 'admin':
        credentials = { code: 'ADMIN001', password: 'Admin123' };
        break;
      case 'reception':
        credentials = { code: 'MEMBER001', password: 'Member123!' };
        break;
      default:
        credentials = { code: 'MEMBER002', password: 'Member123!' };
    }

    this.loginForm.patchValue(credentials);
    console.log('Demo credentials filled:', credentials.code);
  }

  // Get authentication status for template
  getAuthStatus(): { isAuthenticated: boolean; user: any; isAdmin: boolean } {
    return {
      isAuthenticated: this.authService.isAuthenticated(),
      user: this.authService.getCurrentUser(),
      isAdmin: this.authService.isAdmin()
    };
  }
}