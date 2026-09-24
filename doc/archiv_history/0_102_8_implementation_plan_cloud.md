# Architektur-Plan: Ontologie und Visualisierung von Gruppen (Clouds)

Dieser Plan fokussiert sich primär darauf, wie Gruppen (Clouds) programmatisch im JSON abgebildet werden (Ontologie) und wie die Nodges-Engine diese Daten neutral visualisiert, ohne sich in algorithmische Sonderfälle (wie feste Physics-Regeln) zu verstricken.

## 1. Die Ontologie: Wie die Cloud ins JSON einzieht

Die Gruppe wird strikt als Datenstruktur im Graph abgebildet, ohne künstliche Engine-Hacks vorauszusetzen.

- **Die Cloud als Entität:** 
  Das LLM generiert für jede Gruppe einen eigenständigen Knoten in der `entities`-Liste (z. B. `type: "cloud"` oder `type: "group"`). Dadurch kann die Gruppe eigene Metadaten, Beschreibungen und Werte besitzen.
- **Die Mitgliedschaft als Kante:** 
  Zugehörigkeiten werden als Edges in der `relationships`-Liste definiert (z. B. `source: "Node_A", target: "Cloud_1", type: "belongs_to"`).
- **Datengetriebene Dynamik (Die Antwort auf Repulsion):**
  Es werden **keine künstlichen Abstoßungskräfte** in die Nodges-Engine hart einprogrammiert. Die Engine verarbeitet Repulsion rein datengetrieben über die Attribute der generierten Kanten.

## 2. Die Visualisierung: Dynamischer Schwerpunkt

In der Visualisierung (Rendering) darf die Cloud nicht starr an einer Koordinate "kleben", insbesondere dann nicht, wenn ihre Mitglieder durch andere Mappings oder Algorithmen im Raum wandern.

- **Berechnung in Echtzeit:** 
  Als eine **Visualisierungs-Option** in der 3D-Welt wird die Position der Cloud (ihre Hülle/Bounding-Box) nicht aus einer festen `entity.position` ausgelesen. Stattdessen ermittelt der `NodeManager` in der Render-Schleife (oder bei Updates) die geometrische Mitte (den Schwerpunkt) all ihrer verknüpften Mitglieder.
- **Vorteil:** 
  Die Cloud-Hülle spannt sich so immer exakt dort auf, wo sich ihre Mitglieder aktuell befinden – völlig unabhängig davon, ob das Force-Directed-Layout, explizite LLM-Koordinaten oder ein Zeitstrahl die Mitglieder gerade bewegt.

## Ausführungsplan (Execution)

### [MODIFY] src/core/NodeManager.ts
- Anpassung der Mesh-Generierung für Clouds: Die Wolke erhält ein transluzentes Material und eine Sphären-Geometrie.
- Implementierung der Methode `updateCloudPositions(relationships: RelationshipData[], allEntities: EntityData[])`, welche für jede Cloud den Schwerpunkt ihrer Kinder (via Edges) berechnet und die Hülle dort positioniert und dynamisch skaliert.

### [MODIFY] src/App.ts
- Einbindung der `updateCloudPositions`-Methode in den Visualisierungs-Flow (Render-Loop), um die dynamische Hüllen-Nachführung zu aktivieren.
