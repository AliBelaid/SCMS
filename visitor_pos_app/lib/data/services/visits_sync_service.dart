import '../../core/utils/connectivity_service.dart';
import 'local_database.dart';
import 'visits_api.dart';
import '../models/visit.dart';

/// Visits Sync Service
/// Handles syncing pending visits when internet is available
class VisitsSyncService {
  final LocalDatabase _localDb = LocalDatabase();
  final ConnectivityService _connectivityService = ConnectivityService();
  final VisitsApi _visitsApi;

  VisitsSyncService(this._visitsApi);

  /// Sync all pending visits to server
  Future<SyncResult> syncPendingVisits() async {
    final isOnline = await _connectivityService.isOnline();
    if (!isOnline) {
      return SyncResult(
        success: false,
        message: 'No internet connection',
        syncedCount: 0,
        failedCount: 0,
      );
    }

    final pendingVisits = await _localDb.getPendingVisits();
    if (pendingVisits.isEmpty) {
      return SyncResult(
        success: true,
        message: 'No pending visits to sync',
        syncedCount: 0,
        failedCount: 0,
      );
    }

    int syncedCount = 0;
    int failedCount = 0;
    List<String> errors = [];

    for (final pendingVisit in pendingVisits) {
      try {
        final visitData = pendingVisit['visit_data'] as Map<String, dynamic>;
        final visit = await _visitsApi.createVisit(visitData);

        // Mark as synced and cache the visit
        await _localDb.markVisitAsSynced(pendingVisit['id'] as int);
        await _localDb.cacheVisit(visit.toJson());
        await _localDb.deletePendingVisit(pendingVisit['id'] as int);

        syncedCount++;
      } catch (e) {
        failedCount++;
        errors.add('Visit ${pendingVisit['id']}: ${e.toString()}');
      }
    }

    return SyncResult(
      success: failedCount == 0,
      message: failedCount == 0
          ? 'Successfully synced $syncedCount visit(s)'
          : 'Synced $syncedCount, failed $failedCount',
      syncedCount: syncedCount,
      failedCount: failedCount,
      errors: errors,
    );
  }

  /// Auto-sync in background (call this periodically)
  Future<void> autoSync() async {
    try {
      await syncPendingVisits();
      // Clean up old synced visits
      await _localDb.clearOldSyncedVisits();
    } catch (e) {
      // Silently fail in background sync
      print('Auto-sync error: $e');
    }
  }

  /// Get pending visits count
  Future<int> getPendingCount() async {
    return await _localDb.getPendingVisitsCount();
  }
}

/// Sync Result Model
class SyncResult {
  final bool success;
  final String message;
  final int syncedCount;
  final int failedCount;
  final List<String> errors;

  SyncResult({
    required this.success,
    required this.message,
    required this.syncedCount,
    required this.failedCount,
    this.errors = const [],
  });
}

