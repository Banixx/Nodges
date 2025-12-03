import * as THREE from 'three';

export class HighlightManager {
    constructor(stateManager, glowEffect, scene) {
        this.stateManager = stateManager;
        this.glowEffect = glowEffect;
        this.scene = scene;

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
        if (!object.material && object.userData.type !== 'edge') return;

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
        // Hellere Farbe für Hover-Effekt
        const color = node.material.color;
        const hsl = {};
        color.getHSL(hsl);

        // Helligkeit um 20% erhöhen, aber nicht über 1.0
        const newLightness = Math.min(hsl.l + 0.2, 1.0);
        color.setHSL(hsl.h, hsl.s, newLightness);

        // Leichter Glow-Effekt
        this.glowEffect.applyHighlightGlow(node);
    }

    applyEdgeHoverHighlight(edge) {
        // Hellerer Blauton für Hover-Effekt
        if (edge.material) {
            const color = new THREE.Color(0x4444ff);
            edge.material.color = color;

            // Leichter Glow-Effekt
            this.glowEffect.applyHighlightGlow(edge);

            // Umriss-Effekt hinzufügen
            this.addEdgeOutline(edge);
        }
    }

    /**
     * Fügt einen Umriss um die Edge hinzu
     */
    addEdgeOutline(edge) {
        if (!edge || !edge.userData) return;

        // Prüfe ob bereits ein Umriss existiert
        if (edge.userData.outline) {
            return; // Umriss bereits vorhanden
        }

        let curve;
        // Check if we have start/end positions in userData (from RaycastManager proxy)
        if (edge.userData.start && edge.userData.end) {
            const start = new THREE.Vector3(edge.userData.start.x, edge.userData.start.y, edge.userData.start.z);
            const end = new THREE.Vector3(edge.userData.end.x, edge.userData.end.y, edge.userData.end.z);
            curve = new THREE.LineCurve3(start, end);
        } else if (edge.userData.edge && edge.userData.edge.curve) {
            // Fallback for curved edges if they pass the actual object
            curve = edge.userData.edge.curve;
        } else {
            return; // Cannot create outline without geometry info
        }

        // Erstelle eine TubeGeometry mit größerem Radius für den Umriss
        const outlineGeometry = new THREE.TubeGeometry(
            curve,
            1,       // tubularSegments (1 for straight line is enough)
            0.15,    // radius der Röhre (größer als der ursprüngliche Radius von 0.1)
            8,       // radialSegments
            false    // geschlossen?
        );

        // Material für den Umriss (Light Blue / Cyan)
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0x00aaff, // Theme Blue / Cyan
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });

        // Erstelle das Umriss-Mesh
        const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);

        // Setze userData für den Umriss
        outlineMesh.userData = {
            type: 'edge_outline',
            parentEdge: edge
        };

        // Speichere den Umriss in userData
        edge.userData.outline = outlineMesh;

        // Füge den Umriss zur Szene hinzu (da Proxy-Objekte keinen Parent in der Szene haben)
        if (this.scene) {
            this.scene.add(outlineMesh);
        }
    }

    /**
     * Entfernt den Umriss von der Edge
     */
    removeEdgeOutline(edge) {
        if (!edge || !edge.userData || !edge.userData.outline) return;

        const outlineMesh = edge.userData.outline;

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
     * Einzige Highlight-Entfernung
     */
    clearHighlight(object) {
        const highlightData = this.highlightRegistry.get(object);
        if (!highlightData) return;

        // Spezieller Umriss-Effekt für Edges entfernen
        if (object.userData.type === 'edge') {
            this.removeEdgeOutline(object);
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
                this.highlightedObjects.add(object);
            }
        });
    }

    highlightGroup(objects, color) {
        objects.forEach(object => {
            if (!this.highlightedObjects.has(object)) {
                const intensity = 0.5;
                if (object.userData.type === 'node') {
                    this.glowEffect.applyNodeGlow(object, intensity, {
                        color: new THREE.Color(color),
                        baseIntensity: 0.2,
                        maxIntensity: 0.7
                    });
                } else if (object.userData.type === 'edge') {
                    const hsl = {};
                    new THREE.Color(color).getHSL(hsl);
                    this.glowEffect.applyEdgeGlow(object, intensity, {
                        hue: hsl.h,
                        saturation: hsl.s,
                        baseIntensity: 0.2,
                        maxIntensity: 0.6
                    });
                }
                this.highlightedObjects.add(object);
            }
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

        if (object.userData.type === 'node' && object.material) {
            // Hellere Farbe fuer Hover-Effekt
            const color = object.material.color;
            const hsl = {};
            color.getHSL(hsl);

            const newLightness = Math.min(hsl.l + 0.2, 1.0);
            color.setHSL(hsl.h, hsl.s, newLightness);

            // Leichter Glow-Effekt
            this.glowEffect.applyHighlightGlow(object);
        } else if (object.userData.type === 'edge') {
            // WICHTIG: Nur diese spezifische Kante highlighten
            // Da Edges InstancedMesh sind, ändern wir NICHT das Material,
            // sondern fügen nur den Umriss hinzu.

            // Umriss-Effekt hinzufügen
            this.addEdgeOutline(object);
        }
    }

    /**
     * Selection-Effekt
     */
    applySelectionEffect(object, options = {}) {
        this.glowEffect.applySelectionGlow(object);
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
    }
}
