# Bericht: Implementierung der Multi-Format-Unterstützung in Nodges (Multi-Build)

## 1. Zielsetzung
Die Architektur von Nodges wurde grundlegend erweitert, um künftig als versionsagnostische Visualisierungs-Engine zu fungieren. Das primäre Ziel war es, verschiedene JSON-Datenformate (insbesondere das ältere Build 1 Format, das experimentelle Build 2 Format und das neue, auf Statevektoren basierende Build 3 Format) **parallel** laden und verarbeiten zu können. Anstatt ältere Formate beim Import zwangsweise auf ein neues Standardformat zu konvertieren (Normalisierung), bleiben die JSON-Datensätze in ihrer Originalstruktur bestehen. Die Engine adaptiert sich dynamisch an das erkannte Format.

## 2. Architektonische Strategie
Der Kern der Lösung ist die Einführung einer zentralen Abstraktionsschicht: `BuildFormatUtils.ts`. 
Diese Schicht entkoppelt die visuelle Engine und das UI von den harten strukturellen Vorgaben der jeweiligen JSON-Spezifikation. Egal, ob eine Entität ihre Attribute in einem flachen Objekt hat (Build 1) oder in einem gebündelten `stateVector` speichert (Build 2/3), die restliche Applikation greift nur noch über die abstrakten Utilities auf diese Werte zu.

### 2.1 Anpassung des Zod-Schemas (`types.ts`)
Das Zod-Schema `DataModelSchema` wurde so umgeschrieben, dass es nun ein Union-Type (`z.union`) ist. Es akzeptiert:
- **Build 1**: Ein `DataModel` mit definierten `entities`- und `relationships`-Objekten.
- **Build 2/3**: Ein `DataModel`, das primär auf einer globalen `properties`-Definition basiert.

## 3. Implementierte Komponenten

### 3.1 Data Parser (`DataParser.ts`)
Der Parser führt nun in Schritt 0 eine Heuristik durch (`detectBuildVersion`), um die Version des hochgeladenen Graphen zu ermitteln. Er prüft:
- Ob alte Node/Edge-Legacy-Strukturen vorliegen (Fallback "0.0").
- Ob ein expliziter `schemaVersion`-String in den Metadaten steht.
- Ob es sich anhand des `dataModel` um Build 1 (existierende `entities`) oder Build 2/3 (existierende `properties`) handelt.
Die erkannte Version wird in `metadata._buildVersion` hinterlegt. Das Mapping und Parsing der eigentlichen Werte geschieht anschließend unter Zuhilfenahme der `BuildFormatUtils`.

### 3.2 Visual Mapping Engine (`VisualMappingEngine.ts`)
Die visuelle Engine, welche Daten in visuelle Repräsentationen (Farbe, Größe, Geometrie) umrechnet, wurde komplett refaktoriert. 
Anstatt feste Pfade wie `dataModel.entities[type].properties` abzufragen, wird nun `getPropertySchema(dataModel, type, property)` genutzt. Das Auslesen der Echtzeit-Werte geschieht via `getEntityAttributeValue`. Dies stellt sicher, dass tief verschachtelte Eigenschaften oder `stateVector`-Attribute korrekt ausgelesen werden.

### 3.3 UI-Manager und Mapping-Panel (`UIManager.ts` & `MappingUI.ts`)
- **Attribut-Erfassung**: Der `UIManager` generiert die Dropdowns der verfügbaren Attribute in der Seitenleiste nun über die `getAvailableProperties()`-Funktion der BuildFormatUtils.
- **Benutzeroberfläche**: Die Header der MappingUI wurden aktualisiert. Das Schema-Badge zeigt nun direkt die aktuelle Version an (z.B. "Build 3 | Schema: 3.0"). Der Benutzer hat damit jederzeit volle Transparenz, welches Datenmodell aktuell geladen ist.

## 4. Typsicherheit und Fehlerbehebung
Durch die Umstellung auf Union-Types (z.B. kann `dataModel` entweder `entities` oder `properties` haben) entstanden umfassende TypeScript-Fehler im gesamten Projekt, vor allem in `MappingUI.ts`, `LayoutManager.ts` und `App.ts`.
Diese wurden systematisch behoben:
- **Type-Guarding**: Überprüfungen mit dem `in`-Operator (`'entities' in dataModel`) wurden eingeführt.
- **Optionale Parameter**: Da `source` und `target` im neuen Zod-Schema optionale Strings sein können, wurden in ressourcenintensiven Modulen (wie dem `LayoutManager`) strikte Null-Checks integriert.
- Die Kompilierung (`npx tsc --noEmit`) verläuft nun erfolgreich ohne Warnungen oder Typ-Fehler.

## 5. Ausblick und Zukunftssicherheit
Mit dieser "Multi-Format"-Architektur ist das Projekt bestens für die Zukunft (z.B. einen eventuellen Build 4) gerüstet. Wenn sich das JSON-Format erneut ändert, muss lediglich:
1. Eine neue Schnittstelle in `types.ts` zum Union-Type hinzugefügt werden.
2. Ein neues `isBuild4DataModel` und eine Auslese-Logik in `BuildFormatUtils.ts` implementiert werden.
Der Rest der Applikation (Parser, Visuals, UI, Rendering) profitiert automatisch von der Abstraktionsschicht und erfordert keine tiefgreifenden Umbauten.
