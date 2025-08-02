/**
 * ConnectInterfaceAdapter - Bridge between parsed data and user customization
 * Provides the Connect Interface functionality for dynamic visual mapping
 * Enables users to map any data field to any visual property
 */

export class ConnectInterfaceAdapter {
    constructor() {
        this.parsedData = null;
        this.userMappings = {};
        this.availableFields = {};
        this.visualOptions = {};
        this.previewMode = false;
        this.callbacks = {
            onMappingChange: [],
            onPreviewUpdate: [],
            onApplyMappings: []
        };
    }

    /**
     * Initialize with parsed data
     * @param {Object} parsedData - Data from FutureDataParser
     */
    initialize(parsedData) {
        this.parsedData = parsedData;
        this.availableFields = parsedData.availableFields;
        this.visualOptions = parsedData.visualOptions;
        
        // Initialize with default mappings from data
        this.userMappings = this.extractDefaultMappings(parsedData);
        
        return {
            availableFields: this.availableFields,
            visualOptions: this.visualOptions,
            currentMappings: this.userMappings,
            presets: this.extractPresets(parsedData)
        };
    }

    /**
     * Extract default mappings from parsed data
     * @param {Object} parsedData - Parsed data
     * @returns {Object} - Default mappings
     */
    extractDefaultMappings(parsedData) {
        const mappings = {
            entities: {},
            relationships: {}
        };

        // Extract from visual presets
        if (parsedData.visualMappings && parsedData.visualMappings.defaultPresets) {
            for (const [type, preset] of Object.entries(parsedData.visualMappings.defaultPresets)) {
                // Determine if this is entity or relationship preset
                const isEntityPreset = parsedData.dataModel.entities && parsedData.dataModel.entities[type];
                const isRelationshipPreset = parsedData.dataModel.relationships && parsedData.dataModel.relationships[type];
                
                if (isEntityPreset) {
                    mappings.entities[type] = this.convertPresetToMapping(preset);
                } else if (isRelationshipPreset) {
                    mappings.relationships[type] = this.convertPresetToMapping(preset);
                } else {
                    // Generic preset - apply to all types
                    if (type.includes('node') || type.includes('entity')) {
                        Object.keys(parsedData.dataModel.entities || {}).forEach(entityType => {
                            mappings.entities[entityType] = this.convertPresetToMapping(preset);
                        });
                    } else {
                        Object.keys(parsedData.dataModel.relationships || {}).forEach(relationshipType => {
                            mappings.relationships[relationshipType] = this.convertPresetToMapping(preset);
                        });
                    }
                }
            }
        }

        return mappings;
    }

    /**
     * Convert preset to user mapping format
     * @param {Object} preset - Visual preset
     * @returns {Object} - User mapping
     */
    convertPresetToMapping(preset) {
        const mapping = {};
        
        for (const [visualProp, config] of Object.entries(preset)) {
            mapping[visualProp] = {
                enabled: true,
                source: config.source,
                function: config.function || 'linear',
                parameters: config.params || {},
                range: config.range || null,
                palette: config.palette || null
            };
        }
        
        return mapping;
    }

    /**
     * Extract available presets for user selection
     * @param {Object} parsedData - Parsed data
     * @returns {Object} - Available presets
     */
    extractPresets(parsedData) {
        const presets = {
            entities: {},
            relationships: {},
            global: {}
        };

        if (parsedData.visualMappings && parsedData.visualMappings.defaultPresets) {
            for (const [type, preset] of Object.entries(parsedData.visualMappings.defaultPresets)) {
                const isEntityPreset = parsedData.dataModel.entities && parsedData.dataModel.entities[type];
                const isRelationshipPreset = parsedData.dataModel.relationships && parsedData.dataModel.relationships[type];
                
                if (isEntityPreset) {
                    presets.entities[type] = preset;
                } else if (isRelationshipPreset) {
                    presets.relationships[type] = preset;
                } else {
                    presets.global[type] = preset;
                }
            }
        }

        return presets;
    }

