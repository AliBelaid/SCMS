# Run Database Migration - Quick Guide

## ✅ Easiest Method: Run SQL Script Directly

Since Entity Framework tools are having installation issues, run the SQL script directly.

### Step 1: Open SQL Server Management Studio (SSMS)

1. Open **SQL Server Management Studio**
2. Connect to your server:
   - **Server name**: `80.209.230.140`
   - **Authentication**: SQL Server Authentication
   - **Login**: `sa`
   - **Password**: `qwe.asd.zxc.123`

### Step 2: Open the SQL Script

1. Open the file: `migration-script.sql` (in the root directory)
2. Or copy the SQL from below

### Step 3: Execute the Script

1. Select the `SCMS` database in the Object Explorer
2. Open a **New Query** window
3. Paste the SQL script
4. Click **Execute** (or press F5)

### Step 4: Verify Success

You should see messages like:
```
✓ Added RejectionReason column
✓ Added RejectedAt column
✓ Added RejectedByUserId column
...
Migration Completed Successfully!
```

### Step 5: Restart API

1. Stop your API server (Ctrl+C in terminal)
2. Restart it:
   ```powershell
   cd D:\myApps\SCMS\API
   dotnet run
   ```

### Step 6: Test

Test the API endpoint:
```
GET http://localhost:5000/api/Visitors
```

---

## Alternative: If You Want to Use EF Migrations

If you prefer to use Entity Framework migrations, try this:

### Option A: Install EF Tools via NuGet (Local to project)

```powershell
cd D:\myApps\SCMS\API
dotnet add package dotnet-ef --version 9.0.0
dotnet tool restore
```

Then run:
```powershell
dotnet ef migrations add AddVisitorManagementEnhancements --context AppIdentityDbContext
dotnet ef database update --context AppIdentityDbContext
```

### Option B: Use Package Manager Console (Visual Studio)

If you have Visual Studio:
1. Open Package Manager Console
2. Set Default project to: `API`
3. Run:
   ```
   Add-Migration AddVisitorManagementEnhancements -Context AppIdentityDbContext
   Update-Database -Context AppIdentityDbContext
   ```

---

## What the Migration Does

✅ Adds to **Visits** table:
   - `RejectionReason` (NVARCHAR(500))
   - `RejectedAt` (DATETIME2)
   - `RejectedByUserId` (INT)

✅ Adds to **Visitors** table:
   - `BlockReason` (NVARCHAR(500))
   - `BlockedAt` (DATETIME2)
   - `BlockedByUserId` (INT)
   - `CreatedByUserId` (INT)

✅ Updates status values:
   - `ongoing` → `checkedin`
   - `completed` → `checkedout`
   - `incomplete` → `rejected`

---

## Quick SQL Script (Copy & Paste)

The complete SQL script is in `migration-script.sql` file.

If you need it quickly, it's safe to run - it checks if columns exist before adding them, so you can run it multiple times without errors.

---

**Recommendation:** Use the SQL script method - it's the fastest and most reliable! 🚀

