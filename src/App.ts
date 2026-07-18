// App.ts - Build: 1.0.0.0
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MapManager } from './core/MapManager';
import { StateManager } from './core/StateManager';
import { NodeManager } from './core/NodeManager';
import { CentralEventManager } from './core/CentralEventManager';
import { InteractionManager } from './core/InteractionManager';
import { LayoutManager } from './core/LayoutManager';
import { UIManager } from './core/UIManager';
import { MinimapUI } from './ui/MinimapUI';
import { SuggestionUI } from './ui/SuggestionUI';
import { SelectionManager } from './utils/SelectionManager';
import { RaycastManager } from './utils/RaycastManager';
import { NetworkAnalyzer } from './utils/NetworkAnalyzer';
import { PathFinder } from './utils/PathFinder';
import { PerformanceOptimizer } from './utils/PerformanceOptimizer';
import { PerformanceMonitor } from './core/PerformanceMonitor';
import { TrailManager } from './core/TrailManager';
import { FileHandler } from './utils/FileHandler';
import { ImportManager } from './utils/ImportManager';
import { ExportManager } from './utils/ExportManager';
import { EdgeLabelManager } from './utils/EdgeLabelManager';
import { NodeLabelManager } from './utils/NodeLabelManager';
import { NeighborhoodHighlighter } from './utils/NeighborhoodHighlighter';
import { KeyboardShortcuts } from './utils/KeyboardShortcuts';
import { BatchOperations } from './utils/BatchOperations';
import { NodeGroupManager } from './utils/NodeGroupManager';

import { HighlightManager } from './effects/HighlightManager';
import { GlowEffect } from './effects/GlowEffect';
import { EdgeObjectsManager } from './core/EdgeObjectsManager';
import { CameraManager } from './core/CameraManager';
import { DataParser } from './core/DataParser';
import { VisualMappingEngine } from './core/VisualMappingEngine';
import { IStateManager, IEventManager } from './core/interfaces';
import { GraphData, EntityData, RelationshipData, VisualMappings, DataModel } from './types';
import { VisualOptimizer } from './utils/VisualOptimizer';
import { notify } from './core/NotificationService';
import { LLMService } from './utils/LLMService';

