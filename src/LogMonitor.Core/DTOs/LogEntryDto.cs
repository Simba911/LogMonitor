namespace LogMonitor.Core.DTOs;

// Log Agent-იდან მიღებული მონაცემი
public class CreateLogDto
{
    public required string SourceIp { get; set; }
    public string? SourceName { get; set; }
    public DateTime? Timestamp { get; set; }
    public required string Level { get; set; }
    public required string Category { get; set; }
    public required string Message { get; set; }
    public Dictionary<string, object>? RawData { get; set; }
    public string? UserAgent { get; set; }
    public string? Endpoint { get; set; }
    public int? StatusCode { get; set; }
}

// Dashboard-ისთვის გასაგზავნი
public class LogEntryResponseDto
{
    public Guid Id { get; set; }
    public string SourceIp { get; set; } = string.Empty;
    public string? SourceName { get; set; }
    public DateTime Timestamp { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Endpoint { get; set; }
    public int? StatusCode { get; set; }
    public bool HasAlert { get; set; }
}

public class AlertResponseDto
{
    public Guid Id { get; set; }
    public string AlertType { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string? SourceIp { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsResolved { get; set; }
    public DateTime DetectedAt { get; set; }
}

public class DashboardStatsDto
{
    public int TotalLogsToday { get; set; }
    public int ActiveAlerts { get; set; }
    public int CriticalAlerts { get; set; }
    public int UniqueSourcesCount { get; set; }
    public List<LogsByHourDto> LogsByHour { get; set; } = new();
    public List<AlertsBySeverityDto> AlertsBySeverity { get; set; } = new();
    public List<TopSourceDto> TopSources { get; set; } = new();
}

public class LogsByHourDto
{
    public string Hour { get; set; } = string.Empty;
    public int Count { get; set; }
    public int ErrorCount { get; set; }
}

public class AlertsBySeverityDto
{
    public string Severity { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class TopSourceDto
{
    public string SourceIp { get; set; } = string.Empty;
    public int RequestCount { get; set; }
    public int AlertCount { get; set; }
}
