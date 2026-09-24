# Plan: Ueberfluessigen Code entfernen

## Ziel

Systematische Bereinigung des Nodges-Projekts (v0.102.15) in 5 Phasen mit aufsteigendem Risiko. Jede Phase ist eigenstaendig abschliessbar und bricht nichts fuer nachfolgende Phasen.

---

## Phase 1 -- Tote Dateien loeschen (Risiko: minimal)

Dateien im Projekt-Root und Verzeichnisse, die nicht Teil des Builds sind und nirgends importiert werden.

| Datei / Ordner | Groesse | Begruendung |
|---|---|---|
| `scratch_test.ts` | 1.8 KB | Standalone Deno-Testskript, nicht importiert |
| `scratch_test2.ts` | 1.6 KB | Standalone Deno-Testskript, nicht importiert |
| `test_parse.ts` | 0.3 KB | Einmaliger Parsing-Test, nicht importiert |
| `test_parse_2.ts` | 0.4 KB | Einmaliger Parsing-Test, nicht importiert |
| `test_parse_3.ts` | 0.3 KB | Einmaliger Parsing-Test, nicht importiert |
| `test_validation.ts` | 0.3 KB | Einmaliger Validierungs-Test, nicht importiert |
| `Switzerland.jpg` | 15 MB | Testbild, nirgends referenziert (blaest Repository auf) |
| `scratch/` | ~leer | Leerer Scratch-Ordner |
| `src/core/InteractionManager.ts` | 648 B | Leerer Placeholder (Kommentar "Placeholder for future interaction logic"), nicht importiert |

> [!IMPORTANT]
> Korrektur zu `src/core/InteractionManager.ts`: Ein Subagent meldete, es sei ein Re-Export fuer App.ts. Ein anderer meldete, es sei ein leerer Placeholder. Dies muss vor dem Loeschen verifiziert werden -- falls es ein Re-Export ist, bleibt die Datei bestehen.

#### [DELETE] [scratch_test.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/scratch_test.ts)
#### [DELETE] [scratch_test2.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/scratch_test2.ts)
#### [DELETE] [test_parse.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/test_parse.ts)
#### [DELETE] [test_parse_2.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/test_parse_2.ts)
#### [DELETE] [test_parse_3.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/test_parse_3.ts)
#### [DELETE] [test_validation.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/test_validation.ts)
#### [DELETE] [Switzerland.jpg](file:///c:/Users/ich/Desktop/code/_projects/Nodges/Switzerland.jpg)
#### [DELETE] scratch/

**Einsparung Phase 1:** ~15 MB Repository-Groesse, 7 tote Dateien

### Offene Frage Phase 1

> [!WARNING]
> `colorscheme.css` im Root: Definiert CSS-Variablen, wird nicht direkt importiert. Moeglicherweise manuell geladen oder veraltet. Soll diese Datei behalten oder geloescht werden?

---

## Phase 2 -- Auskommentierter Code und Debug-Reste (Risiko: gering)

### Auskommentierter Code entfernen

Geschaetzt 155-210 Zeilen auskommentierter Code verteilt auf:

| Datei | Geschaetzte Zeilen | Inhalt |
|---|---|---|
| [LayoutManager.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/LayoutManager.ts) | 40-60 | Auskommentierte Layout-Algorithmen-Varianten |
| [LLMService.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts) | 50-80 | Auskommentierte Prompt-Varianten |
| [NodeManager.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/NodeManager.ts) | 30 | Auskommentierte Geometrie-Logik |
| [EdgeObjectsManager.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/EdgeObjectsManager.ts) | 20 | Auskommentierte Animationslogik |
| [StateManager.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/StateManager.ts) | 15-20 | Auskommentierte Debug-Logging-Bloecke |

### Debug-console.log bereinigen

Geschaetzt 200+ `console.log` / `console.warn` Aufrufe im gesamten `src/`. Strategie:

1. **Behalten:** Strukturierte Logging-Aufrufe mit Prefix-Konvention (`[DataParser]`, `[LLMService]`, `[LightRAG]`) -- diese sind bewusste Status-Meldungen.
2. **Entfernen:** Nackte `console.log(variable)` oder `console.log("debug", ...)` Aufrufe ohne Prefix.
3. **Kein Logger-Framework einfuehren** in diesem Schritt -- nur offensichtliche Debug-Reste entfernen.

