/**
 * LayoutManager - Zentrale Verwaltung aller Layout-Algorithmen fuer Nodges
 */

import LayoutWorker from '../workers/layout-worker.ts?worker';
import { EntityData, RelationshipData, FieldData } from '../types';
import type { LayoutWorkerRequest, LayoutWorkerResponse } from '../workers/WorkerTypes';
import { errorHandler } from './ErrorHandler';

interface LayoutOptions {
    [key: string]: any;
}

interface LayoutDefinition {
    name: string;
    apply: (nodes: EntityData[], edges: RelationshipData[], fields: FieldData[] | undefined, options: LayoutOptions) => void | Promise<boolean>;
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

import { VisualMappingEngine } from './VisualMappingEngine';

export class LayoutManager {
    private layouts: Map<string, LayoutDefinition>;
    private currentLayout: string | null;
    public isAnimating: boolean;
    public animationSpeed: number;
    private visualMappingEngine?: VisualMappingEngine;
    /** Referenz auf aktiven Worker (fuer Cleanup/Cancel) */
    private activeWorker: Worker | null = null;
    /** Timeout-ID fuer Worker-Timeout */
    private workerTimeoutId: ReturnType<typeof setTimeout> | null = null;
    /** Worker-Timeout in ms (30 Sekunden) */
    private readonly WORKER_TIMEOUT = 30_000;

    constructor() {
        this.layouts = new Map();
        this.currentLayout = null;
        this.isAnimating = false;
        this.animationSpeed = 1.0;

        // Registriere Standard-Layouts
        this.registerDefaultLayouts();
    }

    public setVisualMappingEngine(engine: VisualMappingEngine) {
        this.visualMappingEngine = engine;
    }

    /**
     * Stoppt laufende Animationen und terminiert aktive Worker.
     * Behebt Race-Conditions bei Layout-Wechseln waehrend laufender Berechnungen.
     */
    public stopAnimation() {
        this.isAnimating = false;

        // Laufenden Worker terminieren
        if (this.activeWorker) {
            this.activeWorker.terminate();
            this.activeWorker = null;
            console.log('[LayoutManager] Active worker terminated');
        }

        // Timeout aufraemen
        if (this.workerTimeoutId) {
            clearTimeout(this.workerTimeoutId);
            this.workerTimeoutId = null;
        }
    }

    public setAnimationDuration(duration: number) {
        // Convert duration (ms) to speed factor or store it
        // For now just storing it, though logic might need update to use it
        this.animationSpeed = 1000 / duration;
    }

    registerDefaultLayouts() {
        // Force-Directed Layout
        this.registerLayout('force-directed', {
            name: 'Force-Directed',
            apply: (nodes, edges, fields, options) => this.applyForceLayout(nodes, edges, fields, options),
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
            apply: (nodes, edges, _fields, options) => this.applyFruchtermanReingoldLayout(nodes, edges, options),
            options: {
                maxIterations: 500,
                area: 400,
                temperature: 10
            }
        });

        // Spring-Embedder Layout
        this.registerLayout('spring-embedder', {
            name: 'Spring-Embedder',
            apply: (nodes, edges, _fields, options) => this.applySpringEmbedderLayout(nodes, edges, options),
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
            apply: (nodes, edges, _fields, options) => this.applyHierarchicalLayout(nodes, edges, options),
            options: {
                levelHeight: 3,
                nodeSpacing: 2
            }
        });

        // Tree Layout
        this.registerLayout('tree', {
            name: 'Tree',
            apply: (nodes, edges, _fields, options) => this.applyTreeLayout(nodes, edges, options),
            options: {
                levelHeight: 3,
                nodeSpacing: 2
            }
        });

        // Circular Layout
        this.registerLayout('circular', {
            name: 'Circular',
            apply: (nodes, edges, _fields, options) => this.applyCircularLayout(nodes, edges, options),
            options: {
                radius: 10,
                height: 0
            }
        });

        // Grid Layout
        this.registerLayout('grid', {
            name: 'Grid',
            apply: (nodes, edges, _fields, options) => this.applyGridLayout(nodes, edges, options),
            options: {
                spacing: 2
            }
        });

        // Random Layout
        this.registerLayout('random', {
            name: 'Random',
            apply: (nodes, edges, _fields, options) => this.applyRandomLayout(nodes, edges, options),
            options: {
                minBound: -10,
                maxBound: 10
            }
        });
    }

    registerLayout(id: string, layout: LayoutDefinition) {
        this.layouts.set(id, layout);
    }

