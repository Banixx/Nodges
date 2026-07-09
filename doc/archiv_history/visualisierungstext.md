# Projekt-Visualisierung: Nodges (Maschinenoptimierte Systemspezifikation)

Dieses Dokument definiert die technische Architektur von Nodges. Es spezifiziert alle Entitäten, deren interne Funktionsstrukturen (Unterentitäten) sowie die exakten Kommunikationspfade und Datenflüsse.

## 1. System-Architektur (Core)

### 1.1 App.ts (Orchestrierung)
Die zentrale Steuereinheit, welche den Lebenszyklus der Anwendung verwaltet.
- **Unterentitäten:**
  - `constructor()`: Initialisiert Three.js (Scene, Camera, WebGLRenderer), instanziiert den `ServiceContainer`.
  - `init()`: Asynchrone Initialisierungskette (ThreeJS, Manager, GUI, DefaultData).
  - `initCoreServices()`: Registriert `StateManager`, `PerformanceMonitor` und `VisualMappingEngine` im `ServiceContainer`.
  - `initManagers()`: Instanziiert und registriert alle funktionalen Manager (Layout, Glow, Highlight, UI, Event, Interaction, Selection, Raycast, Network, Path, Performance, File, Import, Export, Label, Neighborhood, Group, Batch, Keyboard).
  - `loadGraphData(graphData, sourceName)`: Orchestriert das Laden von Graphen, bereinigt die Scene, setzt den State und triggert `createNodes` sowie `createEdges`.
  - `animate()`: Main-Render-Loop (aktualisiert Controls, State-Animationen, Renderer-Aufrufe).
  - `clearScene()`: Vollständige Bereinigung aller 3D-Objekte und Manager-Caches.
  - `destroy()`: Ressourcenfreigabe für Hot-Reload und App-Beendigung.
- **Verbindungen:**
  - `App` -> `ServiceContainer`: Registrierung aller Dienste über `container.register()`.
  - `App` -> `StateManager`: Aktualisierung des globalen Status über `stateManager.update()` und `stateManager.setGraphData()`.
  - `App` -> `NodeManager` / `EdgeObjectsManager`: Übergabe von `EntityData` und `RelationshipData` zur Mesh-Generierung.

### 1.2 core/StateManager.ts (Status-Management)
Zentraler "Single Source of Truth" mit integriertem Undo/Redo-System.
- **Unterentitäten:**
  - `update(partialState)`: Modifiziert den globalen `State` und benachrichtigt kategorisierte Subscriber.
  - `subscribe(callback, category)`: Registriert Listener für spezifische Statusänderungen (Kategorien: `data_changed`, `ui`, `default`).
  - `setGraphData(entities, relationships)`: Übergibt die Rohdaten an den Data-State.
  - `addNode(node)` / `removeNode(nodeId)` / `updateNode(id, updates)`: CRUD-Operationen für Knoten mit History-Eintrag.
  - `addEdge(edge)` / `removeEdge(edgeId)` / `updateEdge(id, updates)`: CRUD-Operationen für Kanten mit History-Eintrag.
  - `undo()` / `redo()`: Verwaltung der `undoStack` und `redoStack` (max. 50 Einträge).
  - `beginTransaction()` / `commitTransaction()`: Gruppierung mehrerer Operationen zu einem History-Eintrag.
- **Verbindungen:**
  - `StateManager` -> `IStateManager Subscriber`: Push-Benachrichtigung bei Statusänderungen.
  - `StateManager` -> `Undo/Redo Stack`: Persistierung von Aktions-Objekten (`HistoryAction`).

### 1.3 core/CentralEventManager.ts (Ereignis-Orchestrierung)
Zentralisierte Erfassung und Aufbereitung von Browser-Events für den 3D-Raum.
- **Unterentitäten:**
  - `initializeEventListeners()`: Bindet native Browser-Events (mousemove, mousedown, mouseup, click, dblclick, contextmenu, resize, keydown, keyup).
  - `handleMouseMove(event)`: Throttled Raycasting, Hover-Status-Check und Delegation an `HoverInfoPanel`.
  - `updateHoverState(object, x, y)`: Steuert das Timing von Hover-Events (Delay: 50ms) und benachrichtigt `StateManager`.
  - `subscribe(eventType, callback)`: Ermöglicht Komponenten wie dem `InteractionManager`, auf aufbereitete Ereignisse zu hören.
  - `notifySubscribers(eventType, data)`: Verteilt eventspezifische Datenpakete wie `ClickEventData` oder `MouseMoveEventData`.
- **Verbindungen:**
  - `CentralEventManager` -> `RaycastManager`: Nutzung zur Identifikation getroffener 3D-Objekte.
  - `CentralEventManager` -> `HoverInfoPanel`: Steuerung von Sichtbarkeit und Inhalt des Tooltips.
  - `CentralEventManager` -> `InteractionManager`: Primärer Datenstrom für Benutzerinteraktionen.

### 1.4 core/interaction/InteractionManager.ts (Interaktions-Fassade)
Delegiert Interaktionslogik an spezialisierte Handler.
- **Unterentitäten (Spezialisierte Handler):**
  - `HoverHandler`: Verwaltet Highlight-Effekte und Tooltip-Trigger.
  - `SelectionHandler`: Implementiert Selektionslogik (additiv, Fokus, Deselektion).
  - `DragHandler`: Realisiert das Verschieben von Knoten im 3D-Raum via Maus.
  - `KeyboardHandler`: Verarbeitet Tastaturkürzel wie `Entf` zum Löschen oder `Strg+Z` für Undo.
  - `ContextMenuHandler`: Steuert das projektbezogene Kontextmenü.
  - `NodeCreationHandler`: Workflow zum interaktiven Erstellen von Knoten und Kanten.
