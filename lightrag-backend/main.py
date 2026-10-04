import os
import json
import asyncio
import hashlib
from contextlib import asynccontextmanager
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

# Standard-Embedding fuer deutschsprachige Ontologie-Extraktion:
# Qwen3-Embedding-8B (Platz 1 MTEB multilingual, deutschsprachige Unterstuetzung).
# 4096 = native Dimension. Per EMBEDDING_DIM kuerzbar (Matryoshka), dann muss
# der Wert aber auch als "dimensions" an die API gehen (siehe custom_openai_embed).
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "qwen/qwen3-embedding-8b")
EMBEDDING_BASE_URL = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
_embedding_dim_env = (os.getenv("EMBEDDING_DIM") or "").strip()
try:
    EMBEDDING_DIM = int(_embedding_dim_env) if _embedding_dim_env else 4096
except ValueError:
    EMBEDDING_DIM = 4096

# Ausgabesprache der Ontologie-Extraktion (Knotennamen, Beziehungen,
# Beschreibungen). LightRAG standardmaessig "English"; hier deutschsprachig.
SUMMARY_LANGUAGE = os.getenv("SUMMARY_LANGUAGE", "German")

# LightRAG-Instanz und Verfuegbarkeit. Bewusst vor der App-Definition angelegt,
# damit der Lifespan-Handler sie beim Start kennt.
LIGHTRAG_AVAILABLE = False
rag_instance = None


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Startup/Shutdown ueber den Lifespan-Handler statt des veralteten
    @app.on_event("startup") (behebt die DeprecationWarning)."""
    if rag_instance is not None:
        try:
            await rag_instance.initialize_storages()
            print("[LightRAG Backend] Storages initialized successfully.")
        except Exception as e:
            print(f"[LightRAG Backend] Storage init error: {e}")
    yield


app = FastAPI(title="LightRAG Local API for Nodges", version=APP_VERSION, lifespan=lifespan)

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

class DocumentItem(BaseModel):
    text: str
    doc_id: Optional[str] = None
    file_path: Optional[str] = None
    process_options: Optional[str] = "P"

class DocumentsRequest(BaseModel):
    documents: Optional[List[DocumentItem]] = None
    text: Optional[str] = None
    doc_id: Optional[str] = None
    file_path: Optional[str] = None
    process_options: Optional[str] = "P"
    background: Optional[bool] = False

# LightRAG Instanziierung (optional mit Fallback)
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
        model = kwargs.pop("model", None) or os.getenv("LLM_MODEL", "deepseek/deepseek-v4.1-flash")
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
        # Qwen3-Embedding ist Matryoshka-faehig: Wird EMBEDDING_DIM explizit
        # gesetzt, fordern wir diese verkuerzte Dimension direkt an. Ohne die
        # Variable nutzen wir die native Dimension des Modells.
        embed_kwargs: Dict[str, Any] = {"model": EMBEDDING_MODEL, "input": texts}
        if _embedding_dim_env:
            embed_kwargs["dimensions"] = EMBEDDING_DIM
        response = await client.embeddings.create(**embed_kwargs)
        embeddings = [item.embedding for item in response.data]
        return np.array(embeddings)

    print(
        f"[LightRAG] storage={WORKING_DIR} embedding={EMBEDDING_MODEL} "
        f"dim={EMBEDDING_DIM} base={EMBEDDING_BASE_URL} language={SUMMARY_LANGUAGE}"
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
        embedding_func=embedding_func,
        addon_params={"language": SUMMARY_LANGUAGE}
    )
    LIGHTRAG_AVAILABLE = True
except Exception as e:
    print(f"[LightRAG Backend Warning] LightRAG engine not fully initialized (using fallback/mock mode): {e}")

# Begrenzung des extrahierten Wissensgraphen (Fix 3)
MAX_GRAPH_NODES = int(os.getenv("LIGHTRAG_MAX_GRAPH_NODES", "150"))
MAX_GRAPH_EDGES = int(os.getenv("LIGHTRAG_MAX_GRAPH_EDGES", "300"))

# Build 14: Gezielte Subgraph-Extraktion. Statt den Gesamtgraphen ("*") zu
# laden und hart abzuschneiden, werden die semantisch treffendsten
# Startknoten per Vektorsuche bestimmt und von dort eine BFS-Nachbarschaft
# (K-Hop) aus dem nativen LightRAG-Graphstorage geholt.
QUERY_SEED_TOP_K = int(os.getenv("LIGHTRAG_QUERY_SEEDS", "5"))
SUBGRAPH_MAX_DEPTH = int(os.getenv("LIGHTRAG_SUBGRAPH_DEPTH", "2"))

# Feldtrenner, mit dem LightRAG mehrere Quell-Chunk-IDs in source_id buendelt.
LIGHTRAG_GRAPH_FIELD_SEP = "<SEP>"


def _split_field_list(value: Any, separators=(LIGHTRAG_GRAPH_FIELD_SEP, ",")) -> List[str]:
    """Normalisiert LightRAG-Listenfelder (source_id, keywords) zu einer Liste."""
    if value is None:
        return []
    if isinstance(value, (list, tuple)):
        return [str(v).strip() for v in value if str(v).strip()]
    text = str(value)
    for sep in separators:
        text = text.replace(sep, "\n")
    return [part.strip() for part in text.split("\n") if part.strip()]


def _parse_weight(value: Any) -> Optional[float]:
    """Wandelt das LightRAG-Kantengewicht robust in eine Zahl um."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _build_node_dto(node_id: str, props: Dict[str, Any]) -> Dict[str, Any]:
    """Standardisiertes Knoten-DTO (Build 14). properties bleibt als Rohblock
    erhalten, damit das Frontend rueckwaertskompatibel bleibt."""
    label = props.get("entity_name") or props.get("label") or node_id
    return {
        "id": node_id,
        "label": str(label),
        "entity_type": props.get("entity_type") or None,
        "description": props.get("description") or None,
        "sources": _split_field_list(props.get("source_id")),
        "properties": props,
    }


