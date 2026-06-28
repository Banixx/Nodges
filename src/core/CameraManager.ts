import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as TWEEN from '@tweenjs/tween.js';
import { ServiceContainer } from './di/ServiceContainer';

export class CameraManager {
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    
    // Speichert laufende Tweens, um sie bei manueller Interaktion abbrechen zu können
    private currentTweens: TWEEN.Tween<any>[] = [];

    constructor(private container: ServiceContainer) {
        this.camera = this.container.get<THREE.PerspectiveCamera>('Camera');
        this.controls = this.container.get<OrbitControls>('Controls');

        // Animationen abbrechen, wenn der Nutzer die Kamera manuell übernimmt
        this.controls.addEventListener('start', () => {
            this.stopAnimations();
        });
    }

    /**
     * Muss in der globalen Render-Schleife aufgerufen werden.
     */
    public update() {
        TWEEN.update();
    }

    /**
     * Stoppt alle aktuell laufenden Kamera-Animationen.
     */
    public stopAnimations() {
        for (const tween of this.currentTweens) {
            tween.stop();
        }
        this.currentTweens = [];
        if (this.controls) {
            this.controls.autoRotate = false;
        }
    }

    /**
     * Zentriert die Kamera auf den gegebenen Bereich mit sanftem Übergang.
     * @param bounds Bounding Box des Graphen
     * @param margin Faktor für den Leerraum (1.2 = 20% Leerraum)
     * @param duration Dauer der Animation in Millisekunden
     */
    public fitToBoundingBox(
        bounds: { x: { min: number, max: number }, y: { min: number, max: number }, z: { min: number, max: number } },
        margin: number = 1.2,
        duration: number = 1500
    ) {
        this.stopAnimations();

        const center = new THREE.Vector3(
            (bounds.x.min + bounds.x.max) / 2,
            (bounds.y.min + bounds.y.max) / 2,
            (bounds.z.min + bounds.z.max) / 2
        );

        const radiusX = (bounds.x.max - bounds.x.min) / 2;
        const radiusY = (bounds.y.max - bounds.y.min) / 2;
        const radiusZ = (bounds.z.max - bounds.z.min) / 2;
        const maxRadius = Math.max(radiusX, radiusY, radiusZ);

        // Optimale Distanz berechnen (inklusive Margin)
        const fov = this.camera.fov * (Math.PI / 180);
        let fovMatch = fov;
        if (this.camera.aspect < 1) {
            fovMatch = 2 * Math.atan(Math.tan(fov / 2) * this.camera.aspect);
        }
        
        const distance = Math.max(5, (maxRadius / Math.sin(fovMatch / 2))) * margin;

        const startPos = this.camera.position.clone();
        
        // Vektor von target zu camera
        const offset = startPos.clone().sub(this.controls.target);
        if (offset.lengthSq() < 0.01) offset.set(0, 0, 1);
        
        const spherical = new THREE.Spherical().setFromVector3(offset);
        
        // Zieldistanz
        const targetRadius = distance;
        
        // Phase 1: 180 Grad Orbitalflug und 45 Grad (PI/4) Polarwinkel
        const targetAzimuth1 = spherical.theta + Math.PI;
        const targetPolar1 = Math.PI / 4; 
        
        // Phase 2: Absinken auf 35 Grad über Horizont (entspricht Polarwinkel 90-35 = 55 Grad)
        const targetPolar2 = Math.PI / 2 - (35 * Math.PI / 180);
        const targetAzimuth2 = targetAzimuth1 + (Math.PI / 2); // Weiterer Viertelkreis Orbit während des Absinkens

        const proxy = {
            radius: spherical.radius,
            phi: spherical.phi,
            theta: spherical.theta,
            targetX: this.controls.target.x,
            targetY: this.controls.target.y,
            targetZ: this.controls.target.z
        };

        const phase1Duration = duration;
        const tween1 = new TWEEN.Tween(proxy)
            .to({ 
                radius: targetRadius, 
                phi: targetPolar1, 
                theta: targetAzimuth1,
                targetX: center.x,
                targetY: center.y,
                targetZ: center.z
            }, phase1Duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                const s = new THREE.Spherical(proxy.radius, proxy.phi, proxy.theta);
                this.camera.position.setFromSpherical(s).add(this.controls.target);
                this.controls.target.set(proxy.targetX, proxy.targetY, proxy.targetZ);
                this.controls.update();
            });

        const phase2Duration = duration * 1.5; 
        const tween2 = new TWEEN.Tween(proxy)
            .to({
                phi: targetPolar2,
                theta: targetAzimuth2
            }, phase2Duration)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                const s = new THREE.Spherical(proxy.radius, proxy.phi, proxy.theta);
                this.camera.position.setFromSpherical(s).add(this.controls.target);
                this.controls.update();
            })
            .onComplete(() => {
                this.controls.autoRotate = true;
                this.controls.autoRotateSpeed = 1.0;
            });

        tween1.chain(tween2);

        this.currentTweens.push(tween1, tween2);
        
        this.controls.autoRotate = false;
        
        tween1.start();
    }
}
