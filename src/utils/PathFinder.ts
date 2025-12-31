import * as THREE from 'three';
import { StateManager } from '../core/StateManager';

interface PathNode {
    id: string | number;
    mesh: THREE.Mesh;
    [key: string]: any;
}

interface PathEdge {
    startNode: { id: string | number; mesh: THREE.Mesh };
    endNode: { id: string | number; mesh: THREE.Mesh };
    line?: THREE.Line | THREE.Mesh; // Can be line or mesh (tube)
    metadata?: any;
    [key: string]: any;
}

interface QueueItem {
    node: PathNode;
    path: PathNode[];
}

interface AnimationSettings {
    speed?: number;
    active?: boolean;
    color?: number;
}

/**
 * PathFinder provides path finding algorithms and visualization
 * for finding and highlighting paths between nodes in the network.
 */
export class PathFinder {
    private scene: THREE.Scene;
    // private stateManager: StateManager;
    private nodes: PathNode[];
    private edges: PathEdge[];
    private adjacencyList: Map<string | number, Map<string | number, PathEdge>>;
    private currentPath: PathNode[];
    private pathVisualization: THREE.Object3D[]; // Stores lines/meshes that are modified
    private startNode: PathNode | null;
    private endNode: PathNode | null;

    // Path visualization settings
    private pathColor: number;
    // private pathWidth: number;
    private pathOpacity: number;
    private animationSpeed: number;
    private animationActive: boolean;
    private animationPhase: number;
    private animationMarker: THREE.Mesh | null;

    constructor(scene: THREE.Scene, _stateManager: StateManager) {
        this.scene = scene;
        // this.stateManager = stateManager;
        this.nodes = [];
        this.edges = [];
        this.adjacencyList = new Map();
        this.currentPath = [];
        this.pathVisualization = [];
        this.startNode = null;
        this.endNode = null;

        // Path visualization settings
        this.pathColor = 0x00ff00; // Green for path
        // this.pathWidth = 5;
        this.pathOpacity = 0.8;
        this.animationSpeed = 1.0;
        this.animationActive = false;
        this.animationPhase = 0;
        this.animationMarker = null;
    }

    /**
     * Initialize the path finder with current network data
     */
    initialize(nodes: PathNode[], edges: PathEdge[]) {
        this.nodes = nodes;
        this.edges = edges;
        this.buildAdjacencyList();
        this.clearPath();
    }

    /**
     * Build adjacency list representation of the network
     */
    buildAdjacencyList() {
        this.adjacencyList.clear();

        // Initialize adjacency list for all nodes
        this.nodes.forEach(node => {
            this.adjacencyList.set(node.id, new Map());
        });

        // Add edges to adjacency list with edge references
        this.edges.forEach(edge => {
            const startId = edge.startNode.id;
            const endId = edge.endNode.id;

            if (this.adjacencyList.has(startId) && this.adjacencyList.has(endId)) {
                this.adjacencyList.get(startId)!.set(endId, edge);
                this.adjacencyList.get(endId)!.set(startId, edge); // Assuming undirected graph
            }
        });
    }

    /**
     * Set the start node for path finding
     */
    setStartNode(node: PathNode) {
        this.startNode = node;
        this.updatePathVisualization();
    }

    /**
     * Set the end node for path finding
     */
    setEndNode(node: PathNode) {
        this.endNode = node;
        this.updatePathVisualization();
    }

    /**
     * Find shortest path between start and end nodes using BFS
     */
    findShortestPath(): PathNode[] {
        if (!this.startNode || !this.endNode) {
            return [];
        }

        if (this.startNode.id === this.endNode.id) {
            return [this.startNode];
        }

        const visited = new Set<string | number>();
        const queue: QueueItem[] = [{ node: this.startNode, path: [this.startNode] }];

        while (queue.length > 0) {
            const { node, path } = queue.shift()!;

            if (visited.has(node.id)) continue;
            visited.add(node.id);

            const neighbors = this.adjacencyList.get(node.id);
            if (neighbors) {
                for (const neighborId of neighbors.keys()) {
                    const neighborNode = this.nodes.find(n => n.id === neighborId);

                    if (neighborNode) {
                        if (neighborNode.id === this.endNode.id) {
                            return [...path, neighborNode];
                        }

                        if (!visited.has(neighborId)) {
                            queue.push({
                                node: neighborNode,
                                path: [...path, neighborNode]
                            });
                        }
                    }
                }
            }
        }

        return []; // No path found
    }

