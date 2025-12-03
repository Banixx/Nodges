import * as THREE from 'three';
// @ts-ignore
import { NodeObjectsManager } from '../core/NodeObjectsManager';
// @ts-ignore
import { EdgeObjectsManager } from '../core/EdgeObjectsManager';

export class RaycastManager {
    private camera: THREE.Camera;
    // private scene: THREE.Scene; // Removed as unused
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private lastRaycastTime: number;
    private lastIntersectedObject: THREE.Object3D | null;
    private nodeObjectsManager: NodeObjectsManager | null;
    private edgeObjectsManager: EdgeObjectsManager | null;

    constructor(camera: THREE.Camera, nodeObjectsManager: NodeObjectsManager | null = null, edgeObjectsManager: EdgeObjectsManager | null = null) {
        this.camera = camera;
        // scene is no longer used for raycasting
        this.nodeObjectsManager = nodeObjectsManager;
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

        if (this.nodeObjectsManager) {
            interactiveMeshes = interactiveMeshes.concat(this.nodeObjectsManager.getMeshes());
        }

        if (this.edgeObjectsManager) {
            interactiveMeshes = interactiveMeshes.concat(this.edgeObjectsManager.getMeshes());
        }

        // Perform raycast against only interactive meshes
        // Note: We don't need recursive=true for InstancedMesh, but might for curved edges if they are groups (usually they are single meshes)
        const intersects = this.raycaster.intersectObjects(interactiveMeshes, false);

        // 1. Check for Edges first (Mesh with userData.type === 'edge')
        const edgeIntersect = intersects.find(intersect =>
            intersect.object.userData && intersect.object.userData.type === 'edge'
        );

        if (edgeIntersect) {
            const mesh = edgeIntersect.object;

            // NOTE: Accessing instanceId on intersect result, assuming Three.js provides it for InstancedMesh hits
            const instanceId = edgeIntersect.instanceId !== undefined ? edgeIntersect.instanceId : undefined;

            if (this.edgeObjectsManager && instanceId !== undefined) {
                // Retrieve EdgeData from manager using instanceId
                const edgeData = this.edgeObjectsManager.getInstanceData(instanceId);

                if (edgeData && this.nodeObjectsManager) {
                    // Create a proxy object for the edge
                    const dummyEdge = new THREE.Object3D();

                    // Get start and end node positions
                    const startNode = this.nodeObjectsManager.getNodeData(String(edgeData.start));
                    const endNode = this.nodeObjectsManager.getNodeData(String(edgeData.end));

                    if (startNode && endNode) {
                        dummyEdge.userData = {
                            type: 'edge',
                            edge: edgeData,
                            start: { x: startNode.x, y: startNode.y, z: startNode.z },
                            end: { x: endNode.x, y: endNode.y, z: endNode.z },
                            originalObject: mesh // Keep reference to original mesh if needed
                        };
                        return dummyEdge;
                    }
                }
            }
            // Fallback: Return object if tagged correctly but data retrieval failed/not applicable
            if (mesh.userData.type === 'edge') {
                return mesh;
            }
        }

        // 2. Check for Nodes (InstancedMesh)
        const nodeIntersect = intersects.find(intersect =>
            (intersect.object as any).isInstancedMesh
        );

        if (nodeIntersect && nodeIntersect.instanceId !== undefined && this.nodeObjectsManager) {
            const mesh = nodeIntersect.object as THREE.InstancedMesh;
            const geometryType = mesh.userData.geometryType || 'sphere';

            // Retrieve real NodeData from manager
            const nodeData = this.nodeObjectsManager.getNodeAt(geometryType, nodeIntersect.instanceId);

            if (nodeData) {
                // Return a proxy object that looks like a selected node
                const dummyNode = new THREE.Object3D();
                dummyNode.position.set(nodeData.x || 0, nodeData.y || 0, nodeData.z || 0);

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
