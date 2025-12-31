import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/services.dart';
import 'core/constants/app_colors.dart';
import 'data/services/api_client.dart';
import 'data/services/auth_api.dart';
import 'data/services/visits_api.dart';
import 'presentation/providers/auth_provider.dart';
import 'presentation/providers/visits_provider.dart';
import 'presentation/screens/login/login_screen.dart';
import 'presentation/screens/home/modern_home_screen.dart';
import 'presentation/screens/new_visit/new_visit_screen.dart';
import 'presentation/screens/active_visits/active_visits_screen.dart';
import 'presentation/screens/checkout/checkout_by_number_screen.dart';
import 'presentation/screens/reports/reports_screen.dart';
import 'presentation/screens/visit_details/visit_details_screen.dart';
import 'presentation/screens/visitor_search/visitor_search_screen.dart';
import 'presentation/screens/visitor_profile/visitor_profile_screen.dart';
import 'presentation/screens/employee_attendance/employee_attendance_screen.dart';
import 'presentation/screens/employee_search/employee_search_screen.dart';
import 'presentation/screens/employee_profile/employee_profile_screen.dart';
import 'data/models/visit.dart';
import 'data/services/visits_sync_service.dart';
import 'core/utils/connectivity_service.dart';
import 'core/utils/logger.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize logger
  await Logger().initialize();
  await Logger().log('SYSTEM', 'App started', 'Initializing...');

  // Set preferred orientations (support landscape for POS)
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);

  // Keep screen on (POS mode)
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);

  // Initialize auto-sync on connectivity changes
  _initializeAutoSync();

  runApp(const VisitorPosApp());
}

/// Initialize auto-sync when connectivity is restored
void _initializeAutoSync() {
  final connectivityService = ConnectivityService();
  final apiClient = ApiClient();
  final visitsApi = VisitsApi(apiClient);
  final syncService = VisitsSyncService(visitsApi);

  // Listen to connectivity changes and auto-sync when online
  connectivityService.connectivityStream.listen((result) async {
    final isOnline =
        result == ConnectivityResult.mobile ||
        result == ConnectivityResult.wifi ||
        result == ConnectivityResult.ethernet;

    if (isOnline) {
      // Auto-sync when connectivity is restored
      await syncService.autoSync();
    }
  });
}

class VisitorPosApp extends StatelessWidget {
  const VisitorPosApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Initialize API services
    final apiClient = ApiClient();
    final authApi = AuthApi(apiClient);
    final visitsApi = VisitsApi(apiClient);

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider(authApi)),
        ChangeNotifierProvider(create: (_) => VisitsProvider(visitsApi)),
      ],
      child: MaterialApp(
        title: 'Visitor POS',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.primary,
            brightness: Brightness.light,
          ),
          useMaterial3: true,
          scaffoldBackgroundColor: AppColors.background,
          appBarTheme: const AppBarTheme(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 2,
          ),
          cardTheme: CardThemeData(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 20,
            ),
          ),
        ),
        home: const AuthWrapper(),
    routes: {
      '/login': (context) => const LoginScreen(),
      '/home': (context) => const ModernHomeScreen(),
      '/new-visit': (context) => const NewVisitScreen(),
          '/active-visits': (context) => const ActiveVisitsScreen(),
          '/checkout': (context) => const CheckoutByNumberScreen(),
          '/reports': (context) => const ReportsScreen(),
          '/visit-details': (context) {
            final visit = ModalRoute.of(context)!.settings.arguments as Visit;
            return VisitDetailsScreen(visit: visit);
          },
          '/visitor-search': (context) => const VisitorSearchScreen(),
          '/visitor-profile': (context) {
            final visitorId =
                ModalRoute.of(context)!.settings.arguments as int;
            return VisitorProfileScreen(visitorId: visitorId);
          },
          '/employee-attendance': (context) => const EmployeeAttendanceScreen(),
          '/employee-search': (context) => const EmployeeSearchScreen(),
          '/employee-profile': (context) {
            final employeeId = ModalRoute.of(context)!.settings.arguments as int;
            return EmployeeProfileScreen(employeeId: employeeId);
          },
        },
      ),
    );
  }
}

/// Auth Wrapper
/// Checks if user is logged in and routes accordingly
class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        // Wait for initial load
        if (authProvider.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        // Check if user is logged in
        if (authProvider.isLoggedIn) {
          return const ModernHomeScreen();
        } else {
          return const LoginScreen();
        }
      },
    );
  }
}
