# 08 Historie und Entscheidungen (ADRs)

Das Entwicklungstagebuch von Nodges dokumentiert Architektur-Entscheidungen (Architecture Decision Records - ADRs) und Pivot-Momente. Es erklärt das "Warum" hinter den technischen Konzepten, um zu verhindern, dass zukünftige Iterationen alte, bereits gelöste Fehler wiederholen.

---

## 1. Die Findungsphase (Build 1 bis Build 4)

> **Visualisierung:** Siehe [11_BuildEvolutionsTimeline_001.mmd](11_BuildEvolutionsTimeline_001.mmd)

In den ersten Versionen war Nodges stark von klassischen Dashboards inspiriert. 
- **Das Problem:** Die JSON-Daten waren hart an visuelle Komponenten gekoppelt. Wenn das System einen Knoten vom Typ "Server" fand, erwartete der Code ein zylindrisches Mesh; war es ein "Router", wurde ein Quader geladen.
- **Der Pain Point:** Jeder neue Datensatz (z.B. Biologie, Mythologie) erforderte, dass der Quellcode angefasst wurde, um neue `if/else`-Blöcke für die Render-Logik zu schreiben. Die Skalierbarkeit war bei Null.

---

## 2. Der große Pivot: Build 5 (Die Entkopplung)

> **Visualisierung:** Siehe [11_OntologieArchitektKonzept_003.mmd](11_OntologieArchitektKonzept_003.mmd)

Build 5 ist der wichtigste Meilenstein in der Geschichte des Projekts.
- **Entscheidung:** Das Attribut `type` verlor seine Dominanz. Die Engine wurde ignorant gegenüber dem Inhalt.
- **Lösung:** Einführung von *Global Presets* (`global_node`, `global_edge`) und dem *Visual Mapping*. Datenattribute (wie `influence`, `category`) wurden nun zur Laufzeit durch den User auf visuelle Kanäle (Scale, Color) gemappt.
- **Geburt des Ontologie-Architekten:** Das LLM durfte nicht mehr einfach Listen von Objekten generieren. Es musste zuerst das Schema erfinden, welches dann das Mapping steuerte.

---

## 3. Der Kampf gegen Halluzinationen (Build 6)

> **Visualisierung:** Siehe [11_ADRProblemLoesung_002.mmd](11_ADRProblemLoesung_002.mmd)

Nachdem Build 5 die visuelle Flexibilität sicherstellte, fielen LLMs oft auf struktureller Ebene aus (sie brachen das JSON oder vergaßen Kanten-IDs).
- **Entscheidung:** Einführung strikter Laufzeit-Validierung.
- **Lösung:** Zod wurde in den Tech-Stack integriert. Das System nutzte nun den "JSON Schema Mode", um dem LLM einen harten Constraint aufzuerlegen. Das Modell konnte physisch nicht mehr von der Datenstruktur abweichen.

---

## 4. Grounding und semantische Tiefe (Build 8 & Build 9)

Zwar generierten LLMs nun perfekte Strukturen, litten aber unter Wissenslücken bei harten Fakten (z.B. genaue Jahreszahlen, Entfernungen).
- **Build 8 (Wikidata):** Nodges delegierte die Recherche an Wikidata. Das LLM schrieb SPARQL-Queries statt Text zu raten. Die RDF-Triples wurden die verifizierte Basis für den 3D-Graphen. Halluzinationen bei harten Fakten wurden eliminiert.
- **Build 9 (Vektor-Deduplizierung):** Bei sehr großen Netzwerken wurden Duplikate generiert ("Apple" und "Apple Inc."). Build 9 führte Embeddings und Kosinus-Ähnlichkeit ein, um Graphen nach der Generierung semantisch zu verschmelzen und zu bereinigen.

---

## 5. Die Demokratisierung: Build 10 (Modulare Pipeline)

Die letzte große Architektur-Evolution. Früher gab es "die Build 6 Pipeline" oder "die Build 8 Pipeline" als getrennte Code-Pfade.
- **Entscheidung:** Monolithische Pipelines verhindern Flexibilität.
- **Lösung:** Build 10 wandelte Nodges in ein voll modulares, agentisches System um. Der Nutzer kombiniert im UI (CreatePanel) nun selbst: Modell-Quelle (Lokal vs. Cloud), Grounding-Strategie (Wikidata vs. None), QA (Human-in-the-loop vs. Auto) und Bewertungsmethode (Cosine-Similarity). Dies machte Nodges zukunftssicher und unabhängig von einzelnen AI-Providern.