    /**
     * Find path using A* algorithm with Euclidean distance heuristic
     */
    findAStarPath(): PathNode[] {
        if (!this.startNode || !this.endNode) {
            console.warn('Start or end node not set');
            return [];
        }

        if (this.startNode.id === this.endNode.id) {
            return [this.startNode];
        }

        const openSet = new Set<string | number>([this.startNode.id]);
        const cameFrom = new Map<string | number, string | number>();
        const gScore = new Map<string | number, number>();
        const fScore = new Map<string | number, number>();

        // Initialize scores
        this.nodes.forEach(node => {
            gScore.set(node.id, Infinity);
            fScore.set(node.id, Infinity);
        });

        gScore.set(this.startNode.id, 0);
        fScore.set(this.startNode.id, this.heuristic(this.startNode, this.endNode));

        while (openSet.size > 0) {
            // Find node with lowest fScore
            let current: PathNode | null = null;
            let lowestFScore = Infinity;

            for (const nodeId of openSet) {
                const score = fScore.get(nodeId)!;
                if (score < lowestFScore) {
                    lowestFScore = score;
                    current = this.nodes.find(n => n.id === nodeId) || null;
                }
            }

            if (!current) break;

            if (current.id === this.endNode.id) {
                // Reconstruct path
                const path = [current];
                let currentId = current.id;

                while (cameFrom.has(currentId)) {
                    currentId = cameFrom.get(currentId)!;
                    const node = this.nodes.find(n => n.id === currentId);
                    if (node) {
                        path.unshift(node);
                    }
                }

                return path;
            }

            openSet.delete(current.id);
            const neighbors = this.adjacencyList.get(current.id);

            if (neighbors) {
                for (const [neighborId, edge] of neighbors) {
                    const neighbor = this.nodes.find(n => n.id === neighborId);
                    if (!neighbor) continue;

                    const tentativeGScore = gScore.get(current.id)! + this.getEdgeWeight(edge);

                    if (tentativeGScore < gScore.get(neighborId)!) {
                        cameFrom.set(neighborId, current.id);
                        gScore.set(neighborId, tentativeGScore);
                        fScore.set(neighborId, tentativeGScore + this.heuristic(neighbor, this.endNode));

                        openSet.add(neighborId);
                    }
                }
            }
        }

        return []; // No path found
    }

    /**
     * Calculate heuristic distance between two nodes (Euclidean distance)
     */
    heuristic(node1: PathNode, node2: PathNode): number {
        const pos1 = node1.mesh.position;
        const pos2 = node2.mesh.position;
        return pos1.distanceTo(pos2);
    }

    /**
     * Get weight of an edge (can be customized based on edge properties)
     */
    getEdgeWeight(edge: PathEdge): number {
        // Default weight is 1, but can be customized based on edge properties
        if (edge.metadata && edge.metadata.weight) {
            return edge.metadata.weight;
        }

        // Use Euclidean distance as weight
        const startPos = edge.startNode.mesh.position;
        const endPos = edge.endNode.mesh.position;
        return startPos.distanceTo(endPos);
    }

    /**
     * Update path visualization based on current start and end nodes
     */
    updatePathVisualization() {
        this.clearPathVisualization();

        if (this.startNode && this.endNode) {
            this.currentPath = this.findShortestPath();
            this.createPathVisualization();
        }
    }

    /**
     * Create visual representation of the current path
     */
    createPathVisualization() {
        if (this.currentPath.length < 2) return;

        // Highlight path nodes
        this.currentPath.forEach((node, index) => {
            if (node.mesh && node.mesh.material instanceof THREE.Material) {
                // Cast to any to access custom userData and properties that aren't on standard Material
                const mesh = node.mesh as any;
                const material = mesh.material;

                // Store original material properties
                if (!mesh.userData.originalEmissive) {
                    if (material.emissive) {
                        mesh.userData.originalEmissive = material.emissive.clone();
                        mesh.userData.originalEmissiveIntensity = material.emissiveIntensity;
                    }
                }

                // Apply path highlighting
                if (material.emissive) {
                    if (index === 0) {
                        // Start node - green
                        material.emissive.setHex(0x00ff00);
                        material.emissiveIntensity = 0.5;
                    } else if (index === this.currentPath.length - 1) {
                        // End node - red
                        material.emissive.setHex(0xff0000);
                        material.emissiveIntensity = 0.5;
                    } else {
                        // Intermediate nodes - yellow
                        material.emissive.setHex(0xffff00);
                        material.emissiveIntensity = 0.3;
                    }
                }
            }
        });

        // Highlight path edges
        for (let i = 0; i < this.currentPath.length - 1; i++) {
            const currentNode = this.currentPath[i];
            const nextNode = this.currentPath[i + 1];

            const neighbors = this.adjacencyList.get(currentNode.id);
            if (neighbors && neighbors.has(nextNode.id)) {
                const edge = neighbors.get(nextNode.id);

                // Check if edge has a visual representation (line or mesh)
                const object3D = edge?.line as any;

                if (object3D) {
                    // Store original material properties
                    if (!object3D.userData.originalColor) {
                        // Check material type, assume it has color and opacity for now
                        const material = object3D.material;
                        if (material && material.color) {
                            object3D.userData.originalColor = material.color.clone();
                            object3D.userData.originalOpacity = material.opacity;
                        }
                    }

                    // Apply path highlighting to edge
                    if (object3D.material) {
                        if (object3D.material.color) object3D.material.color.setHex(this.pathColor);
                        if (object3D.material.opacity !== undefined) object3D.material.opacity = this.pathOpacity;
                        object3D.material.transparent = true;
                    }

                    this.pathVisualization.push(object3D);
                }
            }
        }

        // Start animation if enabled
        if (this.animationActive) {
            this.startPathAnimation();
        }
    }

