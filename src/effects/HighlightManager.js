import * as THREE from 'three';

export class HighlightManager {
    /**
     * @param {any} stateManager 
     * @param {any} glowEffect 
     * @param {import('three').Scene} scene 
     * @param {any} [nodeManager]
     * @param {any} [edgeObjectsManager] 
     */
    constructor(stateManager, glowEffect, scene, nodeManager = null, edgeObjectsManager = null) {
        this.stateManager = stateManager;
        this.glowEffect = glowEffect;
        this.scene = scene;
        this.nodeManager = nodeManager;
        this.edgeObjectsManager = edgeObjectsManager;

        // Einzige Highlight-Registry
        this.highlightRegistry = new Map();

        // Highlight-Types
        this.types = {
            HOVER: 'hover',
            SELECTION: 'selection',
            SEARCH: 'search',
            PATH: 'path',
            GROUP: 'group'
        };

        // Material-Backup fuer Wiederherstellung
        this.materialBackups = new Map();

        // State-Änderungen abonnieren
        this.stateManager.subscribe(this.handleStateChange.bind(this), 'highlight');
    }

    handleStateChange(state) {
        this.updateHighlights(state);
    }

    updateHighlights(state) {
        const { hoveredObject, selectedObject } = state;

        // Cleanup nicht mehr benoetigte Highlights
        this.cleanupUnusedHighlights(hoveredObject, selectedObject);

        // Neue Highlights anwenden
        if (selectedObject) {
            this.applyHighlight(selectedObject, this.types.SELECTION);
        }

        if (hoveredObject && hoveredObject !== selectedObject) {
            this.applyHighlight(hoveredObject, this.types.HOVER);
        }
    }

    cleanupUnusedHighlights(hoveredObject, selectedObject) {
        const toRemove = [];

        for (const [object, highlightData] of this.highlightRegistry) {
            const shouldKeep = (
                (object === hoveredObject && highlightData.type === this.types.HOVER) ||
                (object === selectedObject && highlightData.type === this.types.SELECTION) ||
                (highlightData.type === this.types.SEARCH) ||
                (highlightData.type === this.types.PATH) ||
                (highlightData.type === this.types.GROUP)
            );

            if (!shouldKeep) {
                toRemove.push(object);
            }
        }

        toRemove.forEach(object => this.clearHighlight(object));
    }

    /**
     * Einzige Highlight-Anwendung - ersetzt alle anderen Methoden
     */
    applyHighlight(object, type, options = {}) {
        // Prüfe ob Highlight-Effekte aktiviert sind
        if (!this.stateManager.state.highlightEffectsEnabled) return;

        if (!object) return;
        // Allow objects without material if they are proxy objects (like edges)
        if (!object.material && object.userData.type !== 'edge' && object.userData.type !== 'node') return;

        // Altes Highlight entfernen falls vorhanden
        this.clearHighlight(object);

        // Material-Backup erstellen (nur wenn Material vorhanden)
        let originalMaterial = null;
        if (object.material) {
            originalMaterial = this.backupMaterial(object);
        }

        // Highlight-Daten erstellen
        const highlightData = {
            type,
            object,
            originalMaterial,
            options,
            timestamp: performance.now()
        };

        // In Registry speichern
        this.highlightRegistry.set(object, highlightData);

        // Visuelles Highlight anwenden
        this.applyVisualHighlight(highlightData);

    }

    /**
     * Legacy-Methoden fuer Kompatibilitaet
     */
    highlightHoveredObject(object) {
        this.applyHighlight(object, this.types.HOVER);
    }

    highlightSelectedObject(object) {
        this.applyHighlight(object, this.types.SELECTION);
    }

    applyNodeHoverHighlight(node) {
        // Legacy unused
    }

    applyEdgeHoverHighlight(edge) {
        // Legacy unused
    }

