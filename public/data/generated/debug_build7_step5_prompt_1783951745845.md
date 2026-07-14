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
    "celestialBody": "http://www.wikidata.org/entity/Q136161",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1119) Euboea",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136178",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1120) Cannonia",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136191",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1121) Natascha",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136203",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1123) Shapleya",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136204",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1124) Stroobantia",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136212",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1126) Otero",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136222",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1127) Mimi",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136226",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1128) Astrid",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136179",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "112 Iphigenia",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136194",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "1122 Neith",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136211",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "1125 China",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136476",
    "type": "http://www.wikidata.org/entity/Q193275",
    "celestialBodyLabel": "1149 Volga",
    "typeLabel": "small Solar System body"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136265",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1130) Skuld",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136275",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(11311) Peleus",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136276",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1131) Porzia",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136299",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1133) Lugduna",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136240",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "1129 Neujmina",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136256",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "113 Amalthea",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136300",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "1132 Hollandia",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136308",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(113390) Helvetia",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136319",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(11341) Babbage",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136323",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1134) Kepler",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136343",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "1135 Colchis",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136350",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1136) Mercedes",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136379",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1139) Atami",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136362",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "1137 Raïssa",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136370",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "1138 Attica",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136402",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "114 Kassandra",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136400",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "1140 Crimea",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136418",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1141) Bohmia",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136419",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1142) Aetolia",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136427",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1144) Oda",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136437",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(11450) Shearer",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136442",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1145) Robelmonte",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136447",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(11451) Aarongolden",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136455",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1146) Biarmia",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136468",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(1148) Rarahu",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136430",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "1143 Odysseus",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136458",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "1147 Stavropolis",
    "typeLabel": "asteroid"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q136479",
    "type": "http://www.wikidata.org/entity/Q3863",
    "celestialBodyLabel": "(11496) Grass",
    "typeLabel": "asteroid"
  }
]