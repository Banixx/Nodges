import * as THREE from 'three';

import { NodeObject } from '../types';
import { ServiceContainer } from '../core/di/ServiceContainer';

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
    private nodeManager: any; // NodeManager reference
    private groups: Map<string, GroupData>;
    private nodeGroups: Map<string, string>; // nodeId -> groupId
    private defaultColors: number[];

    constructor(container: ServiceContainer) {
        const nodeManager = container.get<any>('NodeManager');
            
        this.nodeManager = nodeManager;
        this.groups = new Map();
        this.nodeGroups = new Map();

        // Default group colors
        this.defaultColors = [
            0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 
            0x00ffff, 0xffa500, 0x800080, 0x008000, 0x000080
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
    addNodeToGroup(nodeId: string, groupId: string) {
        if (!this.groups.has(groupId)) {
            return;
        }

        // Remove node from any existing group
        this.removeNodeFromGroup(nodeId);

        // Add node to the specified group
        const group = this.groups.get(groupId)!;
        // We push a dummy object for backward compatibility in group.nodes
        group.nodes.push({ nodeData: { id: nodeId } } as any);
        this.nodeGroups.set(nodeId, groupId);

        // Apply visual indicators
        this.applyGroupVisualIndicators(nodeId, group);
    }

    /**
     * Remove a node from its current group
     */
    removeNodeFromGroup(nodeId: string) {
        const groupId = this.nodeGroups.get(nodeId);
        if (!groupId) return;

        // Remove node from group
        const group = this.groups.get(groupId);
        if (group) {
            group.nodes = group.nodes.filter(n => n.nodeData.id !== nodeId);
        }

        this.nodeGroups.delete(nodeId);

        // Remove visual indicators
        this.removeGroupVisualIndicators(nodeId);
    }

    /**
     * Apply visual indicators (color coding) to a node based on its group
     */
    applyGroupVisualIndicators(nodeId: string, group: GroupData) {
        if (group.color && this.nodeManager) {
            this.nodeManager.setNodeColor(nodeId, group.color);
        }
    }

    /**
     * Remove visual indicators from a node
     */
    removeGroupVisualIndicators(nodeId: string) {
        if (this.nodeManager) {
            this.nodeManager.resetNodeColor(nodeId);
        }
    }

    /**
     * Create or update the outline for a node (Deprecated for InstancedMesh)
     */
    createOrUpdateOutline(_node: NodeGroupNode, _group: GroupData) {
        // Obsolete
    }

    /**
     * Remove the outline from a node
     */
    removeOutline(_node: NodeGroupNode) {
        // Obsolete
    }

    /**
     * Update the outline position and rotation for a node
     */
    updateOutlines() {
        // Obsolete
    }

    /**
     * Find a node by its ID
     */
    findNodeById(_nodeId: string | number): NodeGroupNode | null {
        // Not used anymore in InstancedMesh approach
        return null;
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
    getNodeGroup(nodeId: string): GroupData | null {
        const groupId = this.nodeGroups.get(nodeId);
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
            this.applyGroupVisualIndicators(node.nodeData.id, updatedGroup);
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
            this.removeNodeFromGroup(node.nodeData.id);
        });

        // Delete the group
        this.groups.delete(groupId);
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Reset colors
        this.nodeGroups.forEach((_groupId, nodeId) => {
            if (this.nodeManager) this.nodeManager.resetNodeColor(nodeId);
        });

        this.nodeGroups.clear();
        this.groups.clear();
    }
}
