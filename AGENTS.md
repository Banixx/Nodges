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
- **Kanonische Compose-Quelle:** Der Pi-Container wird auf Windows ueber `C:\Users\ich\Desktop\code\_projects\Nodges_Pi\docker-compose.yml` gestartet. `/workspace/Nodges_Pi` ist nur der Git-Snapshot im Repo und wird von Docker nicht direkt verwendet. Aenderungen daran muessen nach Windows kopiert werden (siehe `resetup.md`).
- **Container hat kein `ps`, `pgrep`, `pkill`, `ss`, `docker`:** Prozess-Status muss ueber `/proc` abgefragt werden (`/proc/*/cmdline`, `/proc/net/tcp`).

## Ports & Services
| Port | Service | Status beim Containerstart | Start/Stop |
|------|---------|---------------------------|------------|
| 5173 | Vite Dev-Server | ✅ automatisch (via Container-CMD) | `node /workspace/node_modules/.bin/vite` (z.B. PID 55/56) |
| 5174 | Vite (manuell) | ❌ nicht automatisch | `npm run dev -- --port 5174` (falls 5173 belegt) |
| 8000 | LightRAG Backend | ✅ via `postStartCommand` | `.devcontainer/start-lightrag.sh` bzw. `npm run lightrag` |
| 9222 | Chrome CDP | ❌ nicht automatisch | Benoetigt `start-vnc.sh`, welches scheitert (Tools nicht installiert) |
| 6080 | noVNC / VNC | ❌ nicht automatisch | Benoetigt `start-vnc.sh`, welches scheitert (Tools nicht installiert) |

### LightRAG-Details
- **venv-Pfad:** `/workspace/lightrag-backend/venv`
- **Abhaengigkeiten:** `fastapi`, `uvicorn`, `lightrag-hku`, `pydantic`, `python-dotenv` (installiert im venv).
- **LightRAG:** Laeuft **im Container** auf Port 8000. Start automatisch via `postStartCommand` (`.devcontainer/start-lightrag.sh`) oder manuell mit `npm run lightrag`. Das Frontend erreicht es ueber den Vite-Proxy `/lightrag-api` (Ziel `http://localhost:8000`).
- **Speicherort (Working Dir):** `LIGHTRAG_WORKING_DIR`, sonst Fallback `lightrag-backend/rag_storage`. Datenbanken liegen unter `<WorkingDir>/databases`; `lightrag-backend/rag_storage/databases` wird als Altbestand mitgelesen. Laufzeitdaten sind per `.gitignore` ausgeschlossen.
- **Embeddings:** Laufen ueber OpenRouter (`qwen/qwen3-embedding-8b`, native dim 4096, ueberschreibbar via `EMBEDDING_MODEL`/`EMBEDDING_DIM`). Verifiziert: `POST https://openrouter.ai/api/v1/embeddings` liefert HTTP 200. Die frueher vermutete Einschraenkung "OpenRouter bietet keine Embeddings" ist falsch. Modellwechsel erfordert Neu-Einspielen aller Dokumente (Vektoren sind nicht kompatibel).
- **Externe Host-Instanz (optional):** Wer LightRAG weiter auf dem Windows-Host betreiben will, setzt `VITE_LIGHTRAG_PROXY_TARGET=http://host.docker.internal:8000` und laesst `.devcontainer/start-lightrag.sh` aus, damit sich nicht zwei Instanzen Port 8000 teilen.

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
- **Hinweis:** Liefert der Health-Check `status: offline`, laeuft das LightRAG-Backend nicht. Im Container mit `.devcontainer/start-lightrag.sh` starten (Log: `/tmp/lightrag.log`). Der Vite-Proxy antwortet in diesem Fall mit HTTP 503.

### 6. VNC / Chrome (CDP) nicht verfuegbar
- **Problem:** Die benoetigten Pakete (`Xvfb`, `fluxbox`, `x11vnc`, `websockify`, `google-chrome-stable`) sind im Container nicht installiert. Daher starten weder noVNC (Port 6080) noch Chrome/CDP (Port 9222). Ein Rebuild behebt das **nicht**, weil der fuer den Pi-Container verwendete `Nodges_Pi/Dockerfile` diese Pakete nicht enthaelt; nur `.devcontainer/Dockerfile` (VS-Code-Devcontainer-Pfad) tut das. VNC muesste in `Nodges_Pi/Dockerfile` ergaenzt werden.
- **Hintergrund:** Der Container laeuft als `piuser`, nicht als `node` (der in `devcontainer.json` konfigurierte `remoteUser` existiert nicht im Image).

## Arbeitsregeln
- Pfade und Mounts muessen aus Sicht des Containers geprueft werden.
- Aenderungen am Projekt erfolgen unter `/workspace`.
- Pi laedt `AGENTS.md` automatisch aus dem aktuellen Arbeitsverzeichnis (`/workspace`). Die projektspezifische `AGENTS.md` ist somit die korrekte Stelle fuer Projekt-Kontext.
- Vor Aenderungen pruefe ich die relevanten Dateien, die Projektstruktur und vorhandene Tests.
- Ich kommuniziere ausschliesslich auf Deutsch und verwende keine Emojis.
- Wenn eine Nutzeranfrage eine Frage ist, beantworte ich sie direkt im ersten Satz, wenn moeglich mit `Ja` oder `Nein` am Anfang.
- Bei einer Frage fuehre ich noch keine Code-Aenderungen durch, sofern die Anfrage nicht zusaetzlich ausdruecklich eine Aenderung verlangt.
