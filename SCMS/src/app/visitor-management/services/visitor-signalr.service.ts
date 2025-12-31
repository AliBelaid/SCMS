import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../assets/environments/environment';
import {
  Visit,
  VisitCreatedEvent,
  VisitUpdatedEvent,
  VisitorBlockedEvent,
  SecurityAlert,
  VisitNotification,
  NotificationType
} from '../models/visitor-management.model';

@Injectable({
  providedIn: 'root'
})
export class VisitorSignalRService {
  private hubConnection?: signalR.HubConnection;
  private connectionState = new BehaviorSubject<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected
  );

  // Event subjects
  private visitCreatedSubject = new Subject<VisitCreatedEvent>();
  private visitUpdatedSubject = new Subject<VisitUpdatedEvent>();
  private visitorBlockedSubject = new Subject<VisitorBlockedEvent>();
  private securityAlertSubject = new Subject<SecurityAlert>();
  private notificationSubject = new Subject<VisitNotification>();

  // Public observables
  connectionState$ = this.connectionState.asObservable();
  visitCreated$ = this.visitCreatedSubject.asObservable();
  visitUpdated$ = this.visitUpdatedSubject.asObservable();
  visitorBlocked$ = this.visitorBlockedSubject.asObservable();
  securityAlert$ = this.securityAlertSubject.asObservable();
  notification$ = this.notificationSubject.asObservable();

  constructor() {}

  // ==================== Connection Management ====================

  /**
   * Start SignalR connection
   */
  startConnection(token?: string): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR already connected');
      return Promise.resolve();
    }

    // Build connection
    const hubUrl = environment.signalRUrl || environment.apiUrl.replace('/api', '');
    const connectionBuilder = new signalR.HubConnectionBuilder()
      .withUrl(`${hubUrl}/notificationHub`, {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          // Exponential backoff: 0s, 2s, 10s, 30s, then 60s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          if (retryContext.previousRetryCount === 3) return 30000;
          return 60000;
        }
      })
      .configureLogging(signalR.LogLevel.Information);

    this.hubConnection = connectionBuilder.build();

    // Register event handlers
    this.registerEventHandlers();

    // Register connection lifecycle handlers
    this.registerLifecycleHandlers();

    // Start connection
    return this.hubConnection
      .start()
      .then(() => {
        console.log('✅ SignalR Connected successfully');
        this.connectionState.next(signalR.HubConnectionState.Connected);
        this.joinGroup('VisitorManagement');
      })
      .catch(error => {
        console.error('❌ SignalR Connection Error:', error);
        this.connectionState.next(signalR.HubConnectionState.Disconnected);
        throw error;
      });
  }

  /**
   * Stop SignalR connection
   */
  stopConnection(): Promise<void> {
    if (!this.hubConnection) {
      return Promise.resolve();
    }

    return this.hubConnection
      .stop()
      .then(() => {
        console.log('SignalR Disconnected');
        this.connectionState.next(signalR.HubConnectionState.Disconnected);
      })
      .catch(error => {
        console.error('Error stopping SignalR:', error);
        throw error;
      });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Get connection state
   */
  getConnectionState(): signalR.HubConnectionState {
    return this.hubConnection?.state || signalR.HubConnectionState.Disconnected;
  }

  // ==================== Event Handlers ====================

  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    // Visit Created
    this.hubConnection.on('VisitCreated', (event: VisitCreatedEvent) => {
      console.log('📥 Visit Created:', event);
      this.visitCreatedSubject.next(event);
      
      // Also emit notification
      this.notificationSubject.next({
        id: `visit-created-${event.visit.id}`,
        type: NotificationType.VisitCreated,
        title: 'زيارة جديدة',
        message: `تم تسجيل دخول ${event.visit.visitorName}`,
        visit: event.visit,
        timestamp: event.timestamp,
        isRead: false
      });
    });

    // Visit Updated
    this.hubConnection.on('VisitUpdated', (event: VisitUpdatedEvent) => {
      console.log('📝 Visit Updated:', event);
      this.visitUpdatedSubject.next(event);

      let message = '';
      switch (event.action) {
        case 'checkout':
          message = `تم تسجيل خروج ${event.visit.visitorName}`;
          break;
        case 'update':
          message = `تم تحديث زيارة ${event.visit.visitorName}`;
          break;
        case 'status_change':
          message = `تم تغيير حالة زيارة ${event.visit.visitorName}`;
          break;
      }

      this.notificationSubject.next({
        id: `visit-updated-${event.visit.id}`,
        type: NotificationType.VisitUpdated,
        title: 'تحديث الزيارة',
        message,
        visit: event.visit,
        timestamp: event.timestamp,
        isRead: false
      });
    });

    // Visitor Blocked
    this.hubConnection.on('VisitorBlocked', (event: VisitorBlockedEvent) => {
      console.log('🚫 Visitor Blocked:', event);
      this.visitorBlockedSubject.next(event);

      this.notificationSubject.next({
        id: `visitor-blocked-${event.visitorId}`,
        type: NotificationType.VisitorBlocked,
        title: 'زائر محظور',
        message: `تم حظر ${event.visitorName}: ${event.reason}`,
        visit: {} as Visit,
        timestamp: event.timestamp,
        isRead: false
      });
    });

    // Security Alert
    this.hubConnection.on('SecurityAlert', (alert: SecurityAlert) => {
      console.log('⚠️ Security Alert:', alert);
      this.securityAlertSubject.next(alert);

      this.notificationSubject.next({
        id: `security-alert-${alert.id}`,
        type: NotificationType.SystemAlert,
        title: 'تنبيه أمني',
        message: alert.message,
        visit: {} as Visit,
        timestamp: alert.timestamp,
        isRead: false
      });
    });

    // Long Stay Alert
    this.hubConnection.on('LongStayAlert', (visit: Visit) => {
      console.log('⏰ Long Stay Alert:', visit);
      
      this.notificationSubject.next({
        id: `long-stay-${visit.id}`,
        type: NotificationType.LongStay,
        title: 'تنبيه مدة الزيارة',
        message: `الزائر ${visit.visitorName} تجاوز المدة المتوقعة`,
        visit: visit,
        timestamp: new Date(),
        isRead: false
      });
    });

    // Generic Notification
    this.hubConnection.on('Notification', (notification: VisitNotification) => {
      console.log('🔔 Notification:', notification);
      this.notificationSubject.next(notification);
    });
  }

  // ==================== Lifecycle Handlers ====================

  private registerLifecycleHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.onreconnecting(error => {
      console.log('🔄 SignalR Reconnecting...', error);
      this.connectionState.next(signalR.HubConnectionState.Reconnecting);
    });

    this.hubConnection.onreconnected(connectionId => {
      console.log('✅ SignalR Reconnected:', connectionId);
      this.connectionState.next(signalR.HubConnectionState.Connected);
      // Rejoin groups after reconnection
      this.joinGroup('VisitorManagement');
    });

    this.hubConnection.onclose(error => {
      console.log('❌ SignalR Connection Closed:', error);
      this.connectionState.next(signalR.HubConnectionState.Disconnected);
    });
  }

  // ==================== Group Management ====================

  /**
   * Join a SignalR group
   */
  joinGroup(groupName: string): Promise<void> {
    if (!this.hubConnection || !this.isConnected()) {
      return Promise.reject('Not connected');
    }

    return this.hubConnection
      .invoke('JoinGroup', groupName)
      .then(() => {
        console.log(`✅ Joined group: ${groupName}`);
      })
      .catch(error => {
        console.error(`❌ Error joining group ${groupName}:`, error);
        throw error;
      });
  }

  /**
   * Leave a SignalR group
   */
  leaveGroup(groupName: string): Promise<void> {
    if (!this.hubConnection || !this.isConnected()) {
      return Promise.reject('Not connected');
    }

    return this.hubConnection
      .invoke('LeaveGroup', groupName)
      .then(() => {
        console.log(`✅ Left group: ${groupName}`);
      })
      .catch(error => {
        console.error(`❌ Error leaving group ${groupName}:`, error);
        throw error;
      });
  }

  // ==================== Server Methods ====================

  /**
   * Send message to server
   */
  sendMessage(method: string, ...args: any[]): Promise<any> {
    if (!this.hubConnection || !this.isConnected()) {
      return Promise.reject('Not connected');
    }

    return this.hubConnection.invoke(method, ...args);
  }

  /**
   * Notify visit created
   */
  notifyVisitCreated(visit: Visit): Promise<void> {
    return this.sendMessage('NotifyVisitCreated', visit);
  }

  /**
   * Notify visit updated
   */
  notifyVisitUpdated(visit: Visit, action: string): Promise<void> {
    return this.sendMessage('NotifyVisitUpdated', visit, action);
  }

  /**
   * Broadcast message to group
   */
  broadcastToGroup(groupName: string, message: string, data: any): Promise<void> {
    return this.sendMessage('BroadcastToGroup', groupName, message, data);
  }

  // ==================== Cleanup ====================

  /**
   * Cleanup on service destroy
   */
  ngOnDestroy(): void {
    this.stopConnection();
  }
}

