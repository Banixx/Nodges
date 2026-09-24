# Übersicht: Modularer Pipeline-Ansatz für Build 10 (Fülle von Möglichkeiten)

Das Ziel von Build 10 ist die Implementierung einer konfigurierbaren, modularen Generierungs-Pipeline. Der Benutzer entscheidet über verschiedene Bausteine (Dropdowns/Optionen im UI), wie die strukturierte JSON (Entitäten, Eigenschaften, Beziehungen) aus einem freien Prompt generiert werden soll.

Die bestehende Codebasis wird so erweitert, dass alle vorherigen Builds (5, 6, 8, 9) sowie die Kernfunktionen (Speichern, Laden, Visualisieren) uneingeschränkt weiterfunktionieren.

---

## 1. Die vier Bausteine der Build 10 Pipeline

Der Benutzer kann im UI für jeden Schritt der Pipeline aus folgenden Optionen wählen:

### A. Baustein 1: Modell-Quelle (Inferenz)
*   **Option A.1: Cloud-LLM (BYOK)**
    *   Nutzung externer APIs (OpenRouter, OpenAI, Anthropic) mit dem im LocalStorage hinterlegten API-Key.
    *   *Vorteil:* Sehr hohe Qualität, schnelles Generieren, Zugriff auf Top-Modelle wie GPT-4o, Claude 3.5 Sonnet oder DeepSeek V3/V4.
*   **Option A.2: Lokales LLM**
    *   Verbindung mit einer lokalen Inferenz-Software (LM Studio oder Ollama) über eine OpenAI-kompatible Schnittstelle (`http://localhost:1234/v1` oder `http://localhost:11434/v1`).
    *   *Vorteil:* 100% datenschutzfreundlich, keine API-Kosten, unbegrenzte Nutzung. Realistisch bei 12 GB VRAM sind 7B-14B Modelle (z. B. Qwen2.5-14B-Instruct oder Llama-3.1-8B).

### B. Baustein 2: Grounding / Wissensquelle
*   **Option B.1: Kein Grounding (Zero-Grounding / Schema-Constrained)**
    *   Das LLM generiert die Entitäten und Beziehungen direkt aus seinem internen parametrischen Wissen heraus, eingeschränkt durch ein striktes JSON-Schema.
*   **Option B.2: Wikidata-Faktencheck (Multi-Step / SPARQL)**
    *   Die Begriffe werden zuerst über die Wikidata Search API gesucht, um exakte Q- und P-IDs zu finden. Daraus wird eine SPARQL-Query gebaut, live ausgeführt und die Ergebnisse als tabellarischer Kontext an das LLM gegeben (analog Build 8).
*   **Option B.3: RAG (Rohdaten & URL-Inhalt)**
    *   Der Benutzer fügt Rohdaten (Texte, Notizen, CSV) direkt ein, oder gibt eine Website-URL an, die eingelesen und als Kontext mitgegeben wird.
*   **Option B.4: Vektor-Deduplizierung**
    *   Nach dem ersten Generierungslauf wird eine semantische Entity Resolution über einen lokalen Vektorstore (mittels Embeddings) durchgeführt, um Duplikate zu verschmelzen und Beziehungen zu konsolidieren (analog Build 9).

### C. Baustein 3: Qualitätssicherung
*   **Option C.1: Keine zusätzliche Prüfung (Direkter Durchlauf)**
    *   Das generierte JSON wird direkt validiert und gerendert.
*   **Option C.2: Generator + Kritiker (Zwei-Agenten-Pipeline)**
    *   Das generierte JSON wird an einen zweiten LLM-Aufruf übergeben. Dieser "Kritiker" prüft das Schema auf Widersprüche, unplausible Beziehungsstärken oder falsche Relationen und korrigiert diese.
*   **Option C.3: Human-in-the-loop Review**
    *   Vor dem Rendern in der 3D-Szene wird das JSON in einer kompakten UI-Tabelle/Liste angezeigt. Der Benutzer kann Entitäten oder Beziehungen löschen, Namen korrigieren oder Werte anpassen.

