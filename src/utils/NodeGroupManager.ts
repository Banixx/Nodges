import * as THREE from 'three';
import { StateManager } from '../core/StateManager';
import { NodeObject } from '../types';

interface GroupOutline {
    enabled: boolean;
    thickness: number;
    color: number;
}

interface GroupData {
    id: string;
    name: string;
    color: number;
    outline: GroupOutline;
    nodes: NodeObject[];
}

interface NodeGroupNode extends NodeObject {
    groupId?: string;
    originalColor?: number;
    mesh: THREE.Mesh;
    options: {
        color: number;
        type: string;
        [key: string]: any;
    };
}

/**
 * Manages node grouping functionality and visual indicators
 */
export class NodeGroupManager {
    private scene: THREE.Scene;
    private stateManager: StateManager;
    private groups: Map<string, GroupData>;
    private nodeGroups: Map<string | number, string>;
    private outlineObjects: Map<string | number, THREE.Mesh>;
    private defaultColors: number[];

    constructor(scene: THREE.Scene, stateManager: StateManager) {
        this.scene = scene;
        this.stateManager = stateManager;
        this.groups = new Map(); // Map of group ID to group data
        this.nodeGroups = new Map(); // Map of node ID to group ID
        this.outlineObjects = new Map(); // Map of node ID to outline mesh

        // Default group colors
        this.defaultColors = [
            0xff0000, // Red
            0x00ff00, // Green
            0x0000ff, // Blue
            0xffff00, // Yellow
            0xff00ff, // Magenta
            0x00ffff, // Cyan
            0xffa500, // Orange
            0x800080, // Purple
            0x008000, // Dark Green
            0x000080  // Navy
        ];
    }

