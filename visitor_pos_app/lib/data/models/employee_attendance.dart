/// Employee Attendance Model (supports both grouped and individual attendance)
class EmployeeAttendance {
  final int id; // AttendanceId for grouped, id for individual
  final int employeeId;
  final String employeeName;
  final String? employeeEmployeeId;
  final DateTime checkInTime; // FirstCheckInTime for grouped
  final DateTime? checkOutTime; // LastCheckOutTime for grouped
  final String? notes;
  final String? departmentName;
  final bool? isCheckedIn; // Explicit flag for grouped DTO

  EmployeeAttendance({
    required this.id,
    required this.employeeId,
    required this.employeeName,
    this.employeeEmployeeId,
    required this.checkInTime,
    this.checkOutTime,
    this.notes,
    this.departmentName,
    this.isCheckedIn,
  });

  factory EmployeeAttendance.fromJson(Map<String, dynamic> json) {
    // Handle both grouped DTO (firstCheckInTime/lastCheckOutTime) and regular DTO (checkInTime/checkOutTime)
    final checkIn = json['firstCheckInTime'] ?? json['checkInTime'];
    final checkOut = json['lastCheckOutTime'] ?? json['checkOutTime'];
    final attendanceId = json['attendanceId'] ?? json['id'];
    final checkedIn = json['isCheckedIn'] ?? (checkOut == null);

    return EmployeeAttendance(
      id: attendanceId as int,
      employeeId: json['employeeId'] as int,
      employeeName: json['employeeName'] as String,
      employeeEmployeeId: json['employeeEmployeeId'] as String?,
      checkInTime: DateTime.parse(checkIn as String),
      checkOutTime: checkOut != null ? DateTime.parse(checkOut as String) : null,
      notes: json['notes'] as String?,
      departmentName: json['departmentName'] as String?,
      isCheckedIn: checkedIn as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'employeeId': employeeId,
      'employeeName': employeeName,
      'employeeEmployeeId': employeeEmployeeId,
      'checkInTime': checkInTime.toIso8601String(),
      'checkOutTime': checkOutTime?.toIso8601String(),
      'notes': notes,
      'departmentName': departmentName,
    };
  }

  /// Check if employee is currently checked in
  bool get isCurrentlyCheckedIn => isCheckedIn ?? checkOutTime == null;

  /// Get duration in minutes (for last check-out time if grouped)
  int? get durationMinutes {
    if (checkOutTime == null) return null;
    return checkOutTime!.difference(checkInTime).inMinutes;
  }
}

