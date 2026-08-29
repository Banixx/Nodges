# Nodges-Setup: Orientierungsdokumentation für zukünftige LLM-Sitzungen

**Dokumenttyp:** technische Setup- und Übergabedokumentation  
**Stand:** nach den Pi-Sitzungen bis 18.08.2026; aktualisiert nach Einlesen der neueren Skriptkopie  
**Geltungsbereich:** Windows 11, WSL2, Docker Desktop, Docker Compose, VS Code Dev Container, Pi Coding Agent, Nodges/Vite und LightRAG

Dieses Dokument ist die zentrale Orientierung für ein zukünftiges LLM. Es beschreibt nicht nur die gewünschte Architektur, sondern trennt ausdrücklich zwischen:

- Informationen, die im Container überprüft werden konnten,
- Informationen aus den vom Benutzer übermittelten Windows-Ausgaben,
- einer vom Benutzer bereitgestellten, aktuellen Referenzkopie des Windows-Startskripts im Container,
- offenen Punkten, die aus dem Container nicht verifiziert werden können.

## 1. Kurzfassung für eine neue Sitzung

1. Das LLM arbeitet im laufenden Linux-Container und hat keinen direkten Zugriff auf den Windows-Desktop.
2. Der maßgebliche Arbeitsbereich im Container ist `/workspace`.
3. Das eigentliche Nodges-Git-Repository liegt innerhalb von WSL2 und ist in den Container nach `/workspace` gemountet. Der konventionelle Zielname `/workspace` darf nicht umbenannt werden.
4. `C:\Users\ich\Desktop\code\_projects\Nodges_Pi\start_pi_container.cmd` ist die echte Windows-Startdatei. Die Datei `/workspace/start_pi_container.cmd` ist der aktuell bereitgestellte Snapshot (Momentaufnahme) dieser Datei zum Lesen und Dokumentieren. Sie ist keine ausführbare Bootstrap-Quelle: Ein Container-LLM kann damit keinen noch nicht laufenden Container starten.
5. Der aktuelle gewünschte Betrieb besteht aus genau einer LightRAG-Instanz auf Windows und einem Pi-/Vite-Container. LightRAG soll nicht zusätzlich im Container gestartet werden.
6. LightRAG läuft auf dem Windows-Host auf Port `8000`. Der Container erreicht ihn über `http://host.docker.internal:8000`.
7. Vite läuft im Container auf Port `5173`; Docker veröffentlicht den Port nach Windows. Nodges ist im Browser unter `http://localhost:5173` erreichbar.
8. Der Pi-Agent wird nach dem Compose-Start mit `docker compose exec -it pi-agent pi` geöffnet.
9. `npm run dev` muss im normalen Ablauf nicht manuell ein zweites Mal ausgeführt werden, weil der Compose-Container bereits `npm install && npm run dev` ausführt.
10. Vor Änderungen müssen `/workspace/AGENTS.md`, dieses Dokument, die relevante Projektdatei und der aktuelle Git-Status gelesen werden. Bestehende Änderungen dürfen nicht ungefragt zurückgesetzt werden.

## 2. Herkunft und Verlässlichkeit der Informationen

### 2.1 Im Container direkt überprüfte Quellen

Die folgenden Dateien und Verzeichnisse waren im Container vorhanden und wurden für diese Dokumentation ausgewertet:

- `/workspace/AGENTS.md`
- `/workspace/package.json`
- `/workspace/vite.config.ts`
- `/workspace/lightrag-backend/main.py`
- `/workspace/lightrag-backend/requirements.txt`
- `/workspace/.env.example`
- `/workspace/.gitignore`
- `/workspace/.devcontainer/*`
- `/workspace/Nodges_Pi/docker-compose.yml`
- `/workspace/Nodges_Pi/Dockerfile`
- `/workspace/Nodges_Pi/.env.example`
- `/workspace/Nodges_Pi/.gitattributes`
- `/workspace/start_pi_container.cmd`
- die Setup-Dokumente unter `/workspace/doc`, `/workspace/docs` und `/workspace/Nodges_Pi/doc`
- die Pi-Sitzungen unter `/home/.pi/agent/sessions` und `/home/piuser/.pi/agent/sessions`

### 2.2 Vom Benutzer übermittelte Host-Fakten

Die folgenden Angaben stammen aus PowerShell-Ausgaben beziehungsweise aus der Beschreibung des Benutzers. Sie können aus dem Container nicht selbst erneut geprüft werden:

