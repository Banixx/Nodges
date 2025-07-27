import * as THREE from 'three';

export class PerformanceOptimizer {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
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

    optimizeNodes(nodes) {
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

    applyNodeLOD(node, distance) {
        const mesh = node.mesh;
        const [near, medium, far] = this.settings.lodDistances;
        const level = 
            distance < near ? 'high' : 
            distance < medium ? 'medium' : 
            distance < far ? 'low' : 'minimal';
        
        if (mesh.userData.currentLOD === level) return;
        mesh.userData.currentLOD = level;

        switch (level) {
            case 'high':
                mesh.material.wireframe = false;
                mesh.castShadow = true;
                break;
            case 'medium':
                mesh.material.wireframe = false;
                mesh.castShadow = true;
                break;
            case 'low':
                mesh.material.wireframe = true;
                mesh.castShadow = false;
                break;
            case 'minimal':
                mesh.material.wireframe = true;
                mesh.castShadow = false;
                mesh.scale.setScalar(0.5);
                break;
        }
    }

    optimizeEdges(edges) {
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

    applyEdgeLOD(edge, distance) {
        const line = edge.line;
        const [near, medium, far] = this.settings.lodDistances;

        if (distance < near) {
            line.material.opacity = 1.0;
            line.material.linewidth = edge.options.width || 3;
        } else if (distance < medium) {
            line.material.opacity = 0.7;
            line.material.linewidth = Math.max(1, (edge.options.width || 3) * 0.7);
        } else if (distance < far) {
            line.material.opacity = 0.5;
            line.material.linewidth = 1;
        } else {
            line.material.opacity = 0.3;
            line.material.linewidth = 1;
        }

        line.material.transparent = line.material.opacity < 1.0;
    }

    update(nodes, edges) {
        const now = performance.now();
        if (now - this.lastUpdate < this.settings.updateInterval) return;
        this.lastUpdate = now;

        if (nodes?.length > 0) this.optimizeNodes(nodes);
        if (edges?.length > 0) this.optimizeEdges(edges);
    }

    resetOptimizations(nodes, edges) {
        if (nodes) {
            nodes.forEach(node => {
                if (node.mesh) {
                    node.mesh.visible = true;
                    node.mesh.material.wireframe = false;
                    node.mesh.castShadow = true;
                    node.mesh.scale.setScalar(1);
                    delete node.mesh.userData.currentLOD;
                }
            });
        }

        if (edges) {
            edges.forEach(edge => {
                if (edge.line) {
                    edge.line.visible = true;
                    edge.line.material.opacity = 1.0;
                    edge.line.material.transparent = false;
                    edge.line.material.linewidth = edge.options.width || 3;
                }
            });
        }
    }
}
