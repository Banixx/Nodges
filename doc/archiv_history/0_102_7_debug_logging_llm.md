# Debug Logging für den LLM-Prozess

Um den Entwicklungs- und Prompt-Design-Prozess transparenter zu machen, wurde eine experimentelle Logging-Funktion in `LLMService.ts` integriert. 

## Funktionsweise

Die Methode `_saveDebugFile` sendet waehrend des LLM-Generierungsprozesses die rohen Prompts (System- und User-Prompt kombiniert) sowie die direkt zurueckgelieferten Zwischenergebnisse (JSON) an den lokalen Vite-Dev-Server (`/api/save_graph`).

## Speicherort

Alle erstellten Dateien landen im Ordner:
`public/data/generated/`

## Dateinamenskonvention

Die Dateien werden mit einem Zeitstempel versehen, um die chronologische Reihenfolge nachvollziehbar zu machen:
- **Build 5 (3 Schritte):**
  - `debug_build5_step1_prompt_<timestamp>.md`
  - `debug_build5_step1_result_<timestamp>.json` (Ontologie)
  - `debug_build5_step2_prompt_<timestamp>.md`
  - `debug_build5_step2_result_<timestamp>.json` (Daten)
  - `debug_build5_step3_prompt_<timestamp>.md`
  - `debug_build5_step3_result_<timestamp>.json` (Visuelles Mapping)

- **Build 4 (2 Schritte):**
  - `debug_build4_step1_prompt_<timestamp>.md`
  - `debug_build4_step1_result_<timestamp>.json` (Ontologie)
  - `debug_build4_step2_prompt_<timestamp>.md`
  - `debug_build4_step2_result_<timestamp>.json` (Daten)

Dieses Feature laeuft vollautomatisch bei jeder neuen Generierung im Multi-Step-Modus mit.
