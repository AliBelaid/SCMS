import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

interface UserProfile {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    gender: string;
    nationalId: string;
    nationality: string;
    maritalStatus: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    alternatePhone?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  profileImage?: string;
  preferences: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  lastUpdated: Date;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <button mat-icon-button class="back-button" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>My Profile</h1>
        <div class="header-actions">
          <button mat-stroked-button (click)="cancelChanges()" [disabled]="!profileForm.dirty">
            Cancel
          </button>
          <button mat-raised-button color="primary" (click)="saveProfile()" 
                  [disabled]="profileForm.invalid || isLoading">
            <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
            <span *ngIf="!isLoading">Save Changes</span>
          </button>
        </div>
      </div>

      <div class="profile-content">
        <!-- Profile Image Section -->
        <mat-card class="image-card">
          <mat-card-header>
            <mat-card-title>Profile Photo</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="image-section">
              <div class="profile-image-container">
                <img [src]="userProfile.profileImage || '/assets/default-avatar.png'" 
                     alt="Profile Image" class="profile-image">
                <button mat-mini-fab color="primary" class="change-image-btn" 
                        (click)="fileInput.click()">
                  <mat-icon>camera_alt</mat-icon>
                </button>
                <input #fileInput type="file" accept="image/*" style="display: none" 
                       (change)="onImageSelected($event)">
              </div>
              <div class="image-info">
                <p class="image-guidelines">
                  <mat-icon>info</mat-icon>
                  Upload a clear photo of yourself. Accepted formats: JPG, PNG (max 5MB)
                </p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <form [formGroup]="profileForm" class="profile-form">
          <!-- Personal Information -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title>Personal Information</mat-card-title>
              <mat-card-subtitle>Basic personal details</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content formGroupName="personalInfo">
              <div class="form-grid">
                <mat-form-field>
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName" required>
                  <mat-error>First name is required</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Middle Name</mat-label>
                  <input matInput formControlName="middleName">
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" required>
                  <mat-error>Last name is required</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Date of Birth</mat-label>
                  <input matInput [matDatepicker]="dobPicker" formControlName="dateOfBirth" required>
                  <mat-datepicker-toggle matSuffix [for]="dobPicker"></mat-datepicker-toggle>
                  <mat-datepicker #dobPicker></mat-datepicker>
                  <mat-error>Date of birth is required</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Gender</mat-label>
                  <mat-select formControlName="gender" required>
                    <mat-option value="male">Male</mat-option>
                    <mat-option value="female">Female</mat-option>
                    <mat-option value="other">Other</mat-option>
                  </mat-select>
                  <mat-error>Gender is required</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>National ID</mat-label>
                  <input matInput formControlName="nationalId" required>
                  <mat-error>National ID is required</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Nationality</mat-label>
                  <mat-select formControlName="nationality" required>
                    <mat-option value="saudi">Saudi Arabian</mat-option>
                    <mat-option value="american">American</mat-option>
                    <mat-option value="british">British</mat-option>
                    <mat-option value="other">Other</mat-option>
                  </mat-select>
                  <mat-error>Nationality is required</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Marital Status</mat-label>
                  <mat-select formControlName="maritalStatus" required>
                    <mat-option value="single">Single</mat-option>
                    <mat-option value="married">Married</mat-option>
                    <mat-option value="divorced">Divorced</mat-option>
                    <mat-option value="widowed">Widowed</mat-option>
                  </mat-select>
                  <mat-error>Marital status is required</mat-error>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Contact Information -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title>Contact Information</mat-card-title>
              <mat-card-subtitle>How we can reach you</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content formGroupName="contactInfo">
              <div class="form-grid">
                <mat-form-field class="full-width">
                  <mat-label>Email Address</mat-label>
                  <input matInput type="email" formControlName="email" required>
                  <mat-error>Valid email is required</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phone" required>
                  <mat-error>Phone number is required</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Alternate Phone</mat-label>
                  <input matInput formControlName="alternatePhone">
                </mat-form-field>
              </div>

