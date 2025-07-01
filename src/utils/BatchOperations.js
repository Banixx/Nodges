/**
 * BatchOperations - Handles batch operations on multiple selected objects
 * Supports: Color changes, grouping, transformations, property modifications
 */

import * as THREE from 'three';

export class BatchOperations {
    constructor(selectionManager, nodeGroupManager) {
        this.selectionManager = selectionManager;
        this.nodeGroupManager = nodeGroupManager;
        
        // Operation history for undo functionality
        this.operationHistory = [];
        this.maxHistorySize = 50;
    }

    /**
     * Change color of selected objects
     * @param {number} color - New color as hex number
     */
    changeColor(color) {
        const selectedObjects = this.selectionManager.getSelectedObjects();
        if (selectedObjects.length === 0) return;

        const operation = {
            type: 'color_change',
            objects: [],
            timestamp: Date.now()
        };

        selectedObjects.forEach(object => {
            // Store original color for undo
            const originalColor = object.material.color.getHex();
            operation.objects.push({
                object: object,
                originalColor: originalColor,
                newColor: color
            });

            // Apply new color
            object.material.color.setHex(color);
            
            // Update object's stored color if it's a node or edge
            if (object.userData.node) {
                object.userData.node.options.color = color;
            } else if (object.userData.edge) {
                object.userData.edge.options.color = color;
            }
        });

        this.addToHistory(operation);
        console.log(`Changed color of ${selectedObjects.length} objects to #${color.toString(16).padStart(6, '0')}`);
    }

    /**
     * Change size of selected nodes
     * @param {number} size - New size
     */
    changeSize(size) {
        const selectedNodes = this.selectionManager.getSelectedNodes();
        if (selectedNodes.length === 0) return;

        const operation = {
            type: 'size_change',
            objects: [],
            timestamp: Date.now()
        };

        selectedNodes.forEach(nodeObject => {
            const node = nodeObject.userData.node;
            if (!node) return;

            // Store original size
            const originalSize = node.options.size;
            operation.objects.push({
                object: nodeObject,
                originalSize: originalSize,
                newSize: size
            });

            // Apply new size
            const scale = size / originalSize;
            nodeObject.scale.multiplyScalar(scale);
            node.options.size = size;
        });

        this.addToHistory(operation);
        console.log(`Changed size of ${selectedNodes.length} nodes to ${size}`);
    }

    /**
     * Change type of selected nodes
     * @param {string} type - New node type
     */
    changeNodeType(type) {
        const selectedNodes = this.selectionManager.getSelectedNodes();
        if (selectedNodes.length === 0) return;

        const operation = {
            type: 'type_change',
            objects: [],
            timestamp: Date.now()
        };

        selectedNodes.forEach(nodeObject => {
            const node = nodeObject.userData.node;
            if (!node) return;

            // Store original type
            const originalType = node.options.type;
            operation.objects.push({
                object: nodeObject,
                originalType: originalType,
                newType: type
            });

            // Apply new type (this requires recreating the geometry)
            node.setType(type);
        });

        this.addToHistory(operation);
        console.log(`Changed type of ${selectedNodes.length} nodes to ${type}`);
    }

    /**
     * Move selected objects by offset
     * @param {THREE.Vector3} offset - Movement offset
     */
    moveObjects(offset) {
        const selectedObjects = this.selectionManager.getSelectedObjects();
        if (selectedObjects.length === 0) return;

        const operation = {
            type: 'move',
            objects: [],
            offset: offset.clone(),
            timestamp: Date.now()
        };

        selectedObjects.forEach(object => {
            operation.objects.push({
                object: object,
                originalPosition: object.position.clone()
            });

            object.position.add(offset);
        });

        this.addToHistory(operation);
        console.log(`Moved ${selectedObjects.length} objects by (${offset.x}, ${offset.y}, ${offset.z})`);
    }

    /**
     * Scale selected objects
     * @param {number} scaleFactor - Scale factor
     */
    scaleObjects(scaleFactor) {
        const selectedObjects = this.selectionManager.getSelectedObjects();
        if (selectedObjects.length === 0) return;

        const operation = {
            type: 'scale',
            objects: [],
            scaleFactor: scaleFactor,
            timestamp: Date.now()
        };

        selectedObjects.forEach(object => {
            operation.objects.push({
                object: object,
                originalScale: object.scale.clone()
            });

            object.scale.multiplyScalar(scaleFactor);
        });

        this.addToHistory(operation);
        console.log(`Scaled ${selectedObjects.length} objects by factor ${scaleFactor}`);
    }

