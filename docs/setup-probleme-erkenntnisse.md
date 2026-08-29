# Setup-Probleme, Erkenntnisse und Sitzungsprotokoll

**Korrekturstand:** Die Datei `/workspace/start_pi_container.cmd` wurde am 18.08.2026 durch den Benutzer durch eine neuere Kopie ersetzt. Frühere Aussagen, die diese Datei als veraltet oder nur als alten Skriptstand behandeln, sind mit diesem Dokumentstand überholt.

Dieses Dokument sammelt die für den laufenden Nodges-/Pi-Betrieb wichtigen Probleme und deren Auflösung aus den bisherigen Pi-Sitzungen. Es ist als historischer Kontext gedacht. Bei Widersprüchen gilt der aktuelle Laufzeitnachweis und anschließend `docs/setup-llm-orientierung.md`, nicht eine alte Antwort aus einer Sitzung.

## 1. Historischer Ausgangspunkt

Nodges wurde zunächst außerhalb dieses Pi-Containers unter Windows 11 mit einer anderen Entwicklungsumgebung bearbeitet. Danach wurde ein Pi Coding Agent in einem Docker-/WSL-Setup ergänzt. Der gemeinsame Quellcode liegt dauerhaft im WSL-Dateisystem und wird in den Container gemountet.

Dadurch existieren mehrere Ebenen:

```text
Windows 11 / PowerShell
  ├── Desktop-Startskript
  ├── Windows-Python-LightRAG
  └── Docker Desktop
        └── Linux-Container
              └── /workspace -> WSL-Repository

WSL2
  ├── dauerhaftes Nodges-Repository
  └── dauerhaftes Pi-Konfigurationsverzeichnis
```

Die wichtigste allgemeine Erkenntnis war: Windows-Pfade, WSL-Pfade und Linux-Containerpfade sind nicht austauschbar. Eine Datei mit gleichem Namen kann in mehreren Kopien existieren und muss anhand ihres Ortes und ihrer Rolle eingeordnet werden.

## 2. Chronologischer Problembericht

### 2.1 12.08.2026: erster Zugriff auf den Entwicklungsserver

Am Anfang wurde versucht, Nodges über `http://localhost:3000/` zu erreichen. Dieser Port war nicht der aktuelle Vite-Port. Später wurde geklärt, dass der relevante Vite-Port `5173` ist.

Erkenntnisse:

- Vor einer Diagnose immer prüfen, welcher Prozess und welcher Port tatsächlich läuft.
- Eine Browsermeldung auf einem falschen Port ist kein Beweis für einen Containerfehler.
- Der Dev-Server muss auf einer vom Host erreichbaren Adresse lauschen, typischerweise `0.0.0.0` im Container.

### 2.2 13.08.2026: Vite, Containerstart und persistente Pi-Daten

Es wurde bestätigt, dass Vite beim Start des Containers automatisch auf Port 5173 läuft. Ein manueller zweiter Start auf demselben Port führt zu einem Portkonflikt. Port 5174 ist nur ein optionaler zweiter manueller Server.

Gleichzeitig wurde die Persistenz des Pi-Setups untersucht:

- `/workspace` ist das feste Mount-Ziel des Projekts im Container.
- Der Container ist nicht der dauerhafte Speicherort des Projekts.
- `/home/.pi` wurde als globaler, persistenter Pi-Speicher festgelegt.
- Die Containerdatei `AGENTS.md` allein wäre bei einem Container-Recreate nicht zuverlässig persistent.
- Anweisungen und Sitzungswissen müssen in gemounteten Dateien beziehungsweise im persistenten Pi-Speicher liegen.

Weitere praktische Erkenntnis: Im verwendeten Container fehlen einige übliche Prozesswerkzeuge (`ps`, `pgrep`, `pkill`, `ss`, `docker`). Prozessdiagnose muss dort über `/proc` erfolgen. Docker-Operationen gehören auf den Host, nicht ins Container-Terminal.

### 2.3 13./14.08.2026: VNC, Chrome CDP und Pi-Sitzungen

Die ältere `.devcontainer`-Konfiguration enthält Chrome, Xvfb, Fluxbox, x11vnc, noVNC und Chrome Remote Debugging:

- `6080`: noVNC-Webzugriff
- `9222`: Chrome-CDP

Ein Zugriff auf `localhost:6080` schlug zeitweise fehl. Daraus wurde gelernt, dass diese Ports zur optionalen VNC-Konfiguration gehören und nicht automatisch beweisen, dass der Compose-Pi-Container korrekt läuft. Die aktuelle Compose-Startkette verwendet primär Port 5173 und den separaten Windows-LightRAG-Port 8000.

