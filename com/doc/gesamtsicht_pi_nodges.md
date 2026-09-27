# Gesamtsicht Nodges_Pi & Nodges-Systemarchitektur

**Dokumentversion:** 0.106.8  
**Datum:** 2026-09-27  
**Autor:** dopi (`do` = Docker, `pi` = Pi Harness)  
**Ziel:** Konsolidierung der fruehen Setup- und Fehlerdokumente (Stand v1.0.0 / August 2026) mit dem aktuellen Reifegrad des Projekts (Stand v0.106.8 / September 2026) unter Beruecksichtigung von praktischer Erfahrung, Einsicht und architektonischer Weitsicht.

---

> **Hinweis zur Autorschaft und Rolle:**  
> Dieses Dokument wurde konsolidiert und verfasst von **dopi** (`do` = Docker, `pi` = Pi Harness).  
> **Rolle von dopi:** KI-Entwicklungs- und Orchestrierungs-Assistent mit Fokus auf die Host- und Docker-Infrastruktur (`C:/Users/ich/Desktop/code/_projects/Nodges_Pi`). Zustaendig fuer die Container-Konfiguration (`docker-compose.yml`), Startskripte (`start_pi_container.cmd`), UNC- und Volume-Mounts zwischen Windows und WSL2, Port-Weiterleitungen, die Integritaet der Laufzeitdienste (Vite, LightRAG) sowie die Dokumentationskonsolidierung des Gesamtsystems.

---

## 1. Executive Summary & Architektonische Leitlinie

Das Projekt **Nodges** (interaktive 3D-/4D-Visualisierung von Wissens- und Begriffsnetzwerken mit Three.js) hat seit den ersten Container- und Startversuchen eine grundlegende Evolution durchlaufen. Die fruehen Dokumente im Ordner `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/doc/` spiegeln die anfaenglichen Kaempfe wider: Docker-Mount-Probleme, fehlende `package.json`, Pfaddiskrepanzen zwischen Windows und WSL, Instabilitaeten bei Hintergrund-Tasks und Unklarheiten ueber den Ort von LightRAG und des Pi-Agenten.

Durch konsequente architektonische Konsolidierung gilt heute eine klare Rollenverteilung:

1. **Infrastruktur- und Launcher-Knoten (`C:/Users/ich/Desktop/code/_projects/Nodges_Pi`):**
   Dieser Windows-Ordner enthaelt die Docker-Compose-Orchestrierung (`docker-compose.yml`), die Startskripte (`start_pi_container.cmd`) und die zentrale `.env`-Konfiguration. Er ist der Host-Anker, der den Docker-Container `pi-harness` startet.
2. **Single Source of Truth (SSoT) fuer den Code (`/home/unixusername/nodges`):**
   Der eigentliche Programmcode liegt nativ auf dem Linux-Dateisystem (WSL2 ext4). Dies verhindert saemtliche Performance- und Sperrkonflikte zwischen NTFS und Linux.
3. **Multi-Harness-Arbeitsmodell (`conT` und `piCon`):**
   * **conT** (Antigravity auf Windows 11) greift ueber das Netzlaufwerk `W:/` (gemappt auf `//wsl.localhost/Ubuntu/home/unixusername/nodges`) direkt auf dieselben Dateien zu und verantwortet Frontend, Three.js, UI und Dokumentation.
   * **piCon** (Pi-Agent im Docker-Container `pi-harness`) arbeitet ueber den Volume-Mount `/workspace` und kuemmert sich um Container-Dienste, Build-Prozesse, den Vite-Server und das LightRAG-Backend.
4. **Vollstaendige Vereinheitlichung auf Git `main`:**
   Der fruehere Parallel-Zweig `pi` wurde aufgeloest und geloescht. Es existiert nur noch `main`, gesteuert ueber das einheitliche Skript `tools/nodges-git.sh`.

---

## 2. Einsicht: Rueckblick und Aufloesung der fruehen Probleme (v1.0.0)

Die urspruenglichen 32 Dokumente in diesem Ordner entstanden waehrend der Inbetriebnahme des Containers. Die folgende Matrix fasst die damaligen Ursachen zusammen und zeigt, wie sie im aktuellen System dauerhaft geloest sind:

