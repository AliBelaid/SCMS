using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDocumentManagementDomain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Subjects_DepartmentId_Code",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "IncomingPrefix",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "OutgoingPrefix",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DepartmentCode",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PermissionsCanDelete",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PermissionsCanEdit",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PermissionsCanView",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PermissionsExcludedUsers",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "SubjectCode",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "OrderAttachments");

            migrationBuilder.DropColumn(
                name: "FileUrl",
                table: "OrderAttachments");

            migrationBuilder.DropColumn(
                name: "UploadedBy",
                table: "OrderAttachments");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Departments");

            migrationBuilder.RenameColumn(
                name: "LastModified",
                table: "Subjects",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "PermissionsIsPublic",
                table: "Orders",
                newName: "IsPublic");

            migrationBuilder.RenameColumn(
                name: "LastModified",
                table: "Orders",
                newName: "CompletedAt");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Orders",
                newName: "IsArchived");

            migrationBuilder.RenameColumn(
                name: "LastModified",
                table: "OrderAttachments",
                newName: "DeletedAt");

            migrationBuilder.RenameColumn(
                name: "LastModified",
                table: "Departments",
                newName: "UpdatedAt");

            migrationBuilder.AlterColumn<string>(
                name: "NameEn",
                table: "Subjects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "NameAr",
                table: "Subjects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Subjects",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Subjects",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                table: "Orders",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Orders",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Orders",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceNumber",
                table: "Orders",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<int>(
                name: "Priority",
                table: "Orders",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Orders",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsPublic",
                table: "Orders",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AssignedToId",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Orders",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FileType",
                table: "OrderAttachments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "OrderAttachments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FilePath",
                table: "OrderAttachments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "UploadedById",
                table: "OrderAttachments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "NameEn",
                table: "Departments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "NameAr",
                table: "Departments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Departments",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Departments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Departments",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<int>(
                name: "ManagerId",
                table: "Departments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParentDepartmentId",
                table: "Departments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DepartmentUsers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Position = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsHead = table.Column<bool>(type: "bit", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LeftAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DepartmentUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DepartmentUsers_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DepartmentUsers_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OldValue = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    NewValue = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PerformedById = table.Column<int>(type: "int", nullable: false),
                    PerformedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderHistories_AspNetUsers_PerformedById",
                        column: x => x.PerformedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderHistories_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderPermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    PermissionType = table.Column<int>(type: "int", nullable: false),
                    GrantedById = table.Column<int>(type: "int", nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderPermissions_AspNetUsers_GrantedById",
                        column: x => x.GrantedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderPermissions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderPermissions_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "Code", "CreatedAt", "Description", "IsActive", "ManagerId", "NameAr", "NameEn", "ParentDepartmentId", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "HR", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Human Resources Department", true, null, "الموارد البشرية", "Human Resources", null, null },
                    { 2, "FIN", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Finance Department", true, null, "المالية", "Finance", null, null },
                    { 3, "OPS", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Operations Department", true, null, "العمليات", "Operations", null, null }
                });

            migrationBuilder.InsertData(
                table: "Subjects",
                columns: new[] { "Id", "Code", "CreatedAt", "DepartmentId", "Description", "IsActive", "NameAr", "NameEn", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "REC", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, true, "التوظيف", "Recruitment", null },
                    { 2, "TRN", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, true, "التدريب", "Training", null },
                    { 3, "LEV", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, true, "الإجازات", "Leave", null },
                    { 4, "SAL", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, null, true, "الرواتب", "Salaries", null },
                    { 5, "BDG", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, null, true, "الميزانية", "Budget", null },
                    { 6, "EXP", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, null, true, "المصروفات", "Expenses", null },
                    { 7, "INV", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, null, true, "الفواتير", "Invoices", null },
                    { 8, "AUD", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, null, true, "التدقيق", "Audit", null },
                    { 9, "PRJ", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, null, true, "المشاريع", "Projects", null },
                    { 10, "QUA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, null, true, "الجودة", "Quality", null },
                    { 11, "LOG", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, null, true, "اللوجستيات", "Logistics", null },
                    { 12, "MTN", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, null, true, "الصيانة", "Maintenance", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_Code_DepartmentId",
                table: "Subjects",
                columns: new[] { "Code", "DepartmentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_DepartmentId",
                table: "Subjects",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_AssignedToId",
                table: "Orders",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_CreatedAt",
                table: "Orders",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_CreatedById",
                table: "Orders",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Status",
                table: "Orders",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Type",
                table: "Orders",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UpdatedById",
                table: "Orders",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_OrderAttachments_UploadedById",
                table: "OrderAttachments",
                column: "UploadedById");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_ManagerId",
                table: "Departments",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_ParentDepartmentId",
                table: "Departments",
                column: "ParentDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_DepartmentUsers_DepartmentId_UserId",
                table: "DepartmentUsers",
                columns: new[] { "DepartmentId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DepartmentUsers_IsActive",
                table: "DepartmentUsers",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_DepartmentUsers_UserId",
                table: "DepartmentUsers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderHistories_OrderId_PerformedAt",
                table: "OrderHistories",
                columns: new[] { "OrderId", "PerformedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_OrderHistories_PerformedById",
                table: "OrderHistories",
                column: "PerformedById");

            migrationBuilder.CreateIndex(
                name: "IX_OrderPermissions_GrantedById",
                table: "OrderPermissions",
                column: "GrantedById");

            migrationBuilder.CreateIndex(
                name: "IX_OrderPermissions_OrderId_UserId_PermissionType",
                table: "OrderPermissions",
                columns: new[] { "OrderId", "UserId", "PermissionType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderPermissions_UserId",
                table: "OrderPermissions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_AspNetUsers_ManagerId",
                table: "Departments",
                column: "ManagerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_Departments_ParentDepartmentId",
                table: "Departments",
                column: "ParentDepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderAttachments_AspNetUsers_UploadedById",
                table: "OrderAttachments",
                column: "UploadedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AspNetUsers_AssignedToId",
                table: "Orders",
                column: "AssignedToId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AspNetUsers_CreatedById",
                table: "Orders",
                column: "CreatedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AspNetUsers_UpdatedById",
                table: "Orders",
                column: "UpdatedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Departments_AspNetUsers_ManagerId",
                table: "Departments");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Departments_ParentDepartmentId",
                table: "Departments");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderAttachments_AspNetUsers_UploadedById",
                table: "OrderAttachments");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AspNetUsers_AssignedToId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AspNetUsers_CreatedById",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AspNetUsers_UpdatedById",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "DepartmentUsers");

            migrationBuilder.DropTable(
                name: "OrderHistories");

            migrationBuilder.DropTable(
                name: "OrderPermissions");

            migrationBuilder.DropIndex(
                name: "IX_Subjects_Code_DepartmentId",
                table: "Subjects");

            migrationBuilder.DropIndex(
                name: "IX_Subjects_DepartmentId",
                table: "Subjects");

            migrationBuilder.DropIndex(
                name: "IX_Orders_AssignedToId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_CreatedAt",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_CreatedById",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Status",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Type",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_UpdatedById",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_OrderAttachments_UploadedById",
                table: "OrderAttachments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_ManagerId",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_ParentDepartmentId",
                table: "Departments");

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "AssignedToId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "OrderAttachments");

            migrationBuilder.DropColumn(
                name: "FilePath",
                table: "OrderAttachments");

            migrationBuilder.DropColumn(
                name: "UploadedById",
                table: "OrderAttachments");

            migrationBuilder.DropColumn(
                name: "ManagerId",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "ParentDepartmentId",
                table: "Departments");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Subjects",
                newName: "LastModified");

            migrationBuilder.RenameColumn(
                name: "IsPublic",
                table: "Orders",
                newName: "PermissionsIsPublic");

            migrationBuilder.RenameColumn(
                name: "IsArchived",
                table: "Orders",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CompletedAt",
                table: "Orders",
                newName: "LastModified");

            migrationBuilder.RenameColumn(
                name: "DeletedAt",
                table: "OrderAttachments",
                newName: "LastModified");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Departments",
                newName: "LastModified");

            migrationBuilder.AlterColumn<string>(
                name: "NameEn",
                table: "Subjects",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "NameAr",
                table: "Subjects",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Subjects",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Subjects",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IncomingPrefix",
                table: "Subjects",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Subjects",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "OutgoingPrefix",
                table: "Subjects",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Orders",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceNumber",
                table: "Orders",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Priority",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Orders",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "PermissionsIsPublic",
                table: "Orders",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Orders",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DepartmentCode",
                table: "Orders",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PermissionsCanDelete",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PermissionsCanEdit",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PermissionsCanView",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PermissionsExcludedUsers",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubjectCode",
                table: "Orders",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Orders",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FileType",
                table: "OrderAttachments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "OrderAttachments",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "FileUrl",
                table: "OrderAttachments",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UploadedBy",
                table: "OrderAttachments",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "NameEn",
                table: "Departments",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "NameAr",
                table: "Departments",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Departments",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Departments",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Departments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Departments",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Departments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_DepartmentId_Code",
                table: "Subjects",
                columns: new[] { "DepartmentId", "Code" },
                unique: true);
        }
    }
}
