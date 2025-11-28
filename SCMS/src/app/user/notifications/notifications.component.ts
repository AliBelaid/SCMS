import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'claim' | 'payment' | 'system';
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

interface NotificationSettings {
  email: {
    claimUpdates: boolean;
    paymentAlerts: boolean;
    systemMaintenance: boolean;
    promotions: boolean;
    securityAlerts: boolean;
  };
  sms: {
    claimApprovals: boolean;
    paymentConfirmations: boolean;
    emergencyAlerts: boolean;
  };
  push: {
    realTimeUpdates: boolean;
    dailySummary: boolean;
    weeklyReports: boolean;
  };
  preferences: {
    frequency: 'immediate' | 'daily' | 'weekly';
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  };
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="notifications-container">
      <div class="header">
        <button mat-icon-button class="back-button" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Notifications</h1>
        <div class="header-actions">
          <button mat-icon-button [matMenuTriggerFor]="actionsMenu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #actionsMenu="matMenu">
            <button mat-menu-item (click)="markAllAsRead()">
              <mat-icon>done_all</mat-icon>
              <span>Mark all as read</span>
            </button>
            <button mat-menu-item (click)="clearAllNotifications()">
              <mat-icon>clear_all</mat-icon>
              <span>Clear all</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <mat-tab-group class="notifications-tabs" animationDuration="300ms">
        <!-- Notifications List -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>notifications</mat-icon>
            <span [matBadge]="unreadCount" [matBadgeHidden]="unreadCount === 0" matBadgeColor="warn">
              Notifications
            </span>
          </ng-template>
          
          <div class="notifications-content">
                         <div class="filters">
               <mat-chip-set>
                 <mat-chip-option *ngFor="let filter of availableFilters" 
                                  [selected]="selectedFilters.includes(filter.value)"
                                  (click)="toggleFilter(filter.value)">
                   {{filter.label}}
                 </mat-chip-option>
               </mat-chip-set>
             </div>

            <div class="notifications-list">
              <mat-card *ngFor="let notification of filteredNotifications; trackBy: trackNotification"
                       class="notification-card"
                       [class.unread]="!notification.read"
                       [class.high-priority]="notification.priority === 'high'"
                       (click)="markAsRead(notification)">
                
                <div class="notification-content">
                  <div class="notification-icon">
                    <mat-icon [color]="getNotificationColor(notification.type)">
                      {{getNotificationIcon(notification.type)}}
                    </mat-icon>
                    <div *ngIf="!notification.read" class="unread-indicator"></div>
                  </div>

                  <div class="notification-body">
                    <div class="notification-header">
                      <h3 class="notification-title">{{notification.title}}</h3>
                      <div class="notification-meta">
                        <mat-chip class="priority-chip" [class.high-priority-chip]="notification.priority === 'high'">
                          {{notification.priority | titlecase}}
                        </mat-chip>
                        <span class="timestamp">{{formatTimestamp(notification.timestamp)}}</span>
                      </div>
                    </div>
                    
                    <p class="notification-message">{{notification.message}}</p>
                    
                    <div class="notification-actions" *ngIf="notification.actionRequired">
                      <button mat-stroked-button color="primary" (click)="handleNotificationAction(notification, $event)">
                        Take Action
                      </button>
                    </div>
                  </div>

                  <div class="notification-menu">
                    <button mat-icon-button [matMenuTriggerFor]="notificationMenu" (click)="$event.stopPropagation()">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #notificationMenu="matMenu">
                      <button mat-menu-item (click)="markAsRead(notification)" *ngIf="!notification.read">
                        <mat-icon>done</mat-icon>
                        <span>Mark as read</span>
                      </button>
                      <button mat-menu-item (click)="markAsUnread(notification)" *ngIf="notification.read">
                        <mat-icon>mark_email_unread</mat-icon>
                        <span>Mark as unread</span>
                      </button>
                      <button mat-menu-item (click)="deleteNotification(notification)">
                        <mat-icon>delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </div>
                </div>
              </mat-card>

              <div *ngIf="filteredNotifications.length === 0" class="empty-state">
                <mat-icon class="empty-icon">notifications_none</mat-icon>
                <h3>No notifications</h3>
                <p>You're all caught up! New notifications will appear here.</p>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Notification Settings -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>settings</mat-icon>
            Settings
          </ng-template>
          
