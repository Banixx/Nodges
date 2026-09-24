# Beispiel: Globales Lieferketten- & Logistiknetzwerk in Nodges

Dieses Dokument zeigt, wie ein komplexes, globales Logistiknetzwerk mit Nodges visualisiert werden kann. Es veranschaulicht die Nutzung von bipolarer Farbkodierung zur Erkennung von Betriebszuständen sowie die Abbildung von Transportflüssen.

## Visual Mappings im Logistiknetzwerk-Beispiel

1. **Größe nach Kapazität (Linear):**
   Die physische Größe der Knoten (`size`) stellt das maximale Umschlagvolumen (`kapazitaet`) dar. Die Fabriken und das zentrale Hub in Hamburg sind die größten Knoten, während die einzelnen Supermarktfilialen als kleine Endknoten dargestellt werden.

2. **Farbe nach Auslastung (Bipolar):**
   Das Attribut `auslastung` bewegt sich im Bereich von `-1.0` (sehr geringe Auslastung / Leerlauf) bis `1.0` (kritische Überlastung).
   - Über die `bipolar`-Funktion wird dieser Bereich stufenlos zwischen Grün (`#2ecc71`) und Rot (`#e74c3c`) überblendet.
   - Ein voll ausgelasteter Knoten (z. B. "Filiale München-Zentrum" bei `1.0` oder "Berlin Depot" bei `0.9`) leuchtet intensiv rot und signalisiert sofortigen Handlungsbedarf.
   - Knoten im optimalen Auslastungsbereich liegen im gelb-grünen Übergangsbereich, während unausgelastete Knoten (z. B. "Filiale München-Nord" bei `-0.9`) in hellem Grün gezeichnet werden.

3. **Glow-Effekt nach Störungen (Boolean):**
   Knoten mit dem Attribut `stoerung: true` (z. B. "Berlin Depot" und "Filiale München-Zentrum") weisen auf aktive Betriebsstörungen oder Lieferengpässe hin und werden mit einem pulsierenden Leuchteffekt (`glow`) hervorgehoben.

4. **Kantenbreite nach Liefervolumen (Linear):**
   Die Transportwege (`Lieferweg`) verbinden die Knoten. Die Dicke (`thickness`) der Kanten stellt das transportierte Tagesvolumen (`volumen`) dar. Große Frachtströme von China nach Europa (See) sind als dicke Schläuche sichtbar, während lokale LKW-Zustellungen feine Linien bilden.

5. **Kantenkrümmung nach Latenz (Linear):**
   Die Krümmung (`curvature`) der Kanten stellt die Transportzeit (`latenz`) in Tagen dar. Schnelle Luftfracht-Routen sind fast gerade (geringe Latenz, flacher Bogen), während langsame Seewege als stark gekrümmte Bögen im Raum visualisiert werden.

6. **Kantenfarbe nach Transportmittel (Kategorisch):**
   Das Attribut `transportmittel` bestimmt die Farbe der Kante. Jedes Transportmittel (Schiff, Flugzeug, Zug, LKW) erhält automatisch eine eigene, unterscheidbare Farbe auf Basis des kategorischen Mappings.

## JSON-Modellstruktur

Die zugrundeliegende JSON-Struktur (`public/data/Lieferkette_Beispiel.json`):

```json
{
  "system": "Globales Logistiknetzwerk",
  "dataModel": {
    "entities": {
      "LogistikKnoten": {
        "properties": {
          "kapazitaet": { "type": "continuous", "range": [300.0, 10000.0] },
          "auslastung": { "type": "continuous", "range": [-1.0, 1.0] },
          "stoerung": { "type": "boolean" },
          "typ": { "type": "categorical", "values": ["Fabrik", "Zentrallager", "Verteilzentrum", "Einzelhaendler"] }
        }
      }
    },
    "relationships": {
      "Lieferweg": {
        "properties": {
          "volumen": { "type": "continuous", "range": [400.0, 8000.0] },
          "latenz": { "type": "continuous", "range": [0.3, 14.0] },
          "transportmittel": { "type": "categorical", "values": ["Schiff", "Flugzeug", "LKW", "Zug"] }
        }
      }
    }
  },
  "visualMappings": {
    "defaultPresets": {
      "LogistikKnoten": {
        "size": { "source": "kapazitaet", "function": "linear", "domain": [300.0, 10000.0], "range": [0.6, 2.5] },
        "color": { "source": "auslastung", "function": "bipolar", "params": { "positive": "#e74c3c", "negative": "#2ecc71" } },
        "glow": { "source": "stoerung", "function": "categorical", "params": { "mapping": { "true": 1.0, "false": 0.0 } } }
      },
      "Lieferweg": {
        "color": { "source": "transportmittel", "function": "categorical" },
        "thickness": { "source": "volumen", "function": "linear", "domain": [400.0, 8000.0], "range": [0.05, 0.4] },
        "curvature": { "source": "latenz", "function": "linear", "domain": [0.3, 14.0], "range": [0.1, 0.6] }
      }
    }
  }
}
```
