# Logo Setup Guide

This guide explains how to use the logo in your Flutter app and generate app icons for publishing.

## Logo Location

Your logo file should be located at:
```
assets/images/logo.png
```

## Using the Logo in Your App

### Method 1: Using ImageUtils (Recommended)

The `ImageUtils` class provides easy-to-use methods for displaying the logo:

```dart
import 'package:visitor_pos_app/core/utils/image_utils.dart';

import 'package:visitor_pos_app/core/utils/image_utils.dart';

// Simple usage with predefined size
ImageUtils.logoWidget(size: LogoSize.medium)

// Custom width and height
ImageUtils.logoWidget(width: 100, height: 50)

// AppBar logo
ImageUtils.logoWidget(height: LogoSize.appBar)

// Login screen logo
ImageUtils.logoWidget(size: LogoSize.login)

// Custom fit and color
ImageUtils.logoWidget(
  size: 80,
  fit: BoxFit.cover,
  color: Colors.white,
)
```

### Predefined Logo Sizes

- `LogoSize.small` - 30px
- `LogoSize.medium` - 50px
- `LogoSize.large` - 80px
- `LogoSize.extraLarge` - 120px
- `LogoSize.appBar` - 40px (recommended for AppBar)
- `LogoSize.login` - 100px (recommended for login screen)
- `LogoSize.header` - 45px (recommended for headers)

### Method 2: Direct Asset Reference

```dart
Image.asset(
  'assets/images/logo.png',
  height: 50,
  fit: BoxFit.contain,
)
```

## Generating App Icons for Publishing

To generate app icons for Android, iOS, Web, Windows, and macOS from your logo:

### Step 1: Install Dependencies

Make sure `flutter_launcher_icons` is in your `pubspec.yaml` (already configured).

### Step 2: Run the Icon Generator

```bash
flutter pub get
flutter pub run flutter_launcher_icons
```

This will automatically:
- ✅ Generate all required icon sizes for Android
- ✅ Generate all required icon sizes for iOS
- ✅ Generate web icons (favicon, etc.)
- ✅ Generate Windows icons
- ✅ Generate macOS icons

### Step 3: Verify Icons

After running the command, check:
- **Android**: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- **iOS**: `ios/Runner/Assets.xcassets/AppIcon.appiconset/`
- **Web**: `web/favicon.png` and related files
- **Windows**: `windows/runner/resources/app_icon.ico`
- **macOS**: `macos/Runner/Assets.xcassets/AppIcon.appiconset/`

## Logo Requirements

For best results, your `logo.png` should be:
- **Format**: PNG with transparency
- **Minimum Size**: 1024x1024 pixels (larger is better)
- **Square Aspect Ratio**: 1:1 (equal width and height)
- **Background**: Transparent or solid color
- **File Size**: Under 5MB recommended

## Troubleshooting

### Logo Not Showing

1. Check that `logo.png` exists in `assets/images/`
2. Verify `pubspec.yaml` includes the asset:
   ```yaml
   assets:
     - assets/images/logo.png
   ```
3. Run `flutter pub get` after adding assets
4. Restart your app (hot reload may not pick up new assets)

### App Icons Not Generating

1. Ensure `flutter_launcher_icons` is in `dev_dependencies`
2. Check that `image_path` in `pubspec.yaml` points to the correct file
3. Make sure the logo file exists and is valid
4. Try deleting old icon files and regenerating

### Logo Looks Blurry

- Use a high-resolution source image (at least 1024x1024)
- Ensure `fit: BoxFit.contain` or `BoxFit.cover` is used appropriately
- For app icons, the generator will create optimized sizes automatically

## Current Configuration

Your `pubspec.yaml` is configured with:
- Logo path: `assets/images/logo.png`
- Adaptive icon background: White (#FFFFFF)
- Windows icon size: 256px
- iOS alpha removal: Enabled

## Updating the Logo

To update your logo:
1. Replace `assets/images/logo.png` with your new logo
2. Run `flutter pub run flutter_launcher_icons` to regenerate icons
3. Rebuild your app: `flutter clean && flutter pub get && flutter run`

