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
        baseUrl: string = LightRAGService.defaultBaseUrl,
        normalizeRelations: boolean = true
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
            const relName = normalizeRelations && activeRelLabels.length > 0
                ? normalizeRelation(rawRelName, activeRelLabels)
                : rawRelName;
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
     * Build 14: Kantenexpansion aus rohen LightRAG-Kanten.
     * Aus 1 Sammelkante mit mehreren Keywords bzw. <SEP>-getrennten Beschreibungen
     * entstehen n distinkte nodges-Kanten mit vollstaendigem Beleg und Provenienz.
     */
    public static expandRelationshipsBuild14(
        rawEdges: any[],
        allowedRelationLabels: string[] = []
    ): RelationshipData[] {
        const relationships: RelationshipData[] = [];

        (rawEdges || []).forEach((edge, edgeIdx) => {
            const props = edge.properties || {};
            const source = String(edge.source !== undefined ? edge.source : props.source || '');
            const target = String(edge.target !== undefined ? edge.target : props.target || '');
            if (!source || !target) return;

            // 1. Keywords extrahieren
            let keywordList: string[] = [];
            if (Array.isArray(edge.keywords) && edge.keywords.length > 0) {
                keywordList = edge.keywords.flatMap((k: any) => String(k).split(','));
            } else if (edge.keywords) {
                keywordList = String(edge.keywords).split(',');
            } else if (props.keywords) {
                keywordList = String(props.keywords).split(',');
            } else if (edge.relation) {
                keywordList = String(edge.relation).split(',');
            } else if (props.relation) {
                keywordList = String(props.relation).split(',');
            }

            keywordList = Array.from(new Set(
                keywordList.map(k => k.trim()).filter(Boolean)
            ));

            if (keywordList.length === 0) {
                keywordList = ['verknuepft'];
            }

            // 2. Descriptions extrahieren und an <SEP> zerlegen
            const rawDescription = String(edge.description || props.description || '').trim();
            const descParts = rawDescription
                ? rawDescription.split(/\s*<SEP>\s*/).map(p => p.trim()).filter(Boolean)
                : [];

            // 3. Paarungs-Logik: exakt wenn Anzahl gleich, sonst unsicher
            const isExactPairing = descParts.length > 0 && descParts.length === keywordList.length;
            const paarung = isExactPairing ? 'exakt' : (rawDescription ? 'unsicher' : 'keine');

            // 4. Sources / Chunks extrahieren
            let sourcesList: string[] = [];
            if (Array.isArray(edge.sources) && edge.sources.length > 0) {
                sourcesList = edge.sources.map((s: any) => String(s).trim()).filter(Boolean);
            } else if (props.source_id) {
                sourcesList = String(props.source_id).split(/\s*<SEP>\s*|\n/).map(s => s.trim()).filter(Boolean);
            }

            const rawWeight = edge.weight !== undefined && edge.weight !== null ? edge.weight : props.weight;
            const numWeight = typeof rawWeight === 'number' && !isNaN(rawWeight)
                ? rawWeight
                : (parseFloat(rawWeight) || 1.0);

            const filePath = String(edge.file_path || props.file_path || '');

            // 5. Fuer jedes Keyword eine eigene Kante erzeugen
            keywordList.forEach((kw, kIdx) => {
                const specificEvidence = isExactPairing
                    ? descParts[kIdx]
                    : (descParts.length > 0 ? descParts.join('; ') : rawDescription);

                let normalizedRelation = kw;
                let isTypisiert = false;

                if (allowedRelationLabels && allowedRelationLabels.length > 0) {
                    const norm = normalizeRelation(kw, allowedRelationLabels);
                    if (norm && norm !== kw) {
                        normalizedRelation = norm;
                        isTypisiert = true;
                    } else if (allowedRelationLabels.some(l => l.toLowerCase() === kw.toLowerCase())) {
                        isTypisiert = true;
                    }
                }

                const edgeId = `rel_b14_${edgeIdx}_${kIdx}_${source}_${target}`;

                relationships.push({
                    ...props,
                    id: edgeId,
                    source,
                    target,
                    relation: normalizedRelation,
                    label: normalizedRelation,
                    keyword_raw: kw,
                    keywords_all: keywordList.join(', '),
                    evidence: specificEvidence,
                    evidence_all: rawDescription,
                    evidence_parts: descParts,
                    weight: numWeight,
                    belegzahl: sourcesList.length || 1,
                    source_id: sourcesList.join('<SEP>'),
                    sources: sourcesList,
                    file_path: filePath,
                    paarung,
                    typisiert: isTypisiert,
                    herkunft: 'lightrag'
                });
            });
        });

        return relationships;
    }

    /**
     * Build 14: Fuehrt eine LightRAG-Abfrage aus und generiert einen evidierten,
     * expandierten Schema 5.2 Graphen mit parallelen Kanten, Belegen und Visual Mappings.
     */
    public static async queryGraphBuild14(
        query: string,
        mode: 'local' | 'global' | 'hybrid' = 'hybrid',
        baseUrl: string = LightRAGService.defaultBaseUrl,
        allowedRelationLabels: string[] = []
    ): Promise<{ answer: string; graphData: GraphData; mock: boolean; meta?: any }> {
        const response = await fetch(`${baseUrl}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, mode })
        });

        if (!response.ok) {
            throw new Error(`LightRAG API Error: ${response.status} ${response.statusText}`);
        }

        const data: LightRAGQueryResponse & { graph_context?: { meta?: any } } = await response.json();

        // 1. Entities aufbereiten
        const nodesList = data.graph_context?.nodes || [];
        const entityTypesSet = new Set<string>();

        const entities: EntityData[] = nodesList.map((node) => {
            const props = (node as any).properties || {};
            const entityType = String((node as any).entity_type || props.entity_type || props.type || 'concept');
            entityTypesSet.add(entityType);

            let sources: string[] = [];
            if (Array.isArray((node as any).sources)) {
                sources = (node as any).sources.map((s: any) => String(s).trim()).filter(Boolean);
            } else if (props.source_id) {
                sources = String(props.source_id).split(/\s*<SEP>\s*|\n/).map(s => s.trim()).filter(Boolean);
            }

            return {
                ...props,
                id: String(node.id),
                label: node.label || String(node.id),
                entity_type: entityType,
                description: String((node as any).description || props.description || ''),
                sources,
                belegzahl: sources.length || 1,
                herkunft: 'lightrag'
            };
        });

        const activeLabels = allowedRelationLabels.length > 0
            ? allowedRelationLabels
            : (typeof window !== 'undefined' ? (window as any).app?.uiManager?.createPanel?.getActiveRelationLabels() || [] : []);

        // 2. Kantenexpansion gemaess Build 14 Spezifikation
        const relationships = LightRAGService.expandRelationshipsBuild14(
            data.graph_context?.edges || [],
            activeLabels
        );

        const uniqueEntityTypes = Array.from(entityTypesSet);
        const uniqueRelations = Array.from(new Set(relationships.map(r => String(r.relation))));

        let maxWeight = 1.0;
        let maxBelegzahl = 1;
        relationships.forEach(r => {
            if (typeof r.weight === 'number' && r.weight > maxWeight) maxWeight = r.weight;
            if (typeof (r as any).belegzahl === 'number' && (r as any).belegzahl > maxBelegzahl) maxBelegzahl = (r as any).belegzahl;
        });

        const graphData: GraphData = {
            system: 'Semantic Graph',
            metadata: {
                schemaVersion: "5.2",
                description: `Build 14 LightRAG Evidenz-Graph: ${query}`,
                created: new Date().toISOString(),
                lightrag: {
                    query,
                    mode,
                    meta: (data.graph_context as any)?.meta || null,
                    counts: {
                        entities: entities.length,
                        relationships: relationships.length
                    }
                }
            },
            dataModel: {
                properties: {
                    entity_type: {
                        type: 'categorical',
                        values: uniqueEntityTypes
                    },
                    relation: {
                        type: 'categorical',
                        values: uniqueRelations
                    },
                    weight: {
                        type: 'continuous',
                        range: [1.0, Math.max(2.0, maxWeight)]
                    },
                    belegzahl: {
                        type: 'continuous',
                        range: [1, Math.max(2, maxBelegzahl)]
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
                    },
                    global_edge: {
                        color: {
                            field: 'relation',
                            function: 'categorical',
                            range: ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#2dd4bf', '#818cf8']
                        },
                        thickness: {
                            field: 'weight',
                            function: 'linear',
                            domain: [1.0, Math.max(3.0, maxWeight)],
                            range: [1.5, 4.5]
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
            mock,
            meta: (data.graph_context as any)?.meta
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