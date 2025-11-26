import {
    GraphData,
    EntityData,
    RelationshipData,
    NodeData,
    EdgeData,
    DataModel
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
        const nodes: NodeData[] = legacyData.nodes || [];
        const edges: EdgeData[] = legacyData.edges || [];

        // Convert nodes to entities
        const entities: EntityData[] = nodes.map((node, index) => {
            const entity: EntityData = {
                id: node.id !== undefined ? String(node.id) : `entity_${index}`,
                type: node.type || 'node',
                label: node.name || node.label || `Entity ${index}`,
            };

            // Convert position
            if (node.x !== undefined && node.y !== undefined && node.z !== undefined) {
                entity.position = { x: node.x, y: node.y, z: node.z };
            }

            // Copy all other properties
            Object.keys(node).forEach(key => {
                if (!['id', 'name', 'label', 'x', 'y', 'z', 'type'].includes(key)) {
                    entity[key] = node[key];
                }
            });

            return entity;
        });

        // Convert edges to relationships
        const relationships: RelationshipData[] = edges.map((edge, index) => {
            // Normalize source/target from start/end or source/target
            let source: string;
            let target: string;

            if (edge.source !== undefined) {
                source = String(edge.source);
            } else if (edge.start !== undefined) {
                // If start is a number, it's an index - convert to entity ID
                if (typeof edge.start === 'number') {
                    source = entities[edge.start]?.id || `entity_${edge.start}`;
                } else {
                    source = String(edge.start);
                }
            } else {
                throw new Error(`Edge ${index} missing source/start`);
            }

            if (edge.target !== undefined) {
                target = String(edge.target);
            } else if (edge.end !== undefined) {
                // If end is a number, it's an index - convert to entity ID
                if (typeof edge.end === 'number') {
                    target = entities[edge.end]?.id || `entity_${edge.end}`;
                } else {
                    target = String(edge.end);
                }
            } else {
                throw new Error(`Edge ${index} missing target/end`);
            }

            const relationship: RelationshipData = {
                id: edge.id || `relationship_${index}`,
                type: edge.type || edge.relationship || 'connection',
                source,
                target,
                label: edge.name || edge.label,
            };

            // Copy all other properties
            Object.keys(edge).forEach(key => {
                if (!['id', 'name', 'label', 'type', 'source', 'target', 'start', 'end', 'relationship'].includes(key)) {
                    relationship[key] = edge[key];
                }
            });

            return relationship;
        });

        // Create basic data model from legacy data
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
            data: {
                entities,
                relationships
            }
        };
    }

    /**
     * Normalize future format (ensure all required fields exist)
     */
    private static normalizeFutureFormat(data: any): GraphData {
        return {
            system: data.system || 'Unknown System',
            metadata: data.metadata || {},
            dataModel: data.dataModel,
            visualMappings: data.visualMappings,
            data: {
                entities: data.data.entities || [],
                relationships: data.data.relationships || []
            }
        };
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
