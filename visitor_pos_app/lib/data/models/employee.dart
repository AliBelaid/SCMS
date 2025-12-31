/// Employee Model
class Employee {
  final int id;
  final String employeeId; // Barcode/ID for scanning
  final String employeeName;
  final int? departmentId;
  final String? departmentName;
  final String? cardImageUrl;
  final String? faceImageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isActive;

  Employee({
    required this.id,
    required this.employeeId,
    required this.employeeName,
    this.departmentId,
    this.departmentName,
    this.cardImageUrl,
    this.faceImageUrl,
    required this.createdAt,
    required this.updatedAt,
    required this.isActive,
  });

  factory Employee.fromJson(Map<String, dynamic> json) {
    return Employee(
      id: json['id'] as int,
      employeeId: json['employeeId'] as String,
      employeeName: json['employeeName'] as String,
      departmentId: json['departmentId'] as int?,
      departmentName: json['departmentName'] as String?,
      cardImageUrl: json['cardImageUrl'] as String?,
      faceImageUrl: json['faceImageUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'employeeId': employeeId,
      'employeeName': employeeName,
      'departmentId': departmentId,
      'departmentName': departmentName,
      'cardImageUrl': cardImageUrl,
      'faceImageUrl': faceImageUrl,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isActive': isActive,
    };
  }
}

