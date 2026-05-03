using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMemberProfileActivePackageForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_member_profiles_ActivePackageId",
                table: "member_profiles",
                column: "ActivePackageId");

            migrationBuilder.AddForeignKey(
                name: "FK_member_profiles_membership_packages_ActivePackageId",
                table: "member_profiles",
                column: "ActivePackageId",
                principalTable: "membership_packages",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_member_profiles_membership_packages_ActivePackageId",
                table: "member_profiles");

            migrationBuilder.DropIndex(
                name: "IX_member_profiles_ActivePackageId",
                table: "member_profiles");
        }
    }
}
