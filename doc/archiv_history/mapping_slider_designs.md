# Horizontale Schieberegler-Designs für Domain und Mapping

Dieses Dokument beschreibt die drei implementierten horizontalen Schieberegler-Designs für die Steuerung der Eingangs-Domain und der Ausgangs-Range (Mapping) im Nodges-Mapping-Panel. Sie wurden direkt unter den numerischen Eigenschaften (wie Größe) integriert.

Die drei angebotenen Darstellungsmodi können interaktiv über das Dropdown-Menü **Mapping-Visualisierer Modus** im Panel ausgewählt werden.

---

## Design-Optionen

### 1. Lösung A: Dual-Schienen (Parallel)
* **Konzept:** Zwei separate, parallel untereinander liegende Schienen.
* **Domain-Schiene (oben):** Zeigt die Eingangsdaten-Domain (z.B. von 10 bis 100). Sie besitzt zwei orangefarbene Schieber (Min/Max).
* **Mapping-Schiene (unten):** Zeigt die visuelle Ausgangs-Range (z.B. von 0.1 bis 5.0) auf einer eigenen Skala mit zwei blauen Schiebern (Min/Max).
* **Vorteil:** Klare Trennung zwischen den Einheiten der Eingangsdaten und den visuellen Ausgangswerten.

### 2. Lösung B: Vereinte Schiene (Unified Quad-Handle)
* **Konzept:** Eine einzige, geteilte Schiene, die sowohl die Eingangs- als auch die Ausgangs-Schieber auf einer gemeinsamen Achse darstellt.
* **Farbstruktur:** Die obere Hälfte der Schiene ist orangefarben hinterlegt und steuert die Domain. Die untere Hälfte ist blau hinterlegt und steuert die Range.
* **Schieber:** Vier Regler auf einer einzigen Spur, farblich differenziert (zwei orangefarbene Regler oben, zwei blaue Regler unten).
* **Vorteil:** Sehr kompakter Fußabdruck im Interface, perfekt für kleinere Bildschirme.

### 3. Lösung C: Sparkline-Histogramm mit Overlay (Histogramm-Overlay)
* **Konzept:** Die Schiene ist mit einer SVG-Sparkline hinterlegt, die die Dichteverteilung (Histogramm) der tatsächlichen Werte des aktiven Attributs im geladenen Datensatz anzeigt.
* **Interaktion:** Die Domain- und Range-Schieber sind direkt über das Histogramm gelegt.
* **Vorteil:** Maximale visuelle Rückmeldung. Der Benutzer sieht sofort, wo seine Datenpunkte gehäuft auftreten und wie die Regler-Einstellungen die Verteilung der Knoten beeinflussen.

---

## Technische Details

* **Real-time Dragging:** Beim Verschieben der Griffe wird der 3D-Graph in Echtzeit aktualisiert.
* **Pointer Capture:** Die Slider nutzen HTML5 Pointer Capture, um ein robustes Schleifen des Mauszeigers (oder Touch-Gesten) auch außerhalb der Schiene zu ermöglichen.
* **Early Return im Render:** Ein Flag `isDraggingSlider` verhindert das Neuerstellen von DOM-Elementen während des aktiven Drags, wodurch Fokusverlust und Unterbrechungen beim Verschieben verhindert werden.

---

## Visualisierungen

### Lösung A: Dual-Schienen
![Lösung A: Dual-Schienen](file:///C:/Users/ich/.gemini/antigravity/brain/6c289872-479f-48b9-8985-22e4c4413c30/loesung_a_dual_schienen_1781643584064.png)

### Lösung C: Histogramm-Overlay
![Lösung C: Histogramm-Overlay](file:///C:/Users/ich/.gemini/antigravity/brain/6c289872-479f-48b9-8985-22e4c4413c30/mapping_solution_c_1781645997975.png)
