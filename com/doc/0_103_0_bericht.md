# Projektbericht: Nodges 0.103.0

## Zusammenfassung

Nodges ist eine webbasierte 3D-Netzwerkvisualisierungsanwendung, die komplexe Systeme als interaktive Graphen darstellt. Das Projekt nutzt Three.js fuer die 3D-Rendering-Pipeline und Vite als Build-Tool. Es befindet sich im Arbeitsverzeichnis `/workspace`.

---

## Technologie-Stack

| Bereich | Technologie |
|---------|-------------|
| Build-Tool | Vite 5.1.4 |
| Sprache | TypeScript 5.3.3 |
| 3D-Engine | Three.js 0.161.0 |
| UI-Styling | Vanilla CSS (main.css) |
| Animation | @tweenjs/tween.js |
| GUI | lil-gui |
| Testframework | Vitest 1.6.1 |
| Datenvalidierung | Zod 3.22.4 |
| Backend (optional) | Python (lightrag-backend) |
| Proxy (optional) | Deno (deno-proxy) |

---

## Projektstruktur

```
/workspace/
|-- src/
|   |-- App.ts                  # Hauptanwendungsklasse
|   |-- core/                   # Kernmodule (State, Events, Kamera, Layout, UI)
|   |-- effects/                # Visuelle Effekte (Glow, Highlight)
|   |-- ui/                     # UI-Komponenten (Minimap, Suggestions)
|   |-- utils/                  # Hilfsmodule (Selection, Raycast, Import/Export, LLM)
|   |-- tests/                  # Unit- und Integrationstests
|-- public/
|   |-- data/                   # Graph-Datenbanken und generierte Datensets
|   |-- nodges_schema.json      # Projekt-Schema
|-- lightrag-backend/           # Python-Backend fuer RAG-Integration
|-- deno-proxy/                 # Deno-Proxy-Server
|-- index.html                  # Einstiegspunkt mit Sidebar-Layout
|-- vite.config.ts              # Vite-Konfiguration mit API-Middleware
|-- package.json                # Projektmetadaten (Version 0.103.0)
|-- tsconfig.json               # TypeScript-Konfiguration
|-- vitest.config.ts            # Testkonfiguration
```

---

## Architektur

### Kernmodule (`src/core/`)

Die Anwendung folgt einem modularen Architekturmuster mit zentraler Ereignissteuerung:

- **App.ts** – Instanziiert die Three.js-Szene, Kamera, Renderer und OrbitControls. Verwaltet alle Manager ueber einen `ServiceContainer`.
- **StateManager** – Zentraler Zustandsspeicher fuer Entitaeten, Beziehungen, Selektionen und Visual-Mappings.
- **CentralEventManager** – Event-Bus fuer die Entkopplung der Module.
- **InteractionManager** – Behandelt Benutzerinteraktionen (Hover, Klick, Drag, Tastatur).
- **NodeManager / EdgeObjectsManager** – Verwaltung von 3D-Knoten und Kantenobjekten.
- **LayoutManager** – Automatische und manuelle Layoutalgorithmen fuer die Graphanordnung.
- **UIManager** – Sidebar-Tabs, Panels und UI-Zustand.
- **CameraManager** – Kamerabewegungen, Zoom und Fokus auf Objekte.
- **VisualMappingEngine** – Abbildung von Datenattributen auf visuelle Eigenschaften.

### Hilfsmodule (`src/utils/`)

- **SelectionManager** – Multi-Selektion und Box-Selection.
- **RaycastManager** – 3D-Raycasting fuer Hover/Click-Erkennung.
- **PathFinder** – Wegfindung zwischen Knoten.
- **NetworkAnalyzer** – Netzwerkmetriken und -analyse.
- **ImportManager / ExportManager** – Laden und Speichern von Graph-Daten.
- **LLMService** – Integration von Sprachmodellen fuer Erklaerungen und Vorschlaege.
- **PerformanceOptimizer / PerformanceMonitor** – Laufzeitoptimierung und FPS-Monitoring.

---

## Datenmodell

Das Projekt arbeitet mit einem eigenen Graph-Datenmodell, das in `nodges_schema.json` definiert ist:

- **Entitaeten (Entities)** – Knoten mit Typen, Attributen und Positionen.
- **Beziehungen (Relationships)** – Kanten zwischen Entitaeten mit Typ und Richtung.
- **DataModel** – Definition von EntityTypes und RelationshipTypes.
- **VisualMappings** – Regeln fuer die visuelle Repraesentation (Farbe, Groesse, Form).

Daten werden als JSON-Dateien unter `/workspace/public/data/` gespeichert und koennen ueber die interne REST-API (`/api/save_graph`, `/api/list_files`, `/api/create_database`) verwaltet werden.

---

## Backend-Integration

### lightrag-backend

Ein Python-Skript (`/workspace/lightrag-backend/main.py`) stellt eine optionale RAG-(Retrieval-Augmented Generation)-Schnittstelle bereit. Es erlaubt die Anreicherung von Graph-Daten mit semantischen Suchen und LLM-basierten Erklaerungen.

### Deno-Proxy

Unter `/workspace/deno-proxy/index.ts` befindet sich ein minimaler Deno-Proxy fuer externe API-Aufrufe.

---

## Entwicklungsserver

Der Vite-DevServer ist in `vite.config.ts` konfiguriert:

- **Host:** `0.0.0.0`
- **Port:** `5173`
- **Proxy:** `/lightrag-api` wird an `http://localhost:8000` weitergeleitet.
- **API-Middleware:** Endpunkte zum Speichern, Auflisten, Erstellen und Loeschen von Graph-Dateien.

Der Server ist im Container bereits aktiv und erreichbar.

---

## Testabdeckung

Das Projekt enthaelt Tests unter `/workspace/src/tests/` fuer:

- DataParser
- ErrorHandler
- ExportManager / ImportManager
- LayoutManager
- StateManager
- SelectionHandler
- LLMService
- LightRAGService

Tests werden mit Vitest ausgefuehrt (`npm test`).

---

## Status und Version

| Attribut | Wert |
|----------|------|
| Name | nodges |
| Version | 0.103.0 |
| Beschreibung | 3D Network Visualization with Three.js |
| Lizenz | Siehe `/workspace/LICENSE` |
| Build | Aktiv (Vite DevServer laeuft) |

---

## Fazit

Nodges ist eine gut strukturierte, modulare 3D-Visualisierungsanwendung fuer Netzwerkdaten. Die Architektur trennt sauber zwischen Rendering, Zustandsverwaltung, Interaktion und Datenfluss. Die optionale Python-RAG-Integration und der Deno-Proxy erweitern die Anwendung um KI-gestuetzte Funktionen. Die Testabdeckung und die integrierte REST-API fuer Dateioperationen zeugen von einem produktionsreifen Ansatz.
