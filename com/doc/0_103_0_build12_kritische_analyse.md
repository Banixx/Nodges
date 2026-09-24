# Kritische Analyse: Build12 (LightRAG) – Prozess der .json-Erstellung

Version: 0.103.0
Stand: Projekt Nodges, Arbeitsverzeichnis `/workspace`

---

## 1. Ablauf des Build12-Prozesses

Der Prozess ist in drei Ebenen verteilt:

1. **Frontend** `src/ui/CreatePanel.ts` (Zeilen ~1700-1745)
2. **Service** `src/utils/LightRAGService.ts`
3. **Backend** `lightrag-backend/main.py`

### Ablaufschritte

1. Der Nutzer waehlt in `CreatePanel.ts:777` die Pipeline `build12_lightrag` (Label: "Build 12: LightRAG (Lokaler Graph-RAG Microservice)").
2. Falls `ragText` vorhanden ist, wird dieser per `LightRAGService.insertText()` an `/lightrag-api/insert` gesendet (Testdaten als Wissensbasis).
3. Optional wird der Rohdatentext als `../b12/B12_01_Rohdaten_${fileSuffix}.txt` gespeichert.
4. `LightRAGService.queryGraph(prompt, 'hybrid')` ruft `/lightrag-api/query` auf.
5. Das Python-Backend fragt `rag_instance.aquery()` ab und extrahiert danach den Wissensgraph per `chunk_entity_relation_graph.get_knowledge_graph("*")`.
6. Das Backend liefert `answer` und `graph_context` (nodes/edges) zurueck.
7. Frontend baut daraus `graphData` (metadata, dataModel, visualMappings, data) zusammen.
8. `GraphGenerationService.enrichGraphMetadata()` injiziert Metadaten (build = `build12_lightrag`).
9. Ergebnis wird als `../b12/B12_Graph_${fileSuffix}.json` in `/workspace/public/data/b12/` gespeichert.
10. Optional wird das volle Antwortobjekt als `B12_02_Antwort_${fileSuffix}.json` abgelegt.

---

## 2. Kritische Befunde

### 2.1 Mock-Fallback ohne Warnung (schwerwiegend)

In `lightrag-backend/main.py` gilt: Ist `LIGHTRAG_AVAILABLE = False` (z.B. LightRAG-Import oder Embedding fehlgeschlagen), liefert `/query` eine hartkodierte **Mock-Antwort** mit 3 generischen Knoten und 2 Kanten.

Das Frontend unterscheidet nicht zwischen echter Engine-Antwort und Mock. Es speichert die Mock-Daten als reguläre `B12_Graph_*.json`. Der Nutzer sieht keine Warnung.

- Der Healthcheck `LightRAGService.checkHealth()` existiert, wird im Build-Pfad aber **nicht** vor der Abfrage konsultiert.
- **Folge:** Stillschweigende Erzeugung inhaltsloser JSON-Dateien, die als valide Ergebnisse verkauft werden.

### 2.2 Doppelte Metadaten-Injektion

`enrichGraphMetadata()` wird fuer `build12_lightrag` **zweimal** aufgerufen:

1. Innerhalb des `if (pipeline === 'build12_lightrag')` Blocks (`CreatePanel.ts:1722-1727`).
2. Danach generisch fuer alle Pipelines (`CreatePanel.ts:1783-1788`).

Die zweite Injektion ist redundant. Zwar schuetzen `||`-Zuweisungen viele Felder vor Ueberschreiben, aber der doppelte Durchlauf ist verwirrend und fehleranfaellig.

### 2.3 Kompletter Wissensgraph wird extrahiert

Das Backend ruft `get_knowledge_graph("*")` auf. Das liefert **alle** Knoten und Kanten der gesamten Knowledge Base – unabhaengig von der gestellten Query.

- Die semantische Antwort (`answer`) bezieht sich auf den Prompt.
- Der extrahierte Graph ist hingegen der komplette KB-Inhalt.
- **Folge:** JSON-Dateien wachsen mit jeder eingefuegten Textmenge, und die Datei enthaelt viel irrelevantes Material. Es gibt keine Begrenzung oder Filterung auf den query-relevanten Teilgraphen.

### 2.4 Zustandslose, akkumulierende Wissensbasis

`ragText` wird per `insertText` in die Knowledge Base geschrieben, doch es existiert kein Reset-Zyklus pro Build/Session.

- Jede neue Generierung akkumuliert auf dem vorherigen Stand.
- **Folge:** Der Wissensgraph "driftet" ueber Sessions hinweg. Wiederholte Builds mit verschiedenen Rohdaten vermischen sich in einer einzigen KB und im Ergebnis.