| Urspruengliche Fragestellung / Problem (v1.0.0) | Fruehere Symptome | Endgueltige Loesung & Heutiger Stand (v0.106.8) |
|---|---|---|
| **Mount-Diskrepanz & leeres `/workspace`** (`1_0_0_docker_package_json_fehlt_plan.md`, `1_0_0_container_ursachenanalyse.md`) | Container brach ab mit Fehler, dass `package.json` nicht gefunden wurde; falsche relative Pfade in Docker Compose. | **Direkter UNC-Mount:** In `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env` ist `REPO_PATH=\\wsl.localhost\Ubuntu\home\unixusername\nodges` fest verankert. Docker bindet direkt das WSL-Verzeichnis ein. |
| **Agenten-Datenverlust bei Container-Neustart** (`1_0_0_docker_mount_custom_verzeichnis_plan.md`, `1_0_0_pi_coding_agent_installation.md`) | Skills, Chat-Sessions und Git-Credentials des Pi-Agenten gingen verloren, wenn der Container neu gebaut wurde. | **Persistenter Custom-Mount:** `CUSTOM_PATH=\\wsl.localhost\Ubuntu\home\unixusername\.pi` wird nach `/home/.pi` im Container gemountet. Alle Sessions, Skills und Git-Configs bleiben persistent auf dem WSL-Host erhalten. |
| **Container beendet sich sofort** (`1_0_0_docker_compose_foreground_vite_erklaerung.md`, `1_0_0_task_vordergrund_anzeigen.md`) | Docker-Container schloss nach Ausfuehrung von Initialisierungsskripten, da kein Vordergrundprozess lief. | **`exec npm run dev` als PID 1:** Der Container fuehrt im Einstiegspunkt `npm install`, startet das LightRAG-Backend im Hintergrund und uebergibt mit `exec npm run dev` die Kontrolle an den Vite Dev Server. |
| **Windows vs. WSL Pfad- und Zeilenendekonflikte** (`1_0_0_wsl_unc_pfad_plan.md`, `1_0_0_docker_wsl_windows_diskrepanz_plan.md`) | CRLF-Fehler in Shell-Skripten, doppelte Repositories, Pfadverwirrung zwischen `C:/` und `/mnt/c/`. | **Klare SSoT & Netzlaufwerk W:** Alle Dateien liegen mit LF-Zeilenenden auf ext4. Windows arbeitet ueber `W:/`, Skripte laufen nativ in Linux/WSL. |
| **Verwirrung um LightRAG-Hosting** (`1_0_0_lightrag_starten_windows.md`) | Frage, ob LightRAG auf dem Windows-Host (Port 8000) oder im Container laufen soll. | **Integrierter Container-Dienst mit Vite-Proxy:** LightRAG laeuft als FastAPI-Dienst im Container (virtuelle Umgebung `/workspace/lightrag-backend/venv`) auf Port 8000. Der Vite-Server leitet Anfragen ueber `/lightrag-api` transparent weiter. |
| **Frage nach Chrome DevTools & Remote Debugging** (`chrome://inspect/#remote-debugging`, Port 9222) | Planungen fuer automatisierte Browser-Tests via CDP (Chrome DevTools Protocol) oder noVNC im Container. | **Entkoppeltes Browser-Testing:** Da Chromium-Pakete im schlanken Docker-Image nicht installiert sind, erfolgt das Frontend-Testing direkt im Windows-Browser (Firefox/Chrome) auf `http://localhost:5173`. Remote Debugging auf dem Host wird nur benoetigt, wenn externe Werkzeuge den Host-Browser fernsteuern. |

---

## 3. Erfahrung: Die Systemarchitektur im Detail

