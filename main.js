import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createNodes, createEdgeDefinitions, dataFiles, loadNetworkData } from './data.js';
import { Node } from './objects/Node.js';
import { Edge } from './objects/Edge.js';
import { EventManager } from './src/core/EventManager.js';
import { StateManager } from './src/core/StateManager.js';
import { UIManager } from './src/core/UIManager.js';
import { GlowEffect } from './src/effects/GlowEffect.js';
import { HighlightManager } from './src/effects/HighlightManager.js';
import { RaycastManager } from './src/utils/RaycastManager.js';
import { SearchManager } from './src/utils/SearchManager.js';
import { NeighborhoodHighlighter } from './src/utils/NeighborhoodHighlighter.js';
import { EdgeLabelManager } from './src/utils/EdgeLabelManager.js';
import { NodeGroupManager } from './src/utils/NodeGroupManager.js';
import { NetworkAnalyzer } from './src/utils/NetworkAnalyzer.js';
import { PathFinder } from './src/utils/PathFinder.js';
import { PerformanceOptimizer } from './src/utils/PerformanceOptimizer.js';
import { FileHandler } from './src/utils/FileHandler.js';
import { Rollover } from './rollover.js';

// Scene setup
const scene = new THREE.Scene();
let lastTime = 0; // For animation timing
scene.background = new THREE.Color(0xf5f5dc); // Beige background

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(15, 15, 15);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Ground plane for shadows
const groundGeometry = new THREE.PlaneGeometry(40, 40);
const groundMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xfefeee,
    side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.81;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(20, 20, 0xffa500, 0xffa500);
scene.add(gridHelper);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;

// Optimierte Schatten-Einstellungen
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;

scene.add(directionalLight);

// Netzwerk-Verwaltung
let currentNodes = [];
let currentEdges = [];
let currentFilename = '';
let useIcons = false; // Zustand für Icons oder platonische Körper

function clearNetwork() {
    // Clean up node groups
    if (nodeGroupManager) {
        nodeGroupManager.destroy();
    }
    
    currentNodes.forEach(node => {
        scene.remove(node.mesh);
        node.mesh.geometry.dispose();
        node.mesh.material.dispose();
    });
    currentNodes = [];

    currentEdges.forEach(edge => {
        scene.remove(edge.line);
        edge.line.geometry.dispose();
        edge.line.material.dispose();
    });
    currentEdges = [];
    renderer.render(scene, camera); // Szene nach dem Leeren sofort rendern

    // Leere die statischen Caches in Node.js, um Speicherlecks zu vermeiden
    if (Node.geometryCache) {
        Node.geometryCache.forEach(geometry => geometry.dispose());
        Node.geometryCache.clear();
    }
    if (Node.materialCache) {
        Node.materialCache.forEach(material => material.dispose());
        Node.materialCache.clear();
    }
}

// Funktion zum Laden von importierten Netzwerkdaten
async function loadNetworkFromImportedData(networkData, filename) {
    console.log("Loading imported network:", filename);
    currentFilename = filename;
    clearNetwork();

    try {
        // Erstelle Knoten aus importierten Daten
        currentNodes = networkData.nodes.map((nodeData, index) => {
            let nodeType = nodeData.metadata?.type || 'cube';
            let nodeSize = nodeData.metadata?.size || 1.2;
            let nodeColor = nodeData.metadata?.color || 0xff4500;
            
            // Erstelle den Knoten
            const node = new Node(nodeData, {
                type: nodeType,
                size: nodeSize,
                color: nodeColor
            });
            
            // Füge den Knoten zur Szene hinzu
            scene.add(node.mesh);
            return node;
        });

        // Erstelle Kanten aus importierten Daten
        if (networkData.edges && networkData.edges.length > 0) {
            currentEdges = networkData.edges.map((edgeData, index) => {
                // Finde die entsprechenden Node-Objekte
                const startNodeObj = currentNodes.find(n => n.id === edgeData.start.id);
                const endNodeObj = currentNodes.find(n => n.id === edgeData.end.id);
                
                if (!startNodeObj || !endNodeObj) {
                    console.warn("Konnte Start- oder Endknoten nicht finden:", edgeData);
                    return null;
                }
                
                let edgeStyle = edgeData.metadata?.style || 'solid';
                let edgeColor = edgeData.metadata?.color || 0x0000ff;
                
                // Erstelle die Kante
                const edge = new Edge(startNodeObj, endNodeObj, {
                    style: edgeStyle,
                    color: edgeColor,
                    width: 3,
                    curveHeight: edgeData.offset + 2,
                    offset: edgeData.offset,
                    segments: edgeSettings.segments,
                    radius: edgeSettings.thickness,
                    radialSegments: edgeSettings.radialSegments,
                    name: edgeData.name
                });
                
                scene.add(edge.line);
                return edge;
            }).filter(edge => edge !== null);
        } else {
            currentEdges = [];
        }

        // Aktualisiere das Dateiinfo-Panel
        updateFileInfoPanel(
            filename,
            networkData.nodes.length,
            networkData.edges.length,
            "Importiert",
            "Importiert", 
            "Importiert"
        );
        
        console.log("Importiertes Netzwerk erfolgreich geladen:", filename);
        applyNodeFilters();
        
        // Initialisiere Manager mit neuen Daten
        if (searchManager) {
            searchManager.clearSearchResults();
            searchManager.clearHighlights();
        }
        
        if (neighborhoodHighlighter) {
            neighborhoodHighlighter.clearHighlights();
        }
        
        if (edgeLabelManager && currentEdges && currentEdges.length > 0) {
            edgeLabelManager.createLabelsForAllEdges(currentEdges);
        }
        
        if (networkAnalyzer && currentNodes && currentEdges) {
            networkAnalyzer.initialize(currentNodes, currentEdges);
            console.log('Network analysis completed:', networkAnalyzer.getNetworkStatistics());
        }
        
        if (pathFinder && currentNodes && currentEdges) {
            pathFinder.initialize(currentNodes, currentEdges);
        }
        
    } catch (error) {
        console.error("Fehler beim Laden des importierten Netzwerks:", error);
        updateFileInfoPanel(filename, 0, 0, "Fehler", "Fehler", "Fehler");
        throw error;
    }
}

