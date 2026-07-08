# Nodges Build 4 — Spezifikation (Temporal & Geospatial)

Diese Spezifikation erweitert Build 3 um zwei neue Dimensionen: **Zeitliche Verläufe (Temporal)** und **Geographische Verortung (Geospatial)**. Sie ist vollständig abwärtskompatibel – jede Build-3-Datei bleibt gültig.

Das korrekte Setzen von `"schemaVersion": "4.0"` in den Metadaten ist **Pflicht**, damit die Engine die Build-4-Features aktiviert und korrekt rendert.

## 1. Unterschiede zu Build 3

| Merkmal | Build 3 | Build 4 |
|---|---|---|
| `schemaVersion` | `"3.0"` | `"4.0"` |
| Zeitdimension | – | `temporal` Objekt in Entities und Relationships |
| Karte/Geo | – | `map` in `metadata`, `mapX`/`mapY` in Entities |
| Beziehungen | `source`/`target` | `source`/`target` **oder** `start`/`end` (Alias) |
| Zeitabspieler | – | TimePlayer-UI aktiviert automatisch |

---

## 2. Top-Level-Struktur

```json
{
  "system": "Mein_Netzwerk",
  "metadata": {
    "schemaVersion": "4.0",
    "created": "2026-07-05",
    "description": "Optionale Beschreibung",
    "map": {
      "image": "Switzerland.jpg",
      "referenceWidth": 100,
      "referenceHeight": 70
    }
  },
  "dataModel": { ... },
  "fields": [ ... ],
  "visualMappings": { ... },
  "data": {
    "entities": [ ... ],
    "relationships": [ ... ]
  }
}
```

Das `map`-Objekt in `metadata` ist **optional**. Wenn es vorhanden ist, wird die angegebene Bilddatei als Hintergrundkarte geladen. Das Bild muss im `/public`-Verzeichnis des Projekts liegen.

---

## 3. Temporal-Daten

### 3.1 Das `temporal`-Objekt in Entities

Jede Entity kann ein optionales `temporal`-Objekt besitzen:

```json
{
  "id": "node_a",
  "type": "person",
  "label": "Alice",
  "temporal": {
    "validFrom": 0,
    "validTo": 100,
    "history": [
      {
        "timestamp": 0,
        "changes": {
          "size": 1.0,
          "color": "#ff0000"
        }
      },
      {
        "timestamp": 50,
        "changes": {
          "size": 2.5,
          "color": "#00ff00",
          "position": { "x": 5, "y": 0, "z": 3 }
        }
      },
      {
        "timestamp": 100,
        "changes": {
          "size": 1.5,
          "color": "#0000ff"
        }
      }
    ]
  }
}
```

**Felder:**
- `validFrom` (Zahl oder ISO-8601-String, optional): Zeitpunkt, ab dem die Entity existiert.
- `validTo` (Zahl oder ISO-8601-String, optional): Zeitpunkt, bis zu dem die Entity existiert. `null` = bis in die Gegenwart.
- `history` (Array, optional): Liste von Keyframes. Jeder Keyframe hat:
  - `timestamp`: Zeitstempel des Keyframes.
  - `changes`: Objekt mit Eigenschaftsänderungen. Unterstützte Felder: `size`, `color`, `position` (`{x, y, z}`).

Die Engine interpoliert zwischen Keyframes linear. Vor dem ersten Keyframe gelten die Basis-Werte der Entity.

### 3.2 Das `temporal`-Objekt in Relationships

Relationships können ebenfalls einen Lebenszyklus haben:

```json
{
  "id": "edge_1",
  "type": "verbindung",
  "source": "node_a",
  "target": "node_b",
  "temporal": {
    "validFrom": 20,
    "validTo": 80
  }
}
```

In Relationships wird derzeit nur `validFrom`/`validTo` unterstützt. Keine `history`.

---

## 4. Geospatial-Verortung

Wenn `metadata.map` definiert ist, können Entities auf der Karte positioniert werden:

```json
{
  "id": "zuerich",
  "type": "city",
  "label": "Zürich",
  "mapX": -10.5,
  "mapY": -4.2
}
```

