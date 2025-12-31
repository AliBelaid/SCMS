import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

/// Statistics Card Widget
/// Displays key metrics on the dashboard
class StatsCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final Gradient? gradient;
  final String? subtitle;
  final VoidCallback? onTap;

  const StatsCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    this.gradient,
    this.subtitle,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: gradient,
          color: gradient == null ? color : null,
          boxShadow: const [
            BoxShadow(
              color: AppColors.shadowLight,
              blurRadius: 12,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                if (onTap != null)
                  Icon(
                    Icons.arrow_forward_ios,
                    color: Colors.white.withOpacity(0.7),
                    size: 16,
                  ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              value,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: -1,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.white.withOpacity(0.9),
              ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withOpacity(0.7),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

