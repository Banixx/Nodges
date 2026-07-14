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
Ursprüngliche Anfrage: Sonnensystem

Hier sind die abgerufenen Wikidata-Ergebnisse (JSON):
[
  {
    "type": "http://www.wikidata.org/entity/Q2199",
    "body": "http://www.wikidata.org/entity/Q6587",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "225088 Gonggong",
    "typeLabel": "dwarf planet",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q2199",
    "body": "http://www.wikidata.org/entity/Q15610",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "Sedna",
    "typeLabel": "dwarf planet",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q2199",
    "body": "http://www.wikidata.org/entity/Q15586",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "Quaoar",
    "typeLabel": "dwarf planet",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q3311",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "10427 Klinkenberg",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q4475",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "10018 Lykawka",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q4477",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "10003 Caryhuang",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q4483",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "10019 Wesleyfraser",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q4486",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "10020 Bagenal",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q4911",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(6427) 1995 FY",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q8591",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "7981 Katieoakman",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q8604",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(10537) 1991 RY16",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q8607",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(19308) 1996 TO66",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q16711",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(433) Eros",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q18686",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(6585) O'Keefe",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q18689",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(6543) Senna",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q18690",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(6514) Torahiko",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q18692",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "6512 de Bergh",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q18694",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "6510 Tarry",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q18799",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(12100) Amiens",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q19098",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(4443) Paulet",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q20072",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "Q20072",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q25713",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(6528) Boden",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q25715",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "6529 Rhoads",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q26329",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(3787) Aivazovskij",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q26772",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(1242) Zambesia",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q26775",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(2165) Young",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q8640",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "2004 FH",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q11054",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "2008 LC₁₈",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q11057",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(614599) 2010 AB78",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q11521",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "100 Hekate",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q11524",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(100027) Hannaharendt",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q39062",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "12979 Evgalvasilʹev",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q39966",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "2156 Kate",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q39968",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(2157) Ashbrook",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q43916",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "6573 Magnitskij",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q43918",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "6536 Vysochinska",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q43962",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "(6547) Vasilkarazin",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q48411",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "2127 Tanya",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q58786",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "3280 Grétry",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "type": "http://www.wikidata.org/entity/Q3863",
    "body": "http://www.wikidata.org/entity/Q59678",
    "parent": "http://www.wikidata.org/entity/Q525",
    "bodyLabel": "6650 Morimoto",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  }
]