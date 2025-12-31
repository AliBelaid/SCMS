import 'package:flutter/material.dart';
import '../../core/constants/app_styles.dart';

/// POS-friendly text field widget
class PosTextField extends StatelessWidget {
  final String label;
  final TextEditingController? controller;
  final String? Function(String?)? validator;
  final bool obscureText;
  final TextInputType? keyboardType;
  final int? maxLines;
  final bool enabled;
  final IconData? prefixIcon;

  const PosTextField({
    super.key,
    required this.label,
    this.controller,
    this.validator,
    this.obscureText = false,
    this.keyboardType,
    this.maxLines = 1,
    this.enabled = true,
    this.prefixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      validator: validator,
      obscureText: obscureText,
      keyboardType: keyboardType,
      maxLines: maxLines,
      enabled: enabled,
      style: AppStyles.bodyLarge,
      decoration: AppStyles.inputDecoration(label).copyWith(
        prefixIcon: prefixIcon != null ? Icon(prefixIcon) : null,
      ),
    );
  }
}

