# Arbeitspaket: Phase 1 - TypeScript-Hygiene

**Ziel:** Alle 15 `@ts-ignore` Statements entfernen und durch typsichere Lösungen ersetzen.  
**Geschätzter Aufwand:** 4-6h  
**Priorität:** Hoch (Fundament)

---

## Übersicht der Kategorien

| Kategorie | Anzahl | Schwierigkeit |
|-----------|--------|---------------|
| Fehlende/redundante Imports | 6 | Einfach |
| Three.js Material-Casting | 3 | Einfach |
| Worker-Import (Vite) | 1 | Mittel |
| Callback-Signatur | 1 | Mittel |
| Redundante historische Ignores | 4 | Trivial (löschen) |

---

## Detaillierte Arbeitsschritte

### 1. CentralEventManager.ts (4 Stellen)

#### Zeile 8-9: RaycastManager Import

```typescript
// @ts-ignore
import { RaycastManager } from '../utils/RaycastManager';
```

**Ursache:** `RaycastManager` exportiert keine Typen korrekt.  
**Lösung:**

- [ ] Prüfe ob `RaycastManager.ts` einen korrekten `export class` hat (JA, Zeile 9)
- [ ] Entferne `@ts-ignore` - der Import sollte funktionieren

#### Zeile 11-15: Redundante Ignores

```typescript
// @ts-ignore
// @ts-ignore
import { NodeManager } from './NodeManager';
// @ts-ignore
import { EdgeObjectsManager } from './EdgeObjectsManager';
```

**Ursache:** Historische Reste, doppelter Ignore ohne Grund.  
**Lösung:**

- [ ] Entferne alle 3 `@ts-ignore` - Imports sind korrekt typisiert

---

### 2. App.ts (5 Stellen)

#### Zeile 19-20: NeighborhoodHighlighter Import

```typescript
// @ts-ignore
import { NeighborhoodHighlighter } from './utils/NeighborhoodHighlighter';
```

**Lösung:**

- [ ] Prüfe `NeighborhoodHighlighter.ts` auf korrekten Export
- [ ] Entferne `@ts-ignore` wenn Export korrekt ist

#### Zeile 28-30: Auskommentierte Imports

```typescript
// @ts-ignore
// @ts-ignore
// import { NodeObjectsManager } from './core/NodeObjectsManager';
```

**Lösung:**

- [ ] Entferne die 2 `@ts-ignore` komplett (der Import ist auskommentiert)

#### Zeile 186-189: GridHelper Material

```typescript
const gridHelper = new THREE.GridHelper(1000, 200, 0x444444, 0x222222);
gridHelper.position.y = -4.9;
// @ts-ignore
gridHelper.material.transparent = true;
// @ts-ignore
gridHelper.material.opacity = 0.3;
```

**Ursache:** `GridHelper.material` ist `Material | Material[]`, TypeScript kennt die Eigenschaften nicht.  
**Lösung:**

- [ ] Ersetze durch Type-Guard:

```typescript
const gridHelper = new THREE.GridHelper(1000, 200, 0x444444, 0x222222);
gridHelper.position.y = -4.9;
if (gridHelper.material instanceof THREE.Material) {
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.3;
}
```

---

### 3. InteractionManager.ts (1 Stelle)

#### Zeile 8-9: CentralEventManager Import

```typescript
// @ts-ignore
import { CentralEventManager } from './CentralEventManager';
```

**Lösung:**

- [ ] Entferne `@ts-ignore` - der Export ist korrekt

---

### 4. LayoutManager.ts (1 Stelle)

#### Zeile 5-6: Worker Import

```typescript
// @ts-ignore
import LayoutWorker from '../workers/layout-worker.js?worker';
```

**Ursache:** Vite's `?worker` Suffix ist TypeScript nicht bekannt.  
**Lösung:**

- [ ] Erstelle Type-Declaration in `src/vite-env.d.ts`:

```typescript
declare module '*?worker' {
    const workerConstructor: {
        new (): Worker;
    };
    export default workerConstructor;
}
```

- [ ] Entferne `@ts-ignore`

---

### 5. StateManager.ts (1 Stelle)

#### Zeile 271-272: Batch Callback Signatur

```typescript
// @ts-ignore - Batch callback signature might differ
callback({ oldState, newState: this.state, updates });
```

**Ursache:** Callback-Typ `StateCallback` erwartet `(state: State) => void`, aber hier wird ein anderes Objekt übergeben.  
**Lösung:**

- [ ] Definiere neuen Callback-Typ:

```typescript
type BatchCallback = (data: { oldState: State; newState: State; updates: Partial<State> }) => void;
```

- [ ] Oder: Separates `batchSubscribers`-Map mit anderem Typ anlegen
- [ ] Entferne `@ts-ignore`

---

### 6. RaycastManager.ts (3 Stellen)

#### Zeile 2-7: Imports

```typescript
// @ts-ignore
import { NodeManager } from '../core/NodeManager';
// @ts-ignore
import { EdgeObjectsManager } from '../core/EdgeObjectsManager';
// @ts-ignore
import { EntityData } from '../types';
```

**Lösung:**

- [ ] Alle 3 `@ts-ignore` entfernen - Exports sind korrekt typisiert

---

## Checkliste für die Umsetzung

### Trivial (5min pro Stelle)

- [ ] `CentralEventManager.ts`: 4 Ignores entfernen
- [ ] `App.ts` Zeile 28-30: 2 Ignores entfernen (auskommentierter Code)
- [ ] `InteractionManager.ts`: 1 Ignore entfernen
- [ ] `RaycastManager.ts`: 3 Ignores entfernen

### Einfach (15min pro Stelle)

- [ ] `App.ts` Zeile 19: Prüfen und entfernen
- [ ] `App.ts` Zeile 186-189: Type-Guard für GridHelper.material

### Mittel (30min pro Stelle)

- [ ] `LayoutManager.ts`: Vite Worker Type Declaration erstellen
- [ ] `StateManager.ts`: BatchCallback Typ definieren

---

## Testkriterien

Nach Abschluss dieser Phase:

1. **Build erfolgreich:** `npm run build` ohne Fehler
2. **Keine `@ts-ignore`:** `grep -r "@ts-ignore" src/` liefert 0 Ergebnisse
3. **Funktionalität:** App startet und Grundfunktionen (Laden, Selektieren, Hover) funktionieren

---

## Quick-Fix-Reihenfolge

Für maximale Effizienz in dieser Reihenfolge bearbeiten:

1. **Zuerst:** Alle trivialen Entfernungen (10 von 15)
2. **Dann:** GridHelper Type-Guard in `App.ts`
3. **Dann:** Worker Type Declaration in `vite-env.d.ts`
4. **Zuletzt:** BatchCallback Typ in `StateManager.ts`

Nach jedem Schritt: `npm run build` prüfen.
