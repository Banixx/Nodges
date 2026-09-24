# Dokumentation: Prompt-Korrekturen fuer Kanten-Mappings und Konstanten-Syntax

## Hintergrund der Aenderungen

Bei der Generierung von Graphendaten durch das LLM traten zwei systematische Fehler auf:
1. **Verwendung von Typ-Platzhaltern statt globaler Schluessel**: In den Beispielen fuer Structured Output in den Prompts wurden Knoten- und Kanten-Presets oft mit Platzhaltern wie `"<TypName>"` oder `"<KantenTyp>"` deklariert. Das veranlasste das LLM dazu, typenspezifische Presets zu erstellen, die vom System (welches nur `global_node` und `global_edge` ausliest) ignoriert wurden.
2. **Ungueltiger Parameter-Schluessel fuer konstante Werte**: Die Prompts wiesen das LLM an, konstante Werte im Format `{"params": { "size": 0.1 }}` fuer Kantenstaerken zu deklarieren. Die VisualMappingEngine erwartet fuer konstante Werte jedoch ausschliesslich den Schluessel `value` (also `{"params": { "value": 0.1 }}`). Dies fuehrte dazu, dass Kanten-Staerken nicht gelesen werden konnten und stets auf den Maximalwert `0.3` gezwungen wurden.

---

## Durchgefuehrte Aenderungen

### 1. `C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts`
Die Ziel-Struktur fuer Build 6 wurde im systemPrompt so angepasst, dass im defaultPresets-Beispiel direkt die Schluessel `"global_node"` und `"global_edge"` verwendet werden. Der Parameter-Schluessel fuer die konstante Kanten-Dicke (`thickness`) wurde von `"size"` auf `"value"` korrigiert.

### 2. `C:/Users/ich/Desktop/code/_projects/Nodges/public/prompts/build_5_visual_prompt.md`
Die Pflichtstruktur und die Richtlinien fuer das visuelle Mapping wurden aktualisiert:
- Die Platzhalter `<Entity_Typ_A>` und `<Kanten_Typ_A>` wurden durch `global_node` und `global_edge` ersetzt.
- Regel 2 wurde umgeschrieben, um die ausschliessliche Verwendung von `global_node` und `global_edge` zu erzwingen.
- Die Syntax fuer konstante Werte wurde auf `params: { value: ... }` korrigiert.

### 3. `C:/Users/ich/Desktop/code/_projects/Nodges/public/prompts/build_8_mapping_prompt.md`
Im Beispiel-JSON fuer den Wikidata-Transformationsschritt (Build 8) wurde die Syntax fuer konstante Werte von `"params": { "size": ... }` auf `"params": { "value": ... }` korrigiert.

---

## Ergebnisse und Validierung
Durch diese Aenderungen erhaelt das LLM in allen Generation-Pipelines konsistente und syntaktisch korrekte Anweisungen. Sowohl Knoten- als auch Kanten-Mappings werden nun standardkonform unter `global_node` und `global_edge` abgelegt, und konstante Dicken- und Groessen-Mappings werden von der VisualMappingEngine korrekt interpretiert.
