# Dokumentation: Snapping, Highlighting und Koordinaten-Label bei der Positionierung

Es wurden intelligente Snapping-Mechanismen, visuelles Highlighting und eine Live-Koordinatenanzeige für den Positionierungsmodus (sowohl bei der Erstellung neuer Knoten als auch beim Verschieben existierender Knoten) implementiert.

## 1. Snapping-Mechanismen (Einrasten)

Während der dreistufigen Bewegung entlang der Y-, X- und Z-Achsen rastet die Vorschau-Kugel bei folgenden Gegebenheiten automatisch ein:
* **Grundfläche (Y = 0)**: Befindet sich der Knoten in der Y-Phase nahe dem Boden (Abstand < 0.8 Einheiten), rastet die Höhe exakt bei `Y = 0` ein.
* **Existierende Knoten (Nodes)**: Die Node-Informationen werden direkt aus dem `StateManager` bezogen, wodurch das Snapping unabhängig vom 3D-Rendermodus (z. B. Instanced Rendering) zuverlässig funktioniert. Wenn die Hilfslinie einen anderen Knoten schneidet (Abstand der unendlichen Achsenlinie zum Knoten < 1.2 Einheiten) und sich der Vorschau-Knoten auf der aktiven Achse diesem nähert (Abstand < 0.8 Einheiten), rastet die Position auf der Achsen-Koordinate des getroffenen Knotens ein.
* **Existierende Verbindungen (Edges)**: Wenn die Hilfslinie eine Kante schneidet (Abstand < 1.2 Einheiten) und der Vorschau-Knoten sich dem nahesten Punkt auf dieser Kante nähert, rastet er an diesem Punkt ein.

---

## 2. Visuelles Highlighting (Aufleuchten)

* Sobald die Hilfslinie einen anderen Knoten oder eine Verbindung kreuzt bzw. schneidet, leuchtet dieses Element in der Hover-Farbe (Hellblau) auf.
* Da bei Instanced Rendering keine einzelnen 3D-Knoten-Meshes in der Szene existieren, wird in diesem Fall dynamisch ein Proxy-3D-Objekt erzeugt, um die Outline-Hervorhebung korrekt anzuzeigen.
* Verlässt die Hilfslinie das Element wieder, wird das Highlighting unverzüglich zurückgesetzt.
* Nach Beenden, Bestätigen oder Abbrechen der Positionierung werden alle temporären Highlights bereinigt.

---

## 3. Behebung des Klick-Kollisions-Problems (Hohe Y-Koordinate nach Klick)

* Um zu verhindern, dass der Klick auf den Menüeintrag "Neuer Node" im Kontextmenü sofort als Bestätigung für die Y-Achse gewertet wird, wurde ein zeitbasierter Cooldown-Schutz (100ms) implementiert.
* Durch den Aufruf von `e.stopPropagation()` im Bestätigungs-Klick-Handler wird sichergestellt, dass OrbitControls und andere App-Klick-Listener während der Positionierung inaktiv bleiben und die Kamera oder andere Elemente nicht verschieben.

---

## 4. Koordinaten-Label am Mauszeiger

* Während des gesamten Positionierungsvorgangs folgt ein kleiner, eleganter Tooltip dem Mauszeiger.
* **Achtung Design**: Der Tooltip ist im dunklen Glassmorphismus gehalten (`background: rgba(20,20,20,0.85)` mit `backdrop-filter: blur(4px)`) und fügt sich nahtlos in die Oberfläche ein.
* **Live-Werte**: Er zeigt die aktuellen 3D-Koordinaten an: `X: 0.00 | Y: 0.00 | Z: 0.00`.
* **Fokus**: Die aktuell aktive Achse wird farblich hervorgehoben (Rot für X, Grün für Y, Blau für Z).
* **Feedback**: Bei erfolgreichem Einrasten erscheint ein auffälliges, cyanfarbenes `SNAP`-Badge neben den Koordinaten.
