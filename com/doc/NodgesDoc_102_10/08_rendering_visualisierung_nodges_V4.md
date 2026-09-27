# Nodges – 3D-Rendering und Visualisierung

## 1. Grundaufbau der Szene

`App.initThreeJS()` erstellt:
- **PerspectiveCamera** (75° FOV, Near 0.1, Far 1000).
- **WebGLRenderer** mit mehrstufigem Fallback (high-performance → default → minimal → Fehleranzeige).
  - `antialias`, `powerPreference`, `setPixelRatio(devicePixelRatio)`, `autoClear = false` (für Multi-Viewport-Rendering), Schatten aktiviert (`PCFSoftShadowMap`).
- **OrbitControls** mit Dämpfung, `maxPolarAngle` (Kamera nicht unter Grund), `min/maxDistance`.
- **Lichter:** Ambient + Directional (mit Schatten, Karten 2048×2048) + optional auskommentierte Minimap-Lichter (Layer 1).
- **Boden:** PlaneGeometry + GridHelper (transparent, `depthWrite: false` gegen Z-Fighting).

## 2. NodeManager (Knoten)

`src/core/NodeManager.ts` verwaltet die 3D-Knoten:

- Nutzt **InstancedMesh** (`meshes`) für performante Darstellung vieler identischer Geometrien sowie einzelne Meshes (`individualMeshes`).
- Geometrie-/Material-Caches (`geometryCache`, `materialCache`).
- Mapping `(GeometryType + InstanceId) → EntityData` (`entityDataMap`), Lookup über `entityIdMap` und `meshIdMap`.
- Zustandsbezogene Layouts: `updateNodes`, `updateNodePositions`, `updateTemporalState`, `updateCloudPositions`, `animateOverlapEffects`.
- Grenzen: `MIN_NODE_RADIUS = 0.3`, `MAX_NODE_RADIUS = 15.0`.
- Reaktives Rendering per Subscription auf `data_changed`.

## 3. EdgeObjectsManager (Kanten)

`src/core/EdgeObjectsManager.ts` erzeugt Kanten als **Tubes entlang Quadratischer-Bezier-Kurven**:

- Pro Edge ein `TubeMesh` mit `QuadraticBezierCurve3`, Farben, Dicke und Krümmung.
- `connectionToEdges`-Map gruppiert Kanten pro Verbindung (für Mehrfachkanten).
- Unterstützt Animationen: `flow`, `sequential`, `pulse`, `segments`, Legacy.
- `updateEdges`, `updateEdgePositions`, `updateTemporalState`, `animate`, `dispose`.
- Reaktiv auf `data_changed`.

## 4. VisualMappingEngine

`src/core/VisualMappingEngine.ts` übersetzt Datenattribute in visuelle Eigenschaften:

- Setzt `visualMappings`, `originalVisualMappings` (Vorschläge) und `dataModel`.
- `applyToEntity` / Mapping-Funktionen: `linear`, `exponential`, `logarithmic`, `heatmap`, `bipolar`, `pulse`, `geographic`, `sphereComplexity`, `categorical`, `constant`.
- Kategorie-Normalisierung über `getCategoryNormalizedValue` (mit Cache).
- Ergebnis als `VisualProperties` (Position, Size, Color, Geometry, Glow, Thickness, Curvature, Animation, Physik).

## 5. Effekte

### GlowEffect
`src/effects/GlowEffect.ts` erzeugt einen Leuchteffekt (Glow) um Objekte, steuerbar über `glowIntensity`/`glowDirection` im State.

### HighlightManager
`src/effects/HighlightManager.ts` (763 Zeilen) verwaltet Hervorhebungen von Objekten und Nachbarschaften; `clearAllHighlights` etc.

### TrailManager
`src/core/TrailManager.ts` erzeugt Bewegungsspuren (Trails).

## 6. Minimap

Die Minimap wird über `src/ui/MinimapUI.ts` + eine Ortho-Kamera (Top-Down) realisiert:

- **Kamera:** OrthographicCamera, Layer 0/1/2, Blick von oben (500 Einheiten), `up = (0,0,-1)`.
- **Kamera-Marker** (`createCameraMarker`): 3D-Linien-Symbol, das die Hauptkamerasicht anzeigt.
- **Render-Pass** im Render-Loop: zweiter Render mit Scissor/Viewport und DPR-Korrektur, transparentem Hintergrund; Labels für die Minimap ausgeblendet.
- Interaktion: Zoom (`onZoom`), Pan (`onPan`).
- `MapManager` kann ein Kartenbild (`metadata.map`) als Hintergrund laden.

## 7. Labels

- **NodeLabelManager** (`src/utils/NodeLabelManager.ts`): Knoten-Labels, Always/Hover-Sichtbarkeit, Filterung, `labelLines`, Repositionierung, Refreshes.
- **EdgeLabelManager** (`src/utils/EdgeLabelManager.ts`): Kanten-Labels mit Konfiguration (immer sichtbar, sichtbar bei Hover).

## 8. Physik-Verhalten und Layout

- VisualMappings können Attraktion/Repulsion/Inertia für eine **force-directed-Simulation** triggern (in `App.updateVisualMappings`).
- `algo:`-Präfix im `position.source` startet ein benanntes Layout automatisch.
- Details zum LayoutManager und Worker in Kapitel 09.

## 9. Bewertung

**Positiv:**
- Instancing + Caching für Skalierbarkeit.
- Separater Minimap-Render-Pass mit sauberem Scissor/Viewport-Handling.
- Flexible Visual-Mapping-Engine mit vielen Mapping-Funktionen.

**Schwächen:**
- Der Render-Loop in `App.animate` ist überfrachtet (mehrere Passes, FPS, Label- und Temporal-Updates vermischt).
- Minimap-Logik (Kamera, Marker, Render-Pass) liegt direkt in `App` statt gekapselt.
- Koordinaten- und Positionslogik ist über `App`, `VisualMappingEngine`, `NodeManager` und `EdgeObjectsManager` verteilt – es gibt kein einheitliches Positions-Interface.

---

*Weiter: `/workspace/com/doc/09_datenfluss_import_export_nodges_V4.md`.*
