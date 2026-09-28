# Multi-Harness Setup, Skripte und Kommunikations-Architektur

> **Dokumentenpfad:** [W:/com/setup/multi_harness_setup_und_kommunikation.md](file:///W:/com/setup/multi_harness_setup_und_kommunikation.md)  
> **Projekt:** Nodges  
> **Stand:** 27. September 2026 (Version 0.106.8)  
> **Beteiligte Harnesses:** **conT** (Antigravity auf Windows 11) und **piCon** (Pi-Agent im Linux-Docker-Container)  
> **Status:** Verbindliche Systemdokumentation und Analyse  

---

## 1. Architektur und Single Source of Truth (SSoT)

Das Projekt Nodges nutzt eine Multi-Harness-Entwicklungsumgebung mit strikter physischer Konsolidierung. Es existiert nur ein einziger physischer Arbeitsort:

```
        /home/unixusername/nodges   (WSL2 Linux, ext4)  <-- Single Source of Truth
                    |
        +-----------+-----------+
        |                       |
   /workspace                  W:/  (Windows subst Netzlaufwerk)
   [piCon im Docker-Container]  [conT in Antigravity Windows 11]
        |                       |
        +-----------+-----------+
                    |
              GitHub Remote
       (Meilenstein- und Tag-Archiv)
```

- **Dateisystem-Identitaet:** Beide Agenten greifen auf dieselben physischen Linux-ext4-Inodes zu. Aenderungen sind auf beiden Seiten ohne Git-Sync sofort praesent.
- **Netzlaufwerk `W:/`:** Gemappt via Windows Startup-Skript (`subst W: \\wsl.localhost\Ubuntu\home\unixusername\nodges`). Dies verhindert Abstuerze der IDE-File-Watcher, die bei direktem UNC-Zugriff ueber das 9P-Protokoll auftreten koennen.
- **winAnt (NTFS-Workspace):** Ist vollstaendig abgekoppelt und archiviert.

### Rollenaufteilung

| Harness | Umgebung | Arbeitsverzeichnis | Kernaufgaben |
|---|---|---|---|
| **conT** | Antigravity (Windows 11) | `W:/` | Architektur, Three.js 3D-Graph-Visualisierung, UI, E2E-Tests (Playwright), Dokumentation |
| **piCon** | Pi-Agent (Docker-Container) | `/workspace` | Container-Dienste (Vite, LightRAG Backend), Linux-Skripte, Backend-Tests (Pytest), Backup |

---

## 2. Vollstaendige Uebersicht aller Werkzeuge und Skripte

| Skript / Datei | Primaerer Nutzer | Umgebung | Zweck und Aufruf |
|---|---|---|---|
| [W:/tools/nodges-git.sh](file:///W:/tools/nodges-git.sh) | conT & piCon | Bash (Windows & Linux) | Zentraler Git-Workflow: `status`, `save`, `release`, `hooks`. Bindend fuer beide Seiten. |
| [W:/tools/nodges-git-version.mjs](file:///W:/tools/nodges-git-version.mjs) | `nodges-git.sh` | Node.js | Versionsverwaltung fuer `package.json` und `package-lock.json`. |
| [W:/tools/watch_com.mjs](file:///W:/tools/watch_com.mjs) | piCon | Node.js (Linux-Container) | COM-Waechter fuer Linux: Ueberwacht `com/` und `tools/com-bus/`. Protokolliert in `events.log`. |
| [W:/tools/nodges-com.sh](file:///W:/tools/nodges-com.sh) | piCon / Benutzer | Bash (Linux-Container) | CLI-Fernbedienung fuer den Linux-Bus (`start`, `stop`, `status`, `read`, `ack`, `ping`, `watch`). |
| [W:/tools/test-com.sh](file:///W:/tools/test-com.sh) | piCon / conT | Bash (Linux & WSL) | 8-stufiger Regressionstest fuer den COM-Bus ohne Seiteneffekte auf den Produktiv-Bus. |
| [W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1) | conT / System | PowerShell (Windows) | Windows-Waechter: Ueberwacht `com/` und `tools/com-bus/`, loest One-Way-Sync aus. |
| [W:/tools/sync_com.ps1](file:///W:/tools/sync_com.ps1) | `watch_com.ps1` / CLI | PowerShell (Windows) | Spiegelt `W:/com` via `robocopy /MIR` nach `C:/Users/ich/Desktop/code/_Nodges_Com_Sync`. |
| [W:/tools/nodges-com.ps1](file:///W:/tools/nodges-com.ps1) | conT / Benutzer | PowerShell (Windows) | Windows-CLI fuer den COM-Bus (`ping`, `status`, `read`, `sync`). |
| `/home/.pi/agent/extensions/nodges-com.ts` | piCon | TypeScript (Pi-Agent) | Liest `events.log` beim Prompt-Start und blendet `COM_UPDATE` direkt in den Pi-Chat ein. |
| [W:/start_pi_container.cmd](file:///W:/start_pi_container.cmd) | Benutzer | Windows CMD | Startet den Pi-Harness Docker-Container. Zwingend mit CRLF ausgecheckt. |
| `.devcontainer/start-lightrag.sh` | Container-System | Bash (Container) | Startet das FastAPI/LightRAG-Backend auf Port 8000. |
| `lightrag-backend/backup_storage.sh` | piCon | Bash (Container) | Erstellt komprimierte Snapshots des RAG-Vektorspeichers. |
| [W:/com/setup/dashboard_template/](file:///W:/com/setup/dashboard_template/) | conT & piCon | HTML / Markdown | Universelle One-Page Dashboard-Vorlage fuer neue Multi- & Single-Harness-Projekte. |

---

## 3. Die Kommunikations-Kanaele zwischen conT und piCon

Die Kollaboration basiert auf dem Grundsatz: **"Die Datei ist der Inhalt, der Ping ist nur die Klingel."**

### Kanal 1: Asynchroner Harness-Chat via Rapport (Inhalt)
Fuer groessere Vorhaben und Schnittstellenabstimmungen (z.B. Build 14 oder das Test-Setup) dient die Blaupause [W:/com/setup/harness_chat_setup.md](file:///W:/com/setup/harness_chat_setup.md).
- Zentrale Datei je Vorhaben unter `com/plan/<thema>/rapport_<thema>.md`.
- Fester Aufbau: Metadaten, tabellarisches Verlaufsprotokoll, Fragen an den Partner, Loesungsansaetze, Aufgabenaufteilung, Rueckmeldungen des Partners.
- **Strukturiertes 3-Runden Ping-Pong Muster:**
  1. *Runde 1:* Schnittstellen, DTOs und Rohdatenvalidierung.
  2. *Runde 2:* Datenexpansion, Schemamapping und Datenvertrag.
  3. *Runde 3:* Visualisierung, Frontend-UI-Integration und Verifikation.

### Kanal 2: Der COM-Bus (Klingel und Ereignisprotokoll)
- Liegt ausserhalb von `com/` unter [W:/tools/com-bus/](file:///W:/tools/com-bus/) (aus `.gitignore` ausgenommen), um Rueckkopplungsschleifen zu vermeiden.
- Protokolldatei: `tools/com-bus/events.log`.
- Zaehlerstand: `tools/com-bus/piCon.seen`.
- Ping-Dateien: `tools/com-bus/ping-<ziel>.md` (mit Zielen `conT`, `piCon` oder `all`).

---

## 4. Tiefenanalyse: Der Befund zum "unverbrauchten Ping"

### 4.1 Die Ausgangsbeobachtung von piCon
piCon setzte um 12:33 Uhr einen Ping an conT ab und bemerkte:
> *"Der alte ping-conT.md von 12:15 lag unverbraucht im Bus — das deutet darauf, dass conT's Waechter watch_com.ps1 nicht laeuft. Mein neuer Ping ueberschreibt die Datei, aber erreicht conT nur, wenn der Windows-Waechter laeuft."*

### 4.2 Die tatsaechlichen technischen Fakten

Eine eingehende Systempruefung der Prozesse und Skripte ergab folgendes Bild:

1. **Der Waechter-Prozess lief:**  
   Der PowerShell-Waechter war keineswegs inaktiv, sondern lief kontinuierlich unter Windows als Prozess-ID **10584** (`pwsh.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "W:\tools\watch_com.ps1"`). Gestartet wurde er automatisch durch die Windows-Startup-Aufgabe [C:/Users/ich/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/mount_nodges_w.cmd](file:///C:/Users/ich/AppData/Roaming/Microsoft/Windows/Start%20Menu/Programs/Startup/mount_nodges_w.cmd).

2. **Ursache 1: Keine Windows-Dateisystemevents bei Linux-Schreibzugriffen:**  
   `watch_com.ps1` nutzt fuer `tools/com-bus/` die .NET-Klasse `System.IO.FileSystemWatcher`. Da `W:/` auf WSL2 (`\\wsl.localhost\Ubuntu\...`) ueber das 9P-Protokoll verweist, loesen Schreibvorgaenge, die innerhalb von Linux (Docker-Container piCon oder WSL2-Bash) ausgefuehrt werden, **keine Windows `ReadDirectoryChangesW`-Benachrichtigungen** aus. Der Windows-Eventhandler feuert bei Linux-Pings schlichtweg nicht.

3. **Ursache 2: Asymmetrisches Polling im Heartbeat:**  
   In `watch_com.ps1` existierte ein Polling-Fallback (alle 2 Sekunden), dieser ueberpruefte jedoch ausschliesslich den Inhaltsordner `W:/com` fuer den Robocopy-Sync. Der Ordner `W:/tools/com-bus` wurde im Polling vollstaendig ausgelassen.  
   *Gegenprobe:* Auch die Datei `ping-sync.md` (angelegt um 09:08 Uhr) lag ueber 5 Stunden unberuehrt im Bus, weil sie ebenfalls nie vom Polling erfasst wurde.  
   Im Gegensatz dazu besitzt `watch_com.mjs` auf Linux-Seite eine dedizierte Funktion `pingSaeuberung()`, die alle 1500 ms per `setInterval` den Bus-Ordner scannt.

4. **Ursache 3: Informationssenke durch `-WindowStyle Hidden`:**  
   Selbst wenn der Eventhandler in `watch_com.ps1` gefeuert haette, fuehrte er lediglich ein `Write-Host` in der PowerShell-Konsole aus und loeschte anschliessend die Datei (`Remove-Item $path -Force`). Da der Prozess mit `-WindowStyle Hidden` laeuft, waere die Ausgabe im Konsolenpuffer des unsichtbaren Hintergrundprozesses verschwunden. Antigravity (conT) haette den Ping niemals gesehen.

### 4.3 Schlussfolgerung und Korrekturmassnahmen

- **Erweiterung von `watch_com.ps1`:** Der 2-Sekunden-Heartbeat muss zwingend auch `tools/com-bus` auf `ping-*.md` pruefen.
- **Ping-Ablauf fuer conT:**
  - Wird ein `ping-sync.md` gefunden: Sofortige Ausfuehrung von `Invoke-ComSync` und Entfernen des Triggers.
  - Wird ein `ping-conT.md` oder `ping-all.md` gefunden: Eintrag in `tools/com-bus/events.log` als permanenter PING-Eintrag (identisch zu `watch_com.mjs`), Konsolenausgabe und Bereinigung der Signaldatei.
- **Sicherheitsnetz fuer conT:** conT prueft beim Arbeitsbeginn neben `com/todo.md` und den Rapport-Dateien immer auch aktiv `tools/com-bus/ping-conT.md` und `events.log`.

---

## 5. Statusabgleich der aktuellen Aufgaben (Build 14 und Test-Setup)

Auf Basis der Pruefung von [W:/com/plan/Test_Setup_Plan/rapport_test_setup.md](file:///W:/com/plan/Test_Setup_Plan/rapport_test_setup.md) und des realen Dateistands:

| Punkt | Zustaendigkeit | Status | Details und Belege |
|---|---|---|---|
| `test:backend` in `package.json` | conT | **Erledigt** | Zeile 16: `"test:backend": "cd lightrag-backend && ./venv/bin/pytest tests/"`. 18 Tests gruen. |
| `test:all` in `package.json` | conT / gemeinsam | **Offen** | Vorgesehen: `"test:all": "tsc --noEmit && vitest run"`. E2E muss im Container via `NODGES_SKIP_E2E=1` uebersprungen werden, da Chromium im Container an fehlenden Systembibliotheken (`libglib-2.0.so.0`) scheitert. |
| E2E-Gate in `nodges-git.sh release` | Benutzer | **Offen (Entscheidung)** | Steht in [W:/com/entscheidungen.md](file:///W:/com/entscheidungen.md). Darf erst nach Bestaetigung durch den Benutzer in das Git-Skript aufgenommen werden. |
| E2E `05-visual-regression` & `06-lightrag-integration` | conT | **Offen** | Playwright-Tests fuer Canvas-Regression und Frontend-to-Backend-Integration auf Windows-Host ausarbeiten. |
| Lifespan-Handler in `main.py` | piCon (Backend) | **Offen** | Umstellung von `@app.on_event("startup")` auf `asynccontextmanager` (DeprecationWarning beheben). |

---

## 6. Richtlinien fuer den Betrieb

1. **Status vor Behauptung:** Vor jeder Aussage ueber den Stand eines Partners wird der reale Dateistand geprueft (Skripte, `package.json`, Code).
2. **Klingel nach Dokumentation:** Zuerst wird der Befund in die entsprechende Rapport- oder Todo-Datei geschrieben, erst anschliessend wird der Ping via `nodges-com.sh` bzw. `nodges-com.ps1` abgesetzt.
3. **Keine stillen Annahmen ueber Hintergrundprozesse:** Dateisystem-basierte Pings dienen der Asynchronitaet. Bleibt ein Ping liegen, bedeutet dies unter Windows zumeist fehlende IPC-Events ueber WSL-Netzlaufwerke, kein Scheitern des Partners.
