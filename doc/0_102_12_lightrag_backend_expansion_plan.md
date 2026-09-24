# Implementation Plan - Dynamische LightRAG Graph-Extraktion & Backend-Ausbau (Version 0.102.12)

Ausbau des LightRAG Python-Backends (`lightrag-backend/main.py`), um dynamische Entitaeten- und Beziehungs-Extraktion aus eingefuegten Kontexten auch im Entwicklungs-/Mock-Modus anzubieten.

## User Review Required

> [!NOTE]
> Dieser Schritt erweitert das Python-Backend um eine dynamische Begriffsextraktion aus eingefuegten Texten, sodass auch ohne verknuepftes Cloud-LLM sinnvolle, kontextbezogene Subgraphen an das Nodges Frontend zurueckgegeben werden.

## Proposed Changes

### Backend (`lightrag-backend/`)

#### [MODIFY] [main.py](file:///c:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/main.py)
- Speicherung eingespielter Texte in einem In-Memory-Wissensspeicher (`inserted_texts`).
- Dynamische Extraktion von Nomen/Konzepten und Relationen fuer RAG-Abfragen (`/query`), wenn die vollstaendige LightRAG Engine im Fallback-Modus laeuft.
- Erweiterung des `/health`-Endpunkts um die Anzahl gespeicherter Dokumente/Texte.

---

### Frontend & Unit Tests

#### [MODIFY] [LightRAGService.test.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/tests/LightRAGService.test.ts)
- Erweitern der Unit-Tests zur Ueberpruefung der verbesserten Graph-Transformation und Fehlerbehandlung.

## Verification Plan

### Automated Tests
- Ausfuehren der Vitest-Suite:
  ```bash
  npx vitest run src/tests/LightRAGService.test.ts
  ```
