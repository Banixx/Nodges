# Spezifikation: Nodges Build 4 (Temporale Daten)

## Konzept des Build 4 Formats
Das "Build 4" JSON-Format erweitert die bestehenden Nodges-Datenstrukturen um zeitliche Dimensionen. Damit können Entitäten (Nodes) und Beziehungen (Edges) einen definierten Lebenszyklus sowie eine Historie erhalten. Dies ist die Grundlage für jede Form der zeitlichen Visualisierung.

## Neues JSON Schema (Beispiel)

```json
{
  "nodes": [
    {
      "id": "node1",
      "label": "Bundesrat",
      "type": "institution",
      "temporal": {
        "validFrom": "1848-01-01T00:00:00Z",
        "validTo": null,
        "history": [
          {
            "timestamp": "1999-01-01T00:00:00Z",
            "changes": {
              "description": "Neue Verfassung in Kraft getreten",
              "color": "#ff0000"
            }
          }
        ]
      },
      "properties": {
        "color": "#cccccc",
        "description": "Exekutive"
      }
    }
  ],
  "edges": [
    {
      "id": "edge1",
      "source": "node1",
      "target": "node2",
      "type": "elects",
      "temporal": {
        "validFrom": "1848-01-01T00:00:00Z",
        "validTo": "2024-01-01T00:00:00Z"
      }
    }
  ]
}
```

## Bericht zur Struktur und Logik
1. **Das `temporal` Objekt**: Alle zeitbezogenen Daten werden in diesem Objekt gekapselt, um den Root-Namespace sauber zu halten und Abwärtskompatibilität zu gewährleisten.
2. **`validFrom` und `validTo`**: Definieren die Lebensspanne eines Elements im ISO-8601 Format. Ist `validTo` `null` oder nicht vorhanden, existiert das Element bis in die Gegenwart. Ist `validFrom` nicht vorhanden, existierte das Element schon immer.
3. **`history` Array (optional)**: Erlaubt es, Eigenschaftsänderungen über die Zeit hinweg zu protokollieren. Anstatt für jede Änderung einen neuen Node erstellen zu müssen, definiert `history`, welche `properties` ab einem bestimmten `timestamp` überschrieben werden (z.B. Farbwechsel oder Größenänderungen zu bestimmten Zeitpunkten).
4. **Applikation in Nodges**: Die Rendering-Engine kann anhand dieser Attribute Nodes filtern oder animieren, ohne dass das Basis-Layout grundlegend zerstört wird.