### Leere Catch-Bloecke und tote Variablen in CreatePanel.ts

- Zeilen 1736, 1769, 1897: Leere `catch (e) {}` durch mindestens `console.warn` ersetzen.
- Zeilen 1840-1845: Ungenutzte `filePanel`-Variable entfernen.
- Veraltete Kommentare (Z. 758, 1686) entfernen.
- Ueberflüssige Leerzeilen (Z. 1603-1605) bereinigen.

**Einsparung Phase 2:** ~250-350 Zeilen

---

## Phase 3 -- MappingUI.ts deduplizieren (Risiko: mittel)

Die groesste Datei im Projekt (3.037 Zeilen / 154KB) mit massiver Codeduplikation.

### 3a) Generische Helper-Methoden extrahieren

Sechs neue private Methoden ersetzen duplizierte Bloecke:

| Neue Methode | Ersetzt | Einsparung |
|---|---|---|
| `bindQuadSliders(container, config, onUpdate)` | 3x Slider-Drag-Setup (Z. 2652-2722, 2791-2841, 2943-2993) | ~102 Zeilen |
| `getDefaultRange(baseProp)` | 5x Range-Berechnung (Z. 1071, 1218, 2324, 2369, 2587) | ~35 Zeilen |
| `buildCategoricalParams(prop, source, existing)` | 2x Kategorien-Zuweisung (Z. 1048-1087, 2350-2393) | ~35 Zeilen |
| `createMinMaxInputPair(label, min, max, step, onChange)` | 2x Dual-Input-Erstellung (Z. 1113-1145, 1240-1272) | ~25 Zeilen |
| `createPaletteSelect(currentPalette, onChange)` | 2x Paletten-Dropdown (Z. 1150-1172, 1372-1397) | ~20 Zeilen |
| `disconnectMapping(prop, isOriginal)` | 2 separate disconnect-Methoden (Z. 2999-3035) | ~15 Zeilen |

**Einsparung 3a:** ~232 Zeilen

### 3b) Inline-CSS in mapping-ui.css auslagern

Geschaetzt 330-380 Zeilen Inline-CSS (`style.cssText = ...`, direkte `.style`-Zuweisungen) koennen in CSS-Klassen in [mapping-ui.css](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/styles/mapping-ui.css) ueberfuehrt werden:

| Bereich | Zeilen | CSS-Klassen |
|---|---|---|
| Sub-Item-Kacheln + Hover (Z. 677-705, 829-855) | ~55 | `.mapping-tile`, `.mapping-tile:hover` |
| Layout-Engine-Steuerung (Z. 1623-1782) | ~63 | `.layout-section`, `.layout-param` |
| Slider-Widgets A/B/C (Z. 2577-2903) | ~87 | `.slider-track`, `.slider-thumb`, `.slider-label` |
| Badges, Inputs, Selects (diverse) | ~130 | `.mapping-input`, `.mapping-select`, `.mapping-badge` |

**Einsparung 3b:** ~330-380 Zeilen (Inline-CSS durch `classList.add()` ersetzt)

### 3c) Widget-Option updateUI konsolidieren

Option B (Z. 2769-2788) und Option C (Z. 2921-2940) haben identische `updateUI()`-Closures. Eine gemeinsame `updateSliderUI(thumbs, labels, mappings, domain)` Methode ersetzt beide.

**Einsparung 3c:** ~18 Zeilen

**Gesamteinsparung Phase 3:** ~580-630 Zeilen (19-21% von 3.037)

---

## Phase 4 -- CreatePanel.ts deduplizieren (Risiko: mittel)

### 4a) UI-Helper-Methoden extrahieren

| Neue Methode | Ersetzt | Einsparung |
|---|---|---|
| `createSelect(options, value, styles, onChange)` | 6x Dropdown-Erstellung (Z. 334-353, 432-454, 766-792, 846-869, 878-900, 909-930) | ~120 Zeilen |
| `createCollapsibleSection(title, content)` | 3x Collapsible-Header (Z. 275-299, 403-426, 570-593) | ~50 Zeilen |
| `saveGraphFile(filename, content)` | 6x fetch('/api/save_graph') Aufrufe | ~42 Zeilen |
| `downloadStep(data, suffix, format)` | Wiederholt Zwischenschritt-Downloads | ~40 Zeilen |
| `findNodeMeshById(id)` | 2x Scene-Traversal (Z. 1327-1335, 1358-1369) | ~16 Zeilen |

