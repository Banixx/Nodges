# Grok 4.20 Iterations Test Results

Dieses Dokument enthält die Ergebnisse aus 10 Iterationen mit dem Modell `x-ai/grok-4.20`. 
Die Tests wurden entworfen, um Features wie temporale Eigenschaften, multiple Edges, visuelle Mappings und rekursive Beziehungen zu prüfen.


=== Iteration: 1. Einfacher Graph ===
Dauer: 13.53s
Entities: 7
Relationships: 9
----------------------------------------
DataModel Entities: {
  "Star": {
    "properties": {
      "mass_kg": {
        "type": "continuous",
        "range": [
          1e+29,
          2e+30
        ]
      },
      "diameter_km": {
        "type": "continuous",
        "range": [
          100000,
          2000000
        ]
      },
      "temperature_k": {
        "type": "continuous",
        "range": [
          5000,
          7000
        ]
      },
      "age_byr": {
        "type": "continuous",
        "range": [
          0,
          10
        ]
      }
    }
  },
  "Planet": {
    "properties": {
      "mass_kg": {
        "type": "continuous",
        "range": [
          1e+22,
          2e+27
        ]
      },
      "diameter_km": {
        "type": "continuous",
        "range": [
          4000,
          150000
        ]
      },
      "temperature_k": {
        "type": "continuous",
        "range": [
          50,
          800
        ]
      },
      "orbital_period_yr": {
        "type": "continuous",
        "range": [
          0.1,
          30
        ]
      },
      "orbital_velocity_kms": {
        "type": "continuous",
        "range": [
          10,
          50
        ]
      },
      "composition_type": {
        "type": "categorical",
        "values": [
          "terrestrial",
          "gas_giant"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Orbits": {
    "properties": {
      "semi_major_axis_au": {
        "type": "continuous",
        "range": [
          0.1,
          10
        ]
      },
      "eccentricity": {
        "type": "continuous",
        "range": [
          0,
          0.3
        ]
      },
      "gravitational_force_n": {
        "type": "continuous",
        "range": [
          100000000000000000000,
          1e+23
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "sun",
  "type": "Star",
  "label": "Sonne",
  "mass_kg": 1.989e+30,
  "diameter_km": 1392700,
  "temperature_k": 5772,
  "age_byr": 4.6
}
Sample Relationship: {
  "id": "rel_orbit_1",
  "type": "Orbits",
  "source": "mercury",
  "target": "sun",
  "label": "Merkur umkreist Sonne",
  "semi_major_axis_au": 0.39,
  "eccentricity": 0.205,
  "gravitational_force_n": 1.2e+22
}
========================================


=== Iteration: 2. Multiple Edges ===
Dauer: 19.58s
Entities: 16
Relationships: 30
----------------------------------------
DataModel Entities: {
  "Person": {
    "properties": {
      "alter": {
        "type": "continuous",
        "range": [
          18,
          65
        ]
      },
      "einfluss": {
        "type": "continuous",
        "range": [
          0.1,
          0.95
        ]
      },
      "vertrauensscore": {
        "type": "continuous",
        "range": [
          0.1,
          0.9
        ]
      },
      "region": {
        "type": "categorical",
        "categories": [
          "Nord",
          "Sued",
          "Ost",
          "West"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "kennt": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.2,
          0.8
        ]
      }
    }
  },
  "arbeitet_mit": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.3,
          0.9
        ]
      }
    }
  },
  "hasst": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.4,
          0.95
        ]
      }
    }
  },
  "beeinflusst": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.2,
          0.85
        ]
      }
    }
  },
  "unterstuetzt": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.35,
          0.9
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "p1",
  "type": "Person",
  "label": "Anna",
  "alter": 34,
  "einfluss": 0.85,
  "vertrauensscore": 0.78,
  "region": "Nord"
}
Sample Relationship: {
  "id": "r1",
  "type": "kennt",
  "source": "p1",
  "target": "p2",
  "label": "kennt",
  "intensitaet": 0.65
}
========================================


=== Iteration: 3. Temporale Objekte ===
Dauer: 21.73s
Entities: 22
Relationships: 24
----------------------------------------
DataModel Entities: {
  "Epoch": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -500,
          600
        ]
      },
      "significance": {
        "type": "continuous",
        "range": [
          0,
          10
        ]
      }
    }
  },
  "Ruler": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -100,
          400
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -50,
          450
        ]
      },
      "reignLength": {
        "type": "continuous",
        "range": [
          0,
          50
        ]
      },
      "dynasty": {
        "type": "categorical"
      }
    }
  },
  "Event": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -700,
          550
        ]
      },
      "importance": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  },
  "Institution": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -800,
          100
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -100,
          500
        ]
      },
      "influence": {
        "type": "continuous",
        "range": [
          0,
          10
        ]
      }
    }
  },
  "Territory": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -300,
          100
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          0,
          600
        ]
      },
      "strategicValue": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  }
}
DataModel Relationships: {
  "RuledDuring": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -100,
          400
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -50,
          450
        ]
      }
    }
  },
  "OccurredIn": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      }
    }
  },
  "LedTo": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -300,
          400
        ]
      }
    }
  },
  "Controlled": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -300,
          100
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          0,
          600
        ]
      }
    }
  },
  "Reformed": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -100,
          300
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "epoch_kings",
  "type": "Epoch",
  "label": "Koennigszeit",
  "startYear": -753,
  "endYear": -509,
  "significance": 7
}
Sample Relationship: {
  "id": "rel_r1",
  "type": "RuledDuring",
  "source": "ruler_romulus",
  "target": "epoch_kings",
  "label": "regierte in",
  "startYear": -753,
  "endYear": -716
}
========================================


