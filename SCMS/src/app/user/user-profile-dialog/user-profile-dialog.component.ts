import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../user.service';
import { IUser } from 'src/assets/user';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-profile-dialog',
  templateUrl: './user-profile-dialog.component.html',
  styleUrls: ['./user-profile-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    MatDividerModule,
    MatOptionModule,
    MatRippleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  // Set the host styles to increase the width 
  host: {
    class: 'user-profile-dialog'
  }
})
export class UserProfileDialogComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  
  form: FormGroup;
  loading = false;
  apiError: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public defaults: IUser,
    private dialogRef: MatDialogRef<UserProfileDialogComponent>,
    private fb: FormBuilder,
    public translate: TranslateService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit() {
    if (this.defaults) {
      this.form.patchValue(this.defaults);
    }
  }

  /**
   * Create the form with validation
   */
  createForm() {
    this.form = this.fb.group({
      id: [this.defaults?.id || ''],
      firstName: [this.defaults?.knownAs?.split(' ')[0] || '', Validators.required],
      lastName: [this.defaults?.knownAs?.split(' ')[1] || '', Validators.required],
      email: [this.defaults?.email || '', [Validators.required, Validators.email]],
      phoneNumber: [this.defaults?.phoneNumber || ''],
      city: [this.defaults?.city || ''],
      country: [this.defaults?.country || ''],
      gender: [this.defaults?.gender || ''],
      logo: [this.defaults?.logo || '']
    });
  }

  /**
   * Handle file selection for profile photo
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Image = e.target.result;
        this.form.get('logo').setValue(base64Image);
        
        // Clear the input value to allow selecting the same file again
        input.value = '';
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Save user profile
   */
  save() {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    const formValues = this.form.value;
    const userProfile = {
      id: formValues.id,
      email: formValues.email,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      phoneNumber: formValues.phoneNumber,
      city: formValues.city,
      country: formValues.country,
      gender: formValues.gender,
      logo: formValues.logo
    };

    this.loading = true;
    this.userService.updateUserProfile(userProfile)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.snackBar.open(this.translate.instant('PROFILE_UPDATED_SUCCESSFULLY'), 
            this.translate.instant('CLOSE'), { duration: 3000 });
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.apiError = error.message || this.translate.instant('PROFILE_UPDATE_ERROR');
          this.snackBar.open(this.apiError, this.translate.instant('CLOSE'), { duration: 5000 });
        }
      });
  }

  /**
   * Helper method to mark all form controls as touched to show validation errors
   */
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
} 