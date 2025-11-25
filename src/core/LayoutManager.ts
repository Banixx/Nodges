/**
 * LayoutManager - Zentrale Verwaltung aller Layout-Algorithmen fuer Nodges
 */

// @ts-ignore
import LayoutWorker from '../workers/layout-worker.js?worker';
import { NodeData, EdgeData } from '../types';

interface LayoutOptions {
    [key: string]: any;
}

interface LayoutDefinition {
    name: string;
    apply: (nodes: NodeData[], edges: EdgeData[], options: LayoutOptions) => void | Promise<boolean>;
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

    async applyLayout(layoutId: string, nodes: NodeData[], edges: EdgeData[], options: LayoutOptions = {}): Promise<boolean> {
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

    async applyLayoutWithWorker(layoutId: string, nodes: NodeData[], edges: EdgeData[], options: LayoutOptions): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const worker = new LayoutWorker();

            // Stelle sicher, dass alle Knoten Positionen haben
            nodes.forEach(node => {
                if (typeof node.x !== 'number') node.x = 0;
                if (typeof node.y !== 'number') node.y = 0;
                if (typeof node.z !== 'number') node.z = 0;
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
                    x: node.x || 0,
                    y: node.y || 0,
                    z: node.z || 0,
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
                            nodes[index].x = pos.x || 0;
                            nodes[index].y = pos.y || 0;
                            nodes[index].z = pos.z || 0;
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

    applyForceLayout(nodes: NodeData[], edges: EdgeData[], options: LayoutOptions = {}) {
        const {
            maxIterations = 100,
            repulsionStrength = 50,
            attractionStrength = 0.5,
            damping = 0.8
        } = options;

        // Initialisiere Positionen, falls nicht vorhanden
        nodes.forEach(node => {
            if (typeof node.x !== 'number') node.x = 0;
            if (typeof node.y !== 'number') node.y = 0;
            if (typeof node.z !== 'number') node.z = 0;
        });

        for (let i = 0; i < maxIterations; i++) {
            // Repulsion zwischen allen Knoten
            for (let j = 0; j < nodes.length; j++) {
                for (let k = j + 1; k < nodes.length; k++) {
                    const node1 = nodes[j];
                    const node2 = nodes[k];

                    const dx = node2.x - node1.x;
                    const dy = node2.y - node1.y;
                    const dz = node2.z - node1.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;

                    const force = repulsionStrength / (distance * distance);
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    const fz = (dz / distance) * force;

                    node1.x -= fx * damping;
                    node1.y -= fy * damping;
                    node1.z -= fz * damping;
                    node2.x += fx * damping;
                    node2.y += fy * damping;
                    node2.z += fz * damping;
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

                let startIndex = edge.start;
                let endIndex = edge.end;

                // Simple check if it's an index
                let node1: NodeData | undefined;
                let node2: NodeData | undefined;

                if (typeof startIndex === 'number') {
                    node1 = nodes[startIndex];
                } else {
                    node1 = nodes.find(n => n.id === startIndex);
                }

                if (typeof endIndex === 'number') {
                    node2 = nodes[endIndex];
                } else {
                    node2 = nodes.find(n => n.id === endIndex);
                }

                if (node1 && node2) {
                    const dx = node2.x - node1.x;
                    const dy = node2.y - node1.y;
                    const dz = node2.z - node1.z;

                    const fx = dx * attractionStrength;
                    const fy = dy * attractionStrength;
                    const fz = dz * attractionStrength;

                    node1.x += fx;
                    node1.y += fy;
                    node1.z += fz;
                    node2.x -= fx;
                    node2.y -= fy;
                    node2.z -= fz;
                }
            });
        }

        // Normalisiere Positionen um das Netzwerk kompakt zu halten
        this.normalizeNodePositions(nodes, 10); // Maximal 10 Einheiten Ausdehnung
    }

    applyCircularLayout(nodes: NodeData[], _edges: EdgeData[], options: LayoutOptions) {
        const { radius } = options;
        const angleStep = (2 * Math.PI) / nodes.length;

        nodes.forEach((node, index) => {
            const angle = index * angleStep;
            node.x = Math.cos(angle) * radius;
            node.y = 0;
            node.z = Math.sin(angle) * radius;
        });
    }

    applyGridLayout(nodes: NodeData[], _edges: EdgeData[], options: LayoutOptions) {
        const { spacing } = options;
        const gridSize = Math.ceil(Math.sqrt(nodes.length));

        nodes.forEach((node, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;

            node.x = (col - gridSize / 2) * spacing;
            node.y = 0;
            node.z = (row - gridSize / 2) * spacing;
        });
    }

    applyRandomLayout(nodes: NodeData[], _edges: EdgeData[], options: LayoutOptions) {
        const { minBound, maxBound } = options;
        const range = maxBound - minBound;

        nodes.forEach(node => {
            node.x = minBound + Math.random() * range;
            node.y = minBound + Math.random() * range;
            node.z = minBound + Math.random() * range;
        });
    }

    applyFruchtermanReingoldLayout(nodes: NodeData[], edges: EdgeData[], options: LayoutOptions = {}) {
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
                    if (v !== u) {
                        const dx = v.x - u.x;
                        const dy = v.y - u.y;
                        const dz = v.z - u.z;
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
                let v: NodeData | undefined;
                let u: NodeData | undefined;

                if (typeof edge.start === 'number') v = nodes[edge.start];
                else v = nodes.find(n => n.id === edge.start);

                if (typeof edge.end === 'number') u = nodes[edge.end];
                else u = nodes.find(n => n.id === edge.end);

                if (v && u) {
                    const dx = v.x - u.x;
                    const dy = v.y - u.y;
                    const dz = v.z - u.z;
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
                    v.x += (v.disp.x / dispLength) * limitedLength;
                    v.y += (v.disp.y / dispLength) * limitedLength;
                    v.z += (v.disp.z / dispLength) * limitedLength;
                }
            });

            temp *= 0.95; // Cool down
        }

        // Normalisiere Positionen um das Netzwerk kompakt zu halten
        this.normalizeNodePositions(nodes, 10);
    }

    applySpringEmbedderLayout(nodes: NodeData[], edges: EdgeData[], options: LayoutOptions) {
        const { maxIterations, springConstant, repulsionConstant, damping, naturalLength } = options;

        for (let iter = 0; iter < maxIterations; iter++) {
            nodes.forEach(node => {
                node.fx = 0;
                node.fy = 0;
                node.fz = 0;
            });

            // Spring forces
            edges.forEach(edge => {
                let v1: NodeData | undefined;
                let v2: NodeData | undefined;

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
                    const dx = v2.x - v1.x;
                    const dy = v2.y - v1.y;
                    const dz = v2.z - v1.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;

                    const force = repulsionConstant / (distance * distance);
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    const fz = (dz / distance) * force;

                    v1.fx -= fx;
                    v1.fy -= fy;
                    v1.fz -= fz;
                    v2.fx += fx;
                    v2.fy += fy;
                    v2.fz += fz;
                }
            }

            // Apply forces
            nodes.forEach(node => {
                node.x += node.fx * damping;
                node.y += node.fy * damping;
                node.z += node.fz * damping;
            });
        }
    }

    applyHierarchicalLayout(nodes: NodeData[], edges: EdgeData[], options: LayoutOptions) {
        const { levelHeight, nodeSpacing } = options;

        // Simple hierarchical layout - arrange nodes in levels
        const levels = this.calculateNodeLevels(nodes, edges);
        const maxLevel = Math.max(...Object.values(levels));

        const levelNodes: { [key: number]: NodeData[] } = {};
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
                node.x = -totalWidth / 2 + index * nodeSpacing;
                node.y = (maxLevel - level) * levelHeight;
                node.z = 0;
            });
        });
    }

    applyTreeLayout(nodes: NodeData[], edges: EdgeData[], options: LayoutOptions) {
        // Similar to hierarchical but with tree structure
        this.applyHierarchicalLayout(nodes, edges, options);
    }

    calculateNodeLevels(nodes: NodeData[], edges: EdgeData[]) {
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
            const startId = typeof edge.start === 'number' ? nodes[edge.start]?.id : edge.start;
            const endId = typeof edge.end === 'number' ? nodes[edge.end]?.id : edge.end;

            if (startId !== undefined && endId !== undefined && adjacencyList[startId]) {
                adjacencyList[startId].push(endId);
            }
        });

        // Find root nodes (nodes with no incoming edges)
        const incomingCount: { [key: string]: number } = {};
        nodes.forEach(node => incomingCount[node.id] = 0);
        edges.forEach(edge => {
            const endId = typeof edge.end === 'number' ? nodes[edge.end]?.id : edge.end;
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
    normalizeNodePositions(nodes: NodeData[], maxExtent = 10) {
        if (nodes.length === 0) return;

        // Finde Bounding Box
        let minX = nodes[0].x, maxX = nodes[0].x;
        let minY = nodes[0].y, maxY = nodes[0].y;
        let minZ = nodes[0].z, maxZ = nodes[0].z;

        nodes.forEach(node => {
            minX = Math.min(minX, node.x);
            maxX = Math.max(maxX, node.x);
            minY = Math.min(minY, node.y);
            maxY = Math.max(maxY, node.y);
            minZ = Math.min(minZ, node.z);
            maxZ = Math.max(maxZ, node.z);
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
            node.x = (node.x - centerX) * scale;
            node.y = (node.y - centerY) * scale;
            node.z = (node.z - centerZ) * scale;
        });

    }
}
