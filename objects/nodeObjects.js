import * as THREE from 'three';

/**
 * NodeObjects - Sammlung verschiedener polygonaler Körper für Node-Visualisierung
 * Bietet verschiedene geometrische Formen für die Darstellung von Netzwerkknoten
 */

export class NodeObjects {
    constructor() {
        this.geometries = new Map();
        this.materials = new Map();
        this.cache = new Map();

        // Standard-Material für alle Nodes
        this.defaultMaterial = new THREE.MeshPhongMaterial({
            color: 0x3498db,
            shininess: 30,
            transparent: false
        });

        // Highlight-Material für selektierte Nodes
        this.highlightMaterial = new THREE.MeshPhongMaterial({
            color: 0x2ecc71,
            shininess: 50,
            transparent: false
        });

        // Hover-Material für hervorgehobene Nodes
        this.hoverMaterial = new THREE.MeshPhongMaterial({
            color: 0xf39c12,
            shininess: 40,
            transparent: false
        });

        this.initializeGeometries();
    }

    /**
     * Initialisiert alle verfügbaren Geometrien
     */
    initializeGeometries() {
        // Sphere (Standard)
        this.geometries.set('sphere', (radius = 0.2, segments = 16) =>
            new THREE.SphereGeometry(radius, segments, segments)
        );

        // Cube/Box
        this.geometries.set('cube', (size = 0.4) =>
            new THREE.BoxGeometry(size, size, size)
        );

        // Cylinder
        this.geometries.set('cylinder', (radiusTop = 0.2, radiusBottom = 0.2, height = 0.4, segments = 8) =>
            new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments)
        );

        // Cone
        this.geometries.set('cone', (radius = 0.2, height = 0.4, segments = 8) =>
            new THREE.ConeGeometry(radius, height, segments)
        );

        // Tetrahedron (4 faces)
        this.geometries.set('tetrahedron', (radius = 0.25) =>
            new THREE.TetrahedronGeometry(radius)
        );

        // Octahedron (8 faces)
        this.geometries.set('octahedron', (radius = 0.25) =>
            new THREE.OctahedronGeometry(radius)
        );

        // Dodecahedron (12 faces)
        this.geometries.set('dodecahedron', (radius = 0.25) =>
            new THREE.DodecahedronGeometry(radius)
        );

        // Icosahedron (20 faces)
        this.geometries.set('icosahedron', (radius = 0.25) =>
            new THREE.IcosahedronGeometry(radius)
        );

