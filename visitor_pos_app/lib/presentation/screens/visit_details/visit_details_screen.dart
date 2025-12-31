import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../widgets/pos_button.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../core/constants/ar_text.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/visit.dart';
import '../../../data/models/visitor.dart';
import '../../../data/services/printer_service.dart';
import '../../../data/services/api_client.dart';
import '../../../data/services/visitors_api.dart';

/// Visit Details Screen with Receipt and Visitor Info
class VisitDetailsScreen extends StatefulWidget {
  final Visit visit;

  const VisitDetailsScreen({super.key, required this.visit});

  @override
  State<VisitDetailsScreen> createState() => _VisitDetailsScreenState();
}

class _VisitDetailsScreenState extends State<VisitDetailsScreen> {
  Visitor? _visitor;

  @override
  void initState() {
    super.initState();
    _loadVisitorInfo();
  }

  Future<void> _loadVisitorInfo() async {
    try {
      final apiClient = ApiClient();
      final visitorsApi = VisitorsApi(apiClient);
      final profileData = await visitorsApi.getVisitorProfile(
        widget.visit.visitorId,
      );

      if (mounted) {
        setState(() {
          _visitor = Visitor.fromJson(
            profileData['visitor'] as Map<String, dynamic>,
          );
        });
      }
    } catch (e) {
      // Silently fail - visitor info is optional
    }
  }