def _build_edge_dto(source: str, target: str, props: Dict[str, Any]) -> Dict[str, Any]:
    """Standardisiertes Kanten-DTO (Build 14): weight als Zahl, keywords und
    sources als Arrays, description explizit. properties bleibt als Rohblock."""
    relation = (
        props.get("relation") or props.get("relation_type") or props.get("predicate")
        or props.get("label") or props.get("keywords") or props.get("description")
        or "verknuepft"
    )
    return {
        "id": f"{source}->{target}",
        "source": source,
        "target": target,
        "relation": str(relation),
        "weight": _parse_weight(props.get("weight")),
        "keywords": _split_field_list(props.get("keywords")),
        "description": props.get("description") or None,
        "sources": _split_field_list(props.get("source_id")),
        "properties": props,
    }


async def _find_query_seed_nodes(query_text: str) -> List[str]:
    """Findet die semantisch treffendsten Entitaeten zur Query ueber die
    Vektordatenbank (entities_vdb) und liefert deren Knotennamen."""
    try:
        results = await rag_instance.entities_vdb.query(query_text, top_k=QUERY_SEED_TOP_K)
    except Exception as seed_err:
        print(f"[LightRAG Warning] Seed-Suche fehlgeschlagen: {seed_err}")
        return []
    seeds: List[str] = []
    for hit in results or []:
        name = hit.get("entity_name") or hit.get("id")
        if name:
            name = str(name).strip('"')
            if name and name not in seeds:
                seeds.append(name)
    return seeds


