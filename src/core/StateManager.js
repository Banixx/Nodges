export class StateManager {
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
            infoPanelCollapsed: false, // New state to control panel visibility
            
            // System States
            isInteractionEnabled: true,
            currentTool: 'select' // 'select', 'pan', 'zoom', etc.
        };
        
        this.subscribers = new Map(); // Kategorisierte Subscriber
        this.eventQueue = []; // Event-Queue fuer Batch-Updates
        this.lastTime = performance.now();
    }

    subscribe(callback, category = 'default') {
        if (!this.subscribers.has(category)) {
            this.subscribers.set(category, new Set());
        }
        this.subscribers.get(category).add(callback);
        
        // Initial state notification
        callback(this.state);
        
        return () => {
            const categorySubscribers = this.subscribers.get(category);
            if (categorySubscribers) {
                categorySubscribers.delete(callback);
            }
        };
    }

    update(partialState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...partialState };

        // Check for changes without JSON.stringify (avoids circular references)
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

    notifySubscribers(category = null) {
        if (category) {
            // Benachrichtige nur spezifische Kategorie
            const categorySubscribers = this.subscribers.get(category);
            if (categorySubscribers) {
                categorySubscribers.forEach(callback => {
                    try {
                        callback(this.state);
                    } catch (error) {
                        console.error(`[StateManager] Fehler in Subscriber (${category}):`, error);
                    }
                });
            }
        } else {
            // Benachrichtige alle Subscriber
            this.subscribers.forEach((categorySubscribers, categoryName) => {
                categorySubscribers.forEach(callback => {
                    try {
                        callback(this.state);
                    } catch (error) {
                        console.error(`[StateManager] Fehler in Subscriber (${categoryName}):`, error);
                    }
                });
            });
        }
    }

    // Spezifische State-Updates fuer haeufige Operationen
    setHoveredObject(object) {
        if (this.state.hoveredObject !== object) {
            this.update({ hoveredObject: object });
        }
    }

    setSelectedObject(object) {
        if (this.state.selectedObject !== object) {
            this.update({ 
                selectedObject: object,
                glowIntensity: 0,
                glowDirection: 1,
                infoPanelCollapsed: false  // Expand panel when selecting an object
            });
        }
    }

    updateTooltip(visible, content = null, position = null) {
        this.update({
            tooltipVisible: visible,
            tooltipContent: content,
            tooltipPosition: position || this.state.tooltipPosition
        });
    }

    // Glow-Animation State Update
    updateGlowState(deltaTime) {
        if (this.state.selectedObject) {
            let glowFrequency = 0.5;
            if (this.state.selectedObject.userData.type === 'node') {
                const node = this.state.selectedObject.parent;
                if (node && node.options && typeof node.options.glowFrequency !== 'undefined') {
                    glowFrequency = node.options.glowFrequency;
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

    // Animation Loop
    animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // in Sekunden
        this.lastTime = currentTime;

        this.updateGlowState(deltaTime);
        requestAnimationFrame(this.animate.bind(this));
    }

    // Hilfsmethoden fuer State-Abfragen
    isObjectSelected(object) {
        return this.state.selectedObject === object;
    }

    isObjectHovered(object) {
        return this.state.hoveredObject === object;
    }

    getGlowIntensity() {
        return this.state.glowIntensity;
    }

    // Batch-Updates fuer Performance
    batchUpdate(updates) {
        const oldState = { ...this.state };
        Object.assign(this.state, updates);
        
        // Benachrichtige Batch-Subscriber
        const batchSubscribers = this.subscribers.get('batch');
        if (batchSubscribers) {
            batchSubscribers.forEach(callback => {
                try {
                    callback({ oldState, newState: this.state, updates });
                } catch (error) {
                    console.error('[StateManager] Fehler in Batch-Subscriber:', error);
                }
            });
        }
        
        // Normale Benachrichtigung
        this.notifySubscribers();
    }

    // Tool-Management
    setCurrentTool(tool) {
        if (this.state.currentTool !== tool) {
            this.update({ currentTool: tool });
        }
    }

    // Interaction-Management
    setInteractionEnabled(enabled) {
        if (this.state.isInteractionEnabled !== enabled) {
            this.update({ isInteractionEnabled: enabled });
        }
    }

    // Tooltip-Management
    showTooltip(content, position) {
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

    // InfoPanel-Management
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

    // Highlight-Management
    addHighlightedObject(object) {
        const newHighlighted = new Set(this.state.highlightedObjects);
        newHighlighted.add(object);
        this.update({ highlightedObjects: newHighlighted });
    }

    removeHighlightedObject(object) {
        const newHighlighted = new Set(this.state.highlightedObjects);
        newHighlighted.delete(object);
        this.update({ highlightedObjects: newHighlighted });
    }

    clearHighlightedObjects() {
        this.update({ highlightedObjects: new Set() });
    }

    // Debug-Informationen
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

    // Cleanup
    destroy() {
        this.subscribers.clear();
        this.eventQueue.length = 0;
    }
}