async function loadNetwork(filename) {
    console.log("Loading network:", filename);
    currentFilename = filename; // Speichere den aktuellen Dateinamen
    clearNetwork();

    try {
        // Lade die Netzwerkdaten
        const data = await loadNetworkData(filename);
        if (!data) {
            console.error("Fehler beim Laden der Daten:", filename);
            return;
        }

        // Lade und erstelle neue Knoten mit verschiedenen Formen
        const nodePositions = await createNodes(filename);
        console.log("Nodes loaded:", nodePositions.length);
        
        // Erstelle Knoten mit verschiedenen Formen basierend auf Metadaten
        currentNodes = nodePositions.map((pos, index) => {
            let nodeType = 'cube';
            let nodeSize = 1.2;
            let nodeColor = 0xff4500;
            
            // Verwende Metadaten, falls vorhanden, oder Standardwerte
            if (pos.metadata) {
                nodeType = pos.metadata.type || nodeType;
                nodeSize = pos.metadata.size || nodeSize;
                nodeColor = pos.metadata.color || nodeColor;

                // Logik für Icons basierend auf Geschlecht und Generation
                // Überprüfe, ob data.metadata existiert, bevor auf .type zugegriffen wird
                if (useIcons && data.metadata && data.metadata.type === "family") {
                    if (pos.metadata.gender === "male") {
                        nodeType = 'male_icon';
                        nodeColor = 0xff0000; // Rot für Männer
                    } else if (pos.metadata.gender === "female") {
                        nodeType = 'female_icon';
                        nodeColor = 0x0000ff; // Blau für Frauen
                    } else if (pos.metadata.gender === "nonbinary") {
                        nodeType = 'diverse_icon';
                        nodeColor = 0xffffff; // Weiß für Nonbinäre
                    }

                    // Kinder-Icons kleiner machen (angenommen Y-Koordinate < 5 ist Kind)
                    if (pos.position.y < 5) { 
                        nodeSize = 0.8; 
                    } else {
                        nodeSize = 1.2;
                    }
                } else if (data.metadata && data.metadata.type === "family") {
                    // Standard platonische Körper für Familienstammbaum
                    if (pos.metadata.gender === "male") {
                        nodeType = 'cube';
                        nodeColor = 0xff0000;
                    } else if (pos.metadata.gender === "female") {
                        nodeType = 'dodecahedron';
                        nodeColor = 0x0000ff;
                    } else if (pos.metadata.gender === "nonbinary") {
                        nodeType = 'icosahedron';
                        nodeColor = 0xffffff;
                    }
                }
            }
            
            // Erstelle den Knoten
            const node = new Node(pos, {
                type: nodeType,
                size: nodeSize,
                color: nodeColor
            });
            
            // Füge den Knoten zur Szene hinzu
            scene.add(node.mesh);
            return node;
        });

        // Lade und erstelle neue Kanten mit verschiedenen Stilen
        const edgeDefinitions = await createEdgeDefinitions(filename, nodePositions);
        if (edgeDefinitions && edgeDefinitions.length > 0) {
            console.log("Edges loaded:", edgeDefinitions.length);
            
            currentEdges = edgeDefinitions.map((def, index) => {
                // Finde die entsprechenden Node-Objekte für Start und Ende
                const startNodeObj = currentNodes.find(n => n.id === def.start.id);
                const endNodeObj = currentNodes.find(n => n.id === def.end.id);
                
                if (!startNodeObj || !endNodeObj) {
                    console.warn("Konnte Start- oder Endknoten nicht finden:", def);
                    return null;
                }
                console.log(`Creating edge from node ${startNodeObj.id} at (${startNodeObj.mesh.position.x}, ${startNodeObj.mesh.position.y}, ${startNodeObj.mesh.position.z}) to node ${endNodeObj.id} at (${endNodeObj.mesh.position.x}, ${endNodeObj.mesh.position.y}, ${endNodeObj.mesh.position.z})`);
                
                // Bestimme Kantentyp basierend auf Metadaten oder Index
                let edgeStyle = ['solid', 'dashed', 'dotted'][index % 3];
                let edgeColor = [0x0000ff, 0x00ff00, 0xff0000][index % 3];
                
                // Verwende Typ aus der Definition, falls vorhanden
                if (def.name && def.name.includes('bloodline')) {
                    edgeStyle = 'solid';
                    edgeColor = 0x00ff00; // Grün für Blutsverwandtschaft
                } else if (def.name && def.name.includes('marriage')) {
                    edgeStyle = 'dashed';
                    edgeColor = 0xffa500; // Orange für Ehepartner-Beziehungen
                }
                
                // Erstelle die Kante mit aktuellen Edge-Einstellungen
                const edge = new Edge(startNodeObj, endNodeObj, {
                    style: edgeStyle,
                    color: edgeColor,
                    width: 3,
                    curveHeight: def.offset + 2,
                    offset: def.offset,
                    segments: edgeSettings.segments,
                    radius: edgeSettings.thickness,
                    radialSegments: edgeSettings.radialSegments,
                    name: def.name
                });
                
                // Füge die Kante zur Szene hinzu
                scene.add(edge.line);
                return edge;
            }).filter(edge => edge !== null); // Filtere null-Werte heraus
        } else {
            console.log("Keine Kanten geladen");
            currentEdges = [];
        }

        // Bestimme Achsenbeschreibungen basierend auf der Datei
        let xAxis = "unbekannt";
        let yAxis = "unbekannt";
        let zAxis = "unbekannt";

        // Spezifische Achsenbeschreibungen für bestimmte Dateien
        if (filename === "architektur.json") {
            xAxis = "Fortschreitender Ladevorgang";
            yAxis = "Art der Komponente";
            zAxis = "Tiefe";
        } else if (filename.includes("family") || filename.includes("Iglesias")) {
            xAxis = "Horizontale Position";
            yAxis = "Generation";
            zAxis = "Tiefe";
        }

        // Aktualisiere das Dateiinfo-Panel
        updateFileInfoPanel(
            filename, 
            nodePositions.length, 
            edgeDefinitions ? edgeDefinitions.length : 0, 
            xAxis, 
            yAxis, 
            zAxis
        );
        
        console.log("Netzwerk erfolgreich geladen:", filename);
        applyNodeFilters(); // Filter nach dem Laden des Netzwerks anwenden
        
        // Clear any existing search results when loading a new network
        if (searchManager) {
            searchManager.clearSearchResults();
            searchManager.clearHighlights();
        }
        
        // Clear neighborhood highlights when loading a new network
        if (neighborhoodHighlighter) {
            neighborhoodHighlighter.clearHighlights();
        }
        
        // Create edge labels for the new network
        if (edgeLabelManager && currentEdges && currentEdges.length > 0) {
            edgeLabelManager.createLabelsForAllEdges(currentEdges);
        }
        
        // Initialize network analyzer with new data
        if (networkAnalyzer && currentNodes && currentEdges) {
            networkAnalyzer.initialize(currentNodes, currentEdges);
            console.log('Network analysis completed:', networkAnalyzer.getNetworkStatistics());
        }
        
        // Initialize path finder with new data
        if (pathFinder && currentNodes && currentEdges) {
            pathFinder.initialize(currentNodes, currentEdges);
        }
        
    } catch (error) {
        console.error("Fehler beim Laden des Netzwerks:", error);
        // Zeige Fehlermeldung im Dateiinfo-Panel
        updateFileInfoPanel(filename, 0, 0, "Fehler", "Fehler", "Fehler");
    }
}

