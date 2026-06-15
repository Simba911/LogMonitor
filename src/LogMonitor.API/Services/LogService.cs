using LogMonitor.API.Data;
using LogMonitor.Core.DTOs;
using LogMonitor.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace LogMonitor.API.Services;

public class LogService : ILogService
{
    private readonly AppDbContext _db;
    private readonly IDetectionService _detection;
    private readonly ILogger<LogService> _logger;

    public LogService(AppDbContext db, IDetectionService detection, ILogger<LogService> logger)
    {
        _db = db;
        _detection = detection;
        _logger = logger;
    }

    public async Task<LogEntryResponseDto> CreateLogAsync(CreateLogDto dto)
    {
        var log = new LogEntry
        {
            SourceIp = dto.SourceIp,
            SourceName = dto.SourceName,
            Timestamp = dto.Timestamp ?? DateTime.UtcNow,
            Level = dto.Level.ToUpper(),
            Category = dto.Category.ToUpper(),
            Message = dto.Message,
            RawData = dto.RawData,
            UserAgent = dto.UserAgent,
            Endpoint = dto.Endpoint,
            StatusCode = dto.StatusCode
        };

        _db.Logs.Add(log);
        await _db.SaveChangesAsync();

        // Detection Engine-ის გამოძახება
        await _detection.AnalyzeLogAsync(log);

        _logger.LogInformation("Log created: {LogId} from {SourceIp}", log.Id, log.SourceIp);

        return MapToDto(log, false);
    }

    public async Task<List<LogEntryResponseDto>> GetLogsAsync(
        int page, int pageSize, string? level, string? sourceIp, DateTime? from, DateTime? to)
    {
        var query = _db.Logs.AsQueryable();

        if (!string.IsNullOrEmpty(level))
            query = query.Where(l => l.Level == level.ToUpper());

        if (!string.IsNullOrEmpty(sourceIp))
            query = query.Where(l => l.SourceIp == sourceIp);

        if (from.HasValue)
            query = query.Where(l => l.Timestamp >= from.Value);

        if (to.HasValue)
            query = query.Where(l => l.Timestamp <= to.Value);

        var alertLogIds = await _db.Alerts.Select(a => a.LogId).ToListAsync();

        var logs = await query
            .OrderByDescending(l => l.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return logs.Select(l => MapToDto(l, alertLogIds.Contains(l.Id))).ToList();
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var totalLogsToday = await _db.Logs
            .CountAsync(l => l.Timestamp >= today && l.Timestamp < tomorrow);

        var activeAlerts = await _db.Alerts.CountAsync(a => !a.IsResolved);
        var criticalAlerts = await _db.Alerts
            .CountAsync(a => !a.IsResolved && a.Severity == "CRITICAL");

        var uniqueSources = await _db.Logs
            .Where(l => l.Timestamp >= today)
            .Select(l => l.SourceIp)
            .Distinct()
            .CountAsync();

        var last24h = DateTime.UtcNow.AddHours(-24);
        var logsByHourRaw = await _db.Logs
            .Where(l => l.Timestamp >= last24h)
            .GroupBy(l => l.Timestamp.Hour)
            .Select(g => new
            {
                Hour = g.Key,
                Count = g.Count(),
                ErrorCount = g.Count(l => l.Level == "ERROR" || l.Level == "CRITICAL")
            })
            .ToListAsync();

        var logsByHour = logsByHourRaw
            .OrderBy(x => x.Hour)
            .Select(x => new LogsByHourDto
            {
                Hour = $"{x.Hour:D2}:00",
                Count = x.Count,
                ErrorCount = x.ErrorCount
            })
            .ToList();

        var alertsBySeverity = await _db.Alerts
            .Where(a => !a.IsResolved)
            .GroupBy(a => a.Severity)
            .Select(g => new AlertsBySeverityDto
            {
                Severity = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        var topSources = await _db.Logs
            .Where(l => l.Timestamp >= today)
            .GroupBy(l => l.SourceIp)
            .Select(g => new TopSourceDto
            {
                SourceIp = g.Key,
                RequestCount = g.Count()
            })
            .OrderByDescending(x => x.RequestCount)
            .Take(10)
            .ToListAsync();

        foreach (var source in topSources)
        {
            source.AlertCount = await _db.Alerts
                .CountAsync(a => a.SourceIp == source.SourceIp && !a.IsResolved);
        }

        return new DashboardStatsDto
        {
            TotalLogsToday = totalLogsToday,
            ActiveAlerts = activeAlerts,
            CriticalAlerts = criticalAlerts,
            UniqueSourcesCount = uniqueSources,
            LogsByHour = logsByHour,
            AlertsBySeverity = alertsBySeverity,
            TopSources = topSources
        };
    }

    private static LogEntryResponseDto MapToDto(LogEntry log, bool hasAlert) => new()
    {
        Id = log.Id,
        SourceIp = log.SourceIp,
        SourceName = log.SourceName,
        Timestamp = log.Timestamp,
        Level = log.Level,
        Category = log.Category,
        Message = log.Message,
        Endpoint = log.Endpoint,
        StatusCode = log.StatusCode,
        HasAlert = hasAlert
    };
}
