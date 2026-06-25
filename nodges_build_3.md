# Nodges Build 3 — Die vollständige Spezifikation

Diese Spezifikationsanleitung definiert das verbindliche Format für die Generierung von JSON-Datensätzen zur Einspeisung in die Nodges 3D-Thermodynamik- & Multi-Sensorik-Visualisierungs-Engine (Build 3).
Dieses Format läuft parallel zu Build 2. Beim Erstellen von Daten kann der Nutzer die Version wählen, und beim Laden wird die Version des Builds im Mapping Panel angezeigt. Daher ist das korrekte Setzen der `schemaVersion` essenziell.

## 1. Syntax-Grundregeln & Architekturparadigmen
Damit die Rendering-Engine die Daten fehlerfrei interpretieren kann, müssen folgende syntaktische und strukturelle Regeln ohne Ausnahme eingehalten werden:
- **Absolut valides JSON:** Keine Kommentare (`//` oder `/* */`) sind innerhalb der Datei erlaubt.
- **Keine Trailing Commas:** Das letzte Element in einem Array oder Objekt darf kein nachfolgendes Komma besitzen.
- **Maximale Datenflachheit:** Alle anwenderspezifischen Attribute müssen flach auf der obersten Ebene des `stateVector`-Objekts liegen. Verschachtelte Objekte innerhalb der Zustandsdaten sind strikt untersagt, da sie die Laufzeit-Ummeldung des interaktiven Visual Mappings blockieren.

## 2. Top-Level-Struktur (Pflichtfelder)
Jedes konforme JSON-Dokument der Build 3 Architektur muss auf der obersten Ebene exakt die folgenden fünf Hauptschlüssel enthalten:
- `system` (String, PFLICHT): Eindeutiger Name des zu visualisierenden Ökosystems.
- `metadata` (Object, PFLICHT): Beschreibende Metadaten. **Hier ist `schemaVersion` zwingend erforderlich** (z. B. "3.0"), da das UI (Mapping Panel) diese Version anzeigt und parallel auch Build 2 unterstützt.
- `dataModel` (Object, PFLICHT): Registrierung der mathematischen Datentypen für die semantische Skalierung.
- `fields` (Array, PFLICHT): Definition der den Raum krümmenden Kraft- und Attraktorenfelder.
- `data` (Object, PFLICHT): Der eigentliche Graph, aufgeteilt in `entities` und `relationships`.

## 3. Das mathematische Datenmodell (dataModel)
Das `dataModel` deklariert die Struktur der Attribute im `stateVector`. Es erlaubt dem System, nackte Zahlenwerte semantisch zu interpretieren und automatische Normalisierungen vorzunehmen:
- **continuous:** Numerischer Wertebereich mit expliziter Ober- und Untergrenze.
  *Beispiel:* `{"type": "continuous", "range": [0, 100]}`
- **categorical:** Diskrete Zustandswerte. Erfordert mindestens 3 unterschiedliche Zustände im System für ein automatisches Farb-Mapping.
  *Beispiel:* `{"type": "categorical", "values": ["nominal", "warning", "critical"]}`
- **vector:** Mehrdimensionale Dynamiken zur Erfassung von Strömungen und Trends.
  *Beispiel:* `{"type": "vector", "dimensions": ["value", "derivative", "acceleration"]}`

## 4. Topodynamische Raumkrümmung (fields)
Entitäten besitzen keine festen x, y, z-Koordinaten mehr. Die räumliche Anordnung wird im Client als thermodynamische Partikelsimulation berechnet. Felder krümmen den Raum, und Knoten bewegen sich autonom in ihr euklidisches Gleichgewicht.
- **attractor_field:** Zieht stabile Kern-Infrastrukturen oder logische Zentral-Komponenten an feste Ankerpunkte im Raum.
- **gravitational_field:** Erzeugt anziehende oder abstoßende Zonen im Raum (z. B. "Druckzonen"), welche die Positionierung volatiler Knoten dynamisch beeinflussen.

**Der euklidische Mindestabstand:** Um visuelle Überlagerungen ("Hairballs") zu verhindern, erzwingt die Engine einen Mindestabstand von 5 Einheiten zwischen den Knoten.

