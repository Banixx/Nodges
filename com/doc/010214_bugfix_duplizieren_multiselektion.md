# Bug-Fix Dokumentation: Multi-Selektion Duplizierung im Kontextmenue

**Projekt-Version**: 0.102.14  
**Datum**: 25.07.2026  

## Zusammenfassung des Bugs

Beim Rechtsklick auf ein selektiertes Objekt innerhalb einer mittels Shift komplett selektierten Gruppe (z. B. 2 Nodes und 2 Edges) wurden bisher nur die Nodes dupliziert. Die Verbindungen (Edges) fehlten nach dem Duplizieren.

## Analyse & Ursachen

1. **Selektions-Reduktion in `ContextMenuHandler.ts`**:
   Bei Ausfuehrung der Option "Duplicate" oder "Delete" im Kontextmenue fuer Node oder Edge wurde zuvor bedingungslos `this.stateManager.setSelectedObject(object)` aufgerufen. Diese Methode ersetzt im StateManager das bestehende Selektions-Set durch ein Set mit nur einem einzelnen Objekt. Dadurch ging die bestehende Multi-Selektion bei Rechtsklick sofort verloren.

2. **Fehlendes Node-ID-Remapping fuer Edges in `SelectionHandler.ts`**:
   Beim Duplizieren von Edges wurden die `source`- und `target`-Referenzen 1:1 kopiert. Selbst wenn Edges dupliziert worden waeren, haetten sie weiterhin auf die Original-Nodes statt auf die duplizierten Node-Kopien gezeigt.

## Behobene Komponenten

### 1. `src/core/interaction/ContextMenuHandler.ts`
- Es wird nun vor `setSelectedObject(object)` geprueft, ob das angeklickte Objekt (oder ein aquivalentes Objekt) bereits in `getSelectedObjects()` enthalten ist.
- Wenn das Objekt bereits Teil der Multi-Selektion ist, wird die bestehende Selektion beibehalten und direkt `duplicateSelected()` bzw. `deleteSelected()` aufgerufen.

### 2. `src/core/interaction/SelectionHandler.ts`
- Die Methode `duplicateSelected()` verarbeitet die Selektion nun in zwei Phasen:
  - **Phase 1 (Nodes)**: Alle selektierten Nodes werden dupliziert. Eine Mapping-Tabelle `oldNodeId -> newNodeId` wird aufgebaut.
  - **Phase 2 (Edges)**: Alle selektierten Edges werden dupliziert. Sofern `source` und/oder `target` in der Mapping-Tabelle vorhanden sind, werden diese auf die neuen Node-IDs umgeschrieben.
- Die Operationen werden in eine `beginTransaction` / `commitTransaction` verpackt, um Undo/Redo als atomare Gruppenaktion zu ermoeglichen.

### 3. `src/tests/SelectionHandler.test.ts`
- Neuer Unit-Test zur Verifizierung der Multi-Selektions-Duplizierung und des ID-Remappings für Edges.

## Verifizierung
- Testlauf `npx vitest run src/tests/SelectionHandler.test.ts` erfolgreich abgeschlossen (2/2 Tests passed).
