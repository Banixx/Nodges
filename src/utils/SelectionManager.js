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
    }

    /**
     * Setup event listeners for selection
     */
    setupEventListeners() {
        // Mouse events
        this.renderer.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Prevent context menu during box selection
        this.renderer.domElement.addEventListener('contextmenu', (e) => {
            if (this.isBoxSelecting) {
                e.preventDefault();
            }
        });
    }

    /**
     * Create HTML div for box selection visualization
     */
    createSelectionBoxDiv() {
        this.boxSelectDiv = document.createElement('div');
        this.boxSelectDiv.style.cssText = `
            position: absolute;
            border: 2px dashed #00ff00;
            background: rgba(0, 255, 0, 0.1);
            pointer-events: none;
            display: none;
            z-index: 1000;
        `;
        document.body.appendChild(this.boxSelectDiv);
    }

    /**
     * Handle mouse down events
     */
    onMouseDown(event) {
        // Skip if right mouse button or if controls should handle this
        if (event.button !== 0) return;
        
        // Update mouse coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Check for modifiers
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;
        
        if (isShiftPressed && !isCtrlPressed) {
            // Start box selection
            this.startBoxSelection(event);
        } else {
            // Regular click selection
            this.handleClickSelection(isCtrlPressed);
        }
    }

    /**
     * Handle mouse move events
     */
    onMouseMove(event) {
        if (this.isBoxSelecting) {
            this.updateBoxSelection(event);
        }
    }

    /**
     * Handle mouse up events
     */
    onMouseUp(event) {
        if (this.isBoxSelecting) {
            this.endBoxSelection();
        }
    }

    /**
     * Handle keyboard events
     */
    onKeyDown(event) {
        switch (event.key) {
            case 'Escape':
                this.clearSelection();
                break;
            case 'a':
            case 'A':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.selectAll();
                }
                break;
            case 'Delete':
            case 'Backspace':
                if (this.selectedObjects.size > 0) {
                    this.deleteSelected();
                }
                break;
        }
    }

    /**
     * Handle key up events
     */
    onKeyUp(event) {
        // Handle any key up events if needed
    }

    /**
     * Handle click selection
     */
    handleClickSelection(isMultiSelect) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get all selectable objects (nodes and edges)
        const selectableObjects = [];
        this.scene.traverse((object) => {
            if (object.userData && (object.userData.type === 'node' || object.userData.type === 'edge')) {
                selectableObjects.push(object);
            }
        });
        
        const intersects = this.raycaster.intersectObjects(selectableObjects);
        
        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;
            
            if (isMultiSelect) {
                this.toggleSelection(selectedObject);
            } else {
                this.setSingleSelection(selectedObject);
            }
        } else if (!isMultiSelect) {
            this.clearSelection();
        }
    }

    /**
     * Start box selection
     */
    startBoxSelection(event) {
        this.isBoxSelecting = true;
        this.selectionMode = 'box';
        
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.boxSelectStart.x = event.clientX - rect.left;
        this.boxSelectStart.y = event.clientY - rect.top;
        
        this.boxSelectDiv.style.left = this.boxSelectStart.x + 'px';
        this.boxSelectDiv.style.top = this.boxSelectStart.y + 'px';
        this.boxSelectDiv.style.width = '0px';
        this.boxSelectDiv.style.height = '0px';
        this.boxSelectDiv.style.display = 'block';
    }

    /**
     * Update box selection
     */
    updateBoxSelection(event) {
        if (!this.isBoxSelecting) return;
        
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.boxSelectEnd.x = event.clientX - rect.left;
        this.boxSelectEnd.y = event.clientY - rect.top;
        
        const left = Math.min(this.boxSelectStart.x, this.boxSelectEnd.x);
        const top = Math.min(this.boxSelectStart.y, this.boxSelectEnd.y);
        const width = Math.abs(this.boxSelectEnd.x - this.boxSelectStart.x);
        const height = Math.abs(this.boxSelectEnd.y - this.boxSelectStart.y);
        
        this.boxSelectDiv.style.left = left + 'px';
        this.boxSelectDiv.style.top = top + 'px';
        this.boxSelectDiv.style.width = width + 'px';
        this.boxSelectDiv.style.height = height + 'px';
    }

    /**
     * End box selection
     */
    endBoxSelection() {
        this.isBoxSelecting = false;
        this.boxSelectDiv.style.display = 'none';
        
        // Find objects within selection box
        const selectedInBox = this.getObjectsInSelectionBox();
        
        // Add to selection
        selectedInBox.forEach(obj => this.addToSelection(obj));
        
        this.selectionMode = 'multi';
        this.updateVisualFeedback();
    }

    /**
     * Get objects within selection box
     */
    getObjectsInSelectionBox() {
        const selected = [];
        const rect = this.renderer.domElement.getBoundingClientRect();
        
        // Convert box coordinates to normalized device coordinates
        const boxMin = new THREE.Vector2(
            ((Math.min(this.boxSelectStart.x, this.boxSelectEnd.x)) / rect.width) * 2 - 1,
            -((Math.max(this.boxSelectStart.y, this.boxSelectEnd.y)) / rect.height) * 2 + 1
        );
        const boxMax = new THREE.Vector2(
            ((Math.max(this.boxSelectStart.x, this.boxSelectEnd.x)) / rect.width) * 2 - 1,
            -((Math.min(this.boxSelectStart.y, this.boxSelectEnd.y)) / rect.height) * 2 + 1
        );
        
        // Check each selectable object
        this.scene.traverse((object) => {
            if (object.userData && (object.userData.type === 'node' || object.userData.type === 'edge')) {
                const screenPos = this.getScreenPosition(object);
                
                if (screenPos.x >= boxMin.x && screenPos.x <= boxMax.x &&
                    screenPos.y >= boxMin.y && screenPos.y <= boxMax.y) {
                    selected.push(object);
                }
            }
        });
        
        return selected;
    }

    /**
     * Get screen position of object
     */
    getScreenPosition(object) {
        const vector = new THREE.Vector3();
        
        if (object.userData.type === 'node') {
            vector.copy(object.position);
        } else if (object.userData.type === 'edge') {
            // Use midpoint of edge
            const edge = object.userData.edge;
            if (edge && edge.startNode && edge.endNode) {
                vector.copy(edge.startNode.mesh.position);
                vector.add(edge.endNode.mesh.position);
                vector.multiplyScalar(0.5);
            } else {
                vector.copy(object.position);
            }
        }
        
        vector.project(this.camera);
        return new THREE.Vector2(vector.x, vector.y);
    }

    /**
     * Set single selection
     */
    setSingleSelection(object) {
        this.clearSelection();
        this.addToSelection(object);
        this.selectionMode = 'single';
        this.updateVisualFeedback();
    }

    /**
     * Toggle selection of object
     */
    toggleSelection(object) {
        if (this.selectedObjects.has(object)) {
            this.removeFromSelection(object);
        } else {
            this.addToSelection(object);
        }
        this.selectionMode = 'multi';
        this.updateVisualFeedback();
    }

    /**
     * Add object to selection
     */
    addToSelection(object) {
        this.selectedObjects.add(object);
        
        // Update state manager for compatibility
        if (this.selectedObjects.size === 1) {
            this.stateManager.setSelectedObject(object);
        }
    }

    /**
     * Remove object from selection
     */
    removeFromSelection(object) {
        this.selectedObjects.delete(object);
        this.removeSelectionBox(object);
        
        // Update state manager
        if (this.selectedObjects.size === 0) {
            this.stateManager.setSelectedObject(null);
        } else if (this.selectedObjects.size === 1) {
            this.stateManager.setSelectedObject(Array.from(this.selectedObjects)[0]);
        }
    }

    /**
     * Clear all selections
     */
    clearSelection() {
        this.selectedObjects.forEach(obj => this.removeSelectionBox(obj));
        this.selectedObjects.clear();
        this.selectionMode = 'single';
        this.stateManager.setSelectedObject(null);
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
        let geometry;
        let scale = 1.1;
        
        if (object.userData.type === 'node') {
            // Create box around node
            const boundingBox = new THREE.Box3().setFromObject(object);
            const size = boundingBox.getSize(new THREE.Vector3());
            geometry = new THREE.BoxGeometry(size.x * scale, size.y * scale, size.z * scale);
        } else if (object.userData.type === 'edge') {
            // Create tube around edge that matches the actual edge geometry
            const edge = object.userData.edge;
            if (edge && edge.startNode && edge.endNode) {
                // Use the same curve as the original edge
                const start = edge.startNode.mesh.position.clone();
                const end = edge.endNode.mesh.position.clone();
                const midPoint = new THREE.Vector3(
                    (start.x + end.x) / 2,
                    (start.y + end.y) / 2 + (edge.options.curveHeight || 2),
                    (start.z + end.z) / 2
                );
                
                // Add offset if present
                if (edge.options.offset !== 0) {
                    const direction = new THREE.Vector3().subVectors(end, start).normalize();
                    const offsetDirection = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
                    midPoint.addScaledVector(offsetDirection, edge.options.offset);
                }
                
                const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
                const radius = (edge.options.radius || 0.2) * 1.5; // Slightly larger than original
                geometry = new THREE.TubeGeometry(curve, 8, radius, 6, false);
            } else {
                geometry = new THREE.BoxGeometry(1, 1, 1);
            }
        }
        
        const selectionBox = new THREE.Mesh(geometry, this.selectionBoxMaterial);
        
        // For nodes, copy position directly
        if (object.userData.type === 'node') {
            selectionBox.position.copy(object.position);
        }
        // For edges with TubeGeometry, no positioning needed - curve is already in world coordinates
        
        this.selectionBoxes.set(object, selectionBox);
        this.scene.add(selectionBox);
    }

    /**
     * Remove selection box for object
     */
    removeSelectionBox(object) {
        const box = this.selectionBoxes.get(object);
        if (box) {
            this.scene.remove(box);
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