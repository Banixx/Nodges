import { describe, it, expect } from 'vitest';
import { EntityDataSchema, RelationshipDataSchema, GraphDataSchema } from '../types';

describe('Build 5 Zod Schemas', () => {
    describe('EntityDataSchema', () => {
        it('sollte ein valides Entity ohne expliziten "type" akzeptieren (Build 5 Flexibilität)', () => {
            const data = {
                id: 'entity-1',
                label: 'Test Node',
                position: { x: 0, y: 0, z: 0 },
                customProperty: 'wird durch passthrough erlaubt'
            };
            const result = EntityDataSchema.safeParse(data);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.customProperty).toBe('wird durch passthrough erlaubt');
            }
        });

        it('sollte fehlschlagen, wenn keine "id" vorhanden ist', () => {
            const data = {
                label: 'No ID Node'
            };
            const result = EntityDataSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });

    describe('RelationshipDataSchema', () => {
        it('sollte eine Kante ohne "type" akzeptieren', () => {
            const data = {
                source: 'entity-1',
                target: 'entity-2'
            };
            const result = RelationshipDataSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });

    describe('GraphDataSchema', () => {
        it('sollte ein komplettes generiertes Graph-Objekt parsen können', () => {
            const graphData = {
                system: 'Test System',
                metadata: { author: 'Unit Test' },
                data: {
                    entities: [{ id: 'e1' }, { id: 'e2' }],
                    relationships: [{ source: 'e1', target: 'e2' }]
                }
            };
            const result = GraphDataSchema.safeParse(graphData);
            expect(result.success).toBe(true);
        });

        it('sollte fehlschlagen, wenn "data.entities" fehlt', () => {
            const graphData = {
                system: 'Test System',
                metadata: {},
                data: {
                    relationships: []
                }
            };
            const result = GraphDataSchema.safeParse(graphData);
            expect(result.success).toBe(false);
        });
    });
});
