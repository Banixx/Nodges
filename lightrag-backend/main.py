import os
import asyncio
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Lade Umgebungsvariablen aus .env.local oder .env
env_local_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env.local"))
if os.path.exists(env_local_path):
    load_dotenv(env_local_path)
load_dotenv()

# Automatisches Mapping von OpenRouter-Schluessel fuer LightRAG
if not os.getenv("OPENAI_API_KEY") and os.getenv("VITE_OPENROUTER_API_KEY"):
    os.environ["OPENAI_API_KEY"] = os.getenv("VITE_OPENROUTER_API_KEY", "")
    os.environ["OPENAI_API_BASE"] = "https://openrouter.ai/api/v1"

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
    from lightrag.llm.openai import openai_complete_if_cache
    from lightrag.utils import EmbeddingFunc
    import numpy as np
    from openai import AsyncOpenAI

    WORKING_DIR = os.getenv("LIGHTRAG_WORKING_DIR", "./rag_storage")
    if not os.path.exists(WORKING_DIR):
        os.makedirs(WORKING_DIR)

    async def custom_llm_model_func(prompt, system_prompt=None, history_messages=None, **kwargs):
        if history_messages is None:
            history_messages = []
        model = kwargs.pop("model", None) or os.getenv("LLM_MODEL", "openai/gpt-4o-mini")
        return await openai_complete_if_cache(
            model,
            prompt,
            system_prompt=system_prompt,
            history_messages=history_messages,
            **kwargs
        )

    async def custom_openai_embed(texts: list[str], **kwargs) -> np.ndarray:
        client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
        )
        model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
        response = await client.embeddings.create(
            model=model,
            input=texts
        )
        embeddings = [item.embedding for item in response.data]
        return np.array(embeddings)

    embedding_func = EmbeddingFunc(
        embedding_dim=1536,
        max_token_size=8192,
        func=custom_openai_embed,
        model_name=os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    )

    rag_instance = LightRAG(
        working_dir=WORKING_DIR,
        llm_model_func=custom_llm_model_func,
        embedding_func=embedding_func
    )
    LIGHTRAG_AVAILABLE = True
except Exception as e:
    print(f"[LightRAG Backend Warning] LightRAG engine not fully initialized (using fallback/mock mode): {e}")

@app.on_event("startup")
async def startup_event():
    global rag_instance
    if rag_instance is not None:
        try:
            await rag_instance.initialize_storages()
            print("[LightRAG Backend] Storages initialized successfully.")
        except Exception as e:
            print(f"[LightRAG Backend] Storage init error: {e}")

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
async def process_query(request: QueryRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query text must not be empty")
    
    if LIGHTRAG_AVAILABLE and rag_instance is not None:
        try:
            from lightrag import QueryParam
            res = await rag_instance.aquery(request.query, param=QueryParam(mode=request.mode))
            # Wissensgraph-Knoten und -Kanten aus LightRAG abrufen
            kg_nodes = []
            kg_edges = []
            
            try:
                if hasattr(rag_instance, "chunk_entity_relation_graph") and rag_instance.chunk_entity_relation_graph:
                    kg_data = await rag_instance.chunk_entity_relation_graph.get_knowledge_graph("*")
                    for node in kg_data.nodes:
                        n_id = str(node.id).strip('"')
                        props = dict(node.properties) if node.properties else {}
                        n_label = props.get("entity_name") or props.get("label") or n_id
                        kg_nodes.append({
                            "id": n_id,
                            "label": str(n_label),
                            "properties": props
                        })
                    
                    for edge in kg_data.edges:
                        e_src = str(edge.source).strip('"')
                        e_tgt = str(edge.target).strip('"')
                        e_props = dict(edge.properties) if edge.properties else {}
                        e_rel = e_props.get("keywords") or e_props.get("description") or "verknuepft"
                        kg_edges.append({
                            "source": e_src,
                            "target": e_tgt,
                            "relation": str(e_rel),
                            "properties": e_props
                        })
            except Exception as kg_err:
                print(f"[LightRAG Warning] Knowledge Graph Extraction Error: {kg_err}")

            if not kg_nodes:
                kg_nodes = [
                    {"id": "lightrag_res", "label": request.query[:25], "properties": {"source": "LightRAG Engine"}}
                ]

            return {
                "status": "success",
                "query": request.query,
                "mode": request.mode,
                "answer": str(res),
                "graph_context": {
                    "nodes": kg_nodes,
                    "edges": kg_edges
                }
            }
        except Exception as err:
            import traceback
            traceback.print_exc()
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
async def process_insert(request: InsertRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Insert text must not be empty")

    if LIGHTRAG_AVAILABLE and rag_instance is not None:
        try:
            await rag_instance.ainsert(request.text)
            return {"status": "success", "message": "Text successfully inserted into LightRAG knowledge base."}
        except Exception as err:
            import traceback
            traceback.print_exc()
            print(f"[LightRAG Insert Error] {err}")
            raise HTTPException(status_code=500, detail=f"LightRAG Insert Error: {err}")

    return {
        "status": "success",
        "message": "Text received (Mock mode active)."
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
