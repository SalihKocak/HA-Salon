using GymManagement.Application.Common;
using GymManagement.Application.DTOs.WhatsApp;
using GymManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymManagement.API.Controllers;

[ApiController]
[Route("api/whatsapp")]
[Authorize(Roles = "Admin")]
public class WhatsAppController : ControllerBase
{
    private readonly IWhatsAppService _whatsAppService;

    public WhatsAppController(IWhatsAppService whatsAppService)
    {
        _whatsAppService = whatsAppService;
    }

    [HttpGet("settings")]
    public async Task<ActionResult<ApiResponse<WhatsAppSettingsDto>>> GetSettings()
    {
        var settings = await _whatsAppService.GetSettingsAsync();
        if (settings == null)
            return NotFound(ApiResponse<WhatsAppSettingsDto>.Fail("WhatsApp settings not configured."));

        return Ok(ApiResponse<WhatsAppSettingsDto>.Ok(settings));
    }

    [HttpPut("settings")]
    public async Task<ActionResult<ApiResponse>> UpdateSettings([FromBody] UpdateWhatsAppSettingsRequest request)
    {
        await _whatsAppService.UpdateSettingsAsync(request);
        return Ok(ApiResponse.Ok("WhatsApp settings updated."));
    }

    [HttpGet("templates")]
    public async Task<ActionResult<ApiResponse<List<MessageTemplateDto>>>> GetTemplates()
    {
        var templates = await _whatsAppService.GetTemplatesAsync();
        return Ok(ApiResponse<List<MessageTemplateDto>>.Ok(templates));
    }

    [HttpPost("templates")]
    public async Task<ActionResult<ApiResponse<MessageTemplateDto>>> CreateTemplate([FromBody] CreateMessageTemplateRequest request)
    {
        var template = await _whatsAppService.CreateTemplateAsync(request);
        return Created($"/api/whatsapp/templates/{template.Id}", ApiResponse<MessageTemplateDto>.Ok(template));
    }

    [HttpPut("templates/{id}")]
    public async Task<ActionResult<ApiResponse<MessageTemplateDto>>> UpdateTemplate(string id, [FromBody] CreateMessageTemplateRequest request)
    {
        var template = await _whatsAppService.UpdateTemplateAsync(id, request);
        return Ok(ApiResponse<MessageTemplateDto>.Ok(template));
    }

    [HttpDelete("templates/{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteTemplate(string id)
    {
        await _whatsAppService.DeleteTemplateAsync(id);
        return Ok(ApiResponse.Ok("Template deleted."));
    }

    [HttpGet("logs")]
    public async Task<ActionResult<ApiResponse<List<MessageLogDto>>>> GetLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var logs = await _whatsAppService.GetLogsAsync(page, pageSize);
        return Ok(ApiResponse<List<MessageLogDto>>.Ok(logs));
    }

    [HttpPost("test-send")]
    public async Task<ActionResult<ApiResponse>> TestSend([FromBody] TestSendWhatsAppRequest request)
    {
        var sent = await _whatsAppService.SendTextMessageAsync(request.PhoneNumber, request.Message);
        if (!sent)
            return BadRequest(ApiResponse.Fail("Test WhatsApp message could not be sent. Check logs and Twilio config."));

        return Ok(ApiResponse.Ok("Test WhatsApp message sent."));
    }
}
