import * as THREE from 'three';
import { MinimapUI } from '../ui/MinimapUI';

/**
 * MinimapManager
 *
 * Kapselt die komplette Minimap-Logik, die zuvor direkt in App.ts lag:
 * - Minimap-Kamera (orthografisch, Top-Down)
 * - Kamera-Marker fuer die Hauptkamera-Perspektive
 * - Zoom- und Pan-Interaktion
 * - Zweiter Render-Pass (Viewport/Scissor, DPR-Korrektur)
 *
 * Ziel des Refactorings: App.ts entschlacken und die Minimap isoliert testbar machen.
 */
export interface MinimapLabelVisibility {
    nodeVisible: boolean;
    edgeVisible: boolean;
}

/** Callback, um die Sichtbarkeit der Labels beim Minimap-Render ein-/auszuschalten. */
export type MinimapLabelToggler = (nodeVisible: boolean, edgeVisible: boolean) => void;

export class MinimapManager {
    public ui: MinimapUI;
    public camera: THREE.OrthographicCamera;

    private zoom: number = 100;
    private center: THREE.Vector2 = new THREE.Vector2(0, 0);
    private marker: THREE.Group;
    private scene: THREE.Scene;

    private static readonly LAYER_GROUND = 0;
    private static readonly LAYER_GRAPH = 1;
    private static readonly LAYER_MARKER = 2;

    constructor(containerId: string, scene: THREE.Scene) {
        this.scene = scene;

        this.ui = new MinimapUI(containerId);
        this.ui.onZoom = (delta: number) => {
            this.zoom = Math.max(10, Math.min(500, this.zoom + delta * 0.1));
            this.updateCamera();
        };
        this.ui.onPan = (dx: number, dy: number) => {
            const canvas = this.ui.getCanvas();
            const aspect = canvas.width / canvas.height;
            const worldWidth = this.zoom * aspect * 2;
            const worldHeight = this.zoom * 2;
            this.center.x -= (dx / canvas.width) * worldWidth;
            this.center.y -= (dy / canvas.height) * worldHeight;
            this.updateCamera();
        };

        this.camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 0.1, 2000);
        this.camera.position.set(0, 500, 0);
        this.camera.up.set(0, 0, -1);
        this.camera.lookAt(0, 0, 0);
        this.camera.layers.disableAll();
        this.camera.layers.enable(MinimapManager.LAYER_GROUND);
        this.camera.layers.enable(MinimapManager.LAYER_GRAPH);
        this.camera.layers.enable(MinimapManager.LAYER_MARKER);

        this.marker = this.createCameraMarker();
        this.scene.add(this.marker);

