# Architektur-Konzept: Faktentreue Beziehungsdichte für Build 12 (LightRAG)

## Grundsatz & Leitprinzipien
1. **Faktentreue (Single Source of Truth)**: Build 12 basiert auf der indizierten LightRAG-Knowledge-Base. Das LLM darf beim Generieren/Exportieren der JSON-Struktur **keine Fakten erfinden oder halluzinieren**. Die Datenbank liefert die verbindliche, stabile Basis.
2. **Keine synthetischen Scanner-Eingriffe im Quell-JSON**: Es finden keine automatischen Code-Scanner statt, die das erzeugte Quell-JSON verändern oder synthetische Knoten erzeugen. Dynamische Anpassungen oder temporäre Zuordnungen sind exklusiv dem **Mapping Panel / Visualizer** vorbehalten.
3. **Maximale Erfassung multidimensionaler Beziehungen**: Es ist das zentrale Ziel von Nodges, komplexe und vielschichtige Beziehungsnetze (z. B. Mitgliedschaften, Unterstellungsverhältnisse, Leitungsfunktionen) ohne Datenverlust abzubilden.

## Analyse der Schwachstellen bei der Kantenextraktion in Build 12
- **Backend Indexierungs-Prompt (`lightrag-backend/main.py`)**: Beim Einfügen von Texten in LightRAG (`ainsert`) entscheidet das interne Extraktions-Prompt von LightRAG darüber, welche Entitäten und Kanten in die Graph-Datenbank geschrieben werden. Ist der Prompt zu abstrakt, werden feingliedrige Beziehungen (z. B. Parteimitarbeit, Kommissionssitze, Vorsteherrollen) vom Indexer übergangen.
- **Graph-Kontext-Transformation (`main.py` & `LightRAGService.ts`)**: Die Rückgabe von `/query` muss ausnahmslos alle Kanten-Eigenschaften (`relation`, `keywords`, `description`) der Datenbank ohneVereinfachung oder Fallbacks ("verknuepft") an Nodges durchreichen.

## Maßnahmen zur Behebung für Build 12
1. **Konfiguration des LightRAG Indexing-Prompts im Python Backend**:
   - Anpassung der `entity_extraction`-Prompts im LightRAG-Backend, sodass beim Einlesen von Dokumenten **alle feingliedrigen und multidimensionalen Verbindungen** als eigenständige Kanten erfasst werden.
2. **1:1 Extraktion im Backend (`main.py`)**:
   - Der `/query`-Endpunkt stellt sicher, dass sämtliche im Subgraphen gefundenen Kanten mit ihren exakten relationalen Bezeichnungen vollständig im `graph_context` übergeben werden.
3. **Faktentreue Speicherung im Frontend (`LightRAGService.ts`)**:
   - Das Frontend übernimmt den gelieferten Graphen 1:1 in das Nodges JSON-Format, ohne synthetische Modifikationen am Datenmodell.
