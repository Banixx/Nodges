// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { LightRAGService } from '../utils/LightRAGService';

describe('LightRAGService (Build 12)', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        delete (window as any).app;
        vi.unstubAllGlobals();
    });

    it('sollte checkHealth erfolgreich verarbeiten, wenn das Backend erreichbar ist', async () => {
        global.fetch = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ status: 'online', lightrag_engine_active: true }), { status: 200 })
        );

        const health = await LightRAGService.checkHealth('http://localhost:8000');
        expect(health.online).toBe(true);
        expect(health.engineActive).toBe(true);
    });

    it('sollte queryGraph korrekt in GraphData transformieren', async () => {
        global.fetch = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({
                status: 'success',
                query: 'Test query',
                mode: 'hybrid',
                answer: 'Wissensgraph-Antwort',
                graph_context: {
                    nodes: [
                        { id: 'node_a', label: 'Knoten A', properties: { category: 'Test' } },
                        { id: 'node_b', label: 'Knoten B', properties: { category: 'Demo' } }
                    ],
                    edges: [
                        { source: 'node_a', target: 'node_b', relation: 'verbunden' }
                    ]
                }
            }), { status: 200 })
        );

        const result = await LightRAGService.queryGraph('Test query', 'hybrid', 'http://localhost:8000');
        expect(result.answer).toBe('Wissensgraph-Antwort');
        expect(result.graphData.data.entities.length).toBe(2);
        expect(result.graphData.data.entities[0].id).toBe('node_a');
        expect(result.graphData.data.relationships.length).toBe(1);
        expect(result.graphData.data.relationships[0].source).toBe('node_a');
        expect(result.graphData.data.relationships[0].target).toBe('node_b');
    });

    it('sollte fuer Build 13 rohe Relationen ohne Preset-Normalisierung liefern', async () => {
        (window as any).app = {
            uiManager: {
                createPanel: {
                    getActiveRelationLabels: () => ['unterstützt']
                }
            }
        };
        global.fetch = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({
                status: 'success',
                answer: 'Quellenantwort',
                graph_context: {
                    nodes: [{ id: 'a' }, { id: 'b' }],
                    edges: [{ source: 'a', target: 'b', relation: 'supports' }]
                }
            }), { status: 200 })
        );

        const result = await LightRAGService.queryGraph('Relation Discovery', 'hybrid', 'http://localhost:8000', false);
        expect(result.graphData.data.relationships[0].relation).toBe('supports');
        delete (window as any).app;
    });

    it('sollte insertText erfolgreich verarbeiten', async () => {
        global.fetch = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ status: 'success', message: 'Text inserted' }), { status: 200 })
        );

        const res = await LightRAGService.insertText('Ein Testdokument', 'http://localhost:8000');
        expect(res.success).toBe(true);
        expect(res.message).toBe('Text inserted');
    });
});