function updateFileInfoPanel(filename, nodeCount, edgeCount, xAxis, yAxis, zAxis) {
    document.getElementById('fileFilename').textContent = `Dateiname: ${filename}`;
    document.getElementById('fileNodeCount').textContent = `Anzahl Knoten: ${nodeCount}`;
    document.getElementById('fileEdgeCount').textContent = `Anzahl Kanten: ${edgeCount}`;
    document.getElementById('fileXAxis').textContent = `X-Achse: ${xAxis}`;
    document.getElementById('fileYAxis').textContent = `Y-Achse: ${yAxis}`;
    document.getElementById('fileZAxis').textContent = `Z-Achse: ${zAxis}`;
}

// Initialisiere Manager
const stateManager = new StateManager();
const eventManager = new EventManager();
const uiManager = new UIManager(stateManager);
const glowEffect = new GlowEffect();
const highlightManager = new HighlightManager(stateManager, glowEffect);
const raycastManager = new RaycastManager(camera, scene, renderer);

// Initialisiere Rollover
const rollover = new Rollover(camera, scene, renderer);

// Initialisiere SearchManager
const searchManager = new SearchManager(scene, camera, stateManager);

// Initialisiere NeighborhoodHighlighter
const neighborhoodHighlighter = new NeighborhoodHighlighter(scene, stateManager);

// Initialisiere EdgeLabelManager
const edgeLabelManager = new EdgeLabelManager(scene, camera);

// Initialisiere NodeGroupManager
const nodeGroupManager = new NodeGroupManager(scene, stateManager);

// Initialisiere NetworkAnalyzer
const networkAnalyzer = new NetworkAnalyzer();

// Initialisiere PathFinder
const pathFinder = new PathFinder(scene, stateManager);

// Initialisiere PerformanceOptimizer
const performanceOptimizer = new PerformanceOptimizer(scene, camera, renderer);

