# Tri-Harness Rapport: Autostart und Persistenz des COM-Bus-Waechters

> **Projekt:** Autostart und Persistenz des COM-Bus-Waechters (`watch_com.mjs`) im Linux-Container  
> **Status:** Aktiv in Runde 1  
> **Aktueller Turnus-Inhaber:** **piCon** (uebergeben von conT)  
> **Ablagepfad:** [W:/com/plan/autostart_com_bus/rapport_autostart_com_bus.md](file:///W:/com/plan/autostart_com_bus/rapport_autostart_com_bus.md)  
> **Beteiligte Partner:**
> - **conT:** Antigravity (Windows 11 Host, Netzlaufwerk [W:/](file:///W:/))
> - **piCon:** Pi-Agent im Linux-Docker-Container (`/workspace`)
> - **dopi:** Docker- & Host-Orchestrator ([C:/Users/ich/Desktop/code/_projects/Nodges_Pi](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi))

---

## 1. Turnus- und Verlaufsprotokoll

| Zeitstempel (MESZ) | Akteur | Phase / Schritt | Status / Ergebnis |
|---|---|---|---|
| 2026-09-27 16:55 | **conT** | Runde 1: Problemaufriss, Bestandsaufnahme & Fragen an piCon und dopi | Erstellt. Turnus-Token an **piCon** uebergeben. |
| *offen* | **piCon** | Runde 1: Analyse aus dem Container & Beantwortung Fragenkatalog | *Wartend auf piCon* |
| *offen* | **dopi** | Runde 1: Analyse Host-Infrastruktur & Beantwortung Fragenkatalog | *Wartend auf dopi* |
| *offen* | **conT** | Runde 2: Konsolidierte Loesungsarchitektur & Umsetzungsplan | *Folgt in Runde 2* |
| *offen* | **dopi** / **piCon** | Runde 2: Umsetzung in Compose, Devcontainer und Linux-Skripten | *Folgt in Runde 2* |
| *offen* | **Alle drei** | Runde 3: Integrierter Test, Neustart-Validierung & Freigabe | *Folgt in Runde 3* |

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

---

### 3.3 Stellungnahme & Erkenntnisse von dopi (Docker / Host-Infrastruktur)
*(Turnus-Schritt 3: dopi traegt hier seine Analyse und Antworten auf conTs Fragen ein und uebergibt das Turnus-Token an conT fuer Runde 2.)*

---

## 4. Runde 2: Loesungsarchitektur & Umsetzung
*(Wird von conT nach Abschluss von Runde 1 konsolidiert; anschliessend arbeitsteilige Umsetzung durch dopi und piCon)*

---

## 5. Runde 3: Integrierter Test, Haertung & Freigabe
*(Abschliessender Funktionstest nach Container-Reboot, Single-Instance-Check und Freigabebeschluss fuer com/entscheidungen.md)*
