# Konzept zur lokalen Implementation von LightRAG in Nodges

## Ausgangslage
Das Projekt Nodges ist eine clientseitige 3D-Netzwerkvisualisierung (TypeScript, Three.js). Die Anforderung besteht darin, "LightRAG" (Graph-based Retrieval-Augmented Generation) lokal zu implementieren.

## Moegliche Architekturansaetze fuer eine lokale Integration

### 1. Python-Backend (API-Integration)
Da LightRAG primaer als Python-Bibliothek verfuegbar ist, waere der Standardweg ein lokaler lokaler Server (z. B. FastAPI, Flask), der LightRAG ausfuehrt und von Nodges ueber HTTP-Requests abgefragt wird.
- **Vorteil:** Volle Kompatibilitaet zum originalen LightRAG-Code, Nutzung des Python-Oekosystems (LangChain, LlamaIndex, lokale LLMs ueber Ollama).
- **Nachteil:** Nodges wuerde ein Backend benoetigen, was die reine Frontend-Natur aufbricht.

### 2. Clientseitige (In-Browser) Implementation
Ein Nachbau der LightRAG-Logik in TypeScript (oder WebAssembly), um Vektorsuche und Graph-Traversal im Browser auszufuehren.
- **Vorteil:** Keine zusaetzliche Backend-Infrastruktur noetig.
- **Nachteil:** Hohe Komplexitaet beim Einbetten von Embeddings (z.B. via Transformers.js) und Graph-Datenbank-Logik in den Browser-Speicher; moegliche Performance-Probleme bei grossen Datensaetzen.

### 3. Hybrider Ansatz (Lokale LLM-Anbindung)
Nodges kommuniziert direkt mit einem lokalen LLM-Server (wie LM Studio oder Ollama), waehrend die Graph-RAG-Logik (Retrieval und Prompt-Assembling) in TypeScript innerhalb von Nodges abgewickelt wird.

## Architektur-Entscheidung: Externes lokales Backend (API)
Die Entscheidung fiel auf den Ansatz des externen, lokalen Backends. LightRAG wird als separater lokaler Dienst (voraussichtlich in Python) ausgefuehrt, der eine API bereitstellt. Nodges agiert weiterhin als reines Frontend und kommuniziert ueber HTTP-Requests (REST/WebSocket) mit diesem Dienst.

## Naechste Schritte fuer die Implementation
1. **API-Schnittstelle definieren:** Welche Daten und Endpunkte benoetigt Nodges konkret (z.B. fuer RAG-Abfragen, Graph-Generierung)?
2. **Backend-Umgebung aufsetzen:** Einrichtung des lokalen Python-Servers (z.B. FastAPI) parallel zu Nodges, um die originale LightRAG-Bibliothek einzubinden.
3. **Lokale LLM-Anbindung:** Konfiguration von LightRAG fuer die Nutzung lokaler Sprachmodelle (etwa via Ollama oder LM Studio).
4. **Nodges Service-Integration:** Erstellung eines `LightRAGService` in TypeScript innerhalb von Nodges, um die API anzusprechen und die generierten Graph-Daten in die 3D-Szene zu laden.

## Setup: Lokale Python-Umgebung
Um LightRAG als externen Dienst bereitzustellen, legen wir einen separaten Ordner (z.B. `lightrag-backend`) an.

### Geplante Struktur:
- `lightrag-backend/`
  - `main.py` (FastAPI Server fuer die Endpunkte)
  - `requirements.txt` (Abhaengigkeiten wie `fastapi`, `uvicorn`, `lightrag-hku`)
  - `venv/` (Lokales Virtual Environment)

### Initialisierung (Befehle):
1. `mkdir lightrag-backend`
2. `cd lightrag-backend`
3. `python -m venv venv`
4. `venv\Scripts\activate` (unter Windows)
5. `pip install fastapi uvicorn lightrag-hku`

## API-Schnittstelle (Entwurf)
Die Kommunikation zwischen Nodges und dem LightRAG-Backend erfolgt ueber REST-Endpunkte.

### Endpunkt: `/query` (POST)
Dieser Endpunkt nimmt eine Suchanfrage entgegen und liefert die generierte Antwort sowie den relevanten Graph-Kontext (Nodes und Edges) zurueck, den Nodges visualisieren kann.

**Request-Format (JSON):**
```json
{
  "query": "Was sind die Kernfunktionen von Nodges?",
  "mode": "hybrid" // optional: local, global, hybrid
}
```

**Response-Format (JSON):**
```json
{
  "status": "success",
  "query": "Was sind die Kernfunktionen von Nodges?",
  "answer": "Nodges ist eine Plattform fuer 3D-Netzwerkvisualisierung...",
  "graph_context": {
    "nodes": [
      { "id": "nodges", "label": "Nodges", "properties": { "type": "Software" } },
      { "id": "3d_vis", "label": "3D Visualisierung", "properties": {} }
    ],
    "edges": [
      { "source": "nodges", "target": "3d_vis", "relation": "features" }
    ]
  }
}
```
Dieser Entwurf stellt sicher, dass Nodges aus `graph_context` direkt eine Three.js-Szene rendern kann, waehrend `answer` im UI als Text ausgegeben wird.
