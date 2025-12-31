import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

/// Circular Menu Item Widget
/// Used for the dashboard circular menu
class CircularMenuItem extends StatefulWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;
  final Gradient? gradient;

  const CircularMenuItem({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
    this.color,
    this.gradient,
  });

  @override
  State<CircularMenuItem> createState() => _CircularMenuItemState();
}

class _CircularMenuItemState extends State<CircularMenuItem>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails details) {
    setState(() => _isPressed = true);
    _controller.forward();
  }

  void _handleTapUp(TapUpDetails details) {
    setState(() => _isPressed = false);
    _controller.reverse();
    widget.onTap();
  }

  void _handleTapCancel() {
    setState(() => _isPressed = false);
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: _handleTapDown,
      onTapUp: _handleTapUp,
      onTapCancel: _handleTapCancel,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Circular icon container - reduced size
            Container(
              width: 85,
              height: 85,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: widget.gradient ?? AppColors.primaryGradient,
                color: widget.color,
                boxShadow: [
                  BoxShadow(
                    color: _isPressed
                        ? AppColors.shadow
                        : AppColors.shadowLight,
                    blurRadius: _isPressed ? 8 : 16,
                    offset: _isPressed ? const Offset(0, 2) : const Offset(0, 4),
                  ),
                ],
              ),
              child: Icon(
                widget.icon,
                size: 38,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 6), // Reduced from 12 to 6
            // Label - smaller font and tighter spacing
            Flexible(
              child: Text(
                widget.label,
                style: const TextStyle(
                  fontSize: 11, // Reduced from 14 to 11
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
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

