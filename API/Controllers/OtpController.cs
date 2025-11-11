using System;
using System.Threading.Tasks;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Mvc;
using API.Dtos; // Assuming MedicineDetails DTO is correctly set up in this namespace
using Infrastructure.Identity;
using Newtonsoft.Json.Linq; // Assuming this contains AppIdentityDbContext

namespace API.Controllers
{
    
  
   [ApiController]
[Route("api/[controller]")]
public class OtpController : ControllerBase
{
    private readonly IOtpService _otpService;
    private readonly ILogger<OtpController> _logger;

    public OtpController(
        IOtpService otpService,
        ILogger<OtpController> logger)
    {
        _otpService = otpService;
        _logger = logger;
    }

    [HttpGet("{identifier}")]
    public async Task<IActionResult> SendOtp(string identifier)
    {
        try
        {
            await _otpService.GenerateOtpAsync(identifier);
            return Ok(new { Message = "OTP sent successfully" });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex.Message);
            return BadRequest(new { Error = "Invalid email address" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OTP send failed");
            return StatusCode(500, new { Error = "Failed to send OTP" });
        }
    }

    [HttpPost]
    public IActionResult VerifyOtp([FromBody] VerifyOTPModel request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var isValid = _otpService.ValidateOtp(request.Identifier, request.OTP);
        return Ok(new { Valid = isValid });
    }
}
}