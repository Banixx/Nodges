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
Ursprüngliche Anfrage: sonnensysstem

Hier sind die abgerufenen Wikidata-Ergebnisse (JSON):
[
  {
    "body": "http://www.wikidata.org/entity/Q596",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "Ceres",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q2640",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "10 Hygiea",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q3002",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "2 Pallas",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q3009",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "3 Juno",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q3030",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "Vesta",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q3311",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "10427 Klinkenberg",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q4475",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "10018 Lykawka",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q4477",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "10003 Caryhuang",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q4483",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "10019 Wesleyfraser",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q4486",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "10020 Bagenal",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q4911",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(6427) 1995 FY",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q8591",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "7981 Katieoakman",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q8604",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(10537) 1991 RY16",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q8607",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(19308) 1996 TO66",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q8640",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "2004 FH",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11054",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "2008 LC₁₈",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11057",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(614599) 2010 AB78",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11521",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "100 Hekate",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11524",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(100027) Hannaharendt",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11526",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "100033 Taizé",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11527",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "1002 Olbersia",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11528",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(1001) Gaussia",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11530",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(1003) Lilofee",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11531",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "1004 Belopolskya",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11532",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(10057) L’Obel",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11533",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "1005 Arago",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11534",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(1006) Lagrangea",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11535",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(10069) Fontenelle",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11536",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(10079) Meunier",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11537",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(1007) Pawlowia",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11540",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(1008) La Paz",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11541",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(1009) Sirene",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11543",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(101) Helena",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11544",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(1010) Marlene",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11545",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(10101) Fourier",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11546",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(1011) Laodamia",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11548",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(1012) Sarema",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11549",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(1013) Tombecka",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11550",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(10149) Cavagna",
    "orbitsLabel": "Sun"
  },
  {
    "body": "http://www.wikidata.org/entity/Q11551",
    "orbits": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(1014) Semphyra",
    "orbitsLabel": "Sun"
  }
]