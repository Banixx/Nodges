/**
 * FutureDataManager - Central orchestration system for the future JSON architecture
 * Coordinates FutureDataParser, DataModelValidator, and ConnectInterfaceAdapter
 * Provides the main API for loading, validating, and processing future-format data
 */

import { FutureDataParser } from './FutureDataParser.js';
import { DataModelValidator } from './DataModelValidator.js';
import { ConnectInterfaceAdapter } from './ConnectInterfaceAdapter.js';

export class FutureDataManager {
    constructor() {
        this.parser = new FutureDataParser();
        this.validator = new DataModelValidator();
        this.connectInterface = new ConnectInterfaceAdapter();
        
        this.currentData = null;
        this.validationResult = null;
        this.isInitialized = false;
        
        this.callbacks = {
            onDataLoaded: [],
            onValidationComplete: [],
            onVisualizationReady: [],
            onError: []
        };
    }

    /**
     * Load and process future-format JSON data
     * @param {string|Object} source - URL string or JSON object
     * @returns {Promise<Object>} - Processing result
     */
    async loadData(source) {
        try {
            // Load JSON data
            let jsonData;
            if (typeof source === 'string') {
                jsonData = await this.loadFromURL(source);
            } else if (typeof source === 'object') {
                jsonData = source;
            } else {
                throw new Error('Invalid data source. Expected URL string or JSON object.');
            }

            // Validate data structure
            this.validationResult = this.validator.validate(jsonData);
            
            if (!this.validationResult.isValid) {
                this.triggerCallbacks('onValidationComplete', this.validationResult);
                
                // Try to use corrected data if available
                if (this.validationResult.correctedData) {
                    console.warn('Using auto-corrected data due to validation errors:', this.validationResult.errors);
                    jsonData = this.validationResult.correctedData;
                } else {
                    throw new Error(`Data validation failed: ${this.validationResult.errors.join(', ')}`);
                }
            }

            // Parse data
            this.currentData = await this.parser.parseData(jsonData);
            
            // Initialize Connect Interface
            const interfaceData = this.connectInterface.initialize(this.currentData);
            
            this.isInitialized = true;
            
            const result = {
                success: true,
                data: this.currentData,
                validation: this.validationResult,
                interface: interfaceData,
                statistics: this.generateStatistics()
            };

            this.triggerCallbacks('onDataLoaded', result);
            return result;

        } catch (error) {
            const errorResult = {
                success: false,
                error: error.message,
                validation: this.validationResult
            };
            
            this.triggerCallbacks('onError', errorResult);
            throw error;
        }
    }

