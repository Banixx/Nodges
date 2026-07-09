# Refactoring-Plan: Entfernung der Legacy-Datenquellen (nodeObjects / edgeObjects)

## Zielsetzung
Das Projekt leidet derzeit unter einer Dualität der Datenquellen: Die `LayoutGUI` verwendet teilweise noch die Legacy-Arrays `nodeObjects` und `edgeObjects` (die direkt 3D-Objekte enthalten), anstatt ausschließlich mit den Daten aus dem modernen `StateManager` (Single Source of Truth) zu arbeiten. Dies führt zu inkonsistenten Positionen, Fehleranfälligkeit und Redundanzen im Code.
Ziel ist es, den Datenfluss strikt unidirektional zu gestalten: **StateManager -> Layout-Berechnung -> StateManager -> Rendering**.

## Schritte zur Umsetzung

### 1. `App.ts` bereinigen (Entfernung der Arrays)
*   **Löschen der Deklarationen:** Die öffentlichen Properties `public nodeObjects: NodeObject[] = [];` und `public edgeObjects: any[] = [];` müssen komplett aus der Klasse `App` entfernt werden.
*   **Löschen der Zuweisungen:** In Funktionen wie `clearScene()` die leeren Zuweisungen (`this.nodeObjects = [];`) entfernen.

### 2. `LayoutGUI.ts` umschreiben (Fokus auf StateManager)
*   **Datenabruf:** In der Methode `applyCurrentLayout()` anstatt auf `this.app.nodeObjects` zuzugreifen, direkt die Nodes und Edges aus `this.app.currentEntities` und `this.app.currentRelationships` (bzw. direkt aus dem `StateManager`) laden.
*   **Status-Updates:** Nach der Ausführung von `layoutManager.applyLayout(...)` liefert der Algorithmus neue Positionen. Diese müssen als reines Daten-Update an den `StateManager` übergeben werden (z. B. via `stateManager.setGraphData()` oder einer spezifischeren Update-Funktion).
*   **Entfernen von Three.js-Zugriffen:** Die Methoden `updateNodePositions()` und `updateEdgePositions()` in `LayoutGUI.ts` verändern direkt Three.js Meshes (z. B. `nodeObj.mesh.position.set(...)`). Diese Logik bricht das MVC-Muster und muss aus der GUI-Klasse entfernt werden.

### 3. Rendering-Verantwortung an Manager delegieren (`NodeManager` / `EdgeObjectsManager`)
*   **Reaktivität sichern:** Wenn der `LayoutGUI` den State ändert, feuert der `StateManager` ein Event. `NodeManager` und `EdgeObjectsManager` müssen auf dieses Update reagieren und die Positionen der existierenden `THREE.Mesh` und `THREE.Line`-Objekte aktualisieren.
*   *Bereits teilweise vorhanden:* `App.ts` hat eine `updateNodePositions`-Funktion, welche `nodeManager.updateNodePositions` und `edgeObjectsManager.updateEdgePositions` aufruft. Diese Logik kann über State-Subscriptions automatisiert werden oder sauber von außen aufgerufen werden, ohne Legacy-Objekte zu durchlaufen.

### 4. Weitere Legacy-Verwendungen auflösen
Andere Klassen wie `RaycastManager`, `HighlightManager`, `UIManager` und `CentralEventManager` könnten noch auf `app.nodeObjects` angewiesen sein. 
*   Anstatt `app.nodeObjects` zu durchsuchen, sollten sie die `THREE.Mesh`-Referenzen direkt aus dem `NodeManager` (z.B. über eine `getMesh(id)` Funktion) holen oder ihre Hit-Detection / UI-Listen rein auf den `StateManager`-Daten basieren.

### 5. Aufräumen und Typ-Sicherheit
*   Typisierung `NodeObject` (Legacy) überprüfen und wo möglich durch `EntityData` (bzw. das interne Rendering-Mapping) ersetzen.
*   TypeScript-Fehler beheben, die nach dem Entfernen von `nodeObjects` und `edgeObjects` in der IDE aufpoppen.

---
**Vorteile nach diesem Refactoring:**
* Keine desynchronisierten 3D-Positionen mehr.
* Deutlich sauberere Trennung von UI (`LayoutGUI`), Logik (`LayoutManager`) und Rendering (`NodeManager`).
* Weniger Speicherverbrauch, da redundante Arrays verschwinden.
