# 07 Algorithmen und Layout Engine

## 7.1 Die Physik-Engine (Deep Dive)

Nodges nutzt eine eigens geschriebene, Web-Worker-basierte Physik-Simulation, um organische Strukturen zu erzeugen. Wir verlassen uns nicht auf Black-Box-Bibliotheken wie `d3-force-3d`, sondern implementieren die Kräfte "from scratch" für maximale Kontrolle.

### Die Kräfte

Das System basiert auf zwei gegensätzlichen Kräften, die ein energetisches Gleichgewicht suchen:

1. **Coulomb-Abstoßung (Node-Repulsion)**
    * Jeder Knoten ist ein geladenes Teilchen, das alle anderen abstößt.
    * **Formel**: $F = \frac{k_{rep}}{d^2}$
    * Hierbei ist $k_{rep}$ die `repulsionStrength` (Standard: 50) und $d$ die Distanz.
    * **Effekt**: Verhindert, dass Knoten überlappen und drückt unverbundene Cluster auseinander.

2. **Hooke-Anziehung (Spring-Attraction)**
    * Kanten verhalten sich wie mechanische Federn.
    * **Formel**: $F = k_{att} \cdot d$
    * Hierbei ist $k_{att}$ die `attractionStrength` (Standard: 0.5).
    * **Effekt**: Zieht verbundene Knoten zusammen.

### Der Integrator (Euler vs. Verlet)

Aktuell nutzen wir eine **Euler-Integration** für die Bewegungsgleichungen:

1. Summiere alle Kräfte auf einen Knoten (Vektor-Addition).
2. `Velocity = (Velocity + Force) * Damping`
3. `Position = Position + Velocity`

Der `Damping`-Faktor (Standard: 0.8) wirkt wie Luftwiderstand und verhindert, dass das System explodiert oder ewig schwingt. Es entzieht dem System kinetische Energie, bis es friert ("Freezing").

---

## 7.2 Web Worker Architektur & Protokoll

Um den Main-Thread (und damit das Rendering) nicht zu blockieren, läuft die gesamte Physik $O(n^2)$ in einem isolierten Thread (`src/workers/layout-worker.js`).

### Das Kommunikations-Protokoll

Der Datenaustausch ist leistungsoptimiert. Wir senden keine komplexen Objekte, sondern flache Arrays.

**1. Main -> Worker (Initialisierung)**
Bevor der Worker startet, mappt der `LayoutManager` alle String-IDs (z.B. "Server_01") auf Integer-Indizes (0, 1, 2...). Das beschleunigt Array-Zugriffe im Worker massiv.

```javascript
{
  nodes: [{ x, y, z, index: 0 }, ...],
  edges: [{ start: 0, end: 5 }, ...], // Nur Indizes!
  options: { repulsionStrength: 50, ... }
}
```

**2. Worker -> Main (Pro Frame)**
Der Worker sendet nach jeder Iteration (oder am Ende) die neuen Koordinaten zurück:

```javascript
{
  positions: [{ x: 10.5, y: -2.1, z: 5.0 }, ...] // Array-Reihenfolge entspricht Input
}
```

Der Main-Thread appliziert diese dann direkt auf die `Object3D.position` der Three.js Meshes.

---

## 7.3 Komplexität und Skalierungs-Grenzen

### Das $O(n^2)$ Problem

Unsere aktuelle Implementierung ist ein "All-Pairs" Algorithmus.

* Bei 1.000 Knoten: $1.000^2 = 1.000.000$ Vergleiche pro Iteration.
* Bei 10.000 Knoten: $100.000.000$ Vergleiche.

Ab ca. 2.000 Knoten sinkt die Berechnungsgeschwindigkeit unter 60 HZ. Da dies aber im Worker geschieht, bleibt die UI responsive – die Simulation läuft nur "in Zeitlupe" ab.

### Geplante Optimierung: Barnes-Hut (Octree)

Um auf 100.000 Knoten zu skalieren, ist die Implementierung des Barnes-Hut Algorithmus geplant.

* **Idee**: Teile den Raum rekursiv in 8 Würfel (Octree).
* **Trick**: Wenn ein Würfel weit weg ist, behandle alle Knoten darin als einen einzigen "Super-Knoten" (Schwerpunkt).
* **Gewinn**: Reduziert die Komplexität auf $O(n \log n)$.

---

## 7.4 Deterministische Layouts

Neben der Physik bietet Nodges mathematisch exakte Layouts für strukturierte Daten:

* **Grid**: Ordnet Knoten in einem 3D-Gitter an. Perfekt, um einfach nur "alle Daten" zu sehen.
* **Sphere**: Projiziert Knoten auf die Oberfläche einer Kugel.
* **Helix**: Anordnung in einer Spirale (z.B. für Zeitreihen geeignet).
* **Hierarchical (Tree)**: Klassischer Baum, aber in 3D (Kegel-Baum). Wichtig für Org-Charts oder Verzeichnis-Strukturen.

*(Hinweis: Im UI-Komplexitätsmodus "Simple" ist die Layout-Steuerung ausgeblendet. Volle Kontrolle über Layout-Typen und Parameter ist ab dem Modus "Expert" im Layout-Tab verfügbar.)*

---
*Dokumentations-Status: V2.1 (Updated)*
*Geprüft gegen Build: 0.101.2*
