# Visitor Management System - Setup Documentation

## Overview
This document describes the Visitor Management System that has been integrated into your SCMS application. The system allows tracking visitors, managing visits, and generating reports.

## What Was Created

### Backend (C# .NET Core)

#### 1. Entities (Core/Entities/VisitorManagement/)
- **Visitor.cs** - Represents a visitor with personal information
- **Visit.cs** - Represents a visit record (check-in/check-out)
- **VisitorDepartment.cs** - Departments that visitors can visit

#### 2. DTOs (Core/Dtos/VisitorManagement/)
- **VisitorDto.cs** - Data transfer objects for visitors
- **VisitDto.cs** - Data transfer objects for visits and reports
  - CreateVisitDto
  - VisitSummaryDto
  - DepartmentVisitCountDto
  - UserVisitCountDto
  - DepartmentDto

#### 3. Controllers (API/Controllers/)
- **VisitsController.cs** - Manages visit operations
  - GET `/api/Visits/active` - Get all active (ongoing) visits
  - GET `/api/Visits/number/{visitNumber}` - Get visit by number
  - POST `/api/Visits` - Create new visit (check-in)
  - POST `/api/Visits/checkout/{visitNumber}` - Checkout a visit

- **VisitorDepartmentsController.cs** - Manages departments
  - GET `/api/VisitorDepartments` - Get all departments
  - GET `/api/VisitorDepartments/{id}` - Get department by ID

- **VisitReportsController.cs** - Generates reports and statistics
  - GET `/api/VisitReports/summary?fromDate={date}&toDate={date}` - Visit summary
  - GET `/api/VisitReports/visits` - Filtered visits list
  - GET `/api/VisitReports/daily-stats?days={n}` - Daily statistics
  - GET `/api/VisitReports/top-visitors?top={n}` - Most frequent visitors

#### 4. Database Configuration
Updated **AppIdentityDbContext.cs** to include:
- Visitor Management entities
- Entity configurations with proper relationships
- Seed data for departments and sample visitors

### Frontend (Angular)

#### 1. Routes (SCMS/src/app/)
- Updated **app.routes.ts** to include visitor-management module
- Created **visitor-management.routes.ts** with routes:
  - `/app/visitor-management/dashboard` - Main dashboard
  - `/app/visitor-management/visits/active` - Active visits list
  - `/app/visitor-management/visits/checkin` - Check-in form
  - `/app/visitor-management/visits/checkout/:visitNumber` - Checkout form
  - `/app/visitor-management/reports` - Reports and statistics

#### 2. Components (SCMS/src/app/visitor-management/)
- **visitor-dashboard.component.ts** - Main dashboard with navigation cards
- **visits-list.component.ts** - Lists active visits
- **visit-reports.component.ts** - Full-featured reports page with:
  - Date range filtering
  - Summary statistics cards
  - Department statistics table
  - User statistics table
  - Daily statistics table
- **visit-checkin.component.ts** - Placeholder for check-in
- **visit-checkout.component.ts** - Placeholder for checkout

## Seed Data

### Departments
The system comes pre-seeded with 5 departments:
1. Human Resources
2. Finance
3. Operations
4. IT
5. Sales

### Visitors
5 sample visitors are pre-seeded:
1. Ahmed Ali Hassan (Tech Solutions Ltd)
2. Fatima Mohammed Ibrahim (Global Consultants)
3. Omar Abdullah Khalid (Business Partners Inc)
4. Layla Hassan Ahmed
5. Khalid Yousef Mansour (Innovation Hub)

## Database Migration

To apply the database changes, run these commands in your API project directory:

```bash
# Add migration
dotnet ef migrations add AddVisitorManagement --project Infrastructure --startup-project API

# Update database
dotnet ef database update --project Infrastructure --startup-project API
```

## Usage

### Accessing the System

1. **Via Navigation Menu**: Add a menu item in your Angular layout to navigate to `/app/visitor-management`

2. **Direct URLs**:
   - Dashboard: `http://localhost:4200/app/visitor-management/dashboard`
   - Reports: `http://localhost:4200/app/visitor-management/reports`
   - Active Visits: `http://localhost:4200/app/visitor-management/visits/active`

### API Examples

#### Create a Visit (Check-in)
```http
POST /api/Visits
Authorization: Bearer {token}
Content-Type: application/json

{
  "visitor": {
    "id": 0,
    "fullName": "John Doe",
    "nationalId": "1234567890",
    "phone": "0501234567",
    "company": "ABC Corp"
  },
  "carPlate": "ABC123",
  "departmentId": 1,
  "employeeToVisit": "Mohammed Ahmed",
  "visitReason": "Business meeting",
  "expectedDurationHours": 2
}
```

#### Get Visit Summary Report
```http
GET /api/VisitReports/summary?fromDate=2025-01-01&toDate=2025-12-31
Authorization: Bearer {token}
```

Response:
```json
{
  "totalVisits": 150,
  "totalCompleted": 120,
  "totalOngoing": 30,
  "visitsPerDepartment": [
    {
      "departmentId": 1,
      "departmentName": "Human Resources",
      "visitCount": 45
    }
  ],
  "visitsPerUser": [
    {
      "userId": 1,
      "userName": "ADMIN001",
      "visitCount": 30
    }
  ]
}
```

## Features

### Backend Features
✅ RESTful API for visitor management
✅ Automatic visit number generation (format: V{YYYYMMDD}-{sequence})
✅ Visit status tracking (ongoing, completed, incomplete)
✅ Department-based organization
✅ User activity tracking
✅ Comprehensive reporting endpoints
✅ Date range filtering
✅ Full audit trail

### Frontend Features
✅ Modern Material Design UI
✅ Arabic (RTL) interface
✅ Real-time data loading
✅ Date range filtering for reports
✅ Interactive statistics cards
✅ Department and user breakdowns
✅ Daily statistics visualization
✅ Responsive design

## Next Steps

To complete the visitor management system, you should:

1. **Implement Check-in Form**:
   - Create visitor information form
   - Add camera integration for photos
   - Implement barcode/QR code scanning

2. **Implement Check-out Form**:
   - Load visit details
   - Calculate duration
   - Print visitor pass receipt

3. **Add Navigation Menu**:
   - Add "Visitor Management" to main menu
   - Add submenu items for visits, reports, etc.

4. **Integrate with Flutter App**:
   - The backend API is ready to be used by the Flutter POS app
   - API endpoints match the Flutter app's expectations

5. **Add Printing**:
   - Implement receipt printing for visitor passes
   - Generate QR codes for visits

6. **Add Images Upload**:
   - Implement file upload for visitor photos
   - Store images in cloud storage or local server

## API Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/Visits/active | Get active visits |
| GET | /api/Visits/number/{visitNumber} | Get visit by number |
| POST | /api/Visits | Create visit |
| POST | /api/Visits/checkout/{visitNumber} | Checkout visit |
| GET | /api/VisitorDepartments | Get departments |
| GET | /api/VisitorDepartments/{id} | Get department |
| GET | /api/VisitReports/summary | Get summary report |
| GET | /api/VisitReports/visits | Get filtered visits |
| GET | /api/VisitReports/daily-stats | Get daily statistics |
| GET | /api/VisitReports/top-visitors | Get top visitors |

## Environment Configuration

Make sure your Angular `environment.ts` file has the correct API URL:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001/api'  // Update to your API URL
};
```

## Support

For issues or questions, refer to:
- Flutter app code in `visitor_pos_app/` directory
- Backend controllers in `API/Controllers/`
- Entity definitions in `Core/Entities/VisitorManagement/`

---
**Developed by: Higher Technical Committee 2025-2026**

