import 'package:intl/intl.dart';

/// Date and Time Formatters
class Formatters {
  static final DateFormat dateFormat = DateFormat('yyyy-MM-dd');
  static final DateFormat dateTimeFormat = DateFormat('yyyy-MM-dd HH:mm:ss');
  static final DateFormat displayDateFormat = DateFormat('dd/MM/yyyy');
  static final DateFormat displayDateTimeFormat = DateFormat('dd/MM/yyyy HH:mm');
  static final DateFormat timeFormat = DateFormat('HH:mm');
  
  /// Format date for API (YYYY-MM-DD)
  static String formatDateForApi(DateTime date) {
    return dateFormat.format(date);
  }
  
  /// Format date-time for API (YYYY-MM-DD HH:mm:ss)
  static String formatDateTimeForApi(DateTime dateTime) {
    return dateTimeFormat.format(dateTime);
  }
  
  /// Format date for display (DD/MM/YYYY)
  static String formatDateForDisplay(DateTime date) {
    return displayDateFormat.format(date);
  }
  
  /// Format date-time for display (DD/MM/YYYY HH:mm)
  static String formatDateTimeForDisplay(DateTime dateTime) {
    return displayDateTimeFormat.format(dateTime);
  }
  
  /// Parse date from API string
  static DateTime? parseDateFromApi(String? dateString) {
    if (dateString == null || dateString.isEmpty) return null;
    try {
      return dateFormat.parse(dateString);
    } catch (e) {
      try {
        return dateTimeFormat.parse(dateString);
      } catch (e) {
        return null;
      }
    }
  }
  
  /// Parse date-time from API string
  static DateTime? parseDateTimeFromApi(String? dateString) {
    if (dateString == null || dateString.isEmpty) return null;
    try {
      return dateTimeFormat.parse(dateString);
    } catch (e) {
      return null;
    }
  }
}

