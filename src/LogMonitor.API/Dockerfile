FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj files and restore
COPY src/LogMonitor.Core/LogMonitor.Core.csproj src/LogMonitor.Core/
COPY src/LogMonitor.API/LogMonitor.API.csproj src/LogMonitor.API/
RUN dotnet restore src/LogMonitor.API/LogMonitor.API.csproj

# Copy everything else and build
COPY src/LogMonitor.Core/ src/LogMonitor.Core/
COPY src/LogMonitor.API/ src/LogMonitor.API/
WORKDIR /app/src/LogMonitor.API
RUN dotnet publish -c Release -o /app/out

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "LogMonitor.API.dll"]
