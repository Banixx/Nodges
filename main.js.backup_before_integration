/**
 * Nodges 0.90 - Main Application
 * 3D Network Visualization with Advanced Caching
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Core System
import { StateManager } from './src/core/StateManager.js';
import { LayoutManager } from './src/core/LayoutManager.js';
import { UIManager } from './src/core/UIManager.js';
import { EventManager } from './src/core/EventManager.js';

// Utilities
// import { SearchManager } from './src/utils/SearchManager.js'; // Deaktiviert - Such-UI entfernt
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

// Effects
import { HighlightManager } from './src/effects/HighlightManager.js';
import { GlowEffect } from './src/effects/GlowEffect.js';

// Objects
import { Node } from './objects/Node.js';
import { Edge } from './objects/Edge.js';

class NodgesApp {
    constructor() {
        console.log(' Initialisiere Nodges 0.90');
        
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
        // this.searchManager = null; // Deaktiviert
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
        
        // Data
        this.currentNodes = [];
        this.currentEdges = [];
        this.nodeObjects = [];
        this.edgeObjects = [];
        this.lastMouseMoveTime = 0;
        
        // Performance cache for raycast operations
        this.raycastObjectsCache = null;
        this.raycastCacheValid = false;
        
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
            console.log(' Nodges 0.90 erfolgreich initialisiert');
            
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
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        
        // Shadow-Kamera korrekt konfigurieren fuer die Szene
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.camera.updateProjectionMatrix();
        
        this.scene.add(directionalLight);

        // Untergrund hinzufgen
        this.createGround();
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        console.log(' Three.js initialisiert');
    }

    createGround() {
        // Erstelle Untergrund-Geometrie
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        
        // Erstelle Material mit subtiler Textur
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.8
        });

        // Erstelle Untergrund-Mesh
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2; // Horizontal ausrichten
        this.ground.position.y = -5; // Unter den Knoten positionieren
        this.ground.receiveShadow = true; // Schatten empfangen
        this.ground.name = 'ground';

        this.scene.add(this.ground);

        // Optional: Grid lines for better orientation
        this.createGridLines();

        console.log(' Untergrund erstellt');
    }

    createGridLines() {
        // Create grid for better spatial orientation
        const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
        gridHelper.position.y = -4.9; // Knapp ber dem Untergrund
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        this.scene.add(gridHelper);
    }
    
    async initManagers() {
        try {
            // Core Managers
            this.layoutManager = new LayoutManager();
            this.uiManager = new UIManager(this.stateManager);
            this.eventManager = new EventManager(this.stateManager);
            
            // Utility Managers - ALL with correct parameters
            // this.searchManager = new SearchManager(); // Deaktiviert
            this.selectionManager = new SelectionManager(this.scene, this.camera, this.renderer, this.stateManager);
            this.raycastManager = new RaycastManager(this.camera, this.scene);
            this.networkAnalyzer = new NetworkAnalyzer();
            this.pathFinder = new PathFinder(this.scene, this.stateManager);
            this.performanceOptimizer = new PerformanceOptimizer(this.scene, this.camera, this.renderer);
            this.fpsMonitor = new FPSMonitor();
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
        // Layout GUI - mit container Parameter
        this.layoutGUI = new LayoutGUI(this.layoutManager, document.body);
        
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
        
        // Cache-Statistiken vor dem Leeren anzeigen
        if (typeof Edge !== 'undefined' && Edge.getCacheStats) {
            const stats = Edge.getCacheStats();
            console.log('[CACHE] Vor Bereinigung:', stats);
        }
        
        // Clear Edge geometry cache ordnungsgemass
        if (typeof Edge !== 'undefined' && Edge.clearCache) {
            Edge.clearCache();
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
        console.log('Erstelle ' + totalEdges + ' Edges mit adaptiver Qualitaet und Caching');
        
        // Performance-Messung starten
        const startTime = performance.now();
        let geometryCacheHits = 0;
        let geometryCacheMisses = 0;
        let materialCacheHits = 0;
        let materialCacheMisses = 0;
        
        this.currentEdges.forEach((edgeData, index) => {
            const startNodeObj = this.nodeObjects[edgeData.start];
            const endNodeObj = this.nodeObjects[edgeData.end];
            
            if (startNodeObj && endNodeObj) {
                // Cache-Statistiken vor Edge-Erstellung
                const geoCacheSizeBefore = Edge.geometryCache ? Edge.geometryCache.size : 0;
                const matCacheSizeBefore = Edge.materialCache ? Edge.materialCache.size : 0;
                
                const edge = new Edge(startNodeObj, endNodeObj, {
                    ...edgeData,
                    name: edgeData.name || 'Edge ' + index,
                    totalEdges: totalEdges
                });
                
                // Cache-Statistiken nach Edge-Erstellung
                const geoCacheSizeAfter = Edge.geometryCache ? Edge.geometryCache.size : 0;
                const matCacheSizeAfter = Edge.materialCache ? Edge.materialCache.size : 0;
                
                // Geometrie-Cache-Tracking
                if (geoCacheSizeAfter > geoCacheSizeBefore) {
                    geometryCacheMisses++;
                } else {
                    geometryCacheHits++;
                }
                
                // Material-Cache-Tracking
                if (matCacheSizeAfter > matCacheSizeBefore) {
                    materialCacheMisses++;
                } else {
                    materialCacheHits++;
                }
                
                if (edge.line) {
                    this.scene.add(edge.line);
                    this.edgeObjects.push(edge);
                }
            } else {
                console.warn('Edge ' + index + ': Knoten nicht gefunden');
            }
        });
        
        // Performance-Ergebnisse
        const endTime = performance.now();
        const duration = endTime - startTime;
        const totalCacheHits = geometryCacheHits + materialCacheHits;
        const totalCacheMisses = geometryCacheMisses + materialCacheMisses;
        const totalCacheOperations = totalCacheHits + totalCacheMisses;
        const overallCacheHitRate = totalCacheOperations > 0 ? ((totalCacheHits / totalCacheOperations) * 100).toFixed(1) : 0;
        const geometryHitRate = (geometryCacheHits + geometryCacheMisses) > 0 ? ((geometryCacheHits / (geometryCacheHits + geometryCacheMisses)) * 100).toFixed(1) : 0;
        const materialHitRate = (materialCacheHits + materialCacheMisses) > 0 ? ((materialCacheHits / (materialCacheHits + materialCacheMisses)) * 100).toFixed(1) : 0;
        
        console.log(`[PERFORMANCE] Edge-Erstellung abgeschlossen:`);
        console.log(`  - Dauer: ${duration.toFixed(2)}ms`);
        console.log(`  - Durchschnitt pro Edge: ${(duration / totalEdges).toFixed(2)}ms`);
        console.log(`  - Gesamt Cache Hit Rate: ${overallCacheHitRate}%`);
        console.log(`[GEOMETRIE-CACHE]`);
        console.log(`  - Hits: ${geometryCacheHits} | Misses: ${geometryCacheMisses} | Rate: ${geometryHitRate}%`);
        console.log(`[MATERIAL-CACHE]`);
        console.log(`  - Hits: ${materialCacheHits} | Misses: ${materialCacheMisses} | Rate: ${materialHitRate}%`);
        
        // Detaillierte Cache-Statistiken anzeigen
        if (Edge.getCacheStats) {
            const stats = Edge.getCacheStats();
            console.log(`[CACHE] Finale Statistiken:`);
            console.log(`  - Geometrien: ${stats.geometries}`);
            console.log(`  - Materialien: ${stats.materials}`);
            console.log(`  - Gesamt: ${stats.usage}`);
            console.log(`  - Speicher: ${stats.memoryEstimate}`);
            console.log(`  - Breakdown: Geo=${stats.breakdown.geometryMemory}, Mat=${stats.breakdown.materialMemory}`);
        }
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
        
        // const results = this.searchManager.search(query, this.currentNodes); // Deaktiviert
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
        
        this.raycastManager.updateMousePosition(event);
        const intersectedObject = this.raycastManager.findIntersectedObject();
        
        if (intersectedObject) {
            this.stateManager.setSelectedObject(intersectedObject);
            this.showInfoPanel(intersectedObject);
        } else {
            this.stateManager.setSelectedObject(null);
            this.hideInfoPanel();
        }
    }
    
    onMouseMove(event) {
        if (!this.raycastManager) return;
        
        // Throttle mouse move events to 60fps max
        const now = performance.now();
        if (now - this.lastMouseMoveTime < 16.67) return; // 60fps = 16.67ms
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
        const infoPanel = document.getElementById('infoPanel');
        const infoPanelTitle = document.getElementById('infoPanelTitle');
        const infoPanelContent = document.getElementById('infoPanelContent');
        
        if (!infoPanel || !infoPanelTitle || !infoPanelContent) return;
        
        if (object.userData.type === 'node') {
            const nodeObject = this.nodeObjects.find(n => n.mesh === object);
            if (nodeObject) {
                const data = nodeObject.data || nodeObject.position || {};
                const name = data.name || object.name || 'Unbenannter Knoten';
                const x = data.x || 0;
                const y = data.y || 0;
                const z = data.z || 0;
                
                // Finde verbundene Edges
                const nodeIndex = this.nodeObjects.indexOf(nodeObject);
                const connectedEdges = this.getConnectedEdges(nodeIndex);
                
                let edgesList = '';
                if (connectedEdges.length > 0) {
                    edgesList = connectedEdges.map(edge => 
                        `<li><span class="edge-link" data-edge-index="${edge.index}"
                             onmouseover="window.nodgesApp.highlightEdge(${edge.index}, true)"
                             onmouseout="window.nodgesApp.highlightEdge(${edge.index}, false)"
                             onclick="window.nodgesApp.selectEdge(${edge.index})">${edge.name || 'Unbenannte Kante'}</span></li>`
                    ).join('');
                    edgesList = `<p><strong>Verbundene Kanten (${connectedEdges.length}):</strong></p><ul>${edgesList}</ul>`;
                } else {
                    edgesList = '<p><strong>Verbundene Kanten:</strong> Keine</p>';
                }
                
                infoPanelTitle.textContent = name;
                infoPanelContent.innerHTML = `
                    <p><strong>Position:</strong> (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})</p>
                    <p><strong>Typ:</strong> Knoten</p>
                    ${edgesList}
                `;
            }
        } else if (object.userData.type === 'edge') {
            const edgeObject = this.edgeObjects.find(e => e.line === object);
            if (edgeObject) {
                // Finde Edge-Daten
                const edgeIndex = this.edgeObjects.indexOf(edgeObject);
                const edgeData = this.currentEdges[edgeIndex];
                
                if (edgeData) {
                    const startNodeName = this.currentNodes[edgeData.start]?.name || `Node ${edgeData.start}`;
                    const endNodeName = this.currentNodes[edgeData.end]?.name || `Node ${edgeData.end}`;
                    
                    infoPanelTitle.textContent = edgeData.name || 'Unbenannte Kante';
                    infoPanelContent.innerHTML = `
                        <p><strong>Verbindung:</strong> 
                           <span class="node-link"
                                 onmouseover="window.nodgesApp.highlightNode(${edgeData.start}, true)"
                                 onmouseout="window.nodgesApp.highlightNode(${edgeData.start}, false)"
                                 onclick="window.nodgesApp.selectNode(${edgeData.start})">${startNodeName}</span>
                           <-> 
                           <span class="node-link"
                                 onmouseover="window.nodgesApp.highlightNode(${edgeData.end}, true)"
                                 onmouseout="window.nodgesApp.highlightNode(${edgeData.end}, false)"
                                 onclick="window.nodgesApp.selectNode(${edgeData.end})">${endNodeName}</span>
                        </p>
                        <p><strong>Typ:</strong> Kante</p>
                        <p><strong>Offset:</strong> ${edgeData.offset || 0}</p>
                    `;
                }
            }
        }
        
        // Selection Panel automatisch ausfahren
        infoPanel.classList.remove('collapsed');
        const infoPanelToggle = document.getElementById('infoPanelToggle');
        if (infoPanelToggle) {
            infoPanelToggle.innerHTML = 'v';
        }
        
        infoPanel.style.display = 'block';
        // infoPanel entfernt
    }
    
    hideInfoPanel() {
        // infoPanel wurde entfernt - Funktion deaktiviert
    }
    
    // Hilfsfunktion: Finde alle Edges die mit einem Node verbunden sind
    getConnectedEdges(nodeIndex) {
        const connectedEdges = [];
        
        this.currentEdges.forEach((edgeData, index) => {
            if (edgeData.start === nodeIndex || edgeData.end === nodeIndex) {
                connectedEdges.push({
                    name: edgeData.name || `Edge ${index}`,
                    start: edgeData.start,
                    end: edgeData.end,
                    index: index
                });
            }
        });
        
        return connectedEdges;
    }
    
    // Highlight Edge beim Hovern - verwendet HighlightManager
    highlightEdge(edgeIndex, highlight) {
        const edgeObject = this.edgeObjects[edgeIndex];
        if (edgeObject && edgeObject.line) {
            if (highlight) {
                this.stateManager.setHoveredObject(edgeObject.line);
            } else {
                this.stateManager.setHoveredObject(null);
            }
        }
    }
    
    // Edge selektieren beim Klicken
    selectEdge(edgeIndex) {
        const edgeObject = this.edgeObjects[edgeIndex];
        if (edgeObject && edgeObject.line) {
            // Edge als selektiertes Objekt setzen
            this.stateManager.setSelectedObject(edgeObject.line);
            this.showInfoPanel(edgeObject.line);
        }
    }
    
    // Highlight Node beim Hovern - verwendet HighlightManager
    highlightNode(nodeIndex, highlight) {
        const nodeObject = this.nodeObjects[nodeIndex];
        if (nodeObject && nodeObject.mesh) {
            if (highlight) {
                this.stateManager.setHoveredObject(nodeObject.mesh);
            } else {
                this.stateManager.setHoveredObject(null);
            }
        }
    }
    
    // Node selektieren beim Klicken
    selectNode(nodeIndex) {
        const nodeObject = this.nodeObjects[nodeIndex];
        if (nodeObject && nodeObject.mesh) {
            // Node als selektiertes Objekt setzen
            this.stateManager.setSelectedObject(nodeObject.mesh);
            this.showInfoPanel(nodeObject.mesh);
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update FPS monitor
        if (this.fpsMonitor) {
            this.fpsMonitor.update();
        }
        
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
