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
            // Ursprüngliche Farbe wiederherstellen
            if (object.parent && object.parent.options) {
                object.material.color.setHex(object.parent.options.color);
            }
        } else if (object.userData.type === 'edge') {
            // Standard-Kantenfarbe wiederherstellen
            object.material.color.setHex(0x0000ff);
        }
    }

    // Hilfsmethode für pulsierende Glow-Berechnung
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
                color: new THREE.Color(0, 1, 0), // Grüner Selektions-Glow
                baseIntensity: 0.4,
                maxIntensity: 1.0
            });
        } else if (object.userData.type === 'edge') {
            this.applyEdgeGlow(object, 0.8, {
                hue: 0.3, // Grünlicher Ton
                saturation: 1,
                baseIntensity: 0.5,
                maxIntensity: 0.9
            });
        }
    }
}
