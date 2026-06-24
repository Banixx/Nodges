import * as THREE from 'three';
import { EntityData } from '../types';
import { VisualMappingEngine } from './VisualMappingEngine';

import { IStateManager } from './interfaces';
import { ServiceContainer } from './di/ServiceContainer';

export class NodeManager {
    private scene: THREE.Scene;
    private visualMappingEngine: VisualMappingEngine;
    private stateManager: IStateManager;
    private meshes: Map<string, THREE.InstancedMesh>;
    private individualMeshes: Map<string, THREE.Mesh>;
    private geometryCache: Map<string, THREE.BufferGeometry>;
    private materialCache: Map<string, THREE.Material>;
    private lastQualityMultiplier: number = 1.0;

    // Mapping from (GeometryType + InstanceId) to EntityData
    private entityDataMap: Map<string, EntityData[]>;

    // Helpers for quick lookup
    private entityIdMap: Map<string, { type: string, index: number }>;
    private meshIdMap: Map<number, string>; // Maps mesh.id to geometryType

    private defaultColor = new THREE.Color(0x3498db);

    // Node-Groessen-Grenzen in Three.js-Einheiten (Radius)
    private static readonly MIN_NODE_RADIUS = 0.3;
    private static readonly MAX_NODE_RADIUS = 15.0;

    constructor(container: ServiceContainer) {
        [this.scene, this.visualMappingEngine, this.stateManager] = 
            container.resolve<THREE.Scene, VisualMappingEngine, IStateManager>(
                'Scene', 'VisualMappingEngine', 'IStateManager'
            );
            
        this.meshes = new Map();
        this.individualMeshes = new Map();
        this.geometryCache = new Map();
        this.materialCache = new Map();
        this.entityDataMap = new Map();
        this.entityIdMap = new Map();
        this.meshIdMap = new Map();

        this.initializeGeometries();
        this.initializeMaterials();

        // Reactive Rendering: Subscribe to Data Changes
        this.stateManager.subscribe((_state) => {
            // Optional: Fine-grained updates check?
            // For now we rely on explicit 'data_changed' event trigger by StateManager
        }, 'default');

        // We use a specific method because StateManager calls notifySubscribers('data_changed')
        // But our subscribe method in StateManager is generic.
        // Actually StateManager uses categories. So we can subscribe to 'data_changed'.
        this.stateManager.subscribe(() => {
            this.updateNodes();
        }, 'data_changed');
    }

    private initializeGeometries(multiplier: number = 1.0) {
        // Dispose old ones if we are re-initializing
        this.geometryCache.forEach(geo => geo.dispose());
        this.geometryCache.clear();

        const sSeg = Math.max(4, Math.floor(16 * multiplier));
        const cSeg = Math.max(4, Math.floor(8 * multiplier));

        const sphereGeo = new THREE.SphereGeometry(1, sSeg, sSeg);
        const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
        const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, cSeg);
        const coneGeo = new THREE.ConeGeometry(1, 1, cSeg);
        const torusGeo = new THREE.TorusGeometry(1, 0.4, cSeg, Math.max(3, Math.floor(6 * multiplier)));

