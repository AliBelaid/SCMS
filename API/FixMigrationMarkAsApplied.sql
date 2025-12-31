-- Fix migration issue: Mark migration as applied since columns already exist
-- Run this script on your SQL Server database: SCMS
-- This will prevent the migration from trying to add columns that already exist

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
        
        PRINT 'SUCCESS: Migration 20251226193326_AddVisitorManagementEnhancements marked as applied';
    END
    ELSE
    BEGIN
        PRINT 'Migration already marked as applied - no action needed';
    END
END
ELSE
BEGIN
    PRINT 'ERROR: RejectedAt column does not exist. Migration should run normally.';
END

GO

