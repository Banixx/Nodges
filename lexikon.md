# Lexikon — Fachbegriffe und Kürzel

> Projekt: **nodges** (3D-Netzwerk-Visualisierung mit Three.js / TypeScript)  
> Backend: **LightRAG** (Python / FastAPI)  
> Kontext: OntoGPT, SPIRES, Ontologien, LLMs und Container-Entwicklung

---

## A

### API (Application Programming Interface)
Schnittstelle, über die Software-Komponenten miteinander kommunizieren. Im Projekt stellt das LightRAG-Backend (FastAPI) eine REST-API auf Port 8000 bereit, die das Frontend (Vite/Three.js) per HTTP-Requests abfragt.

### AsyncOpenAI
Asynchroner Python-Client für die OpenAI-API (oder kompatible Endpunkte wie OpenRouter). Im Backend wird er verwendet, um Embeddings (z. B. `text-embedding-3-small`) zu generieren.

## C

### CDP (Chrome DevTools Protocol)
Protokoll zur Steuerung und Inspektion von Chromium-basierten Browsern über eine Netzwerkverbindung (Port 9222). Wird für Browser-Automation, Screenshots oder Debugging genutzt. Im Container aktuell nicht verfügbar.

### Chunk Entity Relation Graph
Die interne Wissensgraph-Datenstruktur von LightRAG. Sie speichert aus Text extrahierte Entitäten als Knoten und deren Beziehungen als Kanten. Das Backend liest diesen Graphen aus und sendet ihn als `nodes`/`edges` an das Frontend.

### CLI (Command Line Interface)
Textbasierte Benutzeroberfläche, über die Programme gesteuert werden. OntoGPT wird primär als CLI-Tool (`ontogpt extract ...`) bedient.

### CORS (Cross-Origin Resource Sharing)
Sicherheitsmechanismus im Browser, der steuert, ob eine Webseite Ressourcen von einer anderen Domain abrufen darf. Das FastAPI-Backend erlaubt im Projekt alle Ursprünge (`allow_origins=["*"]`), damit das Frontend auf dem Vite-Dev-Server mit dem Backend auf Port 8000 kommunizieren kann.

## D

### DevContainer
Entwicklungsumgebung, die als Docker-Container konfiguriert ist. Das Projekt nutzt einen DevContainer, in dem automatisch Node.js-Abhängigkeiten installiert und Vite gestartet werden.

### Docker
Container-Virtualisierungsplattform. Der DevContainer basiert auf einem Docker-Image; der Container-Nutzer ist hier `piuser` (nicht der in `devcontainer.json` ursprünglich konfigurierte `node`-Nutzer).

## E

### EMAPA (Mouse Developmental Anatomy Ontology)
Ontologie zur Beschreibung der anatomischen Entwicklung der Maus. Ein Beispiel für ein von OntoGPT unterstütztes Domänenschema (SPIRES-Template).

### Embedding (Vektoreinbettung)
Numerische Repräsentation eines Textes als hochdimensionaler Vektor. Ähnliche Bedeutungen liegen im Vektorraum nah beieinander. LightRAG nutzt Embeddings, um Textstücke semantisch zu indexieren und zu suchen.

### EmbeddingFunc
Klasse in LightRAG, die eine benutzerdefinierte Embedding-Funktion kapselt. Im Backend wird sie mit `custom_openai_embed` befüllt, die über `AsyncOpenAI` Embeddings von OpenAI oder OpenRouter abruft.

## F

### FastAPI
Modernes, asynchrones Python-Webframework zur Erstellung von APIs. Das LightRAG-Backend (`main.py`) basiert auf FastAPI und definiert Endpunkte wie `/query`, `/insert` und `/databases`.

## G

### GO (Gene Ontology)
Widely-used Ontologie zur Beschreibung von Gen- und Protein-Funktionen in biologischen Organismen. Ein von OntoGPT unterstütztes Schema (z. B. Template `go_terms`).

## H

### host.docker.internal
Spezieller DNS-Name in Docker, der auf den Host-Rechner des Containers verweist. Im Projekt versucht der Vite-Proxy, LightRAG über `host.docker.internal:8000` zu erreichen; dies ist im aktuellen Setup jedoch nicht auflösbar.

### Hybrid Search
Suchverfahren, das semantische Ähnlichkeit (Vektorsuche) mit klassischer Keyword-Suche kombiniert. LightRAG unterstützt Modi wie `"hybrid"`, um sowohl konzeptuelle Nähe als auch exakte Worttreffer zu berücksichtigen.

## J

### JSON (JavaScript Object Notation)
Leichtgewichtiges, textbasiertes Datenformat zum Austausch von Daten zwischen Frontend und Backend. Die LightRAG-API liefert Ergebnisse als JSON; OntoGPT kann ebenfalls JSON als Ausgabeformat erzeugen.

## K

### Knowledge Base (Wissensbasis)
Strukturierte Sammlung von Fakten, Entitäten und Relationen. OntoGPT extrahiert aus Text Daten, die direkt in eine Knowledge Base eingespeist werden können.

