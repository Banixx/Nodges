# LLM Automapping Details

Das Automapping des LLMs steuert, wie semantische Eigenschaften von Knoten und Kanten in visuelle Repraesentationen (Farbe, Groesse, Geometrie, Position, Dicke) uebersetzt werden.

## 1. Definition in den System Prompts
Die eigentliche Logik und Anleitung fuer das LLM, wie es das `visualMappings`-Objekt generieren soll, befindet sich in den System-Prompts der jeweiligen Builds.

### Build 10 Prompt
In `C:/Users/ich/Desktop/code/_projects/Nodges/src/prompts/build_10_prompt.md`:
* **Schritt 3: Das visuelle Mapping**: Das LLM wird angewiesen, `visualMappings.defaultPresets.global_node` und `visualMappings.defaultPresets.global_edge` zu erzeugen.
* **Kanal-Regeln**:
  * **Diversitaet**: `color` und `size` muessen verschiedene semantische Properties verwenden.
  * **Globale Eindeutigkeit**: Ein Kanal darf nur durch ein einziges Property gesteuert werden.
  * **Limitierung**: Dynamische Groessen duerfen maximal das 3-fache der minimalen Groesse betragen (min: 1.0, max: 3.0). Kantendicke auf 0.03 bis 0.25 limitieren.
  * **Raeumlichkeit**: Wenn `position` generiert wird, muss diese ueber `"position": { "source": "position", "function": "linear" }` gemappt werden.
  * **Knoten**: `geometry` kategorial mappen.
  * **Kanten**: `color` kategorial auf `type` (oder `label`) mappen. Kantendicke (`thickness`) konstant oder auf `strength` mappen.

### Build 8 Mapping Prompt
In `C:/Users/ich/Desktop/code/_projects/Nodges/src/prompts/build_8_mapping_prompt.md`:
* Definiert ein Ziel-Schema, bei dem Knoten-Farbe und Geometrie kategorial auf die Eigenschaft `kategorie` gemappt werden, waehrend die Groesse standardmaessig konstant bleibt.

---

## 2. Fallback-Strukturen im Code
Im Code der Generierungspipelines sind im `LLMService.ts` feste Strukturbeispiele als Fallback fuer das LLM-Schema hinterlegt.

### Build 10 Fallback
In `C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts` unter `generateGraphDataBuild10`:
```json
  "visualMappings": {
    "defaultPresets": {
      "global_node": {
        "size": { "source": "importance", "function": "linear", "range": [0.5, 3] },
        "position": { "source": "position", "function": "constant" }
      },
      "global_edge": {
        "thickness": { "source": "strength", "function": "linear", "range": [0.1, 1.5] }
      }
    }
  }
```

### Build 6 Fallback
In `C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts` unter `generateGraphDataBuild6`:
```json
  "visualMappings": {
    "defaultPresets": {
      "global_node": {
        "size": { "source": "<propName>", "function": "linear", "range": [0.5, 3] },
        "color": { "source": "kategorie", "function": "categorical" },
        "geometry": { "source": "constant", "function": "constant", "params": { "geometry": "sphere" } },
        "position": { "source": "position", "function": "constant" }
      },
      "global_edge": {
        "color": { "source": "type", "function": "categorical" },
        "thickness": { "source": "constant", "function": "constant", "params": { "value": 0.1 } }
      }
    }
  }
```

---

## 3. UI-seitiges Auto-Mapping (Frontend)
Zusaetzlich gibt es die `SuggestionUI` in `C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/SuggestionUI.ts`. 
Diese generiert clientseitig im Browser dynamische Mapping-Vorschlaege basierend auf dem geladenen `DataModel`:
* **Categorical Properties**: Schlaegt Farbcodierung nach Kategorien vor.
* **Continuous Properties**: Schlaegt Skalierung (Groesse) und Heatmaps (Farbe) nach Zahlenwerten vor.
* **Default View**: Schlaegt neutrale blaue Knoten und weisse Kanten vor.
