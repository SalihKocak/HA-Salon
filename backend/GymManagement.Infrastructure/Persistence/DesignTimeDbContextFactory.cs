using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace GymManagement.Infrastructure.Persistence;

/// <summary>Allows <c>dotnet ef</c> migrations without starting the API.</summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(
                "Host=localhost;Port=5432;Database=gymmanagement;Username=gym;Password=gym_dev_password")
            .Options;

        return new AppDbContext(options);
    }
}
