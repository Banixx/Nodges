#!/bin/bash
# Linux/Mac Shell Script zum Starten des lokalen CORS-Servers
# Verwendung: ./start_server.sh [port] [directory]

echo ""
echo "========================================"
echo "   Lokaler CORS-Server Starter"
echo "========================================"
echo ""

# Pruefen ob Python verfuegbar ist
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "[ERROR] Fehler: Python ist nicht installiert!"
    echo "[INFO] Bitte installieren Sie Python:"
    echo "   Ubuntu/Debian: sudo apt install python3"
    echo "   macOS: brew install python3"
    echo "   oder von https://python.org"
    exit 1
fi

# Python-Befehl bestimmen
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

# Parameter verarbeiten
PORT=${1:-8000}
DIRECTORY=${2:-.}

echo "[CHECK] Pruefe ob Server bereits auf Port $PORT laeuft..."

# Bestehende Server auf dem Port beenden
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "[KILL] Beende bestehenden Server auf Port $PORT..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
    echo "[OK] Bestehender Server beendet."
else
    echo "[OK] Kein Server auf Port $PORT gefunden."
fi

echo "[START] Starte Server mit:"
echo "   Port: $PORT"
echo "   Verzeichnis: $DIRECTORY"
echo ""

# Server im Hintergrund starten
$PYTHON_CMD local_server.py "$PORT" "$DIRECTORY" &
SERVER_PID=$!  # Speichert die Prozess-ID des Servers

# Kurze Wartezeit, damit der Server hochfaehrt (ca. 1 Sekunde)
sleep 1

# Automatisch index.html im Browser oeffnen (plattformuebergreifend)
URL="http://localhost:$PORT/index.html"
echo "[WEB] Oeffne $URL im Browser..."

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux (z. B. Ubuntu)
    xdg-open "$URL" || echo "[ERROR] Konnte Browser nicht oeffnen. Oeffne manuell: $URL"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$URL" || echo "[ERROR] Konnte Browser nicht oeffnen. Oeffne manuell: $URL"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    # Windows (z. B. Git Bash oder WSL)
    start "$URL" || echo "[ERROR] Konnte Browser nicht oeffnen. Oeffne manuell: $URL"
else
    echo "[ERROR] Unbekanntes OS. Oeffne manuell: $URL"
fi

# Warte auf Server-Beendigung (z. B. per Ctrl+C im Terminal)
echo ""
echo "[STOP] Server laeuft. Druecke Ctrl+C, um zu beenden."
wait $SERVER_PID

echo ""
echo "[BYE] Server wurde beendet."

# Optional: Pause, damit Konsole nicht sofort schliesst
read -p "Druecke Enter, um die Konsole zu schliessen..." 
