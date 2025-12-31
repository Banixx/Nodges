# 07 Algorithmen und Layout-Engine

Ein Haufen Daten ist erst dann ein Graph, wenn er Struktur hat. Die Layout-Engine von Nodges ist dafür verantwortlich, tausenden Knoten eine räumliche Position ($x, y, z$) zuzuweisen, die menschliche Interpretationen erst ermöglicht.

## 07.1 Die Philosophie des Layouts

Nodges verfolgt zwei Ziele:
1.  **Ästhetik**: Kantenkreuzungen minimieren, Abstände gleichmäßig halten.
2.  **Topologische Wahrheit**: Zusammengehörige Dinge (Communities) sollen auch räumlich nah beieinander liegen.

## 07.2 Force-Directed Layouts (FDL)

Dies sind die wichtigsten Algorithmen in Nodges. Sie simulieren ein physikalisches System.

### Das Prinzip ("Kräfte-Balance")
*   **Abstoßung (Coulomb's Law)**: Alle Knoten stoßen sich gegenseitig ab, wie gleichgepolte Magnete. Dies verhindert Überlappungen.
*   **Anziehung (Hooke's Law)**: Kanten wirken wie Federn. Je weiter zwei verbundene Knoten voneinander entfernt sind, desto stärker ziehen sie sich an.
*   **Reibung / Dämpfung**: Ein simulierter Widerstand verhindert, dass das System ewig schwingt.

### Mathematische Komplexität: $O(n^2)$
Das Problem: Jeder Knoten muss eigentlich mit jedem anderen verglichen werden. Bei 10.000 Knoten sind das 100.000.000 Berechnungen *pro Frame*.
**Optimierung (Barnes-Hut)**: Wir nutzen einen **Octree** (eine 3D-Baumstruktur), um entfernte Knotengruppen als eine einzige "Super-Masse" zusammenzufassen. Das reduziert die Komplexität auf $O(n \log n)$, was die Simulation von tausenden Knoten in Echtzeit erst möglich macht.

## 07.3 Multithreading mit Web Workers

Physik-Simulationen sind CPU-intensiv. Würden wir sie im Haupt-Thread berechnen, würde der Browser einfrieren.
**Die Lösung**: Der `LayoutManager` startet einen separaten **Web Worker**.
*   Der Worker berechnet die Positionen in einer Endlosschleife im Hintergrund.
*   Er sendet die Ergebnisse als "Positions-Paket" (Float32Array) zurück.
*   Der Haupt-Thread nimmt die Daten nur noch entgegen und schiebt sie in die GPU. 
*   *Effekt*: Die Navigation bleibt flüssig (60 FPS), selbst wenn im Hintergrund Schwerstarbeit geleistet wird.

## 07.4 Geometrische & Strukturelle Layouts

Manchmal ist Physik nicht die beste Wahl. Nodges bietet deterministische Alternativen:

### 1. Grid-Layout (Raster)
Ordnet Knoten in einem 3D-Würfelgitter an. Perfekt, um eine unstrukturierte Masse an Objekten erst einmal sortiert zu "parken" oder um Mengenverhältnisse (Volumen) zu visualisieren.

### 2. Spherical-Layout (Kugeloberfläche)
Verteilt alle Knoten gleichmäßig auf der Oberfläche einer Kugel (Fibonacci-Sphere). Dies ist ideal für Netzwerke ohne klare Hierarchie, da kein Knoten bevorzugt wird.

### 3. Hierarchische Layouts (3D-Trees)
Für Daten mit einer klaren Richtung (z.B. IT-Infrastruktur vom Gateway zum Endgerät).
*   **Z-Achse als Zeit/Ebene**: Die Tiefe wird genutzt, um Hierarchie-Level darzustellen.
*   **Radial Trees**: Kinderknoten kreisen fächerförmig um ihre Eltern.

## 07.5 Layout-Stabilisierung (Simulated Annealing)

Ein Layout-Vorgang startet "heiß" (Knoten bewegen sich schnell und weit) und "kühlt" dann ab. Das System wird immer ruhiger, bis es in einem stabilen Zustand (Energieminimum) verharrt. Der Benutzer kann dies über das UI beeinflussen, indem er die "Simulations-Temperatur" manuell wieder erhöht.

---
*Ende Kapitel 07*
