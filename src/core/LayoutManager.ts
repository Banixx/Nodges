/**
 * LayoutManager - Zentrale Verwaltung aller Layout-Algorithmen fuer Nodges
 */

// @ts-ignore
import LayoutWorker from '../workers/layout-worker.js?worker';
import { EntityData, RelationshipData, NodeData, EdgeData } from '../types';

interface LayoutOptions {
    [key: string]: any;
}

interface LayoutDefinition {
    name: string;
    apply: (nodes: EntityData[], edges: RelationshipData[], options: LayoutOptions) => void | Promise<boolean>;
    options: LayoutOptions;
}

export class LayoutManager {
    private layouts: Map<string, LayoutDefinition>;
    private currentLayout: string | null;
    public isAnimating: boolean;
    public animationSpeed: number;

    constructor() {
        this.layouts = new Map();
        this.currentLayout = null;
        this.isAnimating = false;
        this.animationSpeed = 1.0;

        // Registriere Standard-Layouts
        this.registerDefaultLayouts();
    }

    registerDefaultLayouts() {
        // Force-Directed Layout
        this.registerLayout('force-directed', {
            name: 'Force-Directed',
            apply: (nodes, edges, options) => this.applyForceLayout(nodes, edges, options),
            options: {
                maxIterations: 100,
                repulsionStrength: 50,
                attractionStrength: 0.5,
                damping: 0.8
            }
        });

        // Fruchterman-Reingold Layout
        this.registerLayout('fruchterman-reingold', {
            name: 'Fruchterman-Reingold',
            apply: (nodes, edges, options) => this.applyFruchtermanReingoldLayout(nodes, edges, options),
            options: {
                maxIterations: 500,
                area: 400,
                temperature: 10
            }
        });

        // Spring-Embedder Layout
        this.registerLayout('spring-embedder', {
            name: 'Spring-Embedder',
            apply: (nodes, edges, options) => this.applySpringEmbedderLayout(nodes, edges, options),
            options: {
                maxIterations: 1000,
                springConstant: 0.1,
                repulsionConstant: 1000,
                damping: 0.95,
                naturalLength: 2
            }
        });

        // Hierarchical Layout
        this.registerLayout('hierarchical', {
            name: 'Hierarchical',
            apply: (nodes, edges, options) => this.applyHierarchicalLayout(nodes, edges, options),
            options: {
                levelHeight: 3,
                nodeSpacing: 2
            }
        });

        // Tree Layout
        this.registerLayout('tree', {
            name: 'Tree',
            apply: (nodes, edges, options) => this.applyTreeLayout(nodes, edges, options),
            options: {
                levelHeight: 3,
                nodeSpacing: 2
            }
        });

        // Circular Layout
        this.registerLayout('circular', {
            name: 'Circular',
            apply: (nodes, edges, options) => this.applyCircularLayout(nodes, edges, options),
            options: {
                radius: 10,
                height: 0
            }
        });

        // Grid Layout
        this.registerLayout('grid', {
            name: 'Grid',
            apply: (nodes, edges, options) => this.applyGridLayout(nodes, edges, options),
            options: {
                spacing: 2
            }
        });

        // Random Layout
        this.registerLayout('random', {
            name: 'Random',
            apply: (nodes, edges, options) => this.applyRandomLayout(nodes, edges, options),
            options: {
                minBound: -10,
                maxBound: 10
            }
        });
    }

    registerLayout(id: string, layout: LayoutDefinition) {
        this.layouts.set(id, layout);
    }

    async applyLayout(layoutId: string, nodes: EntityData[], edges: RelationshipData[], options: LayoutOptions = {}): Promise<boolean> {
        const layout = this.layouts.get(layoutId);
        if (!layout) {
            console.warn(`Layout ${layoutId} nicht gefunden`);
            return false;
        }

        this.currentLayout = layoutId;
        const mergedOptions = { ...layout.options, ...options };

        try {
            // Verwende Web Worker fr rechenintensive Layouts
            if (['force-directed', 'fruchterman-reingold', 'spring-embedder'].includes(layoutId)) {
                return await this.applyLayoutWithWorker(layoutId, nodes, edges, mergedOptions) as boolean;
            } else {
                layout.apply(nodes, edges, mergedOptions);
                return true;
            }
        } catch (error) {
            console.error(`Fehler beim Anwenden des Layouts ${layout.name}:`, error);
            return false;
        }
    }

