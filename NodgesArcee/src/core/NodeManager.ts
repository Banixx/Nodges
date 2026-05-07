import { EntityData, NodeObject } from '../types';
import * as THREE from 'three';
import { VisualMappingEngine } from './VisualMappingEngine';
import { IStateManager } from './interfaces';

export class NodeManager {
    private scene: THREE.Scene;
    private visualMappingEngine: VisualMappingEngine;
    private stateManager: IStateManager;
    private nodes: Map<string, THREE.Mesh> = new Map();

    constructor(scene: THREE.Scene, visualMappingEngine: VisualMappingEngine, stateManager: IStateManager) {
        this.scene = scene;
        this.visualMappingEngine = visualMappingEngine;
        this.stateManager = stateManager;
    }

    updateNodes(entities: EntityData[]): void {
        // Clear existing nodes
        this.clear();

        // Create new nodes
        entities.forEach(entity => {
            this.createNode(entity);
        });
    }

    private createNode(entityData: EntityData): void {
        const position = entityData.position || { x: 0, y: 0, z: 0 };

        // Determine color
        let color = 0x00d4ff; // Default color
        const visualProperties = this.visualMappingEngine.getVisualProperties(entityData.type);
        if (visualProperties.color) {
            color = new THREE.Color(visualProperties.color.params.color).getHex();
        }

        // Determine size
        let size = 3; // Default size
        if (visualProperties.size) {
            size = (visualProperties.size.range[0] + visualProperties.size.range[1]) / 2;
        }

        // Select geometry based on type
        let geometry: THREE.BufferGeometry;
        geometry = new THREE.SphereGeometry(size, 32, 32);

        // Create material
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.4,
            emissive: 0x000000,
            emissiveIntensity: 0
        });

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        mesh.userData = { nodeData: entityData };

        // Add to scene
        this.scene.add(mesh);
        this.nodes.set(entityData.id, mesh);
    }

    clear(): void {
        // Remove all nodes from scene
        this.nodes.forEach((mesh, id) => {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        this.nodes.clear();
    }

    dispose(): void {
        this.clear();
    }

    updateNodePositions(entities: EntityData[]): void {
        entities.forEach(entity => {
            const mesh = this.nodes.get(entity.id);
            if (mesh && entity.position) {
                mesh.position.set(entity.position.x, entity.position.y, entity.position.z);
            }
        });
    }
}