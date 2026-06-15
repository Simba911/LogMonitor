# LogMonitor — Security Logging & Dashboard System

A full-stack real-time security logging and analysis dashboard. The system consists of a .NET 8 Web API backend, a React + TypeScript frontend dashboard, and a C# Log Agent that monitors files or simulates network security events (e.g. DDoS, Brute Force, Port Scanning).

---

## Project Structure

* **`src/LogMonitor.Core`**: Common class library containing shared models (`LogEntry`, `Alert`) and DTOs.
* **`src/LogMonitor.API`**: ASP.NET Core Web API backend that processes log entries, runs detection engines, and exposes endpoints for stats/logs/alerts.
* **`src/LogMonitor.Agent`**: Console application that watches log files in a directory or simulates live attacks.
* **`frontend`**: React + TypeScript client application dashboard displaying log rates, top sources, active security alerts, and threat status.

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:
* [.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
* [Node.js](https://nodejs.org/) (v16+ recommended) & npm
* [PostgreSQL](https://www.postgresql.org/) database server

---

## Setup & Running Instructions

### 1. Database Configuration
The backend expects a PostgreSQL database running locally. 
Verify that your database is running and matches the connection details in `src/LogMonitor.API/appsettings.json`:
* **Host**: `localhost`
* **Port**: `5433`
* **Database**: `log_monitor`
* **Username**: `postgres`
* **Password**: `password`

> **Note**: You do not need to run manual schema migrations. The backend automatically creates the database and all necessary tables on startup via `db.Database.EnsureCreated()`.

---

### 2. Run the Backend API
From the **root directory** of the project, execute:
```bash
dotnet run --project src/LogMonitor.API
```

Once started, the API will be available at:
* **HTTP**: `http://localhost:5000`
* **Swagger Documentation**: [http://localhost:5000/swagger](http://localhost:5000/swagger)

---

### 3. Run the Frontend Dashboard
Open a new terminal session, navigate to the `frontend` folder, and run:
```bash
cd frontend
npm install
npm start
```

Once loaded, open your browser and navigate to:
* [http://localhost:3000](http://localhost:3000)

> **CORS Handling**: The frontend API client is configured with a relative base path (`/api`) to leverage the built-in React development server proxy settings. This automatically forwards requests to port `5000` and prevents CORS blocks in the browser.

---

### 4. Run the Log Agent
Open a new terminal session. From the **root directory** of the project, run the agent using one of the two modes below:

#### Mode A: Attack Simulation Mode (Recommended for testing UI & Alerts)
Generates simulated traffic patterns including normal logs, Brute Force attacks, DDoS floods, and Port Scanning:
```bash
dotnet run --project src/LogMonitor.Agent -- --simulate
```

#### Mode B: Log Directory Watcher Mode
Watches a directory for `*.log` files and streams new lines to the API:
```bash
dotnet run --project src/LogMonitor.Agent
```
*(Default log watch folder is set to `./logs` relative to the workspace root)*

---

## Verifying Services Status

To check if all services are running and connected, you can run:
```bash
lsof -i :3000,5000,5433
```
This should show:
1. `node` (or `MainThread`) listening on port `3000` (Frontend).
2. `LogMonitor.API` listening on port `5000` (Backend API).
3. A connection established between `LogMonitor.API` and PostgreSQL on port `5433`.
