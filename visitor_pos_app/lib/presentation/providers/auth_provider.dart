import 'package:flutter/foundation.dart';
import '../../data/models/user.dart';
import '../../data/services/auth_api.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Authentication Provider
/// Manages user authentication state using Provider
class AuthProvider with ChangeNotifier {
  final AuthApi _authApi;
  User? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  AuthProvider(this._authApi) {
    _loadStoredUser();
  }

  User? get currentUser => _currentUser;
  bool get isLoggedIn => _currentUser != null && _currentUser!.token != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  /// Load user from SharedPreferences on app start
  Future<void> _loadStoredUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      final userName = prefs.getString('user_name');
      final fullName = prefs.getString('full_name');
      final role = prefs.getString('user_role');

      if (token != null &&
          userName != null &&
          fullName != null &&
          role != null) {
        _currentUser = User(
          userName: userName,
          fullName: fullName,
          role: role,
          token: token,
        );
        notifyListeners();
      }
    } catch (e) {
      // Ignore errors when loading stored user
    }
  }

  /// Login with username and password
  Future<bool> login(String userName, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      print('📡 AuthProvider: Calling API login for user: $userName');
      final user = await _authApi.login(userName, password);

      print(
        '✅ AuthProvider: Login API success, user: ${user.userName}, token: ${user.token?.substring(0, 20)}...',
      );

      // Store user data
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', user.token!);
      await prefs.setString('user_name', user.userName);
      await prefs.setString('full_name', user.fullName);
      await prefs.setString('user_role', user.role);

      print('💾 AuthProvider: User data saved to SharedPreferences');

      _currentUser = user;
      _isLoading = false;
      _errorMessage = null;
      notifyListeners();

      print('✅ AuthProvider: Login complete, isLoggedIn: ${isLoggedIn}');
      return true;
    } catch (e) {
      _isLoading = false;
      final errorStr = e.toString();
      _errorMessage = errorStr
          .replaceAll('Exception: ', '')
          .replaceAll('Error: ', '');

      print('❌ AuthProvider: Login error: $_errorMessage');
      print('❌ AuthProvider: Full error: $e');

      notifyListeners();
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      await _authApi.logout();

      // Clear stored data
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('user_name');
      await prefs.remove('full_name');
      await prefs.remove('user_role');

      _currentUser = null;
      _errorMessage = null;
      notifyListeners();
    } catch (e) {
      // Even if API call fails, clear local data
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('user_name');
      await prefs.remove('full_name');
      await prefs.remove('user_role');

      _currentUser = null;
      notifyListeners();
    }
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
