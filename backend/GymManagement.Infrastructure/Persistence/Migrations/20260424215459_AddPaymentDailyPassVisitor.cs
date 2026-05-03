using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentDailyPassVisitor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_payments_users_MemberId",
                table: "payments");

            migrationBuilder.AlterColumn<string>(
                name: "MemberId",
                table: "payments",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(64)",
                oldMaxLength: 64);

            migrationBuilder.AddColumn<string>(
                name: "DailyVisitorFirstName",
                table: "payments",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DailyVisitorLastName",
                table: "payments",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDailyPass",
                table: "payments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_payments_IsDailyPass",
                table: "payments",
                column: "IsDailyPass");

            migrationBuilder.AddForeignKey(
                name: "FK_payments_users_MemberId",
                table: "payments",
                column: "MemberId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_payments_users_MemberId",
                table: "payments");

            migrationBuilder.DropIndex(
                name: "IX_payments_IsDailyPass",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "DailyVisitorFirstName",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "DailyVisitorLastName",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "IsDailyPass",
                table: "payments");

            migrationBuilder.AlterColumn<string>(
                name: "MemberId",
                table: "payments",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(64)",
                oldMaxLength: 64,
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_payments_users_MemberId",
                table: "payments",
                column: "MemberId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
