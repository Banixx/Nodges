import {
    GraphData,
    EntityData,
    RelationshipData,
    GraphDataSchema,
    PropertySchema
} from '../types';

/**
 * DataParser - Parses graph data in the unified format
 */
export class DataParser {
    /**
     * Parse graph data
     */
    static parse(rawData: any): GraphData {
        if (this.isFutureFormat(rawData)) {
            console.log('Parsing graph data...');
            return this.normalizeFutureFormat(rawData);
        } else {
            throw new Error('Invalid data format. Expected format with data.entities and data.relationships');
        }
    }

    /**
     * Check if data is in the correct format (has data.entities/relationships)
     */
    private static isFutureFormat(data: any): boolean {
        return data.data !== undefined &&
            (data.data.entities !== undefined || data.data.relationships !== undefined);
    }

    /**
     * Normalize future format (ensure all required fields exist)
     * Now uses Zod for strict validation AND parses values based on DataModel
     */
    private static normalizeFutureFormat(data: any): GraphData {
        // 1. Zod Validation
        const result = GraphDataSchema.safeParse(data);

        if (!result.success) {
            console.error("Zod Validation Error:", result.error);
            const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            throw new Error(`Future Data Validation Failed: ${errorMessages}`);
        }

        const validData = result.data;

        // 2. Data Parsing Strategy (Strings to Numbers, etc.)
        if (validData.dataModel) {
            this.parseValues(validData);
        }

        return validData;
    }

    /**
     * Parses entity and relationship values based on the DataModel
     */
    private static parseValues(graphData: GraphData) {
        if (!graphData.dataModel) return;

        // Parse Entities
        graphData.data.entities.forEach(entity => {
            const entityType = entity.type;
            const definition = graphData.dataModel?.entities[entityType];

            if (definition) {
                // Iterate over defined properties in schema
                Object.entries(definition.properties).forEach(([propName, propSchema]) => {
                    // Parse existing value
                    if (entity[propName] !== undefined) {
                        entity[propName] = this.parseValue(entity[propName], propSchema);
                    }
                });
            }
        });

        // Parse Relationships
        graphData.data.relationships.forEach(rel => {
            const relType = rel.type;
            const definition = graphData.dataModel?.relationships[relType];

            if (definition) {
                Object.entries(definition.properties).forEach(([propName, propSchema]) => {
                    if (rel[propName] !== undefined) {
                        rel[propName] = this.parseValue(rel[propName], propSchema);
                    }
                });
            }
        });
    }

    /**
     * Parse a single value based on PropertySchema
     */
    private static parseValue(value: any, schema: PropertySchema): any {
        switch (schema.type) {
            case 'continuous':
                return this.parseContinuous(value, schema);
            case 'categorical':
                return this.parseCategorical(value, schema);
            case 'vector':
                return this.parseVector(value, schema);
            case 'spatial':
                return this.parseSpatial(value, schema);
            case 'temporal':
                return this.parseTemporal(value, schema);
            default:
                return value;
        }
    }

    private static parseContinuous(value: any, schema: PropertySchema): number {
        const num = parseFloat(value);
        if (isNaN(num)) return 0; // Default or fallback
        if (schema.range) {
            return Math.max(schema.range[0], Math.min(schema.range[1], num));
        }
        return num;
    }

    private static parseCategorical(value: any, schema: PropertySchema): any {
        const val = String(value);
        if (schema.values && !schema.values.includes(val)) {
            console.warn(`Value "${val}" not in allowed values for categorical property`);
            return schema.values[0] || val;
        }
        return val;
    }

    private static parseVector(value: any, schema: PropertySchema): any {
        if (typeof value === 'object' && value !== null) {
            const vector: any = {};
            if (schema.dimensions) {
                schema.dimensions.forEach(dim => {
                    vector[dim] = this.parseContinuous(value[dim], { type: 'continuous', range: schema.range });
                });
            }
            return vector;
        }
        return {};
    }

    private static parseSpatial(value: any, schema: PropertySchema): any {
        if (typeof value === 'object' && value !== null) {
            const spatial: any = {};
            if (schema.coordinates) {
                schema.coordinates.forEach(coord => {
                    spatial[coord] = parseFloat(value[coord]) || 0;
                });
            }
            return spatial;
        }
        return { x: 0, y: 0, z: 0 };
    }

    private static parseTemporal(value: any, _schema: PropertySchema): number {
        if (typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? 0 : date.getTime();
        }
        return parseFloat(value) || 0;
    }

    /**
     * Extract entities from GraphData with optional type filtering
     */
    static getEntities(graphData: GraphData, type?: string): EntityData[] {
        if (type) {
            return graphData.data.entities.filter(e => e.type === type);
        }
        return graphData.data.entities;
    }

    /**
     * Extract relationships from GraphData with optional type filtering
     */
    static getRelationships(graphData: GraphData, type?: string): RelationshipData[] {
        if (type) {
            return graphData.data.relationships.filter(r => r.type === type);
        }
        return graphData.data.relationships;
    }

    /**
     * Get all entity types in the graph
     */
    static getEntityTypes(graphData: GraphData): string[] {
        const types = new Set(graphData.data.entities.map(e => e.type));
        return Array.from(types);
    }

    /**
     * Get all relationship types in the graph
     */
    static getRelationshipTypes(graphData: GraphData): string[] {
        const types = new Set(graphData.data.relationships.map(r => r.type));
        return Array.from(types);
    }

    /**
     * Find entity by ID
     */
    static findEntity(graphData: GraphData, id: string): EntityData | undefined {
        return graphData.data.entities.find(e => e.id === id);
    }

    /**
     * Find relationships connected to an entity
     */
    static findRelationshipsForEntity(graphData: GraphData, entityId: string): RelationshipData[] {
        return graphData.data.relationships.filter(
            r => r.source === entityId || r.target === entityId
        );
    }
}
