"""Tests fuer die FastAPI-Schnittstelle von lightrag-backend.

Zweck: Absicherung aller Endpunkte ohne laufenden Server und ohne Kosten fuer
externe LLM- oder Embedding-APIs. Die LightRAG-Engine wird in allen Faellen
gemockt.

Ausfuehrung im Container (piCon):

    cd /workspace/lightrag-backend
    ./venv/bin/python -m pytest tests -q
"""

import os
import sys
import importlib
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

# main.py liegt eine Ebene ueber tests/
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


@pytest.fixture(scope="module")
def main_module():
    """Importiert main.py einmalig. Der Import darf keine Netzaufrufe machen."""
    old_cwd = os.getcwd()
    os.chdir(BACKEND_DIR)
    try:
        module = importlib.import_module("main")
    finally:
        os.chdir(old_cwd)
    return module


@pytest.fixture()
def client(main_module):
    """TestClient mit deaktivierter LightRAG-Engine (Mock-/Fallbackpfad)."""
    original = main_module.LIGHTRAG_AVAILABLE
    main_module.LIGHTRAG_AVAILABLE = False
    try:
        with TestClient(main_module.app) as test_client:
            yield test_client
    finally:
        main_module.LIGHTRAG_AVAILABLE = original


# --------------------------------------------------------------------------
# Einheiten der DTO- und Hilfsfunktionen (Build 14)
# --------------------------------------------------------------------------

def test_split_field_list_behandelt_mehrere_trenner(main_module):
    split = main_module._split_field_list
    assert split('a<SEP>b') == ['a', 'b']
    assert split('x, y') == ['x', 'y']
    assert split(['m', ' n ']) == ['m', 'n']
    assert split(None) == []
    assert split('') == []


def test_parse_weight_ist_robust(main_module):
    parse = main_module._parse_weight
    assert parse(2.5) == 2.5
    assert parse('3') == 3.0
    assert parse('n/a') is None
    assert parse(None) is None


def test_build_edge_dto_strukturiert_attribute(main_module):
    dto = main_module._build_edge_dto(
        'Hans', 'Siemens',
        {
            'relation': 'Anstellung,arbeitet bei',
            'weight': '2.0',
            'keywords': 'Anstellung, arbeitet bei',
            'description': 'Hans arbeitet bei Siemens.',
            'source_id': 'chunk-1<SEP>chunk-2',
        },
    )
    assert dto['id'] == 'Hans->Siemens'
    assert dto['source'] == 'Hans'
    assert dto['target'] == 'Siemens'
    assert dto['weight'] == 2.0
    assert dto['keywords'] == ['Anstellung', 'arbeitet bei']
    assert dto['description'] == 'Hans arbeitet bei Siemens.'
    assert dto['sources'] == ['chunk-1', 'chunk-2']
    # Rohblock bleibt fuer Rueckwaertskompatibilitaet erhalten
    assert dto['properties']['relation'] == 'Anstellung,arbeitet bei'


def test_build_node_dto_strukturiert_attribute(main_module):
    dto = main_module._build_node_dto(
        'Hans',
        {
            'entity_name': 'Hans',
            'entity_type': 'person',
            'description': 'Vater von Anna.',
            'source_id': 'chunk-1<SEP>chunk-2',
        },
    )
    assert dto['id'] == 'Hans'
    assert dto['label'] == 'Hans'
    assert dto['entity_type'] == 'person'
    assert dto['sources'] == ['chunk-1', 'chunk-2']
    assert dto['properties']['entity_type'] == 'person'


# --------------------------------------------------------------------------
# Endpunkte ohne Engine (Mock-/Fallbackpfad)
# --------------------------------------------------------------------------

def test_health_endpoint(client):
    response = client.get('/health')
    assert response.status_code == 200
    data = response.json()
    assert data['service'] == 'LightRAG Local API'
    assert 'version' in data
    assert 'storage_root' in data
    assert 'embedding_model' in data


def test_root_entspricht_health(client):
    assert client.get('/').json()['status'] == 'online'


def test_query_leere_anfrage_wird_abgewiesen(client):
    response = client.post('/query', json={'query': '   '})
    assert response.status_code == 400


def test_query_fallback_liefert_mock_graph(client):
    response = client.post('/query', json={'query': 'Test', 'mode': 'hybrid'})
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'success'
    assert data['mock'] is True
    assert data['engine_active'] is False
    assert len(data['graph_context']['nodes']) >= 1
    assert len(data['graph_context']['edges']) >= 1


def test_insert_leerer_text_wird_abgewiesen(client):
    response = client.post('/insert', json={'text': ''})
    assert response.status_code == 400


def test_insert_fallback(client):
    response = client.post('/insert', json={'text': 'Ein Text.'})
    assert response.status_code == 200
    assert response.json()['mock'] is True


