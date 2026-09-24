# Ausfuehrliche Schritt-fuer-Schritt-Anleitung: Merge und Synchronisation

Detaillierter Leitfaden zur Konsolidierung der Arbeitsstaende zwischen WSL (Pi-Container), Windows (Antigravity) und dem GitHub-Repository [https://github.com/Banixx/Nodges](https://github.com/Banixx/Nodges).

---

## Technische Vorpruefung und Bestaetigung

Die Pruefung des Repositories hat ergeben:
1. **Keine Merge-Konflikte:** Die Aenderungen in `src/utils/LLMService.ts` (WSL), die 6 Stabilisierungs-Commits aus `refactor/pi-stabilization` (Windows) und der Bereinigungs-Commit auf `origin/main` beruehren voellig disjunkte Dateien bzw. Zeilen. Ein 3-Wege-Merge laeuft vollstaendig sauber ohne Konflikte durch.
2. **Authentifizierung:**
   - In WSL ist die SSH-Authentifizierung fuer GitHub (`git@github.com:Banixx/Nodges.git`) vollstaendig eingerichtet und funktionsfaehig.
   - In Windows ist der Push-Zugriff ueber den Git Credential Manager aktiv.

---

## Schritt 1: WSL-Aenderung sichern und pushen

### Hintergrund
Im WSL-Dateisystem (`/home/unixusername/nodges`), welches der Pi-Container als Arbeitsverzeichnis `/workspace` nutzt, befindet sich aktuell eine nicht gespeicherte Aenderung in [src/utils/LLMService.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts).
- **Inhalt der Aenderung:** Eine praezisere Fehlerdiagnose bei Netzwerk- und Proxy-Fehlern sowie ein automatischer Warnhinweis, wenn eine Anfrage ohne eigenen OpenRouter-API-Key die Payload-Grenze des kostenlosen Deno-Proxys ueberschreitet.
- **Ziel:** Diese Verbesserung fest in die Historie schreiben und zu GitHub hochladen, damit sie auch fuer Windows verfuegbar wird.

### Exakte Befehle (ausfuehrbar in WSL / Bash oder per PowerShell ueber `wsl`):
```bash
# 1. In das WSL-Repo-Verzeichnis wechseln (oder von Windows via wsl steuern)
cd /home/unixusername/nodges

# 2. Nur die geaenderte Datei zur Staging-Area hinzufuegen (ungetrackte Hilfsdateien ignorieren)
git add src/utils/LLMService.ts

# 3. Commit mit aussagekraeftiger Nachricht erstellen
git commit -m "fix(llm): erweiterte fehlerdiagnose und payload-hinweis fuer proxy"

# 4. Den Branch pi zu GitHub pushen
git push origin pi
```

### Was passiert hierbei?
- Auf GitHub wird der Branch `pi` um genau einen Commit ergaenzt.
- Der Commit ist nun ueber die SSH-Verbindung von Pi auf GitHub gesichert.

---

## Schritt 2: Windows-Repository aktualisieren

### Hintergrund
Das Windows-Repository [C:/Users/ich/Desktop/code/_projects/Nodges](file:///C:/Users/ich/Desktop/code/_projects/Nodges) befindet sich aktuell auf dem Zweig `refactor/pi-gem31`. Um die WSL-Aenderungen hereinzuholen, wechseln wir auf den lokalen Tracking-Branch `pi` und laden den soeben gepushten Commit von GitHub herunter.

### Exakte Befehle (in Windows PowerShell):
```powershell
# 1. In das Windows-Projektverzeichnis wechseln
Set-Location "C:/Users/ich/Desktop/code/_projects/Nodges"

# 2. Auf den lokalen Branch pi umschalten
git checkout pi

# 3. Den neuen Commit von GitHub abrufen und in den lokalen pi-Zweig integrieren
git pull origin pi
```

### Was passiert hierbei?
- Git aktualisiert die lokale Datei `src/utils/LLMService.ts` auf den Stand von Pi.
- Das Windows-Repository und das WSL-Repository sind bezueglich des Branches `pi` nun zu 100% synchron.

---

## Schritt 3: Stabilisierungs-Commits einfliessen lassen

### Hintergrund
Im Windows-Repository existiert der lokale Zweig `refactor/pi-stabilization`. Dieser enthaelt 6 wertvolle Commits, die waehrend der Stabilisierungsphase erstellt wurden:
1. `54a5f9e` (*cleanup: remove large generated json files and error dumps from public data*)
2. `1c918f1` (*chore: add generated graph data and temporary dumps to .gitignore*)
3. `2df4044` (*perf: defuse glob import in FilePanelUI and load small default graph on app start*)
4. `8d60d9b` (*cleanup: remove unused deno-proxy and legacy layout-worker.js*)
5. `ca41a9d` (*refactor: extract DataManager and RenderEngine from App.ts into 3-layer architecture*)
6. `4691500` (*+mmd*)

Diese Aenderungen verhindern Speicherueberlaeufe beim Start, beschleunigen Vite und teilen die monolithische `App.ts` sauber in Datenverwaltung (`DataManager`) und Rendering (`RenderEngine`) auf.

### Exakte Befehle (in Windows PowerShell):
```powershell
# 1. Sicherstellen, dass pi ausgecheckt ist
git checkout pi

# 2. Den Stabilisierungszweig in pi mergen
git merge refactor/pi-stabilization -m "merge: stabilisierung und 3-schichten-architektur in pi integrieren"
```

### Was passiert hierbei?
- Da `refactor/pi-stabilization` keine Konflikte mit `LLMService.ts` hat, fuehrt Git den Merge automatisch und ohne manuelle Eingriffe durch.
- Der Branch `pi` enthaelt nun sowohl die Diagnoseverbesserung von Pi als auch die Architektur- und Performance-Optimierungen von Windows.

---

## Schritt 4: Den Hauptzweig `main` auf Stand bringen

### Hintergrund
Auf GitHub ist `main` der Standard-Branch (Default Branch), den Besucher oder Deployment-Skripte sehen. Er steht jedoch seit Version 0.103 still.
Auf `origin/main` gab es zudem einen kleinen Wartungs-Commit (`476bf6c`: Entfernen von `.tmp.driveupload` und Eintrag in `.gitignore`).

Indem wir `main` lokal aktualisieren und `pi` in `main` mergen, wird `main` vollstaendig auf den modernen Entwicklungsstand 0.105.2 gehoben.

### Exakte Befehle (in Windows PowerShell):
```powershell
# 1. Auf main umschalten
git checkout main

# 2. Den Wartungs-Commit von GitHub abholen
git pull origin main

# 3. Den aktuellen Stand von pi in main mergen
git merge pi -m "merge: version 0.105.2 inklusive devcontainer, lightrag und refactoring in main uebernehmen"
```

### Was passiert hierbei?
- `main` schliesst zu allen Fortschritten der letzten Monate auf.
- DevContainer, Docker Compose, LightRAG-Backend und 3D-Visualisierung sind nun auch im offiziellen Hauptzweig des Projekts verankert.

---

## Schritt 5: Zu GitHub uebertragen

### Hintergrund
Alle Zusammenfuehrungen liegen nach den Schritten 3 und 4 fertig im lokalen Windows-Repository vor. Jetzt muessen beide Branches nach GitHub gepusht werden.

### Exakte Befehle (in Windows PowerShell):
```powershell
# 1. Den modernisierten Hauptzweig pushen
git push origin main

# 2. Den aktualisierten Entwicklungszweig pushen
git push origin pi
```

### Zusaetzlicher Schritt fuer WSL (Pi-Container):
Damit auch das WSL-Repository von Pi sofort den vollen Stand inklusive der Stabilisierungen erhaelt:
```bash
# In WSL (/home/unixusername/nodges):
git checkout pi
git pull origin pi
```

---

## Zusammenfassung des Ergebnisses

Nach Abschluss dieses Ablaufs:
1. Haben GitHub `main`, GitHub `pi`, Windows-Lokal und WSL-Lokal **denselben konsistenten Softwarestand**.
2. Sind alle neuen Features (LightRAG, DevContainer, Minimap) im `main`-Branch veroeffentlicht.
3. Bleiben keine ungesicherten Aenderungen zurueck.
4. Koennen sowohl Antigravity auf Windows als auch Pi im Docker-Container nahtlos auf derselben Codebasis weiterarbeiten.
