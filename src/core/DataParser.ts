import {
    GraphData,
    EntityData,
    RelationshipData,
    GraphDataSchema,
    PropertySchema
} from '../types';
import {
    getEntityAttributeValue,
    setEntityAttributeValue
} from './BuildFormatUtils';

/**
 * DataParser - Parses graph data in the unified format
 */
export class DataParser {
    /**
     * Parse graph data
     */
    static parse(rawData: any): GraphData {
        console.log('Parsing graph data in Semantic Graph format...');
        return this.normalizeData(rawData);
    }

    /**
     * Normalize format (ensure all required fields exist)
     * Now uses Zod for strict validation AND parses values based on DataModel
     */
    private static normalizeData(data: any): GraphData {
        // Accept Build 3 and Build 4
        const schemaVersion = data.metadata?.schemaVersion;
        const SUPPORTED_VERSIONS = ['3.0', '4.0', '5.0'];
        if (!SUPPORTED_VERSIONS.includes(schemaVersion)) {
            throw new Error(`Data Validation Failed: Unsupported schema version "${schemaVersion || 'unknown'}". Supported: ${SUPPORTED_VERSIONS.join(', ')}`);
        }

        // Preserve the original schemaVersion as build indicator
        if (!data.metadata) data.metadata = {};
        data.metadata._buildVersion = schemaVersion;

        // Normalize relationships: sync start/end and source/target
        if (data && data.data && Array.isArray(data.data.relationships)) {
            data.data.relationships.forEach((rel: any) => {
                if (rel.start !== undefined && rel.source === undefined) {
                    rel.source = rel.start;
                }
                if (rel.source !== undefined && rel.start === undefined) {
                    rel.start = rel.source;
                }
                if (rel.end !== undefined && rel.target === undefined) {
                    rel.target = rel.end;
                }
                if (rel.target !== undefined && rel.end === undefined) {
                    rel.end = rel.target;
                }
            });
        }

        // 1. Zod Validation
        const result = GraphDataSchema.safeParse(data);

        if (!result.success) {
            console.error("Zod Validation Error:", result.error);
            const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            throw new Error(`Data Validation Failed: ${errorMessages}`);
        }

        const validData = result.data;

        // 2. Data Parsing Strategy (Strings to Numbers, etc.)
        if (validData.dataModel) {
            this.parseValues(validData);
        }

        // 3. Calculate Network Metrics (inbound, outbound, degree)
        this.calculateNetworkMetrics(validData);

        return validData;
    }

    /**
     * Parses entity and relationship values based on the DataModel
     */
    private static parseValues(graphData: GraphData) {
        if (!graphData.dataModel) return;

        // Parse Entities
        graphData.data.entities.forEach(entity => {
            const globalProps = graphData.dataModel!.properties;
            if (globalProps) {
                Object.entries(globalProps).forEach(([propName, propSchema]) => {
                    const val = getEntityAttributeValue(entity, propName);
                    if (val !== undefined) {
                        setEntityAttributeValue(entity, propName, this.parseValue(val, propSchema));
                    }
                });
            }
        });

        // Parse Relationships
        graphData.data.relationships.forEach(rel => {
            const globalProps = graphData.dataModel!.properties;
            if (globalProps) {
                Object.entries(globalProps).forEach(([propName, propSchema]) => {
                    if (rel[propName] !== undefined) {
                        rel[propName] = this.parseValue(rel[propName], propSchema);
                    }
                });
            }
        });
    }

    /**
     * Calculates basic network metrics like inbound, outbound, and degree for all entities
     */
    private static calculateNetworkMetrics(graphData: GraphData) {
        const metricsMap = new Map<string, { inbound: number, outbound: number, degree: number }>();
        
        // Initialize metrics for all entities
        graphData.data.entities.forEach(entity => {
            metricsMap.set(entity.id, { inbound: 0, outbound: 0, degree: 0 });
        });

        // Calculate based on relationships
        graphData.data.relationships.forEach(rel => {
            if (rel.source) {
                const sourceMetrics = metricsMap.get(rel.source);
                if (sourceMetrics) {
                    sourceMetrics.outbound += 1;
                    sourceMetrics.degree += 1;
                }
            }
            
            if (rel.target) {
                const targetMetrics = metricsMap.get(rel.target);
                if (targetMetrics) {
                    targetMetrics.inbound += 1;
                    targetMetrics.degree += 1;
                }
            }

            if (rel.nodes) {
                rel.nodes.forEach(nodeId => {
                    const nodeMetrics = metricsMap.get(nodeId);
                    if (nodeMetrics) {
                        nodeMetrics.degree += 1;
                    }
                });
            }
        });

        // Apply metrics back to entities
        graphData.data.entities.forEach(entity => {
            const metrics = metricsMap.get(entity.id);
            if (metrics) {
                entity.inbound = metrics.inbound;
                entity.outbound = metrics.outbound;
                entity.degree = metrics.degree;
            }
        });
    }

    /**
     * Parse a single value based on PropertySchema
     */
    private static parseValue(value: any, schema: PropertySchema): any {
        // Falls der Wert ein hierarchisches Objekt (Gruppe) ist, das kein standardmaessiger Vektor ist:
        if (value && typeof value === 'object' && !Array.isArray(value) && 
            !['vector', 'spatial', 'temporal'].includes(schema.type)) {
            const parsedObj: any = {};
            Object.entries(value).forEach(([k, v]) => {
                parsedObj[k] = this.parseValue(v, { type: 'continuous' });
            });
            return parsedObj;
        }

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
            r => r.source === entityId || r.target === entityId || (r.nodes && r.nodes.includes(entityId))
        );
    }

    /**
     * Prefix all IDs in the graph data to avoid collisions
     */
    static prefixIds(graphData: GraphData, prefix: string): GraphData {
        if (!prefix) return graphData;

        // Prefix Entity IDs
        graphData.data.entities.forEach(entity => {
            entity.id = `${prefix}_${entity.id}`;
        });

        // Prefix Relationship IDs and Source/Target references
        graphData.data.relationships.forEach(rel => {
            if (rel.id) rel.id = `${prefix}_${rel.id}`;
            if (rel.source) rel.source = `${prefix}_${rel.source}`;
            if (rel.target) rel.target = `${prefix}_${rel.target}`;
            if (rel.nodes) {
                rel.nodes = rel.nodes.map((n: string) => `${prefix}_${n}`);
            }
        });

        return graphData;
    }

}
