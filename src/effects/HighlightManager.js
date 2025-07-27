import * as THREE from 'three';

export class HighlightManager {
    constructor(stateManager, glowEffect) {
        this.stateManager = stateManager;
        this.glowEffect = glowEffect;
        
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
        if (!object || !object.material) return;
        
        // Altes Highlight entfernen falls vorhanden
        this.clearHighlight(object);
        
        // Material-Backup erstellen
        const originalMaterial = this.backupMaterial(object);
        
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
        const color = new THREE.Color(0x4444ff);
        edge.material.color = color;

        // Leichter Glow-Effekt
        this.glowEffect.applyHighlightGlow(edge);
    }

    /**
     * Einzige Highlight-Entfernung
     */
    clearHighlight(object) {
        const highlightData = this.highlightRegistry.get(object);
        if (!highlightData) return;
        
        // Material wiederherstellen
        this.restoreMaterial(object, highlightData.originalMaterial);
        
        // Glow-Effekt entfernen
        this.glowEffect.removeGlow(object);
        
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
        if (!object || !object.material) {
            return;
        }
        
        if (object.userData.type === 'node') {
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
            const originalColor = object.material.color.getHex();
            
            // Hellerer Blauton fuer Hover-Effekt - NUR fuer diese Kante
            object.material.color.setHex(0x4444ff);
            this.glowEffect.applyHighlightGlow(object);
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
