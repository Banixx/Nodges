# Setup-Arbeitsübergabe für die nächste Pi-/LLM-Sitzung

## Zweck

Kurze Checkliste für ein LLM, das nach `/new` oder in einer neuen Sitzung am Nodges-Setup weiterarbeitet.

## Unveränderliche Grundannahmen

- Arbeitsumgebung des LLM: Linux-Container.
- Arbeitsverzeichnis: `/workspace`.
- Kein direkter Zugriff auf Windows-Dateien, Windows-Prozesse oder Desktop-Anwendungen.
- `/workspace/start_pi_container.cmd` ist die aktuell bereitgestellte temporäre Referenzkopie der echten Windows-Datei; ältere Kopien sind ungültig.
- Echte Windows-Datei: `C:\Users\ich\Desktop\code\_projects\Nodges_Pi\start_pi_container.cmd`.
- LightRAG läuft ausschließlich unter Windows auf Port 8000.
- LightRAG wird aus dem Container nicht gestartet.
- Containerzugriff: `http://host.docker.internal:8000`.
- Nodges/Vite läuft im Container auf Port 5173.
- Pi wird per `docker compose exec -it pi-agent pi` auf dem Windows-Host geöffnet.

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
curl -i --max-time 5 http://host.docker.internal:8000/health
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
  -> LightRAG auf localhost:8000 prüfen/starten
  -> auf /health warten
  -> docker compose up -d
  -> Pi öffnen
```

Normaler Stopp auf Windows:

```powershell
cd "C:\Users\ich\Desktop\code\_projects\Nodges_Pi"
docker compose down
```

LightRAG separat im Backend-Fenster mit `Ctrl+C` stoppen.

## Sicherheits- und Änderungsregeln

- Keine echten API-Schlüssel in Antworten oder Dokumenten wiederholen.
- `.env` und `.env.local` sind lokal und ignoriert.
- Vorhandene Git-Änderungen nicht zurücksetzen.
- Keine ungefragten Codeänderungen.
- Windows-Kopie und Container-/WSL-Datei nicht als synchron annehmen.
- Bei Setupänderungen den Benutzer nennen, welche Datei auf den Desktop übertragen werden muss.
- Nach Codeänderungen mindestens `npm run build` und passende Tests ausführen.

## Bekannte offene Aufgabe

`lightrag-backend/main.py` nutzt für die LightRAG-Instanz `LIGHTRAG_WORKING_DIR`, verwendet aber bei den Datenbank-Endpunkten noch relative `./rag_storage`-Pfade. Vor einer Änderung daran zuerst den aktuellen Laufzeitpfad und den Datenbestand auf Windows bestätigen. Das ist eine Stabilisierung des bestehenden Setups, kein neues Feature.
