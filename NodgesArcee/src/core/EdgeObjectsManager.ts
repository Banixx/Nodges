import { RelationshipData, EntityData } from '../types';
import * as THREE from 'three';
import { VisualMappingEngine } from './VisualMappingEngine';
import { IStateManager } from './interfaces';

export class EdgeObjectsManager {
    private scene: THREE.Scene;
    private visualMappingEngine: VisualMappingEngine;
    private stateManager: IStateManager;
    private edges: Map<string, THREE.Mesh> = new Map();

    constructor(scene: THREE.Scene, visualMappingEngine: VisualMappingEngine, stateManager: IStateManager) {
        this.scene = scene;
        this.visualMappingEngine = visualMappingEngine;
        this.stateManager = stateManager;
    }

    updateEdges(relationships: RelationshipData[], entities: EntityData[]): void {
        // Clear existing edges
        this.dispose();

        // Create new edges
        relationships.forEach(rel => {
            this.createEdge(rel, entities);
        });
    }

    private createEdge(relData: RelationshipData, entities: EntityData[]): void {
        const sourceNode = entities.find(e => e.id === relData.source);
        const targetNode = entities.find(e => e.id === relData.target);

        if (!sourceNode || !targetNode) return;

        // Determine color
        let color = 0x7b2cbf; // Default edge color
        const visualProperties = this.visualMappingEngine.getVisualProperties(relData.type);
        if (visualProperties.color) {
            color = new THREE.Color(visualProperties.color.params.color).getHex();
        }

        // Determine thickness
        let thickness = 0.1; // Default thickness
        if (visualProperties.thickness) {
            thickness = (visualProperties.thickness.range[0] + visualProperties.thickness.range[1]) / 2;
        }

        // Create curve
        const start = new THREE.Vector3(
            sourceNode.position?.x || 0,
            sourceNode.position?.y || 0,
            sourceNode.position?.z || 0
        );
        const end = new THREE.Vector3(
            targetNode.position?.x || 0,
            targetNode.position?.y || 0,
            targetNode.position?.z || 0
        );
        const mid = start.clone().add(end).multiplyScalar(0.5);
        mid.y += 5; // Arc upward

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

        // Create tube geometry
        const tubeGeometry = new THREE.TubeGeometry(curve, 32, thickness, 8, false);
        const tubeMaterial = new THREE.MeshStandardMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            emissive: color,
            emissiveIntensity: 0.2
        });

        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tube.userData = { relData };

        this.scene.add(tube);
        this.edges.set(relData.id || 'unknown', tube);
    }

    dispose(): void {
        // Remove all edges from scene
        this.edges.forEach((mesh, id) => {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        this.edges.clear();
    }

    animate(): void {
        // Animate edges (pulse effect)
        this.edges.forEach((mesh, id) => {
            const relData = mesh.userData.relData;
            if (relData && relData.type.includes('process')) {
                const pulse = 0.7 + Math.sin(Date.now() * 0.001) * 0.3;
                if (mesh.material) {
                    mesh.material.opacity = pulse;
                    mesh.material.emissiveIntensity = pulse * 0.3;
                }
            }
        });
    }

    updateEdgePositions(entities: EntityData[]): void {
        this.edges.forEach((mesh, id) => {
            const relData = mesh.userData.relData;
            if (relData) {
                const sourceNode = entities.find(e => e.id === relData.source);
                const targetNode = entities.find(e => e.id === relData.target);

                if (sourceNode && targetNode && sourceNode.position && targetNode.position) {
                    const start = new THREE.Vector3(
                        sourceNode.position.x,
                        sourceNode.position.y,
                        sourceNode.position.z
                    );
                    const end = new THREE.Vector3(
                        targetNode.position.x,
                        targetNode.position.y,
                        targetNode.position.z
                    );
                    const mid = start.clone().add(end).multiplyScalar(0.5);
                    mid.y += 5;

                    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
                    const points = curve.getPoints(32);
                    const path = new THREE.CatmullRomCurve3(points);

                    if (mesh.geometry instanceof THREE.BufferGeometry) {
                        const newGeometry = new THREE.TubeGeometry(path, 32, mesh.geometry.parameters.radius, 8, false);
                        mesh.geometry.dispose();
                        mesh.geometry = newGeometry;
                    }
                }
            }
        });
    }
}