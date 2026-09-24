# Walkthrough: Integration des (0,0,3) Fallbacks als 4. Überlagerungs-Modus

## Zusammenfassung der Änderungen
Die vorherige Doppellaeufigkeit zwischen dem Import-Fallback in `App.ts` und den Knoten-Überlagerungs-Effekten im Seitenpanel-Tab **Ansicht** wurde behoben. Der (0,0,3)-Fallback ist nun als **4. Effekt-Modus** ("4. Fallback (0,0,3 Jitter)") in das Überlagerungssystem integriert.

## Geaenderte Dateien
- [StateTypes.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/state/StateTypes.ts): Typ `overlapEffectMode` um `'jitter'` erweitert.
- [ViewPanel.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/ViewPanel.ts): Neugestaltung der Dropdown-Optionen (`4. Fallback (0,0,3 Jitter)`) und dynamische Steuerung des Jitter-Radius-Sliders.
- [NodeManager.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/NodeManager.ts): Verteilung der Fallback-Knoten um `(0,0,3)` bei ausgewähltem 4. Modus.
- [App.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts): Entkoppelung des starren Zufallscode beim Laden von JSON-Dateien.

## Testergebnisse
- `npx vitest run`: Alle Tests wurden erfolgreich ausgefuehrt.
