import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../core/constants/ar_text.dart';
import '../../../core/utils/logger.dart';

/// Modern Login Screen with Gradient Background
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _userNameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    // Pre-fill with test credentials for quick testing
    _userNameController.text = 'MEMBER003';
    _passwordController.text = 'Member123!';

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.5, curve: Curves.easeIn),
      ),
    );

    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.5), end: Offset.zero).animate(
          CurvedAnimation(
            parent: _animationController,
            curve: const Interval(0.3, 1.0, curve: Curves.easeOutCubic),
          ),
        );

    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.8, curve: Curves.elasticOut),
      ),
    );

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _userNameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final userCode = _userNameController.text.trim();
    final password = _passwordController.text;

    print('🔐 Login attempt: UserCode=$userCode');
    await Logger().logAuth('Login attempt', userCode);

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    try {
      final success = await authProvider.login(userCode, password);

      if (success && mounted) {
        print('✅ Login successful: $userCode');
        await Logger().logAuth('Login success', userCode, true);
        
        // Navigate to home screen after successful login
        // Use pushReplacementNamed to replace login screen with home screen
        Navigator.of(context).pushReplacementNamed('/home');
      } else if (mounted) {
        final errorMsg = authProvider.errorMessage ?? 'Login failed';
        print('❌ Login failed: $errorMsg');
        await Logger().logAuth('Login failed', userCode, false);

        // Show error message with more details
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMsg, style: const TextStyle(fontSize: 16)),
            backgroundColor: AppColors.error,
            duration: const Duration(seconds: 5),
            action: SnackBarAction(
              label: ArText.ok,
              textColor: Colors.white,
              onPressed: () {},
            ),
          ),
        );
      }
    } catch (e) {
      print('❌ Login exception: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${ArText.genericError}: ${e.toString()}'),
            backgroundColor: AppColors.error,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          return Container(
            width: size.width,
            height: size.height,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF1E3A8A), // Deep Blue
                  Color(0xFF3B82F6), // Sky Blue
                  Color(0xFF06B6D4), // Cyan
                ],
              ),
            ),
            child: Stack(
              children: [
                // Decorative circles
                Positioned(
                  top: -100,
                  right: -100,
                  child: Container(
                    width: 300,
                    height: 300,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withOpacity(0.1),
                    ),
                  ),
                ),
                Positioned(
                  bottom: -150,
                  left: -150,
                  child: Container(
                    width: 400,
                    height: 400,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withOpacity(0.1),
                    ),
                  ),
                ),

                // Main content
                SafeArea(
                  child: Center(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16.0),
                      child: FadeTransition(
                        opacity: _fadeAnimation,
                        child: SlideTransition(
                          position: _slideAnimation,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              // Logo with animation
                              ScaleTransition(
                                scale: _scaleAnimation,
                                child: Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.2),
                                        blurRadius: 15,
                                        offset: const Offset(0, 8),
                                      ),
                                    ],
                                  ),
                                  child: Image.asset(
                                    'assets/images/logo.png',
                                    width: 70,
                                    height: 70,
                                    fit: BoxFit.contain,
                                    errorBuilder: (context, error, stackTrace) =>
                                        const Icon(
                                      Icons.person_pin_circle,
                                      size: 70,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 24),

                              // Login Card
                              Container(
                                constraints: const BoxConstraints(maxWidth: 500),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.1),
                                      blurRadius: 20,
                                      offset: const Offset(0, 10),
                                    ),
                                  ],
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(20.0),
                                  child: Form(
                                    key: _formKey,
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.stretch,
                                      children: [
                                        // Title
                                        Text(
                                          ArText.visitorPos,
                                          textAlign: TextAlign.center,
                                          style: AppStyles.heading1.copyWith(
                                            color: AppColors.primary,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          ArText.loginToContinue,
                                          textAlign: TextAlign.center,
                                          style: AppStyles.bodyMedium.copyWith(
                                            color: AppColors.textSecondary,
                                          ),
                                        ),
                                        const SizedBox(height: 24),

                                        // User Code field
                                        TextFormField(
                                          controller: _userNameController,
                                          style: AppStyles.bodyLarge,
                                          decoration:
                                              AppStyles.inputDecoration(
                                                    ArText.userCode,
                                                  ).copyWith(
                                                    prefixIcon: Container(
                                                      margin:
                                                          const EdgeInsets.all(
                                                              12),
                                                      padding:
                                                          const EdgeInsets.all(
                                                              8),
                                                      decoration: BoxDecoration(
                                                        color: AppColors.primary
                                                            .withOpacity(0.1),
                                                        borderRadius:
                                                            BorderRadius.circular(
                                                                8),
                                                      ),
                                                      child: const Icon(
                                                        Icons.badge,
                                                        color: AppColors.primary,
                                                      ),
                                                    ),
                                                  ),
                                          validator: (value) {
                                            if (value == null || value.isEmpty) {
                                              return ArText.userCodeRequired;
                                            }
                                            return null;
                                          },
                                        ),
                                        const SizedBox(height: 16),

                                        // Password field
                                        TextFormField(
                                          controller: _passwordController,
                                          obscureText: _obscurePassword,
                                          style: AppStyles.bodyLarge,
                                          decoration:
                                              AppStyles.inputDecoration(
                                                    ArText.password,
                                                  ).copyWith(
                                                    prefixIcon: Container(
                                                      margin:
                                                          const EdgeInsets.all(
                                                              12),
                                                      padding:
                                                          const EdgeInsets.all(
                                                              8),
                                                      decoration: BoxDecoration(
                                                        color: AppColors.primary
                                                            .withOpacity(0.1),
                                                        borderRadius:
                                                            BorderRadius.circular(
                                                                8),
                                                      ),
                                                      child: const Icon(
                                                        Icons.lock,
                                                        color: AppColors.primary,
                                                      ),
                                                    ),
                                                    suffixIcon: IconButton(
                                                      icon: Icon(
                                                        _obscurePassword
                                                            ? Icons.visibility
                                                            : Icons
                                                                .visibility_off,
                                                        color:
                                                            AppColors.textSecondary,
                                                      ),
                                                      onPressed: () {
                                                        setState(() {
                                                          _obscurePassword =
                                                              !_obscurePassword;
                                                        });
                                                      },
                                                    ),
                                                  ),
                                          validator: (value) {
                                            if (value == null || value.isEmpty) {
                                              return ArText.passwordRequired;
                                            }
                                            return null;
                                          },
                                        ),
                                        const SizedBox(height: 24),

                                        // Login button
                                        Container(
                                          height: 50,
                                          decoration: BoxDecoration(
                                            gradient: AppColors.primaryGradient,
                                            borderRadius:
                                                BorderRadius.circular(12),
                                            boxShadow: [
                                              BoxShadow(
                                                color: AppColors.primary
                                                    .withOpacity(0.3),
                                                blurRadius: 12,
                                                offset: const Offset(0, 6),
                                              ),
                                            ],
                                          ),
                                          child: ElevatedButton(
                                            onPressed: authProvider.isLoading
                                                ? null
                                                : _handleLogin,
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor:
                                                  Colors.transparent,
                                              shadowColor: Colors.transparent,
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(10),
                                              ),
                                            ),
                                            child: authProvider.isLoading
                                                ? const SizedBox(
                                                    height: 20,
                                                    width: 20,
                                                    child:
                                                        CircularProgressIndicator(
                                                      strokeWidth: 2,
                                                      valueColor:
                                                          AlwaysStoppedAnimation<
                                                              Color>(
                                                        Colors.white,
                                                      ),
                                                    ),
                                                  )
                                                : Row(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment.center,
                                                    children: [
                                                      const Icon(
                                                        Icons.login,
                                                        size: 20,
                                                        color: Colors.white,
                                                      ),
                                                      const SizedBox(width: 10),
                                                      Text(
                                                        ArText.login,
                                                        style: const TextStyle(
                                                          fontSize: 16,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                          color: Colors.white,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),

                              // Footer
                              const SizedBox(height: 16),
                              Text(
                                '© ${DateTime.now().year} ${ArText.visitorPos}',
                                textAlign: TextAlign.center,
                                style: AppStyles.bodySmall.copyWith(
                                  color: Colors.white.withOpacity(0.8),
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
            ),
          );
        },
      ),
    );
  }
}
