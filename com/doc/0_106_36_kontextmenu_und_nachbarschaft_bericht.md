# Ergebnisbericht: Kontextmenue-Ausbau, Modus-Betitelung und dynamisches Nachladen von Nachbarschaftsebenen

> **Version:** 0.106.36 | **Harness:** conT (Windows 11 / Antigravity) | **Datum:** 2026-10-01  
> **Status:** ERLEDIGT | **Ablage:** `W:/com/doc/0_106_36_kontextmenu_und_nachbarschaft_bericht.md`

---

## 1. Uebersicht & Zielsetzung

Gemaess Benutzeranweisung vom 2026-10-01 wurden folgende Anforderungen im Frontend und 3D-Canvas umgesetzt:
1. **Modus-Betitelung des Kontextmenues:** Das Kontextmenue zeigt dynamisch im Header an, in welchem Komplexitaetsmodus gearbeitet wird (`Einfach`, `Experte`, `Entwickler`) inklusive farblich differenziertem Badge.
2. **Kontextsensitiver Ausbau der Menuepunkte:** Die angebotenen Menuepunkte wurden sorgfaeltig nach Kontext (einzelner Knoten, einzelne Kante, Mehrfachauswahl oder freier 3D-Canvas) und aktivem Modus gefiltert.
3. **Abschaltbare dynamische Nachbarschafts-Expansion:**
   - Einbindung des Flags `dynamicNeighborExpansionEnabled` im `StateManager`.
   - Schalter im Kontextmenue zur bequemen Aktivierung/Deaktivierung.
   - 1-Hop-Nachladefunktion fuer Knoten ueber das lokale LightRAG-Backend (`LightRAGService.queryGraphBuild14`) mit automatischem Mergen neuer Knoten und Kanten ohne Duplikate via `StateManager.mergeGraphData`.
4. **End-to-End-Testabsicherung:** Erstellung der Playwright E2E-Testsuite `e2e/05-document-upload.spec.ts` fuer den Dokumenten-Upload im Create-Panel und die Canvas-Kontextmenue-Interaktion.

---

## 2. Technische Umsetzung im Detail

### 2.1 Kontextmenue-Komponente (`src/ui/ContextMenu.ts` & `src/styles/main.css`)
- **Header-Struktur:** Das Menue verfuegt ueber ein flexibles Header-Element (`.context-menu-header`), bestehend aus:
  - `title`: Kontextspezifischer Titel (z.B. `Knoten: Albert Einstein`, `Kante: Paris → Frankreich`, `Mehrfachauswahl (3 Objekte)`, `3D-Canvas`).
  - `modeBadge`: Farbcodiertes Label fuer den aktiven Modus (`.mode-simple` gruen, `.mode-expert` orange, `.mode-dev` rot).
  - `subtitle`: Kontextuelle Zusatzinformationen (z.B. Entitaetstyp, Anzahl Verbindungen, Kantenrelation und Gewicht).
- **Styling-Erweiterungen:**
  - `.context-menu-separator`: Subtile horizontale Trennlinien zur logischen Gruppierung von Ansicht-, Editier-, Dev- und Loesch-Aktionen.
  - `.context-menu-item.danger`: Rote Signalfarbe fuer irreversible Loeschaktionen.
  - `.context-menu-item.toggle-active`: Gruenes Haekchen fuer aktive Schalter.
  - `.context-menu-item-badge`: Dezente Kennzeichnung von Backend-, API- und ID-Attributen.

### 2.2 Kontextmenue-Handler (`src/core/interaction/ContextMenuHandler.ts`)
- **Knoten-Aktionen:**
  - `Zentrieren & Fokussieren`: Richtet die 3D-Orbitkamera sanft auf den selektierten Knoten aus.
  - `Nachbarschaft hervorheben`: Aktiviert die selektierte Aura im `HighlightManager`.
  - `Nachbarschaft nachladen (1-Hop)`: Fragt LightRAG gezielt nach Nachbarn des Knotenlabels ab und fuegt gefundene Kanten/Knoten ein.
  - `Automatisches Nachladen`: Toggle fuer `dynamicNeighborExpansionEnabled`.
  - `Daten bearbeiten` & `Knoten verschieben`.
  - In Experte/Dev: `Duplizieren`, `Deep Dive (Wikidata / LLM)`.
  - In Dev: `Node-ID kopieren` (Clipboard) und `Rohdaten in Konsole loggen`.
  - `Knoten loeschen` (Danger).
- **Kanten-Aktionen:**
  - `Relation & Daten bearbeiten`.
  - `Quellknoten fokussieren` / `Zielknoten fokussieren`.
  - In Experte/Dev: `Richtung umkehren` (tauscht Quell- und Zielknoten in der Graph-Datenstruktur), `Kante duplizieren`.
  - `Kante loeschen` (Danger).
- **Mehrfachauswahl:**
  - `Auswahl duplizieren`, `Auswahl aufheben`, `Alle ausgewaehlten loeschen`.
- **Freier 3D-Canvas:**
  - `Neuer Knoten an Cursor-Position`.
  - `Neue Kante ziehen` (aktivierbar, sobald mindestens ein Knoten markiert ist).
  - `Ansicht einpassen (Fit to View)`: Zentriert den Gesamtgraphen.
  - `Automatisches Nachladen bei Klick` (Toggle).

### 2.3 StateManager: Daten-Merge & Undo/Redo (`src/core/StateManager.ts`)
- Implementierung von `mergeGraphData(newEntities, newRelationships, description)`:
  - Prueft bestehende Entitaeten anhand ihrer ID, um Duplikate zu verhindern.
  - Prueft bestehende Kanten anhand von Quelle, Ziel und Relation.
  - Integriert den Vorgang in den Undo/Redo-Stack von Nodges.

### 2.4 E2E- und Unit-Testabsicherung
- **Unit-Tests (`src/tests/ContextMenu.test.ts`):**
  - 6 neue Vitest-Tests fuer Header-Rendering, Modus-Umschaltung, Knoten-, Kanten-, Multi-Selektions- und Canvas-Aktionen sowie `StateManager.mergeGraphData`.
  - Gesamtergebnis: **249/249 Vitest-Tests gruen**.
- **E2E-Tests (`e2e/05-document-upload.spec.ts`):**
  - Testet den Upload von Dokumenten im `CreatePanel` (Dev-Modus, Dropzone, Dateiauswahl, Textextraktion und Statusanzeige).
  - Testet Rechtsklick-Interaktion, Header-Titel, Modus-Anzeige und Schliessen des Kontextmenues im echten Browser.
  - Gesamtergebnis: **8/8 Playwright-Tests gruen**.
- **Backend-Tests:**
  - **36/36 Pytests gruen**.

---

## 3. Pruefmatrix

| Komponente / Test | Typ | Ergebnis |
|---|---|---|
| `tsc --noEmit` | Typ-Integritaet L0 | 0 Fehler |
| `vitest run` | Unit-Tests L1 | 249 passed (20 Testsuiten) |
| `pytest tests/` | Backend-Tests L3 | 36 passed |
| `playwright test` | E2E-Tests L2 | 8 passed (Chromium Headless) |
| `knip` | Ungenutzte Dateien | 0 ungenutzte Quelldateien |
