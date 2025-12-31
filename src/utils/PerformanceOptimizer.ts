import * as THREE from 'three';

interface OptimSettings {
    enableLOD: boolean;
    enableFrustumCulling: boolean;
    maxVisibleNodes: number;
    maxVisibleEdges: number;
    lodDistances: [number, number, number]; // [near, medium, far]
    updateInterval: number;
}

interface Stats {
    visibleNodes: number;
    visibleEdges: number;
}

interface OptimNode {
    mesh: THREE.Mesh;
    [key: string]: any;
}

interface OptimEdge {
    line?: THREE.Line | THREE.Mesh;
    startNode: { mesh: THREE.Mesh };
    endNode: { mesh: THREE.Mesh };
    options?: { width?: number };
    [key: string]: any;
}

export class PerformanceOptimizer {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    // private renderer: THREE.WebGLRenderer;
    private settings: OptimSettings;
    private stats: Stats;
    private lastUpdate: number;
    private frustum: THREE.Frustum;
    private cameraMatrix: THREE.Matrix4;
    private lodGroups: Map<string, THREE.Group>;

    constructor(scene: THREE.Scene, camera: THREE.Camera, _renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        // this.renderer = renderer;

        this.settings = {
            enableLOD: true,
            enableFrustumCulling: true,
            maxVisibleNodes: 1000,
            maxVisibleEdges: 2000,
            lodDistances: [10, 25, 50],
            updateInterval: 100
        };

        this.stats = {
            visibleNodes: 0,
            visibleEdges: 0
        };

        this.lastUpdate = 0;
        this.frustum = new THREE.Frustum();
        this.cameraMatrix = new THREE.Matrix4();

        this.lodGroups = new Map();
        this.initializeLODSystem();
    }

    initializeLODSystem() {
        this.lodGroups = new Map([
            ['high', new THREE.Group()],
            ['medium', new THREE.Group()],
            ['low', new THREE.Group()],
            ['minimal', new THREE.Group()]
        ]);

        this.lodGroups.forEach(group => this.scene.add(group));
    }

    optimizeNodes(nodes: OptimNode[]) {
        if (!this.settings.enableLOD && !this.settings.enableFrustumCulling) return;

        const cameraPosition = this.camera.position;
        let visibleCount = 0;

        if (this.settings.enableFrustumCulling) {
            this.cameraMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
            this.frustum.setFromProjectionMatrix(this.cameraMatrix);
        }

        nodes.forEach(node => {
            if (!node.mesh) return;

            const distance = cameraPosition.distanceTo(node.mesh.position);

            if (this.settings.enableFrustumCulling &&
                !this.frustum.intersectsObject(node.mesh)) {
                node.mesh.visible = false;
                return;
            }

            if (this.settings.enableLOD) {
                this.applyNodeLOD(node, distance);
            }

            if (visibleCount < this.settings.maxVisibleNodes) {
                node.mesh.visible = true;
                visibleCount++;
            } else {
                node.mesh.visible = false;
            }
        });

        this.stats.visibleNodes = visibleCount;
    }

    applyNodeLOD(node: OptimNode, distance: number) {
        const mesh = node.mesh;
        const [near, medium, far] = this.settings.lodDistances;
        const level =
            distance < near ? 'high' :
                distance < medium ? 'medium' :
                    distance < far ? 'low' : 'minimal';

        if (mesh.userData.currentLOD === level) return;
        mesh.userData.currentLOD = level;

        if (mesh.material instanceof THREE.Material) {
            const mat = mesh.material as any; // Cast to access wireframe if generic material doesn't have it

            switch (level) {
                case 'high':
                    if (mat.wireframe !== undefined) mat.wireframe = false;
                    mesh.castShadow = true;
                    break;
                case 'medium':
                    if (mat.wireframe !== undefined) mat.wireframe = false;
                    mesh.castShadow = true;
                    break;
                case 'low':
                    if (mat.wireframe !== undefined) mat.wireframe = true;
                    mesh.castShadow = false;
                    break;
                case 'minimal':
                    if (mat.wireframe !== undefined) mat.wireframe = true;
                    mesh.castShadow = false;
                    mesh.scale.setScalar(0.5);
                    break;
            }
        }
    }

    optimizeEdges(edges: OptimEdge[]) {
        if (!this.settings.enableLOD && !this.settings.enableFrustumCulling) return;

        const cameraPosition = this.camera.position;
        let visibleCount = 0;

        edges.forEach(edge => {
            if (!edge.line) return;

            const startPos = edge.startNode.mesh.position;
            const endPos = edge.endNode.mesh.position;
            const centerPos = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
            const distance = cameraPosition.distanceTo(centerPos);

            if (this.settings.enableFrustumCulling &&
                !this.frustum.intersectsObject(edge.line)) {
                edge.line.visible = false;
                return;
            }

            if (this.settings.enableLOD) {
                this.applyEdgeLOD(edge, distance);
            }

            if (visibleCount < this.settings.maxVisibleEdges) {
                edge.line.visible = true;
                visibleCount++;
            } else {
                edge.line.visible = false;
            }
        });

        this.stats.visibleEdges = visibleCount;
    }

    applyEdgeLOD(edge: OptimEdge, distance: number) {
        const line = edge.line as any; // Cast to access material
        const [near, medium, far] = this.settings.lodDistances;

        // Ensure materials structure
        if (!line.material) return;

        const width = (edge.options && edge.options.width) ? edge.options.width : 3;

        if (distance < near) {
            line.material.opacity = 1.0;
            line.material.linewidth = width;
        } else if (distance < medium) {
            line.material.opacity = 0.7;
            line.material.linewidth = Math.max(1, width * 0.7);
        } else if (distance < far) {
            line.material.opacity = 0.5;
            line.material.linewidth = 1;
        } else {
            line.material.opacity = 0.3;
            line.material.linewidth = 1;
        }

        line.material.transparent = line.material.opacity < 1.0;
    }

    update(nodes: OptimNode[], edges: OptimEdge[]) {
        const now = performance.now();
        if (now - this.lastUpdate < this.settings.updateInterval) return;
        this.lastUpdate = now;

        if (nodes && nodes.length > 0) this.optimizeNodes(nodes);
        if (edges && edges.length > 0) this.optimizeEdges(edges);
    }

    resetOptimizations(nodes: OptimNode[], edges: OptimEdge[]) {
        if (nodes) {
            nodes.forEach(node => {
                if (node.mesh) {
                    node.mesh.visible = true;
                    const mat = node.mesh.material as any;
                    if (mat.wireframe !== undefined) mat.wireframe = false;
                    node.mesh.castShadow = true;
                    node.mesh.scale.setScalar(1);
                    delete node.mesh.userData.currentLOD;
                }
            });
        }

        if (edges) {
            edges.forEach(edge => {
                if (edge.line) {
                    const line = edge.line as any;
                    line.visible = true;
                    if (line.material) {
                        line.material.opacity = 1.0;
                        line.material.transparent = false;
                        const width = (edge.options && edge.options.width) ? edge.options.width : 3;
                        line.material.linewidth = width;
                    }
                }
            });
        }
    }
}