    async applyLayoutWithWorker(layoutId: string, nodes: EntityData[], edges: RelationshipData[], options: LayoutOptions): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const worker = new LayoutWorker();

            // Ensure all nodes have positions
            nodes.forEach(node => {
                if (!node.position) node.position = { x: 0, y: 0, z: 0 };
            });

            // Map node IDs to indices for the worker
            const nodeIndexMap = new Map<string | number, number>();
            nodes.forEach((node, index) => {
                if (node.id !== undefined) nodeIndexMap.set(node.id, index);
                // Also map index if available, just in case
                if (node.index !== undefined) nodeIndexMap.set(node.index, index);
            });

            worker.postMessage({
                nodes: nodes.map(node => ({
                    x: node.position?.x || 0,
                    y: node.position?.y || 0,
                    z: node.position?.z || 0,
                    index: nodeIndexMap.get(node.id) !== undefined ? nodeIndexMap.get(node.id) : nodes.indexOf(node)
                })),
                edges: edges.map(edge => {
                    // Resolve start/end to indices
                    let startIndex = edge.start;
                    let endIndex = edge.end;

                    if (typeof startIndex !== 'number') {
                        startIndex = nodeIndexMap.get(startIndex) as number;
                    }
                    if (typeof endIndex !== 'number') {
                        endIndex = nodeIndexMap.get(endIndex) as number;
                    }

                    // Fallback if mapping failed (should not happen if data is consistent)
                    if (startIndex === undefined) startIndex = 0;
                    if (endIndex === undefined) endIndex = 0;

                    return {
                        start: startIndex,
                        end: endIndex
                    };
                }),
                algorithm: layoutId,
                options: options
            });

            worker.onmessage = (event: MessageEvent) => {
                const positions = event.data.positions;
                if (positions && Array.isArray(positions)) {
                    positions.forEach((pos: any, index: number) => {
                        if (pos && nodes[index]) {
                            if (!nodes[index].position) nodes[index].position = { x: 0, y: 0, z: 0 };
                            nodes[index].position!.x = pos.x || 0;
                            nodes[index].position!.y = pos.y || 0;
                            nodes[index].position!.z = pos.z || 0;
                        }
                    });
                }

                this.normalizeNodePositions(nodes, 10);
                worker.terminate();
                resolve(true);
            };

