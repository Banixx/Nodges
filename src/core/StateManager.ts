import { EntityData, RelationshipData } from '../types';
import * as THREE from 'three';


export type ActionType =
    | 'ADD_NODE' | 'REMOVE_NODE' | 'UPDATE_NODE'
    | 'ADD_EDGE' | 'REMOVE_EDGE' | 'UPDATE_EDGE'
    | 'BATCH';

export interface HistoryAction {
    type: ActionType;
    undo: () => void;
    redo: () => void;
    description: string;
}

export interface State {
    // Data State (Single Source of Truth)
    graphData: {
        entities: EntityData[];
        relationships: RelationshipData[];
    };

    // Interaction States
    hoveredObject: THREE.Object3D | null;
    selectedObject: THREE.Object3D | null;
    selectedObjects: Set<THREE.Object3D>;
    isBoxSelecting: boolean;

    // Visual States
    highlightedObjects: Set<THREE.Object3D>;
    glowIntensity: number;
    glowDirection: number;

    // UI States
    tooltipVisible: boolean;
    tooltipContent: string | null;
    tooltipPosition: { x: number, y: number } | null;
    infoPanelVisible: boolean;
    infoPanelCollapsed: boolean;

    // Highlight Effects State
    highlightEffectsEnabled: boolean;

    // System States
    isInteractionEnabled: boolean;
    currentTool: string;

    // Edge Parameters
    edgeThickness: number;
    edgeTubularSegments: number;
    edgeRadialSegments: number;
    edgeCurveFactor: number;
    edgePulseSpeed: number;
    highlightThickness: number; // Percentage above base (1-200)
    selectionThickness: number; // Percentage above highlight (0-100)

    // Layout
    layoutEnabled: boolean;

    // Environment
    backgroundColor: string;
    ambientLightIntensity: number;
    directionalLightIntensity: number;

    [key: string]: any; // Allow for dynamic properties during migration
}

type StateCallback = (state: State) => void;
type BatchCallback = (data: { oldState: State; newState: State; updates: Partial<State> }) => void;

export class StateManager {
    public state: State;
    private subscribers: Map<string, Set<StateCallback>>;
    private batchSubscribers: Map<string, Set<BatchCallback>>;
    private eventQueue: any[];
    private lastTime: number;

    // History System
    private undoStack: HistoryAction[] = [];
    private redoStack: HistoryAction[] = [];
    private isUndoing: boolean = false;
    private currentBatch: HistoryAction[] | null = null;
    private batchDescription: string | null = null;

    constructor() {
        this.state = {
            // Data State
            graphData: {
                entities: [],
                relationships: []
            },

            // Interaction States
            hoveredObject: null,
            selectedObject: null,
            selectedObjects: new Set(),
            isBoxSelecting: false,

            // Visual States
            highlightedObjects: new Set(),
            glowIntensity: 0,
            glowDirection: 1,

            // UI States
            tooltipVisible: false,
            tooltipContent: null,
            tooltipPosition: null,
            infoPanelVisible: false,
            infoPanelCollapsed: false,

            // Highlight Effects State
            highlightEffectsEnabled: true,

            // System States
            isInteractionEnabled: true,
            currentTool: 'select',

            // Edge Parameters
            edgeThickness: 0.1,
            edgeTubularSegments: 20,
            edgeRadialSegments: 8,
            edgeCurveFactor: 0.4,
            edgePulseSpeed: 1.0,
            edgeAnimationMode: 'pulse', // pulse, flow, sequential, segments
            highlightThickness: 10, // 10% larger than original (corresponds to multiplier 1.1)
            selectionThickness: 20, // 20% larger than highlight

            layoutEnabled: true,

            // Environment Defaults
            backgroundColor: '#8fa649',
            ambientLightIntensity: 0.6,
            directionalLightIntensity: 0.8
        };

        this.subscribers = new Map();
        this.batchSubscribers = new Map();
        this.eventQueue = [];
        this.lastTime = performance.now();

        // Start animation loop
        this.animate();
    }

    subscribe(callback: StateCallback, category: string = 'default'): () => void {
        if (!this.subscribers.has(category)) {
            this.subscribers.set(category, new Set());
        }
        this.subscribers.get(category)!.add(callback);

        // Initial state notification
        callback(this.state);

        return () => {
            const categorySubscribers = this.subscribers.get(category);
            if (categorySubscribers) {
                categorySubscribers.delete(callback);
            }
        };
    }