        // Torus
        this.geometries.set('torus', (radius = 0.2, tube = 0.08, radialSegments = 8, tubularSegments = 6) =>
            new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments)
        );

        // Prism (dreieckig)
        this.geometries.set('prism', (radius = 0.2, height = 0.4) => {
            const shape = new THREE.Shape();
            const points = [];
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2;
                points.push(new THREE.Vector2(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius
                ));
            }
            shape.setFromPoints(points);
            return new THREE.ExtrudeGeometry(shape, {
                depth: height,
                bevelEnabled: false
            });
        });

        // Hexagonal Prism
        this.geometries.set('hexagon', (radius = 0.2, height = 0.4) => {
            const shape = new THREE.Shape();
            const points = [];
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                points.push(new THREE.Vector2(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius
                ));
            }
            shape.setFromPoints(points);
            return new THREE.ExtrudeGeometry(shape, {
                depth: height,
                bevelEnabled: false
            });
        });

        // Star
        this.geometries.set('star', (outerRadius = 0.25, innerRadius = 0.15, height = 0.1) => {
            const shape = new THREE.Shape();
            const points = [];
            for (let i = 0; i < 10; i++) {
                const angle = (i / 10) * Math.PI * 2;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                points.push(new THREE.Vector2(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius
                ));
            }
            shape.setFromPoints(points);
            return new THREE.ExtrudeGeometry(shape, {
                depth: height,
                bevelEnabled: false
            });
        });

        // Ring/Donut
        this.geometries.set('ring', (innerRadius = 0.15, outerRadius = 0.25, height = 0.08) => {
            const outerShape = new THREE.Shape();
            const innerShape = new THREE.Shape();

            // Outer circle
            const outerPoints = [];
            for (let i = 0; i < 32; i++) {
                const angle = (i / 32) * Math.PI * 2;
                outerPoints.push(new THREE.Vector2(
                    Math.cos(angle) * outerRadius,
                    Math.sin(angle) * outerRadius
                ));
            }
            outerShape.setFromPoints(outerPoints);

            // Inner circle (hole)
            const innerPoints = [];
            for (let i = 0; i < 32; i++) {
                const angle = (i / 32) * Math.PI * 2;
                innerPoints.push(new THREE.Vector2(
                    Math.cos(angle) * innerRadius,
                    Math.sin(angle) * innerRadius
                ));
            }
            innerShape.setFromPoints(innerPoints);

            outerShape.holes.push(innerShape);

            return new THREE.ExtrudeGeometry(outerShape, {
                depth: height,
                bevelEnabled: false
            });
        });

        // Capsule (Pill shape)
        this.geometries.set('capsule', (radius = 0.15, height = 0.3) => {
            const capsuleGeometry = new THREE.CapsuleGeometry(radius, height);
            return capsuleGeometry;
        });

        // Ellipsoid
        this.geometries.set('ellipsoid', (radiusX = 0.25, radiusY = 0.15, radiusZ = 0.2, segments = 16) => {
            const geometry = new THREE.SphereGeometry(1, segments, segments);
            geometry.scale(radiusX, radiusY, radiusZ);
            return geometry;
        });

        // Pyramid (square base)
        this.geometries.set('pyramid', (baseSize = 0.4, height = 0.4) => {
            const geometry = new THREE.ConeGeometry(baseSize / 2, height, 4);
            return geometry;
        });

        // Diamond/Rhombus
        this.geometries.set('diamond', (width = 0.3, height = 0.5, depth = 0.2) => {
            const geometry = new THREE.OctahedronGeometry(1);
            geometry.scale(width / 2, height / 2, depth / 2);
            return geometry;
        });
    }

    /**
     * Erstellt ein Node-Mesh mit der angegebenen Geometrie
     */
    createNodeMesh(geometryType = 'sphere', options = {}) {
        const {
            size = 1.0,
            color = 0x3498db,
            position = new THREE.Vector3(0, 0, 0),
            materialType = 'phong',
            wireframe = false,
            transparent = false,
            opacity = 1.0
        } = options;

        // Cache-Key für Performance
        const cacheKey = `${geometryType}_${size}_${color}_${wireframe}`;
        if (this.cache.has(cacheKey)) {
            const cachedMesh = this.cache.get(cacheKey).clone();
            cachedMesh.position.copy(position);
            return cachedMesh;
        }

        // Geometrie erstellen
        const geometryFactory = this.geometries.get(geometryType);
        if (!geometryFactory) {
            console.warn(`Unbekannte Geometrie: ${geometryType}, verwende Sphere`);
            const sphereFactory = this.geometries.get('sphere');
            var geometry = sphereFactory(0.2 * size);
        } else {
            var geometry = geometryFactory(size);
        }

        // Material erstellen
        let material;
        switch (materialType) {
            case 'basic':
                material = new THREE.MeshBasicMaterial({
                    color: color,
                    wireframe: wireframe,
                    transparent: transparent,
                    opacity: opacity
                });
                break;
            case 'lambert':
                material = new THREE.MeshLambertMaterial({
                    color: color,
                    wireframe: wireframe,
                    transparent: transparent,
                    opacity: opacity
                });
                break;
            case 'phong':
            default:
                material = new THREE.MeshPhongMaterial({
                    color: color,
                    shininess: 30,
                    wireframe: wireframe,
                    transparent: transparent,
                    opacity: opacity
                });
                break;
        }

        // Mesh erstellen
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);

        // UserData für Interaktion
        mesh.userData = {
            type: 'node',
            geometryType: geometryType,
            originalColor: color,
            size: size
        };

        // In Cache speichern
        this.cache.set(cacheKey, mesh.clone());

        return mesh;
    }

    /**
     * Erstellt alle verfügbaren Node-Typen als Preview
     */
    createAllNodeTypes(options = {}) {
        const nodeTypes = Array.from(this.geometries.keys());
        const meshes = [];

        nodeTypes.forEach((type, index) => {
            const mesh = this.createNodeMesh(type, {
                ...options,
                position: new THREE.Vector3(index * 0.6, 0, 0)
            });
            meshes.push(mesh);
        });

        return meshes;
    }

    /**
     * Gibt alle verfügbaren Node-Typen zurück
     */
    getAvailableTypes() {
        return Array.from(this.geometries.keys());
    }

    /**
     * Aktualisiert das Material eines Node-Meshes
     */
    updateNodeMaterial(mesh, materialType, options = {}) {
        if (!mesh || !mesh.material) return;

        const { color, wireframe = false, transparent = false, opacity = 1.0 } = options;

        switch (materialType) {
            case 'default':
                mesh.material = this.defaultMaterial.clone();
                if (color) mesh.material.color.setHex(color);
                break;
            case 'highlight':
                mesh.material = this.highlightMaterial.clone();
                if (color) mesh.material.color.setHex(color);
                break;
            case 'hover':
                mesh.material = this.hoverMaterial.clone();
                if (color) mesh.material.color.setHex(color);
                break;
        }

        mesh.material.wireframe = wireframe;
        mesh.material.transparent = transparent;
        mesh.material.opacity = opacity;
    }

    /**
     * Bereinigt Cache und freigegebene Ressourcen
     */
    dispose() {
        // Geometrien freigeben
        this.geometries.clear();

        // Cache freigeben
        this.cache.forEach(mesh => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        this.cache.clear();

        // Materialien freigeben
        if (this.defaultMaterial) this.defaultMaterial.dispose();
        if (this.highlightMaterial) this.highlightMaterial.dispose();
        if (this.hoverMaterial) this.hoverMaterial.dispose();
    }

    /**
     * Gibt Informationen über einen Node-Typ zurück
     */
    getNodeTypeInfo(type) {
        const descriptions = {
            sphere: { name: 'Kugel', faces: '∞', description: 'Klassische sphärische Form' },
            cube: { name: 'Würfel', faces: 6, description: 'Regelmäßiger Hexaeder' },
            cylinder: { name: 'Zylinder', faces: 3, description: 'Gerader zylindrischer Körper' },
            cone: { name: 'Kegel', faces: 2, description: 'Konischer Körper' },
            tetrahedron: { name: 'Tetraeder', faces: 4, description: 'Regelmäßiges Vierflach' },
            octahedron: { name: 'Oktaeder', faces: 8, description: 'Regelmäßiges Achtflach' },
            dodecahedron: { name: 'Dodekaeder', faces: 12, description: 'Regelmäßiges Zwölfflach' },
            icosahedron: { name: 'Ikosaeder', faces: 20, description: 'Regelmäßiges Zwanzigflach' },
            torus: { name: 'Torus', faces: '∞', description: 'Ringförmiger Körper' },
            prism: { name: 'Prisma', faces: 5, description: 'Dreieckiges Prisma' },
            hexagon: { name: 'Sechseck', faces: 8, description: 'Sechseckiges Prisma' },
            star: { name: 'Stern', faces: 10, description: 'Sternförmiger Körper' },
            ring: { name: 'Ring', faces: '∞', description: 'Ring mit Loch' },
            capsule: { name: 'Kapsel', faces: '∞', description: 'Pillenkörper' },
            ellipsoid: { name: 'Ellipsoid', faces: '∞', description: 'Elliptischer Körper' },
            pyramid: { name: 'Pyramide', faces: 5, description: 'Quadratische Pyramide' },
            diamond: { name: 'Diamant', faces: 8, description: 'Rautenförmiger Körper' }
        };

        return descriptions[type] || { name: 'Unbekannt', faces: '?', description: 'Unbekannte Form' };
    }
}

// Factory-Funktion für einfache Instanziierung
export function createNodeObjects() {
    return new NodeObjects();
}

// Export für direkten Zugriff auf einzelne Geometrien
export const NODE_TYPES = {
    SPHERE: 'sphere',
    CUBE: 'cube',
    CYLINDER: 'cylinder',
    CONE: 'cone',
    TETRAHEDRON: 'tetrahedron',
    OCTAHEDRON: 'octahedron',
    DODECAHEDRON: 'dodecahedron',
    ICOSAHEDRON: 'icosahedron',
    TORUS: 'torus',
    PRISM: 'prism',
    HEXAGON: 'hexagon',
    STAR: 'star',
    RING: 'ring',
    CAPSULE: 'capsule',
    ELLIPSOID: 'ellipsoid',
    PYRAMID: 'pyramid',
    DIAMOND: 'diamond'
};
