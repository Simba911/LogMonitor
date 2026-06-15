using LogMonitor.Core.DTOs;

namespace LogMonitor.API.Services;

public interface IAlertService
{
    Task<List<AlertResponseDto>> GetAlertsAsync(bool? isResolved, string? severity);
    Task<bool> ResolveAlertAsync(Guid alertId);
}