// Initialisiere FileHandler
const fileHandler = new FileHandler(loadNetworkFromImportedData);
 
// Initialisiere Event-System
eventManager.init(camera, scene, renderer);

// Starte Animation-Loop des StateManagers
stateManager.animate();

// lil-gui Initialisierung
const gui = new lil.GUI();
gui.title('Einstellungen'); // Titel anpassen
gui.domElement.style.position = 'absolute';
gui.domElement.style.top = '20px';
gui.domElement.style.right = '20px';

// Ordner erstellen
const dataFolder = gui.addFolder('Daten');
const importExportFolder = gui.addFolder('Import/Export');
const filterFolder = gui.addFolder('Filter');
const viewFolder = gui.addFolder('Ansicht');
const analysisFolder = gui.addFolder('Analyse');
const groupsFolder = gui.addFolder('Gruppen');

const neighborhoodSettings = {
    enabled: false,
    hops: 1,
    dimOthers: true,
    highlightNeighborhood: function() {
        const selectedObject = stateManager.state.selectedObject;
        if (selectedObject && selectedObject.userData && selectedObject.userData.type === 'node') {
            const node = selectedObject.userData.node;
            if (node) {
                neighborhoodHighlighter.highlightNeighborhood(node, this.hops, this.dimOthers);
            }
        } else {
            alert('Bitte zuerst einen Knoten auswählen');
        }
    },
    clearHighlights: function() {
        neighborhoodHighlighter.clearHighlights();
    }
};

const edgeLabelSettings = {
    visible: true,
    alwaysVisible: false,
    fontSize: 0.3,
    distanceThreshold: 15,
    refreshLabels: function() {
        edgeLabelManager.updateConfig({
            visible: this.visible,
            alwaysVisible: this.alwaysVisible,
            fontSize: this.fontSize,
            distanceThreshold: this.distanceThreshold
        });
        
        if (currentEdges && currentEdges.length > 0) {
            edgeLabelManager.createLabelsForAllEdges(currentEdges);
        }
    }
};

const filterSettings = {
    showMale: true,
    showFemale: true,
    showNonbinary: true
};

// Import/Export Settings
const importExportSettings = {
    exportFormat: 'json',
    exportFilename: 'network_export',
    includeVisualizationState: false,
    
    importFile: function() {
        fileHandler.openImportDialog();
    },
    
    exportNetwork: function() {
        const filename = this.exportFilename + '.' + this.exportFormat;
        fileHandler.exportNetwork(
            currentNodes, 
            currentEdges, 
            this.exportFormat, 
            filename,
            {
                includeVisualizationState: this.includeVisualizationState
            }
        );
    },
    
    exportVisualization: function() {
        const filename = this.exportFilename + '.png';
        fileHandler.exportNetwork(
            currentNodes,
            currentEdges,
            'png',
            filename,
            { scale: 2 }
        );
    }
};

// Füge Import/Export-Steuerelemente hinzu
importExportFolder.add(importExportSettings, 'importFile').name('📁 Datei importieren');
importExportFolder.add(importExportSettings, 'exportFormat', ['json', 'csv', 'gexf', 'graphml']).name('Export-Format');
importExportFolder.add(importExportSettings, 'exportFilename').name('Dateiname');
importExportFolder.add(importExportSettings, 'includeVisualizationState').name('Visualisierungszustand');
importExportFolder.add(importExportSettings, 'exportNetwork').name('💾 Netzwerk exportieren');
importExportFolder.add(importExportSettings, 'exportVisualization').name('📸 Bild exportieren');

filterFolder.add(filterSettings, 'showMale').name('Männlich').onChange(applyNodeFilters);
filterFolder.add(filterSettings, 'showFemale').name('Weiblich').onChange(applyNodeFilters);
filterFolder.add(filterSettings, 'showNonbinary').name('Non-Binary').onChange(applyNodeFilters);

function applyNodeFilters() {
    currentNodes.forEach(node => {
        if (node.metadata && node.metadata.gender) {
            let visible = false;
            if (node.metadata.gender === 'male' && filterSettings.showMale) {
                visible = true;
            } else if (node.metadata.gender === 'female' && filterSettings.showFemale) {
                visible = true;
            } else if (node.metadata.gender === 'nonbinary' && filterSettings.showNonbinary) {
                visible = true;
            }
            node.mesh.visible = visible;
        } else {
            // Wenn keine Geschlechtsmetadaten vorhanden sind, immer sichtbar lassen
            node.mesh.visible = true;
        }
    });
}

// View Settings für lil-gui
const viewSettings = {
    toggleIcons: useIcons // Initialer Zustand
};

viewFolder.add(viewSettings, 'toggleIcons').name('Icons umschalten').onChange(value => {
    useIcons = value;
    // Die HTML-Checkbox wird jetzt vom Event-Listener der HTML-Checkbox aktualisiert
    if (currentFilename) {
        loadNetwork(currentFilename);
    }
});

// Synchronisiere lil-gui mit der HTML-Checkbox, wenn die HTML-Checkbox geändert wird
document.getElementById('toggleIcons').addEventListener('change', (event) => {
    useIcons = event.target.checked;
    viewSettings.toggleIcons = useIcons;
    viewFolder.controllersRecursive().find(c => c.property === 'toggleIcons').updateDisplay();
    if (currentFilename) {
        loadNetwork(currentFilename);
    }
});

