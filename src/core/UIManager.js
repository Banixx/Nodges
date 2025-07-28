import * as THREE from 'three';

export class UIManager {
    constructor(stateManager, highlightManager) {
        this.stateManager = stateManager;
        this.highlightManager = highlightManager;

        // Subscribe to state changes
        this.stateManager.subscribe(this.handleStateChange.bind(this));
    }

    handleStateChange(state) {
        // Update visual effects through HighlightManager
        if (state.selectedObject) {
            this.highlightManager.applyHighlight(
                state.selectedObject, 
                this.highlightManager.types.SELECTION
            );
        }
    }

    destroy() {
    }
}
