import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  VisitNotification,
  NotificationType,
  SecurityAlert,
  AlertSeverity
} from '../models/visitor-management.model';

@Injectable({
  providedIn: 'root'
})
export class VisitorNotificationService {
  private notifications = new BehaviorSubject<VisitNotification[]>([]);
  private unreadCount = new BehaviorSubject<number>(0);

  notifications$ = this.notifications.asObservable();
  unreadCount$ = this.unreadCount.asObservable();

  // Configuration
  private readonly maxNotifications = 50;
  private readonly snackBarDuration = 5000;

  constructor(private snackBar: MatSnackBar) {
    this.loadNotificationsFromStorage();
  }

  // ==================== Toast Notifications (SnackBar) ====================

  /**
   * Show success message
   */
  showSuccess(message: string, action: string = 'إغلاق', duration?: number): void {
    const config: MatSnackBarConfig = {
      duration: duration || this.snackBarDuration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    };
    this.snackBar.open(message, action, config);
  }

  /**
   * Show error message
   */
  showError(message: string, action: string = 'إغلاق', duration?: number): void {
    const config: MatSnackBarConfig = {
      duration: duration || this.snackBarDuration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    };
    this.snackBar.open(message, action, config);
  }

  /**
   * Show warning message
   */
  showWarning(message: string, action: string = 'إغلاق', duration?: number): void {
    const config: MatSnackBarConfig = {
      duration: duration || this.snackBarDuration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-warning']
    };
    this.snackBar.open(message, action, config);
  }

  /**
   * Show info message
   */
  showInfo(message: string, action: string = 'إغلاق', duration?: number): void {
    const config: MatSnackBarConfig = {
      duration: duration || this.snackBarDuration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-info']
    };
    this.snackBar.open(message, action, config);
  }

  /**
   * Show custom snackbar
   */
  showCustom(
    message: string,
    action: string = 'إغلاق',
    panelClass: string[] = [],
    duration?: number
  ): void {
    const config: MatSnackBarConfig = {
      duration: duration || this.snackBarDuration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: panelClass
    };
    this.snackBar.open(message, action, config);
  }

  // ==================== Persistent Notifications ====================

