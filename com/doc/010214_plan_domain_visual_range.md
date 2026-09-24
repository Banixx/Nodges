# Umsetzungsplan: Automatisches Domain-Matching & Stabile Visual Range

Dieser Plan beschreibt die Anpassungen im `MappingUI` und `VisualMappingEngine`, um die `domain` (Domain Min/Max) automatisch an die tatsaechlichen Datenwerte anzupassen und die `visual range` (Visual Range Min/Max) standardmaessig auf die maximale raeumliche Ausdehnung beim Laden zu setzen, damit sich die Dimensionen bei Neupositionierungen im Mapping nicht veraendern.

## 1. Problemstellung & Zielsetzung
- **Domain-Anpassung:** Bisher fiel die `domain` bei nicht explizit definierten Attributen oft auf Platzhalter wie `[0, 1]` zurück. Kuenftig soll die `domain` automatisch exakt auf den minimalen und maximalen Wert der in den Daten vorhandenen Eigenschaft gelegt werden (`getAttributeDataBounds`).
- **Visual Range & Neupositionierung:** Bei der Neupositionierung oder Zuweisung von Positionseigenschaften wurden bisher starre Standardwerte (wie `[-100, 100]`) gesetzt, was zu ungewollten Skalierungssprüngen der 3D-Graphdimensionen fuehrte. Kuenftig wird die `visual range` fuer Positionen standardmaessig aus der maximalen raeumlichen Ausdehnung aller geladenen Knoten ermittelt und bei Neupositionierung stabil gehalten.

## 2. Benutzer-Review / Entscheidungen
> [!NOTE]
> Die `domain` wird dynamisch aus den Daten-Minimal- und Maximalwerten ermittelt. Fuer die `visual range` von Positionseigenschaften wird beim Laden der Daten die raeumliche Bounding-Box (minimale und maximale Ausdehnung der Knotenpositionen) berechnet und als Standardbereich verankert.

## 3. Geplante Aenderungen

### [Component: UI Mapping & Visual Mapping Engine]

#### [MODIFY] [MappingUI.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/MappingUI.ts)
- **Knotenausdehnung ermitteln:** Beim Empfang/Update von Knoten (`setMappings` / `render`) eine Methode `getMaxSpatialExtent()` implementieren, die die minimale und maximale Ausdehnung `[minPos, maxPos]` (oder pro Achse `[minX, maxX]`, etc.) aller geladenen Knoten ermittelt.
- **Automatische Domain-Zuordnung:**
  - In `renderRightColumn()` und `updatePropertyMapping()` bei Fehlen von `mapping.domain` nicht mehr auf `[0, 1]` zurueckfallen, sondern direkt `this.getAttributeDataBounds(sourceAttr)` als Standard-Domain verwenden.
  - Wenn ein Attribut neu per Drag & Drop oder Auswahlliste zugewiesen wird, die `domain` automatisch auf die vorhandenen Min/Max-Werte der Daten setzen.
- **Stabile Visual Range bei Neupositionierung:**
  - Fuer Positionseigenschaften (`position`, `positionX`, `positionY`, `positionZ`) als Standard-`range` die beim Laden gemessene maximale Ausdehnung `getMaxSpatialExtent()` verwenden anstelle von `[-100, 100]`.
  - Bei Neupositionierung (Erneuern des Mappings) den bestehenden `range`-Wert oder die beim Laden fixierte maximale Ausdehnung beibehalten, damit sich die räumliche Dimension des Graphen nicht verändert.

#### [MODIFY] [VisualMappingEngine.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/VisualMappingEngine.ts)
- Sicherstellen, dass bei der Skalierung von Positionen in `applyMapping` die Domain- und Range-Transformationen sauber auf den `[minSpatial, maxSpatial]`-Bereich angewendet werden, ohne unerwünschte Unter- oder Ueberschreitungen.

## 4. Verifikationsplan

### Manuelle Verifikation
1. **Laden von Testdaten:** Nodges starten und einen Datensatz (z.B. Testgraphen) laden.
2. **Domain-Ueberpruefung:** Im Mapping-Panel ein Attribut auswaehlen und pruefen, ob `DOMAIN` automatisch die exakten Min/Max-Werte der Daten anzeigt (z.B. Min 0, Max 5 bei ENTITY_TYPE bzw. numerischen Feldern).
3. **Visual Range & Neupositionierung:** Ein Attribut neu auf eine Positionsachse ziehen/mappen. Verifizieren, dass `VISUAL RANGE` der maximalen Ausdehnung beim Laden entspricht und sich die raeumliche Dimension des Graphen in der 3D-Ansicht nicht verändert.
