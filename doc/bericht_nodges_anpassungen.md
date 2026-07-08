# Erforderliche Anpassungen in Nodges für zeitliche Verläufe

Um das "Build 4" Format und eine zeitliche Navigation in Nodges zu implementieren, sind weitreichende architektonische Anpassungen notwendig.

## 1. Datenhaltung (`StateManager.ts` / Core Models)
- **Erweiterung der Typen**: Die TypeScript Interfaces für `Node` und `Edge` müssen um das optionale `temporal` Objekt (gemäß Build 4) erweitert werden.
- **Globaler Zeit-State**: Einführung einer zentralen State-Variablen `currentTimestamp` im `StateManager`.
- **Performance / Indizes**: Um nicht bei jedem Frame alle Nodes filtern zu müssen, sollte der `StateManager` einen zeitlichen Index (z.B. Intervallbäume oder einfach nach Zeitstempel sortierte Arrays) aufbauen.

## 2. Benutzeroberfläche (`TimeUI.ts` & `MappingUI.ts`)
- **Neue Time Player Komponente**: Ein neues UI-Panel (z.B. am unteren Rand), das einen Schieberegler (Slider), Play/Pause-Buttons, Zeitschritt-Konfiguration (Tage, Jahre) und die Anzeige des aktuell visualisierten Datums enthält.
- **Mapping Panel Erweiterungen**: Die `MappingUI.ts` muss in der Lage sein, zeitliche Attribute (wie `validFrom`) als Datenquelle für visuelle Eigenschaften (wie Farbskalen oder Positionen auf einer Achse) anzubieten.

## 3. Render Engine (Three.js / `NodeManager.ts` & `EdgeManager.ts`)
- **Sichtbarkeits-Filter (Culling)**: In der Update-Schleife muss geprüft werden, ob ein Element zum aktuellen `currentTimestamp` existiert (`validFrom <= currentTimestamp && (!validTo || validTo >= currentTimestamp)`). Unsichtbare Elemente erhalten im Three.js Scene Graph ein `.visible = false`.
- **Property-Interpolation**: Wenn ein Node `history`-Einträge besitzt, muss der Renderer die Werte für das aktuelle Datum berechnen. Ändert sich beispielsweise die Farbe in der Historie, muss diese neue Farbe auf das Material angewendet werden.

## 4. Graph Layout Engine (Web Worker / ForceGraph)
- **Dynamische Physik**: Die Physik-Simulation im Web Worker darf nur die aktuell "sichtbaren" Nodes und Edges berücksichtigen, da andernfalls unsichtbare Nodes weiterhin andere Nodes wegstoßen würden.
- **Stabilität bei Transitionen**: Wenn Nodes im Zeitverlauf "geboren" werden, müssen sie sanft in das bestehende Force-Layout integriert werden. Plötzliches Hinzufügen vieler Nodes kann zu einem explodierenden Layout führen. Die in vorigen Builds eingeführten Dämpfungen (Velocity Caps) müssen hier greifen.
- **Positions-Caching**: Unsichtbare Elemente sollten ihre letzte Position speichern, damit sie bei einer Rückkehr auf der Zeitleiste nicht komplett von der Mitte aus neu einfliegen müssen.
