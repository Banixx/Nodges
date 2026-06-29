import {
    GraphData,
    EntityData,
    RelationshipData,
    GraphDataSchema,
    PropertySchema
} from '../types';
import {
    isBuild1DataModel,
    isBuild2DataModel,
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
     * Normalize future format (ensure all required fields exist)
     * Now uses Zod for strict validation AND parses values based on DataModel
     */
    private static normalizeData(data: any): GraphData {
        // Fallback for older export format
        if (!data.system && data.nodes && data.edges) {
            console.log('Converting legacy data format to Semantic Graph format...');
            data = {
                system: data.metadata?.source || "Nodges Legacy",
                metadata: data.metadata || {},
                data: {
                    entities: (data.nodes || []).map((n: any) => ({
                        id: String(n.id),
                        type: n.metadata?.type || 'node',
                        label: String(n.name || n.metadata?.label || n.label || ''),
                        position: n.position || n.metadata?.position || { x: 0, y: 0, z: 0 },
                        ...n.metadata
                    })),
                    relationships: (data.edges || []).map((e: any) => ({
                        id: String(e.id || e.metadata?.id || ''),
                        type: e.metadata?.type || e.name || e.type || 'connection',
                        source: String(e.source || e.metadata?.source),
                        target: String(e.target || e.metadata?.target),
                        label: String(e.label || e.metadata?.label || ''),
                        ...e.metadata
                    }))
                }
            };
        }
        // 0. Detect Build Version
        const buildVersion = this.detectBuildVersion(data);
        if (!data.metadata) data.metadata = {};
        data.metadata._buildVersion = buildVersion;

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

        // 4. Migrate Legacy Fields to Invisible Nodes (Physics Mapping Architecture)
        this.migrateLegacyFields(validData);

        return validData;
    }
    /**
     * Detects the build format version
     */
    private static detectBuildVersion(data: any): string {
        if (data.nodes && data.edges && !data.system) return "0.0"; // Legacy
        if (data.metadata && data.metadata.schemaVersion) return data.metadata.schemaVersion;
        if (data.dataModel && data.dataModel.properties) return "2.0"; // Build 2/3 fallback
        if (data.dataModel && data.dataModel.entities) return "1.0";
        return "1.0"; // Default
    }

    /**
     * Parses entity and relationship values based on the DataModel
     */
    private static parseValues(graphData: GraphData) {
        if (!graphData.dataModel) return;

        // Parse Entities
        graphData.data.entities.forEach(entity => {
            const entityType = entity.type;
            
            if (isBuild1DataModel(graphData.dataModel!)) {
                const definition = graphData.dataModel.entities?.[entityType];
                if (definition && definition.properties) {
                    Object.entries(definition.properties).forEach(([propName, propSchema]) => {
                        const val = getEntityAttributeValue(entity, propName);
                        if (val !== undefined) {
                            setEntityAttributeValue(entity, propName, this.parseValue(val, propSchema));
                        }
                    });
                }
            } else if (isBuild2DataModel(graphData.dataModel!)) {
                const globalProps = graphData.dataModel.properties;
                if (globalProps) {
                    Object.entries(globalProps).forEach(([propName, propSchema]) => {
                        const val = getEntityAttributeValue(entity, propName);
                        if (val !== undefined) {
                            setEntityAttributeValue(entity, propName, this.parseValue(val, propSchema));
                        }
                    });
                }
            }
        });

        // Parse Relationships
        graphData.data.relationships.forEach(rel => {
            const relType = rel.type;

            if (isBuild1DataModel(graphData.dataModel!)) {
                const definition = graphData.dataModel.relationships?.[relType];
                if (definition && definition.properties) {
                    Object.entries(definition.properties).forEach(([propName, propSchema]) => {
                        if (rel[propName] !== undefined) {
                            rel[propName] = this.parseValue(rel[propName], propSchema);
                        }
                    });
                }
            } else if (isBuild2DataModel(graphData.dataModel!)) {
                const globalProps = graphData.dataModel.properties;
                if (globalProps) {
                    Object.entries(globalProps).forEach(([propName, propSchema]) => {
                        if (rel[propName] !== undefined) {
                            rel[propName] = this.parseValue(rel[propName], propSchema);
                        }
                    });
                }
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

    /**
     * Replaces legacy global fields with invisible node entities and sets up visual mappings
     */
    private static migrateLegacyFields(graphData: GraphData) {
        if (!graphData.fields || graphData.fields.length === 0) return;

        console.log(`Migrating ${graphData.fields.length} legacy fields to node entities.`);

        // Ensure visual mappings exist
        if (!graphData.visualMappings) {
            graphData.visualMappings = { defaultPresets: {} };
        }
        if (!graphData.visualMappings.defaultPresets) {
            graphData.visualMappings.defaultPresets = {};
        }

        // Setup invisible visual preset for system_attractor
        graphData.visualMappings.defaultPresets['system_attractor'] = {
            opacity: { source: 'constant', function: 'constant', params: { value: 0 } },
            size: { source: 'constant', function: 'constant', params: { value: 0 } },
            inertia: { source: 'constant', function: 'constant', params: { value: 1000000 } }, // Immovable
            attraction: { field: 'stateVector.strength', function: 'linear', domain: [-100, 100], range: [-100, 100] }
        };

        // Convert fields to entities
        graphData.fields.forEach((field, index) => {
            const isAttractor = field.type === 'attractor_field';
            const strength = field.strength || (isAttractor ? 10 : -100);

            const entity = {
                id: `system_field_${index}_${field.id}`,
                type: 'system_attractor',
                label: `Legacy Field ${field.id}`,
                position: field.center || { x: 0, y: 0, z: 0 },
                stateVector: {
                    strength: strength
                }
            };

            graphData.data.entities.push(entity);
        });

        // Clear legacy fields so they are not processed twice
        graphData.fields = [];
    }
}
