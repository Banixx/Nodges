import os
import json
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

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))


def _project_version() -> str:
    """Liest die Projektversion zentral aus package.json statt sie hart zu kodieren."""
    try:
        with open(os.path.join(BACKEND_DIR, "..", "package.json"), encoding="utf-8") as fh:
            return str(json.load(fh).get("version", "unknown"))
    except Exception:
        return "unknown"


APP_VERSION = _project_version()

# Einzige Quelle fuer den Speicherort ist LIGHTRAG_WORKING_DIR. Fehlt die
# Variable, bleibt der bisherige Container-Pfad der sichtbare Fallback.
_configured_working_dir = (os.getenv("LIGHTRAG_WORKING_DIR") or "").strip()
if _configured_working_dir:
    STORAGE_ROOT = os.path.abspath(os.path.expanduser(_configured_working_dir))
else:
    STORAGE_ROOT = os.path.join(BACKEND_DIR, "rag_storage")
    print(f"[LightRAG] LIGHTRAG_WORKING_DIR nicht gesetzt; verwende Fallback: {STORAGE_ROOT}")

DATABASES_DIR = os.path.join(STORAGE_ROOT, "databases")
# Altbestand: Datenbanken, die durch die frueher relative Pfadlogik unter
# lightrag-backend/rag_storage/databases angelegt wurden, weiterhin finden.
LEGACY_DATABASES_DIR = os.path.join(BACKEND_DIR, "rag_storage", "databases")
WORKING_DIR = STORAGE_ROOT

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
EMBEDDING_BASE_URL = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
try:
    EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "1536"))
except ValueError:
    EMBEDDING_DIM = 1536