    /**
     * Start animated visualization of the path
     */
    startPathAnimation() {
        this.animationPhase = 0;
        this.animatePathTraversal();
    }

    /**
     * Animate path traversal
     */
    animatePathTraversal() {
        if (!this.animationActive || this.currentPath.length < 2) return;

        const animate = () => {
            // Stop if animation is no longer active
            if (!this.animationActive) return;

            this.animationPhase += 0.016 * this.animationSpeed; // Assuming 60fps

            if (this.animationPhase >= this.currentPath.length - 1) {
                this.animationPhase = 0; // Loop animation
            }

            // Update visual indicators based on animation phase
            this.updateAnimationVisuals();

            requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Update visual indicators during animation
     */
    updateAnimationVisuals() {
        const currentIndex = Math.floor(this.animationPhase);
        const nextIndex = Math.min(currentIndex + 1, this.currentPath.length - 1);
        const t = this.animationPhase - currentIndex;

        // Create or update animation marker
        if (!this.animationMarker) {
            const geometry = new THREE.SphereGeometry(0.3, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8
            });
            this.animationMarker = new THREE.Mesh(geometry, material);
            this.scene.add(this.animationMarker);
        }

        // Interpolate position between current and next node
        if (currentIndex < this.currentPath.length && nextIndex < this.currentPath.length) {
            const currentPos = this.currentPath[currentIndex].mesh.position;
            const nextPos = this.currentPath[nextIndex].mesh.position;

            this.animationMarker.position.lerpVectors(currentPos, nextPos, t);
            this.animationMarker.position.y += 1; // Slightly above the path
        }
    }

    /**
     * Clear current path visualization
     */
    clearPathVisualization() {
        // Restore original node materials
        this.currentPath.forEach(node => {
            const mesh = node.mesh as any;
            if (mesh && mesh.userData && mesh.userData.originalEmissive && mesh.material && mesh.material.emissive) {
                mesh.material.emissive.copy(mesh.userData.originalEmissive);
                mesh.material.emissiveIntensity = mesh.userData.originalEmissiveIntensity;

                delete mesh.userData.originalEmissive;
                delete mesh.userData.originalEmissiveIntensity;
            }
        });

        // Restore original edge materials
        this.pathVisualization.forEach((edgeLine: any) => {
            if (edgeLine.userData && edgeLine.userData.originalColor && edgeLine.material && edgeLine.material.color) {
                edgeLine.material.color.copy(edgeLine.userData.originalColor);
                if (edgeLine.material.opacity !== undefined) edgeLine.material.opacity = edgeLine.userData.originalOpacity;

                delete edgeLine.userData.originalColor;
                delete edgeLine.userData.originalOpacity;
            }
        });

        this.pathVisualization = [];
        this.currentPath = [];

        // Remove animation marker
        if (this.animationMarker) {
            this.scene.remove(this.animationMarker);
            this.animationMarker.geometry.dispose();
            if (Array.isArray(this.animationMarker.material)) {
                this.animationMarker.material.forEach(m => m.dispose());
            } else {
                this.animationMarker.material.dispose();
            }
            this.animationMarker = null;
        }
    }

    /**
     * Clear all path data and visualization
     */
    clearPath() {
        this.clearPathVisualization();
        this.startNode = null;
        this.endNode = null;
        this.animationActive = false;
    }

    /**
     * Get information about the current path
     */
    getPathInfo(): any {
        if (this.currentPath.length === 0) {
            return {
                exists: false,
                length: 0,
                nodes: [],
                totalDistance: 0
            };
        }

        let totalDistance = 0;
        for (let i = 0; i < this.currentPath.length - 1; i++) {
            const currentPos = this.currentPath[i].mesh.position;
            const nextPos = this.currentPath[i + 1].mesh.position;
            totalDistance += currentPos.distanceTo(nextPos);
        }

        return {
            exists: true,
            length: this.currentPath.length,
            nodes: this.currentPath.map(node => ({
                id: node.id,
                name: node.mesh.name
            })),
            totalDistance: totalDistance.toFixed(2)
        };
    }

    /**
     * Set animation settings
     */
    setAnimationSettings(settings: AnimationSettings) {
        if (settings.speed !== undefined) {
            this.animationSpeed = settings.speed;
        }
        if (settings.active !== undefined) {
            this.animationActive = settings.active;
            if (this.animationActive && this.currentPath.length > 1) {
                this.startPathAnimation();
            }
        }
        if (settings.color !== undefined) {
            this.pathColor = settings.color;
        }
    }

    /**
     * Get path finding statistics
     */
    getStatistics() {
        return {
            nodesCount: this.nodes.length,
            edgesCount: this.edges.length,
            hasPath: this.currentPath.length > 0,
            pathLength: this.currentPath.length,
            startNode: this.startNode ? this.startNode.mesh.name : null,
            endNode: this.endNode ? this.endNode.mesh.name : null
        };
    }
}