- Der echte Windows-Startpfad ist `C:\Users\ich\Desktop\code\_projects\Nodges_Pi\start_pi_container.cmd`.
- Das Windows-LightRAG-Projekt liegt unter `C:\Users\ich\Desktop\code\_projects\Nodges\lightrag-backend`.
- Die gemeinsam zu verwendende Windows-LightRAG-Datenbank liegt unter `C:\Users\ich\Desktop\code\_projects\Nodges\rag_storage`.
- Nach dem Neustart wurde der aktuelle Desktop-Startablauf erfolgreich ausgeführt.
- PowerShell konnte `http://localhost:8000/health` mit HTTP 200 erreichen.
- Der Container konnte `http://host.docker.internal:8000/health` mit HTTP 200 erreichen.

### 2.3 Was nicht behauptet werden darf

Ein LLM im Container darf nicht behaupten, den Windows-Desktop, den Windows-Prozessstatus oder die echte Desktop-Datei direkt gelesen zu haben. Es analysiert die vom Benutzer in `/workspace/start_pi_container.cmd` bereitgestellte aktuelle Referenzkopie. Ob diese Kopie nach dem Kopieren noch exakt mit der Desktop-Datei übereinstimmt, kann das LLM nicht verifizieren.

## 3. Gesamtsystem und Verantwortungsgrenzen

```text
Windows 11
├── Docker Desktop
│   └── Docker-Compose-Projekt Nodges_Pi
│       └── Container pi-harness / Service pi-agent
│           ├── Pi Coding Agent
│           ├── npm install
│           └── Vite auf 0.0.0.0:5173
│
└── Windows-Python-Prozess
    └── LightRAG/FastAPI/Uvicorn auf 0.0.0.0:8000
        └── Windows-Datenbank C:\...\Nodges\rag_storage

Browser auf Windows
├── http://localhost:5173       -> Docker-Portweiterleitung -> Vite im Container
├── http://localhost:8000/docs   -> Windows-LightRAG-Swagger-Oberfläche
└── http://localhost:6080        -> optionaler noVNC-Weg der älteren Devcontainer-Konfiguration

Vite im Container
└── /lightrag-api/*
    └── Proxy zu http://host.docker.internal:8000/*
```

### Zuständigkeiten

| Komponente | Ort | Aufgabe | Im normalen Desktop-Start? |
|---|---|---|---|
| Windows-Startskript | Windows-Desktop | Docker prüfen, LightRAG prüfen/starten, Compose starten, Pi öffnen | Ja |
| Docker Desktop | Windows | Docker Engine und Portweiterleitungen | Ja |
| `pi-agent`/`pi-harness` | Linux-Container | Pi, Node, npm und Vite | Ja |
| Vite | Container | Nodges-Entwicklungsserver und Dev-APIs | Ja, durch Compose-Befehl |
| LightRAG | Windows | FastAPI-API, LLM-Aufrufe, Embeddings, RAG-Datenbank | Ja, aber als separater Host-Prozess |
| `.devcontainer/start-lightrag.sh` | Container-Datei | ältere/alternative Startlogik | Nein; nicht ausführen |
| `.devcontainer/start-vnc.sh` | Container-Datei | optionale Xvfb/noVNC/Chrome-Infrastruktur | Nicht Bestandteil des bestätigten Compose-Startablaufs |

## 4. Pfade und Mounts

### 4.1 Kanonischer Projektpfad

Der aktive Git-Arbeitsbaum ist im Container:

```text
/workspace
```

Der zugrunde liegende WSL-Pfad ist laut Projektregeln:

```text
/home/unixusername/nodges
```

Die Compose-Umgebung bindet diesen WSL-Pfad über einen Windows-UNC-Pfad ein:

```text
\\wsl.localhost\Ubuntu\home\unixusername\nodges
```

`/workspace` ist daher kein zusätzlicher Projektordner, der umbenannt werden soll, sondern das feste Mount-Ziel im Container.

### 4.2 Windows-Start- und Setup-Ordner

```text
C:\Users\ich\Desktop\code\_projects\Nodges_Pi
```

Dort liegen auf Windows die echte `start_pi_container.cmd`, die Compose-Datei und das für den Container gebaute Dockerfile. Im Container existiert zusätzlich eine Kopie unter:

```text
/workspace/Nodges_Pi
```

Diese Kopie ist im aktuell sichtbaren Git-Arbeitsbaum kein eigenes Git-Repository. `git -C /workspace/Nodges_Pi` fällt auf das übergeordnete Repository `/workspace` zurück; `Nodges_Pi` wird dort als zusätzlicher, nicht kanonischer Ordner beziehungsweise als untracked Setup-Kopie angezeigt.

### 4.3 Aktuelle, temporär bereitgestellte Windows-Skriptkopie

