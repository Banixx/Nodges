import { describe, it, expect, beforeEach } from 'vitest';
import { FutureDataParser } from '../utils/FutureDataParser';

/**
 * Tests fuer FutureDataParser - Randfaelle, fehlende Felder,
 * ungueltige IDs, leere Eingaben
 */
describe('FutureDataParser', () => {
    let parser: FutureDataParser;

    beforeEach(() => {
        parser = new FutureDataParser();
    });

    describe('validateStructure()', () => {
        it('sollte gueltige Daten akzeptieren', () => {
            const validData = {
                system: 'Test',
                dataModel: { entities: {}, relationships: {} },
                data: {
                    entities: [],
                    relationships: [],
                },
            };

            expect(() => parser.validateStructure(validData)).not.toThrow();
        });

        it('sollte Fehler werfen bei fehlenderem system-Feld', () => {
            const data = {
                dataModel: { entities: {}, relationships: {} },
                data: { entities: [], relationships: [] },
            };

            expect(() => parser.validateStructure(data)).toThrow('Missing required fields');
        });

        it('sollte Fehler werfen bei fehlendem dataModel', () => {
            const data = {
                system: 'Test',
                data: { entities: [], relationships: [] },
            };

            expect(() => parser.validateStructure(data)).toThrow('Missing required fields');
        });

        it('sollte Fehler werfen bei fehlendem data-Feld', () => {
            const data = {
                system: 'Test',
                dataModel: { entities: {} },
            };

            expect(() => parser.validateStructure(data)).toThrow('Missing required fields');
        });

        it('sollte Fehler werfen wenn data.entities kein Array ist', () => {
            const data = {
                system: 'Test',
                dataModel: { entities: {} },
                data: {
                    entities: 'nicht-ein-array',
                    relationships: [],
                },
            };

            expect(() => parser.validateStructure(data)).toThrow('data.entities must be an array');
        });

        it('sollte Fehler werfen wenn data.relationships kein Array ist', () => {
            const data = {
                system: 'Test',
                dataModel: { entities: {} },
                data: {
                    entities: [],
                    relationships: 'nicht-ein-array',
                },
            };

            expect(() => parser.validateStructure(data)).toThrow('data.relationships must be an array');
        });

        it('sollte data ohne relationships erlauben (optional)', () => {
            const data = {
                system: 'Test',
                dataModel: { entities: {} },
                data: {
                    entities: [],
                },
            };

            // relationships kann fehlend sein (wird als falsy gewertet)
            expect(() => parser.validateStructure(data)).not.toThrow();
        });
    });

    describe('parseData()', () => {
        it('sollte minimale gueltige Daten parsen', async () => {
            const data = {
                system: 'TestSystem',
                dataModel: {
                    entities: {},
                    relationships: {},
                },
                data: {
                    entities: [
                        { id: 'e1', type: 'node', label: 'Node 1' },
                    ],
                    relationships: [],
                },
            };

            const result = await parser.parseData(data);

            expect(result.data.entities).toHaveLength(1);
            expect(result.data.entities[0].id).toBe('e1');
            expect(result.data.relationships).toHaveLength(0);
        });

        it('sollte Entities ohne ID mit generierten IDs versehen', async () => {
            const data = {
                system: 'Test',
                dataModel: { entities: {}, relationships: {} },
                data: {
                    entities: [
                        { type: 'node', label: 'Ohne ID' },
                    ],
                    relationships: [],
                },
            };

            const result = await parser.parseData(data);

            expect(result.data.entities[0].id).toBe('entity_0');
        });

        it('sollte Entities ohne Label korrekt behandeln', async () => {
            const data = {
                system: 'Test',
                dataModel: { entities: {}, relationships: {} },
                data: {
                    entities: [
                        { id: 'e1', type: 'node' },
                    ],
                    relationships: [],
                },
            };

            const result = await parser.parseData(data);
            // Label-Fallback: name || id || 'Entity N'
            expect(result.data.entities[0].label).toBe('e1');
        });

        it('sollte Relationships ohne IDs generieren', async () => {
            const data = {
                system: 'Test',
                dataModel: { entities: {}, relationships: {} },
                data: {
                    entities: [
                        { id: 'e1', type: 'a' },
                        { id: 'e2', type: 'b' },
                    ],
                    relationships: [
                        { type: 'connects', source: 'e1', target: 'e2' },
                    ],
                },
            };

            const result = await parser.parseData(data);

            expect(result.data.relationships[0].id).toBe('relationship_0');
        });

        it('sollte Fehler werfen bei Relationship ohne source', async () => {
            const data = {
                system: 'Test',
                dataModel: { entities: {}, relationships: {} },
                data: {
                    entities: [],
                    relationships: [
                        { type: 'connects', target: 'e2' },
                    ],
                },
            };

            await expect(parser.parseData(data)).rejects.toThrow('missing source or target');
        });

        it('sollte Fehler werfen bei Relationship ohne target', async () => {
            const data = {
                system: 'Test',
                dataModel: { entities: {}, relationships: {} },
                data: {
                    entities: [],
                    relationships: [
                        { type: 'connects', source: 'e1' },
                    ],
                },
            };

            await expect(parser.parseData(data)).rejects.toThrow('missing source or target');
        });

        it('sollte leere Entities und Relationships parsen', async () => {
            const data = {
                system: 'Test',
                dataModel: { entities: {}, relationships: {} },
                data: {
                    entities: [],
                    relationships: [],
                },
            };

            const result = await parser.parseData(data);

            expect(result.data.entities).toHaveLength(0);
            expect(result.data.relationships).toHaveLength(0);
        });

        it('sollte fehlende relationships als leeres Array behandeln', async () => {
            const data = {
                system: 'Test',
                dataModel: { entities: {}, relationships: {} },
                data: {
                    entities: [{ id: '1', type: 'a' }],
                },
            };

            const result = await parser.parseData(data);

            expect(result.data.relationships).toHaveLength(0);
        });
    });

    describe('parseMetadata()', () => {
        it('sollte System-Name aus Daten uebernehmen', () => {
            const data = { system: 'MySystem' };
            const metadata = parser.parseMetadata(data);

            expect(metadata.system).toBe('MySystem');
        });

        it('sollte Standardwerte fuer fehlende Felder setzen', () => {
            const data = { system: 'Test' };
            const metadata = parser.parseMetadata(data);

            expect(metadata.version).toBe('1.0');
            expect(metadata.author).toBe('Unknown');
            expect(metadata.description).toBe('');
            expect(metadata.created).toBeDefined();
        });

        it('sollte benutzerdefinierte Metadaten uebernehmen', () => {
            const data = {
                system: 'Test',
                metadata: { customField: 'customValue' },
            };

            const metadata = parser.parseMetadata(data);

            expect(metadata.customField).toBe('customValue');
        });
    });

    describe('parseDataModel()', () => {
        it('sollte leeres DataModel parsen', () => {
            const result = parser.parseDataModel({ entities: {}, relationships: {} });

            expect(result.entities).toEqual({});
            expect(result.relationships).toEqual({});
        });

        it('sollte Entity-Definitionen mit Properties verarbeiten', () => {
            const dataModel = {
                entities: {
                    person: {
                        properties: {
                            age: { type: 'continuous', range: [0, 150] },
                        },
                    },
                },
                relationships: {},
            };

            const result = parser.parseDataModel(dataModel);

            expect(result.entities.person).toBeDefined();
            expect(result.entities.person.properties.age).toBeDefined();
            expect(result.entities.person.properties.age.type).toBe('continuous');
        });

        it('sollte fehlendes entities-Objekt im DataModel tolerieren', () => {
            const result = parser.parseDataModel({ relationships: {} });

            expect(result.entities).toEqual({});
        });

        it('sollte fehlendes relationships-Objekt im DataModel tolerieren', () => {
            const result = parser.parseDataModel({ entities: {} });

            expect(result.relationships).toEqual({});
        });
    });

    describe('Datentyp-Parser', () => {
        it('parseContinuous sollte Zahlenwerte korrekt parsen', () => {
            const result = parser.parseContinuous('42', { type: 'continuous' });
            expect(result).toBe(42);
        });

        it('parseContinuous sollte Range einhalten', () => {
            const result = parser.parseContinuous('200', {
                type: 'continuous',
                range: [0, 100],
            });
            expect(result).toBe(100);
        });

        it('parseContinuous sollte Default bei ungueltigem Wert zurueckgeben', () => {
            const result = parser.parseContinuous('abc', {
                type: 'continuous',
                default: 5,
            });
            expect(result).toBe(5);
        });

        it('parseContinuous sollte 0 bei NaN ohne Default zurueckgeben', () => {
            const result = parser.parseContinuous('abc', { type: 'continuous' });
            expect(result).toBe(0);
        });

        it('parseCategorical sollte gueltigen Wert akzeptieren', () => {
            const result = parser.parseCategorical('blue', {
                type: 'categorical',
                values: ['red', 'blue', 'green'],
            });
            expect(result).toBe('blue');
        });

        it('parseCategorical sollte Default bei ungueltigem Wert verwenden', () => {
            const result = parser.parseCategorical('purple', {
                type: 'categorical',
                values: ['red', 'blue', 'green'],
                default: 'red',
            });
            expect(result).toBe('red');
        });

        it('parseBoolean sollte truthy Werte konvertieren', () => {
            expect(parser.parseBoolean(true, { type: 'boolean' })).toBe(true);
            expect(parser.parseBoolean(1, { type: 'boolean' })).toBe(true);
            expect(parser.parseBoolean('yes', { type: 'boolean' })).toBe(true);
        });

        it('parseBoolean sollte falsy Werte konvertieren', () => {
            expect(parser.parseBoolean(false, { type: 'boolean' })).toBe(false);
            expect(parser.parseBoolean(0, { type: 'boolean' })).toBe(false);
            expect(parser.parseBoolean('', { type: 'boolean' })).toBe(false);
            expect(parser.parseBoolean(null, { type: 'boolean' })).toBe(false);
        });

        it('parseTemporal sollte Datumsstrings parsen', () => {
            const result = parser.parseTemporal('2026-01-15T10:00:00Z', { type: 'temporal' });
            expect(result).toBe(new Date('2026-01-15T10:00:00Z').getTime());
        });

        it('parseTemporal sollte bei ungueltigem Datum den Default zurueckgeben', () => {
            const result = parser.parseTemporal('kein-datum', {
                type: 'temporal',
                default: 1000,
            });
            expect(result).toBe(1000);
        });

        it('parseVector sollte Vektor-Objekte verarbeiten', () => {
            const result = parser.parseVector(
                { x: 1, y: 2, z: 3 },
                { type: 'vector', dimensions: ['x', 'y', 'z'] }
            );
            expect(result.x).toBe(1);
            expect(result.y).toBe(2);
            expect(result.z).toBe(3);
        });

        it('parseVector sollte Default bei Nicht-Objekt zurueckgeben', () => {
            const result = parser.parseVector('kein-objekt', {
                type: 'vector',
                default: { x: 0, y: 0 },
            });
            expect(result).toEqual({ x: 0, y: 0 });
        });

        it('parseSpatial sollte Koordinaten parsen', () => {
            const result = parser.parseSpatial(
                { lat: 47.5, lng: 8.5, elevation: 400 },
                { type: 'spatial', coordinates: ['lat', 'lng', 'elevation'] }
            );
            expect(result.lat).toBe(47.5);
            expect(result.lng).toBe(8.5);
            expect(result.elevation).toBe(400);
        });

        it('parseSpatial sollte Default bei Nicht-Objekt zurueckgeben', () => {
            const result = parser.parseSpatial(null, { type: 'spatial' });
            expect(result).toEqual({ x: 0, y: 0, z: 0 });
        });
    });

    describe('Visual Mapping Funktionen', () => {
        it('linearMapping sollte Werte korrekt skalieren', () => {
            const result = parser.linearMapping(0.5, { range: [0, 100] });
            expect(result).toBe(50);
        });

        it('linearMapping sollte Default-Range verwenden', () => {
            const result = parser.linearMapping(0.5, {});
            expect(result).toBe(0.5);
        });

        it('sphereComplexityMapping sollte segmente berechnen', () => {
            const result = parser.sphereComplexityMapping(0.5, {
                minSegments: 4,
                maxSegments: 32,
            });
            expect(result).toBe(18); // 4 + 0.5 * 28 = 18
        });

        it('geographicMapping sollte Koordinaten umrechnen', () => {
            const result = parser.geographicMapping(
                { lat: 1, lng: 1, elevation: 100 },
                {}
            );
            expect(result.x).toBe(111320); // 1 * 111320
            expect(result.y).toBe(100);
            expect(result.z).toBe(110540); // 1 * 110540
        });

        it('geographicMapping sollte Default bei fehlenden Koordinaten zurueckgeben', () => {
            const result = parser.geographicMapping({}, {});
            expect(result).toEqual({ x: 0, y: 0, z: 0 });
        });
    });

    describe('parseVisualMappings()', () => {
        it('sollte null/undefined als leere Mappings behandeln', () => {
            const result = parser.parseVisualMappings(null);
            expect(result.defaultPresets).toEqual({});
        });

        it('sollte Visual Mappings mit defaultPresets parsen', () => {
            const mappings = {
                defaultPresets: {
                    person: {
                        size: {
                            source: 'importance',
                            function: 'linear',
                            range: [0.5, 3],
                        },
                    },
                },
            };

            const result = parser.parseVisualMappings(mappings);

            expect(result.defaultPresets.person).toBeDefined();
        });
    });

    describe('extractAvailableFields()', () => {
        it('sollte Felder aus DataModel extrahieren', () => {
            const data = {
                dataModel: {
                    entities: {
                        person: {
                            properties: {
                                age: { type: 'continuous' },
                                name: { type: 'categorical' },
                            },
                        },
                    },
                    relationships: {
                        knows: {
                            properties: {
                                strength: { type: 'continuous' },
                            },
                        },
                    },
                },
            };

            const fields = parser.extractAvailableFields(data);

            expect(fields.entities.person).toContain('age');
            expect(fields.entities.person).toContain('name');
            expect(fields.relationships.knows).toContain('strength');
        });
    });
});
