# API Endpoints Quick Reference

## Base URL Configuration

```dart
// Flutter: lib/core/constants/api_endpoints.dart
static const String baseUrl = "https://10.0.2.2:6001/api";

// .NET: appsettings.Development.json
"ApiUrl": "https://localhost:6001/"
```

---

## Complete Endpoint Mapping

| Feature | Flutter Method | .NET Controller | HTTP Method | Endpoint |
|---------|---------------|-----------------|-------------|----------|
| **AUTHENTICATION** |
| Login | `authApi.login()` | AccountController | POST | `/api/Account/login` |
| Get Current User | - | AccountController | GET | `/api/Account` |
| **DEPARTMENTS** |
| Get All Departments | `departmentsApi.getDepartments()` | VisitorDepartmentsController | GET | `/api/VisitorDepartments` |
| Get Department by ID | - | VisitorDepartmentsController | GET | `/api/VisitorDepartments/{id}` |
| **VISITS** |
| Create Visit | `visitsApi.createVisit()` | VisitsController | POST | `/api/Visits` |
| Get Active Visits | `visitsApi.getActiveVisits()` | VisitsController | GET | `/api/Visits/active` |
| Get Visit by Number | `visitsApi.getVisitByNumber()` | VisitsController | GET | `/api/Visits/number/{visitNumber}` |
| Checkout Visit | `visitsApi.checkoutVisit()` | VisitsController | POST | `/api/Visits/checkout/{visitNumber}` |
| **REPORTS** |
| Summary Report | `reportsApi.getSummaryReport()` | VisitReportsController | GET | `/api/VisitReports/summary` |
| Visits Report | - | VisitReportsController | GET | `/api/VisitReports/visits` |
| Daily Statistics | - | VisitReportsController | GET | `/api/VisitReports/daily-stats` |
| Top Visitors | - | VisitReportsController | GET | `/api/VisitReports/top-visitors` |
| **ADMIN** |
| Get Users with Roles | - | AdminController | GET | `/api/Admin/users-with-roles` |
| Create User | - | AdminController | POST | `/api/Admin/create` |
| Reset Password | - | AdminController | POST | `/api/Admin/reset-password` |
| Delete User | - | AdminController | DELETE | `/api/Admin/delete-user/{userId}` |
| Update User | - | AdminController | PUT | `/api/Admin/update-user/{userId}` |

---

## Request/Response Examples

### 1. Login (POST /api/Account/login)

**Flutter Request:**
```dart
final user = await authApi.login('ADMIN001', 'Admin123');
```

**HTTP Request:**
```json
POST https://localhost:6001/api/Account/login
Content-Type: application/json

{
  "code": "ADMIN001",
  "password": "Admin123"
}
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

### 2. Get Departments (GET /api/VisitorDepartments)

**Flutter Request:**
```dart
final departments = await departmentsApi.getDepartments();
```

**HTTP Request:**
```
GET https://localhost:6001/api/VisitorDepartments
Authorization: Bearer {token}
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

### 3. Create Visit (POST /api/Visits)

**Flutter Request:**
```dart
final visit = await visitsApi.createVisit({
  'visitor': {
    'id': 0,
    'fullName': 'Ahmed Ali',
    'nationalId': '1234567890',
    'phone': '0501234567',
    'company': 'Tech Solutions'
  },
  'carPlate': 'ABC-123',
  'departmentId': 1,
  'employeeToVisit': 'Mohammed Ahmed',
  'visitReason': 'Business meeting',
  'expectedDurationHours': 2
});
```

**HTTP Request:**
```json
POST https://localhost:6001/api/Visits
Authorization: Bearer {token}
Content-Type: application/json

{
  "visitor": {
    "id": 0,
    "fullName": "Ahmed Ali",
    "nationalId": "1234567890",
    "phone": "0501234567",
    "company": "Tech Solutions"
  },
  "carPlate": "ABC-123",
  "departmentId": 1,
  "employeeToVisit": "Mohammed Ahmed",
  "visitReason": "Business meeting",
  "expectedDurationHours": 2
}
```

**Response:**
```json
{
  "id": 11,
  "visitNumber": "V20250107-0004",
  "visitorId": 6,
  "visitorName": "Ahmed Ali",
  "carPlate": "ABC-123",
  "departmentId": 1,
  "departmentName": "Human Resources",
  "employeeToVisit": "Mohammed Ahmed",
  "visitReason": "Business meeting",
  "expectedDurationHours": 2,
  "status": "ongoing",
  "checkInAt": "2025-01-07T14:30:00Z",
  "checkOutAt": null,
  "createdByUserId": 1,
  "createdByUserName": "ADMIN001",
  "createdAt": "2025-01-07T14:30:00Z"
}
```