```text
/workspace/start_pi_container.cmd
```

Diese Datei wurde vom Benutzer in den Workspace kopiert, damit ihr aktueller Inhalt im Container analysiert und dokumentiert werden kann. Die zuvor vorhandene Kopie war veraltet; die jetzt erneut eingelesene Datei enthält den neueren LightRAG-Start- und Bereitschaftsablauf. Auch die aktuelle Kopie kann den Container nicht starten und soll nach Abschluss der Dokumentation vom Benutzer wieder entfernt werden. Änderungen an dieser Kopie wirken nicht automatisch auf die Desktop-Datei.

### 4.4 Persistenz

| Ort | Bedeutung | Neustart-/Recreate-Verhalten |
|---|---|---|
| WSL-Repository `/home/unixusername/nodges` | Projektdaten, Git, Quellcode | persistent |
| Container-Mount `/workspace` | Sicht auf das WSL-Repository | persistent über Hostdateien |
| WSL-`.pi` beziehungsweise über Compose gemountetes Custom-Verzeichnis | Pi-Konfiguration und dauerhafte Agent-Dateien | persistent, sofern der Mount unverändert bleibt |
| `/home/.pi` im Compose-Mount | globaler Pi-Speicher laut Projektregeln | persistent |
| `/home/piuser/.pi/agent/sessions` | im Container sichtbare Sitzungen | nicht ohne Weiteres als Projektdateien behandeln; Persistenz hängt von der Pi-/Mount-Konfiguration ab |
| `/tmp` | temporäre Containerdaten; Compose definiert tmpfs | nicht persistent |
| `node_modules` | lokale/installierte Node-Abhängigkeiten | normalerweise gemountet oder im Container vorhanden; bei Neuaufbau neu installieren |
| `dist` | Build-Ausgabe | regenerieren, nicht als Quelle behandeln |
| Windows-`rag_storage` | eigentliche LightRAG-Datenbank | persistent auf Windows |

Wichtig: Ein Container-Recreate ist nicht dasselbe wie ein normaler Container-Neustart. Alles, was nicht gemountet oder auf dem Host gespeichert ist, darf bei einem Recreate als verloren betrachtet werden.

## 5. Tatsächlicher Startablauf

### 5.1 Start von Windows aus

Der Benutzer startet die echte Desktop-Datei in PowerShell oder per Doppelklick:

```text
C:\Users\ich\Desktop\code\_projects\Nodges_Pi\start_pi_container.cmd
```

Der aktuell im Container vorliegende Referenzstand `/workspace/start_pi_container.cmd` beschreibt folgenden Ablauf. Eine ältere, zuvor im Workspace befindliche Kopie darf für die Beurteilung nicht mehr verwendet werden:

1. `docker info` prüfen.
2. Docker Desktop bei Bedarf starten und bis zur Bereitschaft warten.
3. `LIGHTRAG_DIR` auf das Windows-LightRAG-Verzeichnis setzen.
4. `LIGHTRAG_WORKING_DIR` auf die gemeinsame Windows-Datenbank setzen.
5. `http://localhost:8000/health` testen.
6. LightRAG nur starten, wenn Port 8000 nicht bereits gesund antwortet.
7. Bis zu 60 Sekunden auf den LightRAG-Health-Check warten.
8. In `Nodges_Pi` wechseln.
9. `docker compose up -d` ausführen.
10. Mit `docker compose exec -it pi-agent pi` den Agenten öffnen.

Der wesentliche Referenzstand des Skripts ist:

