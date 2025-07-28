import * as THREE from 'three';

export class Edge {
    static geometryCache = new Map();
    static materialCache = new Map();
    
    constructor(startPosition, endPosition, startNodeRadius, endNodeRadius, options = {}) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.startNodeRadius = startNodeRadius;
        this.endNodeRadius = endNodeRadius;
        this.options = options;
        this.line = this.createLine();
    }
    
    createLine() {
        const geometry = new THREE.BufferGeometry();
        
        // Calculate direction vector
        const direction = new THREE.Vector3().subVectors(this.endPosition, this.startPosition);
        const normalizedDirection = direction.clone().normalize();
        
        // Calculate adjusted start and end points on the node surfaces
        const adjustedStartPosition = this.startPosition.clone().add(normalizedDirection.clone().multiplyScalar(this.startNodeRadius));
        const adjustedEndPosition = this.endPosition.clone().sub(normalizedDirection.clone().multiplyScalar(this.endNodeRadius));
        
        const positions = new Float32Array([
            adjustedStartPosition.x, adjustedStartPosition.y, adjustedStartPosition.z,
            adjustedEndPosition.x, adjustedEndPosition.y, adjustedEndPosition.z
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Material for edges
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 3,
            transparent: false
        });
        
        return new THREE.Line(geometry, material);
    }
    
    updatePositions(startPosition, endPosition, startNodeRadius, endNodeRadius) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.startNodeRadius = startNodeRadius;
        this.endNodeRadius = endNodeRadius;
        
        const direction = new THREE.Vector3().subVectors(this.endPosition, this.startPosition);
        const normalizedDirection = direction.clone().normalize();
        
        const adjustedStartPosition = this.startPosition.clone().add(normalizedDirection.clone().multiplyScalar(this.startNodeRadius));
        const adjustedEndPosition = this.endPosition.clone().sub(normalizedDirection.clone().multiplyScalar(this.endNodeRadius));
        
        const positions = this.line.geometry.attributes.position.array;
        positions[0] = adjustedStartPosition.x;
        positions[1] = adjustedStartPosition.y;
        positions[2] = adjustedStartPosition.z;
        positions[3] = adjustedEndPosition.x;
        positions[4] = adjustedEndPosition.y;
        positions[5] = adjustedEndPosition.z;
        
        this.line.geometry.attributes.position.needsUpdate = true;
    }
    
    dispose() {
        if (this.line) {
            this.line.geometry.dispose();
            this.line.material.dispose();
            this.line = null;
        }
    }
    
    static clearCache() {
        Edge.geometryCache.clear();
        Edge.materialCache.clear();
    }
}
