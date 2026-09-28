# Build 14 – Spezifikation: belegte Beziehungen aus Daten und unstrukturiertem Text

> Status: **Entwurf / Vorschlag**. Es wurde noch kein Code geändert.
> Grundlage: geprüfte Bibliothek `lightrag-hku` 1.5.6 (im venv unter
> `lightrag-backend/venv/lib/python3.11/site-packages/lightrag/`), nodges-Code unter `/workspace/src`.
> Alle unten genannten Zeilenangaben beziehen sich auf diesen Stand.

---

## 1. Zweck und Abgrenzung

Build 14 beantwortet eine einzige Frage: Wie kommen aus Dokumenten und unstrukturiertem Text
**möglichst genaue, vollständige und belegte** Beziehungen in den nodges-Graphen – als
eigenständige, darstellbare Kanten statt als eine Sammelkante pro Entitätspaar?

Abgrenzung zu den bestehenden Builds:

| Build | Rolle von LightRAG | Ergebnis |
|-------|--------------------|----------|
| 12 | Rohgraph 1:1 übernommen | flach: ein Label pro Entitätspaar, nicht fragebezogen |
| 13 | nur Faktenquelle im Text | detaillierte Kanten, aber vom LLM formuliert (Synthese, nicht belegt) |
| **14** | **Faktengrundlage und Struktur** | **detailreiche Kanten, jede mit Beleg (Textstelle, Datei, Chunk-ID)** |

Build 14 ersetzt Build 13 nicht. Er ist der Gegenpol: Build 13 synthetisiert, Build 14 belegt.
Beide können später nebeneinander bestehen und verglichen werden.

**Nicht Bestandteil von Build 14:**
- Keine freie Graphgenerierung durch ein LLM als Primärquelle.
- Kein semantisches Deduplizieren über `deduplicateGraph` (siehe Abschnitt 10).
- Kein gleichzeitiger Schreibzugriff zweier Prozesse auf dieselbe LightRAG-Storage.

---

## 2. Leitprinzipien

1. **Beleg statt Behauptung:** Jede Kante trägt mindestens `source_id` (Chunk) und `file_path`.
   Kanten ohne Beleg werden als „unbelegt" markiert, nicht gelöscht.
2. **Nichts wegwerfen:** Was LightRAG liefert (`keywords`, `description`, `weight`, `source_id`,
   `file_path`, `created_at`), wird vollständig gespeichert, auch wenn es nicht angezeigt wird.
3. **Mehrfachbeziehungen bleiben Mehrfachbeziehungen:** `keywords` enthält mehrere
   Beziehungstypen; daraus entstehen mehrere getrennte Kanten, nicht eine mit Komma-Liste.
4. **Fragebezogen statt global:** Es wird immer der abgerufene Teilgraph verwendet, nie der
   nach Knotengrad abgeschnittene Gesamtgraph.
5. **Nachvollziehbarkeit:** Jede Kante ist auf Dokument, Chunk und Extraktionslauf zurückführbar.
6. **Trennung von Extraktion und Darstellung:** die Darstellungsschicht erfindet nichts hinzu.

---

## 3. Befund: warum LightRAG „nur eine Verbindung" zeigt

Das ist kein Fehler, sondern das Datenmodell von LightRAG. Beim Zusammenführen zweier
Extrahierungen derselben Entitätspaare (`lightrag/operate.py`, Merge-Block ab Zeile 1971):

- Schlüssel der Kante ist das **normalisierte Entitätspaar**, nicht die Beziehung.
- `keywords` = `", ".join(set(alle_relation_keywords))`, Zeile 2026/2063
- `description` = alle Einzelbeschreibungen, verkettet mit `<SEP>` (`GRAPH_FIELD_SEP`,
  `constants.py:49`); bei Überlänge wird per LLM zusammengefasst
- `weight` = Summe der Gewichte der zusammengeführten Extraktionen (Zeile 2032). Jede einzelne
  Extraktion erhält beim Anlegen `weight = 1.0` (Zeile 980), praktisch ist `weight` also die
  **Zahl der belegenden Extraktionen/Chunks**
- `source_id` = `<SEP>`-verkettete Chunk-IDs, `file_path` = beteiligte Dateien
- `truncate` = Hinweis, ob die Zusammenfassung gekürzt wurde

Die Detailinformation ist also **vorhanden, aber komprimiert**. Die WebUI von LightRAG
zeichnet daraus genau eine Linie. Die Expansion in Abschnitt 7 macht sie sichtbar.

Ergänzend: Das Extraktionsschema ist fest und nicht per Konfiguration erweiterbar
(`lightrag/prompt.py:269-293`):

```json
{
  "entities":      [{"name": "...", "type": "...", "description": "..."}],
  "relationships": [{"source": "...", "target": "...", "keywords": "...", "description": "..."}]
}
```

