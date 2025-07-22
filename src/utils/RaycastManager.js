import * as THREE from 'three';

export class RaycastManager {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Line.threshold = 5; // Reduzierter Threshold fuer praezisere Edge-Erkennung
        this.raycaster.params.Points.threshold = 3; // Threshold fuer Punkte
        this.raycaster.params.Mesh.threshold = 0.1; // Threshold fuer Mesh-Objekte (Edges als TubeGeometry)
        this.mouse = new THREE.Vector2();
        
        // Cache fuer durchsuchbare Objekte
        this.objectsCache = new Set();
        this.nodeCache = new Set();
        this.edgeCache = new Set();
        this.lastCacheUpdate = 0;
        this.cacheUpdateInterval = 500; // Cache-Update-Intervall in ms (reduziert fuer bessere Reaktionszeit)
        
        // Debug-Modus
        this.debug = false;
    }

    updateMousePosition(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // Aktualisiert den Cache der durchsuchbaren Objekte
    updateObjectsCache() {
        const now = performance.now();
        if (now - this.lastCacheUpdate > this.cacheUpdateInterval) {
            this.objectsCache.clear();
            this.nodeCache.clear();
            this.edgeCache.clear();
            
            this.scene.traverse((object) => {
                // Pruefe, ob das Objekt ein Mesh oder eine Line ist und userData hat
                if (object.userData) {
                    if (object.userData.type === 'node') {
                        this.nodeCache.add(object);
                        this.objectsCache.add(object);
                    } else if (object.userData.type === 'edge') {
                        this.edgeCache.add(object);
                        this.objectsCache.add(object);
                    }
                }
            });
            
            if (this.debug) {
                console.log(`Cache aktualisiert: ${this.nodeCache.size} Knoten, ${this.edgeCache.size} Kanten`);
            }
            
            this.lastCacheUpdate = now;
        }
    }

    // Findet das erste Objekt unter dem Mauszeiger
    findIntersectedObject() {
        this.updateObjectsCache();
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Pruefe zuerst Knoten (hoehere Prioritaet)
        const nodeIntersects = this.raycaster.intersectObjects([...this.nodeCache]);
        if (nodeIntersects.length > 0) {
            return nodeIntersects[0].object;
        }

        // Wenn keine Knoten getroffen wurden, pruefe Kanten
        const edgeIntersects = this.raycaster.intersectObjects([...this.edgeCache]);
        if (edgeIntersects.length > 0) {
            // Finde die naechste Edge basierend auf Distanz
            const closestEdge = edgeIntersects.reduce((closest, current) => {
                return current.distance < closest.distance ? current : closest;
            });
            
            if (this.debug) {
                console.log(`Edge intersected: ${closestEdge.object.name}, distance: ${closestEdge.distance.toFixed(3)}`);
            }
            
            return closestEdge.object;
        }

        return null;
    }

    // Findet alle Objekte unter dem Mauszeiger
    findAllIntersectedObjects() {
        this.updateObjectsCache();
        this.raycaster.setFromCamera(this.mouse, this.camera);

        return this.raycaster.intersectObjects([...this.objectsCache])
            .map(intersect => intersect.object);
    }

    // Findet Objekte in der Naehe eines bestimmten Punktes
    findObjectsNearPoint(point, radius = 5) {
        this.updateObjectsCache();
        
        const nearbyObjects = [];
        
        // Pruefe alle Objekte im Cache
        this.objectsCache.forEach(object => {
            if (object.position) {
                const distance = point.distanceTo(object.position);
                if (distance <= radius) {
                    nearbyObjects.push({
                        object: object,
                        distance: distance
                    });
                }
            }
        });
        
        // Sortiere nach Entfernung
        return nearbyObjects.sort((a, b) => a.distance - b.distance)
            .map(item => item.object);
    }

    // Performance-Optimierungen
    setCacheUpdateInterval(interval) {
        this.cacheUpdateInterval = interval;
    }

    clearCache() {
        this.objectsCache.clear();
        this.nodeCache.clear();
        this.edgeCache.clear();
        this.lastCacheUpdate = 0;
    }
    
    // Debug-Funktionen
    setDebugMode(enabled) {
        this.debug = enabled;
    }
    
    // Kompatibilitaets-Methode fuer main.js
    raycast(mouse, objects) {
        this.mouse.copy(mouse);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Filtere undefined/null Objekte heraus
        const validObjects = objects.filter(obj => obj && obj.geometry && obj.material);
        
        if (validObjects.length === 0) {
            return [];
        }
        
        return this.raycaster.intersectObjects(validObjects);
    }
}
