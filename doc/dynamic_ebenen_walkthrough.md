# Dokumentation: Dynamische Ebenen-Zuweisung

Dieses Dokument beschreibt das System zur dynamischen Ebenen-Zuweisung in Nodges, das das statische Zuweisen von Ebenen über ein festes `layer`-Attribut durch ein dynamisches Datenfilter-System ersetzt.

## Funktionsweise

Die Ebenen-Steuerung wurde von einer statischen Zuweisung auf ein dynamisches Filtersystem umgestellt:
1. **Attribut-Auswahl**: Über ein Dropdown-Menü ("Gruppierungs-Attribut") am Anfang des Ebenen-Panels wählt der Benutzer ein beliebiges Knotenattribut (z. B. `layer`, `type`, `geometryType` oder `geschlecht`).
2. **Dynamische Werte-Dropdowns**: Nodges liest alle eindeutigen Werte dieses Attributs aus den geladenen Daten aus und befüllt damit die dropdowns für die 4 Ebenen.
3. **Zuweisung & Filterung**: Der Benutzer kann jeder der 4 Ebenen einen bestimmten Attributwert zuweisen (oder `-- Keine --`). 
   - Ein Knoten gehört zu einer Ebene, wenn sein Wert des ausgewählten Attributs mit dem für diese Ebene definierten Wert übereinstimmt.
   - Hat ein Knoten einen Wert, der auf keine der Ebenen passt, bleibt er standardmäßig voll sichtbar (100 % Deckkraft).
   - Die Sichtbarkeits- und Deckkraft-Regler der jeweiligen Ebene steuern direkt die Skalierung (Skalierung auf 0 bei unsichtbar) und Opazität der zugeordneten Knoten.
4. **Verbindungen (Edges)**: Kanten werden ausgeblendet, sobald einer der Endknoten unsichtbar wird. Ihre Deckkraft berechnet sich reaktiv aus dem Minimum der Deckkraft-Werte der beiden verbundenen Knotenebenen.

## Anwendungsbeispiel: ebenen_demo.json

Wenn die Datei `ebenen_demo.json` geladen ist, kann das System wie folgt genutzt werden:
- **Gruppierung nach `geometryType`**:
  - Ebene 1: `cube` (Web Client & Mobile App)
  - Ebene 2: `cone` (API Gateway)
  - Ebene 3: `sphere` (Services)
  - Ebene 4: `cylinder` (Databases)
- **Gruppierung nach `layer`**:
  - Ebene 1: `1`
  - Ebene 2: `2`
  - Ebene 3: `3`
  - Ebene 4: `4`

## Anwendungsbeispiel: swiss_politics.json

Bei geladener Datei `swiss_politics.json` kann nach dem Entitätstyp gefiltert werden:
- **Gruppierung nach `type`**:
  - Ebene 1: `organ` (Vereinigte Bundesversammlung, Bundesrat)
  - Ebene 2: `partei` (SVP, SP, FDP, Mitte, Grüne)
  - Ebene 3: `person` (Bundesräte)
