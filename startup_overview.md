# Erkenntnisse: Overview Panel (Minimap) Implementation

## Zielsetzung
Die Implementierung eines globalen Overlays (Minimap) zur Orientierung in großen Graphen. Das Panel soll links unten positioniert sein und sich ein-/ausfahren lassen.

## Technische Hürden & Lösungen

### 1. Positionierung & DOM-Struktur
- **Problem**: In `UIManager` verschachtelte Panels erben Stile oder werden durch Container-Overlays abgeschnitten.
- **Lösung**: Das Minimap-Element wird im Konstruktor von `MinimapUI` direkt an `document.body` angehängt (`appendChild`). Dies garantiert eine absolute Layer-Kontrolle außerhalb der Sidebar-Logik.

### 2. Rendering (Multi-Viewport)
- **Problem**: Das gleichzeitige Rendern der Hauptszene und der Minimap auf demselben Canvas führt zu Flackern oder Überschreiben.
- **Lösung**: 
    - Deaktivierung von `renderer.autoClear = false`.
    - Manuelles Leeren des Buffers am Anfang des Frames.
    - Nutzung von `setViewport` und `setScissor` (mit `setScissorTest(true)`) für das Minimap-Rendering.
    - **Wichtig**: Three.js nutzt ein Koordinatensystem, bei dem Y von unten zählt. Berechnung: `viewY = window.innerHeight - rect.bottom`.

### 3. Sichtbarkeit & Layering
- **Problem**: CSS-Hintergründe (Glasmorphismus) überdecken das WebGL-Rendering, da dieses "hinter" dem DOM-Element auf dem Canvas stattfindet.
- **Lösung**: Der Hintergrund des Containers muss `background: transparent` sein, damit das über Scissor-Test gerenderte Bild sichtbar bleibt.

### 4. Build- & Caching-Probleme
- **Problem**: Vite spiegelt Änderungen in `App.ts` oder CSS teilweise nicht wider, obwohl Hot-Module-Replacement (HMR) aktiv ist.
- **Lösung**: 
    - Manuelle Erhöhung der Version in `package.json` und `index.html` (z.B. auf 0.98.1.2), um den Ladestatus zu tracken.
    - Radikales Löschen des Caches: `rm -rf node_modules/.vite`.

## Status
- Positioning: Erledigt (links unten).
- Toggle-Funktion: Erledigt (Pfeil-Button).
- Rendering: In Verifizierung (Rot-Test aktiv).