=== Iteration: 4. Komplexe visuelle Presets ===
Dauer: 21.77s
Entities: 18
Relationships: 22
----------------------------------------
DataModel Entities: {
  "Router": {
    "properties": {
      "region": {
        "type": "categorical",
        "categories": [
          "Core",
          "Distribution",
          "Edge"
        ]
      },
      "throughput_mbps": {
        "type": "continuous",
        "range": [
          100,
          10000
        ]
      },
      "centrality": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  },
  "Server": {
    "properties": {
      "region": {
        "type": "categorical",
        "categories": [
          "Core",
          "Distribution",
          "Edge"
        ]
      },
      "cpu_load_percent": {
        "type": "continuous",
        "range": [
          5,
          95
        ]
      },
      "uptime_days": {
        "type": "continuous",
        "range": [
          1,
          1200
        ]
      }
    }
  },
  "Client": {
    "properties": {
      "region": {
        "type": "categorical",
        "categories": [
          "Core",
          "Distribution",
          "Edge"
        ]
      },
      "active_connections": {
        "type": "continuous",
        "range": [
          1,
          25
        ]
      },
      "avg_bandwidth_mbps": {
        "type": "continuous",
        "range": [
          2,
          850
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Connection": {
    "properties": {
      "latency_ms": {
        "type": "continuous",
        "range": [
          0.5,
          180
        ]
      },
      "packet_loss_percent": {
        "type": "continuous",
        "range": [
          0,
          8
        ]
      },
      "bandwidth_utilization_percent": {
        "type": "continuous",
        "range": [
          5,
          98
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "r1",
  "type": "Router",
  "label": "Core-Router-01",
  "region": "Core",
  "throughput_mbps": 9800,
  "centrality": 0.95
}
Sample Relationship: {
  "id": "rel_01",
  "type": "Connection",
  "source": "r1",
  "target": "r2",
  "label": "Core-to-Distribution",
  "latency_ms": 1.2,
  "packet_loss_percent": 0.1,
  "bandwidth_utilization_percent": 67
}
========================================


=== Iteration: 5. Rekursive und zirkuläre Beziehungen ===
Dauer: 19.61s
Entities: 19
Relationships: 29
----------------------------------------
DataModel Entities: {
  "Gottheit": {
    "properties": {
      "name": {
        "type": "categorical"
      },
      "pantheon": {
        "type": "categorical"
      },
      "generation": {
        "type": "continuous",
        "range": [
          1,
          5
        ]
      },
      "einfluss": {
        "type": "continuous",
        "range": [
          1,
          100
        ]
      },
      "alter": {
        "type": "continuous",
        "range": [
          100,
          10000
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Elternschaft": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  },
  "Allianz": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      },
      "typ": {
        "type": "categorical"
      }
    }
  },
  "Rivalitaet": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  },
  "Transformation": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "gaia",
  "type": "Gottheit",
  "label": "Gaia",
  "name": "Gaia",
  "pantheon": "Griechisch",
  "generation": 1,
  "einfluss": 95,
  "alter": 10000
}
Sample Relationship: {
  "id": "rel_01",
  "type": "Elternschaft",
  "source": "gaia",
  "target": "uranus",
  "label": "Eltern von Uranus",
  "intensitaet": 0.9
}
========================================


=== Iteration: 6. Abstrakte Konzepte ===
Dauer: 20.64s
Entities: 33
Relationships: 30
----------------------------------------
DataModel Entities: {
  "PhilosophicalSchool": {
    "properties": {
      "name": {
        "type": "categorical"
      },
      "era": {
        "type": "categorical"
      },
      "century": {
        "type": "continuous",
        "range": [
          -700,
          2025
        ]
      },
      "influence": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  },
  "Philosopher": {
    "properties": {
      "name": {
        "type": "categorical"
      },
      "birthYear": {
        "type": "continuous",
        "range": [
          -600,
          1950
        ]
      },
      "influenceScore": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  },
  "Concept": {
    "properties": {
      "name": {
        "type": "categorical"
      },
      "category": {
        "type": "categorical"
      },
      "centrality": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  }
}
DataModel Relationships: {
  "InfluencedBy": {
    "properties": {
      "strength": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      },
      "period": {
        "type": "categorical"
      }
    }
  },
  "KeyFigure": {
    "properties": {
      "role": {
        "type": "categorical"
      }
    }
  },
  "Explores": {
    "properties": {
      "importance": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "school_1",
  "type": "PhilosophicalSchool",
  "label": "Pre-Socratic",
  "name": "Pre-Socratic",
  "era": "Ancient",
  "century": -600,
  "influence": 8
}
Sample Relationship: {
  "id": "rel_1",
  "type": "KeyFigure",
  "source": "phil_1",
  "target": "school_2",
  "label": "Founder",
  "role": "Founder"
}
========================================


=== Iteration: 7. Datenintensive Eigenschaften ===
Dauer: 15.48s
Entities: 14
Relationships: 21
----------------------------------------
DataModel Entities: {
  "Book": {
    "properties": {
      "title": {
        "type": "string"
      },
      "price_eur": {
        "type": "continuous",
        "range": [
          5,
          35
        ]
      },
      "pages": {
        "type": "continuous",
        "range": [
          150,
          650
        ]
      },
      "rating": {
        "type": "continuous",
        "range": [
          3,
          5
        ]
      },
      "publication_year": {
        "type": "continuous",
        "range": [
          1990,
          2025
        ]
      }
    }
  },
  "Author": {
    "properties": {
      "name": {
        "type": "string"
      },
      "birth_year": {
        "type": "continuous",
        "range": [
          1940,
          1995
        ]
      },
      "nationality": {
        "type": "categorical",
        "categories": [
          "German",
          "British",
          "American",
          "Japanese",
          "French"
        ]
      }
    }
  },
  "Genre": {
    "properties": {
      "name": {
        "type": "string"
      },
      "popularity": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  }
}
DataModel Relationships: {
  "WROTE": {
    "properties": {
      "year_written": {
        "type": "continuous",
        "range": [
          1990,
          2025
        ]
      }
    }
  },
  "BELONGS_TO": {
    "properties": {
      "relevance": {
        "type": "continuous",
        "range": [
          0.6,
          1
        ]
      }
    }
  },
  "INSPIRED_BY": {
    "properties": {
      "influence_level": {
        "type": "continuous",
        "range": [
          0.3,
          0.9
        ]
      }
    }
  },
  "RATED_BY": {
    "properties": {
      "rating_count": {
        "type": "continuous",
        "range": [
          500,
          25000
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "book_01",
  "type": "Book",
  "label": "Dune",
  "title": "Dune",
  "price_eur": 12.99,
  "pages": 412,
  "rating": 4.7,
  "publication_year": 1965
}
Sample Relationship: {
  "id": "rel_01",
  "type": "WROTE",
  "source": "author_01",
  "target": "book_01",
  "label": "wrote",
  "year_written": 1965
}
========================================


=== Iteration: 8. Hochgradig vernetztes Ökosystem ===
Dauer: 22.29s
Entities: 20
Relationships: 29
----------------------------------------
DataModel Entities: {
  "Pflanze": {
    "properties": {
      "biomasse_t": {
        "type": "continuous",
        "range": [
          0.5,
          25
        ]
      },
      "saisonale_verfuegbarkeit": {
        "type": "continuous",
        "range": [
          0.2,
          1
        ]
      },
      "region": {
        "type": "categorical",
        "categories": [
          "Unterholz",
          "Kronenschicht",
          "Boden"
        ]
      }
    }
  },
  "Herbivore": {
    "properties": {
      "population": {
        "type": "continuous",
        "range": [
          5,
          180
        ]
      },
      "tagesaktivität": {
        "type": "continuous",
        "range": [
          0.3,
          0.9
        ]
      },
      "region": {
        "type": "categorical",
        "categories": [
          "Unterholz",
          "Kronenschicht",
          "Boden"
        ]
      }
    }
  },
  "Raubtier": {
    "properties": {
      "population": {
        "type": "continuous",
        "range": [
          2,
          35
        ]
      },
      "tagesaktivität": {
        "type": "continuous",
        "range": [
          0.4,
          0.95
        ]
      },
      "region": {
        "type": "categorical",
        "categories": [
          "Unterholz",
          "Kronenschicht",
          "Boden"
        ]
      }
    }
  },
  "Insekt": {
    "properties": {
      "population": {
        "type": "continuous",
        "range": [
          40,
          1200
        ]
      },
      "spezialisierungsgrad": {
        "type": "continuous",
        "range": [
          0.1,
          0.9
        ]
      },
      "region": {
        "type": "categorical",
        "categories": [
          "Unterholz",
          "Kronenschicht",
          "Boden"
        ]
      }
    }
  },
  "Parasit": {
    "properties": {
      "population": {
        "type": "continuous",
        "range": [
          15,
          450
        ]
      },
      "infektionsrate": {
        "type": "continuous",
        "range": [
          0.05,
          0.65
        ]
      },
      "region": {
        "type": "categorical",
        "categories": [
          "Unterholz",
          "Kronenschicht",
          "Boden"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Frisst": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  },
  "Bestaubt": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.2,
          1
        ]
      }
    }
  },
  "Parasitiert": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.15,
          0.85
        ]
      }
    }
  },
  "KompetiertUm": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.3,
          0.9
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "e1",
  "type": "Pflanze",
  "label": "Eiche",
  "biomasse_t": 22.4,
  "saisonale_verfuegbarkeit": 0.85,
  "region": "Kronenschicht"
}
Sample Relationship: {
  "id": "r1",
  "type": "Frisst",
  "source": "e6",
  "target": "e4",
  "label": "frisst",
  "intensitaet": 0.85
}
========================================


=== Iteration: 9. Temporal + Multiple Edges ===
Dauer: 20.80s
Entities: 18
Relationships: 28
----------------------------------------
DataModel Entities: {
  "Nation": {
    "properties": {
      "military_personnel": {
        "type": "continuous",
        "range": [
          100000,
          13000000
        ]
      },
      "military_equipment": {
        "type": "continuous",
        "range": [
          500,
          50000
        ]
      },
      "alliance_side": {
        "type": "categorical",
        "values": [
          "Allies",
          "Axis",
          "Neutral"
        ]
      }
    }
  },
  "Battle": {
    "properties": {
      "start_date": {
        "type": "temporal",
        "format": "YYYY-MM"
      },
      "end_date": {
        "type": "temporal",
        "format": "YYYY-MM"
      },
      "casualties": {
        "type": "continuous",
        "range": [
          500,
          2000000
        ]
      },
      "outcome": {
        "type": "categorical",
        "values": [
          "Allied_victory",
          "Axis_victory",
          "Inconclusive"
        ]
      }
    }
  },
  "Declaration": {
    "properties": {
      "date": {
        "type": "temporal",
        "format": "YYYY-MM-DD"
      },
      "reason": {
        "type": "categorical",
        "values": [
          "Invasion",
          "Treaty_obligation",
          "Preemptive",
          "Formal_war"
        ]
      }
    }
  },
  "Conference": {
    "properties": {
      "date": {
        "type": "temporal",
        "format": "YYYY-MM"
      },
      "location": {
        "type": "categorical",
        "values": [
          "Yalta",
          "Potsdam",
          "Tehran",
          "Munich"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Alliance": {
    "properties": {
      "start_date": {
        "type": "temporal",
        "format": "YYYY-MM"
      },
      "end_date": {
        "type": "temporal",
        "format": "YYYY-MM"
      },
      "intensity": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  },
  "DeclarationOfWar": {
    "properties": {
      "date": {
        "type": "temporal",
        "format": "YYYY-MM-DD"
      },
      "intensity": {
        "type": "continuous",
        "range": [
          0.2,
          1
        ]
      }
    }
  },
  "ParticipatedIn": {
    "properties": {
      "role": {
        "type": "categorical",
        "values": [
          "Attacker",
          "Defender",
          "Ally_support"
        ]
      },
      "intensity": {
        "type": "continuous",
        "range": [
          0.3,
          1
        ]
      }
    }
  },
  "Hosted": {
    "properties": {
      "date": {
        "type": "temporal",
        "format": "YYYY-MM"
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "nation_de",
  "type": "Nation",
  "label": "Deutschland",
  "military_personnel": 13000000,
  "military_equipment": 18500,
  "alliance_side": "Axis"
}
Sample Relationship: {
  "id": "rel_all_ger_jp",
  "type": "Alliance",
  "source": "nation_de",
  "target": "nation_jp",
  "label": "Achsenmacht",
  "start_date": "1940-09",
  "end_date": "1945-09",
  "intensity": 0.85
}
========================================


=== Iteration: 10. Edge Cases (Unvollständige Datenstrukturen testen) ===
Dauer: 22.84s
Entities: 18
Relationships: 22
----------------------------------------
DataModel Entities: {
  "TranscendentalHyperCosmicEldritchManifestationOfEternalArcaneResonance": {
    "properties": {
      "arcane_resonance": {
        "type": "continuous",
        "range": [
          0,
          1000
        ]
      },
      "elemental_affinity": {
        "type": "categorical",
        "categories": [
          "aether",
          "void",
          "lumina",
          "chronos",
          "entropy"
        ]
      },
      "chronological_age": {
        "type": "continuous",
        "range": [
          1000,
          10000000
        ]
      }
    }
  },
  "HyperdimensionalGuardianOfTheVeiledNexusPortals": {
    "properties": {
      "magical_influence": {
        "type": "continuous",
        "range": [
          10,
          500
        ]
      },
      "domain_region": {
        "type": "categorical",
        "categories": [
          "celestial_spire",
          "abyssal_void",
          "ethereal_grove",
          "temporal_rift",
          "nebula_sanctum"
        ]
      },
      "guardian_level": {
        "type": "continuous",
        "range": [
          1,
          20
        ]
      }
    }
  },
  "EtherealSubordinateEchoOfThePrimordialSpellweave": {
    "properties": {
      "echo_intensity": {
        "type": "continuous",
        "range": [
          0.1,
          99.9
        ]
      },
      "subordinate_role": {
        "type": "categorical",
        "categories": [
          "whisper",
          "catalyst",
          "sentinel",
          "harbinger",
          "conduit"
        ]
      }
    }
  },
  "CosmicAnomalyOfTheFractalInfiniteWeave": {
    "properties": {
      "anomaly_stability": {
        "type": "continuous",
        "range": [
          0.01,
          1
        ]
      },
      "fractal_complexity": {
        "type": "continuous",
        "range": [
          2,
          12
        ]
      }
    }
  }
}
DataModel Relationships: {
  "ArcaneSymbioticBindingWithoutIntrinsicProperty": {
    "properties": {}
  },
  "VeiledHierarchicalOvershadowingLinkage": {
    "properties": {}
  }
}
----------------------------------------
Sample Entity: {
  "id": "ent_001",
  "type": "TranscendentalHyperCosmicEldritchManifestationOfEternalArcaneResonance",
  "label": "Aetherion Prime",
  "arcane_resonance": 987,
  "elemental_affinity": "aether",
  "chronological_age": 8749200
}
Sample Relationship: {
  "id": "rel_001",
  "type": "ArcaneSymbioticBindingWithoutIntrinsicProperty",
  "source": "ent_001",
  "target": "ent_007",
  "label": "binds"
}
========================================


=== Iteration: 1. Einfacher Graph ===
Dauer: 12.85s
Entities: 6
Relationships: 15
----------------------------------------
DataModel Entities: {
  "Star": {
    "properties": {
      "mass_solar": {
        "type": "continuous",
        "range": [
          0.1,
          50
        ]
      },
      "temperature_k": {
        "type": "continuous",
        "range": [
          2000,
          30000
        ]
      },
      "spectral_class": {
        "type": "categorical",
        "values": [
          "G2V",
          "M5V",
          "F8V"
        ]
      }
    }
  },
  "Planet": {
    "properties": {
      "mass_earth": {
        "type": "continuous",
        "range": [
          0.01,
          20
        ]
      },
      "diameter_km": {
        "type": "continuous",
        "range": [
          1000,
          200000
        ]
      },
      "orbital_period_days": {
        "type": "continuous",
        "range": [
          10,
          5000
        ]
      },
      "chemical_composition": {
        "type": "categorical",
        "values": [
          "terrestrial",
          "gas_giant",
          "ice_giant"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Orbits": {
    "properties": {
      "semi_major_axis_au": {
        "type": "continuous",
        "range": [
          0.01,
          50
        ]
      },
      "eccentricity": {
        "type": "continuous",
        "range": [
          0,
          0.3
        ]
      }
    }
  },
  "GravitationalInfluence": {
    "properties": {
      "influence_strength": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "star_sun",
  "type": "Star",
  "label": "Sonne",
  "mass_solar": 1,
  "temperature_k": 5772,
  "spectral_class": "G2V"
}
Sample Relationship: {
  "id": "orb1",
  "type": "Orbits",
  "source": "planet_mercury",
  "target": "star_sun",
  "label": "Merkur umkreist Sonne",
  "semi_major_axis_au": 0.387,
  "eccentricity": 0.206
}
========================================


=== Iteration: 2. Multiple Edges ===
Dauer: 19.51s
Entities: 15
Relationships: 30
----------------------------------------
DataModel Entities: {
  "Person": {
    "properties": {
      "einfluss": {
        "type": "continuous",
        "range": [
          0,
          100
        ]
      },
      "alter": {
        "type": "continuous",
        "range": [
          18,
          65
        ]
      },
      "region": {
        "type": "categorical",
        "categories": [
          "Nord",
          "Sued",
          "Ost",
          "West"
        ]
      },
      "beruf": {
        "type": "categorical",
        "categories": [
          "Ingenieur",
          "Manager",
          "Forscher",
          "Designer",
          "Berater"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Kennt": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  },
  "Arbeitet_mit": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      },
      "dauer_jahre": {
        "type": "continuous",
        "range": [
          0.5,
          15
        ]
      }
    }
  },
  "Hasst": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  },
  "Unterstuetzt": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "p1",
  "type": "Person",
  "label": "Anna",
  "einfluss": 85,
  "alter": 34,
  "region": "Nord",
  "beruf": "Ingenieur"
}
Sample Relationship: {
  "id": "r1",
  "type": "Kennt",
  "source": "p1",
  "target": "p2",
  "label": "kennt",
  "intensitaet": 8
}
========================================


=== Iteration: 3. Temporale Objekte ===
Dauer: 19.26s
Entities: 20
Relationships: 21
----------------------------------------
DataModel Entities: {
  "Person": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "role": {
        "type": "categorical",
        "categories": [
          "King",
          "Consul",
          "Emperor",
          "General",
          "Statesman",
          "Philosopher"
        ]
      },
      "influence": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  },
  "PoliticalEntity": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "entityType": {
        "type": "categorical",
        "categories": [
          "Kingdom",
          "Republic",
          "Empire",
          "Province"
        ]
      },
      "significance": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  },
  "Conflict": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "outcome": {
        "type": "categorical",
        "categories": [
          "Roman Victory",
          "Roman Defeat",
          "Stalemate",
          "Reform"
        ]
      },
      "casualties": {
        "type": "continuous",
        "range": [
          0,
          1000000
        ]
      }
    }
  },
  "CulturalDevelopment": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "category": {
        "type": "categorical",
        "categories": [
          "Architecture",
          "Literature",
          "Religion",
          "Law",
          "Philosophy"
        ]
      },
      "impact": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Ruled": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      }
    }
  },
  "Led": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      }
    }
  },
  "ParticipatedIn": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      }
    }
  },
  "SucceededBy": {
    "properties": {
      "transitionYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      }
    }
  },
  "Influenced": {
    "properties": {
      "influenceLevel": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "p1",
  "type": "Person",
  "label": "Romulus",
  "startYear": -753,
  "endYear": -716,
  "role": "King",
  "influence": 8
}
Sample Relationship: {
  "id": "r1",
  "type": "Ruled",
  "source": "p1",
  "target": "pe1",
  "label": "Founder",
  "startYear": -753,
  "endYear": -716
}
========================================


=== Iteration: 4. Komplexe visuelle Presets ===
Dauer: 17.04s
Entities: 19
Relationships: 24
----------------------------------------
DataModel Entities: {
  "Router": {
    "properties": {
      "region": {
        "type": "categorical",
        "values": [
          "North",
          "South",
          "East",
          "West",
          "Central"
        ]
      },
      "throughput_mbps": {
        "type": "continuous",
        "range": [
          100,
          10000
        ]
      },
      "uptime_pct": {
        "type": "continuous",
        "range": [
          80,
          100
        ]
      }
    }
  },
  "Server": {
    "properties": {
      "region": {
        "type": "categorical",
        "values": [
          "North",
          "South",
          "East",
          "West",
          "Central"
        ]
      },
      "cpu_load_pct": {
        "type": "continuous",
        "range": [
          5,
          95
        ]
      },
      "bandwidth_mbps": {
        "type": "continuous",
        "range": [
          50,
          800
        ]
      },
      "service": {
        "type": "categorical",
        "values": [
          "Web",
          "Database",
          "File",
          "Auth",
          "API"
        ]
      }
    }
  },
  "Client": {
    "properties": {
      "region": {
        "type": "categorical",
        "values": [
          "North",
          "South",
          "East",
          "West",
          "Central"
        ]
      },
      "traffic_mbps": {
        "type": "continuous",
        "range": [
          0.5,
          120
        ]
      },
      "os": {
        "type": "categorical",
        "values": [
          "Windows",
          "Linux",
          "macOS"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "ConnectedTo": {
    "properties": {
      "latency_ms": {
        "type": "continuous",
        "range": [
          1,
          120
        ]
      },
      "bandwidth_mbps": {
        "type": "continuous",
        "range": [
          10,
          1000
        ]
      }
    }
  },
  "Routes": {
    "properties": {
      "hop_count": {
        "type": "continuous",
        "range": [
          1,
          6
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "r1",
  "type": "Router",
  "label": "Core-R1",
  "region": "Central",
  "throughput_mbps": 9800,
  "uptime_pct": 99.7
}
Sample Relationship: {
  "id": "rel_01",
  "type": "ConnectedTo",
  "source": "r1",
  "target": "r2",
  "label": "Backbone N",
  "latency_ms": 4,
  "bandwidth_mbps": 850
}
========================================


=== Iteration: 5. Rekursive und zirkuläre Beziehungen ===
Dauer: 20.65s
Entities: 18
Relationships: 30
----------------------------------------
DataModel Entities: {
  "Gottheit": {
    "properties": {
      "domaene": {
        "type": "categorical",
        "values": [
          "Schoepfung",
          "Krieg",
          "Weisheit",
          "Unterwelt",
          "Natur",
          "Sonne",
          "Schicksal"
        ]
      },
      "machtstufe": {
        "type": "continuous",
        "range": [
          1,
          100
        ]
      },
      "alter_aeonen": {
        "type": "continuous",
        "range": [
          0.1,
          5000
        ]
      },
      "loyalitaet": {
        "type": "continuous",
        "range": [
          0,
          1
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Abstammung": {
    "properties": {
      "generation": {
        "type": "continuous",
        "range": [
          1,
          5
        ]
      }
    }
  },
  "Paarung": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.2,
          1
        ]
      },
      "dauer_aeonen": {
        "type": "continuous",
        "range": [
          1,
          1000
        ]
      }
    }
  },
  "Allianz": {
    "properties": {
      "staerke": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  },
  "Einfluss": {
    "properties": {
      "einflussgrad": {
        "type": "continuous",
        "range": [
          0.05,
          0.95
        ]
      }
    }
  },
  "Rivalitaet": {
    "properties": {
      "konfliktgrad": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "g1",
  "type": "Gottheit",
  "label": "Uranos",
  "domaene": "Schoepfung",
  "machtstufe": 95,
  "alter_aeonen": 4500,
  "loyalitaet": 0.4
}
Sample Relationship: {
  "id": "rel1",
  "type": "Abstammung",
  "source": "g1",
  "target": "g3",
  "label": "Vater-Sohn",
  "generation": 2
}
========================================


=== Iteration: 6. Abstrakte Konzepte ===
Dauer: 26.89s
Entities: 25
Relationships: 34
----------------------------------------
DataModel Entities: {
  "Tradition": {
    "properties": {
      "period_start": {
        "type": "continuous",
        "range": [
          -600,
          2000
        ]
      },
      "period_end": {
        "type": "continuous",
        "range": [
          -300,
          2025
        ]
      },
      "core_concern": {
        "type": "categorical",
        "categories": [
          "ontology",
          "epistemology",
          "ethics",
          "metaphysics",
          "logic",
          "aesthetics"
        ]
      },
      "influence_degree": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  },
  "Philosopher": {
    "properties": {
      "birth_year": {
        "type": "continuous",
        "range": [
          -600,
          1950
        ]
      },
      "impact_score": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      },
      "nationality": {
        "type": "categorical",
        "categories": [
          "Greek",
          "German",
          "French",
          "British",
          "Chinese",
          "Indian",
          "American"
        ]
      }
    }
  },
  "Concept": {
    "properties": {
      "significance": {
        "type": "continuous",
        "range": [
          0.2,
          1
        ]
      },
      "domain": {
        "type": "categorical",
        "categories": [
          "ontology",
          "epistemology",
          "ethics",
          "metaphysics",
          "logic"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Influenced": {
    "properties": {
      "strength": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      },
      "type": {
        "type": "categorical",
        "categories": [
          "direct",
          "indirect",
          "reactionary",
          "synthesis"
        ]
      },
      "century": {
        "type": "continuous",
        "range": [
          -5,
          21
        ]
      }
    }
  },
  "Developed": {
    "properties": {
      "contribution_level": {
        "type": "continuous",
        "range": [
          0.3,
          1
        ]
      }
    }
  },
  "Critiqued": {
    "properties": {
      "intensity": {
        "type": "continuous",
        "range": [
          0.2,
          1
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "trad_platonism",
  "type": "Tradition",
  "label": "Platonism",
  "period_start": -400,
  "period_end": 600,
  "core_concern": "metaphysics",
  "influence_degree": 0.95
}
Sample Relationship: {
  "id": "rel_inf_1",
  "type": "direct",
  "source": "trad_platonism",
  "target": "trad_aristotelianism",
  "label": "influenced",
  "strength": 0.85,
  "century": -4
}
========================================


=== Iteration: 7. Datenintensive Eigenschaften ===
Dauer: 17.22s
Entities: 15
Relationships: 21
----------------------------------------
DataModel Entities: {
  "Book": {
    "properties": {
      "price": {
        "type": "continuous",
        "range": [
          5,
          35
        ]
      },
      "pages": {
        "type": "continuous",
        "range": [
          150,
          650
        ]
      },
      "rating": {
        "type": "continuous",
        "range": [
          3.5,
          5
        ]
      },
      "genre": {
        "type": "categorical",
        "categories": [
          "ScienceFiction",
          "Fantasy",
          "Mystery",
          "Biography",
          "History"
        ]
      }
    }
  },
  "Author": {
    "properties": {
      "age": {
        "type": "continuous",
        "range": [
          35,
          75
        ]
      },
      "nationality": {
        "type": "categorical",
        "categories": [
          "German",
          "British",
          "American",
          "Japanese",
          "French"
        ]
      }
    }
  },
  "Genre": {
    "properties": {
      "popularity": {
        "type": "continuous",
        "range": [
          40,
          95
        ]
      }
    }
  }
}
DataModel Relationships: {
  "WRITTEN_BY": {
    "properties": {
      "year": {
        "type": "continuous",
        "range": [
          1990,
          2023
        ]
      }
    }
  },
  "BELONGS_TO": {
    "properties": {}
  },
  "INFLUENCED_BY": {
    "properties": {
      "strength": {
        "type": "continuous",
        "range": [
          0.3,
          0.9
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "book_1",
  "type": "Book",
  "label": "Dune",
  "price": 14.99,
  "pages": 412,
  "rating": 4.8,
  "genre": "ScienceFiction"
}
Sample Relationship: {
  "id": "rel_1",
  "type": "WRITTEN_BY",
  "source": "book_1",
  "target": "author_1",
  "label": "written by",
  "year": 1965
}
========================================


=== Iteration: 8. Hochgradig vernetztes Ökosystem ===
Dauer: 25.54s
Entities: 18
Relationships: 25
----------------------------------------
DataModel Entities: {
  "Pflanze": {
    "properties": {
      "biomasse_kg": {
        "type": "continuous",
        "range": [
          5,
          1200
        ]
      },
      "hoehe_m": {
        "type": "continuous",
        "range": [
          0.3,
          35
        ]
      },
      "aktivitaetsniveau": {
        "type": "continuous",
        "range": [
          0.1,
          0.9
        ]
      },
      "lebensraum": {
        "type": "categorical",
        "categories": [
          "Unterholz",
          "Kronenschicht",
          "Boden",
          "Waldlichtung"
        ]
      }
    }
  },
  "Herbivore": {
    "properties": {
      "biomasse_kg": {
        "type": "continuous",
        "range": [
          0.5,
          180
        ]
      },
      "aktivitaetsniveau": {
        "type": "continuous",
        "range": [
          0.4,
          0.95
        ]
      },
      "population": {
        "type": "continuous",
        "range": [
          8,
          420
        ]
      },
      "lebensraum": {
        "type": "categorical",
        "categories": [
          "Unterholz",
          "Kronenschicht",
          "Boden",
          "Waldlichtung"
        ]
      }
    }
  },
  "Karnivore": {
    "properties": {
      "biomasse_kg": {
        "type": "continuous",
        "range": [
          1.2,
          65
        ]
      },
      "aktivitaetsniveau": {
        "type": "continuous",
        "range": [
          0.6,
          0.98
        ]
      },
      "population": {
        "type": "continuous",
        "range": [
          3,
          85
        ]
      },
      "lebensraum": {
        "type": "categorical",
        "categories": [
          "Unterholz",
          "Kronenschicht",
          "Boden"
        ]
      }
    }
  },
  "Parasit": {
    "properties": {
      "biomasse_kg": {
        "type": "continuous",
        "range": [
          0.001,
          2.5
        ]
      },
      "aktivitaetsniveau": {
        "type": "continuous",
        "range": [
          0.3,
          0.85
        ]
      },
      "wirtspezifitaet": {
        "type": "categorical",
        "categories": [
          "Spezifisch",
          "Generalistisch"
        ]
      }
    }
  },
  "Bestaeuber": {
    "properties": {
      "biomasse_kg": {
        "type": "continuous",
        "range": [
          0.0005,
          0.8
        ]
      },
      "aktivitaetsniveau": {
        "type": "continuous",
        "range": [
          0.7,
          0.99
        ]
      },
      "pollinationsrate": {
        "type": "continuous",
        "range": [
          0.2,
          0.95
        ]
      },
      "lebensraum": {
        "type": "categorical",
        "categories": [
          "Unterholz",
          "Kronenschicht",
          "Waldlichtung"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Frisst": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.1,
          0.95
        ]
      }
    }
  },
  "Bestaeubt": {
    "properties": {
      "effizienz": {
        "type": "continuous",
        "range": [
          0.15,
          0.9
        ]
      }
    }
  },
  "Parasitiert": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.2,
          0.85
        ]
      }
    }
  },
  "TeiltLebensraum": {
    "properties": {
      "ueberlappung": {
        "type": "continuous",
        "range": [
          0.3,
          0.9
        ]
      }
    }
  },
  "KonkurriertUmRessourcen": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.25,
          0.8
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "p1",
  "type": "Pflanze",
  "label": "Eiche",
  "biomasse_kg": 980,
  "hoehe_m": 28,
  "aktivitaetsniveau": 0.45,
  "lebensraum": "Kronenschicht"
}
Sample Relationship: {
  "id": "r1",
  "type": "Frisst",
  "source": "h1",
  "target": "p3",
  "label": "Frisst",
  "intensitaet": 0.82
}
========================================


=== Iteration: 9. Temporal + Multiple Edges ===
Dauer: 20.01s
Entities: 17
Relationships: 29
----------------------------------------
DataModel Entities: {
  "Country": {
    "properties": {
      "militaryStrength": {
        "type": "continuous",
        "range": [
          0,
          100
        ]
      },
      "influence": {
        "type": "continuous",
        "range": [
          0,
          10
        ]
      },
      "allianceBloc": {
        "type": "categorical",
        "values": [
          "Allies",
          "Axis",
          "Neutral"
        ]
      }
    }
  },
  "Battle": {
    "properties": {
      "year": {
        "type": "continuous",
        "range": [
          1939,
          1945
        ]
      },
      "casualties": {
        "type": "continuous",
        "range": [
          0,
          2000000
        ]
      },
      "outcome": {
        "type": "categorical",
        "values": [
          "Allied_victory",
          "Axis_victory",
          "Indecisive"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Alliance": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          1939,
          1945
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          1939,
          1945
        ]
      },
      "intensity": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  },
  "DeclarationOfWar": {
    "properties": {
      "year": {
        "type": "continuous",
        "range": [
          1939,
          1945
        ]
      },
      "intensity": {
        "type": "continuous",
        "range": [
          0.5,
          1
        ]
      }
    }
  },
  "ParticipatedIn": {
    "properties": {
      "year": {
        "type": "continuous",
        "range": [
          1939,
          1945
        ]
      },
      "role": {
        "type": "categorical",
        "values": [
          "Attacker",
          "Defender",
          "Supporter"
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "c_de",
  "type": "Country",
  "label": "Deutschland",
  "militaryStrength": 85,
  "influence": 8.5,
  "allianceBloc": "Axis"
}
Sample Relationship: {
  "id": "r_allies_uk_fr",
  "type": "Alliance",
  "source": "c_uk",
  "target": "c_fr",
  "label": "Anglo-französische Allianz",
  "startYear": 1939,
  "endYear": 1940,
  "intensity": 0.85
}
========================================


=== Iteration: 10. Edge Cases (Unvollständige Datenstrukturen testen) ===
Dauer: 25.77s
Entities: 20
Relationships: 25
----------------------------------------
DataModel Entities: {
  "UraltesKosmischesAetherwesenDerUnendlichenLeere": {
    "properties": {
      "arkaneEinflussstaerke": {
        "type": "continuous",
        "range": [
          0,
          1000
        ]
      },
      "temporaleDichte": {
        "type": "continuous",
        "range": [
          0,
          500
        ]
      },
      "domaene": {
        "type": "categorical"
      }
    }
  },
  "MystischesChronosArtefaktDerZeitlosenVerschmelzung": {
    "properties": {
      "magischeResonanz": {
        "type": "continuous",
        "range": [
          10,
          900
        ]
      },
      "affinitätsLevel": {
        "type": "continuous",
        "range": [
          0,
          1
        ]
      },
      "herkunftsepoche": {
        "type": "categorical"
      }
    }
  },
  "HyperdimensionaleSchattenKreaturDesAbgrunds": {
    "properties": {
      "schattenIntensität": {
        "type": "continuous",
        "range": [
          0,
          750
        ]
      },
      "alterInAonen": {
        "type": "continuous",
        "range": [
          100,
          10000
        ]
      },
      "verschwommenheitsFaktor": {
        "type": "continuous",
        "range": [
          0.1,
          0.9
        ]
      }
    }
  },
  "EwigerSternenNebelDerVerborgenenProphezeiungen": {
    "properties": {
      "leuchtKraft": {
        "type": "continuous",
        "range": [
          100,
          5000
        ]
      },
      "prophezeiungsDichte": {
        "type": "continuous",
        "range": [
          0,
          1
        ]
      },
      "kosmischeAusrichtung": {
        "type": "categorical"
      }
    }
  }
}
DataModel Relationships: {
  "ArkaneVerbindungDurchDasGewebeDerRealitaet": {
    "properties": {
      "bindungsIntensität": {
        "type": "continuous",
        "range": [
          0,
          100
        ]
      }
    }
  },
  "MystischeSymbioseDerZeitlosenEssenzen": {
    "properties": {
      "symbioseStaerke": {
        "type": "continuous",
        "range": [
          0,
          100
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "entity_001",
  "type": "UraltesKosmischesAetherwesenDerUnendlichenLeere",
  "label": "Aetherion",
  "arkaneEinflussstaerke": 874,
  "temporaleDichte": 312,
  "domaene": "Leere"
}
Sample Relationship: {
  "id": "rel_001",
  "type": "ArkaneVerbindungDurchDasGewebeDerRealitaet",
  "source": "entity_001",
  "target": "entity_003",
  "label": "Zeitbindung",
  "bindungsIntensität": 78
}
========================================


=== Iteration: 1. Einfacher Graph ===
Dauer: 15.77s
Entities: 15
Relationships: 19
----------------------------------------
DataModel Entities: {
  "Star": {
    "properties": {
      "mass_kg": {
        "type": "continuous",
        "range": [
          1e+29,
          2e+30
        ]
      },
      "temperature_k": {
        "type": "continuous",
        "range": [
          5000,
          6000
        ]
      },
      "region": {
        "type": "categorical",
        "values": [
          "central"
        ]
      }
    }
  },
  "Planet": {
    "properties": {
      "mass_kg": {
        "type": "continuous",
        "range": [
          1e+23,
          2e+27
        ]
      },
      "orbital_period_days": {
        "type": "continuous",
        "range": [
          80,
          7000
        ]
      },
      "region": {
        "type": "categorical",
        "values": [
          "inner",
          "outer"
        ]
      }
    }
  },
  "Moon": {
    "properties": {
      "mass_kg": {
        "type": "continuous",
        "range": [
          10000000000000000000,
          1e+23
        ]
      },
      "orbital_period_days": {
        "type": "continuous",
        "range": [
          1,
          30
        ]
      },
      "region": {
        "type": "categorical",
        "values": [
          "inner",
          "outer"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Orbits": {
    "properties": {
      "distance_au": {
        "type": "continuous",
        "range": [
          0.01,
          40
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "sun",
  "type": "Star",
  "label": "Sonne",
  "mass_kg": 1.989e+30,
  "temperature_k": 5772,
  "region": "central"
}
Sample Relationship: {
  "id": "rel_1",
  "type": "Orbits",
  "source": "mercury",
  "target": "sun",
  "label": "umkreist",
  "distance_au": 0.39
}
========================================


=== Iteration: 2. Multiple Edges ===
Dauer: 17.64s
Entities: 16
Relationships: 30
----------------------------------------
DataModel Entities: {
  "Person": {
    "properties": {
      "age": {
        "type": "continuous",
        "range": [
          18,
          65
        ]
      },
      "influence": {
        "type": "continuous",
        "range": [
          0.1,
          9.8
        ]
      },
      "emotional_valence": {
        "type": "continuous",
        "range": [
          -1,
          1
        ]
      },
      "region": {
        "type": "categorical",
        "categories": [
          "North",
          "South",
          "East",
          "West"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Kennt": {
    "properties": {
      "frequency": {
        "type": "continuous",
        "range": [
          1,
          50
        ]
      }
    }
  },
  "Arbeitet_mit": {
    "properties": {
      "intensity": {
        "type": "continuous",
        "range": [
          0.2,
          8.5
        ]
      },
      "duration_months": {
        "type": "continuous",
        "range": [
          3,
          120
        ]
      }
    }
  },
  "Freund": {
    "properties": {
      "closeness": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      },
      "trust": {
        "type": "continuous",
        "range": [
          0.3,
          0.95
        ]
      }
    }
  },
  "Rivalitaet": {
    "properties": {
      "intensity": {
        "type": "continuous",
        "range": [
          0.4,
          9
        ]
      },
      "history_years": {
        "type": "continuous",
        "range": [
          1,
          25
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "p1",
  "type": "Person",
  "label": "Elena Voss",
  "age": 34,
  "influence": 8.7,
  "emotional_valence": 0.8,
  "region": "North"
}
Sample Relationship: {
  "id": "r1",
  "type": "Kennt",
  "source": "p1",
  "target": "p2",
  "label": "Kennt",
  "frequency": 24
}
========================================


=== Iteration: 3. Temporale Objekte ===
Dauer: 24.29s
Entities: 23
Relationships: 23
----------------------------------------
DataModel Entities: {
  "Epoch": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -500,
          600
        ]
      },
      "influence": {
        "type": "continuous",
        "range": [
          0,
          100
        ]
      }
    }
  },
  "Ruler": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -100,
          400
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -50,
          450
        ]
      },
      "reignLength": {
        "type": "continuous",
        "range": [
          0,
          50
        ]
      },
      "legacyScore": {
        "type": "continuous",
        "range": [
          0,
          100
        ]
      }
    }
  },
  "Event": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -700,
          550
        ]
      },
      "impact": {
        "type": "continuous",
        "range": [
          0,
          100
        ]
      }
    }
  },
  "Region": {
    "properties": {
      "conquestYear": {
        "type": "continuous",
        "range": [
          -300,
          400
        ]
      },
      "strategicValue": {
        "type": "continuous",
        "range": [
          0,
          100
        ]
      }
    }
  },
  "Battle": {
    "properties": {
      "year": {
        "type": "continuous",
        "range": [
          -400,
          450
        ]
      },
      "casualties": {
        "type": "continuous",
        "range": [
          0,
          100000
        ]
      }
    }
  }
}
DataModel Relationships: {
  "RuledDuring": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          -100,
          400
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          -50,
          450
        ]
      }
    }
  },
  "OccurredIn": {
    "properties": {
      "year": {
        "type": "continuous",
        "range": [
          -800,
          500
        ]
      }
    }
  },
  "Conquered": {
    "properties": {
      "year": {
        "type": "continuous",
        "range": [
          -300,
          400
        ]
      },
      "duration": {
        "type": "continuous",
        "range": [
          0,
          50
        ]
      }
    }
  },
  "Led": {
    "properties": {
      "year": {
        "type": "continuous",
        "range": [
          -400,
          450
        ]
      }
    }
  },
  "TransitionedTo": {
    "properties": {
      "transitionYear": {
        "type": "continuous",
        "range": [
          -100,
          500
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "epoch_kings",
  "type": "Epoch",
  "label": "Roemisches Koenigtum",
  "startYear": -753,
  "endYear": -509,
  "influence": 45
}
Sample Relationship: {
  "id": "rel_1",
  "type": "RuledDuring",
  "source": "ruler_romulus",
  "target": "epoch_kings",
  "label": "regierte waehrend",
  "startYear": -753,
  "endYear": -716
}
========================================


=== Iteration: 4. Komplexe visuelle Presets ===
Dauer: 21.05s
Entities: 18
Relationships: 25
----------------------------------------
DataModel Entities: {
  "Router": {
    "properties": {
      "region": {
        "type": "categorical",
        "categories": [
          "Core",
          "Edge",
          "DMZ"
        ]
      },
      "throughput_mbps": {
        "type": "continuous",
        "range": [
          100,
          10000
        ]
      },
      "uptime_percent": {
        "type": "continuous",
        "range": [
          80,
          100
        ]
      }
    }
  },
  "Server": {
    "properties": {
      "service": {
        "type": "categorical",
        "categories": [
          "Web",
          "Database",
          "File",
          "Mail",
          "Auth"
        ]
      },
      "load_percent": {
        "type": "continuous",
        "range": [
          5,
          95
        ]
      },
      "cpu_cores": {
        "type": "continuous",
        "range": [
          4,
          64
        ]
      },
      "region": {
        "type": "categorical",
        "categories": [
          "Core",
          "Edge",
          "DMZ"
        ]
      }
    }
  },
  "Client": {
    "properties": {
      "device_type": {
        "type": "categorical",
        "categories": [
          "Workstation",
          "Laptop",
          "Mobile",
          "IoT"
        ]
      },
      "traffic_mbps": {
        "type": "continuous",
        "range": [
          0.1,
          250
        ]
      },
      "region": {
        "type": "categorical",
        "categories": [
          "Core",
          "Edge",
          "DMZ"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Connected": {
    "properties": {
      "latency_ms": {
        "type": "continuous",
        "range": [
          0.5,
          120
        ]
      },
      "bandwidth_usage_percent": {
        "type": "continuous",
        "range": [
          1,
          98
        ]
      }
    }
  },
  "HostsService": {
    "properties": {
      "intensity": {
        "type": "continuous",
        "range": [
          10,
          100
        ]
      }
    }
  },
  "ProtectedBy": {
    "properties": {
      "firewall_level": {
        "type": "categorical",
        "categories": [
          "Basic",
          "Advanced",
          "Enterprise"
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "r1",
  "type": "Router",
  "label": "Core-Router-01",
  "region": "Core",
  "throughput_mbps": 9800,
  "uptime_percent": 99.8
}
Sample Relationship: {
  "id": "rel_01",
  "type": "Connected",
  "source": "r1",
  "target": "s1",
  "label": "high-speed link",
  "latency_ms": 0.8,
  "bandwidth_usage_percent": 74
}
========================================


=== Iteration: 5. Rekursive und zirkuläre Beziehungen ===
Dauer: 27.89s
Entities: 20
Relationships: 29
----------------------------------------
DataModel Entities: {
  "Gott": {
    "properties": {
      "name": {
        "type": "string"
      },
      "pantheon": {
        "type": "categorical",
        "categories": [
          "griechisch",
          "römisch",
          "gemischt"
        ]
      },
      "generation": {
        "type": "continuous",
        "range": [
          1,
          5
        ]
      },
      "einfluss": {
        "type": "continuous",
        "range": [
          0,
          100
        ]
      },
      "alter": {
        "type": "continuous",
        "range": [
          0,
          10000
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Elternschaft": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  },
  "Partnerschaft": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      },
      "typ": {
        "type": "categorical",
        "categories": [
          "Ehe",
          "Affäre",
          "Inzest"
        ]
      }
    }
  },
  "Rivalitaet": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  },
  "Abstammung": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "gaia",
  "type": "Gott",
  "label": "Gaia",
  "name": "Gaia",
  "pantheon": "griechisch",
  "generation": 1,
  "einfluss": 95,
  "alter": 10000
}
Sample Relationship: {
  "id": "rel_1",
  "type": "Elternschaft",
  "source": "gaia",
  "target": "chronos",
  "label": "Mutter von",
  "intensitaet": 0.95
}
========================================


=== Iteration: 6. Abstrakte Konzepte ===
Dauer: 22.63s
Entities: 32
Relationships: 37
----------------------------------------
DataModel Entities: {
  "PhilosophicalSchool": {
    "properties": {
      "name": {
        "type": "categorical"
      },
      "era": {
        "type": "categorical"
      },
      "influenceScore": {
        "type": "continuous",
        "range": [
          0,
          100
        ]
      },
      "foundingYear": {
        "type": "continuous",
        "range": [
          -600,
          2000
        ]
      }
    }
  },
  "Philosopher": {
    "properties": {
      "name": {
        "type": "categorical"
      },
      "birthYear": {
        "type": "continuous",
        "range": [
          -600,
          2000
        ]
      },
      "influenceScore": {
        "type": "continuous",
        "range": [
          0,
          100
        ]
      }
    }
  },
  "Concept": {
    "properties": {
      "name": {
        "type": "categorical"
      },
      "centrality": {
        "type": "continuous",
        "range": [
          0,
          100
        ]
      }
    }
  }
}
DataModel Relationships: {
  "InfluencedBy": {
    "properties": {
      "strength": {
        "type": "continuous",
        "range": [
          0.1,
          1
        ]
      },
      "timeGap": {
        "type": "continuous",
        "range": [
          0,
          500
        ]
      }
    }
  },
  "DevelopedBy": {
    "properties": {
      "contributionLevel": {
        "type": "continuous",
        "range": [
          0.3,
          1
        ]
      }
    }
  },
  "Contains": {
    "properties": {
      "prominence": {
        "type": "continuous",
        "range": [
          0.2,
          1
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "school_1",
  "type": "PhilosophicalSchool",
  "label": "Pre-Socratic",
  "name": "Pre-Socratic",
  "era": "Ancient",
  "influenceScore": 65,
  "foundingYear": -600
}
Sample Relationship: {
  "id": "rel_1",
  "type": "DevelopedBy",
  "source": "school_2",
  "target": "phil_1",
  "label": "developed by",
  "contributionLevel": 0.95
}
========================================


=== Iteration: 7. Datenintensive Eigenschaften ===
Dauer: 16.24s
Entities: 13
Relationships: 20
----------------------------------------
DataModel Entities: {
  "Book": {
    "properties": {
      "price": {
        "type": "continuous",
        "range": [
          5,
          35
        ]
      },
      "pages": {
        "type": "continuous",
        "range": [
          150,
          650
        ]
      },
      "rating": {
        "type": "continuous",
        "range": [
          2.5,
          5
        ]
      },
      "publicationYear": {
        "type": "continuous",
        "range": [
          1990,
          2024
        ]
      }
    }
  },
  "Author": {
    "properties": {
      "age": {
        "type": "continuous",
        "range": [
          25,
          85
        ]
      },
      "booksPublished": {
        "type": "continuous",
        "range": [
          1,
          25
        ]
      }
    }
  },
  "Genre": {
    "properties": {
      "popularity": {
        "type": "continuous",
        "range": [
          1,
          10
        ]
      }
    }
  }
}
DataModel Relationships: {
  "WRITTEN_BY": {
    "properties": {
      "collaboration": {
        "type": "continuous",
        "range": [
          0,
          1
        ]
      }
    }
  },
  "BELONGS_TO": {
    "properties": {
      "relevance": {
        "type": "continuous",
        "range": [
          0.6,
          1
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "book1",
  "type": "Book",
  "label": "Dune",
  "price": 14.99,
  "pages": 412,
  "rating": 4.7,
  "publicationYear": 1965
}
Sample Relationship: {
  "id": "rel1",
  "type": "WRITTEN_BY",
  "source": "book1",
  "target": "author1",
  "label": "geschrieben von",
  "collaboration": 0
}
========================================


=== Iteration: 8. Hochgradig vernetztes Ökosystem ===
Dauer: 23.17s
Entities: 18
Relationships: 24
----------------------------------------
DataModel Entities: {
  "Pflanze": {
    "properties": {
      "biomasse_kg": {
        "type": "continuous",
        "range": [
          5,
          1200
        ]
      },
      "wachstumsrate": {
        "type": "continuous",
        "range": [
          0.1,
          2.5
        ]
      },
      "feuchtigkeitsoptimum": {
        "type": "continuous",
        "range": [
          30,
          85
        ]
      },
      "sonneneinstrahlung_opt": {
        "type": "continuous",
        "range": [
          20,
          95
        ]
      }
    }
  },
  "Herbivore": {
    "properties": {
      "population": {
        "type": "continuous",
        "range": [
          20,
          450
        ]
      },
      "stoffwechselrate": {
        "type": "continuous",
        "range": [
          0.4,
          3.2
        ]
      },
      "einfluss_auf_netz": {
        "type": "continuous",
        "range": [
          0.1,
          0.95
        ]
      }
    }
  },
  "Carnivore": {
    "properties": {
      "population": {
        "type": "continuous",
        "range": [
          5,
          60
        ]
      },
      "stoffwechselrate": {
        "type": "continuous",
        "range": [
          0.8,
          4.5
        ]
      },
      "einfluss_auf_netz": {
        "type": "continuous",
        "range": [
          0.3,
          1
        ]
      }
    }
  },
  "Bestaeuber": {
    "properties": {
      "population": {
        "type": "continuous",
        "range": [
          80,
          1200
        ]
      },
      "bestaeubungseffizienz": {
        "type": "continuous",
        "range": [
          0.2,
          0.9
        ]
      },
      "einfluss_auf_netz": {
        "type": "continuous",
        "range": [
          0.2,
          0.85
        ]
      }
    }
  },
  "Parasit": {
    "properties": {
      "befallsrate": {
        "type": "continuous",
        "range": [
          0.05,
          0.65
        ]
      },
      "einfluss_auf_netz": {
        "type": "continuous",
        "range": [
          0.15,
          0.8
        ]
      }
    }
  }
}
DataModel Relationships: {
  "Frisst": {
    "properties": {
      "intensitaet": {
        "type": "continuous",
        "range": [
          0.1,
          0.95
        ]
      }
    }
  },
  "Bestaubt": {
    "properties": {
      "effizienz": {
        "type": "continuous",
        "range": [
          0.3,
          0.98
        ]
      }
    }
  },
  "Parasitiert": {
    "properties": {
      "schadensgrad": {
        "type": "continuous",
        "range": [
          0.1,
          0.85
        ]
      }
    }
  },
  "Symbiose": {
    "properties": {
      "nutzenfaktor": {
        "type": "continuous",
        "range": [
          0.4,
          0.9
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "p1",
  "type": "Pflanze",
  "label": "Eiche",
  "biomasse_kg": 980,
  "wachstumsrate": 0.8,
  "feuchtigkeitsoptimum": 45,
  "sonneneinstrahlung_opt": 75
}
Sample Relationship: {
  "id": "r1",
  "type": "Frisst",
  "source": "h1",
  "target": "p4",
  "label": "Frisst",
  "intensitaet": 0.82
}
========================================


=== Iteration: 9. Temporal + Multiple Edges ===
Dauer: 20.82s
Entities: 18
Relationships: 32
----------------------------------------
DataModel Entities: {
  "Nation": {
    "properties": {
      "name": {
        "type": "categorical"
      },
      "alliance": {
        "type": "categorical"
      },
      "militaryPower": {
        "type": "continuous",
        "range": [
          0,
          100
        ]
      }
    }
  },
  "Battle": {
    "properties": {
      "name": {
        "type": "categorical"
      },
      "year": {
        "type": "continuous",
        "range": [
          1939,
          1945
        ]
      },
      "casualties": {
        "type": "continuous",
        "range": [
          1000,
          2000000
        ]
      },
      "outcome": {
        "type": "categorical"
      }
    }
  }
}
DataModel Relationships: {
  "Alliance": {
    "properties": {
      "startYear": {
        "type": "continuous",
        "range": [
          1939,
          1945
        ]
      },
      "endYear": {
        "type": "continuous",
        "range": [
          1939,
          1945
        ]
      }
    }
  },
  "DeclarationOfWar": {
    "properties": {
      "year": {
        "type": "continuous",
        "range": [
          1939,
          1945
        ]
      }
    }
  },
  "FoughtIn": {
    "properties": {
      "year": {
        "type": "continuous",
        "range": [
          1939,
          1945
        ]
      }
    }
  }
}
----------------------------------------
Sample Entity: {
  "id": "nation_ger",
  "type": "Nation",
  "label": "Deutschland",
  "name": "Deutschland",
  "alliance": "Axis",
  "militaryPower": 92
}
Sample Relationship: {
  "id": "rel_all_ger_ita",
  "type": "Alliance",
  "source": "nation_ger",
  "target": "nation_ita",
  "label": "Achsenbündnis",
  "startYear": 1939,
  "endYear": 1945
}
========================================


=== Iteration: 10. Edge Cases (Unvollständige Datenstrukturen testen) ===
Dauer: 24.87s
Entities: 18
Relationships: 22
----------------------------------------
DataModel Entities: {
  "UraltesKosmischesAetherWesenDerUnendlichenLeere": {
    "properties": {
      "arkaneEssenzStufe": {
        "type": "continuous",
        "range": [
          1,
          100
        ]
      },
      "transzendenterEinflussWert": {
        "type": "continuous",
        "range": [
          0,
          500
        ]
      },
      "temporaleManifestationsEpoche": {
        "type": "categorical",
        "range": [
          "VorDerGrossenKonvergenz",
          "WaehrendDerAetherSturmAera",
          "NachDemFallDerEwigenFlamme"
        ]
      }
    }
  },
  "InterdimensionalerTraumWeberDerVergessenenSternenPfade": {
    "properties": {
      "arkaneEssenzStufe": {
        "type": "continuous",
        "range": [
          1,
          100
        ]
      },
      "transzendenterEinflussWert": {
        "type": "continuous",
        "range": [
          0,
          500
        ]
      },
      "interdimensionaleAffinitaet": {
        "type": "categorical",
        "range": [
          "Schattenreich",
          "LichtAether",
          "ChaosWirbel",
          "OrdnungsKristall"
        ]
      }
    }
  },
  "EwigerWächterDerSchwebendenKristallInseln": {
    "properties": {
      "arkaneEssenzStufe": {
        "type": "continuous",
        "range": [
          1,
          100
        ]
      },
      "transzendenterEinflussWert": {
        "type": "continuous",
        "range": [
          0,
          500
        ]
      },
      "temporaleManifestationsEpoche": {
        "type": "categorical",
        "range": [
          "VorDerGrossenKonvergenz",
          "WaehrendDerAetherSturmAera",
          "NachDemFallDerEwigenFlamme"
        ]
      }
    }
  }
}
DataModel Relationships: {
  "ArkaneEssenzVerbindungOhneJeglicheZusatzlicheMetadatenAttribute": {
    "properties": {}
  }
}
----------------------------------------
Sample Entity: {
  "id": "u1",
  "type": "UraltesKosmischesAetherWesenDerUnendlichenLeere",
  "label": "Zorath'ul",
  "arkaneEssenzStufe": 87,
  "transzendenterEinflussWert": 423,
  "temporaleManifestationsEpoche": "VorDerGrossenKonvergenz"
}
Sample Relationship: {
  "id": "rel1",
  "type": "ArkaneEssenzVerbindungOhneJeglicheZusatzlicheMetadatenAttribute",
  "source": "u1",
  "target": "t1",
  "label": "Essenzfluss"
}
========================================

