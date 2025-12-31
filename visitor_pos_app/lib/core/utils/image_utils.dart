import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image/image.dart' as img;

/// Image Utility Functions
/// Converts images to base64 for API submission and handles logo display
class ImageUtils {
  /// Convert image file to base64 string
  static Future<String?> imageToBase64(File? imageFile) async {
    if (imageFile == null || !await imageFile.exists()) {
      return null;
    }
    
    try {
      final bytes = await imageFile.readAsBytes();
      return base64Encode(bytes);
    } catch (e) {
      return null;
    }
  }
  
  /// Resize image to reduce file size (optional optimization)
  static Future<File?> resizeImage(File imageFile, {int maxWidth = 1920, int maxHeight = 1080}) async {
    try {
      final bytes = await imageFile.readAsBytes();
      final image = img.decodeImage(bytes);
      
      if (image == null) return imageFile;
      
      // Resize if needed
      img.Image? resizedImage = image;
      if (image.width > maxWidth || image.height > maxHeight) {
        resizedImage = img.copyResize(
          image,
          width: image.width > maxWidth ? maxWidth : null,
          height: image.height > maxHeight ? maxHeight : null,
          maintainAspect: true,
        );
      }
      
      // Save resized image
      final resizedBytes = img.encodeJpg(resizedImage, quality: 85);
      final resizedFile = File(imageFile.path.replaceAll('.jpg', '_resized.jpg'));
      await resizedFile.writeAsBytes(resizedBytes);
      return resizedFile;
    } catch (e) {
      // If resize fails, return original
      return imageFile;
    }
  }
  
  /// Check if logo asset exists
  static Future<bool> logoExists() async {
    try {
      await rootBundle.load('assets/images/logo.png');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /// Get logo image widget with customizable size
  /// 
  /// Usage:
  /// ```dart
  /// ImageUtils.logoWidget(height: 50)
  /// ImageUtils.logoWidget(width: 100, height: 100)
  /// ImageUtils.logoWidget(size: 80) // Both width and height
  /// ```
  static Widget logoWidget({
    double? width,
    double? height,
    double? size,
    BoxFit fit = BoxFit.contain,
    Color? color,
  }) {
    final logoWidth = size ?? width;
    final logoHeight = size ?? height;
    
    return FutureBuilder<bool>(
      future: logoExists(),
      builder: (context, snapshot) {
        if (snapshot.data == true) {
          return Image.asset(
            'assets/images/logo.png',
            width: logoWidth,
            height: logoHeight,
            fit: fit,
            color: color,
            errorBuilder: (context, error, stackTrace) {
              return _logoFallback(logoWidth, logoHeight);
            },
          );
        }
        return _logoFallback(logoWidth, logoHeight);
      },
    );
  }
  
  /// Logo fallback widget when asset is not found
  static Widget _logoFallback(double? width, double? height) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Icon(
        Icons.image_not_supported,
        color: Colors.grey,
      ),
    );
  }
  
  /// Resolve image URL (add base URL if relative path)
  static String resolveImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Add base URL for relative paths
    // This should match your API base URL without /api
    const baseUrl = 'http://80.209.230.140:6024';
    return '$baseUrl$imagePath';
  }
}

/// Predefined logo sizes for common use cases
class LogoSize {
  LogoSize._(); // Private constructor to prevent instantiation
  
  static const double small = 30.0;
  static const double medium = 50.0;
  static const double large = 80.0;
  static const double extraLarge = 120.0;
  
  /// AppBar logo size (recommended)
  static const double appBar = 40.0;
  
  /// Login screen logo size (recommended)
  static const double login = 100.0;
  
  /// Home screen header logo size (recommended)
  static const double header = 45.0;
}

