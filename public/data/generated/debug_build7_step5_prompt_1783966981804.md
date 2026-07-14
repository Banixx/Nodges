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
    "orbitedBody": "http://www.wikidata.org/entity/Q194",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "rings of Saturn"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q2565",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Titan"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q3303",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Enceladus"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q15034",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Mimas"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q15037",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Hyperion"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q15040",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Dione"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q15047",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Tethys"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q15050",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Rhea"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17705",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Pan"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17706",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Daphnis"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17707",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Atlas"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17739",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Prometheus"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17746",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Pandora"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17751",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Epimetheus"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17754",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Janus"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17762",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Aegaeon"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17782",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Methone"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17788",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Anthe"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17850",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Pallene"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17857",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Telesto"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17869",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Calypso"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17875",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Helene"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17882",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Polydeuces"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17958",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Iapetus"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17965",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Kiviuq"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17971",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Ijiraq"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17975",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Phoebe"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17979",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Paaliaq"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17982",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Skathi"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17995",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Albiorix"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q17999",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Bebhionn"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q18001",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Skoll"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q18004",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Erriapus"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q18010",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Tarqeq"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q18016",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Greip"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q18024",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Siarnaq"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q18032",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Hyrrokkin"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q18039",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Tarvos"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q18047",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "S/2004 S 13"
  },
  {
    "celestialBody": "http://www.wikidata.org/entity/Q193",
    "orbitedBody": "http://www.wikidata.org/entity/Q18178",
    "celestialBodyLabel": "Saturn",
    "orbitedBodyLabel": "Jarnsaxa"
  }
]