SYSTEM:
Du erhältst Rohdaten aus einer Wikidata-Abfrage (JSON-Bindings) sowie die ursprüngliche User-Anfrage.
Deine Aufgabe ist es, diese flachen, tabellarischen Daten in das 3D-Graphenformat von Nodges umzuwandeln.

Erzeuge eine valide Nodges-Struktur mit "system", "metadata", "dataModel", "data" (entities & relationships) und "visualMappings".

STRIKTE REGELN:
1. ONTOLOGIE (Schema): Erzeuge Kategorien (z.B. "SoftwareDeveloper", "ProgrammingLanguage") nicht als 'type', sondern als rein semantisches Property (z.B. `"kategorie": "ProgrammingLanguage"`).
2. KNOTEN BILDEN: Jedes eigenständige Konzept aus den Wikidata-Daten wird ein Knoten (Entity). Nutze die URL oder die reine Q-ID (ohne wd: Präfix) als "id" und das Label als "label".
3. KANTEN VERKNÜPFEN (SEHR WICHTIG): Jede Kante (Relationship) in `data.relationships` MUSS einen `source` und `target` haben, der EXAKT einer existierenden `id` in `data.entities` entspricht!
4. EIGENSCHAFTEN (Properties): Wenn eine Spalte nur ein reines Attribut ist (z.B. Gründungsdatum), füge es als Property zum jeweiligen Knoten hinzu. Definiere alle Properties im `dataModel.properties`.
5. VERBOTENE ATTRIBUTE: Das Feld `type` auf der obersten Ebene der Knoten und Kanten ist absolut verboten! Die Engine ist zu 100% datenneutral. Jegliche Klassifizierung muss über Eigenschaften wie "kategorie", "klasse" oder "art" abgebildet werden.

=== ZIEL-STRUKTUR (Striktes JSON) ===
{
  "system": "<Thema>",
  "metadata": { "schemaVersion": "5.0", "description": "Generiert aus Wikidata" },
  "dataModel": {
    "properties": {
      "kategorie": { "type": "categorical" },
      "yearCreated": { "type": "continuous", "range": [1950, 2025] }
    }
  },
  "data": {
    "entities": [
      { "id": "Q1234", "label": "Python", "kategorie": "ProgrammingLanguage", "yearCreated": 1991 }
    ],
    "relationships": [
      { "id": "rel_1", "source": "Q1234", "target": "Q5678", "label": "developed by", "kategorie": "developed_by" }
    ]
  },
  "visualMappings": {
    "defaultPresets": {
      "global_node": {
        "size": { "source": "constant", "function": "constant", "params": { "size": 1.0 } },
        "color": { "source": "kategorie", "function": "categorical" },
        "geometry": { "source": "kategorie", "function": "categorical" }
      },
      "global_edge": {
        "color": { "source": "constant", "function": "constant", "params": { "color": "#aaaaaa" } },
        "thickness": { "source": "constant", "function": "constant", "params": { "size": 0.1 } }
      }
    }
  }
}


USER:
Ursprüngliche Anfrage: sonnensystem

Hier sind die abgerufenen Wikidata-Ergebnisse (JSON):
[
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "type": "http://www.wikidata.org/entity/Q30014",
    "celestialBodyLabel": "Saturn",
    "typeLabel": "outer planet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "type": "http://www.wikidata.org/entity/Q121750",
    "celestialBodyLabel": "Saturn",
    "typeLabel": "gas giant"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q319",
    "type": "http://www.wikidata.org/entity/Q30014",
    "celestialBodyLabel": "Jupiter",
    "typeLabel": "outer planet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q319",
    "type": "http://www.wikidata.org/entity/Q121750",
    "celestialBodyLabel": "Jupiter",
    "typeLabel": "gas giant"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q324",
    "type": "http://www.wikidata.org/entity/Q30014",
    "celestialBodyLabel": "Uranus",
    "typeLabel": "outer planet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q324",
    "type": "http://www.wikidata.org/entity/Q1319599",
    "celestialBodyLabel": "Uranus",
    "typeLabel": "ice giant"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q332",
    "type": "http://www.wikidata.org/entity/Q30014",
    "celestialBodyLabel": "Neptune",
    "typeLabel": "outer planet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q332",
    "type": "http://www.wikidata.org/entity/Q1319599",
    "celestialBodyLabel": "Neptune",
    "typeLabel": "ice giant"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q47268",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "Q47268",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q47304",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "Kepler-22 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q47519",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "Kepler-9 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q50663",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "55 Cancri f",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q50665",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "55 Cancri b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q50666",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "55 Cancri c",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q50667",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "55 Cancri d",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q50668",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "55 Cancri e",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q52992",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 121504 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q53725",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "Kepler-11 c",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q73307",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 75289 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q73313",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "61 Virginis b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q73561",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "PSR B1257+12 c",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q74002",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "Gliese 163 c",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q74181",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "PSR B1257+12 d",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q74199",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "Gliese 176 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q81254",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 92788 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q81260",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "61 Virginis d",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q81278",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 89744 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q81281",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 187123 c",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q81282",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 187123 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q81347",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "Cayahuanca",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q81698",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "Eyeke",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q83770",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 82943 c",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q83773",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 82943 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q83778",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 169830 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q115626",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 114386 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q115885",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 114783 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q128200",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 213240 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q128833",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 81040 b",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q129189",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 178911 Bb",
    "typeLabel": "exoplanet"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q129220",
    "type": "http://www.wikidata.org/entity/Q44559",
    "celestialBodyLabel": "HD 212301 b",
    "typeLabel": "exoplanet"
  }
]