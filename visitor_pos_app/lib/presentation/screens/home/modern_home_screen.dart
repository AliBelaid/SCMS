import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/visits_provider.dart';
import '../../widgets/stats_card.dart';
import '../../widgets/circular_menu_item.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/ar_text.dart';
import '../../../data/services/visits_api.dart';
import '../../../data/services/api_client.dart';
import '../../../data/services/visits_sync_service.dart';
import '../../../data/services/local_database.dart';
import '../../../core/utils/connectivity_service.dart';
import '../../../core/services/blocked_visitor_checker.dart';

/// Modern Home Screen with Circular Menu Dashboard
class ModernHomeScreen extends StatefulWidget {
  const ModernHomeScreen({super.key});

  @override
  State<ModernHomeScreen> createState() => _ModernHomeScreenState();
}

class _ModernHomeScreenState extends State<ModernHomeScreen>
    with SingleTickerProviderStateMixin {
  int _todayVisitsCount = 0;
  int _activeVisitsCount = 0;
  int _pendingSyncCount = 0;
  bool _isLoadingStats = false;
  bool _isSyncing = false;
  bool _isOnline = true;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    // Defer async operations until after build completes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadStats();
      _checkConnectivity();
      _loadPendingCount();
      // Check for blocked visitors after a short delay
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          BlockedVisitorChecker.checkAndShowAlerts(context);
        }
      });
    });
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.2, 1.0, curve: Curves.easeOut),
      ),
    );

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _checkConnectivity() async {
    final connectivityService = ConnectivityService();
    final isOnline = await connectivityService.isOnline();
    if (mounted) {
      setState(() {
        _isOnline = isOnline;
      });
    }
  }

  Future<void> _loadPendingCount() async {
    final localDb = LocalDatabase();
    final count = await localDb.getPendingVisitsCount();
    if (mounted) {
      setState(() {
        _pendingSyncCount = count;
      });
    }
  }

  Future<void> _loadStats() async {
    setState(() {
      _isLoadingStats = true;
    });

    try {
      final visitsProvider = Provider.of<VisitsProvider>(context, listen: false);
      await visitsProvider.loadActiveVisits();

      final activeVisits = visitsProvider.activeVisits;
      final today = DateTime.now();
      final todayStart = DateTime(today.year, today.month, today.day);

      setState(() {
        _activeVisitsCount = activeVisits.length;
        _todayVisitsCount = activeVisits
            .where((v) => v.checkInAt.isAfter(todayStart))
            .length;
      });
    } catch (e) {
      debugPrint('Error loading stats: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingStats = false;
        });
      }
    }
  }

  Future<void> _handleSync() async {
    setState(() {
      _isSyncing = true;
    });

    try {
      final apiClient = ApiClient();
      final visitsApi = VisitsApi(apiClient);
      final syncService = VisitsSyncService(visitsApi);
      await syncService.autoSync();

      await _loadPendingCount();
      await _loadStats();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ ${ArText.syncNow}'),
            backgroundColor: AppColors.success,
            duration: const Duration(seconds: 2),
          ),
        );
      }
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
      if (mounted) {
        setState(() {
          _isSyncing = false;
        });
      }
    }
  }

  /// Format date and time in Arabic format
  String _formatArabicDateTime(DateTime dateTime) {
    final day = dateTime.day.toString().padLeft(2, '0');
    final month = dateTime.month.toString().padLeft(2, '0');
    final year = dateTime.year.toString();
    return '$day/$month/$year';
  }

  Widget _buildHeader(AuthProvider authProvider) {
    final now = DateTime.now();
    final timeOfDay = now.hour < 12
        ? ArText.welcome // Use Arabic welcome
        : now.hour < 17
            ? ArText.welcome
            : ArText.welcome;

    return Container(
      decoration: const BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Logo
                  _buildLogo(),
                  // Sync and Profile buttons
                  Row(
                    children: [
                      if (_pendingSyncCount > 0 || !_isOnline)
                        IconButton(
                          onPressed: _isSyncing ? null : _handleSync,
                          icon: _isSyncing
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : Badge(
                                  label: Text('$_pendingSyncCount'),
                                  isLabelVisible: _pendingSyncCount > 0,
                                  child: const Icon(
                                    Icons.sync,
                                    color: Colors.white,
                                  ),
                                ),
                        ),
                      const SizedBox(width: 8),
                      IconButton(
                        onPressed: () => _showProfileMenu(authProvider),
                        icon: const Icon(
                          Icons.account_circle,
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),
              // Greeting
              Text(
                timeOfDay,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white.withOpacity(0.9),
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                authProvider.currentUser?.fullName ?? ArText.user,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              // Date and status
              Row(
                children: [
                  Icon(
                    Icons.calendar_today,
                    size: 14,
                    color: Colors.white.withOpacity(0.8),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    _formatArabicDateTime(now),
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _isOnline
                          ? AppColors.success
                          : AppColors.error,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _isOnline
                              ? Icons.wifi
                              : Icons.wifi_off,
                          size: 12,
                          color: Colors.white,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _isOnline ? ArText.online : ArText.offline,
                          style: const TextStyle(
                            fontSize: 11,
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLogo() {
    // Try to load logo from assets, fallback to text
    return FutureBuilder<bool>(
      future: _checkAssetExists('assets/images/logo.png'),
      builder: (context, snapshot) {
        if (snapshot.data == true) {
          return Image.asset(
            'assets/images/logo.png',
            height: 45,
            fit: BoxFit.contain,
          );
        }
        // Fallback to text logo
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            ArText.visitorPos.toUpperCase(),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              letterSpacing: 1,
            ),
          ),
        );
      },
    );
  }

  Future<bool> _checkAssetExists(String path) async {
    try {
      final file = File(path);
      return await file.exists();
    } catch (e) {
      return false;
    }
  }

  void _showProfileMenu(AuthProvider authProvider) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.person),
              title: Text(ArText.profile),
              subtitle: Text(authProvider.currentUser?.userName ?? ''),
            ),
            ListTile(
              leading: const Icon(Icons.badge),
              title: Text(ArText.userRole),
              subtitle: Text(authProvider.currentUser?.role ?? ''),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: AppColors.error),
              title: Text(
                ArText.logout,
                style: const TextStyle(color: AppColors.error),
              ),
              onTap: () async {
                await authProvider.logout();
                if (context.mounted) {
                  Navigator.of(context).pushReplacementNamed('/login');
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsSection() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            ArText.todaysOverview,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: StatsCard(
                  title: ArText.activeVisits,
                  value: _isLoadingStats ? '--' : '$_activeVisitsCount',
                  icon: Icons.people,
                  gradient: AppColors.primaryGradient,
                  color: AppColors.primary,
                  onTap: () => Navigator.pushNamed(context, '/active-visits'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: StatsCard(
                  title: ArText.todaysVisits,
                  value: _isLoadingStats ? '--' : '$_todayVisitsCount',
                  icon: Icons.today,
                  gradient: AppColors.successGradient,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCircularMenu() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            ArText.quickActions,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 24),
          // Circular menu grid - reduced spacing to prevent overflow
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 3,
            mainAxisSpacing: 16, // Reduced from 24 to 16
            crossAxisSpacing: 16, // Reduced from 24 to 16
            childAspectRatio: 0.85, // Added to control item size
            children: [
              CircularMenuItem(
                icon: Icons.person_add,
                label: ArText.newVisit,
                gradient: AppColors.primaryGradient,
                onTap: () => Navigator.pushNamed(context, '/new-visit'),
              ),
              CircularMenuItem(
                icon: Icons.group,
                label: ArText.activeVisits,
                gradient: AppColors.successGradient,
                onTap: () => Navigator.pushNamed(context, '/active-visits'),
              ),
              CircularMenuItem(
                icon: Icons.exit_to_app,
                label: ArText.checkoutVisitorBtn,
                gradient: AppColors.warningGradient,
                onTap: () => Navigator.pushNamed(context, '/checkout'),
              ),
              CircularMenuItem(
                icon: Icons.search,
                label: ArText.searchVisitors,
                color: AppColors.secondary,
                onTap: () => Navigator.pushNamed(context, '/visitor-search'),
              ),
              CircularMenuItem(
                icon: Icons.bar_chart,
                label: ArText.reports,
                color: AppColors.info,
                onTap: () => Navigator.pushNamed(context, '/reports'),
              ),
              CircularMenuItem(
                icon: Icons.badge,
                label: ArText.employeeAttendance,
                color: AppColors.textSecondary,
                onTap: () => Navigator.pushNamed(context, '/employee-attendance'),
              ),
              CircularMenuItem(
                icon: Icons.person_search,
                label: ArText.searchEmployees,
                color: Colors.teal,
                onTap: () => Navigator.pushNamed(context, '/employee-search'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async {
          await _loadStats();
          await _checkConnectivity();
          await _loadPendingCount();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.only(bottom: 100), // Extra bottom padding
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: SlideTransition(
              position: _slideAnimation,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(authProvider),
                  const SizedBox(height: 8),
                  _buildStatsSection(),
                  const SizedBox(height: 8),
                  _buildCircularMenu(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