          <div class="settings-content">
            <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
              <!-- Email Notifications -->
              <mat-card class="settings-section">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>email</mat-icon>
                    Email Notifications
                  </mat-card-title>
                  <mat-card-subtitle>Manage what emails you receive</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content formGroupName="email">
                  <div class="settings-list">
                    <mat-slide-toggle formControlName="claimUpdates">
                      <div class="toggle-content">
                        <div class="toggle-title">Claim Updates</div>
                        <div class="toggle-description">Notifications about claim status changes</div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="paymentAlerts">
                      <div class="toggle-content">
                        <div class="toggle-title">Payment Alerts</div>
                        <div class="toggle-description">Notifications about payments and reimbursements</div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="systemMaintenance">
                      <div class="toggle-content">
                        <div class="toggle-title">System Maintenance</div>
                        <div class="toggle-description">Important system updates and maintenance notices</div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="promotions">
                      <div class="toggle-content">
                        <div class="toggle-title">Promotions & Offers</div>
                        <div class="toggle-description">Special offers and promotional content</div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="securityAlerts">
                      <div class="toggle-content">
                        <div class="toggle-title">Security Alerts</div>
                        <div class="toggle-description">Important security-related notifications</div>
                      </div>
                    </mat-slide-toggle>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- SMS Notifications -->
              <mat-card class="settings-section">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>sms</mat-icon>
                    SMS Notifications
                  </mat-card-title>
                  <mat-card-subtitle>Text message alerts for urgent matters</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content formGroupName="sms">
                  <div class="settings-list">
                    <mat-slide-toggle formControlName="claimApprovals">
                      <div class="toggle-content">
                        <div class="toggle-title">Claim Approvals</div>
                        <div class="toggle-description">SMS when claims are approved or rejected</div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="paymentConfirmations">
                      <div class="toggle-content">
                        <div class="toggle-title">Payment Confirmations</div>
                        <div class="toggle-description">SMS confirmation for processed payments</div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="emergencyAlerts">
                      <div class="toggle-content">
                        <div class="toggle-title">Emergency Alerts</div>
                        <div class="toggle-description">Critical security and system alerts</div>
                      </div>
                    </mat-slide-toggle>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Push Notifications -->
              <mat-card class="settings-section">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>notifications_active</mat-icon>
                    Push Notifications
                  </mat-card-title>
                  <mat-card-subtitle>Real-time notifications in your browser</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content formGroupName="push">
                  <div class="settings-list">
                    <mat-slide-toggle formControlName="realTimeUpdates">
                      <div class="toggle-content">
                        <div class="toggle-title">Real-time Updates</div>
                        <div class="toggle-description">Instant notifications for important events</div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="dailySummary">
                      <div class="toggle-content">
                        <div class="toggle-title">Daily Summary</div>
                        <div class="toggle-description">End-of-day summary of activities</div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="weeklyReports">
                      <div class="toggle-content">
                        <div class="toggle-title">Weekly Reports</div>
                        <div class="toggle-description">Weekly activity and analytics reports</div>
                      </div>
                    </mat-slide-toggle>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Preferences -->
              <mat-card class="settings-section">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>tune</mat-icon>
                    Preferences
                  </mat-card-title>
                  <mat-card-subtitle>Customize your notification experience</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content formGroupName="preferences">
                  <div class="preferences-grid">
                    <mat-form-field>
                      <mat-label>Notification Frequency</mat-label>
                      <mat-select formControlName="frequency">
                        <mat-option value="immediate">Immediate</mat-option>
                        <mat-option value="daily">Daily Digest</mat-option>
                        <mat-option value="weekly">Weekly Summary</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <div class="quiet-hours" formGroupName="quietHours">
                      <mat-slide-toggle formControlName="enabled">
                        <div class="toggle-content">
                          <div class="toggle-title">Quiet Hours</div>
                          <div class="toggle-description">Pause non-urgent notifications during specific hours</div>
                        </div>
                      </mat-slide-toggle>
                      
