-- Fix Migration Issue OR Drop Database Script
-- Choose one option below:

-- ============================================
-- OPTION 1: Mark Migration as Applied (SAFE - Keeps all data)
-- ============================================
-- Use this if the columns already exist and you want to keep your data

USE [SCMS];
GO

-- Check if RejectedAt column already exists
IF EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Visits]') 
    AND name = 'RejectedAt'
)
BEGIN
    -- If migration is not marked as applied, mark it as applied
    IF NOT EXISTS (
        SELECT 1 
        FROM [__EFMigrationsHistory] 
        WHERE [MigrationId] = '20251226193326_AddVisitorManagementEnhancements'
    )
    BEGIN
        INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
        VALUES ('20251226193326_AddVisitorManagementEnhancements', '9.0.5');
        
        PRINT 'SUCCESS: Migration marked as applied - columns already exist. Database is ready.';
    END
    ELSE
    BEGIN
        PRINT 'Migration already marked as applied - no action needed.';
    END
END
ELSE
BEGIN
    PRINT 'ERROR: RejectedAt column does not exist. Run the migration normally or use Option 2 to drop and recreate.';
END

GO

-- ============================================
-- OPTION 2: Drop and Recreate Database (DESTRUCTIVE - Deletes ALL data)
-- ============================================
-- UNCOMMENT THE LINES BELOW ONLY IF YOU WANT TO DROP THE ENTIRE DATABASE
-- WARNING: THIS WILL DELETE ALL YOUR DATA!

/*
USE [master];
GO

-- Close all connections to the database
ALTER DATABASE [SCMS] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

-- Drop the database
DROP DATABASE [SCMS];
GO

-- Recreate the database
CREATE DATABASE [SCMS];
GO

PRINT 'Database SCMS has been dropped and recreated. Run the application to apply all migrations.';
GO
*/

