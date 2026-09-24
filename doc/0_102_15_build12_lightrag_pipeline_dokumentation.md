# Build 12: LightRAG Graph Retrieval Pipeline und Backend-Anbindung

> Version 0.102.15 -- Stand: 29. Juli 2026

---

## 1. Übersicht und Zielsetzung

Build 12 erweitert Nodges um eine vollwertige Graph-RAG (Retrieval-Augmented Generation) Pipeline durch Anbindung an ein dediziertes Python FastAPI-Backend mit `lightrag-hku`. Während frühere Builds (Build 5 bis Build 10) rein auf dem latenten Wissen von LLMs oder externen SPARQL-Abfragen (Wikidata) basierten, ermöglicht Build 12 das Indizieren, Durchsuchen und Visualisieren von eigenen Dokumentensammlungen und Wissensbasen in Echtzeit.

### Kernfunktionen von Build 12:
- **Dokumenten-Ingest (`/insert`)**: Texte und Dokumente werden direkt über die Nodges-Oberfläche in den LightRAG-Vektorspeicher und Wissensgraphen eingespeist.
- **RAG-Graphenabfrage (`/query`)**: Abfragen generieren einen maßgeschneiderten Teilgraphen (Entities + Relationships) sowie eine textuelle Synthese.
- **Multi-Query-Modi**: Unterstützung der Abfragemodi `hybrid`, `local`, `global` und `naive`.
- **Automatische Schematisierung**: Konvertierung der LightRAG-Graphenknoten und -Kanten in das standardisierte Nodges Schema 5.2.
- **Multi-Datenbank-Verwaltung**: Nahtlose Wechsel und Abfragen verschiedener LightRAG-Wissensspeicher (`/databases`).
- **Relation Set Normalisierung**: Bereinigung und Zuordnung generierter Beziehungs-Kategorien auf das Nodges-Laufzeitschema.

---

## 2. Architektur und Komponenten-Interaktion

Die Build 12 Architektur basiert auf einer klaren Trennung zwischen dem TypeScript/WebGL-Frontend und dem Python-Backend.

```mermaid
flowchart TD
    subgraph Frontend["Nodges Frontend (Vite / TypeScript / Three.js)"]
        UI[CreatePanel UI / FilePanel UI]
        LRS[LightRAGService.ts]
        DP[DataParser.ts]
        SM[StateManager.ts & SceneManager.ts]
    end

    subgraph Backend["LightRAG Backend (Python 3.10+ FastAPI)"]
        API[main.py - FastAPI Server]
        RAG[LightRAG Engine]
        STORE[(Working Dir / Vektorstore / Graphstore)]
    end

    subgraph External["Externe Dienste"]
        LLM[OpenRouter / OpenAI API]
        EMB[OpenAI Embedding Model]
    end

    UI -->|1. Health Check & Insert/Query| LRS
    LRS -->|2. HTTP POST /query oder /insert| API
    API -->|3. Abfrage / Indizierung| RAG
    RAG -->|4. Vektor- & Graphsuche| STORE
    RAG -->|5. LLM Synthesis & Embedding| LLM & EMB
    API -->|6. JSON Response {graphData, answer}| LRS
    LRS -->|7. Schema 5.2 Validierung| DP
    DP -->|8. Render Graph| SM
```

---

## 3. Python FastAPI Backend (`lightrag-backend/main.py`)

Das Backend läuft als eigenständiger Microservice (Standardport `8000`) und stellt RESTful APIs für das Frontend bereit.

### 3.1 Endpunkte

| Methode | Endpunkt | Beschreibung | Payload / Query | Response |
|---------|----------|--------------|-----------------|----------|
| `GET` | `/health` | Statusprüfer für UI Indikator | - | `{ "status": "online", "lightrag_engine_active": boolean }` |
| `POST` | `/query` | Führt Graph-RAG Abfrage aus | `{ "query": string, "mode": "hybrid"|"local"|"global"|"naive" }` | `{ "answer": string, "graphData": GraphData }` |
| `POST` | `/insert` | Fügt Text zur Knowledge Base hinzu | `{ "text": string }` | `{ "status": "success", "message": string }` |
| `GET` | `/databases` | Listet verfügbare Wissensdatenbanken | - | `{ "databases": [{ "id": string, "name": string }] }` |

