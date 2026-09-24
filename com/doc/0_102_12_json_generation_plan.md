# Generierungsplan für den temporalen Graphen

Dieses Dokument beschreibt die Struktur und den Prozess zur Erstellung des JSON-Graphen gemäß den Anforderungen.

## Anforderungen
- 500 Entitäten (Nodes)
- 800 Verbindungen (Edges)
- 100 temporale Schritte (Time Steps)
- Attribute der Entitäten:
  - 2 Attribute, die sinken und steigen, teilweise zu Beginn oder am Ende bei 0 sind. (z.B. `attr_rising`, `attr_sinking`)
  - 2 konstante Werte für Gravitation. (`gravitation_a`, `gravitation_b`)
  - 2 weitere Attribute mit Wertebereichen von 1-10 und 1-3. (`attr_1_10`, `attr_1_3`)

## Umsetzung
Das JSON-Schema entspricht der Nodges Schema Version 5.2.
- Die konstanten Attribute (`gravitation_a`, `gravitation_b`, `attr_1_10`, `attr_1_3`) werden im `stateVector` der Entitäten initialisiert.
- Die sich verändernden Attribute (`attr_rising`, `attr_sinking`) werden im Bereich `temporal.history` für jeden der 100 Schritte fortgeschrieben.
- Die 800 Edges werden zufällig zwischen den 500 Nodes erstellt, um das Netzwerk aufzubauen.

Ein Node.js-Skript wird verwendet, um die große Menge an Datenpunkten (ca. 50.000 Historien-Einträge) effizient zu generieren und als `public/data/generated/temporal_500_nodes.json` zu speichern.
