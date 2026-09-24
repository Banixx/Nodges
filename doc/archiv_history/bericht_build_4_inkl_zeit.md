# Spezifikation und Anleitung: Nodges Build 4 (Zeitverlauf & Karten-Integration)

## 1. Einleitung
Das "Nodges Build 4" Datenformat ist die Grundlage für die Visualisierung dynamischer, zeitlicher Verläufe. Diese Anleitung definiert die Struktur der JSON-Dateien und dient als Referenz und Vorlage zur korrekten Generierung von Datensätzen.

Die wichtigste architektonische Regel lautet: **Strikte Trennung von Daten und Visualisierung.**
Das JSON-Format enthält ausschließlich abstrakte Rohdaten (Werte, Timestamps). Wie diese Daten später in Nodges gerendert werden (z. B. durch physisches Tweening, Leuchteffekte, Trails oder das Ausblenden), wird ausschließlich in der Nodges-Software konfiguriert und hat keinen Einfluss auf die Struktur dieses Datenformats.

## 2. Das Event-basierte Keyframe-Modell (Deltas)
Um zeitliche Veränderungen speichereffizient und logisch abzubilden, nutzt Build 4 ein sogenanntes "Delta"-Modell. 
- **Basis-Eigenschaften (`properties`)**: Definieren den initialen oder statischen Zustand einer Entity oder Relationship. Wenn sich ein Attribut im Laufe der Zeit nie ändert, wird es ausschließlich hier aufgeführt.
- **Historie (`history`)**: Ein Array von zeitlichen Events. Jedes Event enthält einen Zeitstempel und *ausschließlich die Attribute, die sich zu exakt diesem Zeitpunkt ändern*. 

## 3. Lebenszyklus (Existenzspanne)
Um das Erscheinen und Verschwinden von Elementen abzubilden, werden Existenz-Metadaten genutzt:
- `validFrom`: Ein Zeitstempel, ab dem das Element im Graphen anfängt zu existieren.
- `validTo`: Ein Zeitstempel, an dem das Element aus dem Graphen verschwindet. Ist das Feld `null` oder nicht vorhanden, existiert das Element bis ans Ende der simulierten Zeitachse.

Diese Eigenschaften, zusammen mit der `history`, werden sauber in einem übergeordneten `temporal`-Objekt gekapselt.

## 4. Karten-Integration (Geospatial Mapping)
Wenn eine visuelle Hintergrundkarte (z.B. `Switzerland.jpg`) genutzt wird, auf der die Entities feste Positionen haben sollen, erweitert sich das Modell:
- **Globale Metadaten (`metadata`)**: Auf der obersten Ebene des JSONs wird die Version des Schemas (`"schemaVersion": "4.0"`) definiert, sowie optional, welche Karte geladen werden soll und welche Basis-Auflösung (Referenzgröße) das LLM für die Koordinaten genutzt hat.
- **Entity-Koordinaten (`mapX`, `mapY`)**: Im Root einer Entity werden die hartcodierten X- und Y-Koordinaten abgelegt. Sobald Nodges diese erkennt, wird die Physik für diese Entity deaktiviert und sie wird passgenau auf der Karte verankert.

## 5. JSON-Schema Struktur und Beispiel

```json
{
  "system": "Mein_Netzwerk",
  "metadata": {
    "schemaVersion": "4.0",
    "map": {
      "image": "Switzerland.jpg",
      "referenceWidth": 1000,
      "referenceHeight": 650
    }
  },
  "dataModel": { /* ... */ },
  "visualMappings": { /* ... */ },
  "data": {
    "entities": [
      {
        "id": "node_1",
        "label": "Beispiel Entity",
        "type": "entity",
        "mapX": 450,
        "mapY": 320,
        "temporal": {
          "validFrom": 1990,
          "validTo": 2030,
          "history": [
            {
              "timestamp": 2000,
              "changes": {
                "size": 15,
                "category": "B"
              }
            },
            {
              "timestamp": 2010,
              "changes": {
                "size": 25,
                "color": "#ff0000"
              }
            }
          ]
        },
        "size": 10,
        "color": "#cccccc",
        "category": "A",
        "description": "Basisbeschreibung bleibt konstant"
      }
    ],
    "relationships": [
      {
        "id": "edge_1",
        "source": "node_1",
        "target": "node_2",
        "type": "connection",
        "temporal": {
          "validFrom": 1995,
          "validTo": null
        },
        "weight": 1.0
      }
    ]
  }
}
```

## 6. Wichtige Regeln für die Datengenerierung
1. **Versionskennung:** Das `metadata`-Objekt sollte zwingend das Attribut `"schemaVersion": "4.0"` enthalten, damit Nodges die erweiterten Funktionen sofort aktivieren kann.
2. **Keine Redundanz:** Das `changes`-Objekt in der Historie darf nur Attribute enthalten, die im Vergleich zum vorherigen Zustand einen neuen Wert annehmen. Unveränderte Werte werden nicht dupliziert.
3. **Datentypen für Zeitstempel:** Timestamps müssen innerhalb eines Datensatzes global konsistent sein. Empfohlen werden numerische Formate (z.B. reine Jahreszahlen wie `2020` oder Unix-Timestamps).
4. **Abwärtskompatibilität:** Wenn eine Entity keine zeitlichen Veränderungen durchläuft, kann das `history` Array leer bleiben. Fehlt das komplette `temporal` Objekt, verhält sich das Element wie eine statische Entity aus vorherigen Builds (immer existent und konstant).
5. **Karten-Referenzierung:** Berechnet das LLM Positionen für eine Karte, muss zwingend die Referenzgröße (`referenceWidth`, `referenceHeight`) im `metadata`-Objekt angegeben werden. Dies stellt sicher, dass Nodges die Hintergrundebene exakt proportional aufspannt und die hardcodierten `mapX`/`mapY` Koordinaten maßstabsgetreu bleiben.
