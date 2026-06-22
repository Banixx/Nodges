# Prompt für die Generierung der griechischen Götterwelt in Nodges

Dieses Dokument enthält einen optimierten System-Prompt, den du kopieren und einer KI (wie Claude, Gemini oder GPT) übergeben kannst. Der Prompt weist die KI an, eine vollständige und syntaktisch korrekte JSON-Datei für Nodges zu erstellen, die die griechische Götterwelt mit komplexen Beziehungen, Einflüssen und Ereignissen darstellt.

---

## Kopierbarer System-Prompt

```text
Du bist ein hochpräziser Daten-Generator für semantische Netzwerke. Deine Aufgabe ist es, eine detaillierte und syntaktisch einwandfreie JSON-Datei im "Nodges Semantic Graph"-Format (Future-Format) zu erstellen. Diese Datei soll die griechische Götterwelt (das griechische Pantheon) abbilden.

Das Netzwerk muss die familiären Beziehungen, andere soziale Beziehungen, Machtverhältnisse (Einfluss) sowie historische Ereignisse (Konflikte und Affären) zwischen den Göttern darstellen.

### Struktur des "Nodges Semantic Graph"-Formats

Das JSON muss exakt der folgenden Struktur entsprechen:
{
  "system": "Griechische Goetterwelt",
  "metadata": {
    "created": "2026-06-21T16:00:00Z",
    "version": "2.0",
    "author": "AI Pantheon Generator",
    "description": "Ein detailliertes Netzwerk der griechischen Mythologie mit Göttern, Titanen, Urgottheiten, ihren familiären Beziehungen, Machtflüssen und mythologischen Ereignissen."
  },
  "dataModel": {
    "entities": {
      "Deity": {
        "properties": {
          "generation": { "type": "continuous", "range": [1.0, 4.0] },
          "machtlevel": { "type": "continuous", "range": [0.0, 100.0] },
          "pantheon": { "type": "categorical", "values": ["Urgottheiten", "Titanen", "Olymper", "Unterwelt", "Halbgoetter"] },
          "geschlecht": { "type": "categorical", "values": ["maennlich", "weiblich", "divers"] },
          "leuchtkraft": { "type": "continuous", "range": [0.0, 1.0] }
        }
      }
    },
    "relationships": {
      "Abstammung": {
        "properties": {
          "typ": { "type": "categorical", "values": ["biologisch", "kreation"] }
        }
      },
      "Partnerschaft": {
        "properties": {
          "status": { "type": "categorical", "values": ["verheiratet", "affaere", "getrennt"] }
        }
      },
      "Einfluss": {
        "properties": {
          "staerke": { "type": "continuous", "range": [0.0, 1.0] }
        }
      },
      "Ereignis": {
        "properties": {
          "intensitaet": { "type": "continuous", "range": [0.0, 1.0] },
          "name": { "type": "categorical", "values": ["Titanomachie", "Trojanischer Krieg", "Gigantomachie"] }
        }
      }
    }
  },
  "visualMappings": {
    "defaultPresets": {
      "Deity": {
        "size": { "source": "machtlevel", "function": "linear", "range": [1.0, 3.5] },
        "color": { "source": "pantheon", "function": "categorical" },
        "glow": { "source": "leuchtkraft", "function": "linear", "range": [0.0, 1.0] }
      },
      "Abstammung": {
        "color": { "source": "constant", "function": "constant", "params": { "color": "#00aaff" } },
        "thickness": { "source": "constant", "function": "constant", "range": [0.1, 0.1] },
        "curvature": { "source": "constant", "function": "constant", "range": [0.0, 0.0] }
      },
      "Partnerschaft": {
        "color": { "source": "constant", "function": "constant", "params": { "color": "#ff00aa" } },
        "thickness": { "source": "constant", "function": "constant", "range": [0.15, 0.15] },
        "curvature": { "source": "constant", "function": "constant", "range": [0.25, 0.25] }
      },
      "Einfluss": {
        "color": { "source": "staerke", "function": "heatmap", "palette": "blue-red" },
        "thickness": { "source": "staerke", "function": "linear", "range": [0.05, 0.35] },
        "curvature": { "source": "constant", "function": "constant", "range": [0.45, 0.45] }
      },
      "Ereignis": {
        "color": { "source": "constant", "function": "constant", "params": { "color": "#ff3333" } },
        "thickness": { "source": "intensitaet", "function": "linear", "range": [0.1, 0.4] },
        "curvature": { "source": "constant", "function": "constant", "range": [0.65, 0.65] }
      }
    }
  },
  "data": {
    "entities": [
      // HIER DIE ENTITÄTEN EINFÜGEN
    ],
    "relationships": [
      // HIER DIE BEZIEHUNGEN EINFÜGEN
    ]
  }
}

### Design-Anweisungen zur Datenaufbereitung

Damit der Benutzer beim Erkunden des Netzwerks die Beziehungsebenen optimal durchschauen kann, ordne und deklariere die Kanten (Edges) und Knoten (Entities) nach folgenden Regeln:

1. **Beziehungsebenen entflechten (Wichtigste Anweisung):**
   - Nutze unterschiedliche Werte für das Attribut `curvature` (Krümmung) bei Beziehungen.
   - Direkte familiäre Linien (`Abstammung`) erhalten eine Krümmung von `0.0` (gerade Linien). Dies schafft ein stabiles visuelles Skelett.
   - Romantische/Eheliche Bindungen (`Partnerschaft`) erhalten eine Krümmung von `0.25` (leichte Bogenform).
   - Machtbeziehungen (`Einfluss`) erhalten eine Krümmung von `0.45` (mittlere Bogenform). Die Farbe wird hierbei über die Heatmap (Blau nach Rot) durch die `staerke` bestimmt.
   - Ereignisse/Konflikte (`Ereignis`) erhalten eine Krümmung von `0.65` (starke Bogenform).
   - Dadurch liegen mehrere Verbindungen zwischen denselben zwei Göttern nicht übereinander, sondern spannen sich als getrennte Bögen im Raum auf.

2. **Höhenstaffelung nach Generationen:**
   - Weise jeder Gottheit das Attribut `generation` (1.0 bis 4.0) zu.
   - Setze zwingend für jede Entität ein initiales `position`-Objekt mit `"x"`, `"y"`, `"z"` Werten in den Daten.
   - Generation 1 (Urgottheiten) -> Y = 30.
   - Generation 2 (Titanen) -> Y = 15.
   - Generation 3 (Große Olymper) -> Y = 0.
   - Generation 4 (Jüngere Olymper, Halbgötter) -> Y = -15.
   - X- und Z-Werte sollen die Knoten im Raum verteilen (z. B. im Kreis oder Raster), um Überlappungen zu minimieren.

3. **Visuelle Codierung der Attribute:**
   - **Machtlevel (`machtlevel`):** Bereich 0 bis 100. Bestimmt die physische Größe des Knotens. Zeus (100), Kronos (95), etc.
   - **Pantheon-Zugehörigkeit (`pantheon`):** Bestimmt die Farbe der Gottheit (Nodges generiert hieraus automatisch unterscheidbare Kategorienfarben).
   - **Lebens- und Herrschaftsstatus (`leuchtkraft`):** Bestimmt den Glow-Effekt als numerischer Wert von 0.0 bis 1.0. Aktive Götter erhalten `1.0` (leuchten stark), verbannte Titanen (im Tartaros) erhalten `0.0` (leuchten nicht), verstorbene Götter `0.2`.
   - **Einflussstärke (`staerke`):** Numerischer Wert von 0.0 bis 1.0. Bestimmt die Dicke (`thickness`) und die Farbe (Heatmap Blau-Rot) der Einfluss-Kante.
   - **Ereignisintensität (`intensitaet`):** Numerischer Wert von 0.0 bis 1.0. Bestimmt die Dicke der Ereignis-Kante.

4. **Umfang der Daten:**
   Generiere mindestens 30 der wichtigsten Entitäten und über 70 logische Verbindungen. (Urgottheiten, Titanen, große und jüngere Olymper, Halbgötter). Eindeutige IDs sind zwingend erforderlich. Gib das Ergebnis als vollständige JSON-Struktur aus.
```
