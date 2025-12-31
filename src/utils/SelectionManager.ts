import * as THREE from 'three';
import { StateManager } from '../core/StateManager';

export class SelectionManager {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;
    private stateManager: StateManager;

    private selectedObjects: Set<THREE.Object3D>;
    private selectionMode: 'single' | 'multi' | 'box';
    private isBoxSelecting: boolean;

    private selectionBoxes: Map<THREE.Object3D, THREE.Mesh>;
    private selectionBoxMaterial: THREE.MeshBasicMaterial;

    private boxSelectStart: THREE.Vector2;
    private boxSelectEnd: THREE.Vector2;
    private boxSelectDiv: HTMLDivElement;

    private isUpdatingFromState: boolean;

    private _onMouseDown: (event: MouseEvent) => void;
    private _onMouseMove: (event: MouseEvent) => void;
    private _onMouseUp: (event: MouseEvent) => void;
    private _onKeyDown: (event: KeyboardEvent) => void;
    private _onKeyUp: (event: KeyboardEvent) => void;

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, stateManager: StateManager) {
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
        this.boxSelectDiv = document.createElement('div'); // Initialized in separate method in JS, but better here or in create method

        this.isUpdatingFromState = false;

        // Bind events
        this._onMouseDown = this.onMouseDown.bind(this);
        this._onMouseMove = this.onMouseMove.bind(this);
        this._onMouseUp = this.onMouseUp.bind(this);
        this._onKeyDown = this.onKeyDown.bind(this);
        this._onKeyUp = this.onKeyUp.bind(this);

        this.createSelectionBoxDiv();
        this.setupEventListeners();

        // Subscribe to StateManager
        this.stateManager.subscribe(this.handleStateChange.bind(this), 'selection');
    }

    setupEventListeners() {
        this.renderer.domElement.addEventListener('mousedown', this._onMouseDown);
        window.addEventListener('mousemove', this._onMouseMove); // Window for drag outside canvas
        window.addEventListener('mouseup', this._onMouseUp);
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
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

    setSingleSelection(object: THREE.Object3D) {
        this.clearSelection();
        this.addToSelection(object);
        this.updateVisualFeedback();
    }

    onMouseDown(event: MouseEvent) {
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

    onMouseMove(event: MouseEvent) {
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

    onMouseUp(event: MouseEvent) {
        if (this.isBoxSelecting) {
            this.isBoxSelecting = false;
            this.boxSelectDiv.style.display = 'none';
            this.performBoxSelection(event);
        }
    }

    performBoxSelection(event: MouseEvent) {
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

    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Shift') {
            this.renderer.domElement.style.cursor = 'crosshair';
        }
    }

    onKeyUp(event: KeyboardEvent) {
        if (event.key === 'Shift') {
            this.renderer.domElement.style.cursor = 'default';
        }
    }

    /**
     * Handle state changes from StateManager to synchronize visualization
     */
    handleStateChange(state: any) {
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

    /**
     * Add object to selection
     */
    addToSelection(object: THREE.Object3D) {
        this.selectedObjects.add(object);

        // Update state manager for compatibility
        if (this.selectedObjects.size === 1 && !this.isUpdatingFromState) {
            this.stateManager.setSelectedObject(object);
        }
    }

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
    createSelectionBox(object: THREE.Object3D) {
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
    removeSelectionBox(object: THREE.Object3D) {
        const box = this.selectionBoxes.get(object);
        if (box) {
            this.scene.remove(box);
            // Dispose geometry and material for proper cleanup
            if (box.geometry) box.geometry.dispose();
            if (box.material) (box.material as THREE.Material).dispose();
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
    deleteNode(nodeObject: THREE.Object3D) {
        const node = nodeObject.userData.node;
        if (!node) return;

        // Find and remove connected edges
        const edgesToRemove: THREE.Object3D[] = [];
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
            if ((edgeObject as any).geometry) (edgeObject as any).geometry.dispose();
            if ((edgeObject as any).material) (edgeObject as any).material.dispose();
        });

        // Remove node
        this.scene.remove(nodeObject);
        if ((nodeObject as any).geometry) (nodeObject as any).geometry.dispose();
        if ((nodeObject as any).material) (nodeObject as any).material.dispose();
    }

    /**
     * Delete an edge
     */
    deleteEdge(edgeObject: THREE.Object3D) {
        this.scene.remove(edgeObject);
        if ((edgeObject as any).geometry) (edgeObject as any).geometry.dispose();
        if ((edgeObject as any).material) (edgeObject as any).material.dispose();
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
    isSelected(object: THREE.Object3D) {
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
        this.renderer.domElement.removeEventListener('mousedown', this._onMouseDown);
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);

        // Remove selection boxes
        this.clearSelection();

        // Remove box select div
        if (this.boxSelectDiv && this.boxSelectDiv.parentNode) {
            this.boxSelectDiv.parentNode.removeChild(this.boxSelectDiv);
        }
    }
}