    update(partialState: Partial<State>) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...partialState };

        let hasChanged = false;
        for (const key in partialState) {
            if (oldState[key] !== this.state[key]) {
                hasChanged = true;
                break;
            }
        }

        if (hasChanged) {
            this.notifySubscribers();
        }
    }

    notifySubscribers(category: string | null = null) {
        if (category) {
            const categorySubscribers = this.subscribers.get(category);
            if (categorySubscribers) {
                categorySubscribers.forEach(callback => {
                    try {
                        callback(this.state);
                    } catch (error) {
                        console.error(`[StateManager] Error in Subscriber (${category}):`, error);
                    }
                });
            }
        } else {
            this.subscribers.forEach((categorySubscribers, categoryName) => {
                categorySubscribers.forEach(callback => {
                    try {
                        callback(this.state);
                    } catch (error) {
                        console.error(`[StateManager] Error in Subscriber (${categoryName}):`, error);
                    }
                });
            });
        }
    }

    setHoveredObject(object: THREE.Object3D | null) {
        if (this.state.hoveredObject !== object) {
            this.update({ hoveredObject: object });
        }
    }

    setSelectedObject(object: THREE.Object3D | null) {
        if (this.state.selectedObject !== object) {
            const selectedObjects = new Set<THREE.Object3D>();
            if (object) selectedObjects.add(object);

            this.update({
                selectedObject: object,
                selectedObjects: selectedObjects,
                glowIntensity: 0,
                glowDirection: 1,
                infoPanelCollapsed: false
            });
        }
    }

    setSelectedObjects(objects: Set<THREE.Object3D>) {
        // Find a primary selected object (first one in set or null)
        const primary = objects.size > 0 ? Array.from(objects)[0] : null;

        this.update({
            selectedObject: primary,
            selectedObjects: objects,
            glowIntensity: 0,
            glowDirection: 1,
            infoPanelCollapsed: false
        });
    }

    updateTooltip(visible: boolean, content: string | null = null, position: { x: number, y: number } | null = null) {
        this.update({
            tooltipVisible: visible,
            tooltipContent: content,
            tooltipPosition: position || this.state.tooltipPosition
        });
    }

    /**
     * Updates glow state SILENTLY (without notifying subscribers)
     * This is critical for performance - glow animation runs every frame
     * and should not trigger expensive HighlightManager updates.
     */
    updateGlowStateSilent(deltaTime: number) {
        if (this.state.selectedObject) {
            let glowFrequency = 0.5;
            if (this.state.selectedObject.userData.type === 'node') {
                const node = this.state.selectedObject.parent;
                if (node && node.userData && typeof node.userData.glowFrequency !== 'undefined') {
                    glowFrequency = node.userData.glowFrequency;
                }
            }

            let newIntensity = this.state.glowIntensity +
                deltaTime * Math.PI * 0.2 * glowFrequency * this.state.glowDirection;

            // Update state directly WITHOUT triggering subscribers
            if (newIntensity >= 1) {
                this.state.glowIntensity = 1;
                this.state.glowDirection = -1;
            } else if (newIntensity <= 0) {
                this.state.glowIntensity = 0;
                this.state.glowDirection = 1;
            } else {
                this.state.glowIntensity = newIntensity;
            }
        }
    }

    animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Use silent update to avoid triggering expensive subscriber updates every frame
        this.updateGlowStateSilent(deltaTime);
        requestAnimationFrame(this.animate.bind(this));
    }

    isObjectSelected(object: THREE.Object3D): boolean {
        return this.state.selectedObject === object;
    }

    isObjectHovered(object: THREE.Object3D): boolean {
        return this.state.hoveredObject === object;
    }

    getGlowIntensity(): number {
        return this.state.glowIntensity;
    }

    batchUpdate(updates: Partial<State>) {
        const oldState = { ...this.state };
        Object.assign(this.state, updates);

        const batchSubs = this.batchSubscribers.get('batch');
        if (batchSubs) {
            batchSubs.forEach(callback => {
                try {
                    callback({ oldState, newState: this.state, updates });
                } catch (error) {
                    console.error('[StateManager] Error in Batch-Subscriber:', error);
                }
            });
        }

        this.notifySubscribers();
    }

    setCurrentTool(tool: string) {
        if (this.state.currentTool !== tool) {
            this.update({ currentTool: tool });
        }
    }

    setInteractionEnabled(enabled: boolean) {
        if (this.state.isInteractionEnabled !== enabled) {
            this.update({ isInteractionEnabled: enabled });
        }
    }

    showTooltip(content: string, position: { x: number, y: number }) {
        this.update({
            tooltipVisible: true,
            tooltipContent: content,
            tooltipPosition: position
        });
    }

    hideTooltip() {
        this.update({
            tooltipVisible: false,
            tooltipContent: null
        });
    }

    showInfoPanel() {
        if (!this.state.infoPanelVisible) {
            this.update({ infoPanelVisible: true });
        }
    }

    hideInfoPanel() {
        if (this.state.infoPanelVisible) {
            this.update({ infoPanelVisible: false });
        }
    }

    addHighlightedObject(object: THREE.Object3D) {
        const newHighlighted = new Set(this.state.highlightedObjects);
        newHighlighted.add(object);
        this.update({ highlightedObjects: newHighlighted });
    }

    removeHighlightedObject(object: THREE.Object3D) {
        const newHighlighted = new Set(this.state.highlightedObjects);
        newHighlighted.delete(object);
        this.update({ highlightedObjects: newHighlighted });
    }

    clearHighlightedObjects() {
        this.update({ highlightedObjects: new Set() });
    }

    getDebugInfo() {
        return {
            stateKeys: Object.keys(this.state),
            subscriberCategories: Array.from(this.subscribers.keys()),
            totalSubscribers: Array.from(this.subscribers.values()).reduce((sum, set) => sum + set.size, 0),
            hoveredObject: this.state.hoveredObject?.userData?.type || null,
            selectedObject: this.state.selectedObject?.userData?.type || null,
            highlightedCount: this.state.highlightedObjects.size,
            currentTool: this.state.currentTool,
            interactionEnabled: this.state.isInteractionEnabled
        };
    }

    destroy() {
        this.subscribers.clear();
        this.eventQueue.length = 0;
    }

    // ============================================================================
    // Data Management (Single Source of Truth)
    // ============================================================================

    setGraphData(entities: EntityData[], relationships: RelationshipData[]) {
        this.update({
            graphData: {
                entities: [...entities],
                relationships: [...relationships]
            }
        });
        // Notify specialized subscribers
        this.notifySubscribers('data_changed');
    }

    getEntities(): EntityData[] {
        return this.state.graphData.entities;
    }

    getRelationships(): RelationshipData[] {
        return this.state.graphData.relationships;
    }

    addNode(node: EntityData) {
        const newEntities = [...this.state.graphData.entities, node];
        this.update({
            graphData: {
                ...this.state.graphData,
                entities: newEntities
            }
        });

        this.addToHistory({
            type: 'ADD_NODE',
            description: `Add Node ${node.label || node.id}`,
            undo: () => this.removeNode(node.id),
            redo: () => this.addNode(node)
        });

        this.notifySubscribers('data_changed');
    }

    updateNode(nodeId: string, updates: Partial<EntityData>, skipHistory: boolean = false) {
        const index = this.state.graphData.entities.findIndex(e => e.id === nodeId);
        if (index !== -1) {
            const oldNode = { ...this.state.graphData.entities[index] };
            const newEntities = [...this.state.graphData.entities];
            newEntities[index] = { ...newEntities[index], ...updates };
            this.update({
                graphData: {
                    ...this.state.graphData,
                    entities: newEntities
                }
            });

            if (!skipHistory) {
                this.addToHistory({
                    type: 'UPDATE_NODE',
                    description: `Update Node ${oldNode.label || nodeId}`,
                    undo: () => this.updateNode(nodeId, oldNode),
                    redo: () => this.updateNode(nodeId, updates)
                });
            }

            this.notifySubscribers('data_changed');
        }
    }

    removeNode(nodeId: string) {
        const node = this.state.graphData.entities.find(e => e.id === nodeId);
        if (!node) return;

        // Auch verbundene Edges entfernen und für Undo merken
        const removedEdges = this.state.graphData.relationships.filter(
            r => r.source === nodeId || r.target === nodeId
        );

        const newEntities = this.state.graphData.entities.filter(e => e.id !== nodeId);
        const newRelationships = this.state.graphData.relationships.filter(
            r => r.source !== nodeId && r.target !== nodeId
        );

        this.update({
            graphData: {
                entities: newEntities,
                relationships: newRelationships
            }
        });

        this.addToHistory({
            type: 'REMOVE_NODE',
            description: `Remove Node ${node.label || nodeId}`,
            undo: () => {
                this.addNode(node);
                removedEdges.forEach(e => this.addEdge(e));
            },
            redo: () => this.removeNode(nodeId)
        });

        this.notifySubscribers('data_changed');
    }

    addEdge(edge: RelationshipData) {
        const newRelationships = [...this.state.graphData.relationships, edge];
        this.update({
            graphData: {
                ...this.state.graphData,
                relationships: newRelationships
            }
        });

        this.addToHistory({
            type: 'ADD_EDGE',
            description: `Add Edge ${edge.source}->${edge.target}`,
            undo: () => this.removeEdge(edge.id || 'unknown'),
            redo: () => this.addEdge(edge)
        });

        this.notifySubscribers('data_changed');
    }

    updateEdge(edgeId: string, updates: Partial<RelationshipData>, skipHistory: boolean = false) {
        const index = this.state.graphData.relationships.findIndex(r => r.id === edgeId);
        if (index !== -1) {
            const oldEdge = { ...this.state.graphData.relationships[index] };
            const newRelationships = [...this.state.graphData.relationships];
            newRelationships[index] = { ...newRelationships[index], ...updates };
            this.update({
                graphData: {
                    ...this.state.graphData,
                    relationships: newRelationships
                }
            });

            if (!skipHistory) {
                this.addToHistory({
                    type: 'UPDATE_EDGE',
                    description: `Update Edge ${edgeId}`,
                    undo: () => this.updateEdge(edgeId, oldEdge),
                    redo: () => this.updateEdge(edgeId, updates)
                });
            }

            this.notifySubscribers('data_changed');
        }
    }

    removeEdge(edgeId: string) {
        const edge = this.state.graphData.relationships.find(r => r.id === edgeId);
        if (!edge) return;

        const newRelationships = this.state.graphData.relationships.filter(r => r.id !== edgeId);
        this.update({
            graphData: {
                ...this.state.graphData,
                relationships: newRelationships
            }
        });

        this.addToHistory({
            type: 'REMOVE_EDGE',
            description: `Remove Edge ${edgeId}`,
            undo: () => this.addEdge(edge),
            redo: () => this.removeEdge(edgeId)
        });

        this.notifySubscribers('data_changed');
    }

    // --- History System ---

    addToHistory(action: HistoryAction) {
        if (this.isUndoing) return;

        if (this.currentBatch) {
            this.currentBatch.push(action);
        } else {
            this.undoStack.push(action);
            if (this.undoStack.length > 50) this.undoStack.shift();
            this.redoStack = [];
        }
    }

    undo() {
        if (this.undoStack.length === 0) return;

        const action = this.undoStack.pop()!;
        this.redoStack.push(action);

        this.isUndoing = true;
        try {
            console.log(`[StateManager] Undo: ${action.description}`);
            if (action.type === 'BATCH' && (action as any).actions) {
                const batch = (action as any).actions as HistoryAction[];
                [...batch].reverse().forEach(a => a.undo());
            } else {
                action.undo();
            }
        } finally {
            this.isUndoing = false;
        }
    }

    redo() {
        if (this.redoStack.length === 0) return;

        const action = this.redoStack.pop()!;
        this.undoStack.push(action);

        this.isUndoing = true;
        try {
            console.log(`[StateManager] Redo: ${action.description}`);
            if (action.type === 'BATCH' && (action as any).actions) {
                const batch = (action as any).actions as HistoryAction[];
                batch.forEach(a => a.redo());
            } else {
                action.redo();
            }
        } finally {
            this.isUndoing = false;
        }
    }

    beginTransaction(description: string) {
        if (this.currentBatch) return;
        this.currentBatch = [];
        this.batchDescription = description;
    }

    commitTransaction() {
        if (this.currentBatch && this.currentBatch.length > 0) {
            const batchAction: HistoryAction = {
                type: 'BATCH',
                description: this.batchDescription || 'Batch Operation',
                undo: () => { },
                redo: () => { },
            };
            (batchAction as any).actions = this.currentBatch;

            this.undoStack.push(batchAction);
            this.redoStack = [];
        }
        this.currentBatch = null;
        this.batchDescription = null;
    }

    cancelTransaction() {
        this.currentBatch = null;
        this.batchDescription = null;
    }
}
