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

        if (intersects.length === 0) return null;

        // Gehe die Treffer der Reihe nach durch (sie sind nach Entfernung sortiert)
        for (const intersect of intersects) {
            const object = intersect.object;
            const userData = object.userData;

            // 1. Check for Edges (Mesh with curve data)
            if (userData && userData.type === 'edge' && userData.curve) {
                return object;
            }

            // 2. Check for Nodes (InstancedMesh)
            if ((object as any).isInstancedMesh && userData.type === 'node_instanced' &&
                intersect.instanceId !== undefined && this.nodeManager) {

                const mesh = object as THREE.InstancedMesh;
                const geometryType = mesh.userData.geometryType || 'sphere';
                const nodeData = this.nodeManager.getNodeAt(geometryType, intersect.instanceId);

                if (nodeData && nodeData.position) {
                    // Return a proxy object that looks like a selected node
                    const dummyNode = new THREE.Object3D();
                    dummyNode.position.set(nodeData.position.x || 0, nodeData.position.y || 0, nodeData.position.z || 0);

                    dummyNode.userData = {
                        type: 'node',
                        node: { data: nodeData },
                        nodeData: nodeData,
                        geometryType: geometryType,
                        id: nodeData.id,
                        instanceId: intersect.instanceId
                    };

                    return dummyNode;
                }
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
