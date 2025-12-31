using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserPermissions_AspNetUsers_GrantedById",
                table: "UserPermissions");

            migrationBuilder.DropForeignKey(
                name: "FK_UserPermissions_AspNetUsers_UserId",
                table: "UserPermissions");

            migrationBuilder.DropIndex(
                name: "IX_UserPermissions_OrderId",
                table: "UserPermissions");

            migrationBuilder.DeleteData(
                table: "Visits",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Visits",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Visits",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Visits",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Visits",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Visits",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Visits",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Visits",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Visits",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Visits",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_OrderId_UserId",
                table: "UserPermissions",
                columns: new[] { "OrderId", "UserId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_UserPermissions_AspNetUsers_GrantedById",
                table: "UserPermissions",
                column: "GrantedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserPermissions_AspNetUsers_UserId",
                table: "UserPermissions",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserPermissions_AspNetUsers_GrantedById",
                table: "UserPermissions");

            migrationBuilder.DropForeignKey(
                name: "FK_UserPermissions_AspNetUsers_UserId",
                table: "UserPermissions");

            migrationBuilder.DropIndex(
                name: "IX_UserPermissions_OrderId_UserId",
                table: "UserPermissions");

            migrationBuilder.InsertData(
                table: "Visits",
                columns: new[] { "Id", "CarImageUrl", "CarPlate", "CheckInAt", "CheckOutAt", "CreatedAt", "CreatedByUserId", "CreatedByUserName", "DepartmentId", "DepartmentName", "EmployeeToVisit", "ExpectedDurationHours", "Status", "UpdatedAt", "VisitNumber", "VisitReason", "VisitorId", "VisitorName" },
                values: new object[,]
                {
                    { 1, null, "ABC-1234", new DateTime(2024, 12, 31, 9, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 31, 11, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 31, 9, 0, 0, 0, DateTimeKind.Utc), 1, "ADMIN001", 1, "Human Resources", "Mohammed Abdullah", 2, "completed", new DateTime(2024, 12, 31, 11, 0, 0, 0, DateTimeKind.Utc), "V20250106-0001", "Job interview", 1, "Ahmed Ali Hassan" },
                    { 2, null, null, new DateTime(2024, 12, 31, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 31, 13, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 31, 10, 0, 0, 0, DateTimeKind.Utc), 1, "ADMIN001", 2, "Finance", "Sara Ahmed", 3, "completed", new DateTime(2024, 12, 31, 13, 0, 0, 0, DateTimeKind.Utc), "V20250106-0002", "Budget consultation", 2, "Fatima Mohammed Ibrahim" },
                    { 3, null, "XYZ-5678", new DateTime(2024, 12, 31, 22, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 12, 31, 22, 0, 0, 0, DateTimeKind.Utc), 1, "ADMIN001", 4, "IT", "Khalid Hassan", 4, "ongoing", new DateTime(2024, 12, 31, 22, 0, 0, 0, DateTimeKind.Utc), "V20250107-0001", "System demonstration", 3, "Omar Abdullah Khalid" },
                    { 4, null, null, new DateTime(2024, 12, 31, 23, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 12, 31, 23, 0, 0, 0, DateTimeKind.Utc), 1, "ADMIN001", 5, "Sales", "Noor Ibrahim", 2, "ongoing", new DateTime(2024, 12, 31, 23, 0, 0, 0, DateTimeKind.Utc), "V20250107-0002", "Product presentation", 4, "Layla Hassan Ahmed" },
                    { 5, null, "DEF-9999", new DateTime(2024, 12, 30, 8, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 30, 13, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 30, 8, 0, 0, 0, DateTimeKind.Utc), 1, "ADMIN001", 3, "Operations", "Ahmed Youssef", 5, "completed", new DateTime(2024, 12, 30, 13, 0, 0, 0, DateTimeKind.Utc), "V20250105-0001", "Operations review meeting", 5, "Khalid Yousef Mansour" },
                    { 6, null, null, new DateTime(2024, 12, 29, 14, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 29, 15, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 29, 14, 0, 0, 0, DateTimeKind.Utc), 1, "ADMIN001", 2, "Finance", "Sara Ahmed", 1, "completed", new DateTime(2024, 12, 29, 15, 0, 0, 0, DateTimeKind.Utc), "V20250104-0001", "Contract discussion", 1, "Ahmed Ali Hassan" },
                    { 7, null, "LMN-3333", new DateTime(2024, 12, 28, 9, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 28, 15, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 28, 9, 0, 0, 0, DateTimeKind.Utc), 1, "ADMIN001", 1, "Human Resources", "Mohammed Abdullah", 6, "completed", new DateTime(2024, 12, 28, 15, 0, 0, 0, DateTimeKind.Utc), "V20250103-0001", "Training session", 2, "Fatima Mohammed Ibrahim" },
                    { 8, null, null, new DateTime(2024, 12, 31, 23, 30, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 12, 31, 23, 30, 0, 0, DateTimeKind.Utc), 1, "ADMIN001", 5, "Sales", "Noor Ibrahim", 3, "ongoing", new DateTime(2024, 12, 31, 23, 30, 0, 0, DateTimeKind.Utc), "V20250107-0003", "Partnership discussion", 3, "Omar Abdullah Khalid" },
                    { 9, null, null, new DateTime(2024, 12, 27, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 27, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 27, 10, 0, 0, 0, DateTimeKind.Utc), 1, "ADMIN001", 4, "IT", "Khalid Hassan", 2, "completed", new DateTime(2024, 12, 27, 12, 0, 0, 0, DateTimeKind.Utc), "V20250102-0001", "Technical support", 4, "Layla Hassan Ahmed" },
                    { 10, null, "DEF-9999", new DateTime(2024, 12, 26, 9, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 26, 13, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 12, 26, 9, 0, 0, 0, DateTimeKind.Utc), 1, "ADMIN001", 1, "Human Resources", "Mohammed Abdullah", 4, "completed", new DateTime(2024, 12, 26, 13, 0, 0, 0, DateTimeKind.Utc), "V20250101-0001", "Employee onboarding", 5, "Khalid Yousef Mansour" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_OrderId",
                table: "UserPermissions",
                column: "OrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserPermissions_AspNetUsers_GrantedById",
                table: "UserPermissions",
                column: "GrantedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserPermissions_AspNetUsers_UserId",
                table: "UserPermissions",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
