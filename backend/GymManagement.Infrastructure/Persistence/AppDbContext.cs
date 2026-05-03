using GymManagement.Domain.Entities;
using GymManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GymManagement.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<MemberProfile> MemberProfiles => Set<MemberProfile>();
    public DbSet<RefreshTokenSession> RefreshTokenSessions => Set<RefreshTokenSession>();
    public DbSet<MembershipPackage> MembershipPackages => Set<MembershipPackage>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductSale> ProductSales => Set<ProductSale>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<ProgressEntry> ProgressEntries => Set<ProgressEntry>();
    public DbSet<SessionSchedule> SessionSchedules => Set<SessionSchedule>();
    public DbSet<WhatsAppSettings> WhatsAppSettings => Set<WhatsAppSettings>();
    public DbSet<MessageTemplate> MessageTemplates => Set<MessageTemplate>();
    public DbSet<MessageLog> MessageLogs => Set<MessageLog>();
    public DbSet<GymSettings> GymSettings => Set<GymSettings>();
    public DbSet<AttendanceSlotSettings> AttendanceSlotSettings => Set<AttendanceSlotSettings>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<ErrorLog> ErrorLogs => Set<ErrorLog>();
    public DbSet<SmsLog> SmsLogs => Set<SmsLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.FirstName).HasMaxLength(200);
            e.Property(x => x.LastName).HasMaxLength(200);
            e.Property(x => x.Email).HasMaxLength(320);
            e.Property(x => x.PhoneNumber).HasMaxLength(50);
            e.Property(x => x.PasswordHash).HasMaxLength(500);
            e.Property(x => x.Role).HasConversion<string>().HasMaxLength(32);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(32);
            e.HasIndex(x => x.Email).IsUnique();
            e.HasIndex(x => x.PhoneNumber);
            e.HasIndex(x => x.Role);
            e.HasIndex(x => x.Status);
        });

        modelBuilder.Entity<MemberProfile>(e =>
        {
            e.ToTable("member_profiles");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.UserId).HasMaxLength(64);
            e.Property(x => x.ActivePackageId).HasMaxLength(64);
            e.HasIndex(x => x.UserId).IsUnique();
            e.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne<MembershipPackage>()
                .WithMany()
                .HasForeignKey(x => x.ActivePackageId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<RefreshTokenSession>(e =>
        {
            e.ToTable("refresh_token_sessions");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.UserId).HasMaxLength(64);
            e.Property(x => x.RefreshToken).HasMaxLength(500);
            e.HasIndex(x => x.RefreshToken).IsUnique();
            e.HasIndex(x => x.UserId);
            e.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MembershipPackage>(e =>
        {
            e.ToTable("membership_packages");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.Price).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Payment>(e =>
        {
            e.ToTable("payments");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.MemberId).HasMaxLength(64).IsRequired(false);
            e.Property(x => x.PackageId).HasMaxLength(64);
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.PaymentMethod).HasMaxLength(64);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(32);
            e.Property(x => x.IsDailyPass).HasDefaultValue(false);
            e.Property(x => x.DailyVisitorFirstName).HasMaxLength(200);
            e.Property(x => x.DailyVisitorLastName).HasMaxLength(200);
            e.HasIndex(x => x.DueDate);
            e.HasIndex(x => x.Status);
            e.HasIndex(x => x.IsDailyPass);
            e.HasOne<User>().WithMany().HasForeignKey(x => x.MemberId).IsRequired(false).OnDelete(DeleteBehavior.SetNull);
            e.HasOne<MembershipPackage>()
                .WithMany()
                .HasForeignKey(x => x.PackageId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("products");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.Category).HasMaxLength(120);
            e.Property(x => x.Price).HasPrecision(18, 2);
        });

        modelBuilder.Entity<ProductSale>(e =>
        {
            e.ToTable("product_sales");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.ProductId).HasMaxLength(64);
            e.Property(x => x.MemberId).HasMaxLength(64);
            e.Property(x => x.UnitPrice).HasPrecision(18, 2);
            e.Property(x => x.PaidAmount).HasPrecision(18, 2);
            e.Property(x => x.PaymentMethod).HasMaxLength(64);
            e.Property(x => x.Note).HasMaxLength(500);
            e.HasIndex(x => x.CreatedAt);
            e.HasIndex(x => x.MemberId);
            e.HasIndex(x => x.ProductId);
            e.HasOne<Product>().WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne<User>().WithMany().HasForeignKey(x => x.MemberId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Expense>(e =>
        {
            e.ToTable("expenses");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.Title).HasMaxLength(200);
            e.Property(x => x.Category).HasMaxLength(120);
            e.Property(x => x.Amount).HasPrecision(18, 2);
        });

        modelBuilder.Entity<ProgressEntry>(e =>
        {
            e.ToTable("progress_entries");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.MemberId).HasMaxLength(64);
            e.Property(x => x.RecordedByUserId).HasMaxLength(64);
            e.HasIndex(x => x.MemberId);
            e.HasOne<User>().WithMany().HasForeignKey(x => x.MemberId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SessionSchedule>(e =>
        {
            e.ToTable("session_schedules");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.MemberId).HasMaxLength(64);
            e.Property(x => x.SessionTime).HasMaxLength(32);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(32);
            e.HasIndex(x => x.MemberId);
            e.HasIndex(x => new { x.SessionDate, x.IsAttendanceCheckIn });
            e.HasOne<User>().WithMany().HasForeignKey(x => x.MemberId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WhatsAppSettings>(e =>
        {
            e.ToTable("whatsapp_settings");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
        });

        modelBuilder.Entity<MessageTemplate>(e =>
        {
            e.ToTable("message_templates");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.Type).HasMaxLength(64);
        });

        modelBuilder.Entity<MessageLog>(e =>
        {
            e.ToTable("message_logs");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.MemberId).HasMaxLength(64);
            e.Property(x => x.PhoneNumber).HasMaxLength(40);
            e.Property(x => x.Channel).HasMaxLength(32);
            e.Property(x => x.Status).HasMaxLength(32);
        });

        modelBuilder.Entity<GymSettings>(e =>
        {
            e.ToTable("gym_settings");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.GymName).HasMaxLength(200);
        });

        modelBuilder.Entity<AttendanceSlotSettings>(e =>
        {
            e.ToTable("attendance_slot_settings");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
        });

        modelBuilder.Entity<ActivityLog>(e =>
        {
            e.ToTable("activity_logs");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.ActorUserId).HasMaxLength(64);
            e.Property(x => x.ActorRole).HasMaxLength(32);
            e.Property(x => x.ActionType).HasMaxLength(120);
            e.Property(x => x.TargetType).HasMaxLength(64);
            e.Property(x => x.TargetId).HasMaxLength(64);
            e.Property(x => x.RequestPath).HasMaxLength(300);
            e.Property(x => x.HttpMethod).HasMaxLength(12);
            e.HasIndex(x => x.CreatedAt);
            e.HasIndex(x => x.ActorUserId);
            e.HasIndex(x => x.ActionType);
        });

        modelBuilder.Entity<ErrorLog>(e =>
        {
            e.ToTable("error_logs");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.UserId).HasMaxLength(64);
            e.Property(x => x.UserRole).HasMaxLength(32);
            e.Property(x => x.Message).HasMaxLength(1000);
            e.Property(x => x.ExceptionType).HasMaxLength(200);
            e.Property(x => x.RequestPath).HasMaxLength(300);
            e.Property(x => x.HttpMethod).HasMaxLength(12);
            e.HasIndex(x => x.CreatedAt);
            e.HasIndex(x => x.UserId);
        });

        modelBuilder.Entity<SmsLog>(e =>
        {
            e.ToTable("sms_logs");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.PhoneNumber).HasMaxLength(40);
            e.Property(x => x.Status).HasMaxLength(32);
            e.Property(x => x.Message).HasMaxLength(1000);
            e.Property(x => x.ErrorMessage).HasMaxLength(1000);
            e.HasIndex(x => x.CreatedAt);
            e.HasIndex(x => x.PhoneNumber);
        });
    }
}
