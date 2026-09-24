# Nodges Projektuebersicht (Version 0.102.12)

## Projektbeschreibung
Nodges ist eine webbasierte 3D-Netzwerk-Visualisierungsanwendung, die auf Three.js, TypeScript und Vite basiert. Sie ermöglicht die interaktive Darstellung, Manipulation und Analyse von komplexen Graphen, Daten-Mappings, temporalen Sequenzen und dreidimensionalen Layouts.

## Hauptkomponenten und Architektur

### 1. Kern-Module (`src/core/`)
- **App.ts**: Haupt-Orchestrierung und Initialisierung der Three.js-Szene, Manager und Event-Loop.
- **NodeManager.ts**: Verwaltung aller 3D-Knoten-Objekte, deren Positionierung, Skalierung, Farben, Labels und Sichtbarkeit.
- **EdgeObjectsManager.ts**: Steuerung der 3D-Kanten (Verbindungen) zwischen Knoten, inklusive Pfeile, Materialien und Stile.
- **LayoutManager.ts**: Berechnungs-Engine für verschiedene 3D-Layouts (z. B. Force-Directed, Gitter, Sphärisch, Temporale Achsen).
- **VisualMappingEngine.ts**: Dynamische Transformation von Knoteneigenschaften und Daten-Feldern auf visuelle Attribute.
- **StateManager.ts**: Zentrale Verwaltung des Anwendungszustands und Historie.
- **CentralEventManager.ts**: Event-Driven Bus zur Entkopplung von UI-, Core- und Visualisierungskomponenten.
- **DataParser.ts**: Import, Validierung (mittels Zod) und Konvertierung von JSON-Graphdaten.

### 2. Benutzeroberflaeche (`src/ui/`)
- **MappingUI.ts**: UI-Kontrollen zur Zuordnung von Datenfeldern zu visuellen Kanälen.
- **CreatePanel.ts**: Interaktive Erstellung und Generierung von Knoten, Kanten und Geometrien.
- **FilePanelUI.ts**: Datei-Import, -Export und Session-Verwaltung.
- **TimePlayerUI.ts**: Steuerung temporaler Datenreihen und Animationen ueber Zeitachsen.
- **DevPanel.ts / ViewPanel.ts / EnvironmentPanel.ts**: Einstellungen fuer Umgebungslicht, Kamerasteuerung und Entwickler-Tools.

### 3. Skripte & Backend-Integration
- **lightrag-backend/**: Schnittstelle für RAG/LLM-basierte Datenanalyse und automatisierte Graph-Generierung.
- **deno-proxy/**: Proxy-Services für externe API-Anfragen.

## Technologie-Stack
- **Sprache**: TypeScript
- **3D Engine**: Three.js (v0.161.0)
- **Build Tool**: Vite (v5.1.4)
- **Validierung**: Zod (v3.22.4)
- **Animation**: @tweenjs/tween.js
- **Testing**: Vitest, Happy-DOM
