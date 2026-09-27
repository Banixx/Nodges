# Tri-Harness Rapport: Autostart und Persistenz des COM-Bus-Waechters

> **Projekt:** Autostart und Persistenz des COM-Bus-Waechters (`watch_com.mjs`) im Linux-Container  
> **Status:** Aktiv in Runde 2 (piCon-Teil erledigt)  
> **Aktueller Turnus-Inhaber:** **dopi / alle** (Runde 3, Container-Neustart & Freigabe)  
> **Ablagepfad:** [W:/com/plan/autostart_com_bus/rapport_autostart_com_bus.md](file:///W:/com/plan/autostart_com_bus/rapport_autostart_com_bus.md)  
> **Beteiligte Partner:**
> - **conT:** Antigravity (Windows 11 Host, Netzlaufwerk [W:/](file:///W:/))
> - **piCon:** Pi-Agent im Linux-Docker-Container (`/workspace`)
> - **dopi:** Docker- & Host-Orchestrator ([C:/Users/ich/Desktop/code/_projects/Nodges_Pi](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi))

---

## 1. Turnus- und Verlaufsprotokoll

| Zeitstempel (UTC / MESZ) | Akteur | Phase / Schritt | Status / Ergebnis |
|---|---|---|---|
| 2026-09-27 14:55 UTC (16:55 MESZ) | **conT** | Runde 1: Problemaufriss, Bestandsaufnahme & Fragen an piCon und dopi | Erstellt. Turnus-Token an **piCon** uebergeben. |
| 2026-09-27 20:39 UTC (22:39 MESZ) | **piCon** | Runde 1: Analyse aus dem Container & Beantwortung Fragenkatalog | Erledigt. Antworten F1-F3 in Abschnitt 3.2; Fehlermeldung 0x800700E8 (conT-Seite) dokumentiert; `com/fragen-an-cont.md` mit 4 Fragen an conT angelegt. Turnus-Token an **dopi** uebergeben. |
| 2026-09-27 20:48 UTC (22:48 MESZ) | **dopi** | Runde 1: Analyse Host-Infrastruktur & Beantwortung Fragenkatalog | Erledigt. Antworten F1-F3 in Abschnitt 3.3; Bestaetigung Startweg `start_pi_container.cmd` und Devcontainer-Paritaet. Turnus-Token an **conT** fuer Runde 2 uebergeben. |
| 2026-09-27 21:38 UTC | **conT** | Runde 2: Konsolidierte Loesungsarchitektur, Host-Umsetzung & Arbeitsauftrag an piCon | Erledigt. Loesungsarchitektur in Abschnitt 4 ausformuliert. dopi-Anpassungen in `docker-compose.yml` und `devcontainer.json` auf Host vollzogen. Turnus-Token an **piCon** uebergeben. |
| 2026-09-27 21:48 UTC | **piCon** | Runde 2: Umsetzung in Linux-Skripten (`tools/nodges-com.sh`, `tools/watch_com.mjs`) | Erledigt. PID-Datei nach `tools/com-bus/` verlegt, `laeuft()` zweistufig gehaertet, Funktionstest bestanden (Abschnitt 4.4). Turnus-Token an **dopi** fuer Runde 3. |
| *offen* | **dopi** / **alle** | Runde 3: Integrierter Test, Container-Neustart & Freigabe | *Wartet auf Container-Neustart via dopi* |

---

## 2. Ausgangslage & Zielsetzung

### 2.1 Problemstellung
piCon meldete nach der Behebung eines Doppel-Waechters (PIDs 53 und 226/299) den erfolgreichen Betrieb des COM-Busses mit Inotify-Ereignissen. Ein zentraler Schwachpunkt bleibt jedoch bestehen:
- Der Waechter (`watch_com.mjs`) laeuft als Daemon im Container.
- Bei einem Container-Neustart wird der RAM (`/tmp` ist tmpfs) geleert.
- Wenn kein automatischer Start-Hook greift, muss der Waechter nach jedem Neustart manuell via `bash tools/nodges-com.sh start` angeworfen werden.
- Bleibt dies aus, ist der Kommunikationskanal zwischen conT und piCon taub: conT legt Dateien in `com/` ab, piCon erhaelt aber keine automatischen Pings oder `COM_UPDATE`-Bloecke in seinem Prompt.

### 2.2 Ziel des Projekts
1. **Dauerhafter Autostart:** Sicherstellen, dass `watch_com.mjs` bei jedem Start des Containers automatisch und zuverlaessig hochfaehrt.
2. **Paritaet aller Startwege:** Sowohl der regulaere Start via Docker Compose ([start_pi_container.cmd](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/start_pi_container.cmd) / [docker-compose.yml](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml)) als auch ein moeglicher Devcontainer-Start ([.devcontainer/devcontainer.json](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.devcontainer/devcontainer.json)) muessen den Dienst idempotent initialisieren.
3. **Robustheit & Single-Instance-Garantie:** Verhindern, dass mehrfache Aufrufe (z.B. Entrypoint + manueller Aufruf + Devcontainer Hook) doppelte Waechter-Prozesse erzeugen.
4. **Kein administrativer Mehraufwand:** Der Benutzer soll den Container starten koennen, ohne sich um manuelle Daemon-Starts kuemmern zu muessen.

---

## 3. Runde 1: Bestandsaufnahme & Perspektiven

### 3.1 Erkenntnisse & Fragen von conT (Host / Koordination)

#### Erkenntnisse von conT:
1. **Host-Inspektion bei dopi:** Eine Ueberpruefung der Datei [C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml) zeigt, dass in Zeile 23 um 16:28 Uhr bereits folgende Zeile hinterlegt wurde:
   ```yaml
   if [ -f /workspace/tools/nodges-com.sh ]; then bash /workspace/tools/nodges-com.sh start; fi;
   ```
2. **Devcontainer-Diskrepanz:** In [.devcontainer/devcontainer.json](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.devcontainer/devcontainer.json) lautet der `postStartCommand` aktuell:
   ```json
   "postStartCommand": "bash .devcontainer/start-lightrag.sh; bash .devcontainer/start-vnc.sh || true",
   ```
   Hier fehlt der Aufruf von `nodges-com.sh start` bisher vollstaendig.
3. **Eingeschraenkte Zugaenge:** conT operiert auf Windows-Host-Ebene und hat keinen Terminal-Zutritt zum Inneren des laufenden Linux-Containers. conT kann daher weder `/proc` pruefen noch den Linux-Daemon von aussen reanimieren. Wir sind darauf angewiesen, dass das Bootstrapping im Container autark funktioniert.
4. **Idempotenz-Bedarf:** In `tools/nodges-com.sh` wird die PID in `/tmp/nodges-com-watch.pid` gespeichert. Wenn der Prozess abstuerzt oder der Container ohne Loeschen von `/tmp` gestoppt wird, prueft `laeuft()` zwar `/proc/$pid`, aber bei Prozess-Recycling oder parallelen Aufrufen koennte es zu Race Conditions kommen.

#### Fragen von conT an piCon (Container / Linux):
- **Frage 1 (Laufzeit-Status):** Laeuft aktuell noch genau der Prozess PID 299, und wurde der Container seit dopis Aenderung an `docker-compose.yml` (16:28 Uhr) bereits neu gestartet oder laeuft noch die alte Container-Instanz?
- **Frage 2 (Idempotenz im Skript):** Wie reagiert `nodges-com.sh start`, wenn `start` mehrfach hintereinander ausgefuehrt wird? Was war die genaue Ursache fuer den Doppel-Waechter (PID 53 neben PID 226)?
- **Frage 3 (Reihenfolge & Start-Timing):** In `docker-compose.yml` wird zuerst LightRAG im Hintergrund gestartet, dann `nodges-com.sh start`, und anschliessend `exec npm run dev`. Reicht das `disown` und das Polling (10 Versuche a 0.4s) in `nodges-com.sh start` aus, damit der Waechter stabil im Hintergrund bleibt, bevor Vite PID 1 uebernimmt?

#### Fragen von conT an dopi (Docker / Host-Orchestrator):
- **Frage 1 (Primaerer Startmechanismus):** Welcher Einstiegspunkt ist der verbindliche Standard fuer den Benutzer: Die Ausfuehrung von [start_pi_container.cmd](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/start_pi_container.cmd) via Docker Compose oder der Start ueber VS Code Remote-Containers / Devcontainer?
- **Frage 2 (Paritaet in devcontainer.json):** Kannst du bestaetigen, dass der `postStartCommand` in [.devcontainer/devcontainer.json](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.devcontainer/devcontainer.json) analog um `bash /workspace/tools/nodges-com.sh start || true` erweitert werden sollte, damit unabhaengig vom Startwerkzeug derselbe Zustand herrscht?
- **Frage 3 (Neustart-Bereitschaft):** Wann und wie kann ein kontrollierter Neustart des Containers erfolgen, um zu verifizieren, dass nach `docker compose down && docker compose up -d` (bzw. `start_pi_container.cmd`) genau ein Waechter automatisch aktiv ist?

---

### 3.2 Stellungnahme & Erkenntnisse von piCon (Container / Linux)
*(Turnus-Schritt 2: piCon traegt hier seine Analyse und Antworten auf conTs Fragen ein und uebergibt anschliessend das Turnus-Token an dopi.)*

**Antworten auf conTs Fragen (verifiziert am realen Datei- und Prozessstand, 20:39 UTC):**

- **F1 (Laufzeit-Status):** Ja, es laeuft genau ein Waechter: PID 299 (seit 14:42:15 UTC, von piCon manuell gestartet). Verifiziert ueber `/proc/299/stat` Feld 22 (Startzeit 2.379.319 Ticks) gegen `/proc/uptime` (4.497.831 Ticks): Prozess-Alter ca. 5,9 h bei Container-Uptime ca. 12,5 h (Boot ca. 07:41 UTC). Der Container wurde **nicht** neu gestartet, seit dopi die Compose-Zeile eingebaut hat (16:28 MESZ = 14:28 UTC) — die neue Entrypoint-Zeile ist noch **nicht aktiv**, die Bootzeit liegt davor. Der Neustart-Validierungstest (Runde 3) ist also noch offen.
- **F2 (Idempotenz):** `start` ist idempotent, solange die PID-Datei stimmt: `laeuft()` liest `${NODGES_COM_PID:-/tmp/nodges-com-watch.pid}` und bricht ab, wenn `/proc/<pid>` existiert; sonst startet er neu und ueberschreibt die Datei. Der Doppel-Waechter (Log: Starts 14:28:33 PID 230 und 14:30:03 PID 53; im `/proc` beobachtet als PIDs 226 und 53) ist nur entstanden, weil beim zweiten Aufruf die Standard-PID-Datei nicht vorlag (oder eine abweichende `NODGES_COM_PID` gesetzt war) — sonst haette `start` abgebrochen. Beide Prozesse liefen parallel und haengten beide an `events.log`. Beendet: PID 53 gekillt, PID 226 war zu diesem Zeitpunkt bereits verschwunden; anschliessend sauberer Neustart von genau einem Waechter (PID 299, Funktionstest inotify bestanden). Haertung fuer die Single-Instance-Garantie: `laeuft()` zusaetzlich gegen `/proc/*/cmdline` (`watch_com.mjs`) pruefen und die PID-Datei von `/tmp` nach `tools/com-bus/` verlegen (persistent statt tmpfs).
- **F3 (Reihenfolge & Start-Timing):** Ausreichend. Der Waechter schreibt PID-Datei und erste Logzeile sofort nach `busBereit()` — er braucht kein Netzwerk und kein langsames Bootstrap, die 10x0,4 s Polling in `start` reichen mit grossem Abstand. `disown` entkoppelt das Kind von der Shell; `exec npm run dev` ersetzt nur die Shell, nicht den nohup-Daemon. Das eigentliche Risiko ist nicht das Timing, sondern **parallele Startquellen** (Compose-Entrypoint + Devcontainer-`postStartCommand` + manueller Aufruf): dagegen helfen `|| true` im Entrypoint und die Haertung aus F2. Zusaetzlich gilt: Solange die PID-Datei in `/tmp` (tmpfs) liegt, ist nach einem Container-Neustart kein Status-Beweis ueber den vorherigen Prozess fuehrbar — Ablage in `tools/com-bus/` schliesst diese Diagnose-Luecke.

**Zusaetzlicher Befund (conT-Seite, vom Benutzer gemeldet):** In einer separaten Shell erschien `[Fehler 2147942632 (0x800700E8) beim Start von "C:\Program Files\PowerShell\7\pwsh.exe" -WindowStyle Hidden -ExecutionPolicy Bypass -File W:\tools\watch_com.ps1"]`. Das betrifft den **Autostart des conT-Waechters** (PowerShell-Start unter Windows), nicht den Container. 0x800700E8 = WinError 232 (ERROR_NO_DATA) beim Spawnen — haeufig, wenn der Start ohne interaktive Fenster-Sitzung erfolgt (geplanter Task/Autostart) oder `pwsh.exe` nicht am angegebenen Pfad liegt. Verifikation bei conT noetig (siehe Frage 1 in `com/fragen-an-cont.md`). Folge fuer das Projektziel: Auch conT hat damit aktuell **keinen automatisch startenden Waechter** — die Paritaet der Startwege fehlt auf beiden Seiten und gehoert in die Runde-2-Architektur.

**Fragen von piCon an conT:** Vier Punkte formuliert in `com/fragen-an-cont.md` (Fehlermeldung 0x800700E8, E2E-Stand, Commit-Trailer F-01, Zeitstempel-Konvention).

**Turnus:** Token an **dopi** uebergeben (Runde-1-Schritt 3, Abschnitt 3.3).

---

### 3.3 Stellungnahme & Erkenntnisse von dopi (Docker / Host-Infrastruktur)

**Antworten auf conTs Fragen (20:48 UTC / 22:48 MESZ):**

- **F1 (Primaerer Startmechanismus):** Der verbindliche Standard-Einstiegspunkt fuer den Benutzer und den taeglichen Betrieb ist [C:/Users/ich/Desktop/code/_projects/Nodges_Pi/start_pi_container.cmd](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/start_pi_container.cmd). Dieses Host-Skript stellt sicher, dass Docker Desktop aktiv ist, wechselt in das Compose-Verzeichnis, fuehrt `docker compose up -d` aus und oeffnet anschliessend die interaktive Pi-Agent-CLI via `docker compose exec -it pi-agent pi`. Der Start ueber VS Code Remote-Containers / Devcontainer ([.devcontainer/devcontainer.json](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.devcontainer/devcontainer.json)) ist ein sekundaerer, alternativer Entwicklungszugang, der jedoch identisch funktionieren muss.
- **F2 (Paritaet in devcontainer.json & Haertung):** Bestaetigt. Um vollstaendige Paritaet zwischen beiden Startmechanismen herzustellen, wird der `postStartCommand` in [.devcontainer/devcontainer.json](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.devcontainer/devcontainer.json) um den Waechterstart ergaenzt:
  ```json
  "postStartCommand": "bash .devcontainer/start-lightrag.sh; bash .devcontainer/start-vnc.sh || true; if [ -f /workspace/tools/nodges-com.sh ]; then bash /workspace/tools/nodges-com.sh start || true; fi",
  ```
  Zusaetzlich wird in [docker-compose.yml](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml) Zeile 23 die Ausfuehrung wie von piCon vorgeschlagen mit `|| true` abgesichert:
  ```yaml
  if [ -f /workspace/tools/nodges-com.sh ]; then bash /workspace/tools/nodges-com.sh start || true; fi;
  ```
- **F3 (Neustart-Bereitschaft):** Ein kontrollierter Neustart des Containers kann aus [C:/Users/ich/Desktop/code/_projects/Nodges_Pi](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi) jederzeit durchgefuehrt werden, sobald Runde 2 der Planung konsolidiert ist. Der Befehl dafuer lautet:
  ```powershell
  docker compose down && docker compose up -d
  ```
  (oder `docker compose restart pi-agent`, falls keine Mount-/Compose-Aenderungen neu eingelesen werden muessen). dopi kann dies auf Anforderung im Rahmen von Runde 3 unmittelbar ausfuehren.

**Befund zum Host-Waechter (conT / 0x800700E8):**
- Der von piCon erwaehnte Fehler `0x800700E8` (`ERROR_NO_DATA`, Win32 232) entsteht, wenn Windows Terminal (ConPTY) versucht, einen Prozess mit `-WindowStyle Hidden` an eine Pseudokonsole zu koppeln. Die ConPTY-Pipe bricht ab, weil sich der versteckte Prozess sofort detacht.
- `where.exe pwsh` bestaetigt: `C:\Program Files\PowerShell\7\pwsh.exe` ist auf dem Host vorhanden.
- Der conT-Waechter laeuft aktuell mit PID 18140 einwandfrei (`pwsh.exe -ExecutionPolicy Bypass -File W:\tools\watch_com.ps1`).

**Turnus:** Token an **conT** fuer Runde 2 (Konsolidierte Loesungsarchitektur & Umsetzungsplan) uebergeben.

---

## 4. Runde 2: Loesungsarchitektur & Umsetzung

### 4.1 Konsolidierte Architekturprinzipien (conT)

Aus den Analysen von conT, piCon und dopi in Runde 1 ergibt sich ein klares Bild. Alle drei Partner sind sich ueber die technischen Stellschrauben einig:

1. **Persistente PID- und Statusverwaltung im gemeinsamen Bus:**
   - **Problem:** Die Standard-PID-Datei lag bisher unter `/tmp/nodges-com-watch.pid`. Weil `/tmp` als `tmpfs` konfiguriert ist, wird das Verzeichnis bei jedem Container-Stopp vollstaendig geleert. Nach einem Neustart existiert keine Information mehr darueber, ob und welche PID zuvor aktiv war.
   - **Loesung:** Die PID-Datei zieht standardmaessig um nach `tools/com-bus/nodges-com-watch.pid` (konfigurierbar ueber `NODGES_COM_PID`). `tools/com-bus/` liegt auf dem WSL2/ext4-Dateisystem, ist persistent und wird zwischen den Harnesses geteilt (bleibt aber via `.gitignore` aus dem Git-Tracking ausgeschlossen).
   - **Vorteil:** Nach einem Neustart kann das Skript sofort erkennen, ob eine verwaiste PID-Datei vorliegt, und diese nach Validierung gegen `/proc` sauber bereinigen.

2. **Robuste Single-Instance-Garantie & Schutz vor Doppel-Waechtern:**
   - **Problem:** Der fruehere Doppel-Waechter (PIDs 53 und 226) entstand, weil bei inkonsistenten PID-Dateien oder schnellen Folgeaufrufen mehrere Prozesse parallel auf `events.log` schrieben.
   - **Loesung (Zweistufige Pruefung in `laeuft()`):**
     1. *PID-Datei-Pruefung mit Befehlszeilen-Check:* Liegt eine PID-Datei vor, prueft `laeuft()` nicht nur `[ -d "/proc/$pid" ]`, sondern validiert den Inhalt von `/proc/$pid/cmdline`. Nur wenn darin der String `watch_com.mjs` enthalten ist, gilt der Waechter als aktiv. Andernfalls (fremde recycelte PID oder toter Prozess) wird die PID-Datei als verwaist entfernt.
     2. *Fallback-Scan ueber `/proc/*/cmdline`:* Vor einem Neu-Start durchsucht `nodges-com.sh start` alle aktiven Prozesse nach `watch_com.mjs`. Findet sich ein bereits laufender Prozess, wird dessen PID in `tools/com-bus/nodges-com-watch.pid` uebernommen und der Start idempotent mit Erfolgsmeldung beendet.
   - **Vorteil:** Weder Race Conditions beim Bootstrapping noch unvollstaendige PID-Dateien koennen Doppel-Instanzen erzeugen.

3. **Paritaet aller Container-Startwege (Doppelter Boden):**
   - **Startweg A (Host / Docker Compose):** In [C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml) (Zeile 23) wird der Start idempotent mit `|| true` gekapselt:
     ```yaml
     if [ -f /workspace/tools/nodges-com.sh ]; then bash /workspace/tools/nodges-com.sh start || true; fi;
     ```
   - **Startweg B (Devcontainer):** In [C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.devcontainer/devcontainer.json](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.devcontainer/devcontainer.json) wird der `postStartCommand` identisch erweitert:
     ```json
     "postStartCommand": "bash .devcontainer/start-lightrag.sh; bash .devcontainer/start-vnc.sh || true; if [ -f /workspace/tools/nodges-com.sh ]; then bash /workspace/tools/nodges-com.sh start || true; fi",
     ```
   - Beide Wege sind nun aufeinander abgestimmt und absolut fehlertolerant.

4. **Host-Persistenz & conT-Waechter (Windows 11):**
   - Die Fehlerursache `0x800700E8` (`ERROR_NO_DATA` im ConPTY-Subsystem) ist geklaert: Windows Terminal bricht ab, wenn ein Prozess mit `-WindowStyle Hidden` gestartet wird.
   - Der conT-Waechter laeuft stabil auf dem Host (PID 18140 via `pwsh.exe -ExecutionPolicy Bypass -File W:\tools\watch_com.ps1`).
   - Fuer einen automatischen Windows-Start beim Booten des Host-Systems wird eine Windows-Aufgabe (Task Scheduler) ohne ConPTY-Bindung empfohlen.

5. **Dokumentsprache und Zeitstempel-Standard (T-04):**
   - Alle Harnesses dokumentieren Zeitstempel einheitlich in UTC: `YYYY-MM-DD HH:MM UTC` (optional MESZ in Klammern).

---

### 4.2 Status der Umsetzung in Runde 2

| Komponente / Datei | Zustaendigkeit | Status | Details |
|---|---|---|---|
| `docker-compose.yml` (Zeile 23) | **dopi / conT** | **Erledigt** | `|| true` in `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml` integriert. |
| `devcontainer.json` (`postStartCommand`) | **dopi / conT** | **Erledigt** | Aufruf von `nodges-com.sh start || true` in `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.devcontainer/devcontainer.json` eingebaut. |
| `com/fragen-an-cont.md` | **conT** | **Erledigt** | Alle 4 Fragen T-01 bis T-04 vollstaendig beantwortet und verifiziert. |
| `tools/nodges-com.sh` | **piCon** | **Erledigt** | PID-Pfad nach `tools/com-bus/nodges-com-watch.pid` verlegt; `laeuft()` mit `/proc/*/cmdline`-Kontrolle und `/proc`-Fallback-Scan gehaertet. Getestet (Abschnitt 4.4). |
| `tools/watch_com.mjs` | **piCon** | **Erledigt** | Standard-`PID_DATEI` auf `path.join(BUS, 'nodges-com-watch.pid')` umgestellt. Getestet (Abschnitt 4.4). |

---

### 4.3 Arbeitsauftrag an piCon (Turnus-Uebergabe Runde 2)

piCon (im Linux-Container `/workspace`) fuehrt gemaess Domaenenzustaendigkeit die Skript-Anpassungen aus:

1. **In `tools/nodges-com.sh`:**
   - Zeile 29 anpassen auf:
     ```bash
     PID_DATEI="${NODGES_COM_PID:-$BUS/nodges-com-watch.pid}"
     ```
   - Funktion `laeuft()` erweitern:
     ```bash
     laeuft() {
       if [ -f "$PID_DATEI" ]; then
         local pid
         pid="$(cat "$PID_DATEI" 2>/dev/null | tr -d ' \n')"
         if [ -n "$pid" ] && [ -d "/proc/$pid" ]; then
           if grep -qa 'watch_com.mjs' "/proc/$pid/cmdline" 2>/dev/null; then
             echo "$pid"
             return 0
           fi
         fi
       fi
       # Fallback: Scanne alle Prozesse nach watch_com.mjs
       local gefundene_pid
       gefundene_pid="$(grep -la 'watch_com.mjs' /proc/[0-9]*/cmdline 2>/dev/null | sed -E 's#/proc/([0-9]+)/.*#\1#' | head -n 1)"
       if [ -n "$gefundene_pid" ] && [ -d "/proc/$gefundene_pid" ]; then
         echo "$gefundene_pid" > "$PID_DATEI" 2>/dev/null || true
         echo "$gefundene_pid"
         return 0
       fi
       echo ""
     }
     ```
2. **In `tools/watch_com.mjs`:**
   - Zeile 28 anpassen auf:
     ```javascript
     const PID_DATEI = process.env.NODGES_COM_PID || path.join(BUS, 'nodges-com-watch.pid');
     ```
3. **Funktionstest im Container:**
   - `bash tools/nodges-com.sh status`
   - `bash tools/nodges-com.sh stop`
   - `bash tools/nodges-com.sh start`
   - Pruefen, ob die PID-Datei nun unter `tools/com-bus/nodges-com-watch.pid` liegt und Inotify greift.
4. **Token-Uebergabe:**
   - Nach erfolgreichem Test Eintrag in `rapport_autostart_com_bus.md` ergaenzen und Token fuer Runde 3 (Container-Neustart via dopi) uebergeben.

---

### 4.4 piCon: Umsetzung und Funktionstest (Runde 2)

**Umgesetzt am 2026-09-27 21:48 UTC (Commit folgt mit `save`):**

- `tools/nodges-com.sh`:
  - `PID_DATEI="${NODGES_COM_PID:-$BUS/nodges-com-watch.pid}"` — PID-Datei liegt jetzt persistent
    unter `tools/com-bus/` statt in `/tmp` (tmpfs).
  - `laeuft()` zweistufig: erst PID-Datei plus Kontrolle ueber `/proc/<pid>/cmdline` (String
    `watch_com.mjs`); verwaiste oder recycelte PIDs werden entfernt. Danach Fallback-Scan ueber
    `/proc/*/cmdline`.
  - **Abweichung von der Vorlage (4.3):** Der Fallback-Scan prueft zusaetzlich `/proc/<pid>/comm` auf
    `node` bzw. `nodejs`. Die reine `grep`-Loesung aus der Vorlage haette sich wegen des Suchstrings
    in der eigenen Kommandozeile selbst als Waechter erkennen koennen (falsche PID, kein Start).
- `tools/watch_com.mjs`:
  - `const PID_DATEI = process.env.NODGES_COM_PID || path.join(BUS, 'nodges-com-watch.pid');`

**Funktionstest im Container (alle Punkte bestanden):**

| Test | Ergebnis |
|---|---|
| `status` mit verwaister PID-Datei | Fallback findet den laufenden Waechter, PID-Datei wird korrekt neu geschrieben |
| `stop` | Waechter beendet, PID-Datei unter `tools/com-bus/` entfernt |
| `start` | Waechter startet (PID 545), PID-Datei unter `tools/com-bus/` geschrieben |
| `start` erneut | idempotent: "laeuft bereits (PID 545)" |
| Inotify-Test (`com/_waechter_test.md` anlegen/loeschen) | Ereignisse `erstellt` und `verschoben` im Protokoll, Datei danach wieder entfernt |
| Recycling-Schutz (fremde PID `1` in der Datei) | als verwaist erkannt, Fallback findet die echte PID |
| Tote PID `999999` | als verwaist erkannt, Fallback findet die echte PID |

Die alte PID-Datei `/tmp/nodges-com-watch.pid` wurde entfernt; es wird nur noch der persistente Pfad genutzt.

**Turnus:** Token an **dopi** fuer Runde 3 (gemeinsamer Container-Neustart-Test).

---

## 5. Runde 3: Integrierter Test, Haertung & Freigabe
*(Abschliessender Funktionstest nach Container-Reboot via docker compose down && docker compose up -d, Single-Instance-Check und Freigabebeschluss fuer com/entscheidungen.md)*
