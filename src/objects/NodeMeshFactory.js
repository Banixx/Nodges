import * as THREE from 'three';

export class NodeMeshFactory {
    static createNodeMesh(nodeData) {
        let nodeGeometry;
        if (nodeData.geometry === 'cube') {
            nodeGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        } else if (nodeData.geometry === 'cone') {
            nodeGeometry = new THREE.ConeGeometry(0.3, 0.7, 32);
        } else {
            nodeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        }

        const nodeMaterial = new THREE.MeshPhongMaterial({ 
            color: nodeData.color || 0x3498db,
            shininess: 30
        });

        const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
        return nodeMesh;
    }
}
