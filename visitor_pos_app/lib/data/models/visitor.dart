import '../../core/utils/formatters.dart';

/// Visitor Model
class Visitor {
  final int id;
  final String fullName;
  final String? nationalId;
  final String? phone;
  final String? company;
  final String? medicalNotes;
  final String? personImageUrl;
  final String? idCardImageUrl;
  final bool isBlocked;
  final DateTime createdAt;

  Visitor({
    required this.id,
    required this.fullName,
    this.nationalId,
    this.phone,
    this.company,
    this.medicalNotes,
    required this.personImageUrl,
    this.idCardImageUrl,
    this.isBlocked = false,
    required this.createdAt,
  });

  factory Visitor.fromJson(Map<String, dynamic> json) {
    return Visitor(
      id: json['id'] as int,
      fullName: json['fullName'] as String,
      nationalId: json['nationalId'] as String?,
      phone: json['phone'] as String?,
      company: json['company'] as String?,
      medicalNotes: json['medicalNotes'] as String?,
      personImageUrl: json['personImageUrl'] as String? ?? '',
      idCardImageUrl: json['idCardImageUrl'] as String?,
      isBlocked: json['isBlocked'] as bool? ?? false,
      createdAt:
          Formatters.parseDateTimeFromApi(json['createdAt'] as String?) ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'nationalId': nationalId,
      'phone': phone,
      'company': company,
      'medicalNotes': medicalNotes,
      'personImageUrl': personImageUrl,
      'idCardImageUrl': idCardImageUrl,
      'createdAt': Formatters.formatDateTimeForApi(createdAt),
    };
  }
}
