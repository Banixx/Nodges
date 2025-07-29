import * as THREE from 'three';

export class RaycastManager {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.lastRaycastTime = 0;
        this.lastIntersectedObject = null;
    }
    
    updateMousePosition(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    findIntersectedObject() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // F«ähre den Raycast f«är alle Objekte durch
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        // Debug-Ausgabe f«är alle Intersects
        if (intersects.length > 0) {
            console.log('Raycast intersects:', intersects.map(i => ({
                object: i.object,
                userData: i.object.userData,
                type: i.object.userData?.type,
                isInstancedMesh: i.object.isInstancedMesh
            })));
        }
        
        // Pr«äfe zuerst auf Kanten (Edges)
        const edgeIntersect = intersects.find(intersect => 
            intersect.object.userData && intersect.object.userData.type === 'edge'
        );
        
        if (edgeIntersect) {
            console.log('Edge gefunden:', edgeIntersect.object);
            return edgeIntersect.object;
        }
        
        // Dann auf Knoten (Instanced Mesh)
        const nodeIntersect = intersects.find(intersect => 
            intersect.object.isInstancedMesh
        );
        
        if (nodeIntersect) {
            console.log('Node gefunden:', nodeIntersect.object);
            // Erstelle ein Dummy-Objekt f«är die Interaktion
            const dummyNode = new THREE.Object3D();
            dummyNode.position.copy(nodeIntersect.point);
            dummyNode.userData = {
                type: 'node',
                instanceId: nodeIntersect.instanceId,
                nodeIndex: nodeIntersect.instanceId
            };
            return dummyNode;
        }
        
        return null;
    }
    
    throttledRaycast(event) {
        const now = performance.now();
        if (now - this.lastRaycastTime > 50) {
            this.updateMousePosition(event);
            this.lastIntersectedObject = this.findIntersectedObject();
            this.lastRaycastTime = now;
        }
        return this.lastIntersectedObject;
    }
}
