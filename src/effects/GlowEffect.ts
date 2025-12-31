import * as THREE from 'three';

interface GlowOptions {
    color?: THREE.Color;
    baseIntensity?: number;
    maxIntensity?: number;
    hue?: number;
    saturation?: number;
}

export class GlowEffect {
    private defaultNodeGlow: {
        color: THREE.Color;
        baseIntensity: number;
        maxIntensity: number;
    };

    private defaultEdgeGlow: {
        hue: number;
        saturation: number;
        baseIntensity: number;
        maxIntensity: number;
    };

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

    applyGlow(object: THREE.Object3D, intensity: number, options: GlowOptions = {}) {
        if (!object.userData) return;

        if (object.userData.type === 'node') {
            this.applyNodeGlow(object, intensity, options);
        } else if (object.userData.type === 'edge') {
            this.applyEdgeGlow(object, intensity, options);
        }
    }

    applyNodeGlow(node: THREE.Object3D, intensity: number, options: GlowOptions = {}) {
        if (!(node as any).material) return;
        const material = (node as any).material as THREE.MeshStandardMaterial; // Assuming compatible material

        const glowColor = options.color || this.defaultNodeGlow.color;
        const baseIntensity = options.baseIntensity || this.defaultNodeGlow.baseIntensity;
        const maxIntensity = options.maxIntensity || this.defaultNodeGlow.maxIntensity;

        if (material.emissive) {
            material.emissive.copy(glowColor);
            material.emissiveIntensity = baseIntensity +
                (maxIntensity - baseIntensity) * intensity;
        }
    }

    applyEdgeGlow(edge: THREE.Object3D, intensity: number, options: GlowOptions = {}) {
        if (!(edge as any).material) return;
        const material = (edge as any).material as THREE.MeshBasicMaterial;

        const hue = options.hue || this.defaultEdgeGlow.hue;
        const saturation = options.saturation || this.defaultEdgeGlow.saturation;
        const baseIntensity = options.baseIntensity || this.defaultEdgeGlow.baseIntensity;
        const maxIntensity = options.maxIntensity || this.defaultEdgeGlow.maxIntensity;

        const color = new THREE.Color();
        const lightness = baseIntensity +
            (maxIntensity - baseIntensity) * intensity;

        color.setHSL(hue, saturation, lightness);
        material.color = color;
    }

    removeGlow(object: THREE.Object3D) {
        if (!object.userData) return;

        if (object.userData.type === 'node') {
            const material = (object as any).material;
            if (material && material.emissive) {
                material.emissive.setRGB(0, 0, 0);
                material.emissiveIntensity = 0;
                // Restore original color if parent options exist (legacy structure?)
                if (object.parent && (object.parent as any).options) {
                    material.color.setHex((object.parent as any).options.color);
                }
            }
        } else if (object.userData.type === 'edge') {
            const material = (object as any).material;
            if (material) {
                // Restore original edge color
                if (material.userData && material.userData.originalColor) {
                    material.color.setHex(material.userData.originalColor);
                } else {
                    // Fallback to default theme blue
                    material.color.setHex(0x00aaff);
                }
            }
        }
    }

    // Helper for pulsing glow calculation
    calculatePulsingIntensity(baseIntensity: number, time: number, frequency: number = 1): number {
        const phase = (time * Math.PI * 2 * frequency) % (Math.PI * 2);
        return baseIntensity + (1 - baseIntensity) * (Math.sin(phase) * 0.5 + 0.5);
    }

    // Special Effects
    applyHighlightGlow(object: THREE.Object3D) {
        if (!object.userData) return;

        if (object.userData.type === 'node') {
            this.applyNodeGlow(object, 0.5, {
                color: new THREE.Color(0, 1, 1), // Cyan Highlight-Glow
                baseIntensity: 0.5,
                maxIntensity: 0.8
            });
        } else if (object.userData.type === 'edge') {
            this.applyEdgeGlow(object, 0.5, {
                hue: 0.55, // Light Blue Tone
                saturation: 0.8,
                baseIntensity: 0.4,
                maxIntensity: 0.6
            });
        }
    }

    applySelectionGlow(object: THREE.Object3D) {
        if (!object.userData) return;

        if (object.userData.type === 'node') {
            this.applyNodeGlow(object, 0.8, {
                color: new THREE.Color(0, 1, 0), // Green Selection-Glow
                baseIntensity: 0.4,
                maxIntensity: 1.0
            });
        } else if (object.userData.type === 'edge') {
            this.applyEdgeGlow(object, 0.8, {
                hue: 0.3, // Greenish Tone
                saturation: 1,
                baseIntensity: 0.5,
                maxIntensity: 0.9
            });
        }
    }
}
