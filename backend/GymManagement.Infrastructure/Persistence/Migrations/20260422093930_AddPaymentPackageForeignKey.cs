using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentPackageForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_payments_PackageId",
                table: "payments",
                column: "PackageId");

            migrationBuilder.AddForeignKey(
                name: "FK_payments_membership_packages_PackageId",
                table: "payments",
                column: "PackageId",
                principalTable: "membership_packages",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_payments_membership_packages_PackageId",
                table: "payments");

            migrationBuilder.DropIndex(
                name: "IX_payments_PackageId",
                table: "payments");
        }
    }
}
