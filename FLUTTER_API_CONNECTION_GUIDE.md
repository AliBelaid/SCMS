# Flutter to .NET API Connection Guide

## Overview
This guide explains how to connect your Flutter Visitor POS app to the .NET API backend.

## ✅ API Configuration Completed

The Flutter app has been configured to work with all your .NET API controllers:
- ✅ **AccountController** - Authentication
- ✅ **VisitsController** - Visit management
- ✅ **VisitorDepartmentsController** - Department listings
- ✅ **VisitReportsController** - Reports and statistics
- ✅ **AdminController** - Admin operations

---

## 🔧 Configuration Steps

### Step 1: Update API Base URL

Edit `visitor_pos_app/lib/core/constants/api_endpoints.dart`:

```dart
// For Android Emulator (default)
static const String baseUrl = "https://10.0.2.2:6001/api";

// For Physical Android Device
static const String baseUrl = "https://192.168.1.100:6001/api";  // Use your PC's IP

// For iOS Simulator
static const String baseUrl = "https://localhost:6001/api";

// For Production
static const String baseUrl = "https://your-domain.com/api";
```

#### Finding Your PC's IP Address:

**Windows:**
```powershell
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**macOS/Linux:**
```bash
ifconfig
# Look for "inet" address
```

---

## 📍 API Endpoints Mapping

### 1. Authentication (AccountController)

#### Login
```dart
// Flutter
final user = await authApi.login('ADMIN001', 'Admin123');

