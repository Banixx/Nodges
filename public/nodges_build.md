# Nodges JSON-Format: Anleitung für KI-Systeme

Du bist eine KI, die JSON-Dateien für die Nodges 3D-Graph-Visualisierung generiert. Diese Anleitung definiert das **verbindliche Format** basierend auf dem `GraphDataSchema` in `types.ts`.

---

## 1. Grundstruktur (Pflichtfelder mit *)

```json
{
  "system": "Name des Systems *",
  "metadata": { ... } *,
  "dataModel": { ... },
  "visualMappings": { ... },
  "data": {
    "entities": [...] *,
    "relationships": [...] *
  } *
}
```

---

## 2. Top-Level-Felder

### 2.1 `system` (String, PFLICHT)

Eindeutiger Name des dargestellten Systems.

```json
"system": "IT-Infrastruktur Firma XYZ"
```

### 2.2 `metadata` (Object, PFLICHT)

Beschreibende Metadaten. Alle Unterfelder sind optional.

```json
"metadata": {
  "created": "2026-01-12T23:00:00Z",
  "version": "1.0",
  "author": "AI",
  "description": "Beschreibung des visualisierten Systems"
}
```

### 2.3 `dataModel` (Object, OPTIONAL)

Definiert die Struktur und Datentypen der Entities und Relationships. Ermöglicht dem System, Daten semantisch zu verstehen.

```json
"dataModel": {
  "entities": {
    "server": {
      "properties": {
        "load": { "type": "continuous", "range": [0, 100] },
        "status": { "type": "categorical", "values": ["online", "offline", "maintenance"] }
      }
    }
  },
  "relationships": {
    "connection": {
      "properties": {
        "bandwidth": { "type": "continuous", "range": [0, 1000] }
      }
    }
  }
}
```

**Property-Typen:**

| Typ | Beschreibung | Beispiel |
|-----|--------------|----------|
| `continuous` | Numerischer Wertebereich | `{ "type": "continuous", "range": [0, 100] }` |
| `categorical` | Auswahl aus definierten Werten | `{ "type": "categorical", "values": ["a", "b"] }` |
| `spatial` | 3D-Koordinaten | `{ "type": "spatial", "coordinates": ["x", "y", "z"] }` |
| `temporal` | Zeitstempel | `{ "type": "temporal" }` |
| `vector` | Mehrdimensionaler Vektor | `{ "type": "vector", "dimensions": ["x", "y"] }` |

### 2.4 `visualMappings` (Object, OPTIONAL)

Definiert das visuelle Erscheinungsbild für jeden Entity- und Relationship-Typ.

```json
"visualMappings": {
  "defaultPresets": {
    "server": {
      "color": { "source": "constant", "function": "linear", "params": { "color": "#ff4d4d" } },
      "size": { "source": "constant", "function": "linear", "range": [3.0, 3.0] }
    },
    "connection": {
      "color": { "source": "constant", "function": "linear", "params": { "color": "#00ff00" } },
      "thickness": { "source": "constant", "function": "linear", "range": [0.1, 0.1] },
      "animation": { "source": "constant", "function": "pulse", "params": { "frequency": 2.0, "speed": 1.0 } }
    }
  }
}
```

**Visual Mapping Struktur:**

```json
{
  "source": "constant",       // Datenquelle: "constant" oder Feldname
  "function": "linear",       // Mapping-Funktion
  "range": [min, max],        // Wertebereich (für size, thickness, opacity)
  "params": { ... }           // Funktionsparameter
}
```

**Entity-Eigenschaften:** `color`, `size`, `geometry`, `glow`, `opacity`, `animation`
**Relationship-Eigenschaften:** `color`, `thickness`, `curvature`, `glow`, `opacity`, `animation`

**Best Practice: Visuelle Metaphern (Semantisches Mapping)**
Wähle deine `visualMappings` so, dass sie intuitiv Sinn ergeben. Nutze visuelle Metaphern für abstrakte Daten:
- Eine "schwache" oder "getrennte" Beziehung bekommt eine geringere `thickness` (Dünne Linie = schwaches Band).
- Wichtigere Nodes bekommen eine größere `size` oder ein helleres `glow`.
- Inaktive oder verstorbene Elemente bekommen eine geringere `opacity` (Verblassen).
- Warnungen oder hohe Auslastung mappen auf Farben wie Rot (Heatmap).

**Mapping-Funktionen:**

| Funktion | Zweck |
|----------|-------|
| `linear` | Lineare Skalierung (Standard) |
| `pulse` | Pulsierende Animation für Edges |
| `heatmap` | Farbverlauf basierend auf Wert |
| `exponential` | Exponentielles Mapping |
| `logarithmic` | Logarithmisches Mapping |

### 2.5 `data` (Object, PFLICHT)

Enthält die tatsächlichen Datenelemente.

---

## 3. Entities (Nodes)

Jede Entity repräsentiert einen Knoten im Graph.

**WICHTIGE REGEL: Maximaler Datenreichtum!** Generiere so viele semantisch sinnvolle Eigenschaften wie möglich für jeden Knoten. Das System filtert nicht vorab, sondern bietet dem User diese zur Laufzeit für sein Visual Mapping an.
**WICHTIGE REGEL: Flache Struktur!** Alle diese Zusatz-Eigenschaften müssen direkt auf der Top-Level-Ebene des Entity-Objekts liegen (NICHT in einem verschachtelten `properties`-Objekt).

