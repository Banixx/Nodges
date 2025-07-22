/**
 * Nodges 0.85 - Main Application
 * Professional 3D Network Visualization with Layout Algorithms
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Core System
import { StateManager } from './src/core/StateManager.js';
import { LayoutManager } from './src/core/LayoutManager.js';
import { UIManager } from './src/core/UIManager.js';
import { EventManager } from './src/core/EventManager.js';

// Utilities
import { SearchManager } from './src/utils/SearchManager.js';
import { SelectionManager } from './src/utils/SelectionManager.js';
import { RaycastManager } from './src/utils/RaycastManager.js';
import { NetworkAnalyzer } from './src/utils/NetworkAnalyzer.js';
import { PathFinder } from './src/utils/PathFinder.js';
import { PerformanceOptimizer } from './src/utils/PerformanceOptimizer.js';
import { FileHandler } from './src/utils/FileHandler.js';
import { ImportManager } from './src/utils/ImportManager.js';
import { ExportManager } from './src/utils/ExportManager.js';
import { EdgeLabelManager } from './src/utils/EdgeLabelManager.js';
import { NeighborhoodHighlighter } from './src/utils/NeighborhoodHighlighter.js';
import { KeyboardShortcuts } from './src/utils/KeyboardShortcuts.js';
import { BatchOperations } from './src/utils/BatchOperations.js';
import { NodeGroupManager } from './src/utils/NodeGroupManager.js';
import { LayoutGUI } from './src/utils/LayoutGUI.js';

// Effects
import { HighlightManager } from './src/effects/HighlightManager.js';
import { GlowEffect } from './src/effects/GlowEffect.js';

// Objects
import { Node } from './objects/Node.js';
import { Edge } from './objects/Edge.js';

class NodgesApp {
    constructor() {
        console.log(' Initialisiere Nodges 0.85 - Layout Algorithms System');
        
        // Core Components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Managers
        this.stateManager = new StateManager();
        this.layoutManager = null;
        this.uiManager = null;
        this.eventManager = null;
        this.searchManager = null;
        this.selectionManager = null;
        this.raycastManager = null;
        this.networkAnalyzer = null;
        this.pathFinder = null;
        this.performanceOptimizer = null;
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
        
        // Data
        this.currentNodes = [];
        this.currentEdges = [];
        this.nodeObjects = [];
        this.edgeObjects = [];
        
        // State
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
            console.log(' Nodges 0.85 erfolgreich initialisiert');
            
            this.animate();
        } catch (error) {
            console.error(' Fehler bei der Initialisierung:', error);
        }
    }
    
    async initThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(10, 10, 10);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        console.log(' Three.js initialisiert');
    }
    
    async initManagers() {
        try {
            // Core Managers
            this.layoutManager = new LayoutManager(this.scene, this.stateManager);
            this.uiManager = new UIManager(this.stateManager);
            this.eventManager = new EventManager(this.stateManager);
            
            // Utility Managers - ALL with correct parameters
            this.searchManager = new SearchManager();
            this.selectionManager = new SelectionManager(this.scene, this.camera, this.renderer, this.stateManager);
            this.raycastManager = new RaycastManager(this.camera, this.scene);
            this.networkAnalyzer = new NetworkAnalyzer();
            this.pathFinder = new PathFinder();
            this.performanceOptimizer = new PerformanceOptimizer(this.scene, this.camera, this.renderer);
            this.fileHandler = new FileHandler();
            this.importManager = new ImportManager();
            this.exportManager = new ExportManager();
            this.edgeLabelManager = new EdgeLabelManager(this.scene, this.camera);
            this.neighborhoodHighlighter = new NeighborhoodHighlighter();
            this.keyboardShortcuts = new KeyboardShortcuts();
            this.batchOperations = new BatchOperations();
            this.nodeGroupManager = new NodeGroupManager();
            
            // Effects
            this.glowEffect = new GlowEffect();
            this.highlightManager = new HighlightManager(this.stateManager, this.glowEffect);
            
            console.log(' Manager-System initialisiert');
        } catch (error) {
            console.error(' Fehler bei Manager-Initialisierung:', error);
            throw error;
        }
    }
    
    async initGUI() {
        // Layout GUI
        this.layoutGUI = new LayoutGUI(this.layoutManager);
        
        // Initialize GUI panels
        this.initFileInfoPanel();
        this.initSearchPanel();
        
        console.log(' GUI-System initialisiert');
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
        // Data loading buttons
        document.getElementById('smallData')?.addEventListener('click', () => this.loadData('data/examples/small.json'));
        document.getElementById('mediumData')?.addEventListener('click', () => this.loadData('data/examples/medium.json'));
        document.getElementById('largeData')?.addEventListener('click', () => this.loadData('data/examples/large.json'));
        document.getElementById('megaData')?.addEventListener('click', () => this.loadData('data/examples/mega.json'));
        document.getElementById('familyData')?.addEventListener('click', () => this.loadData('data/examples/family.json'));
        document.getElementById('architektur')?.addEventListener('click', () => this.loadData('data/examples/architektur.json'));
        document.getElementById('royalFamilyData')?.addEventListener('click', () => this.loadData('data/examples/royal_family.json'));
        
        // Layout button
        document.getElementById('layoutButton')?.addEventListener('click', () => {
            this.layoutGUI.show();
        });
        
        // Mouse events for interaction
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        
        console.log(' Event-Listener initialisiert');
    }
    
    async loadDefaultData() {
        await this.loadData('data/examples/small.json');
    }
    
    async loadData(url) {
        try {
            console.log(` Lade Netzwerk-Daten: ${url}`);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Clear existing data
            this.clearScene();
            
            // Process data
            this.currentNodes = data.nodes || [];
            this.currentEdges = data.edges || [];
            
            // Create 3D objects
            await this.createNodes();
            await this.createEdges();
            
            // Update file info
            this.updateFileInfo(
                url.split('/').pop(),
                this.currentNodes.length,
                this.currentEdges.length
            );
            
            // Initialize network analysis
            if (this.networkAnalyzer) {
                this.networkAnalyzer.initialize(this.currentNodes, this.currentEdges);
            }
            
            console.log(` Netzwerk geladen: ${this.currentNodes.length} Knoten, ${this.currentEdges.length} Kanten`);
            
        } catch (error) {
            console.error(' Fehler beim Laden der Daten:', error);
        }
    }
    
    clearScene() {
        console.log('[CLEAR] Entferne ' + this.nodeObjects.length + ' Knoten und ' + this.edgeObjects.length + ' Edges');
        
        // Remove existing objects
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
        
        // Clear Edge geometry cache
        if (typeof Edge !== 'undefined' && Edge.geometryCache) {
            Edge.geometryCache.clear();
        }
        
        this.nodeObjects = [];
        this.edgeObjects = [];
        
        console.log('[CLEAR] Scene bereinigt');
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
        console.log('Erstelle ' + totalEdges + ' Edges mit adaptiver Qualitaet');
        
        this.currentEdges.forEach((edgeData, index) => {
            const startNodeObj = this.nodeObjects[edgeData.start];
            const endNodeObj = this.nodeObjects[edgeData.end];
            
            if (startNodeObj && endNodeObj) {
                const edge = new Edge(startNodeObj, endNodeObj, {
                    ...edgeData,
                    name: edgeData.name || 'Edge ' + index,
                    totalEdges: totalEdges
                });
                
                if (edge.line) {
                    this.scene.add(edge.line);
                    this.edgeObjects.push(edge);
                }
            } else {
                console.warn('Edge ' + index + ': Knoten nicht gefunden');
            }
        });
    }
    
    updateFileInfo(filename, nodeCount, edgeCount) {
        document.getElementById('fileFilename').textContent = `Dateiname: ${filename}`;
        document.getElementById('fileNodeCount').textContent = `Anzahl Knoten: ${nodeCount}`;
        document.getElementById('fileEdgeCount').textContent = `Anzahl Kanten: ${edgeCount}`;
        
        // Calculate bounds
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
        
        const results = this.searchManager.search(query, this.currentNodes);
        this.displaySearchResults(results);
    }
    
    displaySearchResults(results) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">Keine Ergebnisse gefunden</div>';
        } else {
            results.forEach((result, index) => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.textContent = result.name || `Knoten ${result.id || index}`;
                item.addEventListener('click', () => {
                    this.focusOnNode(result);
                    searchResults.style.display = 'none';
                });
                searchResults.appendChild(item);
            });
        }
        
        searchResults.style.display = 'block';
    }
    
    focusOnNode(nodeData) {
        const nodeObject = this.nodeObjects.find(node => 
            node.data === nodeData || node.data.name === nodeData.name
        );
        
        if (nodeObject && nodeObject.mesh) {
            const targetPosition = nodeObject.mesh.position.clone();
            targetPosition.add(new THREE.Vector3(5, 5, 5));
            
            this.controls.target.copy(nodeObject.mesh.position);
            this.camera.position.copy(targetPosition);
            this.controls.update();
            
            this.stateManager.setSelectedObject(nodeObject.mesh);
        }
    }
    
    onMouseClick(event) {
        if (!this.raycastManager) return;
        
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        const nodeObjects = this.nodeObjects.map(n => n.mesh).filter(mesh => mesh);
        const edgeObjects = this.edgeObjects.map(e => e.line).filter(line => line);
        const intersects = this.raycastManager.raycast(mouse, [...nodeObjects, ...edgeObjects]);
        
        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;
            this.stateManager.setSelectedObject(selectedObject);
            this.showInfoPanel(selectedObject);
        } else {
            this.stateManager.setSelectedObject(null);
            this.hideInfoPanel();
        }
    }
    
    onMouseMove(event) {
        if (!this.raycastManager) return;
        
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        const nodeObjects = this.nodeObjects.map(n => n.mesh).filter(mesh => mesh);
        const edgeObjects = this.edgeObjects.map(e => e.line).filter(line => line);
        const intersects = this.raycastManager.raycast(mouse, [...nodeObjects, ...edgeObjects]);
        
        if (intersects.length > 0) {
            const hoveredObject = intersects[0].object;
            this.stateManager.setHoveredObject(hoveredObject);
            document.body.style.cursor = 'pointer';
        } else {
            this.stateManager.setHoveredObject(null);
            document.body.style.cursor = 'default';
        }
    }
    
    showInfoPanel(object) {
        const infoPanel = document.getElementById('infoPanel');
        const infoPanelTitle = document.getElementById('infoPanelTitle');
        const infoPanelContent = document.getElementById('infoPanelContent');
        
        if (!infoPanel || !infoPanelTitle || !infoPanelContent) return;
        
        if (object.userData.type === 'node') {
            const nodeObject = this.nodeObjects.find(n => n.mesh === object);
            if (nodeObject) {
                infoPanelTitle.textContent = nodeObject.data.name || 'Unbenannter Knoten';
                infoPanelContent.innerHTML = `
                    <p><strong>Position:</strong> (${nodeObject.data.x.toFixed(2)}, ${nodeObject.data.y.toFixed(2)}, ${nodeObject.data.z.toFixed(2)})</p>
                    <p><strong>Typ:</strong> Knoten</p>
                `;
            }
        } else if (object.userData.type === 'edge') {
            const edgeObject = this.edgeObjects.find(e => e.mesh === object);
            if (edgeObject) {
                infoPanelTitle.textContent = edgeObject.data.name || 'Unbenannte Kante';
                infoPanelContent.innerHTML = `
                    <p><strong>Verbindung:</strong> ${edgeObject.data.start} → ${edgeObject.data.end}</p>
                    <p><strong>Typ:</strong> Kante</p>
                `;
            }
        }
        
        infoPanel.style.display = 'block';
        infoPanel.classList.add('expanded');
    }
    
    hideInfoPanel() {
        const infoPanel = document.getElementById('infoPanel');
        if (infoPanel) {
            infoPanel.style.display = 'none';
            infoPanel.classList.remove('expanded');
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        
        if (window.TWEEN) {
            TWEEN.update();
        }
        
        if (this.stateManager) {
            this.stateManager.animate();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Public API methods
    getNodes() { return this.currentNodes; }
    getEdges() { return this.currentEdges; }
    getNodeObjects() { return this.nodeObjects; }
    getEdgeObjects() { return this.edgeObjects; }
    getScene() { return this.scene; }
    getCamera() { return this.camera; }
    getRenderer() { return this.renderer; }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.nodgesApp = new NodgesApp();
});

// Export for module usage
export { NodgesApp };