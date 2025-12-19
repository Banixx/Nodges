/**
 * SelectionManager - Handles multi-selection and batch operations
 * Supports: Multi-select, Box-select, Keyboard shortcuts, Visual feedback
 */

import * as THREE from 'three';

export class SelectionManager {
    constructor(scene, camera, renderer, stateManager) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.stateManager = stateManager;

        // Selection state
        this.selectedObjects = new Set();
        this.selectionMode = 'single'; // 'single', 'multi', 'box'
        this.isBoxSelecting = false;

        // Visual feedback
        this.selectionBoxes = new Map();
        this.selectionBoxMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });

        // Box selection
        this.boxSelectStart = new THREE.Vector2();
        this.boxSelectEnd = new THREE.Vector2();
        this.boxSelectDiv = null;

        // Raycaster for selection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.setupEventListeners();
        this.createSelectionBoxDiv();

        // Flag to prevent infinite recursion during state updates
        this.isUpdatingFromState = false;

        // Subscribe to StateManager for selection synchronization (visual feedback update)
        this.stateManager.subscribe(this.handleStateChange.bind(this), 'selection');
    }

    setupEventListeners() {
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        this.renderer.domElement.addEventListener('mousedown', this.onMouseDown);
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    createSelectionBoxDiv() {
        this.boxSelectDiv = document.createElement('div');
        this.boxSelectDiv.style.position = 'absolute';
        this.boxSelectDiv.style.border = '1px solid #00ff00';
        this.boxSelectDiv.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
        this.boxSelectDiv.style.pointerEvents = 'none';
        this.boxSelectDiv.style.display = 'none';
        this.boxSelectDiv.style.zIndex = '1000';
        document.body.appendChild(this.boxSelectDiv);
    }

    setSingleSelection(object) {
        this.clearSelection();
        this.addToSelection(object);
        this.updateVisualFeedback();
    }

    onMouseDown(event) {
        // Only handle if shift key is pressed or mode is box
        if (event.button === 0 && (this.selectionMode === 'box' || event.shiftKey)) {
            this.isBoxSelecting = true;
            this.boxSelectStart.set(event.clientX, event.clientY);
            this.boxSelectEnd.set(event.clientX, event.clientY);

            this.boxSelectDiv.style.left = event.clientX + 'px';
            this.boxSelectDiv.style.top = event.clientY + 'px';
            this.boxSelectDiv.style.width = '0px';
            this.boxSelectDiv.style.height = '0px';
            this.boxSelectDiv.style.display = 'block';

            // Prevent OrbitControls from taking over if we are box selecting
            event.stopPropagation();
        }
    }

    onMouseMove(event) {
        if (this.isBoxSelecting) {
            this.boxSelectEnd.set(event.clientX, event.clientY);

            const minX = Math.min(this.boxSelectStart.x, this.boxSelectEnd.x);
            const maxX = Math.max(this.boxSelectStart.x, this.boxSelectEnd.x);
            const minY = Math.min(this.boxSelectStart.y, this.boxSelectEnd.y);
            const maxY = Math.max(this.boxSelectStart.y, this.boxSelectEnd.y);

            this.boxSelectDiv.style.left = minX + 'px';
            this.boxSelectDiv.style.top = minY + 'px';
            this.boxSelectDiv.style.width = (maxX - minX) + 'px';
            this.boxSelectDiv.style.height = (maxY - minY) + 'px';
        }
    }

    onMouseUp(event) {
        if (this.isBoxSelecting) {
            this.isBoxSelecting = false;
            this.boxSelectDiv.style.display = 'none';
            this.performBoxSelection(event);
        }
    }

    performBoxSelection(event) {
        const minX = Math.min(this.boxSelectStart.x, this.boxSelectEnd.x);
        const maxX = Math.max(this.boxSelectStart.x, this.boxSelectEnd.x);
        const minY = Math.min(this.boxSelectStart.y, this.boxSelectEnd.y);
        const maxY = Math.max(this.boxSelectStart.y, this.boxSelectEnd.y);

        // If box is too small, ignore (it was a click)
        if (maxX - minX < 5 && maxY - minY < 5) return;

        if (!event.shiftKey) {
            this.clearSelection();
        }

        this.scene.traverse((object) => {
            if (object.userData && (object.userData.type === 'node' || object.userData.type === 'edge')) {
                // Project position to screen space
                const pos = object.position.clone();
                pos.project(this.camera);

                // Convert to screen coordinates
                const screenX = (pos.x * 0.5 + 0.5) * window.innerWidth;
                const screenY = (-(pos.y * 0.5) + 0.5) * window.innerHeight;

                if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
                    this.addToSelection(object);
                }
            }
        });

        this.updateVisualFeedback();
    }

    onKeyDown(event) {
        if (event.key === 'Shift') {
            this.renderer.domElement.style.cursor = 'crosshair';
        }
    }

    onKeyUp(event) {
        if (event.key === 'Shift') {
            this.renderer.domElement.style.cursor = 'default';
        }
    }

    /**
     * Handle state changes from StateManager to synchronize visualization
     */
    handleStateChange(state) {
        // Prevent re-entry or circular updates
        if (this.isUpdatingFromState) return;

        const newSelectedObject = state.selectedObject;

        if (this.isBoxSelecting || state.currentTool !== 'select') return;

        this.isUpdatingFromState = true;
        try {
            if (newSelectedObject) {
                // If state selection changes, enforce single selection visualization
                // Check if we already have this object selected to avoid unnecessary work
                if (this.selectedObjects.size === 1 && this.selectedObjects.has(newSelectedObject)) {
                    return;
                }
                this.setSingleSelection(newSelectedObject);
            } else if (this.selectedObjects.size > 0) {
                // Selection was cleared globally
                this.clearSelection();
            }
        } finally {
            this.isUpdatingFromState = false;
        }
    }

    // ... (existing methods) ...

    /**
     * Add object to selection
     */
    addToSelection(object) {
        this.selectedObjects.add(object);

        // Update state manager for compatibility
        if (this.selectedObjects.size === 1 && !this.isUpdatingFromState) {
            this.stateManager.setSelectedObject(object);
        }
    }

    // ... (existing methods) ...

    /**
     * Clear all selections (without closing panel)
     */
    clearSelection() {
        this.selectedObjects.forEach(obj => this.removeSelectionBox(obj));
        this.selectedObjects.clear();
        this.selectionMode = 'single';

        // Notify state manager without closing panel
        if (!this.isUpdatingFromState) {
            this.stateManager.update({
                selectedObject: null,
                infoPanelCollapsed: false // Keep panel visible but collapsed
            });
        }
    }

    /**
     * Select all selectable objects
     */
    selectAll() {
        this.clearSelection();

        this.scene.traverse((object) => {
            if (object.userData && (object.userData.type === 'node' || object.userData.type === 'edge')) {
                this.addToSelection(object);
            }
        });

        this.selectionMode = 'multi';
        this.updateVisualFeedback();
    }

    /**
     * Update visual feedback for selections
     */
    updateVisualFeedback() {
        // Remove old selection boxes
        this.selectionBoxes.forEach((box, obj) => {
            if (!this.selectedObjects.has(obj)) {
                this.scene.remove(box);
                this.selectionBoxes.delete(obj);
            }
        });

        // Add selection boxes for new selections
        this.selectedObjects.forEach(obj => {
            if (!this.selectionBoxes.has(obj)) {
                this.createSelectionBox(obj);
            }
        });
    }

    /**
     * Create selection box for object
     */
    createSelectionBox(object) {
        // Nur fuer Nodes - Edges verwenden das HighlightManager-System
        if (object.userData.type === 'node') {
            let scale = 1.1;
            const boundingBox = new THREE.Box3().setFromObject(object);
            const size = boundingBox.getSize(new THREE.Vector3());
            const geometry = new THREE.BoxGeometry(size.x * scale, size.y * scale, size.z * scale);

            const selectionBox = new THREE.Mesh(geometry, this.selectionBoxMaterial);
            selectionBox.position.copy(object.position);

            this.selectionBoxes.set(object, selectionBox);
            this.scene.add(selectionBox);
        } else if (object.userData.type === 'edge') {
            // Edges werden nun ausschließlich vom HighlightManager gehandhabt
            // um redundante und fehlerhafte Geometrien zu vermeiden.
        }
    }

    /**
     * Remove selection box for object
     */
    removeSelectionBox(object) {
        const box = this.selectionBoxes.get(object);
        if (box) {
            this.scene.remove(box);
            // Dispose geometry and material for proper cleanup
            if (box.geometry) box.geometry.dispose();
            if (box.material) box.material.dispose();
            this.selectionBoxes.delete(object);
        }
    }



    /**
     * Delete selected objects
     */
    deleteSelected() {
        if (this.selectedObjects.size === 0) return;

        const objectsToDelete = Array.from(this.selectedObjects);

        objectsToDelete.forEach(object => {
            if (object.userData.type === 'node') {
                this.deleteNode(object);
            } else if (object.userData.type === 'edge') {
                this.deleteEdge(object);
            }
        });

        this.clearSelection();
    }

    /**
     * Delete a node and its connected edges
     */
    deleteNode(nodeObject) {
        const node = nodeObject.userData.node;
        if (!node) return;

        // Find and remove connected edges
        const edgesToRemove = [];
        this.scene.traverse((object) => {
            if (object.userData && object.userData.type === 'edge') {
                const edge = object.userData.edge;
                if (edge && (edge.startNode === node || edge.endNode === node)) {
                    edgesToRemove.push(object);
                }
            }
        });

        edgesToRemove.forEach(edgeObject => {
            this.scene.remove(edgeObject);
            edgeObject.geometry.dispose();
            edgeObject.material.dispose();
        });

        // Remove node
        this.scene.remove(nodeObject);
        nodeObject.geometry.dispose();
        nodeObject.material.dispose();
    }

    /**
     * Delete an edge
     */
    deleteEdge(edgeObject) {
        this.scene.remove(edgeObject);
        edgeObject.geometry.dispose();
        edgeObject.material.dispose();
    }

    /**
     * Get selected objects
     */
    getSelectedObjects() {
        return Array.from(this.selectedObjects);
    }

    /**
     * Get selected nodes
     */
    getSelectedNodes() {
        return Array.from(this.selectedObjects).filter(obj => obj.userData.type === 'node');
    }

    /**
     * Get selected edges
     */
    getSelectedEdges() {
        return Array.from(this.selectedObjects).filter(obj => obj.userData.type === 'edge');
    }

    /**
     * Check if object is selected
     */
    isSelected(object) {
        return this.selectedObjects.has(object);
    }

    /**
     * Get selection count
     */
    getSelectionCount() {
        return this.selectedObjects.size;
    }

    /**
     * Get selection info
     */
    getSelectionInfo() {
        const nodes = this.getSelectedNodes();
        const edges = this.getSelectedEdges();

        return {
            total: this.selectedObjects.size,
            nodes: nodes.length,
            edges: edges.length,
            mode: this.selectionMode
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        // Remove event listeners
        this.renderer.domElement.removeEventListener('mousedown', this.onMouseDown);
        this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.renderer.domElement.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);

        // Remove selection boxes
        this.clearSelection();

        // Remove box select div
        if (this.boxSelectDiv && this.boxSelectDiv.parentNode) {
            this.boxSelectDiv.parentNode.removeChild(this.boxSelectDiv);
        }
    }
}
