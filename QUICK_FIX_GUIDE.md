# Quick Fix Guide - Resolve 500 Error

## Problem
The API is returning a 500 error because the database schema doesn't match the updated entities.

## Solution
Apply the database migration to add the new fields.

---

## Option 1: Run PowerShell Script (Easiest)

Open PowerShell in the project root and run:

```powershell
.\apply-migration.ps1
```

This will automatically:
1. Create the migration
2. Apply it to the database
3. Verify the changes

---

## Option 2: Manual Steps

### Step 1: Open Terminal in API Directory
```bash
cd D:\myApps\SCMS\API
```

### Step 2: Create Migration
```bash
dotnet ef migrations add AddVisitorManagementEnhancements --context AppIdentityDbContext
```

### Step 3: Apply Migration
```bash
dotnet ef database update --context AppIdentityDbContext
```

### Step 4: Verify
```bash
dotnet ef migrations list --context AppIdentityDbContext
```

---

## Option 3: Direct SQL (If EF Fails)

If Entity Framework fails, run this SQL directly in SQL Server Management Studio:

```sql
USE SCMS;
GO

-- Add new columns to Visits table
ALTER TABLE Visits ADD RejectionReason NVARCHAR(500) NULL;
ALTER TABLE Visits ADD RejectedAt DATETIME2 NULL;
ALTER TABLE Visits ADD RejectedByUserId INT NULL;

-- Add new columns to Visitors table
ALTER TABLE Visitors ADD BlockReason NVARCHAR(500) NULL;
ALTER TABLE Visitors ADD BlockedAt DATETIME2 NULL;
ALTER TABLE Visitors ADD BlockedByUserId INT NULL;
ALTER TABLE Visitors ADD CreatedByUserId INT NOT NULL DEFAULT 1;

-- Update existing status values
UPDATE Visits SET Status = 'checkedin' WHERE Status = 'ongoing';
UPDATE Visits SET Status = 'checkedout' WHERE Status = 'completed';
UPDATE Visits SET Status = 'rejected' WHERE Status = 'incomplete';

-- Verify changes
SELECT TOP 5 * FROM Visits;
SELECT TOP 5 * FROM Visitors;
GO
```

---

## After Migration

### 1. Restart API Server
Stop the current API server (Ctrl+C) and restart:

```bash
cd D:\myApps\SCMS\API
dotnet run
```

### 2. Test the API

**Test Visitors Endpoint:**
```
GET http://localhost:5000/api/Visitors
```

**Expected Response:** List of visitors (or empty array if no visitors)

**Test Login:**
```
POST http://localhost:5000/api/Account/login
Content-Type: application/json

{
  "code": "ADMIN",
  "password": "Admin@123"
}
```

---

## Troubleshooting

### Error: "Login failed for user 'sa'"
**Solution:** Check connection string in `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=80.209.230.140;Database=SCMS;User Id=sa;Password=qwe.asd.zxc.123;MultipleActiveResultSets=true;TrustServerCertificate=True;"
}
```

### Error: "A network-related error occurred"
**Solution:** 
1. Check if SQL Server is running
2. Verify firewall allows connection to port 1433
3. Test connection with SQL Server Management Studio

### Error: "Column already exists"
**Solution:** The migration was already applied. Skip to "Restart API Server"

### Error: "dotnet ef not found"
**Solution:** Install EF Core tools:
```bash
dotnet tool install --global dotnet-ef
```

---

## Verify Database Changes

Connect to SQL Server and run:

```sql
-- Check Visits table structure
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Visits'
AND COLUMN_NAME IN ('RejectionReason', 'RejectedAt', 'RejectedByUserId');

-- Check Visitors table structure
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Visitors'
AND COLUMN_NAME IN ('BlockReason', 'BlockedAt', 'BlockedByUserId', 'CreatedByUserId');

-- Check status values
SELECT DISTINCT Status FROM Visits;
```

**Expected Results:**
- Visits: RejectionReason, RejectedAt, RejectedByUserId columns exist
- Visitors: BlockReason, BlockedAt, BlockedByUserId, CreatedByUserId columns exist
- Status values: checkedin, checkedout, rejected

---

## Test Default User Credentials

If login still fails, try these default credentials:

```
Username: ADMIN
Password: Admin@123

OR

Username: MEMBER001
Password: !Member123
```

If these don't work, you may need to seed the database with users.

---

## Next Steps After Fix

1. ✅ Migration applied
2. ✅ API restarted
3. ✅ Login successful
4. ✅ Visitors endpoint working

Now you can:
- Create visitors from Angular web app
- Search visitors in Flutter POS
- Block/unblock visitors
- Create visits with status tracking

---

## Quick Test Commands

```powershell
# Test API is running
curl http://localhost:5000/api/VisitorDepartments

# Test visitors endpoint
curl http://localhost:5000/api/Visitors

# Test login (replace with actual credentials)
curl -X POST http://localhost:5000/api/Account/login `
  -H "Content-Type: application/json" `
  -d '{"code":"ADMIN","password":"Admin@123"}'
```

---

## Summary

**Problem:** Database schema mismatch
**Solution:** Apply migration
**Time:** 2-5 minutes
**Result:** API working, visitors endpoint functional

Run the PowerShell script or follow manual steps above to fix the issue!

