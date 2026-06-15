using LogMonitor.API.Services;
using LogMonitor.Core.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace LogMonitor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LogsController : ControllerBase
{
    private readonly ILogService _logService;
    private readonly ILogger<LogsController> _logger;

    public LogsController(ILogService logService, ILogger<LogsController> logger)
    {
        _logService = logService;
        _logger = logger;
    }

    /// <summary>
    /// ლოგის მიღება Log Agent-იდან
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(LogEntryResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateLog([FromBody] CreateLogDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _logService.CreateLogAsync(dto);
        return CreatedAtAction(nameof(GetLogs), new { id = result.Id }, result);
    }

    /// <summary>
    /// ლოგების სია — ფილტრებით
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<LogEntryResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? level = null,
        [FromQuery] string? sourceIp = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var logs = await _logService.GetLogsAsync(page, pageSize, level, sourceIp, from, to);
        return Ok(logs);
    }

    /// <summary>
    /// Dashboard-ის სტატისტიკა
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _logService.GetStatsAsync();
        return Ok(stats);
    }
}
