# Analyse: Ursache der fehlenden Nodes auf dem Bild

## Problembeschreibung
Auf dem Screenshot sind im 3D-Ansichtsfenster die Node-Meshes (Geometrien) nicht sichtbar, obwohl die Text-Labels (z.B. Sonne, Merkur, Erde, Mars, Jupiter, Saturn) entlang einer blauen Linie dargestellt werden.

## Identifizierte Ursachen

1. **Fehlendes Grössen-Mapping (Visual Channel Size)**:
   - Im linken Panel `MAPPING` (Reiter `Nodes`) ist der visuelle Kanal `Grösse` (sowie `Grösse (2)`) unbeschaltet und ohne Datenattribut.
   - Ohne explizite Beschaltung fehlt eine dynamische Skalierung für die 3D-Meshes.

2. **Positions-Kollaps auf eine eindimensionale Achse (1D)**:
   - Die Positions-Eingänge empfangen Daten, die alle Objekte auf dieselbe blaue Linie (Vektor) ausrichten.
   - Alle Knoten liegen auf einer einzigen Geraden hintereinander im 3D-Raum, wodurch sie von den vorangestellten Text-Labels und der blauen Kante verdeckt werden.

3. **Geometrie- und Farb-Zuordnung**:
   - Das Attribut `kategorie` ist auf `Farbe` mit der Funktion `heatmap` gemappt.
   - Der visuelle Kanal `Geometrie` ist nicht zugewiesen.

## Lösungsschritte (Zukünftig)
- Verbinden eines Datenattributs mit dem Kanal `Grösse` im Mapping-UI.
- Anpassen des Positions-Mappings (z.B. Nutzung einer 2D/3D Layout-Engine statt 1D-Kollaps), damit die Nodes räumlich verteilt werden.
