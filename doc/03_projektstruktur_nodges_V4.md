# Nodges – Projektstruktur

## 1. Wurzelverzeichnis `/workspace`

```
/workspace/
|-- .devcontainer/              # DevContainer-Konfiguration
|-- .dockerignore
|-- .env                        # lokale Umgebungsvariablen (nicht eingecheckt)
|-- .env.example                # Vorlage für Umgebungsvariablen
|-- .github/workflows/deploy.yml# CI/CD – Deploy auf GitHub Pages
|-- .gitignore
|-- AGENTS.md                   # Arbeitsregeln der Coding-Agenten-Umgebung
|-- LICENSE
|-- README.md                   # Kurzbeschreibung ("nodges visualize systems in 3D")
|-- deno-proxy/                 # Deno-CORS-Proxy für externe LLM-APIs
|-- doc/                        # Dokumentation (u. a. diese V4-Reihe)
|-- favicon-32x32.png
|-- index.html                  # Einstiegspunkt, Sidebar-Layout
|-- lightrag-backend/           # optionales Python/FastAPI-Backend (RAG)
|-- node_modules/               # Abhängigkeiten
|-- package-lock.json
|-- package.json                # Metadaten & Skripte (Version 0.103.1)
|-- public/                     # statische Assets, Daten, Schema
|-- rag_storage/                # Speicher für LightRAG
|-- src/                        # Quellcode
|-- tsconfig.json
|-- vite.config.ts              # Vite-Konfiguration + API-Middleware
|-- vitest.config.ts
```

## 2. `src/` – Quellcode

| Pfad | Inhalt |
|------|--------|
| `src/App.ts` | Hauptanwendungsklasse (God-Object, ~1737 Zeilen), Orchestrierung und Render-Loop |
| `src/index.css` | globales CSS |
| `src/types.ts` | TypeScript- und Zod-Datentypen (Datenmodell) |
| `src/core/` | Kernmodule (State, Events, Kamera, Layout, UI, Mapping) |
| `src/core/di/` | ServiceContainer (Dependency Injection) |
| `src/core/events/` | typisierte Event-Definitionen (`EventTypes.ts`) |
| `src/core/state/` | Sub-State-Typen und Subscriber-Kategorien (`StateTypes.ts`) |
| `src/core/interaction/` | Hover-, Drag-, Selection-, Keyboard-, Kontextmenü-, NodeCreation-Handler |
| `src/effects/` | GlowEffect, HighlightManager |
| `src/ui/` | UI-Komponenten (Panels, Minimap, Mapping, Create u. a.) |
| `src/utils/` | Hilfsmodule (Selection, Raycast, Import/Export, LLM, Analyse) |
| `src/workers/` | Web-Worker für Layout-Berechnung + geteilte Typen |
| `src/prompts/` | System-Prompts für die KI-Graphgenerierung (Build 5/6/8/10) |
| `src/tests/` | Vitest-Tests |
| `src/styles/` | zusätzliche CSS-Stile (main.css, mapping-ui.css) |

## 3. `src/core/` im Detail

| Datei | Funktion |
|-------|----------|
| `App.ts` | Hauptklasse und Render-Loop (root) |
| `BuildFormatUtils.ts` | Attributzugriff und Properties über verschiedene Build-Formate |
| `CameraManager.ts` | Kamerabewegungen, Fokus, Fit-to-Bounds |
| `CentralEventManager.ts` | zentraler Event-Handler (Maus, Tastatur, Hover, Selektion) |
| `DataParser.ts` | Normalisierung und Validierung von Graphdaten |
| `EdgeObjectsManager.ts` | Erzeugung/Updates der 3D-Kantenobjekte |
| `ErrorHandler.ts` | zentrale Fehlerbehandlung |
| `InteractionManager.ts` | Benutzerinteraktion orchestrieren |
| `LayoutManager.ts` | Layout-Algorithmen, Worker-Kommunikation |
| `MapManager.ts` | Karten-Hintergrund (Map-Hintergrundbild) |
| `NodeManager.ts` | Erzeugung/Updates der 3D-Knoten |
| `NotificationService.ts` | UI-Benachrichtigungen (Singleton) |
| `PerformanceMonitor.ts` | FPS-/Performance-Messung |
| `StateManager.ts` | zentraler Zustand, Undo/Redo, Transaktionen |
| `TrailManager.ts` | Trails (Bewegungsspuren) |
| `UIManager.ts` | UI-Zustand und Panel-Koordination |
| `VisualMappingEngine.ts` | Datenattribute → visuelle Eigenschaften |
| `di/ServiceContainer.ts` | DI-Container (Singleton, `resolve`) |
| `events/EventTypes.ts` | typisierte Event-Map |
| `state/StateTypes.ts` | Sub-State-Interfaces, Kategorien, Key-Mapping |
| `interaction/*` | Interaktions-Handler (Hover, Drag, Selection, Keyboard, ContextMenu, NodeCreation) |

## 4. `src/utils/` im Detail

| Datei | Funktion |
|-------|----------|
| `AxisPositionHelper.ts` | Positionierung entlang von Achsen (844 Zeilen) |
| `BatchOperations.ts` | Stapeloperationen |
| `EdgeLabelManager.ts` | Kanten-Beschriftungen |
| `ExportManager.ts` | Export von Graphdaten/Schema |
| `FileHandler.ts` | Dateiladen/-speichern über die Dev-API |
| `GraphGenerationService.ts` | Generierung von Graphen |
| `ImportManager.ts` | Import und Normalisierung |
| `KeyboardShortcuts.ts` | Tastaturkürzel |
| `LLMService.ts` | KI-Provider-Anbindung (1545 Zeilen) |
| `LightRAGService.ts` | LightRAG-Backend-Anbindung |
| `NeighborhoodHighlighter.ts` | Nachbarschaft hervorheben |
| `NetworkAnalyzer.ts` | Netzwerkmetriken/-analyse |
| `NodeLabelManager.ts` | Knoten-Beschriftungen |
| `PathFinder.ts` | Pfadfindung zwischen Knoten |
| `PanelUtils.ts` | Panel-Hilfsfunktionen |
| `PerformanceOptimizer.ts` | Laufzeitoptimierung |
| `RaycastManager.ts` | Raycasting für Hover/Klick |
| `SelectionManager.ts` | Mehrfachauswahl, Box-Selektion |
| `VectorStoreManager.ts` | Vektor-Speicher-Anbindung |
| `VisualOptimizer.ts` | automatischer visueller Ausgleich |

## 5. `public/` – statische Daten

```
public/
|-- data/
|   |-- archiv/        # alte Datensätze
|   |-- b10/ b12/ b6/ b7/ b8/  # Datensets der Iterationen Build 6–12
|   |-- databases/     # JSON-Datenbanken (erzeugt, z. B. /api/create_database)
|   |-- g35/ generated/ nodges/ temporal/  # weitere Beispiel-/Generator-Daten
|   |-- nodges_schema.json       # JSON-Schema (aus Zod exportiert)
|-- nodges_schema.json # zusätzliche Kopie auf Root-Ebene
|-- relationsets/      # Relations-Sets
```

## 6. Backend-Verzeichnisse

- **`lightrag-backend/`** – FastAPI-App `main.py`, `requirements.txt`, venv im Unterordner `venv` laut `package.json` (`npm run lightrag`).
- **`deno-proxy/`** – `index.ts`: minimaler Deno-Server, der POST-Anfragen mit OpenRouter-API-Key weiterleitet und CORS für erlaubte Origins festlegt.

---

*Weiter: `/workspace/doc/04_architektur_kern_nodges_V4.md`.*
