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
    "body": "http://www.wikidata.org/entity/Q525",
    "type": "http://www.wikidata.org/entity/Q5864",
    "bodyLabel": "Sun",
    "typeLabel": "G-type main-sequence star"
  },
  {
    "body": "http://www.wikidata.org/entity/Q2179",
    "type": "http://www.wikidata.org/entity/Q3235978",
    "bodyLabel": "asteroid belt",
    "typeLabel": "circumstellar disk"
  },
  {
    "body": "http://www.wikidata.org/entity/Q2179",
    "type": "http://www.wikidata.org/entity/Q28951811",
    "bodyLabel": "asteroid belt",
    "typeLabel": "ring system"
  },
  {
    "body": "http://www.wikidata.org/entity/Q2179",
    "type": "http://www.wikidata.org/entity/Q109645909",
    "bodyLabel": "asteroid belt",
    "typeLabel": "astronomical object in the Solar System"
  },
  {
    "body": "http://www.wikidata.org/entity/Q40864",
    "type": "http://www.wikidata.org/entity/Q6592",
    "bodyLabel": "Oort cloud",
    "typeLabel": "trans-Neptunian object"
  },
  {
    "body": "http://www.wikidata.org/entity/Q40864",
    "type": "http://www.wikidata.org/entity/Q18706315",
    "bodyLabel": "Oort cloud",
    "typeLabel": "hypothetical entity"
  },
  {
    "body": "http://www.wikidata.org/entity/Q3962257",
    "type": "http://www.wikidata.org/entity/Q219858",
    "bodyLabel": "outer Solar System",
    "typeLabel": "zone"
  },
  {
    "body": "http://www.wikidata.org/entity/Q3962257",
    "type": "http://www.wikidata.org/entity/Q1385033",
    "bodyLabel": "outer Solar System",
    "typeLabel": "exterior"
  },
  {
    "body": "http://www.wikidata.org/entity/Q3962257",
    "type": "http://www.wikidata.org/entity/Q34469344",
    "bodyLabel": "outer Solar System",
    "typeLabel": "part of the Solar System"
  },
  {
    "body": "http://www.wikidata.org/entity/Q7879772",
    "type": "http://www.wikidata.org/entity/Q219858",
    "bodyLabel": "inner Solar System",
    "typeLabel": "zone"
  },
  {
    "body": "http://www.wikidata.org/entity/Q7879772",
    "type": "http://www.wikidata.org/entity/Q2998430",
    "bodyLabel": "inner Solar System",
    "typeLabel": "interior"
  },
  {
    "body": "http://www.wikidata.org/entity/Q7879772",
    "type": "http://www.wikidata.org/entity/Q34469344",
    "bodyLabel": "inner Solar System",
    "typeLabel": "part of the Solar System"
  }
]