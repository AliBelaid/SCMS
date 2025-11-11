import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FileEntry } from '../models/file-entry';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../assets/environments/environment';
import { AuthService } from './auth.service';

export interface NotificationEvent {
  type: 'fileUploaded' | 'fileDeleted' | 'userAdded' | 'userUpdated' | 'roleChanged';
  data: any;
  timestamp: Date;
}

export interface RoleChangeNotification {
  userCode: string;
  newRole: string;
  message: string;
  timestamp: Date;
}

export interface PersonalRoleChangeNotification {
  userCode: string;
  newRole: string;
  message: string;
  timestamp: Date;
  requiresReload: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private notificationSubject = new Subject<NotificationEvent>();
  public notifications$ = this.notificationSubject.asObservable();
  private hubConnection?: signalR.HubConnection;
  private joinedUserCode?: string;

  constructor(private authService: AuthService) {}

  // Build hub URL from API url (strip trailing /api)
  private getHubUrl(): string {
    const base = environment.apiUrl.replace(/\/?api\/?$/i, '');
    const hubUrl = `${base}/notificationHub`;
    console.log('SignalR: Hub URL constructed as:', hubUrl);
    return hubUrl;
  }

  startConnection(): void {
    if (this.hubConnection) {
      console.log('SignalR: Connection already exists, skipping...');
      return; // already started
    }

    console.log('SignalR: Starting new connection...');
    const hubUrl = this.getHubUrl();
    const token = this.authService.getAuthToken();
    console.log('SignalR: Using auth token:', token ? 'Token available' : 'No token');
    
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          const currentToken = this.authService.getAuthToken();
          console.log('SignalR: AccessTokenFactory called, token:', currentToken ? 'Available' : 'None');
          return currentToken || '';
        }
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Wire server events
    this.hubConnection.on('ReceiveRoleChangeNotification', (notification: any) => {
      console.log('SignalR: Received general role change notification:', notification);
      
      // Map PascalCase from backend to camelCase for frontend
      const mappedNotification: RoleChangeNotification = {
        userCode: notification.UserCode || notification.userCode,
        newRole: notification.NewRole || notification.newRole,
        message: notification.Message || notification.message,
        timestamp: new Date(notification.Timestamp || notification.timestamp)
      };
      
      const event: NotificationEvent = {
        type: 'roleChanged',
        data: mappedNotification,
        timestamp: mappedNotification.timestamp
      };
      this.notificationSubject.next(event);
    });

    this.hubConnection.on('ReceivePersonalRoleChange', (notification: any) => {
      console.log('SignalR: Received personal role change notification:', notification);
      
      // Map PascalCase from backend to camelCase for frontend
      const mappedNotification: PersonalRoleChangeNotification = {
        userCode: notification.UserCode || notification.userCode,
        newRole: notification.NewRole || notification.newRole,
        message: notification.Message || notification.message,
        timestamp: new Date(notification.Timestamp || notification.timestamp),
        requiresReload: notification.RequiresReload || notification.requiresReload || false
      };
      
      const event: NotificationEvent = {
        type: 'roleChanged',
        data: mappedNotification,
        timestamp: mappedNotification.timestamp
      };
      this.notificationSubject.next(event);
    });

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR: Connection established successfully');
        console.log('SignalR: Connection state:', this.hubConnection?.state);
        // Join current user's group if available
        const currentUser = this.authService.getCurrentUser();
        if (currentUser?.code) {
          console.log('SignalR: Joining user group for:', currentUser.code);
          this.joinUserGroup(currentUser.code);
        }
      })
      .catch((err: unknown) => {
        console.error('SignalR connection error:', err);
        console.error('SignalR: Failed to connect to hub at:', this.getHubUrl());
      });

    // Rejoin group on reconnect
    this.hubConnection.onreconnected(() => {
      if (this.joinedUserCode) {
        this.joinUserGroup(this.joinedUserCode);
      }
    });
  }

  stopConnection(): void {
    if (!this.hubConnection) return;
    console.log('SignalR: Stopping connection...');
    this.hubConnection.stop().catch((err: unknown) => console.error('SignalR stop error:', err));
    this.hubConnection = undefined;
  }

  getConnectionState(): string {
    if (!this.hubConnection) return 'Not initialized';
    return this.hubConnection.state;
  }

  isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  // Test method to manually check SignalR connection
  testConnection(): void {
    console.log('=== SignalR Connection Test ===');
    console.log('Connection state:', this.getConnectionState());
    console.log('Is connected:', this.isConnected());
    console.log('Hub URL:', this.getHubUrl());
    console.log('Auth token available:', this.authService.getAuthToken() ? 'Yes' : 'No');
    console.log('Current user:', this.authService.getCurrentUser());
    
    if (!this.hubConnection) {
      console.log('Starting connection for test...');
      this.startConnection();
    }
  }

  // Notify when a new file is uploaded
  notifyFileUploaded(file: FileEntry): void {
    const notification: NotificationEvent = {
      type: 'fileUploaded',
      data: file,
      timestamp: new Date()
    };
    this.notificationSubject.next(notification);
  }

  // Notify when a file is deleted
  notifyFileDeleted(fileId: string): void {
    const notification: NotificationEvent = {
      type: 'fileDeleted',
      data: { fileId },
      timestamp: new Date()
    };
    this.notificationSubject.next(notification);
  }

  // Notify when a user is added
  notifyUserAdded(user: any): void {
    const notification: NotificationEvent = {
      type: 'userAdded',
      data: user,
      timestamp: new Date()
    };
    this.notificationSubject.next(notification);
  }

  // Notify when a user is updated
  notifyUserUpdated(user: any): void {
    const notification: NotificationEvent = {
      type: 'userUpdated',
      data: user,
      timestamp: new Date()
    };
    this.notificationSubject.next(notification);
  }

  // Notify when a user's role is changed
  notifyRoleChanged(roleChangeData: RoleChangeNotification): void {
    const notification: NotificationEvent = {
      type: 'roleChanged',
      data: roleChangeData,
      timestamp: new Date(roleChangeData.timestamp)
    };
    this.notificationSubject.next(notification);
  }

  // Subscribe to notifications
  subscribeToNotifications(callback: (notification: NotificationEvent) => void): void {
    this.notifications$.subscribe(callback);
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications(): void {
    this.notificationSubject.complete();
  }

  // Handle personal role change notifications
  handlePersonalRoleChange(notification: PersonalRoleChangeNotification): void {
    console.log('Personal role change received:', notification);
    
    // Emit a specific role change event
    const roleChangeEvent: NotificationEvent = {
      type: 'roleChanged',
      data: notification,
      timestamp: new Date(notification.timestamp)
    };
    
    this.notificationSubject.next(roleChangeEvent);
  }

  // Join user-specific SignalR group
  joinUserGroup(userCode: string): void {
    this.joinedUserCode = userCode;
    if (!this.hubConnection) return;
    console.log('SignalR: Invoking JoinUserGroup for:', userCode);
    this.hubConnection.invoke('JoinUserGroup', userCode)
      .then(() => console.log('SignalR: Successfully joined user group:', userCode))
      .catch((err: unknown) => console.error('JoinUserGroup error:', err));
  }

  // Leave user-specific SignalR group
  leaveUserGroup(userCode: string): void {
    if (!this.hubConnection) return;
    this.hubConnection.invoke('LeaveUserGroup', userCode)
      .catch((err: unknown) => console.error('LeaveUserGroup error:', err));
  }
} 