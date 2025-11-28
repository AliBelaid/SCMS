// medical-provider-dialog/medical-provider-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/assets/environments/environment';

export interface BranchDialogData {
  mode: 'create' | 'edit';
  medicalProvider?: any;
  hasHeadquarters?: boolean; // Indicates if another medical provider is already headquarters
}

@Component({
  selector: 'app-medical-provider-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatDividerModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{data.mode === 'create' ? 'add_business' : 'edit'}}</mat-icon>
      {{data.mode === 'create' ? 'Create New medical-provider' : 'Edit medical-provider'}}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="branchForm" class="medical-provider-form">
        <mat-tab-group>
          <!-- Basic Information Tab -->
          <mat-tab label="Basic Information">
            <div class="tab-content">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>medical-provider Code</mat-label>
                  <input matInput 
                         formControlName="code" 
                         placeholder="e.g., BR001"
                         [readonly]="data.mode === 'edit'">
                  <mat-hint>Unique identifier for the medical-provider</mat-hint>
                  <mat-error *ngIf="branchForm.get('code')?.hasError('required')">
                    medical-provider code is required
                  </mat-error>
                  <mat-error *ngIf="branchForm.get('code')?.hasError('pattern')">
                    Code must be alphanumeric (e.g., BR001)
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>medical-provider Name</mat-label>
                  <input matInput 
                         formControlName="name" 
                         placeholder="Enter medical-provider name">
                  <mat-error *ngIf="branchForm.get('name')?.hasError('required')">
                    medical-provider name is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>City</mat-label>
                  <input matInput 
                         formControlName="city" 
                         placeholder="Enter city">
                  <mat-error *ngIf="branchForm.get('city')?.hasError('required')">
                    City is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Phone Number</mat-label>
                  <input matInput 
                         formControlName="phoneNumber" 
                         placeholder="Enter phone number">
                  <mat-icon matPrefix>phone</mat-icon>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Address</mat-label>
                <textarea matInput 
                          formControlName="address" 
                          placeholder="Enter complete address"
                          rows="3"></textarea>
                <mat-icon matPrefix>location_on</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput 
                       formControlName="email" 
                       placeholder="medical-provider@example.com">
                <mat-icon matPrefix>email</mat-icon>
                <mat-error *ngIf="branchForm.get('email')?.hasError('email')">
                  Please enter a valid email address
                </mat-error>
              </mat-form-field>
            </div>
          </mat-tab>

          <!-- Location Tab -->
          <mat-tab label="Location">
            <div class="tab-content">
              <div class="location-info">
                <mat-icon>info</mat-icon>
                <p>Optional: Add geographical coordinates for mapping and location-based services.</p>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Latitude</mat-label>
                  <input matInput 
                         type="number" 
                         formControlName="latitude" 
                         placeholder="e.g., 25.2048">
                  <mat-hint>Decimal degrees (DD)</mat-hint>
                  <mat-error *ngIf="branchForm.get('latitude')?.hasError('min') || branchForm.get('latitude')?.hasError('max')">
                    Latitude must be between -90 and 90
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Longitude</mat-label>
                  <input matInput 
                         type="number" 
                         formControlName="longitude" 
                         placeholder="e.g., 55.2708">
                  <mat-hint>Decimal degrees (DD)</mat-hint>
                  <mat-error *ngIf="branchForm.get('longitude')?.hasError('min') || branchForm.get('longitude')?.hasError('max')">
                    Longitude must be between -180 and 180
                  </mat-error>
                </mat-form-field>
              </div>

              <button mat-button 
                      type="button"
                      color="primary"
                      (click)="detectLocation()"
                      [disabled]="detectingLocation">
                <mat-icon>my_location</mat-icon>
                {{detectingLocation ? 'Detecting...' : 'Use Current Location'}}
              </button>
            </div>
          </mat-tab>

          <!-- Settings Tab -->
          <mat-tab label="Settings">
            <div class="tab-content">
              <div class="settings-section">
                <h3>medical-provider Settings</h3>
                
                <mat-slide-toggle formControlName="active" class="setting-toggle">
                  <span class="toggle-label">
                    medical-provider Active
                    <span class="toggle-hint">medical-provider is operational and can accept users</span>
                  </span>
                </mat-slide-toggle>

                <!-- Headquarters Checkbox -->
                <div class="headquarters-section">
                  <mat-checkbox 
                    formControlName="isHeadquarters" 
                    class="setting-toggle"
                    [disabled]="isHeadquartersDisabled()"
                    [matTooltip]="getHeadquartersTooltip()">
                    <span class="toggle-label">
                      <span class="hq-label">
                        <mat-icon class="hq-icon">business</mat-icon>
                        Set as Headquarters
                      </span>
                      <span class="toggle-hint">
                        {{getHeadquartersHint()}}
                      </span>
                    </span>
                  </mat-checkbox>
                  
                  <div class="hq-warning" *ngIf="showHeadquartersWarning()">
                    <mat-icon>warning</mat-icon>
                    <span>Setting this medical-provider as headquarters will remove headquarters status from the current headquarters medical-provider.</span>
                  </div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="settings-section">
                <h3>Operational Hours</h3>
                <p class="settings-note">
                  Configure operational hours and working days (Coming Soon)
                </p>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button 
              color="primary" 
              (click)="save()"
              [disabled]="!branchForm.valid || checking">
        {{data.mode === 'create' ? 'Create medical-provider' : 'Save Changes'}}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .medical-provider-form {
      min-width: 500px;
      padding: 20px 0;
    }

    .tab-content {
      padding: 20px 10px;
      min-height: 350px;
    }

    .form-row {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .location-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background-color: #e3f2fd;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .location-info mat-icon {
      color: #1976d2;
    }

    .location-info p {
      margin: 0;
      color: #1976d2;
      font-size: 14px;
    }

    .settings-section {
      margin: 20px 0;
    }

    .settings-section h3 {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 15px;
      color: rgba(0,0,0,0.87);
    }

    .setting-toggle {
      display: block;
      margin-bottom: 15px;
    }

    .toggle-label {
      display: flex;
      flex-direction: column;
    }

    .toggle-hint {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
      margin-top: 2px;
    }

    .headquarters-section {
      margin: 20px 0;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .hq-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .hq-icon {
      color: #ff9800;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .hq-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
      padding: 10px;
      background-color: #fff3e0;
      border-radius: 4px;
      color: #f57c00;
      font-size: 13px;
    }

    .hq-warning mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .settings-note {
      color: rgba(0,0,0,0.6);
      font-size: 14px;
      margin: 10px 0;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    mat-dialog-title mat-icon {
      color: #1976d2;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    mat-divider {
      margin: 20px 0;
    }

    mat-icon[matPrefix] {
      margin-right: 8px;
    }

    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
      }
      
      .medical-provider-form {
        min-width: auto;
        width: 100%;
      }
    }
  `]
})
export class BranchDialogComponent implements OnInit {
  branchForm: FormGroup;
  checking = false;
  detectingLocation = false;
  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<BranchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BranchDialogData
  ) {
    this.branchForm = this.createForm();
  }

  ngOnInit() {
    if (this.data.mode === 'edit' && this.data.medicalProvider) {
      this.populateForm(this.data.medicalProvider);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      code: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9]+$/)
      ]],
      name: ['', Validators.required],
      city: ['', Validators.required],
      address: [''],
      phoneNumber: [''],
      email: ['', Validators.email],
      latitude: [null, [
        Validators.min(-90),
        Validators.max(90)
      ]],
      longitude: [null, [
        Validators.min(-180),
        Validators.max(180)
      ]],
      active: [true],
      isHeadquarters: [false]
    });
  }

  populateForm(medicalProvider: any) {
    this.branchForm.patchValue({
      code: medicalProvider.code,
      name: medicalProvider.name,
      city: medicalProvider.city,
      address: medicalProvider.address,
      phoneNumber: medicalProvider.phoneNumber,
      email: medicalProvider.email,
      latitude: medicalProvider.latitude,
      longitude: medicalProvider.longitude,
      active: medicalProvider.active,
      isHeadquarters: medicalProvider.isHeadquarters || false
    });
  }

  isHeadquartersDisabled(): boolean {
    // In edit mode, if this medical provider is already headquarters, keep it enabled but checked
    if (this.data.mode === 'edit' && this.data.medicalProvider?.isHeadquarters) {
      return false; // Allow unchecking headquarters
    }
    // If another medical provider is headquarters and this isn't it, allow changing
    return false;
  }

  getHeadquartersTooltip(): string {
    if (this.data.mode === 'edit' && this.data.medicalProvider?.isHeadquarters) {
      return 'This medical provider is currently the headquarters';
    }
    if (this.data.hasHeadquarters) {
      return 'Another medical provider is currently set as headquarters. Selecting this will change the headquarters.';
    }
    return 'Set this medical provider as the main headquarters';
  }

  getHeadquartersHint(): string {
    if (this.data.mode === 'edit' && this.data.medicalProvider?.isHeadquarters) {
      return 'Current headquarters medical provider with administrative privileges';
    }
    if (this.data.hasHeadquarters) {
      return 'Only one medical provider can be headquarters at a time';
    }
    return 'Main medical provider with administrative privileges';
  }

  showHeadquartersWarning(): boolean {
    return this.branchForm.get('isHeadquarters')?.value && 
           this.data.hasHeadquarters && 
           (!this.data.medicalProvider || !this.data.medicalProvider.isHeadquarters);
  }

  detectLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    this.detectingLocation = true;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.branchForm.patchValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        this.detectingLocation = false;
      },
      (error) => {
        console.error('Error detecting location:', error);
        alert('Could not detect your location. Please enter manually.');
        this.detectingLocation = false;
      }
    );
  }

  async checkCodeAvailability(code: string): Promise<boolean> {
    // In real implementation, check with backend
    return true;
  }

  async save() {
    if (!this.branchForm.valid) return;

    const formData = this.branchForm.value;

    // Check code availability for new medical-providers
    if (this.data.mode === 'create') {
      this.checking = true;
      const isAvailable = await this.checkCodeAvailability(formData.code);
      this.checking = false;
      
      if (!isAvailable) {
        this.branchForm.get('code')?.setErrors({ notAvailable: true });
        return;
      }
    }

    // If unchecking headquarters in edit mode, confirm
    if (this.data.mode === 'edit' && 
        this.data.medicalProvider?.isHeadquarters && 
        !formData.isHeadquarters) {
      if (!confirm('Removing headquarters status from this medical provider. Are you sure?')) {
        return;
      }
    }

    this.dialogRef.close(formData);
  }

  cancel() {
    this.dialogRef.close();
  }
}