FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj files and restore
COPY src/LogMonitor.Core/LogMonitor.Core.csproj src/LogMonitor.Core/
COPY src/LogMonitor.Agent/LogMonitor.Agent.csproj src/LogMonitor.Agent/
RUN dotnet restore src/LogMonitor.Agent/LogMonitor.Agent.csproj

# Copy everything else and build
COPY src/LogMonitor.Core/ src/LogMonitor.Core/
COPY src/LogMonitor.Agent/ src/LogMonitor.Agent/
WORKDIR /app/src/LogMonitor.Agent
RUN dotnet publish -c Release -o /app/out

# Runtime image
FROM mcr.microsoft.com/dotnet/runtime:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "LogMonitor.Agent.dll", "--simulate"]
