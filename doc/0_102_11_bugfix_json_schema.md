# Bugfix: Leere JSON-Graphen bei Build 6 / Build 10 Generierung

## Das Problem
Bei der Generierung von Graphen über Build 6 oder Build 10 wurde häufig ein leeres JSON (oder Arrays ohne Entitäten) zurückgegeben, insbesondere bei Modellen wie `morph-v3-large` oder via OpenAI. Die Ursache lag in der Implementierung des sogenannten "Structured Outputs" (JSON Schema) Modus in der `LLMService.ts`.

Nodges erfordert, dass das Sprachmodell dynamische Eigenschaften (wie `importance`, `type`, `age`, usw.) erfindet und direkt in die Objekte `entities` und `relationships` einfügt. Die `makeSchemaStrict`-Funktion hat das Zod-Schema jedoch in einen absoluten strikten Modus gezwungen (`additionalProperties: false`), wie es von der OpenAI-API für strukturierte Ausgaben gefordert wird.

Dies führte dazu, dass der Schema-Validator der API jede vom LLM eingefügte dynamische Eigenschaft (die nicht explizit im Schema vordefiniert war) entweder blockierte oder das Modell zwang, gar keine Entitäten zu generieren, da es die Anweisung "Generiere eigene Eigenschaften" nicht mit dem strikten Schema vereinbaren konnte. Zusätzlich hat die Methode `z.record()` überschrieben und somit dynamische Keys komplett zerstört.

## Die Lösung
1. **Zod Record Erhaltung**: Die Methode `makeSchemaStrict` in `c:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts` wurde korrigiert, damit sie `additionalProperties` als Objekt bestehen lässt, statt sie bedingungslos auf `false` zu überschreiben. Das repariert den Verlust von `z.record()` Zuweisungen.
2. **Deaktivierung von Strict Schema**: Die API-Aufrufe an OpenRouter und OpenAI wurden umgestellt. Statt `{ type: 'json_schema', strict: true }` wird nun wieder `{ type: 'json_object' }` verwendet. Das Modell erhält das JSON-Schema weiterhin im System Prompt als Vorlage, wird aber nicht mehr auf API-Ebene hart blockiert, wenn es eigene semantische Eigenschaften (`additionalProperties`) erfindet. 

Durch diese Änderung ist die API wieder flexibel genug, um die dynamischen Nodges-Eigenschaften zuzulassen, während weiterhin gültiges JSON sichergestellt wird.