```bat
@echo off
title Pi Agent Container Starter

echo [1/3] Pruefe Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker Desktop wird gestartet...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    :wait_docker
    timeout /t 3 /nobreak >nul
    docker info >nul 2>&1
    if errorlevel 1 (
        echo Warte auf Bereitstellung von Docker Desktop...
        goto wait_docker
    )
)

echo [2/4] Starte und pruefe LightRAG...
set "LIGHTRAG_DIR=C:\Users\ich\Desktop\code\_projects\Nodges\lightrag-backend"
set "LIGHTRAG_WORKING_DIR=C:\Users\ich\Desktop\code\_projects\Nodges\rag_storage"

REM LightRAG nicht doppelt starten, falls der Dienst bereits laeuft.
curl.exe -fsS --max-time 2 http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    if not exist "%LIGHTRAG_DIR%\venv\Scripts\python.exe" (
        echo FEHLER: Python-venv von LightRAG nicht gefunden:
        echo        %LIGHTRAG_DIR%\venv\Scripts\python.exe
        pause
        exit /b 1
    )
    echo LightRAG wird gestartet...
    start "LightRAG Backend" /D "%LIGHTRAG_DIR%" cmd /k "set LIGHTRAG_WORKING_DIR=%LIGHTRAG_WORKING_DIR% && venv\Scripts\python.exe main.py"
) else (
    echo LightRAG laeuft bereits.
)

set /a LIGHTRAG_ATTEMPTS=0
:wait_lightrag
curl.exe -fsS --max-time 2 http://localhost:8000/health >nul 2>&1
if not errorlevel 1 goto lightrag_ready
set /a LIGHTRAG_ATTEMPTS+=1
if %LIGHTRAG_ATTEMPTS% geq 30 (
    echo FEHLER: LightRAG wurde innerhalb von 60 Sekunden nicht erreichbar.
    pause
    exit /b 1
)
echo Warte auf LightRAG... (%LIGHTRAG_ATTEMPTS%/30)
timeout /t 2 /nobreak >nul
goto wait_lightrag

:lightrag_ready
echo LightRAG ist bereit.

echo [3/4] Wechsel in Projektverzeichnis...
cd /d "C:\Users\ich\Desktop\code\_projects\Nodges_Pi"

echo [4/4] Starte Container und Pi Agent...
docker compose up -d
if errorlevel 1 (
    echo FEHLER: Docker-Container konnte nicht gestartet werden.
    pause
    exit /b 1
)
docker compose exec -it pi-agent pi

pause
```

Die oben dokumentierte Fassung ist die aktuell erneut eingelesene Referenzkopie. Sie korrigiert die frühere Dokumentationsgrundlage, die auf einer veralteten Kopie beruhte. Die Desktop-Datei bleibt die ausführbare Quelle; ob sie nachträglich exakt denselben Stand wie diese Kopie hat, kann das Container-LLM nicht prüfen. Der Benutzer muss die aktuelle Fassung bei Bedarf selbst auf den Desktop übertragen.

### 5.1.1 Bewertung des aktuellen Startskripts

Der aktuelle Ablauf erfüllt die gewünschte Grundarchitektur:

- Docker Desktop wird geprüft und bei Bedarf gestartet.
- LightRAG wird auf dem Windows-Host geprüft und nur bei fehlendem Health-Check in einem separaten Fenster gestartet.
- Der Start wartet bis zu 30 Prüfungen mit jeweils 2 Sekunden, also ungefähr 60 Sekunden, auf `/health`.
- `LIGHTRAG_WORKING_DIR` wird beim Start des Python-Kindprozesses auf den gemeinsamen Windows-Datenpfad gesetzt.
- Erst danach wird Compose im Setup-Ordner gestartet und Pi geöffnet.
- `docker compose up -d` wird auf Fehler geprüft.

Wichtige Grenzen des Skripts:

- Ein gesunder Dienst auf Port 8000 wird nicht neu gestartet. Das ist beabsichtigt, bedeutet aber auch, dass ein bereits laufender LightRAG-Prozess mit einem falschen Datenpfad durch den Health-Check nicht erkannt wird.
- Das Skript prüft nach `docker compose up -d` nicht aktiv, ob Vite auf Port 5173 bereits bereit ist. `npm install` kann im Container noch laufen, während Pi schon geöffnet wird.
- `docker compose up -d` verwendet nicht automatisch `--build`. Änderungen an Dockerfile oder Compose-Konfiguration erfordern einen separaten Start mit `docker compose up -d --build` auf Windows.
- Das separate LightRAG-Fenster wird mit `cmd /k` geöffnet und bleibt nach Ende des Python-Prozesses offen. Das erleichtert die Fehlerdiagnose.

### 5.2 Was Compose im Container startet

Die im Container untersuchte `/workspace/Nodges_Pi/docker-compose.yml` enthält im Kern:

```yaml
services:
  pi-agent:
    container_name: pi-harness
    working_dir: /workspace
    command: sh -c "npm install && npm run dev"
    ports:
      - "5173:5173"
```

Damit startet Compose nicht `npm run lightrag` und keinen zweiten Python-Backendprozess. Es startet nur die Node-/Vite-Seite im Container. Der Pi-Agent wird anschließend separat mit `docker compose exec` geöffnet.

### 5.3 LightRAG nicht aus dem Container starten

Die Datei `/workspace/.devcontainer/start-lightrag.sh` existiert, ist aber für den bestätigten Desktop-Compose-Ablauf nicht maßgeblich. Sie würde eine zweite LightRAG-Instanz innerhalb des Containers starten. Das ist unerwünscht, weil:

