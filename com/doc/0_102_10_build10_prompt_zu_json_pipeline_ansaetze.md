# Übersicht: Wege von "Prompt zu beliebigem Thema" zu strukturierter Entitäten-Beziehungs-JSON

Ziel der Pipeline: Aus einem freien Nutzer-Prompt zu einem beliebigen Thema eine JSON-Struktur erzeugen, die
- Entitäten
- deren Eigenschaften (mit Intensität)
- deren Beziehungen/Interaktionen untereinander (mit Art und Ausprägung/Stärke)

erfasst — nutzbar als Input für die Nodges-Graphenvisualisierung.

---

## A. Grounding-freie Ansätze (LLM-only)

### 1. Schema-Constrained Prompting (Zero-Grounding)
Ein striktes JSON-Schema wird im System-Prompt vorgegeben (Structured Output / JSON-Mode). Das LLM füllt Entitäten, Eigenschaften+Intensität und Relationen+Stärke direkt aus eigenem Wissen aus.
- **Vorteil:** Funktioniert für jedes Thema, auch fiktive/abstrakte Konzepte. Einfachste Architektur, ein einziger API-Call.
- **Nachteil:** Keine Faktenprüfung, Werte für Intensität/Stärke sind reine LLM-Schätzung, anfällig für Halluzination bei Nischenthemen.

### 2. Kontrolliertes Vokabular / eigene Taxonomie
Wie 1, aber zusätzlich wird eine feste Liste erlaubter Relationstypen (z. B. "beeinflusst", "konkurriert mit", "ist Teil von") und eine feste Intensitäts-/Stärkeskala (z. B. 1–5) im Prompt vorgegeben.
- **Vorteil:** Konsistente, vergleichbare Werte über verschiedene Themen hinweg; bessere Visualisierbarkeit (z. B. Kantendicke nach Skala).
- **Nachteil:** Erfordert vorab Design einer sinnvollen Taxonomie; kann Nuancen verlieren.

### 3. Multi-Pass Refinement
Erster Call erzeugt nur grobe Entitätenliste, zweiter Call ergänzt Eigenschaften+Intensität, dritter Call ergänzt Beziehungen. Jeder Schritt bekommt das bisherige Zwischenergebnis als Kontext.
- **Vorteil:** Kleinere, fokussierte Prompts pro Schritt, geringeres Risiko für unvollständige/abgeschnittene JSON-Antworten bei komplexen Themen.
- **Nachteil:** Mehr API-Calls, höhere Latenz und Kosten.

### 4. Ensemble / Multi-Model Voting
Mehrere unabhängige LLM-Calls (gleiches oder verschiedene Modelle) erzeugen je eine JSON-Version. Werte für Intensität/Stärke werden gemittelt oder per Mehrheitsentscheid konsolidiert.
- **Vorteil:** Reduziert Ausreißer/Zufallsschwankungen bei subjektiven Werten.
- **Nachteil:** Vervielfacht Kosten, benötigt zusätzliche Merge-Logik.

### 5. Zwei-Agenten-Pipeline: Generator + Kritiker
Agent 1 generiert das JSON frei (wie 1/2). Agent 2 erhält nur das JSON (ohne Ursprungs-Prompt) und prüft auf Plausibilität, Duplikate, unlogische Relationstypen oder inkonsistente Intensitätswerte. Bei Problemen: Reparatur-Loop zurück an Agent 1.
- **Vorteil:** Deutlich höhere Konsistenz ohne externe Datenquelle.
- **Nachteil:** Doppelte LLM-Kosten, Kritiker kann selbst falsch liegen.

---

## B. Grounding-basierte Ansätze (externe Wissensquelle)

### 6. Zwei-Schritt Wikidata-ID-Lookup (ursprünglicher Build-8-Ansatz)
Erst Auflösung der Begriffe in P-/Q-IDs via `wbsearchentities`, dann Bindung des Haupt-Prompts an dieses Wörterbuch, anschließend SPARQL-Query gegen den Wikidata Query Service.
- **Vorteil:** Faktenbasiert, verifizierbare IDs, keine erfundenen Properties.
- **Nachteil:** Nur für Themen nutzbar, die in Wikidata gut abgedeckt sind; scheitert bei fiktiven, abstrakten oder sehr spezifischen Themen.

### 7. RAG (Retrieval-Augmented Generation)
Statt ID-Lookup wird zum Thema Text beschafft (Web-Suche, Wikipedia-Extrakt, eigene Textkorpora) und dieser Text als Kontext für die Extraktion genutzt.
- **Vorteil:** Grounding auch bei Themen, die in Wikidata schlecht abgedeckt sind (Beziehungen, Emotionen, fiktive Welten mit Wiki-Fanseiten etc.).
- **Nachteil:** Qualität hängt stark von Trefferqualität der Suche ab; zusätzlicher Such-/Fetch-Schritt nötig.

