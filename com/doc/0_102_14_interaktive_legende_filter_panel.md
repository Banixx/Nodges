# Konzept & Plan: Interaktives Legenden- und Filter-Panel

## 1. Zusammenfassung des recherchierten Kontexts (/such)
Aus den historischen Archiv-Logs (u.a. Session `3293ccc1-c31f-49c2-af96-ba3a7f522f75`) geht hervor, dass in Nodges ein zentraler Entkopplungsschritt ("Build 5") stattfand:
- **Globale Presets**: Das System nutzt `global_node` und `global_edge` als primäre Basis für Farben, Größen und Geometrien.
- **Visual Mappings**: Eigenschaften wie Farbe (`color`), Größe (`size`), Geometrie (`geometry`), Transparenz (`opacity`), Kantenstärke (`thickness`) etc. werden dynamisch oder kategorial auf Datenfelder gemapped.
- **Derzeitiges LegendPanel (`LegendPanel.ts`)**: Zeigt Mappings und Kategorien bereits statisch an (z.B. Farbquadrate / Swatches für Kategorien sowie Darstellungen für kontinuierliche Skalen).

## 2. Ziel des neuen interaktiven Legenden- & Filter-Panels
Das `LegendPanel` wird zu einem interaktiven Steuer- und Filterzentrum erweitert:
1. **Erklärungs-Funktion (Legende)**:
   - Klare Aufschlüsselung: Welche Farbe repräsentiert welchen Wert / welche Kategorie.
   - Erklärung von Größen-Mappings (z.B. Skalierung basierend auf einem Attribut) und Kanten-Eigenschaften.
2. **Filter- & Selektions-Funktion (Sichtbarkeit)**:
   - Jedes Legendenelement (z.B. Kategorie, Farbgruppe, Knoten-/Kantentyp) erhält interaktive Checkboxen / Umschalter (Toggle-Buttons).
   - Beim Deaktivieren einer Gruppe werden alle zugehörigen Knoten und/oder Kanten im 3D-Graph ausgeblendet (oder ausgegraut/semi-transparent geschaltet).
   - Dynamische Aktualisierung der Zähler (z.B. "Partei X (12 Knoten sichtbar / 15 gesamt)").
   - "Alle einblenden" / "Alle ausblenden" Schnellwahl-Buttons pro Bereich.

## 3. Technische Architektur & Änderungen

### StateManager Integration
- Hinzufügen eines `hiddenCategories` / `legendFilters` Status im `StateManager`:
  - `hiddenCategories: Set<string>` oder `categoryVisibility: Record<string, boolean>`
- Erweiterung von `VisualMappingEngine.ts` / `GraphRenderer.ts`:
  - Auswertung der Sichtbarkeits-Filter beim Rendern von Instanzen/Meshes der Knoten und Kanten.

### LegendPanel UI Erweiterung (`src/ui/LegendPanel.ts`)
- Erweiterung der `createLegendRow` und Kategorie-Renderschritte um interaktive Steuerelemente (Checkboxes / Eye-Icons / Filter-Swatches).
- Hinzufügen von Event-Listenern, die beim Klick den Filterstatus im `StateManager` anpassen.
- Hinzufügen von Zusammenfassungs-Headern mit "Alle auswählen / Abwählen" Steuerung.

## 4. Test- & Verifikationsplan
- Unit-Tests in Vitest für die Filter-Logik in `StateManager` / `VisualMappingEngine`.
- Manuelle Prüfung aller Interaktionen in der Vite-Entwicklungsumgebung (`npm run dev`).
