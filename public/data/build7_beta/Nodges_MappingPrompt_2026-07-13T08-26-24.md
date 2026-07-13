=== SYSTEM PROMPT ===
Du erhältst Rohdaten aus einer Wikidata-Abfrage (JSON-Bindings) sowie die ursprüngliche User-Anfrage.
Deine Aufgabe ist es, diese flachen, tabellarischen Daten in das 3D-Graphenformat von Nodges umzuwandeln.

Erzeuge eine valide Nodges-Struktur mit "system", "metadata", "dataModel", "data" (entities & relationships) und "visualMappings".

STRIKTE REGELN:
1. BENENNUNG VON TYPEN: Nutze NIEMALS generische Namen wie "Type", "Category" oder "Entity" für Typen im `dataModel`! Benenne Typen immer nach ihrem echten Inhalt (z.B. "SoftwareDeveloper", "ProgrammingLanguage", "Country").
2. KNOTEN BILDEN: Jedes eigenständige Konzept aus den Wikidata-Daten wird ein Knoten (Entity). Nutze die URL oder die reine Q-ID (ohne wd: Präfix) als "id" und das Label als "label".
3. KANTEN VERKNÜPFEN (SEHR WICHTIG): Jede Kante (Relationship) in `data.relationships` MUSS einen `source` und `target` haben, der EXAKT einer existierenden `id` in `data.entities` entspricht! Wenn du für einen Knoten `id: "Q123"` vergibst, MUSS in der Kante `source: "Q123"` stehen. Ansonsten entstehen defekte Kanten ohne Enden und das Programm stürzt ab.
4. EIGENSCHAFTEN (Properties): Wenn eine Spalte nur ein reines Attribut ist (z.B. Gründungsdatum), füge es nicht als eigenen Knoten, sondern als Property zum jeweiligen Knoten hinzu und definiere es zwingend im `dataModel`.

=== ZIEL-STRUKTUR (Striktes JSON) ===
{
  "system": "<Thema>",
  "metadata": { "schemaVersion": "5.0", "description": "Generiert aus Wikidata" },
  "dataModel": {
    "entities": {
      "ProgrammingLanguage": { "properties": { "yearCreated": { "type": "continuous", "range": [1950, 2025] } } }
    },
    "relationships": {
      "developed_by": { "properties": {} }
    }
  },
  "data": {
    "entities": [
      { "id": "Q1234", "type": "ProgrammingLanguage", "label": "Python", "yearCreated": 1991 }
    ],
    "relationships": [
      { "id": "rel_1", "type": "developed_by", "source": "Q1234", "target": "Q5678", "label": "developed by" }
    ]
  },
  "visualMappings": {
    "defaultPresets": {
      "ProgrammingLanguage": {
        "size": { "source": "constant", "function": "constant", "params": { "size": 1.0 } },
        "color": { "source": "type", "function": "categorical" },
        "geometry": { "source": "constant", "function": "constant", "params": { "geometry": "box" } }
      },
      "developed_by": {
        "color": { "source": "constant", "function": "constant", "params": { "color": "#aaaaaa" } },
        "thickness": { "source": "constant", "function": "constant", "params": { "size": 0.1 } }
      }
    }
  }
}


=== USER PROMPT ===
Ursprüngliche Anfrage: Pferde, ihre Rassen und Herkunft