    /**
     * Add selected nodes to a group
     * @param {string} groupId - Group ID
     */
    addToGroup(groupId) {
        if (!this.nodeGroupManager) {
            console.warn('NodeGroupManager not available');
            return;
        }

        const selectedNodes = this.selectionManager.getSelectedNodes();
        if (selectedNodes.length === 0) return;

        const operation = {
            type: 'group_add',
            objects: [],
            groupId: groupId,
            timestamp: Date.now()
        };

        selectedNodes.forEach(nodeObject => {
            const node = nodeObject.userData.node;
            if (!node) return;

            operation.objects.push({
                object: nodeObject,
                node: node,
                previousGroupId: node.groupId
            });

            this.nodeGroupManager.addNodeToGroup(node, groupId);
        });

        this.addToHistory(operation);
        console.log(`Added ${selectedNodes.length} nodes to group ${groupId}`);
    }

    /**
     * Remove selected nodes from their groups
     */
    removeFromGroups() {
        if (!this.nodeGroupManager) {
            console.warn('NodeGroupManager not available');
            return;
        }

        const selectedNodes = this.selectionManager.getSelectedNodes();
        if (selectedNodes.length === 0) return;

        const operation = {
            type: 'group_remove',
            objects: [],
            timestamp: Date.now()
        };

        selectedNodes.forEach(nodeObject => {
            const node = nodeObject.userData.node;
            if (!node || !node.groupId) return;

            operation.objects.push({
                object: nodeObject,
                node: node,
                previousGroupId: node.groupId
            });

            this.nodeGroupManager.removeNodeFromGroup(node);
        });

        this.addToHistory(operation);
        console.log(`Removed ${operation.objects.length} nodes from their groups`);
    }

    /**
     * Set property for selected objects
     * @param {string} property - Property name
     * @param {*} value - Property value
     */
    setProperty(property, value) {
        const selectedObjects = this.selectionManager.getSelectedObjects();
        if (selectedObjects.length === 0) return;

        const operation = {
            type: 'property_change',
            property: property,
            objects: [],
            timestamp: Date.now()
        };

        selectedObjects.forEach(object => {
            let target = null;
            let originalValue = undefined;

            if (object.userData.node) {
                target = object.userData.node.metadata;
                originalValue = target[property];
            } else if (object.userData.edge) {
                target = object.userData.edge.metadata;
                originalValue = target[property];
            }

            if (target) {
                operation.objects.push({
                    object: object,
                    target: target,
                    originalValue: originalValue
                });

                target[property] = value;
            }
        });

        this.addToHistory(operation);
        console.log(`Set property '${property}' to '${value}' for ${operation.objects.length} objects`);
    }

    /**
     * Align selected objects
     * @param {string} axis - Alignment axis ('x', 'y', 'z')
     * @param {string} mode - Alignment mode ('min', 'max', 'center', 'average')
     */
    alignObjects(axis, mode = 'center') {
        const selectedObjects = this.selectionManager.getSelectedObjects();
        if (selectedObjects.length < 2) return;

        // Calculate alignment position
        let alignPosition;
        const positions = selectedObjects.map(obj => obj.position[axis]);

        switch (mode) {
            case 'min':
                alignPosition = Math.min(...positions);
                break;
            case 'max':
                alignPosition = Math.max(...positions);
                break;
            case 'average':
                alignPosition = positions.reduce((a, b) => a + b, 0) / positions.length;
                break;
            case 'center':
            default:
                alignPosition = (Math.min(...positions) + Math.max(...positions)) / 2;
                break;
        }

        const operation = {
            type: 'align',
            axis: axis,
            mode: mode,
            alignPosition: alignPosition,
            objects: [],
            timestamp: Date.now()
        };

        selectedObjects.forEach(object => {
            operation.objects.push({
                object: object,
                originalPosition: object.position.clone()
            });

            object.position[axis] = alignPosition;
        });

        this.addToHistory(operation);
        console.log(`Aligned ${selectedObjects.length} objects on ${axis}-axis (${mode})`);
    }

    /**
     * Distribute selected objects evenly
     * @param {string} axis - Distribution axis ('x', 'y', 'z')
     */
    distributeObjects(axis) {
        const selectedObjects = this.selectionManager.getSelectedObjects();
        if (selectedObjects.length < 3) return;

        // Sort objects by position on the specified axis
        const sortedObjects = selectedObjects.slice().sort((a, b) => a.position[axis] - b.position[axis]);
        
        const firstPos = sortedObjects[0].position[axis];
        const lastPos = sortedObjects[sortedObjects.length - 1].position[axis];
        const totalDistance = lastPos - firstPos;
        const step = totalDistance / (sortedObjects.length - 1);

        const operation = {
            type: 'distribute',
            axis: axis,
            objects: [],
            timestamp: Date.now()
        };

        sortedObjects.forEach((object, index) => {
            operation.objects.push({
                object: object,
                originalPosition: object.position.clone()
            });

            if (index > 0 && index < sortedObjects.length - 1) {
                object.position[axis] = firstPos + (step * index);
            }
        });

        this.addToHistory(operation);
        console.log(`Distributed ${selectedObjects.length} objects on ${axis}-axis`);
    }

