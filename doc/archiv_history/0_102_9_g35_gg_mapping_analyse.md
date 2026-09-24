# Analyse der Datei gg.json im Ordner public/data/g35/

Die Datei `C:/Users/ich/Desktop/code/_projects/Nodges/public/data/g35/gg.json` wurde analysiert. Es wurde untersucht, ob diese Datei Mappings und Metadaten zur Visualisierung enthaelt.

## Analyseergebnisse

Die Datei `gg.json` enthaelt folgende Mapping- und Karteninformationen:

1. **Hintergrundkarten-Konfiguration (`metadata.map`):**
   ```json
   "map": {
     "image": "background_map.png",
     "referenceWidth": 1920,
     "referenceHeight": 1080
   }
   ```

2. **Visuelle Mappings (`visualMappings`):**
   Sie enthaelt ein vordefiniertes Preset `main_view` fuer Farbe (`color`) und Groesse (`size`):
   ```json
   "visualMappings": {
     "defaultPresets": {
       "main_view": {
         "color": {
           "source": "stateVector",
           "field": "status",
           "function": "categorical",
           "range": [
             "#00ff00",
             "#ff0000",
             "#ffff00"
           ]
         },
         "size": {
           "source": "stateVector",
           "field": "load",
           "function": "linear",
           "domain": [
             0,
             100
           ],
           "range": [
             2,
             15
           ]
         }
       }
     }
   }
   ```

3. **Entitaets-Mapping-Koordinaten (`mapX` und `mapY`):**
   Jedes Element in `data.entities` besitzt 2D-Kartenkoordinaten, zum Beispiel:
   - `mapX: 960`
   - `mapY: 950`