  String _getImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return '${ApiEndpoints.baseUrl.replaceAll('/api', '')}$imagePath';
  }

  Future<void> _handlePrint(BuildContext context) async {
    try {
      final printerService = PrinterService();
      await printerService.printVisitReceipt(widget.visit);

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(ArText.receiptSentToPrinter),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${ArText.printFailed}: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final screenWidth = size.width;
    final screenHeight = size.height;
    
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(ArText.visitDetails, style: AppStyles.heading3),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          return SingleChildScrollView(
            padding: EdgeInsets.symmetric(
              horizontal: screenWidth * 0.03,
              vertical: screenHeight * 0.02,
            ),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: constraints.maxHeight - screenHeight * 0.04,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
            // Visitor Info Card (if loaded)
            if (_visitor != null) ...[
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      // Visitor Image
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(40),
                          border: Border.all(
                            color: AppColors.primary,
                            width: 2,
                          ),
                        ),
                        child:
                            _visitor!.personImageUrl != null &&
                                _visitor!.personImageUrl!.isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(38),
                                child: Image.network(
                                  _getImageUrl(_visitor!.personImageUrl),
                                  width: 80,
                                  height: 80,
                                  fit: BoxFit.cover,
                                  loadingBuilder:
                                      (context, child, loadingProgress) {
                                        if (loadingProgress == null)
                                          return child;
                                        return const Center(
                                          child: SizedBox(
                                            width: 20,
                                            height: 20,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                            ),
                                          ),
                                        );
                                      },
                                  errorBuilder: (context, error, stackTrace) =>
                                      const Center(
                                        child: Icon(
                                          Icons.person,
                                          size: 40,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                ),
                              )
                            : const Icon(
                                Icons.person,
                                size: 40,
                                color: AppColors.primary,
                              ),
                      ),
                      const SizedBox(width: 16),
                      // Visitor Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_visitor!.fullName, style: AppStyles.heading3),
                            if (_visitor!.company != null &&
                                _visitor!.company!.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                _visitor!.company!,
                                style: AppStyles.bodySmall,
                              ),
                            ],
                            if (_visitor!.phone != null &&
                                _visitor!.phone!.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(
                                    Icons.phone,
                                    size: 14,
                                    color: AppColors.textSecondary,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    _visitor!.phone!,
                                    style: AppStyles.bodySmall,
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                      // View Profile Button
                      IconButton(
                        icon: const Icon(Icons.arrow_forward_ios),
                        onPressed: () {
                          Navigator.pushNamed(
                            context,
                            '/visitor-profile',
                            arguments: widget.visit.visitorId,
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],

            // Receipt Card
            Card(
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    // Company/Logo placeholder
                    Text(
                      ArText.visitorPass.toUpperCase(),
                      style: AppStyles.heading1.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      ArText.company,
                      style: AppStyles.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const Divider(height: 32),

                    // Visit Number (big and bold)
                    Text(
                      widget.visit.visitNumber,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // QR Code - Responsive size
                    QrImageView(
                      data: widget.visit.visitNumber,
                      version: QrVersions.auto,
                      size: screenWidth * 0.4, // 40% of screen width
                      backgroundColor: Colors.white,
                    ),
                    const SizedBox(height: 16),

                    // Visit Details
                    _ReceiptRow(
                      label: ArText.visitor,
                      value: widget.visit.visitorName,
                    ),
                    const SizedBox(height: 8),
                    _ReceiptRow(
                      label: ArText.department,
                      value: widget.visit.departmentName,
                    ),
                    const SizedBox(height: 8),
                    _ReceiptRow(
                      label: ArText.employee,
                      value: widget.visit.employeeToVisit,
                    ),
                    const SizedBox(height: 8),
                    _ReceiptRow(
                      label: ArText.checkIn,
                      value: Formatters.formatDateTimeForDisplay(
                        widget.visit.checkInAt,
                      ),
                    ),
                    if (widget.visit.checkOutAt != null) ...[
                      const SizedBox(height: 8),
                      _ReceiptRow(
                        label: ArText.checkOut,
                        value: Formatters.formatDateTimeForDisplay(
                          widget.visit.checkOutAt!,
                        ),
                      ),
                    ],
                    if (widget.visit.carPlate != null &&
                        widget.visit.carPlate!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      _ReceiptRow(
                        label: ArText.carPlate,
                        value: widget.visit.carPlate!,
                      ),
                    ],
                    if (widget.visit.expectedDurationHours != null) ...[
                      const SizedBox(height: 8),
                      _ReceiptRow(
                        label: ArText.duration,
                        value:
                            '${widget.visit.expectedDurationHours} ${ArText.hours}',
                      ),
                    ],
                    if (widget.visit.visitReason != null &&
                        widget.visit.visitReason!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      _ReceiptRow(
                        label: ArText.reason,
                        value: widget.visit.visitReason!,
                      ),
                    ],
                    // Car Image (if available)
                    if (widget.visit.carImageUrl != null &&
                        widget.visit.carImageUrl!.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Divider(height: 24),
                      Text(
                        ArText.carPlateLabel,
                        style: AppStyles.bodySmall.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        constraints: const BoxConstraints(maxHeight: 200),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            _getImageUrl(widget.visit.carImageUrl),
                            fit: BoxFit.contain,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return Center(
                                child: Padding(
                                  padding: const EdgeInsets.all(32.0),
                                  child: CircularProgressIndicator(
                                    value:
                                        loadingProgress.expectedTotalBytes !=
                                            null
                                        ? loadingProgress
                                                      .cumulativeBytesLoaded /
                                                  loadingProgress
                                                      .expectedTotalBytes!
                                        : null,
                                  ),
                                ),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) =>
                                Center(
                                  child: Padding(
                                    padding: const EdgeInsets.all(32.0),
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(
                                          Icons.directions_car,
                                          size: 48,
                                          color: AppColors.textSecondary,
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          ArText.na,
                                          style: AppStyles.bodySmall.copyWith(
                                            color: AppColors.textSecondary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                            ),
                          ),
                        ),
                      ),
                    ],

                    const Divider(height: 32),

                    // Status
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: widget.visit.isOngoing
                            ? AppColors.success
                            : widget.visit.isCompleted
                            ? AppColors.primary
                            : AppColors.textSecondary,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        widget.visit.status.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Print button
            PosButton(
              text: ArText.printReceipt,
              icon: Icons.print,
              onPressed: () => _handlePrint(context),
                ),
              ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ReceiptRow extends StatelessWidget {
  final String label;
  final String value;

  const _ReceiptRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            '$label:',
            style: AppStyles.bodySmall.copyWith(fontWeight: FontWeight.bold),
          ),
        ),
        Expanded(child: Text(value, style: AppStyles.bodyMedium)),
      ],
    );
  }
}
