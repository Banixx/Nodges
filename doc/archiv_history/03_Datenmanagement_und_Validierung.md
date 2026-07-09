# 03 Datenmanagement und Validierung

Ein robustes, typ-sicheres Datenmanagement ist das Rückgrat von Nodges. Da die Anwendung Graphen aus völlig unterschiedlichen Quellen verarbeiten muss, ist eine strikte Validierungsstrategie unerlässlich, um die Stabilität der 3D-Engine zu gewährleisten.

## 03.1 Das Datenmodell: Standardisierung auf Build 3

Um die Codebasis sauber und performant zu halten, wurde das Datenmodell von Nodges vollständig standardisiert. Alle Legacy-Formate (Build 1 und Build 2) wurden komplett aus dem System entfernt.

### Der Build 3 Standard (Modern Semantic Graph)

Nodges unterstützt ausschließlich das Schema "Build 3" (schemaVersion "3.0"). Es erzwingt eine klare Trennung zwischen Strukturdaten (Topologie), Metadaten (Semantik) und Visuellen Mappings (Style).

**Komponenten:**

1. **System/Metadata**: Beinhaltet Systemidentifikation ("Nodges") und zwingend die `schemaVersion: "3.0"`.
2. **Data Model**: Deklariert die verfügbaren Attribute global unter `properties`. Jedes Attribut wird mit Typ (z.B. `categorical` oder `continuous`) beschrieben.
3. **Data**: Kapselt die konkreten Objekte.
   * `entities` (Knoten): Jede Entity besitzt eine eindeutige `id`, einen `type`, optionale `position`-Koordinaten (x, y, z) und einen `stateVector` (für dynamische Attribute).
   * `relationships` (Kanten): Jede Relationship besitzt einen `type`, eine Quelle (`source` oder `start`), ein Ziel (`target` oder `end`) und einen optionalen `stateVector` (für Kantenattribute).
4. **VisualMappings**: Ein Regelwerk, das Datenattribute via vordefinierte Presets (`defaultPresets`) in Grafik-Eigenschaften (z.B. Farben, Größen, Linienstärken) übersetzt.

Beispiel für ein valides Build 3 JSON:

```json
{
  "system": "Nodges",
  "metadata": {
    "created": "2026-07-01",
    "schemaVersion": "3.0"
  },
  "dataModel": {
    "properties": {
      "status": { "type": "categorical", "description": "Status des Knotens" },
      "load": { "type": "continuous", "description": "Aktuelle Systemlast" }
    }
  },
  "data": {
    "entities": [
      {
        "id": "node_01",
        "type": "server",
        "stateVector": {
          "status": "online",
          "load": 82.5
        }
      }
    ],
    "relationships": [
      {
        "type": "connection",
        "source": "node_01",
        "target": "node_02"
      }
    ]
  },
  "visualMappings": {
    "defaultPresets": {
      "global_node": {
        "color": { "source": "categorical", "function": "categorical", "field": "status", "palette": "category10" },
        "size": { "source": "continuous", "function": "linear", "field": "load", "range": [0.5, 3.0] }
      }
    }
  }
}
```

## 03.2 Schema-Validierung mit Zod (The Gatekeeper)

Nodges vertraut keinen externen Daten. Um Laufzeitfehler der Rendering-Engine zu verhindern, wird **Zod** eingesetzt. Zod ist eine Schema-Validierungs-Bibliothek für TypeScript.

### Warum Zod?

In reinem TypeScript sind Typen zur Laufzeit nicht mehr vorhanden. Ein `JSON.parse()` liefert `any`. Wenn das JSON fehlerhaft ist, merkt man es erst, wenn die App abstürzt. Zod prüft die Daten zur Laufzeit Byte für Byte gegen das Build 3 Schema.

### Schema-Definition & Type Inference

Die TypeScript-Typen werden in `types.ts` direkt aus dem Zod-Schema abgeleitet. Das verhindert, dass Validierungscode und Type-Interfaces asynchron werden.

*(Ausschnitt aus `types.ts`)*

```typescript
export const PropertySchema = z.object({
    type: z.enum(['categorical', 'continuous']),
    description: z.string().optional()
});

export const DataModelSchema = z.object({
    properties: z.record(PropertySchema).optional()
});

export const EntitySchema = z.object({
    id: z.coerce.string(),
    type: z.string(),
    label: z.string().optional(),
    position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0)
    }).optional(),
    stateVector: z.record(z.any()).optional()
}).passthrough();
```

### Error-Handling

Wenn Zod einen Fehler findet, fängt Nodges dieses `ZodError`-Objekt ab und generiert lesbare Fehlermeldungen für den Benutzer, anstatt kryptische Stacktraces im Browser anzuzeigen.

## 03.3 Der `DataParser` & Normalisierung

Der `DataParser.ts` ist die zentrale Validierungsklasse.

### Pipeline-Schritte

1. **Schema-Verifikation**: Der Parser prüft explizit die `schemaVersion` in den Metadaten. Entspricht diese nicht exakt `"3.0"`, wird die Datei sofort abgelehnt.
2. **Validierung**: Das Build 3 Zod-Schema wird auf den Datensatz angewendet.
3. **Normalisierung**: Fehlende oder unvollständige Felder werden normalisiert (z.B. Fallbacks für Metadaten gesetzt, IDs in Strings konvertiert).
4. **Indexing**: Um den Zugriff in O(1) zu ermöglichen, werden Arrays in Maps umgewandelt.

## 03.4 Zukünftige Entwürfe (Build 4)

Entwürfe für ein zukünftiges temporales Format ("Build 4") werden getrennt gepflegt und dienen als Richtlinie für künftige Erweiterungen (z.B. zur Verwaltung historischer Zustände und Zeitachsen-Visualisierungen), haben jedoch keinen Einfluss auf das aktive Build 3 System.
