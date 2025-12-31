# 🚀 Quick Start Commands

## Copy-paste these commands to get started immediately

### 1️⃣ Database Migration

```powershell
# Navigate to project root
cd d:\myApps\SCMS

# Create migration
dotnet ef migrations add AddVisitorManagement --project Infrastructure --startup-project API

# Apply migration (creates tables + inserts seed data)
dotnet ef database update --project Infrastructure --startup-project API
```

**Expected Output:**
```
Build succeeded.
Done.
```

---

### 2️⃣ Start .NET API

```powershell
cd API
dotnet run
```

**Expected Output:**
```
Now listening on: https://localhost:6001
Now listening on: http://localhost:6000
```

**Test in browser:** `https://localhost:6001/swagger`

---

### 3️⃣ Test API with cURL

#### Get Token
```powershell
curl -X POST https://localhost:6001/api/Account/login `
  -H "Content-Type: application/json" `
  -d '{\"code\":\"ADMIN001\",\"password\":\"Admin123\"}' `
  -k
```

Copy the token from response!

#### Get Departments (replace YOUR_TOKEN)
```powershell
curl -X GET https://localhost:6001/api/VisitorDepartments `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -k
```

**Expected:** 5 departments (HR, Finance, Operations, IT, Sales)

#### Get Active Visits
```powershell
curl -X GET https://localhost:6001/api/Visits/active `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -k
```

**Expected:** 3 ongoing visits

#### Get Reports
```powershell
curl -X GET "https://localhost:6001/api/VisitReports/summary?fromDate=2025-01-01&toDate=2025-12-31" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -k
```

**Expected:** Summary with totalVisits: 10, totalCompleted: 7, totalOngoing: 3

---

### 4️⃣ Run Angular Web App

```powershell
cd SCMS
npm start
```

**Test in browser:** `http://localhost:4200/app/visitor-management/reports`

**Login with:**
- Code: `ADMIN001`
- Password: `Admin123`

---

### 5️⃣ Configure Flutter App

#### Find Your PC's IP
```powershell
ipconfig
```

Look for: `IPv4 Address . . . : 192.168.1.XXX`

#### Update Flutter Config

Edit: `visitor_pos_app/lib/core/constants/api_endpoints.dart`

**For Android Emulator:**
```dart
static const String baseUrl = "https://10.0.2.2:6001/api";
```

**For Physical Device (use YOUR IP):**
```dart
static const String baseUrl = "https://192.168.1.XXX:6001/api";
```

#### Allow Firewall (for Physical Devices)
```powershell
New-NetFirewallRule -DisplayName "ASP.NET Core API" -Direction Inbound -LocalPort 6001 -Protocol TCP -Action Allow
```

---

### 6️⃣ Run Flutter App

```powershell
cd visitor_pos_app
flutter run
```

**Login with:**
- Code: `ADMIN001`
- Password: `Admin123`

---

## ✅ Verification Checklist

Run these commands to verify everything works:

### Verify Database
```sql
-- Open SQL Server Management Studio and run:
SELECT COUNT(*) as Departments FROM VisitorDepartments;  -- Should be 5
SELECT COUNT(*) as Visitors FROM Visitors;                -- Should be 5
SELECT COUNT(*) as Visits FROM Visits;                    -- Should be 10
SELECT COUNT(*) as OngoingVisits FROM Visits WHERE Status = 'ongoing';  -- Should be 3
```

### Verify API Endpoints (in Swagger)
- [ ] POST `/api/Account/login` returns token
- [ ] GET `/api/VisitorDepartments` returns 5 departments
- [ ] GET `/api/Visits/active` returns 3 visits
- [ ] GET `/api/VisitReports/summary` returns statistics

### Verify Angular
- [ ] Login works at `http://localhost:4200/login`
- [ ] Reports page loads at `/app/visitor-management/reports`
- [ ] Shows: 10 total, 7 completed, 3 ongoing
- [ ] Department table displays 5 departments
- [ ] User table shows ADMIN001 with 10 visits

### Verify Flutter
- [ ] App builds without errors
- [ ] Login screen appears
- [ ] Can login with ADMIN001
- [ ] Can fetch departments (5 items)
- [ ] Can view active visits (3 items)

---

## 🔧 Troubleshooting Commands

### Reset Database (if needed)
```powershell
dotnet ef database drop --project Infrastructure --startup-project API
dotnet ef database update --project Infrastructure --startup-project API
```

### Clean Flutter Build (if errors)
```powershell
cd visitor_pos_app
flutter clean
flutter pub get
flutter run
```

### Rebuild .NET Solution (if needed)
```powershell
cd API
dotnet clean
dotnet build
dotnet run
```

---

## 📊 Expected Test Results

### After Migration
```
✅ Database: 3 new tables created
✅ VisitorDepartments: 5 rows
✅ Visitors: 5 rows
✅ Visits: 10 rows
✅ AspNetUsers: 4 users (admin + 3 members)
```

### API Test Results
```
✅ Login: Returns token + user data
✅ Departments: Returns 5 departments
✅ Active Visits: Returns 3 ongoing visits
✅ Summary Report: totalVisits=10, completed=7, ongoing=3
✅ Daily Stats: 7 days of data
```

### Angular Test Results
```
✅ Reports page loads
✅ Summary cards show: 10 | 7 | 3
✅ Department table: 5 rows (HR=3, Finance=2, IT=2, Sales=2, Ops=1)
✅ User table: 1 row (ADMIN001=10)
✅ Daily stats: Up to 7 days shown
```

### Flutter Test Results
```
✅ App launches
✅ Login succeeds with ADMIN001
✅ Departments fetch returns 5 items
✅ Active visits returns 3 items
✅ Can create new visit
✅ Can checkout visit
```

---

## 🎉 Success!

When all checkboxes are ticked, your system is fully operational!

**You now have:**
- ✅ Full-stack visitor management system
- ✅ 12+ REST API endpoints
- ✅ Mobile POS app (Flutter)
- ✅ Web dashboard (Angular)
- ✅ Offline support
- ✅ Reports & analytics
- ✅ User authentication
- ✅ Test data ready

---

## 📱 Contact & Support

**System Components:**
- Backend: ASP.NET Core 6+ with Entity Framework
- Database: SQL Server (SCMS database)
- Mobile: Flutter 3.8+ (Android/iOS)
- Web: Angular 17+ with Material Design

**Documentation:**
- See `FLUTTER_API_CONNECTION_GUIDE.md` for detailed Flutter setup
- See `API_ENDPOINTS_REFERENCE.md` for all endpoint examples
- See `SEED_DATA_SUMMARY.md` for test data details
- See `MIGRATION_COMMANDS.md` for database commands

---

**Ready to start? Run the migration command above! 🚀**

