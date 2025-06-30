import * as THREE from 'three';

export class NeighborhoodHighlighter {
    constructor(scene, stateManager) {
        this.scene = scene;
        this.stateManager = stateManager;
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
     * @param {Object} node - The center node of the neighborhood
     * @param {number} hops - Number of hops to include in the neighborhood (1 or 2)
     * @param {boolean} dimOthers - Whether to dim nodes outside the neighborhood
     */
    highlightNeighborhood(node, hops = 1, dimOthers = true) {
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
            this.highlightEdge(edge);
        });
        
        // Dim other nodes and edges if requested
        if (dimOthers) {
            this.dimOthersInScene(neighborhood.nodes, neighborhood.edges);
        }
    }
    
    /**
     * Find all nodes and edges in the neighborhood of a given node
     * @param {Object} centerNode - The center node
     * @param {number} hops - Number of hops to include
     * @returns {Object} - Object containing sets of nodes and edges in the neighborhood
     */
    findNeighborhood(centerNode, hops) {
        const neighborhood = {
            nodes: new Set([centerNode.mesh]),
            edges: new Set()
        };
        
        // Queue for breadth-first search
        const queue = [{node: centerNode, distance: 0}];
        const visited = new Set([centerNode.mesh.id]);
        
        while (queue.length > 0) {
            const {node, distance} = queue.shift();
            
            // Stop if we've reached the maximum hop distance
            if (distance >= hops) continue;
            
            // Find all edges connected to this node
            this.scene.traverse(object => {
                if (object.userData && object.userData.type === 'edge') {
                    const edge = object.userData.edge;
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
                        queue.push({node: connectedNode, distance: distance + 1});
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
     * @param {Object} nodeMesh - The mesh of the node to highlight
     * @param {string} type - Type of highlight ('center' or 'neighbor')
     */
    highlightNode(nodeMesh, type) {
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
     * @param {Object} edgeMesh - The mesh of the edge to highlight
     */
    highlightEdge(edgeMesh) {
        if (!edgeMesh || this.highlightedEdges.has(edgeMesh.id)) return;
        
        // Store original material for later restoration
        this.originalMaterials.set(edgeMesh.id, edgeMesh.material);
        
        // Apply highlight material
        edgeMesh.material = this.edgeHighlightMaterial.clone();
        
        this.highlightedEdges.add(edgeMesh.id);
    }
    
    /**
     * Dim all nodes and edges not in the neighborhood
     * @param {Set} neighborhoodNodes - Set of nodes in the neighborhood
     * @param {Set} neighborhoodEdges - Set of edges in the neighborhood
     */
    dimOthersInScene(neighborhoodNodes, neighborhoodEdges) {
        this.scene.traverse(object => {
            // Skip objects that are already highlighted
            if (this.highlightedNodes.has(object.id) || this.highlightedEdges.has(object.id)) {
                return;
            }
            
            // Dim nodes
            if (object.userData && object.userData.type === 'node') {
                // Store original material
                this.originalMaterials.set(object.id, object.material);
                
                // Apply dim material
                object.material = this.dimMaterial.clone();
            }
            
            // Dim edges
            else if (object.userData && object.userData.type === 'edge') {
                // Store original material
                this.originalMaterials.set(object.id, object.material);
                
                // Apply dim material
                object.material = this.edgeDimMaterial.clone();
            }
        });
    }
    
    /**
     * Clear all highlights and restore original materials
     */
    clearHighlights() {
        // Restore original materials
        this.originalMaterials.forEach((material, id) => {
            const object = this.scene.getObjectById(id);
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