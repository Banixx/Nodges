# Konzept: Interaktives Mapping-Panel und 2D-Node-Bibliothek für Nodges

## Empfehlung der 2D-Node-Bibliothek
Für eine intelligente, zukunftssichere Entwicklung der node-basierten Benutzeroberfläche und der systemischen Impulssimulation in 2D ist die Bibliothek **LiteGraph.js** (oder eine modernere Alternative wie **Rete.js** bzw. **React Flow** falls React eingeführt wird) die am besten geeignete Wahl.

### Detail-Analyse der Bibliotheken

| Bibliothek | Render-Typ | Vorteile | Nachteile | Eignung für Nodges-Impulssimulation |
| :--- | :--- | :--- | :--- | :--- |
| **LiteGraph.js** | HTML5 Canvas | Extrem performant; Eingebaute Ausführungs-Engine (Execution Engine) für zeitbasierte Signale/Impulse; Sehr stabil; Reine JS-Bibliothek ohne Framework-Zwang. | Veraltetes 90er-Jahre Design; Schwer mit modernem CSS (Glassmorphismus) zu stylen; Canvas-Interaktion ist starr. | **Hervorragend** (Besitzt out-of-the-box Unterstützung für Signal-Impulse über Kanten über die Zeit). |
| **Rete.js** (v2) | Framework-agnostisch / DOM | Sehr modular; Modernes Design; Flexibel anpassbar an eigene Styling-Systeme (z.B. Glassmorphismus); TypeScript-Unterstützung. | Komplexe Konfiguration; Hohe Lernkurve; Kein direkt eingebautes zeitbasiertes Ausführungssystem für Impulse. | **Sehr gut** (Erfordert aber eigene Logik für die zeitbasierte Impulsübertragung). |
| **React Flow / Svelte Flow** | DOM / SVG | Weltklasse-Ausschauen; Exzellente UX; Einfaches Drag & Drop; Weit verbreitet. | Zwingt das Projekt zur Nutzung von React oder Svelte (Nodges basiert auf Vanilla TS). | **Bedingt** (Nur bei vollständiger Migration auf React/Svelte sinnvoll). |
| **Eigene SVG/HTML-Lösung** | DOM / SVG | Leichtgewichtig; Passt sich perfekt in das aktuelle Designsystem an; Keine externen Abhängigkeiten; Vollständige Kontrolle. | Kein fertiges Ausführungssystem für komplexe Logikgraphen; Höherer Eigenentwicklungsaufwand bei großen Graphen. | **Sehr gut für das Attribut-Visualisierungs-Mapping**, aber nicht für komplexe Impulssimulationen. |

---

## Das neue interaktive Mapping-Panel

### 1. Architektur und Platzierung
Das neue **Mapping-Panel** wird als schwebendes Overlay im Glassmorphismus-Design analog zur Minimap implementiert:
*   **ID:** `mappingPanelContainer`
*   **Position:** Unten in der Mitte (`bottom: 20px; left: 280px;`) direkt neben der Minimap.
*   **Abmessungen:** `width: 500px; height: 320px;` (Kompakt, aber übersichtlich).
*   **Zustand:** Ein- und ausklappbar über einen Header-Pfeil (`▲` / `▼`). Klappt beim Laden eines neuen Projektes automatisch auf, um den Benutzer über die Visualisierungsregeln zu informieren.

### 2. Benutzeroberfläche (UI-Aufteilung)
Das Panel ist horizontal zweigeteilt:
1.  **Header:** Titel "MAPPING", ein Dropdown-Menü zur Auswahl des Entity/Relationship-Typs (z.B. `Person` oder `Ehe`), und der Einklapp-Button.
2.  **Linke Spalte (Daten-Attribute):** Zeigt alle verfügbaren numerischen und kategorischen Felder des Typs an (z.B. `age`, `lifeStatus`, `influence`, `constant`). Neben jedem Attribut befindet sich un Snapdot (Output) auf der rechten Seite.
3.  **Rechte Spalte (Visualisierungs-Kanäle):** Zeigt die steuerbaren 3D-Eigenschaften des Typs an (z.B. `size`, `color`, `glow`, `geometry`). Neben jedem Kanal befindet sich ein Snapdot (Input) auf der linken Seite.
4.  **Verbindungsebene (SVG Overlay):** Ein transparentes SVG-Element spannt sich über das Panel. Bei aktiven Mappings zeichnet es eine geschwungene Bezier-Kurve von dem Attribut-Snapdot zum Visualisierungs-Snapdot.

### 3. Interaktionslogik (Drag & Drop mit Snapping)
*   **Verbindung erstellen:** Der Benutzer klickt auf einen Attribut-Snapdot (links) und zieht die Maus zum gewünschten Visualisierungs-Snapdot (rechts). Während des Ziehens folgt eine dynamische Kurve dem Zeiger. Sobald der Zeiger nahe genug (< 15px) am Ziel-Snapdot ist, rastet die Kurve ein (Snapping). Beim Loslassen wird das Mapping aktualisiert.
*   **Verbindung lösen:** Ein Klick auf ein bereits verbundenes Visualisierungs-Snapdot und anschließendes Ziehen in den leeren Raum löst die Verbindung und setzt die Eigenschaft auf `constant`.
*   **Live-Feedback:** Jede Änderung am Graph aktualisiert augenblicklich die 3D-Darstellung der Knoten und Kanten in der Three.js-Szene über den `StateManager`.

---

## Implementierungsplan

1.  **HTML-Struktur:** Hinzufügen des Containers `#mappingPanelContainer` in `C:/Users/ich/Desktop/code/_projects/Nodges/index.html`.
2.  **Styles:** Ergänzen der CSS-Regeln für das Mapping-Panel und die Snapdots in `C:/Users/ich/Desktop/code/_projects/Nodges/src/styles/main.css`.
3.  **Klassendesign:** Erstellen von `C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/MappingUI.ts` zur Steuerung des Drag & Drops und des SVG-Renderns.
4.  **Integration:** Initialisierung der `MappingUI` im `UIManager.ts` und automatische Aktivierung beim Laden von Daten in `App.ts`.
