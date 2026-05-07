// NodgesFree - 3D System Explorer
// Eine verbesserte Version des Nodges-Projekts

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================================================
// KONSTANTEN
// ============================================================================

const DEFAULT_COLORS = {
    node: 0x00d4ff,
    edge: 0x7b2cbf,
    highlight: 0xff6b6b,
    background: 0x0a0a0f,
    ambient: 0x404060,
    grid: 0x2a2a4a
};

const NODE_GEOMETRIES = {
    sphere: () => new THREE.SphereGeometry(1, 32, 32),
    box: () => new THREE.BoxGeometry(1.5, 1.5, 1.5),
    octahedron: () => new THREE.OctahedronGeometry(1.2),
    icosahedron: () => new THREE.IcosahedronGeometry(1.1),
    torus: () => new THREE.TorusGeometry(0.8, 0.3, 16, 32),
    cone: () => new THREE.ConeGeometry(0.8, 1.5, 8)
};

const TYPE_COLORS = {
    'stern': 0xffcc00,
    'planet': 0x4a90d9,
    'mond': 0x888888,
    'zwergplanet': 0xaa77cc,
    'organ': 0x55E6C1,
    'nerv': 0x0984E3,
    'ganglion': 0xD63031,
    'zns': 0x74B9FF,
    'default': 0x00d4ff
};

// ============================================================================
// KLASSE: NodgesFreeEngine
// ============================================================================

class NodgesFreeEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();
        
        this.nodes = new Map();
        this.edges = [];
        this.labels = new Map();
        this.nodeGroup = null;
        this.edgeGroup = null;
        this.labelGroup = null;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.selectedNode = null;
        this.hoveredNode = null;
        
        this.settings = {
            showEdges: true,
            showLabels: true,
            autoRotate: true,
            animationEnabled: true
        };
        
        this.processes = [];
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupControls();
        this.setupGroups();
        this.setupEventListeners();
        this.animate();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(DEFAULT_COLORS.background);
        this.scene.fog = new THREE.FogExp2(DEFAULT_COLORS.background, 0.002);
        
        // Grid Helper
        const gridHelper = new THREE.GridHelper(200, 50, DEFAULT_COLORS.grid, DEFAULT_COLORS.grid);
        gridHelper.position.y = -50;
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
        
        // Ambient particles
        this.createAmbientParticles();
    }
    
    createAmbientParticles() {
        const geometry = new THREE.BufferGeometry();
        const count = 1000;
        const positions = new Float32Array(count * 3);
        
        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 400;
            positions[i + 1] = (Math.random() - 0.5) * 400;
            positions[i + 2] = (Math.random() - 0.5) * 400;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x444466,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
    }
    
    setupCamera() {
        const container = document.getElementById('canvas-container');
        const aspect = container.clientWidth / container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 2000);
        this.camera.position.set(0, 50, 150);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupRenderer() {
        const container = document.getElementById('canvas-container');
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: true,
            alpha: true
        });
        
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    setupLights() {
        const ambientLight = new THREE.AmbientLight(DEFAULT_COLORS.ambient, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        const pointLight1 = new THREE.PointLight(0x00d4ff, 0.5, 200);
        pointLight1.position.set(-50, 50, 50);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x7b2cbf, 0.3, 200);
        pointLight2.position.set(50, -50, -50);
        this.scene.add(pointLight2);
    }
    
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 500;
        this.controls.autoRotate = this.settings.autoRotate;
        this.controls.autoRotateSpeed = 0.5;
    }
    
    setupGroups() {
        this.nodeGroup = new THREE.Group();
        this.edgeGroup = new THREE.Group();
        this.labelGroup = new THREE.Group();
        
        this.scene.add(this.nodeGroup);
        this.scene.add(this.edgeGroup);
        this.scene.add(this.labelGroup);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        
        const canvas = document.getElementById('canvas');
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('click', (e) => this.onClick(e));
        
        // UI Controls
        document.getElementById('btn-reset').addEventListener('click', () => this.resetView());
        document.getElementById('btn-animate').addEventListener('click', () => this.toggleAnimation());
        document.getElementById('btn-load').addEventListener('change', (e) => {
            const value = e.target.value;
            if (value === 'demo') {
                this.generateDemoData();
            } else if (value) {
                this.loadDataFile(value);
            }
        });
        
        document.getElementById('btn-zoom-in').addEventListener('click', () => this.zoomIn());
        document.getElementById('btn-zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('btn-reset-view').addEventListener('click', () => this.resetView());
        
        document.getElementById('ctrl-auto-rotate').addEventListener('change', (e) => {
            this.controls.autoRotate = e.target.checked;
        });
        
        document.getElementById('ctrl-show-edges').addEventListener('change', (e) => {
            this.settings.showEdges = e.target.checked;
            this.edgeGroup.visible = e.target.checked;
        });
        
        document.getElementById('ctrl-show-labels').addEventListener('change', (e) => {
            this.settings.showLabels = e.target.checked;
            this.labelGroup.visible = e.target.checked;
        });
        
        document.getElementById('ctrl-zoom').addEventListener('input', (e) => {
            const zoom = parseFloat(e.target.value);
            this.camera.position.multiplyScalar(zoom);
        });
    }
    
    onResize() {
        const container = document.getElementById('canvas-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    onMouseMove(event) {
        const rect = event.target.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.checkIntersections();
        this.updateHoverInfo(event);
    }
    
    onClick(event) {
        if (this.hoveredNode) {
            this.selectNode(this.hoveredNode);
        } else {
            this.deselectNode();
        }
    }
    
    checkIntersections() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodeGroup.children, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            const nodeData = object.userData.nodeData;
            
            if (nodeData) {
                this.hoveredNode = nodeData;
                document.body.style.cursor = 'pointer';
            }
        } else {
            this.hoveredNode = null;
            document.body.style.cursor = 'default';
        }
    }
    
    updateHoverInfo(event) {
        const hoverInfo = document.getElementById('hover-info');
        
        if (this.hoveredNode) {
            const node = this.hoveredNode;
            
            document.getElementById('hover-title').textContent = node.label || node.id;
            
            const propsDiv = document.getElementById('hover-props');
            propsDiv.innerHTML = '';
            
            // Type
            const typeProp = document.createElement('div');
            typeProp.className = 'prop';
            typeProp.innerHTML = `Typ: <span>${node.type}</span>`;
            propsDiv.appendChild(typeProp);
            
            // Position
            if (node.position) {
                const posProp = document.createElement('div');
                posProp.className = 'prop';
                posProp.innerHTML = `Position: <span>${node.position.x.toFixed(1)}, ${node.position.y.toFixed(1)}, ${node.position.z.toFixed(1)}</span>`;
                propsDiv.appendChild(posProp);
            }
            
            // Custom properties
            for (const [key, value] of Object.entries(node)) {
                if (key !== 'id' && key !== 'type' && key !== 'label' && key !== 'position' && key !== 'userData') {
                    if (typeof value === 'string' || typeof value === 'number') {
                        const prop = document.createElement('div');
                        prop.className = 'prop';
                        prop.innerHTML = `${key}: <span>${value}</span>`;
                        propsDiv.appendChild(prop);
                    }
                }
            }
            
            hoverInfo.style.left = `${event.clientX + 15}px`;
            hoverInfo.style.top = `${event.clientY + 15}px`;
            hoverInfo.classList.add('visible');
        } else {
            hoverInfo.classList.remove('visible');
        }
    }
    
    selectNode(nodeData) {
        this.selectedNode = nodeData;
        
        // Update sidebar selection
        document.querySelectorAll('.entity-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.id === nodeData.id) {
                item.classList.add('selected');
            }
        });
        
        // Highlight node
        const mesh = this.nodes.get(nodeData.id);
        if (mesh) {
            mesh.material.emissive = new THREE.Color(DEFAULT_COLORS.highlight);
            mesh.material.emissiveIntensity = 0.5;
        }
    }
    
    deselectNode() {
        if (this.selectedNode) {
            const mesh = this.nodes.get(this.selectedNode.id);
            if (mesh) {
                mesh.material.emissive = new THREE.Color(0x000000);
                mesh.material.emissiveIntensity = 0;
            }
        }
        this.selectedNode = null;
        
        document.querySelectorAll('.entity-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
    
    // ============================================================================
    // DATENLADEN
    // ============================================================================
    
    async loadDataFile(filename) {
        document.getElementById('loading').classList.remove('hidden');
        
        try {
            const response = await fetch(`./data/${filename}.json`);
            if (!response.ok) throw new Error('File not found');
            const data = await response.json();
            this.loadGraphData(data);
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to generated demo
            this.generateDemoData();
        }
        
        document.getElementById('loading').classList.add('hidden');
    }
    
    async loadDemoData() {
        document.getElementById('loading').classList.remove('hidden');
        
        try {
            // Load Sonnensystem data
            const response = await fetch('./data/sonnensystem.json');
            const data = await response.json();
            this.loadGraphData(data);
        } catch (error) {
            console.error('Error loading data:', error);
            
            // Fallback: Generate demo data
            this.generateDemoData();
        }
        
        document.getElementById('loading').classList.add('hidden');
    }
    
    loadGraphData(data) {
        this.clearScene();
        
        // Update system info
        document.getElementById('system-name').textContent = data.system || 'Unbekanntes System';
        document.getElementById('system-desc').textContent = data.metadata?.description || '';
        
        // Get visual mappings
        const visualMappings = data.visualMappings?.defaultPresets || {};
        
        // Create nodes
        const entities = data.data?.entities || [];
        entities.forEach(entity => {
            this.createNode(entity, visualMappings[entity.type]);
        });
        
        // Create edges
        const relationships = data.data?.relationships || [];
        relationships.forEach(rel => {
            this.createEdge(rel, visualMappings[rel.type]);
        });
        
        // Update stats
        document.getElementById('stat-nodes').textContent = entities.length;
        document.getElementById('stat-edges').textContent = relationships.length;
        
        // Update entity list
        this.updateEntityList(entities);
        
        // Create processes
        this.createProcesses(relationships);
        
        // Center camera
        this.centerCamera();
    }
    
    generateDemoData() {
        const demoData = {
            system: 'Beispiel-Netzwerk',
            metadata: {
                description: 'Ein generiertes Demo-Netzwerk'
            },
            data: {
                entities: [
                    { id: 'hub1', type: 'default', label: 'Zentraler Knoten', position: { x: 0, y: 0, z: 0 } },
                    { id: 'node1', type: 'default', label: 'Knoten A', position: { x: 30, y: 20, z: 10 } },
                    { id: 'node2', type: 'default', label: 'Knoten B', position: { x: -30, y: 15, z: -15 } },
                    { id: 'node3', type: 'default', label: 'Knoten C', position: { x: 10, y: -25, z: 20 } },
                    { id: 'node4', type: 'default', label: 'Knoten D', position: { x: -15, y: -20, z: -25 } },
                    { id: 'node5', type: 'default', label: 'Knoten E', position: { x: 40, y: -10, z: -5 } }
                ],
                relationships: [
                    { id: 'e1', type: 'default', source: 'hub1', target: 'node1', label: 'Verbindung A' },
                    { id: 'e2', type: 'default', source: 'hub1', target: 'node2', label: 'Verbindung B' },
                    { id: 'e3', type: 'default', source: 'hub1', target: 'node3', label: 'Verbindung C' },
                    { id: 'e4', type: 'default', source: 'hub1', target: 'node4', label: 'Verbindung D' },
                    { id: 'e5', type: 'default', source: 'node1', target: 'node5', label: 'Verbindung E' }
                ]
            }
        };
        
        this.loadGraphData(demoData);
    }
    
    createNode(entityData, visualPreset = {}) {
        const position = entityData.position || { x: 0, y: 0, z: 0 };
        
        // Determine color
        let color = TYPE_COLORS[entityData.type] || TYPE_COLORS['default'];
        if (visualPreset.color?.params?.color) {
            color = new THREE.Color(visualPreset.color.params.color).getHex();
        }
        
        // Determine size
        let size = 3;
        if (visualPreset.size?.range) {
            size = (visualPreset.size.range[0] + visualPreset.size.range[1]) / 2;
        }
        
        // Select geometry based on type
        const geometryTypes = Object.keys(NODE_GEOMETRIES);
        const geometryType = entityData.type || 'sphere';
        let geometry;
        
        if (geometryType.includes('ganglion') || geometryType.includes('zns')) {
            geometry = NODE_GEOMETRIES.octahedron();
        } else if (geometryType.includes('nerv')) {
            geometry = NODE_GEOMETRIES.torus();
        } else {
            geometry = NODE_GEOMETRIES.sphere();
        }
        
        // Create material
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.4,
            emissive: 0x000000,
            emissiveIntensity: 0
        });
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        mesh.scale.setScalar(size);
        mesh.userData = { nodeData: entityData };
        
        this.nodeGroup.add(mesh);
        this.nodes.set(entityData.id, mesh);
        
        // Create label
        this.createLabel(entityData.label || entityData.id, position, color);
    }
    
    createLabel(text, position, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'transparent';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.font = 'bold 24px Arial';
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(position.x, position.y + 5, position.z);
        sprite.scale.set(15, 4, 1);
        
        this.labelGroup.add(sprite);
        this.labels.set(text, sprite);
    }
    
    createEdge(relData, visualPreset = {}) {
        const sourceNode = this.nodes.get(relData.source);
        const targetNode = this.nodes.get(relData.target);
        
        if (!sourceNode || !targetNode) return;
        
        // Determine color
        let color = DEFAULT_COLORS.edge;
        if (visualPreset.color?.params?.color) {
            color = new THREE.Color(visualPreset.color.params.color).getHex();
        }
        
        // Determine thickness
        let thickness = 0.15;
        if (visualPreset.thickness?.range) {
            thickness = (visualPreset.thickness.range[0] + visualPreset.thickness.range[1]) / 2;
        }
        
        // Create curve
        const start = sourceNode.position.clone();
        const end = targetNode.position.clone();
        const mid = start.clone().add(end).multiplyScalar(0.5);
        mid.y += 5; // Arc upward
        
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        
        // Create tube geometry
        const tubeGeometry = new THREE.TubeGeometry(curve, 32, thickness, 8, false);
        const tubeMaterial = new THREE.MeshStandardMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            emissive: color,
            emissiveIntensity: 0.2
        });
        
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tube.userData = { relData };
        
        this.edgeGroup.add(tube);
        this.edges.push({ mesh: tube, curve, material: tubeMaterial });
    }
    
    createProcesses(relationships) {
        const processList = document.getElementById('process-list');
        processList.innerHTML = '';
        
        // Show process panel if there are relationships
        const processPanel = document.getElementById('process-panel');
        if (relationships.length > 0) {
            processPanel.classList.remove('hidden');
            
            // Create a process for each relationship
            relationships.slice(0, 5).forEach((rel, index) => {
                const processItem = document.createElement('div');
                processItem.className = 'process-item';
                
                const indicator = document.createElement('div');
                indicator.className = 'process-indicator';
                indicator.style.backgroundColor = index % 2 === 0 ? '#7b2cbf' : '#00d4ff';
                
                const label = document.createElement('span');
                label.textContent = rel.label || `${rel.source} -> ${rel.target}`;
                
                processItem.appendChild(indicator);
                processItem.appendChild(label);
                processList.appendChild(processItem);
                
                this.processes.push({ rel, indicator, label });
            });
        } else {
            processPanel.classList.add('hidden');
        }
    }
    
    updateEntityList(entities) {
        const list = document.getElementById('entity-list');
        list.innerHTML = '';
        
        entities.forEach(entity => {
            const item = document.createElement('div');
            item.className = 'entity-item';
            item.dataset.id = entity.id;
            
            const labelDiv = document.createElement('div');
            labelDiv.className = 'label';
            labelDiv.textContent = entity.label || entity.id;
            
            const typeDiv = document.createElement('div');
            typeDiv.className = 'type';
            typeDiv.textContent = entity.type;
            
            item.appendChild(labelDiv);
            item.appendChild(typeDiv);
            
            item.addEventListener('click', () => {
                this.focusOnNode(entity);
            });
            
            list.appendChild(item);
        });
    }
    
    focusOnNode(entityData) {
        const mesh = this.nodes.get(entityData.id);
        if (!mesh) return;
        
        // Animate camera to node
        const target = mesh.position.clone();
        const duration = 1000;
        const start = this.camera.position.clone();
        const startTime = Date.now();
        
        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(start, target, eased);
            this.camera.position.y += 20; // Offset above node
            this.camera.lookAt(target);
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        
        animateCamera();
        this.selectNode(entityData);
    }
    
    // ============================================================================
    // STEUERUNG
    // ============================================================================
    
    resetView() {
        this.camera.position.set(0, 50, 150);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }
    
    zoomIn() {
        this.camera.position.multiplyScalar(0.8);
    }
    
    zoomOut() {
        this.camera.position.multiplyScalar(1.2);
    }
    
    centerCamera() {
        // Calculate center of all nodes
        if (this.nodes.size === 0) return;
        
        const center = new THREE.Vector3();
        this.nodes.forEach(mesh => {
            center.add(mesh.position);
        });
        center.divideScalar(this.nodes.size);
        
        // Move camera to center
        const offset = new THREE.Vector3(0, 50, 150);
        this.camera.position.copy(center).add(offset);
        this.controls.target.copy(center);
    }
    
    toggleAnimation() {
        this.settings.animationEnabled = !this.settings.animationEnabled;
        
        const btn = document.getElementById('btn-animate');
        btn.textContent = this.settings.animationEnabled ? 'Animation' : 'Stop';
        btn.style.background = this.settings.animationEnabled ? '' : '#ff6b6b';
    }
    
    clearScene() {
        // Clear nodes
        while (this.nodeGroup.children.length > 0) {
            const child = this.nodeGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.nodeGroup.remove(child);
        }
        this.nodes.clear();
        
        // Clear edges
        while (this.edgeGroup.children.length > 0) {
            const child = this.edgeGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.edgeGroup.remove(child);
        }
        this.edges = [];
        
        // Clear labels
        while (this.labelGroup.children.length > 0) {
            const child = this.labelGroup.children[0];
            if (child.material?.map) child.material.map.dispose();
            if (child.material) child.material.dispose();
            this.labelGroup.remove(child);
        }
        this.labels.clear();
        
        // Clear entity list
        document.getElementById('entity-list').innerHTML = '';
        
        // Hide process panel
        document.getElementById('process-panel').classList.add('hidden');
        this.processes = [];
    }
    
    // ============================================================================
    // ANIMATION LOOP
    // ============================================================================
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();
        
        // Update controls
        this.controls.update();
        
        // Animate nodes (gentle floating)
        this.nodes.forEach((mesh, id) => {
            const nodeData = mesh.userData.nodeData;
            if (nodeData?.type?.includes('stern')) {
                mesh.scale.setScalar(mesh.userData.baseScale || 8);
                mesh.userData.baseScale = mesh.userData.baseScale || 8;
                mesh.scale.multiplyScalar(1 + Math.sin(elapsed * 2) * 0.02);
            }
        });
        
        // Animate edges (pulse effect)
        if (this.settings.animationEnabled) {
            this.edges.forEach((edge, index) => {
                const pulse = 0.7 + Math.sin(elapsed * 2 + index * 0.5) * 0.3;
                edge.material.opacity = pulse;
                edge.material.emissiveIntensity = pulse * 0.3;
            });
            
            // Animate process indicators
            this.processes.forEach((process, index) => {
                const speed = 1 + (index % 3) * 0.5;
                process.indicator.style.opacity = 0.5 + Math.sin(elapsed * speed) * 0.5;
            });
        }
        
        // Update FPS
        this.frameCount++;
        if (elapsed - this.lastFpsUpdate >= 1) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = elapsed;
            document.getElementById('stat-fps').textContent = this.fps;
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================

const engine = new NodgesFreeEngine();

// Auto-load demo data after short delay
setTimeout(() => {
    engine.loadDemoData();
}, 500);

window.addEventListener('DOMContentLoaded', () => {
    console.log('NodgesFree Engine initialized');
});
