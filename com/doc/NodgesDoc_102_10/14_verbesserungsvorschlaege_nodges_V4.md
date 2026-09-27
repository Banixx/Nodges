# Nodges – Verbesserungsvorschläge

Dieses Kapitel sammelt konkrete Verbesserungen, unterteilt in **Detail-Verbesserungen** (klein, risikoarm, schnell umsetzbar) und **Architektur-Verbesserungen** (grundlegend, höherer Aufwand, größere Wirkung). Jeder Punkt nennt betroffene Dateien und Nutzen.

---

## Teil A – Detailverbesserungen (schnell umsetzbar)

### A1. Debug-Logging bereinigen
- **Betroffen:** `src/App.ts` (`[TRACE]`, `[App]`-Logs), `src/workers/layout-worker.ts` (`console.log` großer Datenobjekte).
- **Problem:** Zahlreiche Konsolenausgaben in Produktionslogik; der Worker loggt sogar die ersten Knoten (ggf. sensible Daten).
- **Vorschlag:** Log-Helper mit Level-Filter (z. B. nur bei `import.meta.env.DEV` oder über eine Konfiguration) einführen; sensitive Worker-Logs entfernen oder drosseln.

### A2. Auskommentierten toten Code entfernen
- **Betroffen:** `src/core/CentralEventManager.ts` (`// nodeManager`, `// edgeObjectsManager`), `src/App.ts` (Minimap-Lichter), `src/core/NodeManager.ts`/`EdgeObjectsManager.ts` (unbenutzte Imports).
- **Vorschlag:** Ungenutzte Imports und tote Blöcke systematisch löschen (Linter/`noUnusedLocals`), um die Lesbarkeit zu erhöhen.

### A3. State typsicher machen (Index-Signatur eliminieren)
- **Betroffen:** `src/core/StateManager.ts`, `src/core/state/StateTypes.ts`.
- **Problem:** `State` hat `[key: string]: any`; Sub-State-Interfaces existieren, werden aber nicht typisiert zusammengeführt.
- **Vorschlag:** Flachen State aus den Sub-States zu einem **einzigen Interface** (`type State = GraphState & SelectionState & UIState & …`) zusammenbauen. Dadurch werden `state.foo`-Zugriffe typsicher und Tippfehler vermeidbar.

### A4. Duplizierte Datenhaltung aktuell auflösen (Konkretisierung)
- **Betroffen:** `App.currentEntities/currentRelationships/currentGraphData` vs. `StateManager.state.graphData`.
- **Problem:** Die beiden Quellen müssen ständig synchronisiert werden (Subscription `data_changed`).
- **Kurzfristig:** Einheitliche Getter/Setter über alle Manager einführen und lokale Arrays in `App` zugunsten des `StateManager` entfernen.

### A5. Einheitliche Positions-API für Entitäten/Objekte
- **Betroffen:** `App` (mehrere Stellen berechnen x/y/z aus `visual.*`, `position.*`, `x/y/z`), `NodeManager`, `EdgeObjectsManager`, `NodeLabelManager`.
- **Problem:** Positionslogik wird mehrfach dupliziert (`calculateBounds`, `updateNodePositions`, `updateVisualMappings`, `updateLabelPosition`).
- **Vorschlag:** Eine zentrale Funktion/Klasse `PositionResolver` (oder Methode an der `VisualMappingEngine`), die konsistent `resolvePosition(entity) → Vector3` liefert.

### A6. Semantik `metadata.version` vs. `metadata.schemaVersion` klären
- **Betroffen:** `src/types.ts`, `src/core/DataParser.ts`, `src/App.ts`.
- **Problem:** Es gibt zwei Version-Felder mit unterschiedlichen Auswertungslogiken (Build-4-Features hängen an `metadata.version`, Schema an `schemaVersion`).
- **Vorschlag:** Ein einziges Feld (z. B. `buildVersion`/`schemaVersion`) festlegen und Ableitungslogik zentralisieren.

### A7. Lint-/Format-Konfiguration hinzufügen
- **Problem:** Kein ESLint/Prettier konfiguriert; Formatierung ist inkonsistent.
- **Vorschlag:** ESLint + Prettier einrichten, als CI-Schritt im Deploy-Workflow ergänzen.

### A8. CI: Test-Job ergänzen
- **Betroffen:** `.github/workflows/deploy.yml`.
- **Vorschlag:** Vor dem Build `npm run test -- --run` und optional Coverage-Check einfügen, damit Regressionen beim Deploy verhindert werden.

