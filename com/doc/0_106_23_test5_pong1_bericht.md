# Bericht: Feature test5 (Philosophie von Nodges) — Pong 1 aus Backend- und Datenperspektive

> Version: 0.106.23
> Datum: 28. September 2026
> Harness: piCon (Linux-Container `pi-harness`, `/workspace`)
> Status: Pong 1 abgeschlossen; Turnus fuer Runde 2 (Synthese) liegt bei conT
> Anlass: Neue verbindliche Berichtspflicht aus `com/entscheidungen.md` (2026-09-28)

---

## 1. Zweck

Dieser Bericht dokumentiert piCons Beitrag (Pong 1) zum Feature test5 "Philosophie von Nodges" als eigenstaendiges, auffindbares Dokument ausserhalb des Chatverlaufs. Der vollstaendige Diskurs steht im Multi-Harness-Rapport `com/feature/test5/rapport_test5.md` (Abschnitt 7).

Grundlage waren die vier Fragen P-01 bis P-04 von conT. Alle Antworten wurden an der realen Codebasis verifiziert (`lightrag-backend/main.py`, Build-14-Stand), nicht aus dem Gedaechtnis.

---

## 2. Verifizierte technische Grundlagen

| Fakt | Wert / Fundstelle |
|---|---|
| Query-Seed-Suche | `entities_vdb.query(query_text, top_k=5)` (`QUERY_SEED_TOP_K`) |
| Nachbarschaftsexpansion | `get_knowledge_graph(seed, max_depth=2, max_nodes=150)` (`SUBGRAPH_MAX_DEPTH`) |
| Harte Obergrenzen | `MAX_GRAPH_NODES=150`, `MAX_GRAPH_EDGES=300` |
| Rueckfallmodus | `full_graph_fallback` (Gesamtgraph, ebenfalls 150/300) |
| Transparenz-Metadaten | `meta = {mode, seeds, depth, truncated}` |
| Knoten-DTO | `id`, `label`, `entity_type`, `description`, `sources`, `properties` |
| Kanten-DTO | `id`, `source`, `target`, `relation`, `weight`, `keywords`, `description`, `sources`, `properties` |
| Speicher | `lightrag-backend/rag_storage` (per `LIGHTRAG_WORKING_DIR` konfigurierbar), pro Projekt `rag_storage/databases/<name>` |
| Formate | `graph_chunk_entity_relation.graphml`, `kv_store_*.json`, `vdb_entities.json`, `vdb_relationships.json`, `vdb_chunks.json` (dateibasiert, lokal) |
| Embeddings | extern per OpenAI-kompatibler API, Default `qwen/qwen3-embedding-8b`, 4096 Dimensionen (`EMBEDDING_MODEL`, `EMBEDDING_BASE_URL`, `EMBEDDING_DIM`) |
| LLM | extern per Default (`LLM_MODEL`, `custom_llm_model_func`) |
| Backup | `lightrag-backend/backup_storage.sh`; `rag_storage/` per `.gitignore` ausgeschlossen |

---

## 3. P-01: Subgraphen als Cognitive Offloading

Der Build-14-Pfad `_extract_query_graph()` ist eine technische Umsetzung von Cognitive Offloading und der Vermeidung des Flat-Data-Hairballs:

1. Die Vektorsuche waehlt die fuenf bedeutungsnaechsten Knoten (Seeds) maschinell vor. Diese Relevanzarbeit muss das menschliche Arbeitsgedaechtnis nicht mehr leisten.
2. Die 2-Hop-Expansion entspricht assoziativem Priming und erzeugt einen lesbaren Kontext statt eines Datenbergs.
3. Die 150/300-Grenze entspricht dem Hairball-Verbot: ein konstant ueberschaubarer Ausschnitt.
4. Der `meta`-Block macht die Vorauswahl nachvollziehbar (Vertrauen statt Blackbox).

**Offene Grenze:** Der Subgraph ist strukturell (Graphnachbarschaft), nicht semantisch gewichtet. Ein stark vernetzter Seed kann thematisch streuen. Eine Seed-Gewichtung per Aehnlichkeits-Schwellwert waere eine moegliche spaetere Ergaenzung.

---

## 4. P-02: DTO-Felder auf die 7 visuellen Dimensionen

Empfehlung fuer genau **vier Dauerkanäle**:

| Dimension | DTO-Feld |
|---|---|
| Raum (X, Y, Z) | Force-Layout-Position |
| Groesse | `weight` (Kanten) / Grad bzw. Relevanz (Knoten) |
| Farbe | `entity_type` |
| Dynamik | Aktivitaet / `weight`-Aenderung der aktuellen Seeds |

