# Nodges Tab-Analyse (v0.98.1.7)

> Umfassende Analyse aller 8 Sidebar-Tabs: Funktionalitaet, Ueberschneidungen, Konflikte und Code-Qualitaet.

---

## Uebersicht der Tabs

| # | Tab | Dateien | Zweck |
|---|-----|---------|-------|
| 1 | **System** | `index.html` (inline), StatsUI.ts, LegendPanel.ts | Systeminformationen, Statistiken, Legende |
| 2 | **Ebenen** | `index.html` (inline), LayersPanel.ts | Filterung/Gruppierung nach Attributen |
| 3 | **Files** | UIManager.ts (renderFilePanel) | Dateiverwaltung (laden/entfernen) |
| 4 | **Ansicht** | ViewPanel.ts, EnvironmentPanel.ts, `index.html` (Edge-Controls) | Labels, Skalierung, Farbschema, Licht, Kanten |
| 5 | **Create** | CreatePanel.ts | KI-Generierung via OpenRouter |
| 6 | **Mappings** | VisualMappingPanel.ts | Visuelle Datenzuordnungen |
| 7 | **Layout** | LayoutGUI.ts | Layout-Algorithmen und Parameter |
| 8 | **Dev** | DevPanel.ts | Performance-/Render-Testing |

---

## 1. Tab "System"

### Eintraege und Funktionalitaet

| Eintrag | Typ | Funktional? | Beschreibung |
|---------|-----|:-----------:|-------------|
| Version | Info (ro) | Ja | Zeigt `0.98.1.7` - statisch im HTML |
| Dateiname | Info (ro) | Ja | Wird via `UIManager.updateFileInfo()` gesetzt |
| Knoten-Anzahl | Info (ro) | Teilweise | `StatsUI` setzt `"Anzahl Knoten: X"` statt nur `X` - doppeltes Label |
| Kanten-Anzahl | Info (ro) | Teilweise | Gleiches Problem wie Knoten-Anzahl |
| FPS | Info (ro) | Teilweise | `StatsUI` setzt `"FPS: X"` statt nur `X` - doppeltes Label |
| Legende | Dynamisch | Ja | Via `LegendPanel.ts`, reagiert auf VisualMappings |
| Achsenbereiche (X/Y/Z) | Info (ro) | Teilweise | `StatsUI` setzt `"X-Achse: min bis max"` - wieder doppeltes Label |

### Bewertung
- **Funktionalitaet**: 70% - Grundinfo funktioniert, aber Labels werden doppelt gerendert
- **Aehnliche Werkzeuge**: FPS-Anzeige kollidiert thematisch mit dem Dev-Tab
- **Probleme**:
  - `StatsUI.ts` schreibt komplette Strings inkl. Label in `textContent`, das HTML hat aber bereits eigene Labels davor
  - Version ist 3x hardcoded: `<title>`, `#sidebarVersion`, `#fileVersion`
  - `#hmrTest` LIVE-TEST-Indikator ist ein Dev-Artefakt

---

## 2. Tab "Ebenen"

### Eintraege und Funktionalitaet

| Eintrag | Typ | Funktional? | Beschreibung |
|---------|-----|:-----------:|-------------|
| Gruppierungs-Attribut | Dropdown | Ja | Dynamisch befuellt aus Entity-Keys |
| Ebene 1-4 Toggle | Checkbox | Ja | Sichtbarkeit pro Ebene |
| Ebene 1-4 Opacity | Slider | Ja | Transparenz pro Ebene (0-1) |
| Ebene 1-4 Wert-Zuordnung | Dropdown | Ja | Welcher Attributwert auf welche Ebene |

### Bewertung
- **Funktionalitaet**: 85% - solide Grundfunktion
- **Aehnliche Werkzeuge**: Opacity-Kontrolle hier vs. Edge-Opacity im Ansicht-Tab
- **Probleme**:
  - Hardcoded auf genau 4 Ebenen - wenn Daten 5+ Kategorien haben, gehen Werte verloren
  - Inline-Styles direkt im HTML statt CSS-Klassen
  - `LayersPanel` wird mit `'tab-layers'` als Element-ID instanziiert - das ist die Container-DIV-ID

