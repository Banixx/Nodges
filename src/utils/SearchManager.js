import * as THREE from 'three';

export class SearchManager {
    constructor(scene, camera, stateManager) {
        this.scene = scene;
        this.camera = camera;
        this.stateManager = stateManager;
        this.searchResults = [];
        this.currentHighlightedNodes = [];
        this.searchResultsElement = document.getElementById('searchResults');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        const searchButton = document.getElementById('searchButton');
        const searchInput = document.getElementById('searchInput');
        
        searchButton.addEventListener('click', () => this.performSearch());
        
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Clear results when input is cleared
        searchInput.addEventListener('input', () => {
            if (searchInput.value === '') {
                this.clearSearchResults();
                this.clearHighlights();
            }
        });
    }
    
    performSearch() {
        const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
        if (!searchTerm) {
            this.clearSearchResults();
            this.clearHighlights();
            return;
        }
        
        this.searchResults = this.findNodes(searchTerm);
        this.displaySearchResults();
    }
    
    findNodes(searchTerm) {
        const results = [];
        
        // Search through all objects in the scene
        this.scene.traverse((object) => {
            // Check if it's a node
            if (object.userData && object.userData.type === 'node') {
                const node = object.userData.node;
                
                if (node) {
                    // Search in name
                    const name = node.mesh.name.toLowerCase();
                    if (name.includes(searchTerm)) {
                        results.push({
                            node: node,
                            mesh: node.mesh,
                            matchType: 'name',
                            matchValue: node.mesh.name
                        });
                        return;
                    }
                    
                    // Search in metadata
                    if (node.mesh.metadata) {
                        for (const [key, value] of Object.entries(node.mesh.metadata)) {
                            if (typeof value === 'string' && value.toLowerCase().includes(searchTerm)) {
                                results.push({
                                    node: node,
                                    mesh: node.mesh,
                                    matchType: key,
                                    matchValue: value
                                });
                                return;
                            } else if (typeof value === 'number' && value.toString().includes(searchTerm)) {
                                results.push({
                                    node: node,
                                    mesh: node.mesh,
                                    matchType: key,
                                    matchValue: value.toString()
                                });
                                return;
                            }
                        }
                    }
                }
            }
        });
        
        return results;
    }
    
    displaySearchResults() {
        this.clearHighlights();
        this.searchResultsElement.innerHTML = '';
        
        if (this.searchResults.length === 0) {
            this.searchResultsElement.innerHTML = '<div class="search-result-item">Keine Ergebnisse gefunden</div>';
            this.searchResultsElement.style.display = 'block';
            return;
        }
        
        this.searchResults.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.textContent = `${result.matchValue} (${result.matchType})`;
            resultItem.dataset.index = index;
            
            resultItem.addEventListener('click', () => {
                this.highlightNode(result.node);
                this.focusCamera(result.mesh);
                
                // Mark this item as selected
                document.querySelectorAll('.search-result-item').forEach(item => {
                    item.classList.remove('selected');
                });
                resultItem.classList.add('selected');
            });
            
            this.searchResultsElement.appendChild(resultItem);
        });
        
        this.searchResultsElement.style.display = 'block';
    }
    
    highlightNode(node) {
        // Clear previous highlights
        this.clearHighlights();
        
        // Apply highlight to the node
        if (node && node.mesh) {
            // Store original color to restore later
            if (!node.mesh.userData.originalColor) {
                node.mesh.userData.originalColor = node.mesh.material.color.clone();
            }
            
            // Add highlight class
            node.mesh.userData.highlighted = true;
            this.currentHighlightedNodes.push(node);
            
            // Set the state manager's selected object
            this.stateManager.setSelectedObject(node.mesh);
        }
    }
    
    focusCamera(mesh) {
        if (!mesh) return;
        
        // Get the position of the mesh
        const position = mesh.position.clone();
        
        // Calculate the direction from camera to the mesh
        const direction = new THREE.Vector3().subVectors(position, this.camera.position).normalize();
        
        // Set a distance from the mesh for the camera
        const distance = 10;
        
        // Calculate new camera position
        const newPosition = new THREE.Vector3().copy(position).sub(direction.multiplyScalar(distance));
        
        // Animate the camera movement
        this.animateCamera(newPosition, position);
    }
    
    animateCamera(targetPosition, lookAtPosition) {
        // Simple animation using TWEEN if available, otherwise just set position
        if (window.TWEEN) {
            new TWEEN.Tween(this.camera.position)
                .to({
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z
                }, 1000)
                .easing(TWEEN.Easing.Cubic.Out)
                .start();
                
            new TWEEN.Tween(this.camera.lookAt)
                .to({
                    x: lookAtPosition.x,
                    y: lookAtPosition.y,
                    z: lookAtPosition.z
                }, 1000)
                .easing(TWEEN.Easing.Cubic.Out)
                .start();
        } else {
            // Fallback without animation
            this.camera.position.copy(targetPosition);
            this.camera.lookAt(lookAtPosition);
        }
    }
    
    clearHighlights() {
        // Restore original colors and remove highlight flags
        this.currentHighlightedNodes.forEach(node => {
            if (node && node.mesh) {
                if (node.mesh.userData.originalColor) {
                    node.mesh.material.color.copy(node.mesh.userData.originalColor);
                }
                node.mesh.userData.highlighted = false;
            }
        });
        
        this.currentHighlightedNodes = [];
    }
    
    clearSearchResults() {
        this.searchResults = [];
        this.searchResultsElement.innerHTML = '';
        this.searchResultsElement.style.display = 'none';
    }
}