Das heißt: **mehr Felder als diese gibt LightRAG nicht heraus.** Alles Weitere (Relationstyp aus
dem Relation Set, Zeitbezug, Sicherheit, Rolle) muss aus `keywords` und `description`
abgeleitet oder als separate, klar gekennzeichnete Stufe ergänzt werden.

---

## 4. Zielarchitektur: fünf Stufen

```
Dokumente/Text
      |
      v
[Stufe A] Aufnahme (Ingestion)        -> Chunking, Prompt-Profil, Provenienz
      |
      v
[Stufe B] Retrieval (LightRAG)        -> aquery_data: entities/relationships/chunks/references
      |
      v
[Stufe C] Datenvertrag (Mapping)      -> LightRAG-Relation -> n nodges-Kanten
      |
      v
[Stufe D] Typisierung                 -> keywords -> Relation-Set-IDs
      |
      v
[Stufe E] Darstellung                 -> parallele Kurven, Evidenz-Panel, Filter, Legende
```

Jede Stufe ist einzeln prüfbar und hat eigene Artefakte unter `public/data/b14/`.

---

## 5. Stufe A – Aufnahme (Ingestion)

Ziel: Vollständigkeit und Sprachrichtigkeit der Extraktion, plus saubere Provenienz.

### 5.1 Aufnahme über die Pipeline, nicht über `ainsert`

`rag.ainsert()` verwendet in 1.5.6 **immer** den Fixed-Token-Chunker und kann keine andere
Strategie wählen (`lightrag/lightrag.py:1771-1790`). Der offizielle Server nutzt stattdessen:

```python
await rag.apipeline_enqueue_documents(
    input=text, ids=[doc_id], file_paths=[file_path],
    process_options="P",       # oder "F"/"R"/"V"
    track_id=track_id
)
await rag.apipeline_process_enqueue_documents()
```

Damit erhalten wir:
- `doc_id` (bevorzugt MD5 des Inhalts) → **Duplikaterkennung** und Wiederaufnahme
- `file_path` → **Zitat und Herkunft** an jeder Entität und Kante
- `process_options` → passende Chunking-Strategie pro Dokumenttyp
- Statusverfolgung pro Dokument (Pipeline), statt blindem Einfügen

Erforderliche Backend-Erweiterungen in `lightrag-backend/main.py`:

| Endpunkt | Zweck |
|----------|-------|
| `POST /documents` | Dokument(e) mit `file_path`, `doc_id`, `process_options` aufnehmen |
| `GET /documents/status` | Verarbeitungsstand je Dokument (pending/processing/processed/failed) |
| `GET /documents/list` | vorhandene Dokumente inkl. `file_path` und Belegzahl |
| `DELETE /documents/{id}` | Entfernen eines Dokuments inkl. Nachbereinigung |
| `GET /entities`, `GET /relations` | vollständige, ungekappte Ausgabe des Wissensspeichers |

### 5.2 Chunking-Strategie (Framing)

Vier Strategien sind verfügbar (Konfiguration über `addon_params['chunker']` bzw.
Umgebungsvariablen, `lightrag/parser/routing.py:511-560`):

| Strategie | Kürzel | Sinnvoll für |
|-----------|--------|--------------|
| `fixed_token` | F | Standard, gleichmäßige Blöcke |
| `recursive_character` | R | allgemeine Texte, Absatzgrenzen (`CHUNK_R_SEPARATORS`) |
| `semantic_vector` | V | thematisch wechselnde Texte (`CHUNK_V_*`) |
| `paragraph_semantic` | P | rechtliche und normative Texte, Artikel/Absatz-Struktur (`CHUNK_P_*`) |

Relevante Variablen: `CHUNK_SIZE`, `CHUNK_OVERLAP_SIZE` (Altbestand sowie `CHUNK_F_SIZE`,
`CHUNK_F_OVERLAP_SIZE`, `CHUNK_R_*`, `CHUNK_V_*`, `CHUNK_P_*`). Empfehlung für den
nodges-Fall: **P als Standard** (Struktur bleibt intakt), R als Rückfall, F nur für
tabellarische oder gescannte Ersatztexte.

Wichtig: „großer Chunk" erhöht die Belegqualität (mehr Kontext pro Extraktion), senkt aber die
Treffergenauigkeit im Retrieval. Das Feintuning gehört in eine Testreihe (Abschnitt 11).

### 5.3 Extraktionsqualität über ein Domänen-Prompt-Profil

LightRAG erlaubt eigene Entity-/Relation-Beispiele und eigene Entitätstypen-Anweisung
(`lightrag/prompt.py:544-700`): Datei aus `PROMPT_DIR/entity_type/`, geladen über die
Umgebungsvariable `ENTITY_TYPE_PROMPT_FILE` (nur `.yml`/`.yaml`, kein Pfad, kein `..`).
Im JSON-Modus muss `entity_extraction_json_examples` gesetzt sein.