---

## 3. Tab "Files"

### Eintraege und Funktionalitaet

| Eintrag | Typ | Funktional? | Beschreibung |
|---------|-----|:-----------:|-------------|
| Geladene Dateien | Liste | Ja | Zeigt aktiv geladene Dateien mit Entfernen-Button |
| Verfuegbare Dateien | Liste | Ja | Zeigt JSON-Dateien aus `public/data/` |
| + Button (Hinzufuegen) | Button | Teilweise | Append-Modus zum Zusammenfuehren |
| + Button (Header) | Button | Nein | Loggt nur `"Main add button clicked"` - keine Funktion |

### Bewertung
- **Funktionalitaet**: 75% - Laden/Entfernen funktioniert, aber Upload fehlt
- **Probleme**:
  - `addFileBtn` im Header hat keine Funktion (nur `console.log`)
  - `createFileButtons()` ist als deprecated markiert, aber noch vorhanden - toter Code
  - Kein Datei-Upload-Dialog (Drag & Drop oder File-Picker) vorhanden

---

## 4. Tab "Ansicht"

Dieser Tab ist der komplexeste - er besteht aus **3 separaten Quellen**:

### 4a. Umgebung (EnvironmentPanel.ts)

| Eintrag | Typ | Funktional? | Beschreibung |
|---------|-----|:-----------:|-------------|
| Ambient Light | Slider (0-2) | Ja | Steuert globale Beleuchtung |
| Directional Light | Slider (0-2) | Ja | Steuert gerichtete Beleuchtung |

### 4b. Darstellungsoptionen (ViewPanel.ts)

| Eintrag | Typ | Funktional? | Beschreibung |
|---------|-----|:-----------:|-------------|
| Namen immer anzeigen | Checkbox | Ja | Label-Sichtbarkeit |
| Namen bei Hover | Checkbox | Ja | Label bei Mouse-Over |
| Werte-Daempfung | Slider (0.1-1.0) | Ja | Exponent fuer Groessenberechnung |
| Globale Skalierung | Slider (0.1-5.0) | Ja | Multiplikator fuer Knotengroessen |
| Auto-Balancing | Checkbox | Ja | Automatisch beim Laden |
| Koordinaten normalisieren | Checkbox | Ja | State-Flag gesetzt, aber nie konsumiert |
| Balance optimieren | Button | Ja | Ruft `app.applyVisualBalance()` |
| Farbschema | Swatch-Grid | Ja | 5 Presets, aendert CSS-Variablen + 3D-Hintergrund |

### 4c. Kanten & Darstellung (index.html, UIManager.ts)

| Eintrag | Typ | Funktional? | Beschreibung |
|---------|-----|:-----------:|-------------|
| Edge Thickness | Slider | Ja | Kantenstaerke |
| Highlight Effects | Checkbox | Ja | Highlight an/aus |
| Highlight Size | Slider | Ja | Prozentuale Vergroesserung |
| Selection Bonus | Slider | Ja | Zusatz bei Selektion |
| Curve Segments | Slider | Ja | Aufloesung der Kurven |
| Tube Facets | Slider | Ja | Radiale Segmente der Tubes |
| Drop Out (Curvature) | Slider | Ja | Logarithmische Kruemmung |
| Pulse Speed | Slider | Ja | Animationsgeschwindigkeit |
| Anim Mode | Dropdown | Ja | 4 Modi: Pulse/Sequential/Flow/Segments |
| Opacity | Slider | Ja | Globale Kanten-Transparenz |
| Reset Edge Controls | Button | Ja | Setzt alles auf Defaults |

### Bewertung
- **Funktionalitaet**: 90% - umfangreichste Tab-Sektion, gut verdrahtet
- **Probleme**:
  - **3 verschiedene Datenquellen** in einem Tab: HTML-Inline, ViewPanel.ts, EnvironmentPanel.ts
  - Kanten-Sektion ist komplett in `index.html` hardcoded, waehrend Umgebung und Darstellung dynamisch gerendert werden
  - `highlightToggleSlider`/`highlightToggleButton` werden in `updateHighlightToggleVisuals()` referenziert, existieren aber nicht im HTML - toter Code
  - `normalizeCoordinatesEnabled` wird im State gesetzt, aber nirgends konsumiert

