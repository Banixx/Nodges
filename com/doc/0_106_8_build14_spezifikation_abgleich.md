# Analyse & Abgleich: Build 14 Spezifikation vs. Bisheriger Umsetzungsstand

> Version: 0.106.8  
> Stand: 27. September 2026  
> Referenzdokument: `W:/com/plan/build14/build14-spezifikation.md` (614 Zeilen)  
> Statusabgleich mit: `com/plan/build14/rapport_build14.md` und `lightrag-backend/main.py`

---

## 1. Zentrale These der Spezifikation
Die Datei `build14-spezifikation.md` formuliert ein fundamentales Leitmotiv:
> **"Belegte Beziehungen aus Daten und unstrukturiertem Text: Detailreiche Kanten statt einer Sammelkante pro Entitaetspaar, jede Kante mit Beleg (Textstelle, Datei, Chunk-ID)."**

Waehrend Build 12 den Rohgraphen ungefiltert uebernommen hat und Build 13 Beziehungen frei durch ein LLM synthetisiert, fordert Build 14 **evidenzbasierte, nachvollziehbare Einzelkanten**.

---

## 2. Detaillierter Vergleich nach den 5 Stufen der Architektur

### Stufe A: Aufnahme (Ingestion) & Provenienz
- **Spezifikation (Abschnitt 5):**
  - Abkehr von `ainsert()` hin zu `apipeline_enqueue_documents()` mit `doc_id`, `file_path`, `process_options`.
  - Gezielte Chunker-Strategien (`P` = Paragraph-Semantic fuer Rechts- und Fachtexte).
  - Neues Domnaen-Prompt-Profil (`ENTITY_TYPE_PROMPT_FILE`) fuer kontrollierte Kategorien und standardisierte Praedikate.
  - Endpunkte: `POST /documents`, `GET /documents/status`, `GET /documents/list`, `DELETE /documents/{id}`.
- **Aktueller Stand:**
  - `main.py` nutzt weiterhin `ainsert(text)`.
  - Keine separate Pipeline-Steuerung, keine `doc_id` / `file_path` Uebergabe.
- **Handlungsbedarf:** Umstellung der Aufnahme-Endpunkte gemaess M1.

---

### Stufe B: Retrieval – Subgraph vs. `aquery_data`
- **Spezifikation (Abschnitt 6):**
  - Nutzung der nativen LightRAG-Funktion `rag.aquery_data(query, param)`.
  - Liefert direkt die strukturierte 4-Teilung: `entities`, `relationships`, `chunks`, `references`.
  - Keine starre Begrenzung (`MAX_GRAPH_NODES`), sondern Steuerung ueber `top_k`, `chunk_top_k` und Token-Budgets.
- **Aktueller Stand (piCon Update in main.py):**
  - piCon hat die Subgraphen-BFS ueber `rag_instance.chunk_entity_relation_graph.get_knowledge_graph(seed, max_depth)` implementiert, wobei Seeds ueber `entities_vdb.query` ermittelt werden.
  - Das loest das fruehere Problem des ungefilterten Gesamtgraphen-Slicings bereits hervorragend im REST-Endpunkt `/query`.
- **Handlungsbedarf:**
  - Pruefung, ob `/query/data` (ueber `aquery_data`) als zusaetzlicher Endpunkt ergaenzt werden soll, da `aquery_data` die exakten Chunks und Zitate mitliefert.

---

### Stufe C: Datenvertrag & Kantenexpansion (Kern von Build 14!)
- **Spezifikation (Abschnitt 7):**
  - **Aus 1 LightRAG-Relation werden $n$ nodges-Kanten!**
  - LightRAG buendelt Beziehungen zwischen Entitaeten intern zu einer Sammelkante mit kommagetrennten `keywords` und `<SEP>`-getrennten `description`-Bloecken.
  - Spezifikation verlangt eine deterministische **Expansion**:
    1. Zerlege `keywords` in Einzelliste $K$.
    2. Zerlege `description` an `<SEP>` in Liste $D$.
    3. Paarung durchfuehren (`len(K) == len(D)` -> Index-Paarung mit `paarung: "exakt"`; sonst gesamte Beschreibung mit `paarung: "unsicher"`).
    4. Generiere je Keyword eine eigene nodges-Kante (`id`, `relation`, `evidence`, `source_id`, `file_path`).
- **Aktueller Stand:**
  - piCon liefert im DTO bereits `keywords` als Array und `description` als Gesamtstring sowie `sources` als Array.
  - **Die Aufspaltung in mehrere parallele Kanten fehlt noch!** Aktuell wird im Frontend (`LightRAGService.ts`) noch 1 Edge erzeugt.
- **Handlungsbedarf:**
  - Umsetzung der Kantenexpansion (entweder in `main.py` oder in `LightRAGService.ts`), sodass Nodges die Three.js-Parallelenkurven aktivieren kann.

---

### Stufe D: Typisierung gegen das Relation Set
- **Spezifikation (Abschnitt 8):**
  - Erweiterung des Relation-Set-Schemas um `synonyms`, `sourceTypes`, `targetTypes`, `directional`, `inverse`.
  - 4-Stufen-Zuordnung:
    1. Exakter Match
    2. Vokabular/Synonym-Treffer
    3. LLM-Entscheidung fuer den Rest
    4. Fallback auf `UNTYPISIERT` (kein stilles Raten).
- **Aktueller Stand:**
  - `LightRAGService.ts` nutzt noch eine einfache Teilstringsuche auf zusammenhaengenden Labels.
- **Handlungsbedarf:** Saubere Normalisierung gemaess Meilenstein M4.

---

### Stufe E: 3D-Darstellung in Three.js (Nodges)
- **Spezifikation (Abschnitt 9):**
  - Nutzung der bereits in `EdgeObjectsManager.ts` existierenden Parallelen-Faecherung (Winkel $2\pi/n$, Kurvenhoehe $2.8 + 0.5 \cdot i$).
  - `thickness` -> gesteuert durch `weight` / `belegzahl`.
  - `color` -> gesteuert durch Relation-Typ.
  - Detailanzeige: Vollstaendiger Beleg (`evidence`) mit Chunk-ID und Datei im `InfoPanelUI`.
- **Aktueller Stand:**
  - Visual Mappings in Nodges unterstuetzen das Prinzip, muessen aber fuer die expandierten Kantenfelder konfiguriert werden.

---

## 3. Risiken & Gegenmassnahmen aus der Spezifikation
1. **Deduplizierungs-Bug (Risiko 2 in Spezifikation):**
   `deduplicateGraph` in `VectorStoreManager.ts` nutzt `${source}-${target}-${rel.type}`. Da nodges-Kanten `relation` statt `type` besitzen, wird der Schluessel `A-B-undefined`, was alle parallelen Kanten bis auf eine vernichten wuerde!
   -> **Wichtig:** `deduplicateGraph` darf fuer Build 14 keinesfalls aktiviert werden!
2. **Doppelschreiber-Problem (Risiko 1):**
   LightRAG besitzt keine Dateisperren. Nur ein Prozess (Container) darf schreibend auf den Storage zugreifen.

---

## 4. Fazit und Empfehlung
Die Spezifikation `build14-spezifikation.md` ist ein exzellenter, mathematisch und architektonisch praeziser Blueprint. 
Der heutige Stand von piCon hat mit der Subgraphen-BFS und den DTOs das Fundament fuer Stufe B gelegt.
Der naechste strategische Durchbruch ist **Stufe C (Kantenexpansion: aus 1 Sammelrelation werden $n$ belegte Einzelaussagen)**, da erst dadurch das volle visuelle Potenzial von Nodges (parallele Kurvenboegen mit unterschiedlichen Farben und Belegen) freigesetzt wird.
