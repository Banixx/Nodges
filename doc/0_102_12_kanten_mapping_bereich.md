# Kanten-Radien und Standard-Mappingbereiche Anpassungen (v0.102.12)

In dieser Iteration wurden die mathematische Skalierung der Kantendicke sowie die Standardbereiche der visuellen Zuweisungen fuer Knoten und Kanten korrigiert.

## 1. Mathematische Radius-Korrektur (Tubes)

### Problem
Die Kanten-Dicke (`thickness`) wurde in Three.js faelschlicherweise direkt als Radius-Wert fuer `TubeGeometry` uebergeben. Im Gegensatz dazu berechnet `NodeManager` die Knotengroesse mit einem Faktor von `0.5`, um einen Radius fuer die Sphaeren zu erhalten. Dies fuehrte dazu, dass Kanten bei gleichem Mapping-Wert doppelt so dick erschienen wie Knoten und diese optisch verschluckten.

### Loesung
In `src/core/EdgeObjectsManager.ts` wird die endgueltige Dicke nun mit `0.5` multipliziert, um den korrekten Radius-Faktor abzubilden:
- In `createEdgeMesh` bei der initialen Erstellung.
- In `updatePositions` beim zeitlichen Update der Kanten-Geometrie.

```typescript
const currentFinalThickness = Math.pow(state.edgeThickness * currentVisualThickness, state.visualScaleExponent) * state.visualScaleMultiplier * 0.5;
```

---

## 2. Standard-Mappingbereiche in der UI

### Problem
Zuvor gab es einen einheitlichen Default-Visualisierungsbereich von `0.1` bis `3.0` fuer alle numerischen Kanaele (ausser Koordinaten). Dies war fuer Kanten viel zu dick.

### Loesung
In `src/ui/MappingUI.ts` wurden die Standardwerte fuer die "Visual Range" (Min/Max) dynamisch an die Kategorie angepasst:
- **Kanten (Linien/Tubes)**: `0.1` bis `0.45`
- **Knoten (Sphären)**: `0.5` bis `3.0`

Diese Werte werden nun an allen Stellen verwendet, an denen eine neue Verbindung hergestellt oder ein Widget ohne vordefinierte Werte gezeichnet wird.

---

## 3. Anpassung der LLM-System-Prompts

### Problem
Die Prompts fuer das LLM (z.B. in `src/prompts/build_10_prompt.md`) wiesen das Modell an, die Kantenstaerke (`thickness`) auf einen Bereich von `0.03` bis `0.25` zu limitieren. Dies ueberschrieb die Standardwerte in den generierten JSON-Dateien.

### Loesung
Folgende Prompt-Dateien wurden an die neuen Standards angepasst (`0.1` bis `0.45` fuer Kanten, `0.5` bis `3.0` fuer Knoten):
- `src/prompts/build_10_prompt.md`
- `src/prompts/build_6_prompt.md`
- `src/prompts/build_5_visual_prompt.md`

Zusaetzlich wurden die bestehenden Datensaetze `B10_GW_QG_BF_5...json` und `B10_GW_QG_BF_6...json` in `public/data/b10/` aktualisiert, damit sie den neuen Bereich von `0.1` bis `0.45` direkt laden.
