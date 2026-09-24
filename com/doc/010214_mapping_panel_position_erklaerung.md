# Erklaerung: Positionen in B12_02_Antwort_01_25.json und Fallback-Verhalten

## Befund in B12_02_Antwort_01_25.json
In der Datei [B12_02_Antwort_01_25.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/public/data/b12/B12_02_Antwort_01_25.json) sind in den Knotenobjekten (`entities`) tatsaechlich **keinerlei Koordinaten** oder `position`-Attribute enthalten.

## Warum die Knoten trotzdem eine Position in der Szene haben
Wenn eine JSON-Datei ohne Positionsdaten geladen wird, greift die Fallback-Logik in [App.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts#L703-L713):
1. **Automatischer Zufalls-Fallback (`isRandomFallback`)**: Nodges weist jeder Entitaet beim Laden im Arbeitsspeicher automatisch eine leichte Zufallsposition um den Punkt `(0, 0, 3)` zu (`isRandomFallback: true`), damit die Knoten nicht alle bei `(0,0,0)` zusammenfallen und die 3D-Kamera korrekt arbeiten kann.
2. **Attributanzeige im Mapping Panel**: Da das Attribut `position` im Arbeitsspeicher an den Knoten-Objekten existiert, wird es auf der linken Seite im Mapping Panel aufgefuehrt.
3. **Keine gestrichelte Linie / Vorschlag**: Die Pruefung `hasRealPositions` in [App.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts#L735) erkennt anhand des Flags `isRandomFallback`, dass die Datei selbst keine echten Positionen mitbringt. Daher wird bewusst **kein Original-Mapping** fuer `Position` generiert (und folglich auch keine gestrichelte Linie gezeichnet).
