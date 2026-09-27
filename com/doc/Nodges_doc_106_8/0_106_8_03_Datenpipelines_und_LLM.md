# 03 LLM-Integration und Datenpipelines

Dieses Kapitel erlaeutert die Datengenerierungs-, Extraktions- und Anreicherungspipelines von Nodges. Es beschreibt, wie Large Language Models (LLMs) nicht als einfache Textgeneratoren, sondern als agentische Ontologie-Architekten und Wissensextraktoren eingesetzt werden, um unstrukturierte Eingaben in praezise 3D-/4D-Netzwerke zu transformieren.

---

## 1. Die Methodik: Der zweistufige Generierungs-Workflow

> **Visualisierung:** Siehe [03_ZweistufigenGenerierungsWorkflow_001.mmd](03_ZweistufigenGenerierungsWorkflow_001.mmd)

Eine zentrale Herausforderung bei der automatisierten Grapherstellung durch LLMs stellen Halluzinationen und ungueltige JSON-Strukturen dar. In fruehen Entwicklungsphasen neigten Modelle dazu, uneinheitliche Attribute zu erfinden oder Relationen syntaktisch unvollstaendig zurueckzugeben.  
Nodges loest diese Problematik durch einen **zweistufigen Erstellungsprozess**:

```
[Benutzereingabe / Thema]
           │
           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 1: Ontologie-Design (ontology_prompt.md)         │
│ - Extraktion von Kategoriestrukturen & Typen           │
│ - Definition der Datenattribute (dataModel)            │
│ - Erstellung initialer Mapping-Regeln                  │
│ * Datenarrays (entities, relationships) bleiben LEER * │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
                  [Zod-Schema Erzeugung]
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 2: Instanziierungs-Phase                         │
│ - Zod-Schema dient als harter struktureller Constraint │
│ - Extraktion konkreter Entities & Relationships        │
│ - Syntaktisch garantierte Typentreue                   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
               [Valider 3D-Graphdatensatz]
```

### 1.1 Phase 1: Ontologie-Phase
Das Modell analysiert die domaenenspezifische Aufgabenstellung. Es definiert das Metamodell der neuen Datenwelt: Welche Knotentypen existieren? Welche Beziehungstypen verbinden sie? Welche quantitativen Attribute sind sinnvoll? Die Datenarrays fuer Knoten und Kanten bleiben in dieser Phase strikt leer. Aus der Antwort generiert das System zur Laufzeit dynamische Zod-Validatoren.

### 1.2 Phase 2: Instanziierungs-Phase
Das in Phase 1 festgelegte Schema wird dem LLM als restriktiver Constraint (ueber *Structured Outputs* bzw. *JSON Schema Mode*) vorgegeben. Das Modell generiert die eigentlichen Instanzdaten (`entities` und `relationships`). Ein Ausbrechen aus dem zuvor definierten Schema ist technisch ausgeschlossen.

---

## 2. Evolution der Datenpipelines (Build 6 bis Build 12 / 0.106.8)

> **Visualisierung:** Siehe [03_PipelineEvolution_003.mmd](03_PipelineEvolution_003.mmd)

Die Dateninfrastruktur von Nodges wurde kontinuierlich erweitert:

### 2.1 Build 6: JSON Schema Constraint Mode
Etablierte Zod als primaeres Validierungsrueckgrat. Garantiert syntaktische Korrektheit, basiert jedoch rein auf dem parametrischen Trainingswissen des Sprachmodells.

### 2.2 Build 8: Faktenverankerung via Semantic Web (Wikidata)
Ergaenzte eine Live-Abfrage ueber die SPARQL-Schnittstelle von Wikidata. Entitaeten werden anhand verifizierter RDF-Tripel extrahiert, wodurch Faktentreue bei historischen, wissenschaftlichen oder geografischen Daten gewaehrleistet wird.

