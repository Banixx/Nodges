#!/bin/bash
# Non-blocking Server Starter fuer ACLI
# Startet Server im Hintergrund ohne zu warten

echo "========================================"
echo "   Non-Blocking CORS-Server Starter"
echo "========================================"

# Python-Befehl bestimmen
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python nicht gefunden!"
    exit 1
fi

# Parameter
PORT=${1:-8000}
DIRECTORY=${2:-.}

echo "[CHECK] Pruefe Port $PORT..."

# Bestehende Server beenden
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "[KILL] Beende bestehenden Server..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo "[START] Starte Server auf Port $PORT..."

# Server im Hintergrund starten (detached)
nohup $PYTHON_CMD local_server.py "$PORT" "$DIRECTORY" > server.log 2>&1 &
SERVER_PID=$!

# Kurz warten bis Server hochgefahren
sleep 2

# Pruefen ob Server laeuft
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "[SUCCESS] Server gestartet (PID: $SERVER_PID)"
    echo "[URL] http://localhost:$PORT/index.html"
    echo "[LOG] Server-Log: server.log"
    echo "[STOP] Zum Beenden: kill $SERVER_PID"
else
    echo "[ERROR] Server konnte nicht gestartet werden!"
    cat server.log 2>/dev/null || echo "Keine Log-Datei gefunden"
    exit 1
fi

echo "[DONE] Script beendet, Server laeuft weiter." 
