import 'package:flutter/material.dart';
import '../../widgets/pos_button.dart';
import '../../widgets/loading_overlay.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../core/constants/ar_text.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/services/api_client.dart';
import '../../../data/services/reports_api.dart';
import '../../../data/models/visit_summary.dart';

/// Reports Screen
class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  DateTime? _fromDate;
  DateTime? _toDate;
  VisitSummary? _summary;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    // Default to today
    _toDate = DateTime.now();
    _fromDate = DateTime.now();
  }

  Future<void> _selectFromDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _fromDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        _fromDate = picked;
      });
    }
  }

  Future<void> _selectToDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _toDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        _toDate = picked;
      });
    }
  }

  Future<void> _loadReport() async {
    if (_fromDate == null || _toDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(ArText.pleaseSelectBothDates),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final apiClient = ApiClient();
      final reportsApi = ReportsApi(apiClient);
      final summary = await reportsApi.getSummaryReport(
        Formatters.formatDateForApi(_fromDate!),
        Formatters.formatDateForApi(_toDate!),
      );

      setState(() {
        _summary = summary;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(ArText.reports, style: AppStyles.heading3),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: LoadingOverlay(
        isLoading: _isLoading,
        message: ArText.loadingReport,
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
              Text(
                ArText.visitSummaryReport,
                style: AppStyles.heading2,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              
              // Date range selection
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  ArText.fromDate,
                                  style: AppStyles.bodySmall.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                InkWell(
                                  onTap: _selectFromDate,
                                  child: Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      border: Border.all(color: AppColors.textSecondary),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            _fromDate != null
                                                ? Formatters.formatDateForDisplay(_fromDate!)
                                                : ArText.selectDate,
                                            style: AppStyles.bodyLarge,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        const Icon(Icons.calendar_today),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  ArText.toDate,
                                  style: AppStyles.bodySmall.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                InkWell(
                                  onTap: _selectToDate,
                                  child: Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      border: Border.all(color: AppColors.textSecondary),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            _toDate != null
                                                ? Formatters.formatDateForDisplay(_toDate!)
                                                : ArText.selectDate,
                                            style: AppStyles.bodyLarge,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        const Icon(Icons.calendar_today),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      PosButton(
                        text: ArText.loadReport,
                        icon: Icons.bar_chart,
                        onPressed: _loadReport,
                      ),
                    ],
                  ),
                ),
              ),
              
              // Error message
              if (_errorMessage != null) ...[
                const SizedBox(height: 16),
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
              ],
              
              // Report summary
              if (_summary != null) ...[
                const SizedBox(height: 32),
                _SummaryCard(summary: _summary!),
              ],
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

class _SummaryCard extends StatelessWidget {
  final VisitSummary summary;

  const _SummaryCard({required this.summary});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              ArText.summary,
              style: AppStyles.heading2,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: _StatItem(
                    label: ArText.totalVisits,
                    value: '${summary.totalVisits}',
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _StatItem(
                    label: ArText.completed,
                    value: '${summary.totalCompleted}',
                    color: AppColors.success,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _StatItem(
                    label: ArText.ongoing,
                    value: '${summary.totalOngoing}',
                    color: AppColors.warning,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            if (summary.visitsPerDepartment.isNotEmpty) ...[
              Text(
                ArText.visitsByDepartment,
                style: AppStyles.heading3,
              ),
              const SizedBox(height: 16),
              ...summary.visitsPerDepartment.map((dept) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            dept.departmentName,
                            style: AppStyles.bodyLarge,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '${dept.visitCount}',
                            style: AppStyles.bodyLarge.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )),
            ],
            if (summary.visitsPerUser != null && summary.visitsPerUser!.isNotEmpty) ...[
              const SizedBox(height: 32),
              Text(
                ArText.visitsByUser,
                style: AppStyles.heading3,
              ),
              const SizedBox(height: 16),
              ...summary.visitsPerUser!.map((user) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            user.userName,
                            style: AppStyles.bodyLarge,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: AppColors.accent.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '${user.visitCount}',
                            style: AppStyles.bodyLarge.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.accent,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )),
            ],
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatItem({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: AppStyles.heading1.copyWith(color: color),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: AppStyles.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

