namespace LogMonitor.Core.Models;

public class LogEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string SourceIp { get; set; } = string.Empty;
    public string? SourceName { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Level { get; set; } = "INFO";       // INFO, WARNING, ERROR, CRITICAL
    public string Category { get; set; } = "SYSTEM";  // AUTH, NETWORK, SYSTEM, HTTP
    public string Message { get; set; } = string.Empty;
    public Dictionary<string, object>? RawData { get; set; }
    public string? UserAgent { get; set; }
    public string? Endpoint { get; set; }
    public int? StatusCode { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
