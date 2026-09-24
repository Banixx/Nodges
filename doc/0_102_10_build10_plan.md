# Implementierungsplan: Modularer Pipeline-Ansatz (Build 10)

Dieses Dokument beschreibt die konkreten Schritte zur Umsetzung von Build 10 in Nodges, wobei alle bestehenden Builds und Workflows vollstaendig erhalten bleiben.

---

## 1. Analyse der bestehenden Pipelines

In Nodges sind derzeit folgende Pipelines aktiv:
*   **Build 5**: Drei separate LLM-Aufrufe (Ontologie -> Daten -> Mapping).
*   **Build 6**: Ein einziger, schneller Aufruf unter Nutzung von Zod-Schema-Constraints (JSON Schema Mode).
*   **Build 8**: Wikidata-Faktencheck (Live-Suche nach IDs, Generierung einer SPARQL-Abfrage, Ausfuehrung und Transformation der Ergebnisse).
*   **Build 9**: Generierung analog Build 6, gefolgt von einer semantischen Vektor-Deduplizierung zur Konsolidierung.
*   **Refine**: Iterative Anpassung eines bestehenden Netzwerks.

Jede dieser Pipelines liefert letztlich ein JSON-Objekt, das dem Schema 5.0 entspricht und direkt via `App.loadGraphData` geladen werden kann.

---

## 2. Zielsetzung fuer Build 10

Build 10 bietet eine konfigurierbare Pipeline. Der Benutzer waehlt im UI aus vier Modulen:
1.  **Modell-Quelle**: Cloud-Modelle (OpenRouter, OpenAI, Anthropic) vs. Lokale Modelle (Ollama, LM Studio).
2.  **Grounding**: Kein Grounding, Wikidata Live, RAG (Text/URL), Vektor-Deduplizierung.
3.  **Qualitaetssicherung**: Keine, Generator + Kritiker (Multi-Pass), Human-in-the-loop (Vorab-Review).
4.  **Bewertungsmethode**: LLM-Schaetzung, Feste Taxonomie, Kosinus-Aehnlichkeit (Embeddings).

---

## 3. Konkrete Implementierungsschritte

### Schritt 3.1: Schnittstelle in `LLMService.ts`
Wir fuehren eine neue Methode in `LLMService.ts` ein:
```typescript
public static async generateGraphDataBuild10(
    prompt: string,
    config: Build10Config,
    provider: LLMProvider,
    model: string,
    onProgress?: (msg: string) => void,
    onStepComplete?: (stepNumber: number, stepName: string, content: string, extension: string) => void
): Promise<GraphData>
```

#### Lokale LLM-Verbindungen
*   Es werden zwei neue Standard-Provider-URLs hinzugefuegt (oder direkt ueber die bestehenden Schnittstellen abgewickelt):
    *   `Ollama`: `http://localhost:11434/v1/chat/completions` (OpenAI-kompatibel)
    *   `LM Studio`: `http://localhost:1234/v1/chat/completions`
*   Ein lokaler Verbindungs-Check wird implementiert.

#### Generator + Kritiker Logik
*   Nach dem Generierungsschritt (Schritt 1) wird das Ergebnis-JSON an ein "Kritiker"-Prompt geschickt:
    *   *Prompt:* "Pruefe dieses JSON auf Widersprueche, unplausible Beziehungsstaerken und logische Fehler. Korrigiere fehlerhafte Werte und gib ausschliesslich das korrigierte JSON zurueck."

#### Kosinus-Aehnlichkeit via Embeddings
*   Falls die Kosinus-Aehnlichkeit fuer Kantenstaerken aktiviert ist, wird fuer alle verbundenen Entitaeten ein Embedding generiert (`LLMService.generateEmbedding`).
*   Die Kantenstaerke wird anschliesslich als Kosinus-Aehnlichkeit (Wert zwischen 0 und 100) berechnet und im Graph-JSON ueberschrieben.

---

### Schritt 3.2: UI-Erweiterung in `CreatePanel.ts`
*   Die Auswahlliste `pipelineSelect` wird um den Wert `build10` erweitert:
    *   `{ value: 'build10', label: 'Build 10 (Konfigurierbare Pipeline)' }`
*   Ein neues DOM-Element `build10ConfigContainer` wird unterhalb der Pipeline-Auswahl eingefuegt.
*   Dieses Element wird dynamisch ein- und ausgeblendet (nur sichtbar, wenn `build10` ausgewaehlt ist).
*   **Elemente im Konfigurations-Panel:**
    *   Modell-Quelle: Dropdown (Cloud API-Key vs. Lokales LLM via Ollama/LM Studio)
    *   Grounding: Checkboxen/Dropdown (Keines, Wikidata, RAG, Deduplizierung)
    *   Qualitaetssicherung: Dropdown (Keine, Generator+Kritiker, Human-in-the-loop)
    *   Bewertungsmethode: Dropdown (LLM-Schaetzung, Feste Taxonomie, Kosinus-Aehnlichkeit)
*   Bei Klick auf "Generieren" wird die Konfiguration ausgelesen und an `LLMService.generateGraphDataBuild10` uebergeben.

---

### Schritt 3.3: Human-in-the-loop Review-UI
*   Wenn "Human-in-the-loop" aktiviert ist, wird das Generierungsergebnis vor dem Laden in die 3D-Szene in einem modalen Overlay angezeigt.
*   Der Benutzer sieht zwei Listen (Entitaeten und Beziehungen).
*   Jede Zeile kann editiert oder geloescht werden.
*   Erst nach Klick auf "Visualisieren" wird `app.loadGraphData` aufgerufen.

---

## 4. Validierung & Testing

*   **Abwaertskompatibilitaet:** Es wird sichergestellt, dass die alten Generierungsschritte (Build 6, 8, 9) wie gewohnt funktionieren und keine Seiteneffekte auftreten.
*   **Fehlertoleranz:** Sollte die Verbindung zu einem lokalen LLM fehlschlagen, wird eine verstaendliche Fehlermeldung ausgegeben und die Moeglichkeit geboten, auf Cloud-Inferenz umzuschalten.
*   **Unit Tests:** Ein neuer Test in `src/tests/` validiert die Zusammensetzung der Build 10 Konfigurationen.
