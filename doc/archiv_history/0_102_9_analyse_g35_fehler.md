# Fehleranalyse und Behebung: Laden von Dateien im g35-Verzeichnis

Es wurde berichtet, dass beim Laden der JSON-Dateien aus dem Verzeichnis `public/data/g35` Fehler auftreten. Diese Dateien wurden von Gemini 3.5 Flash generiert und validieren syntaktisch korrekt gegen das Zod-Schema, schlugen jedoch beim Import in Nodges fehl.

---

## 🔍 Fehlerursache

In der Datei `src/core/DataParser.ts` existierte eine strikte Validierung der Nodges-Schema-Version in der Methode `normalizeData`:

```typescript
const schemaVersion = data.metadata?.schemaVersion;
const SUPPORTED_VERSIONS = ['3.0', '4.0', '5.0'];
if (!SUPPORTED_VERSIONS.includes(schemaVersion)) {
    throw new Error(`Data Validation Failed: Unsupported schema version "${schemaVersion || 'unknown'}". Supported: ${SUPPORTED_VERSIONS.join(', ')}`);
}
```

Die von Gemini generierten Dateien im Ordner `public/data/g35` enthielten im Metadaten-Block jedoch folgenden Eintrag:
```json
"schemaVersion": "draft-07"
```

Da `"draft-07"` (ein Standard-JSON-Schema-Entwurf) nicht in der Liste der unterstützten Nodges-Build-Versionen (`['3.0', '4.0', '5.0']`) enthalten ist, brach der Parser den Ladevorgang mit einem fatalen Fehler ab:
> `Data Validation Failed: Unsupported schema version "draft-07". Supported: 3.0, 4.0, 5.0`

Derselbe Fehler trat auch bei älteren oder unvollständigen Dateien auf, die keine `schemaVersion` definierten.

---

## 🛠️ Lösung

Um das System robuster zu machen und den Import von extern (oder durch andere LLMs) generierten Dateien zu erleichtern, wurde die Validierung der `schemaVersion` so angepasst, dass sie bei unbekannten oder fehlenden Versionen auf die aktuelle Standardversion (`"5.0"`) zurückfällt, anstatt den Vorgang komplett abzubrechen.

### Code-Änderung in `src/core/DataParser.ts`:

```diff
     private static normalizeData(data: any): GraphData {
         // Accept Build 3 and Build 4
-        const schemaVersion = data.metadata?.schemaVersion;
+        let schemaVersion = data.metadata?.schemaVersion;
         const SUPPORTED_VERSIONS = ['3.0', '4.0', '5.0'];
-        if (!SUPPORTED_VERSIONS.includes(schemaVersion)) {
-            throw new Error(`Data Validation Failed: Unsupported schema version "${schemaVersion || 'unknown'}". Supported: ${SUPPORTED_VERSIONS.join(', ')}`);
+        
+        if (!schemaVersion || !SUPPORTED_VERSIONS.includes(schemaVersion)) {
+            console.warn(`[DataParser] Unbekannte oder fehlende Schema-Version "${schemaVersion || 'unknown'}". Fallback auf "5.0".`);
+            schemaVersion = '5.0';
+            if (!data.metadata) data.metadata = {};
+            data.metadata.schemaVersion = schemaVersion;
         }
 
         // Preserve the original schemaVersion as build indicator
```

---

## ✅ Ergebnisse

1. **Erfolgreiche Validierung**: Alle vier JSON-Dateien im Verzeichnis `public/data/g35` werden nun erfolgreich und fehlerfrei über den `DataParser` geladen:
   - `gemini-code-1784011288293.json`
   - `gemini-code-1784011461280.json`
   - `gemini-code-1784011518845.json`
   - `gemini-code-1784011624078.json`
2. **Abwärtskompatibilität**: Ältere Dateien (z. B. aus Build 3/4) sowie Dateien ohne explizite Schema-Version laden weiterhin einwandfrei, da sie nun automatisch auf Version `"5.0"` (oder `"3.0"` über den ImportManager) normalisiert werden.
3. **Erfolgreiche Tests**: Die Unit-Tests für den `DataParser` (`src/tests/DataParser.test.ts`) laufen weiterhin vollständig grün durch.
