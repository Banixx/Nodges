# Konzept fuer das Desktop-Start-Skript (Docker & Pi Agent)

## Zweck

Ein automatisierter Ein-Klick-Starter fuer Windows, um:
1. Zu pruefen, ob Docker Desktop bereits aktiv ist (und dieses bei Bedarf automatisch zu starten).
2. In das Projektverzeichnis `C:/Users/ich/Desktop/code/_projects/Nodges_Pi` zu wechseln.
3. Den Container via `docker compose up -d` im Hintergrund zu starten.
4. Die interaktive Pi-Agent CLI mit `docker compose exec -it pi-agent pi` zu oeffnen.

## Skript-Aufbau (`start_pi_container.cmd`)

```cmd
@echo off
title Pi Agent Container Starter

echo Pruefe Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker Desktop wird gestartet...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    :wait_docker
    timeout /t 3 /nobreak >nul
    docker info >nul 2>&1
    if %errorlevel% neq 0 (
        echo Warte auf Docker Desktop...
        goto wait_docker
    )
)

echo Wechsel in Projektverzeichnis...
cd /d "C:\Users\ich\Desktop\code\_projects\Nodges_Pi"

echo Starte Container und Pi Agent...
docker compose up -d
docker compose exec -it pi-agent pi

pause
```
