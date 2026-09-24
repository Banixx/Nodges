# Gesamtanalyse: Repository, Commits, Branches, Forks und Arbeitsumgebungen

## 1. Uebersicht zum GitHub-Repository `Banixx/Nodges`

- **Repository-URL:** https://github.com/Banixx/Nodges
- **Live-URL (GitHub Pages):** https://banixx.github.io/Nodges/
- **Erstelldatum:** 19.12.2025 (17:26:12 UTC)
- **Letzter Push auf GitHub:** 22.09.2026 (08:19:36 UTC)
- **Standard-Branch:** `main`
- **Programmiersprache:** TypeScript (Frontend auf Basis von Three.js und Vite)
- **Lizenz:** MIT
- **Sichtbarkeit:** Oeffentlich (Public)
- **Statistiken auf GitHub:**
  - Stars: 0
  - Forks: 0
  - Offene Issues: 0 (auch historisch keine geschlossenen Issues registriert)
  - Releases / Tags: Keine Releases und keine Git-Tags auf GitHub vorhanden

### Remote-Branches auf GitHub
1. `main` (SHA: `476bf6c1b115f86dfc7e1be98ffbc6f169822454`):
   - Letzter Commit: "chore: stop tracking .tmp.driveupload and add to gitignore" (Autor: `bani`, 22.09.2026).
2. `pi` (SHA: `d4391c01546c3d5123bcbdb0999ac505f61dea41`):
   - Letzter Commit: "0.105.1" (Autor: `Pi Agent`, 22.09.2026).
3. `feature/multi-build` (SHA: `ec2109d0caee83602c2bd42c8e9d216ffabf3f5f`):
   - Letzter Commit: "0.102.3 Build 5" (Autor: `Nodges Bot`, 08.07.2026).

### Pull Requests
- **PR #1 ("Feature/multi build"):**
  - Erstellt von: `Banixx` am 29.06.2026.
  - Ziel: Zusammenfuehrung von `feature/multi-build` in `main`.
  - Status: Gemerged und geschlossen am 29.06.2026 via Commit `c30db8f`.

---

## 2. Analyse von Forks und Vorgaenger-Repositories

### Vorgaenger: `ATrunBoing/Nodges`
- **Repository-URL:** https://github.com/ATrunBoing/Nodges
- **Erstelldatum:** 22.07.2025
- **Beschreibung:** "3D network visualization tool built with Three.js"
- **Autor:** Arbreska Trun (`arbereskatrun@proton.me`)
- **Branches auf GitHub:** `main` (Commit `5b5174e`) und `acli` (Commit `b9397a7`).
- **Verhaeltnis zu `Banixx/Nodges`:**
  - `Banixx/Nodges` ist auf GitHub nicht als offizieller GitHub-Fork markiert (`fork: false`), da das Remote-Repository im Dezember 2025 direkt neu angelegt und gepusht wurde.
  - **Git-Historie:** Die Git-Historie ist zu 100 % identisch und kontinuierlich. Der initiale Root-Commit beider Repositories ist identisch:
    - Root-Commit: `a59b3bfcc7e3952324ec8175fe75f9bef06bf596` ("0.78", 30.06.2025, Autor: Arbreska Trun).
    - Alle 34 Commits bis einschliesslich `fefce31` ("0.92.18", 28.09.2025) stammen von Arbreska Trun und befinden sich im Objektbaum von `Banixx/Nodges`.
  - `Banixx/Nodges` ist somit die direkte Weiterfuehrung von `ATrunBoing/Nodges`.

### Weitere GitHub-Suchergebnisse zu "Nodges"
Eine weltweite GitHub-Suche ergab keine aktiven Forks von `Banixx/Nodges` durch Dritte (`forks_count: 0`). Andere Treffer mit aehnlichem Namen sind voellig eigenstaendige Projekte:
- `georgeee/yii-lily`: PHP-Authentifizierungsmodul aus dem Jahr 2012 (basierend auf Nodge/yii-eauth).
- `andYudhistira/nodge`: Leeres JavaScript-Projekt aus dem Jahr 2025.
- `cretzel/nodges`: Graph-basiertes Python-Wiki aus dem Jahr 2010.
- `AnderBB/apiNodges`: Unabhaengiges JS-Projekt aus dem Jahr 2022.
- `mrmystery6756/bestofnorwich`: HTML-Seite aus dem Jahr 2026.

---

## 3. Commit-Historie, Autoren und Arbeitsweise

Insgesamt enthaelt das Repository ueber alle Branches 157 Commits.

