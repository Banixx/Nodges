import { GraphData, EntityData, RelationshipData } from '../types';

export interface LightRAGQueryResponse {
    status: string;
    query: string;
    mode: string;
    answer: string;
    graph_context: {
        nodes: Array<{
            id: string;
            label?: string;
            properties?: Record<string, any>;
        }>;
        edges: Array<{
            source: string;
            target: string;
            relation?: string;
            properties?: Record<string, any>;
        }>;
    };
}

export class LightRAGService {
    private static defaultBaseUrl = '/lightrag-api';

    /**
     * Prüft die Erreichbarkeit des lokalen LightRAG-Backends
     */
    public static async checkHealth(baseUrl: string = LightRAGService.defaultBaseUrl): Promise<{ online: boolean; engineActive: boolean }> {
        try {
            const response = await fetch(`${baseUrl}/health`, { method: 'GET' });
            if (!response.ok) {
                return { online: false, engineActive: false };
            }
            const data = await response.json();
            return {
                online: data.status === 'online',
                engineActive: !!data.lightrag_engine_active
            };
        } catch (error) {
            console.warn('[LightRAGService] Health check failed:', error);
            return { online: false, engineActive: false };
        }
    }

    /**
     * Sendet eine RAG-Abfrage an das LightRAG-Backend und konvertiert die Ergebnisse in ein Nodges-kompatibles GraphData Format.
     */
    public static async queryGraph(
        query: string,
        mode: 'local' | 'global' | 'hybrid' = 'hybrid',
        baseUrl: string = LightRAGService.defaultBaseUrl
    ): Promise<{ answer: string; graphData: GraphData }> {
        const response = await fetch(`${baseUrl}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, mode })
        });

        if (!response.ok) {
            throw new Error(`LightRAG API Error: ${response.status} ${response.statusText}`);
        }

        const data: LightRAGQueryResponse = await response.json();

        // Datenneutrale Transformation in Nodges EntityData & RelationshipData
        const nodesList = data.graph_context?.nodes || [];
        const entityTypesSet = new Set<string>();

        const entities: EntityData[] = nodesList.map((node) => {
            const props = node.properties || {};
            const entityType = String(props.entity_type || props.type || 'concept');
            entityTypesSet.add(entityType);

            return {
                id: String(node.id),
                label: node.label || String(node.id),
                ...props,
                entity_type: entityType
            };
        });

        const uniqueEntityTypes = Array.from(entityTypesSet);

        const relationships: RelationshipData[] = (data.graph_context?.edges || []).map((edge, idx) => {
            const props = edge.properties || {};
            const relName = String(edge.relation || props.relation || props.relation_type || props.predicate || props.label || props.keywords || 'verknuepft');
            return {
                id: `rel_lightrag_${idx}_${edge.source}_${edge.target}`,
                source: String(edge.source),
                target: String(edge.target),
                relation: relName,
                label: relName,
                ...props
            };
        });

        const graphData: GraphData = {
            metadata: {
                schemaVersion: "5.2",
                description: `LightRAG Query Result: ${query}`
            },
            dataModel: {
                properties: {
                    entity_type: {
                        type: 'categorical',
                        values: uniqueEntityTypes
                    }
                }
            },
            visualMappings: {
                defaultPresets: {
                    global_node: {
                        color: {
                            field: 'entity_type',
                            function: 'categorical',
                            range: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1']
                        }
                    }
                }
            },
            data: {
                entities,
                relationships
            }
        };

        return {
            answer: data.answer || '',
            graphData
        };
    }

    /**
     * Fuegt ein Dokument oder Freitext zur LightRAG Knowledge Base hinzu.
     */
    public static async insertText(
        text: string,
        baseUrl: string = LightRAGService.defaultBaseUrl
    ): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${baseUrl}/insert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error(`LightRAG Insert Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return {
            success: data.status === 'success',
            message: data.message || 'Text successfully processed.'
        };
    }
}