        window.addEventListener('resize', this.updateCamera.bind(this));
        this.ui.updateSize();
        this.updateCamera();
    }

    /**
     * Zentriert die Minimap auf eine Weltposition und setzt den Zoom.
     */
    public setView(centerX: number, centerZ: number, zoom: number): void {
        this.center.set(centerX, centerZ);
        this.zoom = zoom;
        this.updateCamera();
    }

    /**
     * Setzt die Minimap auf den Ausgangszustand zurueck (Zentrum 0,0, Zoom 100).
     */
    public reset(): void {
        this.center.set(0, 0);
        this.zoom = 100;
        this.updateCamera();
    }

    /**
     * Aktualisiert die Canvas-Groesse (z. B. nach Layout-Aenderungen).
     */
    public updateSize(): void {
        if (this.ui) {
            this.ui.updateSize();
        }
        this.updateCamera();
    }

    /**
     * Fuehrt den zweiten Render-Pass fuer den Minimap-Viewport aus.
     * Passt dabei Viewport/Scissor an, blendet Labels aus und positioniert den Marker.
     */
    public render(
        renderer: THREE.WebGLRenderer,
        mainCamera: THREE.Camera,
        labelVisibility: MinimapLabelVisibility,
        setLabels: MinimapLabelToggler
    ): void {
        if (!renderer || !renderer.domElement) return;
        const mmCanvas = this.ui.getCanvas();
        if (!mmCanvas) return;

        const rect = mmCanvas.parentElement!.getBoundingClientRect();

        // Aktuelle Clear-Farbe sichern
        const oldClearColor = new THREE.Color();
        renderer.getClearColor(oldClearColor);
        const oldClearAlpha = renderer.getClearAlpha();

        renderer.setScissorTest(true);

        // DPR-Handling fuer Viewport und Scissor
        const dpr = window.devicePixelRatio;
        const viewY = (window.innerHeight - rect.bottom) * dpr;
        const viewX = rect.left * dpr;
        const viewWidth = rect.width * dpr;
        const viewHeight = rect.height * dpr;

        renderer.setViewport(viewX, viewY, viewWidth, viewHeight);
        renderer.setScissor(viewX, viewY, viewWidth, viewHeight);

        // Transparenter Hintergrund fuer den Minimap-Viewport
        renderer.setClearColor(0x000000, 0.0);
        renderer.clear();

        // Labels im Minimap ausblenden
        setLabels(false, false);

        // Marker auf die Hauptkamera ausrichten
        if (this.marker) {
            this.marker.position.set(mainCamera.position.x, 10, mainCamera.position.z);
            const dir = new THREE.Vector3();
            mainCamera.getWorldDirection(dir);
            this.marker.rotation.y = Math.atan2(dir.x, dir.z);
        }

        const oldBackground = this.scene.background;
        this.scene.background = null; // Transparent, um Haupt-Canvas/Clear-Farbe zu sehen

        // Relevante Layer sicherstellen
        this.camera.layers.enable(MinimapManager.LAYER_GROUND);
        this.camera.layers.enable(MinimapManager.LAYER_GRAPH);
        this.camera.layers.enable(MinimapManager.LAYER_MARKER);

        renderer.render(this.scene, this.camera);
        this.scene.background = oldBackground;

        // Labels wiederherstellen
        setLabels(labelVisibility.nodeVisible, labelVisibility.edgeVisible);

        renderer.setClearColor(oldClearColor, oldClearAlpha);
        renderer.setScissorTest(false);
    }

    /**
     * Entfernt den Marker und den Resize-Listener.
     */
    public dispose(): void {
        window.removeEventListener('resize', this.updateCamera.bind(this));
        if (this.marker) {
            this.scene.remove(this.marker);
        }
    }

    private updateCamera(): void {
        if (!this.ui || !this.camera) return;
        this.ui.updateSize();
        const canvas = this.ui.getCanvas();
        const aspect = canvas.width / canvas.height;
        const d = this.zoom;

        this.camera.left = -d * aspect;
        this.camera.right = d * aspect;
        this.camera.top = d;
        this.camera.bottom = -d;

        this.camera.position.set(this.center.x, 500, this.center.y);
        this.camera.up.set(0, 0, -1);
        this.camera.lookAt(this.center.x, 0, this.center.y);

        this.camera.updateProjectionMatrix();
    }

    private createCameraMarker(): THREE.Group {
        const marker = new THREE.Group();

        // Klassisches Kamera-Linien-Symbol (schwarz)
        const points = [];
        // Quadrat (Korpus)
        points.push(new THREE.Vector3(-1.5, 0, -3));
        points.push(new THREE.Vector3(-1.5, 0, 0));
        points.push(new THREE.Vector3(0, 0, 0)); // Basispunkt des Dreiecks

        // Dreieck (Linse)
        points.push(new THREE.Vector3(-2, 0, 3));
        points.push(new THREE.Vector3(2, 0, 3));
        points.push(new THREE.Vector3(0, 0, 0));

        // Rest des Quadrats
        points.push(new THREE.Vector3(1.5, 0, 0));
        points.push(new THREE.Vector3(1.5, 0, -3));
        points.push(new THREE.Vector3(-1.5, 0, -3));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x000000 });
        const mesh = new THREE.Line(geometry, material);

        marker.add(mesh);
        marker.layers.set(MinimapManager.LAYER_MARKER);
        mesh.layers.set(MinimapManager.LAYER_MARKER);

        return marker;
    }
}
