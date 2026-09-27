# Nodges – Tests und Qualitätssicherung

## 1. Test-Setup

- Framework: **Vitest 1.6.1** (`globals: true`).
- Umgebung: `node` (keine DOM nötig für Drei.js-/Logik-Tests).
- Setup: `src/tests/setup.ts`.
- Coverage: v8 (`text`, `json`, `html`).

## 2. Testdateien unter `src/tests/`

| Datei | Testgegenstand |
|-------|----------------|
| `DataParser.test.ts` | Normalisierung/Validierung von Graphdaten |
| `ErrorHandler_5.test.ts` | Fehlerbehandlung |
| `ExportManager.test.ts` | Export |
| `ImportManager.test.ts` | Import |
| `LLMAutomated.test.ts` | LLM-Automation |
| `LLMService_5.test.ts` | LLMService |
| `LayoutManager.test.ts` | Layout-Algorithmen |
| `LightRAGService.test.ts` | LightRAG-Anbindung |
| `SelectionHandler.test.ts` | Auswahl-Handler |
| `StateManager.test.ts` | Zustandsmanagement |
| `StateManagerGroups.test.ts` | Gruppen/Zustand |
| `VectorStoreManager.test.ts` | Vektor-Speicher |
| `VisualMappingEngine.test.ts` | Visual-Mapping |
| `debugParse.test.ts` | Debug-Parsing |
| `exportSchema.test.ts` | Schema-Export |
| `types_5.test.ts` | Typ-Kompatibilität (Build 5) |
| `setup.ts` | Test-Setup/Helfer |

**Gesamt:** 16 `.test.ts`-Dateien mit `describe`-Blöcken.

## 3. Beispiel: StateManager-Tests

Die Tests decken u. a. ab:
- GraphData setzen/abrufen, leere Listen, Überschreiben.
- Idempotente Updates, Subscriber-Benachrichtigung.
- Undo/Redo-Verhalten.
- Transaktionsbündelung.

## 4. Ausführung

```bash
npm test            # Vitest (Watch)
npm run test:ui     # Vitest mit Browser-UI
npm run test:coverage # Coverage-Report
npm run export:schema # nur Schema-Export-Test
```

## 5. Qualitätssicherung außerhalb der Tests

- **Typsicherheit:** `tsc` während des Builds; Zod-Schemas validieren Daten zur Laufzeit.
- **Laufzeit-Datenvalidierung:** `DataParser` normalisiert/validiert Graphdaten robust.
- **Zentrales Fehlerhandling:** `ErrorHandler` + `NotificationService` einheitliche Fehler- und Nutzer-Meldungen.
- **Robustheit:** mehrstufiger WebGL-Renderer-Fallback (high-performance → default → minimal → Fehlerseite).

## 6. Bewertung

**Positiv:**
- Kerndisziplinen (Parser, State, Layout, Mappings, Import/Export, LLM) sind getestet.
- Node-Umgebung + setup-Datei ermöglicht deterministische Logik-Tests.
- Coverage-Reporting integriert.

**Schwächen:**
- **Keine UI-/Rendering-Tests** (keine Three.js-/Canvas-Tests, obwohl `jsdom`/`happy-dom` installiert sind).
- Kein CI-Test-Job: Tests laufen nicht automatisch im Deployment-Pipeline (nur `npm run build`).
- Große, monolithische Komponenten (MappingUI, CreatePanel, App) sind praktisch nicht unit-testbar.
- Die `Debug`-/Trace-Logging-Ausgaben in Produktionslogik (z. B. `[TRACE]`) deuten auf nicht abgeschlossene Debug-Reinigung hin.

---

*Weiter: `/workspace/com/doc/14_verbesserungsvorschlaege_nodges_V4.md`.*
