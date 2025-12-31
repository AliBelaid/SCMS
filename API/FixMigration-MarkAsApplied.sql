-- ============================================
-- Fix Migration: Mark as Applied (SAFE - Keeps all data)
-- ============================================
-- Run this script to mark the migration as applied since columns already exist
-- This prevents the duplicate column error

USE [SCMS];
GO

-- Mark the migration as applied if columns already exist
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
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20251226193326_AddVisitorManagementEnhancements', '9.0.5');
    
    PRINT 'SUCCESS: Migration 20251226193326_AddVisitorManagementEnhancements marked as applied.';
    PRINT 'The application should now start without migration errors.';
END
ELSE IF EXISTS (
    SELECT 1 
    FROM [__EFMigrationsHistory] 
    WHERE [MigrationId] = '20251226193326_AddVisitorManagementEnhancements'
)
BEGIN
    PRINT 'Migration already marked as applied - no action needed.';
END
ELSE
BEGIN
    PRINT 'WARNING: RejectedAt column does not exist. Migration may need to run normally.';
END

GO