### 2.3 Build 9: Vektorbasierte Deduplizierung
Verhindert Redundanzen bei inkrementell wachsenden Netzwerken. Vor der Aufnahme in den Szenengraphen berechnet das System Vektor-Embeddings der Entitaeten; bei einer Kosinus-Aehnlichkeit oberhalb eines Schwellenwerts (typischerweise > 95 %) werden Knoten semantisch verschmolzen.

### 2.4 Build 10: Die modulare Inferenz- und Evaluierungs-Pipeline

> **Visualisierung:** Siehe [03_Build10ModulKonfiguration_002.mmd](03_Build10ModulKonfiguration_002.mmd)

Das `CreatePanel` erlaubt die freie Orchestrierung von vier Kernstufen:

1. **Inferenz-Quelle:**
   - *Cloud (BYOK):* Anbindung ueber OpenRouter, OpenAI oder Anthropic (z. B. Claude 3.5 Sonnet, GPT-4o).
   - *Lokal (Local-First):* Lokale Inferenz via Ollama (`http://localhost:11434`) oder LM Studio fuer absolute Datensouveraenitaet und kostenfreie Nutzung.
2. **Grounding-Strategie:**
   - *Ohne Grounding:* Reines Modellwissen.
   - *Wikidata Live:* Faktencheck ueber strukturierte Wissensdatenbanken.
   - *LightRAG / Dokumenten-RAG:* Wissensextraktion aus lokalen Dokumenten oder URLs.
3. **Qualitaetssicherung (Multi-Pass / Human-in-the-Loop):**
   - *Single-Pass:* Schnelle Direktgenerierung.
   - *Kritiker-Agent (Generator-Critic-Loop):* Ein zweiter LLM-Aufruf evaluiert Logikbrueche und korrigiert Kantenrelationen vor der Visualisierung.
   - *Human-in-the-Loop:* Review-Modal erlaubt das Pruefen, Editieren und Loeschen von Entitaeten vor dem 3D-Rendern.
4. **Kantenbewertung (Edge Weighting):**
   - *Semantische Schaetzung:* Heuristische Bewertung durch das Modell.
   - *Taxonomische Klassen:* Feste Kantenstaerken nach Relationstyp.
   - *Kosinus-Distanz:* Automatische Berechnung der Kantengewichte aus Embedding-Distanzen.

### 2.5 Build 12 / 0.106.8: LightRAG Graph Retrieval Backend
Erweiterung um ein dediziertes Python-FastAPI Backend (`lightrag-backend/`), das Graph-basiertes RAG bereitstellt. Knoten und semantische Relationen werden aus unstrukturierten Textkorpora extrahiert und ueber das OpenRouter Embedding-Modell `qwen/qwen3-embedding-8b` (4096 Dimensionen) indexiert.

---

## 3. Implementierungsarchitektur im Code

### 3.1 Zentralisierung im `LLMService.ts`
Jegliche Netzwerkkommunikation mit KI-Providern ist strikt im `LLMService` gekapselt:
- **Keine dezentralen Aufrufe:** UI-Elemente und 3D-Manager duerfen keine eigenen Inferenz-Fetches durchfuehren.
- **Provider-Abstraktion:** Der Aufrufer uebergibt standardisierte Prompt- und Schemastrukturen; `LLMService` kuemmert sich um Provider-spezifische Header, Authentifizierung und JSON-Extraktion.

### 3.2 Fehlertoleranz und Ausfallsicherheit (Resilience)

> **Visualisierung:** Siehe [03_LLMServiceFehlerbehandlung_004.mmd](03_LLMServiceFehlerbehandlung_004.mmd)

- **Exponential Backoff:** Automatischer Neuversuch bei temporaeren Verbindungsabbruechen oder HTTP-Status 429 (Rate Limit).
- **Graceful Fallback:** Bei Ausfall externer APIs kann das System auf vordefinierte Fallback-Provider oder lokale Instanzen umschalten.
- **Schutz der 3D-Szene:** Validierungsfehler fuehren nicht zum Absturz des Renderers. Bestehende Visualisierungen bleiben unangetastet; Fehler werden als Feedback ueber das Benachrichtigungssystem (Toasts/Modals) ausgegeben.
