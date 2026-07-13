SYSTEM:
Du erhältst Rohdaten aus einer Wikidata-Abfrage (JSON-Bindings) sowie die ursprüngliche User-Anfrage.
Deine Aufgabe ist es, diese flachen, tabellarischen Daten in das 3D-Graphenformat von Nodges umzuwandeln.

Erzeuge eine valide Nodges-Struktur mit "system", "metadata", "dataModel", "data" (entities & relationships) und "visualMappings".

WICHTIG ZUR GRAPHEN-BILDUNG:
- Jede Entität (z.B. ein Land, eine Stadt, eine Person) aus den Tabellen-Spalten wird ein eigener Knoten (Entity). 
- Nutze den generierten Label (z.B. Wert von personLabel) als Entity "label" und die URL (oder den Namen selbst, falls eindeutig) als "id".
- Die semantische Beziehung zwischen den Spalten (z.B. Stadt "liegt in" Land) wird zu einer Kante (Relationship). 
- Erfinde sinnvolle Kategorien (types) im dataModel und füge den Entitäten Attribute hinzu, falls ableitbar.

=== ZIEL-STRUKTUR (Striktes JSON) ===
{
  "system": "<Thema>",
  "metadata": { "schemaVersion": "5.0", "description": "Generiert aus Wikidata" },
  "dataModel": {
    "entities": {
      "<TypName>": { "properties": { "<propName>": { "type": "continuous", "range": [0, 100] } } }
    },
    "relationships": {
      "<KantenTyp>": { "properties": {} }
    }
  },
  "data": {
    "entities": [
      { "id": "unique_id", "type": "<TypName>", "label": "Namen eintragen", "<propName>": 42 }
    ],
    "relationships": [
      { "id": "rel_1", "type": "<KantenTyp>", "source": "id_a", "target": "id_b", "label": "..." }
    ]
  },
  "visualMappings": {
    "defaultPresets": {
      "<TypName>": {
        "size": { "source": "constant", "function": "constant", "params": { "size": 1.0 } },
        "color": { "source": "type", "function": "categorical" },
        "geometry": { "source": "constant", "function": "constant", "params": { "geometry": "sphere" } }
      },
      "<KantenTyp>": {
        "color": { "source": "constant", "function": "constant", "params": { "color": "#aaaaaa" } },
        "thickness": { "source": "constant", "function": "constant", "params": { "size": 0.1 } }
      }
    }
  }
}
=================================


USER:
Ursprüngliche Anfrage: Alle Menschen die in der Schweiz am 29.Februar geboren sind.

