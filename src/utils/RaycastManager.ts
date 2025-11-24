import * as THREE from 'three';
// @ts-ignore
import { NodeObjectsManager } from '../core/NodeObjectsManager';

export class RaycastManager {
    private camera: THREE.Camera;
    private scene: THREE.Scene;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private lastRaycastTime: number;
    private lastIntersectedObject: THREE.Object3D | null;
    private nodeObjectsManager: NodeObjectsManager | null;

    constructor(camera: THREE.Camera, scene: THREE.Scene, nodeObjectsManager: NodeObjectsManager | null = null) {
        this.camera = camera;
        this.scene = scene;
        this.nodeObjectsManager = nodeObjectsManager;
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

        // Perform raycast against scene children
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        // 1. Check for Edges first (Mesh with userData.type === 'edge')
        const edgeIntersect = intersects.find(intersect =>
            intersect.object.userData && intersect.object.userData.type === 'edge'
        );

        if (edgeIntersect) {
            return edgeIntersect.object;
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
                // We can't return the InstancedMesh itself as the selection target because it represents ALL nodes.
                // We return a dummy object with the correct userData.

                // Note: To support highlighting, we might need a way to tell the manager to highlight this instance.
                // But for now, we just return data for the UI.

                const dummyNode = new THREE.Object3D();
                // Position at the intersection point or the node's actual position?
                // Node's actual position is better for camera focus.
                dummyNode.position.set(nodeData.x || 0, nodeData.y || 0, nodeData.z || 0);

                dummyNode.userData = {
                    type: 'node',
                    node: { data: nodeData }, // Structure expected by UIManager/InteractionManager
                    nodeData: nodeData,       // Direct access
                    geometryType: geometryType,
                    id: nodeData.id,
                    instanceId: nodeIntersect.instanceId
                };

                // Add a reference to the manager/mesh for highlighting logic if needed later
                // (dummyNode as any)._manager = this.nodeObjectsManager;

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
