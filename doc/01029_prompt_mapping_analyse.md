# Analyse: Prompts und Visual Mappings fuer Kanten (Edges)

## Befund und Ursachen fuer Node-only Mappings

Bei der Analyse der Prompts und der JSON-Beispielstrukturen wurden gravierende Widersprueche und Fehler identifiziert, die dazu fuehren, dass das LLM Kanten-Mappings (Edges) entweder unvollstaendig, fehlerhaft oder gar nicht generiert:

### 1. Widerspruechliche Namenskonventionen in Prompts
In `C:/Users/ich/Desktop/code/_projects/Nodges/public/prompts/build_6_prompt.md` steht:
- *"Erzeuge visualMappings.defaultPresets.global_node und visualMappings.defaultPresets.global_edge."* (Strikte Verwendung von `global_node` und `global_edge`).

Im direkt darauf folgenden Beispiel-JSON in `C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts` werden jedoch Platzhalter verwendet:
- `"<TypName>": { ... }` (Knoten)
- `"<KantenTyp>": { ... }` (Kanten)

Das verunsichert das LLM: Es weiss nicht, ob es `global_node` oder den konkreten Typnamen (z. B. `person`, `developed_by`) eintragen soll. Wenn das LLM spezifische Kanten-Typnamen (wie `links`) verwendet und diese nur eine feste Farbe enthalten, werden sie in `DataParser.ts` **nicht** zu `global_edge` normalisiert und gehen verloren.

### 2. Syntax-Fehler bei konstanten Werten (`params.size` vs. `params.value`)
In allen drei Prompts (`build_5_visual_prompt.md`, `LLMService.ts` und `build_8_mapping_prompt.md`) wird fuer konstante Werte (z. B. Linienstaerke) folgendes Beispiel verwendet:
- `"thickness": { "source": "constant", "function": "constant", "params": { "size": 0.1 } }`

**Der Fehler**: `VisualMappingEngine.ts` erwartet bei konstanten Mappings den Parameter-Schluessel `value` (bzw. direkt ein `value`-Feld) und nicht `size`.
Da `size` uebergeben wird, kann die Engine den Wert nicht lesen, faellt auf `1.0` zurueck und begrenzt diesen bei Kanten auf das Maximum von `0.3`. Kanten werden dadurch extrem dick dargestellt.

---

## Geplante Korrekturen

1. **Beispiel-JSON in `LLMService.ts` (Build 6) korrigieren**:
   Wir ersetzen die Platzhalter `"<TypName>"` und `"<KantenTyp>"` im Beispiel-JSON durch `global_node` und `global_edge`. Zudem korrigieren wir `params.size` zu `params.value`.

2. **Kompakten Prompt in `build_6_prompt.md` schaerfen**:
   Strikten Hinweis einbauen, dass ausschliesslich `global_node` und `global_edge` im Presets-Objekt verwendet werden duerfen.

3. **Wikidata-Transformationsprompt in `build_8_mapping_prompt.md` korrigieren**:
   `params.size` zu `params.value` abaendern.

4. **Visual-Prompt fuer Build 5 in `build_5_visual_prompt.md` korrigieren**:
   Die Platzhalter zu `global_node` und `global_edge` vereinheitlichen und `params.size` zu `params.value` korrigieren.
