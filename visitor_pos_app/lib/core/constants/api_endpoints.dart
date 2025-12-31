/// API Endpoints Configuration
///
/// To switch between test/prod backends, change the baseUrl below.
/// For production, you can also use environment variables or a config file.
class ApiEndpoints {
  // Base URL - Update this to match your .NET API
  //
  // Production Server: http://80.209.230.140:6024/api
  //
  // For Android Emulator: http://10.0.2.2:5050/api (10.0.2.2 maps to localhost)
  // For Physical Android Device: Use your PC's IP address
  //   To find your PC's IP: Windows: ipconfig | Linux/Mac: ifconfig
  // For iOS Simulator: http://localhost:5050/api
  // For Local Development: http://localhost:5000/api
  //
  // NOTE: Using HTTP for production server
  static const String baseUrl = "http://80.209.230.140:6024/api";

  // ============================================
  // AUTHENTICATION ENDPOINTS (AccountController)
  // ============================================

  /// Login endpoint
  /// POST /api/Account/login
  /// Body: { "code": "ADMIN001", "password": "Admin123" }
  static const String login = "/Account/login";

  /// Get current user
  /// GET /api/Account
  static const String currentUser = "/Account";

  // ============================================
  // VISITOR DEPARTMENTS ENDPOINTS (VisitorDepartmentsController)
  // ============================================

  /// Get all visitor departments
  /// GET /api/VisitorDepartments
  static const String departments = "/VisitorDepartments";

  /// Get department by ID
  /// GET /api/VisitorDepartments/{id}
  static String departmentById(int id) => "/VisitorDepartments/$id";

  // ============================================
  // VISITORS ENDPOINTS (VisitorsController)
  // ============================================

  /// Lookup visitor by National ID or Phone
  /// GET /api/Visitors/lookup?nationalId={id}&phone={phone}
  static String visitorLookup({String? nationalId, String? phone}) {
    final params = <String>[];
    if (nationalId != null && nationalId.isNotEmpty) {
      params.add('nationalId=${Uri.encodeComponent(nationalId)}');
    }
    if (phone != null && phone.isNotEmpty) {
      params.add('phone=${Uri.encodeComponent(phone)}');
    }
    if (params.isEmpty) {
      throw ArgumentError('Either nationalId or phone must be provided');
    }
    return '/Visitors/lookup?${params.join('&')}';
  }

  /// Get visitor profile with visit history
  /// GET /api/Visitors/{id}/profile
  static String visitorProfile(int id) => '/Visitors/$id/profile';

  /// Update visitor blocked status (Admin only)
  /// PUT /api/Visitors/{id}/block
  static String updateVisitorBlockedStatus(int id) => '/Visitors/$id/block';

  /// Search visitors by name, National ID, Phone, or Company
  /// GET /api/Visitors/search?query={query}
  static String searchVisitors(String query) =>
      '/Visitors/search?query=${Uri.encodeComponent(query)}';

  // ============================================
  // VISITS ENDPOINTS (VisitsController)
  // ============================================

  /// Create a new visit (check-in)
  /// POST /api/Visits
  static const String visits = "/Visits";

  /// Get active visits (ongoing)
  /// GET /api/Visits/active?search={search}
  static String activeVisits({String? search}) =>
      search != null && search.isNotEmpty
      ? "/Visits/active?search=$search"
      : "/Visits/active";

  /// Get visit by visit number
  /// GET /api/Visits/number/{visitNumber}
  static String visitByNumber(String visitNumber) =>
      "/Visits/number/$visitNumber";

  /// Checkout a visit
  /// POST /api/Visits/checkout/{visitNumber}
  static String checkoutVisit(String visitNumber) =>
      "/Visits/checkout/$visitNumber";

  // ============================================
  // VISIT REPORTS ENDPOINTS (VisitReportsController)
  // ============================================

  /// Get visit summary report
  /// GET /api/VisitReports/summary?fromDate={date}&toDate={date}
  static String reportsSummary(String fromDate, String toDate) =>
      "/VisitReports/summary?fromDate=$fromDate&toDate=$toDate";

  /// Get filtered visits report
  /// GET /api/VisitReports/visits?fromDate={date}&toDate={date}&status={status}&departmentId={id}
  static String reportsVisits({
    String? fromDate,
    String? toDate,
    String? status,
    int? departmentId,
  }) {
    final params = <String>[];
    if (fromDate != null) params.add('fromDate=$fromDate');
    if (toDate != null) params.add('toDate=$toDate');
    if (status != null) params.add('status=$status');
    if (departmentId != null) params.add('departmentId=$departmentId');

    return params.isEmpty
        ? "/VisitReports/visits"
        : "/VisitReports/visits?${params.join('&')}";
  }

  /// Get daily statistics
  /// GET /api/VisitReports/daily-stats?days={days}
  static String dailyStats({int days = 7}) =>
      "/VisitReports/daily-stats?days=$days";

  /// Get top visitors (most frequent)
  /// GET /api/VisitReports/top-visitors?top={top}
  static String topVisitors({int top = 10}) =>
      "/VisitReports/top-visitors?top=$top";

  // ============================================
  // ADMIN ENDPOINTS (AdminController)
  // ============================================

  /// Get users with roles (Admin only)
  /// GET /api/Admin/users-with-roles
  static const String usersWithRoles = "/Admin/users-with-roles";

  /// Create user (Admin only)
  /// POST /api/Admin/create
  static const String createUser = "/Admin/create";

  /// Reset password (Admin only)
  /// POST /api/Admin/reset-password
  static const String resetPassword = "/Admin/reset-password";

  /// Delete user (Admin only)
  /// DELETE /api/Admin/delete-user/{userId}
  static String deleteUser(int userId) => "/Admin/delete-user/$userId";

  /// Update user (Admin only)
  /// PUT /api/Admin/update-user/{userId}
  static String updateUser(int userId) => "/Admin/update-user/$userId";

  /// Activate user (Admin only)
  /// POST /api/Admin/activate-user/{userId}
  static String activateUser(int userId) => "/Admin/activate-user/$userId";

  /// Deactivate user (Admin only)
  /// POST /api/Admin/deactivate-user/{userId}
  static String deactivateUser(int userId) => "/Admin/deactivate-user/$userId";
}
