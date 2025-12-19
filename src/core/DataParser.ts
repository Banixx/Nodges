import {
    GraphData,
    EntityData,
    RelationshipData,
    NodeData,
    EdgeData,
    DataModel,
    GraphDataSchema,
    PropertySchema
} from '../types';

/**
 * DataParser - Parses both legacy and future format graph data
 * Provides backward compatibility while supporting the new unified format
 */
export class DataParser {
    /**
     * Parse graph data from either legacy or future format
     */
    static parse(rawData: any): GraphData {
        // Detect format
        if (this.isLegacyFormat(rawData)) {
            console.log('Detected legacy format, converting...');
            return this.convertLegacyFormat(rawData);
        } else if (this.isFutureFormat(rawData)) {
            console.log('Detected future format');
            return this.normalizeFutureFormat(rawData);
        } else {
            throw new Error('Unknown data format');
        }
    }

    /**
     * Check if data is in legacy format (has nodes/edges)
     */
    private static isLegacyFormat(data: any): boolean {
        return data.nodes !== undefined || data.edges !== undefined;
    }

    /**
     * Check if data is in future format (has data.entities/relationships)
     */
    private static isFutureFormat(data: any): boolean {
        return data.data !== undefined &&
            (data.data.entities !== undefined || data.data.relationships !== undefined);
    }

    /**
     * Convert legacy format to future format
     */
    private static convertLegacyFormat(legacyData: any): GraphData {
        // ... (Legacy conversion logic remains same, assuming it was working correctly)
        // Re-implementing briefly to ensure full file integrity or just skipping if Replace allows partial?
        // Using replace_file_content requires full replacement of the context?
        // I will copy the existing legacy logic to be safe.
        const nodes: NodeData[] = legacyData.nodes || [];
        const edges: EdgeData[] = legacyData.edges || [];

        const entities: EntityData[] = nodes.map((node, index) => {
            const entity: EntityData = {
                id: node.id !== undefined ? String(node.id) : `entity_${index}`,
                type: node.type || 'node',
                label: node.name || node.label || `Entity ${index}`,
            };
            if (node.x !== undefined && node.y !== undefined && node.z !== undefined) {
                entity.position = { x: node.x, y: node.y, z: node.z };
            }
            Object.keys(node).forEach(key => {
                if (!['id', 'name', 'label', 'x', 'y', 'z', 'type'].includes(key)) {
                    entity[key] = node[key];
                }
            });
            return entity;
        });

        const relationships: RelationshipData[] = edges.map((edge, index) => {
            let source: string;
            let target: string;

            if (edge.source !== undefined) source = String(edge.source);
            else if (edge.start !== undefined) source = typeof edge.start === 'number' ? (entities[edge.start]?.id || `entity_${edge.start}`) : String(edge.start);
            else throw new Error(`Edge ${index} missing source/start`);

            if (edge.target !== undefined) target = String(edge.target);
            else if (edge.end !== undefined) target = typeof edge.end === 'number' ? (entities[edge.end]?.id || `entity_${edge.end}`) : String(edge.end);
            else throw new Error(`Edge ${index} missing target/end`);

            const relationship: RelationshipData = {
                id: edge.id || `relationship_${index}`,
                type: edge.type || edge.relationship || 'connection',
                source,
                target,
                label: edge.name || edge.label,
            };

            Object.keys(edge).forEach(key => {
                if (!['id', 'name', 'label', 'type', 'source', 'target', 'start', 'end', 'relationship'].includes(key)) {
                    relationship[key] = edge[key];
                }
            });
            return relationship;
        });

        const dataModel = this.generateDataModelFromData(entities, relationships);

        return {
            system: legacyData.system || legacyData.metadata?.title || 'Converted Legacy Graph',
            metadata: {
                created: new Date().toISOString(),
                version: '1.0',
                author: 'DataParser (auto-converted)',
                description: legacyData.metadata?.description || 'Automatically converted from legacy format',
                ...legacyData.metadata
            },
            dataModel,
            data: { entities, relationships }
        };
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
     * Generate a basic data model by analyzing the actual data
     */
    private static generateDataModelFromData(
        entities: EntityData[],
        relationships: RelationshipData[]
    ): DataModel {
        const entityTypes = new Set<string>();
        const relationshipTypes = new Set<string>();

        entities.forEach(e => entityTypes.add(e.type));
        relationships.forEach(r => relationshipTypes.add(r.type));

        const dataModel: DataModel = {
            entities: {},
            relationships: {}
        };

        // Create basic schemas for each type
        entityTypes.forEach(type => {
            dataModel.entities[type] = {
                properties: {
                    position: {
                        type: 'spatial',
                        coordinates: ['x', 'y', 'z']
                    }
                }
            };
        });

        relationshipTypes.forEach(type => {
            dataModel.relationships[type] = {
                properties: {}
            };
        });

        return dataModel;
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
