using LogMonitor.API.Data;
using LogMonitor.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace LogMonitor.API.Services;

public class DetectionService : IDetectionService
{
    private readonly AppDbContext _db;
    private readonly ILogger<DetectionService> _logger;

    // Rule-based ბარიერები
    private const int BruteForceThreshold = 3;      // 3 failed login 5 წუთში
    private const int DDoSRequestThreshold = 100;    // 100 req/წუთი ერთი IP-დან
    private const int OffHoursStart = 22;            // 22:00-დან
    private const int OffHoursEnd = 6;               // 06:00-მდე
    private const int PortScanThreshold = 5;         // 5 სხვადასხვა endpoint 1 წუთში
    private const int ErrorSpikeThreshold = 10;      // 10 error 5 წუთში

    public DetectionService(AppDbContext db, ILogger<DetectionService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task AnalyzeLogAsync(LogEntry log)
    {
        await Task.WhenAll(
            CheckBruteForceAsync(log),
            CheckDDoSAsync(log),
            CheckOffHoursAsync(log),
            CheckErrorSpikeAsync(log),
            CheckPortScanAsync(log)
        );
    }

    // წესი 1: Brute Force — 3+ failed login 5 წუთში
    private async Task CheckBruteForceAsync(LogEntry log)
    {
        if (log.Category != "AUTH") return;
        if (!log.Message.Contains("failed", StringComparison.OrdinalIgnoreCase) &&
            !log.Message.Contains("invalid", StringComparison.OrdinalIgnoreCase)) return;

        var fiveMinutesAgo = log.Timestamp.AddMinutes(-5);

        var failedCount = await _db.Logs
            .CountAsync(l =>
                l.SourceIp == log.SourceIp &&
                l.Category == "AUTH" &&
                l.Timestamp >= fiveMinutesAgo &&
                l.Timestamp <= log.Timestamp &&
                (l.Message.ToLower().Contains("failed") || l.Message.ToLower().Contains("invalid")));

        if (failedCount >= BruteForceThreshold)
        {
            var recentAlert = await _db.Alerts
                .AnyAsync(a =>
                    a.SourceIp == log.SourceIp &&
                    a.AlertType == "BRUTE_FORCE" &&
                    a.DetectedAt >= log.Timestamp.AddMinutes(-10));

            if (!recentAlert)
            {
                await CreateAlertAsync(new Alert
                {
                    LogId = log.Id,
                    AlertType = "BRUTE_FORCE",
                    Severity = failedCount >= 10 ? "CRITICAL" : "HIGH",
                    SourceIp = log.SourceIp,
                    Description = $"Brute force შეტევა: {failedCount} წარუმატებელი შესვლის მცდელობა " +
                                  $"IP {log.SourceIp}-დან ბოლო 5 წუთში."
                });
            }
        }
    }

    // წესი 2: DDoS — 100+ request/წუთი ერთი IP-დან
    private async Task CheckDDoSAsync(LogEntry log)
    {
        if (log.Category != "HTTP" && log.Category != "NETWORK") return;

        var oneMinuteAgo = log.Timestamp.AddMinutes(-1);

        var requestCount = await _db.Logs
            .CountAsync(l =>
                l.SourceIp == log.SourceIp &&
                l.Timestamp >= oneMinuteAgo &&
                l.Timestamp <= log.Timestamp);

        if (requestCount >= DDoSRequestThreshold)
        {
            var recentAlert = await _db.Alerts
                .AnyAsync(a =>
                    a.SourceIp == log.SourceIp &&
                    a.AlertType == "DDOS" &&
                    a.DetectedAt >= log.Timestamp.AddMinutes(-5));

            if (!recentAlert)
            {
                var severity = requestCount >= 500 ? "CRITICAL" :
                               requestCount >= 200 ? "HIGH" : "MEDIUM";

                await CreateAlertAsync(new Alert
                {
                    LogId = log.Id,
                    AlertType = "DDOS",
                    Severity = severity,
                    SourceIp = log.SourceIp,
                    Description = $"სავარაუდო DDoS შეტევა: {requestCount} რექვესტი " +
                                  $"IP {log.SourceIp}-დან ბოლო 1 წუთში."
                });
            }
        }
    }

    // წესი 3: Off-Hours Activity — 22:00-06:00
    private async Task CheckOffHoursAsync(LogEntry log)
    {
        var hour = log.Timestamp.Hour;
        bool isOffHours = hour >= OffHoursStart || hour < OffHoursEnd;
        if (!isOffHours) return;

        bool isSuspicious = log.Category == "AUTH" ||
                            log.Level == "ERROR" ||
                            log.Level == "CRITICAL";
        if (!isSuspicious) return;

        var recentAlert = await _db.Alerts
            .AnyAsync(a =>
                a.SourceIp == log.SourceIp &&
                a.AlertType == "OFF_HOURS" &&
                a.DetectedAt >= log.Timestamp.AddHours(-1));

        if (!recentAlert)
        {
            await CreateAlertAsync(new Alert
            {
                LogId = log.Id,
                AlertType = "OFF_HOURS",
                Severity = "MEDIUM",
                SourceIp = log.SourceIp,
                Description = $"სამუშაო საათების გარეთ საეჭვო აქტივობა: " +
                              $"{log.Category} მოვლენა {log.Timestamp:HH:mm}-ზე " +
                              $"IP {log.SourceIp}-დან."
            });
        }
    }

    // წესი 4: Error Spike — 10+ error 5 წუთში
    private async Task CheckErrorSpikeAsync(LogEntry log)
    {
        if (log.Level != "ERROR" && log.Level != "CRITICAL") return;

        var fiveMinutesAgo = log.Timestamp.AddMinutes(-5);

        var errorCount = await _db.Logs
            .CountAsync(l =>
                l.SourceIp == log.SourceIp &&
                (l.Level == "ERROR" || l.Level == "CRITICAL") &&
                l.Timestamp >= fiveMinutesAgo &&
                l.Timestamp <= log.Timestamp);

        if (errorCount >= ErrorSpikeThreshold)
        {
            var recentAlert = await _db.Alerts
                .AnyAsync(a =>
                    a.SourceIp == log.SourceIp &&
                    a.AlertType == "ERROR_SPIKE" &&
                    a.DetectedAt >= log.Timestamp.AddMinutes(-10));

            if (!recentAlert)
            {
                await CreateAlertAsync(new Alert
                {
                    LogId = log.Id,
                    AlertType = "ERROR_SPIKE",
                    Severity = "HIGH",
                    SourceIp = log.SourceIp,
                    Description = $"შეცდომების სპაიკი: {errorCount} ERROR/CRITICAL " +
                                  $"IP {log.SourceIp}-დან ბოლო 5 წუთში."
                });
            }
        }
    }

    // წესი 5: Port Scan — 5+ განსხვავებული endpoint 1 წუთში
    private async Task CheckPortScanAsync(LogEntry log)
    {
        if (log.Category != "NETWORK") return;

        var oneMinuteAgo = log.Timestamp.AddMinutes(-1);

        var uniqueEndpoints = await _db.Logs
            .Where(l =>
                l.SourceIp == log.SourceIp &&
                l.Category == "NETWORK" &&
                l.Timestamp >= oneMinuteAgo &&
                l.Endpoint != null)
            .Select(l => l.Endpoint)
            .Distinct()
            .CountAsync();

        if (uniqueEndpoints >= PortScanThreshold)
        {
            var recentAlert = await _db.Alerts
                .AnyAsync(a =>
                    a.SourceIp == log.SourceIp &&
                    a.AlertType == "PORT_SCAN" &&
                    a.DetectedAt >= log.Timestamp.AddMinutes(-5));

            if (!recentAlert)
            {
                await CreateAlertAsync(new Alert
                {
                    LogId = log.Id,
                    AlertType = "PORT_SCAN",
                    Severity = "HIGH",
                    SourceIp = log.SourceIp,
                    Description = $"სავარაუდო Port Scan: {uniqueEndpoints} განსხვავებული " +
                                  $"endpoint IP {log.SourceIp}-დან ბოლო 1 წუთში."
                });
            }
        }
    }

    private async Task CreateAlertAsync(Alert alert)
    {
        _db.Alerts.Add(alert);
        await _db.SaveChangesAsync();
        _logger.LogWarning("Alert: {AlertType} | Severity: {Severity} | IP: {SourceIp}",
            alert.AlertType, alert.Severity, alert.SourceIp);
    }
}
