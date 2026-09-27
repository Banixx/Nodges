# Nodges – Datenmodell und Schema

## 1. Überblick

Das Datenmodell von Nodges ist als **Graph** strukturiert und wird vollständig in `src/types.ts` mit **Zod** definiert. Aus dem Zod-Schema wird über `zod-to-json-schema` ein JSON-Schema exportiert (`public/data/nodges_schema.json`), das auch den KI-Prompts als strukturierte Ausgabe dient.

Das Datenmodell ist bewusst **offen** (`passthrough()`): Entitäten und Relationen dürfen beliebige, nutzerdefinierte Properties tragen, die zur Laufzeit über das `dataModel` beschrieben werden.

## 2. Struktur des Graph-Datenmodells (`GraphData`)

```
GraphData
|-- system            (string, Default "Semantic Graph")
|-- metadata
|   |-- created, version, schemaVersion (Default "5.2"), author, description
|   |-- map { image, referenceWidth, referenceHeight }   (Hintergrundkarte)
|   |-- ... (beliebig, passthrough)
|-- dataModel         (Properties-Definition, passthrough)
|-- fields            (FieldData[]: Kraftfelder für Layout)
|-- visualMappings    (Default-Presets + Mappings)
|-- data
|   |-- entities       (EntityData[])
|   |-- relationships  (RelationshipData[])
```

Hinweis aus den Prompts: Das Feld `type` auf oberster Ebene von Entitäten/Relationen ist **verboten** – Kategorisierung erfolgt über reguläre semantische Properties (z. B. `"kategorie": "Planet"`).

## 3. Schema-Validierung (`PropertySchema`)

`PropertySchemaSchema` beschreibt das Typ-System der Properties:

```ts
type: 'continuous' | 'categorical' | 'vector' | 'spatial' | 'temporal'
    | 'boolean' | 'string' | 'number' | 'text'
range: [min, max]          // kontinuierlich
unit                       // Maßeinheit
dimensions / values / coordinates / default
```

`DataModelSchema` ist eine flache Record-Struktur `properties` (plus passthrough). Die `BuildFormatUtils` unterstützen zusätzlich ältere Build-5-Formate mit verschachtelten `entities[type].properties` und `relationships[type].properties` (Kompatibilitätsebene).

## 4. Entitäten (`EntityData`)

```ts
{
  id: string;              // Pflicht
  label?: string;
  position?: { x, y, z };  // optional; ohne Position → Jitter-Fallback in App
  stateVector?: Record;    // abgeleitete Kennzahlen (degree, inbound, outbound u. a.)
  behavior?: string;
  temporal?: TemporalData;
  mapX?: number; mapY?: number;   // Kartenkoordinaten (Build 4)
  ... beliebige Properties
}
```

## 5. Relationen (`RelationshipData`)

```ts
{
  id: string;
  source: string;   target: string;
  relation: string; // Typ der Kante (Pflicht laut Normierung)
  label?: string;
  nodes?: string[];
  temporal?: TemporalData;
  ... beliebige Properties
}
```

Der `DataParser` normalisiert hierbei die dualen Feldnamen `start/end` (alt) und `source/target` (neu) sowie `relation` vs. `type`/`label`. Sind `id`/`relation` nicht gesetzt, werden sie synthetisiert (`rel_{index}`, `connects_to` bzw. `type|label`).

## 6. Temporale Daten (Build 4)

```ts
TemporalData {
  validFrom?: number | null;
  validTo?: number | null;
  history?: { timestamp: number; changes: Record }[];
}
```

Der `DataParser` **synthetisiert** `temporal`-Objekte aus flachen Feldern (`startYear`, `endYear`, `validFrom`, `validTo` u. a.), wenn noch kein `temporal`-Objekt existiert. Dabei wird bei Relationen vermieden, `start`/`end` als Zeitwerte zu deuten, wenn sie Node-Identifier sind.

## 7. Visual Mappings (`VisualMappings`)

Eine Mapping-Regel (`VisualMapping`) besteht aus:

```ts
{
  source?: string;  field?: string;        // Datenquelle
  function: 'linear'|'exponential'|'logarithmic'|'heatmap'|'bipolar'
             |'pulse'|'geographic'|'sphereComplexity'|'categorical'|'constant';
  domain?: [min, max];
  range?: [min,max] | string[] | number[];
  palette?: string | string[];
  params?: Record;   // z. B. categories
  mapping?: Record;
}
```

Es gibt **Entity-Presets** und **Relationship-Presets**:

- **Entity-Preset:** `position`, `positionX/Y/Z`, `size`, `color`, `geometry`, `glow`, `animation`, `attraction`, `repulsion`, `inertia`.
- **Relationship-Preset:** `thickness`, `color`, `curvature`, `glow`, `opacity`, `animation`, `animation_flow`, `animation_sequential`, `animation_pulse`, `animation_segments`.

Die `VisualMappingEngine` setzt diese Regeln auf konkrete 3D-Werte um (Details in Kapitel 08).

## 8. Schema-Versionen und Kompatibilität

- Der `DataParser` unterstützt `3.0`, `4.0` und `5.0`; unbekannte/fehlende Versionen werden auf `5.0` zurückgesetzt.
- Die ursprüngliche Version wird als `metadata._buildVersion` konserviert.
- Map- und Temporal-Verhalten wird über `metadata.version === 4` (Build 4) aktiviert.
- Zwischen Daten und Metadaten (`schemaVersion`) gibt es eine gewisse Duplizierung (`metadata.version` vs. `metadata.schemaVersion`), siehe Verbesserungen.

## 9. JSON-Schema (`nodges_schema.json`)

Das Schema wird per `npm run export:schema` aus den Zod-Definitionen erzeugt und ist die Grundlage für die strukturierte KI-Ausgabe der Graph-Prompts (siehe `src/prompts/build_10_prompt.md` u. a.). Es dockt unter `$defs.GraphDataSchema` an.

---

*Weiter: `/workspace/com/doc/06_state_management_nodges_V4.md`.*
