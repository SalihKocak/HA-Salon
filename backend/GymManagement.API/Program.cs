using System.Text;
using GymManagement.API.Middleware;
using GymManagement.Application.Common;
using GymManagement.Application.Interfaces;
using GymManagement.Infrastructure.Persistence;
using GymManagement.Infrastructure.Services;
using GymManagement.Infrastructure.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.HttpOverrides;
using System.Threading.RateLimiting;
using System.Net;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

if (connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
    connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':', 2);
    if (userInfo.Length != 2)
        throw new InvalidOperationException("Database URL user info is invalid. Expected username:password.");

    var username = WebUtility.UrlDecode(userInfo[0]);
    var password = WebUtility.UrlDecode(userInfo[1]);
    var database = uri.AbsolutePath.Trim('/');
    if (string.IsNullOrWhiteSpace(database))
        throw new InvalidOperationException("Database URL must include a database name in the path.");

    // postgresql://host/db without :5432 yields Uri.Port == -1; Npgsql rejects that.
    var port = uri.Port > 0 ? uri.Port : 5432;
    connectionString =
        $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IMemberService, MemberService>();
builder.Services.AddScoped<IPackageService, PackageService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IProgressService, ProgressService>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<IWhatsAppService, WhatsAppService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IDeveloperPortalService, DeveloperPortalService>();
builder.Services.AddHttpClient<ISmsService, SmsService>();

// Database seeders (admin + optional demo members)
builder.Services.AddHostedService<AdminSeeder>();
builder.Services.AddHostedService<MemberDemoSeeder>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()!;
if (builder.Environment.IsProduction() &&
    (string.IsNullOrWhiteSpace(jwtSettings.SecretKey) || jwtSettings.SecretKey.StartsWith("dev_only_", StringComparison.OrdinalIgnoreCase)))
{
    throw new InvalidOperationException("Production requires a secure Jwt:SecretKey from environment configuration.");
}

var key = Encoding.UTF8.GetBytes(jwtSettings.SecretKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ApprovedMember", policy =>
        policy.RequireRole("Member")
            .RequireClaim("status", "Approved"));
});
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        var key = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: $"global:{key}",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 120,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            });
    });

    options.AddPolicy("AuthPolicy", context =>
    {
        var key = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: key,
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            });
    });
});
builder.Services.AddControllers();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(kvp => kvp.Value?.Errors.Count > 0)
            .SelectMany(kvp => kvp.Value!.Errors
                .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? "Invalid request." : e.ErrorMessage))
            .Distinct()
            .ToList();

        var response = ApiResponse.Fail("Validation failed.", errors);
        return new BadRequestObjectResult(response);
    };
});
builder.Services.AddSwaggerGen();

// CORS — Render demo: RenderDemo__RelaxCors=true allows any https://*.onrender.com (no manual AllowedOrigins sync).
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var relaxDemo = builder.Configuration.GetValue<bool>("RenderDemo:RelaxCors");
        if (relaxDemo)
        {
            policy.SetIsOriginAllowed(static origin =>
            {
                if (string.IsNullOrWhiteSpace(origin))
                    return false;
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                    return false;
                if (string.Equals(uri.Scheme, "https", StringComparison.OrdinalIgnoreCase) &&
                    uri.Host.EndsWith(".onrender.com", StringComparison.OrdinalIgnoreCase))
                    return true;
                if (string.Equals(uri.Scheme, "http", StringComparison.OrdinalIgnoreCase) &&
                    (uri.Host == "localhost" || uri.Host == "127.0.0.1"))
                    return true;
                return false;
            });
        }
        else
        {
            var raw = builder.Configuration["AllowedOrigins"] ?? string.Empty;
            var origins = raw
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(origin => origin.Trim().TrimEnd('/'))
                .Where(origin => !string.IsNullOrWhiteSpace(origin))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            if (origins.Length == 0)
            {
                origins =
                [
                    "http://localhost:5173",
                    "http://localhost:5174"
                ];
            }

            policy.WithOrigins(origins);
        }

        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseForwardedHeaders();

var renderPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(renderPort))
{
    app.Urls.Clear();
    app.Urls.Add($"http://0.0.0.0:{renderPort}");
}

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.UseMiddleware<ExceptionMiddleware>();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.UseMiddleware<ActivityLogMiddleware>();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapControllers();

app.Run();
