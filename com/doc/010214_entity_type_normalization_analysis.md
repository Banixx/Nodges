# Analyse: Normalisierung von entity_type beim Position-Mapping

## Frage
Ist `entity_type` nicht normalisiert?

## Antwort
Nein, `entity_type` ist ein kategoriales Textattribut (z. B. "Person", "Organisation", "Ort") und besitzt von Natur aus keine kontinuierlichen numerischen Koordinatenwerte.

## Detaillierte technische Erklaerung

1. **Kategoriales vs. Kontinuierliches Mapping**:
   `entity_type` enthaelt diskrete Zeichenketten. Wenn ein Textattribut auf eine Positionsachse (z. B. X-Achse) gemappt wird, versucht die Mapping-Engine (`VisualMappingEngine`), den Wert auszuwerten. Wenn keine explizite kategoriale Wertetabelle fuer Koordinaten definiert ist, konvertiert JavaScript den Text via `Number(val)`. Da `Number("Organisation")` das Ergebnis `NaN` liefert, faellt der Wert auf `0` zurück.

2. **Fehlende Koordinaten auf Y- und Z-Achsen**:
   Selbst wenn der Buchstabe des Typs in einen Wert zwischen 0 und 1 umgerechnet werden wuerde, betrifft das Mapping nur die X-Achse (`Nur X Achse`). Die Y- und Z-Koordinaten bleiben bei `0`.

3. **Empfohlenes Vorgehen**:
   - Fuer kategoriale Attribute wie `entity_type` ist das Mapping auf **Farbe** oder **Geometrie** gedacht (wie im UI auch fuer Farbe konfiguriert).
   - Fuer die raeumliche Positionierung im 3D-Raum sollte die **Layout-Engine** verwendet werden oder ein numerisches Attribut auf die Positionen gemappt werden.
