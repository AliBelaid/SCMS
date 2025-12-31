# Visitor POS App - Setup Instructions

## Prerequisites

- Flutter SDK (latest stable version)
- Dart SDK (3.8.1+)
- Android Studio / VS Code with Flutter extensions
- Physical Android POS device or emulator for testing

## Installation Steps

1. **Install Dependencies**
   ```bash
   flutter pub get
   ```

2. **Configure Backend URL**
   - Open `lib/core/constants/api_endpoints.dart`
   - Update `baseUrl` to match your .NET backend API URL:
     ```dart
     static const String baseUrl = "https://your-backend-url.com/api";
     ```

3. **Run the App**
   ```bash
   flutter run
   ```

## Backend API Requirements

The app expects the following endpoints:

### Authentication
- `POST /api/auth/login`
  - Body: `{ "userName": "string", "password": "string" }`
  - Response: `{ "token": "string", "fullName": "string", "role": "string" }`

### Departments
- `GET /api/departments`
  - Response: `[{ "id": int, "name": "string" }]`

### Visits
- `POST /api/visits` - Create new visit
- `GET /api/visits/active?search=string` - Get active visits
- `GET /api/visits/{visitNumber}` - Get visit by number
- `POST /api/visits/{visitNumber}/checkout` - Checkout visit

### Reports
- `GET /api/reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD` - Get summary report

## Printer Configuration

The app includes receipt printing functionality using ESC/POS commands. To connect to a physical printer:

1. **Network Printer**: Update `PrinterService` to use socket connection
2. **Bluetooth Printer**: Add `flutter_bluetooth_serial` package
3. **USB Printer**: Use platform channels

See `lib/data/services/printer_service.dart` for implementation details.

## Features

- ✅ User authentication with token storage
- ✅ New visit registration with camera integration
- ✅ Active visits management
- ✅ Checkout by visit number
- ✅ Reports with date range
- ✅ Receipt printing (58mm thermal)
- ✅ POS-optimized UI (large buttons, big fonts)
- ✅ Landscape mode support

## Notes

- Images are converted to base64 for API submission
- Auth token is stored in SharedPreferences
- The app supports both portrait and landscape orientations
- All screens are optimized for touch interaction

