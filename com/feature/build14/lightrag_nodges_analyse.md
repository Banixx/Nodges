# Analyse und Integrationsplan: LightRAG fuer Nodges (Build 14)

> Version: 0.106.8  
> Stand: 27. September 2026  
> Bezug: Facharbeit HKUDS LightRAG (arXiv:2410.05779v3), Bachelorarbeit HAW Hamburg (Bannach 2025) sowie Nodges Schema 5.2

---

## 1. Ausgangsfrage und Systemverstaendnis

### 1.1 Wie erfasst LightRAG Daten und wie sieht die Kantenstruktur aus?
In klassischen Wissensgraphen (z.B. RDF/SPARQL) ist ein Tripel strikt atomar: `(Subjekt, Praedikat, Objekt)` wie `("Hans", "istVaterVon", "Anna")`.
In **LightRAG** wird der Graph jedoch LLM-zentriert und attributiert aufgebaut:
1. **Entitaeten (Knoten $V$):**
   - Schluessel (Key): `entity_name` (eindeutiger Name).
   - Attribute / Profiling ($P(V)$): `entity_type` (z.B. Person, Organisation, Ort) und `description` (zusammenfassender Fliesstext aller Fundstellen aus den Chunks) sowie Verweise auf die Quell-Chunks (`source_id` / chunk IDs).
2. **Beziehungen (Kanten $E$):**
   - LightRAG speichert **nicht** nur ein simples Praedikat, sondern ein reichhaltiges Objekt zwischen Quell- und Zielknoten:
     - `source`: z.B. `"Hans"` (Vater)
     - `target`: z.B. `"Anna"` (Tochter)
     - `relation` / `predicate`: Praedikat oder semantische Verbindung.
     - `description`: Detaillierte Erklaerung, warum und in welchem Kontext diese beiden Entitaeten in Beziehung stehen (z.B. rechtliche Verhaeltnisse, Abhaengigkeiten, historische Entwicklungen).
     - `keywords`: Globale und lokale Schluesselbegriffe, die die Beziehung thematisch zusammenfassen.
     - `weight` / `strength`: Numerische Gewichtung oder Haeufigkeit/Relevanz der Beziehung.
     - `source_id`: Verknuepfung zu den Text-Chunks, in denen diese Beziehung belegt ist.

### 1.2 Programmatischer Unterschied und Grenzen
- **Unterschied zu Triplestores:** In klassischen Triplestores sind Beziehungen ungerichtete oder gerichtete Kanten ohne intrinsische Text-Embeddings oder semantische Summarys. In LightRAG besitzt jede Kante ein eigenes Vektor-Embedding (abgeleitet aus `keywords` + `description`), wodurch Abfragen nicht nur ueber Knoten, sondern direkt ueber thematische Beziehungsqualitaeten (High-Level Keys) laufen koennen.
- **Grenzen von LightRAG:**
  - Standardmaessig fuehrt LightRAG ein Deduplizieren via String-Matching und LLM-Konsolidierung durch. Bei homonymen Begriffen oder stark kontextabhaengigen Bedeutungen kann es zu unerwuenschtem Verschmelzen kommen.
  - Das Extrahieren ist LLM-gestuetzt: Schlechte Prompts fuehren zu unstrukturierten Freitext-Praedikaten ("ist vielleicht verwandt mit", "kuemmert sich um") statt standardisierter Ontologien.
  - LightRAG erzeugt zunaechst ungerichtete/gerichtete Adjazenzlisten in NetworkX/NanoVectorDB. Es kennt per se keine 3D-Koordinaten oder visuelle Attribute (Farbe, Geometrie, Dicke, Krummung).

---

## 2. Bruecke zu Nodges: Schema 5.2 und Three.js Visualisierung

Nodges besitzt ein hochentwickeltes Visualisierungskonzept (Schema 5.2):
- **Entities:** `id`, `label`, `position` (x, y, z), `stateVector`, `behavior`, `temporal` sowie beliebige Freitext- und Kategorieneigenschaften (`passthrough`).
- **Relationships:** `id`, `source`, `target`, `relation`, `label`, `temporal` sowie dynamische Eigenschaften.
- **Visual Mappings:** Regeln, die beliebige numerische oder kategoriale Eigenschaften auf 3D-Groessen abbilden:
  - Knoten: `size`, `color`, `geometry`, `glow`, `animation`, `attraction`, `repulsion`, `inertia`.
  - Kanten: `thickness`, `color`, `curvature`, `glow`, `opacity`, `animation_flow`, `animation_pulse`.

### Was liefert LightRAG -> Wie visualisiert es Nodges?
| LightRAG Attribut | Nodges Schema 5.2 Feld | Three.js Visualisierung in Nodges |
|---|---|---|
| `entity_type` | `entity_type` (kategorial) | Knotenfarbe (`range: ['#3b82f6', ...]`), Knotengeometrie (Wuerfel, Kugel) |
| Entity Grad / Relevanz | Grad / Centrality | Knotengroesse (`size`: `linear` oder `logarithmic`) |
| Edge `weight` / `strength` | `weight` (kontinuierlich) | Kantenstaerke (`thickness`), Kantenopazitaet |
| Edge `keywords` | `keywords` / `topic` | Kantenfarbe oder Partikel-Flow |
| Edge `description` | `description` (Text) | Detail-Panel (Inspector UI) & Tooltips |
| Source Chunks | `sources` | Quelltext-Verknuepfung im UI |

---

## 3. Architektur-Konzept fuer Build 14

### 3.1 Backend-Erweiterung (`lightrag-backend/main.py`)
1. **Volle Attribut-Uebertragung:** Die Methode `process_query` muss neben `id` und `label` alle Eigenschaften (`description`, `entity_type`, `weight`, `keywords`, `source_id`) vollstaendig im JSON-Response transportieren.
2. **Gezielte Subgraphen-Filterung:** Statt starrer Knotenbegrenzung (`MAX_GRAPH_NODES`) eine K-Hop-Nachbarschaft um die semantisch treffendsten Knoten extrahieren.

### 3.2 Frontend-Erweiterung (`src/utils/LightRAGService.ts` & UI)
1. **Dynamische DataModel-Generierung:** Automatische Generierung des `dataModel` in Schema 5.2 anhand der tatsaechlich von LightRAG gelieferten Properties.
2. **Visual Presets:** Zuordnung von Kantenstaerke zu `weight` und Knotenfarbe zu `entity_type`.
3. **Dual-Level Inspektor:** Klick auf Kanten zeigt im Panel nicht nur die Beschriftung, sondern die vollstaendige Beziehungsanalyse von LightRAG.

---

## 4. Naechste Schritte
1. Pruefung der aktuellen Backend-Rueckgabe im Live-Betrieb.
2. Anpassung des JSON-Serialisierers im Backend zur Vermeidung von Informationsverlust.
3. Erweiterung der Frontend-Konvertierung in `LightRAGService.ts`.
