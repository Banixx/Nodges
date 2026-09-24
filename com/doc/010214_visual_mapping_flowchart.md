# Ablaufdiagramm: VisualMappingEngine & applyMapping

Dieses Dokument beschreibt den Daten- und Steuerungsfluss der `VisualMappingEngine` mit der zentralen Methode `applyMapping` sowie den davor, daneben und danach geschalteten Komponenten.

## Mermaid Flowchart

```mermaid
flowchart TD
    subgraph DAVOR["Davor: Datenaufbereitung & Steuerdaten"]
        DP["DataParser / BuildFormatUtils\n(Parsing & Presets)"]
        SM["StateManager\n(GraphData, DataModel, Mappings)"]
        UI["MappingUI / UIManager\n(Benutzer-Konfiguration)"]
        NM_TRIGGER["NodeManager / EdgeObjectsManager\n(Trigger Update)"]
    end

    subgraph DANEBEN["Daneben: Nebensysteme & Parameter"]
        LM["LayoutManager\n(3D-Krafte-Layouts)"]
        PM["PerformanceMonitor\n(Qualitaet & Detailgrad)"]
    end

    subgraph ENGINE["Hauptkomponente: VisualMappingEngine"]
        VME["VisualMappingEngine\n(Klasse)"]
        ATE["applyToEntity(entity)"]
        ATR["applyToRelationship(relationship)"]
        
        subgraph CORE_FUNC["Kernfunktion: applyMapping"]
            AM["applyMapping(mapping, data, propName)"]
            
            subgraph CONVERSION["Attribut-Auswertung & Normalisierung"]
                GET_VAL["1. Attributwert auslesen"]
                TYPE_CHECK{"2. Datentyp-Pruefung"}
                NUM_PATH["Numerischer Wert\n(Skalierung [0..100])"]
                TEXT_PATH["Text / Kategorieller Wert\n(Category Lookup / Hash)"]
                NORM_100["Skalierung auf Standardbereich 0-100"]
                MAP_TARGET["Umrechnung in Zielbereich (range/domain)"]
            end
            
            HELPERS["Hilfsfunktionen\n(mapToColor, mapToGeometry, mapToAnimation)"]
        end
    end

    subgraph DANACH["Danach: 3D-Objekt-Erstellung & Rendering"]
        THREE_NODE["NodeManager: Three.js Mesh / InstancedMesh\n(Position, Size, Material-Farbe, Glow)"]
        THREE_EDGE["EdgeObjectsManager: Three.js TubeGeometry\n(Thickness, Opacity, Curvature)"]
        LABELS["NodeLabelManager / EdgeLabelManager\n(Text-Labels)"]
        RENDER["Three.js Scene & Canvas Renderer\n(Finale 3D-Visualisierung)"]
    end

    %% Verbindungen Davor -> Engine
    DP --> SM
    UI --> SM
    SM --> VME
    NM_TRIGGER --> ATE
    NM_TRIGGER --> ATR

    %% Verbindungen Engine-Intern
    VME --> ATE
    VME --> ATR
    ATE --> AM
    ATR --> AM

    AM --> GET_VAL
    GET_VAL --> TYPE_CHECK
    TYPE_CHECK -- "Zahl" --> NUM_PATH
    TYPE_CHECK -- "Text" --> TEXT_PATH
    TEXT_PATH --> NORM_100
    NUM_PATH --> NORM_100
    NORM_100 --> MAP_TARGET
    MAP_TARGET --> HELPERS

    %% Verbindungen Daneben
    LM <--> VME
    PM --> NM_TRIGGER

    %% Verbindungen Engine -> Danach
    HELPERS --> THREE_NODE
    HELPERS --> THREE_EDGE
    THREE_NODE --> LABELS
    THREE_EDGE --> LABELS
    THREE_NODE --> RENDER
    THREE_EDGE --> RENDER
    LABELS --> RENDER
```

## Erlaeuterung der Abschnitte

1. **Davor**:
   - `DataParser` & `BuildFormatUtils`: Verarbeiten die Eingabedaten.
   - `StateManager`: Verwalter von Datenschema, Mappings und Einstellungen.
   - `MappingUI`: Die Benutzerschnittstelle im Mapping-Panel.
   - `NodeManager` / `EdgeObjectsManager`: Linsen den Render-Vorgang aus.

2. **Hauptkomponente (VisualMappingEngine & applyMapping)**:
   - `VisualMappingEngine`: Steuert die Anwendung aller Mappings.
   - `applyToEntity` / `applyToRelationship`: Wenden Presets auf einzelne Knoten/Kanten an.
   - `applyMapping`: Auswertung des Attributs. Rechnet sowohl numerische Werte als auch Text-Attribute in den Wertebereich `0..100` um und berechnet daraus den Zielparameter.

3. **Daneben**:
   - `LayoutManager`: Beruecksichtigt Mappings fuer Physik & Raumverteilung.
   - `PerformanceMonitor`: Steuert Skalierungsfaktoren und Detailstufen.

4. **Danach**:
   - `NodeManager` & `EdgeObjectsManager`: Wenden die berechneten Parameter auf Three.js Geometrien und Materialien an.
   - `NodeLabelManager` & `EdgeLabelManager`: Positionieren die Textbeschriftungen.
   - `Three.js Canvas Renderer`: Rendert das finale 3D-Ergebnis auf dem Bildschirm.
