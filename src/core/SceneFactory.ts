import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * SceneFactory
 *
 * Kapselt die initiale 3D-Setup-Logik, die zuvor direkt in App.ts lag:
 * - WebGL-Renderer-Erzeugung inklusive mehrstufigem Fallback
 * - Konfiguration von Szene, Kamera, OrbitControls und Darstellung
 * - Erzeugung von Lichtern und Boden/Gitter
 * - Resize- und Kamera-Bewegungs-Handler
 *
 * Ziel des Refactorings: App.ts entschlacken und das 3D-Setup isoliert testbar machen.
 */

export interface SceneSetupOptions {
    ambientLightIntensity: number;
    directionalLightIntensity: number;
    onCameraMoveStart?: () => void;
    onCameraMoveEnd?: () => void;
}

export interface SceneSetupResult {
    ambientLight: THREE.AmbientLight;
    directionalLight: THREE.DirectionalLight;
    ground: THREE.Mesh;
}

export class SceneFactory {
    /** Fehler-Callback wird bei vollstaendigem WebGL-Fehler aufgerufen. */
    public static createRenderer(onFatalError?: () => void): THREE.WebGLRenderer {
        // Robust WebGL Renderer Initialization
        try {
            return new THREE.WebGLRenderer({
                antialias: true,
                powerPreference: 'high-performance',
            });
        } catch (e) {
            console.warn('High-performance WebGL context creation failed, trying fallback...', e);
            try {
                return new THREE.WebGLRenderer({
                    antialias: false,
                    powerPreference: 'default',
                    failIfMajorPerformanceCaveat: false,
                });
            } catch (e2) {
                console.warn('Standard fallback failed, trying minimal...', e2);
                try {
                    // Maximum minimal: no options at all
                    return new THREE.WebGLRenderer();
                } catch (e3) {
                    console.error('Critical: WebGL context creation failed completely.', e3);
                    if (onFatalError) onFatalError();
                    throw new Error('WebGL not supported');
                }
            }
        }
    }

    /**
     * Konfiguriert eine bestehende Szene/Kamera/Renderer (OrbitControls, Lichter, Boden,
     * Resize-Listener) und gibt die erzeugten Referenzen (Lichter, Boden) zurueck.
     */
    public static setup(
        scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer,
        controls: OrbitControls,
        options: SceneSetupOptions
    ): SceneSetupResult {
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio); // Fix for High-DPI screens
        renderer.autoClear = false; // Wichtig fuer Mehr-Viewport-Rendering
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);

        scene.background = new THREE.Color();
        camera.position.set(10, 10, 10);

        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2 - 0.05; // Kamera nicht unter Grund
        controls.minDistance = 2;
        controls.maxDistance = 500;

        // OrbitControls-Events fuer Performance-Optimierung (Raycasting waehrend Bewegung deaktivieren)
        if (options.onCameraMoveStart) {
            controls.addEventListener('start', options.onCameraMoveStart);
        }
        if (options.onCameraMoveEnd) {
            controls.addEventListener('end', options.onCameraMoveEnd);
        }

        const ambientLight = new THREE.AmbientLight(0x404040, options.ambientLightIntensity);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, options.directionalLightIntensity);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        scene.add(directionalLight);

        const ground = SceneFactory.createGround(scene);

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        return { ambientLight, directionalLight, ground };
    }

    /** Erzeugt den schattierten Boden samt Grid und fuegt ihn der Szene hinzu. */
    public static createGround(scene: THREE.Scene): THREE.Mesh {
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.8,
            depthWrite: false, // Z-Fighting und Sortierprobleme vermeiden
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -5;
        ground.receiveShadow = true;
        scene.add(ground);

        const gridHelper = new THREE.GridHelper(1000, 200, 0x444444, 0x222222);
        gridHelper.position.y = -4.9;

        // Grid-Material kann einzeln oder als Array vorliegen
        const materials = Array.isArray(gridHelper.material)
            ? gridHelper.material
            : [gridHelper.material];

        materials.forEach((mat) => {
            if (mat instanceof THREE.Material) {
                mat.transparent = true;
                mat.opacity = 0.3;
                mat.depthWrite = false; // Z-Fighting und Blickwinkel-Flackern vermeiden
            }
        });

        scene.add(gridHelper);
        return ground;
    }
}