Beispiel `PROMPT_DIR/entity_type/nodges_de.yml`:

```yaml
entity_types_guidance: |
  Extrahiere ausschliesslich Entitaeten aus folgenden Kategorien:
  ORGANISATION, PERSON, ROLLE, PFLICHT, RECHT, VERFAHREN, DOKUMENT,
  DATUM, FRIST, GEGENSTAND, BEGRIFF, TECHNIK, ORT.
  Verwende genau diese Bezeichner, keine Synonyme, keine neuen Kategorien.
  Entitaetsnamen im Nominativ, ohne Artikel, in der Sprache des Dokuments.

entity_extraction_json_examples:
  - |
    {
      "entities": [
        {"name": "Bundesamt fuer Sicherheit", "type": "ORGANISATION",
         "description": "Kontrollbehoerde nach Art. 12 Abs. 2; prueft die Einhaltung der Meldepflicht."}
      ],
      "relationships": [
        {"source": "Bundesamt fuer Sicherheit", "target": "Meldepflicht",
         "keywords": "PRUEFT, UEBERWACHT",
         "description": "Das Bundesamt prueft die Einhaltung der Meldepflicht jaehrlich."}
      ]
    }
```

Regeln, die im Profil verankert werden sollten (jede Regel erhöht die Präzision messbar):

1. `keywords` enthält **einen oder mehrere Typen** aus dem vereinbarten Vokabular
   (Relation Set + Fachlexikon `lexikon.md`), getrennt durch Komma, keine freien Umschreibungen.
2. `description` ist **wörtlich belegt**: kein Zusammenfassen, keine Wertung, keine
   Hinzufügung von Weltwissen. Bedingungen, Fristen und Geltungsbereiche gehören in die
   Beschreibung, nicht in die Interpretation.
