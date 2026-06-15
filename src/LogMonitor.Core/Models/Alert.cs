namespace LogMonitor.Core.Models;

public class Alert
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? LogId { get; set; }
    public string AlertType { get; set; } = string.Empty;  // BRUTE_FORCE, DDOS, OFF_HOURS, PORT_SCAN, ERROR_SPIKE
    public string Severity { get; set; } = "LOW";          // LOW, MEDIUM, HIGH, CRITICAL
    public string? SourceIp { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsResolved { get; set; } = false;
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}
