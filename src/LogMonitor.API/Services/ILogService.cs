using LogMonitor.Core.DTOs;

namespace LogMonitor.API.Services;

public interface ILogService
{
    Task<LogEntryResponseDto> CreateLogAsync(CreateLogDto dto);
    Task<List<LogEntryResponseDto>> GetLogsAsync(int page, int pageSize, string? level, string? sourceIp, DateTime? from, DateTime? to);
    Task<DashboardStatsDto> GetStatsAsync();
}