### 8. Hybrid: Freie Extraktion + selektive Nachvalidierung
Das LLM extrahiert zunächst frei (wie A), danach wird pro Entität versucht, eine passende Wikidata-ID per Fuzzy-Match zu finden. Gefundene IDs werden als Zusatzinfo angehängt, nicht gefundene bleiben trotzdem im Graph.
- **Vorteil:** Kein Blocker mehr bei fehlender Wikidata-Abdeckung, trotzdem Anreicherung wo möglich.
- **Nachteil:** Zwei unabhängige Systeme (LLM + Wikidata-Matching) müssen synchron gehalten werden.

### 9. Agentic Tool-Use (Variante A aus Build 8)
Das LLM bekommt während der Generierung direkten Werkzeugzugriff (Function/Tool Calling) auf `wbsearchentities` und ggf. weitere APIs und ruft diese bei Bedarf selbst auf.
- **Vorteil:** Flexibel, LLM entscheidet selbst wann Nachschlagen nötig ist.
- **Nachteil:** Mehr Tool-Calls = höhere Latenz, Debugging komplexer, Modell kann Tool trotzdem falsch nutzen.

### 10. Alternative Knowledge-Graph-APIs
Statt/zusätzlich zu Wikidata: DBpedia, ConceptNet (gut für semantische Alltagsrelationen), YAGO oder Google Knowledge Graph API als Quelle für IDs/Fakten.
- **Vorteil:** Andere Abdeckungsschwerpunkte (ConceptNet z. B. stärker bei alltäglichen/emotionalen Relationen als Wikidata).
- **Nachteil:** Jede API hat eigenes Schema, erhöht Integrationsaufwand.

### 11. Klassische NLP Relation-Extraction als Vorstufe
Ein spezialisiertes Extraction-Modell (z. B. REBEL) läuft über einen Textkorpus zum Thema und liefert rohe Tripel (Subjekt–Relation–Objekt). Das LLM übernimmt nur die Nachbearbeitung: Intensität/Stärke schätzen, JSON-Struktur formen.
- **Vorteil:** Trennung von Extraktion (spezialisiert, robust) und Interpretation (LLM).
- **Nachteil:** Zusätzliches Modell/Backend nötig — passt schwerer zum Client-only/BYOK-Ansatz von Nodges.

---

## C. Ergänzender Baustein (unabhängig von A/B kombinierbar)

### 12. Human-in-the-loop Review
Bevor das JSON an die Nodges-Rendering-Pipeline geht, wird es dem Nutzer im UI zur manuellen Korrektur angezeigt (Entitäten löschen/hinzufügen, Intensitäts-/Stärkewerte per Slider anpassen).
- **Vorteil:** Letzte Fehlerkorrektur-Instanz, erhöht Vertrauen in die Daten.
- **Nachteil:** Bricht den vollautomatischen Flow, zusätzlicher UI-Aufwand.

---

## D. Embedding- und Datenbank-basierte Ansätze

### 13. Vector-Embeddings + externe Vektordatenbank
Entitäten/Begriffe werden per Embedding-Modell in Vektoren umgewandelt und gegen eine bestehende Vektordatenbank (z. B. Pinecone, Weaviate, Qdrant Cloud, Supabase pgvector) abgeglichen, um semantisch ähnliche/bekannte Entitäten und deren Beziehungen zu finden.
- **Vorteil:** Semantische statt exakte Suche — findet passende Konzepte auch bei anderer Formulierung; eigene kuratierte Wissensbasis nutzbar (z. B. Fachdomäne, Fandom-Wiki, firmeninternes Wissen).
- **Nachteil:** Benötigt vorab befüllte DB, zusätzliche Infrastruktur, laufende Kosten für externen Dienst.

### 14. Lokale Vektordatenbank
Wie 13, aber komplett lokal (Chroma, LanceDB, FAISS, Qdrant lokal), kombinierbar mit lokalem Embedding-Modell.
- **Vorteil:** Keine Cloud-Abhängigkeit, Datenschutz, keine laufenden API-Kosten.
- **Nachteil:** Nutzer muss DB selbst befüllen/pflegen, Einstiegshürde höher.

### 15. Embedding-basiertes Relation-Scoring
Statt (oder zusätzlich zu) LLM-geschätzten Intensitäts-/Stärkewerten: Kosinus-Ähnlichkeit zwischen Entitäts-Embeddings als quantitatives, reproduzierbares Maß für Beziehungsstärke nutzen.
- **Vorteil:** Objektiver Zahlenwert statt reiner LLM-Schätzung.
- **Nachteil:** Semantische Nähe ist nicht zwangsläufig inhaltliche Beziehungsstärke — kann irreführend sein, eher als Zusatzsignal geeignet.

---

## E. Lokale KI (Consumer-Hardware, z. B. 12 GB VRAM)