// Füge Nachbarschaftshervorhebung zum Analyseordner hinzu
analysisFolder.add(neighborhoodSettings, 'hops', 1, 3, 1).name('Nachbarschaftstiefe');
analysisFolder.add(neighborhoodSettings, 'dimOthers').name('Andere ausblenden');
analysisFolder.add(neighborhoodSettings, 'highlightNeighborhood').name('Nachbarschaft hervorheben');
analysisFolder.add(neighborhoodSettings, 'clearHighlights').name('Hervorhebung aufheben');

// Erweiterte Kanten-Konfiguration
const edgeSettings = {
    // Darstellungseinstellungen
    segments: 10,           // Aktuelle Anzahl entspricht 100%
    thickness: 0.4,         // 80% der aktuellen Dicke (0.5 * 0.8 = 0.4)
    radialSegments: 3,      // Anzahl Segmente im Querschnitt
    
    // Funktionen zum Aktualisieren der Edges
    updateEdgeGeometry: function() {
        if (currentEdges && currentEdges.length > 0) {
            currentEdges.forEach(edge => {
                if (edge.userData && edge.userData.edge) {
                    const edgeObj = edge.userData.edge;
                    
                    // Verwende die neue updateGeometry Methode der Edge-Klasse
                    edgeObj.updateGeometry({
                        segments: this.segments,
                        radius: this.thickness,
                        radialSegments: this.radialSegments
                    });
                }
            });
            
            console.log(`Edge-Geometrie aktualisiert: ${this.segments} Segmente, ${this.thickness} Dicke, ${this.radialSegments} Querschnitt-Segmente`);
        }
    }
};

// Füge Kanten-Hauptordner zum Analyseordner hinzu
const edgesFolder = analysisFolder.addFolder('Kanten');

// Unterordner: Kantenbeschriftungen
const edgeLabelsFolder = edgesFolder.addFolder('Kantenbeschriftungen');
edgeLabelsFolder.add(edgeLabelSettings, 'visible').name('Beschriftungen anzeigen').onChange(() => edgeLabelSettings.refreshLabels());
edgeLabelsFolder.add(edgeLabelSettings, 'alwaysVisible').name('Immer sichtbar').onChange(() => edgeLabelSettings.refreshLabels());
edgeLabelsFolder.add(edgeLabelSettings, 'fontSize', 0.1, 1.0, 0.1).name('Schriftgröße').onChange(() => edgeLabelSettings.refreshLabels());
edgeLabelsFolder.add(edgeLabelSettings, 'distanceThreshold', 5, 50, 1).name('Sichtweite').onChange(() => edgeLabelSettings.refreshLabels());
edgeLabelsFolder.add(edgeLabelSettings, 'refreshLabels').name('Aktualisieren');

// Unterordner: Darstellung
const edgeDisplayFolder = edgesFolder.addFolder('Darstellung');
edgeDisplayFolder.add(edgeSettings, 'segments', 3, 30, 1).name('Segmente').onChange(() => edgeSettings.updateEdgeGeometry());
edgeDisplayFolder.add(edgeSettings, 'thickness', 0.1, 1.0, 0.05).name('Dicke').onChange(() => edgeSettings.updateEdgeGeometry());
edgeDisplayFolder.add(edgeSettings, 'radialSegments', 3, 12, 1).name('Querschnitt-Segmente').onChange(() => edgeSettings.updateEdgeGeometry());

// Network Analysis Settings
const networkAnalysisSettings = {
    showMetrics: false,
    selectedNodeId: '',
    centralityType: 'degree',
    topNodesCount: 5,
    
    showNetworkStats: function() {
        const stats = networkAnalyzer.getNetworkStatistics();
        const statsText = `
Netzwerk-Statistiken:
- Knoten: ${stats.nodeCount}
- Kanten: ${stats.edgeCount}
- Dichte: ${stats.density?.toFixed(3) || 'N/A'}
- Durchschnittlicher Grad: ${stats.averageDegree?.toFixed(2) || 'N/A'}
- Max. Grad: ${stats.maxDegree || 'N/A'}
- Min. Grad: ${stats.minDegree || 'N/A'}
- Durchschn. Clustering: ${stats.averageClusteringCoefficient?.toFixed(3) || 'N/A'}
- Durchmesser: ${stats.diameter || 'N/A'}
- Radius: ${stats.radius || 'N/A'}`;
        alert(statsText);
    },
    
    showNodeMetrics: function() {
        const selectedObject = stateManager.state.selectedObject;
        if (selectedObject && selectedObject.userData && selectedObject.userData.type === 'node') {
            const node = selectedObject.userData.node;
            if (node) {
                const metrics = networkAnalyzer.getNodeMetrics(node.id);
                const metricsText = `
Knoten-Metriken für "${node.mesh.name}":
- Grad: ${metrics.degree || 'N/A'}
- Betweenness Centrality: ${metrics.betweennessCentrality?.toFixed(4) || 'N/A'}
- Closeness Centrality: ${metrics.closenessCentrality?.toFixed(4) || 'N/A'}
- Clustering Coefficient: ${metrics.clusteringCoefficient?.toFixed(4) || 'N/A'}
- Exzentrizität: ${metrics.eccentricity || 'N/A'}`;
                alert(metricsText);
            }
        } else {
            alert('Bitte zuerst einen Knoten auswählen');
        }
    },
    
    showTopCentralNodes: function() {
        try {
            const topNodes = networkAnalyzer.getTopCentralNodes(this.centralityType, this.topNodesCount);
            let resultText = `Top ${this.topNodesCount} Knoten nach ${this.centralityType}:\n\n`;
            
            topNodes.forEach((item, index) => {
                const node = currentNodes.find(n => n.id === item.nodeId);
                const nodeName = node ? node.mesh.name : `Node ${item.nodeId}`;
                resultText += `${index + 1}. ${nodeName}: ${item.value.toFixed(4)}\n`;
            });
            
            alert(resultText);
        } catch (error) {
            alert('Fehler beim Berechnen der Zentralitätsmaße: ' + error.message);
        }
    },
    
    detectCommunities: function() {
        const communities = networkAnalyzer.detectCommunities();
        let resultText = `Gefundene Communities: ${communities.length}\n\n`;
        
        communities.forEach((community, index) => {
            resultText += `Community ${index + 1} (${community.size} Knoten):\n`;
            community.members.forEach(nodeId => {
                const node = currentNodes.find(n => n.id === nodeId);
                const nodeName = node ? node.mesh.name : `Node ${nodeId}`;
                resultText += `  - ${nodeName}\n`;
            });
            resultText += '\n';
        });
        
        alert(resultText);
    }
};

