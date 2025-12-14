# 08 Benutzeroberfläche (UI) und UX

Nodges setzt auf ein minimalistisches, funktionales Overlay-Interface, das die 3D-Visualisierung nicht verdeckt, sondern ergänzt.

## 08.1 UI-Architektur (`UIManager`)

Die UI ist strikt vom 3D-Rendering getrennt. Während Three.js in einem `<canvas>` Element im Hintergrund läuft, liegt die Benutzeroberfläche als HTML/CSS-Layer darüber (`z-index`).

### Trennung von Belangen
*   **Canvas**: Zuständig für die 3D-Welt.
*   **DOM Overlay**: Zuständig für Texte, Buttons, Listen und Formulare.
Diese Trennung garantiert, dass UI-Interaktionen (wie Scrollen in einer Liste) performant sind und nicht die Framerate der 3D-Engine beeinflussen, und umgekehrt.

### Manager-Verantwortung
Der `UIManager` ist die Brücke zwischen Logik und Darstellung. Er abonniert den `StateManager` und manipuliert das DOM entsprechend:
*   `state.selectedObject` ändert sich -> `UIManager` füllt und öffnet das Info-Panel.
*   `state.isLoading` ist true -> `UIManager` zeigt den Lade-Spinner.

## 08.2 Komponenten im Detail

Die Benutzeroberfläche besteht aus modularen Panels.

### Info-Panel (Rechts)
Das wichtigste Werkzeug für die Datenanalyse.
*   **Dynamischer Content**: Wenn ein Knoten ausgewählt wird, generiert das Panel automatisch eine Tabelle mit allen verfügbaren Attributen (ID, Typ, Metadaten).
*   **Kontext-Sensitiv**: Zeigt unterschiedliche Daten für Knoten und Kanten.
*   **Persistent**: Bleibt geöffnet, damit Benutzer Daten vergleichen können, kann aber eingeklappt werden.

### File-Browser (Links)
Ermöglicht das Laden verschiedener Datensätze.
*   **Dateiliste**: Listet JSON-Dateien aus dem `/data` Verzeichnis.
*   **Drag & Drop**: (Geplant) Benutzer können eigene Dateien direkt in das Fenster ziehen.

### Settings & Controls (lil-gui)
Für technische Einstellungen, die oft während der Entwicklung oder Analyse angepasst werden müssen, wird die Bibliothek `lil-gui` verwendet.
*   **Layout-Parameter**: Feder-Stärke, Gravitation, Iterationen.
*   **Visuelle Einstellungen**: Glow-Intensität, Kantendicke, Farbschemata.
*   **Debug-Tools**: Anzeigen von Hit-Boxen oder Performance-Metriken.

## 08.3 Visuelles Feedback im UI

Gutes UX bedeutet, den Benutzer nie im Unklaren über den Systemzustand zu lassen.

### Lade-Indikatoren
Da das Parsen grosser JSON-Dateien und das Berechnen des Layouts Zeit beanspruchen kann, wird ein prominenter Lade-Indikator angezeigt, der den aktuellen Fortschritt widerspiegelt (z.B. "Loading Geometry...", "Calculating Layout...").

### Fehler-Meldungen
Nodges fängt Fehler (z.B. fehlerhaftes JSON) ab und zeigt sie in gut lesbaren "Toast"-Benachrichtigungen oder modalen Fenstern an, anstatt Fehlermeldungen nur in der Browser-Konsole zu verstecken. Dies macht die Anwendung auch für Nicht-Entwickler bedienbar.

---
*Ende Kapitel 08*
