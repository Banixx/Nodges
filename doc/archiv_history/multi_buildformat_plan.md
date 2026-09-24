# Multi-Buildformat Plan

Nodges soll verschiedene JSON-Schema-Versionen (Build 1, Build 2, Build 3, ...) **parallel** laden und darstellen koennen.
Kein Format wird in ein anderes konvertiert. Jedes Format wird in seiner eigenen Struktur beibehalten und korrekt interpretiert.

---

## Ist-Zustand (Probleme)

### Kernproblem: Ein einziges Zod-Schema fuer alles
Das aktuelle `GraphDataSchema` in `types.ts` erzwingt eine fixe Struktur:
- `dataModel` erwartet `{ entities: { ... }, relationships: { ... } }` (Build 1 Format)
- Build 2/3 JSONs verwenden `dataModel.properties` stattdessen (ohne entities/relationships-Unterteilung)
- Build 2/3 nutzen `stateVector` auf Entity-Ebene; Build 1 legt Attribute flach auf die Entity
- Build 2/3 haben `fields` (Raumkruemmung); Build 1 nicht
- Ergebnis: Build 3 JSONs scheitern an der Zod-Validierung

### Betroffene Stellen im Code

| Datei | Problem |
|-------|---------|
| `types.ts` (Z.30-34) | `DataModelSchema` erzwingt `entities` + `relationships` Struktur |
| `DataParser.ts` (Z.77-109) | `parseValues()` greift auf `dataModel.entities[type]` zu, was bei Build 2/3 nicht existiert |
| `VisualMappingEngine.ts` (Z.218-221) | Gleicher Zugriff auf `dataModel.entities[type]` |
| `MappingUI.ts` (Z.526-532) | Greift auf `dataModel.entities[type]` und `dataModel.relationships[type]` zu |
| `UIManager.ts` (Z.248-256) | Sammelt Attribute aus `dataModel.entities` und `dataModel.relationships` |

---

## Formatuebersicht

### Build 1 (aktuell funktionierend)
- `dataModel.entities.{type}.properties.{prop}` — gruppiert nach Entity-Typ
- `dataModel.relationships.{type}.properties.{prop}` — gruppiert nach Relationship-Typ
- Attribute **flach** auf Entity-Ebene: `{ "id": "s1", "load": 75, "status": "online" }`
- Feste Positionen via `position: { x, y, z }`
- Kein `stateVector`, keine `fields`

### Build 2 (Spezifikation: nodges_build_2.txt)
- `dataModel.properties.{prop}` — globale Property-Definitionen (nicht nach Typ gruppiert)
- Attribute in `stateVector`: `{ "stateVector": { "status": "nominal", "traffic_vector": { ... } } }`
- `fields` Array fuer Raum-Attraktoren
- `visualMappings` im eigenen Build-2-Format (color.function, geometry, audio, etc.)
- Keine festen Positionen (Simulation berechnet diese)

### Build 3 (Spezifikation: nodges_build_3.md)
- Gleiche Grundstruktur wie Build 2
- `schemaVersion: "3.0"` zwingend in metadata
- Erweiterbar fuer zukuenftige Aenderungen

---

## Umsetzungsplan

### Schritt 1: Schema-Erkennung in DataParser

**Datei:** `DataParser.ts`

Neue statische Methode `detectBuildVersion(data: any): string`:

```
Logik:
1. Hat data.nodes && data.edges && !data.system -> "build0" (nodes/edges Format)
2. Hat data.metadata?.schemaVersion -> Wert direkt verwenden ("2.0", "3.0", ...)
3. Hat data.dataModel?.properties (ohne entities/relationships) -> "build2"
4. Hat data.dataModel?.entities -> "build1"
5. Sonst -> "build1" (Fallback, aktuelles Verhalten)
```

Die erkannte Version wird als `_buildVersion` auf dem GraphData-Objekt gespeichert und durchgereicht.

### Schritt 2: Zod-Schema flexibilisieren

**Datei:** `types.ts`

Das `DataModelSchema` wird so erweitert, dass es **beide** Formate akzeptiert:

```typescript
export const DataModelSchema = z.union([
    // Build 1: Gruppiert nach Entity/Relationship-Typ
    z.object({
        entities: z.record(EntityTypeSchemaSchema),
        relationships: z.record(RelationshipTypeSchemaSchema),
    }),
    // Build 2/3: Globale Properties
    z.object({
        properties: z.record(PropertySchemaSchema),
    }),
]);
```

Der TypeScript-Typ wird:
```typescript
export type DataModel = 
    | { entities: Record<string, EntityTypeSchema>; relationships: Record<string, RelationshipTypeSchema> }
    | { properties: Record<string, PropertySchema> };
```

