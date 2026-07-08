import { describe, it, expect } from 'vitest';
import { DataParser } from '../core/DataParser';
import type { GraphData } from '../types';

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
});
