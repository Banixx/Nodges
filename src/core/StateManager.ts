import * as THREE from 'three';
import { EntityData, RelationshipData } from '../types';

import { STATE_CATEGORIES, STATE_KEY_TO_CATEGORIES, type StateCategory } from './state/StateTypes';
export { STATE_CATEGORIES, STATE_KEY_TO_CATEGORIES };
export type { StateCategory };

export interface HistoryAction {
    type: string;
    description: string;
    undo: () => void;
    redo: () => void;
}

export interface State {
    [key: string]: any;
    graphData: {
        entities: EntityData[];
        relationships: RelationshipData[];
    };
    loadedFiles: any[];
    hoveredObject: THREE.Object3D | null;
    selectedObject: THREE.Object3D | null;
    selectedObjects: Set<THREE.Object3D>;
    isBoxSelecting: boolean;
    highlightedObjects: Set<THREE.Object3D>;
    glowIntensity: number;
    glowDirection: number;
    tooltipVisible: boolean;
    tooltipContent: string | null;
    tooltipPosition: { x: number; y: number } | null;
    infoPanelVisible: boolean;
    infoPanelCollapsed: boolean;
    highlightEffectsEnabled: boolean;
    isInteractionEnabled: boolean;
    currentTool: string;
    layer1Visible: boolean;
    layer2Visible: boolean;
    layer3Visible: boolean;
    layer4Visible: boolean;
    layer1Opacity: number;
    layer2Opacity: number;
    layer3Opacity: number;
    layer4Opacity: number;
    layeringAttribute: string;
    layer1Value: string;
    layer2Value: string;
    layer3Value: string;
    layer4Value: string;
    complexityMode: 'simple' | 'expert' | 'dev';
    devPowerPreference: 'high-performance' | 'low-power';
    devPixelRatio: number;
    devFpsLimit: number;
    _triggerRendererRebuild: number;
    renderMode: string;
    activeRenderMode: 'mesh' | 'instance';
    edgeThickness: number;
    edgeTubularSegments: number;
    edgeRadialSegments: number;
    edgeCurveFactor: number;
    edgePulseSpeed: number;
    edgeAnimationMode: string;
    highlightThickness: number;
    selectionThickness: number;
    layoutEnabled: boolean;
    backgroundColor: string;
    ambientLightIntensity: number;
    directionalLightIntensity: number;
    showLabelsAlways: boolean;
    showLabelsOnHover: boolean;
    repositionLabels: boolean;
    labelLines: number;
    labelFilterAttribute: string;
    labelFilterMode: string;
    labelFilterThreshold: number;
    labelMaxClosest: number;
    visibleLabelsCount: number;
    totalLabelsCount: number;
    activeColorScheme: string;
    visualScaleExponent: number;
    visualScaleMultiplier: number;
    autoBalanceEnabled: boolean;
    normalizeCoordinatesEnabled: boolean;
    cameraFitMargin: number;
    cameraTransitionDuration: number;
    currentTimestamp: number | null;
    minTimestamp: number | null;
    maxTimestamp: number | null;
    isPlaying: boolean;
    playbackSpeed: number;
    mapActive: boolean;
    temporalFadeEnabled: boolean;
    temporalFadeDuration: number;
}

export type StateCallback = (state: State) => void;
export type BatchCallback = (data: { oldState: State; newState: State; updates: Partial<State> }) => void;

export class StateManager {
    public state: State;
    private subscribers: Map<string, Set<StateCallback>>;
    private batchSubscribers: Map<string, Set<BatchCallback>>;
    private eventQueue: any[];
    private isUpdating: boolean = false;
    private lastTime: number;

    private undoStack: HistoryAction[] = [];
    private redoStack: HistoryAction[] = [];
    private isUndoing: boolean = false;
    private currentBatch: HistoryAction[] | null = null;
    private batchDescription: string | null = null;

