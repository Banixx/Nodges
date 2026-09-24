# Dokumentation Visual Mapping in Nodges

Dieses Dokument beschreibt die Architektur und den Datenfluss des Visual Mappings im Nodges-Projekt. Das System erlaubt es, Datenattribute von Knoten und Kanten dynamisch in visuelle Eigenschaften in der 3D-Szene zu übersetzen.

## Architektur und Datenfluss

Der Datenfluss verläuft unidirektional und reaktiv. Bei Änderungen in der Benutzeroberfläche wird die Szene automatisch aktualisiert.

Das zugehörige Mermaid-Diagramm befindet sich in `C:/Users/ich/Desktop/code/_projects/Nodges/visual_mapping_architecture.mmd`.

### Komponentenbeschreibungen

#### 1. VisualMappingPanel (Benutzeroberfläche)
* **Datei**: `C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/VisualMappingPanel.ts`
* **Beschreibung**: Rendert die Steuerungselemente im "Mappings"-Tab. Der Benutzer kann hier das Quellfeld (`Source Field`), die Mapping-Funktion (`Function`) und den Ausgabebereich (`Range` mit Min/Max) für die Eigenschaften (Größe, Farbe etc.) der Knoten und Kanten eingeben. Bei Änderungen wird das `onUpdate`-Callback aufgerufen.

#### 2. UIManager (UI-Manager)
* **Datei**: `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/UIManager.ts`
* **Beschreibung**: Verwaltet die UI-Panels und stellt die Verbindung zwischen dem Panel und der Hauptanwendung her. Er bindet die Daten an das `VisualMappingPanel (Benutzeroberfläche)` und leitet Änderungen über `updateVisualMappings` an die Hauptanwendung weiter.

#### 3. App (Hauptanwendung)
* **Datei**: `C:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts`
* **Beschreibung**: Dient als zentraler Controller. Empfängt neue Mappings, aktualisiert diese in der Datenstruktur des Graphen (`currentGraphData.visualMappings`) und triggert den Aktualisierungsprozess in den Managern (`updateNodes` und `updateEdges`).

#### 4. VisualMappingEngine (Mapping-Engine)
* **Datei**: `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/VisualMappingEngine.ts`
* **Beschreibung**: Führt die mathematischen Transformationen durch. Sie liest die Datenwerte der Knoten oder Kanten aus, normalisiert sie anhand des `domain`-Bereichs und berechnet mithilfe der Mapping-Funktion (z.B. linear, exponentiell, logarithmisch, pulse) die finalen visuellen Eigenschaften wie Größe, Farbe, Transparenz und Kantenkrümmung.

#### 5. NodeManager (Knoten-Manager)
* **Datei**: `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/NodeManager.ts`
* **Beschreibung**: Zuständig für die Erstellung und Aktualisierung der 3D-Knotenobjekte. Er fragt bei der `VisualMappingEngine (Mapping-Engine)` die berechneten Werte ab und wendet diese auf die jeweiligen Three.js-Geometrien und -Materialien der Knoten an.

#### 6. EdgeObjectsManager (Kanten-Manager)
* **Datei**: `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/EdgeObjectsManager.ts`
* **Beschreibung**: Zuständig für die Erstellung und Aktualisierung der 3D-Kantenobjekte (Linien oder Röhren). Er fragt bei der `VisualMappingEngine (Mapping-Engine)` die berechneten Werte ab und aktualisiert Kanten-Dicke, Farbe, Krümmung, Transparenz und Animationen.

#### 7. ThreeJS_Szene (Three.js 3D-Szene)
* **Beschreibung**: Die WebGL-Umgebung, in der die aktualisierten Meshes der Knoten und Kanten dargestellt werden. Hier sieht der Benutzer die direkte Auswirkung der Mapping-Änderungen.
