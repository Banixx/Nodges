/**
 * DataModelValidator - Validates and ensures data integrity for future JSON format
 * Provides comprehensive validation, auto-correction, and schema generation
 */

export class DataModelValidator {
    constructor() {
        this.validationRules = {
            required: ['system', 'dataModel', 'data'],
            optional: ['metadata', 'visualMappings', 'version', 'description'],
            dataTypes: ['continuous', 'categorical', 'vector', 'spatial', 'temporal', 'boolean'],
            visualFunctions: ['linear', 'exponential', 'logarithmic', 'sphereComplexity', 'heatmap', 'bipolar', 'pulse', 'geographic']
        };
        
        this.errors = [];
        this.warnings = [];
        this.autoCorrections = [];
    }

    /**
     * Validate complete JSON data structure
     * @param {Object} data - JSON data to validate
     * @returns {Object} - Validation result with errors, warnings, and corrected data
     */
    validate(data) {
        this.reset();
        
        try {
            // Structure validation
            this.validateStructure(data);
            
            // Data model validation
            this.validateDataModel(data.dataModel);
            
            // Data consistency validation
            this.validateDataConsistency(data);
            
            // Visual mappings validation
            if (data.visualMappings) {
                this.validateVisualMappings(data.visualMappings, data.dataModel);
            }
            
            // Auto-correct if possible
            const correctedData = this.autoCorrect(data);
            
            return {
                isValid: this.errors.length === 0,
                errors: this.errors,
                warnings: this.warnings,
                autoCorrections: this.autoCorrections,
                correctedData: correctedData
            };
            
        } catch (error) {
            this.errors.push(`Critical validation error: ${error.message}`);
            return {
                isValid: false,
                errors: this.errors,
                warnings: this.warnings,
                autoCorrections: this.autoCorrections,
                correctedData: data
            };
        }
    }

    /**
     * Reset validation state
     */
    reset() {
        this.errors = [];
        this.warnings = [];
        this.autoCorrections = [];
    }

    /**
     * Validate basic structure
     * @param {Object} data - Data to validate
     */
    validateStructure(data) {
        // Check required fields
        this.validationRules.required.forEach(field => {
            if (!data[field]) {
                this.errors.push(`Missing required field: ${field}`);
            }
        });

        // Check data.entities
        if (data.data && !Array.isArray(data.data.entities)) {
            this.errors.push('data.entities must be an array');
        }

        // Check data.relationships
        if (data.data && data.data.relationships && !Array.isArray(data.data.relationships)) {
            this.errors.push('data.relationships must be an array');
        }

        // Check system name
        if (data.system && typeof data.system !== 'string') {
            this.errors.push('system must be a string');
        }
    }

    /**
     * Validate data model definitions
     * @param {Object} dataModel - Data model to validate
     */
    validateDataModel(dataModel) {
        if (!dataModel) return;

        // Validate entities
        if (dataModel.entities) {
            for (const [entityType, definition] of Object.entries(dataModel.entities)) {
                this.validateEntityDefinition(entityType, definition);
            }
        }

        // Validate relationships
        if (dataModel.relationships) {
            for (const [relationshipType, definition] of Object.entries(dataModel.relationships)) {
                this.validateRelationshipDefinition(relationshipType, definition);
            }
        }
    }

    /**
     * Validate entity definition
     * @param {string} entityType - Entity type name
     * @param {Object} definition - Entity definition
     */
    validateEntityDefinition(entityType, definition) {
        if (!definition.properties) {
            this.warnings.push(`Entity type '${entityType}' has no properties defined`);
            return;
        }

        for (const [propName, propDef] of Object.entries(definition.properties)) {
            this.validatePropertyDefinition(entityType, propName, propDef);
        }
    }

    /**
     * Validate relationship definition
     * @param {string} relationshipType - Relationship type name
     * @param {Object} definition - Relationship definition
     */
    validateRelationshipDefinition(relationshipType, definition) {
        this.validateEntityDefinition(relationshipType, definition); // Same validation logic
    }

