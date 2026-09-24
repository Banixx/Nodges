# Datenbank-Status und Funktionsweise von LightRAG in Nodges

## 1. Aufbau der Datenbank
Die Datenbank von Nodges ist eine dateibasierte LightRAG-Wissensdatenbank. Sie befindet sich im Verzeichnis `c:/Users/ich/Desktop/code/_projects/Nodges/rag_storage`.

Die Datenhaltung gliedert sich in folgende Komponenten:
- **Dokumenten- & Textspeicher (JSON-KV-Stores):**
  - `kv_store_full_docs.json`: Enthaelt den vollstaendigen Originaltext aller eingelesenen Dokumente.
  - `kv_store_text_chunks.json`: Enthaelt die in Abschnitte (Chunks) unterteilten Textsegmente.
  - `kv_store_doc_status.json`: Speichert Metadaten und den Verarbeitungsstatus jedes Dokuments.
- **Entitaeten- & Beziehungsdatenbank:**
  - `kv_store_full_entities.json` & `kv_store_entity_chunks.json`: Extrahierten Entitaeten und Knoten des Wissensgraphen.
  - `kv_store_full_relations.json` & `kv_store_relation_chunks.json`: Verbindungen und Kantenbeziehungen zwischen den Entitaeten.
  - `graph_chunk_entity_relation.graphml`: Graph-Strukturdatei.
- **Vektor-Datenbanken (NanoVectorDB):**
  - `vdb_chunks.json`: Vektor-Embeddings fuer Chunks.
  - `vdb_entities.json`: Vektor-Embeddings fuer Entitaeten.
  - `vdb_relationships.json`: Vektor-Embeddings fuer Beziehungen.
- **LLM-Cache:**
  - `kv_store_llm_response_cache.json`: Zwischenspeicher fuer Antworten des LLMs zur Performance-Optimierung.

## 2. Aktueller Inhalt der Datenbank
Derzeit ist in der Datenbank 1 Dokument hinterlegt:
- **Dokument-ID:** `doc-67a86848d7820be81a8cc7885716f2f2`
- **Inhalt:** Ausfuehrlicher Fachtext zum politischen System der Schweizerischen Eidgenossenschaft (Foederalismus, direkte Demokratie, Volksrechte, Stufenbau Gemeindebene/Kantonsebene/Bundesebene, Aufteilung Legislative/Exekutive/Judikative sowie Funktionsweise des Bundesrats und National-/Staenderats).
- **Statistik:** 33.860 Zeichen, aufgeteilt in 8 Chunks inkl. daraus generierter Entitaeten, Kanten und Vektor-Embeddings.

## 3. Verhalten beim Einlesen neuer Daten
Wenn neue Texte ueber den Endpunkt `/insert` oder das Frontend eingelesen werden:
- **Kumulation (Aufsummieren):** Die neuen Daten werden inkrementell in die bestehenden Dateien in `c:/Users/ich/Desktop/code/_projects/Nodges/rag_storage` eingefügt und mit dem bestehenden Wissensgraphen verschmolzen.
- **Keine neue Datenbank:** Es wird **keine** neue Datenbank erstellt oder die alte überschrieben, ausser der Ordner `rag_storage` wird manuell geloescht.
- **Vernetzen:** LightRAG verbindet neue Entitaeten automatisch mit bereits vorhandenen Entitaeten in der Datenbank, sodass der Wissensgraph kontinuierlich waechst.
