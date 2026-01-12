# Nodges Project Analysis

## Overview

**Nodges** is a 3D Network Visualization application built with **TypeScript**, **Vite**, and **Three.js**. It allows users to visualize complex graph data (Entities & Relationships) in an interactive 3D environment.

## Tech Stack

- **Languages**: TypeScript, HTML, CSS
- **Build Tool**: Vite
- **3D Engine**: Three.js
- **Validation**: Zod (Runtime type checking)
- **UI**: Vanilla HTML/CSS with custom panel logic (no heavy framework like React/Vue)
- **Controls**: OrbitControls (Three.js)
- **Animation**: Tween.js (dependency listed but usage to be confirmed, likely used in managers)
- **GUI**: lil-gui (dependency listed)

## Architecture

### Core (`src/App.ts`)

The `App` class is the entry point. It handles:

- **Initialization**: Three.js Scene, Camera, Renderer, Lights.
- **Manager Coordination**: Instantiates and links all sub-managers.
- **Render Loop**: Manages the `animate` loop and delegates updates.
- **Data Loading**: Loads and parses JSON data into the internal `GraphData` structure.

### Managers (`src/core/`)

The application logic is distributed across specialized managers:

- **StateManager**: Centralized state management (Observer pattern).
- **CentralEventManager**: Event bus for decoupling components (Pub/Sub).
- **NodeManager**: Handles instantiation and updating of Node meshes (InstancedMesh likely used for performance).
- **EdgeObjectsManager**: Handles visual representation of edges (Lines/Tubes).
- **InteractionManager**: Handles user input (Raycasting, Clicks, Hover).
- **LayoutManager**: Calculates node positions (Force-directed algorithms).
- **UIManager**: Bridges the 3D world with the HTML UI panels.
- **VisualMappingEngine**: Translates data properties into visual attributes (Color, Size, Shape) based on `VisualMappings`.

### Data Model (`src/types.ts`)

Data is validated using **Zod**.

- **GraphData**: Root object containing `entities` and `relationships`.
- **EntityData** (`node`):
  - `id`: Unique identifier.
  - `type`: Node type.
  - `position`: {x, y, z}.
  - `properties`: Flexible key-value store.
- **RelationshipData** (`edge`):
  - `source`: ID of source node.
  - `target`: ID of target node.
  - `type`: Connection type.

### Visual Mapping System

A key feature is the separation of data and visualization.

- **VisualMappings**: Configuration defining how data maps to visuals.
- Supported Mappings: `linear`, `exponential`, `heatmap`, `discrete`, etc.
- **VisualProperties**: Computed result (size, color, etc.) applied to 3D objects.

## Directory Structure

- `src/`: Source code
  - `App.ts`: Main application class.
  - `main.ts` (implied): Entry point mount.
  - `core/`: Core systems (Managers, State, Events).
  - `objects/`: 3D Object implementations (e.g. NodeMesh, EdgeLine).
  - `ui/`: UI logic (Panel management).
  - `utils/`: Helpers (Math, File IO, Parsers).
  - `effects/`: Visual effects (Glow, Highlight).
  - `styles/`: CSS files.
  - `types.ts`: TypeScript interfaces and Zod schemas.

## Key Workflows

1. **Loading Data**: `App.loadData` -> `DataParser` -> `App.loadGraphData` -> `NodeManager` & `EdgeObjectsManager`.
2. **Updating Visuals**: `VisualMappingEngine` computes new properties -> Managers update meshes.
3. **Interaction**: `InteractionManager` detects Raycast -> `StateManager` updates selection -> `HighlightManager` applies visual feedback.

## User Interface

The UI consists of collapsible HTML panels defined in `index.html`:

- **File Info**: Statistics about the loaded graph.
- **Files**: File browser/loader.
- **Mapping**: Controls for visual mappings.
- **Environment**: Lighting and scene settings.
- **Dev Options**: Debug controls (Edge thickness, etc.).
