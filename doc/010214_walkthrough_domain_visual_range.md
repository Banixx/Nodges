# Walkthrough: Automatisches Domain-Matching & Stabile Visual Range

Die Anpassungen fuer das automatische Match der `domain` (Min/Max aus den Datenwerten) sowie fuer die raeumlich festgelegte `visual range` (Ausdehnung der Knoten beim Laden) wurden erfolgreich in Nodges umgesetzt.

## Durchgefuehrte Aenderungen

### 1. [MappingUI.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/MappingUI.ts)
- **`getMaxSpatialExtent()`:** Neue Hilfsmethode implementiert, welche beim Laden/Empfangen von Knoten die minimale und maximale raeumliche Ausdehnung `[minPos, maxPos]` der 3D-Knotenpositionen im Datensatz misst.
- **Automatische Domain-Ermittlung:**
  - Sowohl bei der Initialisierung als auch in der UI-Anzeige (`renderRightColumn`) wird `defaultDomain` nun direkt ueber `this.getAttributeDataBounds(sourceAttrKey)` berechnet.
  - Wenn ein Attribut neu zugewiesen oder per Drag & Drop gedroppt wird, wird `domain` auf die exakten Minimal- und Maximalwerte der Daten gelegt (`getAttributeDataBounds`).
- **Stabile Visual Range bei Neupositionierung:**
  - Fuer Positionsmappings (`position`, `positionX`, `positionY`, `positionZ`) wird die `defaultRange` jetzt aus `getMaxSpatialExtent()` ermittelt (anstelle des alten Pauschalwerts `[-100, 100]`).
  - Beim Neupositionieren oder Re-Mapping im UI bleibt dieser gemessene Ausdehnungsbereich erhalten, wodurch die raeumliche Dimension des Graphen in der 3D-Ansicht unverfaelscht stabil bleibt.

## Testergebnisse & Validierung
- **Unit Tests:** `npx vitest run src/tests/VisualMappingEngine.test.ts` erfolgreich bestanden (12/12 Tests passed).
