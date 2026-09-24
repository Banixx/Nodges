# Walkthrough: Korrektur der Kanten- und Knotenpositionierung bei visueller Mappings-Anwendung

## Durchgefuehrte Aenderungen

### NodeManager.ts
- Methode `updateNodePositions()` korrigiert: Wenn ein visuelles Mapping nur auf einzelne Achsen angewendet wird (z. B. Nur Y-Achse), greifen die ungemappten Achsen (X und Z) jetzt auf die bestehenden Positionsdaten (`entity.position.x` bzw. `z`) zurueck, anstatt faelschlicherweise auf `0` zu fallen.

### NodeLabelManager.ts
- `createLabelsForAllEntities()` aktualisiert: Knoten-Labels werten nun beim ersten Erstellen die durch `visualMappingEngine` berechneten effektiven Positionen aus.

### App.ts
- In `updateNodePositions()` wird bei der Neupositionierung der Labels nun ebenfalls die durch `visualMappingEngine.applyToEntity(entity)` berechnete effektive Position verwendet.

## Verifizierung
- `NodeManager`, `EdgeObjectsManager` und `NodeLabelManager` berechnen nun konsistent dieselben 3D-Koordinaten.
- Knoten, Kanten-Endpunkte und Knoten-Labels bleiben bei teilweisen Achsen-Mappings (z. B. Nur Y-Achse) exakt aneinander ausgerichtet.