**Einsparung 4a:** ~268 Zeilen

### 4b) Inline-CSS in eine create-panel.css auslagern

Geschaetzt 300+ Zeilen Inline-CSS in eine neue [create-panel.css](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/styles/create-panel.css) verschieben.

#### [NEW] [create-panel.css](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/styles/create-panel.css)

**Einsparung 4b:** ~300 Zeilen

### 4c) Pipeline-Orchestrierung extrahieren (optional, groesserer Eingriff)

`handleGenerate()` (383 Zeilen, Z. 1521-1903) enthaelt Geschaeftslogik die nicht in eine UI-Klasse gehoert:
- NSFW-Filter (Z. 1576-1591)
- Prompt-Assembly (Z. 1594-1602)
- Pipeline-Verzweigung und -Ausfuehrung (Z. 1653-1805)
- Metadaten-Anreicherung (Z. 2121-2192)

Diese ~460 Zeilen koennten in eine neue Klasse `GraphGenerationService.ts` verschoben werden.

#### [NEW] [GraphGenerationService.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/utils/GraphGenerationService.ts)

> [!IMPORTANT]
> Phase 4c ist optional und ein groesserer architektonischer Eingriff. Er kann auch separat in einem spaeteren Schritt durchgefuehrt werden.

**Einsparung 4c:** ~460 Zeilen aus CreatePanel.ts (verschoben, nicht geloescht)

**Gesamteinsparung Phase 4:** ~568 Zeilen direkte Reduktion + ~460 Zeilen Extraktion

---

## Phase 5 -- Event-System konsolidieren (Risiko: hoch)

> [!CAUTION]
> Phase 5 greift in das Event-Routing der gesamten Anwendung ein. Empfehlung: Erst nach Phase 1-4 und mit manuellen Tests.

[CentralEventManager.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/CentralEventManager.ts) (18KB / 470 Zeilen) vereint zwei Aufgaben:
1. **DOM-Event-Routing + Raycast-Koordination** (~300 Zeilen) -- eigenstaendige Logik, behalten
2. **PubSub-Event-Verteilung** (~60-80 Zeilen) -- redundant mit [EventTypes.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/events/EventTypes.ts)

### Vorgehen

1. CentralEventManager in `CanvasInputRouter` umbenennen
2. PubSub-Methoden (`subscribe`, `publish`) entfernen und durch Imports aus dem typsicheren Event-System ersetzen
3. Alle Stellen die CentralEventManager fuer PubSub nutzen auf EventTypes umstellen

**Einsparung Phase 5:** ~60-80 Zeilen + Elimination der Redundanz zwischen zwei Event-Systemen

---

## Zusammenfassung

| Phase | Einsparung | Risiko | Aufwand |
|---|---|---|---|
| 1 -- Tote Dateien | ~15 MB + 7 Dateien | Minimal | 15 min |
| 2 -- Kommentare + Debug | ~250-350 Zeilen | Gering | 1-2 Std |
| 3 -- MappingUI Dedup | ~580-630 Zeilen | Mittel | 1-2 Tage |
| 4 -- CreatePanel Dedup | ~568 Zeilen + 460 extrahiert | Mittel | 1-2 Tage |
| 5 -- Event-System | ~60-80 Zeilen + Architekturbereinigung | Hoch | 0.5-1 Tag |
| **Total** | **~1.500-1.630 Zeilen + 15MB** | | **3-6 Tage** |

---

## Verifizierungsplan

### Automatisierte Tests
```bash
npx tsc --noEmit          # TypeScript-Kompilierung ohne Fehler
npx vitest run             # Alle bestehenden Tests gruen
```

### Manuelle Verifikation
- Anwendung starten (`npm run dev`), Graph laden, MappingUI Ebenen-Panel oeffnen
- Alle Slider und Dropdowns in MappingUI testen
- CreatePanel: LLM-Pipeline ausloesen, Relation-Sets laden
- Build pruefen: `npm run build` muss fehlerfrei durchlaufen

## Offene Fragen

1. Soll `colorscheme.css` im Root behalten oder geloescht werden?
2. Soll Phase 4c (Pipeline-Extraktion aus CreatePanel) in diesem Durchgang oder spaeter umgesetzt werden?
3. Soll Phase 5 (Event-System) in diesem Durchgang oder als separates Projekt behandelt werden?