async def _extract_query_graph(query_text: str) -> tuple:
    """Baut den Query-Teilgraphen: Seeds per Vektorsuche, dann native BFS-
    Subgraphen (K-Hop) je Seed, zusammengefuehrt und dedupliziert.
    Faellt auf den Gesamtgraphen ("*") zurueck, wenn keine Seeds gefunden
    werden. Rueckgabe: (nodes, edges, meta)."""
    graph_store = getattr(rag_instance, "chunk_entity_relation_graph", None)
    if not graph_store:
        return [], [], {"mode": "unavailable"}

    nodes_by_id: Dict[str, Dict[str, Any]] = {}
    edges_by_id: Dict[str, Dict[str, Any]] = {}
    truncated = False

    def _merge(kg_data) -> None:
        nonlocal truncated
        if getattr(kg_data, "is_truncated", False):
            truncated = True
        for node in kg_data.nodes:
            n_id = str(node.id).strip('"')
            if n_id in nodes_by_id:
                continue
            props = dict(node.properties) if node.properties else {}
            nodes_by_id[n_id] = _build_node_dto(n_id, props)
        for edge in kg_data.edges:
            e_src = str(edge.source).strip('"')
            e_tgt = str(edge.target).strip('"')
            e_id = f"{e_src}->{e_tgt}"
            if e_id in edges_by_id:
                continue
            e_props = dict(edge.properties) if edge.properties else {}
            edges_by_id[e_id] = _build_edge_dto(e_src, e_tgt, e_props)

    seeds = await _find_query_seed_nodes(query_text)
    mode = "subgraph"
    if seeds:
        for seed in seeds:
            try:
                kg_data = await graph_store.get_knowledge_graph(
                    seed, max_depth=SUBGRAPH_MAX_DEPTH, max_nodes=MAX_GRAPH_NODES
                )
                _merge(kg_data)
            except Exception as sub_err:
                print(f"[LightRAG Warning] Subgraph fuer Seed '{seed}' fehlgeschlagen: {sub_err}")
    if not nodes_by_id:
        # Fallback: bisheriges Verhalten (Gesamtgraph, nach Grad begrenzt)
        mode = "full_graph_fallback"
        kg_data = await graph_store.get_knowledge_graph("*", max_depth=SUBGRAPH_MAX_DEPTH, max_nodes=MAX_GRAPH_NODES)
        _merge(kg_data)

    meta = {"mode": mode, "seeds": seeds, "depth": SUBGRAPH_MAX_DEPTH, "truncated": truncated}
    return list(nodes_by_id.values()), list(edges_by_id.values()), meta

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
        "embedding_key_set": bool(os.getenv("OPENAI_API_KEY")),
        "summary_language": SUMMARY_LANGUAGE
    }