### 16. Lokale LLM-Inferenz statt Cloud-API
Sprachmodell läuft lokal via LM Studio oder Ollama (beide bieten eine OpenAI-kompatible lokale API, direkt gegen die Nodges-Pipeline nutzbar). Bei 12 GB VRAM realistisch: 7B–14B Modelle in Q4/Q5-Quantisierung (z. B. Qwen2.5-14B-Instruct, Llama-3.1-8B, Mistral-Nemo-12B); größere Modelle nur mit stärkerer Quantisierung und spürbaren Geschwindigkeits-/Qualitätseinbußen.
- **Vorteil:** Keine API-Kosten, volle Datenkontrolle, offline nutzbar.
- **Nachteil:** Kleinere Modelle sind bei strukturierter JSON-Generierung und Faktenwissen spürbar schwächer — mehr Schema-Verletzungen, mehr Retry-Loops nötig, Wissenslücken bei Nischenthemen.
- Hinweis: Unsloth ist primär ein **Fine-Tuning-Framework**, keine Inferenz-Oberfläche — für reine Inferenz sind LM Studio/Ollama die passenden Tools.

### 17. Lokales Fine-Tuning auf das Zielschema (Unsloth)
Ein kleines lokales Modell wird per LoRA/QLoRA speziell auf die gewünschte JSON-Struktur (Entität/Eigenschaft/Intensität/Relation/Stärke) nachtrainiert. Unsloth ist auf effizientes Training auf Consumer-GPUs spezialisiert.
- **Vorteil:** Nach Training zuverlässigere Schema-Treue trotz kleiner Modellgröße, sehr günstiger Betrieb danach.
- **Nachteil:** Braucht Trainingsdaten (Beispiel-JSONs), Vorlaufaufwand; Modell bleibt auf erlerntes Muster beschränkt, generalisiert schlechter auf völlig neue Themenarten.

### 18. Voll-lokale Pipeline (16/17 + 14 kombiniert)
Lokales LLM + lokale Vektordatenbank + lokales Embedding-Modell — komplett offline, keine Daten verlassen das Gerät.
- **Vorteil:** Maximaler Datenschutz, keine laufenden Kosten, keine Rate-Limits.
- **Nachteil:** Höchste Setup-Komplexität; bei 12 GB VRAM eher an der Machbarkeitsgrenze für komplexe/umfangreiche Themen.

---

## F. Meta-Architektur: Nutzer-Wahlfreiheit

### 19. Konfigurierbares Backend (Provider-Auswahl im UI)
Statt eine feste interne Pipeline-Logik zu implementieren, bekommt der Nutzer die Bausteine aus A–E als Ein-/Ausschalt-Optionen im UI: Cloud-LLM (BYOK) vs. lokales LLM (LM Studio/Ollama-Endpoint), mit/ohne Wikidata-Grounding, mit/ohne Vektordatenbank (extern/lokal), mit/ohne Human-in-the-loop-Review. Die Pipeline wird modular statt fest verdrahtet — der Nutzer trifft die Entscheidungen, die zuvor im Flowchart automatisch getroffen wurden.
- **Vorteil:** Maximale Flexibilität je nach Thema, Hardware, Datenschutzbedarf und Budget des Nutzers.
- **Nachteil:** Höherer Implementierungsaufwand (mehrere Provider-Adapter/Schnittstellen), UI muss die Optionen verständlich und nicht überfordernd vermitteln.

---

## Kurzvergleich

| # | Ansatz | Faktentreue | Themen-Flexibilität | Kosten/Latenz |
|---|---|---|---|---|
| 1 | Schema-Constrained | niedrig | sehr hoch | niedrig |
| 2 | Kontrolliertes Vokabular | niedrig–mittel | sehr hoch | niedrig |
| 3 | Multi-Pass Refinement | niedrig–mittel | sehr hoch | mittel |
| 4 | Ensemble/Voting | mittel | sehr hoch | hoch |
| 5 | Generator+Kritiker | mittel | sehr hoch | mittel–hoch |
| 6 | Wikidata Zwei-Schritt | sehr hoch | niedrig | mittel |
| 7 | RAG | hoch | hoch | mittel |
| 8 | Hybrid (frei+Fuzzy-Match) | mittel–hoch | hoch | mittel |
| 9 | Agentic Tool-Use | hoch | niedrig–mittel | hoch |
| 10 | Alt. KG-APIs | hoch | mittel | mittel |
| 11 | NLP-Extraction + LLM | hoch | mittel | hoch (Backend nötig) |
| 12 | Human-in-the-loop | (abhängig von Basis) | + | + UI-Aufwand |
| 13 | Embeddings + externe VektorDB | mittel–hoch* | hoch | mittel |
| 14 | Embeddings + lokale VektorDB | mittel–hoch* | hoch | mittel (Setup hoch) |
| 15 | Embedding-Relation-Scoring | (Zusatzsignal) | + | niedrig |
| 16 | Lokales LLM (12 GB VRAM) | niedrig–mittel | hoch | niedrig (Hardware vorhanden) |
| 17 | Lokales Fine-Tuning (Unsloth) | mittel | mittel | Vorlauf hoch, danach niedrig |
| 18 | Voll-lokale Pipeline | mittel | hoch | Setup sehr hoch |
| 19 | Konfigurierbares Backend | (abhängig von Wahl) | sehr hoch | Implementierung hoch |

*abhängig von Qualität/Aktualität der befüllten Wissensbasis
