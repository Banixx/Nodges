# Auswertung des Generierungsergebnisses in B12 (Schweizer Politik)

## 1. Übersicht

Das Ergebnis in `public/data/b12/B12_02_Antwort_01_27.json` wurde ueber die LightRAG-Pipeline (`build12_lightrag`) mit dem Prompt zur Erfassung des Schweizer politischen Systems generiert.

## 2. Analyse der Ergebnisse

### Was geglueckt ist (Inhaltliche Erfassung)
- **Relevante Entitaeten:** Das System hat korrekte und hochwertige Entitaeten aus dem Themenbereich Schweizer Politik extrahiert (z. B. `Bundesrat`, `Nationalrat`, `Staenderat`, `Vereinigte Bundesversammlung`, `Kantonsvertretung`, `Foederalismus`, `Gewaltenteilung`).
- **Beziehungen:** Die Kanten zwischen den Entitaeten verbinden Gremien, Personen und Konzepte inhaltlich schluessig.
- **Kategorisierung:** Knoten besitzen Attributwerte wie `entity_type` (`organization`, `person`, `location`, `concept`, `event`).

### Was nicht geglueckt ist (Strukturelle Gruppenbildung)
- **Schema-Abweichung:** Der Prompt forderte eine spezifische JSON-Struktur mit einem eigenen `"groups"`-Array und Zuordnungs-IDs (`groupId`, `parentGroupId`).
- **Ursache:** Die LightRAG-Pipeline erzwingt nach der LLM-Abfrage ihr eigenes Graphen-Schema (`entities` und `relationships`). Die Prompt-Vorgabe bezueglich des benutzerdefinierten JSON-Formats wurde durch die Pipeline-Struktur ueberschrieben.
- **Folge:** Gruppen existieren im Graph nicht als eigene Container-Objekte, sondern muessen ueber das Attribut `entity_type` oder ueber relationale Kanten (z. B. `part_of`, `member_of`) dynamisch im Visualisierer (Nodges) gruppiert werden.

## 3. Fazit und Empfehlung

Fuer eine effektive Gruppenbildung in Nodges auf Basis der B12-Daten sollte eine der folgenden Optionen genutzt werden:
1. **Visualisierungs-Filterung nutzen:** Die Knoten im Graph anhand des Feldes `entity_type` automatisch in Farb- oder Raum-Cluster einteilen.
2. **Post-Processing Skript:** Ein kleines Skript schalten, das Knoten mit `entity_type: "organization"` oder Kanten mit Relation `part_of` automatisch in echte Nodges-Gruppen umwandelt.
