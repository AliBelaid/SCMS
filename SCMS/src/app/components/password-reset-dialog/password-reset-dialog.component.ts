import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';

export interface PasswordResetData {
  userCode: string;
  userName: string;
}

@Component({
  selector: 'app-password-reset-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './password-reset-dialog.component.html',
  styleUrls: ['./password-reset-dialog.component.scss']
})
export class PasswordResetDialogComponent implements OnInit {
  passwordForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PasswordResetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PasswordResetData
  ) {
    this.passwordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Generate a strong random password
    const strongPassword = this.generateStrongPassword();
    this.passwordForm.patchValue({
      newPassword: strongPassword,
      confirmPassword: strongPassword
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  generateStrongPassword(): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '@$!%*?&';
    
    let password = '';
    
    // Ensure at least one of each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest with random characters
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  generateNewPassword(): void {
    const strongPassword = this.generateStrongPassword();
    this.passwordForm.patchValue({
      newPassword: strongPassword,
      confirmPassword: strongPassword
    });
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      const newPassword = this.passwordForm.get('newPassword')?.value;
      
      // Return the new password to the parent component
      this.dialogRef.close({
        success: true,
        newPassword: newPassword,
        userCode: this.data.userCode
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  getPasswordStrength(password: string): { strength: string; color: string; percentage: number } {
    if (!password) return { strength: 'ضعيف', color: '#ff6b6b', percentage: 0 };
    
    let score = 0;
    if (password.length >= 6) score += 20;
    if (password.length >= 8) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 10;
    if (/[@$!%*?&]/.test(password)) score += 10;
    
    if (score >= 80) return { strength: 'قوي جداً', color: '#26de81', percentage: 100 };
    if (score >= 60) return { strength: 'قوي', color: '#48dbfb', percentage: 75 };
    if (score >= 40) return { strength: 'متوسط', color: '#feca57', percentage: 50 };
    return { strength: 'ضعيف', color: '#ff6b6b', percentage: 25 };
  }

  getPasswordError(): string {
    const password = this.passwordForm.get('newPassword');
    if (!password) return '';
    
    if (password.hasError('required')) return 'كلمة المرور مطلوبة';
    if (password.hasError('minlength')) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (password.hasError('pattern')) return 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص';
    
    return '';
  }

  getConfirmPasswordError(): string {
    const confirmPassword = this.passwordForm.get('confirmPassword');
    if (!confirmPassword) return '';
    
    if (confirmPassword.hasError('required')) return 'تأكيد كلمة المرور مطلوب';
    if (confirmPassword.hasError('passwordMismatch')) return 'كلمة المرور غير متطابقة';
    
    return '';
  }

  hasMinLength(): boolean {
    const password = this.passwordForm.get('newPassword')?.value;
    return password && password.length >= 6;
  }

  hasLowercase(): boolean {
    const password = this.passwordForm.get('newPassword')?.value;
    return password && /[a-z]/.test(password);
  }

  hasUppercase(): boolean {
    const password = this.passwordForm.get('newPassword')?.value;
    return password && /[A-Z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.passwordForm.get('newPassword')?.value;
    return password && /\d/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.passwordForm.get('newPassword')?.value;
    return password && /[@$!%*?&]/.test(password);
  }
} 