import * as THREE from 'three';
import { EntityData } from '../types';
import { VisualMappingEngine } from './VisualMappingEngine';

export class NodeManager {
    private scene: THREE.Scene;
    private visualMappingEngine: VisualMappingEngine;
    private meshes: Map<string, THREE.InstancedMesh>;
    private geometryCache: Map<string, THREE.BufferGeometry>;
    private materialCache: Map<string, THREE.Material>;

    // Mapping from (GeometryType + InstanceId) to EntityData
    private entityDataMap: Map<string, EntityData[]>;

    // Helpers for quick lookup
    private entityIdMap: Map<string, { type: string, index: number }>;
    private meshIdMap: Map<number, string>; // Maps mesh.id to geometryType

    private defaultColor = new THREE.Color(0x3498db);

    constructor(scene: THREE.Scene, visualMappingEngine: VisualMappingEngine) {
        this.scene = scene;
        this.visualMappingEngine = visualMappingEngine;
        this.meshes = new Map();
        this.geometryCache = new Map();
        this.materialCache = new Map();
        this.entityDataMap = new Map();
        this.entityIdMap = new Map();
        this.meshIdMap = new Map();

        this.initializeGeometries();
        this.initializeMaterials();
    }

    private initializeGeometries() {
        this.geometryCache.set('sphere', new THREE.SphereGeometry(1, 16, 16));
        this.geometryCache.set('cube', new THREE.BoxGeometry(1, 1, 1));
        this.geometryCache.set('cylinder', new THREE.CylinderGeometry(1, 1, 1, 8));
        this.geometryCache.set('cone', new THREE.ConeGeometry(1, 1, 8));
        this.geometryCache.set('torus', new THREE.TorusGeometry(1, 0.4, 8, 6));
    }

