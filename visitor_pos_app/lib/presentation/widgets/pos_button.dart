import 'package:flutter/material.dart';
import '../../core/constants/app_styles.dart';

/// POS-friendly large button widget
class PosButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isPrimary;
  final bool isDanger;
  final IconData? icon;
  final bool isLoading;

  const PosButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isPrimary = true,
    this.isDanger = false,
    this.icon,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    ButtonStyle style;
    if (isDanger) {
      style = AppStyles.dangerButtonStyle;
    } else if (isPrimary) {
      style = AppStyles.primaryButtonStyle;
    } else {
      style = AppStyles.secondaryButtonStyle;
    }

    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: style,
      child: isLoading
          ? const SizedBox(
              height: 24,
              width: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )
          : Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 24),
                  const SizedBox(width: 8),
                ],
                Text(text, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ],
            ),
    );
  }
}