    /**
     * Get available fields for a specific type
     * @param {string} category - 'entities' or 'relationships'
     * @param {string} type - Specific type name
     * @returns {Array} - Available field names
     */
    getAvailableFields(category, type) {
        if (!this.availableFields[category] || !this.availableFields[category][type]) {
            return [];
        }
        return this.availableFields[category][type];
    }

    /**
     * Get visual options for category
     * @param {string} category - 'entities' or 'relationships'
     * @returns {Array} - Available visual properties
     */
    getVisualOptions(category) {
        return this.visualOptions[category] || [];
    }

    /**
     * Update user mapping
     * @param {string} category - 'entities' or 'relationships'
     * @param {string} type - Type name
     * @param {string} visualProperty - Visual property to map
     * @param {Object} mapping - Mapping configuration
     */
    updateMapping(category, type, visualProperty, mapping) {
        if (!this.userMappings[category]) {
            this.userMappings[category] = {};
        }
        if (!this.userMappings[category][type]) {
            this.userMappings[category][type] = {};
        }
        
        this.userMappings[category][type][visualProperty] = mapping;
        
        // Trigger callbacks
        this.triggerCallbacks('onMappingChange', {
            category,
            type,
            visualProperty,
            mapping,
            allMappings: this.userMappings
        });
        
        // Auto-update preview if enabled
        if (this.previewMode) {
            this.updatePreview();
        }
    }

    /**
     * Remove mapping
     * @param {string} category - 'entities' or 'relationships'
     * @param {string} type - Type name
     * @param {string} visualProperty - Visual property to remove
     */
    removeMapping(category, type, visualProperty) {
        if (this.userMappings[category] && 
            this.userMappings[category][type] && 
            this.userMappings[category][type][visualProperty]) {
            
            delete this.userMappings[category][type][visualProperty];
            
            this.triggerCallbacks('onMappingChange', {
                category,
                type,
                visualProperty,
                mapping: null,
                allMappings: this.userMappings
            });
            
            if (this.previewMode) {
                this.updatePreview();
            }
        }
    }

    /**
     * Apply preset to type
     * @param {string} category - 'entities' or 'relationships'
     * @param {string} type - Type name
     * @param {Object} preset - Preset configuration
     */
    applyPreset(category, type, preset) {
        if (!this.userMappings[category]) {
            this.userMappings[category] = {};
        }
        
        this.userMappings[category][type] = this.convertPresetToMapping(preset);
        
        this.triggerCallbacks('onMappingChange', {
            category,
            type,
            preset: true,
            allMappings: this.userMappings
        });
        
        if (this.previewMode) {
            this.updatePreview();
        }
    }

    /**
     * Generate visual properties for entities based on current mappings
     * @param {Array} entities - Entity data
     * @returns {Array} - Entities with visual properties
     */
    generateEntityVisuals(entities) {
        return entities.map(entity => {
            const visualProps = this.calculateVisualProperties(
                entity, 
                'entities', 
                entity.type || 'default'
            );
            
            return {
                ...entity,
                visual: visualProps
            };
        });
    }

    /**
     * Generate visual properties for relationships based on current mappings
     * @param {Array} relationships - Relationship data
     * @returns {Array} - Relationships with visual properties
     */
    generateRelationshipVisuals(relationships) {
        return relationships.map(relationship => {
            const visualProps = this.calculateVisualProperties(
                relationship, 
                'relationships', 
                relationship.type || 'default'
            );
            
            return {
                ...relationship,
                visual: visualProps
            };
        });
    }

