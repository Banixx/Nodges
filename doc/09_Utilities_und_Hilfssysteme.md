# 09 Utilities und Hilfssysteme

Hinter den Kulissen von Nodges arbeiten zahlreiche kleine Hilfssysteme, die den Hauptkomponenten Arbeit abnehmen und für Stabilität sorgen.

## 09.1 Mathematische Helfer

Three.js bietet bereits starke mathematische Klassen (`Vector3`, `Matrix4`), aber Nodges benötigt zusätzliche Spezialfunktionen für Graphen.

### Geometrie-Berechnungen
*   **Abstandsmessung**: Effiziente Berechnung von Distanzen (Squared Distance), um Kollisionen im Layout zu vermeiden, ohne teure Wurzelziehen-Operationen (`Math.sqrt`).
*   **Kurven-Interpolation**: Für "Multi-Edges" werden Bezier-Kontrollpunkte berechnet, die einen ästhetischen Bogen erzeugen, abhängig von der Entfernung der Knoten.

### Farbraum-Transformationen
Visuelles Feedback benötigt oft Farbanpassungen (z.B. "Mach diesen Knoten 20% heller").
*   **RGB zu HSL**: Nodges arbeitet intern oft mit HSL (Hue, Saturation, Lightness), da sich Farben so intuitiver manipulieren lassen (z.B. "Sättigung verringern für inaktive Elemente").
*   **Farb-Interpolation**: Das Überblenden zwischen Farben (z.B. von Rot nach Grün je nach Knotengewicht) wird durch Helper-Klassen gesteuert.

## 09.2 Performance-Tools

Performanz ist ein Feature. Nodges überwacht sich selbst.

### FPS-Monitoring
Ein integriertes FPS-Meter (Frames Per Second) warnt, wenn die Leistung einbricht. Dies hilft Entwicklern, Performance-Flaschenhälse (wie zu viele transparente Objekte) zu identifizieren.

### Caching und Object Pooling
Um den Garbage Collector (GC) von JavaScript zu entlasten, werden Objekte wiederverwendet:
*   **Material Cache**: Wenn 500 Knoten rot sind, teilen sie sich *eine* Material-Instanz, anstatt 500 Kopien zu erzeugen.
*   **Vector3 Recycling**: Temporäre Vektoren für Berechnungen werden einmal erstellt und immer wieder überschrieben, statt in jedem Frame neu alloziert zu werden.

## 09.3 Export und Import

Aktuell liegt der Fokus auf dem Import von Daten, aber rudimentäre Export-Funktionen existieren:

*   **Screenshot-Generator**: Rendert den aktuellen Canvas-Inhalt in ein hochauflösendes Bild (unter Berücksichtigung des aktuellen Zooms).
*   **Positions-Export**: Wenn ein Layout automatisch berechnet wurde, können die finalen Koordinaten exportiert werden, um beim nächsten Laden Rechenzeit zu sparen (Caching).

---
*Ende Kapitel 09*
