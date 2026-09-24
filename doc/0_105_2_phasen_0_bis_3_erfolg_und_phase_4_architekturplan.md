# Zwischenbericht Phasen 0 bis 3 & Architekturplan Phase 4

Dokumentenversion: 0.105.2  
Arbeits-Branch: refactor/pi-stabilization  
Ausfuehrung: Google Antigravity (Gemini Flash)  
Datum: 2026-09-22  

---

## 1. Erfolgreich ausgefuehrte Phasen (0 bis 3)

### Phase 0: Stand synchronisieren & Branching
- Arbeits-Branch `refactor/pi-stabilization` basierend auf `origin/pi` angelegt.
- Veraltetes `Pre-Plan_v3` entfernt; `Pre-Plan_v4_Nodges_Diagnose_Refactoring.md` im Projekt-Root und im `doc/`-Ordner bereitgestellt.

### Phase 1: Datenbereinigung & Gitignore
- **Commit `54a5f9e`:** 68 geloeschte Mega-JSONs, temporale Dumps und Fehler-Logs (`beautiful_sphere.json`, `temporal_500_nodes.json`, `LLM_ERROR_RAW_*`, etc.) mit 1.162.825 Zeilen Entfernung committet.
- **Commit `1c918f1`:** [.gitignore](file:///C:/Users/ich/Desktop/code/_projects/Nodges/.gitignore) erweitert um:
  - `public/data/generated/`
  - `public/data/b10/`, `b12/`, `b13/`, `b6/`, `b7/`, `b8/`, `g35/`, `temporal/`

### Phase 2: Bundle-Optimierung & Start-Graph
- **Commit `2df4044`:**
  - [FilePanelUI.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/FilePanelUI.ts): `import.meta.glob('/public/data/**/*.json', { query: '?url' })` entschaerft. Vite buendelt JSON-Dateien nicht mehr als JS-Module.
  - [App.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts): `loadDefaultData()` laedt standardmaessig `data/archiv/small.json`.
  - **Messergebnis:** Build-Dauer von 18,7s auf 8,5s reduziert. Chunks fuer Einzeldateien auf 0,14 kB geschrumpft.

### Phase 3: Stabilisierung & Dead-Code-Bereinigung
- **Knip-Analyse:** Dokumentiert unter [0_105_2_knip_analyse.md](file:///C:/Users/ich/Desktop/code/_projects/Nodges/doc/0_105_2_knip_analyse.md).
- **Commit `8d60d9b`:** Ungenutzte Dateien `deno-proxy/` und `src/workers/layout-worker.js` entfernt.
- **Test-Status:** 18 Test-Suites (238 Tests) gruen, 0 Fehler.
- **TypeScript:** 0 Typfehler.
- **LightRAG-Health-Check:** Erfolgreich geprueft (`status: online`, `lightrag_engine_active: true`).

---

## 2. Architekturplan fuer Phase 4: Drei-Layer-Refactoring von `src/App.ts`

### Status Quo
[App.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts) umfasst 1.488 Zeilen und erfuellt aktuell vier unterschiedliche Aufgaben:
1. Bootstrapping & DI-Container (`ServiceContainer`)
2. Datenladeschicht & Schema-Normalisierung (`loadGraphData`, `loadData`, `addData`, `removeData`, Metriken)
3. Three.js-Szenenaufbau & Rendering (`calculateBounds`, `createNodes`, `createEdges`, `applyVisualBalance`)
4. UI- und Event-Verdrahtung (`initGUI`, `setupEnvironmentSubscriptions`, `displayVersion`)

### Zielarchitektur: Entkopplung in 3 Layer

```
                     +---------------------------+
                     |         src/App.ts        |
                     |  (< 250 Zeilen Bootstrap) |
                     +-------------+-------------+
                                   |
         +-------------------------+-------------------------+
         |                         |                         |
         v                         v                         v
+------------------+     +-------------------+     +------------------+
|   Data Layer     |     |   Engine Layer    |     |     UI Layer     |
| (DataManager.ts) |     | (RenderEngine.ts) |     | (UIManager /     |
|                  |     |                   |     |  Interaction)    |
| - loadData()     |     | - SceneFactory    |     | - FilePanelUI    |
| - parse / schema |     | - NodeManager     |     | - CreatePanel    |
| - state syncing  |     | - EdgeObjectsMgr  |     | - EventManager   |
| - metrics        |     | - Layout / Camera |     | - Subscriptions  |
+------------------+     +-------------------+     +------------------+
```

### Konkrete Schritte in Phase 4

1. **Erstellung von `src/core/DataManager.ts`:**
   - Extraktion der Methoden `loadData`, `loadGraphData`, `addData`, `removeData`, `newGraph`, `calculateDerivedData`, `rebuildMergedSchema`, `computeGraphMetrics`.
   - Registrierung als Service im `ServiceContainer`.
2. **Erstellung von `src/core/RenderEngine.ts`:**
   - Kapselung der Three.js-Objektgenerierung: `createNodes`, `createEdges`, `calculateBounds`, `applyVisualBalance`, Renderer-Recreation.
3. **Schrumpfen von `src/App.ts`:**
   - Verschlankung auf Initialisierung, Dependency-Injection und Event-Routing (< 250 Zeilen).
4. **Verifikation nach jedem Schritt:**
   - `npx tsc --noEmit`
   - `npm run test -- --run`
   - `npm run build`