### A9. `any`-Typisierungen reduzieren
- **Betroffen:** `CentralEventManager` (`raycastManager: any`), `ServiceContainer` (`Map<string, any>`), diverse Payloads.
- **Vorschlag:** Interessengerechte Typen/Schnittstellen (z. B. `IRaycastManager`) definieren; den DI-Container typisieren (Key-Typ-Mapping).

### A10. Sicherheit der API-Keys
- **Betroffen:** `src/utils/LLMService.ts` (Keys in `localStorage`/`.env` im Client).
- **Vorschlag:** Optionale Server-seitige Key-Verwaltung (Over den Deno-Proxy oder ein kleines Backend) anbieten; mindestens dokumentieren, dass Client-Keys nie als geheim gelten.

---

## Teil B – Architektur-Verbesserungen (grundlegend)

### B1. `App.ts` entschlacken (God-Object auflösen)
- **Betroffen:** `src/App.ts` (1737 Zeilen).
- **Problem:** `App` orchestriert Initialisierung, GUI, Mapping, Labels, Minimap, Deep-Dive, Render-Loop und Fehlerbehandlung.
- **Vorschlag:**
  - `SceneFactory`/`RendererFactory` für die 3D-Initialisierung und Renderer-Fallbacks.
  - `RenderLoop` (oder `RenderPipeline`) kapselt Haupt- und Minimap-Pass.
  - `GraphLoaderService` bündelt `loadGraphData/loadData/addData/removeData/newGraph`.
  - `MappingCoordinator` für Mapping-Anwendung, Preview/Takeover und Layout-Trigger.
  - `App` als dünner, komponierter Einstiegspunkt, der Services verdrahtet.

### B2. Echte Dependency Injection (Konstruktor-Injektion) statt Service-Locator
- **Betroffen:** `src/core/di/ServiceContainer.ts` und alle Manager.
- **Problem:** Der Container ist ein Service-Locator; Manager greifen global auf `container.get(...)` zu.
- **Vorschlag:** Manager-Konstruktoren erhalten ihre Abhängigkeiten explizit (über Interfaces). Der Container dient als reine **Composition-Root**, die alle Instanzen zusammenfügt. Vorteil: klare Testbarkeit, kein versteckter globaler Zustand.

### B3. Interfaces konsequent nutzen (Programmieren gegen Abstraktionen)
- **Betroffen:** `src/core/interfaces.ts` (IStateManager, IEventManager, INodeManager, IEdgeManager) und Manager.
- **Problem:** Viele Manager beziehen konkrete Klassen statt Interfaces.
- **Vorschlag:** Für alle zentralen Manager Interfaces definieren (ILayoutManager, ICameraManager, IUIManager, INodeLabelManager …) und Konsumenten nur auf Interfaces verweisen lassen. Das ist Voraussetzung für Tests und Austauschbarkeit.

### B4. Duales Trackingsystem (Events + State) konsolidieren
- **Betroffen:** `CentralEventManager` und `interaction/*`-Handler.
- **Problem:** Hover/Selektion werden sowohl zentral als auch dezentral behandelt (Überlappung).
- **Vorschlag:** Klare Verantwortlichkeit definieren: `CentralEventManager` nur als Dispatcher/Raycast-Quelle; die Interaktions-Handler besitzen die Logik; doppelte Trigger konsolidieren.

### B5. UI-Komponenten zerlegen
- **Betroffen:** `MappingUI.ts` (2850), `CreatePanel.ts` (2313), `FilePanelUI.ts` (971), `ViewPanel.ts` (734).
- **Vorschlag:** Große Panels in wiederverwendbare kleine Komponenten/Services zerlegen (Mapping-Editor → MappingRuleForm, AttributePicker, ColorScale; CreatePanel → Generator-Services + Form-Sub-Komponenten). Erhöht Testbarkeit und Wartbarkeit.

### B6. UI von globalem `window.app` entkoppeln
- **Betroffen:** mehrere `src/ui/*`-Komponenten.
- **Problem:** UI greift teils direkt auf `window.app`/globale Zustände zu (starke Kopplung).
- **Vorschlag:** UI erhält explizite Props/Stores (z. B. über eine zentrale Store-Schicht auf Basis des `StateManager`) statt globaler Zugriffe; Events über den Event-Bus.

