// App.ts - Reload Trigger 2025-12-17 00:10
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { StateManager } from './core/StateManager';
import { NodeManager } from './core/NodeManager';
import { CentralEventManager } from './core/CentralEventManager';
// @ts-ignore
import { InteractionManager } from './core/InteractionManager';
import { LayoutManager } from './core/LayoutManager';
// @ts-ignore
import { UIManager } from './core/UIManager';
// @ts-ignore
import { SelectionManager } from './utils/SelectionManager.js';
// @ts-ignore
import { RaycastManager } from './utils/RaycastManager';
// @ts-ignore
import { NetworkAnalyzer } from './utils/NetworkAnalyzer.js';
// @ts-ignore
import { PathFinder } from './utils/PathFinder.js';
// @ts-ignore
import { PerformanceOptimizer } from './utils/PerformanceOptimizer.js';
// @ts-ignore
import { FileHandler } from './utils/FileHandler.js';
// @ts-ignore
import { ImportManager } from './utils/ImportManager.js';
// @ts-ignore
import { ExportManager } from './utils/ExportManager.js';
// @ts-ignore
import { EdgeLabelManager } from './utils/EdgeLabelManager.js';
// @ts-ignore
import { NeighborhoodHighlighter } from './utils/NeighborhoodHighlighter.js';
// @ts-ignore
import { KeyboardShortcuts } from './utils/KeyboardShortcuts.js';
// @ts-ignore
import { BatchOperations } from './utils/BatchOperations.js';
// @ts-ignore
import { NodeGroupManager } from './utils/NodeGroupManager.js';
// @ts-ignore
import { LayoutGUI } from './utils/LayoutGUI.js';
// @ts-ignore
import { FutureDataParser } from './utils/FutureDataParser.js';
// @ts-ignore
import { HighlightManager } from './effects/HighlightManager.js';
// @ts-ignore
import { GlowEffect } from './effects/GlowEffect.js';
// @ts-ignore
// @ts-ignore
// import { NodeObjectsManager } from './core/NodeObjectsManager';
// @ts-ignore
import { EdgeObjectsManager } from './core/EdgeObjectsManager';
// @ts-ignore
import { DataParser } from './core/DataParser';
// @ts-ignore
import { VisualMappingEngine } from './core/VisualMappingEngine';
import { GraphData, EntityData, RelationshipData, NodeObject } from './types';

