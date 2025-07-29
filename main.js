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
        this.edgeType = 'tube'; // Standard: Gebogene Rhren
        
        // Performance-Cache fr Raycast-Operationen
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
            // GUI vor Event-Listenern initialisieren
            await this.initGUI();
            await this.initEventListeners();
            // Default-Daten nach Event-Registrierung laden
            await this.loadDefaultData();
            
        this.isInitialized = true;
        console.log('Nodges erfolgreich initialisiert');
        
        // Zeige Versionsnummer nach einer kurzen Verzgerung
        setTimeout(() => {
            console.log('Version: 0.92.10');
        }, 100);
        
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
        
        // Fenstergrennderung behandeln
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        console.log('Three.js initialisiert');
    }

    createGround() {
        // Geometrie fr Untergrund
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

        // Hilfsgitter fr Orientierung
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
        this.glowEffect = new GlowEffect();
        this.highlightManager = new HighlightManager(this.stateManager, this.glowEffect);
        
        // UI Manager muss nach HighlightManager initialisiert werden
        this.uiManager = new UIManager(this.stateManager, this.highlightManager);
        
        
        // Unified Event System
        this.centralEventManager = new CentralEventManager(this.scene, this.camera, this.renderer, this.stateManager);
        
        // Interaktionsmanager nach Highlightmanager
        this.interactionManager = new InteractionManager(
            this.centralEventManager,
            this.stateManager,
            this.highlightManager,
                this.camera,
                this.controls,
                this.scene
            );
            
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
            // Kamera automatisch auf Netzwerk ausrichten
            this.fitCameraToScene();
            
            // Sicherstellen, dass der Pfad korrekt ist
            const correctedUrl = url.includes('data/examples') ? url : `data/examples/${url}`;
            // Fr lokalen Server mit fhrendem / 
            const serverUrl = correctedUrl.startsWith('/') ? correctedUrl : `/${correctedUrl}`;
            const response = await fetch(serverUrl);
            if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            
            const data = await response.json();
            this.clearScene();
            this.currentNodes = data.nodes || [];
            this.currentEdges = data.edges || [];
            
            await this.createNodes();
            await this.createEdges();
            
            // Layout nur anwenden, wenn nicht deaktiviert
            if (this.stateManager.state.layoutEnabled) {
                await this.layoutManager.applyLayout('force-directed', this.currentNodes, this.currentEdges);
                this.updateNodePositions();
                console.log('Layout erfolgreich angewendet');
            } else {
                console.log('Layout-Anwendung bersprungen (deaktiviert)');
            }
            
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
            if (edge.line || edge.tube) {
                this.scene.remove(edge.line || edge.tube);
                (edge.line || edge.tube).geometry?.dispose();
                (edge.line || edge.tube).material?.dispose();
            }
        });
        
        if (typeof Edge !== 'undefined' && Edge.clearCache) {
            Edge.clearCache();
        }
        
        this.nodeObjects = [];
        this.edgeObjects = [];
    }
    
    async createNodes() {
        // Erstelle einzelne Meshes fr jeden Knoten
        const nodeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const nodeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x3498db,
            shininess: 30
        });
        
        this.nodeObjects = this.currentNodes.map((node, index) => {
            const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
            nodeMesh.position.set(node.x, node.y, node.z);
            this.scene.add(nodeMesh);
            
            return {
                index: index,
                position: new THREE.Vector3(node.x, node.y, node.z),
                mesh: nodeMesh
            };
        });
        
        console.log(`${this.currentNodes.length} Knoten erstellt`);
    }
    
    updateNodePositions() {
        this.currentNodes.forEach((node, i) => {
            if (this.nodeObjects[i]) {
                this.nodeObjects[i].position.set(node.x, node.y, node.z);
                if (this.nodeObjects[i].mesh) {
                    this.nodeObjects[i].mesh.position.set(node.x, node.y, node.z);
                }
            }
        });
        
        // Aktualisiere alle Kantenpositionen
        this.edgeObjects.forEach(edge => {
            if (edge.options && edge.options.start !== undefined && edge.options.end !== undefined) {
                const startNode = this.nodeObjects[edge.options.start];
                const endNode = this.nodeObjects[edge.options.end];
                
                if (startNode && endNode && edge.updatePositions) {
                    edge.updatePositions(startNode.position, endNode.position, 0.2, 0.2);
                }
            }
        });
    }
    
    async createEdges() {
        if (this.edgeType === 'tube') {
            await this.createTubeEdges();
        } else {
            await this.createLineEdges();
        }
        
        // Debug: Pruefe alle Szenen-Objekte nach Edge-Erstellung
        console.log('=== SZENEN-OBJEKTE NACH EDGE-ERSTELLUNG ===');
        this.scene.traverse((object) => {
            if (object.userData && object.userData.type === 'edge') {
                console.log('Edge in Szene gefunden:', object, 'userData:', object.userData);
            }
        });
        console.log('=== ENDE SZENEN-OBJEKTE ===');
    }
    
    async createLineEdges() {
        const totalEdges = this.currentEdges.length;
        console.log(`[DEBUG] Start edge creation for ${totalEdges} edges`);
        console.log(`[DEBUG] Node objects available: ${this.nodeObjects.length}`);
        
        // Debug node object availability
        this.nodeObjects.forEach((node, i) => {
            console.log(`[DEBUG] Node ${i}: ${node.position.x},${node.position.y},${node.position.z}`);
        });
        
        const startTime = performance.now();
        let geometryCacheHits = 0;
        let geometryCacheMisses = 0;
        let materialCacheHits = 0;
        let materialCacheMisses = 0;
        
        this.currentEdges.forEach((edgeData, index) => {
            // Sicherstellen, dass die Knotenindizes gltig sind
            if (edgeData.start >= 0 && edgeData.start < this.nodeObjects.length && 
                edgeData.end >= 0 && edgeData.end < this.nodeObjects.length) {
                
                const startNode = this.nodeObjects[edgeData.start];
                const endNode = this.nodeObjects[edgeData.end];
                
                const geoCacheSizeBefore = Edge.geometryCache ? Edge.geometryCache.size : 0;
                const matCacheSizeBefore = Edge.materialCache ? Edge.materialCache.size : 0;
                
                const edge = new Edge(startNode.position, endNode.position, 0.2, 0.2, {
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
                    console.log(`Kante ${index} zwischen Knoten ${edgeData.start} und ${edgeData.end} erstellt`);
                }
            } else {
                console.warn(`Ungltige Kante ${index}: Knoten ${edgeData.start} oder ${edgeData.end} existiert nicht`);
            }
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`[Performance] Kantenerstellung abgeschlossen in ${duration.toFixed(2)}ms`);
        console.log(`Erstellte Kanten: ${this.edgeObjects.length}/${totalEdges}`);
    }
    
    async createTubeEdges() {
        const { Edge } = await import('./objects/Edge.js');
        const totalEdges = this.currentEdges.length;
        console.log(`[DEBUG] Start tube edge creation for ${totalEdges} edges`);
        
        this.currentEdges.forEach((edgeData, index) => {
            if (edgeData.start >= 0 && edgeData.start < this.nodeObjects.length && 
                edgeData.end >= 0 && edgeData.end < this.nodeObjects.length) {
                
                const startNode = this.nodeObjects[edgeData.start];
                const endNode = this.nodeObjects[edgeData.end];
                
                const edge = new Edge(
                    startNode.position,
                    endNode.position,
                    0.2,
                    0.2,
                    {
                        ...edgeData,
                        name: edgeData.name || 'Kante ' + index,
                        totalEdges: totalEdges,
                        index: index  // Fge den Index der aktuellen Kante hinzu
                    }
                );
                console.log(`[DEBUG] Erstelle Rhren-Kante ${index} zwischen Knoten ${edgeData.start} und ${edgeData.end}`);
                console.log('Startposition:', startNode.position);
                console.log('Endposition:', endNode.position);
                console.log('Optionen:', {
                    start: edgeData.start,
                    end: edgeData.end,
                    totalEdges: totalEdges,
                    index: index
                });
                
                if (edge.tube) {
                    // WICHTIG: userData NACH Edge-Erstellung setzen
                    edge.tube.userData = {
                        type: 'edge',
                        edge: edge,
                        name: edgeData.name || `Kante ${index}`,
                        start: edgeData.start,
                        end: edgeData.end,
                        index: index
                    };
                    
                    this.scene.add(edge.tube);
                    this.edgeObjects.push(edge);
                    console.log(`Tube-Kante ${index} zwischen Knoten ${edgeData.start} und ${edgeData.end} erstellt`);
                    console.log(`Tube userData:`, edge.tube.userData);
                }
            } else {
                console.warn(`[DEBUG] Ungltige Rhren-Kante ${index}: Knoten ${edgeData.start} oder ${edgeData.end} existiert nicht`);
            }
        });
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

    fitCameraToScene() {
        if (this.currentNodes.length === 0) return;
        
        const bounds = this.calculateBounds();
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
        
        // Berechne optimalen Kamera-Abstand basierend auf Netzwerkgre
        const fov = this.camera.fov * (Math.PI / 180);
        const distance = Math.abs(maxDimension / Math.sin(fov / 2));
        
        this.camera.position.set(
            center.x,
            center.y,
            center.z + distance * 1.5  // Abstand mit Puffer
        );
        this.camera.lookAt(center);
        this.controls.target.copy(center);
        this.controls.update();
    }
    
    performSearch(query) {
        if (!query.trim()) return;
        // Suchfunktionalitt deaktiviert
    }
    
    displaySearchResults(results) {
        // Suchfunktionalitt deaktiviert
    }
    
    focusOnNode(nodeData) {
        // Suchfunktionalitt deaktiviert
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
        const deltaTime = now - this.lastMouseMoveTime;
        
        // Throttle raycasting to 30fps (33ms)
        if (deltaTime < 33) return;
        this.lastMouseMoveTime = now;
        
        // Check if mouse position has changed significantly (5px threshold)
        const dx = event.clientX - this.lastMouseX;
        const dy = event.clientY - this.lastMouseY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        let hoveredObject;
        if (distance > 5 || !this.lastRaycastResult) {
            // Update raycast manager with new position
            this.raycastManager.updateMousePosition(event);
            
            // Perform new raycast and cache result
            hoveredObject = this.raycastManager.findIntersectedObject();
            this.lastRaycastResult = hoveredObject;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        } else {
            // Use cached result
            hoveredObject = this.lastRaycastResult;
        }
        
        // Batch state updates
        const updates = {
            hoveredObject: hoveredObject,
            cursorStyle: hoveredObject ? 'pointer' : 'default'
        };
        
        this.stateManager.batchUpdate(updates);
    }
    
    showInfoPanel(object) {
        const infoPanel = document.getElementById('infoPanel');
        const infoPanelContent = document.getElementById('infoPanelContent');
        
        if (!infoPanel || !infoPanelContent) return;

        // Panel immer sichtbar machen
        infoPanel.classList.remove('collapsed');
        
        // Pfeil-Symbol auf "geffnet" setzen
        const infoPanelToggle = document.getElementById('infoPanelToggle');
        if (infoPanelToggle) {
            infoPanelToggle.innerHTML = 'v';
        }

        if (object) {
            // Panel mit Inhalt fllen
            infoPanelContent.innerHTML = `
                <p><strong>Ausgewhltes Objekt:</strong></p>
                <p>Typ: ${object.type}</p>
                <p>Name: ${object.name || 'Unbenannt'}</p>
            `;
        } else {
            // Leeres Panel ohne Inhalt
            infoPanelContent.innerHTML = '<p>Kein Objekt ausgewhlt</p>';
        }
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
        if (edgeObject && (edgeObject.line || edgeObject.tube)) {
            this.stateManager.setHoveredObject(highlight ? (edgeObject.line || edgeObject.tube) : null);
        }
    }
    
    selectEdge(edgeIndex) {
        const edgeObject = this.edgeObjects[edgeIndex];
        if (edgeObject && (edgeObject.line || edgeObject.tube)) {
            this.stateManager.setSelectedObject(edgeObject.line || edgeObject.tube);
            this.showInfoPanel(edgeObject.line || edgeObject.tube);
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
    
    // ffentliche API-Methoden
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
            // Hier spter die Umschaltung zwischen normalem und optimiertem Modus implementieren
        });
    }
}

// Anwendung initialisieren
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const app = new NodgesApp();
        window.nodgesApp = app;
        setupDevOptions(app);
    });
} else {
    console.error("Diese Anwendung muss im Browser ausgefhrt werden");
}

export { NodgesApp };
