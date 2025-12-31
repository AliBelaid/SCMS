using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVisitorManagementAndFixUserPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ArchiveReason",
                table: "Orders",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ArchivedById",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpirationDate",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "OrderHistories",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Action",
                table: "OrderHistories",
                type: "int",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "OrderHistories",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ArchivedOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OriginalOrderId = table.Column<int>(type: "int", nullable: false),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    DepartmentName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SubjectId = table.Column<int>(type: "int", nullable: false),
                    SubjectName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    OriginalCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OriginalUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ArchivedById = table.Column<int>(type: "int", nullable: false),
                    ArchivedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ArchiveReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    OriginalCreatedById = table.Column<int>(type: "int", nullable: false),
                    OriginalCreatedByName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SerializedOrderData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AttachmentsInfo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CanBeRestored = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArchivedOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArchivedOrders_AspNetUsers_ArchivedById",
                        column: x => x.ArchivedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ArchivedOrders_Orders_OriginalOrderId",
                        column: x => x.OriginalOrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DepartmentAccesses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    GrantedById = table.Column<int>(type: "int", nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CanView = table.Column<bool>(type: "bit", nullable: false),
                    CanEdit = table.Column<bool>(type: "bit", nullable: false),
                    CanDownload = table.Column<bool>(type: "bit", nullable: false),
                    CanShare = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DepartmentAccesses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DepartmentAccesses_AspNetUsers_GrantedById",
                        column: x => x.GrantedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DepartmentAccesses_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DepartmentAccesses_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderActivityLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    UserCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ControllerName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ActionName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HttpMethod = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Path = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    QueryString = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsSuccess = table.Column<bool>(type: "bit", nullable: false),
                    StatusCode = table.Column<int>(type: "int", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    Summary = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PayloadSnapshot = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OccurredAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderActivityLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderActivityLogs_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderActivityLogs_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserExceptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CreatedById = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserExceptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserExceptions_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserExceptions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserExceptions_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserPermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CanView = table.Column<bool>(type: "bit", nullable: false),
                    CanEdit = table.Column<bool>(type: "bit", nullable: false),
                    CanDelete = table.Column<bool>(type: "bit", nullable: false),
                    CanShare = table.Column<bool>(type: "bit", nullable: false),
                    CanDownload = table.Column<bool>(type: "bit", nullable: false),
                    CanPrint = table.Column<bool>(type: "bit", nullable: false),
                    CanComment = table.Column<bool>(type: "bit", nullable: false),
                    CanApprove = table.Column<bool>(type: "bit", nullable: false),
                    GrantedById = table.Column<int>(type: "int", nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPermissions_AspNetUsers_GrantedById",
                        column: x => x.GrantedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserPermissions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserPermissions_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VisitorDepartments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitorDepartments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Visitors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NationalId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Company = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MedicalNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PersonImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IdCardImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Visitors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Visits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VisitNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    VisitorId = table.Column<int>(type: "int", nullable: false),
                    VisitorName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CarPlate = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CarImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    DepartmentName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EmployeeToVisit = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    VisitReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ExpectedDurationHours = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CheckInAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CheckOutAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Visits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Visits_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Visits_Visitors_VisitorId",
                        column: x => x.VisitorId,
                        principalTable: "Visitors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "VisitorDepartments",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "HR Department", true, "Human Resources" },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Finance Department", true, "Finance" },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Operations Department", true, "Operations" },
                    { 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "IT Department", true, "IT" },
                    { 5, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sales Department", true, "Sales" }
                });

            migrationBuilder.InsertData(
                table: "Visitors",
                columns: new[] { "Id", "Company", "CreatedAt", "FullName", "IdCardImageUrl", "MedicalNotes", "NationalId", "PersonImageUrl", "Phone", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Tech Solutions Ltd", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Ahmed Ali Hassan", null, null, "2850123456789", null, "0501234567", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "Global Consultants", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Fatima Mohammed Ibrahim", null, null, "2920987654321", null, "0559876543", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "Business Partners Inc", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Omar Abdullah Khalid", null, null, null, null, "0551112233", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Layla Hassan Ahmed", null, null, "2881234567890", null, "0503334455", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, "Innovation Hub", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Khalid Yousef Mansour", null, null, null, null, "0555556666", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

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
                name: "IX_Orders_ArchivedById",
                table: "Orders",
                column: "ArchivedById");

            migrationBuilder.CreateIndex(
                name: "IX_ArchivedOrders_ArchivedAt",
                table: "ArchivedOrders",
                column: "ArchivedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ArchivedOrders_ArchivedById",
                table: "ArchivedOrders",
                column: "ArchivedById");

            migrationBuilder.CreateIndex(
                name: "IX_ArchivedOrders_OriginalOrderId",
                table: "ArchivedOrders",
                column: "OriginalOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_DepartmentAccesses_DepartmentId",
                table: "DepartmentAccesses",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_DepartmentAccesses_GrantedById",
                table: "DepartmentAccesses",
                column: "GrantedById");

            migrationBuilder.CreateIndex(
                name: "IX_DepartmentAccesses_OrderId_DepartmentId",
                table: "DepartmentAccesses",
                columns: new[] { "OrderId", "DepartmentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderActivityLogs_OccurredAt",
                table: "OrderActivityLogs",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_OrderActivityLogs_OrderId",
                table: "OrderActivityLogs",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderActivityLogs_UserId",
                table: "OrderActivityLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserExceptions_CreatedById",
                table: "UserExceptions",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_UserExceptions_OrderId_UserId",
                table: "UserExceptions",
                columns: new[] { "OrderId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserExceptions_UserId",
                table: "UserExceptions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_GrantedById",
                table: "UserPermissions",
                column: "GrantedById");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_OrderId",
                table: "UserPermissions",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_UserId",
                table: "UserPermissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_VisitorDepartments_Name",
                table: "VisitorDepartments",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Visitors_NationalId",
                table: "Visitors",
                column: "NationalId");

            migrationBuilder.CreateIndex(
                name: "IX_Visitors_Phone",
                table: "Visitors",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_CheckInAt",
                table: "Visits",
                column: "CheckInAt");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_CreatedByUserId",
                table: "Visits",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_Status",
                table: "Visits",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_VisitNumber",
                table: "Visits",
                column: "VisitNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Visits_VisitorId",
                table: "Visits",
                column: "VisitorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AspNetUsers_ArchivedById",
                table: "Orders",
                column: "ArchivedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AspNetUsers_ArchivedById",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "ArchivedOrders");

            migrationBuilder.DropTable(
                name: "DepartmentAccesses");

            migrationBuilder.DropTable(
                name: "OrderActivityLogs");

            migrationBuilder.DropTable(
                name: "UserExceptions");

            migrationBuilder.DropTable(
                name: "UserPermissions");

            migrationBuilder.DropTable(
                name: "VisitorDepartments");

            migrationBuilder.DropTable(
                name: "Visits");

            migrationBuilder.DropTable(
                name: "Visitors");

            migrationBuilder.DropIndex(
                name: "IX_Orders_ArchivedById",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ArchiveReason",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ArchivedById",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ExpirationDate",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "OrderHistories");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "OrderHistories",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Action",
                table: "OrderHistories",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldMaxLength: 100);
        }
    }
}
