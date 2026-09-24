# Architekturkonzept: Visual Mapping Engine v4 (Scales & Datentypen)

Dieses Dokument beschreibt die fortgeschrittene Architektur für das visuelle Mapping in Nodges. Es adressiert das Kernproblem: Wie können verschiedene Datentypen (Zahlen, Texte, Booleans) flexibel und sinnvoll auf visuelle Eigenschaften (Farbe, Grösse, Position) abgebildet werden, ohne für jede Kombination separaten Code schreiben zu müssen?

## 1. Das Kernprinzip: Die "Scale" Architektur

Die Lösung liegt in der strikten Entkopplung von **Rohdaten**, **Übersetzungslogik** und dem **Rendering-Modul**. Anstatt dass das Modul "Farbe" weiss, wie man Text verarbeitet, führen wir eine Zwischenschicht ein: die sogenannten **Scales (Skalen)**.

Der Prozess durchläuft immer drei Schritte:

1.  **Domain (Input):** Der Raum der Rohdaten. (z.B. Zahlen von `0` bis `1000` oder eine Liste von Kategorien `["Obst", "Gemüse", "Fleisch"]`).
2.  **Scale (Übersetzung):** Eine mathematische Funktion oder ein Regelwerk, das einen Input-Wert aus der Domain nimmt und in einen standardisierten Output umwandelt.
3.  **Range (Output):** Der Raum der visuellen Werte. (z.B. Farbverlauf von `Blau` nach `Rot` oder Pixelwerte von `10px` bis `50px`).

`VisualProperty = Visualizer.apply( Scale.map( RawData ) )`

## 2. Skalierungs-Strategien nach Datentyp

Das System muss nicht das visuelle Modul anpassen, sondern lediglich die richtige `Scale` für den Datentyp auswählen.

### 2.1 Continuous Scales (Für Zahlen)
Nutzen mathematische Interpolation.
*   **Linear Scale:** Mappt eine numerische Domain `[min, max]` direkt auf eine visuelle Range `[outMin, outMax]`. (z.B. `10-100` -> `0.0-1.0`).
*   **Logarithmic Scale:** Für Daten mit exponentiellen Ausreissern (z.B. Vermögen). Staucht grosse Werte, zieht kleine auseinander.

### 2.2 Ordinal / Categorical Scales (Für Text & Kategorien)
Nutzen Zuordnungstabellen (Dictionaries), da zwischen Wörtern keine Interpolation möglich ist.
*   **Categorical Scale:** Weist jedem neuen, einzigartigen Textwert nacheinander einen festen Wert aus einer vorgegebenen Liste (Palette) zu.
*   **Band Scale:** Teilt einen kontinuierlichen Raum (z.B. eine X-Achse) in gleich grosse "Bänder" oder Abschnitte ein, jeweils eines pro Kategorie.

## 3. Die Mapping Matrix: Module und ihre Scales

Hier wird aufgeführt, wie sich die verschiedenen visuellen Module verhalten, wenn sie mit unterschiedlichen Scales (und damit Datentypen) "gefüttert" werden.

### Modul: Farbe (Color)
*   **Zahlen (Continuous):** Nutzt eine `Linear Scale`, um den Wert auf `0.0 - 1.0` zu normalisieren. Dieser Wert bestimmt den Punkt auf einem Farbverlauf (Gradient, z.B. d3.interpolateViridis).
*   **Text/Kategorien (Categorical):** Nutzt eine `Categorical Scale`. Das System hält eine Palette diskreter Farben bereit (z.B. Rot, Grün, Blau, Gelb). "Kategorie A" bekommt Rot, "Kategorie B" bekommt Grün. Es gibt keine Mischfarben.

### Modul: Grösse / Dicke (Size / Thickness)
*   **Zahlen (Continuous):** Nutzt eine `Linear Scale` oder `Log Scale`. Normalisierung auf `0.0 - 1.0`, anschliessende lineare Interpolation zwischen `minSize` (z.B. 0.5) und `maxSize` (z.B. 5.0).
*   **Text/Kategorien (Categorical):** **(Problemfall)** Grösse impliziert eine Wertung. Wenn "Apfel" = gross und "Birne" = klein, impliziert das, Äpfel seien wichtiger. 
    *   *Umgang:* Standardmässig für Kategorien deaktivieren oder dem Nutzer erlauben, eine explizite Reihenfolge festzulegen. Alternativ: Alle Kategorien erhalten die gleiche Standardgrösse.

### Modul: Position (X, Y, Z)
*   **Zahlen (Continuous):** Nutzt eine `Linear Scale`. Der numerische Wert wird direkt auf die Raumkoordinaten des 3D-Viewers gemappt (z.B. `[0, 100]` -> Koordinaten `[-500, +500]`).
*   **Text/Kategorien (Categorical):** Nutzt eine `Band Scale`. Die Achse (z.B. X) wird in Abschnitte unterteilt. Alle Nodes der Kategorie "A" sammeln sich bei `X=100`, Kategorie "B" bei `X=300`. Dies erzeugt visuelle Cluster.

### Modul: Form (Shape / Icon)
*   **Text/Kategorien (Categorical):** **(Idealfall)** Jedem diskreten Textwert wird eine diskrete 3D-Form zugewiesen (Typ A = Würfel, Typ B = Kugel, Typ C = Pyramide).
*   **Zahlen (Continuous):** **(Problemfall)** Formen lassen sich nicht stufenlos interpolieren. 
    *   *Umgang:* Nutzt eine `Quantize Scale` (Klassenbildung). Das System unterteilt Zahlenbereiche in "Bins" (Töpfe). Z.B. Werte `0-50` = Kugel, `51-100` = Würfel.

## 4. Beispielhafter Datenfluss im Code

Wenn ein Nutzer im UI auswählt: *Färbe Nodes nach Attribut "Branche" (Datentyp: Text)*.

1.  **UI Setup:** Das UI erkennt "Branche" als Text-Attribut.
2.  **Scale Initialisierung:** Die `ScaleEngine` instanziiert eine `CategoricalScale` und weist ihr eine Standard-Farbpalette zu (z.B. `Palette.Category10`).
3.  **Domain Evaluation:** Die Engine scannt alle Nodes und findet die einzigartigen Branchen: `["IT", "Finanzen", "Handel"]`.
4.  **Mapping Prozess:**
    *   Node 1 (Branche: "IT") -> Scale("IT") -> Return: `#1f77b4` (erste Farbe der Palette).
    *   Node 2 (Branche: "Finanzen") -> Scale("Finanzen") -> Return: `#ff7f0e` (zweite Farbe).
    *   Node 3 (Branche: "IT") -> Scale("IT") -> Return: `#1f77b4` (Farbe ist bereits gemerkt).
5.  **Rendering:** Das Farbmodul nimmt den berechneten Hex-Wert und wendet ihn auf das Material des 3D-Meshes an. Das Farbmodul weiss absolut nichts über den Begriff "Branche".

## 5. Vorteile dieser Architektur

*   **Keine Code-Duplizierung:** Ein Visualisierungsmodul (z.B. für Position) muss nur einmal geschrieben werden.
*   **Erweiterbarkeit:** Wenn ein neuer Datentyp hinzukommt (z.B. Datumsformate), muss nur eine neue `TimeScale` geschrieben werden. Die Visualisierungsmodule bleiben unangetastet.
*   **Sicherheit:** Fehleingaben werden von den Scales abgefangen (z.B. wenn eine Zahl für ein Text-Attribut übergeben wird, kann die Scale einen Default-Wert liefern), bevor sie den Renderer zum Absturz bringen.
