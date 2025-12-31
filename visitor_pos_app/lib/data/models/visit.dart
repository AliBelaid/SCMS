import '../../core/utils/formatters.dart';

/// Visit Model
class Visit {
  final int id;
  final String visitNumber;
  final int visitorId;
  final String visitorName;
  final String? carPlate;
  final String? carImageUrl;
  final int departmentId;
  final String departmentName;
  final String employeeToVisit;
  final String? visitReason;
  final int? expectedDurationHours;
  final String status; // 'checkedin' | 'checkedout' | 'rejected'
  final DateTime checkInAt;
  final DateTime? checkOutAt;
  final int createdByUserId;
  final String createdByUserName;
  final DateTime createdAt;

  Visit({
    required this.id,
    required this.visitNumber,
    required this.visitorId,
    required this.visitorName,
    this.carPlate,
    this.carImageUrl,
    required this.departmentId,
    required this.departmentName,
    required this.employeeToVisit,
    this.visitReason,
    this.expectedDurationHours,
    required this.status,
    required this.checkInAt,
    this.checkOutAt,
    required this.createdByUserId,
    required this.createdByUserName,
    required this.createdAt,
  });

  factory Visit.fromJson(Map<String, dynamic> json) {
    return Visit(
      id: json['id'] as int,
      visitNumber: json['visitNumber'] as String,
      visitorId: json['visitorId'] as int,
      visitorName: json['visitorName'] as String,
      carPlate: json['carPlate'] as String?,
      carImageUrl: json['carImageUrl'] as String?,
      departmentId: json['departmentId'] as int,
      departmentName: json['departmentName'] as String,
      employeeToVisit: json['employeeToVisit'] as String,
      visitReason: json['visitReason'] as String?,
      expectedDurationHours: json['expectedDurationHours'] as int?,
      status: json['status'] as String,
      checkInAt:
          Formatters.parseDateTimeFromApi(json['checkInAt'] as String?) ??
          DateTime.now(),
      checkOutAt: Formatters.parseDateTimeFromApi(
        json['checkOutAt'] as String?,
      ),
      createdByUserId: json['createdByUserId'] as int,
      createdByUserName: json['createdByUserName'] as String,
      createdAt:
          Formatters.parseDateTimeFromApi(json['createdAt'] as String?) ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'visitNumber': visitNumber,
      'visitorId': visitorId,
      'visitorName': visitorName,
      'carPlate': carPlate,
      'carImageUrl': carImageUrl,
      'departmentId': departmentId,
      'departmentName': departmentName,
      'employeeToVisit': employeeToVisit,
      'visitReason': visitReason,
      'expectedDurationHours': expectedDurationHours,
      'status': status,
      'checkInAt': Formatters.formatDateTimeForApi(checkInAt),
      'checkOutAt': checkOutAt != null
          ? Formatters.formatDateTimeForApi(checkOutAt!)
          : null,
      'createdByUserId': createdByUserId,
      'createdByUserName': createdByUserName,
      'createdAt': Formatters.formatDateTimeForApi(createdAt),
    };
  }

  bool get isOngoing => status == 'checkedin';
  bool get isCompleted => status == 'checkedout';
}
