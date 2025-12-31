import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/visits_provider.dart';
import '../../widgets/loading_overlay.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../core/constants/ar_text.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/visit.dart';

/// Active Visits Screen
class ActiveVisitsScreen extends StatefulWidget {
  const ActiveVisitsScreen({super.key});

  @override
  State<ActiveVisitsScreen> createState() => _ActiveVisitsScreenState();
}

class _ActiveVisitsScreenState extends State<ActiveVisitsScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<VisitsProvider>(context, listen: false).loadActiveVisits();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _handleSearch() {
    setState(() {
      _searchQuery = _searchController.text.trim();
    });
    Provider.of<VisitsProvider>(
      context,
      listen: false,
    ).loadActiveVisits(search: _searchQuery.isEmpty ? null : _searchQuery);
  }

  Future<void> _handleCheckout(Visit visit) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(ArText.confirmCheckoutTitle),
        content: Text(
          '${ArText.confirmCheckoutQuestion} ${visit.visitNumber}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(ArText.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              ArText.checkout,
              style: const TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final visitsProvider = Provider.of<VisitsProvider>(
        context,
        listen: false,
      );
      final success = await visitsProvider.checkoutVisit(visit.visitNumber);

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(ArText.checkoutSuccess),
            backgroundColor: AppColors.success,
          ),
        );
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(visitsProvider.errorMessage ?? ArText.checkoutFailed),
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
        title: Text(ArText.activeVisitsTitle, style: AppStyles.heading3),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: Consumer<VisitsProvider>(
        builder: (context, visitsProvider, _) {
          return LoadingOverlay(
            isLoading: visitsProvider.isLoading,
            child: Column(
              children: [
                // Search bar
                Padding(
                  padding: EdgeInsets.all(screenWidth * 0.04),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          style: AppStyles.bodyLarge,
                          decoration:
                              AppStyles.inputDecoration(
                                ArText.searchByVisitNumber,
                              ).copyWith(
                                suffixIcon: IconButton(
                                  icon: const Icon(Icons.search),
                                  onPressed: _handleSearch,
                                ),
                              ),
                          onSubmitted: (_) => _handleSearch(),
                        ),
                      ),
                      SizedBox(width: screenWidth * 0.02),
                      IconButton(
                        icon: const Icon(Icons.refresh),
                        onPressed: () {
                          _searchController.clear();
                          _handleSearch();
                        },
                        tooltip: ArText.refresh,
                      ),
                    ],
                  ),
                ),

                // Visits list
                Expanded(
                  child: visitsProvider.activeVisits.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.inbox,
                                size: screenHeight * 0.08,
                                color: AppColors.textSecondary,
                              ),
                              SizedBox(height: screenHeight * 0.02),
                              Text(
                                ArText.noActiveVisitsFound,
                                style: AppStyles.bodyLarge.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: () => visitsProvider.loadActiveVisits(
                            search: _searchQuery.isEmpty ? null : _searchQuery,
                          ),
                          child: ListView.builder(
                            padding: EdgeInsets.all(screenWidth * 0.04),
                            itemCount: visitsProvider.activeVisits.length,
                            itemBuilder: (context, index) {
                              final visit = visitsProvider.activeVisits[index];
                              return _VisitCard(
                                visit: visit,
                                screenWidth: screenWidth,
                                screenHeight: screenHeight,
                                onTap: () {
                                  Navigator.pushNamed(
                                    context,
                                    '/visit-details',
                                    arguments: visit,
                                  );
                                },
                                onCheckout: () => _handleCheckout(visit),
                              );
                            },
                          ),
                        ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _VisitCard extends StatelessWidget {
  final Visit visit;
  final VoidCallback onTap;
  final VoidCallback onCheckout;
  final double screenWidth;
  final double screenHeight;

  const _VisitCard({
    required this.visit,
    required this.onTap,
    required this.onCheckout,
    required this.screenWidth,
    required this.screenHeight,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(bottom: screenHeight * 0.02),
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.all(screenWidth * 0.04),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(visit.visitNumber, style: AppStyles.heading3),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: visit.isOngoing
                          ? AppColors.success
                          : AppColors.textSecondary,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      (visit.isOngoing ? ArText.active : ArText.completed).toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _InfoRow(label: ArText.visitor, value: visit.visitorName),
              const SizedBox(height: 8),
              _InfoRow(label: ArText.department, value: visit.departmentName),
              const SizedBox(height: 8),
              _InfoRow(label: ArText.employee, value: visit.employeeToVisit),
              const SizedBox(height: 8),
              _InfoRow(
                label: ArText.checkIn,
                value: Formatters.formatDateTimeForDisplay(visit.checkInAt),
              ),
              if (visit.carPlate != null && visit.carPlate!.isNotEmpty) ...[
                const SizedBox(height: 8),
                _InfoRow(label: ArText.carPlate, value: visit.carPlate!),
              ],
              const SizedBox(height: 16),
              // Only show checkout button for ongoing visits
              if (visit.isOngoing)
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: onCheckout,
                        style: AppStyles.dangerButtonStyle.copyWith(
                          minimumSize: const MaterialStatePropertyAll(
                            Size(0, 50),
                          ),
                        ),
                        child: Text(ArText.checkout),
                      ),
                    ),
                  ],
                )
              else
                // Show completed status for non-ongoing visits
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.textSecondary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.check_circle,
                        color: AppColors.textSecondary,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        ArText.completed,
                        style: AppStyles.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
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
