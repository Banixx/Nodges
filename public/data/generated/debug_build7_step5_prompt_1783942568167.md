SYSTEM:
Du erhältst Rohdaten aus einer Wikidata-Abfrage (JSON-Bindings) sowie die ursprüngliche User-Anfrage.
Deine Aufgabe ist es, diese flachen, tabellarischen Daten in das 3D-Graphenformat von Nodges umzuwandeln.

Erzeuge eine valide Nodges-Struktur mit "system", "metadata", "dataModel", "data" (entities & relationships) und "visualMappings".

STRIKTE REGELN:
1. BENENNUNG VON TYPEN: Nutze NIEMALS generische Namen wie "Type", "Category" oder "Entity" für Typen im `dataModel`! Benenne Typen immer nach ihrem echten Inhalt (z.B. "SoftwareDeveloper", "ProgrammingLanguage", "Country").
2. KNOTEN BILDEN: Jedes eigenständige Konzept aus den Wikidata-Daten wird ein Knoten (Entity). Nutze die URL oder die reine Q-ID (ohne wd: Präfix) als "id" und das Label als "label".
3. KANTEN VERKNÜPFEN (SEHR WICHTIG): Jede Kante (Relationship) in `data.relationships` MUSS einen `source` und `target` haben, der EXAKT einer existierenden `id` in `data.entities` entspricht! Wenn du für einen Knoten `id: "Q123"` vergibst, MUSS in der Kante `source: "Q123"` stehen. Ansonsten entstehen defekte Kanten ohne Enden und das Programm stürzt ab.
4. EIGENSCHAFTEN (Properties): Wenn eine Spalte nur ein reines Attribut ist (z.B. Gründungsdatum), füge es nicht als eigenen Knoten, sondern als Property zum jeweiligen Knoten hinzu und definiere es zwingend im `dataModel`.
5. VERBOTENE ATTRIBUTE: Das Attribut 'type' ist ein reserviertes Schlüsselwort für die Klasse/Kategorie des Knotens. Du darfst 'type' NIEMALS als reguläres Attribut/Property in `dataModel` oder in `data.entities` definieren! Wenn du einen Typen meinst, schreibe ihn direkt in das `type`-Feld des Knotens. Wenn es ein anderes Attribut ist, nenne es z.B. 'category', 'kind', 'country' oder 'occupation'.

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
Ursprüngliche Anfrage: USER: sonnensystem

KI: Magst du mir die Namen der konkreten Himmelskörper nennen, die du visualisieren möchtest (z.B. Sonne, Erde, Mars)?

USER: sonne, planeten, monde

USER: sonne, planeten, monde

Hier sind die abgerufenen Wikidata-Ergebnisse (JSON):
[
  {
    "body": "http://www.wikidata.org/entity/Q525",
    "type": "Sonne",
    "bodyLabel": "Sun"
  }
]