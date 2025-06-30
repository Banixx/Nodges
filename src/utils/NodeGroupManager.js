import * as THREE from 'three';

/**
 * Manages node grouping functionality and visual indicators
 */
export class NodeGroupManager {
    constructor(scene, stateManager) {
        this.scene = scene;
        this.stateManager = stateManager;
        this.groups = new Map(); // Map of group ID to group data
        this.nodeGroups = new Map(); // Map of node ID to group ID
        this.outlineMaterials = new Map(); // Map of group ID to outline material
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
     * @param {Object} groupData - Group data including name, color, and outline properties
     * @returns {string} - The ID of the created group
     */
    createGroup(groupData = {}) {
        const groupId = `group_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Set default color if not provided
        if (!groupData.color) {
            const groupCount = this.groups.size;
            groupData.color = this.defaultColors[groupCount % this.defaultColors.length];
        }
        
        // Set default outline properties if not provided
        if (!groupData.outline) {
            groupData.outline = {
                enabled: true,
                thickness: 0.05,
                color: groupData.color
            };
        }
        
        this.groups.set(groupId, {
            id: groupId,
            name: groupData.name || `Group ${this.groups.size + 1}`,
            color: groupData.color,
            outline: groupData.outline,
            nodes: []
        });
        
        return groupId;
    }

    /**
     * Add a node to a group
     * @param {Node} node - The node to add to the group
     * @param {string} groupId - The ID of the group to add the node to
     */
    addNodeToGroup(node, groupId) {
        if (!this.groups.has(groupId)) {
            console.warn(`Group with ID ${groupId} does not exist`);
            return;
        }
        
        // Remove node from any existing group
        this.removeNodeFromGroup(node);
        
        // Add node to the specified group
        const group = this.groups.get(groupId);
        group.nodes.push(node);
        this.nodeGroups.set(node.id, groupId);
        
        // Apply visual indicators
        this.applyGroupVisualIndicators(node, group);
    }

    /**
     * Remove a node from its current group
     * @param {Node} node - The node to remove from its group
     */
    removeNodeFromGroup(node) {
        const groupId = this.nodeGroups.get(node.id);
        if (!groupId) return;
        
        // Remove node from group
        const group = this.groups.get(groupId);
        if (group) {
            group.nodes = group.nodes.filter(n => n.id !== node.id);
        }
        
        this.nodeGroups.delete(node.id);
        
        // Remove visual indicators
        this.removeGroupVisualIndicators(node);
    }

    /**
     * Apply visual indicators (color coding and outline) to a node based on its group
     * @param {Node} node - The node to apply visual indicators to
     * @param {Object} group - The group data
     */
    applyGroupVisualIndicators(node, group) {
        // Apply color coding
        if (group.color) {
            node.setColor(group.color);
            node.originalColor = group.color; // Update original color reference
        }
        
        // Apply outline if enabled
        if (group.outline && group.outline.enabled) {
            this.createOrUpdateOutline(node, group);
        }
    }

    /**
     * Remove visual indicators from a node
     * @param {Node} node - The node to remove visual indicators from
     */
    removeGroupVisualIndicators(node) {
        // Reset color to default
        if (node.options && node.options.color) {
            node.setColor(node.options.color);
            node.originalColor = node.options.color;
        }
        
        // Remove outline
        this.removeOutline(node);
    }

    /**
     * Create or update the outline for a node
     * @param {Node} node - The node to create/update outline for
     * @param {Object} group - The group data
     */
    createOrUpdateOutline(node, group) {
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
        this.outlineObjects.set(node.id, outlineMesh);
    }

    /**
     * Remove the outline from a node
     * @param {Node} node - The node to remove outline from
     */
    removeOutline(node) {
        const outlineMesh = this.outlineObjects.get(node.id);
        if (outlineMesh) {
            this.scene.remove(outlineMesh);
            outlineMesh.geometry.dispose();
            outlineMesh.material.dispose();
            this.outlineObjects.delete(node.id);
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
                if (this.stateManager && this.stateManager.isObjectSelected(node.mesh)) {
                    outlineMesh.material.opacity = 1.0;
                } else {
                    outlineMesh.material.opacity = 0.8;
                }
            }
        });
    }

    /**
     * Find a node by its ID
     * @param {string|number} nodeId - The ID of the node to find
     * @returns {Node|null} - The found node or null
     */
    findNodeById(nodeId) {
        // Search for the node in the scene
        let foundNode = null;
        
        this.scene.traverse(object => {
            if (object.userData && 
                object.userData.type === 'node' && 
                object.userData.node && 
                object.userData.node.id === nodeId) {
                foundNode = object.userData.node;
            }
        });
        
        return foundNode;
    }

    /**
     * Get all groups
     * @returns {Array} - Array of all groups
     */
    getAllGroups() {
        return Array.from(this.groups.values());
    }

    /**
     * Get the group a node belongs to
     * @param {Node} node - The node to get the group for
     * @returns {Object|null} - The group data or null if the node doesn't belong to a group
     */
    getNodeGroup(node) {
        const groupId = this.nodeGroups.get(node.id);
        return groupId ? this.groups.get(groupId) : null;
    }

    /**
     * Update a group's properties
     * @param {string} groupId - The ID of the group to update
     * @param {Object} groupData - The new group data
     */
    updateGroup(groupId, groupData) {
        if (!this.groups.has(groupId)) {
            console.warn(`Group with ID ${groupId} does not exist`);
            return;
        }
        
        const group = this.groups.get(groupId);
        const updatedGroup = { ...group, ...groupData };
        this.groups.set(groupId, updatedGroup);
        
        // Update visual indicators for all nodes in the group
        updatedGroup.nodes.forEach(node => {
            this.applyGroupVisualIndicators(node, updatedGroup);
        });
    }

    /**
     * Delete a group and remove all nodes from it
     * @param {string} groupId - The ID of the group to delete
     */
    deleteGroup(groupId) {
        if (!this.groups.has(groupId)) {
            console.warn(`Group with ID ${groupId} does not exist`);
            return;
        }
        
        const group = this.groups.get(groupId);
        
        // Remove all nodes from the group
        group.nodes.forEach(node => {
            this.removeNodeFromGroup(node);
        });
        
        // Delete the group
        this.groups.delete(groupId);
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Remove all outlines
        this.outlineObjects.forEach((outlineMesh, nodeId) => {
            this.scene.remove(outlineMesh);
            outlineMesh.geometry.dispose();
            outlineMesh.material.dispose();
        });
        
        this.outlineObjects.clear();
        this.nodeGroups.clear();
        this.groups.clear();
    }
}