app = FastAPI(title="LightRAG Local API for Nodges", version=APP_VERSION)

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

    os.makedirs(STORAGE_ROOT, exist_ok=True)

    async def custom_llm_model_func(prompt, system_prompt=None, history_messages=None, **kwargs):
        if history_messages is None:
            history_messages = []
        model = kwargs.pop("model", None) or os.getenv("LLM_MODEL", "morph/morph-v3-large")
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
            base_url=EMBEDDING_BASE_URL
        )
        response = await client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=texts
        )
        embeddings = [item.embedding for item in response.data]
        return np.array(embeddings)

    print(
        f"[LightRAG] storage={WORKING_DIR} embedding={EMBEDDING_MODEL} "
        f"dim={EMBEDDING_DIM} base={EMBEDDING_BASE_URL}"
    )

    embedding_func = EmbeddingFunc(
        embedding_dim=EMBEDDING_DIM,
        max_token_size=8192,
        func=custom_openai_embed,
        model_name=EMBEDDING_MODEL
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

# Begrenzung des extrahierten Wissensgraphen (Fix 3)
MAX_GRAPH_NODES = int(os.getenv("LIGHTRAG_MAX_GRAPH_NODES", "150"))
MAX_GRAPH_EDGES = int(os.getenv("LIGHTRAG_MAX_GRAPH_EDGES", "300"))

@app.get("/")
@app.get("/health")
def read_root():
    return {
        "status": "online",
        "service": "LightRAG Local API",
        "lightrag_engine_active": LIGHTRAG_AVAILABLE,
        "version": APP_VERSION,
        "storage_root": STORAGE_ROOT,
        "working_dir": WORKING_DIR,
        "databases_dir": DATABASES_DIR,
        "embedding_model": EMBEDDING_MODEL,
        "embedding_base_url": EMBEDDING_BASE_URL,
        "embedding_key_set": bool(os.getenv("OPENAI_API_KEY"))
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
                        e_rel = e_props.get("relation") or e_props.get("relation_type") or e_props.get("predicate") or e_props.get("label") or e_props.get("keywords") or e_props.get("description") or "verknuepft"
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

            # Fix 3: Teilgraph statt Vollgraph - Begrenzung auf konfigurierbare Maximalwerte
            if len(kg_nodes) > MAX_GRAPH_NODES:
                print(f"[LightRAG Warning] Wissensgraph auf {MAX_GRAPH_NODES} Knoten begrenzt (vorher {len(kg_nodes)}).")
                kg_nodes = kg_nodes[:MAX_GRAPH_NODES]
            if len(kg_edges) > MAX_GRAPH_EDGES:
                print(f"[LightRAG Warning] Wissensgraph auf {MAX_GRAPH_EDGES} Kanten begrenzt (vorher {len(kg_edges)}).")
                kg_edges = kg_edges[:MAX_GRAPH_EDGES]

            return {
                "status": "success",
                "query": request.query,
                "mode": request.mode,
                "answer": str(res),
                "engine_active": True,
                "mock": False,
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
        "engine_active": False,
        "mock": True,
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
            return {"status": "success", "message": "Text successfully inserted into LightRAG knowledge base.", "mock": False, "engine_active": True}
        except Exception as err:
            import traceback
            traceback.print_exc()
            print(f"[LightRAG Insert Error] {err}")
            raise HTTPException(status_code=500, detail=f"LightRAG Insert Error: {err}")

    return {
        "status": "success",
        "message": "Text received (Mock mode active).",
        "mock": True,
        "engine_active": False
    }

class DatabaseRequest(BaseModel):
    name: str


def _sanitize_db_name(name: str) -> str:
    """Erlaubt nur unkritische Zeichen und verhindert Pfad-Traversal."""
    return "".join(c for c in (name or "") if c.isalnum() or c in ("_", "-")).strip()


def _iter_database_dirs():
    """Liefert (id, pfad) fuer alle Datenbanken inkl. Altbestand, ohne Duplikate."""
    seen = set()
    for base in (DATABASES_DIR, LEGACY_DATABASES_DIR):
        if not base or not os.path.isdir(base):
            continue
        for entry in sorted(os.listdir(base)):
            full_path = os.path.join(base, entry)
            if not os.path.isdir(full_path):
                continue
            real = os.path.realpath(full_path)
            if real in seen:
                continue
            seen.add(real)
            yield entry, full_path


def _find_database_dir(name: str) -> Optional[str]:
    for base in (DATABASES_DIR, LEGACY_DATABASES_DIR):
        candidate = os.path.join(base, name)
        if os.path.isdir(candidate):
            return candidate
    return None


async def _activate_working_dir(target_dir: str) -> None:
    """Setzt die aktive Working Dir und initialisiert die LightRAG-Engine neu."""
    global WORKING_DIR, rag_instance
    WORKING_DIR = target_dir
    if not LIGHTRAG_AVAILABLE:
        return
    rag_instance = LightRAG(
        working_dir=WORKING_DIR,
        llm_model_func=custom_llm_model_func,
        embedding_func=embedding_func
    )
    await rag_instance.initialize_storages()


@app.get("/databases")
@app.get("/databases/")
def list_databases():
    active_real = os.path.realpath(WORKING_DIR)
    databases = [{
        "id": "default",
        "name": "Default (Hauptdatenbank)",
        "path": STORAGE_ROOT,
        "active": os.path.realpath(STORAGE_ROOT) == active_real
    }]

    for entry, full_path in _iter_database_dirs():
        databases.append({
            "id": entry,
            "name": entry.replace("_", " ").title(),
            "path": full_path,
            "active": os.path.realpath(full_path) == active_real
        })

    active_name = os.path.basename(WORKING_DIR.rstrip(os.sep)) or "default"
    return {"status": "success", "active_database": active_name, "databases": databases}


@app.post("/databases/create")
@app.post("/databases/create/")
async def create_database(req: DatabaseRequest):
    safe_name = _sanitize_db_name(req.name)
    if not safe_name:
        raise HTTPException(status_code=400, detail="Ungueltiger Datenbank-Name")

    target_dir = os.path.join(DATABASES_DIR, safe_name)
    os.makedirs(target_dir, exist_ok=True)
    try:
        await _activate_working_dir(target_dir)
    except Exception as e:
        print(f"[LightRAG] Re-init error on create: {e}")

    return {"status": "success", "message": f"Datenbank '{safe_name}' erstellt und aktiviert", "active_database": safe_name}


@app.post("/databases/select")
@app.post("/databases/select/")
async def select_database(req: DatabaseRequest):
    requested = (req.name or "").strip()
    if requested.lower() == "default":
        target_dir = STORAGE_ROOT
    else:
        safe_name = _sanitize_db_name(requested)
        if not safe_name:
            raise HTTPException(status_code=400, detail="Ungueltiger Datenbank-Name")
        found = _find_database_dir(safe_name)
        if not found:
            raise HTTPException(status_code=404, detail=f"Datenbank '{safe_name}' existiert nicht")
        target_dir = found

    try:
        await _activate_working_dir(target_dir)
    except Exception as e:
        print(f"[LightRAG] Re-init error on select: {e}")

    active_name = os.path.basename(target_dir.rstrip(os.sep)) or "default"
    return {"status": "success", "message": f"Datenbank '{requested or 'default'}' aktiviert", "active_database": active_name}


@app.delete("/databases/{db_name}")
@app.delete("/databases/{db_name}/")
def delete_database(db_name: str):
    import shutil
    requested = (db_name or "").strip()
    if requested.lower() == "default":
        raise HTTPException(status_code=400, detail="Die Hauptdatenbank kann nicht geloescht werden")

    safe_name = _sanitize_db_name(requested)
    if not safe_name:
        raise HTTPException(status_code=400, detail="Ungueltiger Datenbank-Name")

    target_dir = _find_database_dir(safe_name)
    if not target_dir:
        raise HTTPException(status_code=404, detail="Datenbank nicht gefunden")
    if os.path.realpath(target_dir) == os.path.realpath(WORKING_DIR):
        raise HTTPException(status_code=400, detail="Die aktuell aktive Datenbank kann nicht geloescht werden")

    shutil.rmtree(target_dir)
    return {"status": "success", "message": f"Datenbank '{safe_name}' geloescht"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


