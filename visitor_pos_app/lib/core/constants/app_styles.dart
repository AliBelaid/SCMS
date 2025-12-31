import 'package:flutter/material.dart';
import 'app_colors.dart';

/// App Styles for POS-friendly UI
/// Optimized for smaller POS device screens
class AppStyles {
  // Text styles - Scaled down for POS devices
  static const TextStyle heading1 = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );

  static const TextStyle heading2 = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );

  static const TextStyle heading3 = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodyLarge = TextStyle(
    fontSize: 14,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontSize: 13,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodySmall = TextStyle(
    fontSize: 12,
    color: AppColors.textSecondary,
  );

  // Button styles - Smaller for POS devices
  static ButtonStyle primaryButtonStyle = ElevatedButton.styleFrom(
    backgroundColor: AppColors.buttonPrimary,
    foregroundColor: Colors.white,
    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
    textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    minimumSize: const Size(double.infinity, 48),
  );

  static ButtonStyle secondaryButtonStyle = ElevatedButton.styleFrom(
    backgroundColor: AppColors.buttonSecondary,
    foregroundColor: Colors.white,
    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
    textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    minimumSize: const Size(double.infinity, 48),
  );

  static ButtonStyle dangerButtonStyle = ElevatedButton.styleFrom(
    backgroundColor: AppColors.error,
    foregroundColor: Colors.white,
    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
    textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    minimumSize: const Size(double.infinity, 48),
  );

  // Card style
  static BoxDecoration cardDecoration = BoxDecoration(
    color: AppColors.surface,
    borderRadius: BorderRadius.circular(12),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.1),
        blurRadius: 8,
        offset: const Offset(0, 2),
      ),
    ],
  );

  // Input field style - Smaller for POS devices
  static InputDecoration inputDecoration(String label) => InputDecoration(
    labelText: label,
    labelStyle: const TextStyle(fontSize: 14),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: AppColors.textSecondary),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: AppColors.textSecondary),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: AppColors.primary, width: 2),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: AppColors.error),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
    filled: true,
    fillColor: AppColors.surface,
  );
}
