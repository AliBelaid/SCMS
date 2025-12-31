/// User Model
class User {
  final int? id;
  final String userName;
  final String fullName;
  final String role;
  final String? token;

  User({
    this.id,
    required this.userName,
    required this.fullName,
    required this.role,
    this.token,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    // Handle both API response formats:
    // 1. AccountController format: code, description, role, token
    // 2. Standard format: userName, fullName, role, token
    final userName = json['userName'] as String? ?? 
                     json['code'] as String? ?? 
                     '';
    final fullName = json['fullName'] as String? ?? 
                     json['description'] as String? ?? 
                     userName;
    
    return User(
      id: json['id'] as int?,
      userName: userName,
      fullName: fullName,
      role: json['role'] as String? ?? 'Member',
      token: json['token'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userName': userName,
      'fullName': fullName,
      'role': role,
      'token': token,
    };
  }

  User copyWith({
    int? id,
    String? userName,
    String? fullName,
    String? role,
    String? token,
  }) {
    return User(
      id: id ?? this.id,
      userName: userName ?? this.userName,
      fullName: fullName ?? this.fullName,
      role: role ?? this.role,
      token: token ?? this.token,
    );
  }
}

