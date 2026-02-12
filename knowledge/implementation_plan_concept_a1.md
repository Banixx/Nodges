# Implementation Plan: Konzept A1 "Classic Workbench"

## Ziel

Das aktuelle, vertikal gestapelte Panel-System durch eine einzige, rechte Seitenleiste mit Tabs ersetzen. Dazu gehören:

1. Ein neuer **"Ansicht" (View) Tab** mit Label-Einstellungen und 5 Farbschemata.
2. **Hover-Verhalten**: Bei Mouseover über Node/Edge wird der Name angezeigt, *sofern* "Name immer anzeigen" AUS ist.
3. **Click-Verhalten**: Linksklick = Selektion (bestehendes Verhalten), Rechtsklick = Kontextmenü (bestehendes Verhalten).

---

## User Review Required

> [!IMPORTANT]
> **Farbschema-Palette**: Die Schemata 1 und 5 werden durch **erdige** Töne ersetzt. Bitte bestätigen Sie die folgenden Vorschläge:
>
> 1. **Slate Earth** (`#1e1e1c` BG, `#2a2a28` Panel, `#a08060` Accent) - Dunkelgrau mit erdigem Beige-Akzent.
> 2. **Terracotta Night** (`#1a1512` BG, `#2b221d` Panel, `#c67a4f` Accent) - Sehr dunkel, Terrakotta-Orange Akzent.
> 3. (Original) **Deep Ocean** (`#2c3e50` BG, `#34495e` Panel, `#1abc9c` Accent)
> 4. (Original) **Midnight** (`#19101f` BG, `#2d1e36` Panel, `#9b59b6` Accent)
> 5. (Original) **Forest** (`#0f1a15` BG, `#16261f` Panel, `#27ae60` Accent)

> [!CAUTION]
> **Breaking Change für bestehende UI-Struktur**: Die aktuellen einzelnen Panels (System, Files, Mapping, Environment, Layout, Dev) werden in *eine* Sidebar mit Tabs konsolidiert. Die `index.html` muss umstrukturiert werden.

---

## Proposed Changes

Die Änderungen sind in Komponenten gruppiert.

---

### Komponente 1: Neue Sidebar-Struktur (`index.html`)

#### [MODIFY] [index.html](file:///c:/Users/ich/Desktop/code/Nodges/index.html)

* Ersetze die bestehenden, individuellen `#fileInfoPanel`, `#filePanel`, `#visualMappingPanel`, `#environmentPanel`, `#devPanel` durch ein einziges `<aside id="mainSidebar">` am rechten Rand.
* Innerhalb der Sidebar: Tab-Navigation (`<nav class="sidebar-tabs">`) und ein Content-Bereich (`<div class="sidebar-body">`).
* Die Tab-IDs sind: `tab-layout`, `tab-view`, `tab-files`, `tab-system`. Das Object Info Panel (`#infoPanel`) bleibt als separates, **schwebendes** Panel erhalten (wird beim Klick auf ein Objekt angezeigt) oder wird ebenfalls in ein Tab separiert.
* Alle Inhalte der alten Panels werden in die entsprechenden Tab-Container verschoben.

---

### Komponente 2: Neuer "Ansicht" (View) Tab

#### [NEW] [ViewPanel.ts](file:///c:/Users/ich/Desktop/code/Nodges/src/ui/ViewPanel.ts)

* Neue UI-Komponente, die den Inhalt des "Ansicht"-Tabs verwaltet.
* **Enthält**:
  * **Beschriftungen (Labels)**:
    * Checkbox: "Namen immer anzeigen" (bindet an `stateManager.state.showLabelsAlways`).
    * Checkbox: "Namen bei Hover" (bindet an `stateManager.state.showLabelsOnHover`, Standardwert: `true`).
    * Optional: Dropdown "Label-Inhalt" (Name | ID).
  * **Farbschema**:
    * 5 Farbkacheln/Buttons, die die 5 Farbschemata repräsentieren.
    * Bei Klick wird die CSS-Custom-Property (`--bg-color`, `--panel-bg`, `--accent-color`) auf dem `:root`-Element geändert.
* Die Komponente wird in `UIManager.ts` instanziiert und in den entsprechenden Tab-Container eingefügt.

---

### Komponente 3: StateManager-Erweiterung

#### [MODIFY] [StateManager.ts](file:///c:/Users/ich/Desktop/code/Nodges/src/core/StateManager.ts)

* Füge die neuen Zustandsvariablen hinzu:
  * `showLabelsAlways: boolean` (default: `false`)
  * `showLabelsOnHover: boolean` (default: `true`)
  * `activeColorScheme: string` (default: `'slate-earth'`)

---

### Komponente 4: Hover-Logik in `CentralEventManager` / `HoverInfoPanel`

#### [MODIFY] [CentralEventManager.ts](file:///c:/Users/ich/Desktop/code/Nodges/src/core/CentralEventManager.ts)

