import * as THREE from 'three';

/**
 * PathFinder provides path finding algorithms and visualization
 * for finding and highlighting paths between nodes in the network.
 */
export class PathFinder {
    constructor(scene, stateManager) {
        this.scene = scene;
        this.stateManager = stateManager;
        this.nodes = [];
        this.edges = [];
        this.adjacencyList = new Map();
        this.currentPath = [];
        this.pathVisualization = [];
        this.startNode = null;
        this.endNode = null;
        
        // Path visualization settings
        this.pathColor = 0x00ff00; // Green for path
        this.pathWidth = 5;
        this.pathOpacity = 0.8;
        this.animationSpeed = 1.0;
        this.animationActive = false;
        this.animationPhase = 0;
    }

    /**
     * Initialize the path finder with current network data
     * @param {Array} nodes - Array of Node objects
     * @param {Array} edges - Array of Edge objects
     */
    initialize(nodes, edges) {
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
                this.adjacencyList.get(startId).set(endId, edge);
                this.adjacencyList.get(endId).set(startId, edge); // Assuming undirected graph
            }
        });
    }

    /**
     * Set the start node for path finding
     * @param {Object} node - Node object
     */
    setStartNode(node) {
        this.startNode = node;
        this.updatePathVisualization();
    }

    /**
     * Set the end node for path finding
     * @param {Object} node - Node object
     */
    setEndNode(node) {
        this.endNode = node;
        this.updatePathVisualization();
    }

    /**
     * Find shortest path between start and end nodes using BFS
     * @returns {Array} Array of node objects representing the path
     */
    findShortestPath() {
        if (!this.startNode || !this.endNode) {
            console.warn('Start or end node not set');
            return [];
        }

        if (this.startNode.id === this.endNode.id) {
            return [this.startNode];
        }

        const visited = new Set();
        const queue = [{ node: this.startNode, path: [this.startNode] }];

        while (queue.length > 0) {
            const { node, path } = queue.shift();
            
            if (visited.has(node.id)) continue;
            visited.add(node.id);

            const neighbors = this.adjacencyList.get(node.id);
            if (neighbors) {
                for (const [neighborId, edge] of neighbors) {
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
     * @returns {Array} Array of node objects representing the path
     */
    findAStarPath() {
        if (!this.startNode || !this.endNode) {
            console.warn('Start or end node not set');
            return [];
        }

        if (this.startNode.id === this.endNode.id) {
            return [this.startNode];
        }

        const openSet = new Set([this.startNode.id]);
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        // Initialize scores
        this.nodes.forEach(node => {
            gScore.set(node.id, Infinity);
            fScore.set(node.id, Infinity);
        });

        gScore.set(this.startNode.id, 0);
        fScore.set(this.startNode.id, this.heuristic(this.startNode, this.endNode));

        while (openSet.size > 0) {
            // Find node with lowest fScore
            let current = null;
            let lowestFScore = Infinity;
            
            for (const nodeId of openSet) {
                const score = fScore.get(nodeId);
                if (score < lowestFScore) {
                    lowestFScore = score;
                    current = this.nodes.find(n => n.id === nodeId);
                }
            }

            if (!current) break;

            if (current.id === this.endNode.id) {
                // Reconstruct path
                const path = [current];
                let currentId = current.id;
                
                while (cameFrom.has(currentId)) {
                    currentId = cameFrom.get(currentId);
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

                    const tentativeGScore = gScore.get(current.id) + this.getEdgeWeight(edge);

                    if (tentativeGScore < gScore.get(neighborId)) {
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
     * @param {Object} node1 - First node
     * @param {Object} node2 - Second node
     * @returns {number} Euclidean distance
     */
    heuristic(node1, node2) {
        const pos1 = node1.mesh.position;
        const pos2 = node2.mesh.position;
        return pos1.distanceTo(pos2);
    }

    /**
     * Get weight of an edge (can be customized based on edge properties)
     * @param {Object} edge - Edge object
     * @returns {number} Edge weight
     */
    getEdgeWeight(edge) {
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
     * Find all paths between start and end nodes (up to a maximum depth)
     * @param {number} maxDepth - Maximum path length to search
     * @returns {Array} Array of path arrays
     */
    findAllPaths(maxDepth = 10) {
        if (!this.startNode || !this.endNode) {
            console.warn('Start or end node not set');
            return [];
        }

        const allPaths = [];
        const visited = new Set();

        const dfs = (currentNode, path, depth) => {
            if (depth > maxDepth) return;
            
            if (currentNode.id === this.endNode.id && path.length > 1) {
                allPaths.push([...path]);
                return;
            }

            visited.add(currentNode.id);
            const neighbors = this.adjacencyList.get(currentNode.id);
            
            if (neighbors) {
                for (const [neighborId, edge] of neighbors) {
                    const neighbor = this.nodes.find(n => n.id === neighborId);
                    if (neighbor && !visited.has(neighborId)) {
                        dfs(neighbor, [...path, neighbor], depth + 1);
                    }
                }
            }
            
            visited.delete(currentNode.id);
        };

        dfs(this.startNode, [this.startNode], 0);
        return allPaths;
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
            if (node.mesh) {
                // Store original material properties
                if (!node.mesh.userData.originalEmissive) {
                    node.mesh.userData.originalEmissive = node.mesh.material.emissive.clone();
                    node.mesh.userData.originalEmissiveIntensity = node.mesh.material.emissiveIntensity;
                }

                // Apply path highlighting
                if (index === 0) {
                    // Start node - green
                    node.mesh.material.emissive.setHex(0x00ff00);
                    node.mesh.material.emissiveIntensity = 0.5;
                } else if (index === this.currentPath.length - 1) {
                    // End node - red
                    node.mesh.material.emissive.setHex(0xff0000);
                    node.mesh.material.emissiveIntensity = 0.5;
                } else {
                    // Intermediate nodes - yellow
                    node.mesh.material.emissive.setHex(0xffff00);
                    node.mesh.material.emissiveIntensity = 0.3;
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
                
                if (edge && edge.line) {
                    // Store original material properties
                    if (!edge.line.userData.originalColor) {
                        edge.line.userData.originalColor = edge.line.material.color.clone();
                        edge.line.userData.originalOpacity = edge.line.material.opacity;
                    }

                    // Apply path highlighting to edge
                    edge.line.material.color.setHex(this.pathColor);
                    edge.line.material.opacity = this.pathOpacity;
                    edge.line.material.transparent = true;
                    
                    this.pathVisualization.push(edge.line);
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
            this.animationPhase += 0.016 * this.animationSpeed; // Assuming 60fps
            
            if (this.animationPhase >= this.currentPath.length - 1) {
                this.animationPhase = 0; // Loop animation
            }

            // Update visual indicators based on animation phase
            this.updateAnimationVisuals();

            if (this.animationActive) {
                requestAnimationFrame(animate);
            }
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
            if (node.mesh && node.mesh.userData.originalEmissive) {
                node.mesh.material.emissive.copy(node.mesh.userData.originalEmissive);
                node.mesh.material.emissiveIntensity = node.mesh.userData.originalEmissiveIntensity;
                
                delete node.mesh.userData.originalEmissive;
                delete node.mesh.userData.originalEmissiveIntensity;
            }
        });

        // Restore original edge materials
        this.pathVisualization.forEach(edgeLine => {
            if (edgeLine.userData.originalColor) {
                edgeLine.material.color.copy(edgeLine.userData.originalColor);
                edgeLine.material.opacity = edgeLine.userData.originalOpacity;
                
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
            this.animationMarker.material.dispose();
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
     * @returns {Object} Path information
     */
    getPathInfo() {
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
     * @param {Object} settings - Animation settings
     */
    setAnimationSettings(settings) {
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
     * @returns {Object} Statistics about path finding
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