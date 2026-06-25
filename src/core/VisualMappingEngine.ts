import * as THREE from 'three';
import {
    VisualMapping,
    VisualProperties,
    EntityData,
    RelationshipData,
    VisualMappings,
    EntityVisualPreset,
    RelationshipVisualPreset,
    DataModel
} from '../types';

/**
 * VisualMappingEngine - Applies visual mappings to entities and relationships
 * Maps data properties to visual properties using various functions
 */
export class VisualMappingEngine {
    private visualMappings: VisualMappings | undefined;
    private dataModel: DataModel | undefined;

    constructor(visualMappings?: VisualMappings, dataModel?: DataModel) {
        this.visualMappings = visualMappings;
        this.dataModel = dataModel;
    }

    /**
     * Set or update visual mappings
     */
    setVisualMappings(visualMappings: VisualMappings) {
        this.visualMappings = visualMappings;
    }

    /**
     * Set or update data model
     */
    setDataModel(dataModel: DataModel) {
        this.dataModel = dataModel;
    }

    /**
     * Apply visual mappings to an entity
     */
    applyToEntity(entity: EntityData): VisualProperties {
        if (!this.visualMappings) {
            return this.getDefaultVisualProperties();
        }

        let specificPreset = this.visualMappings.defaultPresets[entity.type] as EntityVisualPreset;
        let globalPreset = this.visualMappings.defaultPresets['global_node'] as EntityVisualPreset;
        
        let preset: EntityVisualPreset;
        if (globalPreset && specificPreset) {
            preset = { ...specificPreset, ...globalPreset };
        } else if (globalPreset) {
            preset = globalPreset;
        } else if (specificPreset) {
            preset = specificPreset;
        } else {
            return this.getDefaultVisualProperties();
        }

        const visual: VisualProperties = {};

        // Apply position mappings
        if (preset.positionX && preset.positionX.source !== 'constant') {
            visual.positionX = this.applyMapping(preset.positionX, entity);
        }
        if (preset.positionY && preset.positionY.source !== 'constant') {
            visual.positionY = this.applyMapping(preset.positionY, entity);
        }
        if (preset.positionZ && preset.positionZ.source !== 'constant') {
            visual.positionZ = this.applyMapping(preset.positionZ, entity);
        }

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

        let specificPreset = this.visualMappings.defaultPresets[relationship.type] as RelationshipVisualPreset;
        let globalPreset = this.visualMappings.defaultPresets['global_edge'] as RelationshipVisualPreset;

        let preset: RelationshipVisualPreset;
        if (globalPreset && specificPreset) {
            preset = { ...specificPreset, ...globalPreset };
        } else if (globalPreset) {
            preset = globalPreset;
        } else if (specificPreset) {
            preset = specificPreset;
        } else {
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
            console.log(`[VisualMappingEngine] Applied animation for ${relationship.type}:`, visual.animation);
        }

        return visual;
    }

