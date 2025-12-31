import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../core/constants/ar_text.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../data/services/api_client.dart';
import '../../../data/services/employees_api.dart';
import '../../../data/models/employee.dart';
import '../../../data/models/employee_attendance.dart';

/// Employee Attendance Screen
/// Allows checking in employees by barcode/ID or name search
class EmployeeAttendanceScreen extends StatefulWidget {
  const EmployeeAttendanceScreen({super.key});

  @override
  State<EmployeeAttendanceScreen> createState() => _EmployeeAttendanceScreenState();
}

class _EmployeeAttendanceScreenState extends State<EmployeeAttendanceScreen> {
  final _searchController = TextEditingController();
  final _apiClient = ApiClient();
  late final EmployeesApi _employeesApi;
  List<Employee> _employees = [];
  List<EmployeeAttendance> _todayAttendance = [];
  bool _isLoading = false;
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _employeesApi = EmployeesApi(_apiClient);
    _loadTodayAttendance();
    _loadEmployees();
  }

  MobileScannerController? _scannerController;

  @override
  void dispose() {
    _searchController.dispose();
    _scannerController?.dispose();
    super.dispose();
  }

  Future<void> _startQRScan() async {
    _scannerController = MobileScannerController(
      detectionSpeed: DetectionSpeed.noDuplicates,
      facing: CameraFacing.back,
    );

    if (!mounted) return;

    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _QRScanScreen(
          controller: _scannerController!,
          onScan: (String code) {
            _searchController.text = code;
            _checkInEmployee(code);
            // Don't pop - keep camera open for multiple scans
          },
        ),
      ),
    );

    _scannerController?.dispose();
  }

  Future<void> _loadEmployees() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final employees = await _employeesApi.getEmployees();
      if (mounted) {
        setState(() {
          _employees = employees;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${ArText.error}: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _loadTodayAttendance() async {
    try {
      final attendance = await _employeesApi.getTodayAttendance();
      if (mounted) {
        setState(() {
          _todayAttendance = attendance;
        });
      }
    } catch (e) {
      // Silently fail - attendance is optional
    }
  }

  Future<void> _checkInEmployee(String employeeIdOrName) async {
    if (employeeIdOrName.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${ArText.error}: ${ArText.employeeIdRequired}'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() {
      _isSearching = true;
    });

    try {
      // First, try to find employee
      final employee = await _employeesApi.getEmployeeByIdentifier(
        employeeId: employeeIdOrName,
        name: employeeIdOrName,
      );

      if (employee == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${ArText.employeeNotFound}: $employeeIdOrName'),
              backgroundColor: AppColors.warning,
            ),
          );
        }
        return;
      }

      if (!employee.isActive) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${ArText.employeeInactive}: ${employee.employeeName}'),
              backgroundColor: AppColors.warning,
            ),
          );
        }
        return;
      }

      // Check in/out employee (API handles toggle: check-in if not checked in, check-out if already checked in)
      final attendance = await _employeesApi.checkIn(employeeIdOrName: employeeIdOrName);
      
      if (mounted) {
        // Determine if it was check-in or check-out based on response
        final isCheckOut = attendance.checkOutTime != null;
        final message = isCheckOut 
            ? '${ArText.checkOutSuccess}: ${employee.employeeName}'
            : '${ArText.checkInSuccess}: ${employee.employeeName}';
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            backgroundColor: AppColors.success,
          ),
        );
        
        // Clear search and reload
        _searchController.clear();
        _loadTodayAttendance();
        _loadEmployees();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${ArText.checkInFailed}: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSearching = false;
        });
      }
    }
  }

  // Checkout is now automatic when checking in again - no manual checkout needed

  String _getImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return '${ApiEndpoints.baseUrl.replaceAll('/api', '')}$imagePath';
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
          title: Text(ArText.employeeAttendance, style: AppStyles.heading3),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
        ),
        body: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: screenWidth * 0.03,
                vertical: screenWidth * 0.02,
              ),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight - screenWidth * 0.04,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Search/Input Section
                    Card(
                      elevation: 2,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              '${ArText.employeeCheckIn} / ${ArText.checkOut}',
                              style: AppStyles.heading3,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'امسح الباركود لتسجيل الدخول أو الخروج',
                              style: AppStyles.bodySmall.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 16),
                            TextField(
                              controller: _searchController,
                              style: AppStyles.bodyLarge,
                              decoration: AppStyles.inputDecoration(
                                '${ArText.employeeId} / ${ArText.employeeName}',
                              ).copyWith(
                                suffixIcon: _isSearching
                                    ? const Padding(
                                        padding: EdgeInsets.all(12.0),
                                        child: SizedBox(
                                          width: 20,
                                          height: 20,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                          ),
                                        ),
                                      )
                                    : IconButton(
                                        icon: const Icon(Icons.qr_code_scanner),
                                        onPressed: () => _startQRScan(),
                                      ),
                              ),
                              onSubmitted: _checkInEmployee,
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton.icon(
                              onPressed: _isSearching
                                  ? null
                                  : () => _checkInEmployee(_searchController.text),
                              icon: const Icon(Icons.qr_code_scanner),
                              label: Text('${ArText.checkIn} / ${ArText.checkOut}'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Today's Attendance List
                    Card(
                      elevation: 2,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              ArText.todayAttendance,
                              style: AppStyles.heading3,
                            ),
                            const SizedBox(height: 16),
                            _isLoading
                                ? const Center(
                                    child: Padding(
                                      padding: EdgeInsets.all(32.0),
                                      child: CircularProgressIndicator(),
                                    ),
                                  )
                                : _todayAttendance.isEmpty
                                    ? Center(
                                        child: Padding(
                                          padding: const EdgeInsets.all(32.0),
                                          child: Text(
                                            ArText.noAttendanceToday,
                                            style: AppStyles.bodyLarge.copyWith(
                                              color: AppColors.textSecondary,
                                            ),
                                          ),
                                        ),
                                      )
                                    : ListView.builder(
                                        shrinkWrap: true,
                                        physics: const NeverScrollableScrollPhysics(),
                                        itemCount: _todayAttendance.length,
                                        itemBuilder: (context, index) {
                                          final attendance = _todayAttendance[index];
                                          // Find employee or create placeholder
                                          Employee? employee;
                                          try {
                                            employee = _employees.firstWhere(
                                              (e) => e.id == attendance.employeeId,
                                            );
                                          } catch (e) {
                                            employee = Employee(
                                              id: attendance.employeeId,
                                              employeeId: attendance.employeeEmployeeId ?? '',
                                              employeeName: attendance.employeeName,
                                              createdAt: DateTime.now(),
                                              updatedAt: DateTime.now(),
                                              isActive: true,
                                            );
                                          }
                                          
                                          return _AttendanceCard(
                                            attendance: attendance,
                                            employee: employee,
                                            getImageUrl: _getImageUrl,
                                            screenWidth: screenWidth,
                                          );
                                        },
                                      ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _QRScanScreen extends StatefulWidget {
  final MobileScannerController controller;
  final Function(String) onScan;

  const _QRScanScreen({
    required this.controller,
    required this.onScan,
  });

  @override
  State<_QRScanScreen> createState() => _QRScanScreenState();
}

class _QRScanScreenState extends State<_QRScanScreen> {
  bool _isProcessing = false;

  @override
  void dispose() {
    widget.controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(ArText.scanQRCode),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.pop(context),
            tooltip: ArText.close,
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: widget.controller,
            onDetect: (capture) {
              if (_isProcessing) return;
              
              final List<Barcode> barcodes = capture.barcodes;
              if (barcodes.isNotEmpty) {
                final String code = barcodes.first.rawValue ?? '';
                if (code.isNotEmpty) {
                  setState(() {
                    _isProcessing = true;
                  });
                  
                  // Play system sound for successful scan
                  SystemSound.play(SystemSoundType.click);
                  
                  // Call onScan callback
                  widget.onScan(code);
                  
                  // Reset processing after a short delay to allow multiple scans
                  Future.delayed(const Duration(milliseconds: 1000), () {
                    if (mounted) {
                      setState(() {
                        _isProcessing = false;
                      });
                    }
                  });
                }
              }
            },
          ),
          // Scanning overlay indicator
          if (_isProcessing)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const CircularProgressIndicator(color: Colors.white),
                    const SizedBox(height: 16),
                    Text(
                      'تم المسح بنجاح!',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          // Overlay with instructions
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withOpacity(0.7),
                  ],
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    ArText.placeQRCodeInFrame,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'يمكنك الاستمرار في المسح',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 14,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AttendanceCard extends StatelessWidget {
  final EmployeeAttendance attendance;
  final Employee employee;
  final String Function(String?) getImageUrl;
  final double screenWidth;

  const _AttendanceCard({
    required this.attendance,
    required this.employee,
    required this.getImageUrl,
    required this.screenWidth,
  });

  String _formatTime(DateTime dateTime) {
    return '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }

  String _getDuration() {
    if (attendance.checkOutTime == null) return ArText.ongoing;
    final duration = attendance.durationMinutes ?? 0;
    final hours = duration ~/ 60;
    final minutes = duration % 60;
    if (hours > 0) {
      return '${hours}س ${minutes}د';
    }
    return '${minutes}د';
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(bottom: screenWidth * 0.02),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Employee Image
            Container(
              width: screenWidth * 0.12,
              height: screenWidth * 0.12,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(30),
              ),
              child: employee.faceImageUrl != null && employee.faceImageUrl!.isNotEmpty
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(25),
                      child: Image.network(
                        getImageUrl(employee.faceImageUrl),
                        width: screenWidth * 0.12,
                        height: screenWidth * 0.12,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => const Icon(
                          Icons.person,
                          size: 24,
                          color: AppColors.primary,
                        ),
                      ),
                    )
                  : const Icon(
                      Icons.person,
                      size: 24,
                      color: AppColors.primary,
                    ),
            ),
            SizedBox(width: screenWidth * 0.03),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    employee.employeeName,
                    style: AppStyles.heading3,
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    employee.employeeId,
                    style: AppStyles.bodySmall,
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 12,
                    runSpacing: 4,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.access_time, size: 14, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              '${ArText.checkIn}: ${_formatTime(attendance.checkInTime)}',
                              style: AppStyles.bodySmall,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      if (attendance.checkOutTime != null)
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.logout, size: 14, color: AppColors.textSecondary),
                            const SizedBox(width: 4),
                            Flexible(
                              child: Text(
                                '${ArText.checkOut}: ${_formatTime(attendance.checkOutTime!)}',
                                style: AppStyles.bodySmall,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${ArText.duration}: ${_getDuration()}',
                    style: AppStyles.bodySmall.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
                  Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: attendance.isCurrentlyCheckedIn
                        ? AppColors.success
                        : AppColors.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    attendance.isCurrentlyCheckedIn ? ArText.checkedIn : ArText.checkedOut,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
          ],
        ),
      ),
    );
  }
}

