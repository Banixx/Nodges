import * as THREE from 'three';
import {
    VisualMapping,
    VisualProperties,
    EntityData,
    RelationshipData,
    VisualMappings,
    EntityVisualPreset,
    RelationshipVisualPreset
} from '../types';

/**
 * VisualMappingEngine - Applies visual mappings to entities and relationships
 * Maps data properties to visual properties using various functions
 */
export class VisualMappingEngine {
    private visualMappings: VisualMappings | undefined;

    constructor(visualMappings?: VisualMappings) {
        this.visualMappings = visualMappings;
    }

    /**
     * Set or update visual mappings
     */
    setVisualMappings(visualMappings: VisualMappings) {
        this.visualMappings = visualMappings;
    }

    /**
     * Apply visual mappings to an entity
     */
    applyToEntity(entity: EntityData): VisualProperties {
        if (!this.visualMappings) {
            return this.getDefaultVisualProperties();
        }

        const preset = this.visualMappings.defaultPresets[entity.type] as EntityVisualPreset;
        if (!preset) {
            return this.getDefaultVisualProperties();
        }

        const visual: VisualProperties = {};

        // Apply size mapping
        if (preset.size) {
            visual.size = this.applyMapping(preset.size, entity);
        }

        // Apply color mapping
        if (preset.color) {
            const colorValue = this.applyMapping(preset.color, entity);
            visual.color = this.mapToColor(colorValue, preset.color);
        }

        // Apply geometry mapping
        if (preset.geometry) {
            visual.geometry = this.mapToGeometry(preset.geometry, entity);
        }

        // Apply glow mapping
        if (preset.glow) {
            visual.glow = this.applyMapping(preset.glow, entity);
        }

        // Apply animation mapping
        if (preset.animation) {
            visual.animation = this.mapToAnimation(preset.animation, entity);
        }

        return visual;
    }

    /**
     * Apply visual mappings to a relationship
     */
    applyToRelationship(relationship: RelationshipData): VisualProperties {
        if (!this.visualMappings) {
            return this.getDefaultVisualProperties();
        }

        const preset = this.visualMappings.defaultPresets[relationship.type] as RelationshipVisualPreset;
        if (!preset) {
            return this.getDefaultVisualProperties();
        }

        const visual: VisualProperties = {};

        // Apply thickness mapping
        if (preset.thickness) {
            visual.thickness = this.applyMapping(preset.thickness, relationship);
        }

        // Apply color mapping
        if (preset.color) {
            const colorValue = this.applyMapping(preset.color, relationship);
            visual.color = this.mapToColor(colorValue, preset.color);
        }

        // Apply curvature mapping
        if (preset.curvature) {
            visual.curvature = this.applyMapping(preset.curvature, relationship);
        }

        // Apply glow mapping
        if (preset.glow) {
            visual.glow = this.applyMapping(preset.glow, relationship);
        }

        // Apply opacity mapping
        if (preset.opacity) {
            visual.opacity = this.applyMapping(preset.opacity, relationship);
        }

        // Apply animation mapping
        if (preset.animation) {
            visual.animation = this.mapToAnimation(preset.animation, relationship);
        }

        return visual;
    }

    /**
     * Apply a single mapping to data
     */
    private applyMapping(mapping: VisualMapping, data: EntityData | RelationshipData): any {
        // Get source value (supports nested properties like "personality.extraversion")
        const value = this.getNestedProperty(data, mapping.source);

        if (value === undefined || value === null) {
            // Return middle of range or default
            return mapping.range ? (mapping.range[0] + mapping.range[1]) / 2 : 1;
        }

        // Normalize value if it's a number
        const numValue = typeof value === 'number' ? value : 0;

        // Apply mapping function
        switch (mapping.function) {
            case 'linear':
                return this.linearMapping(numValue, mapping);
            case 'exponential':
                return this.exponentialMapping(numValue, mapping);
            case 'logarithmic':
                return this.logarithmicMapping(numValue, mapping);
            case 'heatmap':
                return this.heatmapMapping(numValue, mapping);
            case 'bipolar':
                return this.bipolarMapping(numValue, mapping);
            case 'pulse':
                return this.pulseMapping(numValue, mapping);
            default:
                return numValue;
        }
    }

