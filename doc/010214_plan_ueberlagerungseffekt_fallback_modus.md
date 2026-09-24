# Plan: Integration des 0,0,3 Fallbacks als 4. Überlagerungs-Effekt-Modus

## Ausgangslage & Doppellaeufigkeit
Bisher gab es zwei getrennte Stellen fuer die Handhabung ueberlagerter Knoten bzw. von Knoten ohne Positionsangabe:
1. **Import-Fallback in App.ts**: Beim Laden von Dateien ohne eigene Koordinaten wurden den Knoten starre Zufallspositionen um `(0, 0, 3)` zugewiesen (`isRandomFallback: true`).
2. **Knoten-Überlagerungs-Effekt im Seitenpanel (Ansicht)**: Bisher existierten dort 3 Modi fuer ueberlagerte Knoten:
   - 1. Statisch (0 & Verharren)
   - 2. Kreisen (3D-Orbit)
   - 3. Pulsieren (Groesse)

## Konzept fuer den 4. Modus
Der starre Fallback aus `App.ts` wird aufgeloest und gliedert sich nahtlos als 4. Option in das Überlagerungs-System ein:
- **Neuer Modus**: `4. Fallback (0,0,3 Jitter)` (Schluessel: `'jitter'`).
- **Verhalten**: Wenn Knoten ueberlagert sind oder keine expliziten Koordinaten mitbringen, verteilt dieser Modus die Knoten dynamisch in einem konfigurierbaren Jitter-Bereich um den Mittelpunkt `(0,0,3)`.
- **Vorteil**: Sämtliche Überlagerungs- und Fallback-Verhalten sind zentral an einer Stelle gebündelt und ueber das UI unter Tab **Ansicht** steuerbar.

## Geplante Modifikationen
1. `src/core/state/StateTypes.ts`: `overlapEffectMode` um `'jitter'` erweitern.
2. `src/ui/ViewPanel.ts`: Select-Option `4. Fallback (0,0,3 Jitter)` im UI hinzufuegen.
3. `src/core/NodeManager.ts`: Berechnung des Jitter-Verhaltens um `(0,0,3)` bei aktiviertem 4. Modus.
4. `src/App.ts`: Entkoppelung des festen Import-Fallbacks zugunsten der dynamischen Steuerung.
