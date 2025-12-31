# Database Migration Commands

## Quick Start

Follow these steps to apply the Visitor Management System database changes:

### Step 1: Create Migration

Open a terminal in your project root directory and run:

```bash
dotnet ef migrations add AddVisitorManagement --project Infrastructure --startup-project API
```

This will create a new migration file in `Infrastructure/Migrations/` with all the database changes.

### Step 2: Review Migration

Check the generated migration file to ensure it includes:
- Visitors table
- Visits table
- VisitorDepartments table
- Seed data for departments and visitors

### Step 3: Apply Migration

```bash
dotnet ef database update --project Infrastructure --startup-project API
```

This will apply the changes to your database.

### Step 4: Verify Database

After migration, your database should have these new tables:
- `Visitors` - Stores visitor information
- `Visits` - Stores visit records
- `VisitorDepartments` - Stores departments visitors can visit

### Step 5: Test API

Start your API:

```bash
cd API
dotnet run
```

Test the endpoints using Swagger at: `https://localhost:5001/swagger`

Look for these new controllers:
- VisitsController
- VisitorDepartmentsController
- VisitReportsController

### Step 6: Run Angular App

```bash
cd SCMS
npm install  # If needed
npm start
```

Navigate to: `http://localhost:4200/app/visitor-management/reports`

## Troubleshooting

### Issue: Migration already exists
```bash
# Remove the last migration
dotnet ef migrations remove --project Infrastructure --startup-project API

# Then create it again
dotnet ef migrations add AddVisitorManagement --project Infrastructure --startup-project API
```

### Issue: Database connection error
- Check connection string in `appsettings.json`
- Ensure SQL Server is running
- Verify database exists

### Issue: Build errors
```bash
# Clean and rebuild
dotnet clean
dotnet build
```

### Issue: Angular errors
```bash
# In SCMS directory
npm install
ng serve
```

## Alternative: SQL Script

If you prefer manual SQL execution, you can generate a SQL script:

```bash
dotnet ef migrations script --project Infrastructure --startup-project API --output VisitorManagement.sql
```

Then execute the generated `VisitorManagement.sql` file in your database management tool.

## Rollback

To rollback this migration if needed:

```bash
# Revert database to previous migration
dotnet ef database update PreviousMigrationName --project Infrastructure --startup-project API

# Remove the migration
dotnet ef migrations remove --project Infrastructure --startup-project API
```

## Verify Installation

After successful migration, run these SQL queries to verify:

```sql
-- Check Visitor Departments
SELECT * FROM VisitorDepartments;

-- Check Visitors
SELECT * FROM Visitors;

-- Check Visits
SELECT * FROM Visits;

-- Check structure
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN ('Visitors', 'Visits', 'VisitorDepartments');

-- Verify seed data counts
SELECT 
    (SELECT COUNT(*) FROM VisitorDepartments) as Departments,
    (SELECT COUNT(*) FROM Visitors) as Visitors,
    (SELECT COUNT(*) FROM Visits) as Visits,
    (SELECT COUNT(*) FROM Visits WHERE Status = 'ongoing') as OngoingVisits,
    (SELECT COUNT(*) FROM Visits WHERE Status = 'completed') as CompletedVisits;
```

You should see:
- **5 departments** (HR, Finance, Operations, IT, Sales)
- **5 sample visitors** (Ahmed, Fatima, Omar, Layla, Khalid)
- **10 sample visits** (3 ongoing, 7 completed)
- All three tables created with proper relationships

---

✅ **Success Indicators**:
1. Migration runs without errors
2. All 3 new tables are created
3. Seed data is populated
4. API starts successfully
5. Swagger shows new endpoints
6. Angular app loads visitor management pages

❌ **Common Mistakes**:
1. Not running commands from project root
2. Wrong project paths in commands
3. Database connection issues
4. Missing Entity Framework Core tools

## Need Help?

If you encounter issues:
1. Check the error message carefully
2. Ensure all NuGet packages are installed
3. Verify your database connection
4. Check that Infrastructure and API projects build successfully
5. Refer to `VISITOR_MANAGEMENT_SETUP.md` for detailed information

