# Dokumentation: 3D-Hilfsebene bei Knotenerstellung

Die Knotenerstellung in Nodges nutzt einen dreistufigen Positionierungsprozess (Y-Achse, X-Achse, Z-Achse). Um dem Benutzer eine bessere räumliche Orientierung im Vergleich zu bereits existierenden Knoten zu ermöglichen, wurde neben der Achsen-Hilfslinie eine dynamische Hilfsebene (Grid) hinzugefügt.

## Funktionsweise

1. **Rechtsklick & Positionierungsstart**:
   - Beim Rechtsklick auf eine freie Stelle startet der Positionierungsmodus.
   - Die erste zu bestimmende Achse ist standardmäßig die **Y-Achse** (Höhe).
   - Eine **horizontale Hilfsebene (X-Z-Ebene)** erscheint auf Höhe des Vorschauknotens (Sphere).

2. **Dynamische Bewegung & Ausrichtung**:
   - Während der Mausbewegung verschiebt sich die Hilfsebene mit der Sphere entlang der aktiven Achse.
   - Dies erlaubt es, die relative Position zu anderen Knoten im 3D-Raum visuell abzugleichen.

3. **Achsenwechsel (Y → X → Z)**:
   - Mit jedem Linksklick wird die aktuelle Koordinate fixiert und die nächste Achse aktiviert.
   - Die Ausrichtung der Hilfsebene passt sich automatisch der neuen Achse an:
     - **Y-Achse**: Horizontale Hilfsebene (X-Z)
     - **X-Achse**: Vertikale Hilfsebene (Y-Z)
     - **Z-Achse**: Vertikale Hilfsebene (X-Y)

## Technische Implementierung

Die Hilfsebene wurde über einen `THREE.GridHelper` in `AxisPositionHelper.ts` realisiert:
- **Klasse**: `AxisPositionHelper`
- **Feld**: `private helperGrid: THREE.GridHelper | null`
- **Ausrichtung**: 
  - Rotation um Z-Achse für X-Achsen-Bewegung (`this.helperGrid.rotateZ(Math.PI / 2)`)
  - Rotation um X-Achse für Z-Achsen-Bewegung (`this.helperGrid.rotateX(Math.PI / 2)`)
- **Ästhetik**: 
  - Halbtransparentes Grid mit einer Opazität von `0.15`.
  - Grid-Farbe entspricht der Farbe der jeweiligen Achse (Rot für X, Grün für Y, Blau für Z).
  - Deaktivierter Tiefenschreibzugriff (`depthWrite = false`), um Z-Buffer-Flackern mit dem Hintergrund-Grid zu verhindern.
