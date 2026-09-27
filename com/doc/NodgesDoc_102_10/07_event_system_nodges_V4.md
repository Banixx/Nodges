# Nodges – Event-System

## 1. Zweck

`src/core/CentralEventManager.ts` ist das zentrale Event-System von Nodges. Es bündelt alle Maus- und Tastaturinteraktionen sowie deren Verarbeitung und **ersetzt verteilte Event-Handler** früherer Versionen. Das System ist **typisiert** (Phase 5) über `src/core/events/EventTypes.ts`.

## 2. Aufbau des Event-Managers

Der `CentralEventManager`:
- Instanziiert einen einzigen `RaycastManager` für die 3D-Treffererkennung.
- Erstellt ein `HoverInfoPanel` für intelligente Tooltip-Positionierung.
- Hält eine Registry aller registrierten DOM-Event-Listener plus ein Set aktiver Listener.
- Verfolgt den Hover-/Selektionszustand, Mausposition, FPS-Throttling und Kamerabewegung.

Interessant im Quellcode: Der Konstruktor löst Kamera, Renderer, StateManager und Scene über den Container auf. Die ursprünglich vorgesehenen `NodeManager`/`EdgeObjectsManager` sind auskommentiert (nicht mehr direkt genutzt).

## 3. Typisierte Event-Map

`src/core/events/EventTypes.ts` definiert für jeden Event-Typen ein Payload-Interface und mappt die Event-Namen auf ihre Payload-Typen (`EventMap`):

| Event | Payload |
|-------|---------|
| `mousemove` | `MouseMoveEventData` (Event, hoveredObject, mousePosition) |
| `mousedown` | `MouseDownEventData` (Event, clickedObject, button) |
| `mouseup` | `MouseUpEventData` (wasMouseDown, downDuration, button) |
| `click` | `ClickEventData` (clickedObject, button) |
| `doubleclick` | `DoubleClickEventData` |
| `contextmenu` | `ContextMenuEventData` |
| `keydown` / `keyup` | `KeyDown/KeyUpEventData` |
| `resize` | `ResizeEventData` |
| `hover_start` / `hover_end` | `HoverStart/EndEventData` (object) |
| `selection_start` / `selection_end` | `SelectionStart/EndEventData` (object) |
| `mode_changed` | `ModeChangedEventData` (mode) |
| `node_created` | `NodeCreatedEventData` (node) |
| `edge_created` | `EdgeCreatedEventData` (edge) |

## 4. Subscriber/Publish-API (IEventManager)

Das Interface `IEventManager` in `src/core/interfaces.ts` definiert:

- **Typsichere Subscription:** `subscribe<K extends EventType>(type, cb: (data: EventMap[K]) => void)`.
- **Fallback** (Abwärtskompatibilität): `subscribe(eventType: string, cb)` für unbekannte Event-Typen.
- **Typsicheres Publish:** `publish<K extends EventType>(type, data)`.
- **Fallback-Publish:** `publish(eventType: string, data)`.
- Zusätzlich Maus-Flächen (`onMouseMove`, `onMouseDown`, `onMouseUp`, `onClick`) und `setCameraMoving`.

## 5. Konfiguration und Throttling

Der Konstruktor legt fest:
- `hoverDelay: 50`, `clickDelay: 100`, `doubleClickThreshold: 300`.
- `mouseMoveThrottle: 50` (≈ 20 fps), um die Event-Flut zu reduzieren.
- `setCameraMoving(true/false)` deaktiviert Raycasting während der Kamerabewegung (Performance).
- Verzögerte Aktionen (Hover-/Klick-Timeouts).

## 6. Aufgeklärte Interaktions-Handler

Neben dem zentralen Event-Manager existieren spezialisierte Handler unter `src/core/interaction/`:

- `HoverHandler` – Hover-Erkennung und Tooltip.
- `SelectionHandler` – Einzel-/Mehrfachauswahl.
- `DragHandler` – Knoten ziehen.
- `KeyboardHandler` – Tastatur.
- `NodeCreationHandler` – Knoten erstellen.
- `ContextMenuHandler` – Kontextmenü.
- `InteractionManager` – orchestriert diese Handler.

Diese Struktur entkoppelt einzelne Interaktionsaspekte vom zentralen Event-Manager.

## 7. Bewertung

**Positiv:**
- Typisierung eliminiert Fehler bei Event-Namen und Payload.
- Fallback für unbekannte Events hält Abwärtskompatibilität.
- Zentraler Event-Handler + spezialisierte Interaktions-Handler + effektives Throttling.

**Schwächen:**
- Doppelte Zuständigkeiten: `CentralEventManager` und `interaction/*` überlappen teils (Hover/Selektion erscheinen sowohl zentral als auch dezentral).
- Der Objekt-Typ `any` wird beim RaycastManager verwendet (als `private raycastManager: any`).
- Auskommentierter Code (NodeManager/EdgeObjectsManager im Konstruktor) erschwert die Lesbarkeit.

---

*Weiter: `/workspace/com/doc/08_rendering_visualisierung_nodges_V4.md`.*
