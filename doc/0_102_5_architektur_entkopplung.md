# Architektur-Entkopplung (Build 5 Abschluss)

## 1. Zielsetzung und Risikoanalyse
Basierend auf den Erkenntnissen der vorherigen Risikoanalysen (Build 5 Projektanalyse) bestand eines der größten Architektur-Risiken in der Vermischung von reinem Datenmodell (Ontologie, Business Logic) und der visuellen Repräsentation (Three.js Rendering). 
Das Kernkonzept von Build 5 erfordert eine strikte und finale Entkopplung dieser Bereiche: **Das Datenmodell darf keine Design-Informationen enthalten, und die Rendering-Engine darf keine Layouts erfinden, die nicht durch das `VisualMappingEngine` explizit definiert wurden.**

Dieser Abschluss dokumentiert die finalen Code-Bereinigungen zur Herstellung dieser strikten konzeptionellen Trennung.

## 2. Anpassungen in der VisualMappingEngine
Die `VisualMappingEngine` (`src/core/VisualMappingEngine.ts`) hatte in Build 5 noch Überbleibsel aus der alten `MappingUI` Architektur. 

*   **Der Fehler:** Die Methode `getEffectivePreset()` ignorierte die dynamisch durch das LLM generierten typspezifischen Presets (z.B. `<TypName>` wie "Person" oder "Company"). Stattdessen suchte sie primär nach `global_node` und `global_edge`, wodurch alle Knoten fälschlicherweise gleich aussehen konnten.
*   **Die Lösung:** `getEffectivePreset(isNode: boolean, type?: string)` wurde so erweitert, dass der Entitätstyp (z. B. `entity.type`) explizit ausgelesen wird. Typspezifische Presets überschreiben nun korrekt die globalen Default-Einstellungen (`global_node`/`global_edge`). 

## 3. Entfernung von Legacy-Data-Overrides im EdgeObjectsManager
Die Render-Klasse für Kanten (`src/core/EdgeObjectsManager.ts`) enthielt noch direkten Legacy-Code für die visuelle Ableitung aus den Rohdaten.

*   **Der Fehler:** Es existierte eine Fallback-Logik, die visuelle Attribute wie Farbe (`edgeData.color`) und Animationen (`edgeData.pulse`) direkt aus dem JSON-Datenmodell auslas, wenn die MappingEngine den Standardwert (`#b498db` bzw. `0xb498db`) zurückgab. Das verletzte das Entkopplungs-Paradigma, da das JSON-Datenobjekt keine `color` oder `pulse` Eigenschaften mehr diktieren darf.
*   **Die Lösung:** Die direkten Daten-Overrides wurden restlos gelöscht. Kanten beziehen ihre Farbe und ihr Animations-Verhalten jetzt *ausschließlich* aus den von der `VisualMappingEngine` aufgelösten Presets.

## 4. Fazit
Durch diese Code-Bereinigung ist die "Typ-Dominanz" aus den alten Builds endgültig aufgelöst. Die LLM-Pipeline kann nun ein reines strukturelles Datenmodell erzeugen, welches unabhängig von der `MappingUI` existiert. Alle Visualisierungsentscheidungen (Größe, Farbe, Physik, Form) erfolgen ausschließlich über die getrennten Layout- und Mapping-Schichten (die Presets im `visualMappings`-Knoten). Das Risiko von stillen UI-Bugs durch undokumentierte Daten-Overrides im Rendering ist damit beseitigt.
