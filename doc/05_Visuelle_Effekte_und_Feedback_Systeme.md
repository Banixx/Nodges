# 05 Visuelle Effekte und Feedback-Systeme

Ein intuitives visuelles Feedback ist entscheidend, um dem Benutzer Orientierung in der komplexen 3D-Welt zu geben. Nodges implementiert hierfür ein mehrschichtiges System aus Highlights, Animationen und atmosphärischen Effekten.

## 05.1 Das Highlight-System (`HighlightManager`)

Der `HighlightManager` ist die zentrale Instanz für alle visuellen Hervorhebungen. Er stellt sicher, dass sich verschiedene Interaktionszustände (z.B. "Ich fahre über einen Knoten" vs. "Ich habe diesen Knoten markiert") nicht gegenseitig visuell zerstören.

### Architektur der Highlight-Verwaltung

Siehe Sequenz-Diagramm zum Highlight-Prozess: [mermaid_06.mmd](mermaid_06.mmd)

Das System basiert auf einer internen **Highlight-Registry** (`Map<Object3D, HighlightData>`).

*   **Zustandssicherung**: Bevor ein Objekt visuell verändert wird, legt der Manager ein Backup des originalen Materials an. Beim Entfernen des Highlights wird dieser Originalzustand exakt wiederhergestellt. Das verhindert "Geister-Materialien", bei denen Objekte versehentlich in der Highlight-Farbe verweilen.
*   **Vermeidung von Farbsprüngen**: Übergänge zwischen Zuständen (z.B. Hover-Ende bei gleichzeitigem Search-Highlight) werden logisch aufgelöst. Das System prüft: "Gibt es noch einen anderen Grund, warum dieses Objekt leuchten sollte?"

### Prioritäten-Kaskade
Da ein Objekt mehrere Gründe haben kann, hervorgehoben zu werden, gibt es eine Priorisierung:
1.  **SELECTION** (Höchste Prio): Der Benutzer fokussiert dieses Objekt aktiv.
2.  **SEARCH**: Das Objekt ist Teil eines Suchergebnisses.
3.  **PATH**: Das Objekt liegt auf einem berechneten Pfad.
4.  **HOVER** (Niedrigste Prio): Die Maus ist nur kurzzeitig über dem Objekt.

## 05.2 Highlight-Modi im Detail

### 1. HOVER-Modus (Feedback der Erreichbarkeit)
*   **Zweck**: Signalisiert dem User: "Dieses Objekt ist anfassbar".
*   **Visuell (Nodes)**: Helligkeitsboost (+30%) und ein cyanfarbener, transparenter Halo-Umriss.
*   **Visuell (Edges)**: Die Kante wird "dicker" (durch Einblenden einer Tube-Geometrie) und leuchtet bläulich.

### 2. SELECTION-Modus (Der Fokus)
*   **Zweck**: Dauerhafte Markierung für Detailanalyse.
*   **Visuell**: Ein kräftiger grüner Glow-Effekt (Emissive Color).
*   **Besonderheit**: Selektierte Objekte "atmen" (Pulsation der Leuchtintensität), um sie vom statischen Rest des Graphen abzuheben.

### 3. SEARCH & PATH (Semantische Highlights)
*   **SEARCH**: Nutzt Kontrastfarben (Gelb/Magenta), um Treffer in der Weite des Raums schnell auffindbar zu machen.
*   **PATH**: Markiert Ketten von Kanten und Knoten. Hier ist besonders die **Durchsichtigkeit** wichtig: Damit ein Pfad durch den ganzen Graphen verfolgt werden kann, werden nicht-beteiligte Knoten oft leicht ausgegraut (Ghosting-Effekt).

## 05.3 Der "Breathing" Glow-Effekt

Anstatt statischer Farben nutzt Nodges dynamisches Leuchten. Dies erzeugt einen organischen, hochwertigen Look ("Premium Aesthetics").

### Die Mathematik dahinter
Die Pulsation wird über einen **Sinus-Oszillator** gesteuert:
`Intensity = Base + Amplitude * sin(Time * Frequency)`

*   **Base**: Die minimale Helligkeit (z.B. 0.2).
*   **Amplitude**: Wie stark schlägt das Blinken aus?
*   **Frequency**: Wie schnell atmet das Objekt? (Standard: 0.5 Hz für beruhigende Wirkung).

Diese Werte werden in jedem Frame an die `emissiveIntensity` des Materials übergeben.

## 05.4 Halo-Technik (Outline Rendering)

Echte Outlines sind in WebGL schwierig (erfordern oft Post-Processing Shader). Nodges nutzt eine performante geometrische Alternative:
*   Wir erzeugen ein zweites Mesh, das ca. 10% größer ist als das Originalobjekt.
*   Wir verwenden ein spezielles Material, das nur die **Innenseiten** (`THREE.BackSide`) rendert oder dessen Normalen invertiert sind.
*   Dadurch entsteht der Eindruck eines Lichtkranzes (Halo) um das Objekt herum, ohne dass teure Bildverarbeitungs-Algorithmen nötig sind.

---
*Ende Kapitel 05*
