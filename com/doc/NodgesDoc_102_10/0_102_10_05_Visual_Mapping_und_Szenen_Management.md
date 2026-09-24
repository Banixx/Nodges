# 04 3D-Rendering und Szenen-Management

Die grafische Darstellung ist das Herzstück von Nodges. Dieses Kapitel taucht tief in die Implementierung der 3D-Engine mittels **Three.js** ein und erläutert die Strategien (Instancing, TubeGeometry), mit denen wir zehntausende Objekte flüssig im Browser rendern.

---

## 1. Three.js Integration & Setup

> **Visualisierung:** Siehe [05_ThreeJsSzenenGraph_001.mmd](05_ThreeJsSzenenGraph_001.mmd)

Nodges kapselt den WebGL-Renderer vollständig im `SceneManager`.

### 1.1 Der Szenen-Graph
- **Scene**: Die Wurzel aller Objekte.
- **Camera**: Eine `PerspectiveCamera` (FOV 75°). Die `Far`-Clipping-Plane wird dynamisch an die Bounding-Box des Graphen angepasst, um auch riesige Netzwerke vollständig darzustellen, ohne Z-Fighting Fehler bei nahen Objekten zu riskieren.
- **Renderer**: Der `WebGLRenderer` ist hochoptimiert:
  - `antialias: true`: MSAA-Glättung von Kanten.
  - `logarithmicDepthBuffer: true`: Essentiell für Netzwerke mit extremen Größenunterschieden, um Flackern (Z-Fighting) bei überlappenden Geometrien zu verhindern.

### 1.2 Beleuchtung (Lighting Strategy)
Licht ist Information. Wir nutzen ein 3-Punkt-Setup für plastische Wahrnehmung:
1. **AmbientLight**: Weiches Grundlicht zur Schattenaufhellung (Intensität 0.4).
2. **DirectionalLight (Key Light)**: Simuliert hartes gerichtetes Licht, wirft Schatten und definiert die Form (Specular Highlights) auf den Knoten.
3. **HemisphereLight**: Simuliert Himmels- und Boden-Reflektion für einen natürlicheren Look der Materialien.

---

## 2. High-Performance Rendering: Instancing

> **Visualisierung:** Siehe [05_InstancedMeshDataflow_002.mmd](05_InstancedMeshDataflow_002.mmd)

Ein Graph mit 10.000 Knoten würde den Browser bei der Erstellung von 10.000 separaten `Mesh`-Objekten in die Knie zwingen (10.000 Draw Calls an die GPU).

### 2.1 Die Lösung: `InstancedMesh`
Nodges nutzt aggressiv **Instancing**.
- **Konzept**: Die Geometrie (z.B. eine Kugel) und das Material werden nur *ein einziges Mal* an die Grafikkarte gesendet.
- **Instanzen**: Die CPU sendet lediglich ein großes Array (Buffer) mit Transformationsmatrizen (Position, Rotation, Skalierung) und Farben.
- **Resultat**: Die GPU zeichnet alle 10.000 Knoten in einem einzigen Draw Call.

### 2.2 Implementation (`NodeManager`)
1. **Dummy Object**: Ein temporäres unsichtbares `Object3D` ("Dummy") berechnet die Positionen und Skalierungen.
2. **Matrix Updates**: `dummy.updateMatrix()` generiert die 4x4 Matrix.
3. **Buffer Write**: Diese Matrix wird in den GPU-Buffer des `InstancedMesh` an Index `i` geschrieben (`setMatrixAt(i, matrix)`).
4. **Trigger**: `instanceMatrix.needsUpdate = true` signalisiert Three.js, das Array im nächsten Render-Frame zur GPU zu pushen.

---

## 3. Kanten-Visualisierung: TubeGeometries

Kanten (Edges) sind deutlich komplexer als Knoten, da sie zwei Koordinaten im Raum verbinden und verformbar sein müssen.

- **Kurven-Logik**: Anstelle gerader Linien berechnet Nodges **Bézier-Kurven** (`QuadraticBezierCurve3`) zwischen Start- und Zielknoten.
- **Multi-Edge Support**: Sind zwei Knoten durch *mehrere* Kanten verbunden (z.B. "kauft bei" und "arbeitet für"), bekommt jede Kante einen algorithmischen Offset im Kontrollpunkt der Kurve. Sie legen sich "bauchig" nebeneinander, wie Kabelstränge, statt sich zu überschneiden.
- **TubeGeometry**: Für Kanten mit hoher Bedeutung (`weight`) wird statt einer dünnen Linie ein 3D-Zylinder (`TubeGeometry`) entlang der Bézier-Kurve extrudiert, was visuelle Plastizität schafft.

---

## 4. Render-Loop Optimierung

> **Visualisierung:** Siehe [05_RenderLoopOptimierung_003.mmd](05_RenderLoopOptimierung_003.mmd)

Die `requestAnimationFrame`-Schleife (`animate()`) muss in < 16ms abschließen, um 60 FPS zu garantieren.
- **Keine Garbage Collection**: Im Loop werden niemals Objekte mit `new` erstellt (Vermeidung von GC-Rucklern). Statische Hilfsvariablen (z.B. `_tempVector = new THREE.Vector3()`) werden global recycelt.
- **Frustum Culling**: Three.js prüft, ob Objekte im Sichtfeld der Kamera sind (anhand von Bounding-Spheres).
- **On-Demand Rendering**: Wenn sich die Kamera nicht bewegt und die Physik-Simulation zur Ruhe gekommen ist, stoppt Nodges den GPU-Loop, um Laptop-Batterien zu schonen.

---

## 5. Das Entkoppelte Visual Mapping (Ab Build 5)
Die Engine besitzt keine hartkodierten Regeln für Datentypen mehr (keine `if (type === 'Server')` Logik). 
- Alle Knoten starten als `global_node` (Generisches Sphere-Mesh im InstancedMesh).
- Das System parst die `visualMappings` (aus JSON oder UI) und überschreibt die Scale- und Color-Werte im Matrix-Buffer dynamisch basierend auf den Rohdaten (`properties`) der Entität.
