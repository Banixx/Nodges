# Plan: Spezifischere Benennung für "type"

Das Ziel ist es, den sehr generischen und dominanten Begriff `type` (für Nodes und Edges) durch eine spezifischere, konzeptionell korrektere Benennung zu ersetzen, die besser zur Build 5 Architektur (attributbasierte semantische Netze) passt.

## Offene Fragen & Vorschläge (User Feedback Required)

Aktuell heißt das Feld für Knoten (z.B. Fisch, Titan) und für Kanten (z.B. ParentOf, Eats) gleichermaßen `type`. Um spezifischer zu werden, sollten wir den Begriff idealerweise trennen, da ein Knoten inhaltlich etwas völlig anderes darstellt als eine Kante. 

Welche Begriffs-Kombination findest du für Nodges am passendsten?

**Option A: Der Standard für semantische Netze**
- Für Knoten: `category` oder `class` (Kategorie / Klasse - z.B. "Koralle")
- Für Kanten: `relation` oder `predicate` (Relation / Prädikat - z.B. "frisst")

**Option B: Der Taxonomie-Ansatz**
- Für Knoten: `concept` oder `entityClass`
- Für Kanten: `interaction` oder `relationship`

**Option C: Einheitlicher, aber weicherer Begriff (wenn es ein Wort bleiben soll)**
- `category` (für beides)
- `kind` (Art)

*Bitte teile mir mit, welche Benennung (z.B. `category` für Nodes und `relation` für Edges) wir umsetzen sollen.*

## Proposed Changes

Sobald wir uns für die neuen Begriffe (z.B. `category` / `relation`) entschieden haben, umfasst das Refactoring folgende Schritte:

### 1. Daten-Schema (`types.ts`)
#### [MODIFY] [types.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/types.ts)
- In `EntityDataSchema`: Umbenennung von `type: z.string()` zu `[Neuer Begriff Nodes]: z.string()`.
- In `RelationshipDataSchema`: Umbenennung von `type: z.string()` zu `[Neuer Begriff Edges]: z.string()`.

### 2. Daten-Verarbeitung & Importer (`ImportManager.ts`, `BuildFormatUtils.ts`)
#### [MODIFY] [ImportManager.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/utils/ImportManager.ts)
- Anpassung der JSON-Parsing-Logik, damit alte Dateien (die noch `type` nutzen) auf die neuen Begriffe gemappt werden, um Abwärtskompatibilität zu gewährleisten.

### 3. Rendering Engine (`NodeManager.ts`, `EdgeManager.ts`)
#### [MODIFY] [NodeManager.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/NodeManager.ts)
- Referenzen auf `entity.type` ersetzen. WICHTIG: Den technischen internen `userData.type === 'node'` (für Three.js) lassen wir unangetastet, da er systemisch ist. Wir ändern nur die Daten-Ebene!

### 4. Mapping Panel UI (`MappingUI.ts`)
#### [MODIFY] [MappingUI.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/MappingUI.ts)
- Die Standard-Mappings (`global_node`, `global_edge`) und die Fallback-Logiken an die neuen Felder anpassen.

### 5. LLM Pipeline (`LLMService.ts` & Prompt Markdown Dateien)
#### [MODIFY] `public/prompts/` (diverse .md Dateien)
- Die Prompts anweisen, statt `type` nun die neuen spezifischen Begriffe (wie `category` und `relation`) im JSON zu generieren.

## Verification Plan

1. **Typsicherheit:** TypeScript-Kompilierung prüfen (npm run build).
2. **Import-Test:** Ein bestehendes JSON (z.B. mythology oder ein marine-biology Set) importieren und sicherstellen, dass das alte `type` Feld sauber in die neuen Konzepte gemappt wird und die Knoten erscheinen.
3. **Generierungs-Test:** Einen kurzen Test-Graphen via Build 5 Pipeline generieren, um zu sehen, ob das LLM die neuen Begriffe verwendet.
