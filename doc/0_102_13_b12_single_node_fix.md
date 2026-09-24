# Dokumentation: Behebung des Einzelknoten-Problems in Build 12 (LightRAG)

## Problemstellung
Beim Ausfuehren von Build 12 ("Text in KB einspeisen" und "Neu generieren") entstand im 3D-Netzwerk jeweils nur ein einziger Knoten, der den gekuerzten Prompt-Text darstellte.

## Ursachenanalyse
1. **Statische Mock-Knoten in `main.py`**:
   Der FastAPI-Endpunkt `/query` in [main.py](file:///C:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/main.py) lieferte in `graph_context` ein hartkodiertes Array mit nur einem einzelnen Dummy-Knoten (`lightrag_res`) zurueck, anstatt die echten extrahierten Knoten und Kanten aus dem LightRAG-Wissensgraphen abzurufen.

2. **Fehlende Positional-Arguments in LLM-Wrapper-Funktion**:
   Beim Einspeisen von Texten rief LightRAG die `llm_model_func` mit dem Prompt als 1. Parameter auf. Da `openai_complete_if_cache` jedoch als 1. Parameter `model` erwartet, schlug die Entitaeten-Extraktion im Hintergrund mit `TypeError: openai_complete_if_cache() missing 1 required positional argument: 'prompt'` fehl. Die verarbeiteten Dokumente wurden daher mit dem Status `failed` abgebrochen, weshalb keine Knoten im Graphen erzeugt werden konnten.

## Durchgefuehrte Massnahmen
1. **Anpassung der LLM- und Embedding-Signaturen**:
   In [main.py](file:///C:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/main.py) wurden `custom_llm_model_func` und `custom_openai_embed` definiert. `custom_llm_model_func` empfaengt `prompt` als ersten Parameter und uebermittelt das Modell korrekt an `openai_complete_if_cache`. `custom_openai_embed` bindet `EmbeddingFunc` ein.

2. **Dynamische Wissensgraph-Extraktion**:
   In `/query` in [main.py](file:///C:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/main.py) wird nun `await rag_instance.chunk_entity_relation_graph.get_knowledge_graph("*")` aufgerufen. Alle von LightRAG gelernten Entitaeten und Beziehungen werden dynamisch als Knoten und Kanten in `graph_context` an Nodges uebergeben.

3. **Bereinigung der Dokumenten-Zustaende**:
   Die zuvor fehlerhaft markierten Eintraege in `rag_storage/kv_store_doc_status.json` wurden zurueckgesetzt.

## Ergebnis
Bei erneutem Klick auf **Text in KB einspeisen** extrahiert LightRAG nun erfolgreich alle Entitaeten und Verbindungen aus den Rohdaten. Beim anschliessenden **Neu Generieren** visualisiert Nodges das vollstaendige Wissensnetzwerk in 3D.
