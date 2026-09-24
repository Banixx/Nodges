# Plan für Build 8: Wikidata SPARQL Pipeline & Bugfixes

## Phase 1: Kritischer Bugfix (vite.config.ts)
~~Aktuell schlägt der Vite Dev-Server mit einem Syntax-Error fehl (`Unexpected "catch"`).~~
~~**Ursache:** In `vite.config.ts` in Zeile 25 wird ein `if (!filename || !content) {` Block geöffnet, aber nach dem `return;` in Zeile 28 fehlt die schließende geschweifte Klammer `}`.~~
**Aktion:** Erledigt. `vite.config.ts` ist bereits korrekt und der Server läuft stabil.

## Phase 2: Architektur Build 8 (Zwei-Schritt Wikidata Pipeline)
Um Halluzinationen von P- und Q-IDs durch das LLM bei der Generierung von SPARQL-Queries zu verhindern und Wikidata-Hierarchien korrekt aufzulösen, machen wir den bewährten Prototyp-Lauf (b7) zum Standard.

### Schritt 2.1: Implementierung der ID-Suche (Das "Wörterbuch")
- **Ziel:** Vor der SPARQL-Generierung die exakten Wikidata-IDs (Entitäten und Eigenschaften) für die Suchanfrage ermitteln (Faktencheck).
- **Umsetzung:**
  - Vorschalten eines Abrufschritts (API oder erstes LLM-Prompting), der die Suchbegriffe in validierte IDs auflöst (z.B. "Planet" = Q634).
  - Das Ergebnis wird als JSON-Wörterbuch an den nächsten Schritt übergeben.

### Schritt 2.2: Anpassung des Haupt-Prompts (In-Context Learning & Ontologie)
- **Ziel:** Den Prompt für die Graphen-Generierung so anpassen, dass das LLM streng an die zuvor gefundenen IDs gebunden wird und die Verschachtelung von Wikidata versteht.
- **Umsetzung:**
  - **Keine Halluzinationen:** Der System-Prompt zwingt das LLM dazu, AUSSCHLIESSLICH die im Wörterbuch bereitgestellten IDs zu verwenden.
  - **Property-Paths nutzen:** Das Modell wird instruiert, bei Klassifizierungen wie `wdt:P31` (Instanz von) immer den Property-Path `wdt:P31/wdt:P279*` (Instanz von oder Unterklasse davon) zu nutzen. Dies löst das Problem tief gestaffelter Entitäten (z.B. Erde -> terrestrischer Planet -> Planet).
  - **Performance & Lesbarkeit:** Wir erzwingen weiterhin `SERVICE wikibase:label` für lesbare Namen und `LIMIT` gegen Timeouts.

### Schritt 2.3: Integration in die Nodges UI
- Die UI wird so erweitert, dass der Nutzer den Fortschritt dieses Zwei-Schritt-Prozesses sieht (z.B. "Faktencheck läuft..." -> "SPARQL-Generierung läuft...").
- Sicherstellung, dass das schlussendliche JSON sauber in die existierende Node/Edge Struktur von Nodges übersetzt wird, wie es der erfolgreiche Prototyp-Lauf bewiesen hat.