    /**
     * Copy selected objects
     * @param {THREE.Vector3} offset - Offset for copies
     */
    copyObjects(offset = new THREE.Vector3(2, 0, 0)) {
        const selectedObjects = this.selectionManager.getSelectedObjects();
        if (selectedObjects.length === 0) return;

        const copies = [];

        selectedObjects.forEach(object => {
            if (object.userData.type === 'node') {
                const copy = this.copyNode(object, offset);
                if (copy) copies.push(copy);
            }
            // Note: Edge copying is more complex as it requires node relationships
        });

        console.log(`Created ${copies.length} copies`);
        return copies;
    }

    /**
     * Copy a node
     * @param {THREE.Object3D} nodeObject - Node to copy
     * @param {THREE.Vector3} offset - Position offset
     */
    copyNode(nodeObject, offset) {
        const node = nodeObject.userData.node;
        if (!node) return null;

        // Create new position
        const newPosition = {
            x: node.position.x + offset.x,
            y: node.position.y + offset.y,
            z: node.position.z + offset.z,
            id: `copy_${node.id}_${Date.now()}`,
            name: `${node.mesh.name} (Copy)`,
            metadata: { ...node.metadata }
        };

        // Create new node (this would need to be integrated with the main application)
        // For now, we'll just return the position data
        return newPosition;
    }

    /**
     * Get statistics about selected objects
     */
    getSelectionStatistics() {
        const selectedObjects = this.selectionManager.getSelectedObjects();
        const nodes = this.selectionManager.getSelectedNodes();
        const edges = this.selectionManager.getSelectedEdges();

        const stats = {
            total: selectedObjects.length,
            nodes: nodes.length,
            edges: edges.length,
            nodeTypes: {},
            edgeTypes: {},
            colors: {},
            groups: {}
        };

        // Analyze nodes
        nodes.forEach(nodeObject => {
            const node = nodeObject.userData.node;
            if (node) {
                // Count node types
                const type = node.options.type;
                stats.nodeTypes[type] = (stats.nodeTypes[type] || 0) + 1;

                // Count colors
                const color = node.options.color.toString(16);
                stats.colors[color] = (stats.colors[color] || 0) + 1;

                // Count groups
                if (node.groupId) {
                    stats.groups[node.groupId] = (stats.groups[node.groupId] || 0) + 1;
                }
            }
        });

        // Analyze edges
        edges.forEach(edgeObject => {
            const edge = edgeObject.userData.edge;
            if (edge) {
                // Count edge types
                const type = edge.options.style;
                stats.edgeTypes[type] = (stats.edgeTypes[type] || 0) + 1;
            }
        });

        return stats;
    }

    /**
     * Add operation to history
     * @param {Object} operation - Operation to add
     */
    addToHistory(operation) {
        this.operationHistory.push(operation);
        
        // Limit history size
        if (this.operationHistory.length > this.maxHistorySize) {
            this.operationHistory.shift();
        }
    }

    /**
     * Undo last operation
     */
    undo() {
        if (this.operationHistory.length === 0) return;

        const operation = this.operationHistory.pop();
        
        switch (operation.type) {
            case 'color_change':
                operation.objects.forEach(({ object, originalColor }) => {
                    object.material.color.setHex(originalColor);
                });
                break;
                
            case 'size_change':
                operation.objects.forEach(({ object, originalSize, newSize }) => {
                    const scale = originalSize / newSize;
                    object.scale.multiplyScalar(scale);
                });
                break;
                
            case 'move':
                operation.objects.forEach(({ object, originalPosition }) => {
                    object.position.copy(originalPosition);
                });
                break;
                
            case 'scale':
                operation.objects.forEach(({ object, originalScale }) => {
                    object.scale.copy(originalScale);
                });
                break;
                
            case 'align':
            case 'distribute':
                operation.objects.forEach(({ object, originalPosition }) => {
                    object.position.copy(originalPosition);
                });
                break;
                
            case 'property_change':
                operation.objects.forEach(({ target, originalValue }) => {
                    if (originalValue !== undefined) {
                        target[operation.property] = originalValue;
                    } else {
                        delete target[operation.property];
                    }
                });
                break;
        }

        console.log(`Undid operation: ${operation.type}`);
    }

    /**
     * Clear operation history
     */
    clearHistory() {
        this.operationHistory = [];
    }

    /**
     * Get operation history
     */
    getHistory() {
        return this.operationHistory.slice(); // Return copy
    }
}