#!/bin/bash
# ============================================================
# start-lightrag.sh
# Startet das LightRAG-Backend im Container auf Port 8000.
# Idempotent: laeuft bereits eine gesunde Instanz, passiert nichts.
# ============================================================
set -u

BACKEND_DIR="/workspace/lightrag-backend"
LOG_FILE="/tmp/lightrag.log"

cd "$BACKEND_DIR" || { echo "[LightRAG] Backend-Verzeichnis fehlt: $BACKEND_DIR"; exit 1; }

if curl -sf -m 2 http://localhost:8000/health > /dev/null 2>&1; then
    echo "[LightRAG] Backend laeuft bereits auf Port 8000."
    exit 0
fi

if [ ! -x "venv/bin/python" ]; then
    echo "[LightRAG] Erstelle Python venv..."
    python3 -m venv venv || exit 1
    echo "[LightRAG] Installiere Abhaengigkeiten..."
    ./venv/bin/pip install -r requirements.txt || exit 1
fi

echo "[LightRAG] Starte Backend auf Port 8000 (Log: $LOG_FILE)..."
nohup ./venv/bin/python main.py >> "$LOG_FILE" 2>&1 &
echo "[LightRAG] PID: $!"

for _ in $(seq 1 15); do
    sleep 1
    if curl -sf -m 2 http://localhost:8000/health > /dev/null 2>&1; then
        echo "[LightRAG] Health-Check: OK"
        exit 0
    fi
done

echo "[LightRAG] Kein Health-Check nach 15s. Bitte Log pruefen: $LOG_FILE"
exit 1
