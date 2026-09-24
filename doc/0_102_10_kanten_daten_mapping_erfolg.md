# Dokumentation: Aktivierung datengetriebener Kanten-Mappings in Prompts

## Hintergrund der Aenderung
In der vorherigen Version wurden fuer Kanten standardmaessig **konstante Mappings** generiert (z. B. feste Kantenfarbe `#aaaaaa` oder Dicke `0.1`). 
- Da konstante Mappings kein Quell-Attribut haben, werden im Mapping-Panel fuer Kanten standardmaessig **keine Verbindungslinien** gezeichnet.
- Um Verbindungslinien (Lines) im Kanten-Mapping-Panel anzuzeigen, muss die Visualisierung auf einem Kanten-Attribut (z. B. `type` oder `label`) basieren (kategoriales Mapping).

## Durchgefuehrte Aenderungen

### 1. `C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts`
Im Structured-Output-Beispiel (Build 6) wurde das Standard-Farbmapping fuer Kanten von einer Konstante auf ein kategoriales Mapping basierend auf `type` umgestellt:
```json
      "global_edge": {
        "color": { "source": "type", "function": "categorical" },
        "thickness": { "source": "constant", "function": "constant", "params": { "value": 0.1 } }
      }
```

### 2. `C:/Users/ich/Desktop/code/_projects/Nodges/public/prompts/build_6_prompt.md`
Die Kanten-Visualisierungsregel wurde angepasst, um das LLM explizit dazu anzuleiten, die Kantenfarbe kategorial ueber das `type`- (oder `label`-) Attribut zu mappen, damit unterschiedliche Kantenarten farblich unterscheidbar sind.

### 3. `C:/Users/ich/Desktop/code/_projects/Nodges/public/prompts/build_8_mapping_prompt.md`
Im Beispiel-JSON des Wikidata-Transformationsschritts wurde das Kanten-Farbmapping ebenfalls von einer Konstanten auf ein kategoriales Mapping basierend auf `kategorie` umgestellt.

---

## Resultat
Bei zukuenftig generierten Graphen (z. B. ueber die Build-6- oder Build-8-Pipelines) erzeugt das LLM standardmaessig ein kategoriales Kanten-Farbmapping. Dies fuehrt dazu, dass:
1. Im Kanten-Mapping-Panel des UI automatisch die entsprechende Verbindungslinie gezeichnet wird (z. B. von `type` oder `label` zu `Farbe`).
2. Die Kanten in der 3D-Szene entsprechend ihrer logischen Funktion (z. B. `orbit` vs. `child_of`) eingefaerbt werden.
