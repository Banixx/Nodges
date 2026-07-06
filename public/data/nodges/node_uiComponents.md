# System Node: UI Components

```json
{
  "uiComponents": {
    "description": "Die Benutzeroberflaechen-Module von Nodges, die dem User Interaktion und Analyse ermoeglichen.",
    "panels": {
      "mappingPanel": {
        "role": "Hauptwerkzeug zur Steuerung der VisualMappingEngine.",
        "features": [
          "Hierarchische Darstellung von Attributen.",
          "Zuweisung von Scales an visuelle Properties (Farbe, Groesse).",
          "Visuelles Feedback (Border-Highlight) bei aktiven Mappings."
        ]
      },
      "suggestionPanel": {
        "role": "Agentisches Assistenz-Panel.",
        "features": [
          "Beobachtet User-Interaktionen.",
          "Schlaegt sinnvolle Layout- oder Mapping-Aenderungen vor."
        ]
      },
      "timePlayerUI": {
        "role": "Steuerung der temporalen Dimension (Build 4).",
        "features": [
          "Play/Pause/Scrubbing ueber eine Zeitachse.",
          "Interpoliert Keyframes von Entities in Echtzeit."
        ]
      }
    },
    "interactionModes": {
      "selection": "Einzel- oder Mehrfachauswahl (Gruppenbildung) von Nodes.",
      "camera": "OrbitControls, Panning, Zoom in der 3D-Szene.",
      "inspection": "Hover/Klick oeffnet ein Popup mit allen Rohdaten (Domain) der Entity."
    }
  }
}
```
