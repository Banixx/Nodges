# Research: LLM-generierte SPARQL-Abfragen

Die Recherche zu den Erfahrungen von Entwicklern bei der Nutzung von LLMs für Text-zu-SPARQL-Aufgaben zeigt klare Herausforderungen und Best Practices auf:

## Kernprobleme
1. **Geringe Zero-Shot-Genauigkeit**: Im Vergleich zu SQL haben LLMs bei SPARQL signifikant höhere Fehlerquoten. Das liegt an den komplexeren Graphenstrukturen und der geringeren Menge an SPARQL-Trainingsdaten.
2. **Halluzination von Prädikaten**: Ohne Kontext erfinden LLMs oft RDF-Prädikate oder Klassen, die im Ziel-Wissensgraphen (wie Wikidata) nicht existieren.
3. **Komplexe Ontologien**: Multi-Hop-Abfragen (über mehrere Knotenpunkte hinweg) führen häufig zu semantisch inkorrekten Verknüpfungen in der Abfrage.

## Best Practices & Lösungsansätze aus der Praxis
Entwickler, die zuverlässige Systeme bauen, nutzen nicht einfach einen "blinden" Zero-Shot-Prompt, sondern modulare Architekturen:
* **Retrieval-Augmented Generation (RAG)**: Bevor das LLM den SPARQL-Code schreibt, wird ihm ein Ausschnitt des relevanten Datenbankschemas (z.B. bekannte Wikidata-Properties) als Kontext mitgegeben.
* **Few-Shot Learning**: Das Einbetten von erfolgreichen Beispielen (User-Prompt -> korrekter SPARQL) im System-Prompt erhöht die Erfolgsquote drastisch.
* **Iterative Validierung (Human/System-in-the-Loop)**: Ein Skript fängt Fehler der Datenbank ab und sendet diese direkt als Korrektur-Prompt an das LLM zurück ("Das Prädikat existiert nicht, versuche es nochmal").

## Fazit für Nodges Build 7
Für Nodges bedeutet das: Wir muessen dem LLM-Prompt zwingend Kontext-Wissen zu den wichtigsten Wikidata-Properties (z.B. `wdt:P31` für Instanz von, `wdt:P17` für Land) mitliefern oder eine Validierungsschleife einbauen, um Fehler bei der Graph-Erstellung zu vermeiden.
