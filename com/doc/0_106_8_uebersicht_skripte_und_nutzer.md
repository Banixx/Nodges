# Uebersicht: Aktuell verwendete Skripte und Zustaendigkeiten

Dokumentversion: 0.106.8
Datum: 2026-09-27
Gueltigkeitsbereich: conT (Windows 11 Host) und piCon (Linux Docker-Container pi-harness)

## 1. Zustaendigkeiten und Skripte im Ueberblick

Aktuell teilt sich das Projekt in zwei aktive KI-Harnesses (gemaess [W:/AGENTS.md](file:///W:/AGENTS.md)):
- **conT**: Antigravity auf dem Windows 11 Host, Arbeitsverzeichnis `W:/`
- **piCon**: Pi-Agent im Linux-Docker-Container `pi-harness`, Arbeitsverzeichnis `/workspace`

| Skript | Primaerer Nutzer | Umgebung | Zweck | Aktueller Laufzeit-Status |
|---|---|---|---|---|
| [W:/tools/watch_com.mjs](file:///W:/tools/watch_com.mjs) | **piCon** | Linux-Container | Ueberwacht `com/` auf Aenderungen und schreibt diese in `tools/com-bus/events.log` | **Aktiv laufend** (PID 907 im Container) |
| [W:/tools/nodges-com.sh](file:///W:/tools/nodges-com.sh) | **piCon** / Benutzer | Linux-Container | CLI-Fernbedienung fuer `watch_com.mjs` (`start`, `stop`, `status`, `read`, `ping`) | On-Demand CLI-Werkzeug |
| [W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1) | **conT** | Windows (PowerShell) | Windows-Pendant zu `watch_com.mjs`: Beobachtet `W:\com` und `W:\tools\com-bus` per .NET `FileSystemWatcher` | Aktuell **nicht** im Hintergrund gestartet |
| [W:/tools/nodges-com.ps1](file:///W:/tools/nodges-com.ps1) | **conT** / Benutzer | Windows (PowerShell) | CLI-Fernbedienung fuer conT auf Windows (`ping`, `status`, `read`) | On-Demand CLI-Werkzeug |
| [W:/tools/nodges-git.sh](file:///W:/tools/nodges-git.sh) | **conT & piCon** | Windows & Linux (Bash) | Einheitlicher Git-Workflow (`status`, `save`, `release`, `hooks`) | Gemeinsames Standard-Werkzeug |
| [W:/tools/nodges-git-version.mjs](file:///W:/tools/nodges-git-version.mjs) | `nodges-git.sh` | Node.js | Versionsnummern in `package.json` pruefen und erhoehen | Internes Hilfsskript |
| [W:/start_pi_container.cmd](file:///W:/start_pi_container.cmd) | Benutzer | Windows Host | Startet den Pi-Harness Docker-Container | Startskript |
| `/home/.pi/agent/extensions/nodges-com.ts` | **piCon** | Linux-Container | Liest beim Prompt-Start automatisch `tools/com-bus/events.log` und informiert piCon | Als Agent-Erweiterung geladen |
| `.devcontainer/start-lightrag.sh` | Container-System | Linux-Container | Startet das FastAPI/LightRAG-Backend auf Port 8000 | Systemdienst |

## 2. Detailbetrachtung COM-Bus und Synchronisation

1. **piCon-Seite:**
   Auf Linux-Seite laeuft der Node-Waechter [W:/tools/watch_com.mjs](file:///W:/tools/watch_com.mjs) bereits aktiv als Hintergrundprozess (PID 907) und loggt alle Dateiaktionen in `tools/com-bus/events.log`.

2. **conT-Seite:**
   Das Skript [W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1) ist als Gegenstueck fuer Windows gedacht, laeuft aktuell aber noch nicht als Hintergrunddienst. Es lauscht bisher nur auf `Created`/`Changed` und gibt Aenderungen im Terminal aus, enthaelt aber noch keine Kopplung an einen Synchronisationsmechanismus nach `C:/Users/ich/Desktop/code/_Nodges_Com_Sync`.