                      <div class="quiet-hours-times" *ngIf="settingsForm.get('preferences.quietHours.enabled')?.value">
                        <mat-form-field>
                          <mat-label>Start Time</mat-label>
                          <input matInput type="time" formControlName="startTime">
                        </mat-form-field>
                        <mat-form-field>
                          <mat-label>End Time</mat-label>
                          <input matInput type="time" formControlName="endTime">
                        </mat-form-field>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="settings-actions">
                <button mat-stroked-button type="button" (click)="resetSettings()">
                  Reset to Default
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="settingsForm.invalid">
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 1000px;
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
      flex: 1;
      margin: 0;
      font-size: 28px;
      font-weight: 500;
    }

    .notifications-tabs {
      width: 100%;
    }

    .notifications-content,
    .settings-content {
      padding: 20px 0;
    }

    .filters {
      margin-bottom: 20px;
    }

    .notification-card {
      margin-bottom: 12px;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .notification-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.12);
    }

    .notification-card.unread {
      border-left: 4px solid var(--mat-primary-color);
      background-color: #f8f9ff;
    }

    .notification-card.high-priority {
      border-left-color: #f44336;
    }

    .notification-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
    }

    .notification-icon {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
    }

    .unread-indicator {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      background-color: var(--mat-primary-color);
      border-radius: 50%;
    }

    .notification-body {
      flex: 1;
      min-width: 0;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      gap: 16px;
    }

    .notification-title {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      line-height: 1.3;
    }

    .notification-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .priority-chip {
      font-size: 11px;
      height: 20px;
      min-height: 20px;
    }

    .high-priority-chip {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .timestamp {
      font-size: 12px;
      color: #666;
      white-space: nowrap;
    }

    .notification-message {
      margin: 0;
      color: #666;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notification-actions {
      margin-top: 12px;
    }

    .notification-menu {
      align-self: flex-start;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .settings-section {
      margin-bottom: 24px;
    }

    .settings-section mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .toggle-content {
      margin-left: 12px;
    }

    .toggle-title {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .toggle-description {
      font-size: 14px;
      color: #666;
      line-height: 1.3;
    }

    .preferences-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      align-items: start;
    }

    .quiet-hours {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .quiet-hours-times {
      display: flex;
      gap: 12px;
      margin-left: 52px;
    }

    .settings-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .notifications-container {
        padding: 16px;
      }

      .notification-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .notification-meta {
        align-self: flex-start;
      }

      .preferences-grid {
        grid-template-columns: 1fr;
      }

      .quiet-hours-times {
        margin-left: 0;
      }

      .settings-actions {
        flex-direction: column;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  settingsForm: FormGroup;
  selectedFilters: string[] = ['all'];
  
  availableFilters = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'claim', label: 'Claims' },
    { value: 'payment', label: 'Payments' },
    { value: 'system', label: 'System' },
    { value: 'high', label: 'High Priority' }
  ];
  
  notifications: Notification[] = [
    {
      id: '1',
      title: 'Claim Approved',
      message: 'Your claim for medical consultation has been approved. Payment will be processed within 3-5 business days.',
      type: 'success',
      timestamp: new Date('2024-01-15T10:30:00'),
      read: false,
      actionRequired: false,
      priority: 'high',
      category: 'claim'
    },
    {
      id: '2',
      title: 'Documentation Required',
      message: 'Additional documents needed for claim #CLM-2024-001. Please upload the missing medical reports.',
      type: 'warning',
      timestamp: new Date('2024-01-14T15:45:00'),
      read: false,
      actionRequired: true,
      actionUrl: '/claims/CLM-2024-001',
      priority: 'high',
      category: 'claim'
    },
    {
      id: '3',
      title: 'Payment Processed',
      message: 'Payment of $150.00 has been processed for claim #CLM-2024-002.',
      type: 'payment',
      timestamp: new Date('2024-01-13T09:15:00'),
      read: true,
      actionRequired: false,
      priority: 'medium',
      category: 'payment'
    },
    {
      id: '4',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on January 20th from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.',
      type: 'info',
      timestamp: new Date('2024-01-12T11:20:00'),
      read: false,
      actionRequired: false,
      priority: 'medium',
      category: 'system'
    },
    {
      id: '5',
      title: 'Monthly Benefits Summary',
      message: 'Your monthly benefits summary is now available. You have utilized 65% of your annual limit.',
      type: 'info',
      timestamp: new Date('2024-01-01T08:00:00'),
      read: true,
      actionRequired: false,
      priority: 'low',
      category: 'benefits'
    }
  ];

  defaultSettings: NotificationSettings = {
    email: {
      claimUpdates: true,
      paymentAlerts: true,
      systemMaintenance: true,
      promotions: false,
      securityAlerts: true
    },
    sms: {
      claimApprovals: true,
      paymentConfirmations: true,
      emergencyAlerts: true
    },
    push: {
      realTimeUpdates: true,
      dailySummary: false,
      weeklyReports: true
    },
    preferences: {
      frequency: 'immediate',
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      }
    }
  };

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.createSettingsForm();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  get filteredNotifications(): Notification[] {
    if (this.selectedFilters.includes('all')) {
      return this.notifications;
    }

    return this.notifications.filter(notification => {
      if (this.selectedFilters.includes('unread') && !notification.read) return true;
      if (this.selectedFilters.includes(notification.type)) return true;
      if (this.selectedFilters.includes(notification.category)) return true;
      if (this.selectedFilters.includes('high') && notification.priority === 'high') return true;
      return false;
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  private createSettingsForm(): FormGroup {
    return this.fb.group({
      email: this.fb.group({
        claimUpdates: [true],
        paymentAlerts: [true],
        systemMaintenance: [true],
        promotions: [false],
        securityAlerts: [true]
      }),
      sms: this.fb.group({
        claimApprovals: [true],
        paymentConfirmations: [true],
        emergencyAlerts: [true]
      }),
      push: this.fb.group({
        realTimeUpdates: [true],
        dailySummary: [false],
        weeklyReports: [true]
      }),
      preferences: this.fb.group({
        frequency: ['immediate'],
        quietHours: this.fb.group({
          enabled: [false],
          startTime: ['22:00'],
          endTime: ['08:00']
        })
      })
    });
  }

  private loadSettings(): void {
    // Load settings from local storage or API
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.settingsForm.patchValue(settings);
    } else {
      this.settingsForm.patchValue(this.defaultSettings);
    }
  }

  trackNotification(index: number, notification: Notification): string {
    return notification.id;
  }

  getNotificationIcon(type: string): string {
    const iconMap = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
      claim: 'assignment',
      payment: 'payment',
      system: 'settings'
    };
    return iconMap[type] || 'notifications';
  }

  getNotificationColor(type: string): string {
    const colorMap = {
      info: 'primary',
      success: 'primary',
      warning: 'warn',
      error: 'warn',
      claim: 'primary',
      payment: 'primary',
      system: 'primary'
    };
    return colorMap[type] || 'primary';
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  markAsUnread(notification: Notification): void {
    notification.read = false;
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.snackBar.open('All notifications marked as read', 'Close', { duration: 3000 });
  }

  deleteNotification(notification: Notification): void {
    const index = this.notifications.findIndex(n => n.id === notification.id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.snackBar.open('Notification deleted', 'Close', { duration: 3000 });
    }
  }

  clearAllNotifications(): void {
    this.notifications.length = 0;
    this.snackBar.open('All notifications cleared', 'Close', { duration: 3000 });
  }

  handleNotificationAction(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (notification.actionUrl) {
      // Navigate to action URL
      console.log('Navigate to:', notification.actionUrl);
    }
    this.markAsRead(notification);
  }

  saveSettings(): void {
    const settings = this.settingsForm.value;
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    this.snackBar.open('Settings saved successfully!', 'Close', { duration: 3000 });
  }

  resetSettings(): void {
    this.settingsForm.patchValue(this.defaultSettings);
    this.snackBar.open('Settings reset to default', 'Close', { duration: 3000 });
  }

     toggleFilter(filterValue: string): void {
     const index = this.selectedFilters.indexOf(filterValue);
     if (index > -1) {
       this.selectedFilters.splice(index, 1);
     } else {
       this.selectedFilters.push(filterValue);
     }
     
     // Ensure 'all' is exclusive
     if (filterValue === 'all' && index === -1) {
       this.selectedFilters = ['all'];
     } else if (filterValue !== 'all' && this.selectedFilters.includes('all')) {
       const allIndex = this.selectedFilters.indexOf('all');
       this.selectedFilters.splice(allIndex, 1);
     }
   }

   goBack(): void {
     window.history.back();
   }
 } 