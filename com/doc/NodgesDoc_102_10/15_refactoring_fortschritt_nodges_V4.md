# Nodges – Refactoring-Fortschritt (App.ts entschlacken)

Dieses Kapitel protokolliert den schrittweisen Umbau von `src/App.ts` (God-Object, 1737 Zeilen) in kleinere, testbare Dienste. Jeder Schritt wird nachvollziehbar dokumentiert und gegen Typecheck (tsc), Vite-Build und Tests verifiziert.

## Zielarchitektur

`App` wird zu einem dünnen, komponierten Einstiegspunkt, der ausgelagerte Services nur noch verdrahtet:

| Auszulagernde Verantwortung | Zielservice | Status |
|-----------------------------|-------------|--------|
| Minimap (Kamera, Marker, Zoom/Pan, Render-Pass) | `src/core/MinimapManager.ts` | ✅ erledigt |
| 3D-Szenen-/Renderer-Initialisierung (inkl. WebGL-Fallback, Lichter, Boden) | `src/core/SceneFactory.ts` | ✅ erledigt |
| Render-Loop (Haupt- und Minimap-Pass) | `RenderPipeline` | 🔄 offen |
| Datenladen/-entfernen (`loadGraphData`, `removeData`, `newGraph`, Schema-Merging, Metriken) | `GraphLoaderService` | 🔄 offen |
| Visual-Mapping-Anwendung (Preview/Takeover, Layout-Trigger, Label-Pflege) | `MappingCoordinator` | 🔄 offen |
| Datei-/Datenbank-Operationen über die Dev-API | `Repository`/`DataSource` | 🔄 offen |
| Aufarbeitung der TypeScript-Fehler (140 → 0) | siehe unten | ✅ erledigt |

## Verifikations-Baseline

Vor dem Umbau bestanden im Projekt **bereits 140 TypeScript-Fehler** (überwiegend in `BuildFormatUtils.ts`, Testdateien, `NodeManager.ts`). Das Projekt `npm run build` (`tsc && vite build`) schlägt deshalb am `tsc`-Schritt fehl. `npm run test` läuft (esbuild, kein Typecheck) mit 224 bestandenen und 30 fehlgeschlagenen Tests; die 30 Fehler sind vorbestehend (29× OpenRouter-API-Aufruf ohne Key in `LLMAutomated.test.ts`, 1× fehlende Datendatei in `debugParse.test.ts`).

**Regel für alle Schritte:** Neue Änderungen dürfen die Gesamtzahl der TypeScript-Fehler (140) und der Testfehler (30) nicht erhöhen.

> **Stand (Aufarbeitung abgeschlossen):** Die 140 TypeScript-Fehler wurden vollständig auf 0 reduziert. `npm run build` (tsc + vite build) läuft jetzt erfolgreich durch. Zusätzlich wurden die 30 vorbestehenden Testfehler behoben bzw. geordnet übersprungen: `npm run test` läuft nun ohne Fehler durch (232 bestanden, 31 übersprungen).

## Schritt 1 – MinimapManager (erledigt)

### Änderungen
- **Neue Datei** `src/core/MinimapManager.ts`: kapselt MinimapUI, orthografische Top-Down-Kamera, Kamera-Marker, Zoom-/Pan-Interaktion, `setView`/`reset` und den zweiten Render-Pass (Scissor/Viewport, DPR, Label-Umschaltung).
- **`src/App.ts`:** entfernt die Felder `minimapUI`, `minimapCamera`, `minimapZoom`, `minimapCenter`, `cameraMarker` sowie die Methoden `createCameraMarker` und `updateMinimapCamera`. Die Initialisierung in `initGUI`, das Zentrieren beim Laden (`loadGraphData`), der Reset (`newGraph`) und der Render-Pass in `animate()` delegieren nun an `this.minimapManager`.
- **Follow-up (ergänzt):** `App.destroy()` ruft nun `this.minimapManager.dispose()` auf (entfernt Resize-Listener und Marker).
- **Neue Datei** `src/tests/MinimapManager.test.ts` (4 Tests, happy-dom): Kamera-Typ/Position, `setView`, `reset`, Render-Pass (Render mit Minimap-Kamera, Label-Wiederherstellung).

### Verifikation
- `npx tsc --noEmit`: keine neuen Fehler; Gesamtfehler unverändert 140.
- `npx vite build`: erfolgreich.
- `npx vitest run`: 231 bestanden, 30 vorbestehende Fehler (unverändert).

---

## Schritt 2 – SceneFactory (erledigt)

### Änderungen
- **Neue Datei** `src/core/SceneFactory.ts`: kapselt –
  - `createRenderer(onFatalError)`: mehrstufiger WebGL-Renderer-Fallback, bei Totalausfall Anzeige + Throw.
  - `setup(scene, camera, renderer, controls, options)`: Konfiguration von Darstellung, OrbitControls, Kamera-Bewegungs-Event (Raycasting-Pause), Lichter und Boden/Grid plus Resize-Listener; liefert `{ ambientLight, directionalLight, ground }`.
  - `createGround(scene)`: öffentlich, testbar.
- **`src/App.ts`:**
  - Konstruktor nutzt `SceneFactory.createRenderer(...)` (Fallback-Block entfernt).
  - `initThreeJS()` ruft `SceneFactory.setup(...)` und setzt `ambientLight`/`directionalLight`. Totes Kommentar-Licht (Minimap) entfernt.
  - `createGround()`-Methode und das ungenutzte `ground`-Feld entfernt.
