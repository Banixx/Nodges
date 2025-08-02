/**
 * FutureDataParser - Next-generation JSON parser for Nodges
 * Handles flexible data models with dynamic entity types and relationship mappings
 * Supports the Connect Interface vision with full user customization
 */

export class FutureDataParser {
    constructor() {
        this.supportedDataTypes = {
            'continuous': this.parseContinuous,
            'categorical': this.parseCategorical,
            'vector': this.parseVector,
            'spatial': this.parseSpatial,
            'temporal': this.parseTemporal,
            'boolean': this.parseBoolean
        };
        
        this.visualFunctions = {
            'linear': this.linearMapping,
            'exponential': this.exponentialMapping,
            'logarithmic': this.logarithmicMapping,
            'sphereComplexity': this.sphereComplexityMapping,
            'heatmap': this.heatmapMapping,
            'bipolar': this.bipolarMapping,
            'pulse': this.pulseMapping,
            'geographic': this.geographicMapping
        };
    }

    /**
     * Parse future-format JSON data
     * @param {Object} jsonData - The JSON data in future format
     * @returns {Object} - Parsed and normalized data ready for Nodges
     */
    async parseData(jsonData) {
        this.validateStructure(jsonData);
        
        const parsedData = {
            metadata: this.parseMetadata(jsonData),
            dataModel: this.parseDataModel(jsonData.dataModel),
            visualMappings: this.parseVisualMappings(jsonData.visualMappings),
            entities: this.parseEntities(jsonData.data.entities, jsonData.dataModel),
            relationships: this.parseRelationships(jsonData.data.relationships, jsonData.dataModel),
            
            // Connect Interface ready data
            availableFields: this.extractAvailableFields(jsonData),
            visualOptions: this.extractVisualOptions(jsonData.visualMappings)
        };

        return parsedData;
    }

