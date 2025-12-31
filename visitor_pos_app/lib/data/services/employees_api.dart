import '../models/employee.dart';
import '../models/employee_attendance.dart';
import 'api_client.dart';

/// Employees API Service
class EmployeesApi {
  final ApiClient _apiClient;

  EmployeesApi(this._apiClient);

  /// Get all employees (optionally filtered by search or department)
  Future<List<Employee>> getEmployees({
    String? search,
    int? departmentId,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      if (departmentId != null) {
        queryParams['departmentId'] = departmentId.toString();
      }

      final response = await _apiClient.get(
        '/Employees',
        queryParameters: queryParams.isEmpty ? null : queryParams,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => Employee.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load employees: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting employees: $e');
    }
  }

  /// Get employee by ID
  Future<Employee> getEmployeeById(int id) async {
    try {
      final response = await _apiClient.get('/Employees/$id');
      if (response.statusCode == 200) {
        return Employee.fromJson(response.data);
      } else {
        throw Exception('Failed to load employee: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting employee: $e');
    }
  }

  /// Get employee by EmployeeId (barcode) or name
  Future<Employee?> getEmployeeByIdentifier({
    String? employeeId,
    String? name,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (employeeId != null && employeeId.isNotEmpty) {
        queryParams['employeeId'] = employeeId;
      }
      if (name != null && name.isNotEmpty) {
        queryParams['name'] = name;
      }

      if (queryParams.isEmpty) {
        return null;
      }

      final response = await _apiClient.get(
        '/Employees/lookup',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        return Employee.fromJson(response.data);
      } else if (response.statusCode == 404) {
        return null;
      } else {
        throw Exception('Failed to lookup employee: ${response.statusCode}');
      }
    } catch (e) {
      return null;
    }
  }

  /// Record employee check-in
  Future<EmployeeAttendance> checkIn({
    required String employeeIdOrName,
    String? notes,
  }) async {
    try {
      final response = await _apiClient.post(
        '/Employees/attendance/checkin',
        data: {
          'employeeIdOrName': employeeIdOrName,
          if (notes != null) 'notes': notes,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return EmployeeAttendance.fromJson(response.data);
      } else {
        throw Exception('Failed to check in: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error checking in employee: $e');
    }
  }

  /// Record employee check-out
  Future<EmployeeAttendance> checkOut(int attendanceId) async {
    try {
      final response = await _apiClient.post(
        '/Employees/attendance/$attendanceId/checkout',
        data: {},
      );

      if (response.statusCode == 200) {
        return EmployeeAttendance.fromJson(response.data);
      } else {
        throw Exception('Failed to check out: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error checking out employee: $e');
    }
  }

  /// Get today's attendance records
  Future<List<EmployeeAttendance>> getTodayAttendance() async {
    try {
      final response = await _apiClient.get('/Employees/attendance/today');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => EmployeeAttendance.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load today attendance: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting today attendance: $e');
    }
  }

  /// Get employee attendance records
  Future<List<EmployeeAttendance>> getEmployeeAttendance(
    int employeeId, {
    DateTime? dateFrom,
    DateTime? dateTo,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (dateFrom != null) {
        queryParams['dateFrom'] = dateFrom.toIso8601String();
      }
      if (dateTo != null) {
        queryParams['dateTo'] = dateTo.toIso8601String();
      }

      final response = await _apiClient.get(
        '/Employees/$employeeId/attendance',
        queryParameters: queryParams.isEmpty ? null : queryParams,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => EmployeeAttendance.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load employee attendance: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting employee attendance: $e');
    }
  }
}