### 2.5 Erzwungene Relationen ohne Warnung

in `LightRAGService.normalizeRelation()` lautet der letzte Fallback:

```ts
return allowedSet[0] || rawRel;
```

Wenn keine der erlaubten Relationen passt, wird **stillschweigend die erste erlaubte Relation** eingesetzt. Das ist Datenkorruption ohne Hinweis: Eine inhaltlich falsche Beziehung wird als korrekt ausgegeben.

### 2.6 Schema-Inkonsistenzen

- `enrichGraphMetadata()` setzt `schemaVersion` auf `"5.0"`, sofern nicht vorhanden.
- `LightRAGService.queryGraph()` setzt in den Metadaten `schemaVersion: "5.2"`.
- Das Backend liefert `entity_type` / `type`-Properties in unterschiedlichen Varianten.

Es gibt keine zentrale, verbindliche Schema-Definition, gegen die das Ergebnis validiert wird – obwohl `zod` und `zod-to-json-schema` bereits als Dependencies vorhanden sind.

### 2.7 Fehlende Schema-Validierung des Ergebnisses

Das erzeugte `graphData` wird ohne Validierung gespeichert. Liefert LightRAG unerwartete Strukturen (fehlende `data`-Felder, fehlende `id`s), produziert das Frontend eine kaputte JSON-Datei, die im Visualizer nicht ladbar ist.

### 2.8 Dateibenennung und Kollisionsrisiko

`getFormattedFileSuffix()` (`CreatePanel.ts:56`) baut den Suffix aus `generationCounter` (padStart 2) und dem Tag:

```ts
return `${counter}_${day}`;
```

- Der Zaehler ist nur pro Session gueltig.
- **Folge:** Kollisionen zwischen Sessions am selben Tag sind moeglich. Die Dateien `B12_Graph_01_28_tuned1` bis `_tuned5` zeigen zudem, dass manuelle Nachbearbeitungen im selben Ordner liegen, ohne automatisierte Versionierung.

### 2.9 Nutzer-Prompt als RAG-Query

Der Prompt wird als Query an `aquery` geschickt, waehrend `ragText` nur als Wissensquelle eingefuegt wird. Das ist fuer RAG prinzipiell korrekt. Problematisch ist, dass der Prompt oft imperativ formuliert ist ("Erzeuge einen Graphen ueber X") und weniger als Retrieval-Frage, was die Retrieval-Qualitaet mindert.

---

## 3. Empfehlungen (priorisiert)

1. **Mock explizit kennzeichnen:** Vor dem Build `checkHealth()` pruefen. Bei inaktiver Engine entweder abbrechen oder das Ergebnis klar als "Mock" markieren (z.B. `metadata.generationDetails.mock = true`) und den Nutzer warnen.
2. **Metadaten-Injektion vereinheitlichen:** Die redundante zweite `enrichGraphMetadata()`-Injektion fuer Build12 entfernen.
3. **Teilgraph statt Vollgraph:** `get_knowledge_graph("*")` durch eine query-bezogene Abfrage ersetzen oder die Anzahl Knoten/Kanten begrenzen.
4. **KB-Reset-Option:** Pro Build eine eigene Datenbank anlegen oder die KB vor der Insertion zuruecksetzen, um Drift zu vermeiden.
5. **Relation-Fallback fuehren:** `normalizeRelation()` soll bei Nicht-Treffer die Originalrelation behalten und eine Warnung bzw. einen "nicht zugeordnet"-Marker erzeugen, statt `allowedSet[0]` zu erzwingen.
6. **Schema-Validierung:** Ergebnis mit `zod` gegen ein definiertes `GraphData`-Schema validieren, bevor es gespeichert wird.
7. **Eindeutige Dateinamen:** Kollisionsfeste Suffixe (Timestamp/Millis) statt Session-Zaehler nutzen.

---

## 4. Betroffene Dateien

| Datei | Relevanz |
|-------|----------|
| `/workspace/src/ui/CreatePanel.ts` | Build-Ausfuehrung, Speicherung, Dateibenennung |
| `/workspace/src/utils/LightRAGService.ts` | API-Aufruf, Graph-Transformation, Relation-Normalisierung |
| `/workspace/src/utils/GraphGenerationService.ts` | Metadaten-Injektion |
| `/workspace/lightrag-backend/main.py` | LightRAG-Engine, Knowledge-Graph-Extraktion, Mock-Fallback |
| `/workspace/vite.config.ts` | Proxy `/lightrag-api` -> `localhost:8000` |