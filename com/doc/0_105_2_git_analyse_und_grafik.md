# Git- und Repository-Status: Banixx/Nodges

Dokumentation des aktuellen Git-Zustands, der Repository-Eigenschaften auf GitHub, der Branch-Struktur und der Commit-Historie.

## 1. Uebersicht des GitHub-Accounts & Repository

- **GitHub-Konto**: `Banixx` (URL: `https://github.com/Banixx`)
- **Repository-Name**: `Nodges`
- **Vollstaendiger Pfad**: `https://github.com/Banixx/Nodges`
- **Fork-Eigenschaft**:
  - `fork: false` (Das Repository ist **kein Fork**, sondern das eigenstaendige Original-Repository).
  - `forks_count: 0` (Es existieren aktuell **0 Forks** durch andere GitHub-Nutzer).
- **Default-Branch auf GitHub**: `main`
- **GitHub Pages**: Aktiviert auf `https://banixx.github.io/Nodges/` (Quelle: `main`-Branch).
- **Pull Requests / Issues**: Keine offenen PRs oder Issues. Historischer PR #1 (*Feature/multi build*) wurde am 29. Juni 2026 gemergt und geschlossen.

---

## 2. Remote- und Lokale Branches im Detail

### A. Remote-Branches auf GitHub (`origin`)
1. **`origin/main`** (Standard-Branch auf GitHub):
   - Letzter Commit: `476bf6c` (*chore: stop tracking .tmp.driveupload and add to gitignore*, 2026-09-22).
   - Basis: Version `0.103` (`1d177e5`, 2026-07-30).
   - **Wichtige Feststellung**: Dieser Branch enthaelt **keine** der Entwicklungen aus Version 0.103.1 bis 0.105.1.
2. **`origin/pi`**:
   - Letzter Commit: `d4391c0` (*0.105.1*, 2026-09-22).
   - Enthaelt den gesamten Entwicklungsstrang der Versionen 0.103.1 bis 0.105.1 (Container-Setup, Pi-Architektur, Minimap, CreatePanel, LightRAG-Integration).
3. **`origin/feature/multi-build`**:
   - Letzter Commit: `ec2109d` (*0.102.3 Build 5*). Historischer Stand.

### B. Lokale Branches auf dem Rechner
1. **`refactor/pi-stabilization`** (Aktuell aktiv / ausgecheckt als HEAD):
   - Basis: `origin/pi` auf Stand `d4391c0`.
   - Enthaelt **5 neue lokale Commits**, die noch **nicht** auf GitHub gepusht wurden:
     - `54a5f9e` (*cleanup: remove large generated json files and error dumps from public data*)
     - `1c918f1` (*chore: add generated graph data and temporary dumps to .gitignore*)
     - `2df4044` (*perf: defuse glob import in FilePanelUI and load small default graph on app start*)
     - `8d60d9b` (*cleanup: remove unused deno-proxy and legacy layout-worker.js*)
     - `ca41a9d` (*refactor: extract DataManager and RenderEngine from App.ts into 3-layer architecture*)
   - Lokaler Zustand: Uncommittete Aenderungen in `src/App.ts` und neue Dateien `src/core/DataManager.ts`, `src/core/RenderEngine.ts`.
2. **`pi`**:
   - Synchron mit `origin/pi` auf Stand `d4391c0`.
3. **`main`**:
   - Stand `1d177e5` (Version 0.103). Hinkt `origin/main` um 1 Commit (`476bf6c`) hinterher.
4. **`feature/multi-build`**:
   - Stand `ec2109d` (synchron mit `origin/feature/multi-build`).
5. **`fix-math-calculation-logic-20260712`**:
   - Lokaler Worktree-Branch auf Stand `5238ba8` (Version 0.102.7).
6. **`VersionA` / `VersionB`**:
   - Lokale Archivstaende auf Version 0.98.1.10.

---

## 3. Grafische Visualisierung der Commit- und Branch-Struktur

