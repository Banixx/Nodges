# Walkthrough: Dynamische Cloud-Schwerpunkt Visualisierung

Wir haben den aktualisierten Plan nun im Code umgesetzt. Die Cloud-Ontologie bleibt unangetastet als reines Datenmodell bestehen. In der Engine haben wir lediglich eine *visuelle Interpretationslogik* (Render-Regel) für Knoten vom Typ `cloud` (oder `group`) implementiert.

## Was wurde umgesetzt?

1. **Visuelle Abstraktion in `NodeManager.ts`**
   - Knoten mit dem `type: "cloud"` (oder `"group"`) erhalten nun intern ein spezielles Render-Material: eine transluzente, halbdurchsichtige Sphäre (Farbe `0x64ffda`, Opacity `0.2`), in die man hineinsehen kann.

2. **Dynamische Nachverfolgung (Schwerpunktberechnung)**
   - Die neue Methode `updateCloudPositions` wurde eingeführt. Sie ignoriert die feste Position, die einer Cloud vom Layout-Algorithmus oder vom Mapping eventuell zugewiesen wird.
   - Stattdessen sucht sie in Echtzeit alle Knoten, die über eine Kante (`source` oder `target`) mit der Cloud verbunden sind.
   - Aus den Positionen dieser Kind-Knoten errechnet sie den geometrischen Mittelwert (x, y, z) und verschiebt das Cloud-Mesh exakt in dieses Zentrum.
   - Der Radius (Scale) der Cloud-Sphäre wird dynamisch so skaliert, dass er den Knoten einschließt, der am weitesten vom Zentrum entfernt ist (inklusive 20% visuellem Padding).

3. **Echtzeit-Synchronisierung in `App.ts`**
   - Der Aufruf dieser Schwerpunktberechnung erfolgt kontinuierlich in der Haupt-Render-Schleife (`App.ts`).
   - *Der Effekt:* Wenn das LLM Gruppenmitglieder über das Mapping kreuz und quer auf einer Karte verteilt, dehnt sich die Wolke gigantisch über diese Fläche aus. Zieht das Force-Directed-Layout die Mitglieder hingegen dicht an dicht in einen kompakten Sternhaufen, schrumpft die Cloud zu einer kleinen, dichten Hülle exakt um diesen Haufen zusammen.

## Validierung
- Der Code wurde mittels `tsc --noEmit` überprüft und alle Syntax-Eingriffe im Render-Loop wurden als typsicher und fehlerfrei bestätigt (Exit Code 0).
- Wir haben **keine** künstlichen Kräfte (Masselosigkeit, Abstoßung) in den Layout-Worker programmiert. Die Physik-Algorithmen arbeiten weiterhin absolut generisch und neutral.

## Nächster Schritt
Die Engine ist nun bereit. Um die Gruppen logisch zu erzeugen, können wir nun die Prompts (z.B. `build_6_prompt.md`) dahingehend schärfen, dass sie Cloud-Entitäten erzeugen und diese gezielt über Kanten in Clustern organisieren (optional sogar mit abstoßenden Kanten zwischen Nicht-Mitgliedern!).
