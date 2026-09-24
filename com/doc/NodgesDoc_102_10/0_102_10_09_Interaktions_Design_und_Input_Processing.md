# 08 Interaktions-Design und Input-Processing

Eine nahtlose Interaktion ist für die User Experience in einer 3D-Welt entscheidend. Dieses Kapitel beschreibt, wie Nodges abstrakte Benutzereingaben (Maus, Touch, Keyboard) performant in präzise Aktionen innerhalb der visualisierten Daten übersetzt.

---

## 1. Raycasting: Die Brücke zwischen 2D und 3D

> **Visualisierung:** Siehe [09_InputSystemUebersicht_002.mmd](09_InputSystemUebersicht_002.mmd)

Das Hauptproblem der 3D-Interaktion auf Bildschirmen: Der Monitor ist flach (2D), die Daten sind räumlich (3D). Nodges nutzt den **Raycasting-Algorithmus** von Three.js (`THREE.Raycaster`), um festzustellen, wohin der User "in die Tiefe" klickt.

### 1.1 Der mathematische Prozess
1. **Normalisierung:** Die X/Y-Position der Maus (in Pixeln) wird in den Normalized Device Coordinate (NDC) Raum (-1 bis +1) umgerechnet.
2. **Strahl-Projektion:** Der Raycaster schießt einen unsichtbaren Vektor von der Kameraposition durch den transformierten "Mauspunkt" auf der Linse tief in die Unendlichkeit der 3D-Szene.
3. **Intersektion:** Die Engine berechnet Schnittpunkte des Strahls mit den Bounding-Boxen und Flächen aller Objekte.
4. **Sortierung:** Die Liste der getroffenen Objekte wird nach ihrer Entfernung zur Kamera sortiert; das vorderste sichtbare Objekt gewinnt.

### 1.2 Performance-Herausforderung bei InstancedMesh
Da ein `InstancedMesh` (z.B. für 10.000 generische Knoten) für Three.js technisch nur *ein einziges* Objekt ist, liefert ein normaler Raycast als Ergebnis nur: "Du hast das große Array getroffen".
Nodges fragt daher die Eigenschaft `instanceId` des Raycast-Intersects ab, um den exakten Matrix-Index der getroffenen Kugel zu extrahieren. Dieser Index wird über eine interne Lookup-Table blitzschnell auf die ursprüngliche `id` des Datenknotens zurückgemappt.

---

## 2. Der `CentralEventManager` (CEM)

> **Visualisierung:** Siehe [09_RaycastingUndCEM_001.mmd](09_RaycastingUndCEM_001.mmd)

Der CEM ist das "Gehirn" der Interaktion. Er sorgt für eine saubere Trennung zwischen Hardware-Events (`mousemove`, `pointerdown`) und der Business-Logik (`selectNode`, `hoverEdge`).

### 2.1 Intelligente Click-Erkennung ("Click vs. Drag")
Ein Standardproblem in 3D-Viewern: Wenn ein User die Kamera dreht (Drag-Bewegung), lässt er die Maus oft unbeabsichtigt über einem Knoten los. Ein naiver Event-Handler (`mouseup` oder `click`) würde dies fälschlicherweise als "Selektion des Knotens" interpretieren.
**Die Lösung:** Nodges puffert die Mauskoordinaten bei `mousedown`. Bei `mouseup` wird die Vektor-Distanz berechnet.
- Distanz < 5 Pixel? -> **Klick** (Raycast für Selektion auslösen).
- Distanz > 5 Pixel? -> **Drag** (Es war nur eine Kamera-Drehung, Klick wird ignoriert).

### 2.2 Hover-Throttling
Raycasting bei *jedem einzelnen Pixel*, den die Maus bewegt, würde den CPU-Thread lahmlegen.
- Der CEM drosselt (throttles) das `mousemove`-Event auf ca. 50ms (20 Checks pro Sekunde).
- Das ist für das menschliche Auge flüssig genug, spart aber massive GPU/CPU-Zyklen für den Render-Loop.

---

## 3. Kamera-Steuerung und "Cinematic UI"

Die Kamera (`THREE.PerspectiveCamera`) wird nativ über `OrbitControls` gesteuert (Orbit, Pan, Zoom). Wir haben sie jedoch mit kinoreifen UX-Verbesserungen angereichert.

### 3.1 Auto-Focus & Fly-To Animationen
Wenn ein Benutzer im UI ein Suchergebnis auswählt, springt die Kamera nicht hart auf die neuen Koordinaten.
- **TWEEN.js Integration:** Nodges berechnet den Zielvektor und interpoliert die Kameraposition sanft dorthin.
- **Easing:** Die Bewegung nutzt "Smooth-Step" Funktionen (langsam starten, schnell in der Mitte, sanft abbremsen) für ein kinoreifes Gefühl.
- **Abstandshaltung:** Die Kamera hält an der Bounding-Sphere des Objekts an, statt im Kern der Geometrie zu enden.

### 3.2 Kontext-Sensitiver Zoom
Beim Zoomen mit dem Mausrad berechnet Nodges den Zoom-Faktor basierend auf der aktuellen Entfernung zum Ziel. Je näher der User einem Knoten kommt, desto feingliedriger (langsamer) wird der Zoom-Schritt. Dies verhindert das nervige "Durch-Objekte-Hindurch-Clippen" im Mikrokosmos des Graphen.
