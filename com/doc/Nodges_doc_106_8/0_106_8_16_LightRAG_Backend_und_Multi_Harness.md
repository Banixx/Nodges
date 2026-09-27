# 16 LightRAG Backend und Multi-Harness Integration

Dieses Kapitel dokumentiert das dedizierte Python-FastAPI Backend (`lightrag-backend`), die Graph-RAG-Pipeline (Retrieval-Augmented Generation) sowie die Kommunikationsmechanik des Multi-Harness COM-Busses in Version **0.106.8**.

---

## 1. Uebersicht und Architektur

Waehrend fruehere Entwicklungsstufen (Build 5 bis 10) primaer auf dem latenten Vorwissen von Sprachmodellen oder statischen SPARQL-Abfragen basierten, ermoeglicht das **LightRAG-Backend** die semantische Indizierung, Vektorisierung und topologische Abfrage eigener Dokumentensammlungen in Echtzeit.

```
┌─────────────────────────────────────────────────────────────┐
│ Nodges Frontend (TypeScript / Three.js / Vite auf Port 5173) │
│ - CreatePanel UI                                            │
│ - LightRAGService.ts                                        │
│ - DataParser.ts (Schema 5.2 Normalisierung)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ Proxy: /lightrag-api
┌──────────────────────────────▼──────────────────────────────┐
│ LightRAG Backend (Python FastAPI auf Port 8000)             │
│ - main.py (REST API Router)                                 │
│ - lightrag-hku Engine                                       │
│ - Working Dir: lightrag-backend/rag_storage                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ Inferenz & Embeddings
┌──────────────────────────────▼──────────────────────────────┐
│ Externe Provider (OpenRouter API)                           │
│ - Embedding-Modell: qwen/qwen3-embedding-8b (Dim 4096)      │
│ - LLM-Synthese: Chat-Completions                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Das Python FastAPI Backend (`lightrag-backend/`)

### 2.1 Laufzeitumgebung und Installation
- **Virtuelle Umgebung:** `/workspace/lightrag-backend/venv` (im Linux-Container) bzw. `W:/lightrag-backend/venv` (Windows-Zugriff).
- **Kern-Abhaengigkeiten:** `fastapi`, `uvicorn`, `lightrag-hku`, `pydantic`, `python-dotenv`.
- **Startskript:** `npm run lightrag` oder `.devcontainer/start-lightrag.sh`.

### 2.2 RESTful API-Endpunkte

| Methode | Endpunkt | Funktion / Beschreibung |
|---|---|---|
| `GET` | `/health` | Prueft den Server- und Modellstatus (`{"status": "online", "lightrag_engine_active": true}`). |
| `POST` | `/query` | Fuehrt eine semantische Graph-RAG-Abfrage aus (`mode`: `hybrid`, `local`, `global`, `naive`). |
| `POST` | `/insert` | Speist Rohtext oder Dokumenteninhalte in den Vektorspeicher ein. |
| `GET` | `/databases` | Listet vorhandene Vektor- und Graphdatenbanken auf. |

### 2.3 Proxy-Konfiguration in Vite
Um CORS-Probleme im Browser zu vermeiden, leitet der Vite-Entwicklungsserver Anfragen ueber eine interne Proxy-Regel transparent weiter:
```
http://localhost:5173/lightrag-api/* ──► http://localhost:8000/*
```
Der Health-Check kann im Browser oder Terminal geprueft werden:
```bash
curl -s http://localhost:5173/lightrag-api/health
```

---

## 3. Der COM-Bus: Autonome Agenten-Kollaboration

Fuer die synchrone Zusammenarbeit zwischen conT (Antigravity auf Windows 11) und piCon (Pi-Agent im Linux-Container) verfuegt Nodges ueber ein ereignisgesteuertes Kommunikationsnetzwerk:

### 3.1 Komponenten des COM-Busses
- **Dateisystem-Waechter:**  
  - Linux-Seite: `tools/watch_com.mjs` (Node.js `fs.watch`).
  - Windows-Seite: `W:/tools/watch_com.ps1` (PowerShell `FileSystemWatcher`).
- **Ueberwachtes Verzeichnis:** Ausschliesslich `W:/com/` (versionierte Arbeitsdokumente, Plaene und Berichte).
- **Ereignis-Log:** `tools/com-bus/events.log` (liegt bewusst ausserhalb von `com/`, um rekursive Rueckkopplungen zu verhindern).

### 3.2 Ablauf einer Benachrichtigung
1. Ein Agent (z. B. conT) speichert ein Arbeitsdokument in `W:/com/doc/`.
2. Der Waechter registriert das Dateiereignis unmittelbar und schreibt eine Protokollzeile:
   `2026-09-27 09:00:15  erstellt  com/doc/...  (4250 B)`
3. Die Agenten-Erweiterung (`before_agent_start`) liest neue Eintraege automatisch und stellt sie als Kontextblock in den naechsten Prompt des Partner-Agenten.
4. **Pings:** Gezielte Weckrufe (`bash tools/nodges-com.sh ping conT "Nachricht"`) hinterlegen temporaere Triggerdateien, die vorrangig im Chat signalisiert werden.
