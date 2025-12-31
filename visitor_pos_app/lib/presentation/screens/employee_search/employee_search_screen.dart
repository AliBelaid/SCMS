import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../core/constants/ar_text.dart';
import '../../../data/services/api_client.dart';
import '../../../data/services/employees_api.dart';
import '../../../data/models/employee.dart';
import '../../../core/utils/image_utils.dart';
import '../employee_profile/employee_profile_screen.dart';

class EmployeeSearchScreen extends StatefulWidget {
  const EmployeeSearchScreen({super.key});

  @override
  State<EmployeeSearchScreen> createState() => _EmployeeSearchScreenState();
}

class _EmployeeSearchScreenState extends State<EmployeeSearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final EmployeesApi _employeesApi = EmployeesApi(ApiClient());
  
  List<Employee> _searchResults = [];
  bool _isSearching = false;
  String? _errorMessage;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _searchEmployees() async {
    final searchTerm = _searchController.text.trim();
    if (searchTerm.isEmpty) {
      setState(() {
        _searchResults = [];
        _errorMessage = null;
      });
      return;
    }

    setState(() {
      _isSearching = true;
      _errorMessage = null;
      _searchResults = [];
    });

    try {
      final employee = await _employeesApi.getEmployeeByIdentifier(
        employeeId: searchTerm,
        name: searchTerm,
      );

      if (mounted) {
        if (employee != null) {
          setState(() {
            _searchResults = [employee];
            _errorMessage = null;
          });
        } else {
          setState(() {
            _searchResults = [];
            _errorMessage = ArText.employeeNotFound;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _searchResults = [];
          _errorMessage = '${ArText.error}: ${e.toString()}';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSearching = false;
        });
      }
    }
  }

  void _navigateToEmployeeProfile(Employee employee) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EmployeeProfileScreen(employeeId: employee.id),
      ),
    );
  }

  String _resolveImageUrl(String? imagePath) {
    return ImageUtils.resolveImageUrl(imagePath);
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final screenWidth = size.width;

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text(ArText.searchEmployees, style: AppStyles.heading3),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
        ),
        body: Column(
          children: [
            // Search bar
            Padding(
              padding: EdgeInsets.all(screenWidth * 0.03),
              child: TextField(
                controller: _searchController,
                style: AppStyles.bodyLarge,
                decoration: AppStyles.inputDecoration(
                  '${ArText.search} ${ArText.employee} (${ArText.employeeId} / ${ArText.employeeName})',
                ).copyWith(
                  suffixIcon: _isSearching
                      ? const Padding(
                          padding: EdgeInsets.all(12.0),
                          child: SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        )
                      : IconButton(
                          icon: const Icon(Icons.search),
                          onPressed: _searchEmployees,
                        ),
                ),
                onSubmitted: (_) => _searchEmployees(),
              ),
            ),

            // Error message
            if (_errorMessage != null)
              Padding(
                padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.03),
                child: Card(
                  color: AppColors.error.withOpacity(0.1),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: AppColors.error),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: AppStyles.bodyMedium.copyWith(
                              color: AppColors.error,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            // Search results
            Expanded(
              child: _searchResults.isEmpty && !_isSearching && _errorMessage == null
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.search,
                            size: 64,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            ArText.searchEmployeesHint,
                            style: AppStyles.bodyLarge.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: EdgeInsets.all(screenWidth * 0.03),
                      itemCount: _searchResults.length,
                      itemBuilder: (context, index) {
                        final employee = _searchResults[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          elevation: 2,
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(12),
                            leading: CircleAvatar(
                              radius: 30,
                              backgroundColor: AppColors.primary.withOpacity(0.1),
                              backgroundImage: employee.faceImageUrl != null &&
                                      employee.faceImageUrl!.isNotEmpty
                                  ? NetworkImage(_resolveImageUrl(employee.faceImageUrl))
                                  : null,
                              child: employee.faceImageUrl == null ||
                                      employee.faceImageUrl!.isEmpty
                                  ? Icon(
                                      Icons.person,
                                      size: 30,
                                      color: AppColors.primary,
                                    )
                                  : null,
                            ),
                            title: Text(
                              employee.employeeName,
                              style: AppStyles.bodyLarge.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Text(
                                  '${ArText.employeeId}: ${employee.employeeId}',
                                  style: AppStyles.bodyMedium,
                                ),
                                if (employee.departmentName != null)
                                  Text(
                                    '${ArText.department}: ${employee.departmentName}',
                                    style: AppStyles.bodyMedium,
                                  ),
                              ],
                            ),
                            trailing: const Icon(
                              Icons.arrow_forward_ios,
                              size: 16,
                            ),
                            onTap: () => _navigateToEmployeeProfile(employee),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