@app.post("/query")
async def process_query(request: QueryRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query text must not be empty")
    
    if LIGHTRAG_AVAILABLE and rag_instance is not None:
        try:
            from lightrag import QueryParam
            res = await rag_instance.aquery(request.query, param=QueryParam(mode=request.mode))
            # Wissensgraph als gezielten Query-Teilgraphen abrufen (Build 14)
            kg_nodes = []
            kg_edges = []
            graph_meta: Dict[str, Any] = {}
            
            try:
                kg_nodes, kg_edges, graph_meta = await _extract_query_graph(request.query)
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
                    "edges": kg_edges,
                    "meta": graph_meta
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

def _serialize_doc_status(item: Any) -> Dict[str, Any]:
    """Wandelt ein DocProcessingStatus-Objekt oder Dict in ein JSON-kompatibles Dict um."""
    if item is None:
        return {}
    if isinstance(item, dict):
        status_val = item.get("status")
        if hasattr(status_val, "value"):
            status_val = status_val.value
        res = dict(item)
        res["status"] = str(status_val) if status_val is not None else None
        return res
    status_val = getattr(item, "status", None)
    if hasattr(status_val, "value"):
        status_val = status_val.value
    return {
        "status": str(status_val) if status_val is not None else None,
        "content_summary": getattr(item, "content_summary", None),
        "file_path": getattr(item, "file_path", None),
        "created_at": getattr(item, "created_at", None),
        "updated_at": getattr(item, "updated_at", None),
        "track_id": getattr(item, "track_id", None),
        "chunks_count": getattr(item, "chunks_count", None),
        "error_msg": getattr(item, "error_msg", None),
        "content_hash": getattr(item, "content_hash", None),
    }


_DEFAULT_MAX_INGEST_TEXT_BYTES = 50 * 1024 * 1024
try:
    MAX_INGEST_TEXT_BYTES = int(
        os.getenv("LIGHTRAG_MAX_INGEST_TEXT_BYTES", str(_DEFAULT_MAX_INGEST_TEXT_BYTES))
    )
    if MAX_INGEST_TEXT_BYTES <= 0:
        raise ValueError("must be positive")
except ValueError:
    MAX_INGEST_TEXT_BYTES = _DEFAULT_MAX_INGEST_TEXT_BYTES
    print(
        "[LightRAG Warning] Ungueltiger LIGHTRAG_MAX_INGEST_TEXT_BYTES-Wert; "
        f"verwende {_DEFAULT_MAX_INGEST_TEXT_BYTES} Bytes."
    )


def _prepare_documents(request: DocumentsRequest) -> List[Dict[str, Any]]:
    """Extrahiert, normalisiert und begrenzt Text aus Dokumentenrequests.

    PDF-Dateien werden im Frontend in Text umgewandelt; das Backend erhaelt
    daher keinen PDF-Upload, sondern ausschliesslich extrahierten Text.
    Die Byte-Grenze schuetzt sowohl Einzel- als auch Batch-Ingestion.
    """
    docs: List[Dict[str, Any]] = []
    if request.documents:
        for item in request.documents:
            t = (item.text or "").strip()
            if not t:
                continue
            d_id = item.doc_id.strip() if item.doc_id and item.doc_id.strip() else hashlib.md5(t.encode("utf-8")).hexdigest()
            f_path = item.file_path.strip() if item.file_path and item.file_path.strip() else f"doc_{d_id[:8]}.txt"
            p_opt = item.process_options.strip() if item.process_options and item.process_options.strip() else "P"
            docs.append({
                "text": t,
                "doc_id": d_id,
                "file_path": f_path,
                "process_options": p_opt
            })
    elif request.text and request.text.strip():
        t = request.text.strip()
        d_id = request.doc_id.strip() if request.doc_id and request.doc_id.strip() else hashlib.md5(t.encode("utf-8")).hexdigest()
        f_path = request.file_path.strip() if request.file_path and request.file_path.strip() else f"doc_{d_id[:8]}.txt"
        p_opt = request.process_options.strip() if request.process_options and request.process_options.strip() else "P"
        docs.append({
            "text": t,
            "doc_id": d_id,
            "file_path": f_path,
            "process_options": p_opt
        })

    total_bytes = 0
    for doc in docs:
        text_bytes = len(doc["text"].encode("utf-8"))
        if text_bytes > MAX_INGEST_TEXT_BYTES:
            raise HTTPException(
                status_code=413,
                detail=(
                    f"Dokument '{doc['file_path']}' ist mit {text_bytes} Bytes zu gross. "
                    f"Maximal erlaubt sind {MAX_INGEST_TEXT_BYTES} Bytes pro Request."
                ),
            )
        total_bytes += text_bytes
        if total_bytes > MAX_INGEST_TEXT_BYTES:
            raise HTTPException(
                status_code=413,
                detail=(
                    f"Die gesamte Dokumentenmenge ist mit {total_bytes} Bytes zu gross. "
                    f"Maximal erlaubt sind {MAX_INGEST_TEXT_BYTES} Bytes pro Request."
                ),
            )
    return docs


async def _execute_document_ingestion(docs: List[Dict[str, Any]], background: bool = False) -> Dict[str, Any]:
    """Nimmt Dokumente ueber die semantische LightRAG-Pipeline auf (Build 14 Stufe A)."""
    if LIGHTRAG_AVAILABLE and rag_instance is not None:
        try:
            texts = [d["text"] for d in docs]
            ids = [d["doc_id"] for d in docs]
            file_paths = [d["file_path"] for d in docs]
            process_options = [d["process_options"] for d in docs]

            # Enqueue ueber die semantische Pipeline
            track_id = await rag_instance.apipeline_enqueue_documents(
                input=texts,
                ids=ids,
                file_paths=file_paths,
                process_options=process_options
            )

            if background:
                asyncio.create_task(rag_instance.apipeline_process_enqueue_documents())
                return {
                    "status": "enqueued",
                    "track_id": track_id,
                    "document_count": len(docs),
                    "doc_ids": ids,
                    "message": "Dokumente in Pipeline eingereiht; Verarbeitung laeuft im Hintergrund.",
                    "mock": False,
                    "engine_active": True
                }
            else:
                await rag_instance.apipeline_process_enqueue_documents()
                doc_statuses = {}
                if hasattr(rag_instance, "aget_docs_by_track_id"):
                    raw = await rag_instance.aget_docs_by_track_id(track_id)
                    if raw:
                        for k, v in raw.items():
                            doc_statuses[k] = _serialize_doc_status(v)
                return {
                    "status": "success",
                    "track_id": track_id,
                    "document_count": len(docs),
                    "doc_ids": ids,
                    "doc_statuses": doc_statuses,
                    "message": "Dokumente erfolgreich ueber die semantische Pipeline aufgenommen.",
                    "mock": False,
                    "engine_active": True
                }
        except Exception as err:
            import traceback
            traceback.print_exc()
            print(f"[LightRAG Ingestion Error] {err}")
            raise HTTPException(status_code=500, detail=f"LightRAG Ingestion Error: {err}")

    # Fallback / Mock Modus
    mock_ids = [d["doc_id"] for d in docs]
    return {
        "status": "success",
        "track_id": f"mock_track_{mock_ids[0][:8]}",
        "document_count": len(docs),
        "doc_ids": mock_ids,
        "message": "Dokumente verarbeitet (Mock-Modus aktiv).",
        "mock": True,
        "engine_active": False
    }


@app.post("/documents")
@app.post("/documents/")
async def ingest_documents(request: DocumentsRequest):
    docs = _prepare_documents(request)
    if not docs:
        raise HTTPException(status_code=400, detail="Mindestens ein Dokument mit nicht-leerem Text erforderlich")
    return await _execute_document_ingestion(docs, background=bool(request.background))


@app.get("/documents/status")
@app.get("/documents/status/")
async def get_documents_status(track_id: Optional[str] = None, doc_id: Optional[str] = None):
    if not LIGHTRAG_AVAILABLE or rag_instance is None:
        return {
            "status": "success",
            "processing_status": {"pending": 0, "processing": 0, "processed": 0, "failed": 0},
            "documents": {},
            "engine_active": False,
            "mock": True
        }

    try:
        proc_status = {}
        if hasattr(rag_instance, "get_processing_status"):
            proc_status = await rag_instance.get_processing_status()

        docs: Dict[str, Any] = {}

        if doc_id:
            if hasattr(rag_instance, "aget_docs_by_ids"):
                raw = await rag_instance.aget_docs_by_ids([doc_id])
                if raw:
                    for k, v in raw.items():
                        docs[k] = _serialize_doc_status(v)
        elif track_id:
            if hasattr(rag_instance, "aget_docs_by_track_id"):
                raw = await rag_instance.aget_docs_by_track_id(track_id)
                if raw:
                    for k, v in raw.items():
                        docs[k] = _serialize_doc_status(v)
        else:
            try:
                from lightrag.base import DocStatus
                for st in DocStatus:
                    if hasattr(rag_instance, "get_docs_by_status"):
                        status_docs = await rag_instance.get_docs_by_status(st)
                        if status_docs:
                            for k, v in status_docs.items():
                                docs[k] = _serialize_doc_status(v)
            except Exception as st_err:
                print(f"[LightRAG Warning] Error listing doc statuses: {st_err}")

        return {
            "status": "success",
            "processing_status": proc_status,
            "documents": docs,
            "engine_active": True,
            "mock": False
        }
    except Exception as e:
        print(f"[LightRAG Error] get_documents_status failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve document status: {e}")


@app.get("/documents/list")
@app.get("/documents/list/")
async def list_documents():
    return await get_documents_status()


@app.delete("/documents/{doc_id}")
@app.delete("/documents/{doc_id}/")
async def delete_document(doc_id: str):
    if not LIGHTRAG_AVAILABLE or rag_instance is None:
        return {"status": "success", "message": f"Dokument '{doc_id}' geloescht (Mock)", "mock": True, "engine_active": False}
    try:
        if hasattr(rag_instance, "adelete_by_doc_id"):
            res = await rag_instance.adelete_by_doc_id(doc_id)
            return {"status": "success", "doc_id": doc_id, "result": str(res), "mock": False, "engine_active": True}
        else:
            raise HTTPException(status_code=501, detail="Dokumentenloeschung in dieser LightRAG-Version nicht verfuegbar")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Loeschen von Dokument '{doc_id}': {e}")


@app.post("/insert")
async def process_insert(request: InsertRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Insert text must not be empty")

    docs = _prepare_documents(DocumentsRequest(text=request.text, process_options="P"))
    return await _execute_document_ingestion(docs, background=False)

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
        embedding_func=embedding_func,
        addon_params={"language": SUMMARY_LANGUAGE}
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


