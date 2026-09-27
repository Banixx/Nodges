# Nodges – Kernarchitektur

## 1. Architekturmuster

Nodges folgt einem **modularen Manager-Muster mit zentraler Orchestrierung** und einem **Dependency-Injection-Container** als Verdrahtungsmechanismus:

- Eine zentrale **`App`**-Klasse initialisiert Three.js-Szene, Kamera, Renderer und `OrbitControls`.
- Sie instanziiert und registriert alle Manager im **`ServiceContainer`** (Singleton).
- Manager kommunizieren über zwei zentrale Dienste:
  - **`StateManager`** (Zustand / Single Source of Truth),
  - **`CentralEventManager`** (Ereignisse / Event-Bus).
- Die 3D-Objekte (Knoten, Kanten) werden durch das **NodeManager/EdgeObjectsManager**-Paar verwaltet; das visuelle Verhalten bestimmt die **VisualMappingEngine**.

## 2. Der ServiceContainer (Dependency Injection)

`src/core/di/ServiceContainer.ts` ist ein einfacher Singleton-Container:

- `register(key, service)` – registriert eine Instanz, warnt bei Überschreiben.
- `get<T>(key)` – liefert eine Instanz; wirft, wenn nicht vorhanden.
- `has(key)` – prüft das Vorhandensein.
- `reset()` – leert den Container (für Tests).
- `resolve(...keys)` – bequeme Mehrfach-Auflösung mit überladenen Signaturen bis 8 Dienste.

**Registrierte Dienste (Beispiele):** `Scene`, `Camera`, `Renderer`, `Controls`, `IStateManager`, `StateManager`, `VisualMappingEngine`, `PerformanceMonitor`, `LayoutManager`, `GlowEffect`, `HighlightManager`, `IEventManager`, `InteractionManager`, `SelectionManager`, `RaycastManager`, `NetworkAnalyzer`, `PathFinder`, `PerformanceOptimizer`, `ImportManager`, `ExportManager`, `MapManager`, `FileHandler`, `EdgeLabelManager`, `NodeLabelManager`, `NeighborhoodHighlighter`, `BatchOperations`, `KeyboardShortcuts`, `NodeManager`, `EdgeObjectsManager`, `CameraManager`, `TrailManager`.

**Bewertung:** Der Container erfüllt seinen Zweck (Decoupling), wird aber überwiegend als Service-Locator genutzt. Die Schnittstellen `IStateManager`/`IEventManager` sind definiert, viele Manager beziehen jedoch konkrete Klassen statt Interfaces (siehe Verbesserungen, Kapitel 14).

## 3. Klassendiagramm (vereinfacht)

```
                       ┌─────────────┐
                       │  App        │   init, Render-Loop, Orchestrierung
                       └──────┬──────┘
                              │ registriert in
                              ▼
                     ┌──────────────────┐
                     │ ServiceContainer │  (Singleton, DI)
                     └──────────────────┘
        ┌───────────────┬───────────────┬───────────────┬───────────────┐
        ▼               ▼               ▼               ▼               ▼
  StateManager   CentralEvent    NodeManager    EdgeObjects    LayoutManager
  (Zustand)      Manager         (Knoten-3D)    Manager        (Layout/Worker)
        │         (Events)                       (Kanten-3D)
        ├── subscribes  ▲                          │
        │               │ publish/subscribe        │
        ▼               │                          ▼
  UI/Manager-Subscriber ┘               VisualMappingEngine
                                       (Attribute → Visual)
```

## 4. Der Render-Loop (`App.animate`)

Der Render-Loop (via `requestAnimationFrame`) ist das Herzstück:

1. FPS-Limit-Simulation (`devFpsLimit`) prüfen.
2. Delta-Zeit berechnen; **Temporal-Playback** fortschreiben (`setCurrentTimestamp`).
3. `NodeManager`: temporale Zustände, Cloud-Positionen, Overlap-Effekte.
4. `EdgeObjectsManager`: temporale Zustände, Positionskorrektur, Animation.
5. `CameraManager.update()`; Label-Manager-Updates; `PerformanceMonitor.tick()`.
6. `controls.update()`.
7. **Haupt-Viewport rendern** (manuelles Clear, da `autoClear = false`).
8. **Minimap-Viewport rendern** (zweiter Rendering-Pass mit Ortho-Kamera und Scissor/Viewport, DPR-Korrektur).
9. FPS-Berechnung und UI-Update.

**Hinweis:** `autoClear = false` und manuelles Scissor/Viewport-Management sind notwendig, um Haupt- und Minimap-Viewport auf einem Renderer darzustellen.

## 5. Initialisierungsphasen

`App.init()` durchläuft:
1. `initThreeJS()` – Renderer, Kamera, Controls, Lichter, Boden/Gitter, Resize-Listener.
2. `initManagers()` – erstellt und registriert alle Manager.
3. `initGUI()` – UIManager, MinimapUI, SuggestionUI, Minimap-Kamera und -Marker.
4. `loadDefaultData()` – aktuell nur Log-Hinweis (kein Standard-Datensatz).
5. `setupEnvironmentSubscriptions()` – State-Subscriptions für Umgebung, Labels, Dev-Einstellungen, Datensync und Deep-Dive-Listener.
6. `animate()`.

HMR (`import.meta.hot.accept`) zerstört die alte Instanz über `destroy()` und lässt Vite neu laden.

## 6. Wichtige Querschnitts-Dienste

- **`ErrorHandler`** – zentraler Fehler-Handler mit Kategorien (`initialization`, `import`, …) und Severity; kapselt User-Meldungen über `NotificationService`.
- **`NotificationService`** – Singleton für sichtbare UI-Benachrichtigungen (max. 5 gleichzeitig, Standard-Dauer 5000 ms).

## 7. Bewertung der Kernarchitektur

**Positiv:**
- Gute Entkopplung durch Event-System und State-Subscriptions.
- DI-Container ermöglicht Testbarkeit der Manager.
- Robustheit durch mehrstufigen Renderer-Fallback.

**Verbesserungspotenzial (Details in Kapitel 14):**
- `App.ts` ist ein God-Object und erledigt zu viel manuell (Layout-Callbacks, Mapping-Anwendung, Label-Pflege).
- Redundanter Zustand zwischen `App.currentEntities` und `StateManager.state.graphData`.
- Der ServiceContainer wird als Service-Locator statt echter Konstruktor-Injektion genutzt.
- Interface-Abstraktion inkonsistent (teils Interfaces, teils konkrete Klassen).
- Der Render-Loop ist sehr lang und vermischt Rendering, Logik und UI-Aktualisierung.

---

*Weiter: `/workspace/com/doc/05_datenmodell_nodges_V4.md`.*
