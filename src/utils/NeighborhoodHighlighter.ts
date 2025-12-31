import * as THREE from 'three';
import { StateManager } from '../core/StateManager';

interface Neighborhood {
    nodes: Set<THREE.Mesh>;
    edges: Set<THREE.Object3D>;
}

interface UserData {
    type?: string;
    edge?: {
        startNode: { mesh: THREE.Mesh };
        endNode: { mesh: THREE.Mesh };
        [key: string]: any;
    };
    [key: string]: any;
}

export class NeighborhoodHighlighter {
    private scene: THREE.Scene;
    // private stateManager: StateManager;
    private highlightedNodes: Set<number>; // IDs
    private highlightedEdges: Set<number>; // IDs
    private originalMaterials: Map<number, THREE.Material | THREE.Material[]>;

    private highlightMaterial: THREE.MeshPhongMaterial;
    private edgeHighlightMaterial: THREE.MeshPhongMaterial;
    private dimMaterial: THREE.MeshPhongMaterial;
    private edgeDimMaterial: THREE.MeshPhongMaterial;

    constructor(scene: THREE.Scene, _stateManager: StateManager) {
        this.scene = scene;
        // this.stateManager = stateManager;
        this.highlightedNodes = new Set();
        this.highlightedEdges = new Set();
        this.originalMaterials = new Map();

        this.highlightMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.3,
            shininess: 50
        });

        this.edgeHighlightMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.3,
            shininess: 50,
            side: THREE.DoubleSide
        });

        this.dimMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.3,
            shininess: 10
        });

        this.edgeDimMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.3,
            shininess: 10,
            side: THREE.DoubleSide
        });
    }

    /**
     * Highlight the neighborhood of a selected node
     */
    highlightNeighborhood(node: any, hops: number = 1, dimOthers: boolean = true) {
        this.clearHighlights();

        if (!node || !node.mesh) return;

        // Find all connected nodes within specified hops
        const neighborhood = this.findNeighborhood(node, hops);

        // Highlight the center node
        this.highlightNode(node.mesh, 'center');

        // Highlight neighborhood nodes
        neighborhood.nodes.forEach(neighborNode => {
            if (neighborNode !== node.mesh) {
                this.highlightNode(neighborNode, 'neighbor');
            }
        });

        // Highlight connecting edges
        neighborhood.edges.forEach(edge => {
            this.highlightEdge(edge as THREE.Mesh); // Assuming edges are meshes
        });

        // Dim other nodes and edges if requested
        if (dimOthers) {
            this.dimOthersInScene(neighborhood.nodes, neighborhood.edges);
        }
    }

    /**
     * Find all nodes and edges in the neighborhood of a given node
     */
    findNeighborhood(centerNode: any, hops: number): Neighborhood {
        const neighborhood: Neighborhood = {
            nodes: new Set([centerNode.mesh]),
            edges: new Set()
        };

        interface QueueItem {
            node: any; // Center node type
            distance: number;
        }

        // Queue for breadth-first search
        const queue: QueueItem[] = [{ node: centerNode, distance: 0 }];
        const visited = new Set<number>([centerNode.mesh.id]);

        while (queue.length > 0) {
            const item = queue.shift();
            if (!item) break;

            const { node, distance } = item;

            // Stop if we've reached the maximum hop distance
            if (distance >= hops) continue;

            // Find all edges connected to this node
            this.scene.traverse((object: THREE.Object3D) => {
                const userData = object.userData as UserData;

                if (userData && userData.type === 'edge') {
                    const edge = userData.edge;
                    if (!edge) return;

                    let connectedNode = null;

                    // Check if this edge connects to our current node
                    if (edge.startNode.mesh.id === node.mesh.id) {
                        connectedNode = edge.endNode;
                    } else if (edge.endNode.mesh.id === node.mesh.id) {
                        connectedNode = edge.startNode;
                    }

                    // If we found a connected node that hasn't been visited
                    if (connectedNode && !visited.has(connectedNode.mesh.id)) {
                        // Add the node and edge to our neighborhood
                        neighborhood.nodes.add(connectedNode.mesh);
                        neighborhood.edges.add(object);

                        // Mark as visited and add to queue for next iteration
                        visited.add(connectedNode.mesh.id);
                        queue.push({ node: connectedNode, distance: distance + 1 });
                    }

                    // If both nodes of this edge are in our neighborhood, add the edge
                    if (visited.has(edge.startNode.mesh.id) && visited.has(edge.endNode.mesh.id)) {
                        neighborhood.edges.add(object);
                    }
                }
            });
        }

        return neighborhood;
    }

    /**
     * Highlight a specific node
     */
    highlightNode(nodeMesh: THREE.Mesh, type: 'center' | 'neighbor') {
        if (!nodeMesh || this.highlightedNodes.has(nodeMesh.id)) return;

        // Store original material for later restoration
        this.originalMaterials.set(nodeMesh.id, nodeMesh.material);

        // Apply highlight material
        if (type === 'center') {
            // Center node gets a brighter highlight
            const centerHighlightMaterial = this.highlightMaterial.clone();
            centerHighlightMaterial.emissiveIntensity = 0.5;
            nodeMesh.material = centerHighlightMaterial;
        } else {
            nodeMesh.material = this.highlightMaterial.clone();
        }

        this.highlightedNodes.add(nodeMesh.id);
    }

    /**
     * Highlight a specific edge
     */
    highlightEdge(edgeMesh: THREE.Mesh) {
        if (!edgeMesh || this.highlightedEdges.has(edgeMesh.id)) return;

        // Store original material for later restoration
        this.originalMaterials.set(edgeMesh.id, edgeMesh.material);

        // Apply highlight material
        edgeMesh.material = this.edgeHighlightMaterial.clone();

        this.highlightedEdges.add(edgeMesh.id);
    }

    /**
     * Dim all nodes and edges not in the neighborhood
     */
    dimOthersInScene(neighborhoodNodes: Set<THREE.Mesh>, neighborhoodEdges: Set<THREE.Object3D>) {
        this.scene.traverse((object: THREE.Object3D) => {
            // Skip objects that are already highlighted
            if (this.highlightedNodes.has(object.id) || this.highlightedEdges.has(object.id)) {
                return;
            }

            // Skip objects that are in the neighborhood set (double check)
            if (neighborhoodNodes.has(object as THREE.Mesh) || neighborhoodEdges.has(object)) {
                return;
            }

            const userData = object.userData as UserData;

            // Dim nodes
            if (userData && userData.type === 'node') {
                const mesh = object as THREE.Mesh;
                // Store original material
                this.originalMaterials.set(object.id, mesh.material);

                // Apply dim material
                mesh.material = this.dimMaterial.clone();
            }

            // Dim edges
            else if (userData && userData.type === 'edge') {
                const mesh = object as THREE.Mesh;
                // Store original material
                this.originalMaterials.set(object.id, mesh.material);

                // Apply dim material
                mesh.material = this.edgeDimMaterial.clone();
            }
        });
    }

    /**
     * Clear all highlights and restore original materials
     */
    clearHighlights() {
        // Restore original materials
        this.originalMaterials.forEach((material, id) => {
            const object = this.scene.getObjectById(id) as THREE.Mesh;
            if (object) {
                object.material = material;
            }
        });

        // Clear tracking sets and maps
        this.highlightedNodes.clear();
        this.highlightedEdges.clear();
        this.originalMaterials.clear();
    }
}