### Knowledge Graph (Wissensgraph)
Graph-basierte Datenstruktur, in der Entitäten (Knoten) durch Relationen (Kanten) verbunden sind. nodges visualisiert solche Graphen in 3D; LightRAG baut intern einen Knowledge Graph aus eingelesenen Texten auf.

## L

### LightRAG
Python-Framework für Retrieval-Augmented Generation über große Textmengen. Es baut automatisch einen Wissensgraphen auf und unterstützt hybride Abfragen. Im Projekt läuft es als FastAPI-Backend auf dem Windows-Host (nicht im Container).

### LinkML
Datenmodellierungssprache und Framework zur Definition von Schemas. OntoGPT verwendet LinkML-Schemas als Eingabe, um die Struktur der zu extrahierenden Daten vorzugeben (z. B. welche Felder ein „Drug“-Objekt hat).

### LLM (Large Language Model)
Großes Sprachmodell (z. B. GPT-4, Morph-v3), das auf Basis riesiger Textmengen trainiert wurde und zur Textgenerierung, -zusammenfassung und -extraktion genutzt wird. Sowohl OntoGPT als auch LightRAG setzen auf LLMs.

### LLM_MODEL
Umgebungsvariable im LightRAG-Backend, die das zu verwendende Sprachmodell festlegt (z. B. `morph/morph-v3-large`).

## M

### MONDO (Monarch Disease Ontology)
Ontologie zur Integration von Krankheitsbezeichnungen aus verschiedenen Quellen. Wird von OntoGPT für die domänenspezifische Extraktion von Krankheitsentitäten genutzt.

## N

### NER (Named Entity Recognition)
Verfahren zur Erkennung und Klassifizierung von Eigennamen (Personen, Orte, Organisationen, Krankheiten etc.) in Texten. OntoGPT nutzt LLMs für NER im Rahmen der Schema-Extraktion.

### nodges
Projektname der 3D-Netzwerk-Visualisierungsanwendung. Basiert auf TypeScript, Vite und Three.js; kommuniziert mit einem Python-Backend (LightRAG).

### npm (Node Package Manager)
Paketmanager für JavaScript/Node.js. Wird im Projekt verwendet, um Abhängigkeiten wie `three`, `vite` oder `vitest` zu verwalten und Scripts wie `npm run dev` auszuführen.

### noVNC
Web-basierter VNC-Client, der einen Browser als Fernzugriff für grafische Desktop-Umgebungen nutzt. Im Projekt theoretisch auf Port 6080 vorgesehen, aktuell aber nicht funktionsfähig (fehlende Pakete im Container).

## O

### OBO (Open Biological and Biomedical Ontologies)
Standardformat und Gemeinschaft für biologische und biomedizinische Ontologien. OntoGPT kann extrahierte Entitäten gegen OBO-Ontologien grounden (verifizieren und verlinken).

### OntoGPT
Python-Paket zur extraktionsbasierten Wissenserzeugung aus Text mit LLMs. Kernmethode ist SPIRES. Es nutzt LinkML-Schemas und kann Ergebnisse in JSON, YAML, RDF oder OWL ausgeben.