## 5. Datenstrukturen (data)
### 5.1 Entities (Die prädiktiven Vektor-Knoten)
Jeder Knoten repräsentiert eine Entität und liefert über seinen `stateVector` die physikalischen Zustände inklusive Veränderungsrate und Beschleunigung.
- **ID-Regel:** Jede ID muss eindeutig sein und darf keine Leerzeichen enthalten (Nutze Unterstriche).

### 5.2 Relationships (Klassisch & Hyperedges)
Beziehungen verbinden die Knoten.
- **Binär-Verbindung:** Klassische Verknüpfung via `source` und `target` (inklusive optionaler visueller Attribute wie `thickness` und `curvature`).
- **Hyperedge:** Eine n:m-Verbindung über das `nodes`-Array. Es umschließt ein ganzes Sub-Cluster simultan.

## 6. Multi-Sensorisches Mapping (visualMappings)
- **geometry:** `vector_spline` oder alternative Geometrien für die Visualisierung im Raum.
- **color:** Automatisches Mapping (z. B. über Heatmaps für kontinuierliche Daten oder Kategorien).
- **audio:** 3D-Sonifikation. Trigger für Dissonanzen bei Anomalien (optional, aber empfohlen).

## 7. Vollständiges Referenz-JSON (Template Build 3)
```json
{
  "system": "Yggdrasil_Tree_Ecosystem",
  "metadata": {
    "version": "3.0",
    "schemaVersion": "3.0",
    "engine": "Nodges_Thermodynamic_Simulation",
    "timestamp": "2026-06-25T12:00:00Z"
  },
  "dataModel": {
    "properties": {
      "health_status": {
        "type": "categorical",
        "values": ["thriving", "nominal", "stressed", "dying"]
      },
      "nutrient_flow": {
        "type": "vector",
        "dimensions": ["value", "derivative", "acceleration"]
      }
    }
  },
  "fields": [
    {
      "id": "sunlight_attractor",
      "type": "attractor_field",
      "center": { "x": 0, "y": 150, "z": 0 },
      "strength": 8.5,
      "influenceRadius": 200.0,
      "behavior": "attractive_to_leaves"
    }
  ],
  "visualMappings": {
    "defaultPresets": {
      "leaf": {
        "geometry": "vector_spline",
        "trailLength": 48,
        "color": {
          "function": "categorical",
          "field": "stateVector.health_status"
        }
      }
    }
  },
  "data": {
    "entities": [
      {
        "id": "leaf_cluster_01",
        "type": "leaf",
        "label": "Sunlit Leaves",
        "stateVector": {
          "health_status": "thriving",
          "nutrient_flow": {
            "value": 20.0,
            "derivative": 5.0,
            "acceleration": 1.1
          }
        },
        "behavior": "attracted_to_sunlight"
      }
    ],
    "relationships": [
      {
        "id": "flow_branchE_leaf1",
        "type": "phloem_flow",
        "source": "branch_east",
        "target": "leaf_cluster_01",
        "thickness": 1.0,
        "curvature": 0.5
      }
    ]
  }
}
```

## 8. Validierungs- und Troubleshooting-Protokoll
- **ParserError: Invalid token...**: Ein Trailing Comma am Array-Ende oder ein verbotener Inline-Kommentar (`//`).
- **Collision: Node overlap**: Der euklidische Abstand sank unter den Schwellenwert. Erhöhe die Stärke oder den Radius des abstoßenden `gravitational_field`.
- **MappingBypassException**: Strukturierte Custom-Metriken wurden tief verschachtelt. Flache alle Metriken direkt als einfache Key-Value-Paare in das `stateVector`-Objekt ab.
- **OrphanedRelationError**: Eine Beziehung referenziert eine nicht existierende Entity-ID. Verifiziere alle IDs.
- **MissingSchemaVersionError**: Die `schemaVersion` fehlt in den Metadaten. Sie ist in Build 3 zwingend erforderlich, damit das Mapping Panel die korrekte Formatversion (Build 3 vs Build 2) anzeigen kann.