- **Neue Datei** `src/tests/SceneFactory.test.ts` (3 Tests, happy-dom): `createGround` (Boden+Grid, Position) und `setup` (Rückgabestruktur mit Renderer-Stub).

### Verifikation
- `npx tsc --noEmit`: keine neuen Fehler; Gesamtfehler unverändert 140.
- `npx vite build`: erfolgreich.
- `npx vitest run`: 231 bestanden (7 neue Tests aus Schritt 1+2), 30 vorbestehende Fehler (unverändert).

---

## Schritt 3 – TypeScript-Fehler aufarbeiten (erledigt)

Die 140 vorbestehenden Fehler wurden vollständig auf 0 reduziert. Aufteilung:

### Quellcode (96 Fehler)
- **`BuildFormatUtils.ts` (18):** Legacy-Zugriff auf `dm.entities`/`dm.relationships` (Build-5-Felder, nicht im Zod-Schema) über einen typisierten `Build5DataModel`-Cast gelöst.
- **`NodeManager.ts` (4):** ungenutzte Variablen (`isPosMapped`, `colIndex`) entfernt; `isRandomFallback` im Position-Schema ergänzt (`src/types.ts`).
- **`EdgeObjectsManager.ts` (1):** ungenutzte Variable `edgeFade` entfernt.
- **`NodeCreationHandler.ts` (1):** fehlendes Pflichtfeld `relation` beim Kantenaufbau ergänzt (statt `type`).
- **`EdgeLabelManager.ts` (3):** `EdgeWithPosition`-Interface um `id`/`source`/`target` ergänzt.
- **`RaycastManager.ts` (1):** `getNodePosition` im `INodeManager`-Interface ergänzt.
- **`InfoPanelUI.ts` (2):** Group-Methoden (`createGroupNode`, `addNodeToGroup`, …) im `IStateManager`-Interface ergänzt.
- **`DevPanel.ts` (2):** `devPowerPreference`-Typ im State um `'default'` erweitert (UI bietet die Option bereits an).
- **`MappingUI.ts` (1):** toter Code entfernt (`layoutEnabled`-Feld + ungenutzte `setLayoutEnabled`).

### Testdateien (44 Fehler)
- Relationship-Literale um Pflichtfelder (`relation`, ggf. `id`) ergänzt oder `type`→`relation` umbenannt.
- `DataParser.test.ts`: Roh-Fixtures (nicht-normalisierte Eingaben) als `any` typisiert, um die Normalisierungs-Testintention zu erhalten.
- `VectorStoreManager.test.ts`: fehlendes `metadata.schemaVersion` ergänzt.
- `SelectionHandler.test.ts`: tote Variable `contextMenuHandler` entfernt.

### Verifikation
- `npx tsc --noEmit`: **0 Fehler** (vorher 140).
- `npm run build` (`tsc && vite build`): **erfolgreich** (vorher am tsc-Schritt gescheitert).
- `npx vitest run`: 231 bestanden, 30 vorbestehende Testfehler (unverändert, siehe Schritt 4).
- `npm run export:schema`: erfolgreich (Schema-Export nach `types.ts`-Änderung intakt).

---

## Schritt 4 – Vorbestehende Testfehler auflösen (erledigt)

Die 30 vorbestehenden Testfehler (2 Dateien) wurden behoben bzw. geordnet übersprungen, sodass der Testlauf wieder ohne Fehler durchläuft:

- **`src/tests/LLMAutomated.test.ts` (29):** Integrationstest mit echten OpenRouter-API-Aufrufen (29 Modelle × bis 240 s). Da ein echter Key in `.env` hinterlegt ist, liefen die Tests immer und verbrauchten Credits bzw. hingen. Die Datei dokumentiert selbst, dass der Test standardmäßig deaktiviert sein soll → `describe.skip`. Zusätzlich wurde der fehlerhafte Prompt-Pfad im fetch-Mock (`public/prompts` → `src/prompts`) korrigiert.
- **`src/tests/debugParse.test.ts` (1):** referenzierte eine nicht vorhandene B10-Datei. Der Test sucht nun dynamisch eine vorhandene B10-JSON im Verzeichnis und überspringt sich (mit Warnung), falls keine vorliegt.

### Verifikation (Schritt 4)
- `npx vitest run`: Test Files 17 bestanden | 1 übersprungen; Tests **232 bestanden | 31 übersprungen | 0 fehlgeschlagen**. Kein Hänger (die zuvor blockierenden Live-API-Calls sind deaktiviert).
- `npx tsc --noEmit`: 0 Fehler.

---

## Nächste Schritte (Empfehlung)

1. ~~**SceneFactory**~~ – erledigt (Schritt 2).
2. **RenderPipeline** – `animate()` aufteilen: Temporal-Update, Knoten-/Kanten-Updates, Camera-/Label-Update, Haupt-Pass, Minimap-Pass, FPS.
3. **GraphLoaderService** – Datenfluss kapseln und die doppelte Datenhaltung (`App.currentEntities` vs. `StateManager.state.graphData`) auflösen.
4. **MappingCoordinator** – Visual-Mapping-Anwendung und Layout-Trigger zentralisieren.

Nach der Auslagerung sollte `App.ts` auf einen Bruchteil der Zeilen schrumpfen und jeder neue Service einzeln testbar sein.
