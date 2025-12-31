using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVisitorIsBlocked : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsBlocked",
                table: "Visitors",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Visitors",
                keyColumn: "Id",
                keyValue: 1,
                column: "IsBlocked",
                value: false);

            migrationBuilder.UpdateData(
                table: "Visitors",
                keyColumn: "Id",
                keyValue: 2,
                column: "IsBlocked",
                value: false);

            migrationBuilder.UpdateData(
                table: "Visitors",
                keyColumn: "Id",
                keyValue: 3,
                column: "IsBlocked",
                value: false);

            migrationBuilder.UpdateData(
                table: "Visitors",
                keyColumn: "Id",
                keyValue: 4,
                column: "IsBlocked",
                value: false);

            migrationBuilder.UpdateData(
                table: "Visitors",
                keyColumn: "Id",
                keyValue: 5,
                column: "IsBlocked",
                value: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsBlocked",
                table: "Visitors");
        }
    }
}