* Die `handleMouseMove`-Logik prüft `stateManager.state.showLabelsAlways`.
* **Wenn `showLabelsAlways === true`**: Das `HoverInfoPanel` wird bei Hover NICHT angezeigt (da die Labels ohnehin sichtbar sind). Stattdessen könnte ein einfacherer, kleinerer Tooltip mit zusätzlichen Infos erscheinen (Phase 2).
* **Wenn `showLabelsAlways === false` UND `showLabelsOnHover === true`**: Das `HoverInfoPanel` wird wie bisher aktiviert und zeigt den Namen (und Details) des Objekts an.

---

### Komponente 5: CSS-Variablen für Theming

#### [MODIFY] [main.css](file:///c:/Users/ich/Desktop/code/Nodges/src/styles/main.css)

* Stelle sicher, dass alle Panel-Komponenten CSS-Variablen für Farben verwenden: `var(--bg-color)`, `var(--panel-bg)`, `var(--accent-color)`.
* Füge die Default-Werte für das erste Schema ("Slate Earth") hinzu:

    ```css
    :root {
      --bg-color: #1e1e1c;
      --panel-bg: #2a2a28;
      --accent-color: #a08060;
      /* ... */
    }
    ```

* Füge Styles für die neue `.sidebar-tabs` und `.sidebar-body` Struktur hinzu.

---

### Komponente 6: `UIManager` Refactoring

#### [MODIFY] [UIManager.ts](file:///c:/Users/ich/Desktop/code/Nodges/src/core/UIManager.ts)

* Refaktoriere `initPanelToggling` und `initPanelPositioning` für die neue Single-Sidebar-Struktur.
* Füge eine Methode `switchTab(tabId: string)` hinzu.
* Instanziiere und integriere das neue `ViewPanel`.
* Entferne oder passe die Referenzen auf die alten, getrennten Panels an.

---

### Bestehende Komponenten (Kein/Geringer Änderungsbedarf)

* **ContextMenu.ts**: Keine Änderung nötig. Das Kontextmenü wird weiterhin bei Rechtsklick von `InteractionManager` getriggert.
* **InteractionManager.ts** (`handleClick` / `handleContextMenu`): Keine funktionale Änderung. Linksklick selektiert, Rechtsklick öffnet Menü.

---

## Verification Plan

### Manuelle Tests (durch User)

1. **Tab-Navigation**:
    * Starte die Anwendung (`npm run dev`). Öffne `http://localhost:5173`.
    * Verifiziere: Am rechten Bildschirmrand ist eine Sidebar mit Tabs (Layout, Ansicht, Dateien, System) sichtbar.
    * Klicke auf jeden Tab und verifiziere, dass der Inhalt wechselt.

2. **Farbschema wechseln**:
    * Gehe zum "Ansicht"-Tab.
    * Klicke auf verschiedene Farbkacheln.
    * Verifiziere: Der Hintergrund der Szene und die Sidebar-Farben ändern sich.

3. **Label-Hover-Verhalten**:
    * Stelle sicher, "Namen immer anzeigen" ist AUS (Checkbox nicht aktiv).
    * Hovere über einen Knoten.
    * Verifiziere: Ein Tooltip mit dem Namen des Knotens erscheint.
    * Aktiviere "Namen immer anzeigen".
    * Hovere erneut über einen Knoten.
    * Verifiziere: Der Tooltip erscheint NICHT mehr (der Name sollte auf dem Knoten selbst zu sehen sein - *das ist ein separates Feature, das erst in Phase 2 implementiert wird*).

4. **Kontextmenü**:
    * Rechtsklicke auf einen Knoten.
    * Verifiziere: Ein Kontextmenü erscheint mit Optionen.

5. **Selektion**:
    * Linksklicke auf einen Knoten.
    * Verifiziere: Der Knoten wird hervorgehoben/selektiert (das Info-Panel oder ein entsprechendes Element zeigt die Knotendetails).

### Automatisierte Tests

* Aktuell gibt es keine relevanten Unit- oder Integrationstests für die UI-Komponenten in diesem Projekt. Das Erstellen von automatisierten UI-Tests (z.B. mit Playwright oder Cypress) ist ein separates Vorhaben und nicht Teil dieser Implementierung.

---

## Reihenfolge der Implementierung

1. **Schritt 1 (Struktur)**: `index.html` und `main.css` für die neue Sidebar-Struktur anpassen.
2. **Schritt 2 (State)**: `StateManager.ts` mit neuen Zustandsvariablen erweitern.
3. **Schritt 3 (UI)**: `ViewPanel.ts` erstellen.
4. **Schritt 4 (Integration)**: `UIManager.ts` refactored, um Tabs zu verwalten und `ViewPanel` einzubinden.
5. **Schritt 5 (Logik)**: `CentralEventManager.ts` für Hover-Logik anpassen.
6. **Schritt 6 (Theming)**: CSS-Variablen für alle 5 Schemata in `main.css` sicherstellen.
7. **Schritt 7 (Test)**: Manuelle Tests durchführen.
