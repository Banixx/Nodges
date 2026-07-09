# UI-Modus-System (Simple, Expert, Dev) für Nodges

Dieses Dokument beschreibt das System zur Steuerung der UI-Komplexität in Nodges. Das Ziel ist es, die Benutzeroberfläche für neue Anwender übersichtlich zu halten ("Simple"-Modus) und gleichzeitig fortgeschrittenen Benutzern ("Expert"-Modus) sowie Entwicklern ("Dev"-Modus) den vollen Funktionsumfang zur Verfügung zu stellen.

## Funktionsweise und Mechanismus

Die Umschaltung der Komplexität basiert auf einem deklarativen System, das den globalen Zustand (`StateManager`) mit reaktiven CSS-Klassen und HTML5-Datenattributen verknüpft.

1. **Zustandsverwaltung (`StateManager`)**:
   * Die Eigenschaft `complexityMode` im globalen Zustand speichert den aktiven Modus (`simple`, `expert` oder `dev`).
   * Der Zustand wird im `localStorage` des Browsers unter dem Schlüssel `nodges_complexity_mode` persistiert, damit die Auswahl bei einem Neuladen der Seite erhalten bleibt.
   * Standardmäßig startet die Anwendung im `simple`-Modus, um Einsteiger nicht zu überfordern.

2. **Deklarative Sichtbarkeit via CSS**:
   * Elemente in der HTML-Struktur werden mit dem Attribut `data-min-mode` versehen, das den minimal erforderlichen Modus festlegt (z. B. `data-min-mode="expert"`).
   * Der `UIManager` setzt je nach Modus eine klasse auf das `<body>`-Element: `ui-mode-simple`, `ui-mode-expert` oder `ui-mode-dev`.
   * Folgende globale CSS-Regeln in C:/Users/ich/Desktop/code/_projects/Nodges/src/styles/main.css steuern die Sichtbarkeit:
     ```css
     body.ui-mode-simple [data-min-mode="expert"],
     body.ui-mode-simple [data-min-mode="dev"] {
       display: none !important;
     }

     body.ui-mode-expert [data-min-mode="dev"] {
       display: none !important;
     }
     ```

3. **Aktive Tab-Validierung**:
   * Wechselt der Benutzer in einen niedrigeren Modus, während ein nun ausgeblendeter Tab aktiv ist, schaltet das System automatisch auf den Standard-Tab `System` zurück.
   * Die horizontale Scrollbar der Tabs passt sich dynamisch an die Anzahl der sichtbaren Tabs an.

---

## Verteilung der Benutzeroberflächen-Elemente

Die Elemente und Tabs sind wie folgt auf die drei Modi aufgeteilt:

| Element / Tab | Minimaler Modus | Beschreibung |
| :--- | :--- | :--- |
| **System-Tab** (`tab-system`) | `simple` | Allgemeine Informationen zur Datei, Knoten, Kanten und die Legende. |
| **Files-Tab** (`tab-files`) | `simple` | Laden und Verwalten von Modelldaten. |
| **Ansicht-Tab** (`tab-view`) | `simple` | Aktivieren/Deaktivieren der Beschriftungen und Farbschema-Auswahl. |
| **Ebenen-Tab** (`tab-layers`) | `expert` | Filterung und Transparenzeinstellungen einzelner Attributebenen. |
| **Mappings-Tab** (`tab-mappings`) | `expert` | Konfiguration visueller Attribut-Mappings im Sidebar-Panel. |
| **Layout-Tab** (`tab-layout`) | `expert` | Einstellungen und Steuerung des Graph-Layouts. |
| **Create-Tab** (`tab-create`) | `dev` | Manuelle Erstellung von Knoten und Kanten direkt in der Szene. |
| **Dev-Tab** (`tab-dev`) | `dev` | Leistungs- und GPU-Performance-Test-Optionen. |
| **Achsenbereiche (System-Tab)** | `expert` | Anzeige der Koordinaten-Grenzbereiche im Systemtab. |
| **Umgebung (Ansicht-Tab)** | `expert` | Slider zur Anpassung von Umgebungslicht und direktem Licht. |
| **Darstellungsgröße (Ansicht-Tab)** | `expert` | Regler für Werte-Dämpfung, Skalierung und Auto-Balancing. |
| **Kanten & Darstellung (Ansicht-Tab)** | `dev` | Technische Kantenparameter (Dicke, Kurvensegmente, Facetten, Pulsgeschwindigkeit, Animationsmodi). |
| **Floating Mapping-Panel** | `expert` | Das interaktive Mapping-Overlay im unteren Bildschirmbereich. |
| **Minimap** | `simple` | Die Navigationskarte unten links bleibt in allen Modi aktiv. |

---

## Technische Implementierung im Quellcode

Die Änderungen wurden in folgenden Dateien vorgenommen:

* **[StateTypes.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/state/StateTypes.ts)**:
  * Typendefinition für `complexityMode` im `UIState` hinzugefügt.
  * Zuweisung zur Kategorie `STATE_CATEGORIES.UI` in `STATE_KEY_TO_CATEGORIES` registriert.
* **[StateManager.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/StateManager.ts)**:
  * Initialisierung von `complexityMode` mit Auslesen aus dem `localStorage` (Fallback auf `'simple'`).
  * Persistierung im `localStorage` bei jedem Zustandsupdate in der `update`-Methode.
* **[index.html](file:///C:/Users/ich/Desktop/code/_projects/Nodges/index.html)**:
  * Struktur des 3-fach-Umschaltknopfs im Systemtab eingefügt.
  * Zuweisung von `data-min-mode` auf den Tab-Navigationsknöpfen und den statischen Info-Sektionen.
* **[main.css](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/styles/main.css)**:
  * CSS-Regeln für die Segmented-Button-Optik des Umschalters definiert.
  * Globale Ausblendungsregeln basierend auf `data-min-mode` und dem `body`-Klassen-Selektor implementiert.
* **[UIManager.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/UIManager.ts)**:
  * Listener-Bindung in `initModeSwitch()` für die Klicks auf die Modus-Schalter.
  * Aktualisierungslogik in `updateUIForMode()`, die Klassen auf dem Body setzt, Buttons hervorhebt, die Scrollbar neu berechnet und ggf. auf den System-Tab zurückspringt.
* **[ViewPanel.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/ViewPanel.ts)**:
  * Kennzeichnung des dynamisch generierten Bereichs „Darstellungsgröße“ mit dem Attribut `dataset.minMode = 'expert'`.
