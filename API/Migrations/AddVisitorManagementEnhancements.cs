using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddVisitorManagementEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add new columns to Visits table (only if they don't exist)
            // Check if RejectionReason column exists before adding
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Visits]') AND name = 'RejectionReason')
                BEGIN
                    ALTER TABLE [Visits] ADD [RejectionReason] nvarchar(500) NULL;
                END
            ");

            // Check if RejectedAt column exists before adding
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Visits]') AND name = 'RejectedAt')
                BEGIN
                    ALTER TABLE [Visits] ADD [RejectedAt] datetime2 NULL;
                END
            ");

            // Check if RejectedByUserId column exists before adding
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Visits]') AND name = 'RejectedByUserId')
                BEGIN
                    ALTER TABLE [Visits] ADD [RejectedByUserId] int NULL;
                END
            ");

            // Add new columns to Visitors table (only if they don't exist)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Visitors]') AND name = 'BlockReason')
                BEGIN
                    ALTER TABLE [Visitors] ADD [BlockReason] nvarchar(500) NULL;
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Visitors]') AND name = 'BlockedAt')
                BEGIN
                    ALTER TABLE [Visitors] ADD [BlockedAt] datetime2 NULL;
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Visitors]') AND name = 'BlockedByUserId')
                BEGIN
                    ALTER TABLE [Visitors] ADD [BlockedByUserId] int NULL;
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Visitors]') AND name = 'CreatedByUserId')
                BEGIN
                    ALTER TABLE [Visitors] ADD [CreatedByUserId] int NOT NULL DEFAULT 1;
                END
            ");

            // Update existing status values in Visits table
            migrationBuilder.Sql(
                "UPDATE Visits SET Status = 'checkedin' WHERE Status = 'ongoing'");
            
            migrationBuilder.Sql(
                "UPDATE Visits SET Status = 'checkedout' WHERE Status = 'completed'");
            
            migrationBuilder.Sql(
                "UPDATE Visits SET Status = 'rejected' WHERE Status = 'incomplete'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert status values
            migrationBuilder.Sql(
                "UPDATE Visits SET Status = 'ongoing' WHERE Status = 'checkedin'");
            
            migrationBuilder.Sql(
                "UPDATE Visits SET Status = 'completed' WHERE Status = 'checkedout'");
            
            migrationBuilder.Sql(
                "UPDATE Visits SET Status = 'incomplete' WHERE Status = 'rejected'");

            // Remove columns from Visits table
            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "RejectedAt",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "RejectedByUserId",
                table: "Visits");

            // Remove columns from Visitors table
            migrationBuilder.DropColumn(
                name: "BlockReason",
                table: "Visitors");

            migrationBuilder.DropColumn(
                name: "BlockedAt",
                table: "Visitors");

            migrationBuilder.DropColumn(
                name: "BlockedByUserId",
                table: "Visitors");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Visitors");
        }
    }
}

