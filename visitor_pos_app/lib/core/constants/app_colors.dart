import 'package:flutter/material.dart';

/// App Color Constants
/// Modern professional color scheme optimized for POS touch screens
class AppColors {
  // Primary colors - Modern gradient blue
  static const Color primary = Color(0xFF1E3A8A); // Deep Blue
  static const Color primaryDark = Color(0xFF1E40AF);
  static const Color primaryLight = Color(0xFF3B82F6);
  static const Color primaryGradientStart = Color(0xFF1E3A8A);
  static const Color primaryGradientEnd = Color(0xFF3B82F6);
  
  // Secondary colors - Professional teal/cyan
  static const Color secondary = Color(0xFF0891B2); // Cyan
  static const Color secondaryLight = Color(0xFF06B6D4);
  
  // Accent colors
  static const Color accent = Color(0xFFF59E0B); // Amber/Gold
  static const Color success = Color(0xFF10B981); // Emerald Green
  static const Color error = Color(0xFFEF4444); // Red
  static const Color warning = Color(0xFFF59E0B); // Amber
  static const Color info = Color(0xFF3B82F6); // Blue
  
  // Background colors - Clean modern
  static const Color background = Color(0xFFF8FAFC); // Light gray-blue
  static const Color backgroundDark = Color(0xFFE2E8F0);
  static const Color surface = Colors.white;
  static const Color surfaceLight = Color(0xFFFAFAFA);
  
  // Card colors with elevation
  static const Color cardPrimary = Colors.white;
  static const Color cardSecondary = Color(0xFFF1F5F9);
  
  // Text colors
  static const Color textPrimary = Color(0xFF1E293B); // Slate-800
  static const Color textSecondary = Color(0xFF64748B); // Slate-500
  static const Color textTertiary = Color(0xFF94A3B8); // Slate-400
  static const Color textOnPrimary = Colors.white;
  
  // Button colors
  static const Color buttonPrimary = primary;
  static const Color buttonSecondary = secondary;
  static const Color buttonSuccess = success;
  static const Color buttonDanger = error;
  
  // Border and divider colors
  static const Color border = Color(0xFFE2E8F0);
  static const Color divider = Color(0xFFCBD5E1);
  
  // Shadow colors
  static const Color shadow = Color(0x1A000000);
  static const Color shadowLight = Color(0x0D000000);
  
  // Gradient colors for dashboard
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryGradientStart, primaryGradientEnd],
  );
  
  static const LinearGradient successGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF10B981), Color(0xFF34D399)],
  );
  
  static const LinearGradient warningGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFF59E0B), Color(0xFFFBBF24)],
  );
}