Die Pi-Sitzungsbefehle (`/resume`, `/new`, `/clone`, `/list`, `/sessions`, `/tree`) wurden ebenfalls untersucht. Für einen Wechsel des Kontextfensters ist ein bewusst vorbereiteter Übergabeordner mit Projektregeln, Setup-Dokumentation und Status besser als die Annahme, dass alle alten Sitzungen automatisch geladen werden.

### 2.4 14.08.2026: Plan-104-Workflow und Plattformwechsel

Im Zusammenhang mit der späteren Plan-/Vision-104-Arbeit wurde ein sauberer Workflow diskutiert:

1. neue Sitzung beginnen,
2. Projektregeln und Übergabedokumentation lesen,
3. Repository-Audit durchführen,
4. Plan anhand des tatsächlichen Zustands konkretisieren,
5. begrenzten Scope bestätigen,
6. Datenvertrag und Dateiliste festlegen,
7. in kleinen Meilensteinen implementieren,
8. Build und Tests ausführen,
9. Abnahmekriterien prüfen,
10. erst danach den nächsten Meilenstein beginnen.

Die Setup-relevante Erkenntnis war, dass ein LLM Pläne und den realen Arbeitsbaum nicht verwechseln darf. Vorhandene Änderungen können aus früheren Sitzungen stammen. Ein `git reset` oder pauschales Zurücksetzen ist deshalb ohne ausdrückliche Freigabe verboten.

Beim Wechsel zwischen Windows/Antigravity, GitHub, WSL und Pi wurden folgende Risiken festgehalten:

- Windows-Python-venv und Linux-venv sind nicht gemeinsam verwendbar.
- `Scripts\\python.exe` ist Windows-spezifisch.
- `venv/bin/python` ist Linux-/WSL-spezifisch.
- Pfadtrenner und Arbeitsverzeichnisse beeinflussen relative Datenpfade.
- `node_modules` und Python-venvs sollten je Plattform neu installiert werden.
- GitHub synchronisiert Dateien, aber keine laufenden Prozesse, virtuellen Umgebungen oder lokalen Datenbanken.
- Nicht gleichzeitig dieselben Dateien in Windows und im Container ändern, ohne zu committen beziehungsweise den Stand zu synchronisieren.
- `.gitattributes` mit LF-Zeilenenden verhindert typische Shell-Probleme durch Windows-Zeilenenden.

### 2.5 14.–16.08.2026: LightRAG als einzige Windows-Instanz

Die zentrale Architekturentscheidung wurde getroffen:

> LightRAG läuft ausschließlich als lokaler Windows-Prozess. Der Container startet kein eigenes LightRAG. Der Container greift über `host.docker.internal:8000` auf Windows-LightRAG zu.

Der Grund ist die gemeinsame lokale Installation und Datenbank mit mehreren Datenbanken. Zwei gleichzeitig laufende LightRAG-Prozesse hätten Risiken:

- Port-8000-Konflikt,
- unterschiedliche Arbeitsverzeichnisse,
- konkurrierende Schreibzugriffe,
- unterschiedliche Caches und aktive Datenbanken,
- scheinbar leere oder voneinander abweichende Datenbanken.

Die ältere Datei `/workspace/.devcontainer/start-lightrag.sh` ist deshalb nicht Teil des bestätigten normalen Startpfads. Sie darf nicht zusätzlich zum Windows-Prozess ausgeführt werden.

### 2.6 16.08.–18.08.2026: Desktop-Startskript und aktuelle Setup-Kopie

Es wurde geklärt, dass der Benutzer Pi, Vite und LightRAG mit einer Datei auf dem Windows-Desktop startet. Das Script wird nicht aus dem Container gestartet.

Wichtig:

```text
Echte ausführbare Datei auf Windows:
C:\Users\ich\Desktop\code\_projects\Nodges_Pi\start_pi_container.cmd

Aktuelle, temporär bereitgestellte Referenzkopie im Container:
/workspace/start_pi_container.cmd
```

Die zuerst im Workspace vorhandene Kopie war veraltet. Der Benutzer hat sie anschließend durch die neuere Fassung ersetzt. Die aktuell eingelesene Referenzkopie enthält nun den vollständigen Ablauf mit:

- Docker-Desktop-Prüfung und Warteschleife,
- LightRAG-Pfaden `LIGHTRAG_DIR` und `LIGHTRAG_WORKING_DIR`,
- Health-Check vor dem Start,
- Start von LightRAG nur bei fehlender Erreichbarkeit,
- maximal ungefähr 60 Sekunden Wartezeit auf LightRAG,
- Fehlerprüfung nach `docker compose up -d`,
- anschließendem Start des Pi-Agenten.

