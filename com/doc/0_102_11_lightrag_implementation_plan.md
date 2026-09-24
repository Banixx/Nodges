# Implementierungsplan: LightRAG fuer Nodges

Um LightRAG effektiv in Nodges zu nutzen, muessen wir eine Bruecke zwischen unserer TypeScript/Three.js-Visualisierung (Frontend) und dem Python-basierten LightRAG-System (Backend) schlagen. 

## 1. Python-Backend einrichten
Da LightRAG in Python geschrieben ist, benoetigt Nodges einen separaten Microservice.
- **Ordnerstruktur:** Erstelle einen neuen Ordner `lightrag-backend` parallel oder innerhalb des Projekts.
- **Installation:** Richte ein virtuelles Python-Environment (venv) ein und installiere das Paket mit API-Unterstuetzung: 
  ```bash
  pip install "lightrag-hku[api]"
  ```
- **Umgebungsvariablen:** Lege eine `.env` Datei an, um die noetigen API-Keys (z. B. `OPENAI_API_KEY`) zu speichern, da LightRAG diese fuer die Extraktion von Entitaeten und Embeddings benoetigt.

## 2. API-Server konfigurieren (FastAPI)
Wir muessen eine Schnittstelle bauen, mit der Nodges kommunizieren kann.
- Erstelle ein Python-Skript (z. B. `server.py`), das die `LightRAG`-Klasse initialisiert.
- **Endpunkte:** 
  - `POST /insert`: Nimmt rohen Text von Nodges (z. B. Dokumente oder Nutzer-Prompts) entgegen und laesst LightRAG daraus den Knowledge Graph aufbauen.
  - `POST /query`: Akzeptiert Suchanfragen aus Nodges und nutzt den "hybrid" oder "global" Modus von LightRAG, um strukturierte Graphen-Daten als JSON zurueckzugeben.

## 3. Nodges Frontend anpassen (TypeScript)
Die bestehende Architektur in Nodges muss nun diesen neuen Backend-Server ansprechen.
- **LLMService.ts:** Erweitere oder ersetze die aktuellen Methoden (wie `expandGraphNodeBuild10`), sodass sie Fetch-Requests an unseren lokalen LightRAG-Server (z. B. `http://localhost:8000/query`) senden.
- **Daten-Parsing:** Die von LightRAG zurueckgegebenen Ergebnisse (oft eine Kombination aus Textantwort und referenzierten Knoten/Kanten) muessen in das von Nodges erwartete Format (`nodes` Array, `edges` Array) transformiert werden.

## 4. Persistenz und Graphen-Speicher
- LightRAG unterstuetzt standardmaessig die lokale Speicherung in einem `working_dir` Verzeichnis. 
- Für den Anfang reicht das lokale Dateisystem (JSON/Pickle), spaeter koennen wir LightRAG an eine Neo4j-Datenbank anbinden, um den gesamten in Nodges generierten Graphen persistent und extrem schnell durchsuchbar zu machen.

## Zusammenfassung des Workflows
1. Start des LightRAG API-Servers lokal im Hintergrund.
2. Der User interagiert mit Nodges (Start des Dev-Servers).
3. Beim Ausloesen eines "Deep Dives" oder einer Suche sendet `LLMService.ts` die Anfrage an den LightRAG-Server.
4. LightRAG durchsucht den eigenen Graphen und Vektorspeicher, generiert eine Antwort und schickt die semantischen Nachbarn zurueck.
5. Nodges rendert die neuen Knoten und Kanten inkrementell im 3D-Raum.
