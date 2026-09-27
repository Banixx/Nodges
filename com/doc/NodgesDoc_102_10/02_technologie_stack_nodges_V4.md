# Nodges – Technologie-Stack

## 1. Überblick

| Bereich | Technologie | Version |
|---------|-------------|---------|
| Sprache | TypeScript | 5.3.3 |
| Build / Dev-Server | Vite | 5.1.4 |
| 3D-Engine | Three.js | 0.161.0 |
| 3D-Typen | @types/three | 0.161.2 |
| Animation | @tweenjs/tween.js | 18.6.4 |
| GUI (Debug) | lil-gui | 0.19.1 |
| Datenvalidierung | Zod | 3.22.4 |
| Schema-Export | zod-to-json-schema | 3.25.2 |
| Tests | Vitest | 1.6.1 |
| Test-Umgebungen | jsdom / happy-dom | 28.0.0 / 20.6.1 |
| Test-Abdeckung | @vitest/coverage-v8 | 1.6.1 |
| HTTP (Middleware) | body-parser | 2.3.0 |
| Laufzeit-Typen | @types/node | 20.11.19 |

**Backend (optional):**
- **LightRAG:** Python/FastAPI (`lightrag-backend`).
- **Proxy:** Deno (`deno-proxy`) zur Umgehung von CORS für externe LLM-APIs.

## 2. Abhängigkeiten aus `package.json`

**Runtime (`dependencies`):**
- `@tweenjs/tween.js` – Tweening für sanfte Animationen (Kameras, Effekte).
- `lil-gui` – kleines GUI-Framework, u. a. für Dev-Panel-Regler.
- `three` – 3D-Rendering-Pipeline.
- `zod` – Schema-Validierung des Graph-Datenmodells.
- `zod-to-json-schema` – Export des Zod-Schemas als JSON-Schema (`nodges_schema.json`).

**Entwicklung (`devDependencies`):**
- `@testing-library/dom` – DOM-Testhelfer.
- `@types/*` – Typdefinitionen.
- `@vitest/coverage-v8`, `@vitest/ui` – Coverage- und UI-Report.
- `body-parser` – JSON-Parsing der Dev-Server-Middleware.
- `happy-dom` / `jsdom` – DOM-Simulationen für Tests.
- `typescript`, `vite`, `vitest`.

## 3. NPM-Skripte

| Skript | Befehl | Zweck |
|--------|--------|-------|
| `dev` | `vite` | Startet den Dev-Server (Host 0.0.0.0, Port 5173) |
| `build` | `tsc && vite build` | Typprüfung + Produktions-Build nach `dist/` |
| `preview` | `vite preview` | Vorschau des Builds |
| `gen:data` | `node scripts/generate-test-data.cjs` | Erzeugt Testdaten |
| `test` | `vitest` | Startet die Tests (Watch) |
| `test:ui` | `vitest --ui` | Tests mit Browser-UI |
| `test:coverage` | `vitest --coverage` | Tests mit Coverage-Report |
| `export:schema` | `vitest run src/tests/exportSchema.test.ts` | Exportiert das JSON-Schema |
| `lightrag` | Python-Call auf das Backend | Startet LightRAG-API |

## 4. Module-System und Bundling

- `"type": "module"` – das Projekt nutzt ES-Module.
- Vite `alias`: `@` → `./src`.
- `dedupe: ['three']` verhindert doppelte Three.js-Instanzen.
- `optimizeDeps.include: ['three']` mit `force: true` optimiert das Pre-Bundling.
- `resolveJsonModule` ermöglicht den Direktimport von `package.json` in `App.ts` (Versionsanzeige).

## 5. Build-Konfiguration (Vite)

Siehe `vite.config.ts`. Wichtige Punkte:
- `base: './'` – relative Pfade für Deployment auf GitHub Pages.
- `server.host: '0.0.0.0'`, `strictPort: true`.
- **Proxy:** `/lightrag-api` → konfigurierbares Target (Default `http://host.docker.internal:8000`, da LightRAG im DevContainer-Umfeld auf dem Windows-Host läuft). Fehler erzeugen bei `res` ein `503 offline`-JSON, damit das Frontend einen Offline-Zustand erkennt.
- **Middleware-API:** eingebaute Endpunkte `/api/save_graph`, `/api/list_files`, `/api/create_database`, `/api/delete_file` (Details in Kapitel 09).
- **Watch:** `usePolling` (Container-kompatibel), ignoriert generierte Datenordner.
- `build.outDir: 'dist'`, `sourcemap`, `manifest`, `emptyOutDir`.

## 6. TypeScript-Konfiguration

Siehe `tsconfig.json`: streng typisierte Vite-Anwendung, JSX-frei, Bundler-Module-Resolution, DOM- und Worker-Typen, `resolveJsonModule`, Pfad-Alias `@`.

## 7. Vitest-Konfiguration

Siehe `vitest.config.ts`:
- `globals: true` – globale Test-APIs.
- `environment: 'node'` – Tests laufen ohne DOM (geeignet für Three.js-Logik).
- `setupFiles: './src/tests/setup.ts'`.
- `coverage` mit v8-Provider, über mehrere Empfänger (text, json, html).
- Ausgeschlossene Pfade: `node_modules`, `src/tests`, `*.d.ts`, `*.config.*`, `mockData`, `dist`.

---

*Weiter: `/workspace/com/doc/03_projektstruktur_nodges_V4.md`.*
