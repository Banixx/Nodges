// NodgesArcee - Erweiterte 3D-System-Visualisierungs-Engine
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { StateManager } from './core/StateManager';
import { NodeManager } from './core/NodeManager';
import { EdgeObjectsManager } from './core/EdgeObjectsManager';
import { LayoutManager } from './core/LayoutManager';
import { VisualMappingEngine } from './core/VisualMappingEngine';
import { GraphData, EntityData, RelationshipData, NodeObject } from './types';
import './styles/main.css';
import pkg from '../package.json';

declare global {
    interface Window {
        app: App;
    }
}

export class App {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    public controls: OrbitControls;

    public stateManager: StateManager;
    public nodeManager: NodeManager;
    public edgeObjectsManager: EdgeObjectsManager;
    public layoutManager: LayoutManager;
    public visualMappingEngine: VisualMappingEngine;

    private ambientLight!: THREE.AmbientLight;
    private directionalLight!: THREE.DirectionalLight;
    private ground: THREE.Mesh | null = null;

    private _isInitialized: boolean = false;

    constructor() {
        console.log('Initializing NodgesArcee');

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        // Robust WebGL Renderer Initialization
        try {
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                powerPreference: "high-performance"
            });
        } catch (e) {
            console.warn('High-performance WebGL context creation failed, trying fallback...', e);
            try {
                this.renderer = new THREE.WebGLRenderer({
                    antialias: false,
                    powerPreference: "default",
                    failIfMajorPerformanceCaveat: false
                });
            } catch (e2) {
                console.warn('Standard fallback failed, trying minimal...', e2);
                try {
                    // Maximum minimal: no options at all
                    this.renderer = new THREE.WebGLRenderer();
                } catch (e3) {
                    console.error('Critical: WebGL context creation failed completely.', e3);
                    this.showWebGLError();
                    // Create a dummy renderer to prevent immediate crashes in other components before we stop
                    this.renderer = { domElement: document.createElement('canvas'), setSize: () => { }, render: () => { }, shadowMap: {} } as any;
                    throw new Error('WebGL not supported');
                }
            }
        }

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.stateManager = new StateManager();
        this.visualMappingEngine = new VisualMappingEngine();
        this.nodeManager = new NodeManager(this.scene, this.visualMappingEngine, this.stateManager);
        this.edgeObjectsManager = new EdgeObjectsManager(this.scene, this.visualMappingEngine, this.stateManager);
        this.layoutManager = new LayoutManager();

        this.init();
    }

    async init() {
        try {
            await this.initThreeJS();
            await this.loadDefaultData();
            this._isInitialized = true;
            console.log('NodgesArcee initialized');
            this.animate();
        } catch (error) {
            console.error('NodgesArcee konnte nicht vollstaendig initialisiert werden.', error);
        }
    }

    async initThreeJS() {
        this.scene.background = new THREE.Color();
        this.camera.position.set(10, 10, 10);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 500;

        this.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(10, 10, 5);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.left = -50;
        this.directionalLight.shadow.camera.right = 50;
        this.directionalLight.shadow.camera.top = 50;
        this.directionalLight.shadow.camera.bottom = -50;
        this.scene.add(this.directionalLight);

        this.createGround();

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        });

        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -5;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        const gridHelper = new THREE.GridHelper(1000, 200, 0x444444, 0x222222);
        gridHelper.position.y = -4.9;

        const materials = Array.isArray(gridHelper.material)
            ? gridHelper.material
            : [gridHelper.material];

        materials.forEach(mat => {
            if (mat instanceof THREE.Material) {
                mat.transparent = true;
                mat.opacity = 0.3;
                mat.depthWrite = false;
            }
        });

        this.scene.add(gridHelper);
    }

    async loadDefaultData() {
        console.log('Loading default data...');
        await this.loadData('data/small.json');
    }

    async loadData(url: string) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const rawData = await response.json();
            console.log(`[TRACE] Loaded Raw Data from ${url}`);

            const graphData = {
                system: 'Simple Graph',
                data: {
                    entities: rawData.nodes || [],
                    relationships: rawData.edges || []
                }
            };

            await this.loadGraphData(graphData, url.split('/').pop());
        } catch (e) {
            console.error(`Datei '${url}' konnte nicht geladen werden.`, e);
            this.showError('Daten konnten nicht geladen werden. Bitte laden Sie ein anderes Modell.');
        }
    }

    async loadGraphData(graphData: GraphData, sourceName: string = 'Imported Data') {
        try {
            console.log(`[App] Loading GraphData from ${sourceName}...`);
            this.clearScene();

            this.stateManager.setGraphData(graphData.data.entities, graphData.data.relationships);

            console.log(`[App] Creating nodes... (${graphData.data.entities.length})`);
            await this.createNodes();

            console.log(`[App] Creating edges... (${graphData.data.relationships.length})`);
            await this.createEdges();

            // Only apply layout if entities don't have positions
            const hasPositions = graphData.data.entities.every(e =>
                e.position && e.position.x !== undefined && e.position.y !== undefined && e.position.z !== undefined
            );

            if (!hasPositions) {
                await this.layoutManager.applyLayout('force-directed', graphData.data.entities, graphData.data.relationships);
                this.updateNodePositions();
            }

            this.fitCameraToScene();

        } catch (error) {
            console.error(`Graphdaten von '${sourceName}' konnten nicht geladen werden.`, error);
        }
    }

    clearScene() {
        this.nodeManager.clear();
        this.edgeObjectsManager.dispose();
    }

    async createNodes() {
        this.nodeManager.updateNodes(this.stateManager.getEntities());
    }

    async createEdges() {
        console.log(`Creating ${this.stateManager.getRelationships().length} edges...`);
        this.edgeObjectsManager.updateEdges(this.stateManager.getRelationships(), this.stateManager.getEntities());
    }

    updateNodePositions() {
        this.nodeManager.updateNodePositions(this.stateManager.getEntities());
        this.edgeObjectsManager.updateEdgePositions(this.stateManager.getEntities());
    }

    fitCameraToScene() {
        const entities = this.stateManager.getEntities();
        if (entities.length === 0) return;

        const bounds = {
            x: { min: Infinity, max: -Infinity },
            y: { min: Infinity, max: -Infinity },
            z: { min: Infinity, max: -Infinity }
        };

        entities.forEach(entity => {
            const x = entity.position?.x || 0;
            const y = entity.position?.y || 0;
            const z = entity.position?.z || 0;
            bounds.x.min = Math.min(bounds.x.min, x);
            bounds.x.max = Math.max(bounds.x.max, x);
            bounds.y.min = Math.min(bounds.y.min, y);
            bounds.y.max = Math.max(bounds.y.max, y);
            bounds.z.min = Math.min(bounds.z.min, z);
            bounds.z.max = Math.max(bounds.z.max, z);
        });

        const center = new THREE.Vector3(
            (bounds.x.min + bounds.x.max) / 2,
            (bounds.y.min + bounds.y.max) / 2,
            (bounds.z.min + bounds.z.max) / 2
        );

        const maxDimension = Math.max(
            bounds.x.max - bounds.x.min,
            bounds.y.max - bounds.y.min,
            bounds.z.max - bounds.z.min
        );

        const fov = this.camera.fov * (Math.PI / 180);
        const distance = Math.max(5, Math.abs(maxDimension / Math.sin(fov / 2)));

        const cameraPos = new THREE.Vector3(
            center.x + distance,
            center.y + distance,
            center.z + distance
        );
        this.camera.position.copy(cameraPos);

        this.camera.lookAt(center);
        this.controls.target.copy(center);
        this.controls.update();
    }

    animate() {
        if (!this._isInitialized) return;

        requestAnimationFrame(this.animate.bind(this));

        this.controls.update();

        this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        this.renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
        this.renderer.setScissorTest(false);
        this.renderer.clear();

        this.renderer.render(this.scene, this.camera);
    }

    private displayVersion() {
        const versionSpan = document.getElementById('fileVersion');
        const sidebarVersion = document.getElementById('sidebarVersion');
        if (pkg.version) {
            if (versionSpan) versionSpan.textContent = pkg.version;
            if (sidebarVersion) sidebarVersion.textContent = 'v' + pkg.version;
        }
    }

    private showError(message: string) {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'absolute';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        errorDiv.style.color = '#ff4444';
        errorDiv.style.padding = '20px';
        errorDiv.style.border = '2px solid #ff4444';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.zIndex = '9999';
        errorDiv.style.textAlign = 'center';
        errorDiv.innerHTML = `
            <h2>Fehler</h2>
            <p>${message}</p>
            <p>Bitte laden Sie ein anderes Modell oder aktualisieren Sie die Seite.</p>
        `;
        document.body.appendChild(errorDiv);
        console.error('Fehler beim Laden der Daten:', message);
    }

    private showWebGLError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'absolute';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        errorDiv.style.color = '#ff4444';
        errorDiv.style.padding = '20px';
        errorDiv.style.border = '2px solid #ff4444';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.zIndex = '9999';
        errorDiv.style.textAlign = 'center';
        errorDiv.innerHTML = `
            <h2>WebGL Fehler</h2>
            <p>3D-Grafik-Kontext konnte nicht initialisiert werden.</p>
            <p>Bitte überprüfen Sie Ihre Browsereinstellungen oder Hardware-Beschleunigung.</p>
            <p style="font-size: small; color: #aaa; margin-top: 10px">Wenn Sie in einer VM/Container laufen, stellen Sie sicher, dass 3D-Beschleunigung aktiviert ist.</p>
        `;
        document.body.appendChild(errorDiv);
        console.error('WebGL Fatal Error Displayed');
    }
}

// Initialize App
let currentAppInstance: App | null = null;

try {
    currentAppInstance = new App();
    window.app = currentAppInstance;
} catch (e) {
    console.error('Failed to initialize App:', e);
}

// Vanilla Vite HMR Support
if (import.meta.hot) {
    import.meta.hot.accept(() => {
        // Destroy old instance to clean up listeners and DOM
        if (currentAppInstance) {
            console.log('[HMR] Destroying old Nodges instance...');
            currentAppInstance.destroy();
        }

        // Let Vite do a full soft-reload of the module graph
        import.meta.hot!.invalidate();
    });
}