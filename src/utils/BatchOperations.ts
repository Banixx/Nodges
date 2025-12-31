import * as THREE from 'three';
import { SelectionManager } from './SelectionManager';
import { NodeGroupManager } from './NodeGroupManager';
// import { NodeObject } from '../types';

interface Operation {
    type: string;
    timestamp: number;
    objects: any[];
    [key: string]: any;
}

interface BatchNodeObject extends THREE.Object3D {
    userData: {
        node?: any;
        edge?: any;
        type?: string;
        [key: string]: any;
    };
    material: THREE.Material | THREE.MeshBasicMaterial | THREE.MeshPhongMaterial; // Broaden type to allow color access
}

/**
 * BatchOperations - Handles batch operations on multiple selected objects
 * Supports: Color changes, grouping, transformations, property modifications
 */
export class BatchOperations {
    private selectionManager: SelectionManager;
    private nodeGroupManager: NodeGroupManager;
    private operationHistory: Operation[];
    private maxHistorySize: number;

    constructor(selectionManager: SelectionManager, nodeGroupManager: NodeGroupManager) {
        this.selectionManager = selectionManager;
        this.nodeGroupManager = nodeGroupManager;

        // Operation history for undo functionality
        this.operationHistory = [];
        this.maxHistorySize = 50;
    }

    /**
     * Change color of selected objects
     */
    changeColor(color: number) {
        const selectedObjects = this.selectionManager.getSelectedObjects() as BatchNodeObject[];
        if (selectedObjects.length === 0) return;

        const operation: Operation = {
            type: 'color_change',
            objects: [],
            timestamp: Date.now()
        };

        selectedObjects.forEach(object => {
            // Store original color for undo
            let originalColor = 0xffffff;
            if (object.material && 'color' in object.material) {
                originalColor = (object.material as any).color.getHex();
                (object.material as any).color.setHex(color);
            }

            operation.objects.push({
                object: object,
                originalColor: originalColor,
                newColor: color
            });

            // Update object's stored color if it's a node or edge
            if (object.userData.node) {
                object.userData.node.options.color = color;
            } else if (object.userData.edge) {
                object.userData.edge.options.color = color;
            }
        });

        this.addToHistory(operation);
    }

    /**
     * Change size of selected nodes
     */
    changeSize(size: number) {
        const selectedNodes = this.selectionManager.getSelectedNodes() as BatchNodeObject[];
        if (selectedNodes.length === 0) return;

        const operation: Operation = {
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
    }

    /**
     * Change type of selected nodes
     */
    changeNodeType(type: string) {
        const selectedNodes = this.selectionManager.getSelectedNodes() as BatchNodeObject[];
        if (selectedNodes.length === 0) return;

        const operation: Operation = {
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

            // Apply new type (this might need checking if setType exists on node)
            if (typeof node.setType === 'function') {
                node.setType(type);
            } else {
                node.options.type = type; // Fallback
            }
        });

        this.addToHistory(operation);
    }

    /**
     * Move selected objects by offset
     */
    moveObjects(offset: THREE.Vector3) {
        const selectedObjects = this.selectionManager.getSelectedObjects();
        if (selectedObjects.length === 0) return;

        const operation: Operation = {
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
    }

    /**
     * Scale selected objects
     */
    scaleObjects(scaleFactor: number) {
        const selectedObjects = this.selectionManager.getSelectedObjects();
        if (selectedObjects.length === 0) return;

        const operation: Operation = {
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
    }

    /**
     * Add selected nodes to a group
     */
    addToGroup(groupId: string) {
        if (!this.nodeGroupManager) {
            console.warn('NodeGroupManager not available');
            return;
        }

        const selectedNodes = this.selectionManager.getSelectedNodes() as BatchNodeObject[];
        if (selectedNodes.length === 0) return;

        const operation: Operation = {
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
    }

    /**
     * Remove selected nodes from their groups
     */
    removeFromGroups() {
        if (!this.nodeGroupManager) {
            console.warn('NodeGroupManager not available');
            return;
        }

        const selectedNodes = this.selectionManager.getSelectedNodes() as BatchNodeObject[];
        if (selectedNodes.length === 0) return;

        const operation: Operation = {
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
    }

    /**
     * Set property for selected objects
     */
    setProperty(property: string, value: any) {
        const selectedObjects = this.selectionManager.getSelectedObjects() as BatchNodeObject[];
        if (selectedObjects.length === 0) return;

        const operation: Operation = {
            type: 'property_change',
            property: property,
            objects: [],
            timestamp: Date.now()
        };

        selectedObjects.forEach(object => {
            let target: any = null;
            let originalValue: any = undefined;

            if (object.userData.node) {
                target = object.userData.node.metadata;
                originalValue = target ? target[property] : undefined;
            } else if (object.userData.edge) {
                target = object.userData.edge.metadata;
                originalValue = target ? target[property] : undefined;
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
    }

    /**
     * Align selected objects
     */
    alignObjects(axis: 'x' | 'y' | 'z', mode: 'min' | 'max' | 'center' | 'average' = 'center') {
        const selectedObjects = this.selectionManager.getSelectedObjects();
        if (selectedObjects.length < 2) return;

        // Calculate alignment position
        let alignPosition: number;
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

        const operation: Operation = {
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
    }

    /**
     * Distribute selected objects evenly
     */
    distributeObjects(axis: 'x' | 'y' | 'z') {
        const selectedObjects = this.selectionManager.getSelectedObjects();
        if (selectedObjects.length < 3) return;

        // Sort objects by position on the specified axis
        const sortedObjects = selectedObjects.slice().sort((a, b) => a.position[axis] - b.position[axis]);

        const firstPos = sortedObjects[0].position[axis];
        const lastPos = sortedObjects[sortedObjects.length - 1].position[axis];
        const totalDistance = lastPos - firstPos;
        const step = totalDistance / (sortedObjects.length - 1);

        const operation: Operation = {
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
    }

    /**
     * Copy selected objects
     */
    copyObjects(offset: THREE.Vector3 = new THREE.Vector3(2, 0, 0)) {
        const selectedObjects = this.selectionManager.getSelectedObjects() as BatchNodeObject[];
        if (selectedObjects.length === 0) return;

        const copies: any[] = [];

        selectedObjects.forEach(object => {
            if (object.userData.type === 'node') {
                const copy = this.copyNode(object, offset);
                if (copy) copies.push(copy);
            }
            // Note: Edge copying is more complex as it requires node relationships
        });

        return copies;
    }

    /**
     * Copy a node
     */
    copyNode(nodeObject: BatchNodeObject, offset: THREE.Vector3) {
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
        const selectedObjects = this.selectionManager.getSelectedObjects() as BatchNodeObject[];
        const nodes = this.selectionManager.getSelectedNodes() as BatchNodeObject[];
        const edges = this.selectionManager.getSelectedEdges() as BatchNodeObject[];

        const stats: any = {
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
     */
    addToHistory(operation: Operation) {
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

        const operation = this.operationHistory.pop()!;

        switch (operation.type) {
            case 'color_change':
                operation.objects.forEach(({ object, originalColor }) => {
                    if (object.material && 'color' in object.material) {
                        (object.material as any).color.setHex(originalColor);
                    }
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
