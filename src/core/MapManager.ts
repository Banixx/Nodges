import * as THREE from 'three';
import { IStateManager } from './interfaces';

export class MapManager {
    private scene: THREE.Scene;
    private stateManager: IStateManager;
    private mapPlane: THREE.Mesh | null = null;
    private textureLoader = new THREE.TextureLoader();

    constructor(scene: THREE.Scene, stateManager: IStateManager) {
        this.scene = scene;
        this.stateManager = stateManager;
    }

    public async loadMap(imageUrl: string, width: number, height: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                imageUrl,
                (texture) => {
                    this.createMapPlane(texture, width, height);
                    this.stateManager.update({ mapActive: true });
                    resolve();
                },
                undefined,
                (err) => {
                    console.error('[MapManager] Failed to load map image', err);
                    reject(err);
                }
            );
        });
    }

    private createMapPlane(texture: THREE.Texture, width: number, height: number) {
        this.removeMap();

        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            depthWrite: false, // Ensure it's rendered as background
            transparent: true,
            opacity: 0.8
        });

        this.mapPlane = new THREE.Mesh(geometry, material);
        // Liegt auf der X-Z-Ebene (Boden) leicht unter y=0
        this.mapPlane.rotation.x = -Math.PI / 2;
        this.mapPlane.position.set(0, -0.1, 0); 
        this.scene.add(this.mapPlane);
        
        console.log(`[MapManager] Map created with dimensions ${width}x${height}`);
    }

    public removeMap() {
        if (this.mapPlane) {
            this.scene.remove(this.mapPlane);
            this.mapPlane.geometry.dispose();
            (this.mapPlane.material as THREE.Material).dispose();
            this.mapPlane = null;
            this.stateManager.update({ mapActive: false });
        }
    }
}