- bereits eine Windows-Instanz auf Port 8000 verwendet wird,
- beide Prozesse sonst dieselben logischen Datenbanken oder Dateien verwenden könnten,
- zwei Prozesse zu Port-, Cache- und Schreibkonflikten führen können,
- `host.docker.internal` gerade den absichtlichen Zugriff auf den Windows-Dienst ermöglicht.

## 6. Netzwerk und URLs

### 6.1 Endpunkte

| URL | Zweck | Wo prüfen? |
|---|---|---|
| `http://localhost:5173` | Nodges/Vite im Browser | Windows-Browser oder Host-PowerShell |
| `http://localhost:8000/health` | LightRAG-Gesundheitsstatus | Windows-PowerShell/Browser |
| `http://localhost:8000/docs` | Swagger UI der FastAPI-API | Windows-Browser |
| `http://localhost:8000/redoc` | alternative API-Dokumentation | Windows-Browser |
| `http://localhost:8000/databases` | Datenbankliste | Windows-PowerShell/Browser |
| `http://localhost:6080/vnc.html` | optionales noVNC | nur bei aktivierter alter VNC-Konfiguration |
| `http://localhost:9222` | optionales Chrome-CDP | nur bei aktivierter alter VNC-Konfiguration |

### 6.2 LightRAG-Proxy

In `/workspace/vite.config.ts` ist der Proxy so konfiguriert:

```text
/lightrag-api/*  ->  http://host.docker.internal:8000/*
```

Der Browser ruft Nodges auf Port 5173 auf. Nodges ruft nicht zwingend direkt `localhost:8000` auf, sondern verwendet den Vite-Pfad `/lightrag-api`. Vite leitet diesen im Container zum Windows-Host weiter.

`host.docker.internal` ist ein Docker-Sondername. Er muss aus dem Docker-Container getestet werden. Er ist nicht automatisch im normalen WSL-Terminal verfügbar. Der frühere WSL-Test

```bash
curl http://host.docker.internal:8000/health
```

mit `Could not resolve host` war deshalb kein Beweis, dass der Containerzugriff fehlschlägt.

### 6.3 Verifizierter Health-Status

Der vom Benutzer gemeldete Host-Status war:

```json
{
  "status": "online",
  "service": "LightRAG Local API",
  "lightrag_engine_active": true,
  "version": "0.102.12"
}
```

Der im Pi-Container ausgeführte Test war ebenfalls erfolgreich:

```bash
curl -i --max-time 5 http://host.docker.internal:8000/health
```

mit `HTTP/1.1 200 OK` und demselben JSON. `lightrag_engine_active: true` bedeutet, dass der echte LightRAG-Enginepfad aktiv ist, nicht nur der Mock-Fallback.

## 7. LightRAG-Konfiguration und Datenbanken

### 7.1 Python-Backend

Relevante Datei:

```text
/workspace/lightrag-backend/main.py
```

Abhängigkeiten:

```text
fastapi
uvicorn
lightrag-hku
pydantic
python-dotenv
```

Das Backend:

- stellt FastAPI auf Port 8000 bereit,
- lädt `.env.local` und `.env` abhängig vom Startkontext,
- mappt bei Bedarf `VITE_OPENROUTER_API_KEY` auf `OPENAI_API_KEY` und OpenRouter als API-Basis,
- initialisiert LightRAG mit einem Arbeitsverzeichnis,
- nutzt standardmäßig Modell `morph/morph-v3-large`, sofern `LLM_MODEL` nicht gesetzt ist,
- nutzt standardmäßig `text-embedding-3-small`, Embedding-Dimension 1536 und maximale Token-Größe 8192,
- bietet Query, Insert und Datenbankverwaltung,
- begrenzt den Graph-Auszug standardmäßig auf 150 Knoten und 300 Kanten.

### 7.2 Gemeinsamer Datenbankpfad

Die gewünschte gemeinsame Windows-Datenbank ist:

```text
C:\Users\ich\Desktop\code\_projects\Nodges\rag_storage
```

Die Referenzkopie des Startskripts setzt deshalb:

```bat
set "LIGHTRAG_WORKING_DIR=C:\Users\ich\Desktop\code\_projects\Nodges\rag_storage"
```

Das ist notwendig, weil ein relativer Pfad wie `./rag_storage` vom aktuellen Arbeitsverzeichnis abhängt. Beim manuellen Start aus `lightrag-backend` wurde zeitweise eine neue leere Datenbank unter `lightrag-backend\rag_storage` angelegt. Das war eine zentrale Fehlerquelle.

### 7.3 Bekannte Pfadinkonsistenz im Backend-Code

