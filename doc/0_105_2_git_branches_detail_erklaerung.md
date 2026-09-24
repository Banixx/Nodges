# Ausfuehrliche Erklaerung der Git-Branches in Nodges

Detaillierte Analyse aller lokalen Branches, ihrer Markierungen (`*`, `+`), der Commit-Staende und ihrer Rolle im Projekt.

---

## 1. Die Sonderzeichen: Stern (`*`) und Plus (`+`)

In der Ausgabe von `git branch` haben die vorangestellten Symbole eine feste technische Bedeutung:

1. **`* refactor/pi-stabilization` (Stern):**
   - Der Stern markiert den **aktuell ausgecheckten Branch** in Ihrem aktuellen Arbeitsverzeichnis ([C:/Users/ich/Desktop/code/_projects/Nodges](file:///C:/Users/ich/Desktop/code/_projects/Nodges)).
   - Alle Dateioperationen, Tests und neuen Commits finden aktuell auf diesem Branch statt.

2. **`+ fix-math-calculation-logic-20260712` (Plus):**
   - Das Pluszeichen markiert einen Branch, der in einem separaten **Git Worktree** ausgecheckt ist.
   - Ein Git Worktree erlaubt es, mehrere Branches gleichzeitig in verschiedenen Ordnern auf der Festplatte zu oeffnen.
   - Git registriert diesen Branch unter dem Pfad `C:/Users/ich/.gemini/antigravity/worktrees/Nodges/fix-math-calculation-logic-20260712`.
   - Da der Ordner auf der Festplatte nach Abschluss der Agenten-Aufgabe bereinigt wurde, gilt dieser Worktree in Git als verwaist (`prunable`) und kann bei Bedarf mit `git worktree prune` entfernt werden.

---

## 2. Alle Branches im Detail

### 1. `refactor/pi-stabilization` (Aktiv, HEAD)
- **Aktueller Commit**: `4691500` (*+mmd*)
- **Vorgänger-Commits**:
  - `ca41a9d` (*refactor: extract DataManager and RenderEngine from App.ts into 3-layer architecture*)
  - `8d60d9b` (*cleanup: remove unused deno-proxy and legacy layout-worker.js*)
  - `2df4044` (*perf: defuse glob import in FilePanelUI and load small default graph on app start*)
  - `1c918f1` (*chore: add generated graph data and temporary dumps to .gitignore*)
  - `54a5f9e` (*cleanup: remove large generated json files and error dumps from public data*)
- **Basis**: Branch `pi` auf Stand `d4391c0` (Version 0.105.1).
- **Status zu GitHub**: Liegt **6 Commits vor origin/pi**. Dieser Branch existiert aktuell nur auf Ihrem lokalen Rechner und ist noch nicht zu GitHub uebertragen worden.
- **Funktion**: Aktueller Arbeitszweig fuer Stabilisierung, Performance und Architektur-Entkopplung.

---

### 2. `pi`
- **Aktueller Commit**: `d4391c0` (*0.105.1*, 2026-09-22)
- **Status zu GitHub**: Vollstaendig synchron mit `origin/pi`.
- **Historie**: Zweigt bei Version `0.103` (`1d177e5`) von `main` ab. Enthaelt die Entwicklung der Versionen 0.103.1 bis 0.105.1 (u.a. Pi-Container, LightRAG-Backend-Integration, Minimap, CreatePanel-Ueberarbeitung).
- **Funktion**: Haupt-Entwicklungszweig der letzten Monate.

---

### 3. `main`
- **Aktueller Commit**: `1d177e5` (*0.103*, 2026-07-30)
- **Status zu GitHub**: Hinkt `origin/main` um **1 Commit hinterher** (`476bf6c`: *chore: stop tracking .tmp.driveupload and add to gitignore*).
- **Bedeutung**: Auf GitHub ist `main` der Standard-Branch und speist GitHub Pages. Da die Entwicklungen von `pi` (Versionen 0.103.1 bis 0.105.1) noch nicht in `main` gemergt wurden, ist `main` auf dem Stand von Ende Juli 2026.

---

### 4. `feature/multi-build`
- **Aktueller Commit**: `ec2109d` (*0.102.3 Build 5*)
- **Status zu GitHub**: Synchron mit `origin/feature/multi-build`.
- **Historie**: Aelterer Feature-Branch, der damals ueber den Pull Request #1 in die fruehere Codebasis eingeflossen ist.

---

### 5. `fix-math-calculation-logic-20260712`
- **Aktueller Commit**: `5238ba8` (*0.102.7*, 2026-07-11)
- **Status zu GitHub**: Rein lokaler Branch, kein Remote-Tracking.
- **Besonderheit**: Wurde urspruenglich fuer eine spezifische mathematische Korrektur durch einen Hintergrund-Agenten in einem isolierten Antigravity-Worktree angelegt.

---

### 6. `VersionA` und `VersionB`
- **Commit VersionA**: `b962818` (*0.98.1.10A*)
- **Commit VersionB**: `b482b67` (*0.98.1.10B - Pink Schemes and Sunset Ocher*)
- **Status zu GitHub**: Rein lokale Zweige, keine Remote-Pendants.
- **Funktion**: Historische Archiv-Snapshots aus der fruehen Entwicklungsphase zur Sicherung von Farb- und Design-Schemata.

---

## 3. Uebersichtstabelle

| Branch | Aktueller Commit | Tracking zu GitHub (`origin`) | Status | Bedeutung |
|---|---|---|---|---|
| `refactor/pi-stabilization` (`*`) | `4691500` | Noch keins | 6 Commits vor `origin/pi` | Aktiver Entwicklungszweig (lokal) |
| `pi` | `d4391c0` | `origin/pi` | Synchron | Primaerer Entwicklungsstand (v0.105.1) |
| `main` | `1d177e5` | `origin/main` | 1 Commit hinterher | GitHub Default Branch (v0.103) |
| `feature/multi-build` | `ec2109d` | `origin/feature/multi-build` | Synchron | Historischer Feature-Branch |
| `fix-math-calculation-logic-20260712` (`+`) | `5238ba8` | Keins (Worktree) | Lokal verwaist | Abgeschlossene Agenten-Korrektur (v0.102.7) |
| `VersionA` | `b962818` | Keins | Nur lokal | Archiv-Stand (v0.98.1.10A) |
| `VersionB` | `b482b67` | Keins | Nur lokal | Archiv-Stand (v0.98.1.10B) |
