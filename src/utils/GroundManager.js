import * as THREE from 'three';

export class GroundManager {
    constructor(scene) {
        this.scene = scene;
        this.ground = null;
    }
    
    createGround(yPosition = -2) {
        // Beiger Untergrund mit Schatten
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xF5F5DC, // Beige
            transparent: true,
            opacity: 0.8
        });
        
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2; // Horizontal ausrichten
        this.ground.position.y = yPosition; // Unter dem Netzwerk positionieren
        this.ground.receiveShadow = true; // Schatten empfangen
        this.ground.name = "ground";
        
        this.scene.add(this.ground);
        console.log("Beiger Untergrund erstellt");
        
        return this.ground;
    }
    
    removeGround() {
        if (this.ground) {
            this.scene.remove(this.ground);
            this.ground = null;
        }
    }
    
    setPosition(y) {
        if (this.ground) {
            this.ground.position.y = y;
        }
    }
}