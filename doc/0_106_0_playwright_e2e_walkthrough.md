# Walkthrough: Playwright E2E-Testing Setup fuer Nodges

In diesem Walkthrough wird die vollstaendige Einrichtung und erfolgreiche Ausfuehrung von [Playwright](https://playwright.dev/) als End-to-End- und Browser-Test-Framework fuer [Nodges](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts) dokumentiert.

---

## 1. Durchgefuehrte Aenderungen

### 1.1 Abhaengigkeiten und Build-Skripte
- `@playwright/test` wurde als Entwicklungsabhaengigkeit installiert.
- Der Chromium-Browser inklusive Headless Shell und FFmpeg wurde via `npx playwright install chromium` lokal eingerichtet.
- In [package.json](file:///C:/Users/ich/Desktop/code/_projects/Nodges/package.json) wurden die E2E-Befehle ergaenzt:
  - `npm run test:e2e`: Headless-Ausfuehrung im Terminal.
  - `npm run test:e2e:ui`: Interaktives Playwright-Test-Dashboard mit Zeitleiste und DOM-Inspektion.
  - `npm run test:e2e:headed`: Testausfuehrung im sichtbaren Browserfenster.

### 1.2 Konfiguration
- [playwright.config.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/playwright.config.ts) wurde erstellt:
  - Zielverzeichnis: `./e2e`
  - Automatische Anbindung an den lokalen Vite-Dev-Server auf Port 5173.
  - Aktivierung von WebGL-Flags (`--use-gl=angle`, `--enable-webgl`, `--ignore-gpu-blocklist`) fuer stabiles Three.js-Rendering in Headless-Umgebungen.
- [vitest.config.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/vitest.config.ts) wurde aktualisiert:
  - `include: ['src/tests/**/*.{test,spec}.ts']` und `exclude: ['e2e/**', ...]` isolieren die Vitest-Unit-Tests strikt von den Playwright-Browser-Tests.

### 1.3 Neue E2E-Testsuiten
Im Verzeichnis [e2e](file:///C:/Users/ich/Desktop/code/_projects/Nodges/e2e) wurden vier strukturierte Testdateien implementiert:

1. **[01-app-load.spec.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/e2e/01-app-load.spec.ts):**
   - Verifiziert den Page-Load auf `http://localhost:5173`.
   - Prueft das Three.js-WebGL-`<canvas>`-Element im DOM.
   - Kontrolliert das globale `window.app`-Objekt (Scene, StateManager).
   - Stellt sicher, dass keine ungefangenen JavaScript-Laufzeitfehler auftreten.

2. **[02-sidebar-tabs.spec.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/e2e/02-sidebar-tabs.spec.ts):**
   - Testet das Umschalten aller Sidebar-Tabs (System, Files, Ansicht, Dev).
   - Testet den Wechsel der UI-Modi (Simple, Expert, Dev) und die dynamische Freischaltung modusspezifischer Tabs.

3. **[03-graph-lifecycle.spec.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/e2e/03-graph-lifecycle.spec.ts):**
   - Speist einen Testgraphen ueber `loadGraphData` in die laufende App-Instanz ein.
   - Verifiziert die Aktualisierung der Zaehler `#fileNodeCount` (3 Knoten) und `#fileEdgeCount` (2 Kanten).
   - Prueft das Zuruecksetzen des Projekts ueber `window.app.newGraph()`.

4. **[04-canvas-interaction.spec.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/e2e/04-canvas-interaction.spec.ts):**
   - Fuehrt Maus-Drag-Gesten auf dem Canvas aus und verifiziert die Drehung der 3D-Kamera via OrbitControls.
   - Fuehrt Mausrad-Zoom aus und verifiziert die Abstandsveraenderung der Kamera zum Zielpunkt.

---

## 2. Testergebnisse

### 2.1 Playwright E2E-Tests (`npm run test:e2e`)
Alle 6 Tests in 4 Dateien wurden erfolgreich in 27,1 Sekunden abgeschlossen:

```
> nodges@0.106.0 test:e2e
> playwright test

Running 6 tests using 1 worker

  ok 1 [chromium] › e2e\01-app-load.spec.ts:4:3 › 01 - App Initialisierung & Basis-Render › sollte die App laden, Three.js-Canvas initialisieren und window.app bereitstellen (3.1s)
  ok 2 [chromium] › e2e\02-sidebar-tabs.spec.ts:9:3 › 02 - Sidebar Tabs & UI-Modi › sollte zwischen den Sidebar-Tabs wechseln koennen (3.1s)
  ok 3 [chromium] › e2e\02-sidebar-tabs.spec.ts:31:3 › 02 - Sidebar Tabs & UI-Modi › sollte den UI-Modus umschalten koennen (Simple, Expert, Dev) (3.9s)
  ok 4 [chromium] › e2e\03-graph-lifecycle.spec.ts:9:3 › 03 - Graph Daten-Lifecycle & State-Synchronisation › sollte Graphdaten ueber loadGraphData laden, StateManager befuellen und UI-Zaehler aktualisieren (5.5s)
  ok 5 [chromium] › e2e\04-canvas-interaction.spec.ts:9:3 › 04 - Canvas & 3D-Kamera-Interaktion › sollte Maus-Drag-Interaktion auf dem Canvas verarbeiten und Orbit-Kamera drehen (4.9s)
  ok 6 [chromium] › e2e\04-canvas-interaction.spec.ts:49:3 › 04 - Canvas & 3D-Kamera-Interaktion › sollte Mausrad-Zoom auf dem Canvas ohne Fehler ausfuehren (3.9s)

  6 passed (27.1s)
```

### 2.2 Vitest-Unit-Tests (`npm run test -- --run`)
Die bestehende Unit- und Logik-Testsuite laeuft weiterhin ohne Regressionen durch:

```
 Test Files  18 passed | 1 skipped (19)
      Tests  238 passed | 3 skipped (241)
   Duration  3.23s
```
