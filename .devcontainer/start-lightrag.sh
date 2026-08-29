#!/bin/bash
# ============================================================
# start-lightrag.sh
# Startet das LightRAG-Backend im Hintergrund
# ============================================================

cd /workspace/lightrag-backend || exit 1

if [ ! -d "venv" ]; then
    echo "[LightRAG] Erstelle Python venv..."
    python3 -m venv venv
    echo "[LightRAG] Installiere Abhaengigkeiten..."
    ./venv/bin/pip install -r requirements.txt
fi

echo "[LightRAG] Starte LightRAG Backend auf Port 8000..."
nohup ./venv/bin/python main.py > /tmp/lightrag.log 2>&1 &
echo "[LightRAG] PID: $!"
sleep 2
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "[LightRAG] Erfolgreich gestartet. Health-Check: OK"
else
    echo "[LightRAG] Start wird ueberwacht (Log: /tmp/lightrag.log)"
fi
