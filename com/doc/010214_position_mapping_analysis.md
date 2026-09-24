# Analyse: Fehlende Knoten-Positionen auf dem Screenshot

## Frage des Anwenders
Warum habe ich auf dem Bild keine Positionen fuer die Nodes erhalten?

## Ursachenanalyse des Screenshots

1. **Mapping-Quelle ist das `position`-Objekt mit Nullwerten**:
   Auf dem Screenshot ist das Attribut `position` mit `Position (Alle Achsen)` verbunden. Wie im Daten-Panel links zu sehen ist (`.x [0...0]`, `.y [0...0]`, `.z [0...0]`), enthalten die Quelldaten fuer alle 114 Knoten ausschliesslich den Wert `0`. Dadurch werden alle 114 Knoten exakt auf Koordinate `(0, 0, 0)` uebereinander gelegt.

2. **`entity_type` ist auf Farbe gemappt**:
   Das Textattribut `entity_type` ist im Screenshot mit `Farbe` verbunden, nicht mit `Position`. Die neue 0-100 Normalisierungslogik fuer Textattribute greift nur, wenn das Textattribut mit der `Position` verbunden wird.

## Anweisungen fuer den Anwender

1. **Positionsverteilung ueber `entity_type` aktivieren**:
   Ziehen Sie die Verbindungslinie von `entity_type` auf `Position` (oder stellen Sie im Dropdown "Nur X Achse" ein). Dadurch wird die 0-100 Normalisierung ausgefuehrt und die Knoten werden entlang der X-Achse verteilt.

2. **Positionsverteilung ueber Layout-Engine aktivieren**:
   Klicken Sie im Feld `Layout-Engine` auf den Start-Button (neben dem Sanduhr-/Stopp-Symbol), um den ausgewaehlten `Force-Directed`-Algorithmus auszufuehren. Dieser berechnet automatisch 3D-Positionen fuer den gesamten Graphen.