    /**
     * Load JSON from URL
     * @param {string} url - URL to load from
     * @returns {Promise<Object>} - JSON data
     */
    async loadFromURL(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load data from ${url}: ${response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Load data from file
     * @param {File} file - File object
     * @returns {Promise<Object>} - Processing result
     */
    async loadFromFile(file) {
        try {
            const content = await this.readFileContent(file);
            const jsonData = JSON.parse(content);
            return await this.loadData(jsonData);
        } catch (error) {
            throw new Error(`Failed to load file: ${error.message}`);
        }
    }

    /**
     * Read file content
     * @param {File} file - File to read
     * @returns {Promise<string>} - File content
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Convert legacy format to future format
     * @param {Object} legacyData - Legacy JSON data
     * @returns {Promise<Object>} - Converted data in future format
     */
    async convertLegacyData(legacyData) {
        try {
            // Generate schema from legacy data
            const generatedSchema = this.validator.generateSchemaFromData(legacyData);
            
            // Convert to future format
            const futureData = {
                system: legacyData.system || legacyData.title || 'Converted System',
                metadata: {
                    converted: true,
                    originalFormat: this.detectLegacyFormat(legacyData),
                    convertedAt: new Date().toISOString(),
                    ...legacyData.metadata
                },
                dataModel: generatedSchema,
                data: {
                    entities: this.convertLegacyEntities(legacyData),
                    relationships: this.convertLegacyRelationships(legacyData)
                }
            };

            // Add basic visual mappings
            futureData.visualMappings = this.generateBasicVisualMappings(generatedSchema);

            return await this.loadData(futureData);

        } catch (error) {
            throw new Error(`Legacy conversion failed: ${error.message}`);
        }
    }

    /**
     * Detect legacy format type
     * @param {Object} data - Legacy data
     * @returns {string} - Format type
     */
    detectLegacyFormat(data) {
        if (data.nodes && data.edges) return 'nodes-edges';
        if (data.entities && data.relationships) return 'entities-relationships';
        if (data.members) return 'members';
        return 'unknown';
    }

    /**
     * Convert legacy entities
     * @param {Object} legacyData - Legacy data
     * @returns {Array} - Converted entities
     */
    convertLegacyEntities(legacyData) {
        let entities = [];
        
        if (legacyData.nodes) {
            entities = legacyData.nodes;
        } else if (legacyData.entities) {
            entities = legacyData.entities;
        } else if (legacyData.members) {
            entities = legacyData.members;
        }

        return entities.map((entity, index) => ({
            id: entity.id || `entity_${index}`,
            type: entity.type || 'default',
            label: entity.label || entity.name || `Entity ${index}`,
            ...entity
        }));
    }

    /**
     * Convert legacy relationships
     * @param {Object} legacyData - Legacy data
     * @returns {Array} - Converted relationships
     */
    convertLegacyRelationships(legacyData) {
        let relationships = [];
        
        if (legacyData.edges) {
            relationships = legacyData.edges;
        } else if (legacyData.relationships) {
            relationships = legacyData.relationships;
        }

        return relationships.map((rel, index) => ({
            id: rel.id || `relationship_${index}`,
            type: rel.type || 'default',
            source: rel.source || rel.start,
            target: rel.target || rel.end,
            label: rel.label || rel.name || `Relationship ${index}`,
            ...rel
        }));
    }

    /**
     * Generate basic visual mappings for converted data
     * @param {Object} schema - Generated schema
     * @returns {Object} - Basic visual mappings
     */
    generateBasicVisualMappings(schema) {
        const mappings = {
            defaultPresets: {}
        };

        // Generate entity mappings
        for (const [entityType, definition] of Object.entries(schema.entities || {})) {
            const preset = {};
            
            // Look for common patterns
            const properties = definition.properties || {};
            
            // Position mapping
            if (properties.x && properties.y) {
                preset.position = {
                    source: 'coordinates',
                    function: 'geographic'
                };
            }
            
            // Size mapping
            const sizeFields = ['size', 'value', 'importance', 'weight'];
            const sizeField = sizeFields.find(field => properties[field]);
            if (sizeField) {
                preset.size = {
                    source: sizeField,
                    function: 'linear',
                    range: [0.5, 2.0]
                };
            }
            
            // Color mapping
            const colorFields = ['color', 'type', 'category', 'group'];
            const colorField = colorFields.find(field => properties[field]);
            if (colorField) {
                preset.color = {
                    source: colorField,
                    function: properties[colorField].type === 'categorical' ? 'categorical' : 'heatmap'
                };
            }
            
            if (Object.keys(preset).length > 0) {
                mappings.defaultPresets[entityType] = preset;
            }
        }

        // Generate relationship mappings
        for (const [relationshipType, definition] of Object.entries(schema.relationships || {})) {
            const preset = {};
            
            const properties = definition.properties || {};
            
            // Thickness mapping
            const thicknessFields = ['weight', 'strength', 'value', 'width'];
            const thicknessField = thicknessFields.find(field => properties[field]);
            if (thicknessField) {
                preset.thickness = {
                    source: thicknessField,
                    function: 'linear',
                    range: [0.1, 1.0]
                };
            }
            
            // Color mapping
            const colorFields = ['color', 'type', 'relationship'];
            const colorField = colorFields.find(field => properties[field]);
            if (colorField) {
                preset.color = {
                    source: colorField,
                    function: 'categorical'
                };
            }
            
            if (Object.keys(preset).length > 0) {
                mappings.defaultPresets[relationshipType] = preset;
            }
        }

        return mappings;
    }

    /**
     * Generate statistics about current data
     * @returns {Object} - Data statistics
     */
    generateStatistics() {
        if (!this.currentData) return {};

        const stats = {
            entities: {
                total: this.currentData.entities.length,
                types: {}
            },
            relationships: {
                total: this.currentData.relationships.length,
                types: {}
            },
            fields: {
                entityFields: 0,
                relationshipFields: 0
            }
        };

        // Count entity types
        this.currentData.entities.forEach(entity => {
            const type = entity.type || 'default';
            stats.entities.types[type] = (stats.entities.types[type] || 0) + 1;
        });

        // Count relationship types
        this.currentData.relationships.forEach(relationship => {
            const type = relationship.type || 'default';
            stats.relationships.types[type] = (stats.relationships.types[type] || 0) + 1;
        });

        // Count available fields
        stats.fields.entityFields = Object.values(this.currentData.availableFields.entities || {})
            .reduce((total, fields) => total + fields.length, 0);
        stats.fields.relationshipFields = Object.values(this.currentData.availableFields.relationships || {})
            .reduce((total, fields) => total + fields.length, 0);

        return stats;
    }

    /**
     * Get Connect Interface instance
     * @returns {ConnectInterfaceAdapter} - Connect Interface adapter
     */
    getConnectInterface() {
        if (!this.isInitialized) {
            throw new Error('Data manager not initialized. Load data first.');
        }
        return this.connectInterface;
    }

    /**
     * Generate visualization data with current mappings
     * @returns {Object} - Ready-to-render visualization data
     */
    generateVisualizationData() {
        if (!this.isInitialized) {
            throw new Error('Data manager not initialized. Load data first.');
        }

        const visualData = this.connectInterface.applyMappings();
        
        // Convert to Nodges-compatible format
        const nodgesData = this.convertToNodgesFormat(visualData);
        
        this.triggerCallbacks('onVisualizationReady', nodgesData);
        
        return nodgesData;
    }

    /**
     * Convert visual data to Nodges-compatible format
     * @param {Object} visualData - Visual data from Connect Interface
     * @returns {Object} - Nodges-compatible data
     */
    convertToNodgesFormat(visualData) {
        const nodgesData = {
            metadata: visualData.metadata,
            nodes: [],
            edges: []
        };

        // Convert entities to nodes
        visualData.entities.forEach((entity, index) => {
            const node = {
                id: entity.id,
                name: entity.label,
                index: index,
                
                // Position
                x: entity.visual.position?.x || 0,
                y: entity.visual.position?.y || 0,
                z: entity.visual.position?.z || 0,
                
                // Visual properties
                size: entity.visual.size || 1.0,
                color: entity.visual.color || 0x3498db,
                
                // Geometry complexity for Node.js
                geometryComplexity: entity.visual.geometry || 8,
                
                // Original data
                originalData: entity,
                metadata: entity.properties
            };
            
            nodgesData.nodes.push(node);
        });

        // Convert relationships to edges
        visualData.relationships.forEach((relationship, index) => {
            const edge = {
                id: relationship.id,
                name: relationship.label,
                
                // Connection
                start: relationship.source,
                end: relationship.target,
                
                // Visual properties
                width: relationship.visual.thickness || 0.1,
                color: relationship.visual.color || 0xb498db,
                
                // Curvature and animation
                curvature: relationship.visual.curvature || 0,
                glow: relationship.visual.glow || null,
                
                // Original data
                originalData: relationship,
                metadata: relationship.properties
            };
            
            nodgesData.edges.push(edge);
        });

        return nodgesData;
    }

    /**
     * Export current configuration
     * @returns {Object} - Exportable configuration
     */
    exportConfiguration() {
        if (!this.isInitialized) {
            throw new Error('No data loaded to export');
        }

        return {
            metadata: this.currentData.metadata,
            mappings: this.connectInterface.getState(),
            statistics: this.generateStatistics(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import configuration
     * @param {Object} config - Configuration to import
     */
    importConfiguration(config) {
        if (!this.isInitialized) {
            throw new Error('Load data before importing configuration');
        }

        if (config.mappings) {
            this.connectInterface.setState(config.mappings);
        }
    }

    /**
     * Get validation result
     * @returns {Object} - Last validation result
     */
    getValidationResult() {
        return this.validationResult;
    }

    /**
     * Get current data
     * @returns {Object} - Current parsed data
     */
    getCurrentData() {
        return this.currentData;
    }

    /**
     * Check if manager is initialized
     * @returns {boolean} - Initialization status
     */
    isReady() {
        return this.isInitialized;
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
     * Remove callback
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
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
     * Reset manager state
     */
    reset() {
        this.currentData = null;
        this.validationResult = null;
        this.isInitialized = false;
        this.connectInterface = new ConnectInterfaceAdapter();
    }

    /**
     * Create example future-format data
     * @returns {Object} - Example data structure
     */
    static createExampleData() {
        return {
            system: "Example System",
            metadata: {
                created: new Date().toISOString(),
                version: "1.0",
                description: "Example future-format data"
            },
            dataModel: {
                entities: {
                    person: {
                        properties: {
                            age: { type: "continuous", range: [0, 100] },
                            role: { type: "categorical", values: ["admin", "user", "guest"] },
                            location: { type: "spatial", coordinates: ["x", "y", "z"] }
                        }
                    }
                },
                relationships: {
                    friendship: {
                        properties: {
                            strength: { type: "continuous", range: [0, 1] },
                            duration: { type: "temporal", unit: "years" }
                        }
                    }
                }
            },
            visualMappings: {
                defaultPresets: {
                    person: {
                        size: { source: "age", function: "linear", range: [0.5, 2.0] },
                        color: { source: "role", function: "categorical" },
                        position: { source: "location", function: "geographic" }
                    },
                    friendship: {
                        thickness: { source: "strength", function: "linear", range: [0.1, 1.0] },
                        glow: { source: "duration", function: "pulse" }
                    }
                }
            },
            data: {
                entities: [
                    {
                        id: "alice",
                        type: "person",
                        age: 25,
                        role: "admin",
                        location: { x: 0, y: 0, z: 0 }
                    },
                    {
                        id: "bob",
                        type: "person",
                        age: 30,
                        role: "user",
                        location: { x: 5, y: 0, z: 0 }
                    }
                ],
                relationships: [
                    {
                        id: "alice_bob_friendship",
                        type: "friendship",
                        source: "alice",
                        target: "bob",
                        strength: 0.8,
                        duration: 3
                    }
                ]
            }
        };
    }
}