# Setup-Arbeitsübergabe für die nächste Pi-/LLM-Sitzung

## Zweck

Kurze Checkliste für ein LLM, das nach `/new` oder in einer neuen Sitzung am Nodges-Setup weiterarbeitet.

## Unveränderliche Grundannahmen

- Arbeitsumgebung des LLM: Linux-Container.
- Arbeitsverzeichnis: `/workspace`.
- Kein direkter Zugriff auf Windows-Dateien, Windows-Prozesse oder Desktop-Anwendungen.
- `/workspace/start_pi_container.cmd` ist die aktuell bereitgestellte temporäre Referenzkopie der echten Windows-Datei; ältere Kopien sind ungültig.
- Echte Windows-Datei: `C:\Users\ich\Desktop\code\_projects\Nodges_Pi\start_pi_container.cmd`.
- Kanonische Compose-Quelle: `C:\Users\ich\Desktop\code\_projects\Nodges_Pi\docker-compose.yml`. Der Ordner `/workspace/Nodges_Pi` ist nur der Git-Snapshot.
- LightRAG läuft im Pi-Container auf Port 8000 und wird beim Containerstart von `.devcontainer/start-lightrag.sh` gestartet.
- Containerzugriff intern: `http://localhost:8000` (über den Vite-Proxy `/lightrag-api`).
- Nodges/Vite läuft im Container auf Port 5173.
- Pi wird per `docker compose exec -it pi-agent pi` auf dem Windows-Host geöffnet.
- Bei Setupänderungen: `resetup.md` lesen.

## Erste Prüfungen

```bash
cd /workspace
pwd
sed -n '1,240p' AGENTS.md
sed -n '1,260p' docs/setup-llm-orientierung.md
sed -n '1,240p' docs/setup-probleme-erkenntnisse.md
git status --short --branch
```

Danach die projektspezifisch relevante Datei lesen, nicht pauschal alle Dateien ändern.

## Laufzeitchecks im Container

```bash
cd /workspace
curl -i --max-time 5 http://localhost:8000/health
curl -i --max-time 5 http://localhost:5173/lightrag-api/health
for p in /proc/[0-9]*; do
  cmdline=$(tr '\0' ' ' < "$p/cmdline" 2>/dev/null)
  case "$cmdline" in
    *vite*) echo "${p##*/}: $cmdline" ;;
  esac
done
```

Erwarteter Health-Inhalt:

```json
{
  "status": "online",
  "lightrag_engine_active": true
}
```

## Hostchecks, die der Benutzer ausführt

```powershell
curl.exe -i --max-time 5 http://localhost:8000/health
curl.exe -I --max-time 5 http://localhost:5173
docker ps --filter "name=pi-harness"
```

## Start- und Stopplogik

Der Benutzer startet die echte Desktop-Datei. Die aktuell bereitgestellte Kopie im Container wird nur dokumentarisch gelesen; sie darf nicht als Bootstrap-Quelle behandelt werden.

Normaler Start:

```text
Desktop start_pi_container.cmd
  -> Docker Desktop prüfen/starten
  -> docker compose up -d
  -> LightRAG startet im Container mit (.devcontainer/start-lightrag.sh)
  -> auf /health im Container warten
  -> Pi öffnen
```

Normaler Stopp auf Windows:

```powershell
cd "C:\Users\ich\Desktop\code\_projects\Nodges_Pi"
docker compose down
```

Das LightRAG-Backend läuft im Container und wird mit dem Container beendet. Ein separates Windows-Backend-Fenster gibt es im Normalbetrieb nicht mehr.

## Sicherheits- und Änderungsregeln

- Keine echten API-Schlüssel in Antworten oder Dokumenten wiederholen.
- `.env` und `.env.local` sind lokal und ignoriert.
- Vorhandene Git-Änderungen nicht zurücksetzen.
- Keine ungefragten Codeänderungen.
- Windows-Kopie und Container-/WSL-Datei nicht als synchron annehmen.
- Bei Setupänderungen den Benutzer nennen, welche Datei auf den Desktop übertragen werden muss.
- Nach Codeänderungen mindestens `npm run build` und passende Tests ausführen.

## Bekannte offene Aufgabe

Erledigt (Commit `2b3a97b`): `lightrag-backend/main.py` verwendet für Datenbank-Endpunkte nicht mehr relative `./rag_storage`-Pfade, sondern leitet alle Pfade zentral aus `LIGHTRAG_WORKING_DIR` ab und liest den Legacy-Pfad zusätzlich als Altbestand. Der Windows-Datenpfad ist für den Container-Betrieb nicht mehr relevant.
