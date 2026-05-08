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

## Visual Balancing & Skalierung
Nodges verfügt über einen automatischen Balancing-Algorithmus (`VisualOptimizer`), der beim Laden von Daten folgende Parameter optimiert:
- **Globale Skalierung**: Passt die Knotengröße an die durchschnittliche Kantenlänge an.
- **Werte-Dämpfung**: Reduziert extreme Größenunterschiede bei hoher Varianz in den Datenwerten.
- **Koordinaten-Normalisierung**: Skaliert sehr große Koordinatensysteme (z.B. Blockchain-Daten mit X > 1000) automatisch auf ein handhabbares Maß (~500 Einheiten), um Kamera-Clips und Präzisionsprobleme zu vermeiden.

### Best Practices für Datensätze
1. **Relationen**: Knoten-Größen (Size) im Visual Mapping sollten idealerweise im Bereich 1-5 liegen.
2. **Kanten**: Dicken (Thickness) sollten 10-20% der Knotengröße betragen.
3. **Koordinaten**: Bei manueller Positionierung sollten Abstände zwischen Knoten die 5- bis 10-fache Knotengröße betragen, um Überlappungen zu vermeiden.

## Workflow
1. Script anpassen oder Parameter übergeben.
   `node scripts/generate_test_graph.cjs <knoten> <kanten> <pfad>`
2. In Nodges via `UIManager` (Dateiwähler) laden.