// Füge Netzwerkanalyse zum Analyseordner hinzu
const networkAnalysisFolder = analysisFolder.addFolder('Netzwerkanalyse');
networkAnalysisFolder.add(networkAnalysisSettings, 'showNetworkStats').name('Netzwerk-Statistiken');
networkAnalysisFolder.add(networkAnalysisSettings, 'showNodeMetrics').name('Knoten-Metriken');
networkAnalysisFolder.add(networkAnalysisSettings, 'centralityType', ['degree', 'betweennessCentrality', 'closenessCentrality']).name('Zentralitätstyp');
networkAnalysisFolder.add(networkAnalysisSettings, 'topNodesCount', 1, 20, 1).name('Anzahl Top-Knoten');
networkAnalysisFolder.add(networkAnalysisSettings, 'showTopCentralNodes').name('Top-Knoten anzeigen');
networkAnalysisFolder.add(networkAnalysisSettings, 'detectCommunities').name('Communities erkennen');

// Path Finding Settings
const pathFindingSettings = {
    startNodeSet: false,
    endNodeSet: false,
    pathExists: false,
    animationActive: false,
    animationSpeed: 1.0,
    
    setStartNode: function() {
        const selectedObject = stateManager.state.selectedObject;
        if (selectedObject && selectedObject.userData && selectedObject.userData.type === 'node') {
            const node = selectedObject.userData.node;
            if (node) {
                pathFinder.setStartNode(node);
                this.startNodeSet = true;
                this.updatePathInfo();
                alert(`Startknoten gesetzt: ${node.mesh.name}`);
            }
        } else {
            alert('Bitte zuerst einen Knoten auswählen');
        }
    },
    
    setEndNode: function() {
        const selectedObject = stateManager.state.selectedObject;
        if (selectedObject && selectedObject.userData && selectedObject.userData.type === 'node') {
            const node = selectedObject.userData.node;
            if (node) {
                pathFinder.setEndNode(node);
                this.endNodeSet = true;
                this.updatePathInfo();
                alert(`Zielknoten gesetzt: ${node.mesh.name}`);
            }
        } else {
            alert('Bitte zuerst einen Knoten auswählen');
        }
    },
    
    findPath: function() {
        if (pathFinder.startNode && pathFinder.endNode) {
            pathFinder.updatePathVisualization();
            this.updatePathInfo();
            
            const pathInfo = pathFinder.getPathInfo();
            if (pathInfo.exists) {
                alert(`Pfad gefunden!\nLänge: ${pathInfo.length} Knoten\nDistanz: ${pathInfo.totalDistance}`);
            } else {
                alert('Kein Pfad zwischen den Knoten gefunden.');
            }
        } else {
            alert('Bitte zuerst Start- und Zielknoten setzen');
        }
    },
    
    clearPath: function() {
        pathFinder.clearPath();
        this.startNodeSet = false;
        this.endNodeSet = false;
        this.pathExists = false;
        this.updatePathInfo();
    },
    
    showPathInfo: function() {
        const pathInfo = pathFinder.getPathInfo();
        if (pathInfo.exists) {
            let infoText = `Pfad-Information:\n`;
            infoText += `Länge: ${pathInfo.length} Knoten\n`;
            infoText += `Distanz: ${pathInfo.totalDistance}\n\n`;
            infoText += `Pfad:\n`;
            pathInfo.nodes.forEach((node, index) => {
                infoText += `${index + 1}. ${node.name}\n`;
            });
            alert(infoText);
        } else {
            alert('Kein aktiver Pfad vorhanden');
        }
    },
    
    updatePathInfo: function() {
        const pathInfo = pathFinder.getPathInfo();
        this.pathExists = pathInfo.exists;
    },
    
    toggleAnimation: function() {
        this.animationActive = !this.animationActive;
        pathFinder.setAnimationSettings({ 
            active: this.animationActive,
            speed: this.animationSpeed 
        });
    }
};

