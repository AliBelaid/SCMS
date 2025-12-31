import '../models/visit.dart';
import 'api_client.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/utils/connectivity_service.dart';
import 'local_database.dart';

/// Visits API Service with Offline Support
class VisitsApi {
  final ApiClient _apiClient;
  final ConnectivityService _connectivityService = ConnectivityService();
  final LocalDatabase _localDb = LocalDatabase();

  VisitsApi(this._apiClient);

  /// Create a new visit (with offline support)
  /// If offline, saves to local database for later sync
  Future<Visit> createVisit(Map<String, dynamic> visitData) async {
    final isOnline = await _connectivityService.isOnline();

    if (!isOnline) {
      // Save to local database for offline mode
      final pendingId = await _localDb.savePendingVisit(visitData);
      
      // Generate a temporary visit number for offline mode
      final tempVisitNumber = 'OFFLINE-${DateTime.now().millisecondsSinceEpoch}';
      
      // Create a temporary Visit object for offline use
      // Note: This won't have a real ID from server, but allows the UI to work
      return Visit(
        id: -pendingId, // Negative ID indicates offline visit
        visitNumber: tempVisitNumber,
        visitorId: visitData['visitor']?['id'] ?? 0,
        visitorName: visitData['visitor']?['fullName'] ?? 'Unknown',
        carPlate: visitData['carPlate'],
        carImageUrl: null,
        departmentId: visitData['departmentId'] ?? 0,
        departmentName: 'Unknown', // Will be updated on sync
        employeeToVisit: visitData['employeeToVisit'] ?? '',
        visitReason: visitData['visitReason'],
        expectedDurationHours: visitData['expectedDurationHours'],
        status: 'checkedin',
        checkInAt: DateTime.now(),
        checkOutAt: null,
        createdByUserId: 0,
        createdByUserName: 'Offline',
        createdAt: DateTime.now(),
      );
    }

    // Online mode - try to send to server
    try {
      final response = await _apiClient.post(
        ApiEndpoints.visits,
        data: visitData,
      );
      final data = response.data as Map<String, dynamic>;
      final visit = Visit.fromJson(data);
      
      // Cache the visit for offline viewing
      await _localDb.cacheVisit(visit.toJson());
      
      // Save visitor history
      await _saveVisitorHistory(visitData, visit);
      
      return visit;
    } catch (e) {
      // If API call fails, save to local database as fallback
      final pendingId = await _localDb.savePendingVisit(visitData);
      final tempVisitNumber = 'OFFLINE-${DateTime.now().millisecondsSinceEpoch}';
      
      final offlineVisit = Visit(
        id: -pendingId,
        visitNumber: tempVisitNumber,
        visitorId: visitData['visitor']?['id'] ?? 0,
        visitorName: visitData['visitor']?['fullName'] ?? 'Unknown',
        carPlate: visitData['carPlate'],
        carImageUrl: null,
        departmentId: visitData['departmentId'] ?? 0,
        departmentName: 'Unknown',
        employeeToVisit: visitData['employeeToVisit'] ?? '',
        visitReason: visitData['visitReason'],
        expectedDurationHours: visitData['expectedDurationHours'],
        status: 'checkedin',
        checkInAt: DateTime.now(),
        checkOutAt: null,
        createdByUserId: 0,
        createdByUserName: 'Offline',
        createdAt: DateTime.now(),
      );
      
      // Save visitor history even for offline visits
      await _saveVisitorHistory(visitData, offlineVisit);
      
      return offlineVisit;
    }
  }

  /// Save visitor history to local database
  Future<void> _saveVisitorHistory(Map<String, dynamic> visitData, Visit visit) async {
    try {
      final visitor = visitData['visitor'] as Map<String, dynamic>?;
      if (visitor == null) return;

      await _localDb.saveVisitorHistory(
        visitorId: visit.visitorId > 0 ? visit.visitorId : null,
        visitorName: visitor['fullName'] as String? ?? visit.visitorName,
        nationalId: visitor['nationalId'] as String?,
        phone: visitor['phone'] as String?,
        company: visitor['company'] as String?,
        personImageUrl: visitor['personImageUrl'] as String?,
        idCardImageUrl: visitor['idCardImageUrl'] as String?,
        departmentId: visit.departmentId,
        departmentName: visit.departmentName,
        employeeVisited: visit.employeeToVisit,
        visitState: visit.status,
        notes: visit.visitReason,
      );
    } catch (e) {
      // Silently fail - visitor history is not critical
      print('Failed to save visitor history: $e');
    }
  }

