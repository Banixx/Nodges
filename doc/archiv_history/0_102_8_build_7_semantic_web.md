# Build 7: Semantisches Web & Datenbank-Integration

## Konzept-Übersicht
Build 7 erweitert Nodges um die Fähigkeit, externe strukturierte Wissensdatenbanken (wie Wikidata, DBpedia oder andere RDF-basierte Triple-Stores) anzubinden. Anstatt Graphen rein aus dem "Gedächtnis" des LLMs zu generieren, fungiert das LLM hierbei als intelligenter Query-Builder und Daten-Transformator. Das System zieht sich harte, überprüfbare Fakten aus dem semantischen Web.

## Architektur-Ablauf
1. **User Prompt**: Der Nutzer formuliert eine Recherche-Aufgabe (z.B. "Zeige mir alle Technologieunternehmen in Europa und ihre Verbindungen zu Forschungsinstituten").
2. **Query Generation (LLM)**: Das LLM übersetzt diesen natürlichen Sprachbefehl in eine semantische Abfragesprache (z.B. SPARQL). 
3. **Data Fetching (Skript/Backend)**: Die Applikation sendet die generierte Abfrage an einen öffentlichen Endpoint (z.B. den Wikidata Query Service: `https://query.wikidata.org/sparql`).
4. **Data Transformation**: Die zurückgegebenen Rohdaten (typischerweise JSON, bestehend aus RDF-Triples: Subjekt -> Prädikat -> Objekt) werden in das spezifische Nodges-JSON-Format (Nodes, Edges, Clouds) umgewandelt. Dies kann deterministisch durch ein Skript oder durch einen zweiten LLM-Schritt erfolgen.
5. **Visualisierung**: Die Nodges-Engine rendert den faktenbasierten Wissensgraphen.

## Potenziale
* **Faktenbasierte Graphen**: Vermeidung von Halluzinationen durch die Nutzung echter, kuratierter und tagesaktueller Daten.
* **Graph-Exploration ("Lazy Loading")**: Möglichkeit, einzelne Knoten im Visualizer anzuklicken und "on-demand" neue Relationen (Nachbarschafts-Knoten) direkt aus der Datenbank nachzuladen, anstatt den ganzen Graphen auf einmal zu generieren.
* **Massive Skalierbarkeit**: Theoretischer Zugriff auf Milliarden von verknüpften Datenpunkten im Semantic Web.

## Technische Herausforderungen
* **Komplexität von SPARQL**: Das LLM muss extrem valide und präzise Queries schreiben, um Timeouts oder leere Resultate bei öffentlichen Endpoints zu vermeiden.
* **Rate Limits**: Öffentliche Datenbanken limitieren oft die Anzahl der Anfragen. Hier müsste ein Caching-Layer oder ein Queueing-System mitgedacht werden.
* **Ontologie-Mapping**: Es muessen nicht tausende Prädikate zeitgleich visualisiert werden. Die Ontologie fokussiert sich auf die Schlüsselbegriffe aus dem User-Prompt, welche als primäre Entitäten priorisiert und dargestellt werden.

## Debugging & Qualitätskontrolle
* **Query Logging**: Sobald in der Nodges-UI auf "Generieren" geklickt wird, muss die vom LLM formulierte SPARQL-Anfrage automatisch als Datei im Downloads-Ordner des Nutzers gespeichert werden.
* **Zweck**: Dies ermöglicht eine direkte, manuelle Qualitätskontrolle und erleichtert die Fehlersuche bei fehlerhaften oder unerwarteten Graphen.

## Empfohlene nächste Schritte
1. **Machbarkeitsstudie (PoC)**: Manuelles Testen, wie zuverlässig das aktuelle LLM valide SPARQL-Abfragen für Wikidata aus verschiedenen User-Prompts generiert.
2. **Skript-Entwicklung**: Ein einfaches Node.js/TypeScript-Skript schreiben, das eine vorgegebene SPARQL-Abfrage an Wikidata sendet und das Ergebnis testweise in eine valide Nodges-Struktur parst.
