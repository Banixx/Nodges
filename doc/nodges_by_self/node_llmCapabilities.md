# System Node: LLM Capabilities & Workflows

```json
{
  "llmCapabilitiesAndWorkflows": {
    "description": "Definiert die interaktiven Faehigkeiten des Systems und wie das externe BYOK-LLM in den Workflow integriert wird.",
    "systemCapabilities": [
      {
        "id": "temporal_playback",
        "name": "Zeitachsen-Simulation",
        "schemaRequired": "4.0",
        "triggerCondition": "Daten beinhalten zeitliche Entwicklungen, Historie oder Lebenszyklen.",
        "llmPromptSuggestion": "Moechtest du, dass ich die zeitliche Entwicklung als abspielbare Zeitleiste generiere?"
      },
      {
        "id": "geospatial_mapping",
        "name": "Geographische Karte",
        "schemaRequired": "4.0",
        "triggerCondition": "Daten haben starken geographischen Bezug (Staedte, Laender).",
        "llmPromptSuggestion": "Soll ich eine Landkarte als Hintergrund laden und die Knoten darauf platzieren?"
      },
      {
        "id": "hierarchical_layout",
        "name": "Hierarchie-Baum",
        "schemaRequired": "3.0",
        "triggerCondition": "Daten weisen strikte Ueber-/Unterordnungen auf (Stammbaum, Organigramm).",
        "llmPromptSuggestion": "Soll ich ein klassisches Top-Down Hierarchie-Layout erzwingen?"
      }
    ],
    "prompts": {
      "default": {
        "file": "/prompts/default_prompt.md",
        "schemaVersion": "3.0",
        "useCase": "Generische 3D-Graphen ohne Zeitbezug."
      },
      "build_4": {
        "file": "/prompts/build_4_prompt.md",
        "schemaVersion": "4.0",
        "useCase": "Graphen mit zeitlicher Entwicklung und/oder Raumkoordinaten auf Karten."
      }
    },
    "interactionModel": {
      "type": "Agentic_UI",
      "flow": [
        "1. User formuliert Prompt",
        "2. LLM analysiert Prompt gegenueber 'systemCapabilities'",
        "3. Optional: LLM stellt Klaerungsfragen an User (Dialog)",
        "4. LLM waehlt passendes Prompt-Template",
        "5. LLM generiert valides Nodges-JSON"
      ]
    }
  }
}
```
