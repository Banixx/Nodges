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
- **Container-Startbefehl (PID 1):** `npm run dev`.
- **npm install:** Wird ueber `postCreateCommand` in `.devcontainer/devcontainer.json` vor dem Container-Start ausgefuehrt.
- **Vite** wird automatisch beim Containerstart auf Port 5173 gestartet (daher standardmaessig belegt).
- **Container hat kein `ps`, `pgrep`, `pkill`, `ss`, `docker`:** Prozess-Status muss ueber `/proc` abgefragt werden (`/proc/*/cmdline`, `/proc/net/tcp`).

## Ports & Services
| Port | Service | Status beim Containerstart | Start/Stop |
|------|---------|---------------------------|------------|
| 5173 | Vite Dev-Server | ✅ automatisch (via Container-CMD) | `node /workspace/node_modules/.bin/vite` (z.B. PID 55/56) |
| 5174 | Vite (manuell) | ❌ nicht automatisch | `npm run dev -- --port 5174` (falls 5173 belegt) |
| 8000 | LightRAG Backend | ❌ nicht im Container | Laeuft auf dem **Windows-Host** (via `.cmd`-Script gestartet) |
| 9222 | Chrome CDP | ❌ nicht automatisch | Benoetigt `start-vnc.sh`, welches scheitert (Tools nicht installiert) |
| 6080 | noVNC / VNC | ❌ nicht automatisch | Benoetigt `start-vnc.sh`, welches scheitert (Tools nicht installiert) |

### LightRAG-Details
- **venv-Pfad:** `/workspace/lightrag-backend/venv`
- **Abhaengigkeiten:** `fastapi`, `uvicorn`, `lightrag-hku`, `pydantic`, `python-dotenv` (installiert im venv).
- **LightRAG:** Laeuft **ausserhalb** des Containers auf dem Windows-Host. Der Container startet kein eigenes LightRAG-Backend. Das Frontend greift ueber den Vite-Dev-Server-Proxy auf `host.docker.internal:8000` zu. Stand der letzten Pruefung: `host.docker.internal` ist im Container auflösbar (192.168.65.254) und Port 8000 erreichbar.
- **Speicherort (Working Dir):** Das Backend nutzt `LIGHTRAG_WORKING_DIR` als einzige Pfadquelle. Datenbanken liegen unter `<WorkingDir>/databases`; `lightrag-backend/rag_storage/databases` wird nur noch als Altbestand mitgelesen.
- **Getrennte Checkouts:** Der Container mountet den WSL-Pfad `\\wsl.localhost\Ubuntu\home\unixusername\nodges` (siehe `Nodges_Pi/.env`, `REPO_PATH`). Der laufende Backend-Prozess arbeitet dagegen mit `C:\Users\ich\Desktop\code\_projects\Nodges`. Aenderungen an `lightrag-backend/` im Container wirken daher erst nach Sync in den Windows-Checkout und Neustart des Dienstes. Im Container sichtbare `rag_storage`-Dateien sind nicht zwangslaeufig die Live-Daten des Backends.
- **nm-Script (obsolet):** Das fruehere `package.json`-Script `lightrag` wurde fuer den Linux-Container nicht mehr verwendet, da LightRAG auf dem Host laeuft.

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
  # Vite PID finden
  for p in $(ls /proc | grep -E '^[0-9]+$'); do
    cmdline=$(cat /proc/$p/cmdline 2>/dev/null | tr '\0' ' ')
    if echo "$cmdline" | grep -qE 'vite'; then
      echo "PID $p: $cmdline"
    fi
  done
  ```

### 5. `host.docker.internal` (geklaert)
- **Status:** Behoben bzw. nicht reproduzierbar. `host.docker.internal` loest im Container auf (192.168.65.254), Port 8000 ist offen. Der Health-Check ueber die Vite-Proxy-Kette liefert `status: online` und `lightrag_engine_active: true`.
- **Pruefbefehl:**
  ```bash
  curl -s http://localhost:5173/lightrag-api/health
  ```
- **Hinweis:** Liefert der Health-Check `status: offline`, laeuft das Windows-Backend nicht (`.cmd`-Starter-Skript ausfuehren). Der Vite-Proxy antwortet in diesem Fall mit HTTP 503.

### 6. VNC / Chrome (CDP) nicht verfuegbar
- **Problem:** `.devcontainer/devcontainer.json` enthaelt zwar `postStartCommand: bash .devcontainer/start-vnc.sh &`, aber die benoetigten Pakete (`Xvfb`, `fluxbox`, `x11vnc`, `websockify`, `google-chrome-stable`) sind im Container nicht installiert. Daher starten weder noVNC (Port 6080) noch Chrome/CDP (Port 9222).
- **Hintergrund:** Der Container laeuft als `piuser`, nicht als `node` (der in `devcontainer.json` konfigurierte `remoteUser` existiert nicht im Image).

## Arbeitsregeln
- Pfade und Mounts muessen aus Sicht des Containers geprueft werden.
- Aenderungen am Projekt erfolgen unter `/workspace`.
- Pi laedt `AGENTS.md` automatisch aus dem aktuellen Arbeitsverzeichnis (`/workspace`). Die projektspezifische `AGENTS.md` ist somit die korrekte Stelle fuer Projekt-Kontext.
- Vor Aenderungen pruefe ich die relevanten Dateien, die Projektstruktur und vorhandene Tests.
- Ich kommuniziere ausschliesslich auf Deutsch und verwende keine Emojis.
- Wenn eine Nutzeranfrage eine Frage ist, beantworte ich sie direkt im ersten Satz, wenn moeglich mit `Ja` oder `Nein` am Anfang.
- Bei einer Frage fuehre ich noch keine Code-Aenderungen durch, sofern die Anfrage nicht zusaetzlich ausdruecklich eine Aenderung verlangt.
