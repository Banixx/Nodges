import * as THREE from 'three';
import { NodeData } from '../types';

export class NodeObjectsManager {
    private scene: THREE.Scene;
    private meshes: Map<string, THREE.InstancedMesh>;
    private geometryCache: Map<string, THREE.BufferGeometry>;
    private materialCache: Map<string, THREE.Material>;

    // Mapping from (GeometryType + InstanceId) to NodeData
    // Since we might have multiple InstancedMeshes, we need a way to map raycast results back to nodes.
    // We can store a separate map for each geometry type: Map<GeometryType, NodeData[]>
    private nodeDataMap: Map<string, NodeData[]>;

    // Helper to quickly find which geometry type and index a node ID belongs to
    private nodeIdMap: Map<string, { type: string, index: number }>;

    private defaultColor = new THREE.Color(0x3498db);


    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.meshes = new Map();
        this.geometryCache = new Map();
        this.materialCache = new Map();
        this.nodeDataMap = new Map();
        this.nodeIdMap = new Map();

        this.initializeGeometries();
        this.initializeMaterials();
    }

    private initializeGeometries() {
        // Standard Geometries
        this.geometryCache.set('sphere', new THREE.SphereGeometry(1, 16, 16));
        this.geometryCache.set('cube', new THREE.BoxGeometry(1, 1, 1));
        this.geometryCache.set('cylinder', new THREE.CylinderGeometry(1, 1, 1, 8));
        this.geometryCache.set('cone', new THREE.ConeGeometry(1, 1, 8));
        this.geometryCache.set('torus', new THREE.TorusGeometry(1, 0.4, 8, 6));
    }

    private initializeMaterials() {
        console.log('[TRACE] NodeObjectsManager.initializeMaterials called');
        // We use one material per InstancedMesh. Colors are handled via instanceColor attribute.
        this.materialCache.set('default', new THREE.MeshPhongMaterial({
            color: 0xffffff, // White base to allow vertex colors to tint
            shininess: 30,
            vertexColors: true // Important for InstancedMesh color variation
        }));
        console.log(`[TRACE] Material 'default' set. Cache size: ${this.materialCache.size}`);
    }

    /**
     * Retrieves metadata about a specific geometry type used for nodes.
     */
    public getNodeTypeInfo(geometryType: string): { name: string, faces: number | string } {
        const geometry = this.geometryCache.get(geometryType);
        if (geometry) {
            const name = geometry.type || geometryType;
            let faces: number | string = 'N/A';

            // Check for index buffer (triangles = faces)
            if (geometry.index && geometry.index.count) {
                faces = `${geometry.index.count / 3} Triangles`;
            }
            // Fallback check for position attribute count (vertices)
            else if (geometry.attributes && geometry.attributes.position && geometry.attributes.position.count > 0) {
                faces = `${geometry.attributes.position.count} Vertices`;
            }

            return { name: name, faces: faces };
        }
        return { name: 'Unknown Geometry', faces: '0' };
    }

    public updateNodes(nodes: NodeData[]) {
        console.log(`[TRACE] NodeObjectsManager.updateNodes called with ${nodes.length} nodes`);

        // Re-initialize caches if they were cleared (e.g. by dispose())
        if (this.geometryCache.size === 0) {
            this.initializeGeometries();
        }
        if (this.materialCache.size === 0) {
            this.initializeMaterials();
        }

        console.log(`[TRACE] Material Cache Keys: ${Array.from(this.materialCache.keys()).join(', ')}`);

        // 1. Group nodes by geometry type
        const nodesByType = new Map<string, NodeData[]>();

        nodes.forEach(node => {
            // Default to sphere if type is missing or unknown
            let type = node.geometryType || 'sphere';
            if (!this.geometryCache.has(type)) type = 'sphere';

            if (!nodesByType.has(type)) {
                nodesByType.set(type, []);
            }
            nodesByType.get(type)!.push(node);
        });

        // 2. Cleanup old meshes
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.dispose();
        });
        this.meshes.clear();
        this.nodeDataMap.clear();
        this.nodeIdMap.clear();

        // 3. Create new InstancedMeshes
        nodesByType.forEach((groupNodes, type) => {
            const count = groupNodes.length;
            const geometry = this.geometryCache.get(type)!;
            const material = this.materialCache.get('default')!;

            const mesh = new THREE.InstancedMesh(geometry, material, count);
            mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

            // Enable shadows if needed
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const dummy = new THREE.Object3D();
            const color = new THREE.Color();

            groupNodes.forEach((node, index) => {
                // Position & Scale
                const x = node.x || 0;
                const y = node.y || 0;
                const z = node.z || 0;
                dummy.position.set(x, y, z);

                // Scale based on node size (default 1.0)
                // Note: Geometries are created with size 1, so we scale directly
                const size = (node.val || 1) * (node.scale || 1);
                // Use reasonable scale for visibility (0.5 = half unit size)
                const visualScale = size * 0.5;
                dummy.scale.set(visualScale, visualScale, visualScale);

                dummy.updateMatrix();
                mesh.setMatrixAt(index, dummy.matrix);

                // Color
                // Use node color if available, else default
                if (node.color) {
                    color.set(node.color);
                } else {
                    color.copy(this.defaultColor);
                }
                mesh.setColorAt(index, color);

                // Store mapping
                this.nodeIdMap.set(String(node.id), { type, index });
            });

            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

            // Store metadata
            mesh.userData = { type: 'node_instanced', geometryType: type };

            const mat = material as any;
            const matColor = (mat && mat.color) ? mat.color.getHexString() : 'unknown';
            console.log(`[TRACE] Adding InstancedMesh to scene. Type: ${type}, Count: ${count}, Material Color: #${matColor}`);
            this.scene.add(mesh);
            console.log(`[TRACE] Mesh added. Scene children count: ${this.scene.children.length}`);

            this.meshes.set(type, mesh);
            this.nodeDataMap.set(type, groupNodes);
        });
    }

    public updateNodePositions(nodes: NodeData[]) {
        const dummy = new THREE.Object3D();

        nodes.forEach(node => {
            const map = this.nodeIdMap.get(String(node.id));
            if (!map) return;

            const mesh = this.meshes.get(map.type);
            if (!mesh) return;

            // Get current matrix to preserve scale? 
            // Better to re-calculate from node data to be safe and stateless regarding previous scale
            dummy.position.set(node.x || 0, node.y || 0, node.z || 0);

            const size = (node.val || 1) * (node.scale || 1);
            const visualScale = size * 0.2;
            dummy.scale.set(visualScale, visualScale, visualScale);

            dummy.updateMatrix();
            mesh.setMatrixAt(map.index, dummy.matrix);
        });

        this.meshes.forEach(mesh => {
            mesh.instanceMatrix.needsUpdate = true;
        });
    }

    public setNodeColor(nodeId: string, colorHex: number | string) {
        const map = this.nodeIdMap.get(nodeId);
        if (!map) return;

        const mesh = this.meshes.get(map.type);
        if (!mesh) return;

        const color = new THREE.Color(colorHex);
        mesh.setColorAt(map.index, color);
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    public resetNodeColor(nodeId: string) {
        const map = this.nodeIdMap.get(nodeId);
        if (!map) return;

        // We need the original node data to reset
        const nodes = this.nodeDataMap.get(map.type);
        if (!nodes) return;

        const node = nodes[map.index];
        const color = node.color ? new THREE.Color(node.color) : this.defaultColor;

        const mesh = this.meshes.get(map.type);
        if (mesh) {
            mesh.setColorAt(map.index, color);
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        }
    }

    public getNodeAt(geometryType: string, instanceId: number): NodeData | null {
        const nodes = this.nodeDataMap.get(geometryType);
        if (nodes && nodes[instanceId]) {
            return nodes[instanceId];
        }
        return null;
    }

    public getNodeData(id: string): NodeData | undefined {
        const map = this.nodeIdMap.get(String(id));
        if (!map) return undefined;
        return this.getNodeAt(map.type, map.index) || undefined;
    }

    public getMeshes(): THREE.InstancedMesh[] {
        return Array.from(this.meshes.values());
    }

    public dispose() {
        console.log('[TRACE] NodeObjectsManager.dispose called');
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.dispose();
        });
        this.meshes.clear();
        this.geometryCache.forEach(geo => geo.dispose());
        this.geometryCache.clear();
        this.materialCache.forEach(mat => mat.dispose());
        this.materialCache.clear();
        this.nodeDataMap.clear();
        this.nodeIdMap.clear();
    }
}
