import '../models/visitor.dart';
import 'api_client.dart';
import '../../core/constants/api_endpoints.dart';

/// Visitors API Service
class VisitorsApi {
  final ApiClient _apiClient;

  VisitorsApi(this._apiClient);

  /// Lookup visitor by National ID or Phone
  Future<Visitor?> lookupVisitor({
    String? nationalId,
    String? phone,
  }) async {
    try {
      final endpoint = ApiEndpoints.visitorLookup(
        nationalId: nationalId,
        phone: phone,
      );
      print('🔍 VisitorsApi: Looking up visitor - endpoint: $endpoint');
      print('🔍 VisitorsApi: NationalId: $nationalId, Phone: $phone');
      
      final response = await _apiClient.get(endpoint);
      print('✅ VisitorsApi: Response received - status: ${response.statusCode}');

      final data = response.data as Map<String, dynamic>;
      print('✅ VisitorsApi: Data keys: ${data.keys}');
      return Visitor.fromJson(data);
    } catch (e) {
      print('❌ VisitorsApi: Lookup error: $e');
      // Return null if visitor not found (404)
      if (e.toString().contains('404') || 
          e.toString().contains('not found') ||
          e.toString().contains('Not found')) {
        print('ℹ️ VisitorsApi: Visitor not found (404)');
        return null;
      }
      rethrow;
    }
  }

  /// Get visitor profile with visit history
  Future<Map<String, dynamic>> getVisitorProfile(int visitorId) async {
    try {
      final endpoint = ApiEndpoints.visitorProfile(visitorId);
      print('👤 VisitorsApi: Getting profile for visitor ID: $visitorId');
      print('👤 VisitorsApi: Endpoint: $endpoint');
      
      final response = await _apiClient.get(endpoint);
      print('✅ VisitorsApi: Profile response received - status: ${response.statusCode}');

      final data = response.data as Map<String, dynamic>;
      print('✅ VisitorsApi: Profile data keys: ${data.keys}');
      return data;
    } catch (e) {
      print('❌ VisitorsApi: Get profile error: $e');
      rethrow;
    }
  }

  /// Update visitor blocked status (Admin only)
  Future<Visitor> updateVisitorBlockedStatus(int visitorId, bool isBlocked) async {
    try {
      final response = await _apiClient.put(
        ApiEndpoints.updateVisitorBlockedStatus(visitorId),
        data: isBlocked, // Send boolean as body
      );

      return Visitor.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }

  /// Search visitors by name, National ID, Phone, or Company
  Future<List<Visitor>> searchVisitors(String query) async {
    try {
      final endpoint = ApiEndpoints.searchVisitors(query);
      print('🔍 VisitorsApi: Searching visitors - endpoint: $endpoint');
      print('🔍 VisitorsApi: Query: $query');
      
      final response = await _apiClient.get(endpoint);
      print('✅ VisitorsApi: Search response received - status: ${response.statusCode}');

      final data = response.data as List<dynamic>;
      print('✅ VisitorsApi: Found ${data.length} visitors');
      
      return data.map((json) => Visitor.fromJson(json as Map<String, dynamic>)).toList();
    } catch (e) {
      print('❌ VisitorsApi: Search error: $e');
      rethrow;
    }
  }
}

