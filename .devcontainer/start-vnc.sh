#!/bin/bash
# ============================================================
# start-vnc.sh
# Startet die VNC-Infrastruktur fuer Browser-Zugriff im DevContainer
# Zugriff via: http://localhost:6080/vnc.html
# ============================================================

echo "[VNC] Starte virtuelles Display (Xvfb)..."
Xvfb :99 -screen 0 1280x720x24 &
sleep 1

echo "[VNC] Starte Window-Manager (Fluxbox)..."
DISPLAY=:99 fluxbox &
sleep 1

echo "[VNC] Starte VNC-Server (x11vnc)..."
DISPLAY=:99 x11vnc -forever -nopw -display :99 -rfbport 5900 &
sleep 1

# noVNC-Pfad kann je nach Installation variieren
NOVNC_PATH="/usr/share/novnc"
if [ ! -d "$NOVNC_PATH" ]; then
    NOVNC_PATH="/usr/share/novnc/utils/../"
fi

echo "[VNC] Starte noVNC Websocket-Proxy (Port 6080)..."
websockify --web "$NOVNC_PATH" 6080 localhost:5900 &

echo "[VNC] ================================================"
echo "[VNC] noVNC laeuft auf: http://localhost:6080/vnc.html"
echo "[VNC] ================================================"

# Starte Chrome mit WebGL-Support (SwiftShader) und Remote-Debugging fuer CDP-Zugriff
echo "[VNC] Starte Chrome mit CDP auf Port 9222..."
DISPLAY=:99 google-chrome-stable \
    --no-sandbox \
    --use-gl=angle \
    --use-angle=swiftshader \
    --ignore-gpu-blocklist \
    --enable-webgl \
    --remote-debugging-port=9222 \
    --remote-debugging-address=0.0.0.0 \
    --user-data-dir=/tmp/chrome-vnc-profile \
    --disable-dev-shm-usage \
    --no-first-run \
    --no-default-browser-check \
    --homepage="http://localhost:5173" \
    "http://localhost:5173" &

echo "[VNC] Chrome gestartet. CDP verfuegbar auf Port 9222."
echo "[VNC] Alle Dienste laufen."
