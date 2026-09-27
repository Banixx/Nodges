# 10 Entwicklungs-Guide, Testing und Deployment

Dieses Kapitel dokumentiert die Entwicklungsstandards, die Testinfrastruktur, das Linter- und Formatter-Tooling sowie den verbindlichen Git- und Release-Workflow von Nodges in Version **0.106.8**.

---

## 1. Lokale Entwicklungsumgebung und Multi-Harness

> **Visualisierung:** Siehe [10_DevTestDeployPipeline_001.mmd](10_DevTestDeployPipeline_001.mmd)

Nodges basiert auf einer Single Source of Truth (SSoT) auf WSL2 ext4 (`/home/unixusername/nodges`), auf die zwei Arbeitsumgebungen synchron zugreifen:
- **conT:** Antigravity auf Windows 11 ueber das Netzlaufwerk `W:/`.
- **piCon:** Pi-Coding-Agent im Docker-Container `pi-harness` unter `/workspace`.

### 1.1 Entwicklungsbefehle (`package.json`)
```bash
# Vite-Entwicklungsserver starten (Standard-Port 5173)
npm run dev

# Manuelle Typenpruefung ohne Build
npm run typecheck

# Code-Analyse und Linting via Biome
npm run lint

# Automatische Formatierung via Biome
npm run format

# Vitest Unit-Tests im Watch-Modus
npm run test

# Vitest grafisches Dashboard im Browser
npm run test:ui

# Vitest Code-Coverage-Report
npm run test:coverage

# Playwright End-to-End Tests
npm run test:e2e

# Playwright interaktives UI-Dashboard
npm run test:e2e:ui

# Zod JSON-Schema Export
npm run export:schema

# LightRAG Backend-Server starten (Port 8000)
npm run lightrag
```

---

## 2. Tooling: Biome und Typensicherheit

Seit Version 0.106.4 ersetzt **Biome 1.9.4** fruehere Einzellinter (wie ESLint/Prettier):
- **Geschwindigkeit:** Biome analysiert und formatiert das gesamte Repository in Millisekunden.
- **Konfiguration (`biome.json`):** Einheitliche Einrueckungen (4 Spaces), Verbot ungenutzter Variablen, strenge Typpruefungen und automatische Import-Sortierung.
- **TypeScript 5.3.3:** Strikte Compiler-Optionen (`strict: true`, `noImplicitAny: true`) in `tsconfig.json` verhindern unbemerkte Typen-Divergenzen.

---

## 3. Qualitaetssicherung und Test-Pyramide

Die Teststrategie von Nodges gliedert sich in drei Saeulen:

```
          / \
         /   \      Playwright E2E-Tests (Browser-Rendering, Interaktion)
        / E2E \     npm run test:e2e
       /───────\
      /  Integ  \   Zod-Schema Export & Parser-Tests
     /───────────\  npm run export:schema
    /    Unit     \ Vitest Unit-Tests (Manager, Utils, State)
   /───────────────\npm run test
```

### 3.1 Unit-Tests mit Vitest 1.6.1
- Tests liegen unter `src/tests/` und spiegeln die Modulstruktur wider.
- **Mocking externer Inferenz:** Reale Netzwerkaufrufe zu LLM-Providern sind in der Test-Suite verboten. `LLMService` wird ueber standardisierte Mocks simuliert, um deterministisches Verhalten bei JSON-Fehlern, Netzwerkabbruechen (HTTP 500) und Rate-Limits (HTTP 429) zu verifizieren.

### 3.2 End-to-End Tests mit Playwright 1.58.2
- Prueft das Zusammenspiel zwischen WebGL-Canvas, Three.js-Szenengraph und UI-Overlays im echten Headless-Browser.
- Validiert, dass Klicks auf Knoten das Informationspanel oeffnen und das Laden von JSON-Dateien zu gueltigen `InstancedMesh`-Strukturen fuehrt.

---

## 4. Der verbindliche Git- und Release-Workflow (`tools/nodges-git.sh`)

Um Fehlkonfigurationen und Branch-Divergenzen zwischen den Harnesses auszuschliessen, gilt seit Version 0.106.5 ein streng standardisierter Ablauf:

| Befehl | Auswirkung | Remote-Push |
|---|---|---|
| `bash tools/nodges-git.sh status` | Zeigt Branch, Version, Git-Tag, Commit-Abstand zu GitHub und geaenderte Dateien. | Nein |
| `bash tools/nodges-git.sh save` | Erhoeht die Patch-Version (`0.106.7` -> `0.106.8`), fuehrt `git add -A` aus und committet lokal mit der Versionsnummer als Nachricht. | Nein |
| `bash tools/nodges-git.sh release` | Erhoeht die Minor-Version (`0.106.8` -> `0.107.0`), fuehrt Typecheck und Tests aus, setzt ein Git-Tag `v0.107.0` und pusht nach `origin/main`. | **Ja** |
| `bash tools/nodges-git.sh hooks` | Aktiviert die versionierten Git-Hooks (`core.hooksPath = git-hooks`). | Nein |

### 4.1 Versionierte Git-Hooks (`git-hooks/`)
- **`pre-commit`:** Verhindert Commits auf falschen Branches, blockiert sensible Zugangsdaten (API-Keys) in der Stage und prueft den Versionsabgleich.
- **`pre-push`:** Blockiert jeden Push von Patch-Versionen nach GitHub (Ausnahme nur bei explizitem `NODGES_ALLOW_PUSH=1`). **Regel: Zwischenstaende bleiben lokal; nur Minor- und Major-Releases gehen nach GitHub.**
- **`post-commit`:** Informiert ueber den aktuellen lokalen Commit-Vorsprung gegenueber dem GitHub-Meilenstein-Archiv.

---

## 5. Fehlertoleranz und Ausfallsicherheit (Resilience)

> **Visualisierung:** Siehe [10_ErrorHandlingResilience_002.mmd](10_ErrorHandlingResilience_002.mmd)

- **Transaktionssichere Szene:** Schlaegt das Einlesen oder Parsen neuer Graphdaten fehl, bricht `App.loadGraphData` ab, ohne die bestehende 3D-Visualisierung zu leeren (`clearScene` erfolgt erst nach erfolgreicher Validierung).
- **Zentraler Error-Bus:** Alle Fehler werden an den `CentralEventManager` und das Toast-System uebergeben, um Benutzer ueber Netzwerk- oder Schemaprobleme zu informieren, ohne die Anwendung einfrieren zu lassen.