Bei der Containerprüfung wurde festgestellt, dass `main.py` zwar `WORKING_DIR` aus `LIGHTRAG_WORKING_DIR` ableitet, die Endpunkte `/databases`, `/databases/create`, `/databases/select` und `/databases/{db_name}` aber weiterhin relative Ausdrücke wie `./rag_storage` verwenden.

Daraus folgt:

- Ein gesetztes `LIGHTRAG_WORKING_DIR` schützt nicht automatisch jede Datenbankoperation.
- Der Prozess muss nach jedem Start mit `/databases` geprüft werden.
- Wenn `/databases` einen Pfad unter `lightrag-backend\rag_storage` meldet, wird die falsche Datenbank verwendet.
- Eine spätere Stabilisierung sollte alle Datenbankoperationen konsequent auf denselben absoluten Basisordner umstellen. Das ist eine bestehende Konsistenzaufgabe, keine neue Plan-104-Funktion.

Der Benutzer hat zuvor als erwartete Antwort den Windows-Pfad `C:\Users\ich\Desktop\code\_projects\Nodges\rag_storage` mit den Datenbanken `default` und `sd` gemeldet. Diese Runtime-Ausgabe ist wichtig, muss nach einem Dateiabgleich aber erneut auf dem Windows-Host kontrolliert werden.

### 7.4 Datenbank-API

Vorhandene Endpunkte aus `main.py`:

```text
GET    /health
GET    /docs
GET    /redoc
POST   /query
POST   /insert
GET    /databases
POST   /databases/create
POST   /databases/select
DELETE /databases/{db_name}
```

Es gibt keine separate, fachlich eigene LightRAG-Anwendung. `/docs` ist die native Swagger-Oberfläche der FastAPI-API.

## 8. Umgebungsvariablen und Geheimnisse

### 8.1 Dateien

Die relevanten Konfigurationsdateien sind:

```text
/workspace/.env
/workspace/.env.local
/workspace/.env.example
/workspace/Nodges_Pi/.env
/workspace/Nodges_Pi/.env.example
```

Echte Schlüsselwerte dürfen niemals in diese Dokumentation oder in Antworten kopiert werden.

### 8.2 Git-Ignorierung

Die überprüfte `/workspace/.gitignore` ignoriert unter anderem:

```gitignore
.env
.env.local
**/venv/
**/__pycache__/
node_modules/
dist/
```

Das verhindert eine neue Git-Aufnahme. Es entfernt jedoch keine bereits historisch committeden Geheimnisse und schützt nicht vor dem Anzeigen eines Schlüssels in einem Chat, Log oder Frontend-Bundle.

### 8.3 Konfigurationsrollen

| Variable | Zweck | Typischer Ort |
|---|---|---|
| `VITE_OPENROUTER_API_KEY` | Frontend-/LightRAG-Entwicklungszugang im lokalen Setup | `/workspace/.env.local` beziehungsweise `.env` |
| `OPENROUTER_API_KEY` | Container-/Pi-Konfiguration laut Compose-`.env` | `/workspace/Nodges_Pi/.env` |
| `OPENAI_API_KEY` | direkte OpenAI-kompatible Backend-Konfiguration | lokale `.env` |
| `OPENAI_API_BASE` | OpenRouter-kompatible API-Basis | vom Backend gesetzt oder lokal konfiguriert |
| `LIGHTRAG_WORKING_DIR` | absoluter LightRAG-Datenpfad | Windows-Startskript/Windows-Umgebung |
| `VITE_LIGHTRAG_PROXY_TARGET` | Vite-Proxyziel; Standard `http://host.docker.internal:8000` | Vite-Umgebung |
| `REPO_PATH` | Windows-Docker-Quelle für den WSL-Repo-Mount | `Nodges_Pi/.env` |
| `CUSTOM_PATH` | Quelle des dauerhaften Pi-Verzeichnisses | `Nodges_Pi/.env` |
| `USER_ID`, `GROUP_ID` | UID/GID für `piuser` | `Nodges_Pi/.env` |

Der OpenRouter-Schlüssel wurde für lokale LightRAG-/Nodges-Tests aus der Windows-Konfiguration in den Workspace kopiert. Das erklärt seine Existenz, ändert aber nichts an der Regel, Werte nicht zu dokumentieren und nur lokal in ignorierten Dateien zu halten.

## 9. Container, Node und Vite

### 9.1 Aktiver Anwendungscode

Im aktiven Container wurde aus `/workspace` gebaut:

```text
package.json: nodges@0.103.1
```

Der erfolgreiche Build war:

```bash
cd /workspace
npm run build
```

Das führt aus:

```text
tsc && vite build
```

Ergebnis:

```text
259 modules transformed
✓ built in 23.53s
```