  /**
   * Add notification to the list
   */
  addNotification(notification: VisitNotification): void {
    const currentNotifications = this.notifications.value;
    
    // Add new notification at the beginning
    const updatedNotifications = [notification, ...currentNotifications];
    // Limit to max notifications
    if (updatedNotifications.length > this.maxNotifications) {
      updatedNotifications.splice(this.maxNotifications);
    }

    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();

    // Also show as snackbar based on type
    this.showNotificationAsSnackBar(notification);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notifications = this.notifications.value.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    this.notifications.next(notifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    const notifications = this.notifications.value.map(n => ({ ...n, isRead: true }));
    
    this.notifications.next(notifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  /**
   * Remove notification
   */
  removeNotification(notificationId: string): void {
    const notifications = this.notifications.value.filter(n => n.id !== notificationId);
    
    this.notifications.next(notifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.notifications.next([]);
    this.unreadCount.next(0);
    this.clearNotificationsFromStorage();
  }

  /**
   * Get all notifications
   */
  getNotifications(): VisitNotification[] {
    return this.notifications.value;
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): VisitNotification[] {
    return this.notifications.value.filter(n => !n.isRead);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.unreadCount.value;
  }

  // ==================== Notification by Type ====================

  /**
   * Add visit created notification
   */
  notifyVisitCreated(visitorName: string, visitNumber: string): void {
    const notification: VisitNotification = {
      id: `visit-created-${Date.now()}`,
      type: NotificationType.VisitCreated,
      title: 'زيارة جديدة',
      message: `تم تسجيل دخول ${visitorName} - رقم الزيارة: ${visitNumber}`,
      visit: {} as any,
      timestamp: new Date(),
      isRead: false
    };
    this.addNotification(notification);
  }

  /**
   * Add visit completed notification
   */
  notifyVisitCompleted(visitorName: string, duration: string): void {
    const notification: VisitNotification = {
      id: `visit-completed-${Date.now()}`,
      type: NotificationType.VisitCompleted,
      title: 'اكتمال الزيارة',
      message: `تم تسجيل خروج ${visitorName} - مدة الزيارة: ${duration}`,
      visit: {} as any,
      timestamp: new Date(),
      isRead: false
    };
    this.addNotification(notification);
  }

  /**
   * Add visitor blocked notification
   */
  notifyVisitorBlocked(visitorName: string, reason: string): void {
    const notification: VisitNotification = {
      id: `visitor-blocked-${Date.now()}`,
      type: NotificationType.VisitorBlocked,
      title: 'حظر زائر',
      message: `تم حظر ${visitorName} - السبب: ${reason}`,
      visit: {} as any,
      timestamp: new Date(),
      isRead: false
    };
    this.addNotification(notification);
  }

  /**
   * Add long stay alert
   */
  notifyLongStay(visitorName: string, duration: string): void {
    const notification: VisitNotification = {
      id: `long-stay-${Date.now()}`,
      type: NotificationType.LongStay,
      title: 'تنبيه مدة الزيارة',
      message: `الزائر ${visitorName} تجاوز المدة المتوقعة - المدة الحالية: ${duration}`,
      visit: {} as any,
      timestamp: new Date(),
      isRead: false
    };
    this.addNotification(notification);
  }

  /**
   * Add security alert notification
   */
  notifySecurityAlert(alert: SecurityAlert): void {
    const notification: VisitNotification = {
      id: `security-${alert.id}`,
      type: NotificationType.SystemAlert,
      title: this.getAlertSeverityLabel(alert.severity),
      message: alert.message,
      visit: {} as any,
      timestamp: alert.timestamp,
      isRead: false
    };
    this.addNotification(notification);
  }

  // ==================== Helpers ====================

  private showNotificationAsSnackBar(notification: VisitNotification): void {
    const message = `${notification.title}: ${notification.message}`;
    switch (notification.type) {
      case NotificationType.VisitCreated:
        this.showInfo(message);
        break;
      case NotificationType.VisitCompleted:
        this.showSuccess(message);
        break;
      case NotificationType.VisitorBlocked:
        this.showWarning(message);
        break;
      case NotificationType.LongStay:
        this.showWarning(message);
        break;
      case NotificationType.SystemAlert:
        this.showError(message);
        break;
      default:
        this.showInfo(message);
    }
  }

  private updateUnreadCount(): void {
    const count = this.notifications.value.filter(n => !n.isRead).length;
    this.unreadCount.next(count);
  }

  private getAlertSeverityLabel(severity: AlertSeverity): string {
    const labels: Record<AlertSeverity, string> = {
      [AlertSeverity.Low]: 'تنبيه منخفض',
      [AlertSeverity.Medium]: 'تنبيه متوسط',
      [AlertSeverity.High]: 'تنبيه عالي',
      [AlertSeverity.Critical]: 'تنبيه حرج'
    };
    return labels[severity] || 'تنبيه';
  }

  // ==================== Local Storage ====================

  private readonly storageKey = 'visitor_notifications';

  private loadNotificationsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const notifications = JSON.parse(stored) as VisitNotification[];
        this.notifications.next(notifications);
        this.updateUnreadCount();
      }
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
    }
  }

  private saveNotificationsToStorage(): void {
    try {
      const notifications = this.notifications.value;
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  }

  private clearNotificationsFromStorage(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing notifications from storage:', error);
    }
  }

  // ==================== Browser Notifications ====================

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Browser notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Show browser notification
   */
  async showBrowserNotification(
    title: string,
    body: string,
    icon?: string
  ): Promise<void> {
    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) {
      console.log('Browser notification permission not granted');
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: icon || 'assets/images/logos/home.png',
      badge: 'assets/images/logos/img1.png',
      dir: 'rtl',
      lang: 'ar'
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  // ==================== Sound Alerts ====================

  /**
   * Play notification sound
   */
  playNotificationSound(soundType: 'success' | 'warning' | 'error' = 'success'): void {
    try {
      const audio = new Audio(`assets/sounds/notification-${soundType}.mp3`);
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    } catch (error) {
      console.log('Error playing notification sound:', error);
    }
  }
}