import './styles/main.css';

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
    public centralEventManager: any;
    public interactionManager: any;
    public layoutManager!: LayoutManager;
    public uiManager: any;
    public selectionManager: any;
    public raycastManager: any;
    public networkAnalyzer: any;
    public pathFinder: any;
    public performanceOptimizer: any;
    public fileHandler: any;
    public importManager: any;
    public exportManager: any;
    public edgeLabelManager: any;
    public neighborhoodHighlighter: any;
    public keyboardShortcuts: any;
    public batchOperations: any;
    public nodeGroupManager: any;
    public layoutGUI: any;
    public highlightManager: any;
    public glowEffect: any;
    public nodeManager: NodeManager;
    public edgeObjectsManager: any;

    private ambientLight!: THREE.AmbientLight;
    private directionalLight!: THREE.DirectionalLight;

    // Data management
    public currentGraphData: GraphData | null = null;
    public visualMappingEngine: VisualMappingEngine;
    public layoutEnabled: boolean = false; // Auto-layout disabled by default

    // Future support
    public currentEntities: EntityData[] = [];
    public currentRelationships: RelationshipData[] = [];

    // Legacy support (DEPRECATED - mapped to entities)
    // public currentNodes: any[] = [];
    // public currentEdges: any[] = [];
    public nodeObjects: NodeObject[] = [];
    public edgeObjects: any[] = [];

    private _isInitialized: boolean = false;
    private frameCounter: number = 0;

    public get isInitialized(): boolean {
        return this._isInitialized;
    }
    private ground: THREE.Mesh | null = null;

    constructor() {
        console.log('Initializing Nodges');

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.stateManager = new StateManager();

        this.visualMappingEngine = new VisualMappingEngine();
        this.nodeManager = new NodeManager(this.scene, this.visualMappingEngine);
        this.edgeObjectsManager = new EdgeObjectsManager(this.scene, this.visualMappingEngine, this.stateManager);

        this.init();
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
            console.error('Initialization error:', error);
        }
    }

    async initThreeJS() {
        this.scene.background = new THREE.Color();
        this.camera.position.set(10, 10, 10);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        this.ambientLight = new THREE.AmbientLight(0x404040, this.stateManager.state.ambientLightIntensity);
        this.scene.add(this.ambientLight);

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

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.8
        });

        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -5;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        const gridHelper = new THREE.GridHelper(1000, 200, 0x444444, 0x222222);
        gridHelper.position.y = -4.9;
        // @ts-ignore
        gridHelper.material.transparent = true;
        // @ts-ignore
        gridHelper.material.opacity = 0.3;
        this.scene.add(gridHelper);
    }

    async initManagers() {
        this.layoutManager = new LayoutManager();
        this.glowEffect = new GlowEffect();
        this.glowEffect = new GlowEffect();
        this.highlightManager = new HighlightManager(this.stateManager, this.glowEffect, this.scene, this.nodeManager, this.edgeObjectsManager);
        this.uiManager = new UIManager(this);

        this.centralEventManager = new CentralEventManager(this.camera, this.renderer, this.stateManager, this.nodeManager, this.edgeObjectsManager, this.scene);

        this.interactionManager = new InteractionManager(
            this.centralEventManager,
            this.stateManager,
            this.highlightManager,
            this.camera,
            this.controls,
            this.scene
        );

        this.selectionManager = new SelectionManager(this.scene, this.camera, this.renderer, this.stateManager);
        this.raycastManager = new RaycastManager(this.camera, this.nodeManager, this.edgeObjectsManager);
        this.networkAnalyzer = new NetworkAnalyzer();
        this.pathFinder = new PathFinder(this.scene, this.stateManager);
        this.performanceOptimizer = new PerformanceOptimizer(this.scene, this.camera, this.renderer);
        this.fileHandler = new FileHandler();
        this.importManager = new ImportManager();
        this.exportManager = new ExportManager();
        this.edgeLabelManager = new EdgeLabelManager(this.scene, this.camera);
        this.neighborhoodHighlighter = new NeighborhoodHighlighter();
        this.keyboardShortcuts = new KeyboardShortcuts();
        this.batchOperations = new BatchOperations();
        this.nodeGroupManager = new NodeGroupManager();
    }

    async initGUI() {
        this.layoutGUI = new LayoutGUI(this, document.body);
        this.uiManager.init();
    }

    async loadDefaultData() {
        // Temporary: just log, we need to implement data loading properly
        console.log('Loading default data...');
        await this.loadData('data/small.json');
    }

    async loadData(url: string) {
        try {
            // Clear existing scene
            this.clearScene();

            // Reset application state universally before reloading data
            this.stateManager.update({
                selectedObject: null,
                hoveredObject: null,
                highlightedObjects: new Set(),
                infoPanelVisible: false,
                infoPanelCollapsed: false,
            });

            // Clear raycast cache
            if (this.raycastManager && this.raycastManager.clearCache) {
                this.raycastManager.clearCache();
            }

            const response = await fetch(url);
            const rawData = await response.json();

            console.log(`[TRACE] Loaded Raw Data: ${rawData.data?.entities?.length} entities`);

            // Parse data using DataParser (handles both legacy and future formats)
            this.currentGraphData = DataParser.parse(rawData);

            console.log(`[TRACE] Parsed Data: ${this.currentGraphData.data.entities.length} entities`);

            // Set visual mappings if available
            if (this.currentGraphData.visualMappings) {
                this.visualMappingEngine.setVisualMappings(this.currentGraphData.visualMappings);
                if (this.uiManager) {
                    this.uiManager.updateVisualMappings(this.currentGraphData.visualMappings);
                }
            }

            // Store data directly
            this.currentEntities = this.currentGraphData.data.entities;
            this.currentRelationships = this.currentGraphData.data.relationships;

            // Initialize visual mappings
            // Note: VisualMappingEngine is already used by NodeManager during updateNodes

            // Create Nodes (Entities)
            console.log('[App] Calling createNodes...');
            await this.createNodes();
            console.log('[App] createNodes finished.');

            // Create Edges (Relationships)
            // Note: EdgeObjectsManager still needs updates to handle RelationshipData fully, 
            // but we pass standard arrays for now.
            // We need to map RelationshipData to standard Edge structure if EdgeObjectsManager wasn't updated to RelationshipData fully?
            // Wait, we didn't update EdgeObjectsManager to take RelationshipData?
            // We should map it here temporarily or trust strict typing if we updated it (we didn't).
            // Let's do a quick mapping for EdgeObjectsManager compatibility.
            // Actually, let's cast it for now as EdgeObjectsManager is loosely typed in some places.
            await this.createEdges();

            // Only apply layout if entities don't have positions
            const hasPositions = this.currentEntities.every(e =>
                e.position && e.position.x !== undefined && e.position.y !== undefined && e.position.z !== undefined
            );

            if (this.layoutManager && !hasPositions) {
                // LayoutManager was updated to accept EntityData[]
                await this.layoutManager.applyLayout('force-directed', this.currentEntities, this.currentRelationships);
                this.updateNodePositions();
            }

            // Update UI
            if (this.uiManager) {
                const filename = url.split('/').pop()?.replace('.json', '') || 'unknown';
                const bounds = this.calculateBounds(this.currentEntities);
                this.uiManager.updateFileInfo(
                    filename,
                    this.currentEntities.length,
                    this.currentRelationships.length,
                    bounds
                );
            }

            // Auto-focus camera on loaded nodes
            this.fitCameraToScene();

        } catch (e) {
            console.error('Failed to load data:', e);
        }
    }

    /**
     * Convert entities to legacy node format
     */
    // Legacy conversion methods removed

    /**
     * Calculate bounds from nodes
     */
    private calculateBounds(nodes: any[]) {
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
        // Clear nodes
        if (this.nodeManager) {
            this.nodeManager.clear();
        }
        this.nodeObjects = [];

        // Remove edges
        if (this.edgeObjectsManager) {
            this.edgeObjectsManager.dispose();
        }
        this.edgeObjects = [];

        this.currentEntities = [];
        this.currentRelationships = [];
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
    }

    public updateVisualMappings(mappings: any) {
        if (!this.currentGraphData) return;
        this.currentGraphData.visualMappings = mappings; // Persist in data
        this.visualMappingEngine.setVisualMappings(mappings);

        // Re-apply to nodes
        if (this.nodeManager) {
            this.nodeManager.updateNodes(this.currentEntities);
        }

        // Re-apply to edges
        if (this.edgeObjectsManager) {
            this.edgeObjectsManager.updateEdges(this.currentRelationships, this.currentEntities);
        }

        // Re-render scene (implicit in animate loop, but ensuring robust update)
    }

    fitCameraToScene() {
        if (this.currentEntities.length === 0) return;
        const bounds = this.calculateBounds(this.currentEntities);

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

        // Calculate optimal camera distance based on network size and FOV
        const fov = this.camera.fov * (Math.PI / 180);
        const distance = Math.max(5, Math.abs(maxDimension / Math.sin(fov / 2)));

        // Position camera
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
        requestAnimationFrame(this.animate.bind(this));

        if (this.edgeObjectsManager) {
            this.edgeObjectsManager.animate();
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);

        // [TRACE] Log every 60 frames (approx 1 sec)
        this.frameCounter++;
        if (this.frameCounter % 300 === 0) {
            //console.log(`[TRACE] Render Loop (Frame ${this.frameCounter})`);
            //console.log(`[TRACE] Camera Pos: ${this.camera.position.x.toFixed(1)}, ${this.camera.position.y.toFixed(1)}, ${this.camera.position.z.toFixed(1)}`);
            // const nodeMeshes = this.scene.children.filter(c => c.type === 'InstancedMesh');
            // //console.log(`[TRACE] Scene Children: ${this.scene.children.length}, InstancedMeshes: ${nodeMeshes.length}`);
            // // nodeMeshes.forEach((mesh: any, i) => {
            // //      console.log(`[TRACE] Mesh ${i}: count=${mesh.count}, visible=${mesh.visible}`);
            // // });
        }
    }
}

// Initialize App
try {
    window.app = new App();
} catch (e) {
    console.error('Failed to initialize App:', e);
}
