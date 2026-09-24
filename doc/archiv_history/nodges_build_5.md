# Build 5 JSON-Schema: Referenz-Spezifikation

Dieses Dokument definiert das maschinenlesbare Schema fuer Nodges Build 5. Es dient als Vertrag zwischen dem LLM (Datenproduzent) und der Nodges-Engine (Datenkonsument).

## Aenderungen gegenueber Build 4

| Aspekt | Build 4 | Build 5 |
|:---|:---|:---|
| `schemaVersion` | `"4.0"` | `"5.0"` |
| `metadata.competencyQuestions` | Nicht vorhanden | **Neu**: Array von 3-5 Kernfragen |
| `visualMappings` | Im Ontologie-Schritt erzeugt | **Separater Schritt** nach Datengenerierung |
| Edge Properties | Meist leeres `properties: {}` | Vollwertige Properties (Intensitaet, Dauer, etc.) |
| Null-Handling | Implizit | **Explizit**: `null` fuer unbekannt, weglassen fuer irrelevant |
| Pipeline | 2-Schritt (Ontologie + Daten) | **5-Schritt** (CQ + Ontologie + Daten + Visual + Validierung) |

---

## Vollstaendiges Schema (JSON)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "nodges-build-5",
  "title": "Nodges Build 5 Graph Data",
  "type": "object",
  "required": ["system", "metadata", "dataModel", "data"],
  "properties": {
    "system": {
      "type": "string",
      "description": "Name des Netzwerks / Datensatzes"
    },
    "metadata": {
      "type": "object",
      "required": ["schemaVersion", "description", "author"],
      "properties": {
        "schemaVersion": {
          "type": "string",
          "const": "5.0"
        },
        "description": {
          "type": "string",
          "description": "Kurze inhaltliche Beschreibung des Netzwerks"
        },
        "author": {
          "type": "string"
        },
        "competencyQuestions": {
          "type": "array",
          "items": { "type": "string" },
          "minItems": 3,
          "maxItems": 5,
          "description": "Kernfragen, die das Netzwerk beantworten soll"
        },
        "map": {
          "type": "object",
          "properties": {
            "image": { "type": "string" },
            "referenceWidth": { "type": "number" },
            "referenceHeight": { "type": "number" }
          }
        }
      }
    },
    "dataModel": {
      "type": "object",
      "required": ["entities", "relationships"],
      "properties": {
        "entities": {
          "type": "object",
          "description": "Typdefinitionen fuer Knoten",
          "additionalProperties": {
            "type": "object",
            "required": ["properties"],
            "properties": {
              "properties": {
                "type": "object",
                "additionalProperties": {
                  "type": "object",
                  "required": ["type"],
                  "properties": {
                    "type": {
                      "type": "string",
                      "enum": ["categorical", "continuous"]
                    },
                    "values": {
                      "type": "array",
                      "items": { "type": "string" },
                      "description": "Nur bei type=categorical"
                    },
                    "range": {
                      "type": "array",
                      "items": { "type": "number" },
                      "minItems": 2,
                      "maxItems": 2,
                      "description": "Nur bei type=continuous: [min, max]"
                    }
                  }
                }
              }
            }
          }
        },
        "relationships": {
          "type": "object",
          "description": "Typdefinitionen fuer Kanten – KOENNEN eigene Properties tragen",
          "additionalProperties": {
            "type": "object",
            "required": ["properties"],
            "properties": {
              "properties": {
                "type": "object",
                "additionalProperties": {
                  "type": "object",
                  "required": ["type"],
                  "properties": {
                    "type": {
                      "type": "string",
                      "enum": ["categorical", "continuous"]
                    },
                    "values": { "type": "array", "items": { "type": "string" } },
                    "range": { "type": "array", "items": { "type": "number" }, "minItems": 2, "maxItems": 2 }
                  }
                }
              }
            }
          }
        }
      }
    },
    "visualMappings": {
      "type": "object",
      "description": "Wird in Build 5 SEPARAT generiert (Phase 5)",
      "properties": {
        "defaultPresets": {
          "type": "object",
          "additionalProperties": {
            "type": "object",
            "properties": {
              "color": { "$ref": "#/$defs/visualMapping" },
              "size": { "$ref": "#/$defs/visualMapping" },
              "geometry": { "$ref": "#/$defs/visualMapping" },
              "thickness": { "$ref": "#/$defs/visualMapping" },
              "glow": { "$ref": "#/$defs/visualMapping" },
              "animation": { "$ref": "#/$defs/visualMapping" }
            }
          }
        }
      }
    },
    "data": {
      "type": "object",
      "required": ["entities", "relationships"],
      "properties": {
        "entities": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "type", "label"],
            "properties": {
              "id": { "type": "string" },
              "type": { "type": "string" },
              "label": { "type": "string" },
              "position": {
                "type": "object",
                "properties": {
                  "x": { "type": "number" },
                  "y": { "type": "number" },
                  "z": { "type": "number" }
                }
              },
              "mapX": { "type": "number" },
              "mapY": { "type": "number" },
              "temporal": { "$ref": "#/$defs/temporal" }
            }
          }
        },
        "relationships": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "type", "source", "target"],
            "properties": {
              "id": { "type": "string" },
              "type": { "type": "string" },
              "source": { "type": "string" },
              "target": { "type": "string" },
              "label": { "type": "string" },
              "temporal": { "$ref": "#/$defs/temporal" }
            }
          }
        }
      }
    }
  },
  "$defs": {
    "temporal": {
      "type": "object",
      "properties": {
        "validFrom": { "type": ["number", "null"] },
        "validTo": { "type": ["number", "null"] },
        "history": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["timestamp", "changes"],
            "properties": {
              "timestamp": { "type": "number" },
              "changes": { "type": "object" }
            }
          }
        }
      }
    },
    "visualMapping": {
      "type": "object",
      "required": ["source", "function"],
      "properties": {
        "source": { "type": "string" },
        "function": {
          "type": "string",
          "enum": ["categorical", "linear", "constant"]
        },
        "range": {
          "type": "array",
          "items": { "type": "number" },
          "minItems": 2,
          "maxItems": 2
        },
        "params": { "type": "object" }
      }
    }
  }
}
```

---

## Validierungsregeln (Phase 6)

Diese Pruefungen sollen programmatisch vor der JSON-Ausgabe laufen:

| # | Pruefung | Schweregrad | Aktion bei Fehler |
|:--|:---|:---|:---|
| V1 | Jede Entity hat `id`, `type`, `label` | Kritisch | Ablehnung |
| V2 | Jede Relationship hat `id`, `type`, `source`, `target` | Kritisch | Ablehnung |
| V3 | `source` und `target` verweisen auf existierende Entity-IDs | Kritisch | Kante entfernen (Dangling Edge) |
| V4 | `type` jeder Entity existiert in `dataModel.entities` | Warnung | Typ ergaenzen |
| V5 | `type` jeder Relationship existiert in `dataModel.relationships` | Warnung | Typ ergaenzen |
| V6 | Attribute einer Entity passen zum Typ-Schema | Warnung | Ueberfluessige entfernen |
| V7 | Keine doppelten IDs | Kritisch | Suffixierung |
| V8 | `metadata.schemaVersion` === `"5.0"` | Kritisch | Setzen |
