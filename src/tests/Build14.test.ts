import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LightRAGService } from '../utils/LightRAGService';
import { GraphDataSchema } from '../types';

describe('Build 14: Belegte Beziehungen & Kantenexpansion', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('sollte 1 Sammelkante mit mehreren Keywords und <SEP>-getrennten Beschreibungen in n Kanten expandieren (exakte Paarung)', () => {
        const rawEdges = [
            {
                source: 'Hans',
                target: 'Siemens',
                keywords: ['leitet', 'vertritt', 'berät'],
                description: 'Hans leitet Siemens.<SEP>Hans vertritt Siemens vor Gericht.<SEP>Hans berät den Vorstand.',
                weight: 3.0,
                sources: ['chunk-101', 'chunk-102', 'chunk-103'],
                properties: {
                    file_path: 'organigramm.pdf',
                    source_id: 'chunk-101<SEP>chunk-102<SEP>chunk-103'
                }
            }
        ];

        const allowedLabels = ['leitet', 'berät', 'vertritt'];
        const expanded = LightRAGService.expandRelationshipsBuild14(rawEdges, allowedLabels);

        expect(expanded).toHaveLength(3);

        // Kante 1
        expect(expanded[0].source).toBe('Hans');
        expect(expanded[0].target).toBe('Siemens');
        expect(expanded[0].keyword_raw).toBe('leitet');
        expect(expanded[0].evidence).toBe('Hans leitet Siemens.');
        expect(expanded[0].evidence_all).toBe('Hans leitet Siemens.<SEP>Hans vertritt Siemens vor Gericht.<SEP>Hans berät den Vorstand.');
        expect(expanded[0].paarung).toBe('exakt');
        expect(expanded[0].weight).toBe(3.0);
        expect(expanded[0].belegzahl).toBe(3);
        expect(expanded[0].sources).toEqual(['chunk-101', 'chunk-102', 'chunk-103']);
        expect(expanded[0].typisiert).toBe(true);
        expect(expanded[0].herkunft).toBe('lightrag');

        // Kante 2
        expect(expanded[1].keyword_raw).toBe('vertritt');
        expect(expanded[1].evidence).toBe('Hans vertritt Siemens vor Gericht.');
        expect(expanded[1].paarung).toBe('exakt');
        expect(expanded[1].typisiert).toBe(true);

        // Kante 3
        expect(expanded[2].keyword_raw).toBe('berät');
        expect(expanded[2].evidence).toBe('Hans berät den Vorstand.');
        expect(expanded[2].paarung).toBe('exakt');
        expect(expanded[2].typisiert).toBe(true);
    });

    it('sollte bei ungleicher Anzahl von Beschreibungen und Keywords auf unsichere Paarung fallen, aber alle Daten behalten', () => {
        const rawEdges = [
            {
                source: 'Alice',
                target: 'Bob',
                keywords: 'arbeitet_mit, forscht_an',
                description: 'Alice und Bob arbeiten seit fuenf Jahren gemeinsam an Quantencomputern.',
                weight: 1.5,
                properties: {
                    source_id: 'chunk-42'
                }
            }
        ];

        const expanded = LightRAGService.expandRelationshipsBuild14(rawEdges, []);

        expect(expanded).toHaveLength(2);
        expect(expanded[0].keyword_raw).toBe('arbeitet_mit');
        expect(expanded[0].paarung).toBe('unsicher');
        expect(expanded[0].evidence).toBe('Alice und Bob arbeiten seit fuenf Jahren gemeinsam an Quantencomputern.');
        expect(expanded[0].weight).toBe(1.5);
        expect(expanded[0].belegzahl).toBe(1);

        expect(expanded[1].keyword_raw).toBe('forscht_an');
        expect(expanded[1].paarung).toBe('unsicher');
    });

    it('sollte via queryGraphBuild14 einen vollstaendigen, validen Schema 5.2 Graphen erzeugen', async () => {
        const mockBackendResponse = {
            status: 'success',
            query: 'Wie haengen Alice und Bob zusammen?',
            mode: 'hybrid',
            answer: 'Alice arbeitet mit Bob.',
            engine_active: true,
            mock: false,
            graph_context: {
                nodes: [
                    { id: 'Alice', label: 'Alice', properties: { entity_type: 'PERSON', description: 'Forscherin' } },
                    { id: 'Bob', label: 'Bob', properties: { entity_type: 'PERSON', description: 'Entwickler' } }
                ],
                edges: [
                    {
                        source: 'Alice',
                        target: 'Bob',
                        keywords: ['kollege', 'mentor'],
                        description: 'Alice ist Kollegin von Bob.<SEP>Alice unterstuetzt Bob als Mentorin.',
                        weight: 2.0,
                        sources: ['chunk-1', 'chunk-2'],
                        properties: {
                            source_id: 'chunk-1<SEP>chunk-2'
                        }
                    }
                ],
                meta: {
                    mode: 'subgraph',
                    seeds: ['Alice', 'Bob']
                }
            }
        };

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockBackendResponse
        } as any);

        const result = await LightRAGService.queryGraphBuild14('Wie haengen Alice und Bob zusammen?');

        expect(result.mock).toBe(false);
        expect(result.answer).toBe('Alice arbeitet mit Bob.');
        expect(result.meta).toEqual({ mode: 'subgraph', seeds: ['Alice', 'Bob'] });

        const graph = result.graphData;
        expect(graph.metadata.schemaVersion).toBe('5.2');
        expect(graph.data.entities).toHaveLength(2);
        expect(graph.data.relationships).toHaveLength(2);

        // Schema 5.2 Zod-Validierung
        const validation = GraphDataSchema.safeParse(graph);
        expect(validation.success).toBe(true);

        // DataModel und VisualMappings
        expect(graph.dataModel?.properties?.entity_type).toBeDefined();
        expect(graph.dataModel?.properties?.relation).toBeDefined();
        expect(graph.visualMappings?.defaultPresets?.global_node).toBeDefined();
        expect(graph.visualMappings?.defaultPresets?.global_edge).toBeDefined();
    });
});
