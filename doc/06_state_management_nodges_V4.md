# Nodges – State-Management

## 1. Rolle des StateManager

`src/core/StateManager.ts` ist der **zentrale Zustandsspeicher (Single Source of Truth)**. Er hält den kompletten Applikationszustand im flachen Objekt `state`, verwaltet Subscriber pro Kategorie, Undo/Redo-Historie, Batch-Transaktionen sowie die Graph-Operationen.

## 2. Der flache `State`

Der Zustand ist als flaches Objekt mit Index-Signatur (`[key: string]: any`) modelliert und enthält (Auszug):

- **Graph:** `graphData { entities, relationships }`, `loadedFiles`, `activeDatabase`.
- **Selektion:** `hoveredObject`, `selectedObject`, `selectedObjects`, `isBoxSelecting`.
- **UI:** `tooltip*`, `infoPanel*`, `showLabelsAlways/OnHover`, `labelLines`, `labelFilter*`, `complexityMode`, Layer-Sichtbarkeit/Opacity, Overlap-Effekte.
- **Visual/Edge:** `highlightedObjects`, `glowIntensity`, `edgeThickness`, `edgeCurveFactor`, `edgeAnimationMode`, `highlightThickness`, `selectionThickness`.
- **Umgebung:** `backgroundColor`, Licht-Intensitäten, `activeColorScheme`.
- **System:** `currentTool`, `layoutEnabled`, `renderMode`, `activeRenderMode`, Temporal-Werte (`currentTimestamp`, `min/max`, `isPlaying`, `playbackSpeed`), `mapActive`.
- **Dev:** `devPowerPreference`, `devPixelRatio`, `devFpsLimit`, `_triggerRendererRebuild`.

## 3. Sub-State-Typen (`src/core/state/StateTypes.ts`)

Die Sub-State-Interfaces gruppieren den monolithischen State logisch (der flache State bleibt für Kompatibilität erhalten):

- `GraphState`, `SelectionState`, `UIState`, `VisualState`, `EdgeVisualState`, `EnvironmentState`, `SystemState`, `DevState`.

## 4. Subscriber-Kategorien

Die Kategorie-Map `STATE_CATEGORIES` definiert:

| Kategorie | Bedeutung |
|-----------|-----------|
| `DATA` | Graph-Daten geändert |
| `SELECTION` | Selektion/Hover |
| `UI` | UI-Zustand |
| `HIGHLIGHT` | Highlights/Glow |
| `ENVIRONMENT` | Umgebung/Licht/Farbe |
| `EDGE_VISUAL` | Kantenvisualisierung |
| `SYSTEM` | Tool/Layout/Interaktion |
| `DEV` | Dev-Einstellungen |
| `DEFAULT` | immer zusätzlich benachrichtigt |

Die Zuordnung `STATE_KEY_TO_CATEGORIES` legt fest, welche Kategorien bei Änderung eines bestimmten State-Keys benachrichtigt werden. Dadurch werden nur relevante Subscriber angestoßen (feingranulares Reaktives Rendering), z. B.:

```ts
selectedObject: [SELECTION, HIGHLIGHT, UI]
layer1Visible:  [DATA, UI]
graphData:      [DATA]
```

## 5. Kern-API des StateManager

- `getEntities()` / `getRelationships()` – Datenzugriff.
- `setGraphData(e, r)` / `setLoadedFiles(files)` – Daten setzen.
- `subscribe(cb, category?)` – Subscriber (optional kategorisiert), liefert Unsubscribe-Funktion.
- `update(partial)` – partielles Update (löst Kategoriebenachrichtigung aus).
- `batchUpdate(partial)` – mehrere Updates bündeln.
- `undo()` / `redo()` – Undo/Redo über die Historie.
- Graph-Operationen: `addNode`, `updateNode`, `removeNode`, `addEdge`, `updateEdge`, `removeEdge`.
- Transaktionen: `beginTransaction(name)` / `commitTransaction()`.
- Selektion: `setSelectedObjects`, `addToSelection`, `removeFromSelection`, `clearSelection`, `isObjectSelected`.
- Temporal: `setCurrentTimestamp`, `setPlaying`.

## 6. Undo/Redo und Transaktionen

Der StateManager hält `undoStack` und `redoStack` von `HistoryAction`-Objekten (mit `undo`/`redo`-Closures) sowie eine `currentBatch`-Historie. Trimmt/transaktioniert Änderungen, sodass zusammenhängende Operationen als Einheit zurücknehmbar sind. Globale Tastenkürzel (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z) sind in `App.initManagers` registriert.

## 7. Datenfluss: StateManager ↔ App

Trotz `StateManager` als Source of Truth existieren in `App` zusätzlich parallele Halter (`currentEntities`, `currentRelationships`, `currentGraphData`). Eine Subscription auf `data_changed` synchronisiert diese lokalen Referenzen:

```ts
this.stateManager.subscribe((state) => {
    this.currentEntities = state.graphData.entities;
    this.currentRelationships = state.graphData.relationships;
}, 'data_changed');
```

Diese **Redundanz** ist ein dokumentiertes Schwachstellenfeld (siehe Verbesserungen, Kapitel 14): Fehlerquelle für Inkonsistenzen, weil viele Manager direkt auf die lokalen Arrays zugreifen.

## 8. Bewertung

**Positiv:**
- Kategorisierte Subscriptions ermöglichen feingranulares, effizientes Reaktives Rendering.
- Undo/Redo und Batch-Transaktionen sind gut integriert.
- Klare Typ-Definitionen für Sub-States.

**Schwächen:**
- Der flache State mit `[key: string]: any` ist nicht typsicher (obwohl Sub-State-Typen existieren).
- Paralleler Datenhalter in `App` erzeugt Redundanz.
- Viele Manager lesen direkt `stateManager.state.*` statt über getter – die Unterscheidung zwischen lokal gecachten und zentralen Werten ist unklar.

---

*Weiter: `/workspace/doc/07_event_system_nodges_V4.md`.*
