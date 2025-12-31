/// SignalR Service for Real-time Updates
///
/// NOTE: SignalR client for Flutter is optional.
/// The Flutter app primarily SENDS events (creates visits) via API,
/// which then triggers SignalR notifications on the backend.
/// The Angular web app receives these real-time updates.
///
/// If you want to receive SignalR updates in Flutter, you'll need to:
/// 1. Find a compatible SignalR package for Flutter/Dart
/// 2. Implement WebSocket connection manually
/// 3. Or use a different real-time solution (Firebase, Socket.io, etc.)
class SignalRService {
  bool _isConnected = false;

  /// Start SignalR connection (stub - not implemented)
  ///
  /// Note: Flutter app doesn't need to receive SignalR updates.
  /// It sends events via API, which triggers SignalR on backend.
  Future<void> startConnection() async {
    print(
      'ℹ️ SignalR: Client not implemented - Flutter app sends events via API',
    );
    print('ℹ️ SignalR: Real-time updates are received by Angular web app');
    _isConnected = false;
  }

  /// Stop SignalR connection (stub)
  Future<void> stopConnection() async {
    _isConnected = false;
    print('SignalR connection stopped (stub)');
  }

  /// Join visitor management group (stub)
  Future<void> joinVisitorManagementGroup() async {
    print('SignalR: Join group (stub - not implemented)');
  }

  /// Leave visitor management group (stub)
  Future<void> leaveVisitorManagementGroup() async {
    print('SignalR: Leave group (stub - not implemented)');
  }

  /// Check if connected
  bool get isConnected => _isConnected;

  /// Get connection state
  String getConnectionState() {
    return 'NotImplemented';
  }
}
