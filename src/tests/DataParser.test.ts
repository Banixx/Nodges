import { describe, it, expect } from 'vitest';
import { DataParser } from '../core/DataParser';
import type { GraphData } from '../types';
import { getAvailableProperties } from '../core/BuildFormatUtils';

describe('DataParser', () => {
    describe('parse()', () => {
        it('sollte valide GraphData mit Entities und Relationships parsen', () => {
            const validData: GraphData = {
                system: 'Nodges',
                metadata: {
                    created: '2026-02-11',
                    version: '1.0',
                    schemaVersion: '3.0',
                },
                data: {
                    entities: [
                        { id: '1', type: 'person', label: 'Alice' },
                        { id: '2', type: 'person', label: 'Bob' },
                    ],
                    relationships: [
                        { type: 'knows', source: '1', target: '2' },
                    ],
                },
            };

            const result = DataParser.parse(validData);

            expect(result).toBeDefined();
            expect(result.data.entities).toHaveLength(2);
            expect(result.data.relationships).toHaveLength(1);
        });

        it('sollte einen Fehler werfen bei fehlenden data.entities', () => {
            const invalidData = {
                system: 'Nodges',
                metadata: {
                    schemaVersion: '3.0'
                },
                data: {
                    relationships: [],
                },
            };

            expect(() => DataParser.parse(invalidData as any)).toThrow();
        });

        it('sollte einen Fehler werfen bei komplett leerem Input', () => {
            expect(() => DataParser.parse({} as any)).toThrow();
        });

        it('sollte flache temporale Eigenschaften (wie startYear/endYear) in ein standardisiertes temporal-Objekt synthetisieren', () => {
            const rawData = {
                system: 'TestSystem',
                metadata: {
                    schemaVersion: '5.0'
                },
                data: {
                    entities: [
                        { id: '1', type: 'person', label: 'Alice', startYear: 1950, endYear: 2020 },
                        { id: '2', type: 'person', label: 'Bob' }
                    ],
                    relationships: [
                        { id: 'r1', type: 'knows', source: '1', target: '2', startYear: 1980 }
                    ]
                }
            };

            const result = DataParser.parse(rawData);

            expect(result.data.entities[0].temporal).toBeDefined();
            expect(result.data.entities[0].temporal?.validFrom).toBe(1950);
            expect(result.data.entities[0].temporal?.validTo).toBe(2020);

            expect(result.data.entities[1].temporal).toBeUndefined();

            expect(result.data.relationships[0].temporal).toBeDefined();
            expect(result.data.relationships[0].temporal?.validFrom).toBe(1980);
            expect(result.data.relationships[0].temporal?.validTo).toBeNull();
        });
    });

    describe('getEntities()', () => {
        const sampleData: GraphData = {
            system: 'Nodges',
            metadata: {
                schemaVersion: '3.0'
            },
            data: {
                entities: [
                    { id: '1', type: 'person', label: 'Alice' },
                    { id: '2', type: 'organization', label: 'Company' },
                    { id: '3', type: 'person', label: 'Bob' },
                ],
                relationships: [],
            },
        };

        it('sollte alle Entities zurueckgeben ohne Filter', () => {
            const entities = DataParser.getEntities(sampleData);
            expect(entities).toHaveLength(3);
        });

        it('sollte nur Entities eines bestimmten Types zurueckgeben', () => {
            const persons = DataParser.getEntities(sampleData, 'person');
            expect(persons).toHaveLength(2);
            expect(persons.every(e => e.type === 'person')).toBe(true);
        });

        it('sollte leeres Array zurueckgeben fuer nicht-existenten Type', () => {
            const unknown = DataParser.getEntities(sampleData, 'unknown');
            expect(unknown).toHaveLength(0);
        });
    });

    describe('getRelationships()', () => {
        const sampleData: GraphData = {
            system: 'Nodges',
            metadata: {
                schemaVersion: '3.0'
            },
            data: {
                entities: [],
                relationships: [
                    { type: 'knows', source: '1', target: '2' },
                    { type: 'works_at', source: '1', target: '3' },
                    { type: 'knows', source: '2', target: '3' },
                ],
            },
        };

        it('sollte alle Relationships zurueckgeben ohne Filter', () => {
            const rels = DataParser.getRelationships(sampleData);
            expect(rels).toHaveLength(3);
        });

        it('sollte nur Relationships eines bestimmten Types zurueckgeben', () => {
            const knows = DataParser.getRelationships(sampleData, 'knows');
            expect(knows).toHaveLength(2);
            expect(knows.every(r => r.type === 'knows')).toBe(true);
        });
    });

    describe('findEntity()', () => {
        const sampleData: GraphData = {
            system: 'Nodges',
            metadata: {
                schemaVersion: '3.0'
            },
            data: {
                entities: [
                    { id: 'alice', type: 'person', label: 'Alice' },
                    { id: 'bob', type: 'person', label: 'Bob' },
                ],
                relationships: [],
            },
        };

        it('sollte Entity mit gegebener ID finden', () => {
            const alice = DataParser.findEntity(sampleData, 'alice');
            expect(alice).toBeDefined();
            expect(alice?.label).toBe('Alice');
        });

        it('sollte undefined zurueckgeben fuer nicht-existente ID', () => {
            const unknown = DataParser.findEntity(sampleData, 'unknown');
            expect(unknown).toBeUndefined();
        });
    });

    describe('findRelationshipsForEntity()', () => {
        const sampleData: GraphData = {
            system: 'Nodges',
            metadata: {
                schemaVersion: '3.0'
            },
            data: {
                entities: [
                    { id: '1', type: 'person' },
                    { id: '2', type: 'person' },
                    { id: '3', type: 'person' },
                ],
                relationships: [
                    { type: 'knows', source: '1', target: '2' },
                    { type: 'knows', source: '2', target: '3' },
                    { type: 'works_with', source: '1', target: '3' },
                ],
            },
        };

        it('sollte alle Relationships finden, wo Entity source oder target ist', () => {
            const rels = DataParser.findRelationshipsForEntity(sampleData, '1');
            expect(rels).toHaveLength(2);
        });

        it('sollte Relationships finden wo Entity nur target ist', () => {
            const rels = DataParser.findRelationshipsForEntity(sampleData, '3');
            expect(rels).toHaveLength(2);
        });

        it('sollte leeres Array zurueckgeben fuer Entity ohne Connections', () => {
            const noConnections: GraphData = {
                system: 'Nodges',
                metadata: {
                    schemaVersion: '3.0'
                },
                data: {
                    entities: [{ id: 'isolated', type: 'person' }],
                    relationships: [],
                },
            };

            const rels = DataParser.findRelationshipsForEntity(noConnections, 'isolated');
            expect(rels).toHaveLength(0);
        });
    });

    describe('visualMappings-Normalisierung', () => {
        it('sollte custom Preset-Keys wie main_view zu global_node/global_edge normalisieren', () => {
            const rawData = {
                system: 'TestSystem',
                metadata: {
                    schemaVersion: '5.0'
                },
                data: {
                    entities: [],
                    relationships: []
                },
                visualMappings: {
                    defaultPresets: {
                        main_view: {
                            color: { function: 'constant', params: { color: '#ff0000' } },
                            size: { function: 'constant', value: 2.0 }
                        },
                        edge_view: {
                            thickness: { function: 'constant', value: 0.5 }
                        }
                    }
                }
            };

            const result = DataParser.parse(rawData);

            expect(result.visualMappings).toBeDefined();
            expect(result.visualMappings?.defaultPresets.global_node).toBeDefined();
            expect(result.visualMappings?.defaultPresets.global_edge).toBeDefined();
            expect((result.visualMappings?.defaultPresets.global_node as any).color).toBeDefined();
            expect((result.visualMappings?.defaultPresets.global_edge as any).thickness).toBeDefined();
            expect(result.visualMappings?.defaultPresets.main_view).toBeUndefined();
            expect(result.visualMappings?.defaultPresets.edge_view).toBeUndefined();
        });

        it('sollte params.categories automatisch aus range und dataModel generieren fuer kategoriale Mappings', () => {
            const rawData = {
                system: 'TestSystem',
                metadata: {
                    schemaVersion: '5.0'
                },
                dataModel: {
                    properties: {
                        status: {
                            type: 'categorical',
                            values: ['active', 'inactive', 'maintenance']
                        }
                    }
                },
                data: {
                    entities: [],
                    relationships: []
                },
                visualMappings: {
                    defaultPresets: {
                        global_node: {
                            color: {
                                source: 'stateVector',
                                field: 'status',
                                function: 'categorical',
                                range: ['#00ff00', '#ff0000', '#ffff00']
                            }
                        }
                    }
                }
            };

            const result = DataParser.parse(rawData);

            const preset = result.visualMappings?.defaultPresets.global_node as any;
            expect(preset).toBeDefined();
            expect(preset.color.params).toBeDefined();
            expect(preset.color.params.categories).toBeDefined();
            expect(preset.color.params.categories.active).toBe('#00ff00');
            expect(preset.color.params.categories.inactive).toBe('#ff0000');
            expect(preset.color.params.categories.maintenance).toBe('#ffff00');
        });
    });

    describe('getAvailableProperties()', () => {
        it('sollte label für relationships erlauben, aber für entities als reserved filtern', () => {
            const node = { id: 'n1', label: 'My Node', customProp: 'hello' };
            const rel = { id: 'r1', source: 'n1', target: 'n2', label: 'depends_on', customProp: 'world' };

            const nodeProps = getAvailableProperties(undefined, undefined, node);
            const relProps = getAvailableProperties(undefined, undefined, rel);

            // 'label' sollte bei Knoten NICHT in den verfügbaren Properties sein (ist reserved)
            expect(nodeProps).not.toContain('label');
            expect(nodeProps).toContain('customProp');

            // 'label' sollte bei Kanten / Beziehungen enthalten sein (nicht reserved)
            expect(relProps).toContain('label');
            expect(relProps).toContain('customProp');
            expect(relProps).not.toContain('source');
            expect(relProps).not.toContain('target');
        });
    });
});
