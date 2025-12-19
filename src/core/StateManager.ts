import * as THREE from 'three';

export interface State {
    // Interaction States
    hoveredObject: THREE.Object3D | null;
    selectedObject: THREE.Object3D | null;

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

    // Layout
    layoutEnabled: boolean;
    [key: string]: any; // Allow for dynamic properties during migration
}

type StateCallback = (state: State) => void;

export class StateManager {
    public state: State;
    private subscribers: Map<string, Set<StateCallback>>;
    private eventQueue: any[];
    private lastTime: number;

    constructor() {
        this.state = {
            // Interaction States
            hoveredObject: null,
            selectedObject: null,

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

            layoutEnabled: true
        };

        this.subscribers = new Map();
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
            this.update({
                selectedObject: object,
                glowIntensity: 0,
                glowDirection: 1,
                infoPanelCollapsed: false
            });
        }
    }

    updateTooltip(visible: boolean, content: string | null = null, position: { x: number, y: number } | null = null) {
        this.update({
            tooltipVisible: visible,
            tooltipContent: content,
            tooltipPosition: position || this.state.tooltipPosition
        });
    }

    updateGlowState(deltaTime: number) {
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

            if (newIntensity >= 1) {
                newIntensity = 1;
                this.update({
                    glowIntensity: newIntensity,
                    glowDirection: -1
                });
            } else if (newIntensity <= 0) {
                newIntensity = 0;
                this.update({
                    glowIntensity: newIntensity,
                    glowDirection: 1
                });
            } else {
                this.update({ glowIntensity: newIntensity });
            }
        }
    }

    animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.updateGlowState(deltaTime);
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

        const batchSubscribers = this.subscribers.get('batch');
        if (batchSubscribers) {
            batchSubscribers.forEach(callback => {
                try {
                    // @ts-ignore - Batch callback signature might differ
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
}