---

### 4. Get Active Visits (GET /api/Visits/active)

**Flutter Request:**
```dart
final visits = await visitsApi.getActiveVisits();
// or with search
final searchedVisits = await visitsApi.getActiveVisits(search: 'Ahmed');
```

**HTTP Request:**
```
GET https://localhost:6001/api/Visits/active
Authorization: Bearer {token}

# With search:
GET https://localhost:6001/api/Visits/active?search=Ahmed
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 3,
    "visitNumber": "V20250107-0001",
    "visitorName": "Omar Abdullah Khalid",
    "departmentName": "IT",
    "employeeToVisit": "Khalid Hassan",
    "status": "ongoing",
    "checkInAt": "2025-01-07T10:00:00Z",
    ...
  }
]
```

---

### 5. Checkout Visit (POST /api/Visits/checkout/{visitNumber})

**Flutter Request:**
```dart
final visit = await visitsApi.checkoutVisit('V20250107-0001');
```

**HTTP Request:**
```
POST https://localhost:6001/api/Visits/checkout/V20250107-0001
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 3,
  "visitNumber": "V20250107-0001",
  "visitorName": "Omar Abdullah Khalid",
  "status": "completed",
  "checkInAt": "2025-01-07T10:00:00Z",
  "checkOutAt": "2025-01-07T14:30:00Z",
  ...
}
```

---

### 6. Get Summary Report (GET /api/VisitReports/summary)

**Flutter Request:**
```dart
final summary = await reportsApi.getSummaryReport('2025-01-01', '2025-12-31');
```

**HTTP Request:**
```
GET https://localhost:6001/api/VisitReports/summary?fromDate=2025-01-01&toDate=2025-12-31
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalVisits": 10,
  "totalCompleted": 7,
  "totalOngoing": 3,
  "visitsPerDepartment": [
    {
      "departmentId": 1,
      "departmentName": "Human Resources",
      "visitCount": 3
    },
    {
      "departmentId": 2,
      "departmentName": "Finance",
      "visitCount": 2
    }
  ],
  "visitsPerUser": [
    {
      "userId": 1,
      "userName": "ADMIN001",
      "visitCount": 10
    }
  ]
}
```

---

### 7. Get Daily Stats (GET /api/VisitReports/daily-stats)

**Flutter Request:**
```dart
final response = await apiClient.get(ApiEndpoints.dailyStats(days: 7));
```

**HTTP Request:**
```
GET https://localhost:6001/api/VisitReports/daily-stats?days=7
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "date": "2025-01-01",
    "total": 1,
    "completed": 1,
    "ongoing": 0,
    "incomplete": 0
  },
  {
    "date": "2025-01-07",
    "total": 3,
    "completed": 0,
    "ongoing": 3,
    "incomplete": 0
  }
]
```

---

## Testing with cURL

### Login
```bash
curl -X POST https://localhost:6001/api/Account/login \
  -H "Content-Type: application/json" \
  -d '{"code":"ADMIN001","password":"Admin123"}' \
  -k
```

### Get Departments (with token)
```bash
TOKEN="your_token_here"

curl -X GET https://localhost:6001/api/VisitorDepartments \
  -H "Authorization: Bearer $TOKEN" \
  -k
```

### Get Active Visits
```bash
curl -X GET https://localhost:6001/api/Visits/active \
  -H "Authorization: Bearer $TOKEN" \
  -k
```

### Create Visit
```bash
curl -X POST https://localhost:6001/api/Visits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "visitor": {
      "id": 0,
      "fullName": "Test Visitor",
      "phone": "0501111111"
    },
    "departmentId": 1,
    "employeeToVisit": "Test Employee"
  }' \
  -k
```

---

## Status Codes

| Code | Meaning | When it Happens |
|------|---------|-----------------|
| 200 | Success | Request successful |
| 201 | Created | Visit created successfully |
| 400 | Bad Request | Invalid data sent |
| 401 | Unauthorized | Missing/invalid token or wrong credentials |
| 403 | Forbidden | No permission for this action |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Something went wrong on server |

---

## Error Response Format

All errors return this format:

```json
{
  "statusCode": 401,
  "message": "Invalid user code"
}
```

---

**Note:** The `-k` flag in cURL commands allows self-signed certificates (development only).