```
 +---------------------------------------------------------------------------------------+
 |                                  WINDOWS 11 HOST                                      |
 |                                                                                       |
 |  [Browser: Chrome / Firefox]  <-------- HTTP :5173 --------+                          |
 |  Aufruf: http://localhost:5173                             |                          |
 |                                                            |                          |
 |  [conT: Antigravity IDE]                                   |                          |
 |  Arbeitsbereich: W:/ (= \\wsl.localhost\Ubuntu\home\...)    |                          |
 |  Fokus: Three.js, UI, Shader, Zod-Schemas, Doku            |                          |
 |                                                            |                          |
 |  [Launcher: C:/Users/ich/Desktop/code/_projects/Nodges_Pi] |                          |
 |  - docker-compose.yml                                      |                          |
 |  - start_pi_container.cmd                                  |                          |
 |  - .env (REPO_PATH & CUSTOM_PATH auf WSL gemappt)          |                          |
 +------------------------------+-----------------------------+--------------------------+
                                |                             ^
       Volume Mount (ext4)      |                             | Port-Forwarding :5173
                                v                             |
 +------------------------------------------------------------+--------------------------+
 |                              WSL2 UBUNTU / DOCKER ENGINE                              |
 |                                                                                       |
 |  SSoT Dateisystem (ext4): /home/unixusername/nodges (Repo)                             |
 |  Persistenter Speicher:   /home/unixusername/.pi    (Agent Home)                      |
 |                                                                                       |
 |  +---------------------------------------------------------------------------------+  |
 |  | DOCKER CONTAINER: pi-harness                                                    |  |
 |  |                                                                                 |  |
 |  |   /workspace <=== Bind Mount === /home/unixusername/nodges                       |  |
 |  |   /home/.pi  <=== Bind Mount === /home/unixusername/.pi                          |  |
 |  |                                                                                 |  |
 |  |   Prozesse:                                                                     |  |
 |  |   - PID 1: Vite Dev Server (Port 5173)                                          |  |
 |  |   - Background: LightRAG FastAPI (Port 8000 -> Proxy ueber /lightrag-api)       |  |
 |  |   - Background: COM-Bus Waechter (watch_com.mjs, loggt in events.log)           |  |
 |  |   - Agent piCon: Ausfuehrung von Linux-Aufgaben, Tests, Build, Python           |  |
 |  +---------------------------------------------------------------------------------+  |
 +---------------------------------------------------------------------------------------+
```

### 3.1 Das Netzlaufwerk W:/
Um zu verhindern, dass Entwickler oder Agenten auf dem Windows-Host mit veralteten oder desynchronisierten lokalen Kopien arbeiten, ist das Netzlaufwerk `W:/` eingerichtet:
* Pfad: `\\wsl.localhost\Ubuntu\home\unixusername\nodges`
* Vorteil: Jeder Schreibvorgang von Windows aus modifiziert sofort und ohne Latenz dieselbe Datei, die auch im Linux-Container liegt.
* Hinweis: Ein gelegentlich angezeigtes rotes Kreuz im Windows Explorer ist ein kosmetischer Windows-Effekt und bedeutet keinen Verbindungsabbruch.

### 3.2 Der COM-Bus (Inter-Harness-Kommunikation)
Weil conT und piCon auf demselben Dateisystem operieren, aber in unterschiedlichen Umgebungen (Windows vs. Container) laufen, erfolgt der Informationsaustausch ereignisbasiert ueber das Verzeichnis `W:/tools/com-bus/`:
* `watch_com.mjs` (Container) und `watch_com.ps1` (Windows) ueberwachen das Verzeichnis `W:/com/`.
* Jede Erstellung oder Aenderung von Plaenen, Todos oder Dokumenten wird in `W:/tools/com-bus/events.log` protokolliert.
* Der Pi-Agent liest ueber seine Erweiterung `nodges-com.ts` dieses Protokoll beim Start eines Prompts ein und ist damit sofort ueber Aktivitaeten von conT informiert.

---

## 4. Weitsicht: Arbeitsablaeufe, Git-Disziplin und Qualitaetssicherung

Aus den Erfahrungen der Vergangenheit wurden klare Regeln abgeleitet, die ein Auseinanderdriften von Code, Branches oder Dokumenten verhindern.

### 4.1 Verbindlicher Git-Workflow (`tools/nodges-git.sh`)
Es wird nicht mehr manuell beliebig mit `git commit` oder `git push` experimentiert. conT und piCon nutzen dasselbe Werkzeug:

1. **Status pruefen:**
   ```bash
   bash tools/nodges-git.sh status
   ```
   Zeigt Branch (`main`), aktuelle Version aus `package.json`, Tag und offene Dateien.

