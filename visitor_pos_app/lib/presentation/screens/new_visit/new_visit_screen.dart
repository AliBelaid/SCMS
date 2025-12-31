import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../widgets/pos_button.dart';
import '../../widgets/pos_text_field.dart';
import '../../widgets/loading_overlay.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../core/utils/image_utils.dart';
import '../../../data/services/api_client.dart';
import '../../../data/services/visits_api.dart';
import '../../../data/services/departments_api.dart';
import '../../../data/services/visitors_api.dart';
import '../../../data/services/local_database.dart';
import '../../../data/models/department.dart';
import '../../../data/models/visitor.dart';
import '../../../core/constants/ar_text.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/utils/logger.dart';

/// New Visit Screen
class NewVisitScreen extends StatefulWidget {
  const NewVisitScreen({super.key});

  @override
  State<NewVisitScreen> createState() => _NewVisitScreenState();
}

class _NewVisitScreenState extends State<NewVisitScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _nationalIdController = TextEditingController();
  final _phoneController = TextEditingController();
  final _companyController = TextEditingController();
  final _carPlateController = TextEditingController();
  final _employeeToVisitController = TextEditingController();
  final _visitReasonController = TextEditingController();
  final _expectedDurationController = TextEditingController();

  List<Department> _departments = [];
  Department? _selectedDepartment;
  File? _personImage;
  File? _idCardImage;
  File? _carImage;
  bool _isLoading = false;
  bool _isLoadingDepartments = false;
  final ImagePicker _imagePicker = ImagePicker();
  final LocalDatabase _localDb = LocalDatabase();
  Map<String, dynamic>? _previousVisitor;
  Visitor? _foundVisitor;
  List<String> _cachedEmployees = [];

  @override
  void initState() {
    super.initState();
    _loadDepartments();
    _loadCachedEmployees();

    // Listen to name changes to check for previous visitor
    _fullNameController.addListener(_checkPreviousVisitor);
    _nationalIdController.addListener(_checkPreviousVisitor);
    _phoneController.addListener(_checkPreviousVisitor);
  }

  Future<void> _loadCachedEmployees() async {
    try {
      final employees = await _localDb.getCachedEmployees();
      setState(() {
        _cachedEmployees = employees.map((e) => e['name'] as String).toList();
      });
    } catch (e) {
      // Ignore
    }
  }

  Future<void> _checkPreviousVisitor() async {
    final nationalId = _nationalIdController.text.trim();
    final phone = _phoneController.text.trim();

    if (nationalId.isEmpty && phone.isEmpty) {
      setState(() {
        _previousVisitor = null;
        _foundVisitor = null;
      });
      return;
    }

    try {
      // First check API for visitor
      final apiClient = ApiClient();
      final visitorsApi = VisitorsApi(apiClient);
      final visitor = await visitorsApi.lookupVisitor(
        nationalId: nationalId.isNotEmpty ? nationalId : null,
        phone: phone.isNotEmpty ? phone : null,
      );

      if (visitor != null && mounted) {
        setState(() {
          _foundVisitor = visitor;
        });

        // Check if blocked
        if (visitor.isBlocked) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('${ArText.warning}: ${ArText.visitor} ${ArText.isBlocked}'),
                backgroundColor: AppColors.error,
                duration: const Duration(seconds: 5),
              ),
            );
          }
          return;
        }

        // Auto-fill fields
        if (_fullNameController.text.isEmpty) {
          _fullNameController.text = visitor.fullName;
        }
        if (_companyController.text.isEmpty && visitor.company != null) {
          _companyController.text = visitor.company!;
        }

        // Also check local database for visit history
        final localVisitor = await _localDb.getVisitorByIdentifier(
          nationalId: nationalId.isNotEmpty ? nationalId : null,
          phone: phone.isNotEmpty ? phone : null,
        );

        if (localVisitor != null && mounted) {
          setState(() {
            _previousVisitor = localVisitor;
          });

          if (_selectedDepartment == null &&
              localVisitor['last_department_id'] != null) {
            final deptId = localVisitor['last_department_id'] as int;
            _selectedDepartment = _departments.firstWhere(
              (d) => d.id == deptId,
              orElse: () => _departments.first,
            );
          }
          if (_employeeToVisitController.text.isEmpty &&
              localVisitor['last_employee_visited'] != null) {
            _employeeToVisitController.text =
                localVisitor['last_employee_visited'] as String;
          }
        }
      } else {
        setState(() {
          _foundVisitor = null;
          _previousVisitor = null;
        });
        }
      } catch (e) {
        // Ignore API errors, fall back to local
        try {
          final localVisitor = await _localDb.getVisitorByIdentifier(
            nationalId: nationalId.isNotEmpty ? nationalId : null,
            phone: phone.isNotEmpty ? phone : null,
          );
          if (localVisitor != null && mounted) {
            setState(() {
              _previousVisitor = localVisitor;
            });
          }
        } catch (e2) {
          // Ignore local errors too
        }
      }
    }

  @override
  void dispose() {
    _fullNameController.dispose();
    _nationalIdController.dispose();
    _phoneController.dispose();
    _companyController.dispose();
    _carPlateController.dispose();
    _employeeToVisitController.dispose();
    _visitReasonController.dispose();
    _expectedDurationController.dispose();
    super.dispose();
  }

  Future<void> _loadDepartments() async {
    setState(() {
      _isLoadingDepartments = true;
    });

    try {
      final apiClient = ApiClient();
      final departmentsApi = DepartmentsApi(apiClient);
      final departments = await departmentsApi.getDepartments();
      setState(() {
        _departments = departments;
        _isLoadingDepartments = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingDepartments = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${ArText.failedToLoadDepartments}: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _pickImage(ImageSource source, String type) async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 1920,
        maxHeight: 1080,
      );

      if (image != null) {
        setState(() {
          if (type == 'person') {
            _personImage = File(image.path);
          } else if (type == 'idCard') {
            _idCardImage = File(image.path);
          } else if (type == 'car') {
            _carImage = File(image.path);
          }
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${ArText.failedToPickImage}: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _showImagePickerDialog(String type) {
    final String title = type == 'person'
        ? ArText.personPhoto
        : type == 'idCard'
            ? ArText.idCardPhoto
            : ArText.carPhoto;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: Text(ArText.camera),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera, type);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: Text(ArText.gallery),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery, type);
              },
            ),
          ],
        ),
      ),
    );
  }

      Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // Check if visitor is blocked
    if (_foundVisitor != null && _foundVisitor!.isBlocked) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${ArText.visitor} ${ArText.isBlocked}. ${ArText.cannotCreateVisit}'),
          backgroundColor: AppColors.error,
          duration: const Duration(seconds: 5),
        ),
      );
      return;
    }

    if (_selectedDepartment == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${ArText.pleaseSelect} ${ArText.department}'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final apiClient = ApiClient();
      final visitsApi = VisitsApi(apiClient);

      // Convert images to base64
      final personImageBase64 = await ImageUtils.imageToBase64(_personImage);
      final idCardImageBase64 = await ImageUtils.imageToBase64(_idCardImage);
      final carImageBase64 = await ImageUtils.imageToBase64(_carImage);

      // Prepare visit data
      final visitData = {
        'visitor': {
          'fullName': _fullNameController.text.trim(),
          'nationalId': _nationalIdController.text.trim().isEmpty
              ? null
              : _nationalIdController.text.trim(),
          'phone': _phoneController.text.trim().isEmpty
              ? null
              : _phoneController.text.trim(),
          'company': _companyController.text.trim().isEmpty
              ? null
              : _companyController.text.trim(),
          'personImageBase64': personImageBase64,
          'idCardImageBase64': idCardImageBase64,
        },
        'carPlate': _carPlateController.text.trim().isEmpty
            ? null
            : _carPlateController.text.trim(),
        'carImageBase64': carImageBase64,
        'departmentId': _selectedDepartment!.id,
        'employeeToVisit': _employeeToVisitController.text.trim(),
        'visitReason': _visitReasonController.text.trim().isEmpty
            ? null
            : _visitReasonController.text.trim(),
        'expectedDurationHours': _expectedDurationController.text.trim().isEmpty
            ? null
            : int.tryParse(_expectedDurationController.text.trim()),
      };

      final visit = await visitsApi.createVisit(visitData);

      // Save employee to cache for future use
      final employeeName = _employeeToVisitController.text.trim();
      if (employeeName.isNotEmpty && _selectedDepartment != null) {
        await _localDb.cacheEmployee(
          employeeName,
          _selectedDepartment!.id,
          _selectedDepartment!.name,
        );
        await _loadCachedEmployees();
      }

      await Logger().logVisit(
        'Created',
        visit.visitNumber,
        'Visitor: ${visit.visitorName}',
      );

      setState(() {
        _isLoading = false;
      });

      if (mounted) {
        // Show success dialog
        await _showSuccessDialog(visit);
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${ArText.failedToCreateVisit}: ${e.toString()}'),
            backgroundColor: AppColors.error,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  Future<void> _showSuccessDialog(visit) async {
    final isOffline = visit.id < 0; // Negative ID indicates offline visit

    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text(
          isOffline ? 'Visit Saved Offline!' : 'Visit Created Successfully!',
          style: AppStyles.heading2,
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Visit Number: ${visit.visitNumber}',
              style: AppStyles.heading3,
            ),
            const SizedBox(height: 8),
            Text('${ArText.visitorLabel}: ${visit.visitorName}', style: AppStyles.bodyLarge),
            const SizedBox(height: 8),
            Text(
              'Department: ${visit.departmentName}',
              style: AppStyles.bodyLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'Check-in: ${visit.checkInAt.toString().substring(0, 16)}',
              style: AppStyles.bodyMedium,
            ),
            if (isOffline) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.warning.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.cloud_off, color: AppColors.warning),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Saved offline. Will sync when internet is available.',
                        style: AppStyles.bodySmall.copyWith(
                          color: AppColors.warning,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/visit-details', arguments: visit);
            },
            child: Text(ArText.printReceiptBtn),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _clearForm();
            },
            child: Text(ArText.newVisitBtn),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context); // Go back to home
            },
            child: Text(ArText.doneBtn),
          ),
        ],
      ),
    );
  }

  void _clearForm() {
    _formKey.currentState!.reset();
    setState(() {
      _selectedDepartment = null;
      _personImage = null;
      _idCardImage = null;
      _carImage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final screenWidth = size.width;
    final screenHeight = size.height;
    
    return Directionality(
      textDirection: TextDirection.rtl, // Force RTL for Arabic
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text(ArText.newVisit, style: AppStyles.heading3),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
        ),
      body: LoadingOverlay(
        isLoading: _isLoading,
        message: ArText.loading,
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: screenWidth * 0.04,
                vertical: screenHeight * 0.015,
              ),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight - screenHeight * 0.03,
                ),
                child: IntrinsicHeight(
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                // Visitor Info Section
                _buildSectionTitle(ArText.visitorInformation),
                SizedBox(height: screenHeight * 0.015),
                PosTextField(
                  label: '${ArText.fullName} *',
                  controller: _fullNameController,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return ArText.fullNameRequired;
                    }
                    return null;
                  },
                ),
                SizedBox(height: screenHeight * 0.015),
                PosTextField(
                  label: ArText.nationalIdOptional,
                  controller: _nationalIdController,
                ),
                SizedBox(height: screenHeight * 0.015),
                PosTextField(
                  label: ArText.phoneOptional,
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                ),
                SizedBox(height: screenHeight * 0.015),
                PosTextField(
                  label: ArText.companyOptional,
                  controller: _companyController,
                ),
                SizedBox(height: screenHeight * 0.015),

                // Search Visitor Button
                Card(
                  elevation: 2,
                  child: ListTile(
                    leading: const Icon(Icons.search, color: AppColors.primary),
                    title: Text(
                      ArText.searchVisitors,
                      style: AppStyles.bodyLarge.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    subtitle: Text(
                      'ابحث عن زائر سابق لتعبئة البيانات تلقائياً',
                      style: AppStyles.bodySmall,
                    ),
                    trailing: const Icon(Icons.arrow_forward_ios),
                    onTap: () async {
                      final result = await Navigator.pushNamed(
                        context,
                        '/visitor-search',
                      );
                      if (result != null && result is Visitor) {
                        setState(() {
                          _foundVisitor = result;
                          _fullNameController.text = result.fullName;
                          if (result.nationalId != null) {
                            _nationalIdController.text = result.nationalId!;
                          }
                          if (result.phone != null) {
                            _phoneController.text = result.phone!;
                          }
                          if (result.company != null) {
                            _companyController.text = result.company!;
                          }
                        });
                      }
                    },
                  ),
                ),
                SizedBox(height: screenHeight * 0.015),

                // Visitor found info card
                if (_foundVisitor != null) ...[
                  Container(
                    padding: EdgeInsets.all(screenWidth * 0.03),
                    decoration: BoxDecoration(
                      color: _foundVisitor!.isBlocked
                          ? AppColors.error.withOpacity(0.1)
                          : AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _foundVisitor!.isBlocked
                            ? AppColors.error
                            : AppColors.primary,
                        width: 2,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              _foundVisitor!.isBlocked
                                  ? Icons.block
                                  : Icons.check_circle,
                              color: _foundVisitor!.isBlocked
                                  ? AppColors.error
                                  : AppColors.success,
                              size: 28,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                _foundVisitor!.isBlocked
                                    ? '${ArText.visitor} ${ArText.isBlocked}'
                                    : '${ArText.visitor} ${ArText.visitorFound}',
                                style: AppStyles.heading3.copyWith(
                                  color: _foundVisitor!.isBlocked
                                      ? AppColors.error
                                      : AppColors.success,
                                ),
                              ),
                            ),
                            if (!_foundVisitor!.isBlocked)
                              TextButton(
                                onPressed: () {
                                  Navigator.pushNamed(
                                    context,
                                    '/visitor-profile',
                                    arguments: _foundVisitor!.id,
                                  );
                                },
                                child: Text(ArText.viewProfile),
                              ),
                          ],
                        ),
                        if (_foundVisitor!.personImageUrl != null &&
                            _foundVisitor!.personImageUrl!.isNotEmpty) ...[
                          SizedBox(height: screenHeight * 0.015),
                          Container(
                            height: screenHeight * 0.12,
                            width: screenHeight * 0.12,
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: AppColors.primary,
                                width: 2,
                              ),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: Image.network(
                                '${ApiEndpoints.baseUrl.replaceAll('/api', '')}${_foundVisitor!.personImageUrl}',
                                fit: BoxFit.cover,
                                loadingBuilder: (context, child, loadingProgress) {
                                  if (loadingProgress == null) return child;
                                  return Center(
                                    child: CircularProgressIndicator(
                                      value: loadingProgress.expectedTotalBytes != null
                                          ? loadingProgress.cumulativeBytesLoaded /
                                              loadingProgress.expectedTotalBytes!
                                          : null,
                                    ),
                                  );
                                },
                                errorBuilder: (context, error, stackTrace) =>
                                    const Center(
                                      child: Icon(
                                        Icons.person,
                                        size: 50,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  SizedBox(height: screenHeight * 0.015),
                ],

                // Previous visitor info card (from local database)
                if (_previousVisitor != null && _foundVisitor == null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.primary),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.history, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Text(
                              'Previous Visitor',
                              style: AppStyles.heading3.copyWith(
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Total visits: ${_previousVisitor!['total_visits'] ?? 0}',
                          style: AppStyles.bodyMedium,
                        ),
                        if (_previousVisitor!['last_department_name'] != null)
                          Text(
                            'Last department: ${_previousVisitor!['last_department_name']}',
                            style: AppStyles.bodyMedium,
                          ),
                        if (_previousVisitor!['last_employee_visited'] != null)
                          Text(
                            'Last employee: ${_previousVisitor!['last_employee_visited']}',
                            style: AppStyles.bodyMedium,
                          ),
                        if (_previousVisitor!['notes'] != null &&
                            _previousVisitor!['notes'].toString().isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text(
                              'Notes: ${_previousVisitor!['notes']}',
                              style: AppStyles.bodySmall.copyWith(
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // Image capture buttons
                Row(
                  children: [
                    Expanded(
                      child: _ImageCaptureButton(
                        label: ArText.personPhoto,
                        image: _personImage,
                        onTap: () => _showImagePickerDialog('person'),
                        screenWidth: screenWidth,
                        screenHeight: screenHeight,
                      ),
                    ),
                    SizedBox(width: screenWidth * 0.03),
                    Expanded(
                      child: _ImageCaptureButton(
                        label: ArText.idCardPhoto,
                        image: _idCardImage,
                        onTap: () => _showImagePickerDialog('idCard'),
                        screenWidth: screenWidth,
                        screenHeight: screenHeight,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: screenHeight * 0.02),

                // Vehicle Info Section
                _buildSectionTitle('${ArText.vehicleInformation} ${ArText.optional}'),
                SizedBox(height: screenHeight * 0.015),
                PosTextField(
                  label: ArText.carPlateOptional,
                  controller: _carPlateController,
                ),
                SizedBox(height: screenHeight * 0.015),
                _ImageCaptureButton(
                  label: ArText.carPhoto,
                  image: _carImage,
                  onTap: () => _showImagePickerDialog('car'),
                  screenWidth: screenWidth,
                  screenHeight: screenHeight,
                ),
                SizedBox(height: screenHeight * 0.02),

                // Visit Details Section
                _buildSectionTitle(ArText.visitInformation),
                SizedBox(height: screenHeight * 0.015),
                // Department dropdown
                DropdownButtonFormField<Department>(
                  value: _selectedDepartment,
                  decoration: AppStyles.inputDecoration('${ArText.department} *'),
                  items: _departments.map((dept) {
                    return DropdownMenuItem(
                      value: dept,
                      child: Text(dept.name, style: AppStyles.bodyLarge),
                    );
                  }).toList(),
                  onChanged: _isLoadingDepartments
                      ? null
                      : (Department? value) {
                          setState(() {
                            _selectedDepartment = value;
                          });
                        },
                  validator: (value) {
                    if (value == null) {
                      return ArText.departmentRequired;
                    }
                    return null;
                  },
                ),
                SizedBox(height: screenHeight * 0.015),
                TextFormField(
                  controller: _employeeToVisitController,
                  style: AppStyles.bodyLarge,
                  decoration: AppStyles.inputDecoration('${ArText.employeeToVisit} *')
                      .copyWith(
                        suffixIcon: _cachedEmployees.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.arrow_drop_down),
                                onPressed: () {
                                  showDialog(
                                    context: context,
                                    builder: (context) => AlertDialog(
                                      title: Text(ArText.selectEmployee),
                                      content: SizedBox(
                                        width: double.maxFinite,
                                        child: ListView.builder(
                                          shrinkWrap: true,
                                          itemCount: _cachedEmployees.length,
                                          itemBuilder: (context, index) {
                                            return ListTile(
                                              title: Text(
                                                _cachedEmployees[index],
                                              ),
                                              onTap: () {
                                                _employeeToVisitController
                                                        .text =
                                                    _cachedEmployees[index];
                                                Navigator.pop(context);
                                              },
                                            );
                                          },
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              )
                            : null,
                      ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return ArText.employeeToVisitRequired;
                    }
                    return null;
                  },
                ),
                SizedBox(height: screenHeight * 0.015),
                PosTextField(
                  label: ArText.visitReasonOptional,
                  controller: _visitReasonController,
                  maxLines: 2,
                ),
                SizedBox(height: screenHeight * 0.015),
                PosTextField(
                  label: ArText.expectedDurationOptional,
                  controller: _expectedDurationController,
                  keyboardType: TextInputType.number,
                ),
                SizedBox(height: screenHeight * 0.025),

                // Action buttons
                PosButton(
                  text: ArText.saveAndCheckIn,
                  icon: Icons.check,
                  onPressed: _handleSubmit,
                  isLoading: _isLoading,
                ),
                SizedBox(height: screenHeight * 0.015),
                PosButton(
                  text: ArText.clear,
                  icon: Icons.clear,
                  isPrimary: false,
                  onPressed: _clearForm,
                ),
              ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: AppStyles.heading2);
  }
}

class _ImageCaptureButton extends StatelessWidget {
  final String label;
  final File? image;
  final VoidCallback onTap;
  final double screenWidth;
  final double screenHeight;

  const _ImageCaptureButton({
    required this.label,
    this.image,
    required this.onTap,
    required this.screenWidth,
    required this.screenHeight,
  });

  @override
  Widget build(BuildContext context) {
    // Responsive height: 15% of screen height or 120px, whichever is smaller
    final buttonHeight = (screenHeight * 0.15).clamp(100.0, 150.0);
    
    return InkWell(
      onTap: onTap,
      child: Container(
        height: buttonHeight,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.textSecondary, width: 2),
        ),
        child: image != null
            ? ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.file(
                  image!,
                  fit: BoxFit.cover,
                  width: double.infinity,
                ),
              )
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.camera_alt,
                    size: buttonHeight * 0.3,
                    color: AppColors.textSecondary,
                  ),
                  SizedBox(height: buttonHeight * 0.05),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    child: Text(
                      label,
                      style: AppStyles.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