def test_databases_liste_und_default(client):
    data = client.get('/databases').json()
    assert data['status'] == 'success'
    assert data['databases'][0]['id'] == 'default'
    assert isinstance(data['active_database'], str)


def test_standardnamenssanierung(client, main_module):
    sanitize = main_module._sanitize_db_name
    assert sanitize('meine-db_1') == 'meine-db_1'
    assert sanitize('../../etc/passwd') == 'etcpasswd'
    assert sanitize(None) == ''


def test_unbekannte_datenbank_wird_nicht_ausgewaehlt(client):
    response = client.post('/databases/select', json={'name': 'gibtesnicht_xyz'})
    assert response.status_code == 404


def test_default_datenbank_kann_nicht_geloescht_werden(client):
    response = client.delete('/databases/default')
    assert response.status_code == 400


# --------------------------------------------------------------------------
# Query-Pfad mit gemockter LightRAG-Engine (Build 14 Subgraph + DTO)
# --------------------------------------------------------------------------

def _fake_knowledge_graph():
    node = MagicMock()
    node.id = '"Hans"'
    node.properties = {
        'entity_name': 'Hans',
        'entity_type': 'person',
        'description': 'Vater von Anna.',
        'source_id': 'chunk-1<SEP>chunk-2',
    }
    edge = MagicMock()
    edge.source = '"Hans"'
    edge.target = '"Siemens"'
    edge.properties = {
        'relation': 'Anstellung',
        'weight': '3',
        'keywords': 'Anstellung, arbeitet bei',
        'description': 'Hans arbeitet bei Siemens.',
        'source_id': 'chunk-1',
    }
    kg = MagicMock()
    kg.nodes = [node]
    kg.edges = [edge]
    kg.is_truncated = False
    return kg


@pytest.fixture()
def engine_client(main_module):
    """TestClient mit gemockter Engine: Seeds aus der Vector-DB, dann BFS-Subgraph."""
    kg = _fake_knowledge_graph()
    graph_store = MagicMock()
    graph_store.get_knowledge_graph = AsyncMock(return_value=kg)
    entities_vdb = MagicMock()
    entities_vdb.query = AsyncMock(return_value=[{'entity_name': 'Hans'}])

    fake_rag = MagicMock()
    fake_rag.aquery = AsyncMock(return_value='Hans arbeitet bei Siemens.')
    fake_rag.ainsert = AsyncMock(return_value=None)
    fake_rag.initialize_storages = AsyncMock(return_value=None)
    fake_rag.chunk_entity_relation_graph = graph_store
    fake_rag.entities_vdb = entities_vdb

    original_available = main_module.LIGHTRAG_AVAILABLE
    original_instance = main_module.rag_instance
    main_module.LIGHTRAG_AVAILABLE = True
    main_module.rag_instance = fake_rag
    try:
        with TestClient(main_module.app) as test_client:
            yield test_client
    finally:
        main_module.LIGHTRAG_AVAILABLE = original_available
        main_module.rag_instance = original_instance


def test_query_nutzt_subgraph_und_dto(engine_client, main_module):
    response = engine_client.post('/query', json={'query': 'Hans und Siemens', 'mode': 'hybrid'})
    assert response.status_code == 200
    data = response.json()
    assert data['mock'] is False
    assert data['engine_active'] is True

    meta = data['graph_context']['meta']
    assert meta['mode'] == 'subgraph'
    assert meta['seeds'] == ['Hans']
    assert meta['depth'] == main_module.SUBGRAPH_MAX_DEPTH
    assert meta['truncated'] is False

    node = data['graph_context']['nodes'][0]
    assert node['id'] == 'Hans'          # Anfuehrungszeichen entfernt
    assert node['entity_type'] == 'person'
    assert node['sources'] == ['chunk-1', 'chunk-2']

    edge = data['graph_context']['edges'][0]
    assert edge['source'] == 'Hans'
    assert edge['target'] == 'Siemens'
    assert edge['weight'] == 3.0
    assert edge['keywords'] == ['Anstellung', 'arbeitet bei']
    assert edge['description'] == 'Hans arbeitet bei Siemens.'


def test_insert_mit_engine(engine_client):
    response = engine_client.post('/insert', json={'text': 'Hans arbeitet bei Siemens.'})
    assert response.status_code == 200
    assert response.json()['mock'] is False
    assert response.json()['engine_active'] is True


def test_graph_exception_fuehrt_zu_leerem_graph(engine_client, main_module, monkeypatch):
    """Faellt die Graphextraktion aus, bricht die Query nicht ab."""
    async def failing_extract(_query):
        raise RuntimeError('Graph kaputt')

    monkeypatch.setattr(main_module, '_extract_query_graph', failing_extract)
    response = engine_client.post('/query', json={'query': 'Hans'})
    assert response.status_code == 200
    data = response.json()
    assert data['graph_context']['nodes'][0]['id'] == 'lightrag_res'


