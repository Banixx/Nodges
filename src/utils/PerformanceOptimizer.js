import * as THREE from 'three';

/**
 * PerformanceOptimizer provides various optimization techniques
 * for improving rendering performance with large networks.
 */
export class PerformanceOptimizer {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // Performance settings
        this.settings = {
            enableLOD: true,
            enableFrustumCulling: true,
            enableOcclusion: false,
            maxVisibleNodes: 1000,
            maxVisibleEdges: 2000,
            lodDistances: [10, 25, 50],
            updateInterval: 100, // ms
            enableInstancedRendering: false
        };
        
        // Performance tracking
        this.stats = {
            visibleNodes: 0,
            visibleEdges: 0,
            culledNodes: 0,
            culledEdges: 0,
            frameTime: 0,
            fps: 0
        };
        
        // Optimization state
        this.lastUpdate = 0;
        this.frustum = new THREE.Frustum();
        this.cameraMatrix = new THREE.Matrix4();
        this.nodeDistances = new Map();
        this.edgeDistances = new Map();
        
        // LOD groups
        this.lodGroups = new Map();
        this.instancedMeshes = new Map();
        
        // Performance monitoring
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.frameTimes = [];
        
        this.initializeLODSystem();
    }

    /**
     * Initialize Level of Detail (LOD) system
     */
    initializeLODSystem() {
        // Create LOD groups for different detail levels
        this.lodGroups.set('high', new THREE.Group());
        this.lodGroups.set('medium', new THREE.Group());
        this.lodGroups.set('low', new THREE.Group());
        this.lodGroups.set('minimal', new THREE.Group());
        
        // Add LOD groups to scene
        this.lodGroups.forEach(group => {
            this.scene.add(group);
        });
    }

    /**
     * Optimize nodes based on distance and visibility
     * @param {Array} nodes - Array of Node objects
     */
    optimizeNodes(nodes) {
        if (!this.settings.enableLOD && !this.settings.enableFrustumCulling) {
            return;
        }

        const cameraPosition = this.camera.position;
        let visibleCount = 0;
        let culledCount = 0;

        // Update frustum for culling
        if (this.settings.enableFrustumCulling) {
            this.cameraMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
            this.frustum.setFromProjectionMatrix(this.cameraMatrix);
        }

        nodes.forEach(node => {
            if (!node.mesh) return;

            const distance = cameraPosition.distanceTo(node.mesh.position);
            this.nodeDistances.set(node.id, distance);

            // Frustum culling
            let inFrustum = true;
            if (this.settings.enableFrustumCulling) {
                inFrustum = this.frustum.intersectsObject(node.mesh);
            }

            if (!inFrustum) {
                node.mesh.visible = false;
                culledCount++;
                return;
            }

            // Distance-based LOD
            if (this.settings.enableLOD) {
                this.applyNodeLOD(node, distance);
            }

            // Limit visible nodes for performance
            if (visibleCount < this.settings.maxVisibleNodes) {
                node.mesh.visible = true;
                visibleCount++;
            } else {
                node.mesh.visible = false;
                culledCount++;
            }
        });

        this.stats.visibleNodes = visibleCount;
        this.stats.culledNodes = culledCount;
    }

    /**
     * Apply Level of Detail to a node based on distance
     * @param {Object} node - Node object
     * @param {number} distance - Distance from camera
     */
    applyNodeLOD(node, distance) {
        const mesh = node.mesh;
        const [near, medium, far] = this.settings.lodDistances;

        if (distance < near) {
            // High detail - full geometry and materials
            this.setNodeLOD(mesh, 'high');
        } else if (distance < medium) {
            // Medium detail - simplified geometry
            this.setNodeLOD(mesh, 'medium');
        } else if (distance < far) {
            // Low detail - basic shapes
            this.setNodeLOD(mesh, 'low');
        } else {
            // Minimal detail - points or very simple shapes
            this.setNodeLOD(mesh, 'minimal');
        }
    }

    /**
     * Set LOD level for a node mesh
     * @param {THREE.Mesh} mesh - Node mesh
     * @param {string} level - LOD level ('high', 'medium', 'low', 'minimal')
     */
    setNodeLOD(mesh, level) {
        if (mesh.userData.currentLOD === level) return;

        mesh.userData.currentLOD = level;

        switch (level) {
            case 'high':
                // Full detail
                mesh.material.wireframe = false;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                break;
            case 'medium':
                // Reduced detail
                mesh.material.wireframe = false;
                mesh.castShadow = true;
                mesh.receiveShadow = false;
                break;
            case 'low':
                // Basic detail
                mesh.material.wireframe = true;
                mesh.castShadow = false;
                mesh.receiveShadow = false;
                break;
            case 'minimal':
                // Minimal detail - could be replaced with points
                mesh.material.wireframe = true;
                mesh.castShadow = false;
                mesh.receiveShadow = false;
                mesh.scale.setScalar(0.5);
                break;
        }
    }

    /**
     * Optimize edges based on distance and visibility
     * @param {Array} edges - Array of Edge objects
     */
    optimizeEdges(edges) {
        if (!this.settings.enableLOD && !this.settings.enableFrustumCulling) {
            return;
        }

        const cameraPosition = this.camera.position;
        let visibleCount = 0;
        let culledCount = 0;

        edges.forEach(edge => {
            if (!edge.line) return;

            // Calculate edge center for distance calculation
            const startPos = edge.startNode.mesh.position;
            const endPos = edge.endNode.mesh.position;
            const centerPos = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
            const distance = cameraPosition.distanceTo(centerPos);
            
            this.edgeDistances.set(edge.name, distance);

            // Frustum culling for edges
            let inFrustum = true;
            if (this.settings.enableFrustumCulling) {
                inFrustum = this.frustum.intersectsObject(edge.line);
            }

            if (!inFrustum) {
                edge.line.visible = false;
                culledCount++;
                return;
            }

            // Distance-based edge LOD
            if (this.settings.enableLOD) {
                this.applyEdgeLOD(edge, distance);
            }

            // Limit visible edges for performance
            if (visibleCount < this.settings.maxVisibleEdges) {
                edge.line.visible = true;
                visibleCount++;
            } else {
                edge.line.visible = false;
                culledCount++;
            }
        });

        this.stats.visibleEdges = visibleCount;
        this.stats.culledEdges = culledCount;
    }

    /**
     * Apply Level of Detail to an edge based on distance
     * @param {Object} edge - Edge object
     * @param {number} distance - Distance from camera
     */
    applyEdgeLOD(edge, distance) {
        const line = edge.line;
        const [near, medium, far] = this.settings.lodDistances;

        if (distance < near) {
            // High detail - full geometry
            line.material.opacity = 1.0;
            line.material.linewidth = edge.options.width || 3;
        } else if (distance < medium) {
            // Medium detail - reduced opacity
            line.material.opacity = 0.7;
            line.material.linewidth = Math.max(1, (edge.options.width || 3) * 0.7);
        } else if (distance < far) {
            // Low detail - thin lines
            line.material.opacity = 0.5;
            line.material.linewidth = 1;
        } else {
            // Minimal detail - very thin or hidden
            line.material.opacity = 0.3;
            line.material.linewidth = 1;
        }

        line.material.transparent = line.material.opacity < 1.0;
    }

    /**
     * Create instanced rendering for similar objects
     * @param {Array} objects - Array of similar objects
     * @param {THREE.Geometry} geometry - Shared geometry
     * @param {THREE.Material} material - Shared material
     */
    createInstancedMesh(objects, geometry, material) {
        if (!this.settings.enableInstancedRendering || objects.length < 10) {
            return null;
        }

        const instancedMesh = new THREE.InstancedMesh(geometry, material, objects.length);
        const matrix = new THREE.Matrix4();

        objects.forEach((obj, index) => {
            if (obj.mesh) {
                matrix.setPosition(obj.mesh.position);
                matrix.scale(obj.mesh.scale);
                instancedMesh.setMatrixAt(index, matrix);
            }
        });

        instancedMesh.instanceMatrix.needsUpdate = true;
        return instancedMesh;
    }

    /**
     * Update performance optimizations
     * @param {Array} nodes - Current nodes
     * @param {Array} edges - Current edges
     */
    update(nodes, edges) {
        const now = performance.now();
        
        // Update at specified interval
        if (now - this.lastUpdate < this.settings.updateInterval) {
            return;
        }

        this.lastUpdate = now;

        // Apply optimizations
        if (nodes && nodes.length > 0) {
            this.optimizeNodes(nodes);
        }

        if (edges && edges.length > 0) {
            this.optimizeEdges(edges);
        }

        // Update performance stats
        this.updatePerformanceStats(now);
    }

    /**
     * Update performance statistics
     * @param {number} currentTime - Current timestamp
     */
    updatePerformanceStats(currentTime) {
        // Track frame time
        if (this.lastFrameTime) {
            const frameTime = currentTime - this.lastFrameTime;
            this.frameTimes.push(frameTime);
            
            // Keep only last 60 frame times
            if (this.frameTimes.length > 60) {
                this.frameTimes.shift();
            }
            
            // Calculate average frame time
            this.stats.frameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        }
        this.lastFrameTime = currentTime;

        // Calculate FPS
        this.frameCount++;
        if (currentTime - this.lastFPSUpdate > 1000) {
            this.stats.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
        }
    }

    /**
     * Get current performance statistics
     * @returns {Object} Performance statistics
     */
    getPerformanceStats() {
        return {
            ...this.stats,
            memoryUsage: this.getMemoryUsage(),
            renderCalls: this.renderer.info.render.calls,
            triangles: this.renderer.info.render.triangles,
            geometries: this.renderer.info.memory.geometries,
            textures: this.renderer.info.memory.textures
        };
    }

    /**
     * Get memory usage information
     * @returns {Object} Memory usage stats
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
                total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
            };
        }
        return { used: 'N/A', total: 'N/A', limit: 'N/A' };
    }

    /**
     * Optimize renderer settings for performance
     */
    optimizeRenderer() {
        // Disable unnecessary features for better performance
        this.renderer.shadowMap.enabled = this.stats.visibleNodes < 500;
        this.renderer.shadowMap.type = this.stats.visibleNodes < 200 ? 
            THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
        
        // Adjust pixel ratio based on performance
        const targetFPS = 30;
        if (this.stats.fps < targetFPS && this.stats.fps > 0) {
            const currentPixelRatio = this.renderer.getPixelRatio();
            if (currentPixelRatio > 1) {
                this.renderer.setPixelRatio(Math.max(1, currentPixelRatio * 0.9));
            }
        } else if (this.stats.fps > targetFPS * 1.5) {
            const currentPixelRatio = this.renderer.getPixelRatio();
            const maxPixelRatio = window.devicePixelRatio || 1;
            if (currentPixelRatio < maxPixelRatio) {
                this.renderer.setPixelRatio(Math.min(maxPixelRatio, currentPixelRatio * 1.1));
            }
        }
    }

    /**
     * Update optimization settings
     * @param {Object} newSettings - New settings to apply
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    /**
     * Reset all optimizations
     * @param {Array} nodes - All nodes to reset
     * @param {Array} edges - All edges to reset
     */
    resetOptimizations(nodes, edges) {
        // Reset node visibility and LOD
        if (nodes) {
            nodes.forEach(node => {
                if (node.mesh) {
                    node.mesh.visible = true;
                    node.mesh.material.wireframe = false;
                    node.mesh.castShadow = true;
                    node.mesh.receiveShadow = true;
                    node.mesh.scale.setScalar(1);
                    delete node.mesh.userData.currentLOD;
                }
            });
        }

        // Reset edge visibility and LOD
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

        // Reset renderer settings
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    /**
     * Get optimization recommendations based on current performance
     * @returns {Array} Array of recommendation strings
     */
    getOptimizationRecommendations() {
        const recommendations = [];
        const stats = this.getPerformanceStats();

        if (stats.fps < 30) {
            recommendations.push('FPS niedrig - Reduziere Anzahl sichtbarer Objekte');
        }

        if (stats.visibleNodes > 1000) {
            recommendations.push('Zu viele sichtbare Knoten - Aktiviere LOD');
        }

        if (stats.visibleEdges > 2000) {
            recommendations.push('Zu viele sichtbare Kanten - Aktiviere Kantenlimit');
        }

        if (stats.renderCalls > 500) {
            recommendations.push('Zu viele Render-Calls - Verwende Instanced Rendering');
        }

        if (stats.memoryUsage.used > 500) {
            recommendations.push('Hoher Speicherverbrauch - Optimiere Geometrien und Texturen');
        }

        if (recommendations.length === 0) {
            recommendations.push('Performance ist optimal');
        }

        return recommendations;
    }

    /**
     * Auto-optimize based on current performance
     */
    autoOptimize() {
        const stats = this.getPerformanceStats();

        // Auto-adjust settings based on performance
        if (stats.fps < 20) {
            this.settings.maxVisibleNodes = Math.max(100, this.settings.maxVisibleNodes * 0.8);
            this.settings.maxVisibleEdges = Math.max(200, this.settings.maxVisibleEdges * 0.8);
            this.settings.enableLOD = true;
            this.settings.enableFrustumCulling = true;
        } else if (stats.fps > 50) {
            this.settings.maxVisibleNodes = Math.min(2000, this.settings.maxVisibleNodes * 1.1);
            this.settings.maxVisibleEdges = Math.min(4000, this.settings.maxVisibleEdges * 1.1);
        }

        // Optimize renderer
        this.optimizeRenderer();
    }
}