    /**
     * Get nested property from object (e.g., "personality.extraversion")
     */
    private getNestedProperty(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Linear mapping
     */
    private linearMapping(value: number, mapping: VisualMapping): number {
        if (!mapping.range) return value;
        const [outMin, outMax] = mapping.range;
        // Assume input is normalized 0-1 unless we know the input range
        return outMin + value * (outMax - outMin);
    }

    /**
     * Exponential mapping
     */
    private exponentialMapping(value: number, mapping: VisualMapping): number {
        if (!mapping.range) return value;
        const [outMin, outMax] = mapping.range;
        const base = mapping.params?.base || 2;

        // Normalize and apply exponential
        const normalized = Math.pow(value, base);
        return outMin + normalized * (outMax - outMin);
    }

    /**
     * Logarithmic mapping
     */
    private logarithmicMapping(value: number, mapping: VisualMapping): number {
        if (!mapping.range) return value;
        const [outMin, outMax] = mapping.range;

        // Apply logarithm (avoid log(0))
        const normalized = Math.log(value + 1) / Math.log(2);
        return outMin + normalized * (outMax - outMin);
    }

    /**
     * Heatmap mapping (returns a value that can be mapped to color)
     */
    private heatmapMapping(value: number, _mapping: VisualMapping): number {
        // Return normalized value for color mapping
        return value;
    }

    /**
     * Bipolar mapping (for values ranging from negative to positive)
     */
    private bipolarMapping(value: number, _mapping: VisualMapping): number {
        // Normalize from [-1, 1] to [0, 1]
        return (value + 1) / 2;
    }

    /**
     * Pulse mapping
     */
    private pulseMapping(value: number, mapping: VisualMapping): any {
        const frequency = mapping.params?.frequency || 1.0;
        return {
            type: 'pulse',
            intensity: value,
            frequency
        };
    }

    /**
     * Map numeric value to color
     */
    private mapToColor(value: number, mapping: VisualMapping): THREE.Color {
        if (mapping.function === 'bipolar' && mapping.params?.positive && mapping.params?.negative) {
            // Bipolar color mapping
            const normalized = this.bipolarMapping(value, mapping);
            const positiveColor = new THREE.Color(mapping.params.positive);
            const negativeColor = new THREE.Color(mapping.params.negative);

            return new THREE.Color().lerpColors(negativeColor, positiveColor, normalized);
        } else if (mapping.function === 'heatmap') {
            // Heatmap color mapping (blue to red)
            return this.getHeatmapColor(value, mapping.palette);
        } else {
            // Default: grayscale
            return new THREE.Color(value, value, value);
        }
    }

    /**
     * Get heatmap color based on palette
     */
    private getHeatmapColor(value: number, palette?: string): THREE.Color {
        // Clamp value to [0, 1]
        const v = Math.max(0, Math.min(1, value));

        if (palette === 'blue-red') {
            const blue = new THREE.Color(0x0000ff);
            const red = new THREE.Color(0xff0000);
            return new THREE.Color().lerpColors(blue, red, v);
        } else {
            // Default: black to white
            return new THREE.Color(v, v, v);
        }
    }

    /**
     * Map to geometry type
     */
    private mapToGeometry(mapping: VisualMapping, _data: EntityData): string {
        if (mapping.function === 'sphereComplexity') {
            // For now, just return 'sphere' - logic would be here
            return 'sphere';
        }
        return 'sphere'; // Default
    }

    /**
    * Map to animation
    */
    private mapToAnimation(mapping: VisualMapping, data: EntityData | RelationshipData): any {
        return this.applyMapping(mapping, data);
    }

    /**
     * Get default visual properties
     */
    private getDefaultVisualProperties(): VisualProperties {
        return {
            size: 1.0,
            color: new THREE.Color(0x00aaff),
            geometry: 'sphere',
            glow: 0,
            opacity: 1.0,
            thickness: 0.1,
            curvature: 0,
            animation: undefined
        };
    }

    /**
     * Static method to get visual properties without mappings
     */
    static getDefault(): VisualProperties {
        return {
            size: 1.0,
            color: new THREE.Color(0x00aaff),
            geometry: 'sphere',
            glow: 0,
            opacity: 1.0,
            thickness: 0.1,
            curvature: 0,
            animation: undefined
        };
    }
}
