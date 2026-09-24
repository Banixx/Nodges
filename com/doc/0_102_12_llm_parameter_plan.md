# Plan: Integration erweiterter LLM-Parameter (OpenRouter)

## 1. Relevante Parameter für Build 10
Für Build 10 ist eine streng strukturierte, deterministische Ausgabe (valid JSON, korrekte Ontologie) von höchster Wichtigkeit. Daher sind folgende Parameter aus der OpenRouter API besonders relevant:

*   **Temperature (0.0 - 2.0)**: Steuert die "Kreativität". Für unsere Graphen-Generierung ist ein niedriger Wert (z.B. 0.2) ideal, um konsistente und logische Strukturen (wie Planeten statt Asteroiden beim Sonnensystem) zu erzwingen, ohne zu halluzinieren.
*   **Top-P (0.0 - 1.0)**: Auch "Nucleus Sampling" genannt. Begrenzt die Tokenauswahl auf jene, deren kumulierte Wahrscheinlichkeit `p` erreicht. Nützlich, um abwegige Begriffe auszuschließen.
*   **Top-K (0 oder größer)**: Beschränkt das Modell hart auf die `k` wahrscheinlichsten Token. Hilft extrem, um das LLM auf etablierte Termini festzunageln.

*(Frequency- und Presence-Penalty sind für unseren Anwendungsfall weniger geeignet, da sie das Modell zwingen könnten, bei obligatorischen JSON-Schlüsseln oder Knotenattributen künstlich zu variieren, was das Schema brechen würde.)*

## 2. Anpassung der UI (`CreatePanel.ts`)
*   **Neuer Abschnitt**: Unterhalb der Modellauswahl im "Create"-Tab wird ein einklappbarer Bereich "Erweiterte LLM-Parameter" hinzugefügt.
*   **Bedienelemente**:
    *   Slider für `Temperature` (Min: 0.0, Max: 2.0, Step: 0.1, Default: 0.2).
    *   Slider für `Top-P` (Min: 0.0, Max: 1.0, Step: 0.05, Default: 1.0).
    *   Slider für `Top-K` (Min: 0, Max: 100, Step: 1, Default: 0).
*   **Status-Anzeige**: Neben jedem Slider wird der aktuell gewählte Wert dynamisch als Text angezeigt.
*   **Speicherung**: Die Werte können per `localStorage` persistiert werden, damit der User sie nicht jedes Mal neu einstellen muss.

## 3. Anpassung der Logik (`LLMService.ts`)
*   Das Interface für den Aufruf (`generateGraphData`, `generateGraphDataBuild6`, etc.) wird um ein optionales `options`-Objekt erweitert: `{ temperature?: number, top_p?: number, top_k?: number }`.
*   In der Kernfunktion `_executeLLMCall` werden diese Parameter, sofern sie gesetzt sind, an die jeweilige API (OpenRouter, OpenAI, Ollama etc.) im `body` des Requests übergeben.

## 4. Vorgehen
Da der Planungsmodus aktiv ist, wurde dieser Plan im `/doc`-Ordner erstellt. Es wurden noch keine Code-Dateien modifiziert.
Sobald die explizite Freigabe vorliegt, werde ich die Modifikationen in `src/ui/CreatePanel.ts` und `src/utils/LLMService.ts` wie oben beschrieben umsetzen.
