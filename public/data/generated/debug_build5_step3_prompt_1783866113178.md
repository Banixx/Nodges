SYSTEM:
Du bist ein hochpraeziser Daten-Architekt fuer Nodges (eine interaktive 3D/4D-Netzwerk-Visualisierung).
Deine Aufgabe ist es, fuer einen fertigen Datensatz die optimalen visuellen Zuweisungen zu erstellen.
Deine Antwort MUSS ausschliesslich gueltiges JSON sein, absolut ohne Markdown-Codebloecke (kein ```json) und ohne erklaerenden Text.

DU ERHAELTST:
- Einen komplett befuellten Datensatz mit `dataModel` und `data` (entities + relationships)
- Keine `visualMappings` – die erstellst DU jetzt.

DEIN VORGEHEN:
1. Analysiere die tatsaechliche Datenverteilung: Welche kategorischen Werte kommen vor? Wie sind numerische Werte verteilt?
2. Waehle die visuell wirkungsvollsten Attribute fuer die Zuweisungen aus.
3. Erstelle ein `visualMappings`-Objekt, das die Staerken von Nodges optimal nutzt.

PFLICHTSTRUKTUR (Visual Mapping Build 5):
{
  "visualMappings": {
    "defaultPresets": {
      "<Entity_Typ_A>": {
        "color": { "source": "<kategorisches_attribut>", "function": "categorical" },
        "size": { "source": "<numerisches_attribut>", "function": "linear", "range": [0.5, 2.5] },
        "geometry": { "source": "constant", "function": "constant", "params": { "geometry": "sphere" } }
      },
      "<Entity_Typ_B>": {
        "color": { "source": "<anderes_attribut>", "function": "categorical" },
        "size": { "source": "constant", "function": "constant", "params": { "size": 1.0 } },
        "geometry": { "source": "constant", "function": "constant", "params": { "geometry": "box" } }
      },
      "<Kanten_Typ_A>": {
        "color": { "source": "constant", "function": "constant", "params": { "color": "#hexcode" } },
        "thickness": { "source": "<kanten_attribut>", "function": "linear", "range": [0.05, 0.5] }
      },
      "<Kanten_Typ_B>": {
        "color": { "source": "constant", "function": "constant", "params": { "color": "#hexcode" } },
        "thickness": { "source": "constant", "function": "constant", "range": [0.05, 0.1] }
      }
    }
  }
}

WICHTIGE REGELN FUER DAS VISUELLE MAPPING:

1. GLOBALE EINDEUTIGKEIT DER VISUELLEN KANAELE (SEHR WICHTIG):
   - Um den Nutzer nicht zu verwirren, darf ein visueller Kanal (z.B. Groesse) im GESAMTEN Netzwerk nur durch EIN EINZIGES Attribut gesteuert werden!
   - Erlaubte datengetriebene Kanaele sind vorerst NUR: `size`, `color`, `positionX`, `positionY`, `positionZ`.
   - Beispiel: Wenn du entscheidest, dass `size` durch das Attribut `Populationsgroesse` gesteuert wird, dann darf `size` bei KEINEM ANDEREN Entity-Typ durch ein anderes Attribut (wie `Bedeckungsgrad`) gesteuert werden! Andere Typen erhalten stattdessen eine konstante Groesse (z.B. `size: 1.0`).
   - Waehle also maximal 5 Schluessel-Attribute aus dem gesamten Datensatz aus und weise jedem exakt EINEN visuellen Kanal zu.

2. JEDER TYP BRAUCHT EIN PRESET:
   - Erstelle fuer JEDEN Entity-Typ und JEDEN Relationship-Typ im `dataModel` ein Preset.
   - Fehlende Presets fuehren zu unsichtbaren Elementen!

3. KNOTEN-MAPPINGS (GEOMETRIE ALS TYP-INDIKATOR):
   - Nutze `geometry`, um die Entity-Typen unterscheidbar zu machen. Jeder Typ MUSS eine andere, feste Geometrie erhalten (z.B. Typ A = `sphere`, Typ B = `box`, Typ C = `dodecahedron`). Mappe hier keine Daten.
   - Wende deine ausgewaehlten globalen Daten-Attribute auf die passenden Kanaele (`color`, `size`, `positionX`, `positionY`, `positionZ`) an. Fehlt das Attribut bei einem Typ, nutze `constant`.

4. KANTEN-MAPPINGS:
   - `color`: Verwende fuer jeden Kanten-Typ eine eigene, feste Farbe (z.B. #4CAF50 fuer positiv, #F44336 fuer negativ).
   - `thickness`: Wenn du ein globales Kanten-Attribut hast (z.B. "Intensitaet" bei allen Kanten), kannst du es mappen. Ansonsten nutze `constant`.

5. NUR `visualMappings` AUSGEBEN:
   - Gib NUR das `visualMappings`-Objekt zurueck, absolut kein anderes JSON und keine Erklaerungen.


USER:
Erstelle die visuellen Mappings fuer diesen Datensatz:

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
      "id": "gen-1783866074-UgYh0dzlnjWwIPktTOOu",
      "created": 1783866074,
      "model": "x-ai/grok-4.20-20260309",
      "usage": {
        "prompt_tokens": 2533,
        "completion_tokens": 7285,
        "total_tokens": 9818,
        "cost": 0.02124435,
        "is_byok": false,
        "prompt_tokens_details": {
          "cached_tokens": 128,
          "cache_write_tokens": 0,
          "audio_tokens": 0,
          "video_tokens": 0
        },
        "cost_details": {
          "upstream_inference_cost": 0.02124435,
          "upstream_inference_prompt_cost": 0.00303185,
          "upstream_inference_completions_cost": 0.0182125
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
    "entities": [
      {
        "id": "sun",
        "type": "CelestialBody",
        "label": "Sun",
        "name": "Sun",
        "bodyType": "Star",
        "diameterKm": 1392700,
        "massKg": 1.989e+30,
        "density": 1.41,
        "albedo": 0,
        "discoveryYear": null,
        "composition": "Gaseous",
        "position": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "mapX": 500,
        "mapY": 500,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": []
        }
      },
      {
        "id": "mercury",
        "type": "CelestialBody",
        "label": "Mercury",
        "name": "Mercury",
        "bodyType": "Planet",
        "diameterKm": 4879,
        "massKg": 3.301e+23,
        "density": 5.43,
        "albedo": 0.12,
        "discoveryYear": null,
        "composition": "Rocky",
        "position": {
          "x": -12,
          "y": 0,
          "z": 5
        },
        "mapX": 380,
        "mapY": 500,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": []
        }
      },
      {
        "id": "venus",
        "type": "CelestialBody",
        "label": "Venus",
        "name": "Venus",
        "bodyType": "Planet",
        "diameterKm": 12104,
        "massKg": 4.867e+24,
        "density": 5.24,
        "albedo": 0.75,
        "discoveryYear": null,
        "composition": "Rocky",
        "position": {
          "x": -8,
          "y": 0,
          "z": 3
        },
        "mapX": 420,
        "mapY": 500,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": []
        }
      },
      {
        "id": "earth",
        "type": "CelestialBody",
        "label": "Earth",
        "name": "Earth",
        "bodyType": "Planet",
        "diameterKm": 12742,
        "massKg": 5.972e+24,
        "density": 5.51,
        "albedo": 0.306,
        "discoveryYear": null,
        "composition": "Rocky",
        "position": {
          "x": -4,
          "y": 0,
          "z": 0
        },
        "mapX": 460,
        "mapY": 500,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": []
        }
      },
      {
        "id": "mars",
        "type": "CelestialBody",
        "label": "Mars",
        "name": "Mars",
        "bodyType": "Planet",
        "diameterKm": 6779,
        "massKg": 6.417e+23,
        "density": 3.93,
        "albedo": 0.25,
        "discoveryYear": null,
        "composition": "Rocky",
        "position": {
          "x": 0,
          "y": 0,
          "z": -2
        },
        "mapX": 500,
        "mapY": 500,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": []
        }
      },
      {
        "id": "jupiter",
        "type": "CelestialBody",
        "label": "Jupiter",
        "name": "Jupiter",
        "bodyType": "Planet",
        "diameterKm": 139820,
        "massKg": 1.898e+27,
        "density": 1.33,
        "albedo": 0.34,
        "discoveryYear": null,
        "composition": "Gaseous",
        "position": {
          "x": 8,
          "y": 0,
          "z": 6
        },
        "mapX": 580,
        "mapY": 500,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": []
        }
      },
      {
        "id": "saturn",
        "type": "CelestialBody",
        "label": "Saturn",
        "name": "Saturn",
        "bodyType": "Planet",
        "diameterKm": 120536,
        "massKg": 5.683e+26,
        "density": 0.69,
        "albedo": 0.34,
        "discoveryYear": null,
        "composition": "Gaseous",
        "position": {
          "x": 15,
          "y": 0,
          "z": 8
        },
        "mapX": 650,
        "mapY": 500,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": []
        }
      },
      {
        "id": "uranus",
        "type": "CelestialBody",
        "label": "Uranus",
        "name": "Uranus",
        "bodyType": "Planet",
        "diameterKm": 51118,
        "massKg": 8.681e+25,
        "density": 1.27,
        "albedo": 0.36,
        "discoveryYear": 1781,
        "composition": "Icy",
        "position": {
          "x": 22,
          "y": 5,
          "z": 10
        },
        "mapX": 720,
        "mapY": 450,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": [
            {
              "timestamp": 1781,
              "changes": {
                "discoveryYear": 1781
              }
            }
          ]
        }
      },
      {
        "id": "neptune",
        "type": "CelestialBody",
        "label": "Neptune",
        "name": "Neptune",
        "bodyType": "Planet",
        "diameterKm": 49528,
        "massKg": 1.024e+26,
        "density": 1.64,
        "albedo": 0.29,
        "discoveryYear": 1846,
        "composition": "Icy",
        "position": {
          "x": 28,
          "y": 5,
          "z": 12
        },
        "mapX": 780,
        "mapY": 450,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": [
            {
              "timestamp": 1846,
              "changes": {
                "discoveryYear": 1846
              }
            }
          ]
        }
      },
      {
        "id": "pluto",
        "type": "CelestialBody",
        "label": "Pluto",
        "name": "Pluto",
        "bodyType": "DwarfPlanet",
        "diameterKm": 2376,
        "massKg": 1.303e+22,
        "density": 1.86,
        "albedo": 0.49,
        "discoveryYear": 1930,
        "composition": "Icy",
        "position": {
          "x": 35,
          "y": 10,
          "z": 25
        },
        "mapX": 850,
        "mapY": 400,
        "temporal": {
          "validFrom": -4600,
          "validTo": 2006,
          "history": [
            {
              "timestamp": 1930,
              "changes": {
                "discoveryYear": 1930
              }
            },
            {
              "timestamp": 2006,
              "changes": {
                "bodyType": "DwarfPlanet"
              }
            }
          ]
        }
      },
      {
        "id": "moon",
        "type": "CelestialBody",
        "label": "Moon",
        "name": "Moon",
        "bodyType": "Moon",
        "diameterKm": 3474,
        "massKg": 7.342e+22,
        "density": 3.34,
        "albedo": 0.14,
        "discoveryYear": null,
        "composition": "Rocky",
        "position": {
          "x": -3,
          "y": -4,
          "z": 1
        },
        "mapX": 470,
        "mapY": 520,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": []
        }
      },
      {
        "id": "phobos",
        "type": "CelestialBody",
        "label": "Phobos",
        "name": "Phobos",
        "bodyType": "Moon",
        "diameterKm": 22,
        "massKg": 10700000000000000,
        "density": 1.87,
        "albedo": 0.07,
        "discoveryYear": 1877,
        "composition": "Rocky",
        "position": {
          "x": 1,
          "y": -5,
          "z": -1
        },
        "mapX": 510,
        "mapY": 540,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": [
            {
              "timestamp": 1877,
              "changes": {
                "discoveryYear": 1877
              }
            }
          ]
        }
      },
      {
        "id": "deimos",
        "type": "CelestialBody",
        "label": "Deimos",
        "name": "Deimos",
        "bodyType": "Moon",
        "diameterKm": 12,
        "massKg": 1480000000000000,
        "density": 1.47,
        "albedo": 0.08,
        "discoveryYear": 1877,
        "composition": "Rocky",
        "position": {
          "x": 2,
          "y": -6,
          "z": -2
        },
        "mapX": 515,
        "mapY": 550,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": [
            {
              "timestamp": 1877,
              "changes": {
                "discoveryYear": 1877
              }
            }
          ]
        }
      },
      {
        "id": "io",
        "type": "CelestialBody",
        "label": "Io",
        "name": "Io",
        "bodyType": "Moon",
        "diameterKm": 3643,
        "massKg": 8.93e+22,
        "density": 3.53,
        "albedo": 0.63,
        "discoveryYear": 1610,
        "composition": "Rocky",
        "position": {
          "x": 9,
          "y": -3,
          "z": 5
        },
        "mapX": 590,
        "mapY": 530,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": [
            {
              "timestamp": 1610,
              "changes": {
                "discoveryYear": 1610
              }
            }
          ]
        }
      },
      {
        "id": "europa",
        "type": "CelestialBody",
        "label": "Europa",
        "name": "Europa",
        "bodyType": "Moon",
        "diameterKm": 3122,
        "massKg": 4.8e+22,
        "density": 3.01,
        "albedo": 0.67,
        "discoveryYear": 1610,
        "composition": "Icy",
        "position": {
          "x": 10,
          "y": -4,
          "z": 6
        },
        "mapX": 595,
        "mapY": 535,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": [
            {
              "timestamp": 1610,
              "changes": {
                "discoveryYear": 1610
              }
            }
          ]
        }
      },
      {
        "id": "ganymede",
        "type": "CelestialBody",
        "label": "Ganymede",
        "name": "Ganymede",
        "bodyType": "Moon",
        "diameterKm": 5268,
        "massKg": 1.48e+23,
        "density": 1.94,
        "albedo": 0.43,
        "discoveryYear": 1610,
        "composition": "Icy",
        "position": {
          "x": 11,
          "y": -5,
          "z": 7
        },
        "mapX": 600,
        "mapY": 540,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": [
            {
              "timestamp": 1610,
              "changes": {
                "discoveryYear": 1610
              }
            }
          ]
        }
      },
      {
        "id": "callisto",
        "type": "CelestialBody",
        "label": "Callisto",
        "name": "Callisto",
        "bodyType": "Moon",
        "diameterKm": 4821,
        "massKg": 1.08e+23,
        "density": 1.83,
        "albedo": 0.17,
        "discoveryYear": 1610,
        "composition": "Icy",
        "position": {
          "x": 12,
          "y": -6,
          "z": 8
        },
        "mapX": 605,
        "mapY": 550,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": [
            {
              "timestamp": 1610,
              "changes": {
                "discoveryYear": 1610
              }
            }
          ]
        }
      },
      {
        "id": "ceres",
        "type": "CelestialBody",
        "label": "Ceres",
        "name": "Ceres",
        "bodyType": "DwarfPlanet",
        "diameterKm": 939,
        "massKg": 939000000000000000000,
        "density": 2.16,
        "albedo": 0.09,
        "discoveryYear": 1801,
        "composition": "Rocky",
        "position": {
          "x": 5,
          "y": 8,
          "z": -15
        },
        "mapX": 530,
        "mapY": 380,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": [
            {
              "timestamp": 1801,
              "changes": {
                "discoveryYear": 1801,
                "bodyType": "DwarfPlanet"
              }
            }
          ]
        }
      },
      {
        "id": "halley",
        "type": "CelestialBody",
        "label": "Halley's Comet",
        "name": "Halley's Comet",
        "bodyType": "Comet",
        "diameterKm": 11,
        "massKg": 220000000000000,
        "density": 0.6,
        "albedo": 0.04,
        "discoveryYear": 1705,
        "composition": "Icy",
        "position": {
          "x": -25,
          "y": 15,
          "z": -20
        },
        "mapX": 320,
        "mapY": 320,
        "temporal": {
          "validFrom": -2400,
          "validTo": null,
          "history": [
            {
              "timestamp": 1705,
              "changes": {
                "discoveryYear": 1705
              }
            }
          ]
        }
      },
      {
        "id": "vesta",
        "type": "CelestialBody",
        "label": "Vesta",
        "name": "Vesta",
        "bodyType": "Asteroid",
        "diameterKm": 525,
        "massKg": 259000000000000000000,
        "density": 3.46,
        "albedo": 0.42,
        "discoveryYear": 1807,
        "composition": "Rocky",
        "position": {
          "x": 6,
          "y": 9,
          "z": -18
        },
        "mapX": 540,
        "mapY": 370,
        "temporal": {
          "validFrom": -4600,
          "validTo": null,
          "history": [
            {
              "timestamp": 1807,
              "changes": {
                "discoveryYear": 1807
              }
            }
          ]
        }
      }
    ],
    "relationships": [
      {
        "id": "rel_sun_mercury",
        "type": "Orbits",
        "source": "sun",
        "target": "mercury",
        "label": "Mercury orbits the Sun",
        "semiMajorAxisAU": 0.387,
        "orbitalPeriodYears": 0.241,
        "eccentricity": 0.205,
        "inclinationDeg": 7,
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_sun_venus",
        "type": "Orbits",
        "source": "sun",
        "target": "venus",
        "label": "Venus orbits the Sun",
        "semiMajorAxisAU": 0.723,
        "orbitalPeriodYears": 0.615,
        "eccentricity": 0.007,
        "inclinationDeg": 3.4,
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_sun_earth",
        "type": "Orbits",
        "source": "sun",
        "target": "earth",
        "label": "Earth orbits the Sun",
        "semiMajorAxisAU": 1,
        "orbitalPeriodYears": 1,
        "eccentricity": 0.017,
        "inclinationDeg": 0,
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_sun_mars",
        "type": "Orbits",
        "source": "sun",
        "target": "mars",
        "label": "Mars orbits the Sun",
        "semiMajorAxisAU": 1.524,
        "orbitalPeriodYears": 1.881,
        "eccentricity": 0.093,
        "inclinationDeg": 1.85,
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_sun_jupiter",
        "type": "Orbits",
        "source": "sun",
        "target": "jupiter",
        "label": "Jupiter orbits the Sun",
        "semiMajorAxisAU": 5.203,
        "orbitalPeriodYears": 11.86,
        "eccentricity": 0.048,
        "inclinationDeg": 1.3,
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_sun_saturn",
        "type": "Orbits",
        "source": "sun",
        "target": "saturn",
        "label": "Saturn orbits the Sun",
        "semiMajorAxisAU": 9.537,
        "orbitalPeriodYears": 29.46,
        "eccentricity": 0.054,
        "inclinationDeg": 2.49,
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_sun_uranus",
        "type": "Orbits",
        "source": "sun",
        "target": "uranus",
        "label": "Uranus orbits the Sun",
        "semiMajorAxisAU": 19.19,
        "orbitalPeriodYears": 84.01,
        "eccentricity": 0.047,
        "inclinationDeg": 0.77,
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_sun_neptune",
        "type": "Orbits",
        "source": "sun",
        "target": "neptune",
        "label": "Neptune orbits the Sun",
        "semiMajorAxisAU": 30.07,
        "orbitalPeriodYears": 164.8,
        "eccentricity": 0.009,
        "inclinationDeg": 1.77,
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_sun_pluto",
        "type": "Orbits",
        "source": "sun",
        "target": "pluto",
        "label": "Pluto orbits the Sun",
        "semiMajorAxisAU": 39.48,
        "orbitalPeriodYears": 247.9,
        "eccentricity": 0.249,
        "inclinationDeg": 17.16,
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_earth_moon",
        "type": "HasMoon",
        "source": "earth",
        "target": "moon",
        "label": "Earth has Moon",
        "isNaturalSatellite": "true",
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_mars_phobos",
        "type": "HasMoon",
        "source": "mars",
        "target": "phobos",
        "label": "Mars has Phobos",
        "isNaturalSatellite": "true",
        "temporal": {
          "validFrom": 1877,
          "validTo": null
        }
      },
      {
        "id": "rel_mars_deimos",
        "type": "HasMoon",
        "source": "mars",
        "target": "deimos",
        "label": "Mars has Deimos",
        "isNaturalSatellite": "true",
        "temporal": {
          "validFrom": 1877,
          "validTo": null
        }
      },
      {
        "id": "rel_jupiter_io",
        "type": "HasMoon",
        "source": "jupiter",
        "target": "io",
        "label": "Jupiter has Io",
        "isNaturalSatellite": "true",
        "temporal": {
          "validFrom": 1610,
          "validTo": null
        }
      },
      {
        "id": "rel_jupiter_europa",
        "type": "HasMoon",
        "source": "jupiter",
        "target": "europa",
        "label": "Jupiter has Europa",
        "isNaturalSatellite": "true",
        "temporal": {
          "validFrom": 1610,
          "validTo": null
        }
      },
      {
        "id": "rel_jupiter_ganymede",
        "type": "HasMoon",
        "source": "jupiter",
        "target": "ganymede",
        "label": "Jupiter has Ganymede",
        "isNaturalSatellite": "true",
        "temporal": {
          "validFrom": 1610,
          "validTo": null
        }
      },
      {
        "id": "rel_jupiter_callisto",
        "type": "HasMoon",
        "source": "jupiter",
        "target": "callisto",
        "label": "Jupiter has Callisto",
        "isNaturalSatellite": "true",
        "temporal": {
          "validFrom": 1610,
          "validTo": null
        }
      },
      {
        "id": "rel_mercury_terrestrial",
        "type": "BelongsTo",
        "source": "mercury",
        "target": "sun",
        "label": "Mercury belongs to Terrestrial planets",
        "group": "Terrestrial",
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_venus_terrestrial",
        "type": "BelongsTo",
        "source": "venus",
        "target": "sun",
        "label": "Venus belongs to Terrestrial planets",
        "group": "Terrestrial",
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_earth_terrestrial",
        "type": "BelongsTo",
        "source": "earth",
        "target": "sun",
        "label": "Earth belongs to Terrestrial planets",
        "group": "Terrestrial",
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_mars_terrestrial",
        "type": "BelongsTo",
        "source": "mars",
        "target": "sun",
        "label": "Mars belongs to Terrestrial planets",
        "group": "Terrestrial",
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_jupiter_gasgiant",
        "type": "BelongsTo",
        "source": "jupiter",
        "target": "sun",
        "label": "Jupiter belongs to Gas Giants",
        "group": "GasGiant",
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_saturn_gasgiant",
        "type": "BelongsTo",
        "source": "saturn",
        "target": "sun",
        "label": "Saturn belongs to Gas Giants",
        "group": "GasGiant",
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_uranus_icegiant",
        "type": "BelongsTo",
        "source": "uranus",
        "target": "sun",
        "label": "Uranus belongs to Ice Giants",
        "group": "IceGiant",
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_neptune_icegiant",
        "type": "BelongsTo",
        "source": "neptune",
        "target": "sun",
        "label": "Neptune belongs to Ice Giants",
        "group": "IceGiant",
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_pluto_kuiper",
        "type": "BelongsTo",
        "source": "pluto",
        "target": "sun",
        "label": "Pluto belongs to Kuiper Belt",
        "group": "KuiperBelt",
        "temporal": {
          "validFrom": -4600,
          "validTo": 2006
        }
      },
      {
        "id": "rel_ceres_asteroidbelt",
        "type": "BelongsTo",
        "source": "ceres",
        "target": "sun",
        "label": "Ceres belongs to Asteroid Belt",
        "group": "AsteroidBelt",
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_vesta_asteroidbelt",
        "type": "BelongsTo",
        "source": "vesta",
        "target": "sun",
        "label": "Vesta belongs to Asteroid Belt",
        "group": "AsteroidBelt",
        "temporal": {
          "validFrom": -4600,
          "validTo": null
        }
      },
      {
        "id": "rel_halley_sun",
        "type": "Orbits",
        "source": "sun",
        "target": "halley",
        "label": "Halley's Comet orbits the Sun",
        "semiMajorAxisAU": 17.8,
        "orbitalPeriodYears": 75.3,
        "eccentricity": 0.967,
        "inclinationDeg": 162.3,
        "temporal": {
          "validFrom": -2400,
          "validTo": null
        }
      }
    ]
  }
}