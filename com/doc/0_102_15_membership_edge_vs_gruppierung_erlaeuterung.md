# Erlaeuterung: Membership-Relation -- Edge vs. Gruppierung

> Version: 0.102.15 -- Stand: 28. Juli 2026

---

## 1. Status Quo in den B12-JSON-Daten

In den generierten B12-JSON-Dateien (`B12_Graph_01_28.json`) ist `membership` **aktuell eine Kante (Edge)** und **keine explizite Gruppe (Container)**.

### Struktur im JSON:
- **Knoten 1:** `Bundesrat` (Typ: `organization`)
- **Knoten 2:** `Guy Parmelin` (Typ: `person`)
- **Kante (Edge):**
  ```json
  {
    "id": "rel_lightrag_22_Bundesrat_Guy Parmelin",
    "source": "Bundesrat",
    "target": "Guy Parmelin",
    "relation": "membership",
    "label": "membership"
  }
  ```

---

## 2. Der Unterschied zwischen Kante und Gruppierung

| Merkmal | Kante (`membership` als Edge) | Gruppierung (`groupId` / Container) |
| :--- | :--- | :--- |
| **Darstellung** | Eine Verbindungslinie zwischen Person und Institution | Ein gemeinsamer Raumbereich, Farbfeld oder Bounding-Box um alle Mitglieder |
| **Graph-Physik** | Im Force-Directed Layout ziehen die Kanten die 7 Personen sternfoermig um den Knoten `Bundesrat` zusammen. | Im Gruppen-Layout werden alle Knoten mit derselben `groupId` in einen eigenen Raumabschnitt gesetzt. |
| **Herkunft** | Wird direkt von LightRAG als Verb/Beziehung aus dem Text extrahiert. | Erfordert eine Gruppenzuordnung im Schema oder ein Post-Processing. |

---

## 3. Wie aus der Kante eine Gruppierung wird

Wenn Sie in Nodges moechten, dass der `Bundesrat` nicht nur ein Zentralknoten mit Linien ist, sondern eine echte **Gruppe im Raum**:

1. **Implizite Gruppierung ueber Force Graph:**
   Die 7 `membership`-Kanten wirken im Force Graph automatisch als Zugkraefte. Der Knoten `Bundesrat` zieht alle 7 Bundesraete um sich herum in eine physikalische Gruppe (Cluster).

2. **Explizite Gruppierung ueber Post-Processing:**
   Ein kleines Skript liest alle Knoten mit einer `membership`-Kante zum Knoten `Bundesrat` aus und weist diesen Personen automatisch das Attribut `group: "Bundesrat"` oder `groupId: "group_bundesrat"` zu.
   Dadurch kann Nodges im Mapping-Panel nach `group` filtern oder die Personen auf eine eigene Gruppen-Ebene im 3D-Raum platzieren.
