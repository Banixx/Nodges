import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Node {
    // Static loader for GLTF models
    static gltfLoader = new GLTFLoader();
    static modelCache = new Map();
    // Statischer Cache nur für Geometrien (Materialien werden nicht mehr gecacht)
    static geometryCache = new Map();
    static textureLoader = new THREE.TextureLoader();
    
    // Group-related static properties
    static GROUP_COLORS = [
        0xff0000, // Red
        0x00ff00, // Green
        0x0000ff, // Blue
        0xffff00, // Yellow
        0xff00ff, // Magenta
        0x00ffff, // Cyan
        0xffa500, // Orange
        0x800080, // Purple
        0x008000, // Dark Green
        0x000080  // Navy
    ];

    constructor(position, options = {}) {
        this.position = position;
        this.options = {
            type: options.type || 'cube',        // cube, icosahedron, dodecahedron, octahedron, tetrahedron, sphere, cylinder, male_icon, female_icon, diverse_icon
            size: options.size || 1,             // Grundgröße
            color: options.color || 0xff4500,    // Farbe
            glowFrequency: options.glowFrequency || 4, // Pulsgeschwindigkeit (0.25-5 Hz)
            ...options
        };
        this.originalColor = this.options.color; // Speichere die ursprüngliche Farbe
        this.groupId = null; // ID of the group this node belongs to
        
        this.mesh = this.createMesh();
        this.mesh.userData.type = 'node';        // Für spätere Identifikation
        this.mesh.userData.node = this;          // Referenz auf das Node-Objekt
        this.mesh.glow = null;
        
        // Übertrage wichtige Eigenschaften vom position-Objekt auf das Mesh
        if (position) {
            // Übertrage den Namen
            this.mesh.name = position.name || 'Unbenannter Knoten';
            
            // Übertrage die ID auf das Node-Objekt und das Mesh
            this.id = position.id;
            this.mesh.userData.id = position.id; // ID auch im userData des Mesh speichern
            
            // Übertrage Metadaten
            this.mesh.metadata = position.metadata || {};
            
            // Wenn position selbst Metadaten hat, füge diese hinzu
            if (position.metadata === undefined) {
                // Extrahiere alle Eigenschaften außer position und name als Metadaten
                const { x, y, z, position: pos, ...otherProps } = position;
                this.mesh.metadata = { ...otherProps };
            }
            
            // Copy metadata to the node object for easier access
            this.metadata = this.mesh.metadata;
        }
    }

    createMesh() {
        // Check if this is a custom model
        if (this.options.type === 'custom_model' && this.options.modelUrl) {
            return this.loadCustomModel();
        }
        
        const geometry = this.createGeometry();
        const color = this.options.color;
        const textureUrl = this.options.textureUrl;

        // Erstelle für jeden Node ein einzigartiges Material ohne Caching
        // Das verhindert das Problem, dass mehrere Nodes das gleiche Material teilen
        let material;
        
        if (textureUrl) {
            // Create material with texture
            const texture = Node.textureLoader.load(textureUrl);
            material = new THREE.MeshPhongMaterial({ 
                map: texture,
                shininess: 30,
                emissive: new THREE.Color(0x000000),
                emissiveIntensity: 0
            });
            
            // Apply color tint if specified
            if (color) {
                material.color.setHex(color);
            }
        } else {
            // Create standard material with color
            material = new THREE.MeshPhongMaterial({ 
                color: color,
                shininess: 30,
                emissive: new THREE.Color(0x000000),
                emissiveIntensity: 0
            });
        }
        
        // Speichere die ursprüngliche Farbe für Reset-Funktionen
        material.userData = {
            originalColor: color,
            textureUrl: textureUrl
        };
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Kopiere die Position
        if (this.position && this.position.x !== undefined) {
            mesh.position.set(
                this.position.x,
                this.position.y,
                this.position.z
            );
        }
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    }
    
    loadCustomModel() {
        // Create a temporary mesh that will be replaced when the model loads
        const tempGeometry = new THREE.BoxGeometry(this.options.size, this.options.size, this.options.size);
        const tempMaterial = new THREE.MeshPhongMaterial({ 
            color: this.options.color,
            opacity: 0.5,
            transparent: true
        });
        const tempMesh = new THREE.Mesh(tempGeometry, tempMaterial);
        
        // Set position
        if (this.position && this.position.x !== undefined) {
            tempMesh.position.set(
                this.position.x,
                this.position.y,
                this.position.z
            );
        }
        
        // Check if model is already in cache
        const modelUrl = this.options.modelUrl;
        const cacheKey = `model-${modelUrl}`;
        
        if (Node.modelCache.has(cacheKey)) {
            const cachedModel = Node.modelCache.get(cacheKey).clone();
            cachedModel.position.copy(tempMesh.position);
            cachedModel.userData.type = 'node';
            cachedModel.userData.node = this;
            
            // Apply scale if specified
            if (this.options.modelScale) {
                cachedModel.scale.set(
                    this.options.modelScale,
                    this.options.modelScale,
                    this.options.modelScale
                );
            }
            
            return cachedModel;
        }
        
        // Load the model
        Node.gltfLoader.load(
            modelUrl,
            (gltf) => {
                const model = gltf.scene;
                
                // Apply material color if specified
                if (this.options.color) {
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.material = new THREE.MeshPhongMaterial({ 
                                color: this.options.color,
                                shininess: 30
                            });
                        }
                    });
                }
                
                // Apply scale
                const scale = this.options.modelScale || (this.options.size / model.scale.x);
                model.scale.set(scale, scale, scale);
                
                // Copy position from temp mesh
                model.position.copy(tempMesh.position);
                
                // Set up shadow casting
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                // Add to cache
                Node.modelCache.set(cacheKey, model.clone());
                
                // Replace the temp mesh with the loaded model
                tempMesh.parent.add(model);
                tempMesh.parent.remove(tempMesh);
                
                // Update references
                model.userData.type = 'node';
                model.userData.node = this;
                this.mesh = model;
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
            }
        );
        
        return tempMesh;
    }

    createGeometry() {
        const size = this.options.size;
        const type = this.options.type.toLowerCase();
        const cacheKey = `${type}-${size}`;

        if (Node.geometryCache.has(cacheKey)) {
            return Node.geometryCache.get(cacheKey);
        }

        const depth = size / 4; // Dicke des 2D-Icons
        const extrudeSettings = {
            steps: 1,
            depth: depth,
            bevelEnabled: false
        };
        
        let geometry;

        switch(type) {
            case 'male_icon':
                {
                    const shape = new THREE.Shape();
                    // Body (rectangle)
                    shape.moveTo(-size / 4, -size / 2);
                    shape.lineTo(size / 4, -size / 2);
                    shape.lineTo(size / 4, size / 4);
                    shape.lineTo(-size / 4, size / 4);
                    shape.lineTo(-size / 4, -size / 2);

                    // Head (circle)
                    const headRadius = size / 4;
                    shape.absarc(0, size / 4 + headRadius, headRadius, 0, Math.PI * 2, false);

                    geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                }
                break;
            case 'female_icon':
                {
                    const shape = new THREE.Shape();
                    // Body (rectangle, similar to male icon)
                    shape.moveTo(-size / 4, -size / 2);
                    shape.lineTo(size / 4, -size / 2);
                    shape.lineTo(size / 4, size / 4);
                    shape.lineTo(-size / 4, size / 4);
                    shape.lineTo(-size / 4, -size / 2);

                    // Head (circle)
                    const headRadius = size / 4;
                    shape.absarc(0, size / 4 + headRadius, headRadius, 0, Math.PI * 2, false);

                    geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                }
                break;
            case 'diverse_icon':
                {
                    const shape = new THREE.Shape();
                    shape.absarc(0, 0, size / 2, 0, Math.PI * 2, false); // Simple circle

                    geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                }
                break;
            case 'icosahedron':
                geometry = new THREE.IcosahedronGeometry(size/2);
                break;
            case 'dodecahedron':
                geometry = new THREE.DodecahedronGeometry(size/2);
                break;
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(size/2);
                break;
            case 'tetrahedron':
                geometry = new THREE.TetrahedronGeometry(size/2);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(size/2, 32, 32);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(size/2, size/2, size, 32);
                break;
            case 'cube':
            default:
                geometry = new THREE.BoxGeometry(size, size, size);
                break;
        }
        Node.geometryCache.set(cacheKey, geometry);
        return geometry;
    }

    // Hilfsmethoden zum Aktualisieren der Eigenschaften
    setColor(color) {
        this.mesh.material.color.setHex(color);
    }

    setSize(size) {
        this.options.size = size;
        const newGeometry = this.createGeometry();
        this.mesh.geometry.dispose();
        this.mesh.geometry = newGeometry;
    }

    setType(type) {
        this.options.type = type;
        const newGeometry = this.createGeometry();
        this.mesh.geometry.dispose();
        this.mesh.geometry = newGeometry;
    }

    resetHighlight() {
        // Verwende die ursprüngliche Farbe aus den Material-UserData
        const originalColor = this.mesh.material.userData?.originalColor || this.originalColor || this.options.color;
        
        this.mesh.material.color.setHex(originalColor);
        this.mesh.material.emissiveIntensity = 0;
        this.mesh.material.emissive.setHex(0x000000);
        
        // Stelle auch die Opacity zurück, falls sie verändert wurde
        if (!this.mesh.material.transparent) {
            this.mesh.material.opacity = 1.0;
        }
    }
}
