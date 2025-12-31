import 'package:connectivity_plus/connectivity_plus.dart';

/// Connectivity Service
/// Checks internet connectivity status
class ConnectivityService {
  final Connectivity _connectivity = Connectivity();

  /// Check if device has internet connection
  Future<bool> hasInternetConnection() async {
    try {
      final result = await _connectivity.checkConnectivity();
      // In connectivity_plus 5.x, checkConnectivity returns ConnectivityResult (single value)
      // Check if connected to mobile data, wifi, or ethernet
      return result == ConnectivityResult.mobile ||
          result == ConnectivityResult.wifi ||
          result == ConnectivityResult.ethernet;
    } catch (e) {
      return false;
    }
  }

  /// Get connectivity stream
  Stream<ConnectivityResult> get connectivityStream =>
      _connectivity.onConnectivityChanged;

  /// Check if currently online (with actual internet, not just network connection)
  /// This is a simple check - for more accurate results, you might want to ping a server
  Future<bool> isOnline() async {
    final hasConnection = await hasInternetConnection();
    // You can add additional check here like pinging your backend
    return hasConnection;
  }
}
