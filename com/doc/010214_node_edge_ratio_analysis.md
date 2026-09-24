# Analyse: Groessenverhaeltnis Knoten zu Kantenlaenge (Node to Edge Ratio)

## Fragestellung des Anwenders
War die Range von 100 fuer das Positions-Mapping einfach zu gross, da die Knoten im Verhaeltnis zu den Kantenlaengen optisch viel zu klein wirken?

## Antwort
Ja, ein Positions-Spread von 100 ist fuer die Standard-Knotengroesse von Three.js (Radius 0.3 bis 1.0 Einheiten) zu gross, da die Kanten dadurch bis zu 100 Einheiten lang werden und die Knoten optisch zu winzigen Punkten schrumpfen.

## Recherche-Ergebnisse aus alten Archiven (`/such`)

Bei der Archiv-Recherche (`VisualOptimizer.ts`, `getMaxSpatialExtent`, Session-Logs) wurden folgende fruehere Erkenntnisse identifiziert:

1. **Räumlicher Extent vs. Knotengroesse**:
   - Die Knoten-Meshes in Nodges haben einen Mindest-Radius von `MIN_NODE_RADIUS = 0.3` und einen Standard-Radius von ca. `0.5` Einheiten.
   - Wenn der Positionsbereich `0..100` umfasst, entspricht der Knotendurchmesser nur etwa 1 % der maximalen Kantenlaenge.
   - In den bestehenden Systemkomponenten (`VisualOptimizer.ts`) wurden Kantenlaengen und Knotengroessen idealerweise auf ein Verhaeltnis von ca. 1:10 bis 1:20 abgestimmt (z. B. Raumausdehnung `-15 bis +15` bzw. `0 bis 30`).

2. **Loesungsansaetze ohne Code-Chaos**:
   - **Option A (Positions-Spread anpassen)**: Der Standard-Spread fuer kategoriale Text-Positions-Mappings wird von `0..100` auf einen kompakteren Bereich wie `0..30` oder `-15..+15` angepasst.
   - **Option B (Visual Scale Multiplier)**: Über den Schieberegler `visualScaleMultiplier` im Ansichts-Panel (ViewPanel) koennen Knoten global skaliert werden, um das Verhaeltnis zu den Kantenlaengen wiederherzustellen.
