# Antworten zur Datenbank-Anzeige und Dateistruktur auf der Festplatte

## 1. Sind die Datenbanken einzeln als Dateien auf der Festplatte gespeichert?
Ja, alle Datenbanken sind als einzelne Dateien bzw. Verzeichnisse auf der Festplatte hinterlegt:

- **Graph JSON Datenbanken:**
  - **Speicherort:** `c:/Users/ich/Desktop/code/_projects/Nodges/public/data/databases/` (sowie bestehende Datensaetze in `public/data/`).
  - **Format:** Einzelne `.json`-Dateien (z.B. `neue_datenbank_1.json`). Jede Datei enthaelt das komplette Schema, die Entitaeten, Beziehungen und optionalen Visualisierungszustaende.

- **LightRAG Wissensdatenbanken:**
  - **Speicherort:** `c:/Users/ich/Desktop/code/_projects/Nodges/rag_storage/databases/<db_name>/` (sowie die Hauptdatenbank in `rag_storage/`).
  - **Format:** Ein Verzeichnis pro Datenbank mit folgenden JSON/Vektor-Dateien:
    - `kv_store_full_docs.json` (Originaltexte)
    - `kv_store_text_chunks.json` (Text-Abschnitte)
    - `kv_store_full_entities.json` (Extrahierte Knoten)
    - `kv_store_full_relations.json` (Extrahierte Kanten)
    - `graph_chunk_entity_relation.graphml` (Graph-Struktur)
    - `vdb_chunks.json`, `vdb_entities.json`, `vdb_relationships.json` (Vektoren fuer semantische Suche)

---

## 2. Konzept fuer die erweiterte Anzeige & Liste der verfuegbaren Datenbanken

### A. Anzeige der aktuell geladenen Datenbank
- Ein gut sichtbarer Status-Badge/Header im Bereich **Datenbank-Verwaltung** (und optional in der Haupt-Statusleiste):
  `Aktive Datenbank: [Name] ([Typ: JSON | LightRAG])`

### B. Liste aller verfuegbaren Datenbanken
- Eine uebersichtliche Liste aller verfuegbaren Datenbank-Dateien/Ordner direkt im Dateipanel.
- Pro Datenbank-Eintrag in der Liste:
  - Datenbank-Name und Typ-Icon/Badge (`JSON` oder `LightRAG`)
  - Dateipfad auf der Festplatte
  - Buttons: `Aktivieren`, `Speichern`, `Loeschen`
