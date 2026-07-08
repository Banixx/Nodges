# System Node: Core Architecture

```json
{
  "coreArchitecture": {
    "description": "Das Fundament des Nodges-Systems.",
    "techStack": {
      "framework": "React (Vite)",
      "language": "TypeScript",
      "rendering3D": "Three.js (@react-three/fiber)",
      "llmIntegration": "Direct Browser API Calls (OpenRouter, OpenAI, Anthropic)"
    },
    "dataPipeline": [
      {
        "step": 1,
        "module": "LLMService",
        "action": "Holt JSON-Daten vom BYOK-LLM basierend auf Prompts."
      },
      {
        "step": 2,
        "module": "DataParser",
        "action": "Validiert JSON gegen Build3/Build4 Schemas und normalisiert fehlende Werte."
      },
      {
        "step": 3,
        "module": "ScaleEngine",
        "action": "Erstellt auf Basis der Daten Domains und waehlt passende Scales."
      },
      {
        "step": 4,
        "module": "Renderer",
        "action": "Zeichnet Nodes (InstancedMesh) und Edges (Lines/Tubes) basierend auf errechneten visuellen Ranges."
      }
    ]
  }
}
```
