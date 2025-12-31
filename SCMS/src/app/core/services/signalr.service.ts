import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { environment } from '../../../assets/environments/environment';
import { Subject, Observable } from 'rxjs';

export interface VisitCreatedEvent {
  visit: any;
  createdBy: string;
  timestamp: string;
}

export interface VisitUpdatedEvent {
  visit: any;
  action: string;
  timestamp: string;
}

export interface VisitorBlockedEvent {
  visitorId: number;
  visitorName: string;
  isBlocked: boolean;
  blockReason?: string;
  blockedBy: string;
  timestamp: string;
  message?: string;
}

export interface EmployeeAttendanceUpdatedEvent {
  attendance: any;
  employeeName: string;
  employeeId: string;
  action: string; // 'CheckedIn' or 'CheckedOut'
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection?: HubConnection;
  private visitCreatedSubject = new Subject<VisitCreatedEvent>();
  private visitUpdatedSubject = new Subject<VisitUpdatedEvent>();
  private visitorBlockedSubject = new Subject<VisitorBlockedEvent>();
  private employeeAttendanceUpdatedSubject = new Subject<EmployeeAttendanceUpdatedEvent>();

  visitCreated$: Observable<VisitCreatedEvent> = this.visitCreatedSubject.asObservable();
  visitUpdated$: Observable<VisitUpdatedEvent> = this.visitUpdatedSubject.asObservable();
  visitorBlocked$: Observable<VisitorBlockedEvent> = this.visitorBlockedSubject.asObservable();
  employeeAttendanceUpdated$: Observable<EmployeeAttendanceUpdatedEvent> = this.employeeAttendanceUpdatedSubject.asObservable();

  constructor() {}

  /**
   * Start SignalR connection and join visitor management group
   */
  async startConnection(): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      console.log('SignalR already connected');
      return;
    }

    try {
      // Get auth token from localStorage (check multiple possible keys)
      const token = localStorage.getItem('hems_access_token') || 
                    localStorage.getItem('access_token') || 
                    localStorage.getItem('token') ||
                    localStorage.getItem('authToken') ||
                    localStorage.getItem('jwt_token') ||
                    '';
      
      const hubUrl = environment.apiUrl.replace('/api', '/notificationHub');
      
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
          skipNegotiation: false,
          transport: 1, // WebSockets
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Register event handlers
      this.hubConnection.on('VisitCreated', (data: VisitCreatedEvent) => {
        console.log('SignalR: VisitCreated received', data);
        this.visitCreatedSubject.next(data);
      });

      this.hubConnection.on('VisitUpdated', (data: VisitUpdatedEvent) => {
        console.log('SignalR: VisitUpdated received', data);
        this.visitUpdatedSubject.next(data);
      });

      this.hubConnection.on('VisitorBlocked', (data: VisitorBlockedEvent) => {
        console.log('SignalR: VisitorBlocked received', data);
        this.visitorBlockedSubject.next(data);
      });

      this.hubConnection.on('EmployeeAttendanceUpdated', (data: EmployeeAttendanceUpdatedEvent) => {
        console.log('SignalR: EmployeeAttendanceUpdated received', data);
        this.employeeAttendanceUpdatedSubject.next(data);
      });

      // Start connection
      await this.hubConnection.start();
      console.log('SignalR connection started');

      // Join visitor management and employee management groups
      await this.joinVisitorManagementGroup();
      await this.joinEmployeeManagementGroup();
      
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      throw error;
    }
  }

  /**
   * Stop SignalR connection
   */
  async stopConnection(): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      await this.leaveVisitorManagementGroup();
      await this.leaveEmployeeManagementGroup();
      await this.hubConnection.stop();
      console.log('SignalR connection stopped');
    }
  }

  /**
   * Join visitor management group to receive real-time updates
   */
  private async joinVisitorManagementGroup(): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('JoinVisitorManagementGroup');
        console.log('Joined VisitorManagement group');
      } catch (error) {
        console.error('Error joining VisitorManagement group:', error);
      }
    }
  }

  /**
   * Leave visitor management group
   */
  private async leaveVisitorManagementGroup(): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('LeaveVisitorManagementGroup');
        console.log('Left VisitorManagement group');
      } catch (error) {
        console.error('Error leaving VisitorManagement group:', error);
      }
    }
  }

  /**
   * Join employee management group to receive real-time updates
   */
  private async joinEmployeeManagementGroup(): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('JoinEmployeeManagementGroup');
        console.log('Joined EmployeeManagement group');
      } catch (error) {
        console.error('Error joining EmployeeManagement group:', error);
      }
    }
  }

  /**
   * Leave employee management group
   */
  private async leaveEmployeeManagementGroup(): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('LeaveEmployeeManagementGroup');
        console.log('Left EmployeeManagement group');
      } catch (error) {
        console.error('Error leaving EmployeeManagement group:', error);
      }
    }
  }

  /**
   * Check if connection is active
   */
  isConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected;
  }

  /**
   * Get connection state
   */
  getConnectionState(): string {
    return HubConnectionState[this.hubConnection?.state ?? HubConnectionState.Disconnected];
  }
}

