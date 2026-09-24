# 02 LLM-Integration und Datenpipelines

Dieses Kapitel widmet sich der komplexesten und mächtigsten Komponente von Nodges: der Datengenerierungs- und Verarbeitungspipeline mittels Large Language Models. 

Nodges behandelt LLMs nicht als einfache Chatbots, sondern orchestriert sie als agentische Systeme. Das LLM agiert als "Ontologie-Architekt" und "Daten-Miner", der unstrukturierte Prompts, rohe Texte oder externe Datenquellen analysiert und in hochstrukturierte 3D-Graphen übersetzt.

---

## 1. Die Methodik: Der 2-stufige Generierungs-Workflow

> **Visualisierung:** Siehe [03_ZweistufigenGenerierungsWorkflow_001.mmd](03_ZweistufigenGenerierungsWorkflow_001.mmd)

Ein zentrales Problem der frühen Nodges-Builds (Build 1-4) waren LLM-Halluzinationen und das Brechen von JSON-Schemata bei komplexen Graphen. Das LLM generierte Attribute in den Daten, die im Schema nie definiert wurden, oder vergaß Relationen.
Die Lösung ist der **2-stufige Workflow**, der ab Build 5 eingeführt und mit Build 10 perfektioniert wurde.

### Phase 1: Die Ontologie-Phase (`ontology_prompt.md`)
Bevor auch nur ein einziger Datenpunkt generiert wird, wird das LLM gezwungen, das Regelwerk der neuen Welt zu definieren.
- Der System-Prompt weist das LLM an, das Thema zu analysieren und ein Metadaten-Schema (`dataModel`) sowie visuelle Präferenzen (`visualMappings`) zu entwerfen.
- In dieser Phase bleibt das Array für die eigentlichen `entities` und `relationships` **strikt leer**.
- Das System parst das zurückgegebene JSON und erstellt dynamisch ein Zod-Laufzeitschema aus der vom LLM erfundenen Ontologie.

### Phase 2: Die Instanz-Phase
Erst jetzt wird das in Phase 1 entworfene Schema als harter Constraint genutzt.
- Das LLM wird angewiesen, nun die echten Daten (`entities` und `relationships`) zu generieren.
- Durch Zod (und Features wie *Structured Outputs* / *JSON Schema Mode*) ist das LLM physisch unfähig, Attribute zu erfinden, die es nicht selbst in Phase 1 definiert hat.
- Das Resultat ist ein absolut valider, halluzinationsfreier Datensatz.

---

## 2. Die Evolution der Pipelines (Build 6 bis Build 10)

> **Visualisierung:** Siehe [03_PipelineEvolution_003.mmd](03_PipelineEvolution_003.mmd)

Die Architektur von Nodges hat sich evolutionär weiterentwickelt, um unterschiedlichen Anforderungen an Qualität, Geschwindigkeit und Kosten gerecht zu werden.

### 2.1 Build 6: Der JSON Schema Constraint Mode
Die Basis-Pipeline. Nutzt intensiv Zod, um das LLM auf strukturierte Ausgaben festzunageln. Sehr schnell, sehr zuverlässig für Standardthemen ("Erstelle mir einen Graphen über das Sonnensystem"), greift jedoch nur auf das latente Wissen (Weights) des Modells zu.

### 2.2 Build 8: Faktencheck und Semantic Web (Wikidata)
Um die "Wahrheit" der Daten zu garantieren und das Modell zu erden (Grounding), wurde Build 8 entwickelt.
- **Ablauf:** Der User gibt einen Prompt ein -> LLM extrahiert Suchbegriffe -> Nodges fragt live über die Wikidata-API SPARQL-Queries ab -> Die harten, verifizierten RDF/SPARQL-Triples kommen zurück -> Das LLM transformiert diese Triples in das Nodges-Schema.
- **Vorteil:** Keine Halluzinationen bei harten Fakten (Geburtsdaten, Distanzen, taxonomische Zugehörigkeiten).

### 2.3 Build 9: Vektor-Deduplizierung
Bei sehr großen oder iterativ gewachsenen Graphen neigen LLMs dazu, Entitäten doppelt anzulegen (z.B. "USA" und "United States"). 
- Build 9 nutzt Embeddings (Vektorrepräsentationen von Texten).
- Nach der Generierung vergleicht das System die Vektoren aller Knoten. Knoten mit einer Kosinus-Ähnlichkeit von > 95% werden verschmolzen.