        this.geometryCache.set('sphere', sphereGeo);
        this.geometryCache.set('cube', cubeGeo);
        this.geometryCache.set('box', cubeGeo);
        this.geometryCache.set('cylinder', cylinderGeo);
        this.geometryCache.set('cone', coneGeo);
        this.geometryCache.set('torus', torusGeo);
    }

    private initializeMaterials() {
        this.materialCache.set('default', new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 30,
            vertexColors: false
        }));
    }

    /**
     * Updates the visual representation of entities
     */
    public updateNodes(entities?: EntityData[]) {
        const entitiesToRender = entities || this.stateManager.getEntities();

        // Check if performance monitor suggests a quality change
        let currentMultiplier = 1.0;
        if (window.app && window.app.performanceMonitor) {
            currentMultiplier = window.app.performanceMonitor.getNodeDetailMultiplier();
        }

        if (currentMultiplier !== this.lastQualityMultiplier) {
            console.log(`[NodeManager] Adjusting geometry detail: ${this.lastQualityMultiplier.toFixed(2)} -> ${currentMultiplier.toFixed(2)}`);
            this.lastQualityMultiplier = currentMultiplier;
            this.initializeGeometries(currentMultiplier);
        }

        // 1. Group entities by their Visual Geometry Type
        // We need to determine the geometry for each entity using VisualMappingEngine
        const entitiesByType = new Map<string, { entity: EntityData, visual: any }[]>();


        entitiesToRender.forEach(entity => {
            const visual = this.visualMappingEngine.applyToEntity(entity);
            // Default to sphere if unknown
            let type: string = (visual.geometry as string) || (entity.geometryType as string) || 'sphere';
            if (type === 'box') type = 'cube';
            if (!this.geometryCache.has(type)) type = 'sphere';

            if (!entitiesByType.has(type)) {
                entitiesByType.set(type, []);
            }
            entitiesByType.get(type)!.push({ entity, visual });
        });

        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.dispose();
        });
        this.meshes.clear();

        this.individualMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        });
        this.individualMeshes.clear();

        this.entityDataMap.clear();
        this.entityIdMap.clear();
        this.meshIdMap.clear();

        const activeRenderMode = this.stateManager.state.activeRenderMode || 'mesh';

        if (activeRenderMode === 'instance') {
            // 3a. Create new InstancedMeshes
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

                    // Position mapped override
                    if (visual.positionX !== undefined) {
                        if (!entity.position) entity.position = { x: 0, y: 0, z: 0 };
                        entity.position.x = visual.positionX;
                    }
                    if (visual.positionY !== undefined) {
                        if (!entity.position) entity.position = { x: 0, y: 0, z: 0 };
                        entity.position.y = visual.positionY;
                    }
                    if (visual.positionZ !== undefined) {
                        if (!entity.position) entity.position = { x: 0, y: 0, z: 0 };
                        entity.position.z = visual.positionZ;
                    }

                    const x = entity.position?.x || 0;
                    const y = entity.position?.y || 0;
                    const z = entity.position?.z || 0;
                    dummy.position.set(x, y, z);

                    // Scale / Size
                    const state = this.stateManager.state;
                    const layeringAttr = state.layeringAttribute || 'layer';
                    const rawVal = entity[layeringAttr];
                    const nodeVal = rawVal !== undefined ? String(rawVal) : '';

                    let layerNum = 0;
                    if (nodeVal === state.layer1Value) layerNum = 1;
                    else if (nodeVal === state.layer2Value) layerNum = 2;
                    else if (nodeVal === state.layer3Value) layerNum = 3;
                    else if (nodeVal === state.layer4Value) layerNum = 4;

                    const isLayerVisible = layerNum === 0 || state[`layer${layerNum}Visible`] !== false;
                    const layerOpacity = layerNum === 0 
                        ? 1.0 
                        : (state[`layer${layerNum}Opacity`] !== undefined ? Number(state[`layer${layerNum}Opacity`]) : 1.0);

                    const size = visual.size !== undefined ? visual.size : 1.0;
                    const validSize = typeof size === 'number' && !isNaN(size) ? size : 1.0;
                    const rawScale = Math.pow(validSize, state.visualScaleExponent) * state.visualScaleMultiplier * 0.5;
                    // Begrenze auf erlaubten Radius-Bereich
                    const clampedScale = Math.max(NodeManager.MIN_NODE_RADIUS, Math.min(NodeManager.MAX_NODE_RADIUS, rawScale));
                    const baseScale = isLayerVisible ? clampedScale : 0;
                    
                    const finalScale = baseScale * layerOpacity;
                    dummy.scale.set(finalScale, finalScale, finalScale);

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

                    // Apply opacity-based color darkening to simulate transparency in InstancedMesh
                    if (layerOpacity < 1.0) {
                        color.multiplyScalar(layerOpacity);
                    }
                    mesh.setColorAt(index, color);

                    // ID Map
                    this.entityIdMap.set(String(entity.id), { type, index });
                });

                mesh.instanceMatrix.needsUpdate = true;
                if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

                mesh.userData = { type: 'node_instanced', geometryType: type };
                mesh.layers.enable(1); // Enable for minimap (Layer 1)
                this.scene.add(mesh);
                this.meshes.set(type, mesh);
                this.meshIdMap.set(mesh.id, type);
                this.entityDataMap.set(type, entityList);
            });
        } else {
            // 3b. Create Individual Meshes
            entitiesByType.forEach((group, type) => {
                const geometry = this.geometryCache.get(type)!;

                const entityList: EntityData[] = [];
                
                group.forEach(({ entity, visual }, index) => {
                    entityList.push(entity);
                    let baseMaterial = this.materialCache.get('default');
                    if (!baseMaterial) {
                        console.warn('[NodeManager] Default material missing, re-initializing.');
                        this.initializeMaterials();
                        baseMaterial = this.materialCache.get('default')!;
                    }
                    const material = baseMaterial.clone() as THREE.MeshPhongMaterial;
                    const mesh = new THREE.Mesh(geometry, material);

                    // Position mapped override
                    if (visual.positionX !== undefined) {
                        if (!entity.position) entity.position = { x: 0, y: 0, z: 0 };
                        entity.position.x = visual.positionX;
                    }
                    if (visual.positionY !== undefined) {
                        if (!entity.position) entity.position = { x: 0, y: 0, z: 0 };
                        entity.position.y = visual.positionY;
                    }
                    if (visual.positionZ !== undefined) {
                        if (!entity.position) entity.position = { x: 0, y: 0, z: 0 };
                        entity.position.z = visual.positionZ;
                    }

                    const x = entity.position?.x || 0;
                    const y = entity.position?.y || 0;
                    const z = entity.position?.z || 0;
                    mesh.position.set(x, y, z);

                    // Scale / Size
                    const state = this.stateManager.state;
                    const layeringAttr = state.layeringAttribute || 'layer';
                    const rawVal = entity[layeringAttr];
                    const nodeVal = rawVal !== undefined ? String(rawVal) : '';

                    let layerNum = 0;
                    if (nodeVal === state.layer1Value) layerNum = 1;
                    else if (nodeVal === state.layer2Value) layerNum = 2;
                    else if (nodeVal === state.layer3Value) layerNum = 3;
                    else if (nodeVal === state.layer4Value) layerNum = 4;

                    const isLayerVisible = layerNum === 0 || state[`layer${layerNum}Visible`] !== false;
                    const layerOpacity = layerNum === 0 
                        ? 1.0 
                        : (state[`layer${layerNum}Opacity`] !== undefined ? Number(state[`layer${layerNum}Opacity`]) : 1.0);

                    const size = visual.size !== undefined ? visual.size : 1.0;
                    const validSize = typeof size === 'number' && !isNaN(size) ? size : 1.0;
                    const rawScale = Math.pow(validSize, state.visualScaleExponent) * state.visualScaleMultiplier * 0.5;
                    const clampedScale = Math.max(NodeManager.MIN_NODE_RADIUS, Math.min(NodeManager.MAX_NODE_RADIUS, rawScale));
                    const baseScale = isLayerVisible ? clampedScale : 0; 
                    
                    const finalScale = baseScale * layerOpacity;
                    mesh.scale.set(finalScale, finalScale, finalScale);

                    // Color
                    if (visual.color) {
                        if (visual.color instanceof THREE.Color) {
                            material.color.copy(visual.color);
                        } else {
                            material.color.set(visual.color);
                        }
                    } else {
                        material.color.copy(this.defaultColor);
                    }

                    if (layerOpacity < 1.0) {
                        material.transparent = true;
                        material.opacity = layerOpacity;
                    }

                    mesh.userData = { type: 'node', nodeData: entity, geometryType: type, id: entity.id };
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.layers.enable(1); // Enable for minimap (Layer 1)

                    this.scene.add(mesh);
                    this.individualMeshes.set(String(entity.id), mesh);
                    this.entityIdMap.set(String(entity.id), { type, index });
                });
                
                this.entityDataMap.set(type, entityList);
            });
        }
    }

    /**
     * Updates positions of existing nodes (e.g. during layout)
     */
    public updateNodePositions(entities: EntityData[]) {
        if (this.stateManager.state.activeRenderMode === 'instance') {
            const dummy = new THREE.Object3D();

            entities.forEach(entity => {
                const map = this.entityIdMap.get(String(entity.id));
                if (!map) return;

                const mesh = this.meshes.get(map.type);
                if (!mesh) return;

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
        } else {
            entities.forEach(entity => {
                const mesh = this.individualMeshes.get(String(entity.id));
                if (mesh) {
                    mesh.position.set(
                        entity.position?.x || 0,
                        entity.position?.y || 0,
                        entity.position?.z || 0
                    );
                }
            });
        }
    }

    /**
     * Set color highlight for a node
     */
    public setNodeColor(entityId: string, colorHex: number | string) {
        if (this.stateManager.state.activeRenderMode === 'instance') {
            const map = this.entityIdMap.get(entityId);
            if (!map) return;

            const mesh = this.meshes.get(map.type);
            if (!mesh) return;

            const color = new THREE.Color(colorHex);
            mesh.setColorAt(map.index, color);
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        } else {
            const mesh = this.individualMeshes.get(entityId);
            if (mesh && mesh.material && (mesh.material as THREE.MeshPhongMaterial).color) {
                (mesh.material as THREE.MeshPhongMaterial).color.set(colorHex);
            }
        }
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
        const visual = this.visualMappingEngine.applyToEntity(entity);
        const color = visual.color ?
            (visual.color instanceof THREE.Color ? visual.color : new THREE.Color(visual.color))
            : this.defaultColor;

        if (this.stateManager.state.activeRenderMode === 'instance') {
            const mesh = this.meshes.get(map.type);
            if (mesh) {
                mesh.setColorAt(map.index, color);
                if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
            }
        } else {
            const mesh = this.individualMeshes.get(entityId);
            if (mesh && mesh.material && (mesh.material as THREE.MeshPhongMaterial).color) {
                (mesh.material as THREE.MeshPhongMaterial).color.copy(color);
            }
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

    public getMeshes(): (THREE.InstancedMesh | THREE.Mesh)[] {
        if (this.stateManager.state.activeRenderMode === 'instance') {
            return Array.from(this.meshes.values());
        } else {
            return Array.from(this.individualMeshes.values());
        }
    }

    public clear() {
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.dispose();
        });
        this.meshes.clear();

        this.individualMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        });
        this.individualMeshes.clear();

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
