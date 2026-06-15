# LogMonitor — Security Logging & Dashboard System

A full-stack real-time security logging and analysis dashboard. The system consists of a .NET 8 Web API backend, a React + TypeScript frontend dashboard, and a C# Log Agent that simulates security events (e.g. DDoS, Brute Force, Port Scanning).

---

## 🐳 Running the Project (Docker Only)

This project has been fully dockerized. To compile and run the application stack without any local environment conflicts or database installation issues, **Docker is required**.

### 🛠️ 1. Prerequisites
You only need to install one application on your machine:
* **Docker Desktop**: [Download Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
  *(Ensure the **WSL 2 backend** option is checked during installation).*

---

### 🚀 2. Step-by-Step Execution Guide (Error-Free)

Follow these exact steps to launch the system cleanly:

#### Step 2.1: Start Docker Desktop
Open the **Docker Desktop** application from your Start Menu. Wait 15–30 seconds for the engine to boot. You will know it is ready when the status bar in the bottom-left corner of the Docker Desktop window turns **green**.

#### Step 2.2: Clean Up Previous Runs (Avoid Port/Name Conflicts)
To ensure there are no left-over container name or port conflicts from previous runs, open your terminal (PowerShell or Command Prompt) and run:
```powershell
docker compose down --volumes
```
*(This stops any running containers and cleanly frees up ports `3000` and `5000` on your host machine).*

#### Step 2.3: Build and Start the Application
From the **root directory** of the project (`C:\Users\User\Desktop\LogMonitor`), run:
```powershell
docker compose up --build
```
This single command will:
1. Download all required Microsoft and Alpine base layers.
2. Build the React frontend and configure it to run inside Nginx.
3. Compile the ASP.NET Core Web API and the console Log Agent.
4. Launch a PostgreSQL instance and run database migrations automatically.
5. Boot the Log Agent simulator to stream threat logs to the backend.

---

## 🌐 3. Accessing the Applications

Once the startup process finishes and the terminal starts printing logs, open your web browser and navigate to:

* **Security Dashboard (Frontend)**: 👉 [http://localhost:3000](http://localhost:3000)
* **Backend API Swagger Documentation**: 👉 [http://localhost:5000/swagger](http://localhost:5000/swagger)

---

## 📁 4. Multi-Container Ports & Services Mapping

Inside the virtual network, the containers connect using their respective container names. The external port mappings to your Windows host are:

| Service | Container Name | Host Port | Internal Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| **db** | `logmonitor_db` | `5433` | `5432` | PostgreSQL database storing logs and security alerts. |
| **backend** | `logmonitor_backend` | `5000` | `5000` | ASP.NET Core API processing threat patterns. |
| **frontend** | `logmonitor_frontend` | `3000` | `80` | React Dashboard served by Nginx. |
| **agent** | `logmonitor_agent` | *None* | *None* | C# console app generating live simulated traffic. |

> **Note on Database Port (`5433`)**:
> The PostgreSQL container binds internally to `5432` but maps externally to **`5433`** on your host. This ensures that the Docker container does not conflict with any native PostgreSQL servers running on your Windows machine on `5432`.

---

## ⚠️ 5. Troubleshooting (Common Errors & Fixes)

#### Error: "failed to connect to the docker API"
* **Cause**: Docker Desktop is either not running or has not completed initialization.
* **Fix**: Open Docker Desktop, wait for the status icon to turn green, and rerun the compose command.

#### Error: "Conflict. The container name is already in use"
* **Cause**: A container from a previous or crashed run is still registered in Docker with the same name.
* **Fix**: Clear all orphaned containers by running:
  ```powershell
  docker compose down
  ```

#### Error: "port is already allocated" or "address already in use"
* **Cause**: Another local process (like a native web server or Node dev server) is running on port `3000` or `5000`.
* **Fix**: Find and close the program using those ports. In PowerShell, you can find the conflicting process using:
  ```powershell
  Get-NetTCPConnection -LocalPort 3000, 5000 -State Listen -ErrorAction SilentlyContinue
  ```
