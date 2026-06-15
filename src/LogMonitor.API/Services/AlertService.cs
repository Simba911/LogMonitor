using LogMonitor.API.Data;
using LogMonitor.Core.DTOs;
using Microsoft.EntityFrameworkCore;

namespace LogMonitor.API.Services;

public class AlertService : IAlertService
{
    private readonly AppDbContext _db;

    public AlertService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<AlertResponseDto>> GetAlertsAsync(bool? isResolved, string? severity)
    {
        var query = _db.Alerts.AsQueryable();

        if (isResolved.HasValue)
            query = query.Where(a => a.IsResolved == isResolved.Value);

        if (!string.IsNullOrEmpty(severity))
            query = query.Where(a => a.Severity == severity.ToUpper());

        return await query
            .OrderByDescending(a => a.DetectedAt)
            .Select(a => new AlertResponseDto
            {
                Id = a.Id,
                AlertType = a.AlertType,
                Severity = a.Severity,
                SourceIp = a.SourceIp,
                Description = a.Description,
                IsResolved = a.IsResolved,
                DetectedAt = a.DetectedAt
            })
            .ToListAsync();
    }

    public async Task<bool> ResolveAlertAsync(Guid alertId)
    {
        var alert = await _db.Alerts.FindAsync(alertId);
        if (alert == null) return false;

        alert.IsResolved = true;
        alert.ResolvedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }
}