Die Warnung über Chunks größer als 500 kB ist nicht fatal. Sie betrifft unter anderem große Demo-/Datenmodule und ist eine spätere Optimierungsaufgabe.

### 9.2 Laufzeitversionen

Im laufenden Pi-Container wurden bestätigt:

```text
Node v22.23.2
npm 10.9.8
Debian GNU/Linux 12 (bookworm)
```

### 9.3 Vite nicht doppelt starten

Der Compose-Prozess führt bereits aus:

```text
npm install && npm run dev
```

Ein weiteres `npm run dev` im Pi-Terminal versucht denselben Port `5173` ein zweites Mal zu verwenden. Für einen absichtlich zweiten Server ist `npm run dev -- --port 5174` möglich, gehört aber nicht zum normalen Setup.

### 9.4 Unterschiedliche Dockerfiles

Im Workspace existieren zwei Konfigurationswelten:

1. `/workspace/Nodges_Pi/Dockerfile`:
   - aktueller Compose-/Pi-Harness-Weg,
   - `node:22-slim`,
   - Python-/Build-Werkzeuge,
   - globaler Pi Coding Agent,
   - Benutzer `piuser`.
2. `/workspace/.devcontainer/Dockerfile`:
   - ältere beziehungsweise alternative VS-Code-Devcontainer-Konfiguration,
   - Chrome, Xvfb, Fluxbox, x11vnc und noVNC.

Ein zukünftiges LLM darf diese beiden Wege nicht vermischen. Der bestätigte Windows-Desktop-Start verwendet `Nodges_Pi/docker-compose.yml` und `Nodges_Pi/Dockerfile`.

## 10. Nützliche Befehle nach Ausführungsort

### 10.1 Windows-PowerShell: nur auf dem Host ausführen

```powershell
curl.exe -i --max-time 5 http://localhost:8000/health
curl.exe -i --max-time 5 http://localhost:8000/databases
curl.exe -I --max-time 5 http://localhost:5173

Get-NetTCPConnection -State Listen |
    Sort-Object LocalPort |
    Select-Object LocalAddress,LocalPort,OwningProcess

docker ps --filter "name=pi-harness"
docker logs pi-harness --tail 100
docker port pi-harness
```

Einen Host-Prozess über einen Port beenden:

```powershell
$processId = (Get-NetTCPConnection -LocalPort 8000 -State Listen).OwningProcess
Stop-Process -Id $processId -Force
```

Für Port 5173 nicht einfach den Node-Prozess töten, wenn der Container weiterlaufen soll. Besser Compose verwenden:

```powershell
cd "C:\Users\ich\Desktop\code\_projects\Nodges_Pi"
docker compose stop
docker compose down
```

LightRAG wird im eigenen Konsolenfenster mit `Ctrl+C` beendet oder über den Prozess auf Port 8000 gestoppt.

### 10.2 Container: innerhalb des Pi-Terminals

```bash
cd /workspace
pwd
node --version
npm --version
npm run build
curl -i --max-time 5 http://host.docker.internal:8000/health
```

Der Container besitzt laut Projektregeln kein `ps`, `pgrep`, `pkill`, `ss` oder `docker`. Prozesse bei Bedarf über `/proc` untersuchen:

```bash
for p in /proc/[0-9]*; do
  cmdline=$(tr '\0' ' ' < "$p/cmdline" 2>/dev/null)
  case "$cmdline" in
    *vite*|*python*main.py*) echo "${p##*/}: $cmdline" ;;
  esac
done
```

### 10.3 WSL-Shell

WSL ist nicht dasselbe wie der Docker-Container. `host.docker.internal` ist vor allem für Docker vorgesehen. Ein Fehlschlag des Namens im WSL-Terminal sagt nicht automatisch etwas über den Containerzugriff aus.

## 11. Git- und Änderungsworkflow

Der überprüfte Git-Arbeitsbaum ist:

```text
/workspace
Branch: pi
Remote-Zweig: origin/pi
```

Beim letzten Audit gab es bereits zahlreiche bestehende Änderungen und untracked Dateien. Deshalb gilt für jede zukünftige Sitzung:

1. `git status --short --branch` ausführen.
2. Vorhandene Änderungen als Bestand markieren, nicht ungefragt bereinigen.
3. Erst die relevante Datei und die Dokumentation lesen.
4. Änderungen möglichst klein und gezielt vornehmen.
5. Nach Änderungen `npm run build` und die passenden Tests ausführen.
6. Erst nach Prüfung committen und gegebenenfalls nach GitHub pushen.
7. Den Windows-Desktop-Stand und den WSL-/Git-Stand nicht gleichzeitig unkoordiniert verändern.

