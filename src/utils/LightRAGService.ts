import { GraphData, EntityData, RelationshipData } from '../types';

export interface LightRAGDatabaseInfo {
    id: string;
    name: string;
    path: string;
    active: boolean;
}

export interface LightRAGDatabaseList {
    status: string;
    active_database: string;
    databases: LightRAGDatabaseInfo[];
}

export interface LightRAGQueryResponse {
    status: string;
    query: string;
    mode: string;
    answer: string;
    mock?: boolean;
    engine_active?: boolean;
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
    ): Promise<{ answer: string; graphData: GraphData; mock: boolean }> {
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

        const activeRelLabels = (window as any).app?.uiManager?.createPanel?.getActiveRelationLabels() || [];

        const relationships: RelationshipData[] = (data.graph_context?.edges || []).map((edge, idx) => {
            const props = edge.properties || {};
            const rawRelName = String(edge.relation || props.relation || props.relation_type || props.predicate || props.label || props.keywords || 'verknuepft');
            const relName = activeRelLabels.length > 0 ? normalizeRelation(rawRelName, activeRelLabels) : rawRelName;
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
            system: 'Semantic Graph',
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

        const mock = !!data.mock || data.engine_active === false;
        return {
            answer: data.answer || '',
            graphData,
            mock
        };
    }

    /**
     * Fuegt ein Dokument oder Freitext zur LightRAG Knowledge Base hinzu.
     */
    public static async insertText(
        text: string,
        baseUrl: string = LightRAGService.defaultBaseUrl
    ): Promise<{ success: boolean; message: string; mock?: boolean }> {
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
            message: data.message || 'Text successfully processed.',
            mock: !!data.mock
        };
    }

    /**
     * Listet alle vorhandenen LightRAG-Datenbanken auf.
     */
    public static async listDatabases(baseUrl: string = LightRAGService.defaultBaseUrl): Promise<LightRAGDatabaseList> {
        const response = await fetch(`${baseUrl}/databases`, { method: 'GET' });
        if (!response.ok) {
            throw new Error(`LightRAG ListDatabases Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Aktiviert eine vorhandene LightRAG-Datenbank (serverseitig globaler Wechsel).
     */
    public static async selectDatabase(
        name: string,
        baseUrl: string = LightRAGService.defaultBaseUrl
    ): Promise<{ status: string; message: string; active_database: string }> {
        const response = await fetch(`${baseUrl}/databases/select`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (!response.ok) {
            throw new Error(`LightRAG SelectDatabase Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Legt eine neue LightRAG-Datenbank an und aktiviert sie.
     */
    public static async createDatabase(
        name: string,
        baseUrl: string = LightRAGService.defaultBaseUrl
    ): Promise<{ status: string; message: string; active_database: string }> {
        const response = await fetch(`${baseUrl}/databases/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (!response.ok) {
            throw new Error(`LightRAG CreateDatabase Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
}

function normalizeRelation(rawRel: string, allowedSet: string[]): string {
    if (!allowedSet || allowedSet.length === 0 || !rawRel) return rawRel;
    const rawLower = rawRel.toLowerCase();

    // 1. Direct match
    const exact = allowedSet.find(s => s.toLowerCase() === rawLower);
    if (exact) return exact;

    // 2. Keyword mapping
    for (const allowed of allowedSet) {
        const aLower = allowed.toLowerCase();
        if ((rawLower.includes('member') || rawLower.includes('part') || rawLower.includes('include') || rawLower.includes('comprise')) &&
            (aLower.includes('mitglied') || aLower.includes('member') || aLower.includes('part'))) return allowed;

        if ((rawLower.includes('elect') || rawLower.includes('designat') || rawLower.includes('appoint')) &&
            (aLower.includes('wählt') || aLower.includes('waehlt') || aLower.includes('elect'))) return allowed;

        if ((rawLower.includes('govern') || rawLower.includes('lead') || rawLower.includes('presid')) &&
            (aLower.includes('leitet') || aLower.includes('lead') || aLower.includes('govern'))) return allowed;

        if ((rawLower.includes('represent')) &&
            (aLower.includes('vertritt') || aLower.includes('represent'))) return allowed;

        if ((rawLower.includes('allow') || rawLower.includes('empower') || rawLower.includes('enable') || rawLower.includes('grant')) &&
            (aLower.includes('ermächtigt') || aLower.includes('ermaechtigt') || aLower.includes('allow'))) return allowed;

        if ((rawLower.includes('propos') || rawLower.includes('legislat') || rawLower.includes('change') || rawLower.includes('adopt')) &&
            (aLower.includes('schlägt') || aLower.includes('schlaegt') || aLower.includes('propos'))) return allowed;

        if ((rawLower.includes('affiliat') || rawLower.includes('location') || rawLower.includes('in')) &&
            (aLower.includes('gehört') || aLower.includes('gehoert') || aLower.includes('location'))) return allowed;

        if ((rawLower.includes('ensure') || rawLower.includes('determin') || rawLower.includes('frame')) &&
            (aLower.includes('kontrolliert') || aLower.includes('control'))) return allowed;

        if ((rawLower.includes('neighbor') || rawLower.includes('geography')) &&
            (aLower.includes('nachbar') || aLower.includes('neighbor'))) return allowed;

        if ((rawLower.includes('trigger') || rawLower.includes('influenc') || rawLower.includes('invok')) &&
            (aLower.includes('beeinflusst') || aLower.includes('influenc'))) return allowed;

        if ((rawLower.includes('support') || rawLower.includes('utiliz') || rawLower.includes('use')) &&
            (aLower.includes('unterstützt') || aLower.includes('unterstuetzt') || aLower.includes('use'))) return allowed;
    }

    // Fix 5: Kein stiller Fallback auf allowedSet[0] mehr. Originalrelation beibehalten + Warnung.
    console.warn(`[LightRAGService] Relation '${rawRel}' passt zu keiner erlaubten Relation im aktiven Relation Set. Originalrelation wird beibehalten.`);
    return rawRel;
}