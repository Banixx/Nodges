# Nodges-Setup: Orientierungsdokumentation für zukünftige LLM-Sitzungen

**Dokumenttyp:** technische Setup- und Übergabedokumentation  
**Stand:** nach den Pi-Sitzungen bis 18.08.2026; aktualisiert nach Commit `2b3a97b`  

> **Nachtrag (Commit `2b3a97b`):** LightRAG läuft jetzt im Pi-Container auf Port
> 8000 (`.devcontainer/start-lightrag.sh`, aufgerufen aus
> `Nodges_Pi/docker-compose.yml`). Der Vite-Proxy zeigt standardmäßig auf
> `http://localhost:8000`. Der Windows-Backend-Betrieb ist optional und muss
> gestoppt sein. Details und Migrationsschritte: `resetup.md`.
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
4. `C:\Users\ich\Desktop\code\_projects\Nodges_Pi\start_pi_container.cmd` ist die echte Windows-Startdatei. Die Datei `/workspace/start_pi_container.cmd` ist der Snapshot im Git-Repo. Wichtig: Die **kanonische Compose-Datei** liegt auf Windows, nicht in `/workspace/Nodges_Pi` (siehe `resetup.md`).
5. Der aktuelle Betrieb besteht aus genau einer LightRAG-Instanz, die **im Pi-Container** läuft. Der Windows-Prozess ist gestoppt.
6. LightRAG läuft im Container auf Port `8000` und wird von `.devcontainer/start-lightrag.sh` gestartet. Intern greift der Vite-Proxy auf `http://localhost:8000` zu.
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
├── http://localhost:8000/docs   -> LightRAG-Swagger-Oberfläche im Container
└── http://localhost:6080        -> optionaler noVNC-Weg der älteren Devcontainer-Konfiguration

