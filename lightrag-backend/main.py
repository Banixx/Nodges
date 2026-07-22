import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="LightRAG Local API for Nodges", version="0.102.12")

# CORS-Einstellungen fuer Kommunikation mit Nodges Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    mode: Optional[str] = "hybrid"

class InsertRequest(BaseModel):
    text: str

# LightRAG Instanziierung (optional mit Fallback)
LIGHTRAG_AVAILABLE = False
rag_instance = None

try:
    from lightrag import LightRAG, QueryParam
    from lightrag.llm import gpt_4o_mini_complete, gpt_4o_complete

    WORKING_DIR = os.getenv("LIGHTRAG_WORKING_DIR", "./rag_storage")
    if not os.path.exists(WORKING_DIR):
        os.makedirs(WORKING_DIR)

    rag_instance = LightRAG(
        working_dir=WORKING_DIR,
        llm_model_func=gpt_4o_mini_complete
    )
    LIGHTRAG_AVAILABLE = True
except Exception as e:
    print(f"[LightRAG Backend Warning] LightRAG engine not fully initialized (using fallback/mock mode): {e}")

@app.get("/")
@app.get("/health")
def read_root():
    return {
        "status": "online",
        "service": "LightRAG Local API",
        "lightrag_engine_active": LIGHTRAG_AVAILABLE,
        "version": "0.102.12"
    }

@app.post("/query")
def process_query(request: QueryRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query text must not be empty")
    
    if LIGHTRAG_AVAILABLE and rag_instance is not None:
        try:
            from lightrag import QueryParam
            res = rag_instance.query(request.query, param=QueryParam(mode=request.mode))
            return {
                "status": "success",
                "query": request.query,
                "mode": request.mode,
                "answer": str(res),
                "graph_context": {
                    "nodes": [
                        {"id": "lightrag_res", "label": request.query[:20], "properties": {"source": "LightRAG Engine"}}
                    ],
                    "edges": []
                }
            }
        except Exception as err:
            print(f"[LightRAG Error] Query execution failed: {err}")

    # Fallback / Mock Response fuer Frontend-Entwicklung
    mock_nodes = [
        {"id": "node_1", "label": f"Konzept: {request.query[:15]}", "properties": {"type": "Konzept", "mode": request.mode}},
        {"id": "node_2", "label": "Visualisierung", "properties": {"type": "Output"}},
        {"id": "node_3", "label": "Knowledge Graph", "properties": {"type": "Struktur"}}
    ]
    mock_edges = [
        {"source": "node_1", "target": "node_2", "relation": "generiert"},
        {"source": "node_1", "target": "node_3", "relation": "verknuepft"}
    ]

    return {
        "status": "success",
        "query": request.query,
        "mode": request.mode,
        "answer": f"Antwort fuer '{request.query}' (Modus: {request.mode}). LightRAG-Mock verarbeitet den Kontext.",
        "graph_context": {
            "nodes": mock_nodes,
            "edges": mock_edges
        }
    }

@app.post("/insert")
def process_insert(request: InsertRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Insert text must not be empty")

    if LIGHTRAG_AVAILABLE and rag_instance is not None:
        try:
            rag_instance.insert(request.text)
            return {"status": "success", "message": "Text successfully inserted into LightRAG knowledge base."}
        except Exception as err:
            raise HTTPException(status_code=500, detail=f"Failed to insert text: {err}")

    return {
        "status": "success",
        "message": "Text received (Mock mode active)."
    }
