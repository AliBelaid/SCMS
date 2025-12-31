using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class initNewUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "RejectedAt",
                table: "Visits",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RejectedByUserId",
                table: "Visits",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BlockReason",
                table: "Visitors",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "BlockedAt",
                table: "Visitors",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BlockedByUserId",
                table: "Visitors",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Visitors",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Visitors",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "BlockReason", "BlockedAt", "BlockedByUserId", "CreatedByUserId" },
                values: new object[] { null, null, null, 0 });

            migrationBuilder.UpdateData(
                table: "Visitors",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "BlockReason", "BlockedAt", "BlockedByUserId", "CreatedByUserId" },
                values: new object[] { null, null, null, 0 });

            migrationBuilder.UpdateData(
                table: "Visitors",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "BlockReason", "BlockedAt", "BlockedByUserId", "CreatedByUserId" },
                values: new object[] { null, null, null, 0 });

            migrationBuilder.UpdateData(
                table: "Visitors",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "BlockReason", "BlockedAt", "BlockedByUserId", "CreatedByUserId" },
                values: new object[] { null, null, null, 0 });

            migrationBuilder.UpdateData(
                table: "Visitors",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "BlockReason", "BlockedAt", "BlockedByUserId", "CreatedByUserId" },
                values: new object[] { null, null, null, 0 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RejectedAt",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "RejectedByUserId",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "Visits");

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
