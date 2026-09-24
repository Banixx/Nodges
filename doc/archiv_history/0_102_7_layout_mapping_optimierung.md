# Layout Mapping Optimierung

## Hintergrund
Um zu verhindern, dass fehlerhafte oder extreme Werte aus dem LLM-Mapping zu visuell störenden Layouts führen, werden strikte Grenzwerte (Clamping) eingeführt. Zudem wird die Layout-Repulsion (Abstoßung der Knoten) dynamisch an die Anzahl der Knoten angepasst, um bei großen Graphen mehr Platz zu schaffen.

## Änderungen
- **`src/core/VisualMappingEngine.ts`**:
  - `size` wird auf den Bereich `0.3` bis `3.0` begrenzt.
  - `thickness` wird auf den Bereich `0.01` bis `0.3` begrenzt.
- **`src/core/LayoutManager.ts`**:
  - Die Funktion `getNodePhysics` erhält die Gesamtanzahl der Knoten, um die Standard-Repulsion proportional zur Graphengröße zu berechnen (z.B. `Math.max(50, nodes.length * 0.8)`).
