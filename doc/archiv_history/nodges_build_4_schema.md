# Spezifikation: Nodges Build 4 (Temporale Daten)

## Konzept des Build 4 Formats
Das "Build 4" JSON-Format erweitert die bestehenden Nodges-Datenstrukturen um zeitliche Dimensionen. Damit können Entitäten (Nodes) und Beziehungen (Edges) einen definierten Lebenszyklus sowie eine Historie erhalten. Dies ist die Grundlage für jede Form der zeitlichen Visualisierung.

## Neues JSON Schema (Beispiel)

```json
{
  "system": "Mein_Netzwerk",
  "metadata": {
    "schemaVersion": "4.0",
    "description": "Beispiel"
  },
  "dataModel": { /* ... */ },
  "visualMappings": { /* ... */ },
  "data": {
    "entities": [
      {
        "id": "node1",
        "label": "Bundesrat",
        "type": "institution",
        "temporal": {
          "validFrom": 1848,
          "validTo": null,
          "history": [
            {
              "timestamp": 1999,
              "changes": {
                "color": "#ff0000"
              }
            }
          ]
        },
        "color": "#cccccc",
        "description": "Exekutive"
      }
    ],
    "relationships": [
      {
        "id": "edge1",
        "source": "node1",
        "target": "node2",
        "type": "elects",
        "temporal": {
          "validFrom": 1848,
          "validTo": 2024
        }
      }
    ]
  }
}
```

## Bericht zur Struktur und Logik
1. **Das `temporal` Objekt**: Alle zeitbezogenen Daten werden in diesem Objekt gekapselt, um den Root-Namespace sauber zu halten und Abwärtskompatibilität zu gewährleisten.
2. **`validFrom` und `validTo`**: Definieren die Lebensspanne eines Elements im ISO-8601 Format. Ist `validTo` `null` oder nicht vorhanden, existiert das Element bis in die Gegenwart. Ist `validFrom` nicht vorhanden, existierte das Element schon immer.
3. **`history` Array (optional)**: Erlaubt es, Eigenschaftsänderungen über die Zeit hinweg zu protokollieren. Anstatt für jede Änderung einen neuen Node erstellen zu müssen, definiert `history`, welche `properties` ab einem bestimmten `timestamp` überschrieben werden (z.B. Farbwechsel oder Größenänderungen zu bestimmten Zeitpunkten).
4. **Applikation in Nodges**: Die Rendering-Engine kann anhand dieser Attribute Nodes filtern oder animieren, ohne dass das Basis-Layout grundlegend zerstört wird.
