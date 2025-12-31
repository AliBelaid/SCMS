import '../../../data/services/api_client.dart';
import '../../../data/services/visits_api.dart';
import '../../../data/services/visitors_api.dart';
import '../../../data/models/visit.dart';
import '../../../data/models/visitor.dart';
import 'notification_service.dart';
import 'package:flutter/material.dart';

/// Service to check for blocked visitors with active visits
class BlockedVisitorChecker {
  final ApiClient _apiClient;
  final VisitsApi _visitsApi;
  final VisitorsApi _visitorsApi;

  BlockedVisitorChecker(this._apiClient)
      : _visitsApi = VisitsApi(_apiClient),
        _visitorsApi = VisitorsApi(_apiClient);

  /// Check for blocked visitors with active visits and show alerts
  static Future<void> checkAndShowAlerts(BuildContext context) async {
    try {
      final apiClient = ApiClient();
      final visitsApi = VisitsApi(apiClient);
      final visitorsApi = VisitorsApi(apiClient);

      // Get all active visits
      final activeVisits = await visitsApi.getActiveVisits();

      // Check each visit's visitor for blocked status
      for (final visit in activeVisits) {
        if (visit.visitorId > 0) {
          try {
            // Get visitor profile to check blocked status
            Visitor? foundVisitor;
            try {
              final profile = await visitorsApi.getVisitorProfile(visit.visitorId);
              if (profile['visitor'] != null) {
                foundVisitor = Visitor.fromJson(
                  profile['visitor'] as Map<String, dynamic>,
                );
              }
            } catch (e) {
              // Ignore errors
              print('Error getting visitor profile ${visit.visitorId}: $e');
            }

            if (foundVisitor != null && foundVisitor.isBlocked) {
              // Show alert for blocked visitor
              if (context.mounted) {
                // Capture visitor in local variable for closure (non-nullable after null check)
                final visitor = foundVisitor!;
                NotificationService.showBlockedVisitorAlert(
                  context,
                  visitorName: visitor.fullName,
                  blockReason: null, // Could be added to visitor model
                  onCallVisitor: () {
                    // Open phone dialer
                    // You can use url_launcher package for this
                    print('Call visitor: ${visitor.phone ?? "No phone"}');
                  },
                );
                // Only show one alert at a time
                break;
              }
            }
          } catch (e) {
            // Ignore individual visitor lookup errors
            print('Error checking visitor ${visit.visitorId}: $e');
          }
        }
      }
    } catch (e) {
      print('Error checking blocked visitors: $e');
    }
  }

  /// Check a specific visitor and show alert if blocked
  static Future<void> checkVisitorAndShowAlert(
    BuildContext context,
    int visitorId,
    String visitorName,
  ) async {
    try {
      final apiClient = ApiClient();
      final visitorsApi = VisitorsApi(apiClient);

      final profile = await visitorsApi.getVisitorProfile(visitorId);
      if (profile['visitor'] != null) {
        final visitor = Visitor.fromJson(
          profile['visitor'] as Map<String, dynamic>,
        );

        if (visitor.isBlocked && context.mounted) {
          NotificationService.showBlockedVisitorAlert(
            context,
            visitorName: visitor.fullName,
            blockReason: null,
            onCallVisitor: () {
              print('Call visitor: ${visitor.phone ?? "No phone"}');
            },
          );
        }
      }
    } catch (e) {
      print('Error checking visitor: $e');
    }
  }
}

