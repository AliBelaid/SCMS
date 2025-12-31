import '../models/visit_summary.dart';
import 'api_client.dart';
import '../../core/constants/api_endpoints.dart';

/// Reports API Service
class ReportsApi {
  final ApiClient _apiClient;

  ReportsApi(this._apiClient);

  /// Get visit summary report for date range
  Future<VisitSummary> getSummaryReport(String fromDate, String toDate) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.reportsSummary(fromDate, toDate),
      );
      final data = response.data as Map<String, dynamic>;
      return VisitSummary.fromJson(data);
    } catch (e) {
      rethrow;
    }
  }
}