Hier sind die abgerufenen Wikidata-Ergebnisse (JSON):
[
  {
    "breed": "http://www.wikidata.org/entity/Q2962905",
    "country": "http://www.wikidata.org/entity/Q38",
    "breedLabel": "Cavallo Romano della Maremma Laziale",
    "countryLabel": "Italy"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962916",
    "country": "http://www.wikidata.org/entity/Q142",
    "breedLabel": "Corsican horse",
    "countryLabel": "France"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962919",
    "country": "http://www.wikidata.org/entity/Q30",
    "breedLabel": "American creme and white horse registry",
    "countryLabel": "United States"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962921",
    "country": "http://www.wikidata.org/entity/Q142",
    "breedLabel": "Auvergne horse",
    "countryLabel": "France"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962930",
    "country": "http://www.wikidata.org/entity/Q38",
    "breedLabel": "Catria horse",
    "countryLabel": "Italy"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962932",
    "country": "http://www.wikidata.org/entity/Q148",
    "breedLabel": "Nangchen horse",
    "countryLabel": "People's Republic of China"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962933",
    "country": "http://www.wikidata.org/entity/Q38",
    "breedLabel": "Pentro horse",
    "countryLabel": "Italy"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962944",
    "country": "http://www.wikidata.org/entity/Q31",
    "breedLabel": "Belgian Sport Horse",
    "countryLabel": "Belgium"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962948",
    "country": "http://www.wikidata.org/entity/Q142",
    "breedLabel": "Cheval des Marquises",
    "countryLabel": "France"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962951",
    "country": "http://www.wikidata.org/entity/Q30",
    "breedLabel": "Nez Perce Horse",
    "countryLabel": "United States"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962952",
    "country": "http://www.wikidata.org/entity/Q155",
    "breedLabel": "Brazilian Sport Horse",
    "countryLabel": "Brazil"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962953",
    "country": "http://www.wikidata.org/entity/Q142",
    "breedLabel": "Cheval du Morvan",
    "countryLabel": "France"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962956",
    "country": "http://www.wikidata.org/entity/Q38",
    "breedLabel": "Ventasso horse",
    "countryLabel": "Italy"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962962",
    "country": "http://www.wikidata.org/entity/Q31",
    "breedLabel": "Flemish Horse",
    "countryLabel": "Belgium"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962963",
    "country": "http://www.wikidata.org/entity/Q142",
    "breedLabel": "Limousin horse",
    "countryLabel": "France"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962966",
    "country": "http://www.wikidata.org/entity/Q142",
    "breedLabel": "Cheval lorrain",
    "countryLabel": "France"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2962973",
    "country": "http://www.wikidata.org/entity/Q142",
    "breedLabel": "Navarrin horse",
    "countryLabel": "France"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2963620",
    "country": "http://www.wikidata.org/entity/Q298",
    "breedLabel": "Chilean horse",
    "countryLabel": "Chile"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2964310",
    "country": "http://www.wikidata.org/entity/Q30",
    "breedLabel": "Choctaw Horse",
    "countryLabel": "United States"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2981825",
    "country": "http://www.wikidata.org/entity/Q408",
    "breedLabel": "Coffin Bay Pony",
    "countryLabel": "Australia"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q2987038",
    "country": "http://www.wikidata.org/entity/Q159",
    "breedLabel": "Vyatka horse",
    "countryLabel": "Russia"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3021600",
    "country": "http://www.wikidata.org/entity/Q252",
    "breedLabel": "Deli pony",
    "countryLabel": "Indonesia"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3030340",
    "country": "http://www.wikidata.org/entity/Q21",
    "breedLabel": "Norfolk Trotter",
    "countryLabel": "England"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3030606",
    "country": "http://www.wikidata.org/entity/Q17",
    "breedLabel": "Taishuh",
    "countryLabel": "Japan"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3030767",
    "country": "http://www.wikidata.org/entity/Q836",
    "breedLabel": "Burmese Pony",
    "countryLabel": "Myanmar"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3031152",
    "country": "http://www.wikidata.org/entity/Q27",
    "breedLabel": "Kerry Bog Pony",
    "countryLabel": "Ireland"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3031304",
    "country": "http://www.wikidata.org/entity/Q184",
    "breedLabel": "Byelorussian Harness",
    "countryLabel": "Belarus"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3034120",
    "country": "http://www.wikidata.org/entity/Q17",
    "breedLabel": "Noma pony",
    "countryLabel": "Japan"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3036272",
    "country": "http://www.wikidata.org/entity/Q1049",
    "breedLabel": "Dongola horse",
    "countryLabel": "Sudan"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3040564",
    "country": "http://www.wikidata.org/entity/Q27",
    "breedLabel": "Irish Hobby",
    "countryLabel": "Ireland"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3044064",
    "country": "http://www.wikidata.org/entity/Q20",
    "breedLabel": "Nordlandshest/Lyngshest",
    "countryLabel": "Norway"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3047733",
    "country": "http://www.wikidata.org/entity/Q29",
    "breedLabel": "Galician Pony",
    "countryLabel": "Spain"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3062589",
    "country": "http://www.wikidata.org/entity/Q668",
    "breedLabel": "Zaniskari",
    "countryLabel": "India"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3063148",
    "country": "http://www.wikidata.org/entity/Q36",
    "breedLabel": "Malopolski",
    "countryLabel": "Poland"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3099678",
    "country": "http://www.wikidata.org/entity/Q252",
    "breedLabel": "Gayoe",
    "countryLabel": "Indonesia"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3112880",
    "country": "http://www.wikidata.org/entity/Q21",
    "breedLabel": "Hackney pony",
    "countryLabel": "England"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3114092",
    "country": "http://www.wikidata.org/entity/Q213",
    "breedLabel": "Czech warm blood",
    "countryLabel": "Czech Republic"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3133284",
    "country": "http://www.wikidata.org/entity/Q142",
    "breedLabel": "Henson horse",
    "countryLabel": "France"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3157059",
    "country": "http://www.wikidata.org/entity/Q29",
    "breedLabel": "Jaca Navarra",
    "countryLabel": "Spain"
  },
  {
    "breed": "http://www.wikidata.org/entity/Q3191969",
    "country": "http://www.wikidata.org/entity/Q664",
    "breedLabel": "Kaimanawa horse",
    "countryLabel": "New Zealand"
  }
]