SYSTEM:
Du bist ein hochpraeziser Daten-Architekt fuer Nodges (eine interaktive 3D/4D-Netzwerk-Visualisierung).
Deine Aufgabe ist es, ein bestehendes Schema (Ontologie) mit konkreten Daten zu befuellen.
Deine Antwort MUSS ausschliesslich gueltiges JSON sein, absolut ohne Markdown-Codebloecke (kein ```json) und ohne erklaerenden Text.

DU ERHAELTST:
- Eine fertige Ontologie (Schema) mit `dataModel` und `metadata` (inklusive Competency Questions)
- Den urspruenglichen User-Prompt (Thema)
- Ggf. Quelltexte/Rohdaten

DEIN VORGEHEN:
Befuelle die `data.entities` und `data.relationships` Arrays STRIKT basierend auf dem vorgegebenen Schema. Du arbeitest DETERMINISTISCH: Keine neuen Typen, keine neuen Attribute erfinden.

PFLICHTSTRUKTUR (Daten Build 5):
{
  "system": "<Uebernehme aus Ontologie>",
  "metadata": "<Uebernehme komplett aus Ontologie>",
  "dataModel": "<Uebernehme komplett aus Ontologie>",
  "data": {
    "entities": [
      {
        "id": "eindeutige_id_1",
        "type": "<Typ aus dataModel.entities>",
        "label": "Anzeigename",
        "<kategorisches_attribut>": "Wert1",
        "<numerisches_attribut>": 42,
        "position": { "x": 0, "y": 5, "z": 0 },
        "mapX": 500, "mapY": 500,
        "temporal": {
          "validFrom": 2000,
          "validTo": null,
          "history": [
            { "timestamp": 2005, "changes": { "<numerisches_attribut>": 80 } }
          ]
        }
      }
    ],
    "relationships": [
      {
        "id": "rel_1",
        "type": "<Typ aus dataModel.relationships>",
        "source": "eindeutige_id_1",
        "target": "id_2",
        "label": "Beschreibung der Beziehung",
        "<kanten_spezifisches_attribut>": 0.8,
        "temporal": { "validFrom": 2005, "validTo": null }
      }
    ]
  }
}

WICHTIGE REGELN FUER DIE DATENGENERIERUNG:

1. STRIKTE SCHEMA-BINDUNG:
   - Verwende NUR die Entity-Typen und Relationship-Typen, die im `dataModel` definiert sind.
   - Verwende NUR die Attribute (Properties), die im Schema fuer den jeweiligen Typ definiert sind.
   - Erfinde KEINE neuen Typen oder Attribute.

2. QUELLENPRIORITÄT:
   - Mitgelieferte Quelltexte/Rohdaten haben ABSOLUTE PRIORITAET ueber dein Weltwissen.
   - Wenn Quelltexte vorhanden sind: Extrahiere Fakten ausschliesslich daraus.
   - Wenn keine Quelltexte: Nutze dein Weltwissen, aber markiere unsichere Werte mit null.

3. NULL-HANDLING (FEHLENDE WERTE):
   - Wenn ein Attribut gemaess `dataModel` fuer einen Typ definiert ist, aber der konkrete Wert fuer eine spezifische Instanz UNBEKANNT ist → setze den Wert auf `null`.
   - Wenn ein Attribut fuer den Typ gar nicht definiert ist → lasse es komplett WEG (undefined).
   - Beispiel: Typ "Person" hat "Partei" als Property. Wenn die Partei einer Person unbekannt ist → `"Partei": null`. Typ "Institution" hat KEIN "Partei"-Property → das Attribut erscheint nicht.

4. FLACHE STRUKTUR & KEIN NESTING:
   - Verschachtele NIEMALS komplexe Beziehungen innerhalb von Knoten-Properties.
   - Jede Zugehoerigkeit, Mitgliedschaft oder hierarchische Beziehung MUSS eine eigene Kante (Edge) im `relationships`-Array sein.

5. ZEITLICHE DYNAMIK (4D):
   - Setze `validFrom` und `validTo` bei JEDER Entity und Relationship.
   - `validTo: null` bedeutet: existiert bis heute.
   - Nutze das `history`-Array fuer zeitliche Veraenderungen.
   - DELTA-REGEL: Im `changes`-Objekt eines Keyframes duerfen NUR die Attribute stehen, die sich zu diesem Zeitpunkt aendern. Keine Duplikation unveraenderter Werte!

6. RAUM & GEOGRAFIE:
   - GEOSPATIAL: Wenn der Kontext geografisch ist, nutze `mapX` und `mapY`.
   - 3D-RAUM: Ohne Karte → `position` {x,y,z} intelligent setzen. Y fuer Hierarchie, X/Z fuer semantische Cluster. Bereich: -30 bis +30.

7. UMFANG:
   - Erzeuge ein dichtes Netzwerk: Mindestens 10-15 Entities und 15-25 Relationships.
   - Nutze ALLE im Schema definierten Typen (fuer Entities UND Relationships).

8. KEIN VISUAL MAPPING:
   - Erzeuge KEIN `visualMappings`-Objekt! Das passiert in einem separaten, spaeteren Schritt.


USER:
Nutze EXAKT das folgende Schema (Ontologie), um die Daten zu generieren:

{
  "system": "Sonnensystem",
  "metadata": {
    "schemaVersion": "5.0",
    "description": "Ontologie für das Sonnensystem mit Himmelskörpern, Umlaufbahnen und physikalischen Eigenschaften",
    "author": "AI",
    "competencyQuestions": [
      "Welche Himmelskörper umkreisen welche zentralen Objekte und mit welchen Bahnparametern?",
      "Welche physikalischen und orbitalen Eigenschaften haben die Planeten, Monde, Zwergplaneten und Asteroiden?",
      "Welche Beziehungen (z.B. Umlaufbahnen, Trabanten, Zusammensetzung) bestehen zwischen den Objekten des Sonnensystems?",
      "Wie lassen sich die Himmelskörper nach Typ, Größe, Entfernung und Zusammensetzung kategorisieren und vergleichen?"
    ],
    "map": {
      "image": "Map.jpg",
      "referenceWidth": 1000,
      "referenceHeight": 1000
    },
    "apiResponse": {
      "id": "gen-1783866069-wENkEYQN8W9A1QiJ0KpT",
      "created": 1783866069,
      "model": "x-ai/grok-4.20-20260309",
      "usage": {
        "prompt_tokens": 1255,
        "completion_tokens": 696,
        "total_tokens": 1951,
        "cost": 0.00203195,
        "is_byok": false,
        "prompt_tokens_details": {
          "cached_tokens": 1216,
          "cache_write_tokens": 0,
          "audio_tokens": 0,
          "video_tokens": 0
        },
        "cost_details": {
          "upstream_inference_cost": 0.00203195,
          "upstream_inference_prompt_cost": 0.00029195,
          "upstream_inference_completions_cost": 0.00174
        },
        "completion_tokens_details": {
          "reasoning_tokens": 0,
          "image_tokens": 0,
          "audio_tokens": 0
        }
      },
      "system_fingerprint": null
    }
  },
  "dataModel": {
    "entities": {
      "CelestialBody": {
        "properties": {
          "name": {
            "type": "string"
          },
          "bodyType": {
            "type": "categorical",
            "values": [
              "Star",
              "Planet",
              "DwarfPlanet",
              "Moon",
              "Asteroid",
              "Comet"
            ]
          },
          "diameterKm": {
            "type": "continuous",
            "range": [
              0,
              2000000
            ]
          },
          "massKg": {
            "type": "continuous",
            "range": [
              0,
              2e+30
            ]
          },
          "density": {
            "type": "continuous",
            "range": [
              0,
              20
            ]
          },
          "albedo": {
            "type": "continuous",
            "range": [
              0,
              1
            ]
          },
          "discoveryYear": {
            "type": "continuous",
            "range": [
              -3000,
              2025
            ]
          },
          "composition": {
            "type": "categorical",
            "values": [
              "Rocky",
              "Gaseous",
              "Icy",
              "Metallic",
              "Mixed"
            ]
          }
        }
      }
    },
    "relationships": {
      "Orbits": {
        "properties": {
          "semiMajorAxisAU": {
            "type": "continuous",
            "range": [
              0,
              1000
            ]
          },
          "orbitalPeriodYears": {
            "type": "continuous",
            "range": [
              0,
              10000
            ]
          },
          "eccentricity": {
            "type": "continuous",
            "range": [
              0,
              1
            ]
          },
          "inclinationDeg": {
            "type": "continuous",
            "range": [
              0,
              180
            ]
          }
        }
      },
      "HasMoon": {
        "properties": {
          "isNaturalSatellite": {
            "type": "categorical",
            "values": [
              "true",
              "false"
            ]
          }
        }
      },
      "BelongsTo": {
        "properties": {
          "group": {
            "type": "categorical",
            "values": [
              "Terrestrial",
              "GasGiant",
              "IceGiant",
              "KuiperBelt",
              "AsteroidBelt"
            ]
          }
        }
      }
    }
  },
  "data": {
    "entities": [],
    "relationships": []
  }
}

Befuelle nun die data.entities und data.relationships Arrays basierend auf der Originalanfrage:
sonnensystem