### Ontologie
Formale, maschinenlesbare Repräsentation von Wissen in einer Domäne. Definiert Klassen, Eigenschaften und Relationen (z. B. „Drug treats Disease"). OntoGPT nutzt Ontologien, um Extraktionen zu typisieren und zu verankern.

### Ontologie-Grounding
Verfahren, bei dem extrahierte Entitäten mit existierenden Ontologie-Einträgen verknüpft werden (z. B. „Alzheimer" → `MONDO:0004975`). Dadurch werden Daten eindeutig, wiederverwendbar und maschinenlesbar.

### OpenAI API
Kommerzielle Programmierschnittstelle für OpenAIs Modelle (GPT, Embeddings etc.). LightRAG nutzt sie über `openai_complete_if_cache`; OntoGPT setzt sie zwingend für SPIRES voraus.

### OpenRouter
Dienst, der verschiedene LLM-Provider über eine einheitliche OpenAI-kompatible API zugänglich macht. Im Projekt wird OpenRouter als Fallback genutzt, wenn `OPENAI_API_KEY` fehlt, aber `VITE_OPENROUTER_API_KEY` gesetzt ist.

### OWL (Web Ontology Language)
Standard des W3C zur Beschreibung von Ontologien im Semantic Web. OntoGPT kann Extraktionsergebnisse direkt als OWL ausgeben.

## P

### PID (Process ID)
Eindeutige Prozesskennung im Betriebssystem. Im Container fehlen Tools wie `pgrep`/`ps`; daher werden PIDs über das `/proc`-Dateisystem ermittelt (z. B. um den Vite-Prozess zu finden).

### Port Forwarding / Proxy
Technik, um Netzwerktraffic von einem Port auf einen anderen umzuleiten. Vite leitet im Dev-Modus Anfragen an `/lightrag-api` an `host.docker.internal:8000` weiter, damit das Frontend mit dem Backend kommunizieren kann.

## Q

### QueryParam
Klasse in LightRAG, die Abfrageparameter kapselt (z. B. `mode="hybrid"`). Im Backend wird sie verwendet, um die Sucheinstellungen für `rag_instance.aquery()` zu definieren.

## R

### RAG (Retrieval-Augmented Generation)
Architektur, bei der ein LLM seine Antworten mit Informationen aus einer externen Wissensdatenbank (hier: LightRAGs Graph/Index) anreichert. Dadurch werden Halluzinationen reduziert und aktuelle/quellenbasierte Antworten ermöglicht.

### RDF (Resource Description Framework)
Framework zur Beschreibung von Ressourcen im Web, basierend auf Triples (Subjekt-Prädikat-Objekt). OntoGPT kann Extraktionen als RDF ausgeben.

### Relation Extraction (Beziehungsextraktion)
Verfahren zur Erkennung semantischer Beziehungen zwischen Entitäten in Texten (z. B. „carvedilol treats hypertension"). Sowohl OntoGPT (schema-gesteuert) als auch LightRAG (automatisch) führen Relation Extraction durch.

## S

### SPIRES (Structured Prompt Interrogation and Recursive Extraction of Semantics)
Kernmethode von OntoGPT. Ein Zero-Shot-Ansatz, der aus freiem Text und einem LinkML-Schema strukturierte Daten (JSON/YAML/OWL) extrahiert, ohne domänenspezifisches Training zu benötigen.

## T

### TCP (Transmission Control Protocol)
Zuverlässiges, verbindungsorientiertes Netzwerkprotokoll. Die Ports 5173 (Vite), 8000 (LightRAG) und 6080/9222 (VNC/CDP) kommunizieren über TCP.

### Three.js
JavaScript-Bibliothek für 3D-Grafiken im Browser, basierend auf WebGL. Das Frontend von nodges nutzt Three.js, um den Knowledge Graph als interaktive 3D-Netzwerkstruktur darzustellen.

### TypeScript
Typisierte Obermenge von JavaScript. Das gesamte Frontend von nodges ist in TypeScript geschrieben, was statische Typprüfung und bessere IDE-Unterstützung ermöglicht.

## U

### UBERON
Ontologie für anatomische Strukturen bei Tieren. Ein weiteres Beispiel für ein von OntoGPT unterstütztes Schema.

### Uvicorn
Hochperformanter ASGI-Webserver für Python. Startet die FastAPI-Anwendung (`main:app`) im LightRAG-Backend auf dem Host (Port 8000).

## V

### Vector Embedding
Siehe **Embedding**.

### Venv (Virtual Environment)
Isolierte Python-Umgebung, in der Projekt-abhängige Pakete installiert werden. Das LightRAG-Backend verwendet ein venv unter `/workspace/lightrag-backend/venv`.

### Vite
Modernes Frontend-Buildtool und Entwicklungsserver. Im Projekt wird Vite für das TypeScript/Three.js-Frontend genutzt und startet automatisch auf Port 5173 (im Container) bzw. kann alternativ auf 5174 gestartet werden.

### VNC (Virtual Network Computing)
Protokoll zur Fernsteuerung von grafischen Desktops. Im Projekt theoretisch für Port 6080/noVNC vorgesehen, aber im Container nicht installiert/funktionsfähig.

## W

### WebGL
Browser-Standard für hardwarebeschleunigte 3D-Grafiken. Three.js nutzt WebGL, um die nodges-Netzwerkvisualisierung im Canvas darzustellen.

### WSL (Windows Subsystem for Linux)
Kompatibilitätsschicht, die Linux-Umgebungen unter Windows ausführt. Das Projekt-Repository liegt physisch auf dem Windows-Host unter `\home\unixusername\nodges` und ist in den Container gemountet.

## Y

### YAML (YAML Ain't Markup Language)
Menschlich lesbares Datenformat. OntoGPT kann Extraktionsergebnisse als YAML ausgeben; es wird auch oft für Konfigurationsdateien genutzt.

## Z

### Zod
TypeScript-Validierungsbibliothek zur Laufzeit-Prüfung von Datenstrukturen. Im nodges-Frontend verwendet, um API-Antworten oder interne Zustände zu validieren.

### Zod-to-JSON-Schema
Erweiterung für Zod, die aus Zod-Schemata JSON-Schema-Definitionen generiert. Nützlich für die Dokumentation oder Validierung von Schnittstellen.

### ZSL (Zero-Shot Learning)
Maschinelles Lernen, bei dem ein Modell Aufgaben lösen kann, für die es nicht explizit trainiert wurde. SPIRES/OntoGPT nutzt ZSL, um aus Text beliebige Strukturen gemäß einem LinkML-Schema zu extrahieren, ohne domänenspezifische Trainingsdaten.

---

*Dokument erstellt im Kontext der nodges-Entwicklung zur Begriffsklärung für OntoGPT, LightRAG, Three.js und Container-Infrastruktur.*