              <div class="address-section" formGroupName="address">
                <h3>Address</h3>
                <div class="form-grid">
                  <mat-form-field class="full-width">
                    <mat-label>Street Address</mat-label>
                    <input matInput formControlName="street" required>
                    <mat-error>Street address is required</mat-error>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>City</mat-label>
                    <input matInput formControlName="city" required>
                    <mat-error>City is required</mat-error>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>State/Province</mat-label>
                    <input matInput formControlName="state" required>
                    <mat-error>State is required</mat-error>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>ZIP/Postal Code</mat-label>
                    <input matInput formControlName="zipCode" required>
                    <mat-error>ZIP code is required</mat-error>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Country</mat-label>
                    <mat-select formControlName="country" required>
                      <mat-option value="SA">Saudi Arabia</mat-option>
                      <mat-option value="US">United States</mat-option>
                      <mat-option value="GB">United Kingdom</mat-option>
                      <mat-option value="other">Other</mat-option>
                    </mat-select>
                    <mat-error>Country is required</mat-error>
                  </mat-form-field>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Emergency Contact -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title>Emergency Contact</mat-card-title>
              <mat-card-subtitle>Person to contact in case of emergency</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content formGroupName="emergencyContact">
              <div class="form-grid">
                <mat-form-field>
                  <mat-label>Contact Name</mat-label>
                  <input matInput formControlName="name" required>
                  <mat-error>Emergency contact name is required</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Relationship</mat-label>
                  <mat-select formControlName="relationship" required>
                    <mat-option value="spouse">Spouse</mat-option>
                    <mat-option value="parent">Parent</mat-option>
                    <mat-option value="child">Child</mat-option>
                    <mat-option value="sibling">Sibling</mat-option>
                    <mat-option value="friend">Friend</mat-option>
                    <mat-option value="other">Other</mat-option>
                  </mat-select>
                  <mat-error>Relationship is required</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phone" required>
                  <mat-error>Emergency contact phone is required</mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Email Address</mat-label>
                  <input matInput type="email" formControlName="email">
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .profile-header h1 {
      flex: 1;
      margin: 0;
      font-size: 28px;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .back-button {
      margin-right: 8px;
    }

    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .image-card {
      max-width: 400px;
    }

    .image-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .profile-image-container {
      position: relative;
      display: inline-block;
    }

    .profile-image {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #f5f5f5;
    }

    .change-image-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      background: var(--mat-primary-color);
    }

    .image-info {
      text-align: center;
    }

    .image-guidelines {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    .form-section {
      margin-bottom: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .address-section {
      margin-top: 24px;
    }

    .address-section h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    mat-card-title {
      font-size: 20px;
      font-weight: 500;
    }

    mat-card-subtitle {
      color: #666;
      font-size: 14px;
    }

    mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .profile-container {
        padding: 16px;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  userProfile: UserProfile = {
    id: 'user123',
    personalInfo: {
      firstName: 'Ahmed',
      lastName: 'Al-Rashid',
      middleName: 'Mohammed',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'male',
      nationalId: '1234567890',
      nationality: 'saudi',
      maritalStatus: 'married'
    },
    contactInfo: {
      email: 'ahmed.alrashid@email.com',
      phone: '+966 50 123 4567',
      alternatePhone: '+966 11 456 7890',
      address: {
        street: '123 King Fahd Road',
        city: 'Riyadh',
        state: 'Riyadh Province',
        zipCode: '12345',
        country: 'SA'
      }
    },
    emergencyContact: {
      name: 'Fatima Al-Rashid',
      relationship: 'spouse',
      phone: '+966 50 987 6543',
      email: 'fatima.alrashid@email.com'
    },
    profileImage: '/assets/avatars/user-avatar.jpg',
    preferences: {
      language: 'en',
      notifications: {
        email: true,
        sms: true,
        push: false
      }
    },
    lastUpdated: new Date()
  };

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      personalInfo: this.fb.group({
        firstName: ['', Validators.required],
        middleName: [''],
        lastName: ['', Validators.required],
        dateOfBirth: ['', Validators.required],
        gender: ['', Validators.required],
        nationalId: ['', Validators.required],
        nationality: ['', Validators.required],
        maritalStatus: ['', Validators.required]
      }),
      contactInfo: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        alternatePhone: [''],
        address: this.fb.group({
          street: ['', Validators.required],
          city: ['', Validators.required],
          state: ['', Validators.required],
          zipCode: ['', Validators.required],
          country: ['', Validators.required]
        })
      }),
      emergencyContact: this.fb.group({
        name: ['', Validators.required],
        relationship: ['', Validators.required],
        phone: ['', Validators.required],
        email: ['', Validators.email]
      })
    });
  }

  private loadUserProfile(): void {
    // Populate form with existing user data
    this.profileForm.patchValue({
      personalInfo: this.userProfile.personalInfo,
      contactInfo: this.userProfile.contactInfo,
      emergencyContact: this.userProfile.emergencyContact
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.snackBar.open('File size must be less than 5MB', 'Close', {
          duration: 3000
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfile.profileImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        const formValue = this.profileForm.value;
        this.userProfile = {
          ...this.userProfile,
          ...formValue,
          lastUpdated: new Date()
        };
        
        this.isLoading = false;
        this.profileForm.markAsPristine();
        
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000
        });
      }, 2000);
    }
  }

  cancelChanges(): void {
    this.loadUserProfile();
    this.profileForm.markAsPristine();
  }

  goBack(): void {
    window.history.back();
  }
}