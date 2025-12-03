# Architektur-Diagramme

## 3.1 Laden von JSON-Daten

```mermaid
sequenceDiagram
    participant User
    participant UIManager
    participant App
    participant Fetch API
    participant DataParser
    participant VisualMappingEngine
    participant ObjectManagers
    participant LayoutManager

    User->>UIManager: Klickt auf Datei (z.B. "small.json")
    UIManager->>App: loadData("data/small.json")
    App->>App: clearScene()
    App->>App: State Reset
    App->>Fetch API: fetch(url)
    Fetch API-->>App: Raw JSON Data
    App->>DataParser: parse(rawData)
    DataParser-->>App: GraphData (Normalized)
    
    opt Visual Mappings
        App->>VisualMappingEngine: setVisualMappings()
    end

    App->>App: Convert to Legacy Format (Nodes/Edges)
    
    par Create 3D Objects
        App->>ObjectManagers: createNodes()
        App->>ObjectManagers: createEdges()
    end

    alt No Positions Defined
        App->>LayoutManager: applyLayout('force-directed')
        LayoutManager-->>App: Updated Positions
        App->>ObjectManagers: updateNodePositions()
    end

    App->>UIManager: updateFileInfo()
    App->>App: fitCameraToScene()
```

## 3.2 State Management Fluss

```mermaid
graph TD
    UserInteraction[User Interaction (Click/Hover)] --> InteractionManager
    InteractionManager -->|update({ selectedObject: obj })| StateManager
    
    subgraph StateManager
        State[State Object]
        Notify[Notify Subscribers]
    end
    
    StateManager -->|State Change| Notify
    
    Notify -->|'highlight'| HighlightManager
    Notify -->|'ui'| UIManager
    Notify -->|'default'| OtherComponents
    
    HighlightManager -->|Update Materials| Scene[3D Scene]
    UIManager -->|Update DOM| DOM[HTML UI]
```
