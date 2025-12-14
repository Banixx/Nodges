import * as THREE from 'three';
// @ts-ignore
import { NodeManager } from '../core/NodeManager';
// @ts-ignore
import { EdgeObjectsManager } from '../core/EdgeObjectsManager';
// @ts-ignore
import { EntityData } from '../types';

export class RaycastManager {
    private camera: THREE.Camera;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private lastRaycastTime: number;
    private lastIntersectedObject: THREE.Object3D | null;
    private nodeManager: NodeManager | null;
    private edgeObjectsManager: EdgeObjectsManager | null;

    constructor(camera: THREE.Camera, nodeManager: NodeManager | null = null, edgeObjectsManager: EdgeObjectsManager | null = null) {
        this.camera = camera;
        this.nodeManager = nodeManager;
        this.edgeObjectsManager = edgeObjectsManager;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.lastRaycastTime = 0;
        this.lastIntersectedObject = null;
    }

    updateMousePosition(event: MouseEvent) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    findIntersectedObject(): THREE.Object3D | null {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Collect all interactive meshes
        let interactiveMeshes: THREE.Object3D[] = [];

        if (this.nodeManager) {
            interactiveMeshes = interactiveMeshes.concat(this.nodeManager.getMeshes());
        }

        if (this.edgeObjectsManager) {
            interactiveMeshes = interactiveMeshes.concat(this.edgeObjectsManager.getMeshes());
        }

        // Perform raycast against only interactive meshes
        const intersects = this.raycaster.intersectObjects(interactiveMeshes, false);

        // 1. Check for Edges first (Mesh with userData.type === 'edge')
        const edgeIntersect = intersects.find(intersect =>
            intersect.object.userData && intersect.object.userData.type === 'edge'
        );

        if (edgeIntersect) {
            const mesh = edgeIntersect.object;
            const instanceId = edgeIntersect.instanceId !== undefined ? edgeIntersect.instanceId : undefined;

            if (this.edgeObjectsManager && instanceId !== undefined) {
                // Retrieve EdgeData from manager using instanceId
                const edgeData = this.edgeObjectsManager.getInstanceData(instanceId);

                if (edgeData && this.nodeManager) {
                    // Create a proxy object for the edge
                    const dummyEdge = new THREE.Object3D();

                    // Get start and end node positions
                    // Assuming edgeData uses 'source'/'target' or mapped 'start'/'end'
                    // App.ts mapped source->start, target->end.
                    const startId = String(edgeData.start || edgeData.source);
                    const endId = String(edgeData.end || edgeData.target);
                    const startNode = this.nodeManager.getNodeData(startId);
                    const endNode = this.nodeManager.getNodeData(endId);

                    if (startNode && endNode && startNode.position && endNode.position) {
                        dummyEdge.userData = {
                            type: 'edge',
                            edge: edgeData,
                            start: { x: startNode.position.x, y: startNode.position.y, z: startNode.position.z },
                            end: { x: endNode.position.x, y: endNode.position.y, z: endNode.position.z },
                            originalObject: mesh
                        };
                        return dummyEdge;
                    }
                }
            }
            // Fallback
            if (mesh.userData.type === 'edge') {
                return mesh;
            }
        }

        // 2. Check for Nodes (InstancedMesh)
        const nodeIntersect = intersects.find(intersect =>
            (intersect.object as any).isInstancedMesh && intersect.object.userData.type === 'node_instanced'
        );

        if (nodeIntersect && nodeIntersect.instanceId !== undefined && this.nodeManager) {
            const mesh = nodeIntersect.object as THREE.InstancedMesh;
            const geometryType = mesh.userData.geometryType || 'sphere';

            // Retrieve real EntityData from manager
            const nodeData = this.nodeManager.getNodeAt(geometryType, nodeIntersect.instanceId);

            if (nodeData && nodeData.position) {
                // Return a proxy object that looks like a selected node
                const dummyNode = new THREE.Object3D();
                dummyNode.position.set(nodeData.position.x || 0, nodeData.position.y || 0, nodeData.position.z || 0);

                dummyNode.userData = {
                    type: 'node',
                    node: { data: nodeData }, // Structure expected by UIManager/InteractionManager
                    nodeData: nodeData,       // Direct access
                    geometryType: geometryType,
                    id: nodeData.id,
                    instanceId: nodeIntersect.instanceId
                };

                return dummyNode;
            }
        }

        return null;
    }

    throttledRaycast(event: MouseEvent): THREE.Object3D | null {
        const now = performance.now();
        if (now - this.lastRaycastTime > 50) {
            this.updateMousePosition(event);
            this.lastIntersectedObject = this.findIntersectedObject();
            this.lastRaycastTime = now;
        }
        return this.lastIntersectedObject;
    }
}