    /**
     * Validate property definition
     * @param {string} parentType - Parent entity/relationship type
     * @param {string} propName - Property name
     * @param {Object} propDef - Property definition
     */
    validatePropertyDefinition(parentType, propName, propDef) {
        // Check required type
        if (!propDef.type) {
            this.errors.push(`Property '${propName}' in '${parentType}' missing type definition`);
            return;
        }

        // Check valid data type
        if (!this.validationRules.dataTypes.includes(propDef.type)) {
            this.errors.push(`Invalid data type '${propDef.type}' for property '${propName}' in '${parentType}'`);
        }

        // Type-specific validation
        switch (propDef.type) {
            case 'continuous':
                this.validateContinuousProperty(parentType, propName, propDef);
                break;
            case 'categorical':
                this.validateCategoricalProperty(parentType, propName, propDef);
                break;
            case 'vector':
                this.validateVectorProperty(parentType, propName, propDef);
                break;
            case 'spatial':
                this.validateSpatialProperty(parentType, propName, propDef);
                break;
            case 'temporal':
                this.validateTemporalProperty(parentType, propName, propDef);
                break;
        }
    }

    /**
     * Validate continuous property
     */
    validateContinuousProperty(parentType, propName, propDef) {
        if (propDef.range && (!Array.isArray(propDef.range) || propDef.range.length !== 2)) {
            this.errors.push(`Continuous property '${propName}' in '${parentType}' has invalid range format`);
        }
        
        if (propDef.range && propDef.range[0] >= propDef.range[1]) {
            this.errors.push(`Continuous property '${propName}' in '${parentType}' has invalid range: min >= max`);
        }
    }

    /**
     * Validate categorical property
     */
    validateCategoricalProperty(parentType, propName, propDef) {
        if (!propDef.values || !Array.isArray(propDef.values) || propDef.values.length === 0) {
            this.errors.push(`Categorical property '${propName}' in '${parentType}' must have non-empty values array`);
        }
    }

    /**
     * Validate vector property
     */
    validateVectorProperty(parentType, propName, propDef) {
        if (!propDef.dimensions || !Array.isArray(propDef.dimensions) || propDef.dimensions.length === 0) {
            this.errors.push(`Vector property '${propName}' in '${parentType}' must have non-empty dimensions array`);
        }
    }

    /**
     * Validate spatial property
     */
    validateSpatialProperty(parentType, propName, propDef) {
        if (!propDef.coordinates || !Array.isArray(propDef.coordinates)) {
            this.errors.push(`Spatial property '${propName}' in '${parentType}' must have coordinates array`);
        }
    }

    /**
     * Validate temporal property
     */
    validateTemporalProperty(parentType, propName, propDef) {
        if (propDef.unit && !['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'].includes(propDef.unit)) {
            this.warnings.push(`Temporal property '${propName}' in '${parentType}' has non-standard unit: ${propDef.unit}`);
        }
    }

    /**
     * Validate data consistency with model
     * @param {Object} data - Complete data object
     */
    validateDataConsistency(data) {
        if (!data.data || !data.dataModel) return;

        // Validate entities
        if (data.data.entities) {
            data.data.entities.forEach((entity, index) => {
                this.validateEntityData(entity, index, data.dataModel);
            });
        }

        // Validate relationships
        if (data.data.relationships) {
            data.data.relationships.forEach((relationship, index) => {
                this.validateRelationshipData(relationship, index, data.dataModel, data.data.entities);
            });
        }
    }

    /**
     * Validate entity data against model
     * @param {Object} entity - Entity data
     * @param {number} index - Entity index
     * @param {Object} dataModel - Data model
     */
    validateEntityData(entity, index, dataModel) {
        if (!entity.id) {
            this.warnings.push(`Entity at index ${index} missing id`);
        }

        const entityType = entity.type || 'default';
        const entityDef = dataModel.entities && dataModel.entities[entityType];

        if (!entityDef) {
            this.warnings.push(`Entity '${entity.id || index}' has undefined type: ${entityType}`);
            return;
        }

        // Validate properties
        if (entityDef.properties) {
            for (const [propName, propDef] of Object.entries(entityDef.properties)) {
                if (entity[propName] !== undefined) {
                    this.validatePropertyValue(entity[propName], propDef, `entity '${entity.id || index}' property '${propName}'`);
                }
            }
        }
    }

