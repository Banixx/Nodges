import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { StateManager } from './core/StateManager';
// @ts-ignore
import { CentralEventManager } from './core/CentralEventManager';
// @ts-ignore
import { InteractionManager } from './core/InteractionManager';
// @ts-ignore
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
import { NodeObjectsManager } from './core/NodeObjectsManager';
// @ts-ignore
import { EdgeObjectsManager } from './core/EdgeObjectsManager';

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
    public layoutManager: any;
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
    public nodeObjectsManager: any;
    public edgeObjectsManager: any;

    public currentNodes: any[] = [];
    public currentEdges: any[] = [];
    public nodeObjects: any[] = [];
    // public edgeObjects: any[] = []; // Deprecated

    private _isInitialized: boolean = false;

    public get isInitialized(): boolean {
        return this._isInitialized;
    }
    private ground: THREE.Mesh | null = null;

    constructor() {
        console.log('Initializing Nodges 2.0');

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.stateManager = new StateManager();

        this.nodeObjectsManager = new NodeObjectsManager(this.scene);
        this.edgeObjectsManager = new EdgeObjectsManager(this.scene);

        this.init();
    }

    async init() {
        try {
            await this.initThreeJS();
            await this.initManagers();
            await this.initGUI();
            await this.loadDefaultData();

            this._isInitialized = true;
            console.log('Nodges 2.0 initialized');
            this.animate();
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    async initThreeJS() {
        this.scene.background = new THREE.Color(0x1a1a1a);
        this.camera.position.set(10, 10, 10);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        this.createGround();

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
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

        const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
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
        this.highlightManager = new HighlightManager(this.stateManager, this.glowEffect);
        this.uiManager = new UIManager(this);

        this.centralEventManager = new CentralEventManager(this.scene, this.camera, this.renderer, this.stateManager);

        this.interactionManager = new InteractionManager(
            this.centralEventManager,
            this.stateManager,
            this.highlightManager,
            this.camera,
            this.controls,
            this.scene
        );

        this.selectionManager = new SelectionManager(this.scene, this.camera, this.renderer, this.stateManager);
        this.raycastManager = new RaycastManager(this.camera, this.scene, this.nodeObjectsManager);
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

            const response = await fetch(url);
            const data = await response.json();

            // Basic loading logic for now, similar to main.js
            this.currentNodes = data.nodes || [];
            this.currentEdges = (data.edges || []).map((edge: any) => ({
                ...edge,
                start: edge.start !== undefined ? edge.start : edge.source,
                end: edge.end !== undefined ? edge.end : edge.target
            }));

            // Fix IDs
            this.currentNodes.forEach((node, index) => {
                if (!node.id) node.id = `node${index}`;
            });

            await this.createNodes();
            await this.createEdges();

            if (this.layoutManager) {
                await this.layoutManager.applyLayout('force-directed', this.currentNodes, this.currentEdges);
                this.updateNodePositions();
            }

            // Update UI
            if (this.uiManager) {
                // Extract filename from URL
                const filename = url.split('/').pop()?.replace('.json', '') || 'unknown';

                // Calculate bounds
                const bounds = {
                    x: { min: Infinity, max: -Infinity },
                    y: { min: Infinity, max: -Infinity },
                    z: { min: Infinity, max: -Infinity }
                };

                this.currentNodes.forEach(node => {
                    bounds.x.min = Math.min(bounds.x.min, node.x || 0);
                    bounds.x.max = Math.max(bounds.x.max, node.x || 0);
                    bounds.y.min = Math.min(bounds.y.min, node.y || 0);
                    bounds.y.max = Math.max(bounds.y.max, node.y || 0);
                    bounds.z.min = Math.min(bounds.z.min, node.z || 0);
                    bounds.z.max = Math.max(bounds.z.max, node.z || 0);
                });

                this.uiManager.updateFileInfo(filename, this.currentNodes.length, this.currentEdges.length, bounds);
            }

        } catch (e) {
            console.error('Failed to load data:', e);
        }
    }

    clearScene() {
        // Clear nodes
        if (this.nodeObjectsManager) {
            this.nodeObjectsManager.dispose();
        }
        this.nodeObjects = [];

        // Remove edges
        if (this.edgeObjectsManager) {
            this.edgeObjectsManager.dispose();
        }
        // this.edgeObjects = [];

        this.currentNodes = [];
        this.currentEdges = [];
    }

    async createNodes() {
        this.nodeObjectsManager.updateNodes(this.currentNodes);
    }

    async createEdges() {
        console.log(`Creating ${this.currentEdges.length} edges...`);
        if (this.edgeObjectsManager) {
            this.edgeObjectsManager.updateEdges(this.currentEdges, this.currentNodes);
        }
    }
    updateNodePositions() {
        if (this.nodeObjectsManager) {
            this.nodeObjectsManager.updateNodePositions(this.currentNodes);
        }
        if (this.edgeObjectsManager) {
            this.edgeObjectsManager.updateEdgePositions(this.currentNodes);
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        // this.stateManager.animate(); // StateManager has its own loop
    }
}

// Initialize App
try {
    window.app = new App();
} catch (e) {
    console.error('Failed to initialize App:', e);
}
