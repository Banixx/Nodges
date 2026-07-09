# Plan zur Überarbeitung von `mythology.json`

Basierend auf den aktuellen Entwicklungen (Build 4 Schema und Multi-Perspective Prompting) schlage ich folgende Überarbeitungen für die Datei `public/data/mythology.json` vor:

## 1. Anpassung an das Build 4 Schema
*   **Hierarchische und Semantische Tiefe:** Einführung von expliziten Typisierungen für Entitäten, um flache Strukturen zu vermeiden (z.B. Unterscheidung zwischen `Primordial`, `Titan`, `Olympian` anstatt nur "Generation").
*   **Temporale/Geospatiale Metadaten:** Hinzufügen von (mythologischen) Zeitaltern oder Epochen, in denen die Entitäten primär gewirkt haben.
*   **Korrektur von Datentypen:** Das Attribut `Generation` ist aktuell als `continuous` definiert, fungiert aber faktisch als `categorical` (1, 2, 3). Dies wird im Datenmodell korrigiert.

## 2. Erweiterung der Visual Mappings
*   **Animations-Modi:** Integration von spezifischen Edge-Animationsmodi (z.B. Pulse, Flow), um Beziehungen wie `ParentOf` oder `MarriedTo` dynamischer darzustellen, falls dies vom aktuellen Mapping UI unterstützt wird.
*   **Visuelle Hierarchien:** Anpassung von Größe (`size`) und Position (`position`), um die Machtverhältnisse (`Power`) und Hierarchien noch präziser abzubilden (z.B. Hervorhebung der Hauptgötter).

## 3. Datenanreicherung (Multi-Perspective)
*   **Facetten-Modellierung:** Jeder Gott erhält nicht nur eine "Domäne", sondern wird aus mehreren Perspektiven beleuchtet (z.B. Rolle, Fraktion, Prinzip vs. Person).
*   **Zusätzliche Entitäten:** Ergänzung fehlender, wichtiger Verbindungen oder Entitäten, um das Netzwerk interessanter zu gestalten (z.B. Einbezug von spezifischen Abstammungslinien).

---
**Nächste Schritte:** 
Bitte gib mir kurz Bescheid, ob du den Fokus auf die **technische Schema-Aktualisierung (Build 4)**, die **visuellen Mappings** oder die **inhaltliche Erweiterung** legen möchtest, damit ich die `mythology.json` entsprechend anpassen kann.