    /**
     * Validate relationship data against model
     * @param {Object} relationship - Relationship data
     * @param {number} index - Relationship index
     * @param {Object} dataModel - Data model
     * @param {Array} entities - Entities array for reference validation
     */
    validateRelationshipData(relationship, index, dataModel, entities) {
        if (!relationship.source || !relationship.target) {
            this.errors.push(`Relationship at index ${index} missing source or target`);
            return;
        }

        // Validate source and target exist
        const entityIds = entities ? entities.map(e => e.id) : [];
        if (entities && !entityIds.includes(relationship.source)) {
            this.errors.push(`Relationship '${relationship.id || index}' references non-existent source: ${relationship.source}`);
        }
        if (entities && !entityIds.includes(relationship.target)) {
            this.errors.push(`Relationship '${relationship.id || index}' references non-existent target: ${relationship.target}`);
        }

        const relationshipType = relationship.type || 'default';
        const relationshipDef = dataModel.relationships && dataModel.relationships[relationshipType];

        if (!relationshipDef) {
            this.warnings.push(`Relationship '${relationship.id || index}' has undefined type: ${relationshipType}`);
            return;
        }

        // Validate properties
        if (relationshipDef.properties) {
            for (const [propName, propDef] of Object.entries(relationshipDef.properties)) {
                if (relationship[propName] !== undefined) {
                    this.validatePropertyValue(relationship[propName], propDef, `relationship '${relationship.id || index}' property '${propName}'`);
                }
            }
        }
    }

    /**
     * Validate property value against definition
     * @param {*} value - Property value
     * @param {Object} propDef - Property definition
     * @param {string} context - Context for error messages
     */
    validatePropertyValue(value, propDef, context) {
        switch (propDef.type) {
            case 'continuous':
                if (typeof value !== 'number') {
                    this.errors.push(`${context}: expected number, got ${typeof value}`);
                } else if (propDef.range && (value < propDef.range[0] || value > propDef.range[1])) {
                    this.warnings.push(`${context}: value ${value} outside range [${propDef.range[0]}, ${propDef.range[1]}]`);
                }
                break;
                
            case 'categorical':
                if (propDef.values && !propDef.values.includes(value)) {
                    this.errors.push(`${context}: invalid categorical value '${value}', expected one of: ${propDef.values.join(', ')}`);
                }
                break;
                
            case 'vector':
                if (typeof value !== 'object' || value === null) {
                    this.errors.push(`${context}: expected object for vector, got ${typeof value}`);
                } else if (propDef.dimensions) {
                    propDef.dimensions.forEach(dim => {
                        if (value[dim] === undefined) {
                            this.warnings.push(`${context}: missing vector dimension '${dim}'`);
                        }
                    });
                }
                break;
                
            case 'spatial':
                if (typeof value !== 'object' || value === null) {
                    this.errors.push(`${context}: expected object for spatial, got ${typeof value}`);
                } else if (propDef.coordinates) {
                    propDef.coordinates.forEach(coord => {
                        if (typeof value[coord] !== 'number') {
                            this.errors.push(`${context}: spatial coordinate '${coord}' must be a number`);
                        }
                    });
                }
                break;
                
            case 'boolean':
                if (typeof value !== 'boolean') {
                    this.warnings.push(`${context}: expected boolean, got ${typeof value} (will be converted)`);
                }
                break;
        }
    }

    /**
     * Validate visual mappings
     * @param {Object} visualMappings - Visual mappings to validate
     * @param {Object} dataModel - Data model for reference
     */
    validateVisualMappings(visualMappings, dataModel) {
        if (!visualMappings.defaultPresets) return;

        for (const [type, preset] of Object.entries(visualMappings.defaultPresets)) {
            for (const [visualProp, mapping] of Object.entries(preset)) {
                this.validateVisualMapping(type, visualProp, mapping, dataModel);
            }
        }
    }

    /**
     * Validate individual visual mapping
     * @param {string} type - Entity/relationship type
     * @param {string} visualProp - Visual property name
     * @param {Object} mapping - Mapping definition
     * @param {Object} dataModel - Data model for reference
     */
    validateVisualMapping(type, visualProp, mapping, dataModel) {
        // Check if function exists
        if (mapping.function && !this.validationRules.visualFunctions.includes(mapping.function)) {
            this.warnings.push(`Unknown visual function '${mapping.function}' in ${type}.${visualProp}`);
        }

        // Check if source field exists in data model
        if (mapping.source && dataModel) {
            const isEntityType = dataModel.entities && dataModel.entities[type];
            const isRelationshipType = dataModel.relationships && dataModel.relationships[type];
            
            if (isEntityType) {
                const entityDef = dataModel.entities[type];
                if (entityDef.properties && !entityDef.properties[mapping.source]) {
                    this.warnings.push(`Visual mapping ${type}.${visualProp} references undefined entity property: ${mapping.source}`);
                }
            } else if (isRelationshipType) {
                const relationshipDef = dataModel.relationships[type];
                if (relationshipDef.properties && !relationshipDef.properties[mapping.source]) {
                    this.warnings.push(`Visual mapping ${type}.${visualProp} references undefined relationship property: ${mapping.source}`);
                }
            }
        }
    }

