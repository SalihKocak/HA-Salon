using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProgressExtraMeasurements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "HeightCm",
                table: "progress_entries",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "LeftArmCm",
                table: "progress_entries",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "RightArmCm",
                table: "progress_entries",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "ShoulderCm",
                table: "progress_entries",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HeightCm",
                table: "progress_entries");

            migrationBuilder.DropColumn(
                name: "LeftArmCm",
                table: "progress_entries");

            migrationBuilder.DropColumn(
                name: "RightArmCm",
                table: "progress_entries");

            migrationBuilder.DropColumn(
                name: "ShoulderCm",
                table: "progress_entries");
        }
    }
}