    private applyMapping(mapping: VisualMapping, data: EntityData | RelationshipData): any {
        // Special case: constant source
        if (mapping.source === 'constant') {
            if (mapping.function === 'pulse') {
                return this.pulseMapping(1.0, mapping);
            }
            if (mapping.range && mapping.range.length > 0) {
                return mapping.range[0];
            }
            if (mapping.params?.color) {
                return mapping.params.color;
            }
            if (mapping.params?.geometry) {
                return mapping.params.geometry;
            }
            if ((mapping as any).value) {
                return (mapping as any).value;
            }
            return 1.0;
        }

        // Get source value (supports nested properties like "personality.extraversion")
        let value = this.getNestedProperty(data, mapping.source);

        if (value === undefined || value === null) {
            // Return middle of range or default
            return mapping.range ? (mapping.range[0] + mapping.range[1]) / 2 : 1;
        }

        // Handle categorical mapping directly (keeps string values)
        if (mapping.function === 'categorical') {
            return value;
        }

        // If the value is a non-numeric string, return it directly so color/geometry can handle it categorically
        let numValue = 0;
        if (typeof value === 'string' && isNaN(Number(value))) {
            if (mapping.function === 'heatmap') {
                return value;
            }
            // For continuous functions, calculate a numeric value from the text (0.0 to 1.0)
            // Alphabetical mapping (A=0.0, Z=1.0) or fallback to word length
            const charCode = value.toUpperCase().charCodeAt(0);
            if (charCode >= 65 && charCode <= 90) {
                numValue = (charCode - 65) / 25;
            } else {
                numValue = Math.min(1.0, value.length / 20);
            }
        } else {
            // Normalize value if it's a number
            numValue = Number(value) || 0;
        }

        // Apply domain normalization if provided or defined in dataModel
        let domain = mapping.domain;
        if (!domain && this.dataModel && data.type) {
            const entityType = data.type;
            const propSchema = this.dataModel.entities[entityType]?.properties?.[mapping.source]
                || this.dataModel.relationships[entityType]?.properties?.[mapping.source];
            if (propSchema && propSchema.range) {
                domain = propSchema.range;
            }
        }

        if (domain) {
            const [domainMin, domainMax] = domain;
            if (domainMax > domainMin) {
                if (mapping.function === 'logarithmic') {
                    // True logarithmic data mapping
                    // Avoid log(0)
                    const minLog = Math.log10(Math.max(1, domainMin));
                    const maxLog = Math.log10(Math.max(2, domainMax));
                    const valLog = Math.log10(Math.max(1, numValue));
                    numValue = (valLog - minLog) / (maxLog - minLog);
                } else {
                    // Linear normalization
                    numValue = (numValue - domainMin) / (domainMax - domainMin);
                }
                // Clamp to 0-1
                numValue = Math.max(0, Math.min(1, numValue));
            }
        }

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
                return domain ? numValue : this.bipolarMapping(numValue, mapping);
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

        // If domain was provided, value is already log-normalized [0-1] in applyMapping
        if (mapping.domain) {
            return outMin + value * (outMax - outMin);
        }

        // Fallback for missing domain (legacy logic, scaled down)
        // Without domain, very large numbers cause massive output sizes.
        // We use log10 to keep it manageable.
        const normalized = Math.log10(value + 1) / 4; // Assume max value ~10000
        const clamped = Math.max(0, Math.min(1, normalized));
        return outMin + clamped * (outMax - outMin);
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
    private mapToColor(value: any, mapping: VisualMapping): THREE.Color {
        // Direct color from params
        if (mapping.params?.color) {
            return new THREE.Color(mapping.params.color);
        }

        if (mapping.function === 'bipolar' && mapping.params?.positive && mapping.params?.negative) {
            // Bipolar color mapping
            // Value is already normalized to [0, 1] by applyMapping
            const normalized = Math.max(0, Math.min(1, Number(value)));
            const positiveColor = new THREE.Color(mapping.params.positive);
            const negativeColor = new THREE.Color(mapping.params.negative);

            return new THREE.Color().lerpColors(negativeColor, positiveColor, normalized);
        } else if (mapping.function === 'heatmap') {
            // Heatmap color mapping (blue to red)
            if (typeof value === 'string' && isNaN(Number(value))) {
                return this.getCategoricalColor(value, mapping.palette);
            }
            return this.getHeatmapColor(Number(value), mapping.palette);
        } else if (mapping.function === 'categorical') {
            // Categorical color mapping
            if (mapping.params && mapping.params.categories && mapping.params.categories[String(value)]) {
                return new THREE.Color(mapping.params.categories[String(value)]);
            }
            return this.getCategoricalColor(String(value), mapping.palette);
        } else {
            // Default: grayscale
            if (typeof value === 'string' && isNaN(Number(value))) {
                return this.getCategoricalColor(value, mapping.palette);
            }
            const numValue = Number(value) || 0;
            return new THREE.Color(numValue, numValue, numValue);
        }
    }

    /**
     * Get categorical color
     */
    private getCategoricalColor(value: string, palette: string = 'category10'): THREE.Color {
        const palettes: Record<string, number[]> = {
            'category10': [
                0x1f77b4, 0xff7f0e, 0x2ca02c, 0xd62728, 0x9467bd, 
                0x8c564b, 0xe377c2, 0x7f7f7f, 0xbcbd22, 0x17becf
            ],
            'category20': [
                0x1f77b4, 0xaec7e8, 0xff7f0e, 0xffbb78, 0x2ca02c, 0x98df8a, 0xd62728, 0xff9896,
                0x9467bd, 0xc5b0d5, 0x8c564b, 0xc49c94, 0xe377c2, 0xf7b6d2, 0x7f7f7f, 0xc7c7c7,
                0xbcbd22, 0xdbdb8d, 0x17becf, 0x9edae5
            ],
            'pastel': [
                0xfbb4ae, 0xb3cde3, 0xccebc5, 0xdecbe4, 0xfed9a6,
                0xffffcc, 0xe5d8bd, 0xfddaec, 0xf2f2f2
            ]
        };

        const colors = palettes[palette] || palettes['category10'];
        
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
            hash = value.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);
        
        const colorHex = colors[hash % colors.length];
        return new THREE.Color(colorHex);
    }

    /**
     * Get heatmap color based on palette
     */
    private getHeatmapColor(value: number, palette: string = 'blue-red'): THREE.Color {
        // Clamp value to [0, 1]
        const v = Math.max(0, Math.min(1, value));

        if (palette === 'blue-red') {
            const blue = new THREE.Color(0x0000ff);
            const red = new THREE.Color(0xff0000);
            return new THREE.Color().lerpColors(blue, red, v);
        } else if (palette === 'grayscale') {
            return new THREE.Color(v, v, v);
        } else if (palette === 'viridis') {
            // Simplified viridis approximation
            const color = new THREE.Color();
            color.setHSL((1.0 - v) * 0.6, 1.0, 0.5);
            return color;
        } else {
            // Default: black to white
            return new THREE.Color(v, v, v);
        }
    }

    /**
     * Map to geometry type
     */
    private mapToGeometry(mapping: VisualMapping, data: EntityData): string {
        let geom = 'sphere';

        if (mapping.source === 'constant') {
            geom = (mapping as any).value || mapping.params?.geometry || 'sphere';
        } else if (mapping.function === 'categorical') {
            const val = this.getNestedProperty(data, mapping.source);
            if (val !== undefined) {
                if (mapping.params?.categories) {
                    geom = mapping.params.categories[String(val)] || 'sphere';
                } else {
                    geom = String(val).toLowerCase();
                }
            }
        } else if (mapping.function === 'sphereComplexity') {
            geom = 'sphere';
        } else {
            const val = this.getNestedProperty(data, mapping.source);
            if (val !== undefined) {
                geom = String(val).toLowerCase();
            }
        }

        if (geom === 'box') {
            geom = 'cube';
        }

        return geom;
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
