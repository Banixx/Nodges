# Analyse und Implementierungsplan: Datengetriebenes Kanten-Mapping in Prompts

## Problembeschreibung
Auf dem vom Benutzer geteilten Screenshot ist zu sehen, dass fuer die Kanten (Edges) keine Verbindungslinien im Mapping-Panel gezeichnet werden. 
Dies ist das korrekte technische Verhalten fuer die geladenen Daten, da:
1. Die Kanten-Farbe und Kanten-Staerke als **konstante Mappings** definiert sind:
   - `color: { source: 'constant', function: 'constant', params: { color: '#FFD700' } }`
   - `thickness: { source: 'constant', function: 'constant', params: { value: 0.1 } }`
2. Konstante Mappings keine Quell-Attribute besitzen und daher definitionsgemess keine Verbindungslinien im Mapping-Panel zeichnen.

**Das eigentliche Problem**:
Die LLM-Prompts leiten das LLM dazu an, fuer Kanten standardmaessig immer konstante Mappings zu generieren (z. B. feste Kantenfarbe `#aaaaaa`). Da Nodges ab Build 5 jedoch alle Kanten-Visualisierungen global ueber `global_edge` steuert, ist die einzige Moeglichkeit, Kanten je nach Typ unterschiedlich einzufaerben, ein **datengetriebenes, kategoriales Mapping** (z. B. basierend auf dem `type`- oder `label`-Attribut der Beziehung).

Wenn das LLM standardmaessig ein kategoriales Mapping fuer Kanten generiert, sieht der Benutzer:
1. Automatisch gezeichnete Verbindungslinien von `type` oder `label` zu `Farbe` im Mapping-Panel.
2. Unterschiedlich gefaerbte Kanten in der 3D-Szene je nach Beziehungstyp.

---

## Loesungsansatz

Wir passen die Prompts in `build_6_prompt.md`, `build_8_mapping_prompt.md` und `LLMService.ts` an, damit das LLM bei Kanten standardmaessig ein kategoriales Mapping fuer die Farbe basierend auf `type` (oder `label`) verwendet:

### Aenderung in den Prompts
Anstelle eines festen konstanten Farbwerts weisen wir das LLM an, die Kantenfarbe kategorial zu mappen:
```json
      "global_edge": {
        "color": { "source": "type", "function": "categorical" },
        "thickness": { "source": "constant", "function": "constant", "params": { "value": 0.1 } }
      }
```
Dies zwingt das LLM, die Kantenfarben ueber das kategoriale Attribut `type` (oder `label`) zu steuern, was zur Generierung von Verbindungslinien im UI fuehrt.
