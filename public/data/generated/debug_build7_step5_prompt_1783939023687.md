SYSTEM:
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


USER:
Ursprüngliche Anfrage: USER: sonnensysstem

KI: Möchtest du die Planeten des Sonnensystems, deren Monde oder auch Zwergplaneten und andere Himmelskörper wie Asteroiden visualisieren?

USER: sonne, planeten, momde und zwergplaneten ja, asteroiden nein.

Hier sind die abgerufenen Wikidata-Ergebnisse (JSON):
[
  {
    "object": "http://www.wikidata.org/entity/Q111699345",
    "type": "Planet",
    "typeLabel": "Planet",
    "objectLabel": "Kiwan"
  },
  {
    "object": "http://www.wikidata.org/entity/Q111723944",
    "type": "Planet",
    "typeLabel": "Planet",
    "objectLabel": "Bil"
  },
  {
    "object": "http://www.wikidata.org/entity/Q111723945",
    "type": "Planet",
    "typeLabel": "Planet",
    "objectLabel": "Sin"
  },
  {
    "object": "http://www.wikidata.org/entity/Q111723946",
    "type": "Planet",
    "typeLabel": "Planet",
    "objectLabel": "Shamish"
  },
  {
    "object": "http://www.wikidata.org/entity/Q111723947",
    "type": "Planet",
    "typeLabel": "Planet",
    "objectLabel": "Libat"
  },
  {
    "object": "http://www.wikidata.org/entity/Q111723949",
    "type": "Planet",
    "typeLabel": "Planet",
    "objectLabel": "Nirig"
  },
  {
    "object": "http://www.wikidata.org/entity/Q111723950",
    "type": "Planet",
    "typeLabel": "Planet",
    "objectLabel": "Nbu"
  },
  {
    "object": "http://www.wikidata.org/entity/Q132859575",
    "type": "Planet",
    "typeLabel": "Planet",
    "objectLabel": "Q132859575"
  },
  {
    "object": "http://www.wikidata.org/entity/Q132859630",
    "type": "Planet",
    "typeLabel": "Planet",
    "objectLabel": "Q132859630"
  },
  {
    "object": "http://www.wikidata.org/entity/Q136703964",
    "type": "Planet",
    "typeLabel": "Planet",
    "objectLabel": "TOI-4507 b"
  },
  {
    "object": "http://www.wikidata.org/entity/Q525",
    "type": "Stern",
    "typeLabel": "Stern",
    "objectLabel": "Sun"
  },
  {
    "object": "http://www.wikidata.org/entity/Q339",
    "type": "Zwergplanet",
    "typeLabel": "Zwergplanet",
    "objectLabel": "Pluto"
  },
  {
    "object": "http://www.wikidata.org/entity/Q596",
    "type": "Zwergplanet",
    "typeLabel": "Zwergplanet",
    "objectLabel": "Ceres"
  },
  {
    "object": "http://www.wikidata.org/entity/Q601",
    "type": "Zwergplanet",
    "typeLabel": "Zwergplanet",
    "objectLabel": "(136108) Haumea"
  },
  {
    "object": "http://www.wikidata.org/entity/Q611",
    "type": "Zwergplanet",
    "typeLabel": "Zwergplanet",
    "objectLabel": "Eris"
  },
  {
    "object": "http://www.wikidata.org/entity/Q6587",
    "type": "Zwergplanet",
    "typeLabel": "Zwergplanet",
    "objectLabel": "225088 Gonggong"
  },
  {
    "object": "http://www.wikidata.org/entity/Q15586",
    "type": "Zwergplanet",
    "typeLabel": "Zwergplanet",
    "objectLabel": "Quaoar"
  },
  {
    "object": "http://www.wikidata.org/entity/Q15603",
    "type": "Zwergplanet",
    "typeLabel": "Zwergplanet",
    "objectLabel": "Orcus"
  },
  {
    "object": "http://www.wikidata.org/entity/Q15610",
    "type": "Zwergplanet",
    "typeLabel": "Zwergplanet",
    "objectLabel": "Sedna"
  },
  {
    "object": "http://www.wikidata.org/entity/Q136964",
    "type": "Zwergplanet",
    "typeLabel": "Zwergplanet",
    "objectLabel": "(120347) Salacia"
  },
  {
    "object": "http://www.wikidata.org/entity/Q6604",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "Charon",
    "parent": "http://www.wikidata.org/entity/Q339",
    "parentLabel": "Pluto"
  },
  {
    "object": "http://www.wikidata.org/entity/Q102694",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "Nix",
    "parent": "http://www.wikidata.org/entity/Q339",
    "parentLabel": "Pluto"
  },
  {
    "object": "http://www.wikidata.org/entity/Q102701",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "Hydra",
    "parent": "http://www.wikidata.org/entity/Q339",
    "parentLabel": "Pluto"
  },
  {
    "object": "http://www.wikidata.org/entity/Q105636",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "Kerberos",
    "parent": "http://www.wikidata.org/entity/Q339",
    "parentLabel": "Pluto"
  },
  {
    "object": "http://www.wikidata.org/entity/Q105713",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "Styx",
    "parent": "http://www.wikidata.org/entity/Q339",
    "parentLabel": "Pluto"
  },
  {
    "object": "http://www.wikidata.org/entity/Q184246",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "moon of Pluto",
    "parent": "http://www.wikidata.org/entity/Q339",
    "parentLabel": "Pluto"
  },
  {
    "object": "http://www.wikidata.org/entity/Q3884961",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "hadeocentric orbit",
    "parent": "http://www.wikidata.org/entity/Q339",
    "parentLabel": "Pluto"
  },
  {
    "object": "http://www.wikidata.org/entity/Q3884962",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "hadeosynchronous orbit",
    "parent": "http://www.wikidata.org/entity/Q339",
    "parentLabel": "Pluto"
  },
  {
    "object": "http://www.wikidata.org/entity/Q3884963",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "hadeostationary orbit",
    "parent": "http://www.wikidata.org/entity/Q339",
    "parentLabel": "Pluto"
  },
  {
    "object": "http://www.wikidata.org/entity/Q16664937",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "rings of Pluto",
    "parent": "http://www.wikidata.org/entity/Q339",
    "parentLabel": "Pluto"
  },
  {
    "object": "http://www.wikidata.org/entity/Q141799",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "Hiʻiaka",
    "parent": "http://www.wikidata.org/entity/Q601",
    "parentLabel": "(136108) Haumea"
  },
  {
    "object": "http://www.wikidata.org/entity/Q153893",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "Namaka",
    "parent": "http://www.wikidata.org/entity/Q601",
    "parentLabel": "(136108) Haumea"
  },
  {
    "object": "http://www.wikidata.org/entity/Q848950",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "moon of Haumea",
    "parent": "http://www.wikidata.org/entity/Q601",
    "parentLabel": "(136108) Haumea"
  },
  {
    "object": "http://www.wikidata.org/entity/Q109358428",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "ring of Haumea",
    "parent": "http://www.wikidata.org/entity/Q601",
    "parentLabel": "(136108) Haumea"
  },
  {
    "object": "http://www.wikidata.org/entity/Q102656",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "Dysnomia",
    "parent": "http://www.wikidata.org/entity/Q611",
    "parentLabel": "Eris"
  },
  {
    "object": "http://www.wikidata.org/entity/Q27496473",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "Xiangliu",
    "parent": "http://www.wikidata.org/entity/Q6587",
    "parentLabel": "225088 Gonggong"
  },
  {
    "object": "http://www.wikidata.org/entity/Q83894",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "Weywot",
    "parent": "http://www.wikidata.org/entity/Q15586",
    "parentLabel": "Quaoar"
  },
  {
    "object": "http://www.wikidata.org/entity/Q117066228",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "rings of 50000 Quaoar",
    "parent": "http://www.wikidata.org/entity/Q15586",
    "parentLabel": "Quaoar"
  },
  {
    "object": "http://www.wikidata.org/entity/Q603083",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "Vanth",
    "parent": "http://www.wikidata.org/entity/Q15603",
    "parentLabel": "Orcus"
  },
  {
    "object": "http://www.wikidata.org/entity/Q343201",
    "type": "Mond",
    "typeLabel": "Mond",
    "objectLabel": "Actaea",
    "parent": "http://www.wikidata.org/entity/Q136964",
    "parentLabel": "(120347) Salacia"
  }
]