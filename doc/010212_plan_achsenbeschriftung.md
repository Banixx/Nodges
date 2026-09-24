# Plan: 3D-Achsenbeschriftungssystem (v0.102.12)

## Ziel

Implementierung eines persistenten, datengetriebenen Achsenbeschriftungssystems im 3D-Raum von Nodges.
Die Achsen X, Y, Z werden mit Skalierungsmarkierungen (Ticks), numerischen Werten und Achsenbezeichnungen
beschriftet. Das System reagiert dynamisch auf den Wertebereich der gemappten Positions-Quelle.

---

## Abgrenzung zum bestehenden Code

| Bestandteil | Zweck | Beziehung zum Plan |
|---|---|---|
| `AxisPositionHelper.ts` | Interaktives Platzieren eines Nodes (temporaer) | Kein Ueberlapp, unveraendert |
| `NodeLabelManager.ts` | Labels einzelner Nodes (Canvas-Sprite-Technik) | Technik wird wiederverwendet |
| `EdgeLabelManager.ts` | Labels einzelner Kanten | Kein Ueberlapp |
| `LegendPanel.ts` | HTML-Panel fuer Visual-Mapping-Legende | Spaetere, separate Erweiterung |

---

## Architektur: `AxisLabelManager`

Neue Klasse `src/utils/AxisLabelManager.ts` verwaltet alle Achsen-Objekte als eigenstaendige Three.js-Gruppe.

### Szenegraph-Struktur

```
scene
 └── Group "axisLabels"
      ├── Group "axis_x"
      │    ├── Line (Achsenlinie + Pfeilspitze)
      │    ├── Sprite (Achsenbeschriftung "X" / Quellattributname)
      │    └── Group "ticks_x"
      │         ├── Line (Tick-Strich)
      │         └── Sprite (Tick-Wert, z.B. "42.5")
      ├── Group "axis_y"  (analog)
      └── Group "axis_z"  (analog)
```

### Klassen-Interface (Entwurf)

```typescript
export interface AxisConfig {
    visible: boolean;
    showX: boolean;
    showY: boolean;
    showZ: boolean;
    tickCount: number;             // Unterteilungen pro Achse (default: 5)
    labelSource: 'worldUnits' | 'dataRange';
    opacity: number;
    axisLength: number;            // Halbe Achsenlaenge (0 = auto aus bounds)
    worldOffset: THREE.Vector3;    // Ursprungspunkt (default: 0,0,0)
}

export class AxisLabelManager {
    constructor(scene: THREE.Scene, camera: THREE.Camera, stateManager: IStateManager)
    update(): void              // Im Animationsloop: Kamera-Ausrichtung, Fade
    rebuild(bounds: AxisBounds): void  // Neuaufbau bei Datenwechsel
    setConfig(config: Partial<AxisConfig>): void
    dispose(): void
}
```

---

## Datenmodell: `AxisBounds`

```typescript
export interface AxisBounds {
    x: { min: number; max: number; sourceAttr: string | null };
    y: { min: number; max: number; sourceAttr: string | null };
    z: { min: number; max: number; sourceAttr: string | null };
}
```

- `sourceAttr`: Attributname, der auf diese Achse gemappt wurde (z.B. `"year"`)
- `null`: keine semantische Quelle -> Achse zeigt Weltkoordinaten

Neues State-Feld im `AppState` / `StateManager`:

```typescript
axisBounds: AxisBounds | null;
```

---

## Rendering-Strategie

Identisch zur etablierten Canvas-Sprite-Technik aus `NodeLabelManager.ts`:

- **Achsenlinien**: `THREE.Line` mit `THREE.BufferGeometry`
- **Tick-Striche**: Kurze `THREE.Line`-Segmente senkrecht zur Achse
- **Text-Sprites**: `document.createElement('canvas')` + `THREE.CanvasTexture` + `THREE.Sprite`
- **Pfeilspitze**: `THREE.ConeGeometry` am positiven Achsenende
- **depthTest: false** fuer alle Text-Sprites (immer sichtbar)
- **Fade-Out**: dot-product Pruefung Achsenrichtung vs. Kamera-Blickrichtung

