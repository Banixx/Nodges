# 05 3D-Rendering und Szenen-Management

Dieses Kapitel beschreibt die Grafik- und Rendering-Engine von Nodges in Version **0.106.8**. Es erlaeutert die Three.js-Szenenarchitektur, High-Performance-Techniken wie `InstancedMesh`, die mathematische Modellierung von Kanten ueber Bezier-Kurven sowie Optimierungsstrategien fuer den Render-Loop.

---

## 1. Three.js Integration und Szenen-Setup

> **Visualisierung:** Siehe [05_ThreeJsSzenenGraph_001.mmd](05_ThreeJsSzenenGraph_001.mmd)

Die Kapselung des WebGL-Renderers erfolgt im `SceneManager` in enger Abstimmung mit dem `NodeManager` und dem `EdgeObjectsManager`.

### 1.1 Der Szenengraph
- **Scene:** Zentraler Knotenpunkt fuer alle 3D-Objekte, Kameras und Lichter.
- **PerspectiveCamera:** Standardmaessiges Field of View von 75 Grad. Die Clipping-Planes (`near` und `far`) werden dynamisch anhand der raeumlichen Bounding-Box des aktuellen Graphen skaliert, um Z-Fighting im Nahbereich zu verhindern und dennoch riesige kosmische Netzwerke erfassen zu koennen.
- **WebGLRenderer:**
  - `antialias: true`: Multi-Sample Anti-Aliasing (MSAA) fuer saubere Kantenglaettung.
  - `logarithmicDepthBuffer: true`: Unverzichtbar bei Netzwerken mit grosser raeumlicher Tiefenausdehnung, um Artefakte bei ueberlappenden Geometrien zu eliminieren.
  - `powerPreference: "high-performance"`: Erzwingt die Nutzung dedizierter Grafikkarten auf Multi-GPU-Geraeten.

### 1.2 Beleuchtungskonzept (3-Punkt-Setup)
Licht dient der Tiefenwahrnehmung und plastischen Differenzierung:
1. **AmbientLight:** Gleichmaessige Grundaufhellung (Intensitaet ca. 0.4), damit Knoten im Schatten nicht vollstaendig schwarz werden.
2. **DirectionalLight (Key Light):** Erzeugt harte Glanzpunkte (Specular Highlights) auf gekruemmten Oberflaechen und verankert die Raumorientierung.
3. **HemisphereLight:** Simuliert diffuse Lichtreflexionen zwischen virtuellem Himmel und Boden fuer einen natuerlichen Materialeindruck.

---

## 2. High-Performance Rendering: InstancedMesh

> **Visualisierung:** Siehe [05_InstancedMeshDataflow_002.mmd](05_InstancedMeshDataflow_002.mmd)

Ein relationales Netzwerk mit zehntausend Knoten wuerde bei separaten `THREE.Mesh`-Objekten zehntausend Draw-Calls pro Frame erzeugen und die Bildrate im Browser drastisch senken.

### 2.1 Das Instancing-Prinzip
Nodges setzt im `NodeManager` konsequent auf **GPU-Instancing (`THREE.InstancedMesh`)**:
- Geometrie (z. B. SphereBufferGeometry) und Shadermaterial werden nur **ein einziges Mal** in den GPU-Speicher uebertragen.
- Jede Entitaet wird ausschliesslich durch einen Eintrag in einem linearen Transformations-Matrix-Buffer (4x4 Matrix fuer Position, Rotation, Skalierung) und einem Farb-Buffer repraesentiert.
- Der gesamte Graph mit tausenden Knoten wird in einem **einzigen Draw-Call** gerendert.

### 2.2 Der Matrix-Update-Zyklus
```
[Entitaets-Daten] ──► [Dummy Object3D] ──► dummy.updateMatrix()
                                                │
                                                ▼
                                    setMatrixAt(i, matrix)
                                    setColorAt(i, color)
                                                │
                                                ▼
                                    instanceMatrix.needsUpdate = true
                                    instanceColor.needsUpdate = true
```
1. Ein wiederverwendbares, unsichtbares `THREE.Object3D` ("Dummy") berechnet die lokale Transformation jedes Knotens.
2. Die resultierende Transformationsmatrix wird mit `setMatrixAt(i, dummy.matrix)` in den Buffer geschrieben.
3. Nach Durchlauf aller sichtbaren Knoten setzt das System `instanceMatrix.needsUpdate = true`, wodurch Three.js den Buffer zur GPU transferiert.

---

## 3. Kanten-Visualisierung: Bezier-Kurven und TubeGeometries

Verbindungen zwischen Knoten erfordern geometrische Flexibilitaet:

- **Bézier-Kurven (`QuadraticBezierCurve3`):** Statt starrer Liniensegmente nutzt Nodges geschwungene Kurven. Dadurch wird die visuelle Lesbarkeit bei dichten Netzwerken erhoeht.
- **Multi-Edge Handling (Kabelstrang-Effekt):** Existieren mehrere Kanten zwischen zwei identischen Knoten (z. B. unterschiedliche Beziehungstypen), berechnet das System kontrollierte Auslenkungen im Scheitelpunkt. Die Kanten verlaufen parallel bauchig nebeneinander, statt zu ueberlappen.
- **TubeGeometry & Ribbons:** Kanten mit hohem Gewicht (`weight`) oder besonderer semantischer Bedeutung koennen als vollwertige 3D-Zylinder (`TubeGeometry`) gerendert werden, um den Datenfluss plastisch hervorzuheben.

---

## 4. Render-Loop Optimierung

> **Visualisierung:** Siehe [05_RenderLoopOptimierung_003.mmd](05_RenderLoopOptimierung_003.mmd)

Um eine stabile Bildwiederholrate von 60 FPS (Frame-Budget < 16,6 ms) zu gewaehrleisten, gelten strenge Regeln fuer die `requestAnimationFrame`-Schleife:

1. **Garbage Collection Vermeidung:**  
   Innerhalb des Render-Loops werden keinerlei neue Objekte mit `new` instanziiert. Mathematische Hilfsobjekte (wie temporaere `Vector3`, `Matrix4` oder `Quaternion`) liegen als vorab allokierte statische Modulvariablen vor und werden wiederverwendet.
2. **Frustum Culling:**  
   Three.js prueft anhand raeumlicher Begrenzungskugeln (`BoundingSphere`), welche Knoten und Kanten sich tatsaechlich im Sichtkegel der Kamera befinden; Objekte ausserhalb werden von der GPU verworfen.
3. **On-Demand Rendering & FPS-Drosselung:**  
   Wenn die Physiksimulation ruht und keine Kamera- oder Interaktionsereignisse anstehen, schaltet Nodges in einen ressourcenschonenden Ruhemodus, um CPU/GPU-Last auf mobilen Geraeten zu minimieren.

---

## 5. Das Entkoppelte Visual Mapping

Die VisualMappingEngine steuert saemtliche sichtbaren Attribute voellig dynamisch:
- Jeder Knoten startet als generische Instanz im Mesh.
- Entsprechend der aktiven Mapping-Konfiguration (Farbe nach Eigenschaft, Groesse nach Metrik, Form nach Typ) berechnet die Engine die Werte zur Laufzeit neu.
- Das Umschalten von Darstellungsmodi erfordert kein Neuladen des Graphen, sondern lediglich ein gezieltes Neubeschreiben der GPU-Instanzbuffer.
