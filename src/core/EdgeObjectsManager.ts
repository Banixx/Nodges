import * as THREE from 'three';
import { EdgeData, NodeData, EntityData, RelationshipData } from '../types';
// @ts-ignore
import { Edge } from '../objects/Edge.js';

export class EdgeObjectsManager {
    private scene: THREE.Scene;
    private cylinderMesh: THREE.InstancedMesh | null = null;
    private curvedEdges: any[] = []; // Store Edge instances for curved/multi-edges

    // Map instance index to EdgeData for interaction
    private instanceToEdgeData: Map<number, EdgeData | RelationshipData>;

    private material: THREE.MeshPhongMaterial;
    private geometry: THREE.CylinderGeometry;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.instanceToEdgeData = new Map();

        // Shared resources for straight edges
        this.geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8, 1);
        this.geometry.translate(0, 0.5, 0); // Pivot at base
        this.geometry.rotateX(Math.PI / 2); // Align to Z

        this.material = new THREE.MeshPhongMaterial({
            color: 0xaaaaaa,
            shininess: 30,
            depthWrite: true
        });
    }

    public updateEdges(edges: (EdgeData | RelationshipData)[], nodes: (NodeData | EntityData)[]) {
        // 1. Clear existing
        this.dispose();

        // 2. Map nodes for fast lookup
        const nodeMap = new Map<string | number, NodeData | EntityData>();
        nodes.forEach(node => nodeMap.set(node.id, node));

        // 3. Group edges by connection (start-end) to identify duplicates
        const connectionMap = new Map<string, (EdgeData | RelationshipData)[]>();

        edges.forEach((edge: any) => {
            // Support both Future (source/target) and Legacy (start/end)
            const s = edge.source !== undefined ? edge.source : edge.start;
            const t = edge.target !== undefined ? edge.target : edge.end;

            // Sort IDs to treat A->B and B->A as same connection
            const start = s < t ? s : t;
            const end = s < t ? t : s;
            const key = `${start}-${end}`;

            if (!connectionMap.has(key)) {
                connectionMap.set(key, []);
            }
            connectionMap.get(key)!.push(edge);
        });

        // 4. Separate straight vs curved
        const straightEdges: (EdgeData | RelationshipData)[] = [];
        const curvedEdgesData: { edge: EdgeData | RelationshipData, index: number, total: number }[] = [];

        connectionMap.forEach((group) => {
            if (group.length === 1) {
                straightEdges.push(group[0]);
            } else {
                group.forEach((edge, i) => {
                    curvedEdgesData.push({
                        edge,
                        index: i,
                        total: group.length
                    });
                });
            }
        });

        // 5. Render Straight Edges
        if (straightEdges.length > 0) {
            this.cylinderMesh = new THREE.InstancedMesh(
                this.geometry,
                this.material,
                straightEdges.length
            );
            this.cylinderMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            this.cylinderMesh.castShadow = true;
            this.cylinderMesh.receiveShadow = true;
            this.scene.add(this.cylinderMesh);

            const dummy = new THREE.Object3D();
            const startVec = new THREE.Vector3();
            const endVec = new THREE.Vector3();

            straightEdges.forEach((edge: any, i) => {
                const s = edge.source !== undefined ? edge.source : edge.start;
                const t = edge.target !== undefined ? edge.target : edge.end;

                const startNode = nodeMap.get(s);
                const endNode = nodeMap.get(t);

                if (startNode && endNode) {
                    const startPos = this.getNodePosition(startNode);
                    const endPos = this.getNodePosition(endNode);

                    startVec.set(startPos.x, startPos.y, startPos.z);
                    endVec.set(endPos.x, endPos.y, endPos.z);

                    dummy.position.copy(startVec);
                    dummy.lookAt(endVec);

                    const distance = startVec.distanceTo(endVec);
                    dummy.scale.set(1, 1, distance);

                    dummy.updateMatrix();
                    this.cylinderMesh!.setMatrixAt(i, dummy.matrix);

                    this.instanceToEdgeData.set(i, edge);
                }
            });
            this.cylinderMesh.instanceMatrix.needsUpdate = true;
            this.cylinderMesh.userData = { type: 'edge' };
        }

        // 6. Render Curved Edges
        curvedEdgesData.forEach(item => {
            const edgeData = item.edge as any;
            const s = edgeData.source !== undefined ? edgeData.source : edgeData.start;
            const t = edgeData.target !== undefined ? edgeData.target : edgeData.end;

            const startNode = nodeMap.get(s);
            const endNode = nodeMap.get(t);

            if (startNode && endNode) {
                const startPos = this.getNodePosition(startNode);
                const endPos = this.getNodePosition(endNode);

                // Create Edge instance (using ../objects/Edge.js)
                const edgeObj = new Edge(
                    new THREE.Vector3(startPos.x, startPos.y, startPos.z),
                    new THREE.Vector3(endPos.x, endPos.y, endPos.z),
                    1, // startNodeRadius (approx)
                    1, // endNodeRadius (approx)
                    {
                        index: item.index,
                        totalEdges: item.total,
                        color: 0xaaaaaa,
                        start: s,
                        end: t,
                        name: edgeData.label || edgeData.id
                    }
                );

                // Add metadata for interaction
                edgeObj.tube.userData = {
                    type: 'edge', // Important for RaycastManager
                    edge: edgeData, // Store the actual data
                    start: startPos,
                    end: endPos
                };

                this.scene.add(edgeObj.tube);
                this.curvedEdges.push(edgeObj);
            }
        });
    }

    public updateEdgePositions(nodes: (NodeData | EntityData)[]) {
        const nodeMap = new Map<string | number, NodeData | EntityData>();
        nodes.forEach(node => nodeMap.set(node.id, node));

        // Update InstancedMesh
        if (this.cylinderMesh) {
            const dummy = new THREE.Object3D();
            const startVec = new THREE.Vector3();
            const endVec = new THREE.Vector3();

            this.instanceToEdgeData.forEach((edge: any, i) => {
                const s = edge.source !== undefined ? edge.source : edge.start;
                const t = edge.target !== undefined ? edge.target : edge.end;

                const startNode = nodeMap.get(s);
                const endNode = nodeMap.get(t);

                if (startNode && endNode) {
                    const startPos = this.getNodePosition(startNode);
                    const endPos = this.getNodePosition(endNode);

                    startVec.set(startPos.x, startPos.y, startPos.z);
                    endVec.set(endPos.x, endPos.y, endPos.z);

                    dummy.position.copy(startVec);
                    dummy.lookAt(endVec);

                    const distance = startVec.distanceTo(endVec);
                    dummy.scale.set(1, 1, distance);

                    dummy.updateMatrix();
                    this.cylinderMesh!.setMatrixAt(i, dummy.matrix);
                }
            });
            this.cylinderMesh.instanceMatrix.needsUpdate = true;
        }

        // Update Curved Edges
        this.curvedEdges.forEach(edgeObj => {
            const startNode = nodeMap.get(edgeObj.options.start);
            const endNode = nodeMap.get(edgeObj.options.end);

            if (startNode && endNode) {
                const startPos = this.getNodePosition(startNode);
                const endPos = this.getNodePosition(endNode);

                edgeObj.updatePositions(
                    new THREE.Vector3(startPos.x, startPos.y, startPos.z),
                    new THREE.Vector3(endPos.x, endPos.y, endPos.z),
                    1, 1
                );
            }
        });
    }

    private getNodePosition(node: any): { x: number, y: number, z: number } {
        if (node.position) {
            return node.position;
        } else {
            return { x: node.x || 0, y: node.y || 0, z: node.z || 0 };
        }
    }

    public dispose() {
        if (this.cylinderMesh) {
            this.scene.remove(this.cylinderMesh);
            this.cylinderMesh.dispose();
            this.cylinderMesh = null;
        }

        this.curvedEdges.forEach(edge => {
            if (edge.tube) this.scene.remove(edge.tube);
            if (edge.dispose) edge.dispose();
        });
        this.curvedEdges = [];
        this.instanceToEdgeData.clear();
    }

    /**
     * Retrieves EdgeData associated with a specific mesh instance index.
     */
    public getInstanceData(instanceId: number): EdgeData | RelationshipData | undefined {
        return this.instanceToEdgeData.get(instanceId);
    }

    public getMeshes(): THREE.Object3D[] {
        const meshes: THREE.Object3D[] = [];
        if (this.cylinderMesh) {
            meshes.push(this.cylinderMesh);
        }
        this.curvedEdges.forEach(edge => {
            if (edge.tube) meshes.push(edge.tube);
        });
        return meshes;
    }
}