### Autoren-Verteilung
| Commits | Name | E-Mail | Rolle / Kontext |
|---------|------|--------|-----------------|
| **68** | Nodges Bot | `bot@example.com` | Automatisierte Pipeline- und Versionierungs-Commits (auf GitHub zugeordnet zu `rhoggs-bot-test-account`) |
| **35** | Banixx | `banidoesch@gmail.com` | Manuelle Entwicklung, Rebuilds und mobile GitHub-Aktualisierungen |
| **34** | Arbreska Trun | `arbereskatrun@proton.me` | Urspruengliche Entwicklung und Grundaufbau (v0.78 bis v0.92.18) |
| **11** | bani | `90242722+Banixx@users.noreply.github.com` | Web-Edits, README-Updates und Git-Housekeeping |
| **9** | Pi Agent | `pi-agent@localhost` | Commits aus der Docker-DevContainer-Umgebung |

### Chronologische Entwicklungsphasen
1. **Phase 1: Gruendung (Juni 2025 – September 2025)**
   - Autor: Arbreska Trun.
   - Versionen von `0.78` bis `0.92.18`.
   - Grundarchitektur in JavaScript (Three.js Graph, Node/Edge-Klassen, Import/Export).
2. **Phase 2: Uebernahme & Rebuild (Januar 2026 – Februar 2026)**
   - Autor: Banixx.
   - Erstellung des Repositories `Banixx/Nodges` auf GitHub.
   - Versionen `0.97.5` bis `0.98 rebuild`.
   - Umstellung auf Vite, TypeScript und Modernisierung der Benutzeroberflaeche.
3. **Phase 3: Automatisierte Iterationen (Maerz 2026 – Juli 2026)**
   - Autor: Nodges Bot (`bot@example.com`).
   - Versionen `0.98.1` bis `0.103`.
   - Automatische Patch-Erhoehungen (z.B. ueber den `sgc`-Skill), Build-Pipelines und Feature-Branches (`feature/multi-build`, `VersionA`, `VersionB`).
4. **Phase 4: DevContainer & Pi Agent (August 2026 – September 2026)**
   - Autor: Pi Agent (`pi-agent@localhost`).
   - Versionen `0.103.1` bis `0.105.1` auf Branch `pi`.
   - Integration des LightRAG-Backends (Python/FastAPI) im Docker-Container, OpenRouter-Anbindung.
5. **Phase 5: Architektur-Refactoring & Stabilisierung (September 2026)**
   - Aufspaltung der Monolithen (`App.ts` aufgeteilt in 3-Schichten-Architektur: DataManager, RenderEngine).
   - Massive Datenbereinigung ueber den Branch `refactor/pi-stabilization` (Entfernung von ueber 1,1 Millionen Zeilen Testdaten und Fehlerdumps).

### Commit-Stile und Konventionen
- **Reine Versionsnummern:** Ein grosser Teil der Commits enthaelt ausschliesslich die Versionsnummer als Nachricht (z.B. `0.102.12`, `0.105.1`). Dies entspricht exakt der Arbeitsweise des projekteigenen `sgc`-Skills (`package.json`-Patch inkrementieren, `git add .`, Version als Commit-Message).
- **Mundart / Arbeitsnotizen:** Vereinzelt existieren Schweizerdeutsche oder pragmatische Bezeichnungen wie `dralunga`, `zwütschged`, `0.105- züglete` oder `0.103.1 von Pi`.
- **Konventionelle Commits:** Strukturiert formuliert bei Architekturarbeiten (`chore:`, `feat:`, `fix:`, `refactor:`, `cleanup:`).

---

## 4. Lokale Ordner und Arbeitsumgebungen

### 1. `C:/Users/ich/Desktop/code/_projects/Nodges`
- **Typ:** Lokales Haupt-Git-Repository unter Windows.
- **Aktueller Branch:** `refactor/pi-gem31`
- **Aktueller Commit:** `d4391c0` ("0.105.1")
- **Status des Arbeitsverzeichnisses:**
  - Nicht verfolgte Dateien: `Plan_v4_Nodges_Diagnose_Refactoring.md`, `hier__pro_Nodges.txt`.
  - Keine uncommitted Aenderungen an getrackten Dateien.
- **Lokale Branches im Repository:**
  - `main` (auf `1d177e5`, 1 Commit hinter `origin/main`)
  - `pi` (auf `d4391c0`, synchron mit `origin/pi`)
  - `refactor/pi-gem31` (auf `d4391c0`, Arbeitsbranch)
  - `refactor/pi-stabilization` (auf `4691500`, 6 Commits vor `pi`, enthaelt Architektur-Refactoring und Datenbereinigung)
  - `feature/multi-build` (auf `ec2109d`)
  - `VersionA` (auf `b962818` "0.98.1.10A")
  - `VersionB` (auf `b482b67` "0.98.1.10B")
  - `fix-math-calculation-logic-20260712` (auf `5238ba8`)
