# SignalR Real-time Updates Setup

This guide explains how to set up SignalR for real-time visitor management updates between the Flutter mobile app, .NET backend API, and Angular web application.

## Overview

SignalR enables real-time bidirectional communication. When a visit is created or updated (check-in/check-out), the backend sends notifications to all connected clients (Angular web app) in real-time.

## Architecture

```
Flutter App → API (Creates/Updates Visit) → SignalR Hub → Angular Web App (Real-time Update)
```

## Backend (.NET API)

### 1. SignalR Hub

The `NotificationHub` in `API/Hubs/NotificationHub.cs` handles real-time communication:

- **Groups**: `VisitorManagement` - all clients interested in visit updates
- **Events Sent**:
  - `VisitCreated` - when a new visit is created (check-in)
  - `VisitUpdated` - when a visit is updated (check-out)

### 2. Controllers

The `VisitsController` automatically sends SignalR notifications:

- `CreateVisit` → sends `VisitCreated` event
- `CheckoutVisit` → sends `VisitUpdated` event

### 3. SignalR Configuration

Already configured in `API/Startup.cs`:

```csharp
services.AddSignalR();
```

```csharp
endpoints.MapHub<NotificationHub>("/notificationHub");
```

## Angular Web Application

### 1. Install SignalR Package

```bash
cd SCMS
npm install @microsoft/signalr
```

### 2. SignalR Service

The service is located at: `SCMS/src/app/core/services/signalr.service.ts`

**Features:**
- Connects to SignalR hub on component initialization
- Joins `VisitorManagement` group automatically
- Provides observables for `visitCreated$` and `visitUpdated$` events
- Handles authentication tokens automatically

### 3. Usage in Components

**Example: `visits-list.component.ts`**

```typescript
import { SignalRService } from 'src/app/core/services/signalr.service';

constructor(private signalRService: SignalRService) {}

async ngOnInit(): Promise<void> {
  // Start SignalR connection
  await this.signalRService.startConnection();
  
  // Subscribe to real-time events
  this.signalRService.visitCreated$.subscribe(event => {
    this.loadVisits(); // Reload list
  });

  this.signalRService.visitUpdated$.subscribe(event => {
    this.loadVisits(); // Reload list
  });
}
```

### 4. Environment Configuration

Ensure `environment.ts` has the correct API URL:

```typescript
export const environment = {
  apiUrl: 'https://localhost:5001/api' // or your API URL
};
```

The SignalR service automatically converts this to the hub URL: `https://localhost:5001/notificationHub`

## Flutter Mobile App

### 1. Install SignalR Package

Add to `visitor_pos_app/pubspec.yaml`:

```yaml
dependencies:
  signalr_net_client: ^2.0.0
```

Then run:

```bash
cd visitor_pos_app
flutter pub get
```

### 2. SignalR Service (Optional)

The service is located at: `visitor_pos_app/lib/data/services/signalr_service.dart`

**Note:** The Flutter app primarily **sends** events (creates/updates visits), so SignalR connection is optional. It's only needed if you want the Flutter app to receive real-time updates from other clients.

### 3. Usage (Optional)

If you want the Flutter app to listen for real-time updates:

```dart
import 'package:visitor_pos_app/data/services/signalr_service.dart';

final signalRService = SignalRService();

// Start connection
await signalRService.startConnection();

// The service automatically handles VisitCreated and VisitUpdated events
```

## How It Works

### Visit Creation Flow

1. **Flutter App** creates a visit via `POST /api/Visits`
2. **API Controller** (`VisitsController.CreateVisit`) processes the request
3. **API sends SignalR notification** to all clients in `VisitorManagement` group:
   ```csharp
   await _hubContext.Clients.Group("VisitorManagement")
       .SendAsync("VisitCreated", new { Visit = visitDto, ... });
   ```
4. **Angular Web App** receives the event via SignalR service
5. **Component** automatically reloads the visits list

### Visit Update Flow (Checkout)

1. **Flutter App** or **Angular Web App** checks out a visit via `POST /api/Visits/checkout/{visitNumber}`
2. **API Controller** (`VisitsController.CheckoutVisit`) processes the request
3. **API sends SignalR notification**:
   ```csharp
   await _hubContext.Clients.Group("VisitorManagement")
       .SendAsync("VisitUpdated", new { Visit = visitDto, Action = "checkout", ... });
   ```
4. **All connected clients** receive the update in real-time
5. **Components** automatically refresh their data

## Testing

### 1. Test Backend SignalR

Start the API:
```bash
cd API
dotnet run
```

The SignalR hub will be available at: `https://localhost:5001/notificationHub`

### 2. Test Angular Connection

1. Start Angular app: `npm start`
2. Navigate to visits list page
3. Open browser DevTools → Console
4. You should see: `SignalR connection started` and `Joined VisitorManagement group`

### 3. Test Real-time Updates

1. Open visits list in Angular web app
2. Create a visit from Flutter app (or another client)
3. The visits list in Angular should automatically refresh without page reload

## Troubleshooting

### Angular: Connection Failed

- **Check token**: Ensure `localStorage` has a valid token (`hems_access_token`, `token`, etc.)
- **Check URL**: Verify `environment.apiUrl` is correct
- **CORS**: Ensure API allows SignalR connections from Angular origin
- **SSL**: For HTTPS, ensure certificate is trusted (development: accept self-signed)

### Flutter: Connection Failed

- **Check token**: Ensure `SharedPreferences` has `auth_token`
- **Check URL**: Verify `ApiEndpoints.baseUrl` is correct
- **Network**: Ensure device can reach the API server
- **SSL**: For HTTPS, ensure SSL certificate handling is configured in `api_client.dart`

### No Real-time Updates

1. **Check connection**: Verify SignalR connection is established (check console logs)
2. **Check groups**: Verify client joined `VisitorManagement` group
3. **Check backend**: Verify API is sending SignalR notifications (check API logs)
4. **Check events**: Verify component is subscribing to SignalR observables

## Security Notes

- SignalR connections require authentication token
- Only authenticated users can join `VisitorManagement` group
- All API endpoints are protected with `[Authorize]` attribute
- Token is sent in SignalR connection headers automatically

## Next Steps

- [ ] Add SignalR reconnection handling in Angular
- [ ] Add visual indicators when receiving real-time updates
- [ ] Add error handling and retry logic
- [ ] Add connection status indicator in UI
- [ ] Consider adding more event types (visit canceled, visitor updated, etc.)

