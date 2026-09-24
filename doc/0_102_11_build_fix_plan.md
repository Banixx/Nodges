# Implementierungsplan - Behebung von TypeScript-Typfehlern

Dieser Plan dokumentiert die Behebung von TypeScript-Compiler-Fehlern, die beim Ausführen von `npm run build` aufgetreten sind.

## Fehler und Lösungen

### 1. App.ts Typ-Mismatch bei `expandGraphNodeBuild10`
* **Fehler:** Argument von Typ `LLMProvider` kann nicht dem Parameter `'openrouter' | 'openai' | 'ollama' | undefined` zugewiesen werden.
* **Lösung:** In `src/utils/LLMService.ts` den Parameter-Typ für `provider` in `expandGraphNodeBuild10` auf den allgemeinen Typ `LLMProvider` erweitern.

### 2. VisualMappingEngine.ts Palette Typ-Mismatch
* **Fehler:** Argument von Typ `string | string[] | undefined` kann nicht dem Parameter von Typ `string | undefined` zugewiesen werden.
* **Lösung:** Bei den Aufrufen von `getCategoricalColor` und `getHeatmapColor` sicherstellen, dass `palette` als `string` übergeben wird (z. B. mittels `typeof mapping.palette === 'string' ? mapping.palette : undefined`).

### 3. MappingUI.ts Typ-Mismatches
* **Fehler A:** Argument von Typ `string | string[]` kann nicht dem Parameter von Typ `string` zugewiesen werden (Zeile 1050).
* **Lösung:** Typ-Prüfung für `mapping.palette` hinzufügen und falls es ein Array ist, das erste Element oder den Standardwert extrahieren.
* **Fehler B:** Argument von Typ `string | undefined` kann nicht dem Parameter von Typ `string` in `.includes()` zugewiesen werden (Zeile 1207).
* **Lösung:** Fallback-Wert für `mapping.function` definieren (z. B. `mapping.function || ''`), um die Signatur von `includes()` zu erfüllen.

### 4. LLMService.ts Ungenutzte Imports
* **Fehler:** Die Deklarationen `build8KeywordPromptRaw` und `build8SparqlPromptRaw` sind deklariert, aber ungenutzt.
* **Lösung:** Entfernen der beiden Imports aus `src/utils/LLMService.ts`.
