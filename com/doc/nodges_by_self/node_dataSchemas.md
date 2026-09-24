# System Node: Data Schemas

```json
{
  "dataSchemas": {
    "description": "Definition der unterstuetzten JSON-Strukturen, die von Nodges gelesen werden koennen.",
    "build_3": {
      "version": "3.0",
      "features": ["nodes", "edges", "continuous_properties", "categorical_properties"],
      "entityStructure": {
        "id": "string (unique)",
        "type": "string",
        "label": "string",
        "position": { "x": "number", "y": "number", "z": "number" },
        "[dynamic_properties]": "string | number | boolean"
      },
      "relationshipStructure": {
        "id": "string (unique)",
        "type": "string",
        "source": "string (entity_id)",
        "target": "string (entity_id)"
      }
    },
    "build_4": {
      "version": "4.0",
      "extends": "build_3",
      "features": ["temporal_data", "geospatial_map", "start_end_alias"],
      "metadataAdditions": {
        "map": {
          "image": "string (path in /public)",
          "referenceWidth": "number",
          "referenceHeight": "number"
        }
      },
      "entityAdditions": {
        "mapX": "number (optional)",
        "mapY": "number (optional)",
        "temporal": {
          "validFrom": "number | string (optional)",
          "validTo": "number | string (optional)",
          "history": [
            {
              "timestamp": "number",
              "changes": {
                "size": "number",
                "color": "string (hex)",
                "position": { "x": "number", "y": "number", "z": "number" }
              }
            }
          ]
        }
      },
      "relationshipAdditions": {
        "start": "string (alias for source)",
        "end": "string (alias for target)",
        "temporal": {
          "validFrom": "number | string",
          "validTo": "number | string"
        }
      }
    }
  }
}
```
