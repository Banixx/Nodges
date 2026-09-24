# 03 Datenmodell und Validierung

Dieses Kapitel beschreibt tiefgreifend die Datenstruktur, auf der Nodges aufbaut, und wie die Integrität dieser Daten beim Import, Export oder bei der Generierung durch LLMs sichergestellt wird.

---

## 1. Das Graphen-Paradigma: Flach und Beziehungsorientiert

> **Visualisierung:** Siehe [04_FlatvsDeeplyNested_003.mmd](04_FlatvsDeeplyNested_003.mmd)

Ein Kernparadigma von Nodges ist die strikte, flache Organisation der Graphendaten. Viele traditionelle JSON-Strukturen oder NoSQL-Datenbanken neigen zu tief verschachtelten Dokumenten. In einer 3D-Graphumgebung ist dies ein Anti-Pattern.

### 1.1 Verbot von Verschachtelungen (Nesting)
- Zugehörigkeiten, hierarchische Abhängigkeiten und semantische Zusammenhänge dürfen **niemals** als verschachtelte Objekte oder Listen innerhalb eines Knotens gespeichert werden.
- *Falsch:* Ein Knoten "Firma" enthält ein Array `employees: [{id: 1, name: "Alice"}, {id: 2, name: "Bob"}]`.
- *Korrekt:* Es existiert ein Knoten "Firma". Es existieren Knoten "Alice" und "Bob". Es existieren Kanten "works_for" von Alice zur Firma und von Bob zur Firma.
- **Warum?** Eine Physik-Engine oder ein 3D-Layout kann verschachtelte Arrays nicht räumlich anordnen. Nur echte, flache Kanten erlauben das Spannen physikalischer Federn (Forces) zwischen Knoten und ermöglichen visuelles Clustering.

### 1.2 Beziehungen als eigene Entitäten (First-Class Edges)
Jede Beziehung zwischen zwei Datenpunkten ist zwingend eine eigene Kante (`Edge`). Dies ermöglicht es, der Kante selbst Eigenschaften zuzuweisen (z.B. `weight`, `date_established`, `type`), die wiederum visualisiert werden können (Dicke, Farbe, gestrichelte Linie).

---

## 2. Das JSON-Datenformat (Schema 5.0 / Build 5+)

> **Visualisierung:** Siehe [04_JsonSchemaStruktur_001.mmd](04_JsonSchemaStruktur_001.mmd)

Alle von den Pipelines erzeugten und von Nodges geladenen Daten müssen einem strikten JSON-Format entsprechen. Dieses Format ist in vier logische Blöcke unterteilt:

```json
{
  "dataModel": {
    "nodeTypes": [
      { "id": "person", "label": "Person", "properties": [...] }
    ],
    "edgeTypes": [
      { "id": "knows", "label": "Kennt", "properties": [...] }
    ]
  },
  "visualMappings": {
    "nodes": {
      "color": { "property": "type", "scale": "categorical" },
      "size": { "property": "influence", "scale": "linear" }
    },
    "edges": {}
  },
  "entities": [
    {
      "id": "node_1",
      "type": "person",
      "label": "Alice",
      "properties": { "influence": 80, "age": 30 }
    }
  ],
  "relationships": [
    {
      "id": "edge_1",
      "source": "node_1",
      "target": "node_2",
      "type": "knows",
      "properties": { "weight": 5 }
    }
  ]
}
```

### Die Komponenten:
1. **`dataModel` (Ontologie):** Definiert die vom LLM (oder Benutzer) erdachten Klassen für Knoten und Kanten sowie deren erlaubte Properties.
2. **`visualMappings` (Präferenz):** Vorschriften, wie bestimmte Attribute initial gerendert werden sollen (z.B. "Nutze `influence` für die Größe").
3. **`entities` (Knoten):** Das flache Array der Datenpunkte.
4. **`relationships` (Kanten):** Das flache Array der Verbindungen. Referenziert `entities` zwingend über deren `id` in den Feldern `source` und `target`.

### 2.1 Das Temporale Objekt (Zeitdimension)

> **Visualisierung:** Siehe [04_TemporalesObjektKeyframes_004.mmd](04_TemporalesObjektKeyframes_004.mmd)

