# Dokumentation: Behebung der Kamera-Zentrierung & Bounding-Box fuer gemappte Positionen

## Problemursache
Auf dem Screenshot war `entity_type` korrekt mit `Position` verbunden und die 3D-Knoten wurden von `NodeManager` an den gemappten X-Koordinaten (0 bis 100) gerendert.

Allerdings gab es ein Kamera- und Koordinatenproblem im System:
1. **Berechnung der Kamera-Grenzen (`calculateBounds` in `App.ts`)**:
   Die Funktion `calculateBounds` hat ausschliesslich das Rohdatenattribut `entity.position.x` ausgewertet (welches im Datensatz fuer alle Knoten 0 war). Die Kamera fokussierte deshalb ein 0x0-Bounding-Box bei Koordinate `(0, 0, 0)` und zoomte extrem nah an den Ursprung heran. Dadurch lagen alle verteilten Knoten auf X=12.5, X=25 ... X=100 ausserhalb des sichtbaren Frustums der Kamera.

2. **Knotenbeschriftungen (`NodeLabelManager`)**:
   Die Beschriftungs-Positionierung hatte bei Mapping-Updates ebenfalls noch auf `entity.position` statt auf die von der `VisualMappingEngine` berechneten Zielkoordinaten zugegriffen.

## Behebung

1. **`App.ts` (`calculateBounds`)**:
   `calculateBounds` wertet nun dynamisch die von `VisualMappingEngine.applyToEntity(node)` bereitgestellten Mappings fuer `positionX`, `positionY` und `positionZ` aus.
   Die Kamera berechnet das Bounding-Box korrekt ueber die gesamte Spanne von 0 bis 100 und zentriert alle Knoten im sichtbaren Bereich.

2. **`App.ts` (`updateVisualMappings`)**:
   Die Beschriftungspositionen nutzen nun ebenfalls die gemappten Koordinaten (`visual.positionX/Y/Z`).