---

## 5. Tab "Create"

### Eintraege und Funktionalitaet

| Eintrag | Typ | Funktional? | Beschreibung |
|---------|-----|:-----------:|-------------|
| API Key Input | Password-Feld | Ja | LocalStorage-basiert (BYOK) |
| Key Speichern | Button | Ja | Speichert/loescht Key |
| Prompt Textarea | Textarea | Ja | Freitext fuer KI-Generierung |
| Generieren & Hinzufuegen | Button | Ja | Ruft `LLMService.generateGraphData()` |
| Status-Anzeige | Div | Ja | Feedback mit Farbcodes |

### Bewertung
- **Funktionalitaet**: 85% - vollstaendiger Workflow
- **Probleme**:
  - `updateUI()` Methode ist leer - Subscriber wird registriert, aber nie genutzt (toter Code)

---

## 6. Tab "Mappings"

### Eintraege und Funktionalitaet

| Eintrag | Typ | Funktional? | Beschreibung |
|---------|-----|:-----------:|-------------|
| Source Field | Text-Input | Ja | Quell-Attribut fuer Mapping |
| Function | Dropdown | Ja | 7 Mapping-Funktionen |
| Range (Min/Max) | Number-Inputs | Ja | Wertebereich fuer numerische Mappings |

### Bewertung
- **Funktionalitaet**: 70% - Grundstruktur vorhanden, aber wenig User-Guidance
- **Probleme**:
  - Kein "Neues Mapping hinzufuegen" und kein Loeschen moeglich
  - `VisualMappingPanel` hat **keinen StateManager-Zugriff** - kommuniziert nur via Callback (einziges Panel ohne StateManager)
  - Hardcoded Inline-Styles statt CSS-Klassen

---

## 7. Tab "Layout"

### Eintraege und Funktionalitaet

| Eintrag | Typ | Funktional? | Beschreibung |
|---------|-----|:-----------:|-------------|
| Layout-Engine Toggle | Checkbox | Ja | Aktiviert/deaktiviert Layout |
| Layout-Algorithmus | Dropdown | Ja | 8 Algorithmen verfuegbar |
| Parameter-Slider | Dynamisch | Ja | Pro Algorithmus verschiedene Parameter |
| Geschwindigkeit (ms) | Slider | Ja | Animationsdauer 500-5000ms |
| Presets | Dropdown | Ja | 5 vordefinierte Konfigurationen |
| Anwenden / Stop | Buttons | Ja | Layout starten/stoppen |

### Bewertung
- **Funktionalitaet**: 90% - vollstaendig und gut durchdacht
- **Probleme**:
  - `LayoutGUI` liegt in `src/utils/` statt `src/ui/`
  - Legacy Floating-Panel-Code noch vorhanden (~100 Zeilen)
  - `layoutEnabled` wird dreifach verwaltet: LayoutGUI, App.ts, StateManager

---

## 8. Tab "Dev"

### Eintraege und Funktionalitaet

| Eintrag | Typ | Funktional? | Beschreibung |
|---------|-----|:-----------:|-------------|
| Active GPU | Info (ro) | Ja | Liest WebGL Debug-Info aus |
| Power Preference | Dropdown | Ja | high-performance/low-power/default |
| Render Mode | Tri-State Toggle | Ja | Mesh/Auto/Instance |
| Pixel Ratio Multiplier | Slider | Ja | Aufloesungsskalierung |
| FPS Limit | Slider | Ja | Frame-Rate-Begrenzung |
| Apply & Recreate Canvas | Button | Ja | Erstellt WebGL-Context neu |

