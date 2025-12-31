import '../models/department.dart';
import 'api_client.dart';
import '../../core/constants/api_endpoints.dart';
import 'local_database.dart';
import '../../core/utils/connectivity_service.dart';

/// Departments API Service with Local Caching
class DepartmentsApi {
  final ApiClient _apiClient;
  final LocalDatabase _localDb = LocalDatabase();
  final ConnectivityService _connectivityService = ConnectivityService();

  DepartmentsApi(this._apiClient);

  /// Get all departments (with local caching)
  Future<List<Department>> getDepartments() async {
    final isOnline = await _connectivityService.isOnline();

    if (isOnline) {
      try {
        final response = await _apiClient.get(ApiEndpoints.departments);
        final data = response.data as List<dynamic>;
        final departments = data
            .map((json) => Department.fromJson(json as Map<String, dynamic>))
            .toList();

        // Cache departments locally
        await _localDb.cacheDepartments(
          departments.map((d) => d.toJson()).toList(),
        );

        return departments;
      } catch (e) {
        // If API fails, try to return cached departments
        return await _getCachedDepartments();
      }
    } else {
      // Offline mode - return cached departments
      return await _getCachedDepartments();
    }
  }

  /// Get cached departments
  Future<List<Department>> _getCachedDepartments() async {
    final cached = await _localDb.getCachedDepartments();
    return cached.map((json) => Department.fromJson(json)).toList();
  }
}
