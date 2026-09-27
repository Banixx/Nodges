# 04 Datenmodell und Validierung

Dieses Kapitel dokumentiert das zugrunde liegende Datenmodell von Nodges in Version **0.106.8**, die Mechanismen der Schema-Normalisierung ueber den `DataParser`, die zeitliche Modellierung (4D) und die strikte Laufzeitvalidierung mittels Zod.

---

## 1. Das Graphen-Paradigma: Flach und Beziehungszentriert

> **Visualisierung:** Siehe [04_FlatvsDeeplyNested_003.mmd](04_FlatvsDeeplyNested_003.mmd)

Nodges erzwingt eine strikte, flache Organisation saemtlicher Graphdaten. Verschachtelte Baumstrukturen oder eingebettete Arrays stellen in einer dreidimensionalen Netzwerksimulation ein gravierendes Anti-Pattern dar:

```
[Anti-Pattern: Verschachtelt]               [Nodges-Standard: Flach]
┌───────────────────────────────┐           ┌──────────────┐     ┌──────────────┐
│ Entity: "Konzern"             │           │ Entity:      │────►│ Entity:      │
│   ├── subDepartments: [...]   │           │ "Konzern"    │     │ "Abteilung"  │
│   └── employees: [...]        │           └──────────────┘     └──────┬───────┘
└───────────────────────────────┘                   ▲                   │
(Nicht raeumlich layoutbar)                         │     works_in      │
                                                    └───────────────────┘
                                                  (Explizite Kantenfedern)
```

### 1.1 Verbot verschachtelter Entitaeten
- Beziehungen zwischen Entitaeten duerfen **niemals** als Sub-Objektlisten innerhalb eines Knotens hinterlegt werden.
- **Begruendung:** Physik- und Layout-Engines (z. B. Force-Directed 3D) koennen Kraefte und Abstaende ausschliesslich zwischen diskreten Knotenpunkten ueber Kantenfedern berechnen. Verschachtelungen wuerden das topologische Gefuege fuer Algorithmen unsichtbar machen.

### 1.2 Kanten als vollwertige Entitaeten (First-Class Relationships)
Kanten sind eigenstaendige Datenelemente mit eindeutiger ID, Typisierung und eigenem `properties`-Dictionary. Dadurch koennen Attribute wie Uebertragungskapazitaet, Vertrauensindex, Frequenz oder historische Dauer direkt an der Kante visualisiert werden (z. B. ueber Liniendicke, Farbspektrum oder Partikel-Flussgeschwindigkeit).

---

## 2. Das JSON-Graphschema (Version 5.0 / 5.2)

> **Visualisierung:** Siehe [04_JsonSchemaStruktur_001.mmd](04_JsonSchemaStruktur_001.mmd)

Das Datenformat gliedert sich in vier klar getrennte Sektionen:

```json
{
  "dataModel": {
    "nodeTypes": [
      { "id": "server", "label": "Server-Knoten", "properties": [] }
    ],
    "edgeTypes": [
      { "id": "connects_to", "label": "Verbindung", "properties": [] }
    ]
  },
  "visualMappings": {
    "nodes": {
      "color": { "property": "type", "scale": "categorical" },
      "size": { "property": "load", "scale": "linear" }
    },
    "edges": {
      "width": { "property": "bandwidth", "scale": "linear" }
    }
  },
  "entities": [
    {
      "id": "srv_01",
      "type": "server",
      "label": "Auth-Gateway",
      "properties": { "load": 78, "region": "eu-central" },
      "temporal": {
        "validFrom": 2024,
        "validTo": 2026
      }
    }
  ],
  "relationships": [
    {
      "id": "rel_01",
      "source": "srv_01",
      "target": "srv_02",
      "type": "connects_to",
      "properties": { "bandwidth": 1000 }
    }
  ]
}
```

### 2.1 Temporale Datenmodellierung (4D-Keyframes)

> **Visualisierung:** Siehe [04_TemporalesObjektKeyframes_004.mmd](04_TemporalesObjektKeyframes_004.mmd)

Sowohl Knoten als auch Kanten unterstuetzen das optionale `temporal`-Objekt fuer zeitbasierte Analysen:
- **`validFrom` / `validTo`:** Bestimmt das zeitliche Existenzintervall eines Elements im Szenengraphen. Ausserhalb dieses Intervalls wird das Element ueber Ghosting ausgeblendet oder vollstaendig aus dem Rendering entfernt.
- **`history`:** Eine chronologische Liste von Keyframes. Nodges vermeidet Datenredundanz durch Speicherung von **Deltas**: Nur Eigenschaften, die sich zu einem bestimmten Zeitstempel aendern, sind im `changes`-Dictionary hinterlegt.

---

## 3. Laufzeitvalidierung und Schema-Normalisierung

### 3.1 Zod-Laufzeitpruefung
TypeScript-Typen bieten ausschliesslich Pruefung zur Entwicklungszeit (Compile-Time). Da Daten dynamisch ueber APIs, Datei-Uploads oder Drag-and-Drop in den Client fliessen, sichert **Zod 3.22.4** die Systemstabilitaet zur Laufzeit:
- Alle Payloads muessen `GraphDataSchema.parse()` erfolgreich durchlaufen.
- Syntaxfehler, ungueltige Datentypen oder verwaiste Kantenreferenzen (Kanten, deren `source` oder `target` im `entities`-Array fehlt) fuehren zu einem kontrollierten Abbruch mit klarer Fehlermeldung, bevor Three.js-Aufrufe stattfinden.

### 3.2 Rueckwaertskompatibilitaet im `DataParser`
Der `DataParser` unterstuetzt Altdatenformate (Schemata 3.0 bis 5.0) und normalisiert eingehende Datenstrukturen verlustfrei auf den aktuellen Standard 5.2.

### 3.3 Automatischer JSON-Schema Export
Ueber den Build-Befehl:
```bash
npm run export:schema
```
wird das Zod-Schema automatisch in standardisierte JSON-Schema-Dateien uebersetzt. Diese Dateien dienen KI-Providern als restriktive Parameter (`response_format`) fuer deterministische Ausgaben.

---

## 4. Der Lebenszyklus beim Laden von Graphdaten (`loadGraphData`)

> **Visualisierung:** Siehe [04_LoadGraphDataLebenszyklus_002.mmd](04_LoadGraphDataLebenszyklus_002.mmd)

Der Ladevorgang in `App.ts` folgt einer strikten Sequenz, um Speicherlecks (VRAM-Leaks) in WebGL auszuschliessen:

1. **Ingestion & Parsing:** Einlesen des JSON-Strings via `DataParser`.
2. **Schema-Validierung:** Pruefung gegen das Zod-Schema.
3. **State-Aktualisierung:** Uebergabe an den `StateManager`, der als Single Source of Truth im Frontend fungiert und Subscriber benachrichtigt.
4. **VRAM Cleardown:** Gezieltes Freigeben alter GPU-Ressourcen ueber `.dispose()` auf Geometrien, Materialien und Shadern.
5. **Re-Instanziierung:** Aufbau der neuen 3D-Meshes (InstancedMesh) im `NodeManager` und `EdgeObjectsManager`.
6. **UI-Synchronisation:** Dynamische Aktualisierung der Mapping-Panels und Slider auf Basis des neu geladenen `dataModel`.