    /**
     * Auto-correct data where possible
     * @param {Object} data - Data to correct
     * @returns {Object} - Corrected data
     */
    autoCorrect(data) {
        const corrected = JSON.parse(JSON.stringify(data)); // Deep clone

        // Auto-generate missing IDs
        if (corrected.data && corrected.data.entities) {
            corrected.data.entities.forEach((entity, index) => {
                if (!entity.id) {
                    entity.id = `entity_${index}`;
                    this.autoCorrections.push(`Generated ID for entity at index ${index}: ${entity.id}`);
                }
            });
        }

        if (corrected.data && corrected.data.relationships) {
            corrected.data.relationships.forEach((relationship, index) => {
                if (!relationship.id) {
                    relationship.id = `relationship_${index}`;
                    this.autoCorrections.push(`Generated ID for relationship at index ${index}: ${relationship.id}`);
                }
            });
        }

        // Auto-generate basic metadata if missing
        if (!corrected.metadata) {
            corrected.metadata = {};
        }
        if (!corrected.metadata.created) {
            corrected.metadata.created = new Date().toISOString();
            this.autoCorrections.push('Generated creation timestamp');
        }
        if (!corrected.metadata.version) {
            corrected.metadata.version = '1.0';
            this.autoCorrections.push('Set default version to 1.0');
        }

        return corrected;
    }

    /**
     * Generate schema from existing data (for legacy conversion)
     * @param {Object} data - Data to analyze
     * @returns {Object} - Generated data model
     */
    generateSchemaFromData(data) {
        const schema = {
            entities: {},
            relationships: {}
        };

        // Analyze entities
        if (data.entities || data.nodes) {
            const entities = data.entities || data.nodes;
            const entityTypes = {};

            entities.forEach(entity => {
                const type = entity.type || 'default';
                if (!entityTypes[type]) entityTypes[type] = {};

                Object.keys(entity).forEach(key => {
                    if (!['id', 'type', 'label'].includes(key)) {
                        entityTypes[type][key] = this.inferPropertyType(entity[key]);
                    }
                });
            });

            // Convert to schema format
            for (const [type, properties] of Object.entries(entityTypes)) {
                schema.entities[type] = { properties };
            }
        }

        // Analyze relationships
        if (data.relationships || data.edges) {
            const relationships = data.relationships || data.edges;
            const relationshipTypes = {};

            relationships.forEach(relationship => {
                const type = relationship.type || 'default';
                if (!relationshipTypes[type]) relationshipTypes[type] = {};

                Object.keys(relationship).forEach(key => {
                    if (!['id', 'type', 'source', 'target', 'start', 'end'].includes(key)) {
                        relationshipTypes[type][key] = this.inferPropertyType(relationship[key]);
                    }
                });
            });

            // Convert to schema format
            for (const [type, properties] of Object.entries(relationshipTypes)) {
                schema.relationships[type] = { properties };
            }
        }

        return schema;
    }

    /**
     * Infer property type from value
     * @param {*} value - Value to analyze
     * @returns {Object} - Inferred property definition
     */
    inferPropertyType(value) {
        if (typeof value === 'number') {
            return { type: 'continuous' };
        } else if (typeof value === 'boolean') {
            return { type: 'boolean' };
        } else if (typeof value === 'string') {
            return { type: 'categorical' };
        } else if (Array.isArray(value)) {
            return { type: 'vector', dimensions: value.map((_, i) => `dim_${i}`) };
        } else if (typeof value === 'object' && value !== null) {
            const keys = Object.keys(value);
            if (keys.includes('x') && keys.includes('y')) {
                return { type: 'spatial', coordinates: keys };
            } else {
                return { type: 'vector', dimensions: keys };
            }
        }
        return { type: 'categorical' };
    }
}