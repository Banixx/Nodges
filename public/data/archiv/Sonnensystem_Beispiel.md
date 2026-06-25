# Beispiel: Sonnensystem & Himmelskörper in Nodges

Dieses Dokument zeigt ein Sonnensystem-Modell, das die fortgeschrittenen Visualisierungs- und Mapping-Funktionen von Nodges nutzt. Es veranschaulicht, wie physikalische Daten direkt in visuelle Dimensionen in 3D übersetzt werden können.

## Visual Mappings im Sonnensystem-Beispiel

1. **Größe nach Masse (Logarithmisch):**
   Physikalische Himmelskörper weisen gigantische Massenunterschiede auf. Die Sonne ist etwa 333.000-mal schwerer als die Erde, während kleine Monde winzig sind. Ein lineares Mapping würde alle Planeten unsichtbar klein oder die Sonne bildschirmfüllend groß zeichnen. Über das Mapping-Attribut `logarithmic` wird die Masse mathematisch so skaliert, dass sowohl die Sonne als auch kleine Monde wie Europa in der 3D-Ansicht harmonisch und unterscheidbar dargestellt werden.

2. **Farbe nach Temperatur (Heatmap):**
   Die Eigenschaft `temperatur` wird über ein Heatmap-Mapping (Farbpalette `blue-red`) visualisiert.
   - Die Sonne leuchtet rot/weiß als heißester Punkt bei 5500 °C.
   - Äußere Planeten und eisige Monde (z. B. Neptun bei -200 °C und Europa bei -160 °C) werden tiefblau dargestellt.
   - Gesteinsplaneten wie Merkur (167 °C) und die Erde (15 °C) erhalten entsprechende Zwischentöne auf der Farbskala.

3. **Glow-Effekt nach Bewohnbarkeit (Boolean):**
   Knoten mit dem Attribut `bewohnbar: true` (in diesem Fall die Erde) erhalten einen leuchtenden Glow-Effekt im 3D-Raum, um sie optisch hervorzuheben.

4. **Umlaufbahn-Kantenstärke nach Orbitgeschwindigkeit (Linear):**
   Die Kanten repräsentieren die Umlaufbahnen. Ihre Kantenstärke (`thickness`) verhält sich proportional zur mittleren Umlaufgeschwindigkeit des Himmelskörpers. Schnelle, sonnennahe Planeten wie Merkur haben deutlich dickere Orbit-Linien als die trägen Gasriesen im äußeren Bereich. Zudem wird ein konstanter Bogen (`curvature: 0.4`) auf die Kanten angewendet, um die Orbitalstruktur räumlich anzudeuten.

## JSON-Modellstruktur

Die zugrundeliegende JSON-Struktur (`public/data/Sonnensystem_Beispiel.json`):

```json
{
  "system": "Unser Sonnensystem",
  "dataModel": {
    "entities": {
      "Himmelskoerper": {
        "properties": {
          "masse": { "type": "continuous", "range": [0.008, 333000.0] },
          "temperatur": { "type": "continuous", "range": [-200.0, 5500.0] },
          "bewohnbar": { "type": "boolean" },
          "typ": { "type": "categorical", "values": ["Stern", "Gesteinsplanet", "Gasriese", "Mond"] }
        }
      }
    },
    "relationships": {
      "Umlaufbahn": {
        "properties": {
          "geschwindigkeit": { "type": "continuous", "range": [1.0, 48.0] }
        }
      }
    }
  },
  "visualMappings": {
    "defaultPresets": {
      "Himmelskoerper": {
        "size": { "source": "masse", "function": "logarithmic", "domain": [0.008, 333000.0], "range": [0.4, 4.0] },
        "color": { "source": "temperatur", "function": "heatmap", "domain": [-200.0, 5500.0], "palette": "blue-red" },
        "glow": { "source": "bewohnbar", "function": "categorical", "params": { "mapping": { "true": 1.0, "false": 0.0 } } }
      },
      "Umlaufbahn": {
        "color": { "source": "constant", "function": "linear", "params": { "color": "#5dade2" } },
        "thickness": { "source": "geschwindigkeit", "function": "linear", "domain": [1.0, 48.0], "range": [0.03, 0.15] },
        "curvature": { "source": "constant", "function": "linear", "range": [0.4, 0.4] }
      }
    }
  }
}
```
