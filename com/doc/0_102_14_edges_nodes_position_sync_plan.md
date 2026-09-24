# Plan: Synchronisation der Knoten-, Kanten- und Label-Positionen bei visueller Mappings-Anwendung

## Problembeschreibung
Beim Zuweisen von Attributen auf einzelne Positionen (z. B. `entity_type` -> `Position (Nur Y Achse)`) im Mapping-Panel entstehen Diskrepanzen:
- Edges sind nicht an den Nodes fixiert.
- Nodes wandern auf X=0 und Z=0, während Edges ihre X/Z-Koordinaten beibehalten.
- Node-Labels werden an unbehandelten Koordinaten gezeichnet.

## Ursachenanalyse
1. `NodeManager.ts`: In `updateNodePositions()` wird bei `isAnyPosMapped = true` fuer ungemappte Achsen der Wert `0` verwendet statt der bisherigen Position (`entity.position.x` bzw. `z`).
2. `EdgeObjectsManager.ts`: In `getNodePosition()` werden ungemappte Achsen auf `node.position.x` bzw. `z` aufgeloest.
3. `App.ts`: In `updateNodePositions()` werden Labels ohne Beruecksichtigung der VisualMappingEngine platziert.

## Loesungsansatz
1. `NodeManager.ts`: Fallback auf `entity.position` fuer ungemappte Achsen korrigieren.
2. `EdgeObjectsManager.ts`: Konsistente Positionsberechnung sicherstellen.
3. `App.ts`: Labels basierend auf der effektiven visuellen Knotenposition aktualisieren.
