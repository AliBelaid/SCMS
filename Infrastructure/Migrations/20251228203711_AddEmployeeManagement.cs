using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EmployeeName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: true),
                    CardImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FaceImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Employees_VisitorDepartments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "VisitorDepartments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeAttendances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    CheckInTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CheckOutTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeAttendances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeAttendances_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAttendances_CheckInTime",
                table: "EmployeeAttendances",
                column: "CheckInTime");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAttendances_EmployeeId",
                table: "EmployeeAttendances",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DepartmentId",
                table: "Employees",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_EmployeeId",
                table: "Employees",
                column: "EmployeeId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmployeeAttendances");

            migrationBuilder.DropTable(
                name: "Employees");
        }
    }
}