    constructor() {
        this.state = {
            graphData: {
                entities: [],
                relationships: []
            },
            loadedFiles: [],
            hoveredObject: null,
            selectedObject: null,
            selectedObjects: new Set(),
            isBoxSelecting: false,
            highlightedObjects: new Set(),
            glowIntensity: 0,
            glowDirection: 1,
            tooltipVisible: false,
            tooltipContent: null,
            tooltipPosition: null,
            infoPanelVisible: false,
            infoPanelCollapsed: false,
            highlightEffectsEnabled: true,
            isInteractionEnabled: true,
            currentTool: 'select',
            layer1Visible: true,
            layer2Visible: true,
            layer3Visible: true,
            layer4Visible: true,
            layer1Opacity: 1.0,
            layer2Opacity: 1.0,
            layer3Opacity: 1.0,
            layer4Opacity: 1.0,
            layeringAttribute: 'layer',
            layer1Value: '1',
            layer2Value: '2',
            layer3Value: '3',
            layer4Value: '4',
            complexityMode: (typeof localStorage !== 'undefined' ? localStorage.getItem('nodges_complexity_mode') : null) as any || 'simple',
            overlapEffectEnabled: false,
            overlapEffectMode: 'static',
            overlapRadius: 0.5,
            overlapSpeed: 2.0,
            overlapMinSize: 0.3,
            overlapMaxSize: 1.8,
            devPowerPreference: (typeof localStorage !== 'undefined' ? localStorage.getItem('nodges_dev_power_pref') : null) as any || 'high-performance',
            devPixelRatio: parseFloat((typeof localStorage !== 'undefined' ? localStorage.getItem('nodges_dev_pixel_ratio') : null) || '1.0'),
            devFpsLimit: parseInt((typeof localStorage !== 'undefined' ? localStorage.getItem('nodges_dev_fps_limit') : null) || '0', 10),
            _triggerRendererRebuild: 0,
            renderMode: (typeof localStorage !== 'undefined' ? localStorage.getItem('nodges_render_mode') : null) as any || 'auto',
            activeRenderMode: ((typeof localStorage !== 'undefined' ? localStorage.getItem('nodges_render_mode') : null) === 'instance' ? 'instance' : 'mesh') as 'mesh' | 'instance',
            edgeThickness: 2.0,
            edgeTubularSegments: 20,
            edgeRadialSegments: 8,
            edgeCurveFactor: 0.4,
            edgePulseSpeed: 1.0,
            edgeAnimationMode: 'pulse',
            highlightThickness: 10,
            selectionThickness: 20,
            layoutEnabled: false,
            backgroundColor: '#8fa649',
            ambientLightIntensity: 0.6,
            directionalLightIntensity: 0.8,
            showLabelsAlways: true,
            showLabelsOnHover: true,
            repositionLabels: false,
            labelLines: 1,
            labelFilterAttribute: '',
            labelFilterMode: 'visibility',
            labelFilterThreshold: 0,
            labelMaxClosest: 50,
            visibleLabelsCount: 0,
            totalLabelsCount: 0,
            activeColorScheme: 'start-olive',
            visualScaleExponent: 1.0,
            visualScaleMultiplier: 1.0,
            autoBalanceEnabled: true,
            normalizeCoordinatesEnabled: true,
            cameraFitMargin: 1.05,
            cameraTransitionDuration: 1500,
            currentTimestamp: null,
            minTimestamp: null,
            maxTimestamp: null,
            isPlaying: false,
            playbackSpeed: 1.0,
            mapActive: false,
            temporalFadeEnabled: true,
            temporalFadeDuration: 5.0,
        };

        this.subscribers = new Map();
        this.batchSubscribers = new Map();
        this.eventQueue = [];
        this.lastTime = performance.now();

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
        if (this.isUpdating) return; // Prevent recursive updates

        const oldState = { ...this.state };
        this.state = { ...this.state, ...partialState };

        if (partialState.complexityMode && typeof localStorage !== 'undefined') {
            localStorage.setItem('nodges_complexity_mode', partialState.complexityMode);
        }
        if (partialState.devPowerPreference && typeof localStorage !== 'undefined') {
            localStorage.setItem('nodges_dev_power_pref', partialState.devPowerPreference);
        }
        if (partialState.devPixelRatio !== undefined && typeof localStorage !== 'undefined') {
            localStorage.setItem('nodges_dev_pixel_ratio', partialState.devPixelRatio.toString());
        }
        if (partialState.devFpsLimit !== undefined && typeof localStorage !== 'undefined') {
            localStorage.setItem('nodges_dev_fps_limit', partialState.devFpsLimit.toString());
        }
        if (partialState.renderMode && typeof localStorage !== 'undefined') {
            localStorage.setItem('nodges_render_mode', partialState.renderMode);
        }

        this.isUpdating = true;
        try {
            // Ermittle welche Keys sich tatsaechlich geaendert haben
            const changedKeys: string[] = [];
            for (const key in partialState) {
                if (oldState[key] !== this.state[key]) {
                    changedKeys.push(key);
                }
            }

            if (changedKeys.length > 0) {
                // Ermittle betroffene Subscriber-Kategorien
                const affectedCategories = new Set<StateCategory>();
                affectedCategories.add(STATE_CATEGORIES.DEFAULT); // Default wird immer benachrichtigt

                for (const key of changedKeys) {
                    const categories = STATE_KEY_TO_CATEGORIES[key];
                    if (categories) {
                        categories.forEach(cat => affectedCategories.add(cat));
                    }
                }

                this.notifySubscribers(null, affectedCategories);
            }
        } finally {
            this.isUpdating = false;
        }
    }

