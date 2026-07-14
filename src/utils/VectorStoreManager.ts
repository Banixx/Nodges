import { GraphData, EntityData, RelationshipData } from '../types';
import { LLMService, LLMProvider } from './LLMService';

// Global cache for embeddings to avoid re-generating vectors for identical texts
const embeddingsCache = new Map<string, number[]>();

/**
 * Calculates the cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Gets a cached embedding or generates a new one.
 */
export async function getCachedEmbedding(
    text: string,
    provider: LLMProvider,
    model: string
): Promise<number[]> {
    const cacheKey = `${provider}-${model}-${text}`;
    if (embeddingsCache.has(cacheKey)) {
        return embeddingsCache.get(cacheKey)!;
    }
    const vector = await LLMService.generateEmbedding(text, provider, model);
    embeddingsCache.set(cacheKey, vector);
    return vector;
}

/**
 * Helper to process promises in chunks to avoid rate limits.
 */
async function batchPromises<T, R>(
    items: T[],
    batchSize: number,
    fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map((item, index) => fn(item, i + index))
        );
        results.push(...batchResults);
    }
    return results;
}

/**
 * Performs Entity Resolution (deduplication) on a GraphData object using vector embeddings.
 */
export async function deduplicateGraph(
    graph: GraphData,
    provider: LLMProvider,
    model: string,
    threshold: number = 0.85,
    onProgress?: (msg: string) => void
): Promise<GraphData> {
    const entities = graph.data.entities;
    if (entities.length <= 1) return graph;

    if (onProgress) onProgress(`Berechne Embeddings fuer ${entities.length} Knoten...`);

    // 1. Generate/Get embeddings for all entities
    const embeddingsMap = new Map<string, number[]>();
    
    await batchPromises(entities, 5, async (entity, index) => {
        const text = entity.label || (entity as any).name || entity.id;
        if (onProgress) {
            onProgress(`Embedding ${index + 1}/${entities.length}: "${text}"`);
        }
        try {
            const vector = await getCachedEmbedding(text, provider, model);
            embeddingsMap.set(entity.id, vector);
        } catch (e) {
            console.warn(`[VectorStoreManager] Failed to get embedding for node ${entity.id}:`, e);
        }
    });

    if (onProgress) onProgress("Berechne Aehnlichkeiten und fuehre Knoten zusammen...");

    // 2. Union-Find to group similar entities
    const parentMap = new Map<string, string>();
    for (const entity of entities) {
        parentMap.set(entity.id, entity.id);
    }

    const find = (id: string): string => {
        let current = id;
        while (parentMap.get(current) !== current) {
            current = parentMap.get(current)!;
        }
        // Path compression
        let p = id;
        while (p !== current) {
            const next = parentMap.get(p)!;
            parentMap.set(p, current);
            p = next;
        }
        return current;
    };

    const union = (idA: string, idB: string) => {
        const rootA = find(idA);
        const rootB = find(idB);
        if (rootA !== rootB) {
            parentMap.set(rootB, rootA);
        }
    };

    // Compare all pairs of embeddings
    const entityIds = entities.map(e => e.id);
    for (let i = 0; i < entityIds.length; i++) {
        const idA = entityIds[i];
        const vecA = embeddingsMap.get(idA);
        if (!vecA) continue;

        for (let j = i + 1; j < entityIds.length; j++) {
            const idB = entityIds[j];
            const vecB = embeddingsMap.get(idB);
            if (!vecB) continue;

            const similarity = cosineSimilarity(vecA, vecB);
            if (similarity >= threshold) {
                console.log(`[VectorStoreManager] Merging ${idA} and ${idB} (similarity: ${similarity.toFixed(4)})`);
                union(idA, idB);
            }
        }
    }

    // 3. Reconstruct entities (merge properties)
    const groups = new Map<string, string[]>(); // RootID -> List of MemberIDs
    for (const entity of entities) {
        const root = find(entity.id);
        if (!groups.has(root)) {
            groups.set(root, []);
        }
        groups.get(root)!.push(entity.id);
    }

    const newEntities: EntityData[] = [];
    const idTranslation = new Map<string, string>(); // OldID -> NewRootID

    for (const [rootId, memberIds] of groups.entries()) {
        const members = entities.filter(e => memberIds.includes(e.id));
        
        // Choose representative node: the one that was the root, or just the first one
        const rep = members.find(e => e.id === rootId) || members[0];
        
        // Merge properties safely
        const mergedProps: Record<string, any> = { ...(rep.properties as any) };
        
        // Combine text fields or lists if they differ
        for (const member of members) {
            idTranslation.set(member.id, rep.id);
            if (member.id === rep.id) continue;
            
            const memberProps = member.properties as any;
            if (memberProps) {
                for (const key in memberProps) {
                    if (mergedProps[key] !== memberProps[key]) {
                        if (typeof mergedProps[key] === 'string' && typeof memberProps[key] === 'string') {
                            if (!mergedProps[key].includes(memberProps[key])) {
                                mergedProps[key] = `${mergedProps[key]} / ${memberProps[key]}`;
                            }
                        }
                    }
                }
            }
        }

        newEntities.push({
            ...rep,
            id: rep.id,
            properties: mergedProps
        });
    }

    // 4. Reconstruct relationships (rewrite source/target and merge duplicates)
    const newRelationships: RelationshipData[] = [];
    const existingRelKeys = new Set<string>();

    for (const rel of graph.data.relationships) {
        const source = rel.source ? idTranslation.get(rel.source) || rel.source : undefined;
        const target = rel.target ? idTranslation.get(rel.target) || rel.target : undefined;

        if (!source || !target) continue;
        if (source === target) {
            // Remove self-loops created by merges
            continue;
        }

        const relKey = `${source}-${target}-${rel.type}`;
        if (existingRelKeys.has(relKey)) {
            // Skip duplicate relationship
            continue;
        }

        existingRelKeys.add(relKey);
        newRelationships.push({
            ...rel,
            source,
            target
        });
    }

    return {
        ...graph,
        data: {
            entities: newEntities,
            relationships: newRelationships
        }
    };
}

/**
 * Calculates similarities between a query embedding and all active entities.
 */
export async function getSemanticSearchMatches(
    queryVector: number[],
    entities: EntityData[],
    provider: LLMProvider,
    model: string,
    onProgress?: (msg: string) => void
): Promise<{ id: string; similarity: number }[]> {
    const matches: { id: string; similarity: number }[] = [];

    await batchPromises(entities, 5, async (entity, index) => {
        const text = entity.label || (entity as any).name || entity.id;
        if (onProgress) {
            onProgress(`Analysiere Knoten ${index + 1}/${entities.length}: "${text}"`);
        }
        try {
            const vector = await getCachedEmbedding(text, provider, model);
            const similarity = cosineSimilarity(queryVector, vector);
            matches.push({ id: entity.id, similarity });
        } catch (e) {
            console.warn(`[VectorStoreManager] Failed to get embedding for node ${entity.id} during search:`, e);
        }
    });

    // Sort by similarity descending
    return matches.sort((a, b) => b.similarity - a.similarity);
}
