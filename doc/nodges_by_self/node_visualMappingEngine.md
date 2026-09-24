# System Node: Visual Mapping Engine

```json
{
  "visualMappingEngine": {
    "version": "v4",
    "description": "Architektur zur uebersetzung von Rohdaten in visuelle Eigenschaften. Trennt strikt Datentyp von Darstellungslogik.",
    "coreConcepts": {
      "domain": "Der Raum der Rohdaten (Input).",
      "scale": "Die Uebersetzungslogik/Funktion.",
      "range": "Der Raum der visuellen Werte (Output)."
    },
    "scaleTypes": {
      "continuous": {
        "variants": ["linear", "logarithmic"],
        "useCase": "Numerische Daten (z.B. Bevoelkerung, Alter).",
        "behavior": "Interpoliert Werte zwischen Min und Max der Domain in die Range."
      },
      "categorical": {
        "variants": ["ordinal", "band"],
        "useCase": "Text/Kategorien (z.B. Branche, Abteilung).",
        "behavior": "Weist diskreten Textwerten feste diskrete visuelle Werte aus einer Palette zu. Keine Interpolation."
      },
      "quantize": {
        "useCase": "Numerische Daten, die in Töpfe (Bins) aufgeteilt werden sollen.",
        "behavior": "Teilt numerischen Raum in Klassen auf und weist jeder Klasse einen diskreten Wert zu."
      }
    },
    "visualProperties": {
      "color": {
        "continuousSupport": true,
        "categoricalSupport": true,
        "description": "Hex-Code Interpolation oder diskrete Paletten-Zuweisung."
      },
      "size_thickness": {
        "continuousSupport": true,
        "categoricalSupport": "warning",
        "description": "Groessen implizieren Wertung. Kategorisches Mapping auf Groesse wird abgeraten, ausser bei explizitem Ranking."
      },
      "position": {
        "continuousSupport": true,
        "categoricalSupport": true,
        "description": "Continuous mappt auf Koordinaten. Categorical erzeugt Raeumliche Cluster (Band Scale)."
      },
      "shape": {
        "continuousSupport": false,
        "categoricalSupport": true,
        "description": "Geometrische Formen lassen sich nicht stufenlos interpolieren."
      }
    }
  }
}
```
