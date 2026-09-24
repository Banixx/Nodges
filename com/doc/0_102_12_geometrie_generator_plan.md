# Konzept: Geometrischer Graph-Generator

Dieses Dokument beschreibt den Plan für ein Skript, welches Graphendaten (Nodes und Edges) in vordefinierten geometrischen Figuren anordnet.

## Unterstützte Figuren

Das Skript kann mathematische Formeln nutzen, um Nodes präzise im 3D-Raum (x, y, z) zu platzieren:

1. **Gitter (Grid / Lattice):**
   - 2D- oder 3D-Raster.
   - Nodes werden in einem regelmäßigen Abstand platziert.
   - Edges verbinden jeweils die direkten Nachbarn (orthogonal).

2. **Kugel (Sphere):**
   - Nodes werden basierend auf Kugelkoordinaten (Phi, Theta) auf einer Oberfläche verteilt (z. B. Fibonacci-Gitter für gleichmäßige Verteilung).
   - Edges verbinden die nächstgelegenen Nachbarn, um ein Polygonnetz zu bilden.

3. **Ring (Torus / Kreis):**
   - Nodes werden entlang einer oder mehrerer Kreisbahnen platziert.
   - Edges verbinden benachbarte Nodes auf dem Ring.

4. **Platonische Körper (z.B. Würfel, Pyramide):**
   - Feste Eckpunkte als Nodes.
   - Kanten der geometrischen Körper als Edges.

## Technische Umsetzung

- **Eingabe:** Parameter wie Figur-Typ, Anzahl der Nodes, Radius/Ausdehnung, und Dichte der Vernetzung (Edges).
- **Verarbeitung:** 
  - Berechnung der `position`-Koordinaten (`x`, `y`, `z`) für jede Entität.
  - Ermittlung benachbarter Nodes anhand von Distanz-Algorithmen (z. B. KNN - k-nearest neighbors), um realistische Edges zu generieren.
- **Ausgabe:** Eine JSON-Datei konform zur Nodges Schema Version 5.2, die direkt in die Engine geladen werden kann.

Sobald der Code modifiziert werden darf, kann dieses Skript implementiert werden.