Hier sind die abgerufenen Wikidata-Ergebnisse (JSON):
[
  {
    "person": "http://www.wikidata.org/entity/Q1731009",
    "birthDate": "1836-02-29T00:00:00Z",
    "personLabel": "Karl Franz Sebastian Fahrländer"
  },
  {
    "person": "http://www.wikidata.org/entity/Q56491260",
    "birthDate": "1976-02-29T00:00:00Z",
    "personLabel": "Michael Naef"
  },
  {
    "person": "http://www.wikidata.org/entity/Q85098612",
    "birthDate": "1964-02-29T00:00:00Z",
    "personLabel": "Heinz Julen"
  },
  {
    "person": "http://www.wikidata.org/entity/Q132232676",
    "birthDate": "1776-02-29T00:00:00Z",
    "personLabel": "Nicolas Müller"
  },
  {
    "person": "http://www.wikidata.org/entity/Q1468384",
    "birthDate": "1916-02-29T00:00:00Z",
    "personLabel": "Fritz Schäuffele"
  },
  {
    "person": "http://www.wikidata.org/entity/Q59367092",
    "birthDate": "1956-02-29T00:00:00Z",
    "personLabel": "Thomas Zindel"
  },
  {
    "person": "http://www.wikidata.org/entity/Q1579203",
    "birthDate": "1936-02-29T00:00:00Z",
    "personLabel": "Hans Dionys Dossenbach"
  },
  {
    "person": "http://www.wikidata.org/entity/Q113870689",
    "birthDate": "1648-02-29T00:00:00Z",
    "personLabel": "Johann Steiner"
  },
  {
    "person": "http://www.wikidata.org/entity/Q123155359",
    "birthDate": "1972-02-29T00:00:00Z",
    "personLabel": "Cyril Aellen"
  },
  {
    "person": "http://www.wikidata.org/entity/Q112763183",
    "birthDate": "1896-02-29T00:00:00Z",
    "personLabel": "Franz Fiechter"
  },
  {
    "person": "http://www.wikidata.org/entity/Q132232401",
    "birthDate": "1820-02-29T00:00:00Z",
    "personLabel": "Samuel Mognetti"
  },
  {
    "person": "http://www.wikidata.org/entity/Q117455",
    "birthDate": "1948-02-29T00:00:00Z",
    "personLabel": "Martin Suter"
  },
  {
    "person": "http://www.wikidata.org/entity/Q2847546",
    "birthDate": "1920-02-29T00:00:00Z",
    "personLabel": "André Condé"
  },
  {
    "person": "http://www.wikidata.org/entity/Q1685176",
    "birthDate": "1928-02-29T00:00:00Z",
    "personLabel": "Jean-Pierre Bionda"
  },
  {
    "person": "http://www.wikidata.org/entity/Q19959594",
    "birthDate": "1948-02-29T00:00:00Z",
    "personLabel": "Franz Gloor"
  },
  {
    "person": "http://www.wikidata.org/entity/Q15435462",
    "birthDate": "1740-02-29T00:00:00Z",
    "personLabel": "Johann Jakob Mesmer"
  },
  {
    "person": "http://www.wikidata.org/entity/Q64733539",
    "birthDate": "1704-02-29T00:00:00Z",
    "personLabel": "Franz Joseph Friedrich Ambuel"
  },
  {
    "person": "http://www.wikidata.org/entity/Q23063169",
    "birthDate": "1816-02-29T00:00:00Z",
    "personLabel": "Bernhard Simon"
  },
  {
    "person": "http://www.wikidata.org/entity/Q132228759",
    "birthDate": "1920-02-29T00:00:00Z",
    "personLabel": "Lucretia Camenisch"
  },
  {
    "person": "http://www.wikidata.org/entity/Q112687408",
    "birthDate": "1944-02-29T00:00:00Z",
    "personLabel": "Heidi Gassner Venetz"
  },
  {
    "person": "http://www.wikidata.org/entity/Q117035984",
    "birthDate": "1856-02-29T00:00:00Z",
    "personLabel": "Ulrich Vetsch"
  },
  {
    "person": "http://www.wikidata.org/entity/Q1566036",
    "birthDate": "1944-02-29T00:00:00Z",
    "personLabel": "Hanspeter Kraft"
  },
  {
    "person": "http://www.wikidata.org/entity/Q124253",
    "birthDate": "1944-02-29T00:00:00Z",
    "personLabel": "Erwin Kessler"
  },
  {
    "person": "http://www.wikidata.org/entity/Q133641130",
    "birthDate": "1840-02-29T00:00:00Z",
    "personLabel": "Q133641130"
  },
  {
    "person": "http://www.wikidata.org/entity/Q21554305",
    "birthDate": "1872-02-29T00:00:00Z",
    "personLabel": "Carl Egger"
  },
  {
    "person": "http://www.wikidata.org/entity/Q62559552",
    "birthDate": "1960-02-29T00:00:00Z",
    "personLabel": "Manuel Battegay"
  },
  {
    "person": "http://www.wikidata.org/entity/Q85544300",
    "birthDate": "1896-02-29T00:00:00Z",
    "personLabel": "Rudolf Olaf Tönjachen"
  },
  {
    "person": "http://www.wikidata.org/entity/Q94942137",
    "birthDate": "1924-02-29T00:00:00Z",
    "personLabel": "Max Chrétien"
  },
  {
    "person": "http://www.wikidata.org/entity/Q58398938",
    "birthDate": "1936-02-29T00:00:00Z",
    "personLabel": "Fritz Hans Schweingruber"
  },
  {
    "person": "http://www.wikidata.org/entity/Q112269939",
    "birthDate": "2000-02-29T00:00:00Z",
    "personLabel": "Samuel Zehnder"
  },
  {
    "person": "http://www.wikidata.org/entity/Q99305397",
    "birthDate": "1920-02-29T00:00:00Z",
    "personLabel": "Urs Kunz"
  },
  {
    "person": "http://www.wikidata.org/entity/Q94574429",
    "birthDate": "1932-02-29T00:00:00Z",
    "personLabel": "Fritz Glauser"
  },
  {
    "person": "http://www.wikidata.org/entity/Q30311708",
    "birthDate": "1768-02-29T00:00:00Z",
    "personLabel": "Johann Karl Müllener"
  },
  {
    "person": "http://www.wikidata.org/entity/Q19501939",
    "birthDate": "1948-02-29T00:00:00Z",
    "personLabel": "Andreas Auer"
  },
  {
    "person": "http://www.wikidata.org/entity/Q1488433",
    "birthDate": "1956-02-29T00:00:00Z",
    "personLabel": "Gabi Huber"
  },
  {
    "person": "http://www.wikidata.org/entity/Q364638",
    "birthDate": "1864-02-29T00:00:00Z",
    "personLabel": "Adolf Wölfli"
  }
]