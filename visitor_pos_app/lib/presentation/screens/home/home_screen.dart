import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/pos_button.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../core/constants/ar_text.dart';
import '../../../data/services/visits_api.dart';
import '../../../data/services/api_client.dart';
import '../../../data/services/visits_sync_service.dart';
import '../../../data/services/local_database.dart';
import '../../../core/utils/connectivity_service.dart';

/// Home Screen
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _todayVisitsCount = 0;
  int _activeVisitsCount = 0;
  int _pendingSyncCount = 0;
  bool _isLoadingStats = false;
  bool _isSyncing = false;
  bool _isOnline = true;

  @override
  void initState() {
    super.initState();
    // Defer async operations until after build completes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadStats();
      _checkConnectivity();
      _loadPendingCount();
    });
  }

  Future<void> _checkConnectivity() async {
    final connectivityService = ConnectivityService();
    final isOnline = await connectivityService.isOnline();
    setState(() {
      _isOnline = isOnline;
    });
  }

  Future<void> _loadPendingCount() async {
    final localDb = LocalDatabase();
    final count = await localDb.getPendingVisitsCount();
    setState(() {
      _pendingSyncCount = count;
    });
  }

  Future<void> _syncPendingVisits() async {
    setState(() {
      _isSyncing = true;
    });

    try {
      final apiClient = ApiClient();
      final visitsApi = VisitsApi(apiClient);
      final syncService = VisitsSyncService(visitsApi);
      final result = await syncService.syncPendingVisits();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.message),
            backgroundColor: result.success
                ? AppColors.success
                : AppColors.error,
            duration: const Duration(seconds: 3),
          ),
        );
      }

      await _loadPendingCount();
      await _loadStats();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${ArText.syncFailed}: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      setState(() {
        _isSyncing = false;
      });
    }
  }

  Future<void> _loadStats() async {
    setState(() {
      _isLoadingStats = true;
    });

    try {
      await _checkConnectivity();
      final apiClient = ApiClient();
      final visitsApi = VisitsApi(apiClient);
      final activeVisits = await visitsApi.getActiveVisits();

      // Count today's visits (simplified - you may need to filter by date from backend)
      final today = DateTime.now();
      final todayVisits = activeVisits.where((visit) {
        return visit.checkInAt.year == today.year &&
            visit.checkInAt.month == today.month &&
            visit.checkInAt.day == today.day;
      }).length;

      setState(() {
        _activeVisitsCount = activeVisits.length;
        _todayVisitsCount = todayVisits;
        _isLoadingStats = false;
      });

      await _loadPendingCount();
    } catch (e) {
      setState(() {
        _isLoadingStats = false;
      });
    }
  }

  Future<bool> _checkAssetExists(String path) async {
    try {
      final file = File(path);
      return await file.exists();
    } catch (e) {
      return false;
    }
  }

  /// Format date and time in Arabic format
  String _formatArabicDateTime(DateTime dateTime) {
    // Simple Arabic date format: DD/MM/YYYY HH:MM
    final day = dateTime.day.toString().padLeft(2, '0');
    final month = dateTime.month.toString().padLeft(2, '0');
    final year = dateTime.year.toString();
    final hour = dateTime.hour.toString().padLeft(2, '0');
    final minute = dateTime.minute.toString().padLeft(2, '0');
    return '$day/$month/$year • $hour:$minute';
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(ArText.logout),
        content: Text(ArText.areYouSureLogout),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(ArText.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              ArText.logout,
              style: const TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.logout();
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Row(
          children: [
            FutureBuilder<bool>(
              future: _checkAssetExists('assets/images/logo.png'),
              builder: (context, snapshot) {
                if (snapshot.data == true) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 12),
                    child: Image.asset(
                      'assets/images/logo.png',
                      height: 40,
                      fit: BoxFit.contain,
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
            Text(ArText.visitorPos, style: AppStyles.heading3),
          ],
        ),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
            tooltip: ArText.logout,
          ),
        ],
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          return RefreshIndicator(
            onRefresh: () async {
              await _loadStats();
              await _loadPendingCount();
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(
                12.0,
                12.0,
                12.0,
                100.0,
              ), // Extra bottom padding to prevent overflow (increased from 40 to 100)
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Welcome section
                  Card(
                    elevation: 2,
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${ArText.welcome}, ${authProvider.currentUser?.fullName ?? ArText.user}',
                            style: AppStyles.heading2,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _formatArabicDateTime(DateTime.now()),
                            style: AppStyles.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Stats section
                  Row(
                    children: [
                      Expanded(
                        child: _StatCard(
                          title: ArText.todaysVisits,
                          value: _isLoadingStats ? '...' : '$_todayVisitsCount',
                          icon: Icons.today,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _StatCard(
                          title: ArText.activeVisitors,
                          value: _isLoadingStats
                              ? '...'
                              : '$_activeVisitsCount',
                          icon: Icons.people,
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),

                  // Pending sync indicator
                  if (_pendingSyncCount > 0) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.warning.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.warning),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.cloud_off,
                            color: AppColors.warning,
                            size: 32,
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '$_pendingSyncCount ${ArText.pendingSync}',
                                  style: AppStyles.bodyLarge.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _isOnline
                                      ? ArText.tapToSync
                                      : ArText.willSyncWhenOnline,
                                  style: AppStyles.bodySmall,
                                ),
                              ],
                            ),
                          ),
                          if (_isOnline && !_isSyncing)
                            IconButton(
                              icon: const Icon(Icons.sync),
                              onPressed: _syncPendingVisits,
                              tooltip: ArText.syncNow,
                            ),
                          if (_isSyncing)
                            const Padding(
                              padding: EdgeInsets.all(8.0),
                              child: SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],

                  // Offline indicator
                  if (!_isOnline && _pendingSyncCount == 0) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.textSecondary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.wifi_off,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              ArText.noInternetConnection,
                              style: AppStyles.bodyMedium,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),

                  // Navigation buttons
                  PosButton(
                    text: ArText.newVisit,
                    icon: Icons.person_add,
                    onPressed: () => Navigator.pushNamed(context, '/new-visit'),
                  ),
                  const SizedBox(height: 10),
                  PosButton(
                    text: ArText.activeVisits,
                    icon: Icons.list,
                    onPressed: () =>
                        Navigator.pushNamed(context, '/active-visits'),
                  ),
                  const SizedBox(height: 10),
                  PosButton(
                    text: ArText.checkoutVisitorBtn,
                    icon: Icons.logout,
                    onPressed: () => Navigator.pushNamed(context, '/checkout'),
                  ),
                  const SizedBox(height: 10),
                  PosButton(
                    text: ArText.reports,
                    icon: Icons.bar_chart,
                    isPrimary: false,
                    onPressed: () => Navigator.pushNamed(context, '/reports'),
                  ),
                  const SizedBox(height: 10),
                  PosButton(
                    text: ArText.searchVisitors,
                    icon: Icons.search,
                    isPrimary: false,
                    onPressed: () =>
                        Navigator.pushNamed(context, '/visitor-search'),
                  ),
                  const SizedBox(height: 20), // Extra spacing at bottom
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            Icon(icon, size: 28, color: color),
            const SizedBox(height: 8),
            Text(value, style: AppStyles.heading1.copyWith(color: color)),
            const SizedBox(height: 4),
            Text(
              title,
              style: AppStyles.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
