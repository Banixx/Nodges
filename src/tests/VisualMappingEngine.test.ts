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
            const entity: EntityData = { id: '1' };
            const visual = engine.applyToEntity(entity);

            expect(visual.size).toBe(1.0);
            expect(visual.color).toBeInstanceOf(THREE.Color);
            expect(visual.geometry).toBe('sphere');
            expect(visual.glow).toBe(0);
        });

        it('sollte Default-Properties fuer Relationships zurueckgeben', () => {
            const rel: RelationshipData = { source: '1', target: '2' };
            const visual = engine.applyToRelationship(rel);

            expect(visual.thickness).toBe(0.1);
            expect(visual.opacity).toBe(1.0);
        });
    });

    describe('mit VisualMappings', () => {
        beforeEach(() => {
            const mappings: VisualMappings = {
                defaultPresets: {
                    global_node: {
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
                    global_edge: {
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
                    age: 0.5, // Normalized value
                };

                const visual = engine.applyToEntity(entity);

                // Linear mapping: 0.5 + 0.5 * (2.0 - 0.5) = 0.5 + 0.75 = 1.25
                expect(visual.size).toBeCloseTo(1.25);
            });

            it('sollte Color-Mapping mit Heatmap anwenden', () => {
                const entity: EntityData = {
                    id: '1',
                    happiness: 0.5,
                };

                const visual = engine.applyToEntity(entity);

                expect(visual.color).toBeInstanceOf(THREE.Color);
                // Heatmap at 0.5 should be middle between blue and red
            });

            it('sollte mit fehlenden Properties umgehen (Fallback zu Mitte der Range)', () => {
                const entity: EntityData = {
                    id: '1',
                    // age fehlt absichtlich
                };

                const visual = engine.applyToEntity(entity);

                // Should return middle of range: (0.5 + 2.0) / 2 = 1.25
                expect(visual.size).toBe(1.25);
            });

            it('sollte Default-Properties fuer leere Mappings zurueckgeben', () => {
                const entity: EntityData = {
                    id: '1',
                };
                // We overwrite global mappings temporarily to test fallback
                const oldMappings = engine.getVisualMappings();
                engine.setVisualMappings({ defaultPresets: {} });

                const visual = engine.applyToEntity(entity);

                expect(visual.size).toBe(1.0);
                expect(visual.geometry).toBe('sphere');
                
                engine.setVisualMappings(oldMappings!);
            });
        });

        describe('applyToRelationship()', () => {
            it('sollte Thickness-Mapping anwenden', () => {
                const rel: RelationshipData = {
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
                    source: '1',
                    target: '2',
                };

                const visual = engine.applyToRelationship(rel);

                // Opacity should be constant 0.8
                expect(visual.opacity).toBe(0.8);
            });

            it('sollte Default-Properties zurueckgeben wenn keine globalen Edges definiert', () => {
                const rel: RelationshipData = {
                    source: '1',
                    target: '2',
                };
                
                const oldMappings = engine.getVisualMappings();
                engine.setVisualMappings({ defaultPresets: {} });

                const visual = engine.applyToRelationship(rel);

                // Should return defaults
                expect(visual.thickness).toBe(0.1);
                expect(visual.opacity).toBe(1.0);
                
                engine.setVisualMappings(oldMappings!);
            });
        });
    });

    describe('Mapping-Funktionen', () => {
        it('sollte linear mapping korrekt berechnen', () => {
            const mappings: VisualMappings = {
                defaultPresets: {
                    global_node: {
                        size: {
                            source: 'value',
                            function: 'linear',
                            range: [1.0, 2.0],
                        },
                    },
                },
            };

            engine = new VisualMappingEngine(mappings);

            const entity0: EntityData = { id: '1', value: 0 };
            const entity05: EntityData = { id: '2', value: 0.5 };
            const entity1: EntityData = { id: '3', value: 1.0 };

            expect(engine.applyToEntity(entity0).size).toBe(1.0);
            expect(engine.applyToEntity(entity05).size).toBe(1.5);
            expect(engine.applyToEntity(entity1).size).toBe(2.0);
        });

        it('sollte exponential mapping korrekt berechnen', () => {
            const mappings: VisualMappings = {
                defaultPresets: {
                    global_node: {
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

            const entity: EntityData = { id: '1', value: 0.5 };
            const visual = engine.applyToEntity(entity);

            // Exponential: 0.5^2 = 0.25, then linear scale: 1 + 0.25 * (5-1) = 2.0
            expect(visual.size).toBeCloseTo(2.0);
        });
    });

    describe('setVisualMappings()', () => {
        it('sollte Mappings zur Laufzeit aktualisieren koennen', () => {
            engine = new VisualMappingEngine();

            const entity: EntityData = { id: '1' };

            // Vor dem Setzen
            let visual = engine.applyToEntity(entity);
            expect(visual.size).toBe(1.0);

            // Nach dem Setzen
            const newMappings: VisualMappings = {
                defaultPresets: {
                    global_node: {
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

    describe('Text-Attribute Normalisierung (0 bis 30)', () => {
        it('sollte Text-Kategorien gleichmaessig auf den Wertebereich 0..30 oder Target-Range skalieren', () => {
            const mappings: VisualMappings = {
                defaultPresets: {
                    global_node: {
                        positionX: {
                            source: 'entity_type',
                            function: 'linear',
                            range: [0, 30],
                        },
                        size: {
                            source: 'entity_type',
                            function: 'linear',
                            range: [1.0, 3.0],
                        },
                    },
                },
            };

            engine = new VisualMappingEngine(mappings);

            const entityA: EntityData = { id: '1', entity_type: 'Ort' };
            const entityB: EntityData = { id: '2', entity_type: 'Person' };

            const visA = engine.applyToEntity(entityA);
            const visB = engine.applyToEntity(entityB);

            // 'Ort' < 'Person' alphabetically -> Ort=0, Person=30 for PositionX
            expect(visA.positionX).toBe(0);
            expect(visB.positionX).toBe(30);

            // Size range [1.0, 3.0]: Ort=1.0, Person=3.0
            expect(visA.size).toBe(1.0);
            expect(visB.size).toBe(3.0);
        });
    });
});
