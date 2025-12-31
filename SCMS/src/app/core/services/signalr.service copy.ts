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

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection?: HubConnection;
  private visitCreatedSubject = new Subject<VisitCreatedEvent>();
  private visitUpdatedSubject = new Subject<VisitUpdatedEvent>();

  visitCreated$: Observable<VisitCreatedEvent> = this.visitCreatedSubject.asObservable();
  visitUpdated$: Observable<VisitUpdatedEvent> = this.visitUpdatedSubject.asObservable();

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

      // Start connection
      await this.hubConnection.start();
      console.log('SignalR connection started');

      // Join visitor management group
      await this.joinVisitorManagementGroup();
      
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