// Füge Pfadfindung zum Analyseordner hinzu
const pathFindingFolder = analysisFolder.addFolder('Pfadfindung');
pathFindingFolder.add(pathFindingSettings, 'setStartNode').name('Startknoten setzen');
pathFindingFolder.add(pathFindingSettings, 'setEndNode').name('Zielknoten setzen');
pathFindingFolder.add(pathFindingSettings, 'findPath').name('Pfad finden');
pathFindingFolder.add(pathFindingSettings, 'clearPath').name('Pfad löschen');
pathFindingFolder.add(pathFindingSettings, 'showPathInfo').name('Pfad-Info anzeigen');
pathFindingFolder.add(pathFindingSettings, 'animationSpeed', 0.1, 3.0, 0.1).name('Animationsgeschw.').onChange((value) => {
    pathFinder.setAnimationSettings({ speed: value });
});
pathFindingFolder.add(pathFindingSettings, 'toggleAnimation').name('Animation umschalten');

// Node grouping settings
const groupSettings = {
    currentGroupId: null,
    groupName: 'Neue Gruppe',
    groupColor: '#ff0000',
    outlineEnabled: true,
    outlineThickness: 0.05,
    
    createGroup: function() {
        const colorHex = parseInt(this.groupColor.replace('#', '0x'));
        const groupId = nodeGroupManager.createGroup({
            name: this.groupName,
            color: colorHex,
            outline: {
                enabled: this.outlineEnabled,
                thickness: this.outlineThickness,
                color: colorHex
            }
        });
        
        this.currentGroupId = groupId;
        this.updateGroupsList();
        return groupId;
    },
    
    addSelectedNodeToGroup: function() {
        if (!this.currentGroupId) {
            alert('Bitte zuerst eine Gruppe erstellen oder auswählen');
            return;
        }
        
        const selectedObject = stateManager.state.selectedObject;
        if (selectedObject && selectedObject.userData && selectedObject.userData.type === 'node') {
            const node = selectedObject.userData.node;
            if (node) {
                nodeGroupManager.addNodeToGroup(node, this.currentGroupId);
            }
        } else {
            alert('Bitte zuerst einen Knoten auswählen');
        }
    },
    
    removeSelectedNodeFromGroup: function() {
        const selectedObject = stateManager.state.selectedObject;
        if (selectedObject && selectedObject.userData && selectedObject.userData.type === 'node') {
            const node = selectedObject.userData.node;
            if (node) {
                nodeGroupManager.removeNodeFromGroup(node);
            }
        } else {
            alert('Bitte zuerst einen Knoten auswählen');
        }
    },
    
    updateGroup: function() {
        if (!this.currentGroupId) {
            alert('Bitte zuerst eine Gruppe erstellen oder auswählen');
            return;
        }
        
        const colorHex = parseInt(this.groupColor.replace('#', '0x'));
        nodeGroupManager.updateGroup(this.currentGroupId, {
            name: this.groupName,
            color: colorHex,
            outline: {
                enabled: this.outlineEnabled,
                thickness: this.outlineThickness,
                color: colorHex
            }
        });
    },
    
    deleteGroup: function() {
        if (!this.currentGroupId) {
            alert('Bitte zuerst eine Gruppe auswählen');
            return;
        }
        
        nodeGroupManager.deleteGroup(this.currentGroupId);
        this.currentGroupId = null;
        this.updateGroupsList();
    },
    
    updateGroupsList: function() {
        // This would update a dropdown of groups in a more complete UI
        // For now, we'll just log the groups
        console.log('Available groups:', nodeGroupManager.getAllGroups());
    },
    
    selectNodesByProperty: function() {
        // Get property name and value from prompt
        const property = prompt('Eigenschaftsname eingeben (z.B. "gender"):');
        if (!property) return;
        
        const value = prompt(`Wert für ${property} eingeben (z.B. "male"):`);
        if (!value) return;
        
        // Create a new group if none is selected
        let groupId = this.currentGroupId;
        if (!groupId) {
            groupId = this.createGroup();
        }
        
        // Find all nodes with the matching property and add them to the group
        let matchCount = 0;
        
        currentNodes.forEach(node => {
            if (node.metadata && node.metadata[property] === value) {
                nodeGroupManager.addNodeToGroup(node, groupId);
                matchCount++;
            }
        });
        
        alert(`${matchCount} Knoten zur Gruppe hinzugefügt`);
    }
};

// Add group controls to the groups folder
groupsFolder.add(groupSettings, 'groupName').name('Gruppenname');
groupsFolder.addColor(groupSettings, 'groupColor').name('Gruppenfarbe');
groupsFolder.add(groupSettings, 'outlineEnabled').name('Umriss anzeigen');
groupsFolder.add(groupSettings, 'outlineThickness', 0.01, 0.2).name('Umrissdicke');
groupsFolder.add(groupSettings, 'createGroup').name('Gruppe erstellen');
groupsFolder.add(groupSettings, 'addSelectedNodeToGroup').name('Knoten hinzufügen');
groupsFolder.add(groupSettings, 'removeSelectedNodeFromGroup').name('Knoten entfernen');
groupsFolder.add(groupSettings, 'updateGroup').name('Gruppe aktualisieren');
groupsFolder.add(groupSettings, 'deleteGroup').name('Gruppe löschen');
groupsFolder.add(groupSettings, 'selectNodesByProperty').name('Nach Eigenschaft gruppieren');

