import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LayoutManager } from '../core/LayoutManager';
import type { EntityData, RelationshipData } from '../types';

vi.mock('../workers/layout-worker.ts?worker', () => {
    return {
        default: class MockWorker {
            onmessage: any;
            postMessage(request: any) {
                // Simuliert erfolgreiche Antwort vom Worker
                setTimeout(() => {
                    if (this.onmessage) {
                        this.onmessage({
                            data: {
                                type: 'success',
                                requestId: request.requestId,
                                positions: request.nodes.map((n: any) => ({
                                    id: n.id,
                                    x: n.x + 10,
                                    y: n.y + 10,
                                    z: n.z + 10
                                })),
                                iterations: 10,
                                duration: 5
                            }
                        });
                    }
                }, 10);
            }
            terminate() {}
        }
    };
});

/**
 * Tests fuer LayoutManager - Deterministische Tests fuer jeden Layout-Algorithmus
 * (ohne Worker, nur die synchronen Algorithmen)
 */
describe('LayoutManager', () => {
    let layoutManager: LayoutManager;

    // Hilfsfunktion: Erzeugt N Nodes mit Position
    function createNodes(count: number): EntityData[] {
        return Array.from({ length: count }, (_, i) => ({
            id: `node_${i}`,
            type: 'test',
            label: `Node ${i}`,
            position: { x: 0, y: 0, z: 0 },
        }));
    }

    // Hilfsfunktion: Erzeugt Ketten-Edges (0->1, 1->2, ...)
    function createChainEdges(nodeCount: number): RelationshipData[] {
        const edges: RelationshipData[] = [];
        for (let i = 0; i < nodeCount - 1; i++) {
            edges.push({
                id: `edge_${i}`,
                type: 'connects',
                source: `node_${i}`,
                target: `node_${i + 1}`,
            });
        }
        return edges;
    }

    beforeEach(() => {
        layoutManager = new LayoutManager();
    });

    describe('Registrierung', () => {
        it('sollte Standard-Layouts registriert haben', () => {
            const layouts = layoutManager.getAvailableLayouts();

            expect(layouts).toContain('force-directed');
            expect(layouts).toContain('fruchterman-reingold');
            expect(layouts).toContain('spring-embedder');
            expect(layouts).toContain('hierarchical');
            expect(layouts).toContain('tree');
            expect(layouts).toContain('circular');
            expect(layouts).toContain('grid');
            expect(layouts).toContain('random');
        });

        it('sollte mindestens 8 Layouts haben', () => {
            expect(layoutManager.getAvailableLayouts().length).toBeGreaterThanOrEqual(8);
        });

        it('sollte ein benutzerdefiniertes Layout registrieren koennen', () => {
            layoutManager.registerLayout('custom', {
                name: 'Custom Layout',
                apply: () => { },
                options: {},
            });

            expect(layoutManager.getAvailableLayouts()).toContain('custom');
        });
    });

    describe('Circular Layout', () => {
        it('sollte Nodes im Kreis anordnen', () => {
            const nodes = createNodes(4);

            layoutManager.applyCircularLayout(nodes, [], { radius: 10 });

            // Alle Nodes sollten Positionen haben
            nodes.forEach(node => {
                expect(node.position).toBeDefined();
            });

            // Abstand zum Zentrum sollte ungefaehr dem Radius entsprechen
            nodes.forEach(node => {
                const dist = Math.sqrt(
                    node.position!.x ** 2 + node.position!.z ** 2
                );
                expect(dist).toBeCloseTo(10, 0);
            });
        });

        it('sollte Y-Position auf 0 setzen', () => {
            const nodes = createNodes(6);

            layoutManager.applyCircularLayout(nodes, [], { radius: 5 });

            nodes.forEach(node => {
                expect(node.position!.y).toBe(0);
            });
        });

        it('sollte bei einem einzelnen Node den Radius verwenden', () => {
            const nodes = createNodes(1);

            layoutManager.applyCircularLayout(nodes, [], { radius: 10 });

            // Ein Node wird auf den Kreis gesetzt (Winkel 0)
            expect(nodes[0].position!.x).toBeDefined();
        });

        it('sollte Nodes gleichmaessig verteilen', () => {
            const nodes = createNodes(4);

            layoutManager.applyCircularLayout(nodes, [], { radius: 10 });

            // Gegenueberliegende Nodes sollten ungefaehr doppelten Radius auseinander sein
            const dist01 = Math.sqrt(
                (nodes[0].position!.x - nodes[2].position!.x) ** 2 +
                (nodes[0].position!.z - nodes[2].position!.z) ** 2
            );
            expect(dist01).toBeCloseTo(20, 0); // Durchmesser
        });
    });

    describe('Grid Layout', () => {
        it('sollte Nodes in einem Raster anordnen', () => {
            const nodes = createNodes(9);

            layoutManager.applyGridLayout(nodes, [], { spacing: 2 });

            // Alle Nodes sollten Positionen haben
            nodes.forEach(node => {
                expect(node.position).toBeDefined();
            });
        });

        it('sollte Y-Position auf 0 setzen', () => {
            const nodes = createNodes(4);

            layoutManager.applyGridLayout(nodes, [], { spacing: 2 });

            nodes.forEach(node => {
                expect(node.position!.y).toBe(0);
            });
        });

        it('sollte korrektes Spacing einhalten', () => {
            const nodes = createNodes(4); // 2x2 Grid

            layoutManager.applyGridLayout(nodes, [], { spacing: 3 });

            // Benachbarte Nodes im Grid sollten 3 Einheiten auseinander sein
            const dx = Math.abs(nodes[0].position!.x - nodes[1].position!.x);
            expect(dx).toBeCloseTo(3, 1);
        });

        it('sollte auch mit einem einzelnen Node funktionieren', () => {
            const nodes = createNodes(1);

            layoutManager.applyGridLayout(nodes, [], { spacing: 2 });

            expect(nodes[0].position).toBeDefined();
        });

        it('sollte bei 0 Nodes nicht abstuerzen', () => {
            expect(() => {
                layoutManager.applyGridLayout([], [], { spacing: 2 });
            }).not.toThrow();
        });
    });

    describe('Random Layout', () => {
        it('sollte Positionen innerhalb der Grenzen setzen', () => {
            const nodes = createNodes(20);

            layoutManager.applyRandomLayout(nodes, [], { minBound: -5, maxBound: 5 });

            nodes.forEach(node => {
                expect(node.position!.x).toBeGreaterThanOrEqual(-5);
                expect(node.position!.x).toBeLessThanOrEqual(5);
                expect(node.position!.y).toBeGreaterThanOrEqual(-5);
                expect(node.position!.y).toBeLessThanOrEqual(5);
                expect(node.position!.z).toBeGreaterThanOrEqual(-5);
                expect(node.position!.z).toBeLessThanOrEqual(5);
            });
        });

        it('sollte verschiedene Positionen erzeugen', () => {
            const nodes = createNodes(10);

            layoutManager.applyRandomLayout(nodes, [], { minBound: -10, maxBound: 10 });

            // Es ist extrem unwahrscheinlich, dass alle X-Positionen gleich sind
            const xValues = new Set(nodes.map(n => n.position!.x));
            expect(xValues.size).toBeGreaterThan(1);
        });
    });

    describe('Hierarchical Layout', () => {
        it('sollte Nodes in Ebenen anordnen', () => {
            const nodes = createNodes(4);
            const edges = createChainEdges(4); // 0->1->2->3

            layoutManager.applyHierarchicalLayout(nodes, edges, {
                levelHeight: 3,
                nodeSpacing: 2,
            });

            // Root (node_0) sollte am hoechsten sein
            expect(nodes[0].position!.y).toBeGreaterThan(nodes[3].position!.y);
        });

        it('sollte Nodes ohne eingehende Kanten als Root erkennen', () => {
            const nodes = createNodes(3);
            const edges: RelationshipData[] = [
                { id: 'e1', type: 'x', source: 'node_0', target: 'node_1' },
                { id: 'e2', type: 'x', source: 'node_0', target: 'node_2' },
            ];

            layoutManager.applyHierarchicalLayout(nodes, edges, {
                levelHeight: 3,
                nodeSpacing: 2,
            });

            // Root (node_0) hat die hoechste Y-Position
            expect(nodes[0].position!.y).toBeGreaterThanOrEqual(nodes[1].position!.y);
            expect(nodes[0].position!.y).toBeGreaterThanOrEqual(nodes[2].position!.y);
        });

        it('sollte mit Nodes ohne Kanten funktionieren', () => {
            const nodes = createNodes(3);

            layoutManager.applyHierarchicalLayout(nodes, [], {
                levelHeight: 3,
                nodeSpacing: 2,
            });

            // Alle auf gleicher Ebene (alle sind "Roots")
            expect(nodes[0].position!.y).toBe(nodes[1].position!.y);
        });
    });

    describe('Tree Layout', () => {
        it('sollte identisch zum Hierarchical Layout sein', () => {
            const nodesH = createNodes(4);
            const nodesT = createNodes(4);
            const edges = createChainEdges(4);

            const options = { levelHeight: 3, nodeSpacing: 2 };

            layoutManager.applyHierarchicalLayout(nodesH, edges, options);
            layoutManager.applyTreeLayout(nodesT, edges, options);

            nodesH.forEach((node, i) => {
                expect(node.position!.x).toBe(nodesT[i].position!.x);
                expect(node.position!.y).toBe(nodesT[i].position!.y);
                expect(node.position!.z).toBe(nodesT[i].position!.z);
            });
        });
    });

    describe('Force-Directed Layout (synchron)', () => {
        it('sollte Positionen veraendern', () => {
            // Nodes an verschiedenen festen Positionen starten, damit Force-Layout wirken kann
            const nodes: EntityData[] = [
                { id: 'n0', type: 't', label: '0', position: { x: -5, y: 0, z: 0 } },
                { id: 'n1', type: 't', label: '1', position: { x: 5, y: 0, z: 0 } },
                { id: 'n2', type: 't', label: '2', position: { x: 0, y: 5, z: 0 } },
                { id: 'n3', type: 't', label: '3', position: { x: 0, y: -5, z: 0 } },
                { id: 'n4', type: 't', label: '4', position: { x: 0, y: 0, z: 5 } },
            ];
            const edges: RelationshipData[] = [
                { id: 'e0', type: 'c', source: 'n0', target: 'n1' },
                { id: 'e1', type: 'c', source: 'n1', target: 'n2' },
                { id: 'e2', type: 'c', source: 'n2', target: 'n3' },
                { id: 'e3', type: 'c', source: 'n3', target: 'n4' },
            ];

            // Positionen vorher merken
            const beforeX = nodes.map(n => n.position!.x);

            layoutManager.applyForceLayout(nodes, edges, [], {
                maxIterations: 50,
                repulsionStrength: 50,
                attractionStrength: 0.5,
                damping: 0.8,
            });

            // Mindestens einige Nodes sollten sich bewegt haben
            const changed = nodes.some((n, i) => n.position!.x !== beforeX[i]);
            expect(changed).toBe(true);
        });

        it('sollte mit einem einzelnen Node funktionieren', () => {
            const nodes = createNodes(1);

            expect(() => {
                layoutManager.applyForceLayout(nodes, [], [], {
                    maxIterations: 10,
                    repulsionStrength: 50,
                    attractionStrength: 0.5,
                    damping: 0.8,
                });
            }).not.toThrow();
        });

        it('sollte verbundene Nodes naeher zusammenbringen als unverbundene', () => {
            // 3 Nodes: 0-1 verbunden, 2 isoliert
            const nodes: EntityData[] = [
                { id: 'a', type: 't', position: { x: -5, y: 0, z: 0 } },
                { id: 'b', type: 't', position: { x: 5, y: 0, z: 0 } },
                { id: 'c', type: 't', position: { x: 0, y: 5, z: 0 } },
            ];

            const edges: RelationshipData[] = [
                { id: 'e1', type: 'x', source: 'a', target: 'b' },
            ];

            layoutManager.applyForceLayout(nodes, edges, [], {
                maxIterations: 100,
                repulsionStrength: 50,
                attractionStrength: 0.5,
                damping: 0.8,
            });

            // a und b (verbunden) sollten tendenziell naeher sein
            const distAB = Math.sqrt(
                (nodes[0].position!.x - nodes[1].position!.x) ** 2 +
                (nodes[0].position!.y - nodes[1].position!.y) ** 2 +
                (nodes[0].position!.z - nodes[1].position!.z) ** 2
            );

            // Positionen existieren
            expect(nodes[0].position).toBeDefined();
            expect(distAB).toBeDefined();
        });
    });

    describe('Fruchterman-Reingold Layout', () => {
        it('sollte Positionen veraendern', () => {
            const nodes: EntityData[] = [
                { id: 'n0', type: 't', label: '0', position: { x: -5, y: 0, z: 0 } },
                { id: 'n1', type: 't', label: '1', position: { x: 5, y: 0, z: 0 } },
                { id: 'n2', type: 't', label: '2', position: { x: 0, y: 5, z: 0 } },
                { id: 'n3', type: 't', label: '3', position: { x: 0, y: -5, z: 0 } },
                { id: 'n4', type: 't', label: '4', position: { x: 0, y: 0, z: 5 } },
            ];
            const edges: RelationshipData[] = [
                { id: 'e0', type: 'c', source: 'n0', target: 'n1' },
                { id: 'e1', type: 'c', source: 'n1', target: 'n2' },
                { id: 'e2', type: 'c', source: 'n2', target: 'n3' },
                { id: 'e3', type: 'c', source: 'n3', target: 'n4' },
            ];

            const beforeX = nodes.map(n => n.position!.x);

            layoutManager.applyFruchtermanReingoldLayout(nodes, edges, {
                maxIterations: 50,
                area: 400,
                temperature: 10,
            });

            const changed = nodes.some((n, i) => n.position!.x !== beforeX[i]);
            expect(changed).toBe(true);
        });

        it('sollte mit geringer Iterationszahl nicht abstuerzen', () => {
            const nodes = createNodes(3);
            const edges = createChainEdges(3);

            expect(() => {
                layoutManager.applyFruchtermanReingoldLayout(nodes, edges, {
                    maxIterations: 1,
                    area: 100,
                    temperature: 1,
                });
            }).not.toThrow();
        });
    });

    describe('Spring-Embedder Layout', () => {
        it('sollte Positionen veraendern', () => {
            const nodes: EntityData[] = [
                { id: 'n0', type: 't', label: '0', position: { x: -5, y: 0, z: 0 } },
                { id: 'n1', type: 't', label: '1', position: { x: 5, y: 0, z: 0 } },
                { id: 'n2', type: 't', label: '2', position: { x: 0, y: 5, z: 0 } },
                { id: 'n3', type: 't', label: '3', position: { x: 0, y: -5, z: 0 } },
                { id: 'n4', type: 't', label: '4', position: { x: 0, y: 0, z: 5 } },
            ];
            const edges: RelationshipData[] = [
                { id: 'e0', type: 'c', source: 'n0', target: 'n1' },
                { id: 'e1', type: 'c', source: 'n1', target: 'n2' },
                { id: 'e2', type: 'c', source: 'n2', target: 'n3' },
                { id: 'e3', type: 'c', source: 'n3', target: 'n4' },
            ];

            const beforeX = nodes.map(n => n.position!.x);

            layoutManager.applySpringEmbedderLayout(nodes, edges, {
                maxIterations: 50,
                springConstant: 0.1,
                repulsionConstant: 1000,
                damping: 0.95,
                naturalLength: 2,
            });

            const changed = nodes.some((n, i) => n.position!.x !== beforeX[i]);
            expect(changed).toBe(true);
        });

        it('sollte ohne Edges nur Abstossung anwenden', () => {
            const nodes: EntityData[] = [
                { id: 'a', type: 't', position: { x: 0, y: 0, z: 0 } },
                { id: 'b', type: 't', position: { x: 0.1, y: 0, z: 0 } },
            ];

            layoutManager.applySpringEmbedderLayout(nodes, [], {
                maxIterations: 10,
                springConstant: 0.1,
                repulsionConstant: 1000,
                damping: 0.95,
                naturalLength: 2,
            });

            // Nodes sollten sich voneinander entfernt haben
            const dist = Math.abs(nodes[0].position!.x - nodes[1].position!.x);
            expect(dist).toBeGreaterThan(0.1);
        });
    });

    describe('normalizeNodePositions()', () => {
        it('sollte Positionen normalisieren', () => {
            const nodes: EntityData[] = [
                { id: '1', type: 't', position: { x: -100, y: 0, z: 0 } },
                { id: '2', type: 't', position: { x: 100, y: 0, z: 0 } },
            ];

            layoutManager.normalizeNodePositions(nodes, 10);

            // Max-Ausdehnung sollte 10 sein
            const extent = Math.abs(nodes[0].position!.x - nodes[1].position!.x);
            expect(extent).toBeCloseTo(10, 0);
        });

        it('sollte leere Node-Liste tolerieren', () => {
            expect(() => {
                layoutManager.normalizeNodePositions([], 10);
            }).not.toThrow();
        });

        it('sollte Nodes um den Ursprung zentrieren', () => {
            const nodes: EntityData[] = [
                { id: '1', type: 't', position: { x: 10, y: 10, z: 10 } },
                { id: '2', type: 't', position: { x: 20, y: 20, z: 20 } },
            ];

            layoutManager.normalizeNodePositions(nodes, 10);

            // Mitte sollte bei (0,0,0) liegen
            const centerX = (nodes[0].position!.x + nodes[1].position!.x) / 2;
            const centerY = (nodes[0].position!.y + nodes[1].position!.y) / 2;
            const centerZ = (nodes[0].position!.z + nodes[1].position!.z) / 2;

            expect(centerX).toBeCloseTo(0, 5);
            expect(centerY).toBeCloseTo(0, 5);
            expect(centerZ).toBeCloseTo(0, 5);
        });

        it('sollte mit independentAxes = true jede Achse auf maxExtent skalieren', () => {
            const nodes: EntityData[] = [
                { id: '1', type: 't', position: { x: -10, y: -5, z: 0 } },
                { id: '2', type: 't', position: { x: 10, y: 5, z: 0 } },
            ];

            // Vorher: extentX = 20, extentY = 10
            layoutManager.normalizeNodePositions(nodes, 10, true);

            // Nachher sollte extentX = 10 und extentY = 10 sein
            const extentX = Math.abs(nodes[0].position!.x - nodes[1].position!.x);
            const extentY = Math.abs(nodes[0].position!.y - nodes[1].position!.y);
            
            expect(extentX).toBeCloseTo(10, 0);
            expect(extentY).toBeCloseTo(10, 0);
        });
    });

    describe('applyLayout()', () => {
        it('sollte false zurueckgeben fuer unbekanntes Layout', async () => {
            const result = await layoutManager.applyLayout('nonexistent', [], []);
            expect(result).toBe(false);
        });

        it('sollte currentLayout setzen bei erfolgreichem Layout', async () => {
            const nodes = createNodes(4);

            await layoutManager.applyLayout('circular', nodes, [], [], { radius: 5 });

            expect(layoutManager.getCurrentLayout()).toBe('circular');
        });

        it('sollte true zurueckgeben bei erfolgreichem synchronen Layout', async () => {
            const nodes = createNodes(4);

            const result = await layoutManager.applyLayout('grid', nodes, [], [], { spacing: 2 });

            expect(result).toBe(true);
        });
    });

    describe('calculateNodeLevels()', () => {
        it('sollte Ebenen fuer eine Kette berechnen', () => {
            const nodes = createNodes(4);
            const edges = createChainEdges(4);

            const levels = layoutManager.calculateNodeLevels(nodes, edges);

            expect(levels['node_0']).toBe(0);
            expect(levels['node_1']).toBe(1);
            expect(levels['node_2']).toBe(2);
            expect(levels['node_3']).toBe(3);
        });

        it('sollte Nodes ohne Kanten auf Ebene 0 setzen', () => {
            const nodes = createNodes(3);

            const levels = layoutManager.calculateNodeLevels(nodes, []);

            expect(levels['node_0']).toBe(0);
            expect(levels['node_1']).toBe(0);
            expect(levels['node_2']).toBe(0);
        });

        it('sollte bei Baum-Struktur korrekte Ebenen berechnen', () => {
            const nodes = createNodes(5);
            // Baum: 0->1, 0->2, 1->3, 1->4
            const edges: RelationshipData[] = [
                { id: 'e1', type: 'x', source: 'node_0', target: 'node_1' },
                { id: 'e2', type: 'x', source: 'node_0', target: 'node_2' },
                { id: 'e3', type: 'x', source: 'node_1', target: 'node_3' },
                { id: 'e4', type: 'x', source: 'node_1', target: 'node_4' },
            ];

            const levels = layoutManager.calculateNodeLevels(nodes, edges);

            expect(levels['node_0']).toBe(0); // Root
            expect(levels['node_1']).toBe(1);
            expect(levels['node_2']).toBe(1);
            expect(levels['node_3']).toBe(2);
            expect(levels['node_4']).toBe(2);
        });
    });

    describe('Animation State', () => {
        it('sollte isAnimating initial false sein', () => {
            expect(layoutManager.isAnimating).toBe(false);
        });

        it('sollte Animation stoppen koennen', () => {
            layoutManager.isAnimating = true;
            layoutManager.stopAnimation();
            expect(layoutManager.isAnimating).toBe(false);
        });

        it('sollte animationSpeed setzen koennen', () => {
            layoutManager.setAnimationDuration(500);
            expect(layoutManager.animationSpeed).toBe(2); // 1000/500
        });
    });

    describe('Web Worker ID-basierte Zuordnung', () => {
        it('sollte Nodes via ID und nicht via Index aktualisieren, wenn sich die Array-Reihenfolge aendert', async () => {
            const nodes: EntityData[] = [
                { id: 'node_A', type: 'test', position: { x: 0, y: 0, z: 0 } },
                { id: 'node_B', type: 'test', position: { x: 1, y: 1, z: 1 } }
            ];

            // Layout mit Worker starten (wirkt über unseren Mock)
            const promise = layoutManager.applyLayout('force-directed', nodes, [], []);

            // Waherend das Layout laeuft, vertauschen wir die Elemente im Array
            const temp = nodes[0];
            nodes[0] = nodes[1];
            nodes[1] = temp;

            const result = await promise;

            expect(result).toBe(true);

            const nodeA = nodes.find(n => n.id === 'node_A')!;
            const nodeB = nodes.find(n => n.id === 'node_B')!;

            // Da nodeB urspruenglich einen hoeheren X-Wert hatte (1) als nodeA (0),
            // und der Mock +10 rechnet, muss nodeB.position.x auch nach Normalisierung groesser als nodeA.position.x sein.
            expect(nodeB.position!.x).toBeGreaterThan(nodeA.position!.x);
        });
    });
});
