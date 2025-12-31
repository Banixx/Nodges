# 08 Benutzeroberfläche (UI) und UX-Design

In Nodges ist das UI kein Selbstzweck, sondern das Navigationsinstrument für die 3D-Welt. Wir verfolgen eine "Canvas-First"-Strategie: Die Daten stehen im Mittelpunkt, das Interface ordnet sich unter.

## 08.1 Die Hybrid-Architektur (DOM + WebGL)

Nodges nutzt zwei Welten gleichzeitig:
1.  **WebGL (Canvas)**: Für das High-Performance Rendering der 3D-Daten.
2.  **HTML/CSS (DOM)**: Für Texte, Formulare und komplexe Layouts.

**Der Vorteil**: HTML ist unschlagbar flexibel für Textdarstellung und Accessibility. Durch die Überlagerung (Z-Index) können wir die Vorteile beider Welten nutzen, ohne die Performance der 3D-Engine durch teure "Text-in-WebGL"-Tricks zu belasten.

## 08.2 Das "Glassmorphism" Design-Konzept

Um den futuristischen und luftigen Charakter einer 3D-Anwendung zu unterstreichen, nutzt Nodges ein modernes **Glassmorphism-Design**:
*   **Transparenz**: Panels sind leicht durchsichtig (`backdrop-filter: blur(10px)`). Man sieht den Graphen "hinter" dem Menü noch leicht durchschimmern.
*   **Kontrast**: Dunkle Hintergründe mit neonfarbenen Akzenten sorgen für maximale Lesbarkeit in dunklen Arbeitsumgebungen.

## 08.3 Kern-Komponenten des Interfaces

### 1. Das Explorer-Panel (Links)
Dient der Datei-Verwaltung und dem schnellen Wechsel zwischen Datensätzen.
*   **File-Browser**: Schneller Zugriff auf mitgelieferte Beispiele.
*   **Drop-Zone**: Benutzer können eigene JSON-Dateien einfach in das Fenster ziehen (Drag & Drop), um sie lokal zu visualisieren.

### 2. Das Info-Inspector-Panel (Rechts)
Das wichtigste Werkzeug für Analysten. Sobald ein Objekt (Node/Edge) selektiert wird, öffnet sich dieser Inspektor.
*   **Attribut-Tabelle**: Listet alle Felder aus dem JSON-Datensatz auf.
*   **Key-Value Pairs**: Auch unbekannte Attribute werden dynamisch ausgelesen und dargestellt.
*   **Action-Buttons**: Erlaubt Aktionen wie "Fokussiere Nachbarn" oder "Bestimme kürzesten Pfad".

### 3. Der Quick-Settings Controller (`lil-gui`)
Ein schwebendes Menü für technische Parameter.
*   **Echtzeit-Feedback**: Während man Slider bewegt (z.B. "Node-Size" oder "Gravity"), ändert sich die 3D-Welt sofort. Das erlaubt ein spielerisches "Tuning" der Visualisierung.

## 08.4 UX-Leitsätze in Nodges

### "Never lose context"
In 3D verliert man schnell die Orientierung. Unser UI hilft:
*   **Minimap**: (Geplant) Eine kleine Übersichtskarte des gesamten Graphen.
*   **Breadcrumbs**: Zeigt den Pfad im Graphen an (z.B. "Cluster A > Server B").

### "Meaningful Motion"
Animationen sind nicht nur Zierde. Wenn sich ein Panel öffnet, schiebt es sich sanft ins Bild. Wenn Daten geladen werden, gibt es einen Fortschrittsbalken. Jede Bewegung signalisiert dem User: "Hier passiert etwas".

### "Fail Fast, Show Clear"
Wenn eine Datei fehlerhaft ist, erscheint kein "Error 500", sondern ein informatives Overlay: "Fehler in Zeile 45: Koordinate 'z' fehlt". Wir führen den User zur Lösung.

---
*Ende Kapitel 08*
