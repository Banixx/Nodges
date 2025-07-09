import * as THREE from 'three';

/**
 * NetworkAnalyzer provides various network analysis algorithms and metrics
 * for analyzing the structure and properties of network graphs.
 */
export class NetworkAnalyzer {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.adjacencyList = new Map();
        this.nodeMetrics = new Map();
    }

    /**
     * Initialize the analyzer with current network data
     * @param {Array} nodes - Array of Node objects
     * @param {Array} edges - Array of Edge objects
     */
    initialize(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.buildAdjacencyList();
        this.calculateAllMetrics();
    }

    /**
     * Build adjacency list representation of the network
     */
    buildAdjacencyList() {
        this.adjacencyList.clear();
        
        // Initialize adjacency list for all nodes
        this.nodes.forEach((node, index) => {
            const nodeId = node.id || node.name || index;
            this.adjacencyList.set(nodeId, new Set());
        });

        // Add edges to adjacency list
        this.edges.forEach(edge => {
            const startId = edge.startNode?.id || edge.startNode?.name || 'unknown';
            const endId = edge.endNode?.id || edge.endNode?.name || 'unknown';
            
            if (this.adjacencyList.has(startId) && this.adjacencyList.has(endId)) {
                this.adjacencyList.get(startId).add(endId);
                this.adjacencyList.get(endId).add(startId); // Assuming undirected graph
            }
        });
    }

    /**
     * Calculate all network metrics for all nodes
     */
    calculateAllMetrics() {
        this.nodeMetrics.clear();
        
        this.nodes.forEach(node => {
            const metrics = {
                degree: this.calculateDegree(node.id),
                betweennessCentrality: 0, // Will be calculated separately
                closenessCentrality: 0,   // Will be calculated separately
                clusteringCoefficient: this.calculateClusteringCoefficient(node.id),
                eccentricity: 0           // Will be calculated separately
            };
            this.nodeMetrics.set(node.id, metrics);
        });

        // Calculate centrality measures that require global computation
        this.calculateBetweennessCentrality();
        this.calculateClosenessCentrality();
        this.calculateEccentricity();
    }

    /**
     * Calculate degree centrality for a node
     * @param {string|number} nodeId - Node identifier
     * @returns {number} Degree of the node
     */
    calculateDegree(nodeId) {
        const neighbors = this.adjacencyList.get(nodeId);
        return neighbors ? neighbors.size : 0;
    }

    /**
     * Calculate clustering coefficient for a node
     * @param {string|number} nodeId - Node identifier
     * @returns {number} Clustering coefficient (0-1)
     */
    calculateClusteringCoefficient(nodeId) {
        const neighbors = this.adjacencyList.get(nodeId);
        if (!neighbors || neighbors.size < 2) {
            return 0;
        }

        const neighborArray = Array.from(neighbors);
        let edgeCount = 0;
        
        // Count edges between neighbors
        for (let i = 0; i < neighborArray.length; i++) {
            for (let j = i + 1; j < neighborArray.length; j++) {
                const neighbor1 = neighborArray[i];
                const neighbor2 = neighborArray[j];
                
                if (this.adjacencyList.get(neighbor1).has(neighbor2)) {
                    edgeCount++;
                }
            }
        }

        const maxPossibleEdges = (neighbors.size * (neighbors.size - 1)) / 2;
        return maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;
    }

    /**
     * Calculate betweenness centrality for all nodes using Brandes' algorithm
     */
    calculateBetweennessCentrality() {
        const betweenness = new Map();
        
        // Initialize betweenness values
        this.nodes.forEach(node => {
            betweenness.set(node.id, 0);
        });

        // For each node as source
        this.nodes.forEach(sourceNode => {
            const s = sourceNode.id;
            const stack = [];
            const predecessors = new Map();
            const sigma = new Map();
            const distance = new Map();
            const delta = new Map();

            // Initialize
            this.nodes.forEach(node => {
                predecessors.set(node.id, []);
                sigma.set(node.id, 0);
                distance.set(node.id, -1);
                delta.set(node.id, 0);
            });

            sigma.set(s, 1);
            distance.set(s, 0);

            const queue = [s];

            // BFS
            while (queue.length > 0) {
                const v = queue.shift();
                stack.push(v);

                const neighbors = this.adjacencyList.get(v);
                if (neighbors) {
                    neighbors.forEach(w => {
                        // First time we found shortest path to w?
                        if (distance.get(w) < 0) {
                            queue.push(w);
                            distance.set(w, distance.get(v) + 1);
                        }
                        
                        // Shortest path to w via v?
                        if (distance.get(w) === distance.get(v) + 1) {
                            sigma.set(w, sigma.get(w) + sigma.get(v));
                            predecessors.get(w).push(v);
                        }
                    });
                }
            }

            // Accumulation
            while (stack.length > 0) {
                const w = stack.pop();
                predecessors.get(w).forEach(v => {
                    delta.set(v, delta.get(v) + (sigma.get(v) / sigma.get(w)) * (1 + delta.get(w)));
                });
                
                if (w !== s) {
                    betweenness.set(w, betweenness.get(w) + delta.get(w));
                }
            }
        });

        // Normalize and store results
        const n = this.nodes.length;
        const normalizationFactor = n > 2 ? 2.0 / ((n - 1) * (n - 2)) : 1;

        betweenness.forEach((value, nodeId) => {
            const metrics = this.nodeMetrics.get(nodeId);
            if (metrics) {
                metrics.betweennessCentrality = value * normalizationFactor;
            }
        });
    }

    /**
     * Calculate closeness centrality for all nodes
     */
    calculateClosenessCentrality() {
        this.nodes.forEach(sourceNode => {
            const distances = this.calculateShortestPaths(sourceNode.id);
            let totalDistance = 0;
            let reachableNodes = 0;

            distances.forEach((distance, nodeId) => {
                if (distance > 0 && distance < Infinity) {
                    totalDistance += distance;
                    reachableNodes++;
                }
            });

            const metrics = this.nodeMetrics.get(sourceNode.id);
            if (metrics) {
                metrics.closenessCentrality = reachableNodes > 0 ? reachableNodes / totalDistance : 0;
            }
        });
    }

    /**
     * Calculate eccentricity for all nodes
     */
    calculateEccentricity() {
        this.nodes.forEach(sourceNode => {
            const distances = this.calculateShortestPaths(sourceNode.id);
            let maxDistance = 0;

            distances.forEach((distance, nodeId) => {
                if (distance > 0 && distance < Infinity) {
                    maxDistance = Math.max(maxDistance, distance);
                }
            });

            const metrics = this.nodeMetrics.get(sourceNode.id);
            if (metrics) {
                metrics.eccentricity = maxDistance;
            }
        });
    }

    /**
     * Calculate shortest paths from a source node to all other nodes using BFS
     * @param {string|number} sourceId - Source node identifier
     * @returns {Map} Map of nodeId -> distance
     */
    calculateShortestPaths(sourceId) {
        const distances = new Map();
        const visited = new Set();
        const queue = [{ nodeId: sourceId, distance: 0 }];

        // Initialize distances
        this.nodes.forEach(node => {
            distances.set(node.id, Infinity);
        });
        distances.set(sourceId, 0);

        while (queue.length > 0) {
            const { nodeId, distance } = queue.shift();
            
            if (visited.has(nodeId)) continue;
            visited.add(nodeId);

            const neighbors = this.adjacencyList.get(nodeId);
            if (neighbors) {
                neighbors.forEach(neighborId => {
                    if (!visited.has(neighborId)) {
                        const newDistance = distance + 1;
                        if (newDistance < distances.get(neighborId)) {
                            distances.set(neighborId, newDistance);
                            queue.push({ nodeId: neighborId, distance: newDistance });
                        }
                    }
                });
            }
        }

        return distances;
    }

    /**
     * Find shortest path between two nodes
     * @param {string|number} startId - Start node identifier
     * @param {string|number} endId - End node identifier
     * @returns {Array} Array of node IDs representing the path, or empty array if no path exists
     */
    findShortestPath(startId, endId) {
        if (startId === endId) return [startId];

        const visited = new Set();
        const queue = [{ nodeId: startId, path: [startId] }];

        while (queue.length > 0) {
            const { nodeId, path } = queue.shift();
            
            if (visited.has(nodeId)) continue;
            visited.add(nodeId);

            const neighbors = this.adjacencyList.get(nodeId);
            if (neighbors) {
                for (const neighborId of neighbors) {
                    if (neighborId === endId) {
                        return [...path, neighborId];
                    }
                    
                    if (!visited.has(neighborId)) {
                        queue.push({ 
                            nodeId: neighborId, 
                            path: [...path, neighborId] 
                        });
                    }
                }
            }
        }

        return []; // No path found
    }

    /**
     * Get network-wide statistics
     * @returns {Object} Object containing various network statistics
     */
    getNetworkStatistics() {
        if (this.nodes.length === 0) return {};

        const degrees = this.nodes.map(node => this.nodeMetrics.get(node.id).degree);
        const clusteringCoefficients = this.nodes.map(node => this.nodeMetrics.get(node.id).clusteringCoefficient);
        
        return {
            nodeCount: this.nodes.length,
            edgeCount: this.edges.length,
            density: this.calculateNetworkDensity(),
            averageDegree: degrees.reduce((sum, degree) => sum + degree, 0) / degrees.length,
            maxDegree: Math.max(...degrees),
            minDegree: Math.min(...degrees),
            averageClusteringCoefficient: clusteringCoefficients.reduce((sum, cc) => sum + cc, 0) / clusteringCoefficients.length,
            diameter: this.calculateNetworkDiameter(),
            radius: this.calculateNetworkRadius()
        };
    }

    /**
     * Calculate network density
     * @returns {number} Network density (0-1)
     */
    calculateNetworkDensity() {
        const n = this.nodes.length;
        if (n < 2) return 0;
        
        const maxPossibleEdges = (n * (n - 1)) / 2;
        return this.edges.length / maxPossibleEdges;
    }

    /**
     * Calculate network diameter (maximum eccentricity)
     * @returns {number} Network diameter
     */
    calculateNetworkDiameter() {
        let maxEccentricity = 0;
        this.nodeMetrics.forEach(metrics => {
            maxEccentricity = Math.max(maxEccentricity, metrics.eccentricity);
        });
        return maxEccentricity;
    }

    /**
     * Calculate network radius (minimum eccentricity)
     * @returns {number} Network radius
     */
    calculateNetworkRadius() {
        let minEccentricity = Infinity;
        this.nodeMetrics.forEach(metrics => {
            if (metrics.eccentricity > 0) {
                minEccentricity = Math.min(minEccentricity, metrics.eccentricity);
            }
        });
        return minEccentricity === Infinity ? 0 : minEccentricity;
    }

    /**
     * Get metrics for a specific node
     * @param {string|number} nodeId - Node identifier
     * @returns {Object} Node metrics object
     */
    getNodeMetrics(nodeId) {
        return this.nodeMetrics.get(nodeId) || {};
    }

    /**
     * Get all node metrics
     * @returns {Map} Map of nodeId -> metrics
     */
    getAllNodeMetrics() {
        return new Map(this.nodeMetrics);
    }

    /**
     * Find nodes with highest centrality values
     * @param {string} centralityType - Type of centrality ('degree', 'betweenness', 'closeness')
     * @param {number} count - Number of top nodes to return
     * @returns {Array} Array of {nodeId, value} objects sorted by centrality
     */
    getTopCentralNodes(centralityType, count = 5) {
        const validTypes = ['degree', 'betweennessCentrality', 'closenessCentrality'];
        if (!validTypes.includes(centralityType)) {
            throw new Error(`Invalid centrality type: ${centralityType}`);
        }

        const nodeValues = [];
        this.nodeMetrics.forEach((metrics, nodeId) => {
            nodeValues.push({
                nodeId: nodeId,
                value: metrics[centralityType]
            });
        });

        return nodeValues
            .sort((a, b) => b.value - a.value)
            .slice(0, count);
    }

    /**
     * Detect communities using simple modularity-based approach
     * @returns {Array} Array of community objects with member node IDs
     */
    detectCommunities() {
        // Simple community detection using connected components
        // For more advanced algorithms, consider implementing Louvain or other methods
        
        const visited = new Set();
        const communities = [];

        this.nodes.forEach(node => {
            if (!visited.has(node.id)) {
                const community = this.getConnectedComponent(node.id, visited);
                if (community.length > 0) {
                    communities.push({
                        id: communities.length,
                        members: community,
                        size: community.length
                    });
                }
            }
        });

        return communities;
    }

    /**
     * Get connected component starting from a node
     * @param {string|number} startId - Starting node ID
     * @param {Set} visited - Set of already visited nodes
     * @returns {Array} Array of node IDs in the connected component
     */
    getConnectedComponent(startId, visited) {
        const component = [];
        const stack = [startId];

        while (stack.length > 0) {
            const nodeId = stack.pop();
            
            if (visited.has(nodeId)) continue;
            visited.add(nodeId);
            component.push(nodeId);

            const neighbors = this.adjacencyList.get(nodeId);
            if (neighbors) {
                neighbors.forEach(neighborId => {
                    if (!visited.has(neighborId)) {
                        stack.push(neighborId);
                    }
                });
            }
        }

        return component;
    }
}