import { ServiceContainer } from './core/di/ServiceContainer';
import { errorHandler } from './core/ErrorHandler';
import './styles/main.css';
import pkg from '../package.json'; // Direct import dependent on resolveJsonModule

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

    private container: ServiceContainer;

    public stateManager: IStateManager;
    public centralEventManager!: IEventManager;
    public interactionManager!: InteractionManager;
    public layoutManager!: LayoutManager;
    public uiManager!: UIManager;
    public selectionManager!: SelectionManager;
    public raycastManager!: RaycastManager;
    public networkAnalyzer!: NetworkAnalyzer;
    public pathFinder!: PathFinder;
    public performanceOptimizer!: PerformanceOptimizer;
    public performanceMonitor!: PerformanceMonitor;
    public fileHandler!: FileHandler;
    public importManager!: ImportManager;
    public exportManager!: ExportManager;
    public edgeLabelManager!: EdgeLabelManager;
    public nodeLabelManager!: NodeLabelManager;
    public neighborhoodHighlighter!: NeighborhoodHighlighter;
    public keyboardShortcuts!: KeyboardShortcuts;
    public batchOperations!: BatchOperations;
    public nodeGroupManager!: NodeGroupManager;

    public highlightManager!: HighlightManager;
    public glowEffect!: GlowEffect;
    public nodeManager: NodeManager;
    public edgeObjectsManager: EdgeObjectsManager;
    public cameraManager!: CameraManager;
    public trailManager!: TrailManager;
    public minimapUI!: MinimapUI;
    public suggestionUI!: SuggestionUI;
    public minimapCamera!: THREE.OrthographicCamera;
    private minimapZoom: number = 100;
    private minimapCenter: THREE.Vector2 = new THREE.Vector2(0, 0);
    private cameraMarker!: THREE.Group;

    private ambientLight!: THREE.AmbientLight;
    private directionalLight!: THREE.DirectionalLight;

    public currentGraphData: GraphData | null = null;
    public visualMappingEngine: VisualMappingEngine;
    private loadedSchemas = new Map<string, { dataModel?: DataModel, visualMappings?: VisualMappings }>();
    public originalVisualMappings: VisualMappings | null = null;

    public currentEntities: EntityData[] = [];
    public currentRelationships: RelationshipData[] = [];
    public hasExplicitPositions: boolean = false;

    private _isInitialized: boolean = false;
    private frameCounter: number = 0;
    private lastFpsTime: number = 0;
    private fpsFrameCount: number = 0;
    private lastRenderTime: number = 0;
    private lastRebuildTimestamp: number = 0;

    public get isInitialized(): boolean {
        return this._isInitialized;
    }
    private ground: THREE.Mesh | null = null;
    private mapManager: MapManager | null = null;

    constructor() {
        console.log('Initializing Nodges');

        this.container = ServiceContainer.getInstance();

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

        this.displayVersion();

        // Register Core Services
        this.initCoreServices();

        // Register Core 3D Objects
        this.container.register('Scene', this.scene);
        this.container.register('Camera', this.camera);
        this.container.register('Renderer', this.renderer);
        this.container.register('Controls', this.controls);

        // Retrieve instances for local usage (backward compatibility)
        this.stateManager = this.container.get<IStateManager>('IStateManager');
        this.visualMappingEngine = this.container.get<VisualMappingEngine>('VisualMappingEngine');

        // These still need manual instantiation until fully refactored, but using injected dependencies
        this.nodeManager = new NodeManager(this.container);
        this.container.register('NodeManager', this.nodeManager);
        
        this.edgeObjectsManager = new EdgeObjectsManager(this.container);
        this.container.register('EdgeObjectsManager', this.edgeObjectsManager);

        this.cameraManager = new CameraManager(this.container);
        this.container.register('CameraManager', this.cameraManager);

        this.trailManager = new TrailManager(this.container);
        this.container.register('TrailManager', this.trailManager);

        this.init();
    }

    private initCoreServices() {
        // Core State
        const stateManager = new StateManager();
        this.container.register('IStateManager', stateManager);

        const performanceMonitor = new PerformanceMonitor(stateManager);
        this.container.register('PerformanceMonitor', performanceMonitor);
        this.performanceMonitor = performanceMonitor;

        // Engines
        const visualMappingEngine = new VisualMappingEngine();
        this.container.register('VisualMappingEngine', visualMappingEngine);
    }

    async init() {
        try {
            await this.initThreeJS();
            await this.initManagers();
            await this.initGUI();
            await this.loadDefaultData();
            this.setupEnvironmentSubscriptions();

            this._isInitialized = true;
            console.log('Nodges initialized');
            this.animate();
        } catch (error) {
            errorHandler.handle(error, {
                category: 'initialization',
                severity: 'fatal',
                userMessage: 'Nodges konnte nicht vollstaendig initialisiert werden.'
            });
        }
    }

    async initThreeJS() {
        this.scene.background = new THREE.Color();
        this.camera.position.set(10, 10, 10);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio); // Fix for High-DPI screens
        this.renderer.autoClear = false; // Important for multi-viewport rendering
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera from going below ground
        this.controls.minDistance = 2; // Prevent getting too close
        this.controls.maxDistance = 500; // Limit far zoom

        // OrbitControls Event-Listener für Performance-Optimierung
        // Deaktiviert Raycasting während Kamerabewegung
        this.controls.addEventListener('start', () => {
            if (this.centralEventManager) {
                this.centralEventManager.setCameraMoving(true);
            }
        });

        this.controls.addEventListener('end', () => {
            if (this.centralEventManager) {
                this.centralEventManager.setCameraMoving(false);
            }
        });

        this.ambientLight = new THREE.AmbientLight(0x404040, this.stateManager.state.ambientLightIntensity);
        this.scene.add(this.ambientLight);

        // Add a secondary ambient light that specifically targets layer 1 (minimap camera etc)
        // or just ensure the main ambient light covers all layers if we want it global.
        // Actually, THREE.Light affects all layers unless specified otherwise, but OrthographicCamera 
        // with layers needs the light to be visible to it.
        // Core Minimap Lighting (Layer 1)
        // These are visible only during the minimap render pass
        const minimapAmbient = new THREE.AmbientLight(0x2fffff, 0.01); // Extreme brightness for contrast
        minimapAmbient.layers.set(1);
        minimapAmbient.name = "minimap_ambient";
        minimapAmbient.visible = false; // Off by default
        //this.scene.add(minimapAmbient);

        const minimapDirLight = new THREE.DirectionalLight(0xffffff, 0.01);
        minimapDirLight.position.set(0, 100, 0);
        minimapDirLight.layers.set(1);
        minimapDirLight.name = "minimap_directional";
        minimapDirLight.visible = false; // Off by default
        //this.scene.add(minimapDirLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, this.stateManager.state.directionalLightIntensity);
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

    public recreateRenderer() {
        const state = this.stateManager.state;
        const powerPref = state.devPowerPreference as any;

        console.log(`[DevPanel] Recreating WebGLRenderer with powerPreference: ${powerPref}`);

        const oldCanvas = this.renderer.domElement;

        try {
            const newRenderer = new THREE.WebGLRenderer({
                antialias: powerPref !== 'low-power', // Disable AA on low power for better simulation of poor devices
                powerPreference: powerPref
            });

            newRenderer.setSize(window.innerWidth, window.innerHeight);
            newRenderer.setPixelRatio(window.devicePixelRatio * state.devPixelRatio);
            newRenderer.shadowMap.enabled = true;
            newRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Replace DOM element
            if (oldCanvas && oldCanvas.parentNode) {
                oldCanvas.parentNode.replaceChild(newRenderer.domElement, oldCanvas);
            } else {
                document.body.appendChild(newRenderer.domElement);
            }

            // Dispose old renderer to free GPU context
            this.renderer.dispose();

            // Update references
            this.renderer = newRenderer;

            if (this.controls) {
                this.controls.dispose();
                this.controls = new OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
                this.controls.minDistance = 2;
                this.controls.maxDistance = 500;
            }
        } catch (e) {
            console.error('[DevPanel] Failed to recreate WebGLRenderer', e);
            alert('Failed to recreate WebGL renderer with selected settings. See console.');
        }
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.8,
            depthWrite: false // Prevent z-fighting and sort issues with transparent objects
        });

        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -5;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        const gridHelper = new THREE.GridHelper(1000, 200, 0x444444, 0x222222);
        gridHelper.position.y = -4.9;

        // Handle grid material (can be single or array of materials)
        const materials = Array.isArray(gridHelper.material)
            ? gridHelper.material
            : [gridHelper.material];

        materials.forEach(mat => {
            if (mat instanceof THREE.Material) {
                mat.transparent = true;
                mat.opacity = 0.3;
                mat.depthWrite = false; // Prevents z-fighting and view angle flicker
            }
        });

        this.scene.add(gridHelper);
    }

    async initManagers() {
        // Init & Register LayoutManager
        const layoutManager = new LayoutManager();
        this.container.register('LayoutManager', layoutManager);
        this.layoutManager = this.container.get<LayoutManager>('LayoutManager');
        this.layoutManager.setVisualMappingEngine(this.container.get<VisualMappingEngine>('VisualMappingEngine'));

        // Init & Register GlowEffect
        const glowEffect = new GlowEffect();
        this.container.register('GlowEffect', glowEffect);
        this.glowEffect = this.container.get<GlowEffect>('GlowEffect');

        // Init & Register HighlightManager
        const highlightManager = new HighlightManager(this.container);
        this.container.register('HighlightManager', highlightManager);
        this.highlightManager = this.container.get<HighlightManager>('HighlightManager');

        this.uiManager = new UIManager(this);

        // Init & Register CentralEventManager
        const centralEventManager = new CentralEventManager(this.container);
        this.container.register('IEventManager', centralEventManager);
        this.centralEventManager = this.container.get<IEventManager>('IEventManager');

        // Init & Register InteractionManager
        const interactionManager = new InteractionManager(this.container);
        this.container.register('InteractionManager', interactionManager);
        this.interactionManager = this.container.get<InteractionManager>('InteractionManager');

        // Init & Register SelectionManager
        const selectionManager = new SelectionManager(this.container);
        this.container.register('SelectionManager', selectionManager);
        this.selectionManager = this.container.get<SelectionManager>('SelectionManager');

        // Init & Register RaycastManager
        const raycastManager = new RaycastManager(this.container);
        this.container.register('RaycastManager', raycastManager);
        this.raycastManager = this.container.get<RaycastManager>('RaycastManager');
        // Init & Register NetworkAnalyzer
        const networkAnalyzer = new NetworkAnalyzer();
        this.container.register('NetworkAnalyzer', networkAnalyzer);
        this.networkAnalyzer = this.container.get<NetworkAnalyzer>('NetworkAnalyzer');

        // Init & Register PathFinder
        const pathFinder = new PathFinder(this.container);
        this.container.register('PathFinder', pathFinder);
        this.pathFinder = this.container.get<PathFinder>('PathFinder');

        // Init & Register PerformanceOptimizer
        const performanceOptimizer = new PerformanceOptimizer(this.container);
        this.container.register('PerformanceOptimizer', performanceOptimizer);
        this.performanceOptimizer = this.container.get<PerformanceOptimizer>('PerformanceOptimizer');

        // Init & Register Import/Export Managers
        this.importManager = new ImportManager();
        this.container.register('ImportManager', this.importManager);

        this.exportManager = new ExportManager();
        this.container.register('ExportManager', this.exportManager);

        // Init MapManager (Build 4)
        this.mapManager = new MapManager(this.scene, this.stateManager);
        this.container.register('MapManager', this.mapManager);

        // Init & Register FileHandler
        const fileHandler = new FileHandler(this.container, this.loadGraphData.bind(this));
        this.container.register('FileHandler', fileHandler);
        this.fileHandler = this.container.get<FileHandler>('FileHandler');

        // Init & Register EdgeLabelManager
        const edgeLabelManager = new EdgeLabelManager(this.container);
        this.container.register('EdgeLabelManager', edgeLabelManager);
        this.edgeLabelManager = this.container.get<EdgeLabelManager>('EdgeLabelManager');

        // Init & Register NodeLabelManager
        const nodeLabelManager = new NodeLabelManager(this.container);
        this.container.register('NodeLabelManager', nodeLabelManager);
        this.nodeLabelManager = this.container.get<NodeLabelManager>('NodeLabelManager');
        // Init & Register NeighborhoodHighlighter
        const neighborhoodHighlighter = new NeighborhoodHighlighter(this.container);
        this.container.register('NeighborhoodHighlighter', neighborhoodHighlighter);
        this.neighborhoodHighlighter = this.container.get<NeighborhoodHighlighter>('NeighborhoodHighlighter');

        // Init & Register NodeGroupManager
        const nodeGroupManager = new NodeGroupManager(this.container);
        this.container.register('NodeGroupManager', nodeGroupManager);
        this.nodeGroupManager = this.container.get<NodeGroupManager>('NodeGroupManager');

        // Init & Register BatchOperations
        const batchOperations = new BatchOperations(this.container);
        this.container.register('BatchOperations', batchOperations);
        this.batchOperations = this.container.get<BatchOperations>('BatchOperations');

        // Init & Register KeyboardShortcuts
        const keyboardShortcuts = new KeyboardShortcuts();
        this.container.register('KeyboardShortcuts', keyboardShortcuts);
        this.keyboardShortcuts = this.container.get<KeyboardShortcuts>('KeyboardShortcuts');

        // Global Undo/Redo Shortcuts
        window.addEventListener('keydown', (e) => {
            // Undo: Ctrl+Z
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                console.log('[App] Triggering Undo');
                this.stateManager.undo();
            }
            // Redo: Ctrl+Y or Ctrl+Shift+Z
            if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
                e.preventDefault();
                console.log('[App] Triggering Redo');
                this.stateManager.redo();
            }
        });
    }

    async initGUI() {
        this.uiManager.init();

        // Layout-Callback fuer MappingUI bereitstellen
        if (this.uiManager.mappingUI) {
            this.uiManager.mappingUI.setLayoutCallback(
                async (algorithm: string, params: Record<string, number>) => {
                    if (this.layoutManager && this.currentEntities && this.currentRelationships) {
                        const success = await this.layoutManager.applyLayout(
                            algorithm,
                            this.currentEntities,
                            this.currentRelationships,
                            this.currentGraphData?.fields || [],
                            params
                        );
                        if (success) {
                            if (this.stateManager) {
                                this.stateManager.setGraphData(this.currentEntities, this.currentRelationships);
                            }
                            if (this.updateNodePositions) {
                                this.updateNodePositions();
                            }
                        }
                    }
                },
                () => {
                    if (this.layoutManager) {
                        this.layoutManager.stopAnimation();
                    }
                }
            );
        }

        try {
            this.minimapUI = new MinimapUI('minimapContainer');
            this.suggestionUI = new SuggestionUI('suggestionContainer');

            // Interaction Callbacks
            this.minimapUI.onZoom = (delta: number) => {
                this.minimapZoom = Math.max(10, Math.min(500, this.minimapZoom + delta * 0.1));
                this.updateMinimapCamera();
            };

            this.minimapUI.onPan = (dx: number, dy: number) => {
                const canvas = this.minimapUI.getCanvas();
                const aspect = canvas.width / canvas.height;
                const worldWidth = this.minimapZoom * aspect * 2;
                const worldHeight = this.minimapZoom * 2;

                this.minimapCenter.x -= (dx / canvas.width) * worldWidth;
                this.minimapCenter.y -= (dy / canvas.height) * worldHeight;
                this.updateMinimapCamera();
            };

            // Minimap Camera Setup
            this.minimapCamera = new THREE.OrthographicCamera(-100, 100, 100, -100, 0.1, 2000);
            this.minimapCamera.position.set(0, 500, 0);
            this.minimapCamera.up.set(0, 0, -1);
            this.minimapCamera.lookAt(0, 0, 0);
            this.minimapCamera.layers.disableAll();
            this.minimapCamera.layers.enable(0); // View Ground on Layer 0
            this.minimapCamera.layers.enable(1); // View Graph on Layer 1
            this.minimapCamera.layers.enable(2); // View Marker on Layer 2

            // Create Camera Marker for Minimap
            this.createCameraMarker();

            window.addEventListener('resize', this.updateMinimapCamera.bind(this));
            this.minimapUI.updateSize();
            this.updateMinimapCamera();
        } catch (e) {
            console.warn("Failed to initialize minimap:", e);
        }
    }

    private createCameraMarker() {
        this.cameraMarker = new THREE.Group();

        // A classic camera icon with lines (black)
        const points = [];
        // Quadrat (body)
        points.push(new THREE.Vector3(-1.5, 0, -3));
        points.push(new THREE.Vector3(-1.5, 0, 0));
        points.push(new THREE.Vector3(0, 0, 0)); // Base of triangle
        
        // Dreieck (lens)
        points.push(new THREE.Vector3(-2, 0, 3));
        points.push(new THREE.Vector3(2, 0, 3));
        points.push(new THREE.Vector3(0, 0, 0));
        
        // Rest of Quadrat
        points.push(new THREE.Vector3(1.5, 0, 0));
        points.push(new THREE.Vector3(1.5, 0, -3));
        points.push(new THREE.Vector3(-1.5, 0, -3));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x000000 });
        const mesh = new THREE.Line(geometry, material);

        this.cameraMarker.add(mesh);
        this.cameraMarker.layers.set(2); // Visible on layer 2
        mesh.layers.set(2);

        this.scene.add(this.cameraMarker);
    }

    private updateMinimapCamera() {
        if (!this.minimapUI || !this.minimapCamera) return;
        this.minimapUI.updateSize();
        const canvas = this.minimapUI.getCanvas();
        const aspect = canvas.width / canvas.height;

        const d = this.minimapZoom;

        this.minimapCamera.left = -d * aspect;
        this.minimapCamera.right = d * aspect;
        this.minimapCamera.top = d;
        this.minimapCamera.bottom = -d;

        this.minimapCamera.position.set(this.minimapCenter.x, 500, this.minimapCenter.y);
        this.minimapCamera.up.set(0, 0, -1);
        this.minimapCamera.lookAt(this.minimapCenter.x, 0, this.minimapCenter.y);

        this.minimapCamera.updateProjectionMatrix();
    }

    async loadDefaultData() {
        // Temporary: just log, we need to implement data loading properly
        console.log('No default data loaded.');
        // await this.loadData('data/small.json');
    }

    public newGraph() {
        console.log('[App] Starting new graph...');
        this.clearScene();
        
        // Reset StateManager graph data & loaded files
        this.stateManager.setLoadedFiles([]);
        this.stateManager.setGraphData([], []);
        this.loadedSchemas.clear();
        this.currentGraphData = null;
        this.hasExplicitPositions = false;

        this.originalVisualMappings = null;
        if (this.visualMappingEngine) {
            this.visualMappingEngine.setOriginalVisualMappings(undefined);
            this.visualMappingEngine.setVisualMappings({ defaultPresets: {} });
        }
        if (this.stateManager) {
            this.stateManager.update({ visualMappings: { defaultPresets: {} } });
        }
        if (this.uiManager && this.uiManager.mappingUI) {
            this.uiManager.mappingUI.bind(
                { defaultPresets: {} },
                {},
                null,
                [],
                [],
                null,
                (newMappings) => {
                    if (typeof (this as any).updateVisualMappings === 'function') {
                        (this as any).updateVisualMappings(newMappings);
                    }
                }
            );
        }

        // Clear raycast cache
        if (this.raycastManager && this.raycastManager.clearCache) {
            this.raycastManager.clearCache();
        }

        // Reset UI file info
        if (this.uiManager) {
            this.uiManager.updateFileInfo(
                '-',
                0,
                0,
                {
                    x: { min: 0, max: 0 },
                    y: { min: 0, max: 0 },
                    z: { min: 0, max: 0 }
                }
            );
        }

        // Reset minimap center & zoom
        if (this.minimapCenter) {
            this.minimapCenter.set(0, 0);
            this.minimapZoom = 100;
            this.updateMinimapCamera();
        }

        // Reset camera and controls
        this.fitCameraToScene();

        // Notify user via NotificationService
        notify.info('Neues Projekt', 'Ein leeres Projekt wurde erstellt.');
    }

    async loadGraphData(graphData: GraphData, sourceName: string = 'Imported Data', append: boolean = false) {
        try {
            console.log(`[App] ${append ? 'Appending' : 'Loading'} GraphData from ${sourceName}...`);
            
            // Assign random positions around (0,0,3) for nodes that lack position data.
            // This maintains data neutrality without forcing a specific physics layout, 
            // and prevents camera bugs where zoom distances evaluate to 0.
            if (graphData.data && Array.isArray(graphData.data.entities)) {
                graphData.data.entities.forEach((e: any) => {
                    if (e.position === undefined) {
                        e.position = {
                            x: (Math.random() - 0.5) * 4,
                            y: (Math.random() - 0.5) * 4,
                            z: 3 + (Math.random() - 0.5) * 4,
                            isRandomFallback: true
                        };
                    }
                });
            }

            if (!append) {
                this.clearScene();
                this.stateManager.setLoadedFiles([{ id: sourceName, name: sourceName }]);
                this.loadedSchemas.clear();
            } else {
                // Prefix IDs for the new data to avoid collisions
                const prefix = sourceName.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, '_');
                DataParser.prefixIds(graphData, prefix);
                
                const currentFiles = this.stateManager.state.loadedFiles || [];
                if (!currentFiles.find((f: any) => f.id === sourceName)) {
                    this.stateManager.setLoadedFiles([...currentFiles, { id: sourceName, name: sourceName }]);
                }
            }

            // Save original mappings for suggestions/preview
            const originalMappings = graphData.visualMappings ? JSON.parse(JSON.stringify(graphData.visualMappings)) : { defaultPresets: {} };
            
            // Wenn echte Positionen existieren, füge ein Original-Mapping für position hinzu
            const hasRealPositions = graphData.data && graphData.data.entities && graphData.data.entities.some((e: any) => e.position && !e.position.isRandomFallback);
            if (hasRealPositions) {
                if (!originalMappings.defaultPresets) originalMappings.defaultPresets = {};
                if (!originalMappings.defaultPresets['global_node']) originalMappings.defaultPresets['global_node'] = {};
                if (!originalMappings.defaultPresets['global_node'].position) {
                    originalMappings.defaultPresets['global_node'].position = {
                        source: 'position',
                        function: 'linear'
                    };
                }
            }

            this.originalVisualMappings = originalMappings;

            // Save this file's schema
            this.loadedSchemas.set(sourceName, {
                dataModel: graphData.dataModel,
                visualMappings: originalMappings
            });
            
            // Do not automatically apply the file's mappings to the active graph state.
            // They will be available as suggestions.
            graphData.visualMappings = { defaultPresets: {} };

            this.stateManager.update({
                selectedObject: null,
                selectedObjects: new Set(),
                hoveredObject: null,
                highlightedObjects: new Set(),
                infoPanelVisible: false,
                infoPanelCollapsed: false,
            });

            if (this.raycastManager && this.raycastManager.clearCache) {
                this.raycastManager.clearCache();
            }

            if (this.stateManager.state.renderMode === 'auto') {
                this.stateManager.update({ activeRenderMode: 'mesh' });
            }

            // Set currentGraphData or merge data
            if (append && this.currentGraphData) {
                this.currentGraphData.data.entities = [
                    ...this.currentGraphData.data.entities,
                    ...graphData.data.entities
                ];
                this.currentGraphData.data.relationships = [
                    ...this.currentGraphData.data.relationships,
                    ...graphData.data.relationships
                ];
            } else {
                this.currentGraphData = graphData;
            }

            // Store data directly
            if (append) {
                this.currentEntities = [...this.currentEntities, ...graphData.data.entities];
                this.currentRelationships = [...this.currentRelationships, ...graphData.data.relationships];
            } else {
                this.currentEntities = graphData.data.entities;
                this.currentRelationships = graphData.data.relationships;
            }

            // Calculate Derived Data (Physics / Metrics)
            this.calculateDerivedData();

            // Rebuild and merge schemas from all loaded files (updates UI)
            this.rebuildMergedSchema();

            // Compute structural metrics
            this.computeGraphMetrics(this.currentEntities, this.currentRelationships);

            // Update StateManager (Source of Truth)
            this.stateManager.setGraphData(this.currentEntities, this.currentRelationships);

            console.log(`[App] Creating nodes... (${this.currentEntities.length})`);
            await this.createNodes();

            console.log(`[App] Creating edges... (${this.currentRelationships.length})`);
            await this.createEdges();

            // Build 4: Check for map and temporal data
            if (graphData.metadata?.version === 4 || graphData.metadata?.version === '4') {
                if (graphData.metadata?.map && this.mapManager) {
                    const map = graphData.metadata.map;
                    await this.mapManager.loadMap(map.image, map.referenceWidth, map.referenceHeight);
                } else if (this.mapManager) {
                    this.mapManager.removeMap();
                }

                // If mapX/mapY exist, set them as initial positions
                this.currentEntities.forEach(e => {
                    if (e.mapX !== undefined && e.mapY !== undefined) {
                        e.position = { x: e.mapX, y: 0, z: e.mapY };
                        // Note: Fixed state is handled in LayoutManager for the worker
                    }
                });
            } else if (this.mapManager) {
                this.mapManager.removeMap();
            }

            // Only apply layout if entities don't have valid positions
            // Wir prüfen ob wenigstens ein Knoten eine valide Position ungleich 0,0,0 hat,
            // um zu verhindern, dass mitgelieferte Positionen überschrieben werden.
            const hasPositions = this.currentEntities.some(e =>
                e.position && (Math.abs(e.position.x) > 0.001 || Math.abs(e.position.y) > 0.001 || Math.abs(e.position.z) > 0.001)
            );

            // Store flag to prevent overwriting these explicit positions later
            if (!append) {
                this.hasExplicitPositions = hasPositions;
            } else if (hasPositions) {
                // If appending and new data has positions, keep it true if it was already true? 
                // Let's just say if ANY load has explicit positions, we might want to respect them.
                this.hasExplicitPositions = this.hasExplicitPositions || hasPositions;
            }

            // Das automatische Eingreifen des LayoutManagers wurde entfernt.
            // Nodes bleiben nun strikt in ihrem Jitter-Fallback oder an ihren expliziten Positionen,
            // bis der Nutzer explizit ein Layout über das UI anfordert.
            if (this.layoutManager) {
                this.layoutManager.stopAnimation();
            }

            // Create labels for nodes
            if (this.nodeLabelManager) {
                this.nodeLabelManager.createLabelsForAllEntities(this.currentEntities);
            }

            // Update UI
            if (this.uiManager) {
                const bounds = this.calculateBounds(this.currentEntities);
                const schemaVersion = graphData.metadata?.schemaVersion || '3.0';
                this.uiManager.updateFileInfo(
                    graphData.system || sourceName,
                    this.currentEntities.length,
                    this.currentRelationships.length,
                    bounds,
                    schemaVersion
                );
            }

            // Bind SuggestionUI
            if (this.suggestionUI) {
                this.suggestionUI.bind(
                    graphData.dataModel || null,
                    originalMappings || null,
                    (mapping) => {
                        // Apply permanent mapping (Takeover)
                        this.updateVisualMappings(mapping);
                        if (this.uiManager && this.uiManager.mappingUI) {
                            // Update MappingUI to reflect the newly taken over mappings
                            this.uiManager.mappingUI.bind(
                                mapping,
                                this.uiManager.getAvailableAttributes(),
                                this.currentGraphData?.dataModel || null,
                                this.currentEntities,
                                this.currentRelationships,
                                originalMappings || null,
                                (newMappings) => {
                                    this.updateVisualMappings(newMappings);
                                }
                            );
                        }
                    },
                    (mapping) => {
                        // Preview temporary mapping
                        if (mapping) {
                            this.visualMappingEngine.setVisualMappings(mapping);
                        } else {
                            // Revert to active mappings from state
                            this.visualMappingEngine.setVisualMappings(this.stateManager.state.visualMappings || { defaultPresets: {} });
                        }
                        if (this.nodeManager) {
                            this.nodeManager.updateNodes(this.currentEntities);
                        }
                        if (this.edgeObjectsManager) {
                            this.edgeObjectsManager.updateEdges(this.currentRelationships, this.currentEntities);
                        }
                    }
                );
            }

            // Apply Automatic Visual Balance if enabled
            if (this.stateManager.state.autoBalanceEnabled) {
                this.applyVisualBalance();
            }

            this.fitCameraToScene();



            // Auto-center minimap on data load
            const bounds = this.calculateBounds(this.currentEntities);
            this.minimapCenter.set(
                (bounds.x.min + bounds.x.max) / 2,
                (bounds.z.min + bounds.z.max) / 2
            );
            const maxDim = Math.max(bounds.x.max - bounds.x.min, bounds.z.max - bounds.z.min);
            this.minimapZoom = (maxDim / 2) * 1.2; // 20% margin
            this.updateMinimapCamera();

        } catch (error) {
            errorHandler.handle(error, {
                category: 'import',
                severity: 'error',
                userMessage: `Graphdaten von '${sourceName}' konnten nicht geladen werden.`
            });
        }
    }

    async loadData(url: string, append: boolean = false) {
        try {
            const response = await fetch(url);
            const rawData = await response.json();
            const filename = url.split('/').pop() || 'Unknown';
            console.log(`[TRACE] ${append ? 'Adding' : 'Loading'} Raw Data from ${url}`);

            const graphData = DataParser.parse(rawData);
            await this.loadGraphData(graphData, filename, append);
        } catch (e) {
            errorHandler.handle(e, {
                category: 'import',
                severity: 'error',
                userMessage: `Datei '${url}' konnte nicht geladen werden.`
            });
        }
    }

    async addData(url: string) {
        await this.loadData(url, true);
    }

    private calculateDerivedData() {
        console.log('[App] Calculating derived data (degree, inbound, outbound)...');
        const nodeMap = new Map<string, EntityData>();
        
        this.currentEntities.forEach(node => {
            nodeMap.set(String(node.id), node);
            if (!node.stateVector) node.stateVector = {};
            // Initialize
            node.stateVector.degree = 0;
            node.stateVector.inbound = 0;
            node.stateVector.outbound = 0;
        });

        this.currentRelationships.forEach(edge => {
            const s = String(edge.source !== undefined ? edge.source : edge.start);
            const t = String(edge.target !== undefined ? edge.target : edge.end);

            const sourceNode = nodeMap.get(s);
            const targetNode = nodeMap.get(t);

            if (sourceNode) {
                if (!sourceNode.stateVector) sourceNode.stateVector = {};
                sourceNode.stateVector.outbound = (sourceNode.stateVector.outbound || 0) + 1;
                sourceNode.stateVector.degree = (sourceNode.stateVector.degree || 0) + 1;
            }
            if (targetNode) {
                if (!targetNode.stateVector) targetNode.stateVector = {};
                targetNode.stateVector.inbound = (targetNode.stateVector.inbound || 0) + 1;
                targetNode.stateVector.degree = (targetNode.stateVector.degree || 0) + 1;
            }
        });
    }

    public updateVisualMappings(mappings: VisualMappings) {
        console.log('[App] Updating visual mappings...');
        if (this.currentGraphData) {
            this.currentGraphData.visualMappings = mappings; // Persist in data
        }
        this.visualMappingEngine.setVisualMappings(mappings);
        this.stateManager.update({ visualMappings: mappings });
        
        // Update graphics
        this.updateNodePositions();
        if (this.edgeObjectsManager) {
            this.edgeObjectsManager.updateEdges(this.currentRelationships, this.currentEntities);
        }

        // Auto-Trigger Layout if physics are mapped or algorithm mapped to position
        let hasPhysicsMappings = false;
        let selectedAlgorithm: string | null = null;
        const presets = mappings.defaultPresets || {};
        
        Object.values(presets).forEach((preset: any) => {
            if (preset.attraction || preset.repulsion || preset.inertia) {
                hasPhysicsMappings = true;
            }
            if (preset.position) {
                const source = preset.position.source || preset.position.field;
                if (source && source.startsWith('algo:')) {
                    selectedAlgorithm = source.substring(5); // Extract algo name
                }
            }
        });

        if (this.layoutManager) {
            this.layoutManager.stopAnimation();
            
            if (selectedAlgorithm) {
                console.log(`[App] Algorithm mapping detected. Auto-triggering layout: ${selectedAlgorithm}`);
                this.layoutManager.applyLayout(selectedAlgorithm, this.currentEntities, this.currentRelationships, this.currentGraphData?.fields || [])
                    .then(() => {
                        this.fitCameraToScene();
                    });
            } else if (hasPhysicsMappings) {
                // Legacy support for pure physics mappings without explicit algo
                console.log('[App] Physics mappings detected. Auto-triggering layout...');
                this.layoutManager.applyLayout('force-directed', this.currentEntities, this.currentRelationships, this.currentGraphData?.fields || [])
                    .then(() => {
                        this.fitCameraToScene();
                    });
            } else {
                // Wenn keine Physik oder Algorithmus aktiv ist, wurden die Knoten evtl. direkt positioniert. Kamera anpassen!
                setTimeout(() => {
                    this.fitCameraToScene();
                }, 50);
            }
        }

        // Re-apply to nodes
        if (this.nodeManager) {
            this.nodeManager.updateNodes();
        }

        // Re-apply label positions (since positionX/Y/Z mapping could have moved them)
        if (this.nodeLabelManager) {
            this.currentEntities.forEach(entity => {
                const pos = new THREE.Vector3(
                    entity.position?.x || 0,
                    entity.position?.y || 0,
                    entity.position?.z || 0
                );
                this.nodeLabelManager!.updateLabelPosition(String(entity.id), pos);
            });
        }

        // Notify UI components of the update
        if (this.uiManager) {
            this.uiManager.updateVisualMappings(mappings);
        }
    }
    private rebuildMergedSchema() {
        if (!this.currentGraphData) return;

        // Initialize empty containers
        const mergedDataModel: DataModel = { properties: {} };
        const originalVisualMappings: VisualMappings = { defaultPresets: {} };

        // Merge all schemas
        this.loadedSchemas.forEach((schema) => {
            if (schema.dataModel) {
                if ('properties' in schema.dataModel && schema.dataModel.properties) {
                    Object.assign(mergedDataModel.properties, schema.dataModel.properties);
                }
            }
            if (schema.visualMappings && schema.visualMappings.defaultPresets) {
                Object.assign(originalVisualMappings.defaultPresets, schema.visualMappings.defaultPresets);
            }
        });

        // Set on currentGraphData
        if (this.currentGraphData) {
            this.currentGraphData.dataModel = mergedDataModel;
            // Auto-apply was disabled by user request. Mappings will stay as suggestions until accepted.
            this.currentGraphData.visualMappings = { defaultPresets: {} };
            
            // Store original mappings so UIManager can provide them to MappingUI
            this.originalVisualMappings = originalVisualMappings;

            // Propagate to engine
            this.visualMappingEngine.setDataModel(mergedDataModel);
            this.visualMappingEngine.setOriginalVisualMappings(this.originalVisualMappings || undefined);
            this.visualMappingEngine.setVisualMappings(this.currentGraphData.visualMappings!);

            // Propagate to UI
            if (this.uiManager) {
                this.uiManager.updateVisualMappings(this.currentGraphData.visualMappings!);
            }
        }
    }

    async removeData(sourceName: string) {
        try {
            console.log(`[App] Removing dataset: ${sourceName}`);
            
            // Filter out files from state
            const currentFiles = this.stateManager.state.loadedFiles || [];
            const updatedFiles = currentFiles.filter((f: any) => f.id !== sourceName);
            this.stateManager.setLoadedFiles(updatedFiles);

            // Remove schema from loaded schemas
            this.loadedSchemas.delete(sourceName);

            // If no files left, clear everything
            if (updatedFiles.length === 0) {
                this.clearScene();
                this.stateManager.setGraphData([], []);
                this.loadedSchemas.clear();
                this.currentGraphData = null;
                this.hasExplicitPositions = false;
                return;
            }

            // Identify entities to remove (those that have the prefix)
            const prefix = sourceName.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, '_');
            const prefixWithUnderscore = `${prefix}_`;

            this.currentEntities = this.currentEntities.filter(e => !e.id.startsWith(prefixWithUnderscore));
            this.currentRelationships = this.currentRelationships.filter(r => !r.id?.startsWith(prefixWithUnderscore));

            // Also clean up entities/relationships from currentGraphData.data
            if (this.currentGraphData && this.currentGraphData.data) {
                this.currentGraphData.data.entities = this.currentGraphData.data.entities.filter(
                    e => !e.id.startsWith(prefixWithUnderscore)
                );
                this.currentGraphData.data.relationships = this.currentGraphData.data.relationships.filter(
                    r => !r.id?.startsWith(prefixWithUnderscore)
                );
            }

            // Rebuild merged schema from remaining datasets
            this.rebuildMergedSchema();

            // Update StateManager
            this.stateManager.setGraphData(this.currentEntities, this.currentRelationships);

            // Refresh visuals
            await this.createNodes();
            await this.createEdges();
            
            // Re-apply layout if needed
            if (this.layoutManager && this.stateManager.state.layoutEnabled) {
                // ... layout logic
            }

            // Refresh labels
            if (this.nodeLabelManager) {
                this.nodeLabelManager.removeAllLabels();
                this.nodeLabelManager.createLabelsForAllEntities(this.currentEntities);
            }

        } catch (error) {
            errorHandler.handle(error, {
                category: 'import',
                severity: 'error',
                userMessage: `Datensatz '${sourceName}' konnte nicht entfernt werden.`
            });
        }
    }

    /**
     * Computes generic graph metrics (like degree) for all entities.
     * This ensures that every dataset has at least some numeric attributes
     * that can be used for label filtering or mapping.
     */
    private computeGraphMetrics(entities: EntityData[], relationships: RelationshipData[]) {
        const outDegreeMap = new Map<string, number>();
        const inDegreeMap = new Map<string, number>();
        const degreeMap = new Map<string, number>();

        relationships.forEach(rel => {
            const src = String(rel.source);
            const tgt = String(rel.target);
            
            outDegreeMap.set(src, (outDegreeMap.get(src) || 0) + 1);
            inDegreeMap.set(tgt, (inDegreeMap.get(tgt) || 0) + 1);
            
            degreeMap.set(src, (degreeMap.get(src) || 0) + 1);
            degreeMap.set(tgt, (degreeMap.get(tgt) || 0) + 1);
        });

        entities.forEach(entity => {
            const id = String(entity.id);
            entity.degree = degreeMap.get(id) || 0;
            entity.inDegree = inDegreeMap.get(id) || 0;
            entity.outDegree = outDegreeMap.get(id) || 0;
        });
    }

    /**
     * Convert entities to legacy node format
     */
    // Legacy conversion methods removed

    /**
     * Calculate bounds from nodes
     */
    public calculateBounds(nodes: any[]) {
        const bounds = {
            x: { min: Infinity, max: -Infinity },
            y: { min: Infinity, max: -Infinity },
            z: { min: Infinity, max: -Infinity }
        };

        nodes.forEach(node => {
            const x = node.position?.x || 0;
            const y = node.position?.y || 0;
            const z = node.position?.z || 0;
            bounds.x.min = Math.min(bounds.x.min, x);
            bounds.x.max = Math.max(bounds.x.max, x);
            bounds.y.min = Math.min(bounds.y.min, y);
            bounds.y.max = Math.max(bounds.y.max, y);
            bounds.z.min = Math.min(bounds.z.min, z);
            bounds.z.max = Math.max(bounds.z.max, z);
        });

        return bounds;
    }

    clearScene() {
        // Layout-Worker stoppen (verhindert Race-Conditions)
        if (this.layoutManager) {
            this.layoutManager.stopAnimation();
        }

        // Highlights aufraemen
        if (this.highlightManager) {
            this.highlightManager.clearAllHighlights();
        }

        // Labels entfernen
        if (this.nodeLabelManager) {
            this.nodeLabelManager.removeAllLabels();
        }
        if (this.edgeLabelManager) {
            this.edgeLabelManager.removeAllLabels();
        }

        // Clear nodes
        if (this.nodeManager) {
            this.nodeManager.clear();
        }

        // Remove edges
        if (this.edgeObjectsManager) {
            this.edgeObjectsManager.dispose();
        }

        this.currentEntities = [];
        this.currentRelationships = [];
    }

    /**
     * Vollstaendiges Cleanup: Gibt alle THREE.js-Ressourcen,
     * Worker und Event-Listener frei.
     * Wird bei App-Ende oder Hot-Reload aufgerufen.
     */
    destroy() {
        // Scene leeren
        this.clearScene();

        // Manager-Ressourcen freigeben
        if (this.nodeManager) {
            this.nodeManager.dispose();
        }

        if (this.highlightManager) {
            this.highlightManager.destroy();
        }

        if (this.interactionManager) {
            this.interactionManager.destroy();
        }

        // Renderer freigeben
        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.remove();
            this.renderer.dispose();
        }

        // Controls freigeben
        if (this.controls) {
            this.controls.dispose();
        }

        console.log('[App] Destroy completed');
    }

    async createNodes() {
        this.nodeManager.updateNodes(this.currentEntities);
    }

    async createEdges() {
        console.log(`Creating ${this.currentRelationships.length} edges...`);
        if (this.edgeObjectsManager) {
            this.edgeObjectsManager.updateEdges(this.currentRelationships, this.currentEntities);
        }
    }
    updateNodePositions() {
        if (this.nodeManager) {
            this.nodeManager.updateNodePositions(this.currentEntities);
        }
        if (this.edgeObjectsManager) {
            this.edgeObjectsManager.updateEdgePositions(this.currentEntities);
        }
        if (this.trailManager) {
            this.trailManager.updateTrails();
        }
        // Update label positions
        if (this.nodeLabelManager) {
            this.currentEntities.forEach(entity => {
                if (entity && entity.position && entity.id) {
                    const position = new THREE.Vector3(
                        entity.position.x || 0,
                        entity.position.y || 0,
                        entity.position.z || 0
                    );
                    this.nodeLabelManager.updateLabelPosition(String(entity.id), position);
                }
            });
        }
    }

    private setupEnvironmentSubscriptions() {
        this.stateManager.subscribe((state) => {
            // Background color
            if (this.scene.background instanceof THREE.Color) {
                this.scene.background.set(state.backgroundColor);
            } else {
                this.scene.background = new THREE.Color(state.backgroundColor);
            }

            // Light intensities
            if (this.ambientLight) {
                this.ambientLight.intensity = state.ambientLightIntensity;
            }
            if (this.directionalLight) {
                this.directionalLight.intensity = state.directionalLightIntensity;
            }
        }, 'environment');

        // Label visibility subscription
        this.stateManager.subscribe((state) => {
            if (this.nodeLabelManager) {
                this.nodeLabelManager.setAlwaysVisible(state.showLabelsAlways);
                this.nodeLabelManager.setVisible(state.showLabelsAlways || state.showLabelsOnHover);

                // Wenn sich der complexityMode oder labelLines aendert, Labels neu rendern
                if ((this.nodeLabelManager as any)._lastComplexityMode !== state.complexityMode ||
                    (this.nodeLabelManager as any)._lastLabelLines !== state.labelLines) {
                    (this.nodeLabelManager as any)._lastComplexityMode = state.complexityMode;
                    (this.nodeLabelManager as any)._lastLabelLines = state.labelLines;
                    this.nodeLabelManager.refreshAllLabels();
                }
            }
            if (this.edgeLabelManager) {
                this.edgeLabelManager.updateConfig({
                    alwaysVisible: state.showLabelsAlways,
                    visible: state.showLabelsAlways || state.showLabelsOnHover
                });

                if ((this.edgeLabelManager as any)._lastComplexityMode !== state.complexityMode) {
                    (this.edgeLabelManager as any)._lastComplexityMode = state.complexityMode;
                    this.edgeLabelManager.refreshAllLabels();
                }
            }

            // Immediately apply camera fit margin when slider changes
            if ((this as any)._lastCameraFitMargin !== state.cameraFitMargin) {
                (this as any)._lastCameraFitMargin = state.cameraFitMargin;
                if (this.currentEntities && this.currentEntities.length > 0) {
                    this.fitCameraToScene();
                }
            }
        }, 'ui');

        // Dev Panel settings subscription
        this.stateManager.subscribe((state) => {
            if (this.renderer) {
                this.renderer.setPixelRatio(window.devicePixelRatio * state.devPixelRatio);
            }
            if (state._triggerRendererRebuild > 0 && this.lastRebuildTimestamp !== state._triggerRendererRebuild) {
                this.lastRebuildTimestamp = state._triggerRendererRebuild;
                this.recreateRenderer();
            }
        }, 'dev');

        // Data sync subscription to keep local references updated
        this.stateManager.subscribe((state) => {
            this.currentEntities = state.graphData.entities;
            this.currentRelationships = state.graphData.relationships;
        }, 'data_changed');

        // Deep Dive Listener (Build 10) - HMR Safe
        const handleDeepDive = async (e: any) => {
            const { label, qId } = e.detail;
            if (!this.currentGraphData) {
                notify.error('Fehler', 'Kein bestehender Graph für Deep Dive vorhanden.');
                return;
            }
            
            try {
                notify.info('Deep Dive gestartet', `Erforsche ${label}...`);
                const provider = LLMService.getActiveProvider();
                const model = LLMService.getActiveModel(provider) || 'google/gemini-2.5-flash-001';
                
                const newGraphData = await LLMService.expandGraphNodeBuild10(
                    label,
                    qId,
                    this.currentGraphData,
                    provider,
                    model,
                    (msg) => console.log(`[DeepDive] ${msg}`)
                );
                
                // Merge new data into the active graph
                await this.loadGraphData(newGraphData, `DeepDive_${label}`, true);
                notify.success('Deep Dive erfolgreich', `Neue Knoten für ${label} integriert.`);
            } catch (error: any) {
                console.error(error);
                notify.error('Deep Dive fehlgeschlagen', error.message);
            }
        };

        if ((window as any)._nodgesDeepDiveHandler) {
            document.removeEventListener('nodges-deep-dive', (window as any)._nodgesDeepDiveHandler);
        }
        (window as any)._nodgesDeepDiveHandler = handleDeepDive;
        document.addEventListener('nodges-deep-dive', handleDeepDive);
    }

    fitCameraToScene() {
        if (this.currentEntities.length === 0) return;
        const bounds = this.calculateBounds(this.currentEntities);
        this.cameraManager.fitToBoundingBox(
            bounds,
            this.stateManager.state.cameraFitMargin,
            this.stateManager.state.cameraTransitionDuration
        );
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const state = this.stateManager.state;
        const now = performance.now();

        if (state.devFpsLimit > 0) {
            const minFrameTime = 1000 / state.devFpsLimit;
            if (now - this.lastRenderTime < minFrameTime) {
                return; // Skip this frame
            }
        }
        
        const deltaTime = (now - this.lastRenderTime) / 1000;
        this.lastRenderTime = now;

        // Build 4: Playback Fortschritt
        if (state.isPlaying && state.currentTimestamp !== null && state.currentTimestamp !== undefined) {
            let speed = state.playbackSpeed !== undefined ? state.playbackSpeed : 1.0;
            const newTime = state.currentTimestamp + (deltaTime * speed * 1000); 
            // console.log(`[TimePlayer Debug] old: ${state.currentTimestamp}, new: ${newTime}, delta: ${deltaTime}, speed: ${speed}`);
            // In einer vollständigen Lösung sollte TimePlayerUI die Max-Grenzen prüfen
            this.stateManager.setCurrentTimestamp(newTime);
        }

        // VISUAL DEBUGGER FOR TEMPORAL PLAYBACK
        let debugDiv = document.getElementById('debug-box-temporal');
        if (!debugDiv) {
            debugDiv = document.createElement('div');
            debugDiv.id = 'debug-box-temporal';
            debugDiv.style.position = 'fixed';
            debugDiv.style.top = '10px';
            debugDiv.style.right = '10px';
            debugDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
            debugDiv.style.color = '#0f0';
            debugDiv.style.padding = '10px';
            debugDiv.style.fontFamily = 'monospace';
            debugDiv.style.zIndex = '9999';
            debugDiv.style.pointerEvents = 'none';
            document.body.appendChild(debugDiv);
        }
        debugDiv.innerText = `[Temporal Debug]\nisPlaying: ${state.isPlaying}\ncurrentTimestamp: ${state.currentTimestamp}\ndeltaTime: ${deltaTime}\nplaybackSpeed: ${state.playbackSpeed}`;

        if (this.nodeManager) {
            this.nodeManager.updateTemporalState(this.stateManager.state.currentTimestamp);
            this.nodeManager.updateCloudPositions(
                this.stateManager.getRelationships(),
                this.stateManager.getEntities()
            );
        }
        if (this.edgeObjectsManager && (this.edgeObjectsManager as any).updateTemporalState) {
            (this.edgeObjectsManager as any).updateTemporalState(this.stateManager.state.currentTimestamp);
        }
        if (this.edgeObjectsManager && this.stateManager.state.currentTimestamp !== null) {
            this.edgeObjectsManager.updateEdgePositions(this.stateManager.getEntities());
        }

        if (this.edgeObjectsManager) {
            this.edgeObjectsManager.animate();
        }

        if (this.cameraManager) {
            this.cameraManager.update();
        }

        // Update label managers
        if (this.nodeLabelManager) {
            this.nodeLabelManager.update();
        }
        if (this.edgeLabelManager) {
            this.edgeLabelManager.update();
        }

        if (this.performanceMonitor) {
            this.performanceMonitor.tick();
        }

        this.controls.update();

        // Manual clear because autoClear is false
        this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        this.renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
        this.renderer.setScissorTest(false);
        this.renderer.clear();

        this.renderer.render(this.scene, this.camera);

        // Render Minimap Viewport if exists
        if (this.minimapUI) {
            const mmCanvas = this.minimapUI.getCanvas();
            if (mmCanvas && this.renderer.domElement) {
                // Determine minimap position on the main canvas
                const rect = mmCanvas.parentElement!.getBoundingClientRect();

                // Set explicit clear background for the minimap viewport
                const oldClearColor = new THREE.Color();
                this.renderer.getClearColor(oldClearColor);
                const oldClearAlpha = this.renderer.getClearAlpha();

                this.renderer.setScissorTest(true);
                
                // DPR Handling for Viewport and Scissor
                const dpr = window.devicePixelRatio;
                const viewY = (window.innerHeight - rect.bottom) * dpr;
                const viewX = rect.left * dpr;
                const viewWidth = rect.width * dpr;
                const viewHeight = rect.height * dpr;

                this.renderer.setViewport(viewX, viewY, viewWidth, viewHeight);
                this.renderer.setScissor(viewX, viewY, viewWidth, viewHeight);
                
                // Renderer clear for minimap viewport
                this.renderer.setClearColor(0x000000, 0.0); // Transparent background for minimap viewport
                this.renderer.clear();

                // Keep main lights enabled for minimap pass to ensure consistent colors
                // (Previously we toggled them, which caused color differences)


                // Ensure labels are hidden in minimap
                if (this.nodeLabelManager) this.nodeLabelManager.setVisible(false);
                if (this.edgeLabelManager) this.edgeLabelManager.updateConfig({ visible: false });

                // Update marker position (lifted above the graph)
                if (this.cameraMarker) {
                    this.cameraMarker.position.set(this.camera.position.x, 10, this.camera.position.z);
                    const dir = new THREE.Vector3();
                    this.camera.getWorldDirection(dir);
                    this.cameraMarker.rotation.y = Math.atan2(dir.x, dir.z);
                }

                // Render with minimap camera
                const oldBackground = this.scene.background;
                // Use a dark background to match the ground or theme, but keep it consistent
                this.scene.background = null; // Transparent viewport to see main canvas or clear color

                // Ensure all relevant layers are visible
                this.minimapCamera.layers.enable(0);
                this.minimapCamera.layers.enable(1);
                this.minimapCamera.layers.enable(2);

                // Render everything together with original materials
                this.renderer.render(this.scene, this.minimapCamera);
                
                this.scene.background = oldBackground;

                // Restore labels to their previous state
                const currentLabelsVisible = this.stateManager.state.showLabelsAlways || this.stateManager.state.showLabelsOnHover;
                if (this.nodeLabelManager) this.nodeLabelManager.setVisible(currentLabelsVisible);
                if (this.edgeLabelManager) this.edgeLabelManager.updateConfig({ visible: currentLabelsVisible });
                
                this.renderer.setClearColor(oldClearColor, oldClearAlpha);
                this.renderer.setScissorTest(false);
            }
        }

        // FPS Berechnung
        this.fpsFrameCount++;
        const fpsNow = performance.now();
        if (this.lastFpsTime === 0) {
            this.lastFpsTime = fpsNow;
        } else if (fpsNow - this.lastFpsTime >= 1000) {
            const fps = Math.round(this.fpsFrameCount * 1000 / (fpsNow - this.lastFpsTime));
            if (this.uiManager) {
                this.uiManager.updateFps(fps);
            }
            this.fpsFrameCount = 0;
            this.lastFpsTime = fpsNow;
        }

        // [TRACE] Log every 300 frames (approx 5 sec)
        this.frameCounter++;
        if (this.frameCounter % 300 === 0) {
            //console.log(`[TRACE] Render Loop (Frame ${this.frameCounter})`);
        }
    }

    private displayVersion() {
        const versionSpan = document.getElementById('fileVersion');
        const sidebarVersion = document.getElementById('sidebarVersion');
        if (pkg.version) {
            if (versionSpan) versionSpan.textContent = pkg.version;
            if (sidebarVersion) sidebarVersion.textContent = 'v' + pkg.version;
        }
    }

    public applyVisualBalance() {
        if (this.currentEntities.length === 0) return;

        console.log('[App] Calculating optimal visual balance...');
        const result = VisualOptimizer.calculateOptimalBalance(
            this.currentEntities,
            this.currentRelationships,
            this.stateManager.state,
            this.visualMappingEngine
        );

        console.log('[App] Applying visual balance:', result);
        
        // Normalize coordinates if enabled, and ONLY if the data didn't come with explicit positions that we want to preserve
        if (result.coordinateScaleFactor !== 1.0 && this.stateManager.state.normalizeCoordinatesEnabled && !this.hasExplicitPositions) {
            VisualOptimizer.normalizeCoordinates(this.currentEntities, result.coordinateScaleFactor);
            // Need to update actual THREE.js objects positions
            if (this.nodeManager) {
                this.nodeManager.updateNodePositions(this.currentEntities);
            }
        }


        this.stateManager.update({
            visualScaleMultiplier: result.visualScaleMultiplier,
            visualScaleExponent: result.visualScaleExponent,
            edgeThickness: result.edgeThickness
        });

        // If we have an edgeObjectsManager, we might need to tell it to refresh
        // but state update should trigger reactive update in managers.
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
            <h2>WebGL Error</h2>
            <p>Could not initialize 3D graphics context.</p>
            <p>Please check your browser settings or hardware acceleration.</p>
            <p style="font-size: small; color: #aaa; margin-top: 10px">If running in a VM/Container, ensure 3D acceleration is enabled.</p>
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
        
        // Let Vite handle the reload/update naturally
    });
}