    /**
     * Validate the JSON structure
     * @param {Object} data - JSON data to validate
     */
    validateStructure(data) {
        const required = ['system', 'dataModel', 'data'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        if (!data.data.entities || !Array.isArray(data.data.entities)) {
            throw new Error('data.entities must be an array');
        }

        if (data.data.relationships && !Array.isArray(data.data.relationships)) {
            throw new Error('data.relationships must be an array');
        }
    }

    /**
     * Parse metadata section
     * @param {Object} data - Full JSON data
     * @returns {Object} - Parsed metadata
     */
    parseMetadata(data) {
        return {
            system: data.system,
            version: data.version || '1.0',
            created: data.created || new Date().toISOString(),
            description: data.description || '',
            author: data.author || 'Unknown',
            ...data.metadata
        };
    }

    /**
     * Parse data model definitions
     * @param {Object} dataModel - Data model section
     * @returns {Object} - Processed data model
     */
    parseDataModel(dataModel) {
        const processed = {
            entities: {},
            relationships: {}
        };

        // Process entity types
        if (dataModel.entities) {
            for (const [entityType, definition] of Object.entries(dataModel.entities)) {
                processed.entities[entityType] = this.processEntityDefinition(definition);
            }
        }

        // Process relationship types
        if (dataModel.relationships) {
            for (const [relationshipType, definition] of Object.entries(dataModel.relationships)) {
                processed.relationships[relationshipType] = this.processRelationshipDefinition(definition);
            }
        }

        return processed;
    }

    /**
     * Process entity type definition
     * @param {Object} definition - Entity definition
     * @returns {Object} - Processed definition
     */
    processEntityDefinition(definition) {
        const processed = {
            properties: {},
            constraints: definition.constraints || {}
        };

        if (definition.properties) {
            for (const [propName, propDef] of Object.entries(definition.properties)) {
                processed.properties[propName] = this.processPropertyDefinition(propDef);
            }
        }

        return processed;
    }

    /**
     * Process relationship type definition
     * @param {Object} definition - Relationship definition
     * @returns {Object} - Processed definition
     */
    processRelationshipDefinition(definition) {
        return this.processEntityDefinition(definition); // Same structure
    }

    /**
     * Process property definition
     * @param {Object} propDef - Property definition
     * @returns {Object} - Processed property
     */
    processPropertyDefinition(propDef) {
        const processed = {
            type: propDef.type,
            range: propDef.range || null,
            unit: propDef.unit || null,
            dimensions: propDef.dimensions || null,
            coordinates: propDef.coordinates || null,
            values: propDef.values || null,
            default: propDef.default || null
        };

        // Validate type
        if (!this.supportedDataTypes[propDef.type]) {
            console.warn(`Unsupported data type: ${propDef.type}`);
        }

        return processed;
    }

    /**
     * Parse visual mappings
     * @param {Object} visualMappings - Visual mappings section
     * @returns {Object} - Processed visual mappings
     */
    parseVisualMappings(visualMappings) {
        if (!visualMappings) return { defaultPresets: {} };

        const processed = {
            defaultPresets: {}
        };

        if (visualMappings.defaultPresets) {
            for (const [type, preset] of Object.entries(visualMappings.defaultPresets)) {
                processed.defaultPresets[type] = this.processVisualPreset(preset);
            }
        }

        return processed;
    }

    /**
     * Process visual preset
     * @param {Object} preset - Visual preset definition
     * @returns {Object} - Processed preset
     */
    processVisualPreset(preset) {
        const processed = {};

        for (const [visualProperty, mapping] of Object.entries(preset)) {
            processed[visualProperty] = {
                source: mapping.source,
                function: mapping.function || 'linear',
                params: mapping.params || {},
                range: mapping.range || null,
                palette: mapping.palette || null,
                ...mapping
            };

            // Validate function
            if (!this.visualFunctions[mapping.function]) {
                console.warn(`Unsupported visual function: ${mapping.function}`);
            }
        }

        return processed;
    }

    /**
     * Parse entities data
     * @param {Array} entities - Entities array
     * @param {Object} dataModel - Data model for validation
     * @returns {Array} - Processed entities
     */
    parseEntities(entities, dataModel) {
        return entities.map((entity, index) => {
            const processed = {
                id: entity.id || `entity_${index}`,
                type: entity.type || 'default',
                label: entity.label || entity.name || entity.id || `Entity ${index}`,
                rawData: { ...entity }
            };

            // Process properties based on data model
            if (dataModel.entities && dataModel.entities[entity.type]) {
                const entityDef = dataModel.entities[entity.type];
                processed.properties = this.processEntityProperties(entity, entityDef);
            } else {
                // Fallback: process all properties as-is
                processed.properties = { ...entity };
                delete processed.properties.id;
                delete processed.properties.type;
                delete processed.properties.label;
            }

            return processed;
        });
    }

    /**
     * Parse relationships data
     * @param {Array} relationships - Relationships array
     * @param {Object} dataModel - Data model for validation
     * @returns {Array} - Processed relationships
     */
    parseRelationships(relationships, dataModel) {
        if (!relationships) return [];

        return relationships.map((relationship, index) => {
            const processed = {
                id: relationship.id || `relationship_${index}`,
                type: relationship.type || 'default',
                source: relationship.source,
                target: relationship.target,
                label: relationship.label || relationship.name || `${relationship.source} -> ${relationship.target}`,
                rawData: { ...relationship }
            };

            // Validate source and target
            if (!processed.source || !processed.target) {
                throw new Error(`Relationship ${processed.id} missing source or target`);
            }

            // Process properties based on data model
            if (dataModel.relationships && dataModel.relationships[relationship.type]) {
                const relationshipDef = dataModel.relationships[relationship.type];
                processed.properties = this.processEntityProperties(relationship, relationshipDef);
            } else {
                // Fallback: process all properties as-is
                processed.properties = { ...relationship };
                delete processed.properties.id;
                delete processed.properties.type;
                delete processed.properties.source;
                delete processed.properties.target;
                delete processed.properties.label;
            }

            return processed;
        });
    }

    /**
     * Process entity properties based on definition
     * @param {Object} entity - Entity data
     * @param {Object} definition - Entity definition
     * @returns {Object} - Processed properties
     */
    processEntityProperties(entity, definition) {
        const processed = {};

        if (definition.properties) {
            for (const [propName, propDef] of Object.entries(definition.properties)) {
                if (entity[propName] !== undefined) {
                    processed[propName] = this.processPropertyValue(entity[propName], propDef);
                } else if (propDef.default !== null) {
                    processed[propName] = propDef.default;
                }
            }
        }

        // Include any additional properties not in definition
        for (const [key, value] of Object.entries(entity)) {
            if (!['id', 'type', 'label', 'source', 'target'].includes(key) && 
                (!definition.properties || !definition.properties[key])) {
                processed[key] = value;
            }
        }

        return processed;
    }

    /**
     * Process property value based on its definition
     * @param {*} value - Property value
     * @param {Object} propDef - Property definition
     * @returns {*} - Processed value
     */
    processPropertyValue(value, propDef) {
        const parser = this.supportedDataTypes[propDef.type];
        if (parser) {
            return parser.call(this, value, propDef);
        }
        return value; // Fallback: return as-is
    }

    /**
     * Extract all available fields for Connect Interface
     * @param {Object} jsonData - Full JSON data
     * @returns {Object} - Available fields categorized
     */
    extractAvailableFields(jsonData) {
        const fields = {
            entities: {},
            relationships: {}
        };

        // Extract from data model
        if (jsonData.dataModel.entities) {
            for (const [entityType, definition] of Object.entries(jsonData.dataModel.entities)) {
                fields.entities[entityType] = Object.keys(definition.properties || {});
            }
        }

        if (jsonData.dataModel.relationships) {
            for (const [relationshipType, definition] of Object.entries(jsonData.dataModel.relationships)) {
                fields.relationships[relationshipType] = Object.keys(definition.properties || {});
            }
        }

        // Also extract from actual data (for dynamic fields)
        if (jsonData.data.entities) {
            jsonData.data.entities.forEach(entity => {
                const type = entity.type || 'default';
                if (!fields.entities[type]) fields.entities[type] = [];
                
                Object.keys(entity).forEach(key => {
                    if (!['id', 'type', 'label'].includes(key) && 
                        !fields.entities[type].includes(key)) {
                        fields.entities[type].push(key);
                    }
                });
            });
        }

        if (jsonData.data.relationships) {
            jsonData.data.relationships.forEach(relationship => {
                const type = relationship.type || 'default';
                if (!fields.relationships[type]) fields.relationships[type] = [];
                
                Object.keys(relationship).forEach(key => {
                    if (!['id', 'type', 'source', 'target', 'label'].includes(key) && 
                        !fields.relationships[type].includes(key)) {
                        fields.relationships[type].push(key);
                    }
                });
            });
        }

        return fields;
    }

    /**
     * Extract visual options for Connect Interface
     * @param {Object} visualMappings - Visual mappings section
     * @returns {Object} - Available visual options
     */
    extractVisualOptions(visualMappings) {
        const options = {
            entities: ['position', 'size', 'color', 'geometry', 'opacity', 'glow'],
            relationships: ['thickness', 'color', 'curvature', 'opacity', 'glow', 'animation']
        };

        // Add custom options from presets
        if (visualMappings && visualMappings.defaultPresets) {
            for (const [type, preset] of Object.entries(visualMappings.defaultPresets)) {
                const customOptions = Object.keys(preset);
                if (type.includes('entity') || type.includes('node')) {
                    options.entities = [...new Set([...options.entities, ...customOptions])];
                } else {
                    options.relationships = [...new Set([...options.relationships, ...customOptions])];
                }
            }
        }

        return options;
    }

    // Data type parsers
    parseContinuous(value, propDef) {
        const num = parseFloat(value);
        if (isNaN(num)) return propDef.default || 0;
        
        if (propDef.range) {
            return Math.max(propDef.range[0], Math.min(propDef.range[1], num));
        }
        return num;
    }

    parseCategorical(value, propDef) {
        if (propDef.values && !propDef.values.includes(value)) {
            console.warn(`Invalid categorical value: ${value}. Expected one of: ${propDef.values.join(', ')}`);
            return propDef.default || propDef.values[0];
        }
        return value;
    }

    parseVector(value, propDef) {
        if (typeof value === 'object' && value !== null) {
            const vector = {};
            if (propDef.dimensions) {
                propDef.dimensions.forEach(dim => {
                    vector[dim] = this.parseContinuous(value[dim], { range: propDef.range });
                });
            }
            return vector;
        }
        return propDef.default || {};
    }

    parseSpatial(value, propDef) {
        if (typeof value === 'object' && value !== null) {
            const spatial = {};
            if (propDef.coordinates) {
                propDef.coordinates.forEach(coord => {
                    spatial[coord] = parseFloat(value[coord]) || 0;
                });
            }
            return spatial;
        }
        return propDef.default || { x: 0, y: 0, z: 0 };
    }

    parseTemporal(value, propDef) {
        if (typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? propDef.default || Date.now() : date.getTime();
        }
        return parseFloat(value) || propDef.default || 0;
    }

    parseBoolean(value, propDef) {
        return Boolean(value);
    }

    // Visual mapping functions (placeholders for now)
    linearMapping(value, params) {
        const { range = [0, 1] } = params;
        return range[0] + (value * (range[1] - range[0]));
    }

    exponentialMapping(value, params) {
        const { range = [0, 1], base = 2 } = params;
        const normalized = Math.pow(base, value) / Math.pow(base, 1);
        return range[0] + (normalized * (range[1] - range[0]));
    }

    logarithmicMapping(value, params) {
        const { range = [0, 1], base = Math.E } = params;
        const normalized = Math.log(1 + value) / Math.log(1 + 1);
        return range[0] + (normalized * (range[1] - range[0]));
    }

    sphereComplexityMapping(value, params) {
        const { minSegments = 4, maxSegments = 32 } = params;
        return Math.floor(minSegments + (value * (maxSegments - minSegments)));
    }

    heatmapMapping(value, params) {
        const { palette = 'blue-red' } = params;
        // Return color based on value and palette
        // Implementation depends on color system
        return value;
    }

    bipolarMapping(values, params) {
        const { positive = '#00ff00', negative = '#ff0000' } = params;
        // Handle bipolar mapping for arrays of values
        return values;
    }

    pulseMapping(value, params) {
        const { frequency = 'heartbeat' } = params;
        // Return pulsing parameters
        return { intensity: value, frequency };
    }

    geographicMapping(value, params) {
        // Convert geographic coordinates to 3D space
        if (value.lat !== undefined && value.lng !== undefined) {
            return {
                x: value.lng * 111320, // Rough conversion to meters
                y: value.elevation || 0,
                z: value.lat * 110540
            };
        }
        return { x: 0, y: 0, z: 0 };
    }
}