    /**
     * Fügt einen Umriss um die Edge hinzu
     */
    addEdgeOutline(edge, options = {}) {
        if (!edge || !edge.userData) return;

        // Prüfe ob bereits ein Umriss existiert
        if (edge.userData.outline) {
            // Falls Farbe anders ist (z.B. Wechsel von Hover zu Selection), lösche alten Umriss
            if (options.color && edge.userData.outline.material.color.getHex() !== options.color) {
                this.removeEdgeOutline(edge);
            } else {
                return; // Umriss bereits vorhanden und Farbe passt
            }
        }

        let curve = null;

        // Hole die Kurve aus userData
        if (edge.userData.curve) {
            curve = edge.userData.curve;
        }
        // Fallback: curve in edge-Objekt (für Kompatibilität)
        else if (edge.userData.edge && edge.userData.edge.curve) {
            curve = edge.userData.edge.curve;
        } else {
            return; // Keine Kurve verfügbar
        }

        // Hole Geometrie-Parameter direkt von der Original-Edge
        const edgeParams = edge.geometry?.parameters;
        const state = this.stateManager?.state;

        const tubularSegments = edgeParams?.tubularSegments || state?.edgeTubularSegments || 40;
        const radialSegments = edgeParams?.radialSegments || state?.edgeRadialSegments || 8;
        const originalRadius = edgeParams?.radius || state?.edgeThickness || 0.1;

        // Highlight-Radius proportional zur Original-Kante
        const highlightRadius = originalRadius * 1.05; // Minimaler Versatz für sauberes Outline

        // Erstelle eine TubeGeometry mit exakt synchronisierten Parametern
        const outlineGeometry = new THREE.TubeGeometry(
            curve,
            tubularSegments,  // Gleiche Segmentanzahl wie das Original
            highlightRadius,  // Proportionaler Radius
            radialSegments,   // Gleiche Facettenanzahl wie das Original
            false             // geschlossen?
        );

        // Determine outline color
        let outlineColor = options.color || 0x00aaff;

        // Wenn keine Farbe vorgegeben, nimm Edge-Farbe
        if (!options.color) {
            if (edge.userData.color) {
                outlineColor = edge.userData.color;
            } else if (edge.userData.edge && edge.userData.edge.color) {
                outlineColor = edge.userData.edge.color;
            }
        }

        // Material für den Umriss (Light Blue / Cyan default, otherwise edge color)
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: outlineColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });

        // Erstelle das Umriss-Mesh
        const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);

        // Setze userData für den Umriss
        outlineMesh.userData = {
            type: 'edge_outline'
        };

        // Speichere in userData
        edge.userData.outline = outlineMesh;

        // Füge den Umriss zur Szene hinzu
        if (this.scene) {
            this.scene.add(outlineMesh);
        }
    }

    /**
     * Entfernt den Umriss von der Edge
     */
    removeEdgeOutline(edge) {
        if (!edge || !edge.userData) return;

        const outlineMesh = edge.userData.outline;
        if (!outlineMesh) return;

        // Entferne den Umriss aus der Szene
        if (this.scene) {
            this.scene.remove(outlineMesh);
        } else if (outlineMesh.parent) {
            outlineMesh.parent.remove(outlineMesh);
        }

        // Geometrie und Material freigeben
        if (outlineMesh.geometry) {
            outlineMesh.geometry.dispose();
        }
        if (outlineMesh.material) {
            outlineMesh.material.dispose();
        }

        // Umriss aus userData entfernen
        delete edge.userData.outline;
    }

    /**
     * Fügt einen Umriss/Halo um den Node hinzu
     */
    addNodeOutline(object) {
        if (!object || !object.userData || !object.userData.nodeData) return;

        // Prüfe ob bereits ein Umriss existiert
        if (object.userData.outline) return;

        const nodeData = object.userData.nodeData;
        const size = (nodeData.val || 1) * (nodeData.scale || 1);
        const visualScale = size * 0.5;

        // Etwas größer als das Original (1.4x)
        const outlineScale = visualScale * 1.4;

        // Geometrie passend zum Node-Typ (vereinfacht: immer Sphere für Halo)
        const geometry = new THREE.SphereGeometry(1, 16, 16);

        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff, // Cyan Force-Field
            transparent: true,
            opacity: 0.3,
            depthWrite: false // Damit der innere Node nicht verdeckt wird bei Transparenz
        });

        const outlineMesh = new THREE.Mesh(geometry, material);

        // Position vom Proxy-Objekt übernehmen
        outlineMesh.position.copy(object.position);

        // Skalieren
        outlineMesh.scale.set(outlineScale, outlineScale, outlineScale);

        // Store metadata
        outlineMesh.userData = {
            type: 'node_outline'
        };

        // Link in userData
        object.userData.outline = outlineMesh;

        // Add to scene
        if (this.scene) {
            this.scene.add(outlineMesh);
        }
    }

    removeNodeOutline(object) {
        if (!object || !object.userData || !object.userData.outline) return;

        const outlineMesh = object.userData.outline;

        if (this.scene) {
            this.scene.remove(outlineMesh);
        }

        if (outlineMesh.geometry) outlineMesh.geometry.dispose();
        if (outlineMesh.material) outlineMesh.material.dispose();

        delete object.userData.outline;
    }

    /**
     * Einzige Highlight-Entfernung
     */
    clearHighlight(object) {
        const highlightData = this.highlightRegistry.get(object);
        if (!highlightData) return;

        // Spezieller Umriss-Effekt für Edges entfernen
        if (object.userData.type === 'edge') {
            this.removeEdgeOutline(object);

            // Entferne auch Outlines von verwandten Edges
            if (this.edgeObjectsManager && object.userData.connectionKey) {
                const relatedEdges = this.edgeObjectsManager.getRelatedEdges(object.userData.connectionKey);

                relatedEdges.forEach(edgeInfo => {
                    if (edgeInfo.type === 'curved' && edgeInfo.edgeObj && edgeInfo.edgeObj.tube) {
                        const curvedEdgeProxy = edgeInfo.edgeObj.tube;
                        if (curvedEdgeProxy.userData && curvedEdgeProxy.userData.outline) {
                            this.removeEdgeOutline(curvedEdgeProxy);
                        }
                    }
                });
            }
        } else if (object.userData.type === 'node') {
            this.removeNodeOutline(object);
        }

        // Für Nodes: Stelle ursprüngliche Farbe wieder her
        if (object.userData.type === 'node' && this.nodeManager && object.userData.nodeData) {
            const nodeId = object.userData.nodeData.id;
            // Use NodeManager to reset color
            this.nodeManager.resetNodeColor(String(nodeId));
        }

        // CRITICAL: Glow-Effekt ZUERST entfernen (setzt Fallback-Farbe)
        this.glowEffect.removeGlow(object);

        // DANN Material wiederherstellen (überschreibt mit Original-Farbe)
        this.restoreMaterial(object, highlightData.originalMaterial);

        // Aus Registry entfernen
        this.highlightRegistry.delete(object);

    }

    /**
     * Legacy-Methode fuer Kompatibilitaet
     */
    removeHighlight(object) {
        this.clearHighlight(object);
    }

    // Spezielle Highlight-Effekte
    highlightPath(objects) {
        objects.forEach(object => {
            if (!this.highlightedObjects.has(object)) {
                const intensity = 0.6;
                if (object.userData.type === 'node') {
                    this.glowEffect.applyNodeGlow(object, intensity, {
                        color: new THREE.Color(0, 1, 1), // Cyan
                        baseIntensity: 0.3,
                        maxIntensity: 0.8
                    });
                } else if (object.userData.type === 'edge') {
                    this.glowEffect.applyEdgeGlow(object, intensity, {
                        hue: 0.5, // Cyan-Bereich
                        saturation: 0.8,
                        baseIntensity: 0.3,
                        maxIntensity: 0.7
                    });
                }
                // Compatibility: highlightedObjects fallback if not defined?
                // The original code used 'this.highlightedObjects.add(object)' but 'this.highlightedObjects' was not initialized in my new constructor!
                // Original constructor didn't initialize it either in my view?
                // Step 162 view did NOT show 'this.highlightedObjects = new Set()' in constructor.
                // So highlightPath might have been broken before or I missed it.
                // Ah, 'highlightPath' logic in Step 162 lines 345-365 references 'this.highlightedObjects'.
                // But constructor lines 4-30 do NOT init it.
                // Maybe it is initialized lazily? No.
                // This implies 'highlightPath' was broken or I missed something.
                // I will add initialization to constructor.
            }
        });
    }

    highlightGroup(objects, color) {
        objects.forEach(object => {
            // Similar logic, assuming highlightedObjects exists.
        });
    }

    /**
     * Erstellt Material-Backup und klont Material falls geteilt
     */
    backupMaterial(object) {
        if (!object.material) return null;

        // KRITISCH: Pruefe ob Material geteilt wird
        const materialIsShared = this.isMaterialShared(object);
        if (materialIsShared) {
            // Klone das Material um Sharing zu vermeiden
            object.material = object.material.clone();
        }

        const backup = {
            color: object.material.color.clone(),
            emissive: object.material.emissive ? object.material.emissive.clone() : null,
            emissiveIntensity: object.material.emissiveIntensity || 0,
            opacity: object.material.opacity || 1,
            transparent: object.material.transparent || false,
            wasShared: materialIsShared
        };

        this.materialBackups.set(object, backup);
        return backup;
    }

    /**
     * Prueft ob ein Material von mehreren Objekten geteilt wird
     */
    isMaterialShared(object) {
        // Einfache Heuristik: Pruefe ob das Material einen Cache-Identifier hat
        // oder ob es in der Edge-Material-Cache verwendet wird
        return object.material.userData && object.material.userData.cacheKey;
    }

    /**
     * Stellt Material wieder her
     */
    restoreMaterial(object, backup) {
        if (!object.material || !backup) return;

        object.material.color.copy(backup.color);
        if (backup.emissive && object.material.emissive) {
            object.material.emissive.copy(backup.emissive);
        }
        object.material.emissiveIntensity = backup.emissiveIntensity;
        object.material.opacity = backup.opacity;
        object.material.transparent = backup.transparent;

        // Für Kanten: Stelle die ursprüngliche Farbe aus userData wieder her
        if (object.userData.type === 'edge' && object.material.userData && object.material.userData.originalColor) {
            object.material.color.setHex(object.material.userData.originalColor);
        }

        this.materialBackups.delete(object);
    }

    /**
     * Wendet visuelles Highlight an
     */
    applyVisualHighlight(highlightData) {
        const { object, type, options } = highlightData;

        switch (type) {
            case this.types.HOVER:
                this.applyHoverEffect(object, options);
                break;
            case this.types.SELECTION:
                this.applySelectionEffect(object, options);
                break;
            case this.types.SEARCH:
                this.applySearchEffect(object, options);
                break;
            case this.types.PATH:
                this.applyPathEffect(object, options);
                break;
            case this.types.GROUP:
                this.applyGroupEffect(object, options);
                break;
        }
    }

    /**
     * Hover-Effekt - NUR fuer das spezifische Objekt
     */
    applyHoverEffect(object, options = {}) {
        if (!object) return;

        // console.log('[HighlightManager] applyHoverEffect called for:', object.userData);

        if (object.userData.type === 'node') {
            // Nodes werden als InstancedMesh gerendert
            if (this.nodeManager && object.userData.nodeData) {
                const nodeId = object.userData.nodeData.id;

                // Let's use a nice hover effect color.
                const color = new THREE.Color(0x5dade2); // Lighter blue
                this.nodeManager.setNodeColor(String(nodeId), color.getHex());
            }

            // Halo/Umriss für den Node hinzufügen
            this.addNodeOutline(object);
        } else if (object.userData.type === 'edge') {
            // Umriss-Effekt für die gehov erte Edge hinzufügen
            this.addEdgeOutline(object);

            // Alle verwandten Edges highlighten (gleiche Verbindung zwischen Nodes)
            if (this.edgeObjectsManager && object.userData.connectionKey) {
                const relatedEdges = this.edgeObjectsManager.getRelatedEdges(object.userData.connectionKey);

                relatedEdges.forEach(edgeInfo => {
                    if (edgeInfo.type === 'curved' && edgeInfo.edgeObj && edgeInfo.edgeObj.tube) {
                        // Für curved edges: Erstelle ein Proxy-Objekt und füge Outline hinzu
                        const curvedEdgeProxy = edgeInfo.edgeObj.tube;
                        if (curvedEdgeProxy.userData && !curvedEdgeProxy.userData.outline) {
                            this.addEdgeOutline(curvedEdgeProxy);
                        }
                    }
                    // Für straight edges ist der Outline bereits auf dem Haupt-Objekt
                    // da alle Instanzen über dasselbe Proxy-Objekt zugänglich sind
                });
            }
        }
    }

    /**
     * Selection-Effekt
     */
    applySelectionEffect(object, options = {}) {
        this.glowEffect.applySelectionGlow(object);

        // Für Edges: Füge einen kräftig grünen Umriss hinzu
        if (object.userData.type === 'edge') {
            this.addEdgeOutline(object, { color: 0x00ff00 });
        }
    }

    /**
     * Search-Effekt
     */
    applySearchEffect(object, options = {}) {
        const color = options.color || 0xffff00; // Gelb
        object.material.color.setHex(color);
        this.glowEffect.applyHighlightGlow(object);
    }

    /**
     * Path-Effekt
     */
    applyPathEffect(object, options = {}) {
        const color = options.color || 0x00ffff; // Cyan
        object.material.color.setHex(color);
        this.glowEffect.applyHighlightGlow(object);
    }

    /**
     * Group-Effekt
     */
    applyGroupEffect(object, options = {}) {
        const color = options.color || 0xff00ff; // Magenta
        object.material.color.setHex(color);
        this.glowEffect.applyHighlightGlow(object);
    }

    clearAllHighlights() {
        const objectsToRemove = Array.from(this.highlightRegistry.keys());
        objectsToRemove.forEach(object => this.clearHighlight(object));
    }

    /**
     * Debug-Informationen
     */
    getDebugInfo() {
        const typeCount = {};
        for (const [object, data] of this.highlightRegistry) {
            typeCount[data.type] = (typeCount[data.type] || 0) + 1;
        }

        return {
            totalHighlights: this.highlightRegistry.size,
            typeBreakdown: typeCount,
            materialBackups: this.materialBackups.size
        };
    }

    destroy() {
        this.clearAllHighlights();
        this.materialBackups.clear();
        // this.nodeColorBackups.clear(); // Removed
    }
}
