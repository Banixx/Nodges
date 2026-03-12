# Erkenntnisse: Generierung von Test-Graphdaten

## Zielsetzung
Erstellung umfangreicher Datensätze im "Semantic Graph Format" (JSON) zur Stress- und Performance-Prüfung der WebGL-Engine.

## Daten-Generator (`generate_test_graph.cjs`)
- **Pfad**: `scripts/generate_test_graph.cjs`
- **Funktion**: Erzeugt eine JSON-Struktur mit Knoten (Entities) und Kanten (Relationships).
- **Output**: Wird typischerweise nach `public/data/*.json` geschrieben.

## Erkenntnisse zum Format
- Das System erwartet eine Struktur mit `nodes` und `edges` (Mapping im Loader auf `entities` und `relationships`).
- Metadaten wie `type` und `properties` innerhalb der Knoten ermöglichen späteres Mapping auf visuelle Attribute (Farbe, Größe) über die `VisualMappingEngine`.

## Workflow
1. Script anpassen oder Parameter übergeben.
   `node scripts/generate_test_graph.cjs <knoten> <kanten> <pfad>`
2. In Nodges via `UIManager` (Dateiwähler) laden.