// .NET Endpoint
POST https://localhost:6001/api/Account/login
Body: { "code": "ADMIN001", "password": "Admin123" }
```

**Response:**
```json
{
  "id": 1,
  "code": "ADMIN001",
  "description": "ADMIN001",
  "role": "Admin",
  "isActive": true,
  "lastActive": "2025-01-07T12:00:00Z",
  "preferredLanguage": "ar",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Visitor Departments (VisitorDepartmentsController)

#### Get All Departments
```dart
// Flutter
final departments = await departmentsApi.getDepartments();

// .NET Endpoint
GET https://localhost:6001/api/VisitorDepartments
```

**Response:**
```json
[
  { "id": 1, "name": "Human Resources" },
  { "id": 2, "name": "Finance" },
  { "id": 3, "name": "Operations" },
  { "id": 4, "name": "IT" },
  { "id": 5, "name": "Sales" }
]
```

---

### 3. Visits Management (VisitsController)

#### Get Active Visits
```dart
// Flutter
final visits = await visitsApi.getActiveVisits();

// .NET Endpoint
GET https://localhost:6001/api/Visits/active
```

#### Create Visit (Check-in)
```dart
// Flutter
final visit = await visitsApi.createVisit({
  'visitor': {
    'id': 0,
    'fullName': 'Ahmed Ali',
    'phone': '0501234567',
    'company': 'Tech Co'
  },
  'departmentId': 1,
  'employeeToVisit': 'Mohammed Ahmed',
  'visitReason': 'Meeting',
  'expectedDurationHours': 2
});

// .NET Endpoint
POST https://localhost:6001/api/Visits
```

#### Checkout Visit
```dart
// Flutter
final visit = await visitsApi.checkoutVisit('V20250107-0001');

// .NET Endpoint
POST https://localhost:6001/api/Visits/checkout/V20250107-0001
```

---

### 4. Reports (VisitReportsController)

#### Get Summary Report
```dart
// Flutter
final summary = await reportsApi.getSummaryReport('2025-01-01', '2025-12-31');

// .NET Endpoint
GET https://localhost:6001/api/VisitReports/summary?fromDate=2025-01-01&toDate=2025-12-31
```

**Response:**
```json
{
  "totalVisits": 10,
  "totalCompleted": 7,
  "totalOngoing": 3,
  "visitsPerDepartment": [
    { "departmentId": 1, "departmentName": "Human Resources", "visitCount": 3 }
  ],
  "visitsPerUser": [
    { "userId": 1, "userName": "ADMIN001", "visitCount": 10 }
  ]
}
```

#### Get Daily Statistics
```dart
// Using ApiClient directly
final response = await apiClient.get(ApiEndpoints.dailyStats(days: 7));
```

---

## 🧪 Testing the Connection

### Test 1: Login Test

1. **Start .NET API:**
```bash
cd API
dotnet run
```

2. **Test with Flutter app** or use cURL:
```bash
curl -X POST https://localhost:6001/api/Account/login \
  -H "Content-Type: application/json" \
  -d '{"code":"ADMIN001","password":"Admin123"}'
```

Expected: `200 OK` with user data and token

### Test 2: Get Departments

```bash
curl -X GET https://localhost:6001/api/VisitorDepartments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: `200 OK` with array of 5 departments

### Test 3: Get Active Visits

```bash
curl -X GET https://localhost:6001/api/Visits/active \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: `200 OK` with array of 3 ongoing visits (from seed data)

---

## 🔐 SSL/HTTPS Configuration

### For Development (Self-Signed Certificates)

Your .NET API uses HTTPS with self-signed certificates. To make Flutter work with this:

**Option 1: Allow all certificates (Development Only)**

Update `visitor_pos_app/lib/data/services/api_client.dart`:

```dart
import 'package:dio/io.dart';
import 'dart:io';

ApiClient() {
  _dio = Dio(
    BaseOptions(
      baseUrl: ApiEndpoints.baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  // Allow self-signed certificates (DEVELOPMENT ONLY!)
  (_dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
    final client = HttpClient();
    client.badCertificateCallback = (cert, host, port) => true;
    return client;
  };

  // ... rest of the code
}
```

**⚠️ WARNING:** Only use this in development! In production, use proper SSL certificates.

---

## 📱 Testing on Different Devices

### Android Emulator
- Base URL: `https://10.0.2.2:6001/api`
- `10.0.2.2` maps to `localhost` on your PC

### Physical Android Device
1. Connect device to same Wi-Fi as your PC
2. Find your PC's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Update base URL: `https://192.168.1.XXX:6001/api`
4. Ensure Windows Firewall allows port 6001

### iOS Simulator
- Base URL: `https://localhost:6001/api`

### Physical iOS Device
- Same as Physical Android Device

---

## 🐛 Troubleshooting

### Issue 1: "Connection Refused"

**Problem:** Flutter can't connect to API

**Solutions:**
1. Check API is running: `dotnet run` in API folder
2. Verify base URL matches your device type
3. Check firewall allows port 6001
4. For physical devices, ensure same Wi-Fi network

### Issue 2: "SSL Handshake Failed"

**Problem:** Self-signed certificate rejected

**Solution:** Add bad certificate callback (see SSL section above)

### Issue 3: "401 Unauthorized"

**Problem:** Token missing or expired

**Solutions:**
1. Login again to get fresh token
2. Check token is saved in SharedPreferences
3. Verify Authorization header format: `Bearer {token}`

### Issue 4: "404 Not Found"

**Problem:** Endpoint path incorrect

**Solution:** Verify endpoint matches controller route:
- Flutter: `/VisitorDepartments`
- .NET: `[Route("api/[controller]")]` → `/api/VisitorDepartments`

### Issue 5: "Network Error on Physical Device"

**Solutions:**
1. Find PC IP: `ipconfig` → Use IPv4 address
2. Update base URL: `https://192.168.1.XXX:6001/api`
3. Add firewall rule:
   ```powershell
   New-NetFirewallRule -DisplayName "ASP.NET Core API" -Direction Inbound -LocalPort 6001 -Protocol TCP -Action Allow
   ```

---

## 📊 Available Test Data (Seed Data)

After running the migration, you'll have:

### Users
- **Admin**: Code `ADMIN001`, Password `Admin123`
- **Member 1**: Code `MEMBER001`, Password `Member123!`
- **Member 2**: Code `MEMBER002`, Password `Member123!`
- **Member 3**: Code `MEMBER003`, Password `Member123!`

### Departments
- Human Resources (ID: 1)
- Finance (ID: 2)
- Operations (ID: 3)
- IT (ID: 4)
- Sales (ID: 5)

### Visitors (5 sample visitors)
- Ahmed Ali Hassan
- Fatima Mohammed Ibrahim
- Omar Abdullah Khalid
- Layla Hassan Ahmed
- Khalid Yousef Mansour

### Visits (10 sample visits)
- **3 ongoing visits** (can test checkout)
- **7 completed visits** (for reports)

---

## 🎯 Quick Start Checklist

- [ ] Run database migration (`dotnet ef database update`)
- [ ] Start .NET API (`dotnet run` in API folder)
- [ ] Update Flutter base URL in `api_endpoints.dart`
- [ ] Add SSL certificate bypass (development only)
- [ ] Run Flutter app (`flutter run`)
- [ ] Test login with `ADMIN001` / `Admin123`
- [ ] Fetch departments (should see 5 departments)
- [ ] View active visits (should see 3 ongoing)
- [ ] View reports (should show statistics)

---

## 📞 Support

If you encounter issues:

1. Check API logs in terminal
2. Check Flutter logs: `flutter run -v`
3. Use Postman/Swagger to test endpoints directly
4. Verify database has seed data
5. Check network connectivity

---

**Developed by: Higher Technical Committee 2025-2026**