GitHub ist der gemeinsame Versionsstand, aber keine Laufzeitumgebung. Virtuelle Umgebungen (`venv`) und `node_modules` werden nicht zwischen Windows und Linux wiederverwendet.

## 12. Aktueller verifizierter Status

| Prüfung | Ergebnis |
|---|---|
| Dev Container geöffnet | Ja, Containername `pi-harness`, Benutzer `piuser` |
| Container-Projektpfad | `/workspace` |
| Node/npm | `v22.23.2` / `10.9.8` |
| Host-LightRAG `/health` | vom Benutzer mit HTTP 200 bestätigt |
| Container -> Windows-LightRAG | HTTP 200 über `host.docker.internal:8000` bestätigt |
| `lightrag_engine_active` | `true` bestätigt |
| Vite/Nodges | nach Neustart unter `localhost:5173` bestätigt |
| TypeScript/Vite-Build | erfolgreich, 259 Module, 23.53 s |
| Native LightRAG-UI | `/docs` und `/redoc`, keine eigene separate UI |
| Gemeinsamer Datenbankpfad | beabsichtigt und im Referenzskript gesetzt; nach jeder Synchronisierung auf Windows verifizieren |
| Desktop-Skriptstand | `/workspace/start_pi_container.cmd` ist aktuell erneut eingelesene Referenzkopie; die ausführbare Desktop-Datei bleibt aus dem Container nicht verifizierbar |

## 13. Offene Risiken und nächste Stabilisierungsthemen

Diese Punkte sind keine neuen Features, sondern bereits erkannte Setup-Risiken:

1. **Desktop-Skript synchronisieren:** Die aktuelle Kopie `/workspace/start_pi_container.cmd` ersetzt die zuvor veraltete Dokumentationsgrundlage. Der Benutzer muss diese Fassung bei Bedarf selbst auf die echte Desktop-Datei übertragen. Danach sollte die Container-Kopie wieder entfernt werden.
2. **LightRAG-Pfade vereinheitlichen:** `WORKING_DIR` und die Datenbank-Endpunkte müssen denselben absoluten Basisordner verwenden.
3. **Nur eine LightRAG-Instanz:** Niemals gleichzeitig Windows-LightRAG und `.devcontainer/start-lightrag.sh` starten.
4. **Zwei Docker-Konfigurationen nicht vermischen:** Compose-Container und ältere `.devcontainer`-VNC-Konfiguration können unterschiedliche Ports und Startbefehle haben.
5. **Vite-Bereitschaft:** Compose hat keinen eigenen Healthcheck für Port 5173. Nach `docker compose up -d` kann `npm install` noch laufen; erst danach ist Vite erreichbar.
6. **Relative Datenpfade:** Starten aus einem anderen Arbeitsverzeichnis kann eine leere zweite `rag_storage` erzeugen.
7. **Geheimnisse:** Werte in `.env` bleiben lokal; sie dürfen weder in Git noch in Dokumente, Logs oder Bundles gelangen.
8. **VS-Code-Server-Cache:** Der erste Remote-Start kann wegen eines rund 189 MB großen Downloads lange dauern. Das ist vom LightRAG- und Vite-Start getrennt.

## 14. Entscheidungsregel für zukünftige LLMs

Wenn eine neue Aufgabe gestellt wird:

1. Zuerst feststellen, ob sie Windows-Host, WSL, Container, Vite oder LightRAG betrifft.
2. Bei Host-Aufgaben nur Anweisungen für den Benutzer formulieren; keine Windows-Dateien aus dem Container heraus als gelesen behaupten.
3. Bei LightRAG zuerst prüfen, ob `host.docker.internal:8000/health` erreichbar ist. Keine zweite Instanz starten.
4. Bei Vite zuerst prüfen, ob der Compose-Server bereits auf 5173 läuft. Nicht blind `npm run dev` ein zweites Mal starten.
5. Bei Datenbanken den von `/databases` gemeldeten absoluten Pfad kontrollieren.
6. Vor Codeänderungen Git-Status und bestehende Änderungen sichern.
7. Nach Änderungen Build, relevante Tests und die tatsächlichen Laufzeit-Endpunkte prüfen.
8. Änderungen am Setup dokumentieren, insbesondere wenn sie nur auf die Windows-Desktop-Datei übertragen werden müssen.

Weiterführend:

- `docs/setup-probleme-erkenntnisse.md` – chronologischer Sitzungs- und Problembericht
- `docs/setup-arbeitsuebergabe.md` – kurze Checkliste für `/new` und den nächsten Arbeitsbeginn
