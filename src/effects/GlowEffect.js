import * as THREE from 'three';

export class GlowEffect {
    constructor() {
        this.defaultNodeGlow = {
            color: new THREE.Color(1, 0.5, 0),
            baseIntensity: 0.3,
            maxIntensity: 1.0
        };

        this.defaultEdgeGlow = {
            hue: 0.6,
            saturation: 1,
            baseIntensity: 0.3,
            maxIntensity: 0.7
        };
    }

    applyGlow(object, intensity, options = {}) {
        console.log("applyGlow mit object: ", object, "intensitiy: ", intensity, "options: ", options);
        if (object.userData.type === 'node') {
            this.applyNodeGlow(object, intensity, options);
        } else if (object.userData.type === 'edge') {
            this.applyEdgeGlow(object, intensity, options);
        }
    }

    applyNodeGlow(node, intensity, options = {}) {
        const glowColor = options.color || this.defaultNodeGlow.color;
        const baseIntensity = options.baseIntensity || this.defaultNodeGlow.baseIntensity;
        const maxIntensity = options.maxIntensity || this.defaultNodeGlow.maxIntensity;

        node.material.emissive.copy(glowColor);
        node.material.emissiveIntensity = baseIntensity + 
            (maxIntensity - baseIntensity) * intensity;
    }

    applyEdgeGlow(edge, intensity, options = {}) {
        const hue = options.hue || this.defaultEdgeGlow.hue;
        const saturation = options.saturation || this.defaultEdgeGlow.saturation;
        const baseIntensity = options.baseIntensity || this.defaultEdgeGlow.baseIntensity;
        const maxIntensity = options.maxIntensity || this.defaultEdgeGlow.maxIntensity;

        const color = new THREE.Color();
        const lightness = baseIntensity + 
            (maxIntensity - baseIntensity) * intensity;
        
        color.setHSL(hue, saturation, lightness);
        edge.material.color = color;
    }

    removeGlow(object) {
        if (object.userData.type === 'node') {
            object.material.emissive.setRGB(0, 0, 0);
            object.material.emissiveIntensity = 0;
            // Urspruengliche Farbe wiederherstellen
            if (object.parent && object.parent.options) {
                object.material.color.setHex(object.parent.options.color);
            }
        } else if (object.userData.type === 'edge') {
            // Emissive zuruecksetzen und urspruengliche Farbe wiederherstellen
            if (object.material) {
                object.material.emissive.setHex(0x000000);
                object.material.emissiveIntensity = 0;
                // Verwende resetHighlight Methode falls verfuegbar
                if (object.userData.edge && typeof object.userData.edge.resetHighlight === 'function') {
                    object.userData.edge.resetHighlight();
                } else {
                    // Fallback: Standard-Kantenfarbe
                    const originalColor = object.material.userData?.originalColor || 0x0000ff;
                    object.material.color.setHex(originalColor);
                }
            }
        }
    }

    // Hilfsmethode fuer pulsierende Glow-Berechnung
    calculatePulsingIntensity(baseIntensity, time, frequency = 1) {
        const phase = (time * Math.PI * 2 * frequency) % (Math.PI * 2);
        return baseIntensity + (1 - baseIntensity) * (Math.sin(phase) * 0.5 + 0.5);
    }

    // Spezielle Effekte
    applyHighlightGlow(object) {
        if (object.userData.type === 'node') {
            this.applyNodeGlow(object, 0.5, {
                color: new THREE.Color(1, 1, 0), // Gelber Highlight-Glow
                baseIntensity: 0.5,
                maxIntensity: 0.8
            });
        } else if (object.userData.type === 'edge') {
            this.applyEdgeGlow(object, 0.5, {
                hue: 0.15, // Gelblicher Ton
                saturation: 0.8,
                baseIntensity: 0.4,
                maxIntensity: 0.6
            });
        }
    }

    applySelectionGlow(object) {
        if (object.userData.type === 'node') {
            this.applyNodeGlow(object, 0.8, {
                color: new THREE.Color(1, 0.5, 0), // Orange Selektions-Glow statt gruen
                baseIntensity: 0.4,
                maxIntensity: 1.0
            });
        } else if (object.userData.type === 'edge') {
            // Verwende emissive statt Farbaenderung um Schatten-Effekt zu vermeiden
            if (object.material) {
                object.material.emissive.setHex(0xff6600); // Orange emissive
                object.material.emissiveIntensity = 0.3;
            }
        }
    }
}
