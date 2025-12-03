import * as THREE from 'three';
import { EdgeData, NodeData } from '../types';
// @ts-ignore
import { Edge } from '../objects/Edge.js';

export class EdgeObjectsManager {
    private scene: THREE.Scene;
    private cylinderMesh: THREE.InstancedMesh | null = null;
    private curvedEdges: any[] = []; // Store Edge instances for curved/multi-edges

    // Map instance index to EdgeData for interaction
    private instanceToEdgeData: Map<number, EdgeData>;

    private material: THREE.MeshBasicMaterial;
    private geometry: THREE.CylinderGeometry;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.instanceToEdgeData = new Map();

        // Shared resources for straight edges
        this.geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8, 1);
        this.geometry.translate(0, 0.5, 0); // Pivot at bottom for easier scaling/rotation
        this.geometry.rotateX(Math.PI / 2); // Align with Z axis (or whatever LookAt uses)
        // Actually, Cylinder is Y-up. 
        // If we want to use lookAt, we usually align with Z. 
        // But standard Cylinder is Y. 
        // Let's keep it Y-up and use lookAt + rotateX(PI/2).
        // Or just use quaternion math.
        // Let's reset geometry rotation and handle it in update.
        this.geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8, 1);
        this.geometry.translate(0, 0.5, 0); // Pivot at base
        this.geometry.rotateX(Math.PI / 2); // Align to Z axis to match LookAt direction?
        // Standard LookAt works along Z? No, usually Z is forward.
        // Let's stick to: Align cylinder along +Z axis.

        this.material = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa,
            depthWrite: true
        });
    }

    public updateEdges(edges: EdgeData[], nodes: NodeData[]) {
        // 1. Clear existing
        this.dispose();

        // 2. Map nodes for fast lookup
        const nodeMap = new Map<string | number, NodeData>();
        nodes.forEach(node => nodeMap.set(node.id, node));

        // 3. Group edges by connection (start-end) to identify duplicates
        const connectionMap = new Map<string, EdgeData[]>();

        edges.forEach((edge) => {
            // Sort IDs to treat A->B and B->A as same connection
            const start = edge.start < edge.end ? edge.start : edge.end;
            const end = edge.start < edge.end ? edge.end : edge.start;
            const key = `${start}-${end}`;

            if (!connectionMap.has(key)) {
                connectionMap.set(key, []);
            }
            connectionMap.get(key)!.push(edge);
        });

        // 4. Separate straight vs curved
        const straightEdges: EdgeData[] = [];
        const curvedEdgesData: { edge: EdgeData, index: number, total: number }[] = [];

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

        // 5. For now, treat all edges as straight lines (including multi-edges)
        const allEdges = [...straightEdges, ...curvedEdgesData.map(item => item.edge)];

        if (allEdges.length > 0) {
            this.cylinderMesh = new THREE.InstancedMesh(
                this.geometry,
                this.material,
                allEdges.length
            );
            this.cylinderMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            this.scene.add(this.cylinderMesh);

            const dummy = new THREE.Object3D();
            const startVec = new THREE.Vector3();
            const endVec = new THREE.Vector3();

            allEdges.forEach((edge, i) => {
                const startNode = nodeMap.get(edge.start);
                const endNode = nodeMap.get(edge.end);

                if (startNode && endNode) {
                    startVec.set(startNode.x, startNode.y, startNode.z);
                    endVec.set(endNode.x, endNode.y, endNode.z);

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

            // Store metadata: Mark this mesh as representing Edges ('edge' is expected by RaycastManager)
            this.cylinderMesh.userData = { type: 'edge' };
        }
    }

    public updateEdgePositions(nodes: NodeData[]) {
        const nodeMap = new Map<string | number, NodeData>();
        nodes.forEach(node => nodeMap.set(node.id, node));

        // Update InstancedMesh
        if (this.cylinderMesh) {
            const dummy = new THREE.Object3D();
            const startVec = new THREE.Vector3();
            const endVec = new THREE.Vector3();

            this.instanceToEdgeData.forEach((edge, i) => {
                const startNode = nodeMap.get(edge.start);
                const endNode = nodeMap.get(edge.end);

                if (startNode && endNode) {
                    startVec.set(startNode.x, startNode.y, startNode.z);
                    endVec.set(endNode.x, endNode.y, endNode.z);

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
                const startPos = new THREE.Vector3(startNode.x, startNode.y, startNode.z);
                const endPos = new THREE.Vector3(endNode.x, endNode.y, endNode.z);

                edgeObj.updatePositions(startPos, endPos, 0.5, 0.5);
            }
        });
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
    public getInstanceData(instanceId: number): EdgeData | undefined {
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
