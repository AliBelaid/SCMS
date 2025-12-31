import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'dart:io';
import '../../core/constants/api_endpoints.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Base API Client
/// Handles authentication token and error handling
class ApiClient {
  late Dio _dio;
  static const String _tokenKey = 'auth_token';

  ApiClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiEndpoints.baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // ⚠️ DEVELOPMENT ONLY: SSL certificate handling (for HTTPS)
    // Currently using HTTP, so this won't be triggered
    // If you switch to HTTPS, this allows self-signed certificates for local development
    (_dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
      final client = HttpClient();
      client.badCertificateCallback = (cert, host, port) {
        // Allow self-signed certificates for local development (HTTPS only)
        // This accepts:
        // - localhost (iOS Simulator, Desktop)
        // - 10.0.2.2 (Android Emulator - maps to host's localhost)
        // - Local network IPs (192.168.x.x, 172.x.x.x, 10.x.x.x)
        final isLocalhost = host == 'localhost' || host == '127.0.0.1';
        final isAndroidEmulator = host == '10.17.178.34';
        final isLocalNetwork =
            host.startsWith('192.168.') ||
            host.startsWith('172.') ||
            (host.startsWith('10.') &&
                !host.startsWith('10.0.2')); // Exclude 10.0.2.x

        final allowed = isLocalhost || isAndroidEmulator || isLocalNetwork;

        if (allowed) {
          print(
            '⚠️ Allowing self-signed certificate for: $host:$port (HTTPS DEV ONLY)',
          );
        }

        return allowed;
      };
      return client;
    };

    // Add interceptor to attach token to requests and log requests
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
            print('🔑 API Request: Token attached (length: ${token.length})');
          } else {
            print('⚠️ API Request: No token available');
          }
          print(
            '📤 API Request: ${options.method} ${options.baseUrl}${options.path}',
          );
          if (options.queryParameters.isNotEmpty) {
            print('📤 Query params: ${options.queryParameters}');
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print(
            '📥 API Response: ${response.statusCode} ${response.requestOptions.path}',
          );
          return handler.next(response);
        },
        onError: (error, handler) {
          print('❌ API Error: ${error.type} - ${error.message}');
          if (error.response != null) {
            print('❌ Status: ${error.response!.statusCode}');
            print('❌ Data: ${error.response!.data}');
          }
          // Handle common errors
          if (error.response?.statusCode == 401) {
            // Token expired or invalid - clear token
            _clearToken();
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<void> _clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    print('💾 ApiClient: Token saved (length: ${token.length})');
    // Verify token was saved
    final savedToken = await _getToken();
    if (savedToken != null && savedToken == token) {
      print('✅ ApiClient: Token verified in storage');
    } else {
      print('❌ ApiClient: Token verification failed!');
    }
  }

  Future<void> clearToken() async {
    await _clearToken();
  }

  // GET request
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      return await _dio.get(path, queryParameters: queryParameters);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // POST request
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      return await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // PUT request
  Future<Response> put(String path, {dynamic data}) async {
    try {
      return await _dio.put(path, data: data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // DELETE request
  Future<Response> delete(String path) async {
    try {
      return await _dio.delete(path);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Handle errors - returns user-friendly messages
  String _handleError(DioException error) {
    if (error.response != null) {
      // Server responded with error
      final statusCode = error.response!.statusCode;

      // Extract message from response
      String message = 'Error occurred';
      if (error.response!.data != null) {
        if (error.response!.data is Map) {
          message =
              error.response!.data['message'] as String? ??
              error.response!.data['error'] as String? ??
              'Server error occurred';
        } else if (error.response!.data is String) {
          message = error.response!.data as String;
        }
      }

      switch (statusCode) {
        case 400:
          return message; // Use server message as-is
        case 401:
          return message.isNotEmpty ? message : 'Please login again';
        case 403:
          return message.isNotEmpty ? message : 'Access denied';
        case 404:
          return message.isNotEmpty ? message : 'Not found';
        case 500:
          return message.isNotEmpty
              ? message
              : 'System error. Please try again';
        default:
          return message.isNotEmpty
              ? message
              : 'Error occurred. Please try again';
      }
    } else if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return 'Connection timeout. Check your internet';
    } else if (error.type == DioExceptionType.connectionError) {
      return 'No internet connection';
    } else {
      return 'Network error. Please try again';
    }
  }
}