### 2.4 Build 10: Die modulare, konfigurierbare Pipeline

> **Visualisierung:** Siehe [03_Build10ModulKonfiguration_002.mmd](03_Build10ModulKonfiguration_002.mmd)

Build 10 fasst alle bisherigen Erkenntnisse in einem ultimativen, modularen UI zusammen. Der Benutzer ist nicht mehr auf eine starre Pipeline angewiesen, sondern konfiguriert den Datenfluss im `CreatePanel` live.

**Die 4 Kern-Module der Build 10 Pipeline:**

1. **Modell-Quelle (Inferenz-Backend):**
   - *Cloud:* Routing über OpenRouter, OpenAI, Anthropic für maximale Intelligenz (z.B. GPT-4o, Claude 3.5 Sonnet).
   - *Lokal (Local-First):* Direkte Anbindung an lokale Inferenz-Server wie Ollama (`http://localhost:11434`) oder LM Studio. Garantiert 100% Privacy und null API-Kosten.

2. **Grounding-Strategie:**
   - *Kein Grounding:* Nutzt nur die Modellgewichte (wie Build 6).
   - *Wikidata Live:* Faktencheck über SPARQL (wie Build 8).
   - *RAG (Retrieval-Augmented Generation):* Erlaubt das Einlesen von URLs oder PDFs als Basis für die Graphgenerierung.
   - *Vektor-Deduplizierung:* Nachgelagerte Bereinigung (wie Build 9).

3. **Qualitätssicherung (QA & Evaluierung):**
   - *Keine:* Schneller Single-Pass.
   - *Generator + Kritiker (Multi-Pass):* Ein zweiter LLM-Agent prüft den generierten Graphen auf logische Fehler und korrigiert ihn selbstständig, bevor er an die UI gesendet wird.
   - *Human-in-the-loop:* Das Generierungsergebnis wird in einem modalen Fenster abgefangen. Der Mensch reviewt, löscht oder editiert Entitäten, bevor sie in 3D gerendert werden.

4. **Kanten-Bewertungsmethode (Edge Weighting):**
   - *LLM-Schätzung:* Das LLM "rät" die Stärke der Beziehung.
   - *Feste Taxonomie:* Kantenstärken sind durch Klassen fest definiert.
   - *Kosinus-Ähnlichkeit:* Kantenstärken werden algorithmisch aus der semantischen Nähe der verbundenen Knoten-Embeddings berechnet.

---

## 3. Architektur der LLM-Integration im Code

### 3.1 `LLMService.ts` als Single Source of Truth
Alle Kommunikation mit der Außenwelt (APIs, lokale LLMs, Vektor-Stores) läuft zwingend über den `LLMService`.
- **Verbot redundanter Fetches:** Es dürfen keine `fetch`-Calls an Provider irgendwo in UI-Komponenten oder im SceneManager platziert werden.
- **Provider-Abstraktion:** Das restliche System muss nicht wissen, ob Claude 3.5 oder Llama-3 lokal antwortet. `LLMService` normalisiert Inputs und Outputs.

### 3.2 Error Handling und Resilience

> **Visualisierung:** Siehe [03_LLMServiceFehlerbehandlung_004.mmd](03_LLMServiceFehlerbehandlung_004.mmd)

LLMs sind stochastische Systeme; Netzwerkfehler oder Ratelimits (HTTP 429) sind alltäglich.
- `LLMService` implementiert Exponential Backoff und Retry-Logiken.
- Fällt ein Cloud-Provider aus, kann das System heuristisch vorschlagen, auf einen konfigurierten lokalen Provider (Ollama) als Fallback umzuschalten.
- Bei Fehlern (z.B. Zod Schema-Validation schlägt fehl) stürzt das Frontend nicht ab (White-Screen of Death). Der Fehler wird über den zentralen `ErrorHandler` an die UI (Toasts/Modals) delegiert, und die alte 3D-Szene bleibt erhalten (`clearScene` wird nur bei Erfolg getriggert).
