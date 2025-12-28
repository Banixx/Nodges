# Projektstatus Bericht: Nodges

**Datum:** 28.12.2025
**Status:** Funktionale Beta / Refactoring-Phase

## 1. Übersicht
Das Projekt "Nodges" ist eine 3D-Graphen-Visualisierungssoftware. Die Kernfunktionalitäten für Rendering, Interaktion und Animation sind vorhanden. Das Projekt befindet sich jedoch inmitten einer architektonischen Umstellung auf ein neues Datenformat ("Future Format"), was zu einer gemischten Codebasis mit temporären Lösungen (`@ts-ignore`, `any` Typen) geführt hat.

## 2. Implementierte Features (Ist-Zustand)

### 2.1 Core Rendering & Visualisierung
*   **Engine:** Three.js mit InstancedMesh für performantes Rendering vieler Nodes.
*   **Edges:**
    *   Implementierung mittels `EdgeObjectsManager.ts`.
    *   Unterstützung für gebogene Kanten (`QuadraticBezierCurve3`), gesteuert durch `edgeCurveFactor`.
    *   Vertex-basierte Animationen ("Pulse", "Flow", "Sequential") direkt im Shader-Material der Tubes.
*   **Visual Mappings:**
    *   `VisualMappingEngine.ts` übersetzt abstrakte Datenregeln in visuelle Eigenschaften (Farbe, Größe, etc.).
    *   Unterstützt lineare Skalierung und konstante Mappings.

### 2.2 Interaktion & UI
*   **Highlighting:**
    *   `HighlightManager.js` bietet ein robustes System für Hover- und Selektions-Effekte.
    *   Features: Outlines (auch für gebogene Kanten), Glow-Effekte, Farbhervorhebung.
*   **UI Komponenten:**
    *   `front_ui_system` (HTML/CSS Overlay).
    *   `UIManager.ts` verwaltet Panels für Datei-Auswahl, Visual Mappings und Environment-Einstellungen.
    *   Panels sind kollabierbar und positionieren sich dynamisch.

### 2.3 Daten-Architektur
*   **Typ-Definitionen:** `src/types.ts` enthält vollständige Zod-Schemas für das neue "Future Format" (`GraphData`, `EntityData`, `RelationshipData`).
*   **Validierung:** Strikte Validierung der Eingabedaten ist vorbereitet.

## 3. Identifizierte Probleme & Technical Debt

### 3.1 Typ-Sicherheit & TypeScript
*   **Problem:** Massive Nutzung von `@ts-ignore` in `App.ts` und anderen zentralen Dateien.
*   **Ursache:** Inkonsistente Verwendung von importierten Modulen (teilweise `.js` vs `.ts`) und unvollständige Typisierung der Manager-Klassen.
*   **Konsequenz:** Fehleranfälligkeit bei Refactorings, keine IDE-Unterstützung für Intellisense in diesen Bereichen.

### 3.2 Legacy Code & Migration
*   **Problem:** `App.ts` enthält noch Logik für "Legacy Nodes" und "Legacy Edges", die parallel zum neuen `EntityData`-Format existiert.
*   **Status:** Edge-Creation nutzt teilweise noch lose Arrays statt typisierter `RelationshipData`.
*   **Ziel:** Vollständige Umstellung auf `EntityData` und `RelationshipData` als einzige Wahrheitsquelle.

### 3.3 Manager-Konsistenz
*   Einige Manager sind in TypeScript (`.ts`) und gut typisiert (`EdgeObjectsManager`, `LayoutManager`).
*   Andere sind noch JavaScript (`.js`) oder lose typisiert (`HighlightManager.js`, `SelectionManager.js`).

## 4. Nächste Schritte

Empfohlene Maßnahmen zur Stabilisierung (siehe `implementation_plan.md`):
1.  **Refactoring `App.ts`:** Entfernen aller `@ts-ignore` durch korrekte Importe und Typ-Casts.
2.  **Typisierung der JS-Manager:** Umwandlung von `HighlightManager.js` und anderen Utils in TypeScript.
3.  **Cleanup:** Entfernen der auskommentierten Legacy-Methoden.
