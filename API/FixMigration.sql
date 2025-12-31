-- Fix migration issue: Column RejectedAt already exists in Visits table
-- This script marks the migration as applied if the columns already exist
-- Run this script on your SQL Server database before restarting the API

USE [SCMS];
GO

-- Check if RejectedAt column exists and migration is not marked as applied
IF EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Visits]') 
    AND name = 'RejectedAt'
)
AND NOT EXISTS (
    SELECT 1 
    FROM [__EFMigrationsHistory] 
    WHERE [MigrationId] = '20251226193326_AddVisitorManagementEnhancements'
)
BEGIN
    -- Mark migration as applied since columns already exist
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20251226193326_AddVisitorManagementEnhancements', '9.0.5');
    
    PRINT 'Migration 20251226193326_AddVisitorManagementEnhancements marked as applied - columns already exist';
END
ELSE IF EXISTS (
    SELECT 1 
    FROM [__EFMigrationsHistory] 
    WHERE [MigrationId] = '20251226193326_AddVisitorManagementEnhancements'
)
BEGIN
    PRINT 'Migration already marked as applied - no action needed';
END
ELSE IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Visits]') 
    AND name = 'RejectedAt'
)
BEGIN
    PRINT 'WARNING: RejectedAt column does not exist - you may need to apply the migration properly';
    PRINT 'If you see this message, the migration should run normally';
END

GO