### 3.2 CORS & Umgebungsvariablen

Für die reibungslose Kommunikation mit dem WebGL Frontend (Port 5173 oder Deno/Vite Proxies) ist CORS im Server konfiguriert (`allow_origins=["*"]`).

Umgebungsvariablen werden automatisch aus `.env.local` oder `.env` geladen:
- `VITE_OPENROUTER_API_KEY`: API-Schlüssel für LLM-Inferenz über OpenRouter.
- `OPENAI_API_KEY`: API-Schlüssel für Embedding-Modelle (`text-embedding-3-small`).
- `LIGHTRAG_WORKING_DIR`: Zielordner für die Vektor- und Graphdatenbanken.

---

## 4. Frontend Integration (`src/utils/LightRAGService.ts`)

Der `LightRAGService` kapselt die komplette Serverkommunikation im Frontend.

```typescript
export class LightRAGService {
    public static async checkHealth(baseUrl: string = 'http://localhost:8000'): Promise<{ online: boolean; engineActive: boolean }>
    public static async queryGraph(query: string, mode: 'local' | 'global' | 'hybrid' = 'hybrid', baseUrl: string = 'http://localhost:8000')
    public static async insertText(text: string, baseUrl: string = 'http://localhost:8000')
}
```

### Abfeuern einer Abfrage aus CreatePanel.ts

Im CreatePanel wählt der Nutzer die Pipeline `Build 12: LightRAG`. Beim Absenden schickt das UI den Prompt an `LightRAGService.queryGraph()`. Die zurückgegebene Struktur enthält sowohl die generierten Entitäten und Kanten als auch Metadaten für das Visual Mapping.

---

## 5. Abfragemodi (RAG Modes)

Build 12 unterstützt vier spezialisierte Retrieval-Strategien:

1. **Local Mode (`local`)**:
   Fokussiert auf unmittelbare Nachbarschaften und spezifische Entitäten im Wissensgraphen. Ideal für gezielte Fragen zu einzelnen Knoten.
2. **Global Mode (`global`)**:
   Aggregiert übergeordnete Community-Strukturen und thematische Zusammenhänge. Ideal für Zusammenfassungen und Überblicke.
3. **Hybrid Mode (`hybrid`)** *(Default)*:
   Kombiniert lokale Knotenbeziehungen mit globalen Community-Analysen für optimale Antwortqualität und maximale Graphendichte.
4. **Naive Mode (`naive`)**:
   Klassisches Vektor-Retrieval ohne Graphstruktur.

---

## 6. Relation Set Normalisierung und Datenmodell-Harmonisierung

Aus LightRAG extrahierte Beziehungen besitzen oft freie Textbezeichnungen. Der `DataParser.ts` normalisiert diese dynamisch auf vordefinierte Beziehungs-Sets oder transformiert sie in typisierte Attribute, um Überlappungseffekte und unsaubere Visualisierungen in der Three.js-Engine zu verhindern.

### GraphData Schema 5.2 Kompatibilität:
Build 12 garantiert strikte Kompatibilität mit Schema 5.2. Jeder von LightRAG gelieferte Graph erhält automatisch:
- Ein validiertes `dataModel` mit Property-Definitionen.
- Ein konfigurierbares `visualMappings`-Preset.
- Vollständige Attribute (`label`, `properties`, `position`) für jede Entität.

---

## 7. Entwicklungs- und Betriebs-Guide

### Backend starten:
```powershell
npm run lightrag
```
Oder manuell via Python Virtual Environment:
```powershell
.\lightrag-backend\venv\Scripts\python.exe lightrag-backend/main.py
```

### Frontend starten:
```powershell
npm run dev
```

### Automated Testing:
```powershell
npx vitest run src/tests/LightRAGService.test.ts
```
