@echo off
title Pi Agent Container Starter

echo [1/3] Pruefe Docker Desktop...
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

echo [2/4] Starte und pruefe LightRAG...
set "LIGHTRAG_DIR=C:\Users\ich\Desktop\code\_projects\Nodges\lightrag-backend"
set "LIGHTRAG_WORKING_DIR=C:\Users\ich\Desktop\code\_projects\Nodges\rag_storage"

REM LightRAG nicht doppelt starten, falls der Dienst bereits laeuft.
curl.exe -fsS --max-time 2 http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    if not exist "%LIGHTRAG_DIR%\venv\Scripts\python.exe" (
        echo FEHLER: Python-venv von LightRAG nicht gefunden:
        echo        %LIGHTRAG_DIR%\venv\Scripts\python.exe
        pause
        exit /b 1
    )
    echo LightRAG wird gestartet...
    start "LightRAG Backend" /D "%LIGHTRAG_DIR%" cmd /k "set LIGHTRAG_WORKING_DIR=%LIGHTRAG_WORKING_DIR% && venv\Scripts\python.exe main.py"
) else (
    echo LightRAG laeuft bereits.
)

set /a LIGHTRAG_ATTEMPTS=0
:wait_lightrag
curl.exe -fsS --max-time 2 http://localhost:8000/health >nul 2>&1
if not errorlevel 1 goto lightrag_ready
set /a LIGHTRAG_ATTEMPTS+=1
if %LIGHTRAG_ATTEMPTS% geq 30 (
    echo FEHLER: LightRAG wurde innerhalb von 60 Sekunden nicht erreichbar.
    pause
    exit /b 1
)
echo Warte auf LightRAG... (%LIGHTRAG_ATTEMPTS%/30)
timeout /t 2 /nobreak >nul
goto wait_lightrag

:lightrag_ready
echo LightRAG ist bereit.

echo [3/4] Wechsel in Projektverzeichnis...
cd /d "C:\Users\ich\Desktop\code\_projects\Nodges_Pi"

echo [4/4] Starte Container und Pi Agent...
docker compose up -d
if errorlevel 1 (
    echo FEHLER: Docker-Container konnte nicht gestartet werden.
    pause
    exit /b 1
)
docker compose exec -it pi-agent pi

pause