### Achsenfarben (konsistent mit `AxisPositionHelper.ts`)

| Achse | Farbe | Hex |
|---|---|---|
| X | Rot | `#ff4444` |
| Y | Gruen | `#44ff44` |
| Z | Blau | `#4444ff` |

Linien-Opazitaet: 0.35 | Sprite-Opazitaet: 0.85

---

## Implementierungsschritte

### Schritt 1 -- `src/types.ts` erweitern
- Interface `AxisBounds` hinzufuegen
- Interface `AxisConfig` hinzufuegen
- `axisBounds: AxisBounds | null` in `AppState` eintragen
- `axisLabelsVisible: boolean`, `axisTickCount: number`, `axisLabelMode: string` in `AppState`

### Schritt 2 -- `src/utils/AxisLabelManager.ts` neu erstellen
- Klasse gemaess Interface oben
- Private: `_buildAxisGroup(axis, bounds, config)`
- Private: `_createTextSprite(text, hexColor, fontSize)` (analog NodeLabelManager)
- `rebuild()`: dispose aller alten Objekte, dann neu aufbauen
- `update()`: pro Frame Kamera-Winkel pruefen, Fade-Faktor setzen

### Schritt 3 -- `src/core/VisualMappingEngine.ts` erweitern
- Nach `applyMappings()`: min/max der tatsaechlichen Node-Positionen (X, Y, Z) ermitteln
- Gemappte Quell-Attribute aus `defaultPresets` lesen (Channels `position_x` / `position_y` / `position_z`)
- `stateManager.update({ axisBounds: computed })` aufrufen

### Schritt 4 -- `src/App.ts` integrieren
- `AxisLabelManager` instantiieren (nach Scene-Setup)
- `onDataChange`-Event: `axisLabelManager.rebuild(state.axisBounds)` aufrufen
- `animate()`-Loop: `axisLabelManager.update()` aufrufen
- `dispose()`/`reset()`: `axisLabelManager.dispose()` aufrufen

### Schritt 5 -- `src/ui/ViewPanel.ts` UI-Controls
- Toggle "Achsenbeschriftung" -> State `axisLabelsVisible`
- Zahlenfeld "Ticks pro Achse" (2-10, default 5) -> State `axisTickCount`
- Toggle "Datenwerte / Weltkoordinaten" -> State `axisLabelMode`

### Schritt 6 -- Responsivitaet
- Im `update()`: Kamera-Distanz messen
- Bei sehr grossem Abstand: Tick-Beschriftungen ausblenden, nur Achsenbeschriftung halten
- Schwellwert konfigurierbar (initial: 80 Welteinheiten)

---

## Abgrenzung: Achsenbeschriftung vs. Legende-Panel

| Merkmal | Achsenbeschriftung | Legende-Panel |
|---|---|---|
| Ort | Im 3D-Raum (Three.js) | HTML-Overlay |
| Zeigt | Numerische Skalierung der Raumachsen | Visuelle Attribute (Farbe, Groesse, Form) |
| Datenquelle | `axisBounds` | `visualMappings` |
| Klasse | `AxisLabelManager` (neu) | `LegendPanel` (bereits vorhanden) |

---

## Offene Fragen

> [!IMPORTANT]
> Vor der Implementierung benoetigt folgendes eine Entscheidung:

1. **Achsenursprung**: Weltkoordinaten-Ursprung (0,0,0) oder Centroid der Datenwolke?
2. **Achsenlaenge**: Dynamisch aus min/max der Node-Positionen, oder feste Welteinheit?
3. **Zahlenformat**: Feste Dezimalstellen, oder groessenordnungsabhaengig (z.B. "1.2k")?
4. **Physics-Layout**: Wenn kein Positions-Mapping aktiv ist, Achsen automatisch ausblenden?

---

## Betroffene Dateien

| Datei | Aktion |
|---|---|
| `src/types.ts` | Erweiterung |
| `src/utils/AxisLabelManager.ts` | Neu |
| `src/core/VisualMappingEngine.ts` | Erweiterung |
| `src/App.ts` | Integration |
| `src/ui/ViewPanel.ts` | UI-Controls |
