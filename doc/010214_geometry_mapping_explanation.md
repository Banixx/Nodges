# Erklaerung: Geometrie-Mapping (geometry) und diskrete Zuordnung

## Frage des Anwenders
Also ist geometry ausgenommen, oder wie ist "diskrete" gemeint?

## Antwort
Ja, `geometry` (die 3D-Form wie Kugel, Wuerfel, Zylinder etc.) ist von der stufenlosen 0 bis 100 Zahlen-Skalierung ausgenommen. Eine fliessende Zahl wie `42.5` macht fuer eine 3D-Form keinen Sinn, da Grafikkarten konkrete 3D-Geometrie-Namen wie `"sphere"` oder `"cube"` benoetigen.

## Detaillierte Erklaerung der "diskreten" Zuordnung

1. **Stufenlose numerische Skalierung (0 bis 100)**:
   Wird fuer kontinuierliche Eigenschaften genutzt (Groesse, Position, Glow, Kantendicke, Opazitaet). Ein Wert von `50` bedeutet z. B. mittlere Groesse oder mittlere Transparenz.

2. **Diskrete (direkte) Zuordnung**:
   Fuer `geometry` gibt es keine fliessenden Zwischenstufen. Stattdessen erfolgt eine 1-zu-1 Zuordnung von Kategorien auf konkrete Formen:
   - Kategorie "Person" -> 3D-Form `"sphere"` (Kugel)
   - Kategorie "Organisation" -> 3D-Form `"cube"` (Wuerfel)
   - Kategorie "Ort" -> 3D-Form `"cone"` (Kegel)

3. **Zusammenfassung**:
   Textattribute koennen fuer `geometry` weiterhin verwendet werden, aber anstelle einer Umrechnung in eine Zahl `0-100` wird jeder Textkategorie direkt eine feste 3D-Form aus der verfuegbaren Geometrieliste zugewiesen.