Die Kopie wurde nur in den Workspace gebracht, damit das LLM sie lesen und dokumentieren kann. Änderungen an `/workspace/start_pi_container.cmd` werden nicht automatisch auf Windows übernommen. Nach Abschluss der Dokumentation kann diese aktuelle Kopie gelöscht werden. Die Desktop-Datei bleibt die tatsächlich ausgeführte Quelle.

Die Compose-Dateien wurden ebenfalls in einem separaten Setup-Ordner entwickelt und temporär in den Workspace kopiert. Der Ordner `/workspace/Nodges_Pi` ist im aktuellen Container kein eigenständiges Git-Repository; Git fällt dort auf `/workspace` zurück. Diese Struktur darf nicht als Beweis für einen zweiten kanonischen Projektstand interpretiert werden.

### 2.7 16.–18.08.2026: LightRAG lokal auf Windows starten

LightRAG wird auf Windows unabhängig von der Nodges-Webseite gestartet. Der direkte Python-Aufruf ist:

```powershell
cd "C:\Users\ich\Desktop\code\_projects\Nodges\lightrag-backend"
.\venv\Scripts\python.exe main.py
```

Alternativ kann ein Windows-`npm run lightrag` verwendet werden, sofern das Windows-Projekt-`package.json` den Windows-kompatiblen Befehl enthält. Der im aktiven Linux-Projekt vorhandene Eintrag

```json
"lightrag": "cd lightrag-backend && ./venv/bin/python main.py"
```

ist nur für Linux/WSL geeignet und nicht als Windows-Befehl zu behandeln.

Beim manuellen Start wurde zunächst eine neue leere Datenbank unter

```text
...\Nodges\lightrag-backend\rag_storage
```

angelegt. Ursache war der relative Pfad `./rag_storage` in Verbindung mit dem aktuellen Arbeitsverzeichnis. Die gewünschte gemeinsame Datenbank ist dagegen:

```text
...\Nodges\rag_storage
```

Deshalb wurde im Startskript `LIGHTRAG_WORKING_DIR` explizit gesetzt.

### 2.8 18.08.2026: VS-Code-Dev-Container-Download

Beim Öffnen des Dev Containers dauerte der Download des VS-Code-Servers lange. Der relevante Prozess war der Download einer rund 189 MB großen Datei für den VS-Code-Commit `5264f2156cbcd7aea5fd004d29eaa10209155d66`.

PowerShell konnte die URL mit `curl.exe -I -L` und `Invoke-WebRequest -Method Head` erreichen. Der tatsächliche Download dauerte dennoch ungefähr 9,5 Minuten. Danach wurde der Server erfolgreich installiert und gestartet.

Beweis aus dem Log:

```text
Installing VS Code Server for commit ...
Server bound to 127.0.0.1:39833
Extension host agent started.
```

Das war kein LightRAG- oder Vite-Fehler. Es war eine einmalige Remote-Initialisierung beziehungsweise Cache-/Netzwerkverzögerung.

### 2.9 18.08.2026: erfolgreicher Container- und Backend-Test

Im Container wurden bestätigt:

```text
pwd             /home/piuser
node            v22.23.2
npm             10.9.8
```

Nach Wechsel nach `/workspace` konnte der Container das Windows-Backend erreichen:

```bash
curl -i --max-time 5 http://host.docker.internal:8000/health
```

Ergebnis: HTTP 200 mit

```json
{
  "status": "online",
  "service": "LightRAG Local API",
  "lightrag_engine_active": true,
  "version": "0.102.12"
}
```

Damit waren Docker-Netzwerk, Host-LightRAG und die Vite-Proxy-Voraussetzung bestätigt.

### 2.10 18.08.2026: erfolgreicher Nodges-Build

Im Container wurde aus `/workspace` ausgeführt:

```bash
npm run build
```

Der Befehl führte `tsc && vite build` aus und endete erfolgreich:

```text
✓ 259 modules transformed.
✓ built in 23.53s
```

Die Meldung zu Chunks über 500 kB war nur eine Vite-Warnung. Sie war kein Buildfehler und wurde nicht als Setupproblem behandelt.

### 2.11 18.08.2026: LightRAG-Health, Swagger und Prozessdiagnose

Nach erfolgreichem Start waren verfügbar:

```text
http://localhost:8000/health
http://localhost:8000/docs
http://localhost:8000/redoc
http://localhost:8000/databases
```