3. Keine Entität ohne Nennung im Text. Keine Beziehung ohne Satz, der sie belegt.
4. Hierarchie getrennt ausdrücken: `IST_TEIL_VON`, `UNTERSTELLT`, `BERICHTET_AN` nicht vermischen.
5. Zeitangaben wörtlich übernehmen („ab 1. Januar 2026"), nicht in eigene Felder pressen.

### 5.4 Vollständigkeit (Gleaning)

`MAX_GLEANING` (Standard `1`, `lightrag/constants.py:17`) steuert Nachfass-Durchläufe bei
unklarem Inhalt. Erhöhung (z. B. 2) findet mehr Beziehungen, kostet aber zusätzliche
LLM-Aufrufe. `MAX_EXTRACTION_RECORDS` (Standard `100`) begrenzt die Extraktionen pro Chunk.
Empfehlung: mit 1 starten, 2 testen, Kosten gegen Vollständigkeit messen.

### 5.5 Sprache

`SUMMARY_LANGUAGE=German` ist im Backend bereits gesetzt (`main.py`). Für Entitätsnamen gilt
das nur bedingt: Eigennamen und Gesetzesbezeichnungen bleiben im Original. Das Prompt-Profil
sollte das ausdrücklich sagen, sonst entstehen Dubletten („Federal Office" / „Bundesamt").

---

## 6. Stufe B – Retrieval: `aquery_data` statt Gesamtgraph

Das ist die wichtigste technische Änderung gegenüber Build 12.

**Heute:** `main.py` liest `chunk_entity_relation_graph.get_knowledge_graph("*")`, also den
ganzen Wissensspeicher, nach Knotengrad sortiert, anschließend hart auf
`MAX_GRAPH_NODES=150` / `MAX_GRAPH_EDGES=300` gekappt. Der zurückgegebene Antworttext wird in
Build 12 nur angezeigt und nicht in Kanten umgesetzt.
Folge: Die sichtbaren Kanten haben mit der Frage oft nichts zu tun.

**Build 14:** `rag.aquery_data(query, param)` (`lightrag/lightrag.py:3701-3910`) liefert
strukturierte Daten **ohne** LLM-Textgenerierung:

```python
{
  "data": {
    "entities": [{"entity_name", "entity_type", "description",
                  "source_id", "file_path", "created_at"}],
    "relationships": [{"src_id", "tgt_id", "description", "keywords", "weight",
                       "source_id", "file_path", "created_at"}],
    "chunks": [{"content", "file_path", "chunk_id", "reference_id"}],
    "references": [{"reference_id", "file_path"}]
  },
  "metadata": {"query_mode", "keywords"}
}
```

Damit liegen **genau die Felder** vor, die für belegte, typisierte Kanten gebraucht werden
(`lightrag/utils.py:6076-6200`). Die offizielle Server-Route dazu ist `POST /query/data`.

### 6.1 Determinismus durch eigene Schlüsselwörter

`QueryParam` erlaubt `hl_keywords` / `ll_keywords` (hoch-/niedrigstufige Suchbegriffe). Wird
gesetzt, entfällt die LLM-Keywords-Extraktion. Nutzen für nodges:

- **Deep-Dive aus einem Knoten:** `hl_keywords=["<Knotenname>"]`, `ll_keywords=[<Nachbarnamen>]`
- **Erweiterung des sichtbaren Graphen:** die Knotennamen des aktuellen nodges-Graphen als
  Suchbegriffmenge
- **Reproduzierbarkeit:** gleiche Anfrage, gleiche Suchbegriffe, gleiches Ergebnis

### 6.2 Fokus-Subgraph

Für „Umfeld eines Knotens" gibt es `GET /graphs?label=<Name>&max_depth=<n>&max_nodes=<m>`
(`lightrag/api/routers/graph_routes.py:226`), Priorisierung nach Distanz, dann Grad. Ergänzend
`/graph/label/search`, `/graph/label/list`, `/graph/label/popular`. Diese Routen sind bereits
implementiert und müssen nicht nachgebaut werden.

### 6.3 Parameter, die die Qualität bestimmen

| Parameter | Wirkung |
|-----------|---------|
| `mode` | `local` (Entitäten), `global` (Beziehungen), `hybrid`/`mix` (beides), `naive` (nur Chunks) |
| `top_k` | Anzahl Entitäten bzw. Beziehungen – der Haupthebel für Breite |
| `chunk_top_k` | belegende Textstellen – der Haupthebel für Belegdichte |
| `max_entity_tokens`, `max_relation_tokens`, `max_total_tokens` | Token-Budgets des Kontexts |
| `enable_rerank` | Nachsortierung der Chunks, verbessert Belegqualität |

Die bisherigen Kappungen `MAX_GRAPH_NODES` / `MAX_GRAPH_EDGES` werden im neuen Pfad **nicht**
mehr angewendet. Sie bleiben nur für den alten Build-12-Pfad erhalten.

---

## 7. Stufe C – Datenvertrag: LightRAG → nodges

### 7.1 Knoten

| nodges-Feld | Quelle | Hinweis |
|-------------|--------|---------|
| `id` | `entity_name` | unverändert, kein Neu-Hashing |
| `label` | `entity_name` | – |
| `entity_type` | `entity_type` | steuert die Farbe (kategorisch) |
| `description` | `description` | vollständig, nicht gekürzt |
| `source_id` | `source_id` | Chunk-Liste (`<SEP>`) |
| `file_path` | `file_path` | Herkunft |
| `belegzahl` | Anzahl Chunks in `source_id` | Kantendicke/Filter |
| `herkunft` | konstant `lightrag` | Trennung von generierten Knoten |

### 7.2 Kanten: aus einer Relation werden n Kanten

Ableitungsregel (`src` = `src_id`, `tgt` = `tgt_id`):

1. `keywords` an `","` zerlegen, trimmen, Groß-/Kleinschreibung normalisieren, Duplikate
   entfernen → Liste `K` der Beziehungstypen.
2. `description` an `"<SEP>"` zerlegen → Liste `D` der Teilbegründungen.
3. **Paarung versuchen:**
   - Ist `len(D) == len(K)`, wird indexweise gepaart (jede Extraktion liefert genau ein
     Keyword und eine Beschreibung; die Reihenfolge bleibt im Merge erhalten).
   - Sonst: jede Kante erhält die gesamte Beschreibung, `paarung = "unsicher"`.
4. Für jedes `k` aus `K` entsteht **eine** nodges-Kante.
5. Kanten mit identischem (`src`, `tgt`, Typ) werden zusammengeführt, ihre Beleglisten
   vereinigt.

Beispiel:

```
LightRAG-Relation:  A --"leitet, ist verantwortlich fuer, vertritt"--> B
                    description: "A leitet B.<SEP>A ist fuer B verantwortlich.<SEP>A vertritt B."

Build 14:           A --leitet----------------> B   evidence: "A leitet B."
                    A --ist_verantwortlich_fuer--> B   evidence: "A ist fuer B verantwortlich."
                    A --vertritt---------------> B   evidence: "A vertritt B."
```

### 7.3 Kantenfelder (Ebene B – die Relationsinstanz)

| Feld | Typ | Quelle | Mögliche Werte | Pflicht |
|------|-----|--------|----------------|---------|
| `id` | string | abgeleitet | `lr:<db>:<hash(src|tgt|typ)>`, deterministisch | ja |
| `source`, `target` | string | `src_id`, `tgt_id` | Entitäts-IDs | ja |
| `relation` | string | Stufe D | Relation-Set-`id`, sonst `UNTYPISIERT` | ja |
| `label` | string | Relation Set | Anzeigename | ja |
| `keyword_raw` | string | `keywords` | genau **ein** Typ dieser Kante, z. B. `"leitet"` | ja |
| `keywords_all` | string | `keywords` | vollständige Kommaliste | ja |
| `evidence` | string | `description` | Belegtext dieser einen Kante | ja, darf leer sein |
| `evidence_all` | string | `description` | vollständige Beschreibung | ja |
| `evidence_parts` | string[] | `description` | alle Teilbelege für das Detailpanel | optional |
| `weight` | number | `weight` | ≥ 1.0 | ja |
| `belegzahl` | number | abgeleitet | Zahl der Chunks in `source_id` | ja |
| `source_id` | string | `source_id` | `<SEP>`-verkettete Chunk-IDs | ja |
| `file_path` | string | `file_path` | Dateipfade | ja |
| `created_at` | string | `created_at` | Zeitstempel der Extraktion | optional |
| `reference_id` | string | `reference_id` | Zitatnummer, z. B. `"1"` | optional |
| `paarung` | enum | abgeleitet | `exakt` \| `unsicher` \| `keine` | ja |
| `typisiert` | boolean | Stufe D | `true` \| `false` | ja |
| `herkunft` | enum | konstant | `lightrag` \| `llm` \| `manuell` | ja |
| `validFrom` / `validTo` | number | nur wenn wörtlich belegt | Zeitwert oder leer | optional |
| `temporal.history` | object[] | Nutzerbearbeitung | Änderungsverlauf | optional |

Zusatz: `RelationshipDataSchema` erlaubt das Feld `nodes: string[]` für **Hyperedges** (mehr als
zwei Knoten). LightRAG liefert ausschließlich binäre Beziehungen; Build 14 erzeugt daher nur
Zweierkanten. Hyperedges bleiben manuellen oder generierten Builds vorbehalten.

#### 7.3.1 Wertebereiche der abgeleiteten Felder

| Feld | Wert | Bedeutung |
|------|------|-----------|
| `paarung` | `exakt` | `keywords` und `description` hatten gleich viele Teile und wurden indexweise gepaart |
| | `unsicher` | Anzahl wich ab; jede Kante trägt die gesamte Beschreibung |
| | `keine` | keine Beschreibung vorhanden |
| `typisiert` | `true` / `false` | Zuordnung zu einer Relation-Set-ID gelungen |
| `herkunft` | `lightrag` | direkt belegt, aus `aquery_data` |
| | `llm` | LLM-synthetisiert (Build 13) |
| | `manuell` | vom Nutzer erstellt oder geändert |
| `mode` (Metadaten) | `local`, `global`, `hybrid`, `mix`, `naive`, `bypass` | Retrieval-Modus des Laufs |

#### 7.3.2 Was eine Relation in Build 14 nicht haben kann

Diese Angaben stehen weder im Extraktionsschema noch in der Datenbank. Sie wären erfunden und
sind deshalb ausgeschlossen:

- Modalität (muss / darf / soll) als eigenes Feld – nur als Text im Beleg
- strukturierte Bedingungen und Fristen – nur als Text im Beleg
- Zahlenwerte, Mengen, Beträge, Prozentsätze – nur als Text im Beleg
- Sicherheit der Quelle oder Widerspruchskennzeichnung durch LightRAG – nur über `confidence`
  der Typisierung
- Rollen, Negation und Geltungsbereich als Felder
- Autor oder Dokumentversion

Wer diese Details braucht, baut eine klar getrennte Nachbearbeitungsstufe ein (LLM oder
regelbasiert) und kennzeichnet die Kanten mit `herkunft: llm`, damit Beleg und Ableitung
unterscheidbar bleiben.

#### 7.3.3 Beispiel einer expandierten Relation

```json
{
  "id": "lr:default:9f3c1a2b7d",
  "source": "Bundesamt fuer Sicherheit",
  "target": "Meldepflicht",
  "relation": "PRUEFT",
  "label": "prueft",
  "keyword_raw": "PRUEFT",
  "keywords_all": "PRUEFT, UEBERWACHT",
  "evidence": "Das Bundesamt prueft die Einhaltung der Meldepflicht jaehrlich.",
  "evidence_all": "Das Bundesamt prueft die Einhaltung der Meldepflicht jaehrlich.<SEP>Das Bundesamt ueberwacht die Meldepflicht ab 2026.",
  "weight": 2.0,
  "belegzahl": 2,
  "source_id": "chunk-4f19<SEP>chunk-8ab2",
  "file_path": "bundesgesetz_art12.pdf",
  "created_at": "2026-02-14T09:12:33",
  "paarung": "exakt",
  "typisiert": true,
  "herkunft": "lightrag",
  "reference_id": "2"
}
```

#### 7.3.4 Welche Kantenfelder die Darstellung steuern

Mapping über `RelationshipVisualPreset` (`src/types.ts:70-81`):

| Darstellungs-Eigenschaft | sinnvolles Feld |
|--------------------------|-----------------|
| `thickness` | `weight` oder `belegzahl` |
| `color` | `relation` (kategorisch) |
| `opacity` | `typisiert` oder `paarung` |
| `curvature` | unverändert lassen; die Parallelen brauchen den Fächer |
| `animation` | `herkunft` (belegt vs. synthetisiert) |
| `glow` | optional `weight` |

Die Detailtiefe einer Kante steckt in `relation` (Typ), `evidence` (Begründung) und
`source_id`/`file_path` (Beleg). Diese drei Felder bestimmen Darstellung und Filter; alles
Weitere dient der Nachvollziehbarkeit oder ist eine gekennzeichnete Ableitung.

### 7.4 Metadaten des Graphen

```json
"metadata": {
  "lightrag": {
    "database": "<aktive DB>",
    "mode": "hybrid",
    "query": "<Suchtext>",
    "hl_keywords": [], "ll_keywords": [],
    "top_k": 40, "chunk_top_k": 20,
    "counts": {"entities": 0, "relationships": 0, "chunks": 0},
    "references": [{"reference_id": "1", "file_path": "..."}]
  }
}
```

### 7.5 Nachweis „nichts verloren"

Kontrollgröße: `sum(expanded_edges) >= len(lightrag_relationships)` und
`set(alle keyword_raw) == set(alle LightRAG-keywords aufgeteilt)`. Diese Invariante gehört in
einen automatischen Test (Abschnitt 11).

---

## 8. Stufe D – Typisierung gegen das Relation Set

Vorhandene Relation Sets: `public/relationsets/{organisation_und_struktur,
schweizer_politik, standard_generic}_relations.json`.

### 8.1 Relationstyp-Schema (Ebene A)

Heute enthalten die Relation Sets nur `id`, `label`, `description`, `enabled`. Build 13 kennt
bereits mehr (`Build13RelationCandidate`, `src/utils/LLMService.ts:24-35`). Für Build 14
vorgeschlagenes Schema:

| Feld | Typ | Mögliche Werte/Bedeutung |
|------|-----|--------------------------|
| `id` | string | `MANAGES`, `REPORTS_TO`, `PART_OF`, … (Großbuchstaben, unterstrichen) |
| `label` | string | deutscher Anzeigename, z. B. `führt`, `berichtet an` |
| `description` | string | Bedeutung des Typs |
| `synonyms` | string[] | Schreibvarianten für die Typisierung: `["leitet", "führt", "managt"]` |
| `sourceTypes` | string[] | erlaubte Entitätstypen links, z. B. `["PERSON", "ROLLE"]` |
| `targetTypes` | string[] | erlaubte Entitätstypen rechts |
| `directional` | boolean | gerichtet oder symmetrisch |
| `inverse` | string | ID der Rückrichtung, z. B. `MANAGED_BY` |
| `cardinality` | enum | `one_to_one`, `one_to_many`, `many_to_many` |
| `examples` | string[] | Belegsätze aus der Quelle |
| `evidenceRequired` | boolean | Kante ohne Beleg als ungültig markieren |
| `enabled` | boolean | im Lauf aktiv |
| `color` | string | optionale Vorgabe für die Darstellung |
| `sourceDerived` | boolean | aus den Quellen abgeleitet statt vordefiniert |
| `confidence` | number | 0.0–1.0, Vertrauen der Ableitung |
| `occurrences` | number | Trefferzahl im Korpus |

### 8.2 Zuordnungsreihenfolge

1. **Exakter Treffer** der Relation-Set-ID gegen `keyword_raw` (Groß-/Kleinschreibung egal).
2. **Vokabular-Treffer** über Synonymlisten im Relation Set (z. B. `REPORTS_TO` ←
   `berichtet an`, `reports_to`, `ist unterstellt`).
3. **LLM-Entscheidung** nur für den Rest, mit der vollständigen Liste erlaubter IDs und
   der Evidenz als Kontext; Ergebnis enthält die gewählte ID und eine Begründung.
4. **Nicht zuordenbar** → `relation = "UNTYPISIERT"`, `typisiert = false`. Die Kante bleibt
   sichtbar, aber klar unterscheidbar (gestrichelt, grau). Kein stiller Fallback auf den
   ersten Eintrag.

Der heutige Zustand in `src/utils/LightRAGService.ts:150-220` (Teilstring-Heuristik auf
zusammengesetzten Label-Strings) entfällt: dort bleibt bei `"leitet, ist verantwortlich fur"`
faktisch immer der Rohstring stehen, also passiert gar keine Typisierung.

Begleitmaßnahme: Das Relation Set muss zu jedem Eintrag `id`, `label`, `description`,
`synonyms`, `sourceTypes`, `targetTypes`, `directional` und `inverse` (für die
Rückrichtungskante) enthalten. Fehlt der Umkehrbegriff, wird eine Kante B→A nur erzeugt,
wenn das Set `inverse` definiert – sonst bleibt die Richtung eindeutig.

---

## 9. Stufe E – Darstellung

nodges kann das bereits, es muss nur richtig gefüttert werden.

| Element | Mechanik | Status |
|---------|----------|--------|
| Parallele Kanten | `src/core/EdgeObjectsManager.ts:62-93` gruppiert nach ungeordnetem Paar; `index`/`totalEdges` fächert die Kurven (Winkel `2π/n`, Höhe `2.8 + 0.5·i`, Zeile 423-441) | vorhanden |
| Kantenfarbe nach Typ | `RelationshipVisualPreset.color` mit `categorical` über `relation` (`src/types.ts:70-81`) | vorhanden, Mapping ergänzen |
| Kantendicke nach Stärke | `RelationshipVisualPreset.thickness` über `weight` bzw. `belegzahl` | vorhanden, Mapping ergänzen |
| Detailanzeige | `src/ui/InfoPanelUI.ts:155-172` zeigt **alle** Kanten-Properties außer den technischen Feldern | vorhanden, Beleg erscheint automatisch |
| Hover-Info | `src/ui/HoverInfoPanel.ts:345-375` | vorhanden |
| Belegt/Unbelegt unterscheidbar | zwei Presets, z. B. `belegt` (durchgezogen) und `untypisiert` (gestrichelt, grau) über `typisiert`/`paarung` | zu ergänzen |
| Legende nach Relationstyp | `src/ui/LegendPanel.ts` + Relation Set | zu ergänzen |
| Zeitachse | `TemporalDataSchema` (`src/types.ts:96-110`) | nur mit belegten Werten |

Darstellungsregeln:
1. Eine sichtbare Kante = eine belegte Aussage. Keine Aggregation in der Ansicht.
2. `weight` steuert Dicke oder Leuchtkraft, nie die Anzahl der Linien.
3. Die Beschriftung zeigt den Relation-Set-Anzeigenamen, nicht den Rohstring.
4. Ein Filter „nur belegte Kanten" (`herkunft = lightrag`) und ein Filter „nur typisiert"
   sind Pflicht, sonst ist der Graph bei großen Korpora unlesbar.
5. Der Belegtext ist im Detailpanel vollständig lesbar, mit Datei und Chunk-ID.

---

## 10. Risiken, Fallstricke, Grenzen

| Nr | Risiko | Wirkung | Gegenmaßnahme |
|----|--------|---------|---------------|
| 1 | **Doppelschreiber** auf einer Storage: LightRAG hat keine Dateisperren (kein `flock`/`FileLock` im Paket) | Datenverlust (letzter Schreiber gewinnt) | genau ein Schreibprozess; Windows-Instanz gestoppt lassen, oder eigenes `LIGHTRAG_WORKING_DIR` |
| 2 | `deduplicateGraph` (`src/utils/VectorStoreManager.ts:195`) bildet den Schlüssel `${source}-${target}-${rel.type}` – nodges-Kanten haben aber `relation`, kein `type` | Schlüssel wird `A-B-undefined` → **alle parallelen Beziehungen zwischen A und B werden bis auf eine gelöscht** | in Build 14 nicht verwenden; vor einer Wiederverwendung den Schlüssel auf `relation` umstellen |
| 3 | `description` kann per LLM zusammengefasst sein (ab Überlänge) | Beleg ist nicht mehr wörtlich | für den Beleg `chunks` aus `aquery_data` verwenden, nicht die Description; `truncate`-Feld beachten |
| 4 | `keywords` sind Freitext des Extraktions-LLM | Typisierung instabil über Läufe | Domänen-Prompt-Profil (Abschnitt 5.3) + Relation-Set-Vokabular + `keywords`-Normalisierung |
| 5 | Alte Kappung `MAX_GRAPH_NODES`/`MAX_GRAPH_EDGES` | Kanten verschwinden still | im neuen Pfad nicht anwenden; Teilgraph über `max_depth` steuern |
| 6 | Prompt-Injection aus Dokumenten („Ignoriere die Anweisungen und ...") | falsche oder erfundene Entitäten | Extraktionsprofil mit Regel „nur aus dem Text", Belegpflicht pro Kante, Stichprobenprüfung |
| 7 | Embedding-Modellwechsel | alte Vektoren inkompatibel | `EMBEDDING_MODEL`/`EMBEDDING_DIM` einfrieren; bei Wechsel Neu-Einspielen |
| 8 | Kosten: Gleaning, Relation-Review, LLM-Typisierung | OpenRouter-Kosten steigen | Deckel pro Lauf (Dokument- und Tokenbudget), Artefakte zum Nachvollziehen |
| 9 | Fehlende Zeitangaben im LightRAG-Modell | Zeitbezug nicht abbildbar | nur belegte Zeitwerte übernehmen, sonst Feld leer lassen |

---

## 11. Abnahmekriterien und Testplan

Build 14 gilt als abgenommen, wenn alle folgenden Punkte erfüllt sind.

**Funktional**
1. Ein Testdokument (empfohlen: ein Erlass mit klarer Artikelstruktur) wird über
   `POST /documents` aufgenommen; der Status läuft bis `processed`.
2. Für eine Suchanfrage liefert `POST /query/data` Entitäten, Beziehungen, Chunks und
   Referenzen; keine der bisherigen Kappungen greift.
3. Zwischen mindestens einem Entitätspaar entstehen **drei oder mehr getrennte Kanten** mit
   unterschiedlichen `relation`-Werten – sichtbar als parallele, unterscheidbare Kurven.
4. Jede Kante im Ergebnis besitzt `source_id` und `file_path`.
5. Der Belegtext ist im Detailpanel lesbar und stimmt mit der angegebenen Textstelle überein.

**Strukturell (automatisiert)**
6. Invariante aus 7.5: keine Beziehung geht bei der Expansion verloren.
7. Keine Kante verliert `weight` oder `source_id` gegenüber der LightRAG-Quelle.
8. Kanten-IDs sind über zwei aufeinanderfolgende Läufe identisch (Determinismus).
9. Bestehende Tests bleiben grün: `npm test` (aktueller Stand: 232 bestanden, 31 übersprungen).

**Qualitativ (Stichprobe, manuell)**
10. 20 zufällige Kanten: Beleg vorhanden, inhaltlich korrekt, kein Weltwissen ergänzt.
11. Keine Entität ohne Textnennung; keine Dubletten durch Sprachwechsel (englisch/deutsch).

**Artefakte je Lauf** (analog zu `B13_01_...`):

```
public/data/b14/B14_01_Dokumente.json        (Aufnahmeliste inkl. doc_id/file_path)
public/data/b14/B14_02_Rohrelationen.json    (unveränderte LightRAG-Relationen)
public/data/b14/B14_03_Expansion.json        (Keyword-/Beschreibungsaufteilung + Paarung)
public/data/b14/B14_04_Typisierung.json      (Zuordnung + Begründung + untypisierte)
public/data/b14/B14_05_Graph.json            (finaler nodges-Graph)
```

---

## 12. Umsetzungsreihenfolge

| Meilenstein | Inhalt | Aufwand | Absicherung |
|-------------|--------|---------|-------------|
| M1 | Backend: `POST /documents`, Statusabfrage, Aufnahme über Pipeline mit `doc_id`/`file_path`/`process_options` | mittel | Integrationstest gegen Testdokument |
| M2 | Backend: `POST /query/data` über `aquery_data`, inkl. `hl_keywords`/`ll_keywords`; `/graph`-Durchleitung | klein | API-Test, Vergleich alt/neu |
| M3 | Expansion im Backend oder in `LightRAGService.queryGraph`: keywords/description aufteilen, Kantenfelder nach 7.3 | klein-mittel | Invariantentest (7.5) |
| M4 | Typisierung gegen Relation Set, Semantik statt Substring; Umkehrrichtung | mittel | Test mit drei Relation Sets |
| M5 | Darstellung: Farb-/Dicken-Mapping, Belegt/Unbelegt-Presets, Filter, Legende, Evidenz im Detailpanel | mittel | manueller Sichtcheck |
| M6 | Domänen-Prompt-Profil, Chunker-Wahl, `MAX_GLEANING`-Testreihe, Belegstichproben | mittel | Qualitätsbericht |

M1 bis M3 liefern den eigentlichen Nutzen. M4 bis M6 sind Qualitätsschritte, die auf
derselben Datenbasis aufsetzen.

---

## 13. Offene Entscheidungen

1. **Kantenaufteilung im Backend oder im Frontend?** Backend ist sauberer (ein Ort, auch für
   andere Clients) und macht `/query/data` direkt nutzbar; Frontend wäre schneller umgesetzt.
   Empfehlung: Backend.
2. **Ein neuer Endpunkt `/query/graph` mit Kantenexpansion, oder `queryGraph` in
   `LightRAGService` erweitern?** Empfehlung: neuer Endpunkt, alten Build-12-Pfad unberührt
   lassen.
3. **Ersatzrelation für leere `keywords`:** Vorschlag `verknuepft` mit `typisiert=false`.
4. **Sollen LightRAG- und LLM-synthetisierte Kanten in einem Graphen sichtbar sein?**
   Vorschlag: ja, aber unterscheidbar über `herkunft` (`lightrag` / `llm`), mit Filter.
5. **Testkorpus:** welches Dokument wird für die Abnahme verwendet, und wie viele Beziehungen
   werden erwartet?

---

## 14. Zusammenfassung in einem Satz

Build 14 speist Dokumente über die Pipeline mit Herkunft und Domänen-Prompt ein, holt den
belegten Teilgraphen über `aquery_data` statt den gekappten Gesamtgraphen, expandiert jede
LightRAG-Sammelkante in ihre einzelnen Beziehungen samt Belegtext, typisiert sie gegen das
Relation Set und stellt sie in nodges als unterscheidbare, nachvollziehbare parallele Kanten dar.