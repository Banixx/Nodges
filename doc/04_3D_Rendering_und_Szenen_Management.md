# 04 3D-Rendering und Szenen-Management

Die grafische Darstellung ist das Herzstück von Nodges. Dieses Kapitel taucht tief in die Implementierung der 3D-Engine mittels **Three.js** ein und erläutert die Strategien, mit denen wir tausende Objekte flüssig (60 FPS) im Browser rendern.

## 04.1 Three.js Integration & Setup

Nodges nutzt Three.js als Abstraktionsschicht über WebGL. Der Renderer wird vollständig in der `App`-Klasse gekapselt und initialisiert.

### Der Szenen-Graph (Scene Graph)
*   **Scene**: Die Wurzel aller Objekte.
*   **Camera**: Wir nutzen eine `PerspectiveCamera` (FOV 75°). Die `Far`-Clipping-Plane wird dynamisch angepasst, um auch riesige Graphen vollständig darzustellen, ohne Z-Fighting Fehler bei nahen Objekten zu riskieren.
*   **Renderer**: Der `WebGLRenderer` ist konfiguriert für:
    *   `antialias: true`: Glättung von Treppchen-Effekten (MSAA).
    *   `alpha: true`: Transparenter Hintergrund (falls nötig).
    *   `logarithmicDepthBuffer: true`: Essentiell für Netzwerke mit extremen Größenunterschieden, um Flackern bei überlappenden Geometrien zu verhindern.

### Beleuchtung (Lighting Strategy)
Licht ist nicht nur Ästhetik, es ist Information (Tiefe, Form). Wir nutzen ein **3-Punkt-Setup**:
1.  **AmbientLight**: Weiches Grundlicht, hellt Schatten auf (Intensität 0.4).
2.  **DirectionalLight (Key Light)**: Simuliert Sonnenlicht, wirft Schatten, definiert die Form der Kugeln (Specular Highlights).
3.  **HemisphereLight**: Simuliert Himmels- und Boden-Reflektion für natürlicheren Look.

## 04.2 High-Performance Rendering: Instancing

Wenn ein Graph 10.000 Knoten hat, darf Three.js nicht 10.000 einzelne `Mesh`-Objekte erstellen. Jeder `Mesh` erzeugt einen "Draw Call" an die GPU (CPU-Overhead). Das würde den Browser bei ~1000 Objekten in die Knie zwingen.

### Die Lösung: `InstancedMesh`
Nodges nutzt aggressiv **Instancing**.
*   **Konzept**: Wir senden die Geometrie (z.B. eine Kugel mit vielen Polygonen) *einmal* an die Grafikkarte.
*   **Instanzen**: Dann senden wir eine Liste von Transformationen (Position, Rotation, Skalierung) und Farben.
*   **Resultat**: Die GPU zeichnet alle 10.000 Knoten in einem *einzigen* Draw Call.

### Implementation Details (`NodeManager`)
Die Verwaltung ist komplex:
1.  **Dummy Object**: Ein temporäres `Object3D` ("Dummy") wird genutzt, um Positionen zu berechnen.
2.  **Matrix Updates**: `dummy.updateMatrix()` generiert eine 4x4 Matrix.
3.  **Buffer Write**: Diese Matrix wird in den Buffer des `InstancedMesh` an Index `i` geschrieben (`setMatrixAt(i, matrix)`).
4.  **Flags**: `instanceMatrix.needsUpdate = true` signalisiert Three.js, die Daten bei nächten Frame an die GPU zu pushen.

*Herausforderung*: Da Instancing alles zusammenfasst, ist individuelles Picking ("Welche Kugel habe ich geklickt?") schwieriger. Node-IDs müssen auf `instanceId`-Indizes gemappt werden.

## 04.3 Kanten-Visualisierung: Die Königsdisziplin

Siehe Diagramm zur Rendering-Strategie: [mermaid_05.mmd](mermaid_05.mmd)

Kanten (Edges) sind komplexer als Knoten, da sie sich verformen müssen und Abhängigkeiten zu *zwei* Knoten haben.

### Strategie 1: Instanced Cylinders (Performant)
Für einfache Verbindungen (A nach B) nutzen wir ebenfalls `InstancedMesh`, aber mit einem Twist:
*   Geometrie ist ein Zylinder der Höhe 1.
*   Wir transformieren (rotieren, skalieren, positionieren) jede Instanz so, dass sie exakt die Lücke zwischen Node A und Node B füllt.
*   Dies nutzt Quaternions für die Rotation ("LookAt"-Mathematik).
*   *Vorteil*: Extrem schnell für tausende Kanten.

### Strategie 2: TubeGeometries (Ästhetisch / Multi-Edge)
Wenn zwei Knoten durch *mehrere* Kanten verbunden sind, würden Zylinder ineinander liegen. Hier schaltet Nodges um auf **TubeGeometry**:
*   Wir berechnen eine **Bézier-Kurve** (`QuadraticBezierCurve3`) zwischen Start und Ziel.
*   Ein "Control Point" zieht die Kurve nach außen.
*   Jede Kante bekommt einen anderen Offset, sodass sie wie Kabelstränge nebeneinander liegen ("Bauchig").
*   *Nachteil*: Jede Tube ist ein eigenes Mesh (teurer). Wir nutzen dies also nur für Multi-Edges oder selektierte Pfade.

## 04.4 Render-Loop Optimierung

Der Render-Loop (`animate()`) ist heilig. Er muss in < 16ms fertig sein (für 60 FPS).
*   **Keine Garbage Collection**: Wir vermeiden es tunlichst, im Loop neue Objekte (Vektoren, Materialien) mit `new` zu erstellen. Nodges nutzt stattdessen Objekt-Pools oder wiederverwendbare, statische Hilfsvariablen (`_tempVector`), um den Garbage Collector nicht zu wecken (was Ruckler verursachen würde).
*   **Frustum Culling**: Three.js prüft automatisch, ob Objekte im Sichtfeld der Kamera sind. Wir unterstützen dies, indem wir Bounding-Spheres korrekt berechnen.
*   **On-Demand Rendering**: (Geplant) Wenn sich nichts bewegt (kein Layout, keine Mausbewegung), stoppt der Loop, um Laptop-Batterien zu schonen.

### Zusammenfassung des 3D-Datenflusses
Siehe Diagramm: [mermaid_07.mmd](mermaid_07.mmd)

---
*Ende Kapitel 04*
