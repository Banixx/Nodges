# Nodges – UI-Komponenten

## 1. Layout und Sidebar

`index.html` definiert die SPA-Struktur mit einer linken **Sidebar** (`#mainSidebar`) mit Tab-Navigation und Tabs:

- **System** (simple), **Ebenen** (expert), **Files** (simple), **Ansicht** (simple), **Create** (dev), **Dev** (dev).
- Tabs sind datenattribut-gesteuert (`data-tab`, `data-min-mode`) – der Modus `complexityMode` (`simple`/`expert`/`dev`) blendet Tabs/Inhalte passend ein/aus.
- `#minimapContainer` und `#suggestionContainer` sind als Overlays im Layout verankert.

## 2. UI-Komponenten unter `src/ui/`

| Datei | Funktion |
|-------|----------|
| `ContextMenu.ts` | Kontextmenü bei Rechtsklick |
| `CreatePanel.ts` | Panel zum Erstellen/Generieren von Graphen (2313 Zeilen) |
| `DataEditor.ts` | Bearbeiten von Daten |
| `DevPanel.ts` | Entwickler-Settings (Renderer-Neubau, Pixel-Ratio, FPS-Limit) |
| `EdgeControlsUI.ts` | Steuerung der Kantenvisualisierung |
| `EnvironmentPanel.ts` | Hintergrund/Beleuchtung/Farbschema |
| `FilePanelUI.ts` | Datei-/Datenbankverwaltung (971 Zeilen) |
| `HoverInfoPanel.ts` | Tooltip bei Hover (intelligent positioniert) |
| `InfoPanelUI.ts` | Info-Panel |
| `LegendPanel.ts` | Legende der visuellen Mappings |
| `MappingUI.ts` | Visuelles-Mapping-Bedienpanel (2850 Zeilen) |
| `MinimapUI.ts` | Minimap (Canvas, Zoom/Pan) |
| `StatsUI.ts` | Statistik-Anzeige |
| `SuggestionUI.ts` | Vorschläge für Visual-Mappings (mit Preview/Takeover) |
| `TimePlayerUI.ts` | Zeit-/Playback-Steuerung (4D) |
| `ViewPanel.ts` | Ansicht steuern (734 Zeilen) |

## 3. MappingUI – visuelles Mapping

`MappingUI.ts` ist die größte UI-Komponente (2850 Zeilen). Sie:
- Bindet aktive Mappings, verfügbare Attribute, Datenmodell, Entitäten/Relationen und Original-Mappings.
- Erlaubt das Zuordnen von Datenfeldern auf visuelle Eigenschaften.
- Nutzt einen Layout-Callback, um bei Physik-/Algo-Mappings das Layout automatisch zu triggern.
- Unterstützt Preview (temporär) und Takeover (permanent).

## 4. CreatePanel – Graphen erstellen

`CreatePanel.ts` (2313 Zeilen) bietet Werkzeuge zum manuellen oder generierten Erstellen von Knoten/Kanten und zur KI-Graphgenerierung (in Verbindung mit den `src/prompts/*`).

## 5. SuggestionUI – KI-Vorschläge

- Bindet Datenmodell und Original-Mappings.
- Bietet Preview (temporär auf Engine setzen, `nodeManager.updateNodes`/`edgeObjectsManager.updateEdges`) und Takeover (`updateVisualMappings`).

## 6. UIManager

`src/core/UIManager.ts` orchestriert die Panels, verwaltet Tab-Zustände, File-Info, FPS-Anzeige und reicht Visual-Mappings an die UI weiter.

## 7. Benachrichtigungen und Fehler

- **NotificationService** (Singleton) rendert sichtbare Toasts (max. 5 gleichzeitig).
- **ErrorHandler** kategorisiert Fehler und erzeugt Nutzer-Meldungen.

## 8. Bewertung

**Positiv:**
- Klare Panel-Trennung und Overlay-Struktur.
- Modusabhängiges UI (`complexityMode`) passt das Interface an Nutzungsgrad an.
- KI-Vorschläge mit Preview/Takeover sind gut benutzbar integriert.

**Schwächen:**
- `MappingUI` und `CreatePanel` sind sehr große, monolithische Dateien (2800/2300 Zeilen) – schwer zu warten und zu testen.
- UI-Komponenten greifen teils direkt auf `window.app`/globale Zustände zu (Kopplung an `App`).
- Suche/Filtern und Panel-Logik sind stark an `StateManager`-Flachfelder gebunden (nicht typsicher).

---

*Weiter: `/workspace/com/doc/11_llm_und_backend_nodges_V4.md`.*
