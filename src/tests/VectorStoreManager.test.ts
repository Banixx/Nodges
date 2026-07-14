// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cosineSimilarity, deduplicateGraph } from '../utils/VectorStoreManager';
import { LLMService } from '../utils/LLMService';
import { GraphData } from '../types';

describe('VectorStoreManager & Similarity Tests', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        const store: Record<string, string> = {
            'llm_key_openrouter': 'test-key'
        };
        vi.stubGlobal('localStorage', {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, value: string) => { store[key] = value; },
            removeItem: (key: string) => { delete store[key]; }
        });
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.unstubAllGlobals();
    });

    it('sollte cosineSimilarity korrekt berechnen', () => {
        const vecA = [1, 0, 0];
        const vecB = [1, 0, 0];
        const vecC = [0, 1, 0];
        const vecD = [-1, 0, 0];

        expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);
        expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0);
        expect(cosineSimilarity(vecA, vecD)).toBeCloseTo(-1.0);
    });

    it('sollte deduplicateGraph aehnliche Knoten zusammenfuehren und Kanten umleiten', async () => {
        // Mock LLMService.generateEmbedding
        vi.spyOn(LLMService, 'generateEmbedding').mockImplementation(async (text: string) => {
            if (text === 'Apfel' || text === 'Apple') {
                return [1, 0, 0];
            }
            if (text === 'Banane') {
                return [0, 1, 0];
            }
            return [0, 0, 1];
        });

        const testGraph: GraphData = {
            system: 'Test',
            metadata: {},
            data: {
                entities: [
                    { id: 'n1', label: 'Apfel', properties: { desc: 'Eine rote Frucht' } },
                    { id: 'n2', label: 'Apple', properties: { desc: 'An apple fruit' } },
                    { id: 'n3', label: 'Banane', properties: { desc: 'Eine gelbe Frucht' } }
                ],
                relationships: [
                    { id: 'r1', source: 'n1', target: 'n3', type: 'likes' },
                    { id: 'r2', source: 'n2', target: 'n3', type: 'likes' }
                ]
            }
        };

        const result = await deduplicateGraph(testGraph, 'openrouter', 'google/gemini-embedding-2', 0.85);

        // n1 und n2 sollten zusammengeführt worden sein (Ähnlichkeit 1.0)
        expect(result.data.entities.length).toBe(2);
        
        // Die verbleibenden Entitäten sollten n1 und n3 sein (oder n2 und n3)
        const remainingIds = result.data.entities.map(e => e.id);
        expect(remainingIds).toContain('n3');
        
        // Die Eigenschaften sollten zusammengeführt worden sein
        const repNode = result.data.entities.find(e => e.id === 'n1' || e.id === 'n2');
        expect(repNode).toBeDefined();
        const desc = (repNode?.properties as any)?.desc;
        expect(desc).toContain('Eine rote Frucht');
        expect(desc).toContain('An apple fruit');

        // Die Beziehungen sollten umgeleitet worden sein und Duplikate entfernt
        expect(result.data.relationships.length).toBe(1);
        expect(result.data.relationships[0].type).toBe('likes');
    });
});
