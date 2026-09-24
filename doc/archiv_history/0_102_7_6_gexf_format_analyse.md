# Machbarkeit und Analyse des GEXF-Formats fuer Nodges

## Kurzzusammenfassung
Ein kompletter Wechsel zum GEXF-Format als primares Nodges-Format ist nicht empfehlenswert, da GEXF die Nodges-spezifischen Visualisierungsregeln (Visual Mappings, Physik-Channels und Ontologie-Trennung) nicht nativ unterstuetzen kann und XML fuer LLM-Generierungen token-intensiver sowie fehleranfaelliger als JSON ist. Als ergaenzendes Import- und Exportformat ist GEXF hingegen bereits integriert und sollte durch eine automatische Generierung von Standard-Mappings beim Import weiter aufgewertet werden.

---

## 1. Analyse der Einsatzszenarien

### A. GEXF als Format beim Erstellen eines Systems (LLM-Generation)
Wenn ein System ueber ein LLM generiert wird, muss das Format fuer das Modell leicht verstaendlich, robust erzeugbar und token-effizient sein.

* **XML-Fehleranfaelligkeit**: GEXF basiert auf XML. LLMs neigen bei der Generierung von XML staerker zu Fehlern (vergessene Closing-Tags, falsche Namespaces wie `viz:`, falsche Verschachtelungen) als bei JSON. JSON ist das natuerliche Ausgabeformat moderner LLMs (oft unterstuetzt durch strukturierte JSON-Ausgaben via JSON-Schema).
* **Token-Overhead**: XML benoetigt durch die oeffnenden und schliessenden Tags signifikant mehr Tokens (oft das 2- bis 3-fache im Vergleich zu kompaktem JSON). Dies erhoeht die Latenz der KI-Generierung und verursacht hoehere API-Kosten.
* **Verlust der visuellen Semantik**: GEXF speichert nur das *statische Ergebnis* einer Visualisierung (z. B. feste Farbe `#FF0000` oder feste Position `x="10"`). Das Herzstueck von Nodges ist jedoch die **VisualMappingEngine**, bei der das LLM abstrakte Regeln definiert (z. B. "Die Eigenschaft 'Trust' steuert die Node-Groesse ueber eine lineare Funktion im Bereich von 0.5 bis 3.0"). Diese Logik laesst sich in GEXF nicht standardkonform abbilden.

### B. GEXF als Import-Format (Zusaetzliche Lesbarkeit und Interoperabilitaet)
Die Moeglichkeit, GEXF-Dateien aus anderen Tools (wie Gephi oder NetworkX) zu importieren, erhoeht die Nutzbarkeit von Nodges erheblich.

* **Bestehende Integration**: In `src/utils/ImportManager.ts` existiert bereits eine Methode `parseGEXF()`. Diese liest Knoten, Kanten, Attribute, Positionen (`viz:position`), Farben (`viz:color`) und Groessen (`viz:size`) ein und normalisiert diese in die Struktur der App.
* **Potenzial fuer System-Creation aus GEXF**: Um ein importiertes GEXF-System vollstaendig in Nodges nutzbar zu machen, kann beim Importprozess automatisch ein dynamisches `dataModel` und passende `visualMappings` erzeugt werden. Dadurch wird die Datei nicht nur statisch gerendert, sondern direkt zu einem interaktiven Nodges-System konvertiert.

---

## 2. Detaillierter Vergleich: GEXF vs. Nodges-JSON

| Kriterium | GEXF (XML) | Nodges-JSON | Bewertung fuer Nodges |
| :--- | :--- | :--- | :--- |
| **Tool-Kompatibilitaet** | Sehr hoch (Gephi, NetworkX, R, Java) | Gering (nur Nodges) | GEXF ist ideal fuer Datenaustausch. |
| **Ausdrucksstaerke Visualisierung** | Gering (nur statische viz-Attribute) | Sehr hoch (Mapping-Funktionen, Paletten, Glow, Animationen) | Nodges-JSON ist unverzichtbar fuer das interaktive Rendern. |
| **Ontologie-Ebene (dataModel)** | Nicht vorhanden (flache Attribute) | Integriert (Deklaration von Eigenschaften und Wertebereichen) | Nodges benoetigt das `dataModel` fuer die 2-Stufen-Generierung. |
| **LLM-Generierbarkeit** | Fehleranfaellig (XML-Tags) | Sehr robust (JSON-Schema Validierung) | JSON-Format bevorzugt fuer stabile KI-Pipelines. |
| **Dynamik & Zeitachsen** | Sehr gut (Spells, Intervalle) | Rudimentaer (historische Property-Historie vorhanden) | GEXF hat theoretische Vorteile bei dynamischen Graphen. |

---

## 3. Strategische Empfehlungen

### Option 1: Hybrid-Ansatz (Empfohlen)
Nodges behaelt sein Zod-validiertes JSON-Format als primares internes Speicher- und Generierungsformat. 
Beim Import einer GEXF-Datei konvertiert der `ImportManager` die statischen Daten und Attribute in ein vollstaendiges Nodges-JSON, indem er:
1. Aus den GEXF-Attributdeklarationen ein dynamisches `dataModel` erzeugt.
2. Standard-Visual-Mappings fuer gefundene numerische und kategorische Attribute anlegt.
3. Die statischen Positionen und Farben als Startwerte oder Fallbacks speichert.

### Option 2: JSON-Schema-Standardisierung fuer LLMs
Statt das Format auf XML umzustellen, wird das bestehende Zod-Schema von Nodges (`GraphDataSchema`) als offizielles JSON-Schema exportiert. Dies ermoeglicht:
* Die Nutzung von "Structured Outputs" bei OpenAI/OpenRouter (bereits in `LLMService.ts` via `zod-to-json-schema` implementiert).
* Eine praezise Dokumentation fuer externe Entwickler, die Graphen fuer Nodges erzeugen wollen.

### Option 3: Integration der GEXF-Dynamik-Konzepte
Die Staerken von GEXF (wie hierarchische Verschachtelung ueber `parentId` und zeitliche Verlaeufe ueber Intervalle/Spells) sollten mittelfristig in das Nodges-JSON-Schema integriert werden, ohne dabei das JSON-Format selbst aufzugeben.
