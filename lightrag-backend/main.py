from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="LightRAG Local API")

from typing import Optional, List, Dict, Any

class QueryRequest(BaseModel):
    query: str
    mode: Optional[str] = "hybrid"

@app.get("/")
def read_root():
    return {"message": "LightRAG Local API is running"}

@app.post("/query")
def process_query(request: QueryRequest):
    # TODO: Echte LightRAG-Abfrage implementieren
    # Hier wird zunaechst ein Mock-Response basierend auf dem definierten Schema zurueckgegeben
    
    mock_response = {
        "status": "success",
        "query": request.query,
        "answer": f"Dies ist eine Mock-Antwort fuer die Anfrage: '{request.query}'. LightRAG-Integration folgt.",
        "graph_context": {
            "nodes": [
                { "id": "node_1", "label": "Konzept", "properties": { "type": "Abstrakt" } },
                { "id": "node_2", "label": "Implementation", "properties": { "type": "Konkret" } }
            ],
            "edges": [
                { "source": "node_1", "target": "node_2", "relation": "fuehrt_zu" }
            ]
        }
    }
    
    return mock_response
