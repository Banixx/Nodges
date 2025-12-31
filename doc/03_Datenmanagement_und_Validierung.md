# 03 Datenmanagement und Validierung

Ein robustes, typ-sicheres Datenmanagement ist das Rückgrat von Nodges. Da die Anwendung Graphen aus völlig unterschiedlichen Quellen (APIs, Dateien, User-Input) verarbeiten muss, ist eine strikte Validierungsstrategie unerlässlich, um die Stabilität der 3D-Engine zu gewährleisten.

## 03.1 Das Datenmodell: Strategie "Evolution"

Das Projekt befindet sich in einer geordneten Migration von einem simplen "Legacy-Format" hin zu einem semantisch reichen "Future-Format". Die Architektur ist **dual-fähig**: Sie kann beide Formate lesen, normalisiert intern aber alles auf gemeinsame Strukturen.

### Das Legacy-Format (Der "Quick Start")
Dieses Format ist auf absolute Minimalistik ausgelegt. Es eignet sich für schnelle Prototypen oder manuelle JSON-Erstellung.
*   **Fokus**: Rein visuell / geometrisch.
*   **Struktur**: Flache Listen.

```json
{
  "nodes": [
    { "id": "router_01", "x": 10, "y": 0, "z": 5, "label": "Router" },
    { "id": "pc_02", "x": -5, "y": 2, "z": 0, "color": "#ff0000" }
  ],
  "edges": [
    { "start": "router_01", "end": "pc_02", "type": "lan_cable" }
  ]
}
```
*Nachteil*: Metadaten (z.B. "Was bedeutet die Farbe Rot?") fehlen. Die Semantik ist implizit.

### Das Future-Format (Der "Semantic Graph")
Das neue Format trennt **Strukturdaten** (Topologie), **Metadaten** (Semantik) und **Visuelle Mappings** (Style). Es orientiert sich an modernen Standards wie GEXF oder GraphML.

**Komponenten:**
1.  **System/Metadata**: Wer hat den Graphen erstellt? Welche Version?
2.  **Data**: Die reinen Entitäten (`entities`) und Beziehungen (`relationships`). Hier stehen *keine* Farben oder Größen, sondern Daten (z.B. `traffic: 500mbps`, `role: 'Server'`).
3.  **VisualMappings**: Ein Regelwerk, das Daten in Grafik übersetzt.

```json
{
  "system": "NetworkAnalytics V2",
  "data": {
    "entities": [
      { "id": "n1", "type": "server", "attributes": { "cpu_load": 0.85, "region": "eu-central" } }
    ],
    "relationships": [
      { "source": "n1", "target": "n2", "type": "connection", "attributes": { "latency": 20 } }
    ]
  },
  "visualMappings": {
    "nodes": {
      "color": { "field": "cpu_load", "mapping": "heatmap", "range": [0, 1], "colors": ["green", "red"] },
      "size": { "field": "attributes.region", "mapping": "categorical", "values": { "eu-central": 2.0, "us-east": 1.0 } }
    }
  }
}
```
*Vorteil*: Totale Flexibilität. Man kann denselben Datensatz visualisieren, um CPU-Last zu zeigen (Rot=Hoch), oder um Regionen zu zeigen (Blau=EU), indem man nur das Mapping ändert, nicht die Daten.

## 03.2 Schema-Validierung mit Zod (The Gatekeeper)

Nodges vertraut keinen externen Daten. Um Laufzeitfehler der Rendering-Engine (z.B. Absturz durch Zugriff auf `undefined` bei Koordinaten) zu verhindern, wird **Zod** eingesetzt. Zod ist eine Schema-Validierungs-Bibliothek für TypeScript.

### Warum Zod?
In reinem TypeScript sind Typen (`interface Node`) zur Laufzeit weg. Ein `JSON.parse()` liefert `any`. Wenn das JSON fehlerhaft ist, merkt man es erst, wenn die App crasht.
Zod prüft die Daten *zur Laufzeit* Byte für Byte gegen den Plan.

### Schema-Definition & Type Interference
Ein mächtiges Feature von Zod ist, dass wir den TypeScript-Typ aus dem Schema ableiten können. Das verhindert, dass Validierungscode und Type-Interfaces asynchron werden.

*(Ausschnitt aus `types.ts`)*
```typescript
import { z } from 'zod';

// 1. Definition des Schemas
export const NodeSchema = z.object({
  id: z.coerce.string(), // Erzwingt String (konvertiert Numbers)
  x: z.number().default(0), // Fills in default Werte
  y: z.number().default(0),
  z: z.number().default(0),
  label: z.string().optional(),
  // .passthrough() erlaubt unbekannte Zusatz-Properties für Flexibilität
}).passthrough();

// 2. Ableitung des Typs
export type NodeData = z.infer<typeof NodeSchema>;
```

### Error-Handling & User Feedback
Wenn Zod einen Fehler findet, ist dieser extrem präzise. Nodges fängt diese `ZodError` Objekte ab und generiert lesbare Fehlermeldungen für den Benutzer, statt kryptischer Stacktraces.
*   *Schlecht*: `Cannot read x of undefined`
*   *Nodges*: `Validation Error in 'nodes[42]': Required field 'x' is missing.`

## 03.3 Der `DataParser` & Normalisierung

Der `DataParser.ts` ist die zentrale "Waschmaschine" für Daten.

### Pipeline-Schritte

Siehe Diagramm zur Format-Erkennung: [mermaid_04.mmd](mermaid_04.mmd)

1.  **Format-Erkennung**: Der Parser scannt die Struktur ("Heuristik") und entscheidet: Legacy oder Future?
2.  **Validierung**: Das entsprechende Zod-Schema wird angewendet. Ungültige Dateien werden abgelehnt.
3.  **Normalisierung**: Egal was reinkommt, es wird in eine interne Intermediär-Struktur konvertiert.
    *   IDs werden zu Strings normalisiert.
    *   Fehlende Koordinaten werden (optional) randomisiert oder auf (0,0,0) gesetzt.
    *   Dangling Edges (Kanten zu nicht existierenden Knoten) werden bereinigt oder gemeldet.
4.  **Indexing**: Um den Zugriff in O(1) zu ermöglichen, werden Arrays in Maps (`Map<string, Node>`) umgewandelt.

### Spezialfall: Visuelle Vorberechnung
Im Schritt der Normalisierung bereitet der Parser oft schon Daten für die GPU vor. Beispielsweise werden Hex-Farbcodes (`#ff0000`) bereits in Three.js `Color`-Objekte oder normalisierte Float-Arrays (`[1.0, 0.0, 0.0]`) umgerechnet, um dies nicht in jedem Render-Frame tun zu müssen.

---
*Ende Kapitel 03*
