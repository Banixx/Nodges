# Implementation Plan - OpenRouter API & LightRAG Backend Anbindung (Version 0.102.13)

Anbindung des OpenRouter API-Schluessels und Konfiguration der LLM- sowie Embedding-Funktionen in `lightrag-backend/main.py` zur Nutzung von OpenRouter / OpenAI-kompatiblen Endpunkten in LightRAG.

## User Review Required

> [!IMPORTANT]
> Der OpenRouter API Key wird sicher ueber Umgebungsvariablen (`OPENROUTER_API_KEY` oder `.env`-Datei) geladen. Es werden keine API-Schluessel im Quellcode fest hinterlegt.

## Open Questions

- Welches Modell ueber OpenRouter soll standardmaessig fuer die Extraktion genutzt werden (z. B. `openai/gpt-4o-mini`, `anthropic/claude-3.5-sonnet` oder `deepseek/deepseek-r1`)?
- Welcher Embedding-Provider / welches Embedding-Modell soll fuer die Vektorsuche in LightRAG verwendet werden?

## Proposed Changes

### LightRAG Python Backend

#### [MODIFY] [main.py](file:///c:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/main.py)
- Einbinden von `python-dotenv` zum automatischen Laden der `.env`-Datei.
- Konfiguration der `llm_model_func` fuer LightRAG mit OpenRouter `base_url="https://openrouter.ai/api/v1"` und `api_key=os.getenv("OPENROUTER_API_KEY")`.
- Bereitstellung einer flexiblen Funktion `openrouter_complete` zur Kommunikation mit dem OpenRouter-API-Endpunkt.
- Vorbereitung der Embedding-Funktion fuer Vektorabfragen in LightRAG.

#### [NEW] [.env.example](file:///c:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/.env.example)
- Vorlage fuer Umgebungsvariablen (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `LIGHTRAG_WORKING_DIR`).

#### [MODIFY] [requirements.txt](file:///c:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/requirements.txt)
- Ergaenzung von `openai` / `httpx` Paketen, falls noch nicht vorhanden, zur reibungslosen API-Kommunikation.

## Verification Plan

### Automated Tests
- Ausfuehren von Vitest Integrationstests im Frontend: `npx vitest run src/tests/LightRAGService.test.ts`.

### Manual Verification
- Pruefen des Status-Endpunkts `http://localhost:8000/health` bzgl. `lightrag_engine_active: true`.
- Ausfuehren einer `/query` Abfrage an das Python-Backend mit geladenem OpenRouter Key.