def test_fallback_auf_vollgraph_ohne_seeds(engine_client, main_module, monkeypatch):
    """Ohne Seeds aus der Vektordatenbank wird der Gesamtgraph-Pfad genutzt."""
    async def no_seeds(_query):
        return [], [], {'mode': 'unavailable'}

    monkeypatch.setattr(main_module, '_find_query_seed_nodes', no_seeds)
    engine_client.app  # Client steht, keine weitere Aktion noetig
    main_module.rag_instance.entities_vdb.query.return_value = []
    response = engine_client.post('/query', json={'query': 'Hans'})
    data = response.json()
    assert data['graph_context']['meta']['mode'] == 'subgraph'
    assert data['graph_context']['nodes'] != []


# --------------------------------------------------------------------------
# Datenbank-Endpunkte create / select / delete (isolierte tmp-Verzeichnisse)
# --------------------------------------------------------------------------

@pytest.fixture()
def db_client(main_module, tmp_path, monkeypatch):
    """TestClient mit isolierten Datenbankverzeichnissen in tmp_path.

    Die LightRAG-Engine wird deaktiviert und die Instanz geleert, damit
    _activate_working_dir nur den Pfad setzt und keinen echten Speicher baut.
    So bleibt der Test kostenlos und schreibt nicht in rag_storage.
    """
    databases_dir = tmp_path / "databases"
    databases_dir.mkdir()
    monkeypatch.setattr(main_module, "DATABASES_DIR", str(databases_dir))
    monkeypatch.setattr(main_module, "LEGACY_DATABASES_DIR", str(tmp_path / "legacy"))
    original_available = main_module.LIGHTRAG_AVAILABLE
    original_instance = main_module.rag_instance
    original_working = main_module.WORKING_DIR
    main_module.LIGHTRAG_AVAILABLE = False
    main_module.rag_instance = None
    try:
        with TestClient(main_module.app) as test_client:
            yield test_client
    finally:
        main_module.LIGHTRAG_AVAILABLE = original_available
        main_module.rag_instance = original_instance
        main_module.WORKING_DIR = original_working


def test_datenbank_erstellen_legt_verzeichnis_an(db_client, main_module):
    response = db_client.post('/databases/create', json={'name': 'Test DB 1'})
    assert response.status_code == 200
    assert response.json()['active_database'] == 'TestDB1'
    assert os.path.isdir(os.path.join(main_module.DATABASES_DIR, 'TestDB1'))


def test_datenbank_erstellen_ohne_gueltigen_namen(db_client):
    assert db_client.post('/databases/create', json={'name': '!!!'}).status_code == 400


def test_datenbankname_gegen_pfadtraversal_entschaerft(db_client, main_module):
    response = db_client.post('/databases/create', json={'name': '../../boese'})
    assert response.status_code == 200
    assert response.json()['active_database'] == 'boese'
    assert os.path.isdir(os.path.join(main_module.DATABASES_DIR, 'boese'))


def test_datenbank_auswaehlen_aktiviert_sie(db_client):
    db_client.post('/databases/create', json={'name': 'projekt_a'})
    response = db_client.post('/databases/select', json={'name': 'projekt_a'})
    assert response.status_code == 200
    assert response.json()['active_database'] == 'projekt_a'
    listing = db_client.get('/databases').json()
    aktiv = [d for d in listing['databases'] if d['active']]
    assert len(aktiv) == 1
    assert aktiv[0]['id'] == 'projekt_a'


def test_default_auswaehlen_aktiviert_hauptdatenbank(db_client):
    db_client.post('/databases/create', json={'name': 'x_db'})
    assert db_client.post('/databases/select', json={'name': 'default'}).status_code == 200
    listing = db_client.get('/databases').json()
    default = next(d for d in listing['databases'] if d['id'] == 'default')
    assert default['active'] is True


def test_datenbank_auswaehlen_ungueltiger_name(db_client):
    assert db_client.post('/databases/select', json={'name': '???'}).status_code == 400


def test_datenbank_loeschen_entfernt_verzeichnis(db_client, main_module):
    db_client.post('/databases/create', json={'name': 'temp_db'})
    db_client.post('/databases/select', json={'name': 'default'})
    ziel = os.path.join(main_module.DATABASES_DIR, 'temp_db')
    assert os.path.isdir(ziel)
    response = db_client.delete('/databases/temp_db')
    assert response.status_code == 200
    assert not os.path.exists(ziel)


def test_aktive_datenbank_kann_nicht_geloescht_werden(db_client):
    db_client.post('/databases/create', json={'name': 'aktiv_db'})
    assert db_client.delete('/databases/aktiv_db').status_code == 400


def test_unbekannte_datenbank_loeschen_404(db_client):
    assert db_client.delete('/databases/gibtesnicht').status_code == 404
