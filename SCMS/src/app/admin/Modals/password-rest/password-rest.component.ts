import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MedicalProviderUserDto } from 'src/assets/models/medical-provider.model';

// Custom validator to check if passwords match
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-password-rest',
  templateUrl: './password-rest.component.html',
  styleUrls: ['./password-rest.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    NgIf
  ]
})
export class PasswordRestComponent implements OnInit {
  user: MedicalProviderUserDto;
    passwordForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<PasswordRestComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.user = data.user;
    
    // Create form with password match validation
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {}

  resetPassword() {
    if (this.passwordForm.valid) {
      // Return the password string to the caller
      this.dialogRef.close(this.passwordForm.get('password')?.value);
    } else {
      // Mark all fields as touched to show validation errors
      this.passwordForm.markAllAsTouched();
    }
  }
}
