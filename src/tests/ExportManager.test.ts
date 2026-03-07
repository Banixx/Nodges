import { describe, it, expect, beforeEach } from 'vitest';
import { ExportManager } from '../utils/ExportManager';

/**
 * Tests fuer ExportManager - JSON, CSV, GEXF, GraphML Export
 * (Testet nur die Format-Generierung, nicht den Download-Teil)
 */
describe('ExportManager', () => {
    let exportManager: ExportManager;

    const sampleNetworkData = {
        metadata: {
            type: 'test',
            source: 'unit-test',
        },
        nodes: [
            {
                id: '1',
                name: 'Alice',
                position: { x: 1, y: 2, z: 3 },
                metadata: { color: 0xff0000, size: 2 },
            },
            {
                id: '2',
                name: 'Bob',
                position: { x: 4, y: 5, z: 6 },
                metadata: {},
            },
        ],
        edges: [
            {
                id: 'e1',
                source: '1',
                target: '2',
                name: 'knows',
                weight: 0.8,
                metadata: {},
            },
        ],
    };

    beforeEach(() => {
        exportManager = new ExportManager();
    });

    describe('Unterstuetzte Formate', () => {
        it('sollte json, csv, gexf, graphml, png, svg unterstuetzen', () => {
            expect(exportManager.supportedFormats).toContain('json');
            expect(exportManager.supportedFormats).toContain('csv');
            expect(exportManager.supportedFormats).toContain('gexf');
            expect(exportManager.supportedFormats).toContain('graphml');
            expect(exportManager.supportedFormats).toContain('png');
            expect(exportManager.supportedFormats).toContain('svg');
        });
    });

    describe('exportJSON()', () => {
        it('sollte gueltiges JSON erzeugen', () => {
            const result = exportManager.exportJSON(sampleNetworkData);

            const parsed = JSON.parse(result);
            expect(parsed.nodes).toHaveLength(2);
            expect(parsed.edges).toHaveLength(1);
        });

        it('sollte Metadata mit exportedAt ergaenzen', () => {
            const result = exportManager.exportJSON(sampleNetworkData);

            const parsed = JSON.parse(result);
            expect(parsed.metadata.exportedAt).toBeDefined();
            expect(parsed.metadata.format).toBe('nodges-json');
        });

        it('sollte mit leeren Daten funktionieren', () => {
            const result = exportManager.exportJSON({ nodes: [], edges: [] });

            const parsed = JSON.parse(result);
            expect(parsed.nodes).toHaveLength(0);
            expect(parsed.edges).toHaveLength(0);
        });

        it('sollte minify-Option unterstuetzen', () => {
            const normal = exportManager.exportJSON(sampleNetworkData);
            const minified = exportManager.exportJSON(sampleNetworkData, { minify: true });

            // Minified sollte kuerzer sein (keine Einrueckung)
            expect(minified.length).toBeLessThan(normal.length);
        });

        it('sollte Visualisierungszustand einbeziehen wenn angefordert', () => {
            const vizState = { cameraPosition: { x: 0, y: 0, z: 10 } };

            const result = exportManager.exportJSON(sampleNetworkData, {
                includeVisualizationState: true,
                visualizationState: vizState,
            });

            const parsed = JSON.parse(result);
            expect(parsed.visualizationState).toBeDefined();
            expect(parsed.visualizationState.cameraPosition.z).toBe(10);
        });
    });

    describe('exportCSV()', () => {
        it('sollte Nodes-CSV erzeugen (Standard)', () => {
            const result = exportManager.exportCSV(sampleNetworkData);

            expect(result).toContain('id');
            expect(result).toContain('name');
            expect(result).toContain('Alice');
            expect(result).toContain('Bob');
        });

        it('sollte Edges-CSV erzeugen', () => {
            const result = exportManager.exportCSV(sampleNetworkData, { type: 'edges' });

            expect(result).toContain('source');
            expect(result).toContain('target');
            expect(result).toContain('1');
            expect(result).toContain('2');
        });

        it('sollte leeres Nodes-CSV mit Header erzeugen', () => {
            const result = exportManager.exportNodesCSV([]);

            expect(result).toBe('id,name,x,y,z\n');
        });

        it('sollte leeres Edges-CSV mit Header erzeugen', () => {
            const result = exportManager.exportEdgesCSV([]);

            expect(result).toBe('source,target,name,weight\n');
        });

        it('sollte Positionen in Nodes-CSV enthalten', () => {
            const result = exportManager.exportNodesCSV(sampleNetworkData.nodes);

            expect(result).toContain('1'); // x Position
            expect(result).toContain('2'); // y Position
        });
    });

    describe('exportGEXF()', () => {
        it('sollte gueltiges GEXF-XML erzeugen', () => {
            const result = exportManager.exportGEXF(sampleNetworkData);

            expect(result).toContain('<?xml');
            expect(result).toContain('<gexf');
            expect(result).toContain('</gexf>');
        });

        it('sollte Nodes mit IDs und Labels enthalten', () => {
            const result = exportManager.exportGEXF(sampleNetworkData);

            expect(result).toContain('id="1"');
            expect(result).toContain('label="Alice"');
            expect(result).toContain('id="2"');
            expect(result).toContain('label="Bob"');
        });

        it('sollte Edges mit source und target enthalten', () => {
            const result = exportManager.exportGEXF(sampleNetworkData);

            expect(result).toContain('source="1"');
            expect(result).toContain('target="2"');
        });

        it('sollte Position-Attribute enthalten', () => {
            const result = exportManager.exportGEXF(sampleNetworkData);

            expect(result).toContain('viz:position');
            expect(result).toContain('x="1"');
        });

        it('sollte Farbinformationen enthalten wenn vorhanden', () => {
            const result = exportManager.exportGEXF(sampleNetworkData);

            expect(result).toContain('viz:color');
        });

        it('sollte mit leeren Daten funktionieren', () => {
            const result = exportManager.exportGEXF({ nodes: [], edges: [] });

            expect(result).toContain('<nodes>');
            expect(result).toContain('</nodes>');
            expect(result).toContain('<edges>');
            expect(result).toContain('</edges>');
        });
    });

    describe('exportGraphML()', () => {
        it('sollte gueltiges GraphML-XML erzeugen', () => {
            const result = exportManager.exportGraphML(sampleNetworkData);

            expect(result).toContain('<?xml');
            expect(result).toContain('<graphml');
            expect(result).toContain('</graphml>');
        });

        it('sollte Key-Definitionen enthalten', () => {
            const result = exportManager.exportGraphML(sampleNetworkData);

            expect(result).toContain('attr.name="name"');
            expect(result).toContain('attr.name="x"');
            expect(result).toContain('attr.name="y"');
            expect(result).toContain('attr.name="z"');
        });

        it('sollte Nodes mit Daten enthalten', () => {
            const result = exportManager.exportGraphML(sampleNetworkData);

            expect(result).toContain('<node id="1">');
            expect(result).toContain('Alice');
        });

        it('sollte Edges mit source und target enthalten', () => {
            const result = exportManager.exportGraphML(sampleNetworkData);

            expect(result).toContain('source="1"');
            expect(result).toContain('target="2"');
        });
    });

    describe('escapeCSVValue()', () => {
        it('sollte einfache Werte unveraendert zurueckgeben', () => {
            expect(exportManager.escapeCSVValue('hello')).toBe('hello');
            expect(exportManager.escapeCSVValue(42)).toBe('42');
        });

        it('sollte Komma-enthaltende Werte in Anfuehrungszeichen setzen', () => {
            expect(exportManager.escapeCSVValue('hello, world')).toBe('"hello, world"');
        });

        it('sollte Anfuehrungszeichen doppeln', () => {
            expect(exportManager.escapeCSVValue('say "hello"')).toBe('"say ""hello"""');
        });

        it('sollte null/undefined als leeren String behandeln', () => {
            expect(exportManager.escapeCSVValue(null)).toBe('');
            expect(exportManager.escapeCSVValue(undefined)).toBe('');
        });

        it('sollte Zeilenumbrueche in Anfuehrungszeichen setzen', () => {
            expect(exportManager.escapeCSVValue('line1\nline2')).toBe('"line1\nline2"');
        });
    });

    describe('escapeXML()', () => {
        it('sollte XML-Sonderzeichen escapen', () => {
            expect(exportManager.escapeXML('a & b')).toBe('a &amp; b');
            expect(exportManager.escapeXML('a < b')).toBe('a &lt; b');
            expect(exportManager.escapeXML('a > b')).toBe('a &gt; b');
            expect(exportManager.escapeXML('a "b" c')).toBe('a &quot;b&quot; c');
        });

        it('sollte leeren String bei null/undefined zurueckgeben', () => {
            expect(exportManager.escapeXML(null)).toBe('');
            expect(exportManager.escapeXML(undefined)).toBe('');
        });

        it('sollte normalen Text unveraendert lassen', () => {
            expect(exportManager.escapeXML('Hello World')).toBe('Hello World');
        });
    });

    describe('hexToRGB()', () => {
        it('sollte Hex-Wert in RGB umwandeln', () => {
            expect(exportManager.hexToRGB(0xff0000)).toEqual({ r: 255, g: 0, b: 0 });
            expect(exportManager.hexToRGB(0x00ff00)).toEqual({ r: 0, g: 255, b: 0 });
            expect(exportManager.hexToRGB(0x0000ff)).toEqual({ r: 0, g: 0, b: 255 });
        });

        it('sollte Schwarz korrekt umwandeln', () => {
            expect(exportManager.hexToRGB(0x000000)).toEqual({ r: 0, g: 0, b: 0 });
        });

        it('sollte Weiss korrekt umwandeln', () => {
            expect(exportManager.hexToRGB(0xffffff)).toEqual({ r: 255, g: 255, b: 255 });
        });
    });

    describe('numberToHex()', () => {
        it('sollte Zahl in 6-stelligen Hex-String umwandeln', () => {
            expect(exportManager.numberToHex(0xff0000)).toBe('ff0000');
            expect(exportManager.numberToHex(0x000000)).toBe('000000');
            expect(exportManager.numberToHex(0xffffff)).toBe('ffffff');
        });

        it('sollte kurze Werte mit Nullen auffuellen', () => {
            expect(exportManager.numberToHex(0x0000ff)).toBe('0000ff');
            expect(exportManager.numberToHex(0x00ff00)).toBe('00ff00');
        });
    });

    describe('exportSVG()', () => {
        it('sollte Fehler werfen (nicht implementiert)', async () => {
            await expect(exportManager.exportSVG('test.svg')).rejects.toThrow('not yet implemented');
        });
    });

    describe('getCurrentNetworkData()', () => {
        it('sollte Netzwerkdaten aus Node- und Edge-Objekten extrahieren', () => {
            const nodes = [
                {
                    id: '1',
                    mesh: { name: 'Alice', position: { x: 1, y: 2, z: 3 } },
                    metadata: { type: 'person' },
                    options: { color: 0xff0000, size: 2 },
                },
            ];

            const edges = [
                {
                    startNode: { id: '1' },
                    endNode: { id: '2' },
                    name: 'knows',
                    metadata: {},
                    options: { color: 0x00ff00 },
                },
            ];

            const result = exportManager.getCurrentNetworkData(nodes, edges);

            expect(result.nodes).toHaveLength(1);
            expect(result.edges).toHaveLength(1);
            expect(result.nodes[0].name).toBe('Alice');
            expect(result.nodes[0].position.x).toBe(1);
            expect(result.metadata.nodeCount).toBe(1);
            expect(result.metadata.edgeCount).toBe(1);
        });

        it('sollte leere Listen verarbeiten', () => {
            const result = exportManager.getCurrentNetworkData([], []);

            expect(result.nodes).toHaveLength(0);
            expect(result.edges).toHaveLength(0);
        });
    });

    describe('exportNetwork()', () => {
        it('sollte Fehler bei fehlenden Daten werfen', async () => {
            await expect(
                exportManager.exportNetwork(null, 'json', 'test.json')
            ).rejects.toThrow('No network data provided');
        });

        it('sollte Fehler bei nicht unterstuetztem Format werfen', async () => {
            await expect(
                exportManager.exportNetwork(sampleNetworkData, 'xyz', 'test.xyz')
            ).rejects.toThrow('Unsupported export format');
        });
    });
});
