# Konzept: Gruppenfunktion und verschachtelte Nodes (Compound Nodes)

## 1. Ausgangslage und Zielsetzung
In komplexen Datenstrukturen (z.B. politischen Systemen wie dem "Bundesrat") treten Entitäten auf, die gleichzeitig eine Gruppe von Sub-Entitäten (die 7 Bundesräte) darstellen, aber auch als eigenständiger Akteur agieren (der Bundesrat macht eine Aussage).

**Anforderungen:**
- **Hierarchische Visualisierung:** Eine Parent-Node soll Child-Nodes visuell in sich einschliessen.
- **Duale Verbindungen:** Sowohl die Parent-Node als Ganzes als auch die einzelnen Child-Nodes können eigene, direkte Verbindungen (Edges) zu anderen Nodes im Netzwerk haben.
- **Flaches Datenmodell:** Auf JSON-Ebene soll auf eine harte Verschachtelung (Nested Objects) verzichtet werden, um die Parsing-Logik und das Schema einfach und konsistent zu halten.

## 2. Architektur-Ansatz: "Subscriber / Relationales Modell"
Anstatt die Hierarchie im JSON-Baum abzubilden, behalten wir eine **flache Knotenstruktur** bei. Jede Entität (sowohl der Bundesrat als auch der einzelne Politiker) ist eine reguläre Node.

Die Gruppierung wird semantisch über **Beziehungen (Edges)** gelöst:
- Es wird ein definierter Edge-Typ für Zugehörigkeiten eingeführt (z.B. `type: "BELONGS_TO"`, `MEMBER_OF` oder `CONTAINS`).
- **Beispiel:**
  - Node A: "Bundesrat" (Typ: Institution/Gruppe)
  - Node B: "Politiker X" (Typ: Person)
  - Edge: Von Node B zu Node A mit Relation "BELONGS_TO".

Die Logik in Nodges agiert dann als "Subscriber-Modell": Die Graph-Engine abonniert sich auf diese speziellen Zugehörigkeits-Edges und behandelt die beteiligten Nodes nicht mehr als gleichwertige Nachbarn, sondern als Parent-Child-Gefüge.

## 3. Visuelle Umsetzung in der 3D-Engine
Um das Ineinandergreifen visuell darzustellen (Metanodes / Compound Nodes), sind Anpassungen im Rendering und in der Physik nötig:

### A. Rendering (Container-Darstellung)
- **Parent-Node als Hülle:** Wird erkannt, dass eine Node Child-Nodes besitzt, wird sie nicht mehr als Standard-Punkt gerendert, sondern als transparente umschliessende Form (z.B. eine grössere Sphäre, ein Zylinder oder eine konvexe Hülle/Bounding Box).
- **Visuelle Hierarchie:** Die Child-Nodes werden innerhalb dieser Hülle gerendert. 
- **Edges:** Kanten, die der Parent-Node gehören, docken an der äusseren Hülle an. Kanten der Child-Nodes verlaufen von den inneren Punkten durch die Hülle nach aussen.

### B. Physik und Positionierung (Force Layout)
Die Physik-Engine muss die Zugehörigkeit verstehen:
- Anstatt die Child-Nodes frei im Raum schweben zu lassen, erhalten sie ein starkes Anziehungs-Constraint zur Parent-Node (oder werden auf lokale Koordinaten relativ zur Parent-Node umgerechnet).
- Die Parent-Node stösst andere Parent-Nodes ab, zieht aber ihre eigenen Children stark an und schränkt deren Bewegungsradius auf ihre "Hülle" ein.

## 4. Interaktion und Benutzererlebnis (UX)
Dieses Modell ermöglicht erweiterte Interaktionen, die für die Übersichtlichkeit bei grossen Graphen entscheidend sind:

- **Expand / Collapse (Auf- und Zuklappen):** Der Nutzer kann auf die Hülle der Parent-Node (z.B. Bundesrat) klicken. Die Gruppe klappt zu, die Child-Nodes (die 7 Bundesräte) werden ausgeblendet, und alle Kanten von/zu den Child-Nodes werden temporär auf die Parent-Node aggregiert oder ausgeblendet.
- **Level of Detail (LOD):** Wenn der Nutzer weit herauszoomt, klappen sich Gruppen automatisch zusammen (Performance-Optimierung und weniger optisches Rauschen).
- **Mapping UI:** Im Mapping-Panel kann der Nutzer festlegen, welches Edge-Attribut (z.B. "relation_type") die Gruppierungsfunktion auslösen soll.

## 5. Fazit und nächste Schritte
Der vorgeschlagene relationale Ansatz (flaches JSON + semantische Edges) ist robust, flexibel und entspricht gängigen Graph-Datenbank-Architekturen. Er erfordert keine Änderung am bestehenden Build-4 JSON-Schema, sondern primär Erweiterungen in der `NodeManager`-Renderlogik und der Physik-Berechnung (`GraphPhysics`).