    private initializeMaterials() {
        // One default material for everything (using vertex colors)
        this.materialCache.set('default', new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 30,
            vertexColors: true
        }));
    }

    /**
     * Updates the visual representation of entities
     */
    public updateNodes(entities: EntityData[]) {
        // 1. Group entities by their Visual Geometry Type
        // We need to determine the geometry for each entity using VisualMappingEngine
        const entitiesByType = new Map<string, { entity: EntityData, visual: any }[]>();


        entities.forEach(entity => {
            const visual = this.visualMappingEngine.applyToEntity(entity);
            // Default to sphere if unknown
            let type: string = (visual.geometry as string) || (entity.geometryType as string) || 'sphere';
            if (!this.geometryCache.has(type)) type = 'sphere';

            if (!entitiesByType.has(type)) {
                entitiesByType.set(type, []);
            }
            entitiesByType.get(type)!.push({ entity, visual });
        });

        // 2. Cleanup old meshes
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.dispose();
        });
        this.meshes.clear();
        this.entityDataMap.clear();
        this.entityIdMap.clear();
        this.meshIdMap.clear();

        // 3. Create new InstancedMeshes
        entitiesByType.forEach((group, type) => {
            const count = group.length;
            const geometry = this.geometryCache.get(type)!;
            const material = this.materialCache.get('default')!;

            const mesh = new THREE.InstancedMesh(geometry, material, count);
            mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const dummy = new THREE.Object3D();
            const color = new THREE.Color();
            const entityList: EntityData[] = [];

            group.forEach(({ entity, visual }, index) => {
                entityList.push(entity);

                // Position
                const x = entity.position?.x || 0;
                const y = entity.position?.y || 0;
                const z = entity.position?.z || 0;
                dummy.position.set(x, y, z);

                // Scale / Size
                const size = visual.size !== undefined ? visual.size : 1.0;
                // Base geometric size is 1.0 (radius 1 or side 1), so we scale by 0.5 to keep visual size roughly 1 unit unless changed
                const visualScale = size * 0.5;
                dummy.scale.set(visualScale, visualScale, visualScale);

                dummy.updateMatrix();
                mesh.setMatrixAt(index, dummy.matrix);

                // Color
                if (visual.color) {
                    if (visual.color instanceof THREE.Color) {
                        color.copy(visual.color);
                    } else {
                        color.set(visual.color);
                    }
                } else {
                    color.copy(this.defaultColor);
                }
                mesh.setColorAt(index, color);

                // ID Map
                this.entityIdMap.set(String(entity.id), { type, index });
            });

            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

            mesh.userData = { type: 'node_instanced', geometryType: type };

            this.scene.add(mesh);
            this.meshes.set(type, mesh);
            this.meshIdMap.set(mesh.id, type);
            this.entityDataMap.set(type, entityList);
        });
    }

    /**
     * Updates positions of existing nodes (e.g. during layout)
     */
    public updateNodePositions(entities: EntityData[]) {
        const dummy = new THREE.Object3D();

        entities.forEach(entity => {
            const map = this.entityIdMap.get(String(entity.id));
            if (!map) return;

            const mesh = this.meshes.get(map.type);
            if (!mesh) return;

            // Retain scale. We can't easily get it back from matrix multiple without decomposing, 
            // but we can re-calculate it if we knew the visual Mapping. 
            // For now, let's assume standard scale factor or cached one.
            // A more robust way is to read the matrix, decompose, set position, recompose.
            mesh.getMatrixAt(map.index, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

            dummy.position.set(
                entity.position?.x || 0,
                entity.position?.y || 0,
                entity.position?.z || 0
            );

            dummy.updateMatrix();
            mesh.setMatrixAt(map.index, dummy.matrix);
        });

        this.meshes.forEach(mesh => {
            mesh.instanceMatrix.needsUpdate = true;
        });
    }

    /**
     * Set color highlight for a node
     */
    public setNodeColor(entityId: string, colorHex: number | string) {
        const map = this.entityIdMap.get(entityId);
        if (!map) return;

        const mesh = this.meshes.get(map.type);
        if (!mesh) return;

        const color = new THREE.Color(colorHex);
        mesh.setColorAt(map.index, color);
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    /**
     * Reset node color to original
     */
    public resetNodeColor(entityId: string) {
        const map = this.entityIdMap.get(entityId);
        if (!map) return;

        const entities = this.entityDataMap.get(map.type);
        if (!entities) return;

        const entity = entities[map.index];
        // Re-calculate visual
        const visual = this.visualMappingEngine.applyToEntity(entity);
        const color = visual.color ?
            (visual.color instanceof THREE.Color ? visual.color : new THREE.Color(visual.color))
            : this.defaultColor;

        const mesh = this.meshes.get(map.type);
        if (mesh) {
            mesh.setColorAt(map.index, color);
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        }
    }

    public getNodeAt(geometryType: string, instanceId: number): EntityData | null {
        const entities = this.entityDataMap.get(geometryType);
        if (entities && entities[instanceId]) {
            return entities[instanceId];
        }
        return null;
    }

    public getNodeData(id: string): EntityData | undefined {
        const map = this.entityIdMap.get(String(id));
        if (!map) return undefined;
        return this.getNodeAt(map.type, map.index) || undefined;
    }

    public getMeshes(): THREE.InstancedMesh[] {
        return Array.from(this.meshes.values());
    }

    public clear() {
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.dispose();
        });
        this.meshes.clear();
        this.entityDataMap.clear();
        this.entityIdMap.clear();
        this.meshIdMap.clear();
    }

    public dispose() {
        this.clear();
        this.geometryCache.forEach(geo => geo.dispose());
        this.geometryCache.clear();
        this.materialCache.forEach(mat => mat.dispose());
        this.materialCache.clear();
    }

    public getNodeTypeInfo(type: string): { name: string, faces: number } {
        const geo = this.geometryCache.get(type);
        if (!geo) return { name: 'Unknown', faces: 0 };
        return {
            name: type,
            faces: geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3
        };
    }
}
