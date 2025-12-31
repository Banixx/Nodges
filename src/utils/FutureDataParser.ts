import {
    GraphData,
    EntityData,
    RelationshipData,
    VisualMappings,
    EntityVisualPreset,
    RelationshipVisualPreset,
    DataModel,
    PropertySchema
} from '../types';

/**
 * FutureDataParser - Next-generation JSON parser for Nodges
 * Handles flexible data models with dynamic entity types and relationship mappings
 * Supports the Connect Interface vision with full user customization
 */
export class FutureDataParser {
    private supportedDataTypes: { [key: string]: (value: any, propDef: PropertySchema) => any };
    // private visualFunctions: { [key: string]: (value: any, params: any) => any }; // Unused currently

    constructor() {
        this.supportedDataTypes = {
            'continuous': this.parseContinuous.bind(this),
            'categorical': this.parseCategorical.bind(this),
            'vector': this.parseVector.bind(this),
            'spatial': this.parseSpatial.bind(this),
            'temporal': this.parseTemporal.bind(this),
            'boolean': this.parseBoolean.bind(this)
        };

        /* 
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
        */
    }

    /**
     * Parse future-format JSON data
     */
    async parseData(jsonData: any): Promise<GraphData> {
        this.validateStructure(jsonData);

        const parsedData: any = {
            metadata: this.parseMetadata(jsonData),
            dataModel: this.parseDataModel(jsonData.dataModel),
            visualMappings: this.parseVisualMappings(jsonData.visualMappings),
            data: {
                entities: this.parseEntities(jsonData.data.entities, jsonData.dataModel),
                relationships: this.parseRelationships(jsonData.data.relationships, jsonData.dataModel)
            }
        };

        // Connect Interface ready data - attaching to raw object for now as it might not be in GraphData type
        // If strict GraphData is required, these extra fields might need a new type or be stored in metadata
        // For now, we return strictly GraphData conformant object + extras if needed, but the return type says GraphData

        return parsedData as GraphData;
    }

