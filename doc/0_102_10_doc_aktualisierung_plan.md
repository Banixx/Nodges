# Plan zur Aktualisierung der Nodges-Dokumentation

## Übersicht und Ausgangslage

Die Dokumentation im Ordner `doc/archiv_history/NodgesDoc` ist stark veraltet. Seit ihrer Erstellung hat Nodges gravierende Architektursprünge (insbesondere durch Build 5, 6, 8, 9 und zuletzt Build 10) durchgemacht. 

Die wichtigsten Paradigmenwechsel, die in die neue Dokumentation einfließen müssen:
1. **Architektur (ab Build 5):** Strikte Trennung von Ontologie, Daten und Visual Mapping. Die Eigenschaft `type` ist nicht mehr dominant.
2. **Visual Mapping:** Keine typspezifischen Iterationen mehr. Nutzung von globalen Presets (`global_node`, `global_edge`). Position ist nun ein First-Class Channel.
3. **LLM-Datenpipeline:** Ein komplexes System (aktuell Build 10), das konfigurierbare Pipelines (Cloud vs. Lokal, Grounding via Wikidata/RAG, Evaluierung, Kosinus-Ähnlichkeit) und einen strikten 2-stufigen Workflow (Ontologie -> Instanz) bietet.
4. **Layout & Physik:** Physics-Engine fungiert primär als Fallback-Layout, wenn Positionen nicht manuell gemappt sind.
5. **Decoupled Mapping UI:** Die Benutzeroberfläche schlägt Mappings vor, statt feste Eingaben zu verlangen.

## Zielsetzung

Die neue Dokumentation soll schlanker, präziser und auf die aktuelle Architektur ausgerichtet sein. Veraltete Konzepte werden ins Archiv verbannt, redundante Dokumente zusammengefasst und die zentrale Rolle des LLMs als "Ontologie-Architekt" hervorgehoben.

## Umstrukturierung und neue Kapitelstruktur

Es wird eine Konsolidierung der ehemals 17 Kapitel auf eine fokussiertere Struktur vorgeschlagen:

### 1. Vision und Systemarchitektur (Zusammenfassung von alt 01, 02)
- Grundlegende Philosophie und Kognition von Nodges.
- Die strikte Trennung von Datenmodell (Ontologie) und visuellem Mapping.
- Übersicht der Tech-Stacks (Vite, Three.js, Zod).

### 2. LLM-Integration und Datenpipelines (NEU)
- Der Kern von Nodges: Pipelines Build 6 bis Build 10.
- Der 2-stufige Workflow (Schema-Generierung -> Daten-Instanziierung).
- Konfigurierbare Build 10 Pipeline (Modell-Quelle, Grounding, QA, Bewertungsmethode).
- Einbindung lokaler (Ollama, LM Studio) und Cloud-Modelle.

### 3. Datenmanagement und Validierung (Aktualisierung von alt 03)
- Flache, beziehungsorientierte Graphenstruktur.
- Zod-Schema-Constraints und Validierung (Zero Data Retention).
- Die Rolle von `App.loadGraphData` und der `LLMService.ts`.

### 4. Visual Mapping und Szenen-Management (Zusammenfassung von alt 04, 05, 11)
- Wegfall typspezifischer Renderings zugunsten von `global_node` und `global_edge`.
- Umgang mit Presets und dynamischer Attributzuweisung.
- Umgang mit Wireframe-Kanten (alt 17).

### 5. Benutzeroberfläche und Interaktion (Zusammenfassung von alt 06, 08)
- Die Decoupled Mapping UI.
- Pipeline-Auswahl (`build10ConfigContainer`) und Steuerungselemente.
- Human-in-the-loop Review UI.

### 6. Algorithmen, Layout Engine und Physik (Aktualisierung von alt 07)
- Die Rolle der Physik als Fallback-Layout.
- Algorithmen zur Dimensionsreduktion / Embeddings (Kosinus-Ähnlichkeit zur Kantenstärke).

### 7. Entwicklungs-Guide, Testing und Deployment (Zusammenfassung von alt 09, 10, 14)
- Vitest Integration, UI-Testing und Error Handling.
- Skripte (`npm run dev`, `vitest`).
- Troubleshooting & FAQ auf aktuellen Stand bringen.

### 8. Historie und Entscheidungen (ADRs) (Aktualisierung von alt 12)
- Fortführung des Entwicklungstagebuchs (Pivots ab Build 5 bis Build 10).

## Nächste Schritte (Aktionsplan)

1. **Archivierung abschließen:** Sicherstellen, dass alle alten Dateien im `archiv_history`-Ordner verbleiben und nicht gelöscht werden (Historien-Referenz).
2. **Entwurf der neuen Markdown-Dateien:** Erstellen der neuen Kapitel im Hauptverzeichnis `doc/` basierend auf der obigen Struktur.
3. **Inhalts-Migration & Neuschreibung:** 
   - Einpflegen der validen Informationen aus dem Archiv.
   - Einpflegen der neuen Konzepte aus den KIs (`current_state.md`, `llm_pipeline.md`, `build10_plan.md`).
4. **Review und Verlinkung:** Sicherstellen, dass das neue Inhaltsverzeichnis (neue `00_inhalt.md`) korrekt auf die neuen Dateien verweist.
