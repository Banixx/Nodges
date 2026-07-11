
interface AnalyzerNode {
    id: string | number;
    name?: string;
    [key: string]: any;
}

interface AnalyzerEdge {
    startNode: { id: string | number; name?: string };
    endNode: { id: string | number; name?: string };
    [key: string]: any;
}

interface NodeMetrics {
    degree: number;
    betweennessCentrality: number;
    closenessCentrality: number;
    clusteringCoefficient: number;
    eccentricity: number;
}

interface QueueItem {
    nodeId: string | number;
    distance: number;
}

interface PathQueueItem {
    nodeId: string | number;
    path: (string | number)[];
}

interface NetworkStatistics {
    nodeCount?: number;
    edgeCount?: number;
    density?: number;
    averageDegree?: number;
    maxDegree?: number;
    minDegree?: number;
    averageClusteringCoefficient?: number;
    diameter?: number;
    radius?: number;
}

interface CentralityValue {
    nodeId: string | number;
    value: number;
}

interface Community {
    id: number;
    members: (string | number)[];
    size: number;
}

/**
 * NetworkAnalyzer provides various network analysis algorithms and metrics
 * for analyzing the structure and properties of network graphs.
 */
export class NetworkAnalyzer {
    private nodes: AnalyzerNode[];
    private edges: AnalyzerEdge[];
    private adjacencyList: Map<string | number, Set<string | number>>;
    private nodeMetrics: Map<string | number, NodeMetrics>;

    constructor() {
        this.nodes = [];
        this.edges = [];
        this.adjacencyList = new Map();
        this.nodeMetrics = new Map();
    }