- **Verbindungen:**
  - `InteractionManager` -> `CentralEventManager`: Subskription aller relevanten Eingabeereignisse.
  - `InteractionManager` -> `StateManager`: Änderung des App-Status basierend auf Handler-Aktionen.

### 1.5 core/NodeManager.ts & core/EdgeObjectsManager.ts (Rendering-Engines)
Transformieren Datenstrukturen in 3D-Objekte (Three.js Meshes).
- **Unterentitäten (NodeManager):**
  - `updateNodes(entities)`: Gruppiert Entitäten nach Geometrietyp und erstellt `InstancedMesh`-Instanzen.
  - `updateNodePositions(entities)`: Synchronisiert Mesh-Matrizen mit den Datenpositionen (optimiert für Layout-Animationen).
  - `setNodeColor(id, color)` / `resetNodeColor(id)`: Direkte Manipulation der Instanz-Farbe.
- **Unterentitäten (EdgeObjectsManager):**
  - `updateEdges(relationships, nodes)`: Erzeugt `TubeGeometry` basierend auf `QuadraticBezierCurve3` für gekrümmte Verbindungen.
  - `animate()`: Berechnet Vertex-Farben für Effekte (Pulse, Flow, Sequential, Segments).
- **Verbindungen:**
  - `Rendering-Manager` -> `THREE.Scene`: Hinzufügen/Entfernen von Meshes.
  - `Rendering-Manager` -> `VisualMappingEngine`: Abfrage visueller Attribute (Farbe, Größe, Geometrie) pro Objekt.

### 1.6 core/LayoutManager.ts (Positionierungs-System)
Berechnet räumliche Anordnungen mit Web-Worker-Unterstützung.
- **Unterentitäten:**
  - `registerDefaultLayouts()`: Registriert Algorithmen (`force-directed`, `fruchterman-reingold`, `spring-embedder`, `hierarchical`, `tree`, `circular`, `grid`, `random`).
  - `applyLayout(layoutId, nodes, edges)`: Hauptmethode zum Ausführen einer Berechnung (delegiert rechenintensive Tasks an `LayoutWorker`).
  - `applyLayoutWithWorker(...)`: Asynchrone Kommunikation mit dem `layout-worker.ts`.
  - `normalizeNodePositions(nodes, maxExtent)`: Skaliert das Ergebnis auf eine definierte Raumgröße.
- **Verbindungen:**
  - `LayoutManager` -> `LayoutWorker`: Transfer von Knoten-Indizes und Kanten-Verbindungen zur parallelen Berechnung.
  - `LayoutManager` -> `App`: Triggert `updateNodePositions()` nach Abschluss der Berechnung.

## 2. Datenfluss- und Verbindungsmatrix

| Quelle (Entität.Methode) | Ziel (Entität.Methode) | Dateninhalt | Zeitpunkt / Trigger |
| :--- | :--- | :--- | :--- |
| `App.loadGraphData` | `StateManager.setGraphData` | `EntityData[]`, `RelationshipData[]` | Nach erfolgreichem JSON-Parse |
| `StateManager.update` | `UIManager.handleStateChange` | `Partial<State>` | Sofort bei Statusänderung |
| `CentralEventManager.handleMouseMove` | `RaycastManager.findIntersectedObject` | `MouseEvent` | Browser `mousemove` Event (throttled) |
| `CentralEventManager` | `InteractionManager.handleClick` | `ClickEventData` | Browser `click` Event |
| `InteractionManager.SelectionHandler` | `StateManager.setSelectedObject` | `THREE.Object3D` | Nach erfolgreichem Raycast-Hit |
| `LayoutManager.applyLayout` | `LayoutWorker.postMessage` | `LayoutWorkerRequest` | Bei Auswahl eines Layout-Algorithmus |
| `VisualMappingEngine.applyToEntity` | `NodeManager.updateNodes` | `VisualProperties` | Während der Mesh-Erstellung |
| `UIManager.initEdgeControls` | `StateManager.update` | `edgeThickness`, `edgeCurveFactor` | Änderung von UI-Slidern |
| `DataParser.parse` | `App.loadGraphData` | `GraphData` Objekt | Unmittelbar nach Dateizugriff |

## 3. Infrastruktur-Komponenten

- **ServiceContainer.ts**: Singleton-basiertes DI-System zur Entkopplung der Manager.
- **VisualMappingEngine.ts**: Logikschicht zur Abbildung von Datenfeldern wie `properties.importance` auf visuelle Kanäle wie `size` oder `color`.
- **ErrorHandler.ts**: Zentraler Service für Fehler-Logging und Benutzerbenachrichtigung mit Recovery-Optionen.
- **PerformanceMonitor.ts**: Überwacht FPS und Objektdichten zur dynamischen Anpassung der Detailstufen (`NodeDetailMultiplier`).

---
*Status: Maschinenlesbare Spezifikation (Build 0.98.1.4)*
*Letzte Aktualisierung: 13.03.2026*
