# Zeilen-Code-Analyse (Lines of Code)

Dieses Dokument enthaelt die genaue Anzahl der Codezeilen (Lines of Code - LOC) des Nodges-Projekts fuer die Version **0.102.7**.

## Zusammenfassung

Das Projekt umfasst insgesamt **27.544 Zeilen Code**, aufgeteilt in folgende Bereiche:

| Bereich | Beschreibung | Zeilen Code (LOC) | Prozentualer Anteil |
| :--- | :--- | :--- | :--- |
| **Quellcode (`src/` ohne Tests)** | Der eigentliche Anwendungscode (TypeScript, CSS) | 23.972 | 87,03 % |
| **Tests (`src/tests/`)** | Unit- und Integrationstests (Vitest) | 2.304 | 8,36 % |
| **Konfigurationen & HTML (Root)** | Konfigurationsdateien und Haupt-HTML | 668 | 2,43 % |
| **Skripte (`scripts/`)** | Hilfsskripte zur Daten- und Testgenerierung | 600 | 2,18 % |
| **Gesamt** | **Alle Code- und Konfigurationsdateien** | **27.544** | **100,00 %** |

---

## Detaillierte Dateiliste

### 1. Quellcode (`src/` ohne `src/tests/`)

*   `src/App.ts` : 1.424
*   `src/core/LayoutManager.ts` : 848
*   `src/core/StateManager.ts` : 713
*   `src/core/NodeManager.ts` : 567
*   `src/core/EdgeObjectsManager.ts` : 556
*   `src/core/VisualMappingEngine.ts` : 528
*   `src/ui/MappingUI.ts` : 2.668
*   `src/styles/main.css` : 1.227
*   `src/ui/CreatePanel.ts` : 729
*   `src/utils/LLMService.ts` : 633
*   `src/utils/ImportManager.ts` : 597
*   `src/utils/NodeLabelManager.ts` : 504
*   `src/utils/SelectionManager.ts` : 500
*   `src/utils/ExportManager.ts` : 399
*   `src/utils/FileHandler.ts` : 339
*   `src/ui/HoverInfoPanel.ts` : 334
*   `src/core/interaction/NodeCreationHandler.ts` : 286
*   `src/core/DataParser.ts` : 286
*   `src/ui/DataEditor.ts` : 272
*   `src/ui/SuggestionUI.ts` : 260
*   `src/ui/InfoPanelUI.ts` : 215
*   `src/ui/EdgeControlsUI.ts` : 201
*   `src/core/ErrorHandler.ts` : 202
*   *(Und weitere kleinere Dateien im `src/`-Ordner)*

### 2. Testdateien (`src/tests/`)

*   `src/tests/StateManager.test.ts` : 446
*   `src/tests/LayoutManager.test.ts` : 508
*   `src/tests/ExportManager.test.ts` : 286
*   `src/tests/ImportManager.test.ts` : 270
*   `src/tests/VisualMappingEngine.test.ts` : 199
*   `src/tests/DataParser.test.ts` : 165
*   `src/tests/GrokIterative.test.ts` : 137
*   `src/tests/LLMAutomated.test.ts` : 95
*   `src/tests/LLMService_5.test.ts` : 77
*   `src/tests/setup.ts` : 11

### 3. Skripte (`scripts/`)

*   `scripts/convert_csv.cjs` : 182
*   `scripts/create_gv4.cjs` : 99
*   `scripts/generate-test-data.cjs` : 63
*   `scripts/generate_json.cjs` : 164
*   `scripts/generate_test_graph.cjs` : 92

### 4. Root- und Konfigurationsdateien

*   `index.html` : 387
*   `colorscheme.css` : 110
*   `vite.config.ts` : 66
*   `tsconfig.json` : 44
*   `package.json` : 35
*   `vitest.config.ts` : 26