- **Verbundene Worktrees:**
  - `C:/Users/ich/.gemini/antigravity/worktrees/Nodges/fix-math-calculation-logic-20260712` (auf Branch `fix-math-calculation-logic-20260712`, Status: prunable).

### 2. `C:/Users/ich/Desktop/code/_projects/Nodges_Pi`
- **Typ:** Steuerungsverzeichnis fuer den Docker-DevContainer.
- **Git-Status:** Kein eigenes Git-Repository.
- **Zweck:** Enthaelt die kanonische `docker-compose.yml`, `Dockerfile`, `.env` und `start_pi_container.cmd`.
- **Funktionsweise:**
  - Die Compose-Datei bindet das WSL2-Verzeichnis `/home/unixusername/nodges` (ueber `\\wsl.localhost\Ubuntu\home\unixusername\nodges`) als `/workspace` in den Container ein.
  - Beim Containerstart werden Git-Benutzer (`Pi Agent <pi-agent@localhost>`) und Zugangsdaten in `/home/.pi` initialisiert.

### 3. `C:/Users/ich/Desktop/code/_projects/Nodges_Pi_2026_08_31`
- **Typ:** Snapshot-Backup.
- **Git-Status:** Kein Git-Repository.
- **Inhalt:** Sicherungsstand der Container-Konfiguration vom 31.08.2026.

### 4. `C:/Users/ich/Desktop/code/_projects/Nodges_Pi_alt`
- **Typ:** Archiv- und Dokumentationsordner.
- **Git-Status:** Kein Git-Repository.
- **Inhalt:** `pi_savety.txt`, `pi_shortcuts.md` und ein Screenshot.

### 5. WSL2: `/home/unixusername/nodges` (`\\wsl.localhost\Ubuntu\home\unixusername\nodges`)
- **Typ:** Vollstaendiger Git-Klon unter Ubuntu WSL2 (wird vom Docker-Container genutzt).
- **Aktueller Branch:** `pi` (auf `d4391c0 0.105.1`, synchron mit `origin/pi`).
- **Status des Arbeitsverzeichnisses:**
  - **Modifiziert:** `src/utils/LLMService.ts` (Fehlerdiagnose und ausfuehrliche Protokollierung bei Netzwerk- und Proxy-Fehlern).
  - **Nicht verfolgte Dateien:** `blau.txt`, `git-setup-bericht.md`, `hier_start_pi_cmd.txt`, `hrlp.txt`, `testdata/`.

---

## 5. Branch- und Stand-Vergleich

| Branch / Speicherort | Commit-SHA | Version / Titel | Status / Besonderheit |
|----------------------|------------|-----------------|-----------------------|
| **GitHub: origin/main** | `476bf6c` | chore: stop tracking .tmp.driveupload | 1 Commit vor lokalem `main` |
| **GitHub: origin/pi** | `d4391c0` | 0.105.1 | Letzter offizieller Pi-Stand |
| **GitHub: origin/feature/multi-build** | `ec2109d` | 0.102.3 Build 5 | Historischer Feature-Branch |
| **Lokal Windows: refactor/pi-gem31** | `d4391c0` | 0.105.1 | Basis fuer anstehendes Refactoring |
| **Lokal Windows: refactor/pi-stabilization** | `4691500` | +mmd | 6 Commits vor `pi`, 3-Layer-Architektur, 1.1M Zeilen JSON-Bereinigung |
| **Lokal Windows: main** | `1d177e5` | 0.103 | Lokal 1 Commit hinter `origin/main` |
| **WSL2: /home/unixusername/nodges** | `d4391c0` | 0.105.1 | Ungesicherte Modifikation in `src/utils/LLMService.ts` |
| **GitHub: ATrunBoing/Nodges (main)** | `5b5174e` | . | Letzter Stand des Vorgaenger-Accounts (Sept 2025) |

---

## 6. Zusammenfassendes Fazit

1. **Keine externen Forks:** Es existieren keine aktiven Dritt-Forks von `Banixx/Nodges` auf GitHub.
2. **Vorgaenger identifiziert:** `ATrunBoing/Nodges` ist das historische Vorgaenger-Repository, das vollstaendig in `Banixx/Nodges` uebergegangen ist.
3. **Zwei aktive Hauptstraenge:**
   - Der `main`-Strang repraesentiert den Stand bis Version 0.103 plus Datei-Bereinigung.
   - Der `pi`-Strang fuehrt die Entwicklung ab 0.103.1 ueber 0.104 bis 0.105.1 fort (inklusive DevContainer-Setup und LightRAG).
4. **Lokale Differenz zwischen Windows und WSL:**
   - In WSL2 existiert eine ungepushte Aenderung in `src/utils/LLMService.ts`.
   - Auf Windows existiert der experimentelle Stabilisierungs-Branch `refactor/pi-stabilization`, der die Architektur entschlackt und App.ts zerlegt hat.