```json
{
  "id": "server_01",
  "type": "server",
  "label": "Hauptserver",
  "position": { "x": 0, "y": 10, "z": -5 },
  "load": 75,
  "status": "online",
  "region": "eu-central",
  "maintenance_cost": 1500,
  "uptime_days": 420
}
```

**Pflichtfelder:**

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | String | Eindeutige ID (keine Leerzeichen!) |
| `type` | String | Muss mit Key in `visualMappings.defaultPresets` übereinstimmen |

**Optionale Felder:**

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `label` | String | Anzeigename (kann Leerzeichen enthalten) |
| `position` | Object | 3D-Position `{ x, y, z }`, Wertebereich empfohlen: -100 bis +100 |

**Beliebige Zusatzfelder** (wie `load`, `status`, `region`) sind erwünscht, müssen flach auf Top-Level liegen und sollten idealerweise im `dataModel` definiert sein.

---

## 4. Relationships (Edges)

Jede Relationship verbindet zwei Entities. Auch hier gilt: Erzeuge so viele sinnvolle Kanten-Eigenschaften wie möglich als flache Felder!

```json
{
  "id": "conn_01",
  "type": "connection",
  "source": "server_01",
  "target": "server_02",
  "label": "Datenverbindung",
  "bandwidth": 500,
  "latency": 20,
  "protocol": "TCP"
}
```

**Pflichtfelder:**

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `type` | String | Muss mit Key in `visualMappings.defaultPresets` übereinstimmen |
| `source` | String | ID der Start-Entity (MUSS existieren!) |
| `target` | String | ID der Ziel-Entity (MUSS existieren!) |

**Optionale Felder:**

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | String | Eindeutige ID der Relationship |
| `label` | String | Anzeigename |
| `offset` | Number | Versatz bei mehreren Edges zwischen gleichen Nodes |

---

## 5. Validierungs-Checkliste

Vor der Ausgabe prüfen:

- [ ] Valides JSON? (Keine Kommentare, keine Trailing Commas)
- [ ] `system` vorhanden und nicht leer?
- [ ] `metadata` vorhanden?
- [ ] `data.entities` ist ein Array?
- [ ] `data.relationships` ist ein Array?
- [ ] Jede Entity hat `id` und `type`?
- [ ] Jede Relationship hat `type`, `source` und `target`?
- [ ] Alle `source` und `target` IDs existieren in entities?
- [ ] Für jeden verwendeten `type` gibt es einen Eintrag in `visualMappings.defaultPresets`?
- [ ] Keine doppelten IDs bei Entities?
- [ ] Alle Zusatz-Eigenschaften sind flach auf dem Objekt platziert (kein `properties`-Sub-Objekt)?

---

## 6. Positionierungsstrategien

### Räumliche Systeme (Anatomie, Geografie, etc.)

Nutze reale Relationen für x/y/z.

### Abstrakte Systeme (Software, Organisationen, etc.)

- **Y-Achse:** Hierarchieebene (oben = wichtiger/übergeordnet)
- **X/Z-Ebene:** Thematische Gruppierung/Cluster
- **Zentral:** Wichtige Kernelemente
- **Peripher:** Untergeordnete Elemente

### Allgemeine Tipps

- Mindestabstand zwischen Nodes: ca. 5-10 Einheiten
- Y-Koordinate > 0 empfohlen (über dem Bodengitter)
- Logische Cluster räumlich gruppieren

---

## 7. Vollständiges Minimal-Beispiel

```json
{
  "system": "Einfaches Netzwerk",
  "metadata": {
    "created": "2026-01-12T23:00:00Z",
    "version": "1.0",
    "author": "AI",
    "description": "Minimales Beispiel mit 2 Nodes und 1 Edge"
  },
  "visualMappings": {
    "defaultPresets": {
      "node": {
        "color": { "source": "constant", "function": "linear", "params": { "color": "#4488ff" } },
        "size": { "source": "constant", "function": "linear", "range": [2.0, 2.0] }
      },
      "link": {
        "color": { "source": "constant", "function": "linear", "params": { "color": "#ffffff" } },
        "thickness": { "source": "constant", "function": "linear", "range": [0.1, 0.1] }
      }
    }
  },
  "data": {
    "entities": [
      { "id": "a", "type": "node", "label": "Node A", "position": { "x": -10, "y": 5, "z": 0 } },
      { "id": "b", "type": "node", "label": "Node B", "position": { "x": 10, "y": 5, "z": 0 } }
    ],
    "relationships": [
      { "id": "e1", "type": "link", "source": "a", "target": "b", "label": "Verbindung" }
    ]
  }
}
```

---

## 8. Häufige Fehler vermeiden

| Fehler | Lösung |
|--------|--------|
| `source`/`target` verweist auf nicht-existente ID | Prüfe Entity-IDs vor Relationship-Erstellung |
| `type` hat keinen Visual Mapping Eintrag | Füge jeden `type` zu `defaultPresets` hinzu |
| Leerzeichen in IDs | Verwende Unterstriche: `server_01` statt `server 01` |
| Trailing Commas | Entferne Komma nach letztem Array/Object-Element |
| Nodes überlappen | Mindestabstand von 5-10 Einheiten einhalten |
| Nodes unter dem Boden | Y-Koordinate sollte > 0 sein |
