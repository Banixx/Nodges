# Nodges – Projektüberblick

## 1. Was ist Nodges?

Nodges ist eine webbasierte Anwendung zur **anschaulichen Visualisierung komplexer Systeme als 3D- beziehungsweise 4D-Netzwerke**. Sie rendert Graphen (Knoten und Kanten) im Browser und erlaubt das Erkunden, Filtern und Erklären der zugrunde liegenden Daten. Das Motto lautet: *explore, filter, explain*.

Die Anwendung ist als Single-Page-Anwendung (SPA) mit Vite und TypeScript umgesetzt und nutzt Three.js für die 3D-Darstellung. Sie ist reine Client-Anwendung, wird jedoch durch optionale Backend-Dienste (LightRAG, Deno-Proxy) um KI-Funktionen erweitert.

## 2. Zielsetzung und Einsatz

- **Zielgruppe:** Datenanalyse, Systemmodellierung, Wissensgrafen, erzieherische/kognitive Visualisierung ("build manual").
- **BYOK-Prinzip:** "Bring Your Own Key" – Nutzer hinterlegen eigene API-Keys für die KI-Funktionen (OpenRouter, OpenAI, Anthropic, lokale Ollama/LM-Studio-Modelle).
- **Daten:** Graphdaten werden als JSON-Dateien geladen, gespeichert und verwaltet (eingebettete REST-API im Dev-Server).

## 3. Feature-Set (Kurzübersicht)

- **3D-Rendering von Graphen:** Knoten als Geometrien (Kugel, Würfel u. a.), Kanten als Tubes/Bezier-Kurven.
- **Layout-Algorithmen:** Force-Directed-Layout mit Background-Worker, weitere algorithmische Layouts.
- **Visuelles Mapping:** Datenattribute auf Farbe, Größe, Geometrie, Position, Glow, Animation und Physik (Attraktion/Repulsion/Inertia) abbildbar.
- **Interaktion:** Hover, Klick, Mehrfachauswahl, Box-Selektion, Drag, Kontextmenü, Tastaturkürzel, Undo/Redo.
- **Temporal (4D):** Zeitstempel, Time-Player, Ein-/Ausblenden von Entitäten/Kanten über die Zeit.
- **Minimap:** Orthografische Übersichtskarte mit Kamera-Marker.
- **Datenbanken:** JSON-Dateien als Datenbanken, mehrere Datensätze append/remove, Schema-Merging.
- **KI-Integration:** Deep-Dive-Erweiterung des Graphen, Vorschläge für Visual-Mappings, Erklärungen.
- **Export/Import:** JSON-Import mit Normalisierung, Export mit Schema.
- **Performance-Tools:** FPS-Monitor, Renderer-Umbau, Pixel-Ratio-/FPS-Limit-Simulation im Dev-Panel.

## 4. Grundlegender Datenfluss

```
JSON-Datei / API
      │  (fetch, FileHandler, ImportManager)
      ▼
 DataParser (normalisiert, Zod-Validierung, Schema 3.0–5.0)
      │
      ▼
 App.loadGraphData → currentEntities / currentRelationships
      │
      ├──► StateManager (setGraphData → Single Source of Truth)
      │         │
      │         └──► Subscriber-Categorien (data_changed u. a.)
      │
      ├──► VisualMappingEngine (Daten → visuelle Eigenschaften)
      │
      ├──► NodeManager (erzeugt 3D-Knoten)
      ├──► EdgeObjectsManager (erzeugt 3D-Kanten)
      ├──► LayoutManager (optional, per Worker)
      ├──► NodeLabelManager / EdgeLabelManager (Labels)
      │
      ▼
 Renderer (Haupt-Viewport + Minimap-Viewport)
```

## 5. Architektur in einem Satz

Nodges folgt einem **modularen Manager-Muster**: Eine zentrale `App`-Klasse orchestriert spezialisierte Manager (`NodeManager`, `EdgeObjectsManager`, `LayoutManager`, `UIManager` …), die über einen **ServiceContainer (DI)** verdrahtet sind und über **StateManager** (Zustand) sowie **CentralEventManager** (Ereignisse) lose miteinander kommunizieren. Details dazu in Kapitel 04, 06 und 07.

## 6. Stärken und Schwächen (zusammenfassend)

**Stärken:**
- Klare Trennung von Zustand, Ereignissen, Rendering und Interaktion.
- Robustheit: Mehrstufiger WebGL-Fallback, ErrorHandler, NotificationService.
- Umfangreiches, typisiertes Datenmodell mit Zod.
- Hintergrund-Worker für rechenintensive Layouts.

**Schwächen/Herausforderungen:**
- `App.ts` ist mit über 1700 Zeilen ein God-Object und orchestriert viel manuell.
- Nebenläufige Datenpfade: `currentEntities` existieren sowohl in `App` als auch im `StateManager` (Redundanz-Risiko).
- UI-Komponenten (MappingUI, CreatePanel) sind sehr groß (2800/2300 Zeilen).
- Teilweise Kompatibilitäts-Übersetzungen (Abwärtskompatibilität) erhöhen die Komplexität.

Diese Punkte werden in Kapitel 14 systematisch aufgearbeitet.

---

*Weiterführende Kapitel: `/workspace/com/doc/02_technologie_stack_nodges_V4.md` (Technologie), `/workspace/com/doc/04_architektur_kern_nodges_V4.md` (Kernarchitektur).*
