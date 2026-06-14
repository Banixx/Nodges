# Nodges Refactoring & Cleanup Plan

Nach einer Durchsicht der gesamten Codebasis zeigen sich klare Muster, bei denen das Projekt durch historisches Wachstum technische Schulden aufgebaut hat. Dieser Plan adressiert die wichtigsten Bereiche, um die Wartbarkeit, Skalierbarkeit und Architekturkonsistenz (Single Source of Truth, Dependency Injection) zu verbessern.

---

## 1. Verzeichnisstruktur & UI-Konsolidierung
Aktuell sind Benutzeroberflaechen-Klassen zwischen `src/ui/` und `src/utils/` verstreut. `utils/` sollte nur zustandslose Hilfsfunktionen (Utilities) enthalten.

**Aktionen:**
*   Verschiebe `LayoutGUI.ts` von `src/utils/` nach `src/ui/`.
*   Verschiebe `DataEditor.ts` von `src/utils/` nach `src/ui/`.
*   Verschiebe `HoverInfoPanel.ts` von `src/utils/` nach `src/ui/`.
*   Verschiebe `ContextMenu.ts` von `src/utils/` nach `src/ui/`.
*   Passe alle betroffenen Import-Pfade in `App.ts` und `UIManager.ts` an.

## 2. Abbau des App.ts Monolithen (1200+ Zeilen)
Die Datei `App.ts` fungiert aktuell als "Gott-Klasse". Sie instanziiert fast 30 verschiedene Manager (`RaycastManager`, `SelectionManager`, `ImportManager`, etc.) und haelt diese als `public` Properties.

**Aktionen:**
*   **Dependency Injection (DI) vollenden:** Der `ServiceContainer` in `src/core/di/ServiceContainer.ts` existiert bereits, wird aber nur fuer `StateManager` und `PerformanceMonitor` konsequent genutzt.
*   Registriere **alle** Manager im `ServiceContainer`.
*   Klassen, die einen anderen Manager benoetigen (z.B. `LayoutManager` braucht den `NodeManager`), sollen diesen ueber `ServiceContainer.getInstance().get('NodeManager')` beziehen, anstatt dass `App.ts` sie hart verdrahtet uebergibt.
*   Entferne die langen Listen von `public` Properties aus der `App`-Klasse.

## 3. Datenfluss: Entfernung redundanter State-Kopien
Die Umstellung auf den `StateManager` als Single Source of Truth (SSoT) ist weit fortgeschritten, aber in `App.ts` existieren noch Ueberbleibsel.

**Aktionen:**
*   `App.ts` haelt noch `public currentEntities: EntityData[] = [];` und `currentRelationships`.
*   Diese lokalen Kopien sollten eliminiert werden. Alle Klassen sollten via `this.stateManager.state.graphData.nodes` bzw. `.edges` auf die aktuellen Daten zugreifen.
*   Dies verhindert Synchronisationsfehler, falls die Arrays in `App.ts` mal nicht aktualisiert werden.

## 4. UIManager Refactoring (680+ Zeilen)
Der `UIManager` instanziiert momentan manuell fast jedes einzelne Panel (`ViewPanel`, `CreatePanel`, etc.) und kuemmert sich um viel DOM-Logik.

**Aktionen:**
*   **Inversion of Control:** Panels sollten idealerweise selbstverwaltet sein. Anstatt dass der `UIManager` weiss, wie ein `DevPanel` oder `CreatePanel` erstellt wird, sollten die Panels beim Initialisieren registriert werden.
*   **Auslagerung der Info-Panel Logik:** Die Methoden `showInfoPanelFor` und `showMultiSelectionInfo` umfassen ueber 100 Zeilen und generieren hartcodiertes HTML. Diese Logik gehoert in eine eigene `InfoPanelUI`-Klasse nach `src/ui/`.
*   **File-Panel Auslagerung:** Die Methoden `renderFilePanel` und `loadAvailableFiles` gehoeren in ein eigenes `FilePanel.ts`.

## 5. Bereinigung von Legacy-Code & Experimenten
Waehrend der Entwicklung scheinen einige Dateien als Prototypen entstanden zu sein, die nun obsolete sind.

**Aktionen:**
*   Pruefe und entferne `src/test_layout.ts` (falls es ein veraltetes Testskript ist).
*   Pruefe `src/utils/FutureDataParser.ts` - wenn der regulaere `DataParser` verwendet wird, kann der Future-Parser geloescht werden.
*   Entferne auskommentierte Legacy-Methoden aus dem `CentralEventManager.ts` (bereits in der Tab-Analyse aufgefallen).

---

## Empfohlene Reihenfolge (Roadmap)

1.  **Phase 1 (Low Risk, High Reward):**
    *   Verschieben der Dateien aus `utils/` nach `ui/` und Fixen der Importe.
    *   Loeschen von `test_layout.ts` und `FutureDataParser.ts` (nach kurzer Pruefung).
2.  **Phase 2 (Medium Risk):**
    *   Auslagerung der Info-Panel- und File-Panel-Logik aus `UIManager.ts` in eigene Klassen.
3.  **Phase 3 (High Risk, Core Architecture):**
    *   Migration aller Manager in den `ServiceContainer`.
    *   Entfernung von `currentEntities` und `currentRelationships` aus `App.ts`.

*(Die Umsetzung einzelner Punkte kann iterativ Schritt fuer Schritt erfolgen, um die Lauffaehigkeit der Anwendung jederzeit zu gewaehrleisten.)*
