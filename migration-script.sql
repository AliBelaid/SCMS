-- ============================================
-- Visitor Management Enhancements Migration
-- Database: SCMS
-- Date: 2024-12-26
-- ============================================

USE SCMS;
GO

PRINT '========================================';
PRINT 'Starting Visitor Management Migration';
PRINT '========================================';
PRINT '';

-- ============================================
-- STEP 1: Add new columns to Visits table
-- ============================================
PRINT 'Step 1: Updating Visits table...';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Visits' AND COLUMN_NAME = 'RejectionReason')
BEGIN
    ALTER TABLE Visits ADD RejectionReason NVARCHAR(500) NULL;
    PRINT '  ✓ Added RejectionReason column';
END
ELSE
    PRINT '  - RejectionReason already exists';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Visits' AND COLUMN_NAME = 'RejectedAt')
BEGIN
    ALTER TABLE Visits ADD RejectedAt DATETIME2 NULL;
    PRINT '  ✓ Added RejectedAt column';
END
ELSE
    PRINT '  - RejectedAt already exists';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Visits' AND COLUMN_NAME = 'RejectedByUserId')
BEGIN
    ALTER TABLE Visits ADD RejectedByUserId INT NULL;
    PRINT '  ✓ Added RejectedByUserId column';
END
ELSE
    PRINT '  - RejectedByUserId already exists';

PRINT '';

-- ============================================
-- STEP 2: Add new columns to Visitors table
-- ============================================
PRINT 'Step 2: Updating Visitors table...';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Visitors' AND COLUMN_NAME = 'BlockReason')
BEGIN
    ALTER TABLE Visitors ADD BlockReason NVARCHAR(500) NULL;
    PRINT '  ✓ Added BlockReason column';
END
ELSE
    PRINT '  - BlockReason already exists';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Visitors' AND COLUMN_NAME = 'BlockedAt')
BEGIN
    ALTER TABLE Visitors ADD BlockedAt DATETIME2 NULL;
    PRINT '  ✓ Added BlockedAt column';
END
ELSE
    PRINT '  - BlockedAt already exists';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Visitors' AND COLUMN_NAME = 'BlockedByUserId')
BEGIN
    ALTER TABLE Visitors ADD BlockedByUserId INT NULL;
    PRINT '  ✓ Added BlockedByUserId column';
END
ELSE
    PRINT '  - BlockedByUserId already exists';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Visitors' AND COLUMN_NAME = 'CreatedByUserId')
BEGIN
    ALTER TABLE Visitors ADD CreatedByUserId INT NOT NULL DEFAULT 1;
    PRINT '  ✓ Added CreatedByUserId column';
END
ELSE
    PRINT '  - CreatedByUserId already exists';

PRINT '';

-- ============================================
-- STEP 3: Update existing status values
-- ============================================
PRINT 'Step 3: Updating status values...';

DECLARE @OngoingCount INT, @CompletedCount INT, @IncompleteCount INT;

SELECT @OngoingCount = COUNT(*) FROM Visits WHERE Status = 'ongoing';
SELECT @CompletedCount = COUNT(*) FROM Visits WHERE Status = 'completed';
SELECT @IncompleteCount = COUNT(*) FROM Visits WHERE Status = 'incomplete';

IF @OngoingCount > 0
BEGIN
    UPDATE Visits SET Status = 'checkedin' WHERE Status = 'ongoing';
    PRINT '  ✓ Updated ' + CAST(@OngoingCount AS VARCHAR) + ' visits: ongoing → checkedin';
END
ELSE
    PRINT '  - No ongoing visits to update';

IF @CompletedCount > 0
BEGIN
    UPDATE Visits SET Status = 'checkedout' WHERE Status = 'completed';
    PRINT '  ✓ Updated ' + CAST(@CompletedCount AS VARCHAR) + ' visits: completed → checkedout';
END
ELSE
    PRINT '  - No completed visits to update';

IF @IncompleteCount > 0
BEGIN
    UPDATE Visits SET Status = 'rejected' WHERE Status = 'incomplete';
    PRINT '  ✓ Updated ' + CAST(@IncompleteCount AS VARCHAR) + ' visits: incomplete → rejected';
END
ELSE
    PRINT '  - No incomplete visits to update';

PRINT '';

-- ============================================
-- STEP 4: Verification
-- ============================================
PRINT '========================================';
PRINT 'Migration Completed Successfully!';
PRINT '========================================';
PRINT '';
PRINT 'Verification:';
PRINT '----------------------------------------';

-- Check Visits table structure
PRINT 'Visits Table - New Columns:';
SELECT 
    COLUMN_NAME AS 'Column Name',
    DATA_TYPE AS 'Data Type',
    IS_NULLABLE AS 'Nullable'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Visits'
AND COLUMN_NAME IN ('RejectionReason', 'RejectedAt', 'RejectedByUserId');

PRINT '';

-- Check Visitors table structure
PRINT 'Visitors Table - New Columns:';
SELECT 
    COLUMN_NAME AS 'Column Name',
    DATA_TYPE AS 'Data Type',
    IS_NULLABLE AS 'Nullable'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Visitors'
AND COLUMN_NAME IN ('BlockReason', 'BlockedAt', 'BlockedByUserId', 'CreatedByUserId');

PRINT '';

-- Check status values
PRINT 'Visit Status Distribution:';
SELECT 
    Status,
    COUNT(*) AS 'Count'
FROM Visits
GROUP BY Status;

PRINT '';

-- Summary
PRINT 'Database Statistics:';
SELECT 
    (SELECT COUNT(*) FROM Visits) AS 'Total Visits',
    (SELECT COUNT(*) FROM Visitors) AS 'Total Visitors',
    (SELECT COUNT(*) FROM Visits WHERE Status = 'checkedin') AS 'Checked In',
    (SELECT COUNT(*) FROM Visits WHERE Status = 'checkedout') AS 'Checked Out',
    (SELECT COUNT(*) FROM Visits WHERE Status = 'rejected') AS 'Rejected',
    (SELECT COUNT(*) FROM Visitors WHERE IsBlocked = 1) AS 'Blocked Visitors';

PRINT '';
PRINT '========================================';
PRINT 'Next Steps:';
PRINT '1. Restart your API server';
PRINT '2. Test the /api/Visitors endpoint';
PRINT '3. Test login functionality';
PRINT '========================================';

GO

