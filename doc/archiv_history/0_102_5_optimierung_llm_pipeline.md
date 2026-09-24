# Optimierung der LLM Pipeline (Robustheit & JSON)

Dieses Dokument fasst die Ergebnisse und Implementierungen zur Absturzsicherung der KI-Pipeline in Build 6 zusammen. Die Optimierungen basieren auf den Erkenntnissen vergangener Sessions aus dem `brain` Archiv.

## 1. Intelligenter Regex-Extraktor für JSON
In vorherigen Sitzungen gab es Probleme, bei denen Sprachmodelle (wie z. B. Qwen oder Morph) entweder fehlerhaft formatiertes JSON zurücklieferten oder es nicht korrekt in Markdown-Blöcke verpackten. 
Um dieses Problem zu beheben, wurde der `LLMService` überarbeitet. Der neue Extraktor prüft nun in einem zweistufigen Verfahren:
- Zuerst wird versucht, das JSON über klassische Markdown-Code-Blöcke (````json ... ````) zu extrahieren.
- Falls das fehlschlägt (oder das Modell reinen Text mit JSON gemischt liefert), sucht der Extraktor nach der ersten `{` und der letzten `}`.
Dies macht das Einlesen wesentlich fehlertoleranter.

## 2. Natives `json_schema` via OpenRouter (Strict Mode)
Die API von OpenRouter unterstützt strukturierte Ausgaben über den Parameter `response_format`. Um die Einhaltung des Schemas wirklich durchzusetzen (sodass Modelle nicht einfach benötigte Felder weglassen), muss jedoch `strict: true` gesendet werden.
Das Problem: Zod `.passthrough()`-Schemas (die Nodges für dynamische Properties wie `masse_kg` benötigt) sind von Natur aus nicht "strict", weswegen die API den Request mit einem 400 Fehler ablehnte.
Lösung: Es wurde eine Hilfsfunktion `makeSchemaStrict()` in `LLMService.ts` implementiert. Diese Funktion nimmt das generierte Zod-JSON-Schema und entfernt rekursiv alle störenden Einschränkungen (wie `.default`) und setzt `additionalProperties: false`. Das Schema ist dadurch strikt API-kompatibel, was die Fehlerquote bei der Generierung drastisch reduziert.

## 3. "Null-Guards" im CreatePanel
Das Problem: Wenn ein Sprachmodell ein ungültiges oder unvollständiges JSON zurückgab (z. B. `data` oder `entities` fehlte), führte das in der UI zu Abstürzen (`undefined is not an object`), was den Speichern- und Log-Prozess unterbrach.
Lösung: In `CreatePanel.ts` wurden umfassende Null-Guards eingefügt. Zugriffe auf `graphData`, `graphData.data` und `this.app.currentGraphData` werden jetzt durch Optionals (`?.`) und If-Statements (`if (graphData)`) geschützt. So wird bei fehlerhaften Generierungen nun ordnungsgemäß abgebrochen oder mit Default-Werten (`0` Knoten) geloggt, ohne dass die gesamte UI einfriert.