**Felder:**
- `mapX` / `mapY`: Position auf der Karte relativ zur Kartenmitte. Einheit entspricht `referenceWidth`/`referenceHeight` aus dem `map`-Objekt.

Entities mit `mapX`/`mapY` werden beim Layout-Algorithmus **fixiert** und bewegen sich nicht.

---

## 5. Beziehungen: `start`/`end` als Alias

In Build 4 ist `start`/`end` ein gleichwertiges Alias für `source`/`target`:

```json
{
  "id": "edge_1",
  "type": "route",
  "start": "zuerich",
  "end": "bern"
}
```

Dies ist äquivalent zu `"source": "zuerich", "target": "bern"`. Beide Schreibweisen werden vom Parser akzeptiert und normalisiert.

---

## 6. Vollständiges Referenz-JSON (Template Build 4)

```json
{
  "system": "Schweizer_Staedte",
  "metadata": {
    "schemaVersion": "4.0",
    "created": "2026-07-05",
    "description": "Schweizer Städte mit Bevölkerungswachstum 2000–2030",
    "map": {
      "image": "Switzerland.jpg",
      "referenceWidth": 100,
      "referenceHeight": 70
    }
  },
  "dataModel": {
    "properties": {
      "population": {
        "type": "continuous",
        "range": [0, 500000]
      }
    }
  },
  "fields": [],
  "visualMappings": {
    "defaultPresets": {
      "city": {
        "geometry": "sphere",
        "color": "#3498db"
      },
      "route": {
        "color": "#ffffff"
      }
    }
  },
  "data": {
    "entities": [
      {
        "id": "zuerich",
        "type": "city",
        "label": "Zürich",
        "population": 400000,
        "mapX": -10,
        "mapY": -5,
        "temporal": {
          "validFrom": 0,
          "validTo": 100,
          "history": [
            { "timestamp": 0, "changes": { "size": 1.0, "color": "#ff4444" } },
            { "timestamp": 50, "changes": { "size": 2.0, "color": "#44ff44" } },
            { "timestamp": 100, "changes": { "size": 1.5, "color": "#4444ff" } }
          ]
        }
      },
      {
        "id": "genf",
        "type": "city",
        "label": "Genf",
        "population": 200000,
        "mapX": -30,
        "mapY": 15,
        "temporal": {
          "validFrom": 20,
          "validTo": 80
        }
      }
    ],
    "relationships": [
      {
        "id": "strecke_zh_ge",
        "type": "route",
        "source": "zuerich",
        "target": "genf",
        "temporal": {
          "validFrom": 20,
          "validTo": 80
        }
      }
    ]
  }
}
```

---

## 7. Hinweise für KIs / LLMs

1. **`schemaVersion` muss `"4.0"` sein** (String, nicht Zahl).
2. **`temporal.validFrom` / `temporal.validTo`** können Zahlen (z. B. Jahre: `2000`) oder ISO-8601-Strings (`"2000-01-01"`) sein. Zahlen sind für Zeitachsen ohne Datumsbezug einfacher.
3. **`history`-Keyframes** müssen chronologisch sortiert sein.
4. **`mapX`/`mapY`** sind nur sinnvoll, wenn `metadata.map` definiert ist.
5. `start`/`end` können anstelle von `source`/`target` verwendet werden – **aber nicht mischen** (pro Relationship entweder das eine oder das andere).
6. Entities **ohne** `temporal` sind immer sichtbar (Build-3-Kompatibilität).

---

## 8. Troubleshooting

- **Engine zeigt keine Zeitachse:** Prüfe, ob mindestens eine Entity ein `temporal`-Objekt hat.
- **Karte wird nicht geladen:** Bildpfad in `metadata.map.image` muss relativ zu `/public` sein.
- **Entities erscheinen nicht auf der Karte:** `mapX`/`mapY` fehlen oder `metadata.map` ist nicht definiert.
- **Relationship erscheint nicht:** `validFrom`/`validTo` ausserhalb des aktuellen Zeitfensters.
