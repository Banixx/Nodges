# Nodges Project Knowledge

## Übersicht
Nodges ist eine **Spatial Analytics Engine** für die browserbasierte 3D-Netzwerkanalyse. Es ermöglicht die Darstellung und interaktive Erkundung komplexer Systeme in einem dreidimensionalen Raum unter Verwendung von WebGL.

## Technische Architektur
- **Core**: TypeScript mit Vite als Build-Tool.
- **Rendering**: [Three.js](https://threejs.org/) (v0.161.0) für die 3D-Visualisierung.
- **Animationen**: `@tweenjs/tween.js` für flüssige Übergänge.
- **UI/Steuerung**: `lil-gui` für Parameteranpassungen; Custom HTML/CSS für die Sidebar und Overlays.
- **Validierung**: `zod` für die Schema-Validierung von Netzwerkdaten.
- **Testing**: `Vitest` für Unit- und Integrationstests.

## Projektstruktur
- `index.html`: Haupteinstiegspunkt der Anwendung.
- `src/`: Quellcode der Anwendung.
    - `src/utils/LLMService.ts`: Integration von Large Language Models (KI-Anbindung).
    - `src/styles/`: CSS-Dateien für das Interface (hauptsächlich `main.css`).
- `scripts/`: Hilfsskripte (z. B. zur Datengenerierung).
- `public/`: Statische Assets und Beispieldaten.
- `doc/`: Dokumentation und spezifische Projektnotizen.

## Datenformat
Nodges nutzt ein spezifisches JSON-Format zur Definition von Systemen:
- **`system`**: Name des Systems.
- **`metadata`**: Zusätzliche Informationen (Beschreibung).
- **`visualMappings`**: Definition von Farben und Größen basierend auf Knotentypen.
- **`data`**:
    - `entities`: Knoten mit ID, Typ, Label und 3D-Position.
    - `relationships`: Kanten zwischen Knoten mit Source und Target.

## Features
- **3D-Darstellung**: Unterstützung für diverse Geometrien (Kugeln, Oktaeder, etc.).
- **Interaktion**: OrbitControls (Zoom, Pan, Rotation), Hover-Effekte, Knotenauswahl.
- **KI-Integration**: Generierung von Graphen über LLM-Prompts (Create-Tab).
- **Echtzeit-Statistiken**: Anzeige von FPS und Netzwerkkomplexität.

## Entwicklungs-Workflow
- `npm run dev`: Startet den Vite-Entwicklungsserver.
- `npm run build`: Kompiliert das Projekt für die Produktion.
- `npm run test`: Führt die Testsuite aus.

## Aktueller Stand
Das Projekt befindet sich in Version **0.98.1.7**. Aktuelle Fokusbereiche sind die Optimierung der Sidebar-Navigation und die Erweiterung der KI-gestützten Graph-Generierung.
