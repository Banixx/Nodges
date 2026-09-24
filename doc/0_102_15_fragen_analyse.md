# Nodges Projektanalyse -- /fragen (v0.102.15)

Stand: 2026-07-29

---

## 1. Welche Teile des Projekts bergen aktuell das hoechste Risiko fuer Fehler oder Regressionen?

Die drei groessten Risikoquellen sind die uebergrossen monolithischen Dateien, die zusammen mehr als 400KB Code in nur drei Klassen buendeln:

| Datei | Groesse | Zeilen | Risiko |
|-------|---------|--------|--------|
| [MappingUI.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/MappingUI.ts) | 154 KB | ~4.400 | Hoechstes Risiko -- 60-70% duplizierter Code fuer identische Mapping-Patterns |
| [CreatePanel.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/CreatePanel.ts) | 101 KB | ~2.800 | Sehr hoch -- LLM-Pipeline-Logik direkt in UI-Klasse vermischt |
| [App.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts) | 75 KB | ~1.754 | Sehr hoch -- God-Object mit 20+ Manager-Verdrahtungen |

Zusaetzlich haben **keine dieser Dateien Tests**. Die geschaetzte Testabdeckung des Gesamtprojekts liegt bei nur **15-18%**. Die gesamte UI-Schicht (~440KB Code) ist komplett ungetestet.

Der [LLMService.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts) (76KB) birgt ein **Sicherheitsrisiko**: Der API-Key wird ueber `VITE_`-Praefix im Client-Bundle exponiert. Ausserdem fehlen AbortController, Rate-Limiting und Caching.

---

## 2. Wenn Sie dieses Projekt vereinfachen muessten, ohne die Funktionalitaet einzuschraenken, wo wuerden Sie ansetzen und warum?

**Prioritaet 1: MappingUI.ts zerlegen.**
Diese Datei enthaelt 60-70% duplizierten Code. Fuer jede visuelle Eigenschaft (positionX, positionY, positionZ, size, color, geometry, glow usw.) wird nahezu identischer Code zur DOM-Generierung, Event-Handling und State-Synchronisation wiederholt. Ein generisches `MappingPropertyWidget`-Pattern, das durch Konfigurationsobjekte gesteuert wird, koennte diese Datei auf geschaetzt 30-40KB reduzieren -- eine Einsparung von ueber 100KB bei gleichzeitig massiv erhoehter Wartbarkeit.

**Prioritaet 2: App.ts in Composition Root + Module aufloesen.**
Die App-Klasse uebernimmt gleichzeitig Szenen-Setup, Manager-Verdrahtung, UI-Initialisierung, Event-Handling, Animation-Loop und Datenladen. Eine Aufspaltung in:
- `SceneSetup.ts` (Three.js-Szene, Renderer, PostProcessing)
- `ManagerRegistry.ts` (DI-Container-Verdrahtung)
- `UIBootstrap.ts` (Panel-Initialisierung)
- `AppLifecycle.ts` (Animation-Loop, Resize, Dispose)

wuerde die Komplexitaet drastisch senken.

**Prioritaet 3: Build-Pipeline-Logik aus CreatePanel.ts und LLMService.ts extrahieren.**
Die Build-10- und Build-12-Pipelines sind Geschaeftslogik, die nicht in UI-Klassen oder allgemeinen Services gehoert. Separate `BuildPipeline`-Klassen wuerden Testbarkeit und Wiederverwendung ermoeglichen.

---

## 3. Welche Probleme sind noch nicht sichtbar, werden aber mit zunehmender Projektgroesse auftreten?

**State-Explosion:** Das zentrale [State-Interface](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/state/StateTypes.ts) umfasst bereits ~80+ Felder in einem einzigen flachen Objekt. Jeder `subscribe()`-Aufruf wird bei jeder State-Aenderung ausgeloest, unabhaengig davon, welches Feld sich geaendert hat. Bei wachsender Anwendung fuehrt das zu Performance-Problemen durch ueberfluessige Re-Renders.

**DOM-Performance:** MappingUI.ts manipuliert massiv den DOM ohne Virtualisierung. Bei einem Graphen mit vielen Entity-Typen und Beziehungstypen wird die Accordion-/Slider-Generierung spuerbar langsam.

**Speicher-Lecks:** Es gibt kein durchgaengiges `dispose()`-Pattern. Manager werden initialisiert, aber niemals aufraeumen. Event-Listener werden registriert, aber nicht konsistent entfernt. Bei wiederholtem Laden neuer Graphen (Multi-Datenbank-Feature) akkumulieren sich DOM-Elemente und Three.js-Objekte.