    /**
     * Calculate visual properties for a single item
     * @param {Object} item - Entity or relationship data
     * @param {string} category - 'entities' or 'relationships'
     * @param {string} type - Item type
     * @returns {Object} - Visual properties
     */
    calculateVisualProperties(item, category, type) {
        const mappings = this.userMappings[category] && this.userMappings[category][type];
        if (!mappings) return {};
        
        const visual = {};
        
        for (const [visualProp, mapping] of Object.entries(mappings)) {
            if (!mapping.enabled) continue;
            
            const sourceValue = this.getSourceValue(item, mapping.source);
            if (sourceValue !== undefined && sourceValue !== null) {
                visual[visualProp] = this.applyVisualFunction(
                    sourceValue, 
                    mapping.function, 
                    mapping.parameters,
                    mapping.range,
                    mapping.palette
                );
            }
        }
        
        return visual;
    }

    /**
     * Get source value from item data
     * @param {Object} item - Item data
     * @param {string} sourcePath - Source field path (supports dot notation)
     * @returns {*} - Source value
     */
    getSourceValue(item, sourcePath) {
        if (!sourcePath) return undefined;
        
        // Handle dot notation (e.g., "personality.extraversion")
        const parts = sourcePath.split('.');
        let value = item.properties || item;
        
        for (const part of parts) {
            if (value && typeof value === 'object' && value[part] !== undefined) {
                value = value[part];
            } else {
                return undefined;
            }
        }
        
        return value;
    }

    /**
     * Apply visual function to transform data value to visual value
     * @param {*} value - Source data value
     * @param {string} functionName - Function name
     * @param {Object} parameters - Function parameters
     * @param {Array} range - Output range
     * @param {string} palette - Color palette
     * @returns {*} - Visual value
     */
    applyVisualFunction(value, functionName, parameters = {}, range = null, palette = null) {
        switch (functionName) {
            case 'linear':
                return this.linearTransform(value, range || [0, 1]);
                
            case 'exponential':
                return this.exponentialTransform(value, parameters.base || 2, range || [0, 1]);
                
            case 'logarithmic':
                return this.logarithmicTransform(value, parameters.base || Math.E, range || [0, 1]);
                
            case 'sphereComplexity':
                return this.sphereComplexityTransform(value, parameters.minSegments || 4, parameters.maxSegments || 32);
                
            case 'heatmap':
                return this.heatmapTransform(value, palette || 'blue-red');
                
            case 'bipolar':
                return this.bipolarTransform(value, parameters.positive || '#00ff00', parameters.negative || '#ff0000');
                
            case 'pulse':
                return this.pulseTransform(value, parameters.frequency || 1.0);
                
            case 'geographic':
                return this.geographicTransform(value);
                
            case 'categorical':
                return this.categoricalTransform(value, parameters.mapping || {});
                
            default:
                return value;
        }
    }

    // Visual transformation functions
    linearTransform(value, range) {
        if (typeof value !== 'number') return range[0];
        return range[0] + (value * (range[1] - range[0]));
    }

    exponentialTransform(value, base, range) {
        if (typeof value !== 'number') return range[0];
        const normalized = (Math.pow(base, value) - 1) / (Math.pow(base, 1) - 1);
        return range[0] + (normalized * (range[1] - range[0]));
    }

    logarithmicTransform(value, base, range) {
        if (typeof value !== 'number') return range[0];
        const normalized = Math.log(1 + value) / Math.log(1 + 1);
        return range[0] + (normalized * (range[1] - range[0]));
    }

    sphereComplexityTransform(value, minSegments, maxSegments) {
        if (typeof value !== 'number') return minSegments;
        return Math.floor(minSegments + (value * (maxSegments - minSegments)));
    }

    heatmapTransform(value, palette) {
        if (typeof value !== 'number') return '#000000';
        
        // Normalize value to 0-1
        const normalized = Math.max(0, Math.min(1, value));
        
        switch (palette) {
            case 'blue-red':
                const r = Math.floor(normalized * 255);
                const b = Math.floor((1 - normalized) * 255);
                return `rgb(${r}, 0, ${b})`;
                
            case 'grayscale':
                const gray = Math.floor(normalized * 255);
                return `rgb(${gray}, ${gray}, ${gray})`;
                
            case 'rainbow':
                const hue = normalized * 360;
                return `hsl(${hue}, 100%, 50%)`;
                
            default:
                return `hsl(${normalized * 240}, 100%, 50%)`;
        }
    }