`/docs` ist die native Swagger-Oberfläche der eigenen FastAPI-API. Eine separate LightRAG-Fachoberfläche existiert in diesem Setup nicht.

Zeitweise war Port 8000 nach einem Neustart nicht erreichbar. Der direkte Start mit

```powershell
.\venv\Scripts\python.exe main.py
```

zeigte, dass das venv funktionierte und Uvicorn korrekt auf `0.0.0.0:8000` lauschte. Die Ausgabe enthielt nur eine nicht blockierende FastAPI-Deprecation-Warnung zu `on_event`.

Für die Anzeige und Beendigung lokaler Dienste wurden zwei Wege festgehalten:

```powershell
Get-NetTCPConnection -State Listen |
    Sort-Object LocalPort |
    Select-Object LocalAddress,LocalPort,OwningProcess
```

und

```powershell
netstat -ano | findstr LISTENING
```

LightRAG kann im eigenen Konsolenfenster mit `Ctrl+C` beendet werden. Der Compose-Container soll sauber mit `docker compose stop` oder `docker compose down` beendet werden.

### 2.12 18.08.2026: Missverständnis zum Status von Nodges

Die Aussage „LightRAG startet, jedoch ging Nodges auf 5173 nicht offline“ wurde zunächst fälschlich als Ausfallmeldung interpretiert. Der Benutzer stellte klar, dass Nodges auf Port 5173 weiterhin erreichbar war.

Lehre für zukünftige Sitzungen: Bei mehrdeutlichen Statusformulierungen nicht sofort Diagnosemaßnahmen starten, sondern den letzten Satz wörtlich prüfen oder kurz nachfragen. Insbesondere darf nicht aus einer Erwähnung von „nicht offline“ ein Ausfall abgeleitet werden.

## 3. Aktuelle Lösungen

### Gelöst beziehungsweise bestätigt

- Vite-Port ist `5173`, nicht `3000`.
- Vite startet im Compose-Container automatisch.
- Ein zweiter Vite-Start ist im Normalfall nicht nötig.
- Node und npm sind im Container verfügbar.
- Pi-Agent ist im Container installiert und startbar.
- LightRAG läuft nur auf Windows.
- Containerzugriff auf Windows-LightRAG über `host.docker.internal:8000` funktioniert.
- `/health` meldet `lightrag_engine_active: true`.
- Swagger ist unter `/docs` erreichbar.
- Production-Build läuft erfolgreich.
- Windows-Startskript prüft LightRAG vor dem Compose-Start und wartet auf `/health`.
- Gemeinsamer LightRAG-Datenpfad wird im Referenzskript explizit gesetzt.
- `.env`, `.env.local` und Python-venvs sind per `.gitignore` ausgeschlossen.

### Noch nicht endgültig erledigt

- Die aktuelle Referenzkopie `/workspace/start_pi_container.cmd` entspricht dem zuletzt vom Benutzer bereitgestellten neueren Stand; die echte Desktop-Datei bleibt außerhalb des Containers und muss bei Änderungen manuell synchronisiert werden.
- Die aktuelle temporäre Kopie `/workspace/start_pi_container.cmd` soll nach Abschluss der Dokumentation entfernt werden.
- `main.py` verwendet in den Datenbankverwaltungs-Endpunkten teilweise weiterhin relative `./rag_storage`-Pfade. Das kann trotz `LIGHTRAG_WORKING_DIR` zu inkonsistenten Pfaden führen.
- Die verschiedenen Docker-/Devcontainer-Konfigurationen müssen bei zukünftigen Änderungen eindeutig getrennt bleiben.
- Ein nachträglicher Windows-Laufzeittest kann aus dem Container nicht ersetzt werden.

## 4. Was ein LLM bei einer neuen Sitzung zuerst tun muss

```text
1. /workspace/AGENTS.md lesen.
2. docs/setup-llm-orientierung.md lesen.
3. docs/setup-arbeitsuebergabe.md lesen.
4. git status --short --branch ausführen.
5. `/workspace/start_pi_container.cmd` als aktuelle, vom Benutzer bereitgestellte Referenzkopie behandeln; ältere Kopien sind ungültig.
6. Nicht behaupten, die echte Desktop-Datei direkt gelesen zu haben.
7. Keine zweite LightRAG-Instanz starten.
8. Keine zweite Vite-Instanz auf Port 5173 starten.
9. Vor Codeänderungen relevante Dateien und vorhandene Änderungen prüfen.
10. Nach Änderungen Build, Tests und Laufzeitchecks durchführen.
```
