# Nodges System-Root (JSON)

Dieses Dokument definiert die oberste Ebene (Root-Struktur) der JSON-Repräsentation des gesamten Nodges-Systems. Die einzelnen "pending" Knoten werden in den nächsten Iterationsschritten systematisch mit den tiefgreifenden Informationen aus der Dokumentation und dem Code befüllt.

```json
{
  "nodgesSystem": {
    "version": "0.1",
    "description": "Die vollstaendige semantische und strukturelle Repraesentation der Nodges 3D-Visualisierungs-Engine. Dient als Wissensbasis und Blaupause fuer zukuenftige Agenten und LLM-Integrationen.",
    
    "coreArchitecture": {
      "status": "pending",
      "description": "Grundlagen des Datenflusses, 3D-Rendering-Pipelines (Three.js), Physik-Engine und die Trennung zwischen Daten und Darstellung."
    },
    
    "dataSchemas": {
      "status": "pending",
      "description": "Definitionen der Datenstrukturen. Umfasst Build 3 (klassisch) und Build 4 (Temporal/Geospatial) sowie die Struktur von Entities und Relationships."
    },
    
    "visualMappingEngine": {
      "status": "pending",
      "description": "Die V4-Mapping-Architektur. Beinhaltet die Logik der Scales (Continuous, Categorical, Logarithmic), Domains und Ranges sowie deren Zuweisung zu visuellen Properties (Farbe, Groesse, Position)."
    },
    
    "llmCapabilitiesAndWorkflows": {
      "status": "pending",
      "description": "Das interaktive Agentic-UI-Modell. Definiert, welche Rueckfragen das BYOK-LLM stellen kann, welche Fähigkeiten Nodges hat (z.B. Kartenhintergruende, Zeitachsen) und wie die Templates/Prompts (default, build_3, build_4) verknuepft werden."
    },
    
    "uiComponents": {
      "status": "pending",
      "description": "Die Benutzeroberflaeche. Mapping-Panels, dynamische Ebenen, Hierarchie-Darstellung und der TimePlayer fuer Build 4."
    }
  }
}
```

## Nächste Schritte
Wir können nun jeden dieser fünf Hauptknoten einzeln in Angriff nehmen, analysieren und ausformulieren. Welchen Knoten möchtest du als Erstes mit Daten befüllen? Ich empfehle `dataSchemas` oder `llmCapabilitiesAndWorkflows`, da diese aktuell sehr relevant für uns sind.
