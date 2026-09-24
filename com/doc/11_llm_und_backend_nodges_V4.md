# Nodges – LLM-Integration und Backend

## 1. LLMService

`src/utils/LLMService.ts` (1545 Zeilen) ist die zentrale KI-Anbindung im Frontend. Sie folgt dem **BYOK-Prinzip** (Bring Your Own Key):

**Provider (ausgewählt):**
- `openrouter`, `openai`, `anthropic`, `ollama`, `lmstudio` (LM Studio local model).
- Fest verdrahteter Anbieter und fest verdrahtetes Modell: OpenRouter mit `deepseek/deepseek-v4.1-flash` (siehe `FIXED_PROVIDER`/`FIXED_MODEL`); die uebrigen Provider-Eintraege in `PROVIDER_MODELS` sind nur noch Altbestand.

**Einstellungen (localStorage):**
- `llm_provider`, `llm_model_{provider}` und `llm_key_{provider}` in `localStorage`.
- API-Keys können zusätzlich über `import.meta.env` (`.env`, z. B. `VITE_OPENROUTER_API_KEY`) bereitgestellt und per UI gesetzt/gelöscht werden.

**Fähigkeiten:**
- Modell-Listen von OpenRouter abrufen (`fetchModelsForProvider`) und lokale Ollama/LM-Studio-Endpunkte ansprechen.
- `expandGraphNodeBuild10(...)` – **Deep-Dive**: erweitert einen bestehenden Graphen um neue Knoten/Kanten zu einem Fokus-Knoten (nutzt den Build-10-Prompt).
- Weitere Build-5/8-Funktionen (`build_5_*`, `build_8_*`-Prompts) für Graphgenerierung, Ontologie und Visual-Mapping-Vorschläge.
- Fehlerbehandlung und Offline-Erkennung des LightRAG-Backends.

## 2. Prompts (`src/prompts/`)

Die KI-Generation ist promptgesteuert und nach Build-Phasen organisiert:

- **Build 5:** `build_5_data_prompt.md`, `build_5_ontology_prompt.md`, `build_5_visual_prompt.md`.
- **Build 6:** `build_6_prompt.md`.
- **Build 8:** `build_8_keyword_prompt.md`, `build_8_mapping_prompt.md`, `build_8_sparql_prompt.md`.
- **Build 10:** `build_10_prompt.md`, `build_10_expansion_prompt.md`, `build_10_keyword_prompt.md`, `build_10_sparql_prompt.md`.
- **Refine:** `refine_prompt.md`.

Gemeinsame Vorgaben (aus `build_10_prompt.md`):
- Aus einem Thema → Ontologie (Competency Questions), Instanzdaten, visuelles Mapping; Ausgabe exakt gemäß übergebenem JSON-Schema (Structured Output).
- `type`-Feld auf Top-Ebene ist verboten (verboten); Kategorisierung als Property (z. B. `"kategorie"`).
- Gruppen als eigenständige Entitäten verknüpft über Kanten (z. B. `belongs_to`).
- Wikidata-Q-IDs als Property `wikidata_id`.
- Kanten mit Pflichtfeldern `id`, `source`, `target`, `relation`.

## 3. LightRAG-Backend (Python/FastAPI)

`lightrag-backend/main.py` bietet eine optionale RAG-Schnittstelle:

- FastAPI-App mit CORS (`allow_origins: ["*"]`).
- Lädt `.env.local`/`.env`; mappt OpenRouter-Key auf `OPENAI_API_KEY`/`OPENAI_API_BASE` für LightRAG.
- Modelle: `QueryRequest { query, mode }`, `InsertRequest { text }`.
- LightRAG wird optional instanziiert (mit Fallback, `LIGHTRAG_AVAILABLE`-Flag).
- Start über `npm run lightrag` (nutzt venv-Python aus `lightrag-backend/venv`); Zielport 8000.
- Im DevContainer erreicht das Frontend das Backend über den Vite-Proxy `/lightrag-api` → `http://host.docker.internal:8000` (LightRAG läuft auf dem Windows-Host).

**Frontend-Anbindung:** `src/utils/LightRAGService.ts` (275 Zeilen) kapselt Aufrufe und Offline-Erkennung; `VectorStoreManager.ts` behandelt Vektor-Speicher.

## 4. Deno-Proxy

`deno-proxy/index.ts` ist ein minimaler Deno-Server:
- Erlaubt CORS nur für konfigurierte Origins (GitHub Pages `banixx.github.io` und localhost-Ports).
- Nur POST; liest `OPENROUTER_API_KEY` aus Deno-Env und leitet Anfragen an OpenRouter weiter.
- Wird genutzt, um CORS-/Key-Leaks in reinen Browser-Aufrufen zu vermeiden.

## 5. Datenhighlight: Deep-Dive

Im `App` registriert ein DOM-Listener (`nodges-deep-dive`) den Handler `handleDeepDive`:
- Holt aktiven Provider/Modell, ruft `LLMService.expandGraphNodeBuild10` auf.
- Lädt das resultierende Subgraph über `loadGraphData(..., 'DeepDive_{label}', true)` (append) in den aktiven Graphen.
- HMR-sicher: alter Handler wird vor Neu-Registrierung entfernt.
- Benachrichtigungen über `NotificationService`.

## 6. Bewertung

**Positiv:**
- BYOK mit mehreren Providern, inklusive lokaler Modelle (Ollama/LM Studio).
- Strukturierte JSON-Ausgabe über Schema-gesteuerte Prompts.
- Proxy/Backend entkoppeln KI- und RAG-Aspekte.

**Schwächen:**
- API-Keys in `localStorage`/Umgebungsvariablen sind ein Sicherheitsrisiko (Client-Keys).
- `LLMService` ist mit 1545 Zeilen sehr groß und Provider-spezifisch verdrahtet (fehlende Provider-Abstraktion).
- Backend/LightRAG/Deno-Proxy sind optionale Prozesse; ohne sie sind KI-Funktionen begrenzt. Erfordernisse (venv, Deno, Host-LightRAG) sind voraussetzungsreich.

---

*Weiter: `/workspace/com/doc/12_entwicklung_build_deploy_nodges_V4.md`.*