### B7. Zustand als ein Store-System (z. B. zustandsbasierte Store-Schicht)
- **Betroffen:** `StateManager` und alle Subscriber.
- **Problem:** Kategorien sind ein eigenentwickeltes, feinmaschiges Mechanik; viele Subscriber reagieren trotzdem auf Global-State.
- **Vorschlag:** Zustandsbasierte Selektoren (SELECTOR-Pattern) umsetzen – Subscriber wählen exakt die benötigten Felder, Ableitungen cachen. Entweder im eigenen Mechanismus verfeinern oder auf eine etablierte Store-Bibliothek wechseln.

### B8. Persistenz- und Datenbankebene abstrahieren
- **Betroffen:** Vite-Middleware-API (nur Dev), `FileHandler`, `ImportManager`, `ExportManager`.
- **Problem:** Speichern/Datenbanken funktionieren nur im Dev-Server; Produktion hat kein Backend.
- **Vorschlag:** Persistenz hinter ein `Repository`/`DataSource`-Interface legen (JSON-Adapter für Dev, LightRAG/Server-Adapter für Produktion). Die eingebaute Vite-API in ein eigenständiges, wiederverwendbares Backend/Plugin auslagern.

### B9. Rendering-Schicht kapseln (inkl. Minimap)
- **Betroffen:** `App.animate`, `MinimapManager` (neu, Schritt 1 erledigt), `MapManager`.
- **Stand:** Der Minimap-Anteil ist mit dem neuen `MinimapManager` bereits aus `App` ausgelagert (siehe Kapitel 15). Die Haupt-Render-Pipeline und die `SceneFactory` stehen noch aus.
- **Vorschlag:** `RenderPipeline`/`MinimapView`-Komponenten, die Kamera, Marker, DPR-Handling und die zwei Pässe kapseln; `App.animate` nur noch koordiniert.

### B10. Layout-System als unabhängige Schicht mit Plugins-API
- **Betroffen:** `LayoutManager`, Worker, `App.updateVisualMappings` (Layout-Trigger).
- **Problem:** Layout-Triggerung (algo:/Physik) ist über die Visual-Mapping-Logik in `App` gekoppelt.
- **Vorschlag:** Layout-Registry mit klarem `LayoutDefinition`-Interface; eigenständiger `LayoutCoordinator`, der Algorithmen, Fortschritt und Abbruch verwaltet und sich nur über Events mit Mapping/UI verbindet.

### B11. Zustandsübergänge/Transaktionen vereinheitlichen
- **Betroffen:** `StateManager` (Undo/Redo, Transaktionen, Batch).
- **Problem:** Undo/Redo nutzt Closures und gemischte Update-Muster; Konsistenz ist schwer zu garantieren.
- **Vorschlag:** Undo/Redo über **Immutable-Updates** oder Patch-Diffs umsetzen, sodass History-Aktionen deterministisch und rekonstruierbar sind; Batch-Transaktionen strikt kapseln.

### B12. Testbarkeit der Rendering- und UI-Schicht erhöhen
- **Problem:** Keine Tests für 3D-/UI-Komponenten.
- **Vorschlag:** Nach A5/B1/B5 Refactoring UI- und (mit Three.js-Mocks) Rendering-Tests ergänzen; CI-Test-Job einführen. Mindestens für die neuen Services (GraphLoaderService, MappingCoordinator, RenderPipeline) Integrationstests anlegen.

---

## Priorisierungsempfehlung

**Sofort (niedriger Aufwand, hohe Rendite):**
A1 (Logs), A2 (toter Code), A3 (State typisieren), A8 (CI-Test), A10 (Key-Doku).

**Kurzfristig (Architektur-Win):**
A4/A6 (Datenhaltung/Versionierung konsolidieren), A5 (Positions-API), B2/B3 (DI + Interfaces).

**Mittelfristig (große Refactorings):**
B1 (App zerlegen), B5 (UI zerlegen), B8 (Persistenz abstrahieren), B9 (Rendering kapseln), B10 (Layout-Schicht), B11 (Transaktionen), B12 (Tests).

---

## Fazit

Nodges hat eine solide, modulare Grundarchitektur (DI-Container, StateManager, CentralEventManager, VisualMappingEngine, Worker-Layout). Die größten Hebel für Qualität und Wartbarkeit sind die **Entschlackung von `App.ts`**, die **konsequente Nutzung von Interfaces/echter DI**, die **Beseitigung der doppelten Datenhaltung** sowie die **Ergänzung eines CI-Testlaufs**. Die Detailpunkte (Logging, Typen, toter Code) lassen sich unabhängig und mit geringem Risiko sofort umsetzen.
