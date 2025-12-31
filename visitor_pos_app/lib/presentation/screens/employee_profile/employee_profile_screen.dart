import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../core/constants/ar_text.dart';
import '../../../data/services/api_client.dart';
import '../../../data/services/employees_api.dart';
import '../../../data/models/employee.dart';
import '../../../core/utils/image_utils.dart';

class EmployeeProfileScreen extends StatefulWidget {
  final int employeeId;

  const EmployeeProfileScreen({
    super.key,
    required this.employeeId,
  });

  @override
  State<EmployeeProfileScreen> createState() => _EmployeeProfileScreenState();
}

class _EmployeeProfileScreenState extends State<EmployeeProfileScreen> {
  final EmployeesApi _employeesApi = EmployeesApi(ApiClient());
  
  Employee? _employee;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadEmployeeProfile();
  }

  Future<void> _loadEmployeeProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final employee = await _employeesApi.getEmployeeById(widget.employeeId);
      if (mounted) {
        setState(() {
          _employee = employee;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = '${ArText.error}: ${e.toString()}';
          _isLoading = false;
        });
      }
    }
  }

  String _resolveImageUrl(String? imagePath) {
    return ImageUtils.resolveImageUrl(imagePath);
  }

  bool _shouldShowImage(String? imagePath) {
    return imagePath != null && imagePath.isNotEmpty;
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final screenWidth = size.width;
    final screenHeight = size.height;

    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text(ArText.employeeProfile, style: AppStyles.heading3),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_errorMessage != null || _employee == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text(ArText.employeeProfile, style: AppStyles.heading3),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error),
              const SizedBox(height: 16),
              Text(
                _errorMessage ?? ArText.error,
                style: AppStyles.bodyLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: Text(ArText.back),
              ),
            ],
          ),
        ),
      );
    }

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text(ArText.employeeProfile, style: AppStyles.heading3),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
        ),
        body: SingleChildScrollView(
          padding: EdgeInsets.all(screenWidth * 0.04),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Employee Info Card
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      // Face Image
                      CircleAvatar(
                        radius: 60,
                        backgroundColor: AppColors.primary.withOpacity(0.1),
                        backgroundImage: _shouldShowImage(_employee!.faceImageUrl)
                            ? NetworkImage(_resolveImageUrl(_employee!.faceImageUrl))
                            : null,
                        child: !_shouldShowImage(_employee!.faceImageUrl)
                            ? Icon(
                                Icons.person,
                                size: 60,
                                color: AppColors.primary,
                              )
                            : null,
                      ),
                      const SizedBox(height: 20),
                      // Employee Name
                      Text(
                        _employee!.employeeName,
                        style: AppStyles.heading2.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      // Employee ID
                      Text(
                        '${ArText.employeeId}: ${_employee!.employeeId}',
                        style: AppStyles.bodyLarge,
                        textAlign: TextAlign.center,
                      ),
                      if (_employee!.departmentName != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          '${ArText.department}: ${_employee!.departmentName}',
                          style: AppStyles.bodyMedium,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Card Image Section
              if (_shouldShowImage(_employee!.cardImageUrl))
                Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.badge, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Text(
                              ArText.employeeCard,
                              style: AppStyles.heading3,
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            _resolveImageUrl(_employee!.cardImageUrl),
                            width: double.infinity,
                            fit: BoxFit.contain,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return SizedBox(
                                height: 200,
                                child: Center(
                                  child: CircularProgressIndicator(
                                    value: loadingProgress.expectedTotalBytes != null
                                        ? loadingProgress.cumulativeBytesLoaded /
                                            loadingProgress.expectedTotalBytes!
                                        : null,
                                  ),
                                ),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                height: 200,
                                color: AppColors.background,
                                child: Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(
                                        Icons.error_outline,
                                        color: AppColors.error,
                                        size: 48,
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        ArText.failedToLoadImage,
                                        style: AppStyles.bodyMedium.copyWith(
                                          color: AppColors.error,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

              const SizedBox(height: 20),

              // Employee Details Card
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        ArText.employeeInformation,
                        style: AppStyles.heading3,
                      ),
                      const Divider(),
                      _buildInfoRow(
                        ArText.employeeName,
                        _employee!.employeeName,
                        Icons.person,
                      ),
                      const SizedBox(height: 12),
                      _buildInfoRow(
                        ArText.employeeId,
                        _employee!.employeeId,
                        Icons.badge,
                      ),
                      if (_employee!.departmentName != null) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow(
                          ArText.department,
                          _employee!.departmentName!,
                          Icons.business,
                        ),
                      ],
                      const SizedBox(height: 12),
                      _buildInfoRow(
                        ArText.status,
                        _employee!.isActive ? ArText.active : ArText.inactive,
                        _employee!.isActive ? Icons.check_circle : Icons.cancel,
                        color: _employee!.isActive ? AppColors.success : AppColors.error,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon, {Color? color}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: color ?? AppColors.primary, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppStyles.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: AppStyles.bodyLarge.copyWith(
                  color: color,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