    bipolarTransform(value, positiveColor, negativeColor) {
        if (typeof value !== 'number') return '#808080';
        
        if (value > 0) {
            return positiveColor;
        } else if (value < 0) {
            return negativeColor;
        } else {
            return '#808080'; // Neutral
        }
    }

    pulseTransform(value, frequency) {
        return {
            intensity: Math.max(0, Math.min(1, value)),
            frequency: frequency,
            enabled: value > 0
        };
    }

    geographicTransform(value) {
        if (typeof value !== 'object' || !value) return { x: 0, y: 0, z: 0 };
        
        // Convert lat/lng to 3D coordinates
        const lat = value.lat || 0;
        const lng = value.lng || 0;
        const elevation = value.elevation || 0;
        
        // Simple projection (can be enhanced with proper map projections)
        return {
            x: lng * 111320, // Rough meters per degree longitude
            y: elevation,
            z: lat * 110540  // Rough meters per degree latitude
        };
    }

    categoricalTransform(value, mapping) {
        return mapping[value] || value;
    }

    /**
     * Enable/disable preview mode
     * @param {boolean} enabled - Preview mode state
     */
    setPreviewMode(enabled) {
        this.previewMode = enabled;
        if (enabled) {
            this.updatePreview();
        }
    }

    /**
     * Update preview
     */
    updatePreview() {
        if (!this.parsedData) return;
        
        const previewData = {
            entities: this.generateEntityVisuals(this.parsedData.entities),
            relationships: this.generateRelationshipVisuals(this.parsedData.relationships)
        };
        
        this.triggerCallbacks('onPreviewUpdate', previewData);
    }

    /**
     * Apply current mappings and generate final visual data
     * @returns {Object} - Complete visual data ready for rendering
     */
    applyMappings() {
        if (!this.parsedData) return null;
        
        const visualData = {
            metadata: this.parsedData.metadata,
            entities: this.generateEntityVisuals(this.parsedData.entities),
            relationships: this.generateRelationshipVisuals(this.parsedData.relationships),
            mappings: this.userMappings
        };
        
        this.triggerCallbacks('onApplyMappings', visualData);
        
        return visualData;
    }

    /**
     * Export current mappings as preset
     * @param {string} name - Preset name
     * @returns {Object} - Exportable preset
     */
    exportAsPreset(name) {
        return {
            name: name,
            created: new Date().toISOString(),
            mappings: JSON.parse(JSON.stringify(this.userMappings))
        };
    }

    /**
     * Import preset
     * @param {Object} preset - Preset to import
     */
    importPreset(preset) {
        if (preset.mappings) {
            this.userMappings = JSON.parse(JSON.stringify(preset.mappings));
            
            this.triggerCallbacks('onMappingChange', {
                preset: true,
                allMappings: this.userMappings
            });
            
            if (this.previewMode) {
                this.updatePreview();
            }
        }
    }

    /**
     * Register callback
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }

    /**
     * Trigger callbacks
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    triggerCallbacks(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }

    /**
     * Get current state for serialization
     * @returns {Object} - Current state
     */
    getState() {
        return {
            userMappings: this.userMappings,
            previewMode: this.previewMode,
            availableFields: this.availableFields,
            visualOptions: this.visualOptions
        };
    }

    /**
     * Restore state from serialization
     * @param {Object} state - State to restore
     */
    setState(state) {
        if (state.userMappings) {
            this.userMappings = state.userMappings;
        }
        if (state.previewMode !== undefined) {
            this.previewMode = state.previewMode;
        }
        if (state.availableFields) {
            this.availableFields = state.availableFields;
        }
        if (state.visualOptions) {
            this.visualOptions = state.visualOptions;
        }
    }
}