```mermaid
flowchart TD
    subgraph GITHUB["GitHub Repository: Banixx/Nodges (Fork: Nein | Forks: 0)"]
        direction TB
        OMAIN["origin/main (Default)<br/>476bf6c: stop tracking .tmp.driveupload"]
        OPI["origin/pi<br/>d4391c0: 0.105.1"]
        OMULTI["origin/feature/multi-build<br/>ec2109d: 0.102.3 Build 5"]
    end

    subgraph LOCAL["Lokaler Rechner (C:/Users/ich/Desktop/code/_projects/Nodges)"]
        direction TB
        LMAIN["main<br/>1d177e5: 0.103"]
        LPI["pi<br/>d4391c0: 0.105.1"]
        LREF["refactor/pi-stabilization (HEAD)<br/>ca41a9d: 3-layer architecture"]
        UNCOMMITTED["Working Tree (uncommittet)<br/>App.ts, DataManager, RenderEngine"]
    end

    subgraph COMMITS["Commit-Entwicklungslinie"]
        direction TB
        C_BASE["1d177e5: 0.103 (Gemeinsamer Ursprung)"]
        
        %% Main Strang
        C_MAIN_REMOTE["476bf6c: chore driveupload"]
        
        %% Pi Strang
        C_PI_1["5b355b9: 0.103.1 von Pi"]
        C_PI_2["91138a5: 104"]
        C_PI_3["cfe5658: zwuetschged"]
        C_PI_4["d8bef5b: 0.105.0"]
        C_PI_5["2e44e67 .. 346d9c2: 0.105.1 & zueglete"]
        C_PI_6["2b3a97b: key restriction"]
        C_PI_7["10d6c50: LightRAG im Container"]
        C_PI_8["d4391c0: 0.105.1 (Ziel origin/pi)"]

        %% Refactor Strang (Nur lokal)
        C_REF_1["54a5f9e: cleanup large json files"]
        C_REF_2["1c918f1: gitignore graph dumps"]
        C_REF_3["2df4044: perf defuse glob import"]
        C_REF_4["8d60d9b: remove deno-proxy"]
        C_REF_5["ca41a9d: 3-layer refactoring"]
    end

    %% Beziehungen Main
    C_BASE --> C_MAIN_REMOTE
    C_MAIN_REMOTE --> OMAIN
    C_BASE -.-> LMAIN

    %% Beziehungen Pi
    C_BASE --> C_PI_1
    C_PI_1 --> C_PI_2 --> C_PI_3 --> C_PI_4 --> C_PI_5 --> C_PI_6 --> C_PI_7 --> C_PI_8
    C_PI_8 --> OPI
    C_PI_8 -.-> LPI

    %% Beziehungen Refactor
    C_PI_8 --> C_REF_1 --> C_REF_2 --> C_REF_3 --> C_REF_4 --> C_REF_5
    C_REF_5 --> LREF
    LREF --> UNCOMMITTED

    classDef github fill:#e8f4fd,stroke:#1e88e5,stroke-width:2px;
    classDef local fill:#fbe9e7,stroke:#d84315,stroke-width:2px;
    classDef unpushed fill:#fff3e0,stroke:#f57c00,stroke-width:2px,stroke-dasharray: 5 5;
    classDef commit fill:#f5f5f5,stroke:#757575,stroke-width:1px;

    class OMAIN,OPI,OMULTI github;
    class LMAIN,LPI,LREF local;
    class C_REF_1,C_REF_2,C_REF_3,C_REF_4,C_REF_5,UNCOMMITTED unpushed;
    class C_BASE,C_PI_1,C_PI_2,C_PI_3,C_PI_4,C_PI_5,C_PI_6,C_PI_7,C_PI_8,C_MAIN_REMOTE commit;
```

---

## 4. Kernpunkte und Divergenzen

1. **Kein Fork vorhanden**:
   - Ihr GitHub-Projekt `Nodges` ist ein eigenstaendiges Root-Repository und hat weder ein Upstream-Parent noch fremde Forks.
2. **Kluft zwischen `main` und `pi`**:
   - Auf GitHub steht der Standard-Branch `main` bei Version `0.103` (Ende Juli 2026).
   - Die Weiterentwicklung auf Version `0.105.1` lief vollstaendig auf dem Branch `pi`. Da `pi` bisher nicht in `main` zusammengefuehrt wurde, sieht die GitHub-Standardansicht (und damit auch GitHub Pages) nur den Stand von Version 0.103.
3. **Lokaler Refactoring-Ast (`refactor/pi-stabilization`)**:
   - Die fuenf juengsten Commits zur Code-Bereinigung und 3-Schichten-Architektur existieren aktuell ausschliesslich auf Ihrer lokalen Festplatte und sind noch nicht auf GitHub gesichert.
