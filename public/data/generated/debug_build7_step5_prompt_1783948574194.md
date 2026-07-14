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
Ursprüngliche Anfrage: USER: sonnensystem

KI: Möchtest du die Planeten unseres Sonnensystems als Knoten visualisieren, mit Verbindungen wie Umlaufbahnen oder Gravitationsbeziehungen?

USER: ja.

Hier sind die abgerufenen Wikidata-Ergebnisse (JSON):
[
  {
    "item": "http://www.wikidata.org/entity/Q140151",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1501) Baade",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140164",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1502) Arenda",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140177",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1503) Kuopio",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140190",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1504) Lappeenranta",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140197",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1505) Koranna",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140214",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1506) Xosa",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140228",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1507) Vaasa",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140237",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "1508 Kemi",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140237",
    "type": "http://www.wikidata.org/entity/Q777140",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "1508 Kemi",
    "typeLabel": "Mars-crossing asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140273",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(151) Abundantia",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140286",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "1510 Charlois",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140297",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "1511 Daléra",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140315",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "1512 Oulu",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140322",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "1513 Mátra",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140330",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1514) Ricouxa",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140338",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1515) Perrotin",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140346",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1516) Henry",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140353",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1517) Beograd",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140362",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1518) Rovaniemi",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140363",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(15198) 1940 GJ",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140370",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1519) Kajaani",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140380",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "152 Atala",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140382",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "1520 Imatra",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140397",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "1521 Seinäjoki",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140399",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1522) Kokkola",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140402",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(15239) Stenhammar",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140410",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "1523 Pieksämäki",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140419",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1524) Joensuu",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140426",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1525) Savonlinna",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140433",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(15262) Abderhalden",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140434",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1526) Mikkeli",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140440",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "15265 Ernsting",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140449",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "15278 Pâquet",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140452",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1527) Malmquista",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140469",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1528) Conrada",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140474",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1529) Oterma",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140488",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "1530 Rantaseppä",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140489",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "153 Hilda",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140504",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1531) Hartmut",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  },
  {
    "item": "http://www.wikidata.org/entity/Q140507",
    "type": "http://www.wikidata.org/entity/Q3863",
    "parent": "http://www.wikidata.org/entity/Q525",
    "itemLabel": "(1532) Inari",
    "typeLabel": "asteroid",
    "parentLabel": "Sun"
  }
]