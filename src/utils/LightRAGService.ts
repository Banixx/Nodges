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
    private static defaultBaseUrl = 'http://localhost:8000';

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

        // Transformation in Nodges EntityData & RelationshipData mit strukturierter 3D-Kugel-Verteilung
        const nodesList = data.graph_context?.nodes || [];
        const totalNodes = nodesList.length || 1;
        const radius = Math.max(10, Math.min(35, totalNodes * 4));

        const entities: EntityData[] = nodesList.map((node, idx) => {
            // Fibonacci-Sphaere Verteilung fuer gleichmaessigen 3D-Abstand
            const phi = Math.acos(1 - (2 * (idx + 0.5)) / totalNodes);
            const theta = Math.PI * (1 + Math.sqrt(5)) * (idx + 0.5);

            return {
                id: String(node.id),
                label: node.label || String(node.id),
                ...node.properties,
                position: {
                    x: radius * Math.sin(phi) * Math.cos(theta),
                    y: radius * Math.sin(phi) * Math.sin(theta),
                    z: radius * Math.cos(phi)
                }
            };
        });

        const relationships: RelationshipData[] = (data.graph_context?.edges || []).map((edge, idx) => ({
            id: `rel_lightrag_${idx}_${edge.source}_${edge.target}`,
            source: String(edge.source),
            target: String(edge.target),
            label: edge.relation || 'verknuepft',
            ...edge.properties
        }));

        const graphData: GraphData = {
            metadata: {
                schemaVersion: "5.2",
                description: `LightRAG Query Result: ${query}`
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