// Performance Settings
const performanceSettings = {
    enableLOD: true,
    enableFrustumCulling: true,
    maxVisibleNodes: 1000,
    maxVisibleEdges: 2000,
    autoOptimize: false,
    
    showPerformanceStats: function() {
        const stats = performanceOptimizer.getPerformanceStats();
        const statsText = `
Performance-Statistiken:
- FPS: ${stats.fps}
- Frame Time: ${stats.frameTime?.toFixed(2) || 'N/A'} ms
- Sichtbare Knoten: ${stats.visibleNodes}
- Ausgeblendete Knoten: ${stats.culledNodes}
- Sichtbare Kanten: ${stats.visibleEdges}
- Ausgeblendete Kanten: ${stats.culledEdges}
- Render Calls: ${stats.renderCalls}
- Dreiecke: ${stats.triangles}
- Geometrien: ${stats.geometries}
- Texturen: ${stats.textures}
- Speicher: ${stats.memoryUsage.used}/${stats.memoryUsage.total} MB`;
        alert(statsText);
    },
    
    showRecommendations: function() {
        const recommendations = performanceOptimizer.getOptimizationRecommendations();
        const recText = 'Optimierungsempfehlungen:\n\n' + recommendations.join('\n');
        alert(recText);
    },
    
    applyAutoOptimization: function() {
        performanceOptimizer.autoOptimize();
        alert('Automatische Optimierung angewendet');
    },
    
    resetOptimizations: function() {
        performanceOptimizer.resetOptimizations(currentNodes, currentEdges);
        alert('Optimierungen zurückgesetzt');
    },
    
    updateSettings: function() {
        performanceOptimizer.updateSettings({
            enableLOD: this.enableLOD,
            enableFrustumCulling: this.enableFrustumCulling,
            maxVisibleNodes: this.maxVisibleNodes,
            maxVisibleEdges: this.maxVisibleEdges
        });
    }
};

// Füge Performance-Einstellungen hinzu
const performanceFolder = gui.addFolder('Performance');
performanceFolder.add(performanceSettings, 'enableLOD').name('Level of Detail').onChange(() => performanceSettings.updateSettings());
performanceFolder.add(performanceSettings, 'enableFrustumCulling').name('Frustum Culling').onChange(() => performanceSettings.updateSettings());
performanceFolder.add(performanceSettings, 'maxVisibleNodes', 100, 5000, 100).name('Max. sichtbare Knoten').onChange(() => performanceSettings.updateSettings());
performanceFolder.add(performanceSettings, 'maxVisibleEdges', 200, 10000, 200).name('Max. sichtbare Kanten').onChange(() => performanceSettings.updateSettings());
performanceFolder.add(performanceSettings, 'showPerformanceStats').name('Performance-Stats');
performanceFolder.add(performanceSettings, 'showRecommendations').name('Empfehlungen');
performanceFolder.add(performanceSettings, 'applyAutoOptimization').name('Auto-Optimierung');
performanceFolder.add(performanceSettings, 'resetOptimizations').name('Zurücksetzen');

// Button Event-Handler (bleiben im linken Menü)
document.getElementById('smallData').addEventListener('click', () => loadNetwork(dataFiles.small));
document.getElementById('mediumData').addEventListener('click', () => loadNetwork(dataFiles.medium));
document.getElementById('largeData').addEventListener('click', () => loadNetwork(dataFiles.large));
document.getElementById('megaData').addEventListener('click', () => loadNetwork(dataFiles.mega));
document.getElementById('familyData').addEventListener('click', () => loadNetwork(dataFiles.family));
document.getElementById('architektur').addEventListener('click', () => loadNetwork(dataFiles.architektur));
document.getElementById('royalFamilyData').addEventListener('click', () => loadNetwork(dataFiles.royalFamily));

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Update TWEEN animations if available
    if (window.TWEEN) {
        TWEEN.update();
    }
    
    // Update edge labels
    if (edgeLabelManager) {
        edgeLabelManager.update();
    }
    
    // Update node group outlines
    if (nodeGroupManager) {
        nodeGroupManager.updateOutlines();
    }
    
    // Update performance optimizations
    if (performanceOptimizer && currentNodes && currentEdges) {
        performanceOptimizer.update(currentNodes, currentEdges);
    }
    
    // Update animated edges
    const time = performance.now() / 1000;
    const deltaTime = time - (lastTime || time);
    lastTime = time;
    
    scene.traverse((object) => {
        if (object.userData && object.userData.type === 'edge' && object.userData.edge) {
            const edge = object.userData.edge;
            if (edge.animationActive) {
                edge.update(deltaTime);
            }
        }
    });
    
    renderer.render(scene, camera);
}
animate();

// Window resize handler
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Lade initial das kleine Netzwerk
loadNetwork(dataFiles.small);
