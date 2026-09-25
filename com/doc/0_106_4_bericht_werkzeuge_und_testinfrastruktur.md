# Bericht: Evaluation der Test- und Toolchain-Infrastruktur

**Projekt:** Nodges (Three.js 3D Network Visualization)  
**Version:** 0.106.4  
**Datum:** 2026-09-24  
**Autor:** conT (Antigravity auf Laufwerk W:/)  
**Referenz:** [W:/com/bericht.md](file:///W:/com/bericht.md) (Teil H), [W:/com/todo.md](file:///W:/com/todo.md)

---

## 1. Management Summary

Entgegen der Annahme, dass im Repository bislang keine automatischen Tests existieren, verfuegt das Projekt bereits ueber eine beachtliche Testbasis:
- **20 Vitest-Unit-Testsuiten** mit **238 bestandenen Tests** in [W:/src/tests/](file:///W:/src/tests/).
- **4 Playwright-E2E-Suiten** in [W:/e2e/](file:///W:/e2e/) mit Three.js-Headless-WebGL-Konfiguration.

Der Grund fuer den Eindruck fehlender Testautomatisierung liegt darin, dass diese Tests ausschliesslich manuell gestartet werden koennen: Es existieren bisher **weder eine GitHub-Actions-Testpipeline**, noch **Git-Hooks (Pre-Commit / Pre-Push)**, noch laeuft Playwright im Docker-Container ohne vorherige Browser-Installation. Zusaetzlich fehlen elementare Entwicklerwerkzeuge fuer statische Codeanalyse (Linter), Code-Formatierung und Bundle-Groessenkontrolle.

---

## 2. Ist-Analyse der bestehenden Instrumente

### 2.1 Unit- und Integrationstests (Vitest)
- **Konfiguration:** [W:/vitest.config.ts](file:///W:/vitest.config.ts)
- **Testverzeichnis:** [W:/src/tests/](file:///W:/src/tests/)
- **Umfang:** 20 Testdateien (u.a. `DataParser.test.ts`, `LayoutManager.test.ts`, `ImportManager.test.ts`, `StateManager.test.ts`, `LightRAGService.test.ts`, `VisualMappingEngine.test.ts`).
- **Laufzeit-Status:** 238 Tests laufen im Docker-Container `pi-harness` via `npm test -- --run` in circa 6,3 Sekunden vollstaendig gruen durch.
- **Defizite:** Keine Coverage-Schwellenwerte (`coverage.thresholds`) definiert; keine automatische Pruefung im Pull-Request- oder Push-Prozess.

### 2.2 End-to-End- und Browser-Tests (Playwright)
- **Konfiguration:** [W:/playwright.config.ts](file:///W:/playwright.config.ts)
- **Testverzeichnis:** [W:/e2e/](file:///W:/e2e/)
- **Umfang:** 4 Spezifikationsdateien:
  - `01-app-load.spec.ts`: Pruefung von DOM-Mount, Canvas-Initialisierung und globalem `window.app`.
  - `02-sidebar-tabs.spec.ts`: Validierung von Sidebar-Tabs und Modi (Simple, Expert, Dev).
  - `03-graph-lifecycle.spec.ts`: Pruefung von Daten-Import, Knoten-/Kanten-Zaehlern und Reset.
  - `04-canvas-interaction.spec.ts`: Interaktion via OrbitControls (Maus-Drag, Zoom).
- **Laufzeit-Status:** Konfiguriert fuer Chromium mit WebGL-Flags (`--use-gl=angle`, `--enable-webgl`, `--ignore-gpu-blocklist`).
- **Defizite:** Im Docker-Container `pi-harness` fehlt der Chromium-Browser-Cache (`~/.cache/ms-playwright` ist leer), wodurch Testlaeufe im Container ohne vorherige Browser-Installation abbrechen.

### 2.3 Continuous Integration (CI / GitHub Actions)
- **Workflow:** [W:/.github/workflows/deploy.yml](file:///W:/.github/workflows/deploy.yml)
- **Inhalt:** Fuehrt bei Push auf `main` ausschliesslich `npm ci` und `npm run build` zur Bereitstellung auf GitHub Pages aus.
- **Defizit:** Weder Vitest noch Playwright oder ein TypeScript-Typecheck sind in die CI eingebunden. Fehlerhafter Code oder brechende Tests verhindern das Deployment derzeit nicht.

### 2.4 Code-Qualitaet und Formatierung
- **Linter:** Nicht vorhanden (weder ESLint noch Biome konfiguriert).
- **Formatter:** Nicht vorhanden (kein Prettier, keine `.editorconfig`).
- **Typ-Pruefung:** Nur indirekt ueber `npm run build` (`tsc && vite build`), kein separates `npm run typecheck`.

---

## 3. Ursachenanalyse der Wahrnehmung

Dass die Tests im Projekt bisher nicht wahrgenommen wurden, hat vier klare Ursachen:

1. **Fehlende Feedbackschleifen (CI):** Ein Entwickler oder Agent erhaelt von GitHub kein Feedback (rotes/gruenes Kreuz), ob Tests nach einem Commit bestanden wurden.
2. **Fehlende lokale Schranken (Git-Hooks):** Weder `git commit` noch der Push-Workflow `sgc` fuehren Tests aus. Commits mit Fehlern werden ungehindert angenommen.
3. **Plattform-Diskrepanz (Windows vs. Linux-Container):**
   - Das Netzlaufwerk `W:/` teilt sich dieselben Inodes mit `/workspace` im Docker-Container.
   - `node_modules` wurde im Linux-Container installiert. Ein Aufruf von `npx vitest` direkt in Windows scheitert an fehlenden nativen Windows-Rollup-Binaries.
   - Umgekehrt fehlt im Container die Browser-Installation fuer Playwright.
4. **Keine Sichtbarkeit im Terminal:** Solange Tests nicht proaktiv von Hand gestartet werden, bleiben sie unsichtbar.

---

## 4. Empfohlene Werkzeuge zur Steigerung von Komfort und Stabilitaet

Fuer ein Repository mit **TypeScript**, **Three.js** (WebGL-Visualisierung) und **Multi-Harness-Betrieb** (Windows-Host + Linux-Container) bieten die folgenden Instrumente den groessten Mehrwert:

### 4.1 Prioritaet 1: Verlaesslichkeit und Automatisierung

1. **GitHub Actions Verifizierungs-Workflow (`.github/workflows/verify.yml`):**
   - Trigger: Push auf `main` sowie alle Pull Requests.
   - Schritte:
     1. `npm ci`
     2. `npx tsc --noEmit` (Typ-Validierung)
     3. `npm run test:coverage` (Unit-Tests mit Vitest)
     4. `npx playwright install --with-deps chromium && npm run test:e2e` (E2E-Tests)
     5. `npm run build` (Build-Integritaet)

2. **Playwright-Browser im Container bereitstellen:**
   - Einmalige Ausfuehrung von `npx playwright install chromium` im Container `pi-harness`, um E2E-Tests auch containerintern voll ausfuehrbar zu machen.

3. **Dediziertes Typecheck-Skript:**
   - Eintrag in [W:/package.json](file:///W:/package.json): `"typecheck": "tsc --noEmit"`.
   - Schnelle Typ-Pruefung innerhalb von 1-2 Sekunden ohne Build-Overhead.

### 4.2 Prioritaet 2: Entwicklungs-Ergonomie und Code-Qualitaet

1. **Linter & Formatter (Empfehlung: `Biome`):**
   - **Warum Biome?** Extrem schnell (Rust-basiert), ersetzt sowohl ESLint als auch Prettier durch ein einziges Werkzeug.
   - Keine versionsbedingten Rollup-/Node-Inkompatibilitäten zwischen Windows und Linux.
   - Formatiert und lintet das gesamte Repository in Millisekunden.

2. **Gemeinsame `.editorconfig`:**
   - Erzwingt einheitliche Einrueckung (2 oder 4 Leerzeichen) und Zeilenenden (LF) ueber alle Editoren und Harnesses hinweg.

3. **Git-Hooks (`simple-git-hooks` oder `husky` + `lint-staged`):**
   - Fuehrt vor jedem Commit einen schnellen Check (`tsc --noEmit` und Biome-Lint) auf den geaenderten Dateien aus.
   - Da `.git/` physisch zwischen Windows und Container geteilt wird, schuetzt der Hook beide Arbeitsumgebungen gleichermassen.

### 4.3 Prioritaet 3: Spezialwerkzeuge fuer Three.js und Codebasis-Hygiene

1. **Vite Bundle Visualizer (`rollup-plugin-visualizer`):**
   - Generiert einen visuellen HTML-Report der Bundle-Groessen.
   - Essenziell fuer Projekte mit Three.js und PDF.js, um unnoetige transitive Abhaengigkeiten und unzureichendes Tree-Shaking aufzudecken.

2. **Codebasis-Hygiene (`knip`):**
   - Findet ungenutzte Exporte, verwaiste Typen und ungenutzte Dateien in den ueber 90 TypeScript-Dateien.

3. **Three.js Performance-Overlay im Dev-Modus (`stats.js` / Renderer-Info):**
   - Einblendung von FPS, Draw-Calls, Dreiecken und Texturen direkt im Canvas. Hilft Entwicklern und KI-Agenten, Performance-Regressionen bei Graph-Renderings sofort visuell zu beurteilen.

4. **Visuelle Regressionstests in Playwright (`toHaveScreenshot`):**
   - Automatisierter Screenshot-Vergleich von 3D-Canvas-Renderings, um Shader-Fehler, Farbraum-Verschiebungen oder Geometrie-Glitches automatisiert abzufangen.

### 4.4 Was ausdruecklich NICHT empfohlen wird
- **`commitlint` / Conventional Commits:** Kollidiert mit den automatisierten Release- und Versionsnummer-Commits des bestehenden Handover-Workflows (`sgc` committet mit Version wie `0.106.4`).

---

## 5. Massnahmenkatalog

| Phase | Massnahme | Primaerer Nutznießer | Geschaetzter Aufwand |
|---|---|---|---|
| **Phase 1** | Container-Playwright via `npx playwright install chromium` aktivieren | piCon / conT | 5 Minuten |
| **Phase 1** | CI-Workflow `verify.yml` fuer Tests & Typecheck anlegen | Alle / GitHub | 15 Minuten |
| **Phase 2** | Skript `"typecheck": "tsc --noEmit"` in `package.json` | conT / piCon | 2 Minuten |
| **Phase 2** | Biome (Linter & Formatter) einrichten | Code-Qualitaet | 15 Minuten |
| **Phase 2** | `.editorconfig` definieren | conT / piCon | 5 Minuten |
| **Phase 3** | `rollup-plugin-visualizer` in Vite integrieren | Build-Optimierung | 10 Minuten |
| **Phase 3** | Pre-Commit Git-Hook fuer Staged Files | Automatischer Schutz | 15 Minuten |

---

## 6. Nachtrag piCon (2026-09-24) — Praezisierungen aus dem Container

Anlass: Abgleich dieses Berichts mit `com/doc/0_106_4_tooling_bestandsaufnahme.md`, `bericht.md` Teil H und `com/todo.md`. Alles Folgende im Container `pi-harness` selbst nachgeprueft, Stand Version 0.106.4. Der Text oben bleibt unveraendert, damit conT seine Formulierungen wiedererkennt.

1. **`@playwright/test` fehlt in `node_modules` vollstaendig.** Das Paket ist in `package.json` deklariert, aber nicht installiert: `node_modules/.bin/playwright` existiert nicht, `npm ls @playwright/test` liefert `(empty)`. Abschnitt 2.2 und der Massnahmenkatalog nennen nur den leeren Browser-Cache. `npm run test:e2e` scheitert damit schon einen Schritt frueher, die korrekte Reihenfolge lautet `npm install`, danach `npx playwright install chromium`. Die Massnahme in Phase 1 ist entsprechend zweistufig.
2. **Zaehlung der Vitest-Dateien.** Abschnitt 2.1 nennt 20 Testdateien, Abschnitt 1 nennt 20 Suiten. Tatsaechlich liegen in `src/tests/` 19 Dateien nach dem Muster `*.test.ts` plus `setup.ts`, also 20 Dateien. Die Angabe "238 bestandene Tests" ist korrekt und wurde reproduziert, dazu 3 uebersprungene Tests (eine uebersprungene Datei), Laufzeit 6,36 s.
3. **Tests sind nur im Container lauffaehig.** Die Plattform-Diskrepanz aus Abschnitt 3 hat eine Folge, die im Massnahmenkatalog fehlt: conT kann Vitest und Playwright auf `W:/` nicht lokal starten, weil die unter Linux installierten nativen Rollup-Binaries unter Windows fehlen. Fuer conT ist der CI-Workflow (Phase 1) deshalb keine Komfortfrage, sondern die einzige Rueckmeldung. Ein beilaeufiges `npm install` unter Windows wuerde die Linux-Installation in `node_modules` ueberschreiben und den Container lahmlegen; conT braucht dafuer eine getrennte Installation.

Nicht bewertet, weil vom Container aus nicht pruefbar: Abschnitt 4.3 Nummer 3 (`stats.js`-Overlay) und Nummer 4 (visuelle Regression via `toHaveScreenshot`). Zur visuellen Regression eine Ergaenzung aus dem Abgleich: WebGL-Screenshotvergleiche laufen unter swiftshader erfahrungsgemaess instabil und brauchen Toleranzen, der Punkt ist also mit Vorsicht zu behandeln.

*Geprueft von piCon, Werte aus `npm test -- --run` im Container, Version 0.106.4.*
