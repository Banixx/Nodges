import pkg from '../../package.json';

export class GraphGenerationService {
    private static readonly NSFW_KEYWORDS = [
        'porn', 'sex', 'nude', 'nsfw', 'gore', 'murder', 'rape', 'pedophile',
        'porno', 'nackt', 'sexuell', 'vergewaltigung', 'mord', 'töten', 'schlampe',
        'hure', 'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cock', 'pussy', 'vagina',
        'penis', 'hitler', 'nazi', 'terrorist', 'bomb'
    ];

    static checkNSFW(prompt: string): boolean {
        const lower = prompt.toLowerCase();
        return this.NSFW_KEYWORDS.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower));
    }

    static assemblePrompt(basePrompt: string, ragText: string | undefined, activeRelLabels: string[]): string {
        let prompt = basePrompt;
        if (ragText) {
            prompt += `\n\n=== VERFUEGBARER KONTEXT / ROHDATEN (RAG) ===\n${ragText}\n==============================================\nNutze ZWINGEND diese Rohdaten als Faktenbasis fuer die Generierung der Knoten und Kanten.`;
        }
        if (activeRelLabels.length > 0) {
            prompt += `\n\nWICHTIG: Verwende fuer das Feld 'relation' (Kanten/Beziehungen) AUSSCHLIESSLICH einen der folgenden erlaubten Begriffe aus dem aktiven Relation Set: [${activeRelLabels.join(', ')}]. Freie Erfindungen oder kommagetrennte Aufzaehlungen sind strikt verboten.`;
        }
        return prompt;
    }

    static enrichGraphMetadata(
        graphData: any,
        pipeline: string,
        prompt: string,
        provider: string,
        model: string,
        mode: string,
        ragText: string,
        startTime: number,
        buildConfig?: { grounding?: string; qualityAssurance?: string; ratingMethod?: string }
    ): void {
        if (!graphData) return;
        if (!graphData.metadata) graphData.metadata = {};

        graphData.metadata.schemaVersion = graphData.metadata.schemaVersion || "5.0";
        graphData.metadata.nodgesVersion = pkg.version;
        graphData.metadata.build = pipeline;
        graphData.metadata.prompt = prompt;

        const buildParams: Record<string, any> = {
            provider, model, interactionMode: mode, hasRagContext: !!ragText
        };

        if (pipeline === 'build10' && buildConfig) {
            buildParams.grounding = buildConfig.grounding;
            buildParams.qualityAssurance = buildConfig.qualityAssurance;
            buildParams.ratingMethod = buildConfig.ratingMethod;
        } else if (pipeline === 'build9') {
            buildParams.deduplicationThreshold = 0.85;
            buildParams.embeddingModel = 'google/gemini-embedding-2';
        } else if (pipeline === 'build8') {
            buildParams.wikidataGrounding = true;
            buildParams.sparqlPipeline = true;
        } else if (pipeline === 'build5') {
            buildParams.multiStep = {
                ontology: 'build_5_ontology_prompt.md',
                data: 'build_5_data_prompt.md',
                visuals: 'build_5_visual_prompt.md'
            };
        } else if (pipeline === 'build12_lightrag') {
            buildParams.lightrag = { mode: 'hybrid', service: 'LightRAGService' };
        }

        graphData.metadata.buildParameters = buildParams;

        const durationMs = Math.round(performance.now() - startTime);
        graphData.metadata.generationDetails = {
            prompt, context: ragText || null, provider, model, pipeline, durationMs,
            timestamp: new Date().toISOString()
        };
    }
}
