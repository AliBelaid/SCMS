import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/assets/environments/environment' ;

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  address: string;
  avatar: string;
  roles: string[];
  isActive: boolean;
  lastLogin: Date;
  joinDate: Date;
  userType: string;
  profileCompletion: number;
}

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

@Component({
  selector: 'app-enhanced-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  template: `
    <div class="enhanced-profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar-container">
            <img [src]="user?.avatar || 'assets/img/avatars/default-avatar.png'" 
                 [alt]="user?.displayName" class="avatar-image">
            <button mat-fab class="avatar-edit-btn" color="primary" (click)="changeAvatar()">
              <mat-icon>camera_alt</mat-icon>
            </button>
          </div>
        </div>
        
        <div class="user-info">
          <h1 class="user-name">{{ user?.displayName || 'Loading...' }}</h1>
          <p class="user-email">{{ user?.email }}</p>
          <div class="user-roles">
            <mat-chip-set>
              <mat-chip *ngFor="let role of user?.roles" [ngClass]="getRoleChipClass(role)">
                <mat-icon>{{ getRoleIcon(role) }}</mat-icon>
                {{ role | translate }}
              </mat-chip>
            </mat-chip-set>
          </div>
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-label">{{ 'DAYS_ACTIVE' | translate }}</span>
              <span class="stat-value">{{ getDaysActive() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ 'LAST_LOGIN' | translate }}</span>
              <span class="stat-value">{{ user?.lastLogin | date:'short' }}</span>
            </div>
          </div>
        </div>

        <div class="profile-actions">
          <button mat-raised-button color="primary" (click)="editProfile()">
            <mat-icon>edit</mat-icon>
            {{ 'EDIT_PROFILE' | translate }}
          </button>
          <button mat-stroked-button (click)="changePassword()">
            <mat-icon>lock</mat-icon>
            {{ 'CHANGE_PASSWORD' | translate }}
          </button>
          <button mat-stroked-button (click)="exportData()">
            <mat-icon>download</mat-icon>
            {{ 'EXPORT_DATA' | translate }}
          </button>
          <button mat-stroked-button color="warn" (click)="signOut()">
            <mat-icon>logout</mat-icon>
            {{ 'SIGN_OUT' | translate }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner></mat-spinner>
        <p>{{ 'LOADING_PROFILE' | translate }}</p>
      </div>

      <!-- Error State -->
      <div class="error-container" *ngIf="error && !loading">
        <mat-icon class="error-icon">error</mat-icon>
        <h3>{{ 'USER_NOT_FOUND' | translate }}</h3>
        <p>{{ 'ERROR_LOADING_USER' | translate }}</p>
        <button mat-raised-button color="primary" (click)="loadUserProfile()">
          <mat-icon>refresh</mat-icon>
          {{ 'RETRY' | translate }}
        </button>
        <button mat-button (click)="goBack()">
          {{ 'GO_BACK' | translate }}
        </button>
      </div>

      <!-- Profile Content -->
      <div class="profile-content" *ngIf="user && !loading && !error">
        <mat-tab-group class="profile-tabs" [selectedIndex]="selectedTabIndex" (selectedTabChange)="onTabChange($event)">
          
          <!-- Overview Tab -->
          <mat-tab label="{{ 'OVERVIEW' | translate }}">
            <div class="tab-content">
              <div class="overview-grid">
                <!-- Quick Stats -->
                <mat-card class="stats-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'PROFILE_STATS' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="profile-completion">
                      <span class="completion-label">{{ 'PROFILE_COMPLETION' | translate }}</span>
                      <div class="completion-bar">
                        <div class="completion-fill" [style.width.%]="user.profileCompletion"></div>
                      </div>
                      <span class="completion-value">{{ user.profileCompletion }}%</span>
                    </div>
                    
                    <div class="quick-stats">
                      <div class="quick-stat">
                        <mat-icon>person</mat-icon>
                        <span>{{ user.userType | translate }}</span>
                      </div>
                      <div class="quick-stat">
                        <mat-icon>date_range</mat-icon>
                        <span>{{ user.joinDate | date:'mediumDate' }}</span>
                      </div>
                      <div class="quick-stat" [ngClass]="{ 'status-active': user.isActive, 'status-inactive': !user.isActive }">
                        <mat-icon>{{ user.isActive ? 'check_circle' : 'cancel' }}</mat-icon>
                        <span>{{ (user.isActive ? 'ACTIVE' : 'INACTIVE') | translate }}</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Role-based Quick Actions -->
                <mat-card class="quick-actions-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'QUICK_ACTIONS' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="action-buttons">
                      <ng-container *ngIf="isAdmin()">
                        <button mat-stroked-button (click)="navigateTo('/admin/dashboard')">
                          <mat-icon>admin_panel_settings</mat-icon>
                          {{ 'ADMIN_PANEL' | translate }}
                        </button>
                      </ng-container>
                      
                      <ng-container *ngIf="isCompanyUser()">
                        <button mat-stroked-button (click)="navigateTo('/app/insurance/company/dashboard')">
                          <mat-icon>business</mat-icon>
                          {{ 'COMPANY_MANAGEMENT' | translate }}
                        </button>
                      </ng-container>
                      
                      <ng-container *ngIf="isProvider()">
                        <button mat-stroked-button (click)="navigateTo('/app/insurance/provider/dashboard')">
                          <mat-icon>medical_services</mat-icon>
                          {{ 'PROVIDER_TOOLS' | translate }}
                        </button>
                      </ng-container>
                      
                      <ng-container *ngIf="isSubscriber()">
                        <button mat-stroked-button (click)="navigateTo('/app/insurance/subscriber/dashboard')">
                          <mat-icon>card_membership</mat-icon>
                          {{ 'SUBSCRIBER_PORTAL' | translate }}
                        </button>
                      </ng-container>
                      
                      <ng-container *ngIf="isMedicalStaff()">
                        <button mat-stroked-button (click)="navigateTo('/queue')">
                          <mat-icon>queue</mat-icon>
                          {{ 'MEDICAL_QUEUE' | translate }}
                        </button>
                      </ng-container>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Activity Tab -->
          <mat-tab label="{{ 'ACTIVITY' | translate }}">
            <div class="tab-content">
              <mat-card class="activity-card">
                <mat-card-header>
                  <mat-card-title>{{ 'RECENT_ACTIVITY' | translate }}</mat-card-title>
                  <button mat-icon-button (click)="refreshActivity()">
                    <mat-icon>refresh</mat-icon>
                  </button>
                </mat-card-header>
                <mat-card-content>
                  <mat-list class="activity-list" *ngIf="activityLogs.length > 0; else noActivity">
                    <mat-list-item *ngFor="let activity of activityLogs; trackBy: trackActivity">
                      <mat-icon matListItemIcon [ngClass]="getActivityIcon(activity.action)">
                        {{ getActivityIcon(activity.action) }}
                      </mat-icon>
                      <div matListItemTitle class="activity-title">{{ activity.description }}</div>
                      <div matListItemLine class="activity-meta">
                        <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
                        <span class="activity-ip">{{ activity.ipAddress }}</span>
                      </div>
                    </mat-list-item>
                  </mat-list>
                  
                  <ng-template #noActivity>
                    <div class="no-activity">
                      <mat-icon>history</mat-icon>
                      <p>{{ 'NO_RECENT_ACTIVITY' | translate }}</p>
                    </div>
                  </ng-template>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Settings Tab (Only for Admin and Company users) -->
          <mat-tab label="{{ 'SETTINGS' | translate }}" *ngIf="canAccessSettings()">
            <div class="tab-content">
              <form [formGroup]="settingsForm" class="settings-form">
                <mat-card class="settings-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'PROFILE_SETTINGS' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>{{ 'FIRST_NAME' | translate }}</mat-label>
                        <input matInput formControlName="firstName">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>{{ 'LAST_NAME' | translate }}</mat-label>
                        <input matInput formControlName="lastName">
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>{{ 'EMAIL' | translate }}</mat-label>
                        <input matInput type="email" formControlName="email">
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>{{ 'PHONE' | translate }}</mat-label>
                        <input matInput formControlName="phone">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>{{ 'LANGUAGE' | translate }}</mat-label>
                        <mat-select formControlName="language">
                          <mat-option value="en">English</mat-option>
                          <mat-option value="ar">العربية</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>{{ 'ADDRESS' | translate }}</mat-label>
                        <textarea matInput formControlName="address" rows="3"></textarea>
                      </mat-form-field>
                    </div>

                    <div class="form-actions">
                      <button mat-raised-button color="primary" (click)="saveSettings()">
                        <mat-icon>save</mat-icon>
                        {{ 'SAVE' | translate }}
                      </button>
                      <button mat-button (click)="resetSettings()">
                        {{ 'RESET' | translate }}
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>
              </form>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .enhanced-profile-container {
      width: 100%;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 0;
    }

    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px;
      display: flex;
      align-items: center;
      gap: 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .avatar-section {
      flex-shrink: 0;
    }

    .avatar-container {
      position: relative;
      display: inline-block;
    }

    .avatar-image {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .avatar-edit-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.9);
      color: #333;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 300;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .user-email {
      margin: 0 0 16px 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .user-roles {
      margin-bottom: 24px;
    }

    .user-roles mat-chip {
      margin-right: 8px;
      margin-bottom: 8px;
    }

    .role-admin {
      background-color: #f44336;
      color: white;
    }

    .role-company {
      background-color: #ff9800;
      color: white;
    }

    .role-provider {
      background-color: #4caf50;
      color: white;
    }

    .role-subscriber {
      background-color: #2196f3;
      color: white;
    }

    .profile-stats {
      display: flex;
      gap: 32px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-label {
      font-size: 0.875rem;
      opacity: 0.8;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .profile-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex-shrink: 0;
    }

    .profile-actions button {
      min-width: 160px;
      color: white;
      border-color: rgba(255, 255, 255, 0.5);
    }

    .profile-content {
      background: white;
      margin: 0 32px 32px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .profile-tabs {
      min-height: 500px;
    }

    .tab-content {
      padding: 32px;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .stats-card, .quick-actions-card, .activity-card, .settings-card {
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .profile-completion {
      margin-bottom: 24px;
    }

    .completion-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #666;
    }

    .completion-bar {
      width: 100%;
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .completion-fill {
      height: 100%;
      background: linear-gradient(90deg, #4caf50, #8bc34a);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .completion-value {
      font-weight: 500;
      color: #4caf50;
    }

    .quick-stats {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .quick-stat {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .quick-stat mat-icon {
      color: #667eea;
    }

    .status-active {
      background: #e8f5e8;
    }

    .status-active mat-icon {
      color: #4caf50;
    }

    .status-inactive {
      background: #ffebee;
    }

    .status-inactive mat-icon {
      color: #f44336;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .action-buttons button {
      justify-content: flex-start;
    }

    .activity-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .activity-title {
      font-weight: 500;
    }

    .activity-meta {
      display: flex;
      gap: 16px;
      font-size: 0.875rem;
      color: #666;
    }

    .no-activity {
      text-align: center;
      padding: 48px;
      color: #666;
    }

    .no-activity mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .settings-form {
      max-width: 600px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      text-align: center;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .enhanced-profile-container {
        padding: 0;
      }

      .profile-header {
        flex-direction: column;
        text-align: center;
        padding: 24px 16px;
      }

      .profile-content {
        margin: 0 16px 16px;
      }

      .tab-content {
        padding: 16px;
      }

      .overview-grid {
        grid-template-columns: 1fr;
      }

      .profile-stats {
        justify-content: center;
      }

      .form-row {
        flex-direction: column;
      }
    }
  `]
})
export class EnhancedUserProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  user: UserProfile | null = null;
  activityLogs: ActivityLog[] = [];
  loading = true;
  error = false;
  selectedTabIndex = 0;

  settingsForm: FormGroup;

  constructor() {
    this.settingsForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      language: ['en'],
      address: ['']
    });
  }

  ngOnInit() {
    this.loadUserProfile();
    this.loadActivityLogs();
  }

  loadUserProfile() {
    this.loading = true;
    this.error = false;
    
    // Mock data for demonstration - replace with actual API call
    setTimeout(() => {
      this.user = {
        id: 1,
        username: 'admin',
        email: 'admin@medisoft.com',
        firstName: 'Admin',
        lastName: 'User',
        displayName: 'Admin User',
        phone: '+1234567890',
        address: '123 Main St, City, Country',
        avatar: 'assets/img/avatars/admin-avatar.png',
        roles: ['Admin', 'TPA_Admin'],
        isActive: true,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        userType: 'Administrator',
        profileCompletion: 85
      };

      this.settingsForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        phone: this.user.phone,
        language: 'en',
        address: this.user.address
      });

      this.loading = false;
    }, 1000);
  }

  loadActivityLogs() {
    // Mock data for demonstration - replace with actual API call
    this.activityLogs = [
      {
        id: 1,
        action: 'login',
        description: 'User logged in successfully',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0'
      },
      {
        id: 2,
        action: 'profile_update',
        description: 'Profile information updated',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0'
      },
      {
        id: 3,
        action: 'password_change',
        description: 'Password changed successfully',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0'
      }
    ];
  }

  getDaysActive(): number {
    if (!this.user?.joinDate) return 0;
    const now = new Date();
    const joinDate = new Date(this.user.joinDate);
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getRoleChipClass(role: string): string {
    return `role-${role.toLowerCase().replace('_', '-')}`;
  }

  getRoleIcon(role: string): string {
    const roleIcons: { [key: string]: string } = {
      'Admin': 'admin_panel_settings',
      'TPA_Admin': 'business_center',
      'Company': 'business',
      'Provider': 'medical_services',
      'Subscriber': 'card_membership',
      'Doctor': 'local_hospital',
      'Patient': 'person'
    };
    return roleIcons[role] || 'person';
  }

  getActivityIcon(action: string): string {
    const actionIcons: { [key: string]: string } = {
      'login': 'login',
      'logout': 'logout',
      'profile_update': 'edit',
      'password_change': 'lock',
      'export': 'download',
      'settings_change': 'settings'
    };
    return actionIcons[action] || 'info';
  }

  isAdmin(): boolean {
    return this.user?.roles.includes('Admin') || false;
  }

  isCompanyUser(): boolean {
    return this.user?.roles.includes('Company') || this.user?.roles.includes('TPA_Admin') || false;
  }

  isProvider(): boolean {
    return this.user?.roles.includes('Provider') || this.user?.roles.includes('Doctor') || false;
  }

  isSubscriber(): boolean {
    return this.user?.roles.includes('Subscriber') || this.user?.roles.includes('Patient') || false;
  }

  isMedicalStaff(): boolean {
    return this.user?.roles.includes('Doctor') || this.user?.roles.includes('MedicalTechnician') || false;
  }

  canAccessSettings(): boolean {
    return this.isAdmin() || this.isCompanyUser();
  }

  onTabChange(event: any) {
    this.selectedTabIndex = event.index;
  }

  trackActivity(index: number, activity: ActivityLog): number {
    return activity.id;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  editProfile() {
    this.selectedTabIndex = 2; // Switch to settings tab
  }

  changePassword() {
    this.snackBar.open('Change password functionality coming soon', 'Close', { duration: 3000 });
  }

  changeAvatar() {
    this.snackBar.open('Avatar change functionality coming soon', 'Close', { duration: 3000 });
  }

  exportData() {
    this.snackBar.open('Data export functionality coming soon', 'Close', { duration: 3000 });
  }

  signOut() {
    this.router.navigate(['/login']);
  }

  saveSettings() {
    if (this.settingsForm.valid) {
      this.snackBar.open('Settings saved successfully', 'Close', { duration: 3000 });
    }
  }

  resetSettings() {
    this.settingsForm.reset();
    if (this.user) {
      this.settingsForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        phone: this.user.phone,
        language: 'en',
        address: this.user.address
      });
    }
  }

  refreshActivity() {
    this.loadActivityLogs();
    this.snackBar.open('Activity refreshed', 'Close', { duration: 2000 });
  }

  goBack() {
    this.router.navigate(['/app']);
  }
}