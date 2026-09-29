# Dashboard: Build 14 – Belegte Beziehungen & LightRAG Evidenz-Graph

> **Projekt:** Build 14 (Belegte Beziehungen aus LightRAG) | **Harness:** Multi-Harness (conT & piCon) | **Stand:** 28. September 2026 | **Status:** KERN IMPLEMENTIERT & VERIFIZIERT  
> **Ablagepfad:** [dashboard.md](./dashboard.md) ([W:/com/feature/build14/dashboard.md](file:///W:/com/feature/build14/dashboard.md)) | **HTML-Ansicht:** [dashboard.html](./dashboard.html)

---

## 1. Name & Beschreibung

| Attribut | Spezifikation |
|---|---|
| **Projektname** | **Build 14: Belegte Beziehungen (LightRAG Evidenz-Graph)** |
| **Betriebsmodus** | **Multi-Harness** (conT: Frontend, Three.js, UI; piCon: Container, Backend, Pytest) |
| **Kategorie** | Feature-Entwicklung & Wissensgraph-Integration |
| **Beschreibung** | Ueberfuehrung komprimierter LightRAG-Extraktionen in praezise, belegte Einzelkanten in Nodges (Schema 5.2). Jede Kante traegt spezifische Textbelege (`evidence`), Paarungsstatus, Chunk-IDs (`sources`) und dynamische Visual Mappings (Kantenstaerke via `weight`, Relationenfarben). |
| **Primaere Pfade** | `W:/com/feature/build14/`, `W:/src/utils/LightRAGService.ts`, `W:/src/ui/InfoPanelUI.ts`, `W:/lightrag-backend/main.py` |

---

## 2. Ziele

- **[Z-01] Vektorbasiertes Subgraph-Retrieval:** Ersatz des statischen Vollgraph-Slicings durch dynamische Seed-Ermittlung via Vektorsuche (`entities_vdb.query`) und zielgerichtete BFS (`get_knowledge_graph`).
- **[Z-02] Kantenexpansion (Diskrete Kanten statt Sammelkante):** Zerlegung von LightRAG-Kanten mit mehreren Schluesselwoertern und `<SEP>`-Beschreibungen in $n$ Einzelaussagen mit klarer Paarung (`exakt` vs. `unsicher`).
- **[Z-03] Volle Schema 5.2 Konformitaet:** Automatische Erzeugung von dynamischen `dataModel`-Definitionen und `visualMappings` (Liniendicke aus kontinuierlichem `weight`, Kantenfarben aus kategorialen `relation`-Werten).
- **[Z-04] Tiefe Kanten- und Knoten-Inspektion (UI):** Klick auf 3D-Kanten oeffnet das Evidenz-Panel mit Zitatblock, Quell-Chunk-Badges und Schluesselwoertern; Hover-Tooltip liefert Sofortvorschau.
- **[Z-05] Erweiterte Ingestion-Pipeline (Stufe A):** Dokumenten-Management (`POST /documents`, `GET /documents/status`, `DELETE /documents/{id}`) und semantische Chunker (`recursive_character`) zur lueckenlosen Provenienzabsicherung.

---

## 3. Fortschritt & Meilensteine

| Meilenstein / Bereich | Pruef- / Arbeitsschritt | Fokus | Status | Fortschritt |
|---|---|---|---|---|
| **M1: Backend Subgraph & DTO** | `lightrag-backend/main.py` | Seed-Suche, BFS, DTOs (`weight`, `keywords`, `description`, `sources`) | **[ERLEDIGT]** | `[====================] 100%` |
| **M2: Kantenexpansion & Service** | `src/utils/LightRAGService.ts` | `expandRelationshipsBuild14()`, `queryGraphBuild14()`, Schema 5.2 Mapping | **[ERLEDIGT]** | `[====================] 100%` |
| **M3: UI, 3D & Inspector** | `src/ui/InfoPanelUI.ts`, `HoverInfoPanel.ts` | Zitatbox fuer Evidenz, Chunk-Badges, Parallelen-Auffaecherung (kein Deduplizieren) | **[ERLEDIGT]** | `[====================] 100%` |
| **M4: Testabdeckung & Gates** | Vitest & Pytest | 36 Backend-Tests gruen, 243 Vitest-Tests gruen, Typecheck fehlerfrei | **[ERLEDIGT]** | `[====================] 100%` |
| **M5: Erweiterte Ingestion** | Stufe A der Spezifikation | Dokument-Pipeline (`POST /documents`, `GET /documents/status`, `GET /documents/list`, `DELETE /documents/{doc_id}`), `doc_id`-Tracking, semantisches Absatz-Chunking (`paragraph_semantic` / `recursive_character`) | **[ERLEDIGT]** | `[====================] 100%` |

**Gesamtfortschritt Projekt Build 14:** **100%** (Funktionaler Kern & Ingestion-Pipeline vollstaendig)

---

## 4. Status & Naechste Schritte

- **Aktueller Status:** Build 14 ist inklusive Stufe A (Erweiterte Ingestion-Pipeline) vollstaendig implementiert und verifiziert. Nutzer koennen Dokumente strukturiert aufnehmen, den Status abfragen und ueber `CreatePanel.ts` evidierte, aufgefacherte Graphen mit funktionierendem Edge-Inspector und Zitatbloecken explorieren.
- **Erledigte Aktionen (Stufe A):**
  1. Endpunkte `POST /documents`, `GET /documents/status`, `GET /documents/list` und `DELETE /documents/{doc_id}` in `lightrag-backend/main.py` implementiert.
  2. Umstellung von unstrukturiertem Token-Cutting (`rag.ainsert`) auf semantisches Absatz-Chunking via `rag.apipeline_enqueue_documents` mit `doc_id` und `file_path`.
  3. Integration von `langchain-text-splitters` im Python-Venv fuer `paragraph_semantic` ("P") und `recursive_character` ("R").
  4. Testabdeckung auf 36/36 Backend-Pytests erweitert (9 neue Tests fuer Stufe A).
- **Verknuepfte Dokumente:**
  - Fachliche Spezifikation: [build14-spezifikation.md](./build14-spezifikation.md)
  - Dialog- & Diskussionsprotokoll: [rapport_build14.md](./rapport_build14.md)
  - Architektur- & Literaturanalyse: [lightrag_nodges_analyse.md](./lightrag_nodges_analyse.md)
  - HTML-Dashboard: [dashboard.html](./dashboard.html)
  - Aufgabenliste: [todo.md](../../todo.md)