### Bewertung
- **Funktionalitaet**: 85%
- **Probleme**:
  - Tri-State Toggle komplett mit Inline-Styles (>20 Zeilen im JS)
  - Render Mode "Auto" setzt sofort `activeRenderMode: 'mesh'` - Auto-Logik nicht implementiert

---

## Querschnitts-Analyse

### Doppellaeufigkeiten

| Problem | Betroffene Tabs | Schwere |
|---------|----------------|:-------:|
| **Opacity-Kontrolle** doppelt: Edge-Opacity (Ansicht) vs. Layer-Opacity (Ebenen) | Ansicht, Ebenen | Mittel |
| **FPS-Anzeige** in System-Tab und thematisch im Dev-Tab | System, Dev | Gering |
| **layoutEnabled** dreifach verwaltet | Layout | Hoch |
| **Version** 3x hardcoded im HTML | System | Gering |

### Technische Konflikte

| Konflikt | Schwere |
|----------|:-------:|
| **StatsUI doppelte Labels** - `updateFps()` setzt "FPS: X", HTML hat bereits "FPS:" davor | Hoch |
| **normalizeCoordinatesEnabled** - State-Flag wird gesetzt, aber nirgends konsumiert | Mittel |
| **highlightToggleSlider/Button** - Referenziert in UIManager, existiert nicht im DOM | Mittel |
| **Auto-Render-Mode** - "Auto" soll dynamisch switchen, setzt aber sofort auf "mesh" | Mittel |

### Verwaister und veralteter Code

| Fund | Datei | Typ |
|------|-------|-----|
| `NodeManager.ts.bak` | src/core/ | Backup-Datei |
| `createFileButtons()` deprecated | UIManager.ts:470 | Toter Code |
| `updateEdgeThickness()` leer | UIManager.ts:791 | Toter Code |
| `CreatePanel.updateUI()` leer | CreatePanel.ts:220 | Toter Code |
| `ToolsUI` - Toolbar existiert nicht im DOM | ToolsUI.ts | Verwaist |
| `ui/components/` leeres Verzeichnis | src/ui/components/ | Verwaist |
| Legacy Floating-Panel-Code | LayoutGUI.ts:190-242 | ~100 Zeilen Legacy |
| `#hmrTest` LIVE-TEST Indikator | index.html:22 | Dev-Artefakt |
| Kommentierte `edgeObjectsManager`-Zuweisung | CentralEventManager.ts:36 | Auskommentiert |

### Architektur-Inkonsistenzen

| Problem | Details |
|---------|---------|
| Ansicht-Tab mischt 3 Rendering-Quellen | HTML-Inline + ViewPanel.ts + EnvironmentPanel.ts |
| LayoutGUI in utils/ statt ui/ | Inkonsistente Verzeichnisstruktur |
| VisualMappingPanel ohne StateManager | Einziges Panel das nur via Callback kommuniziert |
| Massiv Inline-Styles | Ebenen-Tab, Mappings-Tab, DevPanel |
| Sprach-Mix | "Transparenz" vs. "Edge Thickness", "Highlight Size" |

---

## Empfohlene Massnahmen (Prioritaet)

### Hoch
1. **StatsUI Label-Bug fixen** - nur Werte setzen, nicht den gesamten String
2. **layoutEnabled-State vereinheitlichen** - nur StateManager als Source of Truth
3. **normalizeCoordinatesEnabled** implementieren oder entfernen

### Mittel
4. **Ansicht-Tab aufteilen** - Edge-Controls in eigenes `EdgePanel.ts` auslagern
5. **Legacy Floating-Panel-Code** aus LayoutGUI entfernen
6. **LayoutGUI nach src/ui/ verschieben**
7. **Toter Code entfernen**: `createFileButtons()`, `updateEdgeThickness()`, `CreatePanel.updateUI()`
8. **NodeManager.ts.bak und leeres components/ loeschen**

### Gering
9. Sprache vereinheitlichen (durchgehend Deutsch oder Englisch)
10. Inline-Styles durch CSS-Klassen ersetzen
11. Ebenen-System dynamisch machen (nicht auf 4 limitiert)
12. `addFileBtn` im Files-Tab implementieren oder entfernen