    validateStructure(data: any) {
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

    parseMetadata(data: any): any {
        return {
            system: data.system,
            version: data.version || '1.0',
            created: data.created || new Date().toISOString(),
            description: data.description || '',
            author: data.author || 'Unknown',
            ...data.metadata
        };
    }

    parseDataModel(dataModel: any): DataModel {
        const processed: DataModel = {
            entities: {},
            relationships: {}
        };

        if (dataModel.entities) {
            for (const [entityType, definition] of Object.entries(dataModel.entities)) {
                processed.entities[entityType] = this.processEntityDefinition(definition);
            }
        }

        if (dataModel.relationships) {
            for (const [relationshipType, definition] of Object.entries(dataModel.relationships)) {
                processed.relationships[relationshipType] = this.processRelationshipDefinition(definition);
            }
        }

        return processed;
    }

    processEntityDefinition(definition: any): any {
        const processed: any = {
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

    processRelationshipDefinition(definition: any): any {
        return this.processEntityDefinition(definition);
    }

    processPropertyDefinition(propDef: any): PropertySchema {
        const processed: PropertySchema = {
            type: propDef.type,
            range: propDef.range || undefined,
            unit: propDef.unit || undefined,
            dimensions: propDef.dimensions || undefined,
            coordinates: propDef.coordinates || undefined,
            values: propDef.values || undefined,
            default: propDef.default || undefined
        };

        if (!this.supportedDataTypes[propDef.type]) {
            console.warn(`Unsupported data type: ${propDef.type}`);
        }

        return processed;
    }

    parseVisualMappings(visualMappings: any): VisualMappings {
        if (!visualMappings) return { defaultPresets: {} };

        const processed: VisualMappings = {
            defaultPresets: {}
        };

        if (visualMappings.defaultPresets) {
            for (const [type, preset] of Object.entries(visualMappings.defaultPresets)) {
                processed.defaultPresets[type] = this.processVisualPreset(preset);
            }
        }

        return processed;
    }

    processVisualPreset(preset: any): EntityVisualPreset | RelationshipVisualPreset {
        const processed: any = {};

        for (const [visualProperty, mapping] of Object.entries(preset)) {
            processed[visualProperty] = {
                source: (mapping as any).source,
                function: (mapping as any).function || 'linear',
                params: (mapping as any).params || {},
                range: (mapping as any).range || undefined,
                palette: (mapping as any).palette || undefined,
                ...(mapping as any)
            };
        }

        return processed;
    }

    parseEntities(entities: any[], _dataModel: any): EntityData[] {
        return entities.map((entity, index) => {
            const processed: EntityData = {
                id: entity.id || `entity_${index}`,
                type: entity.type || 'default',
                label: entity.label || entity.name || entity.id || `Entity ${index}`,
                ...entity // Spread raw data
            };

            // Process properties if needed, but EntityData allows arbitrary props
            // Ensuring required fields are set is strictly done above.
            // Zod schema in types.ts creates strict types, so we might need to be careful with '...entity'
            // However, EntityData is defined as 'passthrough', so extra props are allowed.

            // Note: The original JS logic moved props to 'properties' sub-object.
            // The EntityData type in types.ts typically has arbitrary keys at root or in a specific way?
            // Let's check types.ts definition: it's likely flat or has specific structure.
            // "EntityDataSchema = z.object({...}).passthrough()" implies flat structure for extra props.

            return processed;
        });
    }

    parseRelationships(relationships: any[], _dataModel: any): RelationshipData[] {
        if (!relationships) return [];

        return relationships.map((relationship, index) => {
            const processed: RelationshipData = {
                id: relationship.id || `relationship_${index}`,
                type: relationship.type || 'default',
                source: relationship.source,
                target: relationship.target,
                label: relationship.label || relationship.name || `${relationship.source} -> ${relationship.target}`,
                ...relationship
            };

            if (!processed.source || !processed.target) {
                // Should technically throw or skip, but for type safety we must ensure they are strings
                throw new Error(`Relationship ${processed.id} missing source or target`);
            }

            return processed;
        });
    }

    // Data type parsers
    parseContinuous(value: any, propDef: PropertySchema): number {
        const num = parseFloat(value);
        if (isNaN(num)) return (propDef.default as number) || 0;

        if (propDef.range) {
            return Math.max(propDef.range[0], Math.min(propDef.range[1], num));
        }
        return num;
    }

    parseCategorical(value: any, propDef: PropertySchema): any {
        if (propDef.values && !propDef.values.includes(value)) {
            console.warn(`Invalid categorical value: ${value}. Expected one of: ${propDef.values.join(', ')}`);
            return propDef.default || propDef.values[0];
        }
        return value;
    }

    parseVector(value: any, propDef: PropertySchema): any {
        if (typeof value === 'object' && value !== null) {
            const vector: any = {};
            if (propDef.dimensions) {
                propDef.dimensions.forEach(dim => {
                    vector[dim] = this.parseContinuous(value[dim], { type: 'continuous', range: propDef.range });
                });
            }
            return vector;
        }
        return propDef.default || {};
    }

    parseSpatial(value: any, propDef: PropertySchema): any {
        if (typeof value === 'object' && value !== null) {
            const spatial: any = {};
            if (propDef.coordinates) {
                propDef.coordinates.forEach(coord => {
                    spatial[coord] = parseFloat(value[coord]) || 0;
                });
            }
            return spatial;
        }
        return propDef.default || { x: 0, y: 0, z: 0 };
    }

    parseTemporal(value: any, propDef: PropertySchema): number {
        if (typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? (propDef.default as number) || Date.now() : date.getTime();
        }
        return parseFloat(value) || (propDef.default as number) || 0;
    }

    parseBoolean(value: any, _propDef: PropertySchema): boolean {
        return Boolean(value);
    }

    // Visual mapping functions (placeholders/helpers)
    linearMapping(value: number, params: any): number {
        const { range = [0, 1] } = params;
        return range[0] + (value * (range[1] - range[0]));
    }

    exponentialMapping(value: number, params: any): number {
        const { range = [0, 1], base = 2 } = params;
        const normalized = Math.pow(base, value) / Math.pow(base, 1);
        return range[0] + (normalized * (range[1] - range[0]));
    }

    logarithmicMapping(value: number, params: any): number {
        const { range = [0, 1] } = params;
        const normalized = Math.log(1 + value) / Math.log(1 + 1);
        return range[0] + (normalized * (range[1] - range[0]));
    }

    sphereComplexityMapping(value: number, params: any): number {
        const { minSegments = 4, maxSegments = 32 } = params;
        return Math.floor(minSegments + (value * (maxSegments - minSegments)));
    }

    heatmapMapping(value: number, _params: any): number {
        return value;
    }

    bipolarMapping(values: any, _params: any): any {
        return values;
    }

    pulseMapping(value: number, params: any): any {
        const { frequency = 'heartbeat' } = params;
        return { intensity: value, frequency };
    }

    geographicMapping(value: any, _params: any): any {
        if (value.lat !== undefined && value.lng !== undefined) {
            return {
                x: value.lng * 111320,
                y: value.elevation || 0,
                z: value.lat * 110540
            };
        }
        return { x: 0, y: 0, z: 0 };
    }

    extractAvailableFields(jsonData: any): any {
        const fields: any = {
            entities: {},
            relationships: {}
        };

        if (jsonData.dataModel.entities) {
            for (const [entityType, definition] of Object.entries(jsonData.dataModel.entities)) {
                fields.entities[entityType] = Object.keys((definition as any).properties || {});
            }
        }

        if (jsonData.dataModel.relationships) {
            for (const [relationshipType, definition] of Object.entries(jsonData.dataModel.relationships)) {
                fields.relationships[relationshipType] = Object.keys((definition as any).properties || {});
            }
        }
        return fields;
    }

    extractVisualOptions(visualMappings: any): any {
        const options: any = {
            entities: ['position', 'size', 'color', 'geometry', 'opacity', 'glow'],
            relationships: ['thickness', 'color', 'curvature', 'opacity', 'glow', 'animation']
        };

        if (visualMappings && visualMappings.defaultPresets) {
            for (const [type, preset] of Object.entries(visualMappings.defaultPresets)) {
                const customOptions = Object.keys(preset as object);
                if (type.includes('entity') || type.includes('node')) {
                    options.entities = [...new Set([...options.entities, ...customOptions])];
                } else {
                    options.relationships = [...new Set([...options.relationships, ...customOptions])];
                }
            }
        }
        return options;
    }
}