  /// Get active visits with optional search (with offline support)
  /// Only returns visits with status = "ongoing"
  Future<List<Visit>> getActiveVisits({String? search}) async {
    final isOnline = await _connectivityService.isOnline();

    if (isOnline) {
      try {
        final response = await _apiClient.get(
          ApiEndpoints.activeVisits(search: search),
        );
        final data = response.data as List<dynamic>;
        final allVisits = data.map((json) => Visit.fromJson(json as Map<String, dynamic>)).toList();
        
        // Filter to only show active (checkedin) visits
        final ongoingVisits = allVisits.where((visit) => visit.status.toLowerCase() == 'checkedin').toList();
        
        // Cache all visits for offline viewing
        for (final visit in allVisits) {
          await _localDb.cacheVisit(visit.toJson());
        }
        
        // Also get pending offline visits (these are always ongoing)
        final pendingVisits = await _getPendingVisitsAsVisits();
        ongoingVisits.addAll(pendingVisits);
        
        return ongoingVisits;
      } catch (e) {
        // If API fails, try to return cached visits (filtered to checkedin)
        final cachedVisits = await _getCachedVisits(search: search);
        return cachedVisits.where((visit) => visit.status.toLowerCase() == 'checkedin').toList();
      }
    } else {
      // Offline mode - return cached and pending visits (filtered to checkedin)
      final cachedVisits = await _getCachedVisits(search: search);
      final ongoingCached = cachedVisits.where((visit) => visit.status.toLowerCase() == 'checkedin').toList();
      final pendingVisits = await _getPendingVisitsAsVisits();
      ongoingCached.addAll(pendingVisits);
      return ongoingCached;
    }
  }

  /// Get cached visits from local database
  Future<List<Visit>> _getCachedVisits({String? search}) async {
    final cachedData = await _localDb.getCachedVisits(search: search);
    return cachedData.map((json) => Visit.fromJson(json)).toList();
  }

  /// Get pending visits as Visit objects
  Future<List<Visit>> _getPendingVisitsAsVisits() async {
    final pendingData = await _localDb.getPendingVisits();
    return pendingData.map((pending) {
      final visitData = pending['visit_data'] as Map<String, dynamic>;
      final tempVisitNumber = 'OFFLINE-${pending['id']}';
      
      return Visit(
        id: -(pending['id'] as int),
        visitNumber: tempVisitNumber,
        visitorId: visitData['visitor']?['id'] ?? 0,
        visitorName: visitData['visitor']?['fullName'] ?? 'Unknown',
        carPlate: visitData['carPlate'],
        carImageUrl: null,
        departmentId: visitData['departmentId'] ?? 0,
        departmentName: 'Unknown',
        employeeToVisit: visitData['employeeToVisit'] ?? '',
        visitReason: visitData['visitReason'],
        expectedDurationHours: visitData['expectedDurationHours'],
        status: 'checkedin',
        checkInAt: DateTime.parse(pending['created_at'] as String),
        checkOutAt: null,
        createdByUserId: 0,
        createdByUserName: 'Offline',
        createdAt: DateTime.parse(pending['created_at'] as String),
      );
    }).toList();
  }

  /// Get visit by visit number
  Future<Visit> getVisitByNumber(String visitNumber) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.visitByNumber(visitNumber),
      );
      final data = response.data as Map<String, dynamic>;
      return Visit.fromJson(data);
    } catch (e) {
      rethrow;
    }
  }

  /// Checkout a visit by visit number
  Future<Visit> checkoutVisit(String visitNumber) async {
    try {
      // Get visit first to calculate duration
      final visit = await getVisitByNumber(visitNumber);
      final checkInTime = visit.checkInAt;
      final checkOutTime = DateTime.now();
      final duration = checkOutTime.difference(checkInTime);
      final durationHours = duration.inHours;
      final durationMinutes = duration.inMinutes % 60;

      final response = await _apiClient.post(
        ApiEndpoints.checkoutVisit(visitNumber),
      );
      final data = response.data as Map<String, dynamic>;
      final checkedOutVisit = Visit.fromJson(data);
      
      // Update visitor history with checkout info
      await _updateVisitorHistoryOnCheckout(checkedOutVisit, durationHours, durationMinutes);
      
      return checkedOutVisit;
    } catch (e) {
      rethrow;
    }
  }

  /// Update visitor history when visit is checked out
  Future<void> _updateVisitorHistoryOnCheckout(Visit visit, int hours, int minutes) async {
    try {
      // Find visitor by name
      final visitor = await _localDb.getVisitorByIdentifier(name: visit.visitorName);
      if (visitor != null) {
        final state = 'Completed - Stayed ${hours}h ${minutes}m';
        await _localDb.updateVisitorNotes(
          visitor['id'] as int,
          'Last visit completed. Duration: ${hours}h ${minutes}m',
          state,
        );
      }
    } catch (e) {
      // Silently fail
      print('Failed to update visitor history on checkout: $e');
    }
  }
}

