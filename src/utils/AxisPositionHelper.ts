/**
 * AxisPositionHelper - Hilfsklasse für schrittweise 3D-Positionierung
 * Ermöglicht Positionierung entlang Y→X→Z Achsen mit visueller Hilfe
 */
import * as THREE from 'three';

type Axis = 'y' | 'x' | 'z';

export class AxisPositionHelper {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;

    private currentAxis: Axis = 'y';
    private helperLine: THREE.Line | null = null;
    private previewNode: THREE.Mesh | null = null;
    private currentPosition: THREE.Vector3;
    private initialPosition: THREE.Vector3;

    private isActive: boolean = false;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    // Achsen-Farben
    private axisColors = {
        x: 0xff0000, // Rot
        y: 0x00ff00, // Grün
        z: 0x0000ff  // Blau
    };

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.currentPosition = new THREE.Vector3();
        this.initialPosition = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    /**
     * Startet die Achsen-Positionierung
     */
    start(initialPosition: THREE.Vector3) {
        this.isActive = true;
        this.currentAxis = 'y';
        this.initialPosition.copy(initialPosition);
        this.currentPosition.copy(initialPosition);

        this.createPreviewNode();
        this.createAxisHelper();
    }

    /**
     * Erstellt einen Preview-Node
     */
    private createPreviewNode() {
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            wireframe: true
        });

        this.previewNode = new THREE.Mesh(geometry, material);
        this.previewNode.position.copy(this.currentPosition);
        this.scene.add(this.previewNode);
    }

    /**
     * Erstellt die Achsen-Hilfslinie
     */
    private createAxisHelper() {
        if (this.helperLine) {
            this.scene.remove(this.helperLine);
        }

        const points = [];
        const length = 100;

        switch (this.currentAxis) {
            case 'y':
                points.push(new THREE.Vector3(this.currentPosition.x, this.currentPosition.y - length, this.currentPosition.z));
                points.push(new THREE.Vector3(this.currentPosition.x, this.currentPosition.y + length, this.currentPosition.z));
                break;
            case 'x':
                points.push(new THREE.Vector3(this.currentPosition.x - length, this.currentPosition.y, this.currentPosition.z));
                points.push(new THREE.Vector3(this.currentPosition.x + length, this.currentPosition.y, this.currentPosition.z));
                break;
            case 'z':
                points.push(new THREE.Vector3(this.currentPosition.x, this.currentPosition.y, this.currentPosition.z - length));
                points.push(new THREE.Vector3(this.currentPosition.x, this.currentPosition.y, this.currentPosition.z + length));
                break;
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: this.axisColors[this.currentAxis],
            linewidth: 2,
            opacity: 0.8,
            transparent: true
        });

        this.helperLine = new THREE.Line(geometry, material);
        this.scene.add(this.helperLine);
    }

    /**
     * Aktualisiert die Position basierend auf Mausbewegung
     */
    update(event: MouseEvent) {
        if (!this.isActive || !this.previewNode) return;

        // Mausposition normalisieren
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Raycaster aktualisieren
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Projektionsebene erstellen (senkrecht zur Kamera)
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);

        const plane = new THREE.Plane();
        plane.setFromNormalAndCoplanarPoint(cameraDirection, this.currentPosition);

        // Schnittpunkt mit Ebene finden
        const intersectionPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, intersectionPoint);

        if (intersectionPoint) {
            // Nur entlang der aktuellen Achse bewegen
            switch (this.currentAxis) {
                case 'y':
                    this.currentPosition.y = intersectionPoint.y;
                    break;
                case 'x':
                    this.currentPosition.x = intersectionPoint.x;
                    break;
                case 'z':
                    this.currentPosition.z = intersectionPoint.z;
                    break;
            }

            this.previewNode.position.copy(this.currentPosition);
        }
    }

    /**
     * Bestätigt die aktuelle Achse und wechselt zur nächsten
     */
    confirmAxis(): boolean {
        switch (this.currentAxis) {
            case 'y':
                this.currentAxis = 'x';
                this.createAxisHelper();
                return false; // Noch nicht fertig
            case 'x':
                this.currentAxis = 'z';
                this.createAxisHelper();
                return false; // Noch nicht fertig
            case 'z':
                return true; // Fertig
        }
    }

    /**
     * Beendet die Positionierung und gibt die finale Position zurück
     */
    finish(): THREE.Vector3 {
        this.cleanup();
        return this.currentPosition.clone();
    }

    /**
     * Bricht die Positionierung ab
     */
    cancel() {
        this.cleanup();
    }

    /**
     * Räumt alle visuellen Hilfsobjekte auf
     */
    private cleanup() {
        this.isActive = false;

        if (this.helperLine) {
            this.scene.remove(this.helperLine);
            this.helperLine = null;
        }

        if (this.previewNode) {
            this.scene.remove(this.previewNode);
            this.previewNode = null;
        }
    }

    /**
     * Gibt zurück, ob der Helper aktiv ist
     */
    getIsActive(): boolean {
        return this.isActive;
    }

    /**
     * Gibt die aktuelle Achse zurück
     */
    getCurrentAxis(): Axis {
        return this.currentAxis;
    }
}