Nur bei Interaktion (Details-on-Demand): `label`, `description`, `relation` (Text), `sources` (Transparenz/Ghosting), `entity_type` als diskrete Form (Alternative zur Farbe).

Zwei Regeln: keine Doppelkodierung desselben Feldes in zwei Dauerkanalen; `keywords` nicht als Dauerkanal, sondern fuer Cluster-Naehe oder Tooltip.

---

## 5. P-03: Local-First — Ist-Stand und Luecke

- **Ist-Stand:** Speicherung vollstaendig lokal und dateibasiert (GraphML, KV-JSON, dateibasierte Vektoren). Kein Cloud-Speicher, kein Vendor-Lock-in auf der Ablageebene.
- **Luecke:** Die Berechnung von Embeddings und LLM-Antworten laeuft per Default ueber externe OpenAI-kompatible APIs. Die Speicherung ist local-first, die Berechnung noch nicht.
- **Weg zur vollen Datenhoheit:** `EmbeddingFunc` und `custom_llm_model_func` sind austauschbare Funktionen. Ein lokaler OpenAI-kompatibler Endpunkt (Ollama, llama.cpp, TEI) genuegt ueber die bestehenden Umgebungsvariablen. Das Persistenzformat bleibt unveraendert.
- **Empfehlung:** Speicherformate im `setup.md` dokumentieren und einen Restore-Pfad aus dem Backup beschreiben.

---

## 6. P-04: Multi-Harness — Auge und Gehirn

- **SSoT auf ext4:** Beide Harnesses sehen dieselben Inodes. Keine Kopien, keine Merge-Konflikte, kein Sync-Zwischenschritt.
- **COM-Bus:** Dateibasiert und asynchron; die Extension macht ihn autonom (`ping-piCon.md` weckt, `ping-conT.md` weckt nachweislich nicht, siehe `com/feature/test_infrastruktur/rapport_test_infrastruktur.md` Abschnitte 10 und 12).
- **Domaenenteilung:** conT = Auge (Darstellung, UI, E2E), piCon = Gehirn (Wissens-Engine, Python, Vektorlogik, Unit-Gates). Die Kopplung ist der DTO-Vertrag, nicht fremder Code.
- **Getrennte Testgates** (L0/L2 Host, L1/L3 Container) begrenzen den Fehlerradius.
- **Preis:** Ansage- und `save`-Disziplin bei gemeinsamen Dateien.

---

## 7. Abgleich mit der neuen Infrastruktur (Windows-Fernbedienung)

Am 28.09.2026 hat conT die Windows-Seite nachgezogen. Aus piCons Sicht geprueft:

| Element | Befund |
|---|---|
| `tools/nodges-com.ps1` | Gegenstueck zu `tools/nodges-com.sh`; Befehle status/read/ack/ping/watch/start/stop plausibel und konsistent |
| `tools/nodges-com.cmd` | Bevorzugt `pwsh`, faellt auf `powershell` zurueck |
| `tools/com-bus/conT.seen` | Eigener Zaehler fuer conT (410), symmetrisch zu `piCon.seen` |
| Zeitzonen-Harmonisierung | `tools/watch_com.mjs` nutzt `Europe/Berlin` statt UTC. Verifiziert: Berlin 14:06 gegen UTC 12:06. Die frueheren Zeitstempel-Diskrepanzen (10:31 gegen 08:41) sind damit behoben. |

**Konsequenz:** Beide Bus-Seiten sind nun symmetrisch. Die Test-Infrastruktur-Harmonisierung ist beidseitig abgeschlossen.

---

## 8. Offene Punkte und naechste Schritte

| Punkt | Zustaendig | Status |
|---|---|---|
| Synthese und Philosophie-Manifest (Runde 2 zu test5) | conT | offen, Turnus liegt bei conT |
| Lokaler Embedding-/LLM-Endpunkt als echter Local-First-Schritt | spaeter, gemeinsame Entscheidung | Vorschlag |
| Speicherformate und Restore-Pfad dokumentieren | piCon (Kandidat) | Vorschlag |

---

## 9. Quellen

- `com/feature/test5/rapport_test5.md` (Abschnitt 7)
- `com/feature/test5/dashboard.md`
- `lightrag-backend/main.py` (Build-14-Stand)
- `com/feature/test_infrastruktur/rapport_test_infrastruktur.md`
- `com/entscheidungen.md`
