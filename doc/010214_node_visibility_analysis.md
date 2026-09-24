# Analyse: Knoten-Sichtbarkeit und Hover-Verhalten

## Problembeschreibung
Auf Bild 1 sind keine Knoten in der 3D-Ansicht zu erkennen. Auf Bild 2 werden beim Hovern an der zentralen Stelle ein Knoten-Kompaktball sowie Text-Labels sichtbar.

## Ursachenanalyse

1. **Positions-Mapping auf Text-Attribut**:
   In der linken Mapping-Leiste ist `entity_type` auf `Position (Nur X Achse)` gemappt. `entity_type` ist ein mathematisch nicht-kontinuierliches Textattribut mit 9 Kategorien. Da weder Y- noch Z-Achsen gemappt sind und die automatische Layout-Engine pausiert ist, liegen alle 228 Knoten auf demselben Punkt oder einer extrem engen Koordinate im Ursprung (0, 0, 0).

2. **Überlagerung und Verdeckung (Bild 1)**:
   Durch die Identität der Koordinaten verdecken sich alle 228 Knoten gegenseitig im 3D-Raum an einem einzigen Punkt im Zentrum. Ohne aktive Layout-Engine bilden sie keinen verteilten Graphen.

3. **Sichtbarkeit bei Hover (Bild 2)**:
   Sobald der Mauszeiger über den zentralen Punkt bewegt wird, löst das `CentralEventManager` und `HoverHandler` aus:
   - Die `HighlightManager`-Logik hebt das fokussierte Objekt hervor.
   - Der `NodeLabelManager` rendert die Text-Labels aller an diesem Punkt liegenden Knoten.
   - Falls aktiviert, verteilt der `OverlapEffect` (Jitter/Orbit/Pulse) die überlappenden Knoten visuell während des Hovers.

## Lösungsschritte für den Anwender

1. **Layout-Engine starten**:
   Im linken Mapping-Panel unter `Layout-Engine` auf den Start-Button (Play-Symbol) klicken (z.B. `fruchterman-reingold` oder `spring-embedder`). Dadurch werden die Knoten im 3D-Raum verteilt.

2. **Positions-Mapping anpassen**:
   Falls kein räumliches Mapping gewünscht ist, das Position-Mapping auf ein kontinuierliches numerisches Attribut legen oder zurücksetzen, damit das eingestellte Layout-Verfahren die X-, Y- und Z-Koordinaten frei berechnen kann.
