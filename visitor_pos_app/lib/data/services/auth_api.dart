import 'package:dio/dio.dart';
import '../models/user.dart';
import 'api_client.dart';
import '../../core/constants/api_endpoints.dart';

/// Authentication API Service
class AuthApi {
  final ApiClient _apiClient;

  AuthApi(this._apiClient);

  /// Login with user code and password
  /// Returns User object with token
  /// AccountController expects: { "code": "ADMIN001", "password": "Admin123" }
  ///
  /// Throws: String with error message for display
  Future<User> login(String userCode, String password) async {
    try {
      print('🌐 AuthApi: Starting login request');
      print('🌐 AuthApi: URL: ${ApiEndpoints.baseUrl}${ApiEndpoints.login}');
      print('🌐 AuthApi: UserCode: $userCode');

      // Validate input
      if (userCode.trim().isEmpty) {
        print('❌ AuthApi: User code is empty');
        throw 'User code is required';
      }
      if (password.trim().isEmpty) {
        print('❌ AuthApi: Password is empty');
        throw 'Password is required';
      }

      print('📤 AuthApi: Sending POST request...');
      final response = await _apiClient.post(
        ApiEndpoints.login,
        data: {'code': userCode.trim(), 'password': password},
      );

      print('📥 AuthApi: Response received, status: ${response.statusCode}');
      print('📥 AuthApi: Response data: ${response.data}');

      final data = response.data as Map<String, dynamic>;

      // Validate response
      if (data['token'] == null || data['token'].toString().isEmpty) {
        print('❌ AuthApi: No token in response');
        throw 'Login failed: No token received';
      }

      // Save token
      final token = data['token'] as String;
      print('💾 AuthApi: Saving token (length: ${token.length})');
      await _apiClient.setToken(token);

      // Create and return user
      // AccountController returns: id, code, description, role, isActive, lastActive, preferredLanguage, token
      final userCodeValue = data['code'] as String? ?? userCode.trim();
      final user = User(
        id: data['id'] as int?,
        userName: userCodeValue,
        fullName: data['description'] as String? ?? userCodeValue,
        role: data['role'] as String? ?? 'Member',
        token: token,
      );

      print('✅ AuthApi: User created: ${user.userName}, Role: ${user.role}');
      return user;
    } on DioException catch (e) {
      print('❌ AuthApi: DioException caught');
      print('❌ AuthApi: Error type: ${e.type}');
      print('❌ AuthApi: Error message: ${e.message}');
      print('❌ AuthApi: Response status: ${e.response?.statusCode}');
      print('❌ AuthApi: Response data: ${e.response?.data}');

      // Handle API errors with user-friendly messages
      String errorMessage = 'Login failed';

      if (e.response != null) {
        // Server responded with error
        final statusCode = e.response!.statusCode;
        final responseData = e.response!.data;

        print(
          '❌ AuthApi: Server error - Status: $statusCode, Data: $responseData',
        );

        // Extract error message from response
        String? serverMessage;
        if (responseData is Map) {
          serverMessage = responseData['message'] as String?;
          print('❌ AuthApi: Server message: $serverMessage');
        }

        switch (statusCode) {
          case 400:
            errorMessage =
                serverMessage ??
                'Invalid input. Please check your code and password.';
            break;
          case 401:
            errorMessage = serverMessage ?? 'Invalid user code or password';
            break;
          case 500:
            errorMessage = serverMessage ?? 'System error. Please try again';
            break;
          default:
            errorMessage = serverMessage ?? 'Login failed. Please try again';
        }
      } else {
        // Network or connection error
        print('❌ AuthApi: Network error - Type: ${e.type}');
        if (e.type == DioExceptionType.connectionTimeout ||
            e.type == DioExceptionType.receiveTimeout) {
          errorMessage = 'Connection timeout. Check your internet';
        } else if (e.type == DioExceptionType.connectionError) {
          errorMessage =
              'No internet connection. Check your network and API URL';
        } else {
          errorMessage = e.message ?? 'Login failed. Please try again';
        }
      }

      print('❌ AuthApi: Throwing error: $errorMessage');
      throw errorMessage;
    } catch (e) {
      // Handle any other errors
      if (e is String) {
        rethrow; // Already a user-friendly message
      }
      throw 'Login failed. Please try again';
    }
  }

  /// Logout - clears token
  Future<void> logout() async {
    await _apiClient.clearToken();
  }
}
