/// Visit Summary / Report Model
class VisitSummary {
  final int totalVisits;
  final int totalCompleted;
  final int totalOngoing;
  final List<DepartmentVisitCount> visitsPerDepartment;
  final List<UserVisitCount>? visitsPerUser;

  VisitSummary({
    required this.totalVisits,
    required this.totalCompleted,
    required this.totalOngoing,
    required this.visitsPerDepartment,
    this.visitsPerUser,
  });

  factory VisitSummary.fromJson(Map<String, dynamic> json) {
    return VisitSummary(
      totalVisits: json['totalVisits'] as int? ?? 0,
      totalCompleted: json['totalCompleted'] as int? ?? 0,
      totalOngoing: json['totalOngoing'] as int? ?? 0,
      visitsPerDepartment: (json['visitsPerDepartment'] as List<dynamic>?)
              ?.map((e) => DepartmentVisitCount.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      visitsPerUser: (json['visitsPerUser'] as List<dynamic>?)
          ?.map((e) => UserVisitCount.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalVisits': totalVisits,
      'totalCompleted': totalCompleted,
      'totalOngoing': totalOngoing,
      'visitsPerDepartment': visitsPerDepartment.map((e) => e.toJson()).toList(),
      'visitsPerUser': visitsPerUser?.map((e) => e.toJson()).toList(),
    };
  }
}

class DepartmentVisitCount {
  final int departmentId;
  final String departmentName;
  final int visitCount;

  DepartmentVisitCount({
    required this.departmentId,
    required this.departmentName,
    required this.visitCount,
  });

  factory DepartmentVisitCount.fromJson(Map<String, dynamic> json) {
    return DepartmentVisitCount(
      departmentId: json['departmentId'] as int,
      departmentName: json['departmentName'] as String,
      visitCount: json['visitCount'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'departmentId': departmentId,
      'departmentName': departmentName,
      'visitCount': visitCount,
    };
  }
}

class UserVisitCount {
  final int userId;
  final String userName;
  final int visitCount;

  UserVisitCount({
    required this.userId,
    required this.userName,
    required this.visitCount,
  });

  factory UserVisitCount.fromJson(Map<String, dynamic> json) {
    return UserVisitCount(
      userId: json['userId'] as int,
      userName: json['userName'] as String,
      visitCount: json['visitCount'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'userName': userName,
      'visitCount': visitCount,
    };
  }
}

