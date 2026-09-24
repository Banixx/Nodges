# Entwicklungsplan: Reparatur der Tab-Sichtbarkeit im Dev-Modus

## Ursachenanalyse

1. In `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/StateManager.ts` ist der Schluesse `complexityMode` ausschliesslich der Kategorie `STATE_CATEGORIES.DEV` zugeordnet.
2. Der `UIManager` abonniert Status-Aenderungen bezueglich der Kategorie `STATE_CATEGORIES.UI` (`'ui'`).
3. Wenn der Benutzer im System-Tab den UI-Modus auf `Dev` stellt, wird `stateManager.update({ complexityMode: 'dev' })` aufgerufen.
4. Da `complexityMode` nicht in der `UI`-Kategorie registriert war, wurde der Subscriber im `UIManager` (`handleStateChange`) nicht benachrichtigt.
5. Die Funktion `updateUIForMode('dev')` wurde dadurch bei Modus-Wechseln nie ausgefuehrt. Folglich fehlte der `body`-Klasse das CSS-Attribut `ui-mode-dev`.
6. Zusaetzlich fehlte beim Initialisieren des `UIManager` der initiale Aufruf von `updateUIForMode` mit dem aus dem `localStorage` geladenen Startwert von `complexityMode`.

## Geplante Aenderungen

### 1. `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/StateManager.ts`
- Zuordnung von `complexityMode` in `STATE_KEY_TO_CATEGORIES` erweitern auf `[STATE_CATEGORIES.UI, STATE_CATEGORIES.DEV]`.

### 2. `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/state/StateTypes.ts`
- Konsistente Zuordnung von `complexityMode` auf `[STATE_CATEGORIES.UI, STATE_CATEGORIES.DEV]` verifizieren/anpassen.

### 3. `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/UIManager.ts`
- In der Initialisierung des `UIManager` den initialen Modus aufrufen: `this.updateUIForMode(this.stateManager.state.complexityMode);`.

## Verifizierung
- Ausfuehrung von `npm run build` und `npm test`.
- Manuelle Ueberpruefung im Browser: Bei Auswahl von `Dev` muessen 6 Tabs (`System`, `Ebenen`, `Files`, `Ansicht`, `Create`, `Dev`) sichtbar sein.
