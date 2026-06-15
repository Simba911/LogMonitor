using System.Text;
using System.Text.Json;

namespace LogMonitor.Agent;

class Program
{
    private static readonly string ApiUrl = Environment.GetEnvironmentVariable("API_URL") ?? "http://localhost:5000/api/logs";
    private static readonly string LogFolder = "logs";

    static async Task Main(string[] args)
    {
        Console.WriteLine("Log Agent დაიწყო...");
        Console.WriteLine($"API: {ApiUrl}");
        Console.WriteLine("Ctrl+C-ით შეაჩერეთ\n");

        // Dev-ში SSL validation გათიშვა
        var handler = new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback = (_, _, _, _) => true
        };
        var client = new HttpClient(handler);

        var mode = args.Contains("--simulate") ? "simulate" : "watch";

        if (mode == "simulate")
        {
            Console.WriteLine("სიმულაციის რეჟიმი — ტესტ ლოგები გენერირდება...\n");
            await SimulateLogs(client);
        }
        else
        {
            Console.WriteLine("ფაილების დაკვირვება...\n");
            await WatchLogFiles(client);
        }
    }

    static async Task WatchLogFiles(HttpClient client)
    {
        if (!Directory.Exists(LogFolder))
        {
            Directory.CreateDirectory(LogFolder);
            Console.WriteLine($"შეიქმნა: {LogFolder}");
        }

        var processedPositions = new Dictionary<string, long>();

        var watcher = new FileSystemWatcher(LogFolder)
        {
            Filter = "*.log",
            NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.FileName,
            EnableRaisingEvents = true
        };

        watcher.Changed += async (_, e) =>
            await ProcessNewLines(client, e.FullPath, processedPositions);

        watcher.Created += async (_, e) =>
        {
            Console.WriteLine($"ახალი ფაილი: {e.Name}");
            await ProcessNewLines(client, e.FullPath, processedPositions);
        };

        Console.WriteLine("Agent ელოდება ლოგებს...");
        await Task.Delay(Timeout.Infinite);
    }

    static async Task ProcessNewLines(HttpClient client, string filePath, Dictionary<string, long> positions)
    {
        try
        {
            long position = positions.GetValueOrDefault(filePath, 0);

            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            fs.Seek(position, SeekOrigin.Begin);

            using var reader = new StreamReader(fs);
            string? line;
            while ((line = await reader.ReadLineAsync()) != null)
            {
                if (!string.IsNullOrWhiteSpace(line))
                {
                    var logDto = ParseLogLine(line);
                    if (logDto != null)
                        await SendLogAsync(client, logDto);
                }
            }

            positions[filePath] = fs.Position;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ფაილის კითხვის შეცდომა: {ex.Message}");
        }
    }

    static LogDto? ParseLogLine(string line)
    {
        try
        {
            // JSON ფორმატი
            if (line.TrimStart().StartsWith("{"))
            {
                var json = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(line);
                if (json == null) return null;

                return new LogDto
                {
                    SourceIp = json.GetValueOrDefault("ip").ToString() ?? "0.0.0.0",
                    Level = json.GetValueOrDefault("level").ToString() ?? "INFO",
                    Category = json.GetValueOrDefault("category").ToString() ?? "SYSTEM",
                    Message = json.GetValueOrDefault("message").ToString() ?? line,
                    Timestamp = DateTime.TryParse(json.GetValueOrDefault("timestamp").ToString(), out var ts)
                        ? ts : DateTime.UtcNow
                };
            }

            // Text ფორმატი: 2024-01-15 14:30:22 ERROR AUTH 192.168.1.1 Login failed
            var parts = line.Split(' ', 6);
            if (parts.Length >= 6)
            {
                return new LogDto
                {
                    Timestamp = DateTime.TryParse($"{parts[0]} {parts[1]}", out var dt) ? dt : DateTime.UtcNow,
                    Level = parts[2].ToUpper(),
                    Category = parts[3].ToUpper(),
                    SourceIp = parts[4],
                    Message = parts[5]
                };
            }

            // Fallback
            return new LogDto
            {
                SourceIp = "unknown",
                Level = line.Contains("ERROR") ? "ERROR" :
                        line.Contains("WARN") ? "WARNING" : "INFO",
                Category = "SYSTEM",
                Message = line
            };
        }
        catch
        {
            return null;
        }
    }

    static async Task SendLogAsync(HttpClient client, LogDto dto)
    {
        try
        {
            var json = JsonSerializer.Serialize(dto, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await client.PostAsync(ApiUrl, content);

            var preview = dto.Message.Length > 50 ? dto.Message[..50] + "..." : dto.Message;

            if (response.IsSuccessStatusCode)
                Console.WriteLine($"[{dto.Level}] {dto.SourceIp}: {preview}");
            else
                Console.WriteLine($"API error: {response.StatusCode}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"გაგზავნის შეცდომა: {ex.Message}");
        }
    }

    // სიმულაციის რეჟიმი — კომისიაზე Demo-სთვის
    static async Task SimulateLogs(HttpClient client)
    {
        var random = new Random();
        var normalIps = new[] { "192.168.1.100", "192.168.1.101", "10.0.0.5", "172.16.0.8" };
        var suspiciousIp = "45.33.32.156";

        int logCount = 0;

        // Phase 1: ნორმალური ლოგები
        Console.WriteLine("Phase 1: ნორმალური ლოგები...");
        var normalScenarios = new[]
        {
            new LogDto { Level="INFO",    Category="AUTH",   Message="User admin logged in successfully" },
            new LogDto { Level="INFO",    Category="HTTP",   Message="GET /api/products 200 OK", Endpoint="/api/products", StatusCode=200 },
            new LogDto { Level="INFO",    Category="SYSTEM", Message="Scheduled backup completed" },
            new LogDto { Level="WARNING", Category="HTTP",   Message="GET /api/slow 200 OK (slow response)", Endpoint="/api/slow" },
        };

        for (int i = 0; i < 10; i++)
        {
            var scenario = normalScenarios[random.Next(normalScenarios.Length)];
            await SendLogAsync(client, new LogDto
            {
                SourceIp = normalIps[random.Next(normalIps.Length)],
                Level = scenario.Level,
                Category = scenario.Category,
                Message = scenario.Message,
                Endpoint = scenario.Endpoint,
                StatusCode = scenario.StatusCode
            });
            await Task.Delay(300);
            logCount++;
        }

        // Phase 2: Brute Force
        Console.WriteLine("\nPhase 2: Brute Force შეტევის სიმულაცია...");
        for (int i = 0; i < 5; i++)
        {
            await SendLogAsync(client, new LogDto
            {
                SourceIp = suspiciousIp,
                Level = "ERROR",
                Category = "AUTH",
                Message = $"Login failed: invalid credentials (attempt {i + 1})"
            });
            await Task.Delay(200);
            logCount++;
        }

        // Phase 3: DDoS
        Console.WriteLine("\nPhase 3: DDoS შეტევის სიმულაცია...");
        for (int i = 0; i < 110; i++)
        {
            await SendLogAsync(client, new LogDto
            {
                SourceIp = suspiciousIp,
                Level = "INFO",
                Category = "HTTP",
                Message = "GET /api/data HTTP/1.1",
                Endpoint = "/api/data",
                StatusCode = 200
            });
            await Task.Delay(30);
            logCount++;
        }

        // Phase 4: Port Scan
        Console.WriteLine("\nPhase 4: Port Scan სიმულაცია...");
        var endpoints = new[] { ":22", ":80", ":443", ":3389", ":8080", ":5432" };
        foreach (var ep in endpoints)
        {
            await SendLogAsync(client, new LogDto
            {
                SourceIp = suspiciousIp,
                Level = "WARNING",
                Category = "NETWORK",
                Message = $"Connection attempt to port {ep}",
                Endpoint = ep
            });
            await Task.Delay(100);
            logCount++;
        }

        Console.WriteLine($"\nსიმულაცია დასრულდა. სულ: {logCount} ლოგი გაიგზავნა.");
        Console.WriteLine("Dashboard-ზე შეამოწმეთ ალერტები!");
    }
}

class LogDto
{
    public string SourceIp { get; set; } = "0.0.0.0";
    public string? SourceName { get; set; }
    public DateTime? Timestamp { get; set; }
    public string Level { get; set; } = "INFO";
    public string Category { get; set; } = "SYSTEM";
    public string Message { get; set; } = string.Empty;
    public string? Endpoint { get; set; }
    public int? StatusCode { get; set; }
}
