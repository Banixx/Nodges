# Visualisierung von zeitlichen Verläufen in Nodges

## Konzeptübersicht
Die Darstellung von Zeit in einem Graphen erfordert spezifische visuelle Strategien, um komplexe Veränderungen verständlich zu machen. Da Nodges auf dynamische Netzwerkstrukturen ausgelegt ist, eignen sich folgende Ansätze zur Visualisierung von Timestamps.

## 1. Zeit-Schieberegler (Time Slider)
Ein UI-Element, das den Graphen zu einem bestimmten Zeitpunkt "einfriert" oder als Zeitfenster fungiert.
- **Funktion**: Nodes und Edges, deren Timestamps nicht in das aktuelle Zeitfenster fallen, werden ausgeblendet, verblasst (transparent) oder physisch aus der Simulation entfernt.
- **Vorteil**: Intuitiv für den Benutzer. Erlaubt das Abspielen von zeitlichen Entwicklungen (Animation) wie in einem Video.

## 2. Räumliche Kartierung (Axis Mapping)
Zeit wird direkt auf eine physische Achse (z.B. die Z-Achse oder X-Achse) gemappt.
- **Funktion**: Ältere Nodes befinden sich "hinten" oder "links", neuere "vorne" oder "rechts". Das Force-Layout wird dabei auf die restlichen Achsen beschränkt.
- **Vorteil**: Der gesamte zeitliche Verlauf des Netzwerks ist auf einen Blick erfassbar, ohne dass der Benutzer manuell durch die Zeit navigieren muss.

## 3. Farbliche Kodierung (Chronological Heatmap)
Zeitstempel steuern die Farbe der Nodes.
- **Funktion**: Eine Farbskala (z.B. von kaltem Blau für "alt" nach warmem Rot für "neu") repräsentiert das Alter oder den Erstellungszeitpunkt eines Nodes.
- **Vorteil**: Sehr platzsparend, greift nicht in die räumliche Positionierung des Force-Layouts ein.

## 4. Pulsieren und Animationen (Event Highlighting)
Beim automatischen Abspielen eines Zeitverlaufs können neue Ereignisse hervorgehoben werden.
- **Funktion**: Nodes, die zu einem bestimmten Zeitpunkt "aktiv" werden oder sich ändern, leuchten kurz auf oder vergrößern sich kurzzeitig (Pulsieren).
- **Vorteil**: Zieht die Aufmerksamkeit des Benutzers direkt auf die aktuellen Veränderungen im Netzwerk.

## Empfehlung
Eine Kombination aus einem **Zeit-Schieberegler** zur globalen Filterung und der **farblichen Kodierung** für das relative Alter der aktuell sichtbaren Nodes liefert die beste Balance zwischen Übersichtlichkeit und Detailtiefe.
