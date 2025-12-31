-- DROP DATABASE SCRIPT (DESTRUCTIVE - Deletes ALL data)
-- WARNING: This will delete all your data!
-- Only run this if you want to start fresh

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

PRINT 'Database SCMS has been dropped and recreated.';
PRINT 'Run the application to apply all migrations from scratch.';
GO

