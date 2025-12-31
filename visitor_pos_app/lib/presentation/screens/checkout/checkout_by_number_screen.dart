import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../widgets/pos_button.dart';
import '../../widgets/pos_text_field.dart';
import '../../widgets/loading_overlay.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../core/constants/ar_text.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/services/api_client.dart';
import '../../../data/services/visits_api.dart';
import '../../../data/models/visit.dart';

/// Checkout by Visit Number Screen
class CheckoutByNumberScreen extends StatefulWidget {
  const CheckoutByNumberScreen({super.key});

  @override
  State<CheckoutByNumberScreen> createState() => _CheckoutByNumberScreenState();
}

class _CheckoutByNumberScreenState extends State<CheckoutByNumberScreen> {
  final _formKey = GlobalKey<FormState>();
  final _visitNumberController = TextEditingController();
  Visit? _foundVisit;
  bool _isLoading = false;
  bool _isSearching = false;
  bool _isScanning = false;
  String? _errorMessage;
  MobileScannerController? _scannerController;

  @override
  void dispose() {
    _visitNumberController.dispose();
    _scannerController?.dispose();
    super.dispose();
  }

  Future<void> _startQRScan() async {
    setState(() {
      _isScanning = true;
      _errorMessage = null;
    });

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
            Navigator.pop(context);
            _visitNumberController.text = code;
            _handleSearch();
          },
        ),
      ),
    );

    setState(() {
      _isScanning = false;
    });
    _scannerController?.dispose();
  }

  Future<void> _handleSearch() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSearching = true;
      _errorMessage = null;
      _foundVisit = null;
    });

    try {
      final apiClient = ApiClient();
      final visitsApi = VisitsApi(apiClient);
      final visit = await visitsApi.getVisitByNumber(_visitNumberController.text.trim());

      setState(() {
        _foundVisit = visit;
        _isSearching = false;
      });
    } catch (e) {
      setState(() {
        _isSearching = false;
        _errorMessage = e.toString().replaceAll('Exception: ', '');
        _foundVisit = null;
      });
    }
  }

  Future<void> _handleCheckout() async {
    if (_foundVisit == null) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(ArText.confirmCheckout),
        content: Text('${ArText.confirmCheckoutMessage} ${_foundVisit!.visitNumber}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(ArText.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(ArText.checkout, style: const TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      setState(() {
        _isLoading = true;
      });

      try {
        final apiClient = ApiClient();
        final visitsApi = VisitsApi(apiClient);
        await visitsApi.checkoutVisit(_foundVisit!.visitNumber);

        setState(() {
          _isLoading = false;
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(ArText.checkoutSuccess),
              backgroundColor: AppColors.success,
            ),
          );
          
          // Clear form and reset
          _visitNumberController.clear();
          setState(() {
            _foundVisit = null;
          });
        }
      } catch (e) {
        setState(() {
          _isLoading = false;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${ArText.checkoutFailed}: ${e.toString()}'),
              backgroundColor: AppColors.error,
            ),
          );
        }
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
        title: Text(ArText.checkoutVisitor, style: AppStyles.heading3),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: LoadingOverlay(
        isLoading: _isLoading,
        message: ArText.processingCheckout,
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: screenWidth * 0.04,
                vertical: screenHeight * 0.02,
              ),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight - screenHeight * 0.04,
                ),
                child: IntrinsicHeight(
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                Text(
                  ArText.enterVisitNumber,
                  style: AppStyles.heading2,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                // QR Scan Button
                PosButton(
                  text: ArText.scanQRCode,
                  icon: Icons.qr_code_scanner,
                  onPressed: _isScanning ? null : _startQRScan,
                  isLoading: _isScanning,
                ),
                const SizedBox(height: 16),
                // Divider with "OR"
                Row(
                  children: [
                    const Expanded(child: Divider()),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(ArText.or, style: AppStyles.bodyMedium),
                    ),
                    const Expanded(child: Divider()),
                  ],
                ),
                const SizedBox(height: 16),
                PosTextField(
                  label: ArText.visitNumber,
                  controller: _visitNumberController,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return ArText.visitNumberRequired;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                PosButton(
                  text: ArText.search,
                  icon: Icons.search,
                  onPressed: _isSearching ? null : _handleSearch,
                  isLoading: _isSearching,
                ),
                const SizedBox(height: 32),
                
                // Error message
                if (_errorMessage != null)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.error.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.error),
                    ),
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
                
                // Found visit details
                if (_foundVisit != null) ...[
                  const SizedBox(height: 24),
                  Card(
                    elevation: 4,
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            ArText.visitFound,
                            style: AppStyles.heading2,
                          ),
                          const SizedBox(height: 16),
                          _InfoRow(
                            label: ArText.visitNumber,
                            value: _foundVisit!.visitNumber,
                          ),
                          const SizedBox(height: 12),
                          _InfoRow(
                            label: ArText.visitor,
                            value: _foundVisit!.visitorName,
                          ),
                          const SizedBox(height: 12),
                          _InfoRow(
                            label: ArText.department,
                            value: _foundVisit!.departmentName,
                          ),
                          const SizedBox(height: 12),
                          _InfoRow(
                            label: ArText.employee,
                            value: _foundVisit!.employeeToVisit,
                          ),
                          const SizedBox(height: 12),
                          _InfoRow(
                            label: ArText.checkInTime,
                            value: Formatters.formatDateTimeForDisplay(_foundVisit!.checkInAt),
                          ),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: _foundVisit!.isOngoing
                                  ? AppColors.success
                                  : AppColors.textSecondary,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _foundVisit!.status.toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                          if (!_foundVisit!.isOngoing) ...[
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.warning.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.info_outline, color: AppColors.warning),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      ArText.visitAlreadyCompleted,
                                      style: AppStyles.bodyMedium.copyWith(
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
                    ),
                  ),
                  if (_foundVisit!.isOngoing) ...[
                    const SizedBox(height: 24),
                    PosButton(
                      text: ArText.checkout,
                      icon: Icons.logout,
                      isDanger: true,
                      onPressed: _handleCheckout,
                    ),
                  ],
                ],
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 120,
          child: Text(
            '$label:',
            style: AppStyles.bodySmall.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: AppStyles.bodyLarge,
          ),
        ),
      ],
    );
  }
}

/// QR Code Scanner Screen
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
                  widget.onScan(code);
                }
              }
            },
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
              child: Text(
                ArText.placeQRCodeInFrame,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

