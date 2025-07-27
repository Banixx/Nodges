/**
 * Nodges - Main Application
 * 3D Netzwerkvisualisierung mit Caching
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Kernsystem
import { StateManager } from './src/core/StateManager.js';
import { CentralEventManager } from './src/core/CentralEventManager.js';
import { InteractionManager } from './src/core/InteractionManager.js';
import { LayoutManager } from './src/core/LayoutManager.js';
import { UIManager } from './src/core/UIManager.js';
import { EventManager } from './src/core/EventManager.js';

// Utilities
import { SelectionManager } from './src/utils/SelectionManager.js';
import { RaycastManager } from './src/utils/RaycastManager.js';
import { NetworkAnalyzer } from './src/utils/NetworkAnalyzer.js';
import { PathFinder } from './src/utils/PathFinder.js';
import { PerformanceOptimizer } from './src/utils/PerformanceOptimizer.js';
import { FPSMonitor } from './src/utils/FPSMonitor.js';
import { FileHandler } from './src/utils/FileHandler.js';
import { ImportManager } from './src/utils/ImportManager.js';
import { ExportManager } from './src/utils/ExportManager.js';
import { EdgeLabelManager } from './src/utils/EdgeLabelManager.js';
import { NeighborhoodHighlighter } from './src/utils/NeighborhoodHighlighter.js';
import { KeyboardShortcuts } from './src/utils/KeyboardShortcuts.js';
import { BatchOperations } from './src/utils/BatchOperations.js';
import { NodeGroupManager } from './src/utils/NodeGroupManager.js';
import { LayoutGUI } from './src/utils/LayoutGUI.js';

// Effekte
import { HighlightManager } from './src/effects/HighlightManager.js';
import { GlowEffect } from './src/effects/GlowEffect.js';

// Objekte
import { Node } from './objects/Node.js';
import { Edge } from './objects/Edge.js';

class NodgesApp {
    constructor() {
        console.log('Initialisiere Nodges');
        
        // Kernkomponenten
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Manager
        this.stateManager = new StateManager();
        this.centralEventManager = null;
        this.interactionManager = null;
        this.layoutManager = null;
        this.uiManager = null;
        this.eventManager = null;
        this.selectionManager = null;
        this.raycastManager = null;
        this.networkAnalyzer = null;
        this.pathFinder = null;
        this.performanceOptimizer = null;
        this.fpsMonitor = null;
        this.fileHandler = null;
        this.importManager = null;
        this.exportManager = null;
        this.edgeLabelManager = null;
        this.neighborhoodHighlighter = null;
        this.keyboardShortcuts = null;
        this.batchOperations = null;
        this.nodeGroupManager = null;
        this.layoutGUI = null;
        this.highlightManager = null;
        this.glowEffect = null;
        
        // Daten
        this.currentNodes = [];
        this.currentEdges = [];
        this.nodeObjects = [];
        this.edgeObjects = [];
        this.lastMouseMoveTime = 0;
        
        // Performance-Cache für Raycast-Operationen
        this.raycastObjectsCache = null;
        this.raycastCacheValid = false;
        
        // Zustand
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            await this.initThreeJS();
            await this.initManagers();
            await this.initGUI();
            await this.initEventListeners();
            await this.loadDefaultData();
            
            this.isInitialized = true;
            console.log('Nodges erfolgreich initialisiert');
            
            this.animate();
        } catch (error) {
            console.error('Fehler bei der Initialisierung:', error);
        }
    }
    
    async initThreeJS() {
        // Szene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);
        
        // Kamera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(10, 10, 10);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        
        // Steuerung
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Beleuchtung
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        
        // Schattenkamera konfigurieren
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.camera.updateProjectionMatrix();
        
        this.scene.add(directionalLight);

        // Untergrund erstellen
        this.createGround();
        
        // Fenstergrößenänderung behandeln
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        console.log('Three.js initialisiert');
    }

    createGround() {
        // Geometrie für Untergrund
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        
        // Material mit Textur
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.8
        });

        // Mesh erstellen
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -5;
        this.ground.receiveShadow = true;
        this.ground.name = 'ground';

        this.scene.add(this.ground);

        // Hilfsgitter für Orientierung
        this.createGridLines();

        console.log('Untergrund erstellt');
    }

    createGridLines() {
        const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
        gridHelper.position.y = -4.9;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        this.scene.add(gridHelper);
    }
    
    async initManagers() {
        try {
            // Kern-Manager
            this.layoutManager = new LayoutManager();
            this.uiManager = new UIManager(this.stateManager);
            this.eventManager = new EventManager(this.stateManager);
            
            // Unified Event System
            this.centralEventManager = new CentralEventManager(this.scene, this.camera, this.renderer, this.stateManager);
            
            // Effektmanager vor Interaktionsmanager
            this.glowEffect = new GlowEffect();
            this.highlightManager = new HighlightManager(this.stateManager, this.glowEffect);
            
            // Interaktionsmanager nach Highlightmanager
            this.interactionManager = new InteractionManager(this.centralEventManager, this.stateManager, this.highlightManager);
            
            // Hilfsmanager
            this.selectionManager = new SelectionManager(this.scene, this.camera, this.renderer, this.stateManager);
            this.raycastManager = new RaycastManager(this.camera, this.scene);
            this.networkAnalyzer = new NetworkAnalyzer();
            this.pathFinder = new PathFinder(this.scene, this.stateManager);
            this.performanceOptimizer = new PerformanceOptimizer(this.scene, this.camera, this.renderer);
            // FPSMonitor deaktiviert - Anzeige erfolgt im Datei-Info-Panel
            this.fpsMonitor = null;
            this.fileHandler = new FileHandler();
            this.importManager = new ImportManager();
            this.exportManager = new ExportManager();
            this.edgeLabelManager = new EdgeLabelManager(this.scene, this.camera);
            this.neighborhoodHighlighter = new NeighborhoodHighlighter();
            this.keyboardShortcuts = new KeyboardShortcuts();
            this.batchOperations = new BatchOperations();
            this.nodeGroupManager = new NodeGroupManager();
            
            console.log('Managersystem initialisiert');
        } catch (error) {
            console.error('Fehler bei Manager-Initialisierung:', error);
            throw error;
        }
    }
    
    async initGUI() {
        this.layoutGUI = new LayoutGUI(this.layoutManager, document.body);
        this.initFileInfoPanel();
        this.initSearchPanel();
        console.log('GUI-System initialisiert');
    }
    
    initFileInfoPanel() {
        this.updateFileInfo('Kein Netzwerk geladen', 0, 0);
    }
    
    initSearchPanel() {
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        
        if (searchInput && searchButton) {
            searchButton.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });
        }
    }
    
    async initEventListeners() {
        // Datenlade-Buttons
        document.getElementById('smallData')?.addEventListener('click', () => this.loadData('data/examples/small.json'));
        document.getElementById('mediumData')?.addEventListener('click', () => this.loadData('data/examples/medium.json'));
        document.getElementById('largeData')?.addEventListener('click', () => this.loadData('data/examples/large.json'));
        document.getElementById('megaData')?.addEventListener('click', () => this.loadData('data/examples/mega.json'));
        
        // Layout-Button
        document.getElementById('layoutButton')?.addEventListener('click', () => {
            this.layoutGUI.show();
        });
        
        console.log('Event-Listener initialisiert');
    }
    
    async loadDefaultData() {
        await this.loadData('data/examples/small.json');
    }
    
    async loadData(url) {
        try {
            console.log(`Lade Netzwerk-Daten: ${url}`);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            
            const data = await response.json();
            this.clearScene();
            this.currentNodes = data.nodes || [];
            this.currentEdges = data.edges || [];
            
            await this.createNodes();
            await this.createEdges();
            
            this.updateFileInfo(
                url.split('/').pop(),
                this.currentNodes.length,
                this.currentEdges.length
            );
            
            if (this.networkAnalyzer) {
                this.networkAnalyzer.initialize(this.currentNodes, this.currentEdges);
            }
            
            console.log(`Netzwerk geladen: ${this.currentNodes.length} Knoten, ${this.currentEdges.length} Kanten`);
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }
    
    clearScene() {
        
        this.nodeObjects.forEach(node => {
            if (node.mesh) {
                this.scene.remove(node.mesh);
                node.mesh.geometry?.dispose();
                node.mesh.material?.dispose();
            }
        });
        
        this.edgeObjects.forEach(edge => {
            if (edge.line) {
                this.scene.remove(edge.line);
                edge.line.geometry?.dispose();
                edge.line.material?.dispose();
            }
        });
        
        if (typeof Edge !== 'undefined' && Edge.clearCache) {
            Edge.clearCache();
        }
        
        this.nodeObjects = [];
        this.edgeObjects = [];
    }
    
    async createNodes() {
        this.currentNodes.forEach((nodeData, index) => {
            const node = new Node(nodeData, index);
            node.createMesh();
            
            if (node.mesh) {
                this.scene.add(node.mesh);
                this.nodeObjects.push(node);
            }
        });
    }
    
    async createEdges() {
        const totalEdges = this.currentEdges.length;
        console.log(`Erstelle ${totalEdges} Kanten mit Caching`);
        
        const startTime = performance.now();
        let geometryCacheHits = 0;
        let geometryCacheMisses = 0;
        let materialCacheHits = 0;
        let materialCacheMisses = 0;
        
        this.currentEdges.forEach((edgeData, index) => {
            const startNodeObj = this.nodeObjects[edgeData.start];
            const endNodeObj = this.nodeObjects[edgeData.end];
            
            if (startNodeObj && endNodeObj) {
                const geoCacheSizeBefore = Edge.geometryCache ? Edge.geometryCache.size : 0;
                const matCacheSizeBefore = Edge.materialCache ? Edge.materialCache.size : 0;
                
                const edge = new Edge(startNodeObj, endNodeObj, {
                    ...edgeData,
                    name: edgeData.name || 'Kante ' + index,
                    totalEdges: totalEdges
                });
                
                const geoCacheSizeAfter = Edge.geometryCache ? Edge.geometryCache.size : 0;
                const matCacheSizeAfter = Edge.materialCache ? Edge.materialCache.size : 0;
                
                if (geoCacheSizeAfter > geoCacheSizeBefore) geometryCacheMisses++;
                else geometryCacheHits++;
                
                if (matCacheSizeAfter > matCacheSizeBefore) materialCacheMisses++;
                else materialCacheHits++;
                
                if (edge.line) {
                    this.scene.add(edge.line);
                    this.edgeObjects.push(edge);
                }
            }
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`[Performance] Kantenerstellung abgeschlossen in ${duration.toFixed(2)}ms`);
    }
    
    updateFileInfo(filename, nodeCount, edgeCount) {
        document.getElementById('fileFilename').textContent = `Dateiname: ${filename}`;
        document.getElementById('fileNodeCount').textContent = `Anzahl Knoten: ${nodeCount}`;
        document.getElementById('fileEdgeCount').textContent = `Anzahl Kanten: ${edgeCount}`;
        
        if (this.currentNodes.length > 0) {
            const bounds = this.calculateBounds();
            document.getElementById('fileXAxis').textContent = `X-Achse: ${bounds.x.min.toFixed(2)} bis ${bounds.x.max.toFixed(2)}`;
            document.getElementById('fileYAxis').textContent = `Y-Achse: ${bounds.y.min.toFixed(2)} bis ${bounds.y.max.toFixed(2)}`;
            document.getElementById('fileZAxis').textContent = `Z-Achse: ${bounds.z.min.toFixed(2)} bis ${bounds.z.max.toFixed(2)}`;
        }
    }
    
    calculateBounds() {
        const bounds = {
            x: { min: Infinity, max: -Infinity },
            y: { min: Infinity, max: -Infinity },
            z: { min: Infinity, max: -Infinity }
        };
        
        this.currentNodes.forEach(node => {
            bounds.x.min = Math.min(bounds.x.min, node.x);
            bounds.x.max = Math.max(bounds.x.max, node.x);
            bounds.y.min = Math.min(bounds.y.min, node.y);
            bounds.y.max = Math.max(bounds.y.max, node.y);
            bounds.z.min = Math.min(bounds.z.min, node.z);
            bounds.z.max = Math.max(bounds.z.max, node.z);
        });
        
        return bounds;
    }
    
    performSearch(query) {
        if (!query.trim()) return;
        // Suchfunktionalität deaktiviert
    }
    
    displaySearchResults(results) {
        // Suchfunktionalität deaktiviert
    }
    
    focusOnNode(nodeData) {
        // Suchfunktionalität deaktiviert
    }
    
    onMouseClick(event) {
        if (!this.raycastManager) return;
        
        this.raycastManager.updateMousePosition(event);
        const intersectedObject = this.raycastManager.findIntersectedObject();
        
        if (intersectedObject) {
            this.stateManager.setSelectedObject(intersectedObject);
            this.showInfoPanel(intersectedObject);
        } else {
            this.stateManager.setSelectedObject(null);
        }
    }
    
    onMouseMove(event) {
        if (!this.raycastManager) return;
        
        const now = performance.now();
        if (now - this.lastMouseMoveTime < 16.67) return;
        this.lastMouseMoveTime = now;
        
        this.raycastManager.updateMousePosition(event);
        const hoveredObject = this.raycastManager.findIntersectedObject();
        
        if (hoveredObject) {
            this.stateManager.setHoveredObject(hoveredObject);
            document.body.style.cursor = 'pointer';
        } else {
            this.stateManager.setHoveredObject(null);
            document.body.style.cursor = 'default';
        }
    }
    
    showInfoPanel(object) {
        // Info-Panel-Logik (gekürzt)
    }
    
    getConnectedEdges(nodeIndex) {
        const connectedEdges = [];
        this.currentEdges.forEach((edgeData, index) => {
            if (edgeData.start === nodeIndex || edgeData.end === nodeIndex) {
                connectedEdges.push({
                    name: edgeData.name || `Kante ${index}`,
                    start: edgeData.start,
                    end: edgeData.end,
                    index: index
                });
            }
        });
        return connectedEdges;
    }
    
    highlightEdge(edgeIndex, highlight) {
        const edgeObject = this.edgeObjects[edgeIndex];
        if (edgeObject && edgeObject.line) {
            this.stateManager.setHoveredObject(highlight ? edgeObject.line : null);
        }
    }
    
    selectEdge(edgeIndex) {
        const edgeObject = this.edgeObjects[edgeIndex];
        if (edgeObject && edgeObject.line) {
            this.stateManager.setSelectedObject(edgeObject.line);
            this.showInfoPanel(edgeObject.line);
        }
    }
    
    highlightNode(nodeIndex, highlight) {
        const nodeObject = this.nodeObjects[nodeIndex];
        if (nodeObject && nodeObject.mesh) {
            this.stateManager.setHoveredObject(highlight ? nodeObject.mesh : null);
        }
    }
    
    selectNode(nodeIndex) {
        const nodeObject = this.nodeObjects[nodeIndex];
        if (nodeObject && nodeObject.mesh) {
            this.stateManager.setSelectedObject(nodeObject.mesh);
            this.showInfoPanel(nodeObject.mesh);
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // FPS-Anzeige aktualisieren
        const now = performance.now();
        this.frameCount = (this.frameCount || 0) + 1;
        
        if (!this.lastFPSUpdate) this.lastFPSUpdate = now;
        if (now - this.lastFPSUpdate >= 1000) {
            const fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = now;
            
            // FPS im Datei-Info-Panel anzeigen
            const fpsElement = document.getElementById('fileFPS');
            if (fpsElement) {
                fpsElement.textContent = `FPS: ${fps}`;
            }
        }

        this.controls.update();
        if (window.TWEEN) window.TWEEN.update();
        if (this.stateManager) this.stateManager.animate();
        this.renderer.render(this.scene, this.camera);
    }
    
    // Öffentliche API-Methoden
    getNodes() { return this.currentNodes; }
    getEdges() { return this.currentEdges; }
    getNodeObjects() { return this.nodeObjects; }
    getEdgeObjects() { return this.edgeObjects; }
    getScene() { return this.scene; }
    getCamera() { return this.camera; }
    getRenderer() { return this.renderer; }
    
}

// Dev-Optionen Event-Handler
function setupDevOptions(app) {
    const toggleStats = document.getElementById('toggleStats');
    const toggleOptimized = document.getElementById('toggleOptimized');
    
    if (toggleStats) {
        toggleStats.addEventListener('change', () => {
            app.updatePerformanceStats();
        });
    }
    
    if (toggleOptimized) {
        toggleOptimized.addEventListener('change', () => {
            console.log('Optimized mode toggled:', toggleOptimized.checked);
            // Hier später die Umschaltung zwischen normalem und optimiertem Modus implementieren
        });
    }
}

// Anwendung initialisieren
document.addEventListener('DOMContentLoaded', () => {
    const app = new NodgesApp();
    window.nodgesApp = app;
    setupDevOptions(app);
});

export { NodgesApp };
