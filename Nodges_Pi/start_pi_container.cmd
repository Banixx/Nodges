@echo off
title Pi Agent Container Starter

echo [1/4] Pruefe Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker Desktop wird gestartet...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    :wait_docker
    timeout /t 3 /nobreak >nul
    docker info >nul 2>&1
    if errorlevel 1 (
        echo Warte auf Bereitstellung von Docker Desktop...
        goto wait_docker
    )
)

echo [2/4] Wechsel in Projektverzeichnis...
cd /d "C:\Users\ich\Desktop\code\_projects\Nodges_Pi"

echo [3/4] Starte Container (LightRAG laeuft mit im Container)...
docker compose up -d
if errorlevel 1 (
    echo FEHLER: Docker-Container konnte nicht gestartet werden.
    pause
    exit /b 1
)

echo [4/4] Warte auf LightRAG im Container...
set /a LIGHTRAG_ATTEMPTS=0
:wait_lightrag
docker compose exec -T pi-agent curl -fsS --max-time 2 http://localhost:8000/health >nul 2>&1
if not errorlevel 1 goto lightrag_ready
set /a LIGHTRAG_ATTEMPTS+=1
if %LIGHTRAG_ATTEMPTS% geq 30 (
    echo WARNUNG: LightRAG im Container nicht erreichbar, starte Pi trotzdem.
    goto lightrag_ready
)
echo Warte auf LightRAG... (%LIGHTRAG_ATTEMPTS%/30)
timeout /t 2 /nobreak >nul
goto wait_lightrag

:lightrag_ready
echo LightRAG ist bereit.
docker compose exec -it pi-agent pi

pause
