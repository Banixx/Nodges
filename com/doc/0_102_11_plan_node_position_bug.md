# Plan: Analyse und Behebung des Node-Positionierungsfehlers

## 1. Ursachenanalyse (Root Cause)
Auf dem Screenshot ist erkennbar, dass in der Nodges-UI das übergeordnete `position`-Objekt (welches die Unter-Attribute `.x`, `.y`, `.z` enthält) direkt auf die eindimensionalen Slots `Position (Nur Z Achse)`, `Position (Nur Y Achse)` und `Position (Nur X Achse)` gezogen wurde.

In der `VisualMappingEngine.ts` passiert dadurch Folgendes:
1. Das Mapping fragt das komplette Objekt `{x: ..., y: ..., z: ...}` aus den Daten ab.
2. Der Code versucht, dieses Objekt für die jeweilige Einzelachse in eine Zahl umzuwandeln (z.B. `Number(posVal)`).
3. Die Umwandlung eines Objekts in eine Zahl ergibt in JavaScript `NaN` (Not-a-Number).
4. Die Engine verwendet beim Zuweisen einen Fallback: `NaN || 0` ergibt `0`.
5. Folglich erhalten alle Nodes für X, Y und Z exakt den Wert `0` und werden alle gebündelt am Ursprungspunkt `(0, 0, 0)` gerendert, obwohl in der Datenansicht der UI noch die korrekten, unterschiedlichen Werte (wie z.B. `[-1.5 ... 0]`) angezeigt werden.

## 2. Lösungsmöglichkeiten

### Option A: Lösung durch den Nutzer (UI-seitig)
Das Problem kann sofort behoben werden, indem du im UI die Verbindungen korrigierst:
- Lösche die aktuellen Verbindungen vom Haupt-Attribut `position`.
- Ziehe stattdessen die Linie direkt vom Unter-Attribut `.x` auf `Position (Nur X Achse)`, von `.y` auf `Position (Nur Y Achse)` und von `.z` auf `Position (Nur Z Achse)`.

### Option B: Robuste Code-Implementierung (Software-seitig)
Um den Fehler zukünftig abzufangen und die Nutzererfahrung zu verbessern, sollte die `VisualMappingEngine.ts` fehlertoleranter gestaltet werden.
Wenn das Mapping einen Slot für eine Einzelachse (z.B. `axis === 'x'`) anfordert, der vom Nutzer übergebene Wert aber irrtümlicherweise das gesamte Objekt ist, sollte der Code intelligent den korrekten Wert extrahieren:

```typescript
// Geplanter Fix in VisualMappingEngine.ts (applyToEntity)
if (axis === 'x') {
    visual.positionX = (typeof posVal === 'object' && posVal !== null && 'x' in posVal) 
        ? Number(posVal.x) || 0 
        : Number(posVal) || 0;
} else if (axis === 'y') {
    visual.positionY = (typeof posVal === 'object' && posVal !== null && 'y' in posVal) 
        ? Number(posVal.y) || 0 
        : Number(posVal) || 0;
} else if (axis === 'z') {
    visual.positionZ = (typeof posVal === 'object' && posVal !== null && 'z' in posVal) 
        ? Number(posVal.z) || 0 
        : Number(posVal) || 0;
}
```

## 3. Weiteres Vorgehen
Da du ausdrücklich angewiesen hast, noch keinen Code zu schreiben ("nichts coden"), wurden diese Änderungen nicht im System vorgenommen. Du kannst nun entscheiden, ob der Fehler rein über deine Bedienung (Option A) gelöst wird, oder ob ich den intelligenten Fallback im Code (Option B) für dich implementieren soll.
