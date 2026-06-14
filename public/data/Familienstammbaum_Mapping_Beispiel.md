# Beispiel: Erweiterter Familienstammbaum & Mapping in Nodges

Dieses Dokument zeigt, wie ein System (hier ein Familienstammbaum) in Nodges aufgebaut ist. Es verdeutlicht die strikte Trennung zwischen **Rohdaten** (Knoten und Kanten) und dem **Visual Mapping** (wie die Daten gezeichnet werden sollen).

```json
{
  "system": "Familienstammbaum Familie Müller",
  "metadata": {
    "created": "2026-06-12T12:00:00Z",
    "version": "2.0",
    "author": "AI",
    "description": "Erweiterter Familienstammbaum (12 Personen, 3 Generationen, Scheidung, Trennung, Todesfall, Schwangerschaft)."
  },
  "dataModel": {
    "entities": {
      "Person": {
        "properties": {
          "geburtsjahr": { "type": "continuous", "range": [1900, 2026] },
          "todesjahr": { "type": "continuous", "range": [1900, 2026] },
          "geschlecht": { "type": "categorical", "values": ["männlich", "weiblich", "divers"] },
          "generation": { "type": "continuous", "range": [1, 3] },
          "schwanger": { "type": "boolean" },
          "angeheiratet": { "type": "boolean" },
          "lebensstatus": { "type": "categorical", "values": ["lebend", "verstorben"] }
        }
      }
    },
    "relationships": {
      "Partnerschaft": {
        "properties": {
          "status": { "type": "categorical", "values": ["verheiratet", "geschieden", "getrennt", "verwitwet"] }
        }
      },
      "Abstammung": {
        "properties": {
          "art": { "type": "categorical", "values": ["biologisch"] }
        }
      }
    }
  },
  "visualMappings": {
    "defaultPresets": {
      "Person": {
        "size": { "source": "generation", "function": "linear", "range": [2.5, 1.0] },
        "color": { "source": "geschlecht", "function": "categorical" },
        "opacity": { "source": "lebensstatus", "function": "categorical", "params": { "mapping": { "lebend": 1.0, "verstorben": 0.4 } } },
        "glow": { "source": "schwanger", "function": "categorical", "params": { "mapping": { "true": 1.0, "false": 0.0 } } }
      },
      "Partnerschaft": {
        "color": { "source": "status", "function": "categorical", "params": { "mapping": { "verheiratet": "#ff00aa", "geschieden": "#444444", "getrennt": "#888888", "verwitwet": "#aaaaaa" } } },
        "thickness": { "source": "status", "function": "categorical", "params": { "mapping": { "verheiratet": 0.3, "geschieden": 0.05, "getrennt": 0.1, "verwitwet": 0.15 } } }
      },
      "Abstammung": {
        "color": { "source": "constant", "function": "linear", "params": { "color": "#00aaff" } },
        "thickness": { "source": "constant", "function": "linear", "range": [0.15, 0.15] }
      }
    }
  },
  "data": {
    "entities": [
      { "id": "n1", "type": "Person", "label": "Hans", "geburtsjahr": 1945, "geschlecht": "männlich", "generation": 1, "lebensstatus": "lebend", "angeheiratet": false, "position": { "x": 0, "y": 20, "z": 0 } },
      { "id": "n2", "type": "Person", "label": "Maria", "geburtsjahr": 1948, "geschlecht": "weiblich", "generation": 1, "lebensstatus": "lebend", "angeheiratet": true, "position": { "x": -10, "y": 20, "z": 0 } },
      { "id": "n3", "type": "Person", "label": "Klara", "geburtsjahr": 1950, "todesjahr": 2020, "geschlecht": "weiblich", "generation": 1, "lebensstatus": "verstorben", "angeheiratet": true, "position": { "x": 10, "y": 20, "z": 0 } },
      { "id": "n4", "type": "Person", "label": "Lukas", "geburtsjahr": 1970, "geschlecht": "männlich", "generation": 2, "lebensstatus": "lebend", "angeheiratet": false, "position": { "x": -15, "y": 10, "z": 0 } },
      { "id": "n5", "type": "Person", "label": "Anna", "geburtsjahr": 1972, "geschlecht": "weiblich", "generation": 2, "lebensstatus": "lebend", "angeheiratet": false, "position": { "x": -5, "y": 10, "z": 0 } },
      { "id": "n6", "type": "Person", "label": "Peter", "geburtsjahr": 1980, "geschlecht": "männlich", "generation": 2, "lebensstatus": "lebend", "angeheiratet": false, "position": { "x": 10, "y": 10, "z": 0 } },
      { "id": "n7", "type": "Person", "label": "Julia", "geburtsjahr": 1975, "geschlecht": "weiblich", "generation": 2, "lebensstatus": "lebend", "angeheiratet": true, "position": { "x": -25, "y": 10, "z": 0 } },
      { "id": "n8", "type": "Person", "label": "Markus", "geburtsjahr": 1970, "geschlecht": "männlich", "generation": 2, "lebensstatus": "lebend", "angeheiratet": true, "position": { "x": 5, "y": 10, "z": 0 } },
      { "id": "n9", "type": "Person", "label": "Sarah", "geburtsjahr": 1982, "geschlecht": "weiblich", "generation": 2, "lebensstatus": "lebend", "angeheiratet": true, "position": { "x": 20, "y": 10, "z": 0 } },
      { "id": "n10", "type": "Person", "label": "Lisa", "geburtsjahr": 2000, "geschlecht": "weiblich", "generation": 3, "lebensstatus": "lebend", "angeheiratet": false, "position": { "x": -20, "y": 0, "z": 0 } },
      { "id": "n11", "type": "Person", "label": "Tom", "geburtsjahr": 2005, "geschlecht": "männlich", "generation": 3, "lebensstatus": "lebend", "angeheiratet": false, "position": { "x": 0, "y": 0, "z": 0 } },
      { "id": "n12", "type": "Person", "label": "Mia", "geburtsjahr": 2002, "geschlecht": "weiblich", "generation": 3, "lebensstatus": "lebend", "angeheiratet": false, "schwanger": true, "position": { "x": 15, "y": 0, "z": 0 } }
    ],
    "relationships": [
      { "id": "r1", "type": "Partnerschaft", "source": "n1", "target": "n2", "label": "Geschieden", "status": "geschieden" },
      { "id": "r2", "type": "Partnerschaft", "source": "n1", "target": "n3", "label": "Verwitwet", "status": "verwitwet" },
      { "id": "r3", "type": "Partnerschaft", "source": "n4", "target": "n7", "label": "Verheiratet", "status": "verheiratet" },
      { "id": "r4", "type": "Partnerschaft", "source": "n5", "target": "n8", "label": "Verheiratet", "status": "verheiratet" },
      { "id": "r5", "type": "Partnerschaft", "source": "n6", "target": "n9", "label": "Getrennt", "status": "getrennt" },
      { "id": "a1", "type": "Abstammung", "source": "n1", "target": "n4", "label": "Vater von" },
      { "id": "a2", "type": "Abstammung", "source": "n2", "target": "n4", "label": "Mutter von" },
      { "id": "a3", "type": "Abstammung", "source": "n1", "target": "n5", "label": "Vater von" },
      { "id": "a4", "type": "Abstammung", "source": "n2", "target": "n5", "label": "Mutter von" },
      { "id": "a5", "type": "Abstammung", "source": "n1", "target": "n6", "label": "Vater von" },
      { "id": "a6", "type": "Abstammung", "source": "n3", "target": "n6", "label": "Mutter von" },
      { "id": "a7", "type": "Abstammung", "source": "n4", "target": "n10", "label": "Vater von" },
      { "id": "a8", "type": "Abstammung", "source": "n7", "target": "n10", "label": "Mutter von" },
      { "id": "a9", "type": "Abstammung", "source": "n5", "target": "n11", "label": "Mutter von" },
      { "id": "a10", "type": "Abstammung", "source": "n8", "target": "n11", "label": "Vater von" },
      { "id": "a11", "type": "Abstammung", "source": "n6", "target": "n12", "label": "Vater von" },
      { "id": "a12", "type": "Abstammung", "source": "n9", "target": "n12", "label": "Mutter von" }
    ]
  }
}
```

## Erklärung des erweiterten Mappings:
1. **Lebensstatus & Todesjahr:** Die Person "Klara" hat das Attribut `lebensstatus: "verstorben"` sowie ein `todesjahr: 2020`. Das Mapping steuert über die Eigenschaft `opacity` (Sichtbarkeit), dass verstorbene Personen halb-transparent gezeichnet werden (`0.4`).
2. **Schwangerschaft:** "Mia" in der dritten Generation hat das Attribut `schwanger: true`. Das Visual Mapping legt einen leuchtenden `glow` um diesen Knoten, wenn der Wert `true` ist.
3. **Beziehungen & Status:** Es gibt Kanten vom Typ "Partnerschaft" und "Abstammung". Die Partnerschaft hat einen `status` (geschieden, getrennt, verheiratet). Das Mapping passt je nach Status die Dicke (`thickness`) und die Farbe (`color`) der Kante an, sodass man z.B. eine Scheidung direkt an einer sehr dünnen, grauen Linie erkennt.
4. **Angeheiratet vs Blutsverwandt:** Die angeheirateten Personen (wie Maria, Klara, Julia) haben das Attribut `angeheiratet: true` und können so z.B. im Programm leicht gefiltert werden.