    /**
     * Initialize the analyzer with current network data
     */
    initialize(nodes: AnalyzerNode[], edges: AnalyzerEdge[]) {
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
            const nodeId = node.id !== undefined ? node.id : (node.name || index);
            this.adjacencyList.set(nodeId, new Set());
        });

        // Add edges to adjacency list
        this.edges.forEach(edge => {
            const startId = edge.startNode?.id !== undefined ? edge.startNode.id : (edge.startNode?.name || 'unknown');
            const endId = edge.endNode?.id !== undefined ? edge.endNode.id : (edge.endNode?.name || 'unknown');

            if (this.adjacencyList.has(startId) && this.adjacencyList.has(endId)) {
                this.adjacencyList.get(startId)!.add(endId);
                this.adjacencyList.get(endId)!.add(startId); // Assuming undirected graph
            }
        });
    }

    /**
     * Calculate all network metrics for all nodes
     */
    calculateAllMetrics() {
        this.nodeMetrics.clear();

        this.nodes.forEach(node => {
            const metrics: NodeMetrics = {
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
     */
    calculateDegree(nodeId: string | number): number {
        const neighbors = this.adjacencyList.get(nodeId);
        return neighbors ? neighbors.size : 0;
    }

    /**
     * Calculate clustering coefficient for a node
     */
    calculateClusteringCoefficient(nodeId: string | number): number {
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

                const neighbor1Adjacency = this.adjacencyList.get(neighbor1);
                if (neighbor1Adjacency && neighbor1Adjacency.has(neighbor2)) {
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
        const betweenness = new Map<string | number, number>();

        // Initialize betweenness values
        this.nodes.forEach(node => {
            betweenness.set(node.id, 0);
        });

        // For each node as source
        this.nodes.forEach(sourceNode => {
            const s = sourceNode.id;
            const stack: (string | number)[] = [];
            const predecessors = new Map<string | number, (string | number)[]>();
            const sigma = new Map<string | number, number>();
            const distance = new Map<string | number, number>();
            const delta = new Map<string | number, number>();

            // Initialize
            this.nodes.forEach(node => {
                predecessors.set(node.id, []);
                sigma.set(node.id, 0);
                distance.set(node.id, -1);
                delta.set(node.id, 0);
            });

            sigma.set(s, 1);
            distance.set(s, 0);

            const queue: (string | number)[] = [s];

            // BFS
            while (queue.length > 0) {
                const v = queue.shift()!;
                stack.push(v);

                const neighbors = this.adjacencyList.get(v);
                if (neighbors) {
                    neighbors.forEach(w => {
                        // First time we found shortest path to w?
                        if (distance.get(w)! < 0) {
                            queue.push(w);
                            distance.set(w, distance.get(v)! + 1);
                        }

                        // Shortest path to w via v?
                        if (distance.get(w) === distance.get(v)! + 1) {
                            sigma.set(w, sigma.get(w)! + sigma.get(v)!);
                            predecessors.get(w)!.push(v);
                        }
                    });
                }
            }

            // Accumulation
            while (stack.length > 0) {
                const w = stack.pop()!;
                predecessors.get(w)!.forEach(v => {
                    delta.set(v, delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!));
                });

                if (w !== s) {
                    betweenness.set(w, betweenness.get(w)! + delta.get(w)!);
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

            distances.forEach((distance, _nodeId) => {
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

            distances.forEach((distance, _nodeId) => {
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
     */
    calculateShortestPaths(sourceId: string | number): Map<string | number, number> {
        const distances = new Map<string | number, number>();
        const visited = new Set<string | number>();
        const queue: QueueItem[] = [{ nodeId: sourceId, distance: 0 }];

        // Initialize distances
        this.nodes.forEach(node => {
            distances.set(node.id, Infinity);
        });
        distances.set(sourceId, 0);

        while (queue.length > 0) {
            const { nodeId, distance } = queue.shift()!;

            if (visited.has(nodeId)) continue;
            visited.add(nodeId);

            const neighbors = this.adjacencyList.get(nodeId);
            if (neighbors) {
                neighbors.forEach(neighborId => {
                    if (!visited.has(neighborId)) {
                        const newDistance = distance + 1;
                        if (newDistance < distances.get(neighborId)!) {
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
     */
    findShortestPath(startId: string | number, endId: string | number): (string | number)[] {
        if (startId === endId) return [startId];

        const visited = new Set<string | number>();
        const queue: PathQueueItem[] = [{ nodeId: startId, path: [startId] }];

        while (queue.length > 0) {
            const { nodeId, path } = queue.shift()!;

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
     */
    getNetworkStatistics(): NetworkStatistics {
        if (this.nodes.length === 0) return {};

        const degrees = this.nodes.map(node => this.nodeMetrics.get(node.id)?.degree || 0);
        const clusteringCoefficients = this.nodes.map(node => this.nodeMetrics.get(node.id)?.clusteringCoefficient || 0);

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
     */
    calculateNetworkDensity(): number {
        const n = this.nodes.length;
        if (n < 2) return 0;

        const maxPossibleEdges = (n * (n - 1)) / 2;
        return this.edges.length / maxPossibleEdges;
    }

    /**
     * Calculate network diameter (maximum eccentricity)
     */
    calculateNetworkDiameter(): number {
        let maxEccentricity = 0;
        this.nodeMetrics.forEach(metrics => {
            maxEccentricity = Math.max(maxEccentricity, metrics.eccentricity);
        });
        return maxEccentricity;
    }

    /**
     * Calculate network radius (minimum eccentricity)
     */
    calculateNetworkRadius(): number {
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
     */
    getNodeMetrics(nodeId: string | number): Partial<NodeMetrics> {
        return this.nodeMetrics.get(nodeId) || {};
    }

    /**
     * Get all node metrics
     */
    getAllNodeMetrics(): Map<string | number, NodeMetrics> {
        return new Map(this.nodeMetrics);
    }

    /**
     * Find nodes with highest centrality values
     */
    getTopCentralNodes(centralityType: keyof NodeMetrics, count: number = 5): CentralityValue[] {
        const validTypes = ['degree', 'betweennessCentrality', 'closenessCentrality'];
        if (!validTypes.includes(centralityType)) {
            throw new Error(`Invalid centrality type: ${centralityType}`);
        }

        const nodeValues: CentralityValue[] = [];
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
     */
    detectCommunities(): Community[] {
        // Simple community detection using connected components

        const visited = new Set<string | number>();
        const communities: Community[] = [];

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
     */
    getConnectedComponent(startId: string | number, visited: Set<string | number>): (string | number)[] {
        const component: (string | number)[] = [];
        const stack: (string | number)[] = [startId];

        while (stack.length > 0) {
            const nodeId = stack.pop()!;

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