    async applyLayout(layoutId: string, nodes: EntityData[], edges: RelationshipData[], fields: FieldData[] = [], options: LayoutOptions = {}): Promise<boolean> {
        const layout = this.layouts.get(layoutId);
        if (!layout) {
            errorHandler.handle(
                new Error(`Layout '${layoutId}' nicht gefunden`),
                { category: 'layout', severity: 'warning' }
            );
            return false;
        }

        this.currentLayout = layoutId;
        const mergedOptions = { ...layout.options, ...options };

        // Positionen sichern fuer Graceful Degradation
        const savedPositions = nodes.map(n => ({
            id: n.id,
            position: n.position ? { ...n.position } : undefined
        }));

        try {
            // Verwende Web Worker fuer rechenintensive Layouts
            if (['force-directed', 'fruchterman-reingold', 'spring-embedder'].includes(layoutId)) {
                return await this.applyLayoutWithWorker(layoutId, nodes, edges, fields, mergedOptions) as boolean;
            } else {
                layout.apply(nodes, edges, fields, mergedOptions);
                const app = typeof window !== 'undefined' ? (window as any).app : null;
                if (app && typeof app.fitCameraToScene === 'function') {
                    app.fitCameraToScene();
                }
                return true;
            }
        } catch (error) {
            // Graceful Degradation: Vorherige Positionen wiederherstellen
            errorHandler.handle(error, {
                category: 'layout',
                severity: 'error',
                userMessage: `Layout '${layout.name}' fehlgeschlagen. Positionen wurden wiederhergestellt.`,
                recover: () => {
                    savedPositions.forEach(saved => {
                        const node = nodes.find(n => n.id === saved.id);
                        if (node && saved.position) {
                            node.position = { ...saved.position };
                        }
                    });
                }
            });
            return false;
        }
    }

    async applyLayoutWithWorker(layoutId: string, nodes: EntityData[], edges: RelationshipData[], fields: FieldData[], options: LayoutOptions): Promise<boolean> {
        // Vorherigen Worker stoppen falls aktiv
        this.stopAnimation();

        return new Promise((resolve, reject) => {
            const worker = new LayoutWorker();
            this.activeWorker = worker;

            // Ensure all nodes have positions
            nodes.forEach(node => {
                if (!node.position) node.position = { x: 0, y: 0, z: 0 };
            });

            // Map node IDs to indices for the worker
            const nodeIndexMap = new Map<string, number>();
            nodes.forEach((node, index) => {
                nodeIndexMap.set(node.id, index);
            });

            const requestId = `layout_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

            const app = typeof window !== 'undefined' ? (window as any).app : null;
            const currentTimestamp = app && app.stateManager ? app.stateManager.state.currentTimestamp : null;

            // Typisierte Anfrage senden
            const request: LayoutWorkerRequest = {
                requestId,
                algorithm: layoutId,
                nodes: nodes.map(node => {
                    const visual = this.visualMappingEngine ? this.visualMappingEngine.applyToEntity(node) : {};
                    const physics = this.getNodePhysics(node);
                    
                    // Temporale Exklusion: Wenn currentTimestamp aktiv ist und Node nicht sichtbar ist, fixiere ihn (sodass er die Physik nicht stört)
                    let isTemporalVisible = true;
                    if (currentTimestamp !== null && node.temporal) {
                        if (node.temporal.validFrom !== undefined && node.temporal.validFrom !== null && currentTimestamp < node.temporal.validFrom) isTemporalVisible = false;
                        if (node.temporal.validTo !== undefined && node.temporal.validTo !== null && currentTimestamp > node.temporal.validTo) isTemporalVisible = false;
                    }

                    const isMapFixed = node.mapX !== undefined && node.mapY !== undefined;
                    const forceFixed = isMapFixed || !isTemporalVisible;

                    return {
                        id: node.id,
                        x: node.position?.x || 0,
                        y: node.position?.y || 0,
                        z: node.position?.z || 0,
                        index: nodeIndexMap.get(node.id)!,
                        attraction: forceFixed ? 0 : physics.attraction, // Wenn fixiert, keine Anziehung
                        repulsion: forceFixed ? 0 : physics.repulsion, // Wenn fixiert, keine Abstoßung
                        inertia: physics.inertia,
                        fixedX: forceFixed || visual.positionX !== undefined,
                        fixedY: forceFixed || visual.positionY !== undefined,
                        fixedZ: forceFixed || visual.positionZ !== undefined,
                        type: node.type,
                        behavior: node.behavior
                    };
                }),
                edges: edges.filter(e => e.source && e.target).map(edge => {
                    const startIndex = nodeIndexMap.get(edge.source!);
                    const endIndex = nodeIndexMap.get(edge.target!);
                    return {
                        start: startIndex !== undefined ? startIndex : 0,
                        end: endIndex !== undefined ? endIndex : 0
                    };
                }),
                fields,
                options
            };

            worker.postMessage(request);

            // Worker-Timeout setzen
            this.workerTimeoutId = setTimeout(() => {
                console.warn(`[LayoutManager] Worker-Timeout (${this.WORKER_TIMEOUT}ms) fuer Request ${requestId}`);
                worker.terminate();
                this.activeWorker = null;
                this.workerTimeoutId = null;
                reject(new Error(`Worker-Timeout nach ${this.WORKER_TIMEOUT}ms`));
            }, this.WORKER_TIMEOUT);

            // Typisierte Antwort verarbeiten
            worker.onmessage = (event: MessageEvent<LayoutWorkerResponse>) => {
                const response = event.data;

                // Request-ID pruefen
                if (response.requestId !== requestId) {
                    console.warn(`[LayoutManager] Stale response ignored (expected ${requestId}, got ${response.requestId})`);
                    return;
                }

                switch (response.type) {
                    case 'progress':
                        // Just a progress update, do not modify positions to avoid flashing/jumping.
                        // (Optional: update a UI progress bar here)
                        break;

                    case 'success': {
                        const { positions, iterations, duration } = response;
                        console.log(`[LayoutManager] Layout berechnet: ${iterations} Iterationen in ${duration.toFixed(1)}ms`);

                        if (positions && Array.isArray(positions)) {
                            const nodeMap = new Map<string, EntityData>();
                            const startPositions = new Map<string, {x:number, y:number, z:number}>();
                            nodes.forEach(node => {
                                nodeMap.set(node.id, node);
                                startPositions.set(node.id, { 
                                    x: node.position?.x || 0, 
                                    y: node.position?.y || 0, 
                                    z: node.position?.z || 0 
                                });
                            });

                            positions.forEach(pos => {
                                const node = nodeMap.get(pos.id);
                                if (node) {
                                    const visual = this.visualMappingEngine ? this.visualMappingEngine.applyToEntity(node) : {};
                                    if (!node.position) node.position = { x: 0, y: 0, z: 0 };
                                    if (visual.positionX === undefined) node.position.x = pos.x || 0;
                                    if (visual.positionY === undefined) node.position.y = pos.y || 0;
                                    if (visual.positionZ === undefined) node.position.z = pos.z || 0;
                                }
                            });

                            const app = typeof window !== 'undefined' ? (window as any).app : null;
                            const state = app?.stateManager?.state;
                            const independentAxes = state ? state.independentAxesNormalization : true; // default true for better space usage
                            this.normalizeNodePositions(nodes, 10, independentAxes);

                            if (app && state?.autoBalanceEnabled) {
                                app.applyVisualBalance();
                            }

                            // Now node.position holds the final targets. Start the tweening!
                            const targetPositions = new Map<string, {x:number, y:number, z:number}>();
                            nodes.forEach(node => {
                                targetPositions.set(node.id, { ...node.position! });
                                // Restore start position for the animation loop
                                const start = startPositions.get(node.id)!;
                                node.position!.x = start.x;
                                node.position!.y = start.y;
                                node.position!.z = start.z;
                            });

                            this.isAnimating = true;
                            const duration = 1200; // 1.2s smooth animation
                            const startTime = performance.now();

                            const animateLoop = (time: number) => {
                                if (!this.isAnimating) return; // allows stopping
                                const elapsed = (time || performance.now()) - startTime;
                                const progress = Math.min(elapsed / duration, 1.0);
                                
                                // Easing function (easeOutCubic)
                                const ease = 1 - Math.pow(1 - progress, 3);

                                nodes.forEach(node => {
                                    const start = startPositions.get(node.id)!;
                                    const target = targetPositions.get(node.id)!;
                                    if (node.position) {
                                        node.position.x = start.x + (target.x - start.x) * ease;
                                        node.position.y = start.y + (target.y - start.y) * ease;
                                        node.position.z = start.z + (target.z - start.z) * ease;
                                    }
                                });

                                if (app && typeof app.updateNodePositions === 'function') {
                                    app.updateNodePositions();
                                }
                                if (app && app.edgeObjectsManager && typeof app.edgeObjectsManager.updateEdgePositions === 'function') {
                                    app.edgeObjectsManager.updateEdgePositions(nodes);
                                }

                                if (progress < 1.0) {
                                    requestAnimationFrame(animateLoop);
                                } else {
                                    this.isAnimating = false;
                                    resolve(true); // <--- Resolve ONLY after animation!
                                }
                            };
                            
                            requestAnimationFrame(animateLoop);
                        } else {
                            resolve(true);
                        }

                        // Cleanup timeout and worker
                        if (this.workerTimeoutId) {
                            clearTimeout(this.workerTimeoutId);
                            this.workerTimeoutId = null;
                        }
                        worker.terminate();
                        this.activeWorker = null;
                        break;
                    }

                    case 'error':
                        console.error(`[LayoutManager] Worker-Fehler: ${response.message}`);

                        // Cleanup
                        if (this.workerTimeoutId) {
                            clearTimeout(this.workerTimeoutId);
                            this.workerTimeoutId = null;
                        }
                        worker.terminate();
                        this.activeWorker = null;
                        reject(new Error(response.message));
                        break;
                }
            };

            worker.onerror = (error: ErrorEvent) => {
                console.error('[LayoutManager] Worker-Fehler:', error);

                // Cleanup
                if (this.workerTimeoutId) {
                    clearTimeout(this.workerTimeoutId);
                    this.workerTimeoutId = null;
                }
                worker.terminate();
                this.activeWorker = null;
                reject(new Error(error.message || 'Worker error'));
            };
        });
    }

    private getNodePhysics(node: EntityData): { attraction: number, repulsion: number, inertia: number } {
        // 1. Check direct properties
        let attraction = node.attraction !== undefined ? Number(node.attraction) : undefined;
        let repulsion = node.repulsion !== undefined ? Number(node.repulsion) : undefined;
        let inertia = node.inertia !== undefined ? Number(node.inertia) : undefined;

        // 2. Check stateVector
        if (node.stateVector) {
            if (attraction === undefined && node.stateVector.attraction !== undefined) {
                attraction = Number(node.stateVector.attraction);
            }
            if (repulsion === undefined && node.stateVector.repulsion !== undefined) {
                repulsion = Number(node.stateVector.repulsion);
            }
            if (inertia === undefined && node.stateVector.inertia !== undefined) {
                inertia = Number(node.stateVector.inertia);
            }
        }

        // 3. Check active presets
        if (this.visualMappingEngine) {
            const activeMappings = this.visualMappingEngine.getVisualMappings();
            const activePreset = activeMappings?.defaultPresets?.[node.type];
            if (activePreset) {
                if (attraction === undefined && activePreset.attraction) {
                    attraction = Number(this.visualMappingEngine.applyMapping(activePreset.attraction as any, node, 'attraction'));
                }
                if (repulsion === undefined && activePreset.repulsion) {
                    repulsion = Number(this.visualMappingEngine.applyMapping(activePreset.repulsion as any, node, 'repulsion'));
                }
                if (inertia === undefined && activePreset.inertia) {
                    inertia = Number(this.visualMappingEngine.applyMapping(activePreset.inertia as any, node, 'inertia'));
                }
            }

            // 4. Check original mappings if not resolved
            const app = typeof window !== 'undefined' ? (window as any).app : null;
            const originalMappings = app?.originalVisualMappings;
            const originalPreset = originalMappings?.defaultPresets?.[node.type];
            if (originalPreset) {
                if (attraction === undefined && originalPreset.attraction) {
                    attraction = Number(this.visualMappingEngine.applyMapping(originalPreset.attraction as any, node, 'attraction'));
                }
                if (repulsion === undefined && originalPreset.repulsion) {
                    repulsion = Number(this.visualMappingEngine.applyMapping(originalPreset.repulsion as any, node, 'repulsion'));
                }
                if (inertia === undefined && originalPreset.inertia) {
                    inertia = Number(this.visualMappingEngine.applyMapping(originalPreset.inertia as any, node, 'inertia'));
                }
            }
        }

        return {
            attraction: attraction !== undefined && !isNaN(attraction) ? attraction : 0,
            repulsion: repulsion !== undefined && !isNaN(repulsion) ? repulsion : 50,
            inertia: inertia !== undefined && !isNaN(inertia) ? inertia : 1.0
        };
    }

    applyForceLayout(nodes: EntityData[], edges: RelationshipData[], fields: FieldData[] = [], options: LayoutOptions = {}) {
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
                if (!edge.source || !edge.target) return;
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

            // 3. Fields (Raumkrümmung)
            if (fields && fields.length > 0) {
                fields.forEach(field => {
                    if (!field.center) return;
                    const cx = field.center.x || 0;
                    const cy = field.center.y || 0;
                    const cz = field.center.z || 0;
                    const influenceR = field.influenceRadius || 100;
                    const strength = field.strength || 1;

                    nodes.forEach(node => {
                        // Very simple behavior matching: if field behavior includes "leaves" and node type is "leaf", etc.
                        // Or if no behavior is specified, apply to all.
                        if (field.behavior) {
                            if (!node.behavior || !field.behavior.includes(node.behavior)) {
                                if (node.type && !field.behavior.includes(node.type)) {
                                    return; // skip if behavior doesn't match
                                }
                            }
                        }

                        if (!node.position) return;
                        const dx = cx - node.position.x;
                        const dy = cy - node.position.y;
                        const dz = cz - node.position.z;
                        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.01;

                        if (distance <= influenceR) {
                            // Calculate force. Attractor field pulls (+). Gravitational can push/pull.
                            let force = 0;
                            if (field.type === 'attractor_field') {
                                force = strength * (distance / influenceR); // pull towards center
                            } else if (field.type === 'gravitational_field') {
                                force = (strength * 100) / (distance * distance); // inverse square
                            } else {
                                force = strength;
                            }

                            const fx = (dx / distance) * force;
                            const fy = (dy / distance) * force;
                            const fz = (dz / distance) * force;

                            node.position.x += fx * damping;
                            node.position.y += fy * damping;
                            node.position.z += fz * damping;
                        }
                    });
                });
            }
        }

        const app = typeof window !== 'undefined' ? (window as any).app : null;
        const state = app?.stateManager?.state;
        const independentAxes = state ? state.independentAxesNormalization : true;
        this.normalizeNodePositions(nodes, 10, independentAxes);
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
                if (!edge.source || !edge.target) return;
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

        const app = typeof window !== 'undefined' ? (window as any).app : null;
        const state = app?.stateManager?.state;
        const independentAxes = state ? state.independentAxesNormalization : true;
        this.normalizeNodePositions(nodes, 10, independentAxes);
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
                if (!edge.source || !edge.target) return;
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
            if (edge.source && edge.target && adjacencyList[edge.source]) {
                adjacencyList[edge.source].push(edge.target);
            }
        });

        const incomingCount: { [key: string]: number } = {};
        nodes.forEach(node => incomingCount[node.id] = 0);
        edges.forEach(edge => {
            // Safe increment
            if (edge.target && incomingCount[edge.target] !== undefined) {
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

    normalizeNodePositions(nodes: EntityData[], maxExtent?: number, independentAxes = false) {
        if (!nodes || nodes.length === 0) return;

        const effectiveMaxExtent = maxExtent !== undefined ? maxExtent : Math.max(100, Math.sqrt(nodes.length) * 15);

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

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;

        if (independentAxes) {
            // Achsen-unabhaengige Skalierung (fuellt die Bounding-Box maximal aus)
            const scaleX = extentX > 0 ? effectiveMaxExtent / extentX : 1;
            const scaleY = extentY > 0 ? effectiveMaxExtent / extentY : 1;
            const scaleZ = extentZ > 0 ? effectiveMaxExtent / extentZ : 1;

            nodes.forEach(node => {
                if (node.position) {
                    const visual = this.visualMappingEngine ? this.visualMappingEngine.applyToEntity(node) : {};
                    if (visual.positionX === undefined) node.position.x = (node.position.x - centerX) * scaleX;
                    if (visual.positionY === undefined) node.position.y = (node.position.y - centerY) * scaleY;
                    if (visual.positionZ === undefined) node.position.z = (node.position.z - centerZ) * scaleZ;
                }
            });
        } else {
            // Uniforme Skalierung (erhaelt die originalen Proportionen)
            const maxCurrentExtent = Math.max(extentX, extentY, extentZ);
            const scale = maxCurrentExtent > 0 ? effectiveMaxExtent / maxCurrentExtent : 1;

            nodes.forEach(node => {
                if (node.position) {
                    const visual = this.visualMappingEngine ? this.visualMappingEngine.applyToEntity(node) : {};
                    if (visual.positionX === undefined) node.position.x = (node.position.x - centerX) * scale;
                    if (visual.positionY === undefined) node.position.y = (node.position.y - centerY) * scale;
                    if (visual.positionZ === undefined) node.position.z = (node.position.z - centerZ) * scale;
                }
            });
        }
    }
}