2. **Lokalen Arbeitsstand sichern (Save):**
   ```bash
   bash tools/nodges-git.sh save
   ```
   Erhoeht die Patch-Version (z. B. `0.106.8` -> `0.106.9`), fuehrt `git add -A` aus und committet lokal. **Es erfolgt kein Push nach GitHub.** Lokale Iterationen bleiben lokal.

3. **Stabile Version veroeffentlichen (Release):**
   ```bash
   bash tools/nodges-git.sh release
   ```
   Erhoeht die Minor-Version (z. B. `0.106.9` -> `0.107.0`), laesst den Typecheck (`tsc --noEmit`) und die Vitest-Suite durchlaufen, erstellt einen Git-Tag (z. B. `v0.107.0`) und pusht erst dann kontrolliert nach GitHub.

4. **Schutz durch Git-Hooks (`git-hooks/`):**
   Der `pre-push`-Hook blockiert automatisiert jeden Versuch, eine unfertige Patch-Version nach GitHub zu uebertragen. GitHub dient als stabiles Meilenstein-Archiv, nicht als Zwischenablage.

### 4.2 Moderne Qualitaets-Tools
Die Codebasis wurde von unstrukturierten Einzelskripten auf moderne Standards umgestellt:
* **Biome (`biome.json`):** Ultraschnelles Linting und Formatting fuer TypeScript und JSON.
* **Vitest (`vitest.config.ts`):** Schnelle Unit-Tests fuer Zod-Validierung, Datenmodelle und Konverter.
* **Playwright (`playwright.config.ts`):** End-to-End-Tests der Benutzeroberflaeche im Browser.

---

## 5. Dokumentationsordnung: Wo steht was?

Damit Dokumente nicht erneut ueber verschiedene Ordner verstreut werden, gilt ab Version 0.106.8 folgende strikte Ordnung:

1. **Host-Starter-Ebene (`C:/Users/ich/Desktop/code/_projects/Nodges_Pi/doc/`):**
   Dieser Ordner dokumentiert ausschliesslich das Host- und Container-Setup (Docker, Ports, Start-Skripte, WSL-Mounts). Das vorliegende Dokument `gesamtsicht_pi_nodges.md` konsolidiert diese Ebene endgueltig.
2. **Kanonische Gesamtdokumentation (`W:/com/doc/Nodges_doc_106_8/`):**
   Hier liegt die vollstaendige, 16-teilige technische und konzeptionelle Gesamtdokumentation von Nodges:
   * `0_106_8_00_inhalt.md` bis `0_106_8_16_LightRAG_Backend_und_Multi_Harness.md`
   * Behandelt Architektur, 3D-Engine (Three.js InstancedMesh), Physik-Layout, Zod-Validierung (Graph Schema 5.0/5.2), LLM-Pipelines und Kognitionstheorie.
3. **Lebende Arbeitsdokumente (`W:/com/`):**
   * `W:/AGENTS.md`: Verbindliche Regeln fuer alle KI-Harnesses.
   * `W:/com/todo.md`: Aktuelle Aufgaben.
   * `W:/com/plan/`: Ausgearbeitete Implementierungsplaene.
   * `W:/com/entscheidungen.md`: Verbindliche Beschluesse des Benutzers.

---

## 6. Zusammenfassendes Fazit

Die fruehere Phase der Unsicherheit hinsichtlich Docker-Abbruechen, fehlender Dateien und unklarer Mount-Pfade ist ueberwunden. Die Architektur ist heute stabil, performant und eindeutig strukturiert:

* `C:/Users/ich/Desktop/code/_projects/Nodges_Pi` ist der zuverlaessige **Launcher**.
* `\\wsl.localhost\Ubuntu\home\unixusername\nodges` (`W:/`) ist der alleinige **Code-Arbeitsort**.
* `pi-harness` ist der isolierte **Dienste- und Server-Container**.
* `tools/nodges-git.sh` garantiert eine **saubere Git-Historie** ohne Versionschaos.

Mit dieser Gesamtsicht sind die historischen Einzeldokumente in `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/doc/` konsolidiert und als Referenz fuer die getroffenen Architekturentscheidungen vollstaendig erschlossen.
