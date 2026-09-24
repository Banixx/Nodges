# Implementierungsplan: Topologie-basierte Gruppen-Erkennung & Dedicated Mapping-Kacheln

## Uebersicht

Das Ziel ist die **automatische Erkennung von Gruppen aus der Graphentopologie**:
Wenn Entitaeten wie der `Bundesrat` eingehende Kanten (Inbound Edges, z. B. 7 Mitglieder mit Relation `member_of` oder `part_of`) besitzen, wird der Zielknoten (`Bundesrat`) automatisch als **Gruppe / Container** klassifiziert.

Diese dynamisch erkannten Gruppen erscheinen anschliessend im Mapping Panel als eigenstaendige Gruppen-Kacheln (z. B. `❖ Bundesrat (7 Mitglieder)`), die vom Benutzer direkt fuer visuelle Mappings und Clusterungen auswaehlbar sind.

## Geplante Aenderungen

### Skripte & Datenverarbeitung
- **[postprocess_b12_groups.cjs](file:///c:/Users/ich/Desktop/code/_projects/Nodges/scripts/postprocess_b12_groups.cjs):**
  - Zaehlen aller Inbound-Kanten fuer jeden Zielknoten (`target`).
  - Kennzeichnen von Gruppen-Header-Knoten (`Bundesrat` mit 7 Mitgliedern).

### UI Components
- **[MappingUI.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/MappingUI.ts):**
  - Darstellung erkannten Gruppen im Attribut-Baum als violette Gruppen-Kacheln (`❖ Bundesrat (7)`).
  - Verknuepfung mit visuellen Eigenschaftskanaelen.

## Verifikationsplan
- `node scripts/postprocess_b12_groups.cjs`
- `npm run build`
- Manuelle Ueberpruefung im 3D-Graph.
