# Wiederherstellung des StateManagers und Anbindung des Label-Repositionierungs-Schalters

## Zusammenfassung
Der StateManager (`c:/Users/ich/Desktop/code/_projects/Nodges/src/core/StateManager.ts`) wurde vollständig strukturiert und wiederhergestellt. Die neue State-Eigenschaft `repositionLabels: boolean` (Standardwert: `false`) wurde im State-Interface sowie im initialen Zustand hinterlegt und der UI-Kategorie zugeordnet.

Im `ViewPanel` (`c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/ViewPanel.ts`) wurde im Tab "Ansicht" im Abschnitt "Beschriftungen" die Checkbox **"Überlagerung vermeiden"** integriert und an `repositionLabels` angebunden.

## Durchgeführte Änderungen

### 1. StateManager (c:/Users/ich/Desktop/code/_projects/Nodges/src/core/StateManager.ts)
- `State`-Interface mit allen zentralen Eigenschaften (inklusive `repositionLabels: boolean` und `loadedFiles: any[]`) vervollständigt.
- `StateManager.state` als `public` deklariert.
- `STATE_KEY_TO_CATEGORIES` erweitert, um `repositionLabels` der UI-Kategorie zuzuordnen.
- Initialer Zustand in `constructor()` mit `repositionLabels: false` ausgestattet.

### 2. ViewPanel (c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/ViewPanel.ts)
- Hinzufügen der Checkbox-Zeile "Überlagerung vermeiden" im Beschriftungsbereich.
- Synchronisation der Checkbox in der `updateUI(state)`-Methode mit `state.repositionLabels`.

## Nächste Schritte
1. Implementierung der Kollisionsprüfung und Neupositionierungs-Logik für Labels in `NodeLabelManager.ts`.
2. Zeichnen von Führungslinien vom neu positionierten Label zum zugehörigen Node/Edge.
