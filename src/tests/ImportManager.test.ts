import { describe, it, expect, beforeEach } from 'vitest';
// @ts-ignore -- jsdom hat keine Typdeklaration
import { JSDOM } from 'jsdom';

// DOMParser global bereitstellen fuer ImportManager
const dom = new JSDOM('');
(globalThis as any).DOMParser = dom.window.DOMParser;

import { ImportManager } from '../utils/ImportManager';

/**
 * Tests fuer ImportManager - JSON, CSV, Farbparsing, Wertparsing, Validierung
 * (Dateisystem-unabhaengig: testet die Parser-Methoden direkt)
 */
describe('ImportManager', () => {
    let importManager: ImportManager;

    beforeEach(() => {
        importManager = new ImportManager();
    });

    describe('Unterstuetzte Formate', () => {
        it('sollte json, csv, gexf, graphml unterstuetzen', () => {
            expect(importManager.supportedFormats).toContain('json');
            expect(importManager.supportedFormats).toContain('csv');
            expect(importManager.supportedFormats).toContain('gexf');
            expect(importManager.supportedFormats).toContain('graphml');
        });
    });

    describe('getFileExtension()', () => {
        it('sollte die Dateiendung extrahieren', () => {
            expect(importManager.getFileExtension('test.json')).toBe('json');
            expect(importManager.getFileExtension('data.csv')).toBe('csv');
            expect(importManager.getFileExtension('graph.gexf')).toBe('gexf');
        });

        it('sollte leeren String bei fehlender Endung zurueckgeben', () => {
            expect(importManager.getFileExtension('noextension')).toBe('noextension');
        });

        it('sollte bei mehreren Punkten die letzte Endung nehmen', () => {
            expect(importManager.getFileExtension('my.data.file.json')).toBe('json');
        });
    });

    describe('parseJSON()', () => {
        it('sollte gueltiges JSON parsen', () => {
            const json = JSON.stringify({
                nodes: [
                    { id: '1', name: 'Alice', position: { x: 0, y: 0, z: 0 } },
                    { id: '2', name: 'Bob', position: { x: 1, y: 1, z: 1 } },
                ],
                edges: [
                    { source: '1', target: '2', weight: 1 },
                ],
            });

            const result = importManager.parseJSON(json);

            expect(result.nodes).toHaveLength(2);
            expect(result.edges).toHaveLength(1);
            expect(result.metadata.nodeCount).toBe(2);
            expect(result.metadata.edgeCount).toBe(1);
        });

        it('sollte Fehler bei ungueltigem JSON werfen', () => {
            expect(() => importManager.parseJSON('nicht json {')).toThrow('Invalid JSON format');
        });

        it('sollte leere Nodes und Edges akzeptieren', () => {
            const json = JSON.stringify({});

            const result = importManager.parseJSON(json);

            expect(result.nodes).toHaveLength(0);
            expect(result.edges).toHaveLength(0);
        });

        it('sollte fehlende IDs generieren', () => {
            const json = JSON.stringify({
                nodes: [{ name: 'Alice' }, { name: 'Bob' }],
                edges: [],
            });

            const result = importManager.parseJSON(json);

            expect(result.nodes[0].id).toBe('node_0');
            expect(result.nodes[1].id).toBe('node_1');
        });

        it('sollte fehlende Positionen mit Default-Werten fuellen', () => {
            const json = JSON.stringify({
                nodes: [{ id: '1', name: 'Node ohne Position' }],
                edges: [],
            });

            const result = importManager.parseJSON(json);

            expect(result.nodes[0].position).toEqual({ x: 0, y: 0, z: 0 });
        });

        it('sollte Fehler bei fehlender source/target in Edge werfen', () => {
            const json = JSON.stringify({
                nodes: [],
                edges: [{ name: 'broken' }],
            });

            expect(() => importManager.parseJSON(json)).toThrow('missing source or target');
        });
    });

    describe('parseCSV()', () => {
        it('sollte Nodes-CSV parsen', () => {
            const csv = 'id,name,x,y,z\n1,Alice,10,20,30\n2,Bob,40,50,60';

            const result = importManager.parseCSV(csv);

            expect(result.nodes).toHaveLength(2);
            expect(result.nodes[0].id).toBe('1');
            expect(result.nodes[0].name).toBe('Alice');
            expect(result.nodes[0].position.x).toBe(10);
        });

        it('sollte Edges-CSV parsen', () => {
            const csv = 'source,target,name,weight\n1,2,knows,0.8\n2,3,likes,1.0';

            const result = importManager.parseCSV(csv);

            expect(result.edges).toHaveLength(2);
            expect(result.edges[0].source).toBe('1');
            expect(result.edges[0].target).toBe('2');
            expect(result.edges[0].weight).toBe(0.8);
        });

        it('sollte Fehler bei zu kurzem CSV werfen', () => {
            expect(() => importManager.parseCSV('id,name')).toThrow('at least a header and one data row');
        });

        it('sollte Fehler bei unbekanntem Format werfen', () => {
            const csv = 'foo,bar,baz\n1,2,3';

            expect(() => importManager.parseCSV(csv)).toThrow('CSV format not recognized');
        });
    });

    describe('parseCSVLine()', () => {
        it('sollte einfache Werte trennen', () => {
            const result = importManager.parseCSVLine('a,b,c');
            expect(result).toEqual(['a', 'b', 'c']);
        });

        it('sollte Werte in Anfuehrungszeichen behandeln', () => {
            const result = importManager.parseCSVLine('"hello, world",b,c');
            expect(result).toEqual(['hello, world', 'b', 'c']);
        });

        it('sollte leere Werte behandeln', () => {
            const result = importManager.parseCSVLine('a,,c');
            expect(result).toEqual(['a', '', 'c']);
        });
    });

    describe('parseValue()', () => {
        it('sollte Zahlen erkennen', () => {
            expect(importManager.parseValue('42')).toBe(42);
            expect(importManager.parseValue('3.14')).toBeCloseTo(3.14);
        });

        it('sollte Booleans erkennen', () => {
            expect(importManager.parseValue('true')).toBe(true);
            expect(importManager.parseValue('false')).toBe(false);
        });

        it('sollte Strings beibehalten', () => {
            expect(importManager.parseValue('hallo')).toBe('hallo');
        });

        it('sollte leeren String bei leerem Input zurueckgeben', () => {
            expect(importManager.parseValue('')).toBe('');
        });
    });

    describe('parseValueByType()', () => {
        it('sollte int-Typ parsen', () => {
            expect(importManager.parseValueByType('42', 'int')).toBe(42);
            expect(importManager.parseValueByType('abc', 'int')).toBe(0);
        });

        it('sollte float-Typ parsen', () => {
            expect(importManager.parseValueByType('3.14', 'float')).toBeCloseTo(3.14);
        });

        it('sollte double-Typ parsen', () => {
            expect(importManager.parseValueByType('2.71828', 'double')).toBeCloseTo(2.71828);
        });

        it('sollte boolean-Typ parsen', () => {
            expect(importManager.parseValueByType('true', 'boolean')).toBe(true);
            expect(importManager.parseValueByType('false', 'boolean')).toBe(false);
        });

        it('sollte string-Typ als String zurueckgeben', () => {
            expect(importManager.parseValueByType('hallo', 'string')).toBe('hallo');
        });
    });

    describe('parseColor()', () => {
        it('sollte Hex-Farben parsen', () => {
            expect(importManager.parseColor('#ff0000')).toBe(0xff0000);
            expect(importManager.parseColor('#00ff00')).toBe(0x00ff00);
        });

        it('sollte benannte Farben parsen', () => {
            expect(importManager.parseColor('red')).toBe(0xff0000);
            expect(importManager.parseColor('blue')).toBe(0x0000ff);
            expect(importManager.parseColor('green')).toBe(0x00ff00);
        });

        it('sollte Default-Farbe bei null/undefined zurueckgeben', () => {
            expect(importManager.parseColor(null)).toBe(0xff4500);
            expect(importManager.parseColor(undefined)).toBe(0xff4500);
        });

        it('sollte Default-Farbe bei nicht-String zurueckgeben', () => {
            expect(importManager.parseColor(12345)).toBe(0xff4500);
        });

        it('sollte Default-Farbe bei unbekanntem Farbnamen zurueckgeben', () => {
            expect(importManager.parseColor('meineFarbe')).toBe(0xff4500);
        });

        it('sollte RGB-Farben parsen', () => {
            expect(importManager.parseColor('rgb(255, 0, 0)')).toBe(0xff0000);
        });
    });

    describe('validateAndNormalizeData()', () => {
        it('sollte gueltige Daten normalisieren', () => {
            const data = {
                nodes: [
                    { id: '1', name: 'Alice', position: { x: 0, y: 0, z: 0 } },
                ],
                edges: [
                    { source: '1', target: '2' },
                ],
            };

            const result = importManager.validateAndNormalizeData(data);

            expect(result.nodes[0].metadata).toBeDefined();
            expect(result.edges[0].name).toBeDefined();
        });

        it('sollte Fehler bei null/undefined werfen', () => {
            expect(() => importManager.validateAndNormalizeData(null)).toThrow('Invalid data format');
            expect(() => importManager.validateAndNormalizeData(undefined)).toThrow('Invalid data format');
        });

        it('sollte Fehler bei Nicht-Objekt werfen', () => {
            expect(() => importManager.validateAndNormalizeData('string')).toThrow('Invalid data format');
        });

        it('sollte fehlende Metadaten mit Defaults fuellen', () => {
            const result = importManager.validateAndNormalizeData({ nodes: [], edges: [] });

            expect(result.metadata).toBeDefined();
            expect(result.metadata.type).toBe('imported');
        });

        it('sollte Edge ohne source/target ablehnen', () => {
            expect(() => importManager.validateAndNormalizeData({
                nodes: [],
                edges: [{ weight: 1 }],
            })).toThrow('missing source or target');
        });
    });

    describe('GEXF Parser', () => {
        it('sollte ein einfaches GEXF-Dokument parsen', () => {
            const gexf = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">
  <graph mode="static" defaultedgetype="undirected">
    <nodes>
      <node id="1" label="Alice"/>
      <node id="2" label="Bob"/>
    </nodes>
    <edges>
      <edge id="e1" source="1" target="2" weight="0.5"/>
    </edges>
  </graph>
</gexf>`;

            const result = importManager.parseGEXF(gexf);

            expect(result.nodes).toHaveLength(2);
            expect(result.edges).toHaveLength(1);
            expect(result.nodes[0].name).toBe('Alice');
            expect(result.edges[0].weight).toBe(0.5);
        });

        it('sollte Fehler bei fehlendem gexf-Element werfen', () => {
            const xml = '<?xml version="1.0"?><root></root>';

            expect(() => importManager.parseGEXF(xml)).toThrow('missing gexf root element');
        });
    });

    describe('GraphML Parser', () => {
        it('sollte ein einfaches GraphML-Dokument parsen', () => {
            const graphml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="name" for="node" attr.name="name" attr.type="string"/>
  <graph id="G" edgedefault="undirected">
    <node id="1">
      <data key="name">Alice</data>
    </node>
    <node id="2">
      <data key="name">Bob</data>
    </node>
    <edge id="e1" source="1" target="2"/>
  </graph>
</graphml>`;

            const result = importManager.parseGraphML(graphml);

            expect(result.nodes).toHaveLength(2);
            expect(result.edges).toHaveLength(1);
            expect(result.nodes[0].name).toBe('Alice');
        });

        it('sollte Fehler bei fehlendem graphml-Element werfen', () => {
            const xml = '<?xml version="1.0"?><root></root>';

            expect(() => importManager.parseGraphML(xml)).toThrow('missing graphml root element');
        });
    });
});