### D. Baustein 4: Bewertungsmethode (Intensität & Stärke)
*   **Option D.1: LLM-Schätzung**
    *   Das Sprachmodell schätzt die Stärke von Attributen und Beziehungen frei auf einer Skala von 0 bis 100.
*   **Option D.2: Kontrolliertes Vokabular (Feste Taxonomie)**
    *   Es wird eine begrenzte Auswahlliste von Relationstypen (z. B. "beeinflusst", "verhindert", "verstärkt") vorgegeben.
*   **Option D.3: Kosinus-Ähnlichkeit (Embedding-Basiert)**
    *   Die Stärke der Beziehung zwischen zwei Entitäten wird mathematisch über die Kosinus-Ähnlichkeit ihrer Vektor-Embeddings berechnet.

---

## 2. Technische Integration & Datenfluss

### Schema-Kompatibilität
Build 10 nutzt das bewährte **Schema 5.0** (aus Build 5, 6, 8, 9). Dadurch ist sichergestellt, dass:
1.  Der `DataParser` die Daten fehlerfrei parsen kann.
2.  Die visualisierten Graphen im `MappingUI` angepasst werden können.
3.  Die Export-Funktionen (`ExportManager.ts`) das Dateiformat nativ speichern können.
4.  Der Dateiload-Workflow in `App.ts` unberührt bleibt.

### Metadaten-Anreicherung
Im generierten JSON-Objekt werden die gewählten Build-Optionen direkt in den Metadaten dokumentiert:
```json
{
  "system": "Thema des Graphen",
  "metadata": {
    "schemaVersion": "5.0",
    "generationDetails": {
      "prompt": "Benutzer-Prompt...",
      "pipeline": "build10",
      "build10_config": {
        "modelSource": "cloud",
        "grounding": "wikidata",
        "qualityAssurance": "generator_critic",
        "ratingMethod": "llm_estimation"
      },
      "timestamp": "2026-07-14T..."
    }
  },
  "dataModel": { ... },
  "data": { "entities": [], "relationships": [] }
}
```

### UI-Architektur im "Create"-Tab
Im `CreatePanel.ts` wird unter der Generierungs-Modus-Auswahl ein neues, dynamisches Konfigurations-Panel ("Build 10 Einstellungen") eingeblendet, wenn "Build 10" ausgewählt ist.
Dieses enthält:
*   Dropdowns/Radio-Buttons für die vier Bausteine.
*   Ein URL/Text-Eingabefeld für den RAG-Kontext (wird nur eingeblendet, wenn RAG aktiviert ist).
*   Einen Toggle für die API-Endpoint-Konfiguration (Cloud vs. Lokal).

---

## 3. Implementierungsplan (Code-Schnittstellen)

1.  **Erweiterung `LLMService.ts`**:
    *   Hinzufügen einer Methode `generateGraphDataBuild10(prompt, config, provider, model, onProgress, onStepComplete)`.
    *   Implementierung der lokalen API-Endpoints für Ollama (`http://localhost:11434/v1`) und LM Studio (`http://localhost:1234/v1`).
    *   Integration des Generator-Kritiker-Prompts.
    *   Integration der Kosinus-Ähnlichkeit für das Embedding-basierte Scoring.
2.  **Erweiterung `CreatePanel.ts`**:
    *   Erweiterung der `pipelineSelect`-Optionen um `build10` ("Build 10 (Konfigurierbare Pipeline)").
    *   Dynamisches Rendern der Einstellungs-Optionen für Build 10.
    *   Übergabe des Konfigurations-Objekts an die neue `LLMService`-Methode.
3.  **Sicherung der Abwärtskompatibilität**:
    *   Die bestehenden Logiken von `generateGraphDataBuild6`, `generateGraphDataBuild8` etc. bleiben unberührt.
    *   Der `DataParser` verarbeitet das Ergebnis wie gewohnt als Schema 5.0.
