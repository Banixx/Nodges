# Plan zur Behebung des Web Worker Index-Mapping Problems

## 1. Problemanalyse
Derzeit nutzt der Layout-Worker Array-Indizes zur Identifikation von Nodes und zur Definition von Edges (`start` und `end`). Das Array `positions`, das der Worker als Ergebnis zurückliefert, enthält nur Koordinaten und geht davon aus, dass der Index `0` im Ergebnis exakt dem Index `0` im Array `nodes` des Haupt-Threads (`LayoutManager.ts`) entspricht. Wenn in der Zwischenzeit Elemente gelöscht, hinzugefügt oder gefiltert werden, führt dies zu einer asynchronen Verschiebung und falschen Zuweisungen.

## 2. Lösungsansatz
Die Kommunikation muss so umgestellt werden, dass die Ergebnisse des Workers eindeutige IDs enthalten. Der Haupt-Thread kann die neuen Positionen dann anhand dieser IDs sicher den korrekten Elementen zuweisen, unabhängig davon, ob sich deren Position in der Liste geändert hat. Aus Performancegründen (O(n²) Schleifen im Force-Directed Layout) sollte der Worker intern weiterhin mit Indizes arbeiten, aber beim Export die IDs mitsenden.

## 3. Konkrete Umsetzungsschritte

### Schritt 1: Typ-Definitionen aktualisieren (`src/workers/WorkerTypes.ts`)
- Den Typ `WorkerNode` erweitern, sodass er die Eigenschaft `id: string` zwingend enthält.
- Einen neuen Typ `WorkerNodeResult` definieren, der neben den Koordinaten `x`, `y`, `z` auch die `id: string` beinhaltet.
- Im Interface `LayoutWorkerSuccessResponse` den Typ des Arrays `positions` von `WorkerVector3[]` zu `WorkerNodeResult[]` ändern.

### Schritt 2: Worker-Logik anpassen (`src/workers/layout-worker.ts`)
- Beim Empfang der Daten (`event.data`) die übergebenen IDs aus den Nodes zusammen mit den initialen Positionen abspeichern (z.B. in einem Array von Objekten, die `{ id, x, y, z }` enthalten).
- Die Berechnungen (repulsion, attraction) können weiterhin über Array-Indizes auf die Positionen zugreifen.
- Vor dem Senden der `successResponse` das Array `positions` so strukturieren, dass jedes Objekt die jeweilige `id` sowie die berechneten `x`, `y`, `z` Werte enthält.

### Schritt 3: Zuweisung im Haupt-Thread anpassen (`src/core/LayoutManager.ts`)
- In der Methode `applyLayoutWithWorker` beim Vorbereiten des Requests sicherstellen, dass die `id` der Nodes aus `EntityData` in das `WorkerNode`-Array übernommen wird.
- Im `onmessage`-Handler für den Erfolgsfall (`case 'success':`) die Aktualisierungsschleife ändern. Anstatt über den Index auf das `nodes`-Array zuzugreifen (`nodes[index]`), muss das jeweilige Element über seine ID gesucht werden. 
- Da das Suchen in einem Array per `.find()` bei großen Graphen langsam ist, sollte vor der Schleife eine `Map<string, EntityData>` (oder ähnlich) aus dem aktuellen `nodes`-Array erstellt werden. Danach können die eingehenden Positionen performant und absolut sicher über `map.get(pos.id)` zugewiesen werden.

## 4. Zielzustand
Nach dieser Änderung sind Layout-Berechnungen vollständig entkoppelt von der Reihenfolge oder Anzahl der Elemente im Array des Haupt-Threads während der Laufzeit. Es gibt keine verlorenen oder falschen Zuweisungen mehr bei Re-Indizierungen.
