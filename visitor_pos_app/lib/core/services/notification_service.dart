import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_styles.dart';
import '../../core/constants/ar_text.dart';

/// Notification Service for showing alerts and notifications
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  /// Show a blocked visitor alert dialog
  static Future<void> showBlockedVisitorAlert(
    BuildContext context, {
    required String visitorName,
    String? blockReason,
    required VoidCallback onCallVisitor,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.warning, color: AppColors.error, size: 32),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                '${ArText.visitor} ${ArText.isBlocked}',
                style: AppStyles.heading2.copyWith(
                  color: AppColors.error,
                ),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${ArText.visitor} $visitorName ${ArText.isBlocked}.',
              style: AppStyles.bodyLarge,
            ),
            const SizedBox(height: 12),
            if (blockReason != null && blockReason.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${ArText.reason}:',
                      style: AppStyles.bodySmall.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      blockReason,
                      style: AppStyles.bodyMedium,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.warning.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.warning),
              ),
              child: Row(
                children: [
                  const Icon(Icons.phone, color: AppColors.warning),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '${ArText.pleaseCall} $visitorName ${ArText.toLeavePremises}',
                      style: AppStyles.bodyMedium.copyWith(
                        color: AppColors.warning,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(ArText.dismiss),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(context);
              onCallVisitor();
            },
            icon: const Icon(Icons.phone),
            label: Text(ArText.callVisitor),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  /// Show a simple notification banner
  static void showNotification(
    BuildContext context, {
    required String message,
    Color backgroundColor = AppColors.primary,
    Duration duration = const Duration(seconds: 3),
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: backgroundColor,
        duration: duration,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}

