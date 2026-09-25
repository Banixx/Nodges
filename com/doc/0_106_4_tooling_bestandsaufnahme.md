# Tooling-Bestandsaufnahme Nodges (v0.106.4)

**Datum:** 2026-09-24  
**Erstellt von:** conT (Antigravity)  
**Anlass:** Pruefung, ob das Repository die richtigen Entwicklungswerkzeuge enthaelt.

---

## 1. Vorhandene Werkzeuge (korrekt und passend)

| Werkzeug | Version | Bewertung |
|---|---|---|
| **Vitest** | 1.6.1 | Richtige Wahl fuer Vite-Projekte, 19 Testdateien vorhanden |
| **Playwright** | 1.63.0 | Richtige Wahl fuer E2E mit WebGL, 4 Specs vorhanden |
| **@testing-library/dom** | 10.4.1 | Sinnvolle Ergaenzung |
| **happy-dom + jsdom** | vorhanden | Doppelt -- eines wuerde reichen, aber schadet nicht |
| **TypeScript strict** | 5.9.3 | `strict: true` plus `noUnusedLocals/Parameters` -- guter Ersatz fuer einen Teil von ESLint |
| **Zod** | 3.22.4 | Laufzeit-Validierung, passt |
| **Vite** | 5.4.21 | Frontend-Dev-Server und Bundler |
| **Three.js** | 0.161.0 | 3D WebGL Rendering-Engine |
| **@tweenjs/tween.js** | 18.6.4 | Interpolations- und Animations-Engine |
| **lil-gui** | 0.19.2 | Debug- und Kontroll-UI |
| **pdfjs-dist** | 4.10.38 | PDF-Verarbeitung |

### Testdateien (19 Unit-Tests, 4 E2E-Tests)

**Vitest (Unit/Integration) in `src/tests/`:**
- DataParser, debugParse, ErrorHandler_5, ExportManager, exportSchema
- ImportManager, LayoutManager, LightRAGService, LLMAutomated, LLMService_5
- MinimapManager, SceneFactory, SelectionHandler, SourceDocumentParser
- StateManager, StateManagerGroups, types_5, VectorStoreManager, VisualMappingEngine

**Playwright (E2E) in `e2e/`:**
- 01-app-load, 02-sidebar-tabs, 03-graph-lifecycle, 04-canvas-interaction

---

## 2. Was fehlt und spuerbar waere

### 2.1 Linting -- Biome (empfohlen statt ESLint)

Aktuell gibt es **keinen Linter** im Projekt. Weder ESLint noch eine Alternative ist installiert oder konfiguriert.

**Empfehlung:** Biome (`@biomejs/biome`) statt ESLint+Prettier. Gruende:
- Vereint Linter und Formatter in einem einzigen Tool
- Massiv schneller als ESLint+Prettier
- Kaum Konfiguration noetig
- Fuer ein Three.js/Vite-Projekt ohne React-JSX-Sonderwuensche die pragmatischere Wahl

### 2.2 Code-Formatierung

Aktuell gibt es **keinen Formatter**. Weder Prettier noch eine Alternative ist vorhanden.

Bei Wahl von Biome entfaellt dieser Punkt, da Formatting dort integriert ist.

### 2.3 Git-Hooks -- Husky + lint-staged

Aktuell kann beliebiger Code committed werden, ohne dass irgendeine Pruefung laeuft. In `.git/hooks/` existieren ausschliesslich die ungenutzten Standard-Sample-Skripte.

**Empfehlung:** `husky` mit `lint-staged` wuerde vor jedem Commit automatisch Formatting und Linting auf geaenderte Dateien anwenden. Verhindert, dass kaputte Formatierung oder offensichtliche Fehler ins Repo gelangen.

### 2.4 CI/CD Quality-Gate

Der GitHub-Actions-Workflow (`deploy.yml`) deployt direkt nach `tsc && vite build` ohne jeglichen Test. Das bedeutet: Selbst wenn alle 19 Unit-Tests und 4 E2E-Tests fehlschlagen, wird trotzdem deployed.

**Empfehlung:** Ein `npm test`-Schritt (mindestens `npx vitest run`) vor dem Build waere das Minimum.

### 2.5 Kleinigkeiten

- Das npm-Script `gen:data` verweist auf `scripts/generate-test-data.cjs`, das **nicht existiert** -- toter Verweis.
- Die E2E-Tests unter `e2e/` sind **nicht in der tsconfig.json** enthalten -- der TypeScript-Compiler prueft sie nicht.

---

## 3. Optional -- nicht zwingend noetig

| Werkzeug | Zweck | Einschaetzung |
|---|---|---|
| **Changesets** | Automatisierte Versionierung und Changelogs | Bereits ueber `sgc` geloest, eher unnoetig |
| **Storybook** | Isolierte UI-Komponentenentwicklung | Passt eher zu React/Vue, weniger zu reinem Three.js |
| **Bundlesize / size-limit** | Bundle-Groesse ueberwachen | Sinnvoll, wenn Performance kritisch wird |
| **Lighthouse CI** | Automatisierte Performance-Audits | Interessant, aber erst wenn die App stabil deployed |
| **Renovate / Dependabot** | Automatische Dependency-Updates | Nuetzlich, aber das Repo hat wenige Abhaengigkeiten |

---

## 4. Empfehlung in Kurzform (priorisiert)

Die hoechste Hebelwirkung haetten diese drei Schritte in dieser Reihenfolge:

1. **Biome einrichten** -- Linting + Formatting in einem Schritt, ca. 5 Minuten Setup
2. **CI-Pipeline erweitern** -- `npx vitest run` vor dem Deploy einfuegen
3. **Husky + lint-staged** -- Pre-Commit-Hooks fuer automatische Qualitaetssicherung

Die Test-Infrastruktur (Playwright, Vitest) ist vollstaendig vorhanden und korrekt konfiguriert. Die eigentliche Luecke liegt nicht bei den Testframeworks, sondern bei der Qualitaetssicherung drumherum.
