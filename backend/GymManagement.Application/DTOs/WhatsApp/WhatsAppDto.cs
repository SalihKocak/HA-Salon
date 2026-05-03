using System.ComponentModel.DataAnnotations;

namespace GymManagement.Application.DTOs.WhatsApp;

public class WhatsAppSettingsDto
{
    public string? PhoneNumber { get; set; }
    public string? ApiBaseUrl { get; set; }
    public bool IsEnabled { get; set; }
    public DateTime LastUpdatedAt { get; set; }
}

public class UpdateWhatsAppSettingsRequest
{
    [Phone]
    [MaxLength(40)]
    public string? PhoneNumber { get; set; }

    [Url]
    [MaxLength(300)]
    public string? ApiBaseUrl { get; set; }

    [MaxLength(1000)]
    public string? AccessToken { get; set; }
    public bool? IsEnabled { get; set; }
}

public class MessageTemplateDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateMessageTemplateRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = null!;

    [Required]
    [MaxLength(64)]
    public string Type { get; set; } = null!;

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}

public class MessageLogDto
{
    public string Id { get; set; } = null!;
    public string? MemberId { get; set; }
    public string PhoneNumber { get; set; } = null!;
    public string Channel { get; set; } = null!;
    public string? TemplateName { get; set; }
    public string Content { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime? SentAt { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TestSendWhatsAppRequest
{
    [Required]
    [Phone]
    [MaxLength(40)]
    public string PhoneNumber { get; set; } = null!;

    [Required]
    [MaxLength(2000)]
    public string Message { get; set; } = null!;
}
