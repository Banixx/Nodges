# Architektur: Node-Positionierung in Nodges

Das Handling von Node-Positionen in Nodges ist komplex, da sich statische Daten, visuelles Mapping, automatische Physik-Layouts und Nutzerinteraktionen überlagern. Hier ist die detaillierte Übersicht aller Komponenten, die Einfluss auf `entity.position` und das tatsächliche 3D-Mesh nehmen.

## 1. Datenquelle & Initiale Generierung (Die Rohdaten)
- **`LLMService.ts`**: Generiert während des Build-10-Prozesses JSON-Daten. Wenn im Prompt (`build_10_prompt.md`) räumliche Konzepte vorliegen, generiert das LLM `entity.position: {x, y, z}`.
- **`DataParser.ts`**: Liest beim Datei-Import eventuell vorhandene `position`-Werte in den Speicher (`EntityData`).

## 2. Die visuelle Vermittlung (Das Mapping-System)
- **`VisualMappingEngine.ts`**: Die zentrale Weiche. Liest das aktive Preset. Wenn das Attribut `position` mit dem UI-Slot `Position` verbunden ist, gibt sie `visual.positionX/Y/Z` zurück.
- **`SuggestionUI.ts`**: Baut beim Laden automatisch Vorschläge auf. Erkennt es `position` im Datensatz, schlägt es sofort ein Mapping vor.
- **`MappingUI.ts`**: Das Panel auf der linken Seite. Ist hier **keine** Linie für die Position gezogen, wertet die Engine die Position als "undefiniert/unmapped".

## 3. Der Renderer (Der Zeichen-Prozess)
- **`NodeManager.ts`**: Setzt die Knoten in Three.js (als `InstancedMesh` oder `Mesh`).
  - **Fallback-Jitter:** Ist die Position unmapped (`visual.positionX === undefined`), legt der NodeManager den Knoten auf ein starres Grid in den Hintergrund (z.B. Z=5, mit leichtem X/Y-Versatz).
  - **Temporalität:** Wenn der Zeitstrahl (Timeline) läuft, überschreibt `getInterpolatedTemporalValues()` die Position stetig anhand von Keyframes (`entity.temporal.history`).
  - **Clouds / Gruppen:** `updateCloudPositions()` berechnet zyklisch den geometrischen Schwerpunkt aller Child-Nodes und zwingt den Cloud/Group-Mesh genau in diese Mitte.

## 4. Die Physik-Engine (Das Layouting)
- **`LayoutManager.ts` / `LayoutWorker.ts`**: Greift dann ein, wenn die Position im MappingUI **nicht** fixiert ist (`visual.positionX === undefined`).
  - Wendet Algorithmen wie "Force-Directed" (Anziehungskraft der Kanten, Abstoßung der Knoten) an, um das Knäuel zu entwirren.
  - Ignoriert den Jitter-Fallback des `NodeManager`s und berechnet iterative neue Werte für `entity.position`.
  - Animiert die neuen Positionen nach der Berechnung weich in das UI (`animateLoop`).

## 5. Koordinaten-Kompression (Post-Processing)
- **`VisualOptimizer.ts` (`normalizeNodePositions`)**: Skaliert am Ende alle berechneten (oder geladenen) Positionen auf einen festgelegten Wertebereich (Viewport-Normierung). Dies verhindert, dass weit entfernte Nodes ins Unendliche fliegen und die Kamera überfordern.

## 6. Nutzerinteraktion (Manual Override)
- **`DragHandler.ts`**: Erlaubt es dem Nutzer, im aktiven 3D-Raum einen Knoten zu greifen und zu verschieben. Dies schreibt hart neue Koordinaten direkt in das Mesh und speichert sie zurück nach `entity.position`.

---

### Warum das bisherige "Chaos" entstand (Fazit)
Wenn im Mapping-UI die Linie für "Position" **nicht** gezogen war, passierte folgendes Paradoxon:
1. `NodeManager` sagte: "Ich habe keine fixe Position. Ich lege dich in den flachen Jitter-Fallback (z=5)."
2. `LayoutManager` (Force-Directed) sagte parallel: "Ah, der Knoten ist nicht fixiert. Ich wende Physik an und bewege ihn 3D in den Raum!"
3. Die Physik überschrieb den Jitter-Ansatz. Der Nutzer sah Knoten im 3D-Raum umherfliegen, obwohl im Panel gar kein Positions-Mapping definiert war.
