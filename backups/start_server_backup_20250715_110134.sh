#!/bin/bash
# Linux/Mac Shell Script zum Starten des lokalen CORS-Servers
# Verwendung: ./start_server.sh [port] [directory]

echo ""
echo "========================================"
echo "   Lokaler CORS-Server Starter"
echo "========================================"
echo ""

# Prüfen ob Python verfügbar ist
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Fehler: Python ist nicht installiert!"
    echo "💡 Bitte installieren Sie Python:"
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

echo "🚀 Starte Server mit:"
echo "   Port: $PORT"
echo "   Verzeichnis: $DIRECTORY"
echo ""

# Server im Hintergrund starten
$PYTHON_CMD local_server.py "$PORT" "$DIRECTORY" &
SERVER_PID=$!  # Speichert die Prozess-ID des Servers

# Kurze Wartezeit, damit der Server hochfährt (ca. 1 Sekunde)
sleep 1

# Automatisch index.html im Browser öffnen (plattformübergreifend)
URL="http://localhost:$PORT/index.html"
echo "🌐 Öffne $URL im Browser..."

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux (z. B. Ubuntu)
    xdg-open "$URL" || echo "❌ Konnte Browser nicht öffnen. Öffne manuell: $URL"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$URL" || echo "❌ Konnte Browser nicht öffnen. Öffne manuell: $URL"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    # Windows (z. B. Git Bash oder WSL)
    start "$URL" || echo "❌ Konnte Browser nicht öffnen. Öffne manuell: $URL"
else
    echo "❌ Unbekanntes OS. Öffne manuell: $URL"
fi

# Warte auf Server-Beendigung (z. B. per Ctrl+C im Terminal)
echo ""
echo "🛑 Server läuft. Drücke Ctrl+C, um zu beenden."
wait $SERVER_PID

echo ""
echo "👋 Server wurde beendet."

# Optional: Pause, damit Konsole nicht sofort schließt
read -p "Drücke Enter, um die Konsole zu schließen..." 
