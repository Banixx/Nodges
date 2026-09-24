# Implementierungsplan: LightRAG Pipeline Integration (Version 0.102.12)

Dieser Plan beschreibt die schrittweise Fertigstellung und Anbindung der LightRAG-Pipeline fuer Nodges.

## User Review Required

> [!IMPORTANT]
> Fuer den Betrieb der echten LightRAG-Pipeline wird ein laufendes Python 3.10+ Environment mit den Bibliotheken `lightrag-hku`, `fastapi` und `uvicorn` benoetigt. Alternativ kann für Frontend-Tests der implementierte Fallback-Mock-Modus des Backends genutzt werden.

## Proposed Changes

---

### Python-Backend (`lightrag-backend/`)

#### [MODIFY] [requirements.txt](file:///C:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/requirements.txt)
- Ergänzung um `fastapi`, `uvicorn`, `lightrag-hku`, `pydantic`, `python-dotenv`.

#### [MODIFY] [main.py](file:///C:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/main.py)
- Vollständige Implementierung des FastAPI-Servers.
- Integration von `LightRAG` Instanziierung (mit Support fuer konfigurierbare Working Directories und LLM-Bindings).
- Endpunkte:
  - `GET /health`: Health-Check fuer Statusanzeige in Nodges.
  - `POST /query`: Verarbeitet RAG-Abfragen und konvertiert Graph-Entitaeten in das Nodges JSON-Schema.
  - `POST /insert`: Fuegt neue Dokumente/Texte zur Wissensbasis in LightRAG hinzu.

---

### Frontend Services & Utils (`src/utils/`)

#### [NEW] [LightRAGService.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LightRAGService.ts)
- Klasse `LightRAGService` fuer die Kommunikation mit dem lokalen LightRAG Backend (`http://localhost:8000`).
- Methoden:
  - `checkHealth()`: Prüft, ob der LightRAG-Server erreichbar ist.
  - `queryGraph(query: string, mode: 'local' | 'global' | 'hybrid')`: Sendet RAG-Anfrage und wandelt Antwort in `GraphData` um.
  - `insertText(text: string)`: Fuegt Dokumente zur Wissensbasis hinzu.

---

### UI-Komponenten (`src/ui/`)

#### [MODIFY] [CreatePanel.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/CreatePanel.ts)
- Hinzufuegen eines LightRAG-Reiters / Abfrage-Bereichs im CreatePanel.
- Eingabefeld fuer Prompts und Modus-Auswahl ('hybrid', 'local', 'global').
- Visualisierung des zurueckgelieferten Wissensgraphen in der Three.js-Szene.

---

### Unit Tests (`src/tests/`)

#### [NEW] [LightRAGService.test.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/tests/LightRAGService.test.ts)
- Automated Unit-Tests für `LightRAGService` mit Mocks für Server-Responses und Fehlerbehandlung.

---

## Verification Plan

### Automated Tests
- Ausfuehrung der Vitest-Suite fuer den Frontend-Service:
  `npx vitest run src/tests/LightRAGService.test.ts`
- Ausfuehrung der Gesamt-Build-Prüfung:
  `npm run build`

### Manual Verification
1. Starten des Python FastAPIs in `lightrag-backend`:
   `python main.py` oder `uvicorn main:app --reload`
2. Aufrufen von Nodges im Browser (`npm run dev`).
3. Senden einer LightRAG-Query ueber das CreatePanel und Ueberpruefung der generierten 3D-Knoten und Kanten in Three.js.
