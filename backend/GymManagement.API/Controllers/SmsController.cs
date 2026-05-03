using GymManagement.Application.Common;
using GymManagement.Application.DTOs.Sms;
using GymManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymManagement.API.Controllers;

[ApiController]
[Route("api/sms")]
[Authorize(Roles = "Admin")]
public class SmsController : ControllerBase
{
    private readonly ISmsService _smsService;

    public SmsController(ISmsService smsService)
    {
        _smsService = smsService;
    }

    [HttpPost("test-send")]
    public async Task<ActionResult<ApiResponse>> TestSend([FromBody] TestSendSmsRequest request)
    {
        var sent = await _smsService.SendSmsAsync(request.PhoneNumber, request.Message);
        if (!sent)
            return BadRequest(ApiResponse.Fail("SMS could not be sent. Check configuration and logs."));

        return Ok(ApiResponse.Ok("SMS sent successfully."));
    }
}
