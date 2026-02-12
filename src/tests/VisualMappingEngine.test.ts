import { describe, it, expect, beforeEach } from 'vitest';
import { VisualMappingEngine } from '../core/VisualMappingEngine';
import type { VisualMappings, EntityData, RelationshipData } from '../types';
import * as THREE from 'three';

describe('VisualMappingEngine', () => {
    let engine: VisualMappingEngine;

    describe('ohne VisualMappings', () => {
        beforeEach(() => {
            engine = new VisualMappingEngine();
        });

        it('sollte Default-Properties fuer Entities zurueckgeben', () => {
            const entity: EntityData = { id: '1', type: 'person' };
            const visual = engine.applyToEntity(entity);

            expect(visual.size).toBe(1.0);
            expect(visual.color).toBeInstanceOf(THREE.Color);
            expect(visual.geometry).toBe('sphere');
            expect(visual.glow).toBe(0);
        });

        it('sollte Default-Properties fuer Relationships zurueckgeben', () => {
            const rel: RelationshipData = { type: 'knows', source: '1', target: '2' };
            const visual = engine.applyToRelationship(rel);

            expect(visual.thickness).toBe(0.1);
            expect(visual.opacity).toBe(1.0);
        });
    });

    describe('mit VisualMappings', () => {
        beforeEach(() => {
            const mappings: VisualMappings = {
                defaultPresets: {
                    person: {
                        size: {
                            source: 'age',
                            function: 'linear',
                            range: [0.5, 2.0],
                        },
                        color: {
                            source: 'happiness',
                            function: 'heatmap',
                            palette: 'blue-red',
                        },
                    },
                    knows: {
                        thickness: {
                            source: 'trust',
                            function: 'linear',
                            range: [0.05, 0.3],
                        },
                        opacity: {
                            source: 'constant',
                            function: 'linear',
                            range: [0.8, 0.8],
                        },
                    },
                },
            };

            engine = new VisualMappingEngine(mappings);
        });

        describe('applyToEntity()', () => {
            it('sollte Size-Mapping anwenden', () => {
                const entity: EntityData = {
                    id: '1',
                    type: 'person',
                    age: 0.5, // Normalized value
                };

                const visual = engine.applyToEntity(entity);

                // Linear mapping: 0.5 + 0.5 * (2.0 - 0.5) = 0.5 + 0.75 = 1.25
                expect(visual.size).toBeCloseTo(1.25);
            });

            it('sollte Color-Mapping mit Heatmap anwenden', () => {
                const entity: EntityData = {
                    id: '1',
                    type: 'person',
                    happiness: 0.5,
                };

                const visual = engine.applyToEntity(entity);

                expect(visual.color).toBeInstanceOf(THREE.Color);
                // Heatmap at 0.5 should be middle between blue and red
            });

            it('sollte mit fehlenden Properties umgehen (Fallback zu Mitte der Range)', () => {
                const entity: EntityData = {
                    id: '1',
                    type: 'person',
                    // age fehlt absichtlich
                };

                const visual = engine.applyToEntity(entity);

                // Should return middle of range: (0.5 + 2.0) / 2 = 1.25
                expect(visual.size).toBe(1.25);
            });

            it('sollte Default-Properties fuer unbekannten Entity-Type zurueckgeben', () => {
                const entity: EntityData = {
                    id: '1',
                    type: 'unknown_type',
                };

                const visual = engine.applyToEntity(entity);

                expect(visual.size).toBe(1.0);
                expect(visual.geometry).toBe('sphere');
            });
        });

        describe('applyToRelationship()', () => {
            it('sollte Thickness-Mapping anwenden', () => {
                const rel: RelationshipData = {
                    type: 'knows',
                    source: '1',
                    target: '2',
                    trust: 0.8,
                };

                const visual = engine.applyToRelationship(rel);

                // Linear mapping: 0.05 + 0.8 * (0.3 - 0.05) = 0.05 + 0.2 = 0.25
                expect(visual.thickness).toBeCloseTo(0.25);
            });

            it('sollte Constant-Mapping korrekt verarbeiten', () => {
                const rel: RelationshipData = {
                    type: 'knows',
                    source: '1',
                    target: '2',
                };

                const visual = engine.applyToRelationship(rel);

                // Opacity should be constant 0.8
                expect(visual.opacity).toBe(0.8);
            });

            it('sollte Warning loggen fuer unbekannten Relationship-Type', () => {
                const rel: RelationshipData = {
                    type: 'unknown_relationship',
                    source: '1',
                    target: '2',
                };

                const visual = engine.applyToRelationship(rel);

                // Should return defaults
                expect(visual.thickness).toBe(0.1);
                expect(visual.opacity).toBe(1.0);
            });
        });
    });

    describe('Mapping-Funktionen', () => {
        it('sollte linear mapping korrekt berechnen', () => {
            const mappings: VisualMappings = {
                defaultPresets: {
                    test: {
                        size: {
                            source: 'value',
                            function: 'linear',
                            range: [10, 20],
                        },
                    },
                },
            };

            engine = new VisualMappingEngine(mappings);

            const entity0: EntityData = { id: '1', type: 'test', value: 0 };
            const entity05: EntityData = { id: '2', type: 'test', value: 0.5 };
            const entity1: EntityData = { id: '3', type: 'test', value: 1.0 };

            expect(engine.applyToEntity(entity0).size).toBe(10);
            expect(engine.applyToEntity(entity05).size).toBe(15);
            expect(engine.applyToEntity(entity1).size).toBe(20);
        });

        it('sollte exponential mapping korrekt berechnen', () => {
            const mappings: VisualMappings = {
                defaultPresets: {
                    test: {
                        size: {
                            source: 'value',
                            function: 'exponential',
                            range: [1, 5],
                            params: { base: 2 },
                        },
                    },
                },
            };

            engine = new VisualMappingEngine(mappings);

            const entity: EntityData = { id: '1', type: 'test', value: 0.5 };
            const visual = engine.applyToEntity(entity);

            // Exponential: 0.5^2 = 0.25, then linear scale: 1 + 0.25 * (5-1) = 2.0
            expect(visual.size).toBeCloseTo(2.0);
        });
    });

    describe('setVisualMappings()', () => {
        it('sollte Mappings zur Laufzeit aktualisieren koennen', () => {
            engine = new VisualMappingEngine();

            const entity: EntityData = { id: '1', type: 'person' };

            // Vor dem Setzen
            let visual = engine.applyToEntity(entity);
            expect(visual.size).toBe(1.0);

            // Nach dem Setzen
            const newMappings: VisualMappings = {
                defaultPresets: {
                    person: {
                        size: {
                            source: 'constant',
                            function: 'linear',
                            range: [3.0, 3.0],
                        },
                    },
                },
            };

            engine.setVisualMappings(newMappings);
            visual = engine.applyToEntity(entity);
            expect(visual.size).toBe(3.0);
        });
    });
});