Vite im Container
└── /lightrag-api/*
    └── Proxy zu http://localhost:8000/*  (LightRAG-Backend im Container)
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

Der Ordner ist inzwischen Teil des Git-Repos. Entscheidend bleibt: Docker verwendet NICHT diese Kopie, sondern die Windows-Datei. Änderungen an `/workspace/Nodges_Pi/docker-compose.yml` müssen nach Windows kopiert und der Container neu erstellt werden (siehe `resetup.md`).

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
| `lightrag-backend/rag_storage` (Container) | eigentliche LightRAG-Datenbank | persistent im WSL-Repo-Mount, per `.gitignore` ausgeschlossen |
| Windows-`rag_storage` | frühere LightRAG-Datenbank | nur noch Altbestand, nicht mehr im Normalbetrieb |

Wichtig: Ein Container-Recreate ist nicht dasselbe wie ein normaler Container-Neustart. Alles, was nicht gemountet oder auf dem Host gespeichert ist, darf bei einem Recreate als verloren betrachtet werden.

## 5. Tatsächlicher Startablauf

### 5.1 Start von Windows aus

Der Benutzer startet die echte Desktop-Datei in PowerShell oder per Doppelklick:

```text
C:\Users\ich\Desktop\code\_projects\Nodges_Pi\start_pi_container.cmd
```

Stand nach Commit `2b3a97b`: Das Windows-Skript startet LightRAG nicht mehr selbst. Der aktuelle Ablauf ist:

1. `docker info` prüfen.
2. Docker Desktop bei Bedarf starten und bis zur Bereitschaft warten.
3. In `Nodges_Pi` wechseln.
4. `docker compose up -d` ausführen (startet `npm install`, `.devcontainer/start-lightrag.sh` und Vite).
5. Optional auf den Health-Check im Container warten: `docker compose exec pi-agent curl -s localhost:8000/health`.
6. Mit `docker compose exec -it pi-agent pi` den Agenten öffnen.

Der folgende eingebettete Skriptauszug ist der **frühere** Stand (LightRAG-Start auf Windows) und nur noch historisch:

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

### 5.1.1 Bewertung des früheren Startskripts (historisch)

Der frühere Ablauf erfüllte die damalige Grundarchitektur:

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
    command: >-
      sh -c '...; npm install;
      bash /workspace/.devcontainer/start-lightrag.sh > /tmp/lightrag-start.log 2>&1 &
      exec npm run dev'
    ports:
      - "5173:5173"
```

Damit startet Compose neben der Node-/Vite-Seite auch das LightRAG-Backend im Container. `start-lightrag.sh` ist idempotent und wartet nur so lange, bis `/health` antwortet. Der Pi-Agent wird anschließend separat mit `docker compose exec` geöffnet. Die kanonische Compose-Datei liegt auf Windows unter `C:\Users\ich\Desktop\code\_projects\Nodges_Pi\docker-compose.yml`; der Ordner `/workspace/Nodges_Pi` ist der Git-Snapshot und muss nach Windows kopiert werden.

### 5.3 LightRAG im Container

`.devcontainer/start-lightrag.sh` ist jetzt der normale Startpfad und wird von `Nodges_Pi/docker-compose.yml` aufgerufen. Wichtig:

- Es darf keine parallele Windows-Instanz auf Port 8000 laufen.
- `host.docker.internal:8000` zeigt weiterhin auf einen etwaigen Windows-Prozess; der Container-Betrieb läuft über `localhost:8000`.
- Das Skript ist idempotent (Health-Check vorab) und legt bei Bedarf das Python-venv neu an.
- Logs: `/tmp/lightrag-start.log` (Compose-Start) und `/tmp/lightrag.log` (Backend).

## 6. Netzwerk und URLs

### 6.1 Endpunkte

| URL | Zweck | Wo prüfen? |
|---|---|---|
| `http://localhost:5173` | Nodges/Vite im Browser | Windows-Browser oder Host-PowerShell |
| `http://localhost:8000/health` | LightRAG-Gesundheitsstatus | Container: `docker compose exec pi-agent curl -s localhost:8000/health` |
| `http://localhost:8000/docs` | Swagger UI der FastAPI-API | Container (`docker compose exec ...`) oder nur bei veröffentlichtem Port im Windows-Browser |
| `http://localhost:8000/redoc` | alternative API-Dokumentation | Container oder nur bei veröffentlichtem Port im Windows-Browser |
| `http://localhost:8000/databases` | Datenbankliste | Container: `docker compose exec pi-agent curl -s localhost:8000/databases` |
| `http://localhost:6080/vnc.html` | optionales noVNC | nur bei aktivierter alter VNC-Konfiguration |
| `http://localhost:9222` | optionales Chrome-CDP | nur bei aktivierter alter VNC-Konfiguration |

### 6.2 LightRAG-Proxy

In `/workspace/vite.config.ts` ist der Proxy standardmäßig so konfiguriert:

```text
/lightrag-api/*  ->  http://localhost:8000/*   (LightRAG im Container)
```

Der Browser ruft Nodges auf Port 5173 auf. Nodges verwendet den Vite-Pfad `/lightrag-api`; Vite leitet diesen im Container an das Backend weiter. Für eine externe Instanz lässt sich das Ziel mit `VITE_LIGHTRAG_PROXY_TARGET` überschreiben, zum Beispiel auf `http://host.docker.internal:8000`.

`host.docker.internal` ist ein Docker-Sondername und zeigt auf den Docker-Host, nicht auf den Container. Er ist nur noch für den optionalen externen Windows-Betrieb relevant.

### 6.3 Verifizierter Health-Status

Der frühere Windows-Host-Status (historisch) war `version 0.102.12`. Aktueller Containerstand:

```bash
curl -i --max-time 5 http://localhost:8000/health
```

liefert `version 0.105.1` und:

```json
{
  "status": "online",
  "service": "LightRAG Local API",
  "lightrag_engine_active": true,
  "version": "0.105.1",
  "storage_root": "/workspace/lightrag-backend/rag_storage"
}
```

`lightrag_engine_active: true` bedeutet, dass der echte LightRAG-Enginepfad aktiv ist, nicht nur der Mock-Fallback. Eine Retrieval-Query lieferte zusätzlich `mock: false`.

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
| `LIGHTRAG_WORKING_DIR` | absoluter LightRAG-Datenpfad; Fallback `lightrag-backend/rag_storage` | Container-Start/Compose |
| `VITE_LIGHTRAG_PROXY_TARGET` | Vite-Proxyziel; Standard `http://localhost:8000` | Vite-Umgebung |
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
curl -i --max-time 5 http://localhost:8000/health
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
| Früheres Host-LightRAG `/health` | historisch, HTTP 200 mit `0.102.12` bestätigt |
| Container-LightRAG `/health` | HTTP 200, `version 0.105.1`, `storage_root=/workspace/lightrag-backend/rag_storage` |
| `lightrag_engine_active` | `true` bestätigt; Retrieval-Query `mock: false` |
| Vite/Nodges | nach Neustart unter `localhost:5173` bestätigt |
| TypeScript/Vite-Build | erfolgreich, 259 Module, 23.53 s |
| Native LightRAG-UI | `/docs` und `/redoc`, keine eigene separate UI |
| LightRAG-Datenbankpfad | `lightrag-backend/rag_storage` (Container), per `.gitignore` ausgeschlossen |
| Compose-Quelle | kanonisch auf Windows (`...\_projects\Nodges_Pi\docker-compose.yml`); `/workspace/Nodges_Pi` ist Snapshot |
| Desktop-Skriptstand | `/workspace/start_pi_container.cmd` ist Snapshot; die ausführbare Desktop-Datei bleibt aus dem Container nicht verifizierbar |

## 13. Offene Risiken und nächste Stabilisierungsthemen

Diese Punkte sind keine neuen Features, sondern bereits erkannte Setup-Risiken:

1. **Desktop-Skript und Compose synchronisieren:** Änderungen an `/workspace/Nodges_Pi/docker-compose.yml` und `start_pi_container.cmd` müssen nach `C:\Users\ich\Desktop\code\_projects\Nodges_Pi` kopiert werden (siehe `resetup.md`).
2. **LightRAG-Pfade:** erledigt in Commit `2b3a97b`; alle Pfade werden zentral aus `LIGHTRAG_WORKING_DIR` abgeleitet.
3. **Nur eine LightRAG-Instanz:** Der Container ist jetzt der reguläre Betrieb. Ein noch laufender Windows-Prozess auf Port 8000 muss gestoppt werden.
4. **Zwei Docker-Konfigurationen nicht vermischen:** Compose-Container und ältere `.devcontainer`-VNC-Konfiguration können unterschiedliche Ports und Startbefehle haben.
5. **Vite-Bereitschaft:** Compose hat keinen eigenen Healthcheck für Port 5173. Nach `docker compose up -d` kann `npm install` noch laufen; erst danach ist Vite erreichbar.
6. **Relative Datenpfade:** erledigt in Commit `2b3a97b`; es gibt keinen relativen Pfad mehr, der eine leere zweite `rag_storage` erzeugt.
7. **Geheimnisse:** Werte in `.env` bleiben lokal; sie dürfen weder in Git noch in Dokumente, Logs oder Bundles gelangen.
8. **VS-Code-Server-Cache:** Der erste Remote-Start kann wegen eines rund 189 MB großen Downloads lange dauern. Das ist vom LightRAG- und Vite-Start getrennt.

## 14. Entscheidungsregel für zukünftige LLMs

Wenn eine neue Aufgabe gestellt wird:

1. Zuerst feststellen, ob sie Windows-Host, WSL, Container, Vite oder LightRAG betrifft.
2. Bei Host-Aufgaben nur Anweisungen für den Benutzer formulieren; keine Windows-Dateien aus dem Container heraus als gelesen behaupten.
3. Bei LightRAG zuerst prüfen, ob `localhost:8000/health` erreichbar ist (Container-Instanz). Keine zweite Instanz starten.
4. Bei Vite zuerst prüfen, ob der Compose-Server bereits auf 5173 läuft. Nicht blind `npm run dev` ein zweites Mal starten.
5. Bei Datenbanken den von `/databases` gemeldeten absoluten Pfad kontrollieren.
6. Vor Codeänderungen Git-Status und bestehende Änderungen sichern.
7. Nach Änderungen Build, relevante Tests und die tatsächlichen Laufzeit-Endpunkte prüfen.
8. Änderungen am Setup dokumentieren, insbesondere wenn sie nur auf die Windows-Desktop-Datei übertragen werden müssen.

Weiterführend:

- `docs/setup-probleme-erkenntnisse.md` – chronologischer Sitzungs- und Problembericht
- `docs/setup-arbeitsuebergabe.md` – kurze Checkliste für `/new` und den nächsten Arbeitsbeginn