**Initialisierungsreihenfolge:** App.ts verdrahtet 20+ Manager manuell in einer bestimmten Reihenfolge. Neue Manager koennen zirkulaere Abhaengigkeiten oder Timing-Probleme einfuehren, die erst zur Laufzeit sichtbar werden.

**Wachsende Prompt-Templates:** LLMService.ts haelt 13+ Templates inline. Mit jedem neuen Build oder LLM-Feature waechst diese Datei weiter. Ohne Template-Registry wird die Wartung zunehmend unuebersichtlich.

---

## 4. Welche aktuellen technischen Entscheidungen schraenken Skalierbarkeit oder Wartbarkeit ein?

| Entscheidung | Auswirkung |
|---|---|
| **Kein echtes DI** | [ServiceContainer.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/di/ServiceContainer.ts) ist ein einfacher Service-Locator (String-Keys), wird aber nicht konsequent genutzt. Die meisten Module instantiieren Abhaengigkeiten direkt. |
| **Zwei parallele Kommunikationsmodelle** | Das Event-System (EventTypes.ts) existiert neben direkten Methodenaufrufen. Es gibt keine Regel, wann welches Modell zu verwenden ist. |
| **Monolithisches State-Objekt** | ~80+ Felder ohne Slice-Aufteilung. Kein selektives Subscribing moeglich. |
| **UI-Logik in HTML** | [index.html](file:///c:/Users/ich/Desktop/code/_projects/Nodges/index.html) (421 Zeilen) enthaelt manuell erstellte DOM-Strukturen, die von TypeScript-Klassen ueber `getElementById` referenziert werden. Fragile Kopplung. |
| **Vite-Dev-Server als Backend** | Die File-API (`save_graph`, `list_files`, `delete_file`, `create_database`) laeuft als Vite-Plugin. Das funktioniert nur im Dev-Modus und ist nicht deploybar. |
| **VITE_-Praefix fuer API-Keys** | Umgebungsvariablen mit `VITE_` werden zur Build-Zeit ins Client-Bundle aufgenommen. Der OpenRouter API-Key ist damit im ausgelieferten JavaScript sichtbar. |
| **Keine Interfaces fuer Manager** | [interfaces.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/interfaces.ts) definiert nur 4 Interfaces (IStateManager, IEventManager, INodeManager, IEdgeManager). 20+ weitere Manager haben keine Interfaces, was Mocking und Austausch verhindert. |

---

## 5. Welche Teile des Codes oder der Architektur sollten zuerst isoliert, dokumentiert oder getestet werden?

**Sofort isolieren und testen:**
1. **VisualMappingEngine** -- Bereits getestet (10KB Tests), aber die Engine ist das Herzstuck der Visualisierung. Testabdeckung erweitern.
2. **DataParser** -- Bereits gut getestet (13KB Tests). Normalisierung und Schema-Migration sind kritisch.
3. **StateManager** -- Bereits umfangreich getestet (21KB Tests). Undo/Redo und Graph-Operationen sind Kernfunktionalitaet.

**Naechste Prioritaet isolieren und testen:**
4. **NodeManager + EdgeObjectsManager** -- Aktuell ungetestet. Rendering-Korrektheit ist schwer zu verifizieren ohne Tests.
5. **AxisPositionHelper** (35KB) -- Ungetestet. Positions-Mapping ist fehleranfaellig.
6. **CentralEventManager** (18KB) -- Ungetestet. Dupliziert teilweise das Event-System.

**Dokumentieren:**
7. Die Build-Pipelines (B10, B12) -- Der Datenfluss von Prompt ueber LLM-Response zu validiertem Graph ist komplex und nirgends formal dokumentiert ausser in verstreuten Doc-Dateien.
8. Das visuelle Mapping-System -- Welche Mapping-Funktionen existieren, wie Domain/Range funktioniert, welche Sonderfaelle es gibt.

---

## 6. Wo kann das tatsaechliche Verhalten des Projekts von der urspruenglichen Absicht der Entwickler abweichen?

**Passthrough-Schemas:** Sowohl [EntityDataSchema](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/types.ts#L101-L114) als auch [GraphDataSchema](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/types.ts#L138-L160) verwenden `.passthrough()`. Das bedeutet, dass unbekannte Felder bei der Validierung nicht abgewiesen werden. Unbeabsichtigte Daten koennen sich durch das System propagieren, ohne dass Fehler geworfen werden.

**Mock-Fallback im LightRAG-Backend:** [main.py](file:///c:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/main.py#L174-L194) liefert bei fehlgeschlagener LightRAG-Initialisierung oder Query-Fehler eine Mock-Antwort zurueck, ohne den Fehler klar an den Benutzer zu kommunizieren. Das Frontend koennte Mock-Daten als echte Ergebnisse interpretieren.

**State-Subscriptions ohne Filterung:** `subscribe(callback, category?)` -- wenn keine Kategorie angegeben wird, feuert der Callback bei jeder State-Aenderung. Es ist wahrscheinlich, dass einige Subscriber oefter ausgeloest werden als beabsichtigt.

**CentralEventManager vs. Event-System:** Es existieren zwei parallele Event-Mechanismen ([CentralEventManager.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/CentralEventManager.ts) mit 18KB und die typsicheren [EventTypes](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/events/EventTypes.ts)). Events koennen ueber einen Kanal gesendet, aber im anderen abonniert worden sein, wodurch Handler nicht ausgeloest werden.

**File-API ohne Pfad-Validierung:** Die [save_graph](file:///c:/Users/ich/Desktop/code/_projects/Nodges/vite.config.ts#L21-L46) und [delete_file](file:///c:/Users/ich/Desktop/code/_projects/Nodges/vite.config.ts#L115-L143) Endpoints in vite.config.ts validieren den Dateinamen nicht gegen Path-Traversal (`../`). Ein manipulierter Request koennte Dateien ausserhalb von `public/data` lesen oder loeschen.

---

## 7. Welche Muster, Abstraktionen oder Konventionen koennten die Gesamtkomplexitaet reduzieren?

1. **Generisches Property-Widget-Pattern fuer MappingUI:**
   Ein `MappingPropertyConfig`-Interface, das Feldname, Label, Typ, Defaultwerte und erlaubte Mapping-Funktionen definiert. Eine einzige `renderPropertyMapping(config)`-Methode ersetzt die 15+ duplizierten Bloecke.

2. **State-Slices:**
   Den monolithischen State in thematische Slices aufteilen (GraphState, UIState, LayoutState, TemporalState, SelectionState). Jeder Slice hat eigene Subscriber, die nur bei Aenderungen im jeweiligen Slice feuern.

3. **Interface-First-Design:**
   Interfaces fuer alle Manager definieren, bevor neue Funktionalitaet hinzugefuegt wird. Das erzwingt klare Vertraege und ermoeglicht Mocking in Tests.

4. **Command-Pattern fuer Mutationen:**
   Graph-Operationen (addNode, removeNode, updateEdge etc.) als Commands modellieren. Das vereinfacht Undo/Redo, Batch-Operationen und Event-Emission.

5. **Template-Registry fuer LLM-Prompts:**
   Prompt-Templates in JSON/YAML-Dateien auslagern statt inline im LLMService. Das erleichtert Iteration ohne Code-Aenderungen.

6. **Lifecycle-Konvention:**
   Ein einheitliches `init() / dispose()`-Interface fuer alle Manager. App.ts ruft `dispose()` in umgekehrter Reihenfolge auf, wenn ein neuer Graph geladen wird.

---

## 8. Wenn jemand anderes dieses Projekt morgen uebernehmen muesste, welche Probleme wuerden zuerst auftreten?

1. **Orientierung in den Mega-Dateien:** MappingUI.ts (4.400 Zeilen), CreatePanel.ts (2.800 Zeilen), App.ts (1.754 Zeilen) und LLMService.ts (1.900 Zeilen) sind ohne tiefes Kontextwissen nicht navigierbar. Es gibt keine klare Gliederung oder Inhaltsverzeichnisse.

2. **Unklare Initialisierungsreihenfolge:** App.ts verdrahtet Manager manuell. Die Reihenfolge ist fragil und nirgends dokumentiert. Ein neuer Entwickler wuerde bei Aenderungen sofort auf Nullpointer-Fehler stossen.

3. **Zwei Event-Systeme:** Es ist nicht erkennbar, wann CentralEventManager und wann EventTypes zu verwenden ist. Neue Features koennten am falschen System angeschlossen werden.

4. **Dev-Only-Backend:** Die File-API laeuft als Vite-Plugin. Ein neuer Entwickler koennte versuchen, die Anwendung ohne Vite-Dev-Server zu deployen und wuerde feststellen, dass Speichern/Laden nicht funktioniert.

5. **Fehlende Architekturdokumentation:** Die 177 Dateien im [doc/](file:///c:/Users/ich/Desktop/code/_projects/Nodges/doc)-Verzeichnis sind versionierte Einzelprotokolle, aber es gibt keine aktuelle Uebersichtsdokumentation, die die Gesamtarchitektur, Datenfluss und Modulverantwortlichkeiten beschreibt. Die vorhandene [NodgesDoc_102.md](file:///c:/Users/ich/Desktop/code/_projects/Nodges/doc/NodgesDoc_102.md) ist 79KB gross, aber der Aktualisierungsstand ist unklar.

---

## 9. Welche Verbesserungen wuerden kurzfristig das beste Verhaeltnis von Aufwand zu Nutzen bieten?

| Prioritaet | Massnahme | Aufwand | Nutzen |
|---|---|---|---|
| 1 | **Path-Traversal-Fix in vite.config.ts** | 30 min | Sicherheitsluecke schliessen |
| 2 | **API-Key-Proxy-Pattern** statt VITE_-Praefix | 2-4 Std | Sicherheitsluecke schliessen |
| 3 | **AbortController in LLMService** | 1-2 Std | Abbruch laufender API-Calls bei Benutzerabbruch |
| 4 | **State-Slices einfuehren** (schrittweise) | 1-2 Tage | Performance und Wartbarkeit |
| 5 | **MappingUI Config-Driven refactoring** | 3-5 Tage | 100KB+ Code-Reduktion, Ende der Duplikation |
| 6 | **Lifecycle-Interface (init/dispose)** fuer alle Manager | 1 Tag | Speicher-Lecks verhindern |
| 7 | **Tests fuer NodeManager/EdgeObjectsManager** | 2-3 Tage | Regressionsschutz fuer Kernrendering |

---

## 10. Was hindert dieses Projekt aktuell daran, ein produktionsreifes Niveau zu erreichen?

**Kritische Blocker:**

1. **Kein deploybare Backend-API.** Die File-API (Speichern, Laden, Loeschen) ist ein Vite-Dev-Plugin. Im Production-Build (`vite build`) existiert dieses Backend nicht. Fuer Deployment braucht es einen separaten Server (Express, FastAPI, etc.) oder eine Client-seitige Persistenz (IndexedDB, File System Access API).

2. **API-Key-Exposition im Client.** Der OpenRouter-API-Key ist ueber `VITE_OPENROUTER_API_KEY` im gebundenen JavaScript sichtbar. Fuer Production muss die LLM-Kommunikation ueber ein Backend-Proxy laufen.

3. **Testabdeckung von ~15-18%.** Die gesamte UI-Schicht und grosse Teile der Core-Logik sind ungetestet. Ohne Tests ist kein sicheres Deployment moeglich.

4. **Path-Traversal-Schwachstelle.** Die File-API-Endpoints validieren Dateinamen nicht gegen Directory-Traversal.

**Wesentliche Huerden:**

5. **Kein Error-Boundary-System.** Fehler in einem Manager koennen die gesamte Anwendung zum Absturz bringen. Es gibt keinen Recovery-Mechanismus.

6. **Keine Performance-Optimierung fuer grosse Graphen.** InstancedMesh wird verwendet, aber es fehlen LOD (Level of Detail), Frustum Culling auf Datenebene und virtuelle DOM-Patterns fuer die UI-Panels.

7. **Kein Build-Pipeline-Test.** Die Build-10/12-Pipelines werden nicht automatisiert getestet. Aenderungen an Prompts oder Parsing-Logik koennen unbemerkt die Graph-Generierung brechen.

8. **CORS wildcard im LightRAG-Backend.** `allow_origins=["*"]` ist fuer Development akzeptabel, muss fuer Production eingeschraenkt werden.

---

## Zusammenfassung der Dateigroessen-Verteilung

```
Groesste Dateien (>20KB):
  154 KB  src/ui/MappingUI.ts
  101 KB  src/ui/CreatePanel.ts
   76 KB  src/utils/LLMService.ts
   75 KB  src/App.ts
   43 KB  src/core/LayoutManager.ts
   43 KB  src/core/NodeManager.ts
   43 KB  src/ui/FilePanelUI.ts
   35 KB  src/utils/AxisPositionHelper.ts
   32 KB  src/core/StateManager.ts
   31 KB  src/core/EdgeObjectsManager.ts
   31 KB  src/effects/HighlightManager.ts
   29 KB  src/ui/ViewPanel.ts
   25 KB  src/core/VisualMappingEngine.ts
   25 KB  src/core/DataParser.ts
   24 KB  src/utils/NodeLabelManager.ts
   24 KB  src/utils/ImportManager.ts
   22 KB  src/utils/SelectionManager.ts
   21 KB  index.html
```

Gesamter Source-Code (src/ ohne Tests): geschaetzt ~1.050 KB
Davon in den Top-4-Dateien: ~406 KB (39%)