    /**
     * Benachrichtigt Subscriber.
     * @param category - Wenn gesetzt, wird nur diese eine Kategorie benachrichtigt (Abwaertskompatibilitaet)
     * @param affectedCategories - Set betroffener Kategorien (gezielt aus update())
     */
    notifySubscribers(category: string | null = null, affectedCategories?: Set<StateCategory>) {
        if (category) {
            // Direkte Kategorie-Benachrichtigung (z.B. von setGraphData 'data_changed')
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
        } else if (affectedCategories) {
            // Gezielte Benachrichtigung basierend auf geaenderten State-Keys
            for (const cat of affectedCategories) {
                const categorySubscribers = this.subscribers.get(cat);
                if (categorySubscribers) {
                    categorySubscribers.forEach(callback => {
                        try {
                            callback(this.state);
                        } catch (error) {
                            console.error(`[StateManager] Error in Subscriber (${cat}):`, error);
                        }
                    });
                }
            }
        } else {
            // Fallback: Alle Subscriber benachrichtigen
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
            selectedObjects: new Set(objects), // Create new Set to ensure reactivity
            glowIntensity: 0,
            glowDirection: 1,
            infoPanelCollapsed: false
        });
    }

    /**
     * Get primary selected object
     */
    getSelectedObject(): THREE.Object3D | null {
        return this.state.selectedObject;
    }

    getSelectedObjects(): Set<THREE.Object3D> {
        return this.state.selectedObjects;
    }

    addToSelection(object: THREE.Object3D) {
        const newSelection = new Set(this.state.selectedObjects);
        newSelection.add(object);
        this.setSelectedObjects(newSelection);
    }

    removeFromSelection(object: THREE.Object3D) {
        const newSelection = new Set(this.state.selectedObjects);
        newSelection.delete(object);
        this.setSelectedObjects(newSelection);
    }

    clearSelection() {
        this.setSelectedObjects(new Set());
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

    // --- Build 4 Methods ---
    setCurrentTimestamp(timestamp: number | null) {
        if (this.state.currentTimestamp !== timestamp) {
            this.update({ currentTimestamp: timestamp });
        }
    }
    
    setPlaying(playing: boolean) {
        if (this.state.isPlaying !== playing) {
            this.update({ isPlaying: playing });
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
    }

    setLoadedFiles(files: any[]) {
        this.update({ loadedFiles: [...files] });
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
            
            // Felder aus updates in den bestehenden Node mergen (nur die übergebenen Felder aktualisieren)
            const updatedNode = { ...newEntities[index], ...updates };
            
            newEntities[index] = updatedNode;
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
            
            // Felder aus updates in die bestehende Edge mergen (nur die übergebenen Felder aktualisieren)
            const updatedEdge = { ...newRelationships[index], ...updates };
            
            newRelationships[index] = updatedEdge;
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

    // ============================================================================
    // Edge-based Group Management Methods
    // ============================================================================

    /**
     * Prüft ob ein Knoten als Gruppe fungiert.
     * Strukturelle Kriterien: Mindestens 1 eingehende Edge mit relation === 'belongs_to'
     * (Oder Übergangs-Fallback: type === 'group' oder type === 'cloud')
     */
    isGroupNode(nodeId: string): boolean {
        const entity = this.state.graphData.entities.find(e => e.id === nodeId);
        if (!entity) return false;

        // Übergangs-Fallback für expliziten Typ
        if (entity.type === 'group' || entity.type === 'cloud') {
            return true;
        }

        // Strukturelles Kriterium: Mindestens 1 eingehende belongs_to Edge
        return this.state.graphData.relationships.some(
            r => r.target === nodeId && r.relation === 'belongs_to'
        );
    }

    /**
     * Erstellt einen neuen Gruppen-Knoten und fügt ihn zum GraphData hinzu
     */
    createGroupNode(label: string = 'Neue Gruppe', attributes: Record<string, unknown> = {}): EntityData {
        const groupId = `group_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const groupNode: EntityData = {
            id: groupId,
            label: label,
            type: 'group',
            ...attributes
        };

        this.addNode(groupNode);
        return groupNode;
    }

    /**
     * Fügt einen Knoten zu einer Gruppe hinzu (erstellt Edge nodeId --belongs_to--> groupId)
     */
    addNodeToGroup(nodeId: string, groupId: string): RelationshipData {
        // Prüfen ob Beziehung bereits existiert
        const existingEdge = this.state.graphData.relationships.find(
            r => r.source === nodeId && r.target === groupId && r.relation === 'belongs_to'
        );
        if (existingEdge) return existingEdge;

        const edgeId = `rel_${nodeId}_belongs_to_${groupId}_${Date.now()}`;
        const edge: RelationshipData = {
            id: edgeId,
            source: nodeId,
            target: groupId,
            relation: 'belongs_to',
            label: 'belongs_to'
        };

        this.addEdge(edge);
        return edge;
    }

    /**
     * Entfernt die Mitgliedschafts-Edge zwischen Knoten und Gruppe
     */
    removeNodeFromGroup(nodeId: string, groupId: string) {
        const edge = this.state.graphData.relationships.find(
            r => r.source === nodeId && r.target === groupId && r.relation === 'belongs_to'
        );
        if (edge && edge.id) {
            this.removeEdge(edge.id);
        }
    }

    /**
     * Gibt alle Mitglieder einer Gruppe zurück (Entities mit ausgehender belongs_to Edge zur Gruppe)
     */
    getGroupMembers(groupId: string): EntityData[] {
        const memberIds = new Set<string>();
        this.state.graphData.relationships.forEach(r => {
            if (r.target === groupId && r.relation === 'belongs_to' && r.source) {
                memberIds.add(r.source);
            }
        });

        return this.state.graphData.entities.filter(e => memberIds.has(e.id));
    }

    /**
     * Gibt alle Gruppen zurück, denen ein Knoten angehört
     */
    getNodeGroups(nodeId: string): EntityData[] {
        const groupIds = new Set<string>();
        this.state.graphData.relationships.forEach(r => {
            if (r.source === nodeId && r.relation === 'belongs_to' && r.target) {
                groupIds.add(r.target);
            }
        });

        return this.state.graphData.entities.filter(e => groupIds.has(e.id));
    }

    /**
     * Gibt alle Knoten zurück, die als Gruppe deklariert sind oder eingehende belongs_to Kanten besitzen
     */
    getAllGroups(): EntityData[] {
        return this.state.graphData.entities.filter(e => this.isGroupNode(e.id));
    }
}
