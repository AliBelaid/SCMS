import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatListModule,
    MatDividerModule
  ],
  template: `
    <div class="change-password-container">
      <div class="header">
        <button mat-icon-button class="back-button" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Change Password</h1>
      </div>

      <div class="content">
        <mat-card class="password-form-card">
          <mat-card-header>
            <mat-card-title>Update Your Password</mat-card-title>
            <mat-card-subtitle>Choose a strong password to keep your account secure</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <div class="form-fields">
                <!-- Current Password -->
                <mat-form-field class="full-width">
                  <mat-label>Current Password</mat-label>
                  <input matInput 
                         [type]="hideCurrentPassword ? 'password' : 'text'"
                         formControlName="currentPassword"
                         required>
                  <button mat-icon-button matSuffix 
                          type="button"
                          (click)="hideCurrentPassword = !hideCurrentPassword">
                    <mat-icon>{{hideCurrentPassword ? 'visibility' : 'visibility_off'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                    Current password is required
                  </mat-error>
                </mat-form-field>

                <!-- New Password -->
                <mat-form-field class="full-width">
                  <mat-label>New Password</mat-label>
                  <input matInput 
                         [type]="hideNewPassword ? 'password' : 'text'"
                         formControlName="newPassword"
                         (input)="onPasswordChange($event)"
                         required>
                  <button mat-icon-button matSuffix 
                          type="button"
                          (click)="hideNewPassword = !hideNewPassword">
                    <mat-icon>{{hideNewPassword ? 'visibility' : 'visibility_off'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                    New password is required
                  </mat-error>
                  <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                    Password must be at least 8 characters long
                  </mat-error>
                  <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('weakPassword')">
                    Password is too weak. Please follow the requirements below.
                  </mat-error>
                </mat-form-field>

                <!-- Password Strength Indicator -->
                <div class="password-strength" *ngIf="passwordForm.get('newPassword')?.value">
                  <div class="strength-header">
                    <span>Password Strength: </span>
                    <span [style.color]="passwordStrength.color" class="strength-label">
                      {{passwordStrength.label}}
                    </span>
                  </div>
                  <mat-progress-bar 
                    [value]="passwordStrength.score * 25" 
                    [color]="passwordStrength.score >= 3 ? 'primary' : 'warn'">
                  </mat-progress-bar>
                </div>

                <!-- Confirm Password -->
                <mat-form-field class="full-width">
                  <mat-label>Confirm New Password</mat-label>
                  <input matInput 
                         [type]="hideConfirmPassword ? 'password' : 'text'"
                         formControlName="confirmPassword"
                         required>
                  <button mat-icon-button matSuffix 
                          type="button"
                          (click)="hideConfirmPassword = !hideConfirmPassword">
                    <mat-icon>{{hideConfirmPassword ? 'visibility' : 'visibility_off'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                    Please confirm your new password
                  </mat-error>
                  <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('passwordMismatch')">
                    Passwords do not match
                  </mat-error>
                </mat-form-field>

                <div class="form-actions">
                  <button mat-stroked-button type="button" (click)="resetForm()">
                    Cancel
                  </button>
                  <button mat-raised-button 
                          color="primary" 
                          type="submit"
                          [disabled]="passwordForm.invalid || isLoading">
                    <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                    <span *ngIf="!isLoading">Change Password</span>
                  </button>
                </div>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Password Requirements -->
        <mat-card class="requirements-card">
          <mat-card-header>
            <mat-card-title>Password Requirements</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item [class.requirement-met]="hasMinLength">
                <mat-icon matListItemIcon [color]="hasMinLength ? 'primary' : 'warn'">
                  {{hasMinLength ? 'check_circle' : 'cancel'}}
                </mat-icon>
                <div matListItemTitle>At least 8 characters long</div>
              </mat-list-item>
              
              <mat-list-item [class.requirement-met]="hasUppercase">
                <mat-icon matListItemIcon [color]="hasUppercase ? 'primary' : 'warn'">
                  {{hasUppercase ? 'check_circle' : 'cancel'}}
                </mat-icon>
                <div matListItemTitle>At least one uppercase letter (A-Z)</div>
              </mat-list-item>
              
              <mat-list-item [class.requirement-met]="hasLowercase">
                <mat-icon matListItemIcon [color]="hasLowercase ? 'primary' : 'warn'">
                  {{hasLowercase ? 'check_circle' : 'cancel'}}
                </mat-icon>
                <div matListItemTitle>At least one lowercase letter (a-z)</div>
              </mat-list-item>
              
              <mat-list-item [class.requirement-met]="hasNumber">
                <mat-icon matListItemIcon [color]="hasNumber ? 'primary' : 'warn'">
                  {{hasNumber ? 'check_circle' : 'cancel'}}
                </mat-icon>
                <div matListItemTitle>At least one number (0-9)</div>
              </mat-list-item>
              
              <mat-list-item [class.requirement-met]="hasSpecialChar">
                <mat-icon matListItemIcon [color]="hasSpecialChar ? 'primary' : 'warn'">
                  {{hasSpecialChar ? 'check_circle' : 'cancel'}}
                </mat-icon>
                <div matListItemTitle>At least one special character (!&#64;#$%^&amp;*)</div>
              </mat-list-item>
              
              <mat-list-item [class.requirement-met]="isDifferentFromCurrent">
                <mat-icon matListItemIcon [color]="isDifferentFromCurrent ? 'primary' : 'warn'">
                  {{isDifferentFromCurrent ? 'check_circle' : 'cancel'}}
                </mat-icon>
                <div matListItemTitle>Different from current password</div>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>

        <!-- Security Tips -->
        <mat-card class="tips-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>security</mat-icon>
              Security Tips
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <ul class="security-tips">
              <li>Use a unique password that you don't use for other accounts</li>
              <li>Consider using a passphrase with random words</li>
              <li>Avoid using personal information like names or dates</li>
              <li>Don't share your password with anyone</li>
              <li>Enable two-factor authentication for extra security</li>
            </ul>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .change-password-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .password-form-card {
      width: 100%;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
    }

    .password-strength {
      margin: 8px 0;
    }

    .strength-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .strength-label {
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .requirements-card {
      width: 100%;
    }

    .requirement-met {
      color: #4caf50;
    }

    .requirement-met .mat-list-item-icon {
      color: #4caf50 !important;
    }

    .tips-card {
      width: 100%;
    }

    .tips-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .security-tips {
      margin: 0;
      padding-left: 20px;
    }

    .security-tips li {
      margin-bottom: 8px;
      line-height: 1.5;
    }

    mat-spinner {
      margin-right: 8px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .change-password-container {
        padding: 16px;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  isLoading = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  // Password requirements tracking
  hasMinLength = false;
  hasUppercase = false;
  hasLowercase = false;
  hasNumber = false;
  hasSpecialChar = false;
  isDifferentFromCurrent = false;

  passwordStrength: PasswordStrength = {
    score: 0,
    label: 'Very Weak',
    color: '#f44336',
    suggestions: []
  };

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.passwordForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupFormValidation();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator.bind(this)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private setupFormValidation(): void {
    // Watch for password changes
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(password => {
      this.checkPasswordRequirements(password);
      this.calculatePasswordStrength(password);
    });

    this.passwordForm.get('currentPassword')?.valueChanges.subscribe(() => {
      this.checkDifferentFromCurrent();
    });
  }

  private passwordStrengthValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.value;
    if (!password) return null;

    const strength = this.calculatePasswordStrength(password);
    return strength.score < 2 ? { weakPassword: true } : null;
  }

  private passwordMatchValidator(form: AbstractControl): {[key: string]: any} | null {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (!newPassword || !confirmPassword) return null;

    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
    }

    return null;
  }

  private checkPasswordRequirements(password: string): void {
    this.hasMinLength = password.length >= 8;
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasLowercase = /[a-z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    this.checkDifferentFromCurrent();
  }

  private checkDifferentFromCurrent(): void {
    const currentPassword = this.passwordForm.get('currentPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;
    this.isDifferentFromCurrent = currentPassword !== newPassword && newPassword.length > 0;
  }

  private calculatePasswordStrength(password: string): PasswordStrength {
    let score = 0;
    const suggestions: string[] = [];

    if (!password) {
      return {
        score: 0,
        label: 'Very Weak',
        color: '#f44336',
        suggestions: ['Enter a password']
      };
    }

    // Length check
    if (password.length >= 8) score++;
    else suggestions.push('Make it at least 8 characters');

    if (password.length >= 12) score++;

    // Character variety
    if (/[a-z]/.test(password)) score++;
    else suggestions.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else suggestions.push('Add uppercase letters');

    if (/\d/.test(password)) score++;
    else suggestions.push('Add numbers');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    else suggestions.push('Add special characters');

    // Common patterns penalty
    if (/(.)\1{2,}/.test(password)) score--;
    if (/123|abc|qwe/i.test(password)) score--;

    score = Math.max(0, Math.min(4, score));

    const strengthLevels = [
      { label: 'Very Weak', color: '#f44336' },
      { label: 'Weak', color: '#ff9800' },
      { label: 'Fair', color: '#ffc107' },
      { label: 'Good', color: '#8bc34a' },
      { label: 'Strong', color: '#4caf50' }
    ];

    this.passwordStrength = {
      score,
      label: strengthLevels[score].label,
      color: strengthLevels[score].color,
      suggestions
    };

    return this.passwordStrength;
  }

  onPasswordChange(event: any): void {
    const password = event.target.value;
    this.checkPasswordRequirements(password);
    this.calculatePasswordStrength(password);
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;

      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        this.snackBar.open('Password changed successfully!', 'Close', {
          duration: 5000
        });
        this.resetForm();
      }, 2000);
    }
  }

  resetForm(): void {
    this.passwordForm.reset();
    this.passwordStrength = {
      score: 0,
      label: 'Very Weak',
      color: '#f44336',
      suggestions: []
    };
    this.hasMinLength = false;
    this.hasUppercase = false;
    this.hasLowercase = false;
    this.hasNumber = false;
    this.hasSpecialChar = false;
    this.isDifferentFromCurrent = false;
  }

  goBack(): void {
    window.history.back();
  }
}