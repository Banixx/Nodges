# 09 Utilities und Hilfssysteme

Unter der Haube von Nodges arbeiten zahlreiche "Stille Helfer" – Utility-Bibliotheken und mathematische Assistenten, die komplexe Aufgaben vereinfachen und für eine saubere Codebasis sorgen.

## 09.1 Die Mathe-Toolbox (`src/utils/math.ts`)

Graphenvisualisierung in 3D ist pure Mathematik. Unsere Utilities abstrahieren die harten Formeln:

### 1. Distanz-Berechnungen (Performance-Trick)
In Layout-Algorithmen müssen wir Millionen Mal den Abstand zwischen Knoten berechnen. Normalerweise nutzt man den Satz des Pythagoras ($a^2 + b^2 + c^2 = d^2$), was eine teure Quadratwurzel (`Math.sqrt`) erfordert.
**Der Utility-Trick**: Wir vergleichen oft nur die **quadrierten Distanzen**. Wenn $d1^2 > d2^2$, dann ist auch $d1 > d2$. Wir sparen uns die Wurzelziehung und gewinnen massiv an Performance.

### 2. Lineare Interpolation (Lerp)
Für flüssige Animationen (z.B. Farbübergänge oder Kamerafahrten) nutzen wir die `lerp`-Funktion:
`Result = Start + (End - Start) * Alpha`
Dies erlaubt uns, jeden Wert über die Zeit sanft von A nach B wandern zu lassen.

## 09.2 Das Farb-System (`src/utils/ColorManager.ts`)

Farben sind in Nodges mehr als nur Deko. Sie sind Datenträger.

### HSL over RGB
Wir arbeiten intern bevorzugt im **HSL-Farbraum** (Hue, Saturation, Lightness):
*   **Hue (Farbton)**: Perfekt für Kategorien (z.B. Server = Blau, PC = Grün).
*   **Saturation (Sättigung)**: Kann die Wichtigkeit eines Knotens darstellen.
*   **Lightness (Helligkeit)**: Ideal für Highlights. "Mach den Knoten 20% heller bei Hover" ist in HSL eine simple Addition, in RGB eine komplexe Matrix-Rechnung.

### Heatmap-Generator
Eine Utility-Funktion erlaubt es, Wertebereiche (z.B. 0.0 bis 1.0) auf Farbskalen zu mappen (z.B. von kühlem Blau zu heißem Rot). Dies wird für das "Visual Mapping" im Future-Format intensiv genutzt.

## 09.3 Performance-Monitoring & Debugging

Nodges hat ein eingebautes Bewusstsein für seine eigene Leistung.
*   **FPS-Meter**: Überwacht die Frames pro Sekunde. Fällt der Wert unter 30, können automatisch Details reduziert werden (z.B. Schatten aus, Kurven weniger fein).
*   **Memory Tracking**: (In Entwicklung) Überwacht, ob Three.js Objekte korrekt aus dem Speicher gelöscht wurden (Garbage Collection Monitoring), um Memory Leaks zu verhindern.

## 09.4 Datei-Manager & Export

*   **Screenshot-Tool**: Erlaubt es, den aktuellen Zustand als hochauflösendes PNG zu exportieren. Hierbei wird kurzzeitig die Render-Qualität (Antialiasing) massiv erhöht, um "druckreife" Bilder zu erzeugen.
*   **JSON-Schema Generator**: Ein Tool, das aus unseren TypeScript-Interfaces automatisch JSON-Schema Dateien erstellt, damit User in ihren Editoren (wie VS Code) Autocomplete-Support beim Erstellen von Graphen-Dateien haben.

---
*Ende Kapitel 09*
