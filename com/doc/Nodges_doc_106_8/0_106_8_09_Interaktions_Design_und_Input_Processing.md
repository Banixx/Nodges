# 09 Interaktions-Design und Input-Processing

Dieses Kapitel beschreibt die Interaktionsarchitektur von Nodges in Version **0.106.8**. Es erlaeutert die mathematische Abbildung von 2D-Zeigerkoordinaten in den dreidimensionalen Szenenraum (Raycasting), das Zusammenspiel des `CentralEventManager` mit Hardware-Ereignissen und kinoreife Kamerafahrten (*Fly-To Animations*).

---

## 1. Raycasting: Die Bruecke zwischen 2D-Bildschirm und 3D-Datenraum

> **Visualisierung:** Siehe [09_InputSystemUebersicht_002.mmd](09_InputSystemUebersicht_002.mmd)

Klassische Monitore liefern ausschliesslich zweidimensionale Pixelkoordinaten $(X, Y)$. Die Netzwerkentitaeten liegen jedoch als dreidimensionale Vektoren $(X, Y, Z)$ im Raum. Nodges uebersetzt Benutzereingaben ueber den **Raycasting-Algorithmus** von Three.js (`THREE.Raycaster`):

```
[Mauszeiger (Pixel X, Y)]
           │
           ▼
[Normalized Device Coordinates (NDC, -1 bis +1)]
           │
           ▼
[Raycaster: Strahl von Kamera-Projektionszentrum durch NDC]
           │
           ▼
[Schnittpunkt-Berechnung mit Geometrien im Szenengraph]
           │
           ▼
[Sortierung nach Distanz: Vorderstes sichtbares Objekt selektiert]
```

### 1.1 Mathematischer Ablauf
1. **Koordinaten-Normalisierung:** Umrechnung der absoluten Mausposition auf dem Viewport in den NDC-Bereich $[-1, +1]$.
2. **Strahl-Projektion:** Der Raycaster emittiert einen unsichtbaren Vektor vom optischen Zentrum der Kamera durch die normalisierte Linsenkoordinate in die Tiefe des 3D-Szenengraphen.
3. **Intersektions-Berechnung:** Pruefung auf Schnittpunkte mit den Bounding-Spheres und Dreiecken der geometrischen Objekte.
4. **Tiefensortierung:** Die Schnittpunkte werden aufsteigend nach ihrer Entfernung zur Kamera geordnet; das vorderste, nicht-transparente Objekt loest das Ereignis aus.

### 1.2 Raycasting auf `InstancedMesh`
Da Tausende Knoten im `NodeManager` als ein einziges `THREE.InstancedMesh` gerendert werden, liefert ein nativer Raycast zunaechst nur den Treffer auf das uebergeordnete Gesamt-Mesh.  
Nodges extrahiert aus dem Schnittpunkt-Ergebnis die Eigenschaft `instanceId` (den Zeilenindex im Matrix-Buffer) und ermittelt ueber eine lineare O(1)-Lookup-Table unmittelbar die zugehoerige Daten-ID der Entitaet.

---

## 2. Der `CentralEventManager` (CEM)

> **Visualisierung:** Siehe [09_RaycastingUndCEM_001.mmd](09_RaycastingUndCEM_001.mmd)

Der CEM entkoppelt rohe Betriebssystem-Ereignisse (`pointerdown`, `mousemove`, `keydown`) vollstaendig von der Geschaeftslogik der Visualisierung (`selectNode`, `filterSubtree`, `openInspector`).

### 2.1 Unterscheidung von Klick und Kamera-Drag
Ein verbreitetes Usability-Problem in 3D-Anwendungen ist das unbeabsichtigte Ausloesen von Klick-Ereignissen beim Rotieren der Kamera. Laesst der Nutzer nach einer Drehbewegung den Mauszeiger zufaellig ueber einem Knoten los, wuerde ein naives `click`-Event den Knoten faelschlicherweise markieren.  
**Die Entprell-Logik des CEM:**
- Bei `pointerdown` puffert das System die Startkoordinaten.
- Bei `pointerup` wird die euklidische Distanz $\Delta d = \sqrt{\Delta x^2 + \Delta y^2}$ berechnet.
- Liegt $\Delta d \le 5\text{ Pixel}$, wird ein praeziser **Klick** erkannt und der Selektions-Raycast ausgefuehrt.
- Liegt $\Delta d > 5\text{ Pixel}$, wird die Aktion als **Kamera-Drehung (Drag)** klassifiziert und kein Klickereignis generiert.

### 2.2 Hover-Drosselung (Throttling)
Raycast-Berechnungen bei jedem einzelnen Pixel der Mausbewegung wuerden die CPU-Hauptschleife ueberlasten. Der CEM drosselt `pointermove`-Pruefungen auf ein Zeitfenster von ca. 50 ms (20 Pruefungen pro Sekunde). Dies garantiert fluessiges taktiles Feedback ohne Beeintraechtigung des 60-FPS-Renderbudgets.

### 2.3 Mehrfach- und Box-Selektion
Ueber Tastaturmodifikatoren (z. B. Halten der `Shift`-Taste) koennen Nutzer mehrere Knoten nacheinander zur Auswahlliste hinzufuegen oder ueber ein 2D-Rechteck auf dem Bildschirm (*Marquee / Box-Selection*) ganze Teilnetzwerke gleichzeitig selektieren.

---

## 3. Kamera-Fuehrung und Cinematic Navigation

Die Szenenkamera (`THREE.PerspectiveCamera`) wird im Normalbetrieb ueber erweiterte `OrbitControls` gefuehrt, verfuegt jedoch ueber automatisierte Navigationshilfen:

### 3.1 Sanfte Fokus-Fahrten (Fly-To via Tweening)
Waehlt der Nutzer einen Knoten ueber das Suchfeld oder das Datenpanel aus, springt die Kamera nicht abrupt um:
- **Interpolierte Kurven:** Nodges berechnet die Zielkoordinaten und animiert Kameraposition und Blickpunkt ueber sanfte Easing-Funktionen (`cubic-bezier` / SmoothStep).
- **Kollisionsfreier Abstand:** Die Kamera faehrt nicht in das Objekt hinein, sondern stoppt kontrolliert vor der Bounding-Sphere des Knotens unter Beibehaltung des bisherigen Blickwinkels.

### 3.2 Kontext-adaptiver Zoom
Beim Zoomen mit dem Mausrad skaliert die Schrittweite dynamisch mit der Distanz zum Orbit-Zentrum: In grosser Entfernung bewegt sich die Kamera in weiten Schritten durch den Gesamtraum; in unmittelbarer Naehe eines Knotens verfeinert sich der Vorschub automatisch. Dadurch wird das versehentliche Durchqueren von Geometrien im Nahbereich zuverlaessig verhindert.