    /**
     * Create a new group
     */
    createGroup(groupData: Partial<GroupData> = {}): string {
        const groupId = `group_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // Set default color if not provided
        let color = groupData.color;
        if (!color) {
            const groupCount = this.groups.size;
            color = this.defaultColors[groupCount % this.defaultColors.length];
        }

        // Set default outline properties if not provided
        let outline = groupData.outline;
        if (!outline) {
            outline = {
                enabled: true,
                thickness: 0.05,
                color: color
            };
        }

        this.groups.set(groupId, {
            id: groupId,
            name: groupData.name || `Group ${this.groups.size + 1}`,
            color: color,
            outline: outline,
            nodes: []
        });

        return groupId;
    }

    /**
     * Add a node to a group
     */
    addNodeToGroup(node: NodeGroupNode, groupId: string) {
        if (!this.groups.has(groupId)) {
            return;
        }

        // Remove node from any existing group
        this.removeNodeFromGroup(node);

        // Add node to the specified group
        const group = this.groups.get(groupId)!;
        group.nodes.push(node);
        this.nodeGroups.set(node.nodeData.id, groupId);
        node.groupId = groupId; // Store on node as well

        // Apply visual indicators
        this.applyGroupVisualIndicators(node, group);
    }

    /**
     * Remove a node from its current group
     */
    removeNodeFromGroup(node: NodeGroupNode) {
        const groupId = this.nodeGroups.get(node.nodeData.id);
        if (!groupId) return;

        // Remove node from group
        const group = this.groups.get(groupId);
        if (group) {
            group.nodes = group.nodes.filter(n => n.nodeData.id !== node.nodeData.id);
        }

        this.nodeGroups.delete(node.nodeData.id);
        delete node.groupId;

        // Remove visual indicators
        this.removeGroupVisualIndicators(node);
    }

    /**
     * Apply visual indicators (color coding and outline) to a node based on its group
     */
    applyGroupVisualIndicators(node: NodeGroupNode, group: GroupData) {
        // Apply color coding
        if (group.color) {
            if (node.mesh && node.mesh.material instanceof THREE.MeshBasicMaterial || node.mesh.material instanceof THREE.MeshPhongMaterial || node.mesh.material instanceof THREE.MeshLambertMaterial) {
                node.mesh.material.color.setHex(group.color);
            }
            node.originalColor = group.color; // Update original color reference
        }

        // Apply outline if enabled
        if (group.outline && group.outline.enabled) {
            this.createOrUpdateOutline(node, group);
        }
    }

    /**
     * Remove visual indicators from a node
     */
    removeGroupVisualIndicators(node: NodeGroupNode) {
        // Reset color to default
        if (node.options && node.options.color) {
            if (node.mesh && (node.mesh.material instanceof THREE.MeshBasicMaterial || node.mesh.material instanceof THREE.MeshPhongMaterial || node.mesh.material instanceof THREE.MeshLambertMaterial)) {
                node.mesh.material.color.setHex(node.options.color);
            }
            node.originalColor = node.options.color;
        }

        // Remove outline
        this.removeOutline(node);
    }

    /**
     * Create or update the outline for a node
     */
    createOrUpdateOutline(node: NodeGroupNode, group: GroupData) {
        // Remove existing outline if any
        this.removeOutline(node);

        const mesh = node.mesh;
        if (!mesh || !mesh.geometry) return;

        // Create a slightly larger geometry for the outline
        const outlineGeometry = mesh.geometry.clone();
        const outlineScale = 1 + (group.outline.thickness || 0.05);

        // Create outline material
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: group.outline.color || group.color,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.8
        });

        // Create outline mesh
        const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outlineMesh.scale.set(outlineScale, outlineScale, outlineScale);
        outlineMesh.position.copy(mesh.position);
        outlineMesh.quaternion.copy(mesh.quaternion);
        outlineMesh.userData.isOutline = true;

        // Add outline mesh to scene
        this.scene.add(outlineMesh);

        // Store reference to outline mesh
        this.outlineObjects.set(node.nodeData.id, outlineMesh);
    }

    /**
     * Remove the outline from a node
     */
    removeOutline(node: NodeGroupNode) {
        const outlineMesh = this.outlineObjects.get(node.nodeData.id);
        if (outlineMesh) {
            this.scene.remove(outlineMesh);
            outlineMesh.geometry.dispose();
            if (outlineMesh.material instanceof THREE.Material) {
                outlineMesh.material.dispose();
            }
            this.outlineObjects.delete(node.nodeData.id);
        }
    }

    /**
     * Update the outline position and rotation for a node
     * Called during animation loop to keep outlines in sync with nodes
     */
    updateOutlines() {
        this.outlineObjects.forEach((outlineMesh, nodeId) => {
            // Find the node with this ID
            const node = this.findNodeById(nodeId);
            if (node && node.mesh) {
                // Update position and rotation
                outlineMesh.position.copy(node.mesh.position);
                outlineMesh.quaternion.copy(node.mesh.quaternion);

                // Update visibility to match the node
                outlineMesh.visible = node.mesh.visible;

                // If the node is selected, make the outline more visible
                if (this.stateManager && this.stateManager.state.selectedObject === node.mesh) {
                    if (outlineMesh.material instanceof THREE.Material) {
                        outlineMesh.material.opacity = 1.0;
                    }
                } else {
                    if (outlineMesh.material instanceof THREE.Material) {
                        outlineMesh.material.opacity = 0.8;
                    }
                }
            }
        });
    }

    /**
     * Find a node by its ID
     */
    findNodeById(nodeId: string | number): NodeGroupNode | null {
        // Search for the node in the scene
        let foundNode: NodeGroupNode | null = null;

        this.scene.traverse((object: THREE.Object3D) => {
            if (object.userData &&
                object.userData.type === 'node' &&
                object.userData.node &&
                object.userData.node.nodeData &&
                object.userData.node.nodeData.id === nodeId) {
                foundNode = object.userData.node as NodeGroupNode;
            }
        });

        return foundNode;
    }

    /**
     * Get all groups
     */
    getAllGroups(): GroupData[] {
        return Array.from(this.groups.values());
    }

    /**
     * Get the group a node belongs to
     */
    getNodeGroup(node: NodeGroupNode): GroupData | null {
        const groupId = this.nodeGroups.get(node.nodeData.id);
        return groupId ? this.groups.get(groupId) || null : null;
    }

    /**
     * Update a group's properties
     */
    updateGroup(groupId: string, groupData: Partial<GroupData>) {
        if (!this.groups.has(groupId)) {
            console.warn(`Group with ID ${groupId} does not exist`);
            return;
        }

        const group = this.groups.get(groupId)!;
        const updatedGroup = { ...group, ...groupData };
        this.groups.set(groupId, updatedGroup);

        // Update visual indicators for all nodes in the group
        updatedGroup.nodes.forEach(node => {
            this.applyGroupVisualIndicators(node as NodeGroupNode, updatedGroup);
        });
    }

    /**
     * Delete a group and remove all nodes from it
     */
    deleteGroup(groupId: string) {
        if (!this.groups.has(groupId)) {
            console.warn(`Group with ID ${groupId} does not exist`);
            return;
        }

        const group = this.groups.get(groupId)!;

        // Remove all nodes from the group
        group.nodes.forEach(node => {
            this.removeNodeFromGroup(node as NodeGroupNode);
        });

        // Delete the group
        this.groups.delete(groupId);
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Remove all outlines
        this.outlineObjects.forEach((outlineMesh) => {
            this.scene.remove(outlineMesh);
            outlineMesh.geometry.dispose();
            if (outlineMesh.material instanceof THREE.Material) {
                outlineMesh.material.dispose();
            }
        });

        this.outlineObjects.clear();
        this.nodeGroups.clear();
        this.groups.clear();
    }
}
