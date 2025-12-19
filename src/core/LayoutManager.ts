/**
 * LayoutManager - Zentrale Verwaltung aller Layout-Algorithmen fuer Nodges
 */

// @ts-ignore
import LayoutWorker from '../workers/layout-worker.js?worker';
import { EntityData, RelationshipData } from '../types';

interface LayoutOptions {
    [key: string]: any;
}

interface LayoutDefinition {
    name: string;
    apply: (nodes: EntityData[], edges: RelationshipData[], options: LayoutOptions) => void | Promise<boolean>;
    options: LayoutOptions;
}

// Intersect EntityData with layout properties.
// Using intersection type to handle explicit properties properly.
type LayoutEntity = EntityData & {
    fx?: number;
    fy?: number;
    fz?: number;
    disp?: { x: number; y: number; z: number };
    index?: number; // Worker index
};

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
            const nodeIndexMap = new Map<string, number>();
            nodes.forEach((node, index) => {
                nodeIndexMap.set(node.id, index);
            });

            worker.postMessage({
                nodes: nodes.map(node => ({
                    x: node.position?.x || 0,
                    y: node.position?.y || 0,
                    z: node.position?.z || 0,
                    index: nodeIndexMap.get(node.id)!
                })),
                edges: edges.map(edge => {
                    // Resolve source/target IDs to indices
                    const startIndex = nodeIndexMap.get(edge.source);
                    const endIndex = nodeIndexMap.get(edge.target);

                    return {
                        start: startIndex !== undefined ? startIndex : 0,
                        end: endIndex !== undefined ? endIndex : 0
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

        // Map for fast lookup
        const nodeMap = new Map<string, EntityData>();
        nodes.forEach(node => {
            nodeMap.set(node.id, node);
            if (!node.position) node.position = { x: 0, y: 0, z: 0 };
        });

        for (let i = 0; i < maxIterations; i++) {
            // Repulsion between all nodes
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

            // Attraction along edges
            edges.forEach(edge => {
                const node1 = nodeMap.get(edge.source);
                const node2 = nodeMap.get(edge.target);

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

        this.normalizeNodePositions(nodes, 10);
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

        const layoutNodes = nodes as LayoutEntity[];
        const nodeMap = new Map<string, LayoutEntity>();

        // Initialisiere displacement vectors und Map
        layoutNodes.forEach(node => {
            node.disp = { x: 0, y: 0, z: 0 };
            nodeMap.set(node.id, node);
        });

        for (let iter = 0; iter < maxIterations; iter++) {
            // Calculate repulsive forces
            layoutNodes.forEach(v => {
                v.disp = { x: 0, y: 0, z: 0 };
                layoutNodes.forEach(u => {
                    if (v !== u && v.position && u.position) {
                        const dx = v.position.x - u.position.x;
                        const dy = v.position.y - u.position.y;
                        const dz = v.position.z - u.position.z;
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;

                        const force = (k * k) / distance;
                        v.disp!.x += (dx / distance) * force;
                        v.disp!.y += (dy / distance) * force;
                        v.disp!.z += (dz / distance) * force;
                    }
                });
            });

            // Calculate attractive forces
            edges.forEach(edge => {
                const v = nodeMap.get(edge.source);
                const u = nodeMap.get(edge.target);

                if (v && u && v.position && u.position && v.disp && u.disp) {
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
            layoutNodes.forEach(v => {
                if (v.disp) {
                    const dispLength = Math.sqrt(v.disp.x * v.disp.x + v.disp.y * v.disp.y + v.disp.z * v.disp.z);
                    const limitedLength = Math.min(dispLength, temp);

                    if (dispLength > 0 && v.position) {
                        v.position.x += (v.disp.x / dispLength) * limitedLength;
                        v.position.y += (v.disp.y / dispLength) * limitedLength;
                        v.position.z += (v.disp.z / dispLength) * limitedLength;
                    }
                }
            });

            temp *= 0.95; // Cool down
        }

        this.normalizeNodePositions(nodes, 10);
    }

    applySpringEmbedderLayout(nodes: EntityData[], edges: RelationshipData[], options: LayoutOptions) {
        const { maxIterations, springConstant, repulsionConstant, damping, naturalLength } = options;

        const layoutNodes = nodes as LayoutEntity[];
        const nodeMap = new Map<string, LayoutEntity>();

        layoutNodes.forEach(node => {
            nodeMap.set(node.id, node);
        });

        for (let iter = 0; iter < maxIterations; iter++) {
            layoutNodes.forEach(node => {
                node.fx = 0;
                node.fy = 0;
                node.fz = 0;
            });

            // Spring forces
            edges.forEach(edge => {
                const v1 = nodeMap.get(edge.source);
                const v2 = nodeMap.get(edge.target);

                if (v1 && v2 && v1.position && v2.position) {
                    const dx = v2.position.x - v1.position.x;
                    const dy = v2.position.y - v1.position.y;
                    const dz = v2.position.z - v1.position.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;

                    const force = springConstant * (distance - naturalLength);
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    const fz = (dz / distance) * force;

                    v1.fx! += fx;
                    v1.fy! += fy;
                    v1.fz! += fz;
                    v2.fx! -= fx;
                    v2.fy! -= fy;
                    v2.fz! -= fz;
                }
            });

            // Repulsion forces
            for (let i = 0; i < layoutNodes.length; i++) {
                for (let j = i + 1; j < layoutNodes.length; j++) {
                    const v1 = layoutNodes[i];
                    const v2 = layoutNodes[j];
                    if (v1 && v2 && v1.position && v2.position) {
                        const dx = v2.position.x - v1.position.x;
                        const dy = v2.position.y - v1.position.y;
                        const dz = v2.position.z - v1.position.z;
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;

                        const force = repulsionConstant / (distance * distance);
                        const fx = (dx / distance) * force;
                        const fy = (dy / distance) * force;
                        const fz = (dz / distance) * force;

                        v1.fx! -= fx;
                        v1.fy! -= fy;
                        v1.fz! -= fz;
                        v2.fx! += fx;
                        v2.fy! += fy;
                        v2.fz! += fz;
                    }
                }
            }

            // Apply forces
            layoutNodes.forEach(node => {
                if (node.position) {
                    node.position.x += (node.fx || 0) * damping;
                    node.position.y += (node.fy || 0) * damping;
                    node.position.z += (node.fz || 0) * damping;
                }
            });
        }
    }

    applyHierarchicalLayout(nodes: EntityData[], edges: RelationshipData[], options: LayoutOptions) {
        const { levelHeight, nodeSpacing } = options;

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
        this.applyHierarchicalLayout(nodes, edges, options);
    }

    calculateNodeLevels(nodes: EntityData[], edges: RelationshipData[]) {
        const levels: { [key: string]: number } = {};
        const visited = new Set<string>();
        const adjacencyList: { [key: string]: string[] } = {};

        nodes.forEach(node => {
            adjacencyList[node.id] = [];
            levels[node.id] = 0;
        });

        edges.forEach(edge => {
            if (adjacencyList[edge.source]) {
                adjacencyList[edge.source].push(edge.target);
            }
        });

        const incomingCount: { [key: string]: number } = {};
        nodes.forEach(node => incomingCount[node.id] = 0);
        edges.forEach(edge => {
            // Safe increment
            if (incomingCount[edge.target] !== undefined) {
                incomingCount[edge.target]++;
            }
        });

        const roots = nodes.filter(node => incomingCount[node.id] === 0);

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

    normalizeNodePositions(nodes: EntityData[], maxExtent = 10) {
        if (nodes.length === 0) return;

        if (!nodes[0].position) nodes[0].position = { x: 0, y: 0, z: 0 };

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

        const extentX = maxX - minX;
        const extentY = maxY - minY;
        const extentZ = maxZ - minZ;
        const maxCurrentExtent = Math.max(extentX, extentY, extentZ);

        const scale = maxCurrentExtent > 0 ? maxExtent / maxCurrentExtent : 1;

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;

        nodes.forEach(node => {
            if (node.position) {
                node.position.x = (node.position.x - centerX) * scale;
                node.position.y = (node.position.y - centerY) * scale;
                node.position.z = (node.position.z - centerZ) * scale;
            }
        });

    }
}
