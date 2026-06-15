using LogMonitor.API.Services;
using LogMonitor.Core.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace LogMonitor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertsController : ControllerBase
{
    private readonly IAlertService _alertService;

    public AlertsController(IAlertService alertService)
    {
        _alertService = alertService;
    }

    /// <summary>
    /// ალერტების სია
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<AlertResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAlerts(
        [FromQuery] bool? isResolved = null,
        [FromQuery] string? severity = null)
    {
        var alerts = await _alertService.GetAlertsAsync(isResolved, severity);
        return Ok(alerts);
    }

    /// <summary>
    /// ალერტის დახურვა (Resolve)
    /// </summary>
    [HttpPatch("{id}/resolve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResolveAlert(Guid id)
    {
        var result = await _alertService.ResolveAlertAsync(id);
        if (!result) return NotFound();
        return Ok(new { message = "Alert resolved successfully" });
    }
}
