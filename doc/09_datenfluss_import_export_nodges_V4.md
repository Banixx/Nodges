# Nodges – Datenfluss, Layout, Import/Export

## 1. Datenfluss beim Laden

Der zentrale Einstieg ist `App.loadGraphData(graphData, sourceName, append?)`:

1. **Fallback-Positionen:** Entitäten ohne `position` erhalten `{x:0,y:0,z:0,isRandomFallback:true}`.
2. **Nicht-append:** Szene leeren, `loadedFiles` setzen, Schemas löschen. **Append:** IDs per `DataParser.prefixIds` mit Datei-Präfix versehen.
3. **Original-Mappings** sichern (für Vorschläge/Preview); bei expliziten Positionen wird ein `global_node.position = linear`-Mapping ergänzt. Die Mappings werden **nicht automatisch** aktiviert (aktiv nur als Vorschlag).
4. Daten in `currentGraphData`/`currentEntities`/`currentRelationships` mergen oder setzen.
5. `calculateDerivedData()` (degree/inbound/outbound) und `computeGraphMetrics` berechnen.
6. `rebuildMergedSchema()` führt Datenmodelle mehrerer Datensätze zusammen.
7. `StateManager.setGraphData(...)` – Sync der Source of Truth.
8. `createNodes()` / `createEdges()` bauen die 3D-Objekte.
9. Build-4-Sonderfall: Kartenbild (`MapManager`) und `mapX/mapY`-Positionen.
10. Layout wird **nicht mehr automatisch** angewendet (nur auf expliziten Nutzerwunsch); `layoutManager.stopAnimation()`.
11. Labels erzeugen, UI-Dateiinfo aktualisieren, SuggestionUI binden, automatischer visueller Ausgleich (falls aktiv), `fitCameraToScene`, Minimap-Zentrierung.

## 2. Eingebettete REST-API (Vite-Middleware)

`vite.config.ts` registriert Middleware im Dev-Server:

| Endpoint | Methode | Funktion |
|----------|---------|----------|
| `/api/save_graph` | POST | speichert `{filename, content}` nach `public/data/generated/` |
| `/api/list_files` | GET | listet rekursiv alle `.json` unter `public/data/` |
| `/api/create_database` | POST | erstellt `public/data/databases/{name}.json` mit Default-Graph |
| `/api/delete_file` | POST/DELETE | löscht Datei unter `public/data/` |

Für POST-Endpunkte wird `bodyParser.json({limit:'50mb'})` eingesetzt. Diese API ist nur im Dev-Server verfügbar (kein separater Produktions-Backend-Prozess).

## 3. Import / Export

### Import (ImportManager, FileHandler, DataParser)
- `FileHandler` liest Dateien über die API/skripte; `ImportManager` übernimmt das Einlesen (709 Zeilen).
- `DataParser.parse` normalisiert und validiert das Eingabeformat (Details in Kapitel 05).
- Mehrere Datensätze können per *Append* kombiniert bzw. per *Remove* entfernt werden (`removeData`, mit Präfix-Filterung).

### Export (ExportManager)
- `src/utils/ExportManager.ts` serialisiert Graphdaten, Datenmodell und Visual-Mappings.
- Schema-Export über `zod-to-json-schema` (`exportSchema.test.ts`).

## 4. LayoutManager und Worker

`src/core/LayoutManager.ts` verwaltet die Layout-Algorithmen:

- Registrierte Standard-Layouts in einer `Map<string, LayoutDefinition>`.
- **Worker-gestütztes Force-Directed-Layout:** `src/workers/layout-worker.ts` (und `layout-worker.js` Legacy) berechnet Positionen im Hintergrund-Thread.
- Typsichere Worker-Kommunikation über `src/workers/WorkerTypes.ts` (`LayoutWorkerRequest`/`LayoutWorkerResponse`, `WorkerNode`, `WorkerNodeResult`, `WorkerVector3`).
- Worker-Timeout (30 s) und Cancel/Cleanup über `activeWorker`.
- Kraftparameter (Repulsion, Attraktion, Dämpfung) kommen aus den Options; Initialpositionen ggf. mit Zufalls-Jitter.
- Integration: `applyLayout(algorithm, entities, relationships, fields, params)`.

## 5. Weitere Analyse-/Nutzdienste

- **NetworkAnalyzer** (`src/utils/NetworkAnalyzer.ts`): Netzwerkmetriken (507 Zeilen).
- **PathFinder** (`src/utils/PathFinder.ts`): Pfadsuche zwischen Knoten (551 Zeilen).
- **VisualOptimizer** (`src/utils/VisualOptimizer.ts`): berechnet optimalen visuellen Ausgleich (Skalierung, Kantendicke, Exponent).

## 6. App-Operationen (Graph-Mutation)

- `newGraph()` – leeres Projekt, setzt State und UI zurück.
- `removeData(sourceName)` – entfernt Datensatz samt Präfix-Entities/-Relations und baut Szene neu.
- `updateVisualMappings(mappings)` – übernimmt Mappings (Persistenz in `currentGraphData`), stößt Positions-/Kanten- und ggf. Layout-Updates an.

## 7. Bewertung

**Positiv:**
- Robuste Normalisierung mit Schema-Version-Fallback und Kompatibilitätsübersetzungen.
- Append/Remove-Mehrdatensatz-Handling mit ID-Präfixierung.
- Worker-basiertes Layout entlastet den Haupt-Thread.

**Schwächen:**
- Eingebettete Datei-API nur im Dev-Server; für Produktion fehlt ein echtes Backend (außer LightRAG).
- Datenfluss in `loadGraphData` ist lang und macht viel manuell (Labels, Layout-Trigger, Map, Minimap) – stark an `App` gekoppelt.
- Mappings werden doppelt geführt (`currentGraphData.visualMappings` und `StateManager.state.visualMappings`).

---

*Weiter: `/workspace/doc/10_ui_komponenten_nodges_V4.md`.*
