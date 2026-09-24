# Root-Cause: isUpdating-Guard blockiert State-Updates aus Subscriber-Callbacks

## Problem

Die temporale Animation in Nodges Build 10 zeigte keinerlei visuelle Aenderung beim Druecken auf Play.

## Diagnose (Session 2026-07-19)

### Symptom
- Der `currentTimestamp` im State blieb dauerhaft `null`
- `NodeManager.updateTemporalState(null)` wurde jedes Frame aufgerufen → kein Visibility-Toggle

### Root Cause

`StateManager.update()` setzt intern `isUpdating = true`, bevor es Subscriber-Callbacks aufruft.
Wenn ein Subscriber-Callback seinerseits `update()` aufruft (z.B. um `currentTimestamp` zu setzen),
wird dieser verschachtelte Aufruf sofort mit `return` abgebrochen:

```typescript
update(partialState: Partial<State>) {
    if (this.isUpdating) return; // <-- Block
    // ...
    this.isUpdating = true;
    this.notifySubscribers(...); // <- Subscriber koennen hier kein update() aufrufen!
    this.isUpdating = false;
}
```

**Betroffener Ablauf:**
1. `DataParser.parse()` → `StateManager.setGraphData()` → `StateManager.update({graphData})` → `isUpdating = true`
2. Subscriber `TimePlayerUI.handleDataChange()` wird aufgerufen
3. `handleDataChange` erkennt temporale Daten und ruft `setCurrentTimestamp(minTime)` auf
4. `setCurrentTimestamp()` → `update({currentTimestamp: minTime})` → **ABGEBROCHEN wegen `isUpdating = true`**
5. `currentTimestamp` bleibt `null`

Das gleiche Problem betraf auch:
- Den Auto-Stop am Timeline-Ende (`setPlaying(false)` + `setCurrentTimestamp(maxTime)`)
- Das Zuruecksetzen von `minTimestamp` / `maxTimestamp` im State

### Loesung

Alle State-Update-Aufrufe innerhalb von Subscriber-Callbacks werden per `setTimeout(0)` in die naechste Event-Loop-Iteration verschoben. Damit wird der `isUpdating`-Guard sicher umgangen:

```typescript
// In handleDataChange (TimePlayerUI.ts):
setTimeout(() => {
    if (this.stateManager.state.currentTimestamp === null) {
        this.stateManager.setCurrentTimestamp(capturedMinTime);
    }
    this.stateManager.update({
        minTimestamp: capturedMinTime,
        maxTimestamp: capturedMaxTime
    });
}, 0);
```

### Betroffene Dateien
- `src/ui/TimePlayerUI.ts`: `handleDataChange()` und `handleStateChange()` (Auto-Stop-Logik)

### Nebenbefund: DataParser Temporal-Synthese
In der vorherigen Session wurde ein zweites Problem behoben: Datensaetze mit flachen temporalen
Feldern (`startYear`, `endYear`) wurden nicht in das von Nodges erwartete `temporal`-Objekt
(`validFrom`, `validTo`, `history`) umgewandelt. Dies wurde in `DataParser.normalizeData()`
durch die neue `synthesizeTemporal()`-Funktion geloest.

## Verifikation
Nach dem Fix:
- `currentTimestamp` wird korrekt auf `minTime` gesetzt (z.B. `-27` fuer die roemischen Kaiserdaten)
- Der Play-Button loest eine kontinuierliche Zeitreihe aus
- Nodes mit temporalem Gueltigkeitsbereich werden korrekt ein- und ausgeblendet
- Die Animation stoppt automatisch wenn `currentTimestamp >= maxTime`
