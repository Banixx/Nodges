# Aktuelle Methodiken zur LLM-basierten Generierung von Nodges-JSON (Build 4)

Die aktuelle Methodik, um ein Thema mittels eines LLM in ein Nodges-JSON zu überführen, basiert auf dem **Build 4 Schema** (`schemaVersion: "4.0"`). Dieses Schema erweitert die Datenstruktur primär um zeitliche (Temporal) und geografische (Geospatial) Dimensionen. Die Methodik zeichnet sich durch einen stark strukturierten, ontologiegetriebenen Ansatz aus, um komplexe 3D/4D-Netzwerke zu erschaffen.

Hier sind die zentralen Prinzipien und Methodiken, abgeleitet aus den aktuellen Prompts und Spezifikationen (`/public` und `/public/prompts`):

## 1. Multi-Step Pipeline (Ontologie vor Daten)
Um Halluzinationen und unsaubere Datenstrukturen zu vermeiden, wird die Generierung in zwei Phasen unterteilt:
*   **Schritt 1: Ontologie-Entwurf (`ontology_prompt.md`):** Das LLM wird angewiesen, **ausschließlich** das Datenmodell (`dataModel`) und die visuellen Zuweisungen (`visualMappings`) zu erstellen. Die `data`-Arrays bleiben zwingend leer. Das LLM definiert hier die semantischen Klassen (z. B. Institution, Person), deren Eigenschaften (kategorisch, kontinuierlich) und wie diese Eigenschaften visuell repräsentiert werden sollen.
*   **Schritt 2: Daten-Generierung (`build_4_prompt.md` / `build_4_few_shot.md`):** Erst im zweiten Schritt füllt das LLM die definierten Strukturen mit konkreten Entitäten und Beziehungen (`entities` und `relationships`).

## 2. Flache Datenstruktur und Semantische Kanten
Es wird eine strikt flache Hierarchie erzwungen.
*   Verschachtelte JSON-Objekte zur Darstellung von Zugehörigkeiten sind streng verboten.
*   Jegliche Hierarchie oder Zugehörigkeit (z. B. eine Person ist Teil einer Partei) muss zwingend über semantische Beziehungen (Edges, z. B. `BELONGS_TO`, `PART_OF`) modelliert werden.
*   Attribute werden nicht blind vererbt. Entitäten erhalten nur Eigenschaften, die für ihren spezifischen Typ (Type) logisch relevant sind.

## 3. Dynamisches Visual Mapping
Das LLM nutzt die `visualMappings`, um das Netzwerk visuell "sprechend" zu machen:
*   **Color (Kategorisch):** Dient zur sofortigen Erkennung von Typen oder zentralen kategorischen Eigenschaften (z. B. Fraktionszugehörigkeit).
*   **Size (Kontinuierlich):** Nutzt numerische Werte (z. B. Macht, Budget, Alter) für die Skalierung der Knoten, um Gewichtungen darzustellen.
*   **Geometry:** Unterschiedliche geometrische Formen (z. B. `sphere`, `box`) unterscheiden Entitätsklassen visuell auf den ersten Blick.

## 4. Zeitliche Dynamik (Temporal - 4D)
Das Build 4 Schema ermöglicht das Erzählen einer chronologischen Geschichte:
*   **Lebenszyklus (`validFrom` / `validTo`):** Entitäten und Beziehungen entstehen zu einem bestimmten Zeitpunkt und können vergehen. Ist `validTo: null`, existieren sie bis in die Gegenwart weiter.
*   **Keyframe-Animationen (`history`):** Entitäten können ein `history`-Array besitzen. Dieses enthält Keyframes mit Zeitstempeln (`timestamp`) und punktgenauen Änderungen (`changes`) an Attributen wie Größe, Farbe oder 3D-Position. Das LLM darf in den `changes` nur die exakten Deltas eintragen.

## 5. Raum und Geografie (Geospatial & 3D)
Das LLM verortet die Daten intelligent im Raum:
*   **Geospatial (Karte):** Wenn geografischer Kontext vorhanden ist, definiert das LLM eine Hintergrundkarte (`metadata.map`) und setzt fixe `mapX`- und `mapY`-Koordinaten für die Entitäten.
*   **3D-Raum (`position`):** Ohne Karte wird der 3D-Raum semantisch genutzt. Das LLM verwendet die X/Y/Z-Achsen strategisch, beispielsweise die Y-Achse für Hierarchie oder Macht und die X/Z-Achsen für thematische Cluster.

## 6. Alias-Unterstützung
Für mehr Flexibilität in der LLM-Generierung versteht das Schema ab Build 4 bei Beziehungen (`relationships`) `start` und `end` als vollwertigen Alias für `source` und `target`.

## Zusammenfassung
Die LLM-Methodik für Nodges erfordert vom Sprachmodell nicht nur Datenextraktion, sondern echte **Datenarchitektur**. Das LLM agiert als Ontologe, der zuerst ein tiefgreifendes, visuell verknüpftes Schema entwirft und dieses dann mit zeitlich dynamischen und räumlich verorteten Datenpunkten anreichert.
