# Goal Description
Zusammenfassung der Idee (aus Workflow `@[/idee]`) und Implementierungsplan für die Einführung echter Entitäts-Gruppen (Clouds) als Ersatz für das statische Ebenen-System (Layers).

Die Idee umfasst:
1. **Entfernung der "Ebenen" (Layers)** aus der gesamten Codebasis.
2. **Gruppen als echte Entitäten**: Eine Gruppe ist nun ein regulärer Knoten im System (mit ID und Typ).
3. **Neue Geometrie "Cloud"**: Gruppen werden visuell durch eine umspannende "Cloud" dargestellt, welche räumlich alle Mitglieder umschliesst.
4. **Dynamische Transparenz**: Die Cloud ist aus der Ferne intransparent und wird beim Heranzoomen bis zu 10% transparent.
5. **Beziehungsmodell (Edges)**: Die Gruppenzugehörigkeit wird als reguläre Kante (Edge) abgebildet, was m:n-Beziehungen und verschachtelte Gruppen (Gruppen in Gruppen) auf natürliche Weise ermöglicht.
6. **Interaktion (Fokus-Modus)**: Ein Klick auf die Cloud fokussiert die Gruppe und blendet den Rest des Graphen aus (Transparenz, s/w oder Ausblenden).
7. **Philosophie**: Dichte Cluster (Knäuel) sind semantisch korrekt. Das Auflösen erfolgt durch User-Interaktion (Fokus auf Cloud) anstatt durch verfälschende Repulsion-Werte.

## User Review Required
Bestätigung der Idee gemäss Workflow `@[/idee]`: Bitte bestätige diesen Plan. Wenn du zustimmst, werde ich die Idee in `doc/idee_nodges.md` eintragen und im Anschluss die Umsetzung (Entfernung der Ebenen und Einbau der Cloud-Logik) starten.

## Proposed Changes

### 1. Entfernung des Layer-Systems (Ebenen)
- **[MODIFY] src/core/state/StateTypes.ts**: Entfernen aller State-Variablen zu Layern (`layeringAttribute`, `layer1Value`, `layer1Visible`, `layer1Opacity`, etc.).
- **[MODIFY] src/core/StateManager.ts**: Entfernen der Logik zur Initialisierung und Verwaltung der Layer-States.
- **[MODIFY] src/core/NodeManager.ts & EdgeObjectsManager.ts**: Entfernen der Sichtbarkeits- und Opazitäts-Logik, die auf Layern basierte.
- **[DELETE] src/ui/LayersPanel.ts**: Die UI-Komponente für Ebenen wird komplett gelöscht.
- **[MODIFY] src/core/UIManager.ts**: Entfernen des `LayersPanel` aus der Registrierung.

### 2. Gruppen-Entitäten und Beziehungslogik (m:n)
- Die Struktur von Nodges unterstützt bereits Entitäten und Beziehungen. Eine Gruppenzugehörigkeit wird als Kante modelliert (z.B. Kante mit Typ "part_of" oder "member").
- In der `VisualMappingEngine.ts` wird die Logik so angepasst, dass Knoten mit einem bestimmten Typ (z.B. `geometry: "cloud"`) gesondert behandelt werden.

### 3. Neue Geometrie: "Cloud" (`CloudManager.ts` oder Erweiterung `NodeManager.ts`)
- **[MODIFY] src/core/NodeManager.ts**: 
  - Erkennung von `geometry === 'cloud'`.
  - Berechnung der Bounding Box der verbundenen Kind-Knoten (über die Edges).
  - Rendern eines leicht größeren Hüllkörpers (z.B. aufgeweichte Kugel oder Convex Hull) um die Kinder.
- **[MODIFY] src/core/CameraManager.ts & NodeManager.ts**:
  - Dynamische Transparenzberechnung basierend auf der Kamera-Distanz zur Cloud. Aus der Ferne Opazität ~100%, aus der Nähe ~10%.

### 4. Interaktion: Fokus-Modus
- **[MODIFY] src/core/InteractionManager.ts** & **src/core/CentralEventManager.ts**:
  - Erkennung von Klicks auf eine "Cloud".
  - Auslösen eines "Focus"-Events.
- **[MODIFY] src/core/NodeManager.ts** & **EdgeObjectsManager.ts**:
  - Wenn eine Cloud fokussiert ist, werden alle nicht-dazugehörigen Knoten und Kanten transparent (Opacity 10%) oder entsättigt (s/w).

## Verification Plan
### Automated Tests
- Testen der Zod-Schemas auf Edge-Strukturen ohne Layer.
- Unit-Tests im StateManager nach Entfernung der Layer-Eigenschaften.
### Manual Verification
- Laden eines Graphen mit Cloud-Geometrie und Gruppenzugehörigkeiten.
- Überprüfen der dynamischen Transparenz beim Heranzoomen.
- Klick auf die Cloud testen (Ausblenden des Rests).
