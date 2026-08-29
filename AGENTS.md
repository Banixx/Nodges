# Projektkontext und Arbeitsregeln

## Projekt
- **Projektname:** nodges
- **Technologie:** TypeScript / Vite / Three.js
- **Frontend:** 3D-Netzwerk-Visualisierung
- **Backend:** LightRAG-API (Python/FastAPI, `lightrag-backend/main.py`)
- **Repository:** Host-Pfad `/home/unixusername/nodges` (WSL), gemountet als `/workspace` im Container.

## Container & Umgebung
- **Arbeitsverzeichnis:** `/workspace` (DevContainer-Standard, nicht umbenennenswert innerhalb des Containers).
- **Pi-Agent-Home im Container:** `/home/piuser/.pi/agent/` (Sessions, Settings, globale Skills etc.). Eine globale `AGENTS.md` existiert dort aktuell nicht. Der WSL-Ordner `.pi` auf dem Host hat hier keine direkte Verbindung.
- **Globales Pi-Home (permanent):** `/home/.pi` – Dies ist das globale, persistente Pi-Verzeichnis, das über Container-Neustarts hinweg erhalten bleibt (Mount vom Host). Pi-Settings und globale Kontexte können dort hinterlegt werden.
- **Container-Startbefehl (PID 1):** `sh -c "npm install && npm run dev"`.
- **Vite** wird automatisch beim Containerstart auf Port 5173 gestartet (daher standardmaessig belegt).
- **Container hat kein `ps`, `pgrep`, `pkill`, `ss`, `docker`:** Prozess-Status muss ueber `/proc` abgefragt werden (`/proc/*/cmdline`, `/proc/net/tcp`).

## Ports & Services
| Port | Service | Status beim Containerstart | Start/Stop |
|------|---------|---------------------------|------------|
| 5173 | Vite Dev-Server | ✅ automatisch (via Container-CMD) | `node /workspace/node_modules/.bin/vite` (PID 48/49) |
| 5174 | Vite (manuell) | ❌ nicht automatisch | `npm run dev -- --port 5174` (falls 5173 belegt) |
| 8000 | LightRAG Backend | ✅ automatisch (via `postStartCommand`) | `cd lightrag-backend && ./venv/bin/python main.py` |
| 9222 | Chrome CDP | ✅ automatisch (via `start-vnc.sh`) | In VNC-Script |
| 6080 | noVNC / VNC | ✅ automatisch (via `start-vnc.sh`) | In VNC-Script |

### LightRAG-Details
- **venv-Pfad:** `/workspace/lightrag-backend/venv`
- **Abhaengigkeiten:** `fastapi`, `uvicorn`, `lightrag-hku`, `pydantic`, `python-dotenv` (installiert im venv).
- **npm-Script (korrigiert):** `cd lightrag-backend && ./venv/bin/python main.py` (frueher Windows-Pfad, der im Linux-Container nicht funktionierte).
- **LightRAG:** Läuft außerhalb des Containers auf Windows. Der Container startet kein eigenes LightRAG-Backend; Vite greift standardmäßig über `host.docker.internal:8000` auf den Windows-Prozess zu.

## Bekannte Probleme & Fixes

### 1. Windows-Pfad im LightRAG-npm-Script
- **Problem:** Das urspruengliche `package.json`-Script `lightrag` enthielt `.\\lightrag-backend\\venv\\Scripts\\python.exe`, was im Linux-Container fehlschlug.
- **Fix:** Korrigiert zu `cd lightrag-backend && ./venv/bin/python main.py`.

### 2. Fehlende Python-venv beim ersten Start
- **Problem:** `lightrag-backend/venv` fehlte, daher startete LightRAG nicht.
- **Fix:** venv manuell erstellt und Requirements installiert (`python3 -m venv venv && ./venv/bin/pip install -r requirements.txt`).

### 3. Port 5173 bereits belegt
- **Problem:** Vite startet automatisch beim Containerstart auf 5173. Ein zweiter `npm run dev` schlaegt fehl.
- **Fix:** Alternativer Port verwenden (`--port 5174`).

### 4. Prozess-Management ohne Standard-Tools
- **Problem:** `pgrep`, `pkill`, `ps`, `ss` sind nicht verfuegbar.
- **Workaround:** Prozesse ueber `/proc` finden und mit `kill <PID>` beenden.
  ```bash
  # Alle Vite + LightRAG PIDs finden
  for p in $(ls /proc | grep -E '^[0-9]+$'); do
    cmdline=$(cat /proc/$p/cmdline 2>/dev/null | tr '\0' ' ')
    if echo "$cmdline" | grep -qE 'vite|python.*main\.py'; then
      echo "PID $p: $cmdline"
    fi
  done
  ```

## Arbeitsregeln
- Pfade und Mounts muessen aus Sicht des Containers geprueft werden.
- Aenderungen am Projekt erfolgen unter `/workspace`.
- Pi laedt `AGENTS.md` automatisch aus dem aktuellen Arbeitsverzeichnis (`/workspace`). Die projektspezifische `AGENTS.md` ist somit die korrekte Stelle fuer Projekt-Kontext.
- Vor Aenderungen pruefe ich die relevanten Dateien, die Projektstruktur und vorhandene Tests.
- Ich kommuniziere ausschliesslich auf Deutsch und verwende keine Emojis.
- Wenn eine Nutzeranfrage eine Frage ist, beantworte ich sie direkt im ersten Satz, wenn moeglich mit `Ja` oder `Nein` am Anfang.
- Bei einer Frage fuehre ich noch keine Code-Aenderungen durch, sofern die Anfrage nicht zusaetzlich ausdruecklich eine Aenderung verlangt.