            worker.onerror = (error: ErrorEvent) => {
                console.error('Worker-Fehler:', error);
                worker.terminate();
                reject(false);
            };
        });
    }

    applyForceLayout(nodes: EntityData[], edges: RelationshipData[], options: LayoutOptions = {}) {
        const {
            maxIterations = 100,
            repulsionStrength = 50,
            attractionStrength = 0.5,
            damping = 0.8
        } = options;

        // Initialisiere Positionen, falls nicht vorhanden
        nodes.forEach(node => {
            if (!node.position) node.position = { x: 0, y: 0, z: 0 };
        });

        for (let i = 0; i < maxIterations; i++) {
            // Repulsion zwischen allen Knoten
            for (let j = 0; j < nodes.length; j++) {
                for (let k = j + 1; k < nodes.length; k++) {
                    const node1 = nodes[j];
                    const node2 = nodes[k];

                    const dx = node2.position!.x - node1.position!.x;
                    const dy = node2.position!.y - node1.position!.y;
                    const dz = node2.position!.z - node1.position!.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;

                    const force = repulsionStrength / (distance * distance);
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    const fz = (dz / distance) * force;

                    node1.position!.x -= fx * damping;
                    node1.position!.y -= fy * damping;
                    node1.position!.z -= fz * damping;
                    node2.position!.x += fx * damping;
                    node2.position!.y += fy * damping;
                    node2.position!.z += fz * damping;
                }
            }

            // Attraction entlang Kanten
            edges.forEach(edge => {
                // Sicherstellen, dass die Knotenreferenzen korrekt sind
                // Note: In non-worker layout, edge.start/end might be indices OR IDs.
                // We need to handle both or assume indices if pre-processed.
                // For now, assuming indices for simple implementation or IDs if mapped.
                // But wait, the worker logic maps them. The local logic here assumes indices?
                // The original code used: const node1 = nodes[edge.start];
                // This implies edge.start is an index.
                // But App.ts passes objects with IDs.
                // If we run locally, we need to map too!
                // The original JS code was likely failing locally too if IDs were used.
                // I should add mapping here too.

                let startIndex = edge.source;
                let endIndex = edge.target;

                // Check for EntityData
                let node1: EntityData | undefined;
                let node2: EntityData | undefined;

                if (typeof startIndex === 'number') {
                    // @ts-ignore
                    node1 = nodes[startIndex];
                } else {
                    node1 = nodes.find(n => n.id === startIndex);
                }

                if (typeof endIndex === 'number') {
                    // @ts-ignore
                    node2 = nodes[endIndex];
                } else {
                    node2 = nodes.find(n => n.id === endIndex);
                }

                if (node1 && node2 && node1.position && node2.position) {
                    const dx = node2.position.x - node1.position.x;
                    const dy = node2.position.y - node1.position.y;
                    const dz = node2.position.z - node1.position.z;

                    const fx = dx * attractionStrength;
                    const fy = dy * attractionStrength;
                    const fz = dz * attractionStrength;

                    node1.position.x += fx;
                    node1.position.y += fy;
                    node1.position.z += fz;
                    node2.position.x -= fx;
                    node2.position.y -= fy;
                    node2.position.z -= fz;
                }
            });
        }

        // Normalisiere Positionen um das Netzwerk kompakt zu halten
        this.normalizeNodePositions(nodes, 10); // Maximal 10 Einheiten Ausdehnung
    }

    applyCircularLayout(nodes: EntityData[], _edges: RelationshipData[], options: LayoutOptions) {
        const { radius } = options;
        const angleStep = (2 * Math.PI) / nodes.length;

        nodes.forEach((node, index) => {
            if (!node.position) node.position = { x: 0, y: 0, z: 0 };
            const angle = index * angleStep;
            node.position.x = Math.cos(angle) * radius;
            node.position.y = 0;
            node.position.z = Math.sin(angle) * radius;
        });
    }

    applyGridLayout(nodes: EntityData[], _edges: RelationshipData[], options: LayoutOptions) {
        const { spacing } = options;
        const gridSize = Math.ceil(Math.sqrt(nodes.length));

        nodes.forEach((node, index) => {
            if (!node.position) node.position = { x: 0, y: 0, z: 0 };
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;

            node.position.x = (col - gridSize / 2) * spacing;
            node.position.y = 0;
            node.position.z = (row - gridSize / 2) * spacing;
        });
    }

    applyRandomLayout(nodes: EntityData[], _edges: RelationshipData[], options: LayoutOptions) {
        const { minBound, maxBound } = options;
        const range = maxBound - minBound;

        nodes.forEach(node => {
            node.position = {
                x: minBound + Math.random() * range,
                y: minBound + Math.random() * range,
                z: minBound + Math.random() * range
            };
        });
    }

    applyFruchtermanReingoldLayout(nodes: EntityData[], edges: RelationshipData[], options: LayoutOptions = {}) {
        const {
            maxIterations = 500,
            area = 400,
            temperature = 10
        } = options;
        const k = Math.sqrt(area / nodes.length);
        let temp = temperature;

        // Initialisiere displacement vectors
        nodes.forEach(node => {
            node.disp = { x: 0, y: 0, z: 0 };
        });

        for (let iter = 0; iter < maxIterations; iter++) {
            // Calculate repulsive forces
            nodes.forEach(v => {
                v.disp = { x: 0, y: 0, z: 0 };
                nodes.forEach(u => {
                    if (v !== u && v.position && u.position) {
                        const dx = v.position.x - u.position.x;
                        const dy = v.position.y - u.position.y;
                        const dz = v.position.z - u.position.z;
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;

                        const force = (k * k) / distance;
                        v.disp.x += (dx / distance) * force;
                        v.disp.y += (dy / distance) * force;
                        v.disp.z += (dz / distance) * force;
                    }
                });
            });

            // Calculate attractive forces
            edges.forEach(edge => {
                // Handle ID vs Index
                let v: EntityData | undefined;
                let u: EntityData | undefined;

                if (typeof edge.source === 'number') {
                    // @ts-ignore
                    v = nodes[edge.source];
                } else {
                    v = nodes.find(n => n.id === edge.source);
                }

                if (typeof edge.target === 'number') {
                    // @ts-ignore
                    u = nodes[edge.target];
                } else {
                    u = nodes.find(n => n.id === edge.target);
                }

                if (v && u && v.position && u.position) {
                    const dx = v.position.x - u.position.x;
                    const dy = v.position.y - u.position.y;
                    const dz = v.position.z - u.position.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;

                    const force = (distance * distance) / k;
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    const fz = (dz / distance) * force;

                    v.disp.x -= fx;
                    v.disp.y -= fy;
                    v.disp.z -= fz;
                    u.disp.x += fx;
                    u.disp.y += fy;
                    u.disp.z += fz;
                }
            });

            // Limit displacement and apply
            nodes.forEach(v => {
                const dispLength = Math.sqrt(v.disp.x * v.disp.x + v.disp.y * v.disp.y + v.disp.z * v.disp.z);
                const limitedLength = Math.min(dispLength, temp);

                if (dispLength > 0) {
                    if (!v.position) v.position = { x: 0, y: 0, z: 0 };
                    v.position.x += (v.disp.x / dispLength) * limitedLength;
                    v.position.y += (v.disp.y / dispLength) * limitedLength;
                    v.position.z += (v.disp.z / dispLength) * limitedLength;
                }
            });

            temp *= 0.95; // Cool down
        }

        // Normalisiere Positionen um das Netzwerk kompakt zu halten
        this.normalizeNodePositions(nodes, 10);
    }

    applySpringEmbedderLayout(nodes: EntityData[], edges: RelationshipData[], options: LayoutOptions) {
        const { maxIterations, springConstant, repulsionConstant, damping, naturalLength } = options;

        for (let iter = 0; iter < maxIterations; iter++) {
            nodes.forEach(node => {
                node.fx = 0;
                node.fy = 0;
                node.fz = 0;
            });

            // Spring forces
            edges.forEach(edge => {
                let v1: EntityData | undefined;
                let v2: EntityData | undefined;

                if (typeof edge.start === 'number') v1 = nodes[edge.start];
                else v1 = nodes.find(n => n.id === edge.start);

                if (typeof edge.end === 'number') v2 = nodes[edge.end];
                else v2 = nodes.find(n => n.id === edge.end);

                if (v1 && v2) {
                    const dx = v2.x - v1.x;
                    const dy = v2.y - v1.y;
                    const dz = v2.z - v1.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;

                    const force = springConstant * (distance - naturalLength);
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    const fz = (dz / distance) * force;

                    v1.fx += fx;
                    v1.fy += fy;
                    v1.fz += fz;
                    v2.fx -= fx;
                    v2.fy -= fy;
                    v2.fz -= fz;
                }
            });

            // Repulsion forces
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const v1 = nodes[i];
                    const v2 = nodes[j];
                    if (v1 && v2 && v1.position && v2.position) {
                        const dx = v2.position.x - v1.position.x;
                        const dy = v2.position.y - v1.position.y;
                        const dz = v2.position.z - v1.position.z;
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;

                        const force = repulsionConstant / (distance * distance);
                        const fx = (dx / distance) * force;
                        const fy = (dy / distance) * force;
                        const fz = (dz / distance) * force;

                        // @ts-ignore
                        v1.fx -= fx;
                        // @ts-ignore
                        v1.fy -= fy;
                        // @ts-ignore
                        v1.fz -= fz;
                        // @ts-ignore
                        v2.fx += fx;
                        // @ts-ignore
                        v2.fy += fy;
                        // @ts-ignore
                        v2.fz += fz;
                    }
                }
            }

            // Apply forces
            nodes.forEach(node => {
                if (node.position) {
                    // @ts-ignore (fx,fy,fz are temp props)
                    node.position.x += (node.fx || 0) * damping;
                    // @ts-ignore
                    node.position.y += (node.fy || 0) * damping;
                    // @ts-ignore
                    node.position.z += (node.fz || 0) * damping;
                }
            });
        }
    }

    applyHierarchicalLayout(nodes: EntityData[], edges: RelationshipData[], options: LayoutOptions) {
        const { levelHeight, nodeSpacing } = options;

        // Simple hierarchical layout - arrange nodes in levels
        const levels = this.calculateNodeLevels(nodes, edges);
        const maxLevel = Math.max(...Object.values(levels));

        const levelNodes: { [key: number]: EntityData[] } = {};
        nodes.forEach(node => {
            const level = levels[node.id] || 0;
            if (!levelNodes[level]) levelNodes[level] = [];
            levelNodes[level].push(node);
        });

        Object.keys(levelNodes).forEach(levelKey => {
            const level = parseInt(levelKey);
            const levelNodeArray = levelNodes[level];

            levelNodeArray.forEach((node, index) => {
                const totalWidth = (levelNodeArray.length - 1) * nodeSpacing;
                if (!node.position) node.position = { x: 0, y: 0, z: 0 };
                node.position.x = -totalWidth / 2 + index * nodeSpacing;
                node.position.y = (maxLevel - level) * levelHeight;
                node.position.z = 0;
            });
        });
    }

    applyTreeLayout(nodes: EntityData[], edges: RelationshipData[], options: LayoutOptions) {
        // Similar to hierarchical but with tree structure
        this.applyHierarchicalLayout(nodes, edges, options);
    }

    calculateNodeLevels(nodes: EntityData[], edges: RelationshipData[]) {
        const levels: { [key: string]: number } = {};
        const visited = new Set<string | number>();
        const adjacencyList: { [key: string]: (string | number)[] } = {};

        // Build adjacency list
        nodes.forEach(node => {
            adjacencyList[node.id] = [];
            levels[node.id] = 0;
        });

        edges.forEach(edge => {
            // Assuming IDs for hierarchical layout for now, or need to resolve
            const startId = typeof edge.source === 'number' ? nodes[edge.source]?.id : edge.source;
            const endId = typeof edge.target === 'number' ? nodes[edge.target]?.id : edge.target;

            if (startId !== undefined && endId !== undefined && adjacencyList[startId]) {
                adjacencyList[startId].push(endId);
            }
        });

        // Find root nodes (nodes with no incoming edges)
        const incomingCount: { [key: string]: number } = {};
        nodes.forEach(node => incomingCount[node.id] = 0);
        edges.forEach(edge => {
            const endId = typeof edge.target === 'number' ? nodes[edge.target]?.id : edge.target;
            if (endId !== undefined) incomingCount[endId]++;
        });


        const roots = nodes.filter(node => incomingCount[node.id] === 0);

        // BFS to assign levels
        const queue = roots.map(root => ({ id: root.id, level: 0 }));

        while (queue.length > 0) {
            const { id, level } = queue.shift()!;
            if (visited.has(id)) continue;

            visited.add(id);
            levels[id] = level;

            if (adjacencyList[id]) {
                adjacencyList[id].forEach(neighborId => {
                    if (!visited.has(neighborId)) {
                        queue.push({ id: neighborId, level: level + 1 });
                    }
                });
            }
        }

        return levels;
    }

    getAvailableLayouts() {
        return Array.from(this.layouts.keys());
    }

    getCurrentLayout() {
        return this.currentLayout;
    }

    // Normalisiert Node-Positionen um das Netzwerk kompakt zu halten
    normalizeNodePositions(nodes: EntityData[], maxExtent = 10) {
        if (nodes.length === 0) return;

        if (!nodes[0].position) nodes[0].position = { x: 0, y: 0, z: 0 };

        // Finde Bounding Box
        let minX = nodes[0].position!.x, maxX = nodes[0].position!.x;
        let minY = nodes[0].position!.y, maxY = nodes[0].position!.y;
        let minZ = nodes[0].position!.z, maxZ = nodes[0].position!.z;

        nodes.forEach(node => {
            if (!node.position) node.position = { x: 0, y: 0, z: 0 };
            minX = Math.min(minX, node.position!.x);
            maxX = Math.max(maxX, node.position!.x);
            minY = Math.min(minY, node.position!.y);
            maxY = Math.max(maxY, node.position!.y);
            minZ = Math.min(minZ, node.position!.z);
            maxZ = Math.max(maxZ, node.position!.z);
        });

        // Berechne aktuelle Ausdehnung
        const extentX = maxX - minX;
        const extentY = maxY - minY;
        const extentZ = maxZ - minZ;
        const maxCurrentExtent = Math.max(extentX, extentY, extentZ);

        // Skalierungsfaktor berechnen
        const scale = maxCurrentExtent > 0 ? maxExtent / maxCurrentExtent : 1;

        // Zentrum berechnen
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;

        // Nodes skalieren und zentrieren
        nodes.forEach(node => {
            if (node.position) {
                node.position.x = (node.position.x - centerX) * scale;
                node.position.y = (node.position.y - centerY) * scale;
                node.position.z = (node.position.z - centerZ) * scale;
            }
        });

    }
}
