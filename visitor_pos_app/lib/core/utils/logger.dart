import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:intl/intl.dart';

/// Logger Service
/// Logs system events to file for debugging and auditing
class Logger {
  static final Logger _instance = Logger._internal();
  factory Logger() => _instance;
  Logger._internal();

  static const String _logFileName = 'visitor_pos_app.log';
  File? _logFile;

  /// Initialize logger
  Future<void> initialize() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      _logFile = File('${directory.path}/$_logFileName');
      
      // Log initialization
      await log('SYSTEM', 'Logger initialized', 'System path: ${directory.path}');
    } catch (e) {
      // If logging fails, continue without it
      print('Failed to initialize logger: $e');
    }
  }

  /// Log a message
  /// 
  /// [category] - Category of log (SYSTEM, AUTH, VISIT, ERROR, etc.)
  /// [message] - Log message
  /// [details] - Additional details (optional)
  Future<void> log(String category, String message, [String? details]) async {
    try {
      if (_logFile == null) {
        await initialize();
      }

      final timestamp = DateFormat('yyyy-MM-dd HH:mm:ss').format(DateTime.now());
      final logEntry = '[$timestamp] [$category] $message${details != null ? ' | $details' : ''}\n';

      if (_logFile != null) {
        await _logFile!.writeAsString(logEntry, mode: FileMode.append);
      }
      
      // Also print to console in debug mode
      // ignore: avoid_print
      print(logEntry.trim());
    } catch (e) {
      // Silently fail if logging fails
      // ignore: avoid_print
      print('Logging error: $e');
    }
  }

  /// Log error
  Future<void> logError(String message, [Object? error, StackTrace? stackTrace]) async {
    await log('ERROR', message, 
      error != null ? 'Error: $error${stackTrace != null ? '\n$stackTrace' : ''}' : null);
  }

  /// Log authentication event
  Future<void> logAuth(String action, String userName, [bool? success]) async {
    await log('AUTH', '$action: $userName', success != null ? 'Success: $success' : null);
  }

  /// Log visit event
  Future<void> logVisit(String action, String visitNumber, [String? details]) async {
    await log('VISIT', '$action: $visitNumber', details);
  }

  /// Get log file path
  Future<String?> getLogPath() async {
    if (_logFile == null) {
      await initialize();
    }
    return _logFile?.path;
  }

  /// Read recent logs
  Future<List<String>> getRecentLogs({int lines = 100}) async {
    try {
      if (_logFile == null || !await _logFile!.exists()) {
        return [];
      }

      final content = await _logFile!.readAsString();
      final allLines = content.split('\n').where((line) => line.isNotEmpty).toList();
      
      if (allLines.length <= lines) {
        return allLines;
      }
      
      return allLines.sublist(allLines.length - lines);
    } catch (e) {
      return [];
    }
  }

  /// Clear logs
  Future<void> clearLogs() async {
    try {
      if (_logFile != null && await _logFile!.exists()) {
        await _logFile!.writeAsString('');
        await log('SYSTEM', 'Logs cleared');
      }
    } catch (e) {
      // ignore
    }
  }
}