**Kernprinzip: Kein Format wird konvertiert. Beide Varianten leben parallel im selben Union-Typ.**

### Schritt 3: Hilfsfunktionen fuer Format-Zugriff

**Neue Datei:** `src/core/BuildFormatUtils.ts`

Zentrale Utility-Funktionen, die je nach Build-Format den richtigen Zugriffspfad waehlen:

```typescript
/** Erkennt ob ein DataModel im Build-1-Format vorliegt */
function isBuild1DataModel(dm: DataModel): boolean

/** Erkennt ob ein DataModel im Build-2/3-Format vorliegt */
function isBuild2DataModel(dm: DataModel): boolean

/** Gibt die PropertySchema fuer ein Attribut zurueck, unabhaengig vom Build-Format */
function getPropertySchema(dm: DataModel, entityType: string, propName: string): PropertySchema | undefined

/** Gibt alle verfuegbaren Property-Namen zurueck */
function getAvailableProperties(dm: DataModel, entityType: string): string[]

/** Liest einen Attributwert aus einer Entity, unabhaengig vom Format */
function getEntityAttributeValue(entity: EntityData, attrName: string): any
// Build 1: entity[attrName]
// Build 2/3: entity.stateVector?.[attrName]
```

### Schritt 4: DataParser anpassen

**Datei:** `DataParser.ts`

`parseValues()` nutzt die neuen Hilfsfunktionen:
- Build 1: Attribute direkt auf Entity-Ebene lesen/schreiben (wie bisher)
- Build 2/3: Attribute aus `stateVector` lesen, dabei verschachtelte Vektoren (`traffic_vector.value`) korrekt traversieren

### Schritt 5: VisualMappingEngine anpassen

**Datei:** `VisualMappingEngine.ts`

Die Methode, die den Rohwert eines Attributs aus einer Entity liest, wird auf die Hilfsfunktion `getEntityAttributeValue()` umgestellt. So greift die Engine bei Build 1 auf `entity.load` zu und bei Build 2/3 auf `entity.stateVector.load`.

### Schritt 6: MappingUI und UIManager anpassen

**Dateien:** `MappingUI.ts`, `UIManager.ts`

Alle Stellen, die auf `dataModel.entities[type]` oder `dataModel.relationships[type]` zugreifen, werden durch die Hilfsfunktionen ersetzt. Die Attributliste im linken Mapping-Panel wird dann korrekt befuellt:
- Build 1: Attribute aus `dataModel.entities[type].properties`
- Build 2/3: Attribute aus `dataModel.properties` + vorhandene `stateVector`-Keys der Entities

### Schritt 7: Schema-Badge im Mapping Panel erweitern

**Datei:** `MappingUI.ts`

Das bestehende Schema-Badge zeigt bereits die `schemaVersion` an. Es wird erweitert, um auch die erkannte Build-Version anzuzeigen:
- `Build 1 | Schema: 1`
- `Build 2 | Schema: 2.1-Beta`
- `Build 3 | Schema: 3.0`

---

## Reihenfolge der Implementierung

| # | Aufgabe | Dateien | Risiko |
|---|---------|---------|--------|
| 1 | `DataModelSchema` als Union-Typ erweitern | types.ts | mittel |
| 2 | `BuildFormatUtils.ts` erstellen | neu | niedrig |
| 3 | `detectBuildVersion()` in DataParser | DataParser.ts | niedrig |
| 4 | `parseValues()` formatspezifisch machen | DataParser.ts | mittel |
| 5 | VisualMappingEngine Attributzugriff anpassen | VisualMappingEngine.ts | mittel |
| 6 | UIManager Attributsammlung anpassen | UIManager.ts | mittel |
| 7 | MappingUI Attributzugriff anpassen | MappingUI.ts | mittel |
| 8 | Schema-Badge erweitern | MappingUI.ts | niedrig |

Die Schritte 1-3 bilden das Fundament. Danach kann mit `npm run dev` getestet werden, ob Build 1 weiterhin funktioniert und Build 3 zumindest ohne Fehler geladen wird. Die Schritte 4-7 sorgen dann dafuer, dass die Daten auch korrekt visualisiert werden.

---

## Was dieser Plan NICHT tut

- Kein Format wird in ein anderes konvertiert
- Build 2 JSONs bleiben Build 2, Build 3 bleiben Build 3
- Kein "Legacy"-Label — alle Formate sind gleichberechtigte Parallelversionen
- Keine Abwaertskompatibilitaets-Hacks: Wenn ein JSON sein Format nicht besteht, wird es mit klarer Fehlermeldung abgelehnt