Jeder Knoten (`Entity`) und jede Kante (`Relationship`) besitzt ein optionales `temporal` Objekt. Dies ist die Grundlage für die Visualisierung von Graphen über die Zeit (TimeEngine).

```json
"temporal": {
  "validFrom": 1990,
  "validTo": 2025,
  "history": [
    {
      "timestamp": 2000,
      "changes": { "influence": 95 }
    }
  ]
}
```
- **`validFrom` / `validTo`**: Definiert die pure Existenz des Elements im Zeitstrahl (Wann wird es gerendert, wann stirbt es).
- **`history`**: Ein Array von Keyframes. Statt Daten redundant zu duplizieren, speichert das `changes`-Objekt nur **Deltas** (Werte, die sich genau zu diesem Timestamp ändern).

---

## 3. Runtime-Validierung mittels Zod

Da Nodges Daten oft dynamisch über APIs von stochastischen Modellen (LLMs) bezieht, ist Laufzeitvalidierung (Runtime Validation) kritisch. TypeScript Interfaces prüfen nur zur Compile-Zeit, sie schützen nicht vor defekten JSON-Payloads zur Laufzeit.

### 3.1 Zod-Schemas als Türsteher
- Die gesamte Datenstruktur (`GraphData`, `Node`, `Edge`) wird im Code durch strikte **Zod-Schemas** (`z.object({...})`) definiert.
- Jedes JSON, das in das System geladen wird (per Datei-Upload, Drag & Drop, oder LLM-Response), wird durch `GraphDataSchema.parse()` gepresst.
- Fehlen Felder (z.B. eine Kante referenziert eine `source`-ID, die nicht existiert), wirft Zod einen synchronen Fehler, bevor die Daten die 3D-Engine erreichen können. Dies verhindert undefiniertes Verhalten oder White-Screens (Speicherzugriffsfehler in Three.js).

### 3.2 Structured Outputs (JSON Schema Mode)
Nodges übersetzt sein internes Zod-Schema über Tools wie `zod-to-json-schema` in ein standardisiertes JSON-Schema. Dieses wird bei API-Aufrufen (z.B. an OpenAI) im Parameter `response_format` oder als System-Prompt mitgeliefert. Das zwingt das Modell deterministisch in die geforderte Struktur.

---

## 4. Der Lebenszyklus der Daten (`App.loadGraphData`)

> **Visualisierung:** Siehe [04_LoadGraphDataLebenszyklus_002.mmd](04_LoadGraphDataLebenszyklus_002.mmd)

Der Datenfluss im Client ist streng gerichtet. `App.loadGraphData` ist der einzige Einstiegspunkt (Flaschenhals) für neue Netzwerke.

**Die Kette der Ereignisse:**
1. **Ingestion & Parse:** Roher String wird via `JSON.parse` gelesen.
2. **Validation:** Zod prüft die Struktur.
3. **State Update:** Der `GraphDataManager` (die interne "Datenbank") wird bereinigt und mit den neuen Entitäten und Beziehungen bestückt.
4. **Scene Cleardown:** Der `SceneManager` wird angewiesen, die alte 3D-Szene sicher zu leeren (`clearScene`). Dabei müssen alle Geometrien, Materialien und Texturen via `.dispose()` aus dem GPU-Speicher (VRAM) gelöscht werden, um Memory-Leaks zu verhindern.
5. **Re-Instantiation:** Der `SceneManager` baut die neuen 3D-Meshes auf.
6. **UI Sync:** Das `MappingPanel` wird über die neue Ontologie (`dataModel`) informiert und baut die Dropdown-Menüs (Slider, Color-Picker) basierend auf den neu verfügbaren Properties dynamisch neu auf.

---

## 5. Export und Interoperabilität (GEXF)

Nodges ist kein Daten-Silo. Historisch (siehe ADRs) wurde evaluiert, wie Graphen mit wissenschaftlichen Tools (Gephi, Cytoscape) ausgetauscht werden können.
Während das interne Format JSON ist, zielt die Architektur darauf ab, Interoperabilität mit dem XML-basierten GEXF-Format (Graph Exchange XML Format) zu wahren, um den Import von akademischen Datensätzen oder den Export für tiefergehende Netzwerk-Kalkulationen (Betweenness Centrality, PageRank) in Desktop-Tools zu ermöglichen.
