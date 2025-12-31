# Seed Data Summary

## Overview
The database is pre-populated with sample data for testing and demonstration purposes.

## User Accounts (AppIdentityDbContextSeed.cs)

### Admin Account
- **Username**: admin@taxmanager.com
- **Code**: ADMIN001
- **Password**: Admin123
- **Role**: Admin
- **Phone**: 123456789

### Member Accounts
1. **Member 1**
   - Username: member1@example.com
   - Code: MEMBER001
   - Password: Member123!
   - Role: Member
   - Phone: 555123456

2. **Member 2**
   - Username: member2@example.com
   - Code: MEMBER002
   - Password: Member123!
   - Role: Member
   - Phone: 555234567

3. **Member 3**
   - Username: member3@example.com
   - Code: MEMBER003
   - Password: Member123!
   - Role: Member
   - Phone: 555345678

## Visitor Departments (AppIdentityDbContext.cs)

5 departments for visitors:
1. **Human Resources** (ID: 1)
2. **Finance** (ID: 2)
3. **Operations** (ID: 3)
4. **IT** (ID: 4)
5. **Sales** (ID: 5)

## Visitors (AppIdentityDbContext.cs)

5 sample visitors:

1. **Ahmed Ali Hassan** (ID: 1)
   - National ID: 2850123456789
   - Phone: 0501234567
   - Company: Tech Solutions Ltd

2. **Fatima Mohammed Ibrahim** (ID: 2)
   - National ID: 2920987654321
   - Phone: 0559876543
   - Company: Global Consultants

3. **Omar Abdullah Khalid** (ID: 3)
   - Phone: 0551112233
   - Company: Business Partners Inc

4. **Layla Hassan Ahmed** (ID: 4)
   - National ID: 2881234567890
   - Phone: 0503334455

5. **Khalid Yousef Mansour** (ID: 5)
   - Phone: 0555556666
   - Company: Innovation Hub

## Visits (AppIdentityDbContext.cs)

### 10 Sample Visits Created

#### Ongoing Visits (3)
1. **V20250107-0001** - Omar visiting IT
   - Department: IT
   - Employee: Khalid Hassan
   - Reason: System demonstration
   - Expected: 4 hours
   - Check-in: 2 hours ago

2. **V20250107-0002** - Layla visiting Sales
   - Department: Sales
   - Employee: Noor Ibrahim
   - Reason: Product presentation
   - Expected: 2 hours
   - Check-in: 1 hour ago

3. **V20250107-0003** - Omar visiting Sales
   - Department: Sales
   - Employee: Noor Ibrahim
   - Reason: Partnership discussion
   - Expected: 3 hours
   - Check-in: 30 minutes ago

#### Completed Visits (7)

1. **V20250106-0001** - Ahmed visiting HR (Yesterday)
   - Car: ABC-1234
   - Duration: 2 hours
   - Reason: Job interview

2. **V20250106-0002** - Fatima visiting Finance (Yesterday)
   - Duration: 3 hours
   - Reason: Budget consultation

3. **V20250105-0001** - Khalid visiting Operations (2 days ago)
   - Car: DEF-9999
   - Duration: 5 hours
   - Reason: Operations review meeting

4. **V20250104-0001** - Ahmed visiting Finance (3 days ago)
   - Duration: 1 hour
   - Reason: Contract discussion

5. **V20250103-0001** - Fatima visiting HR (4 days ago)
   - Car: LMN-3333
   - Duration: 6 hours
   - Reason: Training session

6. **V20250102-0001** - Layla visiting IT (5 days ago)
   - Duration: 2 hours
   - Reason: Technical support

7. **V20250101-0001** - Khalid visiting HR (6 days ago)
   - Car: DEF-9999
   - Duration: 4 hours
   - Reason: Employee onboarding

## Statistics Summary

- **Total Visits**: 10
- **Ongoing**: 3
- **Completed**: 7
- **Total Visitors**: 5 (with multiple visits from some)
- **Departments Visited**: All 5 departments have visits
- **Date Range**: Last 7 days

### Visits Per Department
- Human Resources: 3 visits
- Finance: 2 visits
- Operations: 1 visit
- IT: 2 visits
- Sales: 2 visits

### Visits Per Visitor
- Ahmed Ali Hassan: 2 visits
- Fatima Mohammed Ibrahim: 2 visits
- Omar Abdullah Khalid: 2 visits
- Layla Hassan Ahmed: 2 visits
- Khalid Yousef Mansour: 2 visits

### Visits Per User (Created By)
- All visits created by: ADMIN001 (Admin user)

## Document Management Departments (AppIdentityDbContext.cs)

3 departments for document management:
1. **HR** - الموارد البشرية / Human Resources
2. **FIN** - المالية / Finance
3. **OPS** - العمليات / Operations

## Document Management Subjects (AppIdentityDbContext.cs)

12 subjects across departments:

### HR Department (4 subjects)
- REC - التوظيف / Recruitment
- TRN - التدريب / Training
- LEV - الإجازات / Leave
- SAL - الرواتب / Salaries

### Finance Department (4 subjects)
- BDG - الميزانية / Budget
- EXP - المصروفات / Expenses
- INV - الفواتير / Invoices
- AUD - التدقيق / Audit

### Operations Department (4 subjects)
- PRJ - المشاريع / Projects
- QUA - الجودة / Quality
- LOG - اللوجستيات / Logistics
- MTN - الصيانة / Maintenance

## Testing the Seed Data

### 1. Login with Admin
```
Code: ADMIN001
Password: Admin123
```

### 2. Access Visitor Management
Navigate to: `/app/visitor-management/reports`

You should see:
- 10 total visits
- 7 completed visits
- 3 ongoing visits
- Visits breakdown by department
- Visits breakdown by user

### 3. View Active Visits
Navigate to: `/app/visitor-management/visits/active`

You should see 3 ongoing visits:
- Omar in IT
- Layla in Sales
- Omar in Sales

### 4. API Testing

#### Get Summary Report
```http
GET /api/VisitReports/summary?fromDate=2025-01-01&toDate=2025-12-31
Authorization: Bearer {your_token}
```

Expected response includes all 10 visits with breakdowns.

#### Get Active Visits
```http
GET /api/Visits/active
Authorization: Bearer {your_token}
```

Expected: 3 ongoing visits

#### Get Departments
```http
GET /api/VisitorDepartments
Authorization: Bearer {your_token}
```

Expected: 5 departments

## Important Notes

1. **User IDs**: The seed assumes admin user will have ID 1. If this is not the case, visits may not have valid CreatedByUserId references.

2. **Timestamps**: All seed data uses January 1, 2025 as base timestamp with relative offsets for realistic date ranges.

3. **Visit Numbers**: Follow format `V{YYYYMMDD}-{sequence}` for easy sorting and identification.

4. **Car Plates**: Some visits have car plates, others don't (realistic scenario).

5. **Flutter App Compatibility**: All seed data is compatible with the Flutter POS app models and API expectations.

## Resetting Seed Data

To reset the database with fresh seed data:

```bash
# Drop database
dotnet ef database drop --project Infrastructure --startup-project API

# Recreate and seed
dotnet ef database update --project Infrastructure --startup-project API
```

Or use SQL Server Management Studio to delete all data from tables, then run:

```bash
dotnet ef database update --project Infrastructure --startup-project API
```

The seed data will be automatically inserted on database creation.

---
**Note**: This seed data is for development and testing purposes only. In production, you should remove or modify the seed data appropriately.

