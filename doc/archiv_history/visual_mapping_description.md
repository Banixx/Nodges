# Visual Mapping Datenfluss

Das Diagramm in der Datei visual_mapping_flow.mmd beschreibt den Datenfluss des Visual Mappings.

VisualMappingPanel --> UIManager --> App --> VisualMappingEngine und StateManager
App --> NodeManager und EdgeObjectsManager --> VisualMappingEngine --> Normalisierung --> Visuelle Eigenschaften --> ThreeJS Meshes

## Details zum Ablauf

* Das VisualMappingPanel nimmt die Eingaben des Benutzers entgegen.
* Bei einer Aenderung wird der UIManager benachrichtigt.
* Die App empfaengt die neuen Werte und leitet sie an die VisualMappingEngine weiter.
* Der StateManager wird ueber die Aenderung informiert.
* NodeManager und EdgeObjectsManager aktualisieren die Knoten und Kanten durch Aufruf der VisualMappingEngine.
* Die VisualMappingEngine berechnet die neuen Groessen und Farben.
* Die ThreeJS Meshes werden in der Szene neu gezeichnet.
