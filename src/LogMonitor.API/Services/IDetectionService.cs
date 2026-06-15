using LogMonitor.Core.Models;

namespace LogMonitor.API.Services;

public interface IDetectionService
{
    Task AnalyzeLogAsync(LogEntry log);
}
