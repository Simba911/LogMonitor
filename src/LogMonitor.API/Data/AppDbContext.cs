using LogMonitor.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace LogMonitor.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<LogEntry> Logs { get; set; }
    public DbSet<Alert> Alerts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // LogEntry კონფიგურაცია
        modelBuilder.Entity<LogEntry>(entity =>
        {
            entity.ToTable("logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Timestamp).HasDefaultValueSql("NOW()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.RawData)
                  .HasColumnType("jsonb")
                  .HasConversion(
                      v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                      v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null));

            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.SourceIp);
            entity.HasIndex(e => e.Level);
        });

        // Alert კონფიგურაცია
        modelBuilder.Entity<Alert>(entity =>
        {
            entity.ToTable("alerts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.DetectedAt).HasDefaultValueSql("NOW()");

            entity.HasIndex(e => e.DetectedAt);
            entity.HasIndex(e => e.Severity);
            entity.HasIndex(e => e.IsResolved);
        });
    }
}
