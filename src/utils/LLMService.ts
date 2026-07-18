import { GraphData, GraphDataSchema } from '../types';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { deduplicateGraph } from './VectorStoreManager';

import build6PromptRaw from '../prompts/build_6_prompt.md?raw';
import build10PromptRaw from '../prompts/build_10_prompt.md?raw';
import build10KeywordPromptRaw from '../prompts/build_10_keyword_prompt.md?raw';
import build10SparqlPromptRaw from '../prompts/build_10_sparql_prompt.md?raw';
import build10ExpansionPromptRaw from '../prompts/build_10_expansion_prompt.md?raw';

export type LLMProvider = 'openrouter' | 'openai' | 'anthropic' | 'ollama' | 'lmstudio';

export interface Build10Config {
    grounding: 'none' | 'wikidata' | 'rag' | 'dedup';
    qualityAssurance: 'none' | 'critic' | 'human';
    ratingMethod: 'llm' | 'taxonomy' | 'embeddings';
}

export interface LLMModel {
    id: string;
    name: string;
}

export class LLMService {
    public static readonly PROVIDERS: { id: LLMProvider; name: string }[] = [
        { id: 'openrouter', name: 'OpenRouter' },
        { id: 'openai', name: 'OpenAI' },
        { id: 'anthropic', name: 'Anthropic' },
        { id: 'ollama', name: 'Ollama (Lokal)' },
        { id: 'lmstudio', name: 'LM Studio (Lokal)' }
    ];

    public static readonly PROVIDER_MODELS: Record<LLMProvider, LLMModel[]> = {
        openrouter: [
            { id: 'kwaipilot/kat-coder-pro-v2.5', name: 'kwaipilot: Kat Coder Pro V2.5' },
            { id: 'openai/gpt-5.6-luna', name: 'OpenAI: GPT-5.6 Luna' },
            { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek: DeepSeek V4 Flash' },
            { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen2.5 72B Instruct' },
            { id: 'nvidia/llama-3.3-nemotron-super-49b-v1.5', name: 'NVIDIA: Llama 3.3 Nemotron Super 49B V1.5' },
            { id: 'qwen/qwen3-vl-32b-instruct', name: 'Qwen: Qwen3 VL 32B Instruct' },
            { id: 'tencent/hunyuan-a13b-instruct', name: 'Tencent: Hunyuan A13B Instruct' },
            { id: 'qwen/qwen-plus', name: 'Qwen: Qwen-Plus' },
            { id: 'deepseek/deepseek-chat', name: 'DeepSeek: DeepSeek V3' },
            { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek: DeepSeek V4 Pro' },
            { id: 'qwen/qwen3.5-35b-a3b', name: 'Qwen: Qwen3.5-35B-A3B' },
            { id: 'qwen/qwen3.7-plus', name: 'Qwen: Qwen3.7 Plus' },
            { id: 'aion-labs/aion-3.0-mini', name: 'AionLabs: Aion-3.0-Mini' },
            { id: 'mistralai/mistral-large-2512', name: 'Mistral: Mistral Large 3 2512' },
            { id: 'google/gemini-3.1-flash-lite', name: 'Google: Gemini 3.1 Flash Lite' },
            { id: 'openai/gpt-4.1-mini', name: 'OpenAI: GPT-4.1 Mini' },
            { id: 'morph/morph-v3-large', name: 'Morph: Morph V3 Large' },
            { id: 'moonshotai/kimi-k2.5', name: 'MoonshotAI: Kimi K2.5' },
            { id: 'google/gemini-2.5-flash', name: 'Google: Gemini 2.5 Flash' },
            { id: 'x-ai/grok-4.20', name: 'xAI: Grok 4.20' },
            { id: 'deepseek/deepseek-r1', name: 'DeepSeek: R1' },
            { id: 'qwen/qwen3-coder-plus', name: 'Qwen: Qwen3 Coder Plus' },
            { id: 'qwen/qwen3.7-max', name: 'Qwen: Qwen3.7 Max' },
            { id: 'qwen/qwen3-max', name: 'Qwen: Qwen3 Max' },
            { id: 'anthropic/claude-haiku-4.5', name: 'Anthropic: Claude Haiku 4.5' },
            { id: 'openai/gpt-oss-safeguard-20b', name: 'OpenAI: GPT OSS Safeguard 20B' },
            { id: 'inception/mercury-2', name: 'Inception: Mercury 2' }
        ],
        openai: [
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
            { id: 'gpt-4o', name: 'GPT-4o' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
        ],
        anthropic: [
            { id: 'claude-4-5-haiku-2026', name: 'Claude 4.5 Haiku' },
            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
            { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' }
        ],
        ollama: [
            { id: 'qwen2.5:14b', name: 'Qwen 2.5 14B' },
            { id: 'llama3.1:8b', name: 'Llama 3.1 8B' },
            { id: 'mistral-nemo:12b', name: 'Mistral Nemo 12B' }
        ],
        lmstudio: [
            { id: 'local-model', name: 'LM Studio loaded model' }
        ]
    };

    /**
     * Get the active provider from localStorage (defaults to 'openrouter')
     */
    public static getActiveProvider(): LLMProvider {
        const provider = localStorage.getItem('llm_provider') as LLMProvider;
        if (provider && this.PROVIDERS.some(p => p.id === provider)) {
            return provider;
        }
        return 'openrouter';
    }

    /**
     * Set the active provider in localStorage
     */
    public static setActiveProvider(provider: LLMProvider): void {
        localStorage.setItem('llm_provider', provider);
    }

    /**
     * Get the active model for a provider from localStorage
     */
    public static getActiveModel(provider: LLMProvider): string {
        const savedModel = localStorage.getItem(`llm_model_${provider}`);
        if (savedModel) {
            return savedModel;
        }
        // Fallbacks
        if (provider === 'openrouter') return 'openai/gpt-4o-mini';
        if (provider === 'openai') return 'gpt-4o-mini';
        if (provider === 'anthropic') return 'claude-3-5-sonnet-20241022';
        if (provider === 'ollama') return 'qwen2.5:14b';
        if (provider === 'lmstudio') return 'local-model';
        return '';
    }

    /**
     * Set the active model for a provider in localStorage
     */
    public static setActiveModel(provider: LLMProvider, model: string): void {
        localStorage.setItem(`llm_model_${provider}`, model);
    }

    public static getApiKey(provider: LLMProvider): string | null {
        if (provider === 'ollama' || provider === 'lmstudio') {
            return 'local';
        }
        // Migration of old openrouter key if needed
        if (provider === 'openrouter') {
            const oldKey = localStorage.getItem('openrouter_api_key');
            const newKey = localStorage.getItem('llm_key_openrouter');
            if (oldKey && !newKey) {
                localStorage.setItem('llm_key_openrouter', oldKey);
                localStorage.removeItem('openrouter_api_key');
                return oldKey;
            }
            
            const localKey = localStorage.getItem('llm_key_openrouter');
            if (localKey) return localKey;
            
            if (import.meta.env && import.meta.env.VITE_OPENROUTER_API_KEY) {
                return import.meta.env.VITE_OPENROUTER_API_KEY;
            }
            
            // Temporaerer Key fuer öffentliche Nutzung ohne eigene Eingabe
            return '';
        }
        
        const localKey = localStorage.getItem(`llm_key_${provider}`);
        if (localKey) return localKey;
        
        if (provider === 'openai' && import.meta.env && import.meta.env.VITE_OPENAI_API_KEY) {
            return import.meta.env.VITE_OPENAI_API_KEY;
        }
        if (provider === 'anthropic' && import.meta.env && import.meta.env.VITE_ANTHROPIC_API_KEY) {
            return import.meta.env.VITE_ANTHROPIC_API_KEY;
        }
        
        return null;
    }

    /**
     * Saves the API key for a provider to localStorage.
     */
    public static setApiKey(provider: LLMProvider, key: string): void {
        localStorage.setItem(`llm_key_${provider}`, key.trim());
    }

    /**
     * Removes the API key for a provider from localStorage.
     */
    public static clearApiKey(provider: LLMProvider): void {
        localStorage.removeItem(`llm_key_${provider}`);
        if (provider === 'openrouter') {
            localStorage.removeItem('openrouter_api_key');
        }
    }

    /**
     * Fetches models from OpenRouter API or returns cached/fallback models.
     */
    public static async fetchOpenRouterModels(): Promise<LLMModel[]> {
        // Testweise auf 5 Mittelklasse-Modelle eingeschränkt
        return this.PROVIDER_MODELS.openrouter;
    }

    /**
     * Fetches models from the provider, supporting local Ollama/LM Studio endpoints.
     */
    public static async fetchModelsForProvider(provider: LLMProvider): Promise<LLMModel[]> {
        if (provider === 'openrouter') {
            return this.fetchOpenRouterModels();
        }
        if (provider === 'ollama' || provider === 'lmstudio') {
            const port = provider === 'ollama' ? '11434' : '1234';
            try {
                const res = await fetch(`http://localhost:${port}/v1/models`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.data && Array.isArray(json.data)) {
                        return json.data.map((m: any) => ({
                            id: m.id,
                            name: m.id
                        }));
                    }
                }
            } catch (e) {
                console.warn(`[LLMService] Could not fetch local models from ${provider}, using fallbacks`);
            }
        }
        return this.PROVIDER_MODELS[provider] || [];
    }

    /**
     * Saves a debug file to the local filesystem via the Vite dev server plugin.
     */
    private static async _saveDebugFile(filename: string, content: string | object): Promise<void> {
        try {
            const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
            await fetch('/api/save_graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, content: fileContent })
            });
        } catch (e) {
            console.warn('[LLMService] Failed to save debug file:', filename, e);
        }
    }

    /**
     * Converts a permissive JSON schema into a strict schema required by OpenAI/OpenRouter (strict: true).
     * This recursively removes any invalid constraints and sets additionalProperties: false.
     */
    private static makeSchemaStrict(schema: any): any {
        if (typeof schema !== 'object' || schema === null) return schema;
        const newSchema = { ...schema };
        
        // Remove properties that cause errors with strict schema
        delete newSchema.default;
        
        if (newSchema.type === 'object') {
            // Fix: Do not set additionalProperties to false if it's already an object (z.record)
            if (newSchema.additionalProperties === true || newSchema.additionalProperties === undefined) {
                newSchema.additionalProperties = false;
            } else if (typeof newSchema.additionalProperties === 'object') {
                newSchema.additionalProperties = this.makeSchemaStrict(newSchema.additionalProperties);
            }

            if (newSchema.properties) {
                for (const key in newSchema.properties) {
                    newSchema.properties[key] = this.makeSchemaStrict(newSchema.properties[key]);
                }
            }
        } else if (newSchema.type === 'array' && newSchema.items) {
            newSchema.items = this.makeSchemaStrict(newSchema.items);
        } else if (newSchema.anyOf) {
            newSchema.anyOf = newSchema.anyOf.map((s: any) => this.makeSchemaStrict(s));
        } else if (newSchema.allOf) {
            newSchema.allOf = newSchema.allOf.map((s: any) => this.makeSchemaStrict(s));
        } else if (newSchema.oneOf) {
            newSchema.oneOf = newSchema.oneOf.map((s: any) => this.makeSchemaStrict(s));
        }
        return newSchema;
    }

    /**
     * Sends a prompt to the LLM and parses the JSON response into GraphData.
     */
    private static async _executeLLMCall(
        systemPrompt: string,
        userPrompt: string,
        provider: LLMProvider,
        model: string,
        jsonSchema?: any
    ): Promise<GraphData> {
        let apiKey = this.getApiKey(provider);
        let apiUrl = '';

        if (provider === 'openrouter') {
            if (!apiKey) {
                apiUrl = 'https://pure-peacock-1215.banixx.deno.net/';
                apiKey = 'proxy-mode'; // Deno Deploy Proxy benötigt keinen Client-Key
            } else {
                apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
            }
        } else if (provider === 'openai') {
            apiUrl = 'https://api.openai.com/v1/chat/completions';
        } else if (provider === 'anthropic') {
            apiUrl = 'https://api.anthropic.com/v1/messages';
        } else if (provider === 'ollama') {
            apiUrl = 'http://localhost:11434/v1/chat/completions';
        } else if (provider === 'lmstudio') {
            apiUrl = 'http://localhost:1234/v1/chat/completions';
        }

        if (!apiKey) {
            throw new Error(`Kein API-Key für ${provider} gefunden. Bitte gib deinen API-Key ein.`);
        }

        let responseText = '';
        let rawApiData: any = null;

        try {
            if (provider === 'openrouter') {
                // First attempt: multi-turn (system + user)
                let response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'HTTP-Referer': window.location.href,
                        'X-Title': 'Nodges 3D Graph',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model,
                        provider: { data_collection: 'deny' },
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        // Use json_object because json_schema strictly forbids dynamic properties (which Nodges relies on)
                        response_format: { type: 'json_object' }
                    })
                });

                // Fallback: If model doesn't support multi-turn, retry with single message
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errMsg = errorData.error?.message || response.statusText;
                    
                    if (response.status === 429) {
                        throw new Error(`Rate-Limit erreicht (429). Das Modell ist aktuell überlastet oder dein Limit ist erschöpft. Bitte wechsle das Modell oder warte einen Moment.`);
                    }
                    
                    if (response.status === 400) {
                        console.warn(`[LLMService] Model ${model} returned 400. Retrying with single message and standard json_object fallback...`);
                        const combinedPrompt = `${systemPrompt}\n\n---\nUSER REQUEST:\n${userPrompt}`;
                        response = await fetch(apiUrl, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${apiKey}`,
                                'HTTP-Referer': window.location.href,
                                'X-Title': 'Nodges 3D Graph',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                model: model,
                                provider: { data_collection: 'deny' },
                                messages: [
                                    { role: 'user', content: combinedPrompt }
                                ],
                                response_format: { type: 'json_object' }
                            })
                        });
                        if (!response.ok) {
                            const retryError = await response.json().catch(() => ({}));
                            throw new Error(`OpenRouter Fehler: ${response.status} - ${retryError.error?.message || response.statusText}`);
                        }
                    } else {
                        throw new Error(`OpenRouter Fehler: ${response.status} - ${errMsg}`);
                    }
                }

                rawApiData = await response.json();
                responseText = rawApiData?.choices?.[0]?.message?.content;
                
                // Automatic retry if structured outputs (json_schema) failed silently (common with vLLM / OpenRouter)
                if (!responseText && jsonSchema) {
                    console.warn(`[LLMService] Model ${model} returned empty content with json_schema. Retrying with json_object fallback...`);
                    const combinedPrompt = `${systemPrompt}\n\n---\nUSER REQUEST:\n${userPrompt}\n\nWICHTIG: Antworte AUSSCHLIESSLICH in validem JSON!`;
                    response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'HTTP-Referer': window.location.href,
                            'X-Title': 'Nodges 3D Graph',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: model,
                            provider: { data_collection: 'deny' },
                            messages: [
                                { role: 'user', content: combinedPrompt }
                            ],
                            response_format: { type: 'json_object' }
                        })
                    });
                    
                    if (response.ok) {
                        rawApiData = await response.json();
                        responseText = rawApiData?.choices?.[0]?.message?.content;
                    }
                }

                if (!responseText) {
                    const choice = rawApiData?.choices?.[0];
                    this._saveDebugFile(`LLM_ERROR_NO_CHOICES_${Date.now()}.json`, rawApiData).catch(() => {});
                    throw new Error(`Die API hat keine gültigen 'choices' zurückgegeben. Refusal: ${choice?.message?.refusal || 'none'}, Finish: ${choice?.finish_reason || 'unknown'}. (Details gespeichert in LLM_ERROR_NO_CHOICES)`);
                }

            } else if (provider === 'openai') {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        // Use json_object because json_schema strictly forbids dynamic properties (which Nodges relies on)
                        response_format: { type: 'json_object' }
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    if (response.status === 429) {
                        throw new Error(`Rate-Limit erreicht (429). Das OpenAI Modell ist überlastet oder dein Kontingent ist erschöpft.`);
                    }
                    throw new Error(`OpenAI API Fehler: ${response.status} - ${errorData.error?.message || response.statusText}`);
                }

                rawApiData = await response.json();
                responseText = rawApiData?.choices?.[0]?.message?.content;
                if (!responseText) {
                    throw new Error(`Die API hat keine gültigen 'choices' zurückgegeben.`);
                }

            } else if (provider === 'anthropic') {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json',
                        'anthropic-dangerous-direct-browser-access': 'true'
                    },
                    body: JSON.stringify({
                        model: model,
                        max_tokens: 8000,
                        system: systemPrompt,
                        messages: [
                            { role: 'user', content: userPrompt }
                        ]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    if (response.status === 429) {
                        throw new Error(`Rate-Limit erreicht (429). Das Anthropic Modell ist überlastet oder dein Kontingent ist erschöpft.`);
                    }
                    throw new Error(`Anthropic API Fehler: ${response.status} - ${errorData.error?.message || response.statusText}`);
                }

                rawApiData = await response.json();
                responseText = rawApiData?.content?.[0]?.text;
                if (!responseText) {
                    throw new Error(`Die API hat keine gültigen 'content' Blöcke zurückgegeben.`);
                }
            } else if (provider === 'ollama' || provider === 'lmstudio') {
                const bodyObj: any = {
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.2
                };
                if (jsonSchema) {
                    bodyObj.response_format = {
                        type: 'json_schema',
                        json_schema: {
                            name: 'GraphData',
                            strict: true,
                            schema: jsonSchema
                        }
                    };
                }
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bodyObj)
                });

                if (!response.ok) {
                    let errorMsg = response.statusText;
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.error?.message || errorMsg;
                    } catch (e) {}
                    throw new Error(`${provider} API Fehler: ${response.status} - ${errorMsg}`);
                }

                rawApiData = await response.json();
                responseText = rawApiData?.choices?.[0]?.message?.content;
                if (!responseText) {
                    throw new Error(`Die API hat keine gültigen 'choices' zurückgegeben.`);
                }
            }
        } catch (error: any) {
            // Fange explizit AbortErrors (Timeouts) und gebe eine nutzerfreundliche Meldung
            if (error.name === 'AbortError' || (error.message && error.message.toLowerCase().includes('aborted'))) {
                throw new Error('Die Anfrage an die KI hat zu lange gedauert und wurde abgebrochen (Timeout). Bitte versuche ein anderes Modell oder eine kürzere Anfrage.');
            }
            // Ansonsten den Fehler weiterwerfen
            throw error;
        }

        if (!responseText) {
            throw new Error('Das Modell hat keine Antwort zurückgegeben.');
        }

        let cleanResponse = responseText.trim();
        
        // Extract JSON block if wrapped in markdown
        const markdownMatch = cleanResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (markdownMatch && markdownMatch[1]) {
            cleanResponse = markdownMatch[1].trim();
        } else {
            // Intelligent Regex Extractor for JSON
            // Finds the first { and the corresponding } even with nested braces
            try {
                const firstBrace = cleanResponse.indexOf('{');
                const lastBrace = cleanResponse.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    cleanResponse = cleanResponse.substring(firstBrace, lastBrace + 1);
                }
            } catch (regexError) {
                console.warn("[LLMService] Fallback Regex extraction failed, using raw response");
            }
        }

        let parsedData: any;
        try {
            parsedData = JSON.parse(cleanResponse);
        } catch (e) {
            console.error("Failed to parse JSON:", responseText);
            this._saveDebugFile(`LLM_ERROR_RAW_${Date.now()}.txt`, responseText).catch(() => {});
            throw new Error('Das Modell hat kein gültiges JSON zurückgegeben. Die Roheingabe wurde als LLM_ERROR_RAW gespeichert.');
        }

        // Fix common LLM issue where it wraps output in the schema name
        if (parsedData.GraphDataSchema && typeof parsedData.GraphDataSchema === 'object') {
            parsedData = parsedData.GraphDataSchema;
        }

        // Flexiblere Validierung: Es muss ENTWEDER data.entities/relationships geben ODER ein dataModel ODER visualMappings (fuer Multi-Step) ODER eine SPARQL query ODER Keywords
        const hasData = parsedData.data && Array.isArray(parsedData.data.entities) && Array.isArray(parsedData.data.relationships);
        const hasDataModel = parsedData.dataModel && typeof parsedData.dataModel === 'object';
        const hasVisualMappings = parsedData.visualMappings && typeof parsedData.visualMappings === 'object';
        const hasQuery = typeof parsedData.query === 'string';
        const hasKeywords = Array.isArray(parsedData.entities) || Array.isArray(parsedData.properties);
        const hasQuestion = typeof parsedData.question === 'string';

        if (!hasData && !hasDataModel && !hasVisualMappings && !hasQuery && !hasKeywords && !hasQuestion) {
            console.error("Invalid JSON structure:", parsedData);
            this._saveDebugFile(`LLM_ERROR_STRUCTURE_${Date.now()}.json`, parsedData).catch(() => {});
            throw new Error('Das generierte JSON hat nicht die erwartete Struktur. Es wurde als LLM_ERROR_STRUCTURE gespeichert.');
        }

        // Guarantee data.entities and data.relationships always exist
        if (!parsedData.data) {
            parsedData.data = { entities: [], relationships: [] };
        }
        if (!Array.isArray(parsedData.data.entities)) {
            parsedData.data.entities = [];
        }
        if (!Array.isArray(parsedData.data.relationships)) {
            parsedData.data.relationships = [];
        }

        // --- Inject API metadata (Usage, tokens, etc.) ---
        if (!parsedData.metadata) {
            parsedData.metadata = {};
        }
        if (rawApiData) {
            parsedData.metadata.apiResponse = {
                id: rawApiData.id || null,
                created: rawApiData.created || null,
                model: rawApiData.model || null,
                usage: rawApiData.usage || null,
                system_fingerprint: rawApiData.system_fingerprint || null
            };
            
            // For Anthropic specifically
            if (rawApiData.usage && !rawApiData.usage.total_tokens) {
                 rawApiData.usage.total_tokens = (rawApiData.usage.input_tokens || 0) + (rawApiData.usage.output_tokens || 0);
            }
        }

        return parsedData as GraphData;
    }

    public static async generateGraphData(
        prompt: string, 
        provider: LLMProvider, 
        model: string,
        formatFile: string = import.meta.env.BASE_URL + 'nodges_build_4.md'
    ): Promise<GraphData> {
        let systemPrompt = '';
        try {
            const promptResponse = await fetch(formatFile);
            if (!promptResponse.ok) {
                throw new Error(`Konnte Format-Datei ${formatFile} nicht laden. HTTP Status: ` + promptResponse.status);
            }
            systemPrompt = await promptResponse.text();
        } catch (error) {
            console.error('Fehler beim Laden der Format-Datei:', error);
            throw new Error(`Konnte Format-Datei nicht laden. Stelle sicher, dass ${formatFile} existiert.`);
        }

        return this._executeLLMCall(systemPrompt, prompt, provider, model);
    }

    public static async generateGraphDataMultiStepBuild5(
        prompt: string, 
        provider: LLMProvider, 
        model: string,
        onProgress?: (msg: string) => void,
        onStepComplete?: (stepNumber: number, stepName: string, content: string, extension: string) => void
    ): Promise<GraphData> {
        // Step 1: Schema / Ontologie
        const schemaPromptFile = import.meta.env.BASE_URL + 'prompts/build_5_ontology_prompt.md';
        let schemaSystemPrompt = '';
        try {
            const res = await fetch(schemaPromptFile);
            if (!res.ok) throw new Error();
            schemaSystemPrompt = await res.text();
        } catch {
            throw new Error(`Konnte Schema-Datei nicht laden: ${schemaPromptFile}`);
        }
        
        if (onProgress) onProgress('Schritt 1/3: Ontologie (Schema) wird entworfen...');
        
        const step1UserPrompt = `Erstelle ein dataModel (Ontologie) basierend auf der folgenden Anfrage:\n\n${prompt}`;
        await this._saveDebugFile(`debug_build5_step1_prompt_${Date.now()}.md`, `SYSTEM:\n${schemaSystemPrompt}\n\nUSER:\n${step1UserPrompt}`);
        const step1Data = await this._executeLLMCall(schemaSystemPrompt, step1UserPrompt, provider, model);
        await this._saveDebugFile(`debug_build5_step1_result_${Date.now()}.json`, step1Data);
        if (onStepComplete) {
            onStepComplete(1, "Build5_Ontology", JSON.stringify(step1Data, null, 2), "json");
        }
        
        // Step 2: Data
        if (onProgress) onProgress('Schritt 2/3: Datenpunkte werden generiert...');
        
        const dataPromptFile = import.meta.env.BASE_URL + 'prompts/build_5_data_prompt.md';
        let dataSystemPrompt = '';
        try {
            const res = await fetch(dataPromptFile);
            if (!res.ok) throw new Error();
            dataSystemPrompt = await res.text();
        } catch {
            throw new Error(`Konnte Data-Prompt nicht laden: ${dataPromptFile}`);
        }

        const step2UserPrompt = `Nutze EXAKT das folgende Schema (Ontologie), um die Daten zu generieren:\n\n${JSON.stringify(step1Data, null, 2)}\n\nBefuelle nun die data.entities und data.relationships Arrays basierend auf der Originalanfrage:\n${prompt}`;
        await this._saveDebugFile(`debug_build5_step2_prompt_${Date.now()}.md`, `SYSTEM:\n${dataSystemPrompt}\n\nUSER:\n${step2UserPrompt}`);
        const step2Data = await this._executeLLMCall(dataSystemPrompt, step2UserPrompt, provider, model);
        await this._saveDebugFile(`debug_build5_step2_result_${Date.now()}.json`, step2Data);
        if (onStepComplete) {
            onStepComplete(2, "Build5_Data", JSON.stringify(step2Data, null, 2), "json");
        }
        
        // Merge Step 1 and Step 2
        const mergedData = { ...step1Data, ...step2Data };
        
        // Step 3: Visual Mappings
        if (onProgress) onProgress('Schritt 3/3: Visuelles Mapping (Build 5) wird berechnet...');
        
        const visualPromptFile = import.meta.env.BASE_URL + 'prompts/build_5_visual_prompt.md';
        let visualSystemPrompt = '';
        try {
            const res = await fetch(visualPromptFile);
            if (!res.ok) throw new Error();
            visualSystemPrompt = await res.text();
        } catch {
            throw new Error(`Konnte Visual-Prompt nicht laden: ${visualPromptFile}`);
        }

        const step3UserPrompt = `Erstelle die visuellen Mappings fuer diesen Datensatz:\n\n${JSON.stringify(mergedData, null, 2)}`;
        await this._saveDebugFile(`debug_build5_step3_prompt_${Date.now()}.md`, `SYSTEM:\n${visualSystemPrompt}\n\nUSER:\n${step3UserPrompt}`);
        const step3Data = await this._executeLLMCall(visualSystemPrompt, step3UserPrompt, provider, model);
        await this._saveDebugFile(`debug_build5_step3_result_${Date.now()}.json`, step3Data);
        if (onStepComplete) {
            onStepComplete(3, "Build5_Visuals", JSON.stringify(step3Data, null, 2), "json");
        }
        
        // Final Merge
        return { ...mergedData, ...step3Data };
    }

    public static async generateGraphDataBuild6(
        prompt: string, 
        provider: LLMProvider, 
        model: string,
        onProgress?: (msg: string) => void
    ): Promise<GraphData> {
        const promptFile = import.meta.env.BASE_URL + 'prompts/build_6_prompt.md';
        let systemPrompt = '';
        try {
            const res = await fetch(promptFile);
            if (!res.ok) throw new Error();
            systemPrompt = await res.text();
        } catch {
            throw new Error(`Konnte Prompt-Datei nicht laden: ${promptFile}`);
        }

        if (onProgress) onProgress('Generiere Netzwerk (Ontologie, Daten & Visuals in einem Schritt)...');

        // Kompaktes Beispiel-JSON statt vollem Zod-Schema (verstaendlicher fuer alle Modelle)
        const exampleStructure = `
=== ZIEL-STRUKTUR (Beispiel) ===
Dein JSON MUSS exakt diese Top-Level-Struktur haben:
{
  "system": "<Thema>",
  "metadata": {
    "schemaVersion": "5.0",
    "description": "...",
    "competencyQuestions": ["...", "..."]
  },
  "dataModel": {
    "entities": {
      "<TypName>": { "properties": { "<propName>": { "type": "continuous", "range": [0, 100] }, "position": { "type": "spatial" } } }
    },
    "relationships": {
      "<KantenTyp>": { "properties": {} }
    }
  },
  "data": {
    "entities": [
      { 
        "id": "unique_id", 
        "type": "<TypName>", 
        "label": "...", 
        "<propName>": 42, 
        "position": { "x": 0, "y": 0, "z": 0 },
        "temporal": {
          "validFrom": 1900,
          "validTo": 1950,
          "history": [
            { "timestamp": 1920, "changes": { "<propName>": 80 } }
          ]
        }
      }
    ],
    "relationships": [
      { 
        "id": "rel_1", 
        "type": "<KantenTyp>", 
        "source": "id_a", 
        "target": "id_b", 
        "label": "...",
        "temporal": {
          "validFrom": 1900,
          "validTo": 1950
        }
      }
    ]
  },
  "visualMappings": {
    "defaultPresets": {
      "global_node": {
        "size": { "source": "<propName>", "function": "linear", "range": [0.5, 3] },
        "color": { "source": "kategorie", "function": "categorical" },
        "geometry": { "source": "constant", "function": "constant", "params": { "geometry": "sphere" } },
        "position": { "source": "position", "function": "constant" }
      },
      "global_edge": {
        "color": { "source": "type", "function": "categorical" },
        "thickness": { "source": "constant", "function": "constant", "params": { "value": 0.1 } }
      }
    }
  }
}
WICHTIG: "system", "metadata", "data" (mit entities+relationships Array) und "visualMappings" sind PFLICHT-Felder!
=================================`;
        systemPrompt += exampleStructure;

        // Erzeuge das strukturierte JSON-Schema fuer OpenRouter/OpenAI API
        const jsonSchema = zodToJsonSchema(GraphDataSchema, 'GraphDataSchema');
        // Zod packt das Schema oft in ein definitions-Objekt, wir wollen das eigentliche Schema uebergeben
        let schemaToPass = (jsonSchema as any).definitions?.GraphDataSchema || jsonSchema;
        // APIs (wie OpenAI) akzeptieren das $schema Feld nicht
        delete schemaToPass.$schema;
        
        // Mache das Schema "strict: true" kompatibel (additionalProperties: false)
        schemaToPass = this.makeSchemaStrict(schemaToPass);

        await this._saveDebugFile(`debug_build6_prompt_${Date.now()}.md`, `SYSTEM:\n${systemPrompt}\n\nUSER:\n${prompt}`);
        const resultData = await this._executeLLMCall(systemPrompt, prompt, provider, model, schemaToPass);
        await this._saveDebugFile(`debug_build6_result_${Date.now()}.json`, resultData);
        
        return resultData;
    }
    public static async askClarification(
        history: {role: 'user'|'assistant', content: string}[],
        provider: LLMProvider,
        model: string
    ): Promise<string> {
        let systemPrompt = "Du bist ein erfahrener Datenarchitekt für Nodges. Der Nutzer möchte einen 3D-Graphen generieren lassen.\n";
        systemPrompt += "Lies den bisherigen Verlauf. Wenn die Nutzeranfrage abstrakt, vage oder zu generisch ist (z.B. 'Politik', 'Wirtschaft'), stelle EINE gezielte, kurze Rückfrage, um herauszufinden, welche KONKRETEN Instanzen (z.B. Politiker, Parteien, Firmen) er visualisieren möchte.\n";
        systemPrompt += "Stelle nur eine kurze, freundliche Gegenfrage. Max 2 Sätze.\n";
        systemPrompt += "Gib deine Antwort zwingend im JSON Format zurück: { \"question\": \"Deine Frage...\" }";

        const userPrompt = history.map(h => `${h.role === 'user' ? 'USER' : 'ASSISTANT'}: ${h.content}`).join('\n\n');
        
        const res: any = await this._executeLLMCall(systemPrompt, userPrompt, provider, model);
        if (res && res.question) return res.question;
        return "Kannst du das etwas genauer spezifizieren?";
    }

    public static async generateGraphDataBuild8(
        prompt: string, 
        provider: LLMProvider, 
        model: string,
        onProgress?: (msg: string) => void,
        onStepComplete?: (stepNumber: number, stepName: string, content: string, extension: string) => void
    ): Promise<GraphData> {
        // Schritt 1: Keywords extrahieren
        if (onProgress) onProgress('Schritt 1/5: Analysiere Anfrage für Wikidata-Faktencheck...');
        
        const keywordPromptFile = import.meta.env.BASE_URL + 'prompts/build_8_keyword_prompt.md';
        let keywordSystemPrompt = 'Extrahiere Entitäten und Properties als JSON {"entities":[], "properties":[]}. Übersetze auf Englisch.';
        try {
            const res = await fetch(keywordPromptFile);
            if (res.ok) keywordSystemPrompt = await res.text();
        } catch (e) { console.warn(e); }

        const keywordData: any = await this._executeLLMCall(keywordSystemPrompt, `Anfrage: ${prompt}`, provider, model);
        await this._saveDebugFile(`debug_build7_step1_keywords_${Date.now()}.json`, keywordData);
        if (onStepComplete) onStepComplete(1, "Keywords", JSON.stringify(keywordData, null, 2), "json");

        // Schritt 2: Wikidata Search API
        if (onProgress) onProgress('Schritt 2/5: Suche exakte Wikidata-IDs...');
        const contextLines: string[] = [];
        
        const searchWikidata = async (term: string, type: 'item' | 'property') => {
            try {
                const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(term)}&language=en&type=${type}&limit=4&format=json&origin=*`;
                const res = await fetch(url);
                const json = await res.json();
                if (json.search && json.search.length > 0) {
                    const hits = json.search.map((s: any) => `${s.id} (${s.label}: ${s.description || ''})`).join(' | ');
                    contextLines.push(`- ${type.toUpperCase()} "${term}": ${hits}`);
                }
            } catch (e) { console.warn("Wikidata search error", e); }
        };

        const entities = Array.isArray(keywordData.entities) ? keywordData.entities : [];
        const properties = Array.isArray(keywordData.properties) ? keywordData.properties : [];
        
        await Promise.all([
            ...entities.map((e: string) => searchWikidata(e, 'item')),
            ...properties.map((p: string) => searchWikidata(p, 'property'))
        ]);
        
        const wikidataContext = contextLines.join('\n');
        await this._saveDebugFile(`debug_build7_step2_context_${Date.now()}.txt`, wikidataContext);
        if (onStepComplete) onStepComplete(2, "Faktencheck_Live_Suche", wikidataContext, "txt");

        // Schritt 3: Text zu SPARQL
        if (onProgress) onProgress('Schritt 3/5: Generiere exakte SPARQL-Abfrage...');
        
        const sparqlPromptFile = import.meta.env.BASE_URL + 'prompts/build_8_sparql_prompt.md';
        let sparqlSystemPrompt = '';
        try {
            const res = await fetch(sparqlPromptFile);
            if (!res.ok) throw new Error();
            sparqlSystemPrompt = await res.text();
        } catch {
            throw new Error(`Konnte SPARQL-Prompt nicht laden: ${sparqlPromptFile}`);
        }

        const sparqlUserPrompt = `Nutzeranfrage: ${prompt}\n\n=== GEFUNDENE WIKIDATA-IDs (FAKTENCHECK) ===\nHier sind die echten IDs für diese Anfrage aus der Live-Suche. Nutze ZWINGEND diese Q-IDs und P-IDs für den Aufbau der SPARQL-Query. Rate keine IDs!\n\n${wikidataContext}`;
        await this._saveDebugFile(`debug_build7_step3_prompt_${Date.now()}.md`, `SYSTEM:\n${sparqlSystemPrompt}\n\nUSER:\n${sparqlUserPrompt}`);
        
        const sparqlData: any = await this._executeLLMCall(sparqlSystemPrompt, sparqlUserPrompt, provider, model);
        await this._saveDebugFile(`debug_build7_step1_result_${Date.now()}.json`, sparqlData);
        
        const sparqlQuery = sparqlData.query || sparqlData.sparql;
        if (!sparqlQuery) {
            throw new Error('Das LLM hat keine valide SPARQL-Abfrage (Feld "query") zurückgegeben.');
        }

        if (onStepComplete) {
            onStepComplete(3, "Generierte_SPARQL_Abfrage", sparqlQuery, "sparql");
        }

        // Schritt 4: Wikidata Abfrage
        if (onProgress) onProgress('Schritt 4/5: Frage Live-Daten von Wikidata ab...');
        const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
        let rawWikidataResponse = null;
        try {
            const response = await fetch(WIKIDATA_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/sparql-results+json',
                    'User-Agent': 'Nodges/Build-8 (localhost)'
                },
                body: new URLSearchParams({ query: sparqlQuery })
            });

            if (!response.ok) {
                throw new Error(`Wikidata HTTP Error: ${response.status}`);
            }

            rawWikidataResponse = await response.json();
            await this._saveDebugFile(`debug_build7_step4_wikidata_${Date.now()}.json`, rawWikidataResponse);

            if (onStepComplete) onStepComplete(4, "Wikidata_Rohdaten", JSON.stringify(rawWikidataResponse, null, 2), "json");
        } catch (error: any) {
            throw new Error(`Fehler bei der Wikidata-Abfrage: ${error.message}`);
        }

        if (!rawWikidataResponse || !rawWikidataResponse.results || !rawWikidataResponse.results.bindings || rawWikidataResponse.results.bindings.length === 0) {
            throw new Error('Wikidata hat für diese Abfrage keine Ergebnisse gefunden. Bitte versuche einen anderen Suchbegriff.');
        }

        // Schritt 5: Tabellendaten in Nodges JSON mappen
        if (onProgress) onProgress('Schritt 5/5: Transformiere Wikidata-Rohdaten in Nodges 3D-Graph...');
        
        const mappingPromptFile = import.meta.env.BASE_URL + 'prompts/build_8_mapping_prompt.md';
        let mappingSystemPrompt = '';
        try {
            const res = await fetch(mappingPromptFile);
            if (!res.ok) throw new Error();
            mappingSystemPrompt = await res.text();
        } catch {
            throw new Error(`Konnte Mapping-Prompt nicht laden: ${mappingPromptFile}`);
        }

        // Komprimiere und reduziere Bindings, um Token-Limits und Endlos-Ladezeiten zu verhindern
        const limitedBindings = rawWikidataResponse.results.bindings.slice(0, 40).map((b: any) => {
            const clean: any = {};
            for (const key in b) {
                clean[key] = b[key].value;
            }
            return clean;
        });
        const mappingUserPrompt = `Ursprüngliche Anfrage: ${prompt}\n\nHier sind die abgerufenen Wikidata-Ergebnisse (JSON):\n${JSON.stringify(limitedBindings, null, 2)}`;
        
        const fullPromptLog = `=== SYSTEM PROMPT ===\n${mappingSystemPrompt}\n\n=== USER PROMPT ===\n${mappingUserPrompt}`;
        if (onStepComplete) onStepComplete(5, "Mapping_Prompt_an_LLM", fullPromptLog, "md");

        await this._saveDebugFile(`debug_build7_step5_prompt_${Date.now()}.md`, `SYSTEM:\n${mappingSystemPrompt}\n\nUSER:\n${mappingUserPrompt}`);
        
        const finalGraphData = await this._executeLLMCall(mappingSystemPrompt, mappingUserPrompt, provider, model);
        
        await this._saveDebugFile(`debug_build7_step5_result_${Date.now()}.json`, finalGraphData);
        
        if (onStepComplete) onStepComplete(6, "Generiertes_Graph_JSON", JSON.stringify(finalGraphData, null, 2), "json");
        
        return finalGraphData;
    }

    public static async refineGraphData(
        existingData: GraphData,
        prompt: string, 
        provider: LLMProvider, 
        model: string,
        formatFile: string = import.meta.env.BASE_URL + 'prompts/refine_prompt.md',
        onProgress?: (msg: string) => void
    ): Promise<GraphData> {
        let systemPrompt = '';
        try {
            const res = await fetch(formatFile);
            if (!res.ok) throw new Error();
            systemPrompt = await res.text();
        } catch {
            throw new Error(`Konnte Format-Datei nicht laden: ${formatFile}`);
        }

        if (onProgress) onProgress('Analysiere Graphen und wende Änderungen an...');

        const refineUserPrompt = `
Hier ist ein bestehender Datensatz (Graph). Deine Aufgabe ist es, diesen basierend auf der neuen User-Anweisung zu veraendern oder zu erweitern.
Gib IMMER den kompletten Graphen (inklusive der unveraenderten Teile) zurueck! Behalte bestehende IDs bei.

=== BESTEHENDER GRAPH ===
${JSON.stringify(existingData, null, 2)}
=========================

USER ANWEISUNG: ${prompt}
`;

        await this._saveDebugFile(`debug_refine_prompt_${Date.now()}.md`, `SYSTEM:\n${systemPrompt}\n\nUSER:\n${refineUserPrompt}`);
        const resultData = await this._executeLLMCall(systemPrompt, refineUserPrompt, provider, model);
        await this._saveDebugFile(`debug_refine_result_${Date.now()}.json`, resultData);
        return resultData;
    }

    /**
     * Generates a vector embedding for a given text using the specified provider and model.
     */
    public static async generateEmbedding(
        text: string,
        provider: LLMProvider,
        model: string = 'google/gemini-embedding-2'
    ): Promise<number[]> {
        let apiKey = this.getApiKey(provider);
        let apiUrl = '';

        if (provider === 'openrouter') {
            if (!apiKey) {
                apiUrl = 'https://pure-peacock-1215.banixx.deno.net/';
                apiKey = 'proxy-mode';
            } else {
                apiUrl = 'https://openrouter.ai/api/v1/embeddings';
            }
        } else if (provider === 'openai') {
            apiUrl = 'https://api.openai.com/v1/embeddings';
            if (!model || model === 'google/gemini-embedding-2') {
                model = 'text-embedding-3-small';
            }
        } else if (provider === 'ollama') {
            apiUrl = 'http://localhost:11434/v1/embeddings';
            if (!model || model === 'google/gemini-embedding-2') {
                model = 'nomic-embed-text';
            }
        } else if (provider === 'lmstudio') {
            apiUrl = 'http://localhost:1234/v1/embeddings';
            if (!model || model === 'google/gemini-embedding-2') {
                model = 'local-model';
            }
        } else {
            throw new Error(`Embedding-Generierung fuer Provider '${provider}' wird nicht unterstuetzt.`);
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (provider === 'openrouter') {
            headers['Authorization'] = `Bearer ${apiKey}`;
            headers['HTTP-Referer'] = window.location.href;
            headers['X-Title'] = 'Nodges 3D Graph';
        } else if (provider === 'openai') {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                model: model,
                input: text
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || response.statusText;
            throw new Error(`Embedding API Fehler (${response.status}): ${errMsg}`);
        }

        const result = await response.json();
        if (result.data && result.data[0] && result.data[0].embedding) {
            return result.data[0].embedding;
        }
        throw new Error('Ungueltige Antwort von der Embedding API erhalten.');
    }

    /**
     * Build 10: Generates graph data using a modular configurable pipeline.
     */
    public static async generateGraphDataBuild10(
        prompt: string,
        config: Build10Config,
        provider: LLMProvider,
        model: string,
        devPrefix: string | null,
        onProgress?: (msg: string) => void,
        onStepComplete?: (stepNumber: number, stepName: string, content: string, extension: string) => void
    ): Promise<GraphData> {
        let finalPrompt = prompt;
        
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const saveStep = async (stepNum: number, name: string, content: any, ext: string) => {
            if (!devPrefix) return; // Wenn Dev Create inaktiv ist, GAR NICHTS speichern! Keine b10-Dateien, keine Downloads!
            const filename = `../b10/${devPrefix}_${stepNum}_${name}_${ts}.${ext}`;
            const isJson = typeof content !== 'string';
            const strContent = isJson ? JSON.stringify(content, null, 2) : content;
            await this._saveDebugFile(filename, isJson ? content : strContent);
            if (onStepComplete) onStepComplete(stepNum, name, strContent, ext);
        };

        // Step 1: Grounding / Wissensquelle
        let groundingContext = '';
        if (config.grounding === 'wikidata') {
            if (onProgress) onProgress('Schritt 1/4: Führe Wikidata-Faktencheck aus...');
            try {
                if (onProgress) onProgress('Wikidata Schritt 1: Extrahiere Suchbegriffe...');
                let keywordSystemPrompt = 'Extrahiere Entitäten und Properties als JSON {"entities":[], "properties":[]}. Übersetze auf Englisch.';
                if (build10KeywordPromptRaw) {
                    keywordSystemPrompt = build10KeywordPromptRaw;
                }
                const keywordData: any = await this._executeLLMCall(keywordSystemPrompt, `Anfrage: ${prompt}`, provider, model);
                await saveStep(1, "Build10_Wikidata_Keywords", keywordData, "json");

                if (onProgress) onProgress('Wikidata Schritt 2: Suche Wikidata-IDs...');
                const contextLines: string[] = [];
                const searchWikidata = async (term: string, type: 'item' | 'property') => {
                    try {
                        const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(term)}&language=en&type=${type}&limit=4&format=json&origin=*`;
                        const res = await fetch(url);
                        const json = await res.json();
                        if (json.search && json.search.length > 0) {
                            const hits = json.search.map((s: any) => `${s.id} (${s.label}: ${s.description || ''})`).join(' | ');
                            contextLines.push(`- ${type.toUpperCase()} "${term}": ${hits}`);
                        } else {
                            contextLines.push(`- ${type.toUpperCase()} "${term}": Keine direkten Treffer gefunden. Du kannst eine Standard-Property oder eine bekannte Q-ID erraten, falls du dir 100% sicher bist.`);
                        }
                    } catch (e) { console.warn("Wikidata search error", e); }
                };
                const entities = Array.isArray(keywordData.entities) ? keywordData.entities : [];
                const properties = Array.isArray(keywordData.properties) ? keywordData.properties : [];
                await Promise.all([
                    ...entities.map((e: string) => searchWikidata(e, 'item')),
                    ...properties.map((p: string) => searchWikidata(p, 'property'))
                ]);
                const wikidataContext = contextLines.join('\n');
                await saveStep(2, "Build10_Wikidata_Suche", wikidataContext, "txt");

                let sparqlSystemPrompt = build10SparqlPromptRaw || '';
                let currentSparqlUserPrompt = `Nutzeranfrage: ${prompt}\n\n=== GEFUNDENE WIKIDATA-IDs ===\n${wikidataContext}`;
                let sparqlQuery = '';
                
                let maxRetries = 2;
                let attempt = 0;
                let success = false;
                
                while (attempt < maxRetries && !success) {
                    attempt++;
                    if (onProgress) onProgress(`Wikidata Schritt 3: Generiere SPARQL (Versuch ${attempt}/${maxRetries})...`);
                    
                    const sparqlData: any = await this._executeLLMCall(sparqlSystemPrompt, currentSparqlUserPrompt, provider, model);
                    await saveStep(3, `Build10_Wikidata_SPARQL_Raw_v${attempt}`, sparqlData, "json");
                    sparqlQuery = sparqlData.query || sparqlData.sparql;
                    
                    if (!sparqlQuery) {
                        currentSparqlUserPrompt += `\n\nFEHLER: Du hast kein valides JSON mit dem Key "query" zurückgegeben. Bitte korrigiere dein Format.`;
                        continue;
                    }
                    
                    await saveStep(3, `Build10_Wikidata_SPARQL_v${attempt}`, sparqlQuery, "sparql");
                    if (onProgress) onProgress(`Wikidata Schritt 4: Rufe Live-Daten ab (Versuch ${attempt})...`);
                    
                    const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
                    const response = await fetch(WIKIDATA_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/sparql-results+json',
                            'User-Agent': 'Nodges/Build-10 (localhost)'
                        },
                        body: new URLSearchParams({ query: sparqlQuery })
                    });
                    
                    if (response.ok) {
                        const rawWikidataResponse = await response.json();
                        if (rawWikidataResponse.results && rawWikidataResponse.results.bindings) {
                            if (rawWikidataResponse.results.bindings.length > 0) {
                                const limitedBindings = rawWikidataResponse.results.bindings.slice(0, 30).map((b: any) => {
                                    const clean: any = {};
                                    for (const key in b) {
                                        clean[key] = b[key].value;
                                    }
                                    return clean;
                                });
                                groundingContext = `=== WIKIDATA FAKTEN-BASIS ===\n${JSON.stringify(limitedBindings, null, 2)}`;
                                await saveStep(4, `Build10_Wikidata_Rohdaten_v${attempt}`, rawWikidataResponse, "json");
                                success = true;
                            } else {
                                if (onProgress) onProgress(`Wikidata Schritt 4: 0 Ergebnisse. Fordere Korrektur an...`);
                                currentSparqlUserPrompt += `\n\n=== LETZTER VERSUCH ===\nDeine generierte Query lief zwar fehlerfrei, gab aber exakt 0 Ergebnisse von Wikidata zurück. Das bedeutet, deine Query ist logisch falsch oder zu spezifisch. Hast du möglicherweise die Subjekt/Objekt-Richtung vertauscht, falsche Q-IDs gewählt oder P31 bei einem Einzelobjekt verwendet? Überarbeite die Query grundlegend.`;
                            }
                        }
                    } else {
                        const errorText = await response.text();
                        if (onProgress) onProgress(`Wikidata Schritt 4: Syntax-Fehler. Fordere Korrektur an...`);
                        currentSparqlUserPrompt += `\n\n=== LETZTER VERSUCH ===\nDeine generierte Query erzeugte einen Syntax-Fehler auf dem Server: ${errorText.substring(0, 200)}. Bitte korrigiere die Query.`;
                    }
                }
                
                if (!success && !groundingContext) {
                    throw new Error("Wikidata lieferte auch nach mehrfachen Versuchen keine validen Ergebnisse.");
                }
            } catch (e: any) {
                console.warn('Wikidata grounding failed, falling back to LLM-only', e);
                if (onProgress) onProgress(`Wikidata-Grounding fehlgeschlagen: ${e.message}. Fahre ohne Grounding fort...`);
            }
        }

        if (groundingContext) {
            finalPrompt += `\n\n${groundingContext}\nNutze ZWINGEND diese Wikidata-Faktenbasis fuer die Erstellung des Graphen.`;
        }

        // Step 2: JSON Generierung
        if (onProgress) onProgress('Schritt 2/4: Generiere Netzwerk-Struktur...');
        let systemPrompt = build10PromptRaw;
        
        if (!systemPrompt) {
            throw new Error(`Konnte Prompt-Datei nicht laden: public/prompts/build_10_prompt.md (Raw Import fehlgeschlagen)`);
        }

        if (config.ratingMethod === 'taxonomy') {
            systemPrompt += `\n\n=== ERZWUNGENE BEZIEHUNGS-TAXONOMIE ===
Du MUSS fuer jede Kante in 'data.relationships' einen der folgenden Typen verwenden:
- "influences"
- "prevents"
- "supports"
- "competes_with"
- "part_of"

Jede Beziehung MUSS eine 'strength' Eigenschaft im Bereich 1 bis 5 (Ganzzahlen) haben.
Definiere diese 'strength' Eigenschaft auch in der 'dataModel.relationships' fuer jeden Kanten-Typ (Typ: continuous, Bereich [1, 5]).
======================================`;
        } else if (config.ratingMethod === 'embeddings') {
            systemPrompt += `\n\n=== HINWEIS ZUR BEZIEHUNGS-STAERKE ===
Konzentriere dich auf das Finden korrekter Entitaeten und Verbindungen. Die Staerke/Intensitaet der Kanten wird spaeter automatisch ueber Vektor-Embeddings berechnet.
Gib Kanten trotzdem ein 'strength' Feld im Schema und in den Daten mit, der Wert kann initial 50 sein.
====================================`;
        } else {
            systemPrompt += `\n\n=== HINWEIS ZUR BEZIEHUNGS-STAERKE ===
Schaetze die Beziehungsstaerken ('strength') frei auf einer Skala von 0 bis 100. Definiere diese Eigenschaft im dataModel.
====================================`;
        }

        const exampleStructure = `
=== ZIEL-STRUKTUR ===
{
  "system": "${prompt.substring(0, 30).replace(/"/g, '')}",
  "metadata": {
    "schemaVersion": "5.0",
    "description": "..."
  },
  "dataModel": {
    "entities": {
      "Concept": { "properties": { "importance": { "type": "continuous", "range": [0, 100] }, "position": { "type": "spatial" } } }
    },
    "relationships": {
      "related": { "properties": { "strength": { "type": "continuous", "range": [0, 100] } } }
    }
  },
  "data": {
    "entities": [
      { 
        "id": "e1", 
        "type": "Concept", 
        "label": "...", 
        "importance": 80, 
        "position": { "x": 0, "y": 0, "z": 0 },
        "temporal": {
          "validFrom": 1900,
          "validTo": 1950,
          "history": [
            { "timestamp": 1920, "changes": { "importance": 90 } }
          ]
        }
      }
    ],
    "relationships": [
      { 
        "id": "r1", 
        "type": "related", 
        "source": "e1", 
        "target": "e2", 
        "label": "...", 
        "strength": 60,
        "temporal": {
          "validFrom": 1900,
          "validTo": 1950
        }
      }
    ]
  },
  "visualMappings": {
    "defaultPresets": {
      "global_node": {
        "size": { "source": "importance", "function": "linear", "range": [0.5, 3] },
        "position": { "source": "position", "function": "constant" }
      },
      "global_edge": {
        "thickness": { "source": "strength", "function": "linear", "range": [0.1, 1.5] }
      }
    }
  }
}
WICHTIG: "system", "metadata", "dataModel", "data", "visualMappings" sind Pflichtfelder!`;

        systemPrompt += exampleStructure;

        const jsonSchema = zodToJsonSchema(GraphDataSchema, 'GraphDataSchema');
        let schemaToPass = (jsonSchema as any).definitions?.GraphDataSchema || jsonSchema;
        delete schemaToPass.$schema;
        schemaToPass = this.makeSchemaStrict(schemaToPass);

        let graphData = await this._executeLLMCall(systemPrompt, finalPrompt, provider, model, schemaToPass);
        await saveStep(5, "Build10_Raw_Graph", graphData, "json");

        // Step 3: Qualitätssicherung - Kritiker
        if (config.qualityAssurance === 'critic') {
            if (onProgress) onProgress('Schritt 3/4: Kritiker-LLM prüft den Graphen auf Plausibilität...');
            const criticSystemPrompt = `Du bist ein erfahrener Datenarchitekt. Der Benutzer liefert dir ein JSON-Dokument, das ein Nodges-Netzwerk darstellt.
Deine Aufgabe ist es:
1. Pruefe, ob alle 'source' und 'target' Felder in 'data.relationships' auf existierende Entitaeten in 'data.entities' verweisen. Falls nicht, entferne die fehlerhafte Kante.
2. Pruefe, ob die Werte fuer 'strength' oder andere kontinuierliche Eigenschaften plausibel sind und im angegebenen Range des dataModel liegen.
3. Behebe etwaige Schema-Konformitaetsfehler.
Gib ausschliesslich das korrigierte JSON-Objekt zurueck, ohne Erklaerungen oder Markdown-Formatierungen ausserhalb des JSON.`;

            try {
                const criticData = await this._executeLLMCall(criticSystemPrompt, JSON.stringify(graphData), provider, model, schemaToPass);
                graphData = criticData;
                await saveStep(6, "Build10_Critic_Corrected_Graph", graphData, "json");
            } catch (e: any) {
                console.warn('Critic step failed, using raw graph', e);
                if (onProgress) onProgress(`Kritiker-Schritt fehlgeschlagen: ${e.message}. Verwende rohen Graphen...`);
            }
        }

        // Deduplizierung (Grounding: dedup)
        if (config.grounding === 'dedup') {
            if (onProgress) onProgress('Deduplizierung: Führe semantische Entity Resolution aus...');
            try {
                const deduped = await deduplicateGraph(graphData, provider, 'google/gemini-embedding-2', 0.85, onProgress);
                graphData = deduped;
                await saveStep(7, "Build10_Deduped_Graph", graphData, "json");
            } catch (e: any) {
                console.warn('Deduplication failed', e);
            }
        }

        // Step 4: Bewertungsmethode - Kosinus-Ähnlichkeit
        if (config.ratingMethod === 'embeddings') {
            if (onProgress) onProgress('Schritt 4/4: Berechne Kantenstärken über Kosinus-Ähnlichkeit...');
            try {
                const embeddingCache = new Map<string, number[]>();
                const getEmbeddingCached = async (text: string): Promise<number[]> => {
                    if (embeddingCache.has(text)) return embeddingCache.get(text)!;
                    const embModel = provider === 'openai' ? 'text-embedding-3-small' : (provider === 'ollama' ? 'nomic-embed-text' : 'google/gemini-embedding-2');
                    const emb = await this.generateEmbedding(text, provider, embModel);
                    embeddingCache.set(text, emb);
                    return emb;
                };

                const cosineSimilarity = (a: number[], b: number[]): number => {
                    let dot = 0.0, normA = 0.0, normB = 0.0;
                    for (let i = 0; i < a.length; i++) {
                        dot += a[i] * b[i];
                        normA += a[i] * a[i];
                        normB += b[i] * b[i];
                    }
                    return normA === 0 || normB === 0 ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
                };

                const entitiesMap = new Map<string, any>();
                graphData.data.entities.forEach(e => entitiesMap.set(e.id, e));

                for (const rel of graphData.data.relationships) {
                    const sourceNode = entitiesMap.get(rel.source || '');
                    const targetNode = entitiesMap.get(rel.target || '');
                    if (sourceNode && targetNode) {
                        const labelA = sourceNode.label || sourceNode.id;
                        const labelB = targetNode.label || targetNode.id;
                        if (onProgress) onProgress(`Berechne Ähnlichkeit: "${labelA}" <-> "${labelB}"...`);
                        const embA = await getEmbeddingCached(labelA);
                        const embB = await getEmbeddingCached(labelB);
                        const sim = cosineSimilarity(embA, embB);
                        const score = Math.max(0, Math.min(100, Math.round(sim * 100)));
                        rel.strength = score;
                    }
                }
                
                const gd = graphData as any;
                if (!gd.dataModel) gd.dataModel = {};
                if (!gd.dataModel.relationships) gd.dataModel.relationships = {};
                
                const rels = gd.dataModel.relationships as any;
                const relTypes = new Set(gd.data.relationships.map((r: any) => r.type));
                relTypes.forEach((t: any) => {
                    if (t) {
                        if (!rels[t]) {
                            rels[t] = { properties: {} };
                        }
                        if (!rels[t].properties) {
                            rels[t].properties = {};
                        }
                        rels[t].properties.strength = {
                            type: 'continuous',
                            range: [0, 100]
                        };
                    }
                });

                if (!gd.visualMappings) gd.visualMappings = { defaultPresets: {} };
                if (!gd.visualMappings.defaultPresets) gd.visualMappings.defaultPresets = {};
                if (!gd.visualMappings.defaultPresets.global_edge) {
                    gd.visualMappings.defaultPresets.global_edge = {};
                }
                gd.visualMappings.defaultPresets.global_edge.thickness = {
                    source: 'strength',
                    function: 'linear',
                    range: [0.1, 1.5]
                };

                await saveStep(9, "similarity_graph", graphData, "json");
                if (onStepComplete) onStepComplete(8, "Build10_Similarity_Scored_Graph", JSON.stringify(graphData, null, 2), "json");
            } catch (e: any) {
                console.warn('Similarity scoring failed', e);
                if (onProgress) onProgress(`Ähnlichkeitsberechnung fehlgeschlagen: ${e.message}. Verwende LLM-Schätzung...`);
            }
        }

        return graphData;
    }

    public static async expandGraphNodeBuild10(
        nodeLabel: string,
        nodeQId: string,
        existingGraphData: GraphData,
        provider: LLMProvider = 'openrouter',
        model: string = 'google/gemini-2.5-flash-001',
        onProgress?: (msg: string) => void
    ): Promise<GraphData> {
        let qId = nodeQId;
        if (!qId) {
            if (onProgress) onProgress(`Wikidata: Suche Q-ID für "${nodeLabel}"...`);
            try {
                const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(nodeLabel)}&language=en&limit=1&format=json&origin=*`;
                const res = await fetch(url);
                const json = await res.json();
                if (json.search && json.search.length > 0) {
                    qId = json.search[0].id;
                    if (onProgress) onProgress(`Wikidata: Q-ID gefunden -> ${qId}`);
                } else {
                    throw new Error(`Keine Wikidata-ID für "${nodeLabel}" gefunden.`);
                }
            } catch (e: any) {
                throw new Error(`Fehler bei der ID-Suche: ${e.message}`);
            }
        }

        const expansionSystemPrompt = build10ExpansionPromptRaw || '';
        let currentSparqlUserPrompt = `Nutzer wünscht einen Deep Dive für den Knoten "${nodeLabel}" mit der ID ${qId}. Erstelle die Abfrage.`;
        
        let sparqlQuery = '';
        let maxRetries = 2;
        let attempt = 0;
        let success = false;
        let groundingContext = '';

        while (attempt < maxRetries && !success) {
            attempt++;
            if (onProgress) onProgress(`Schritt 1/2: Generiere SPARQL Deep-Dive für ${nodeLabel} (Versuch ${attempt}/${maxRetries})...`);
            
            const sparqlData: any = await this._executeLLMCall(expansionSystemPrompt, currentSparqlUserPrompt, provider, model);
            sparqlQuery = sparqlData.query || sparqlData.sparql;
            
            if (!sparqlQuery) {
                currentSparqlUserPrompt += `\n\nFEHLER: Du hast kein valides JSON mit dem Key "query" zurückgegeben. Bitte korrigiere dein Format.`;
                continue;
            }

            if (onProgress) onProgress(`Schritt 2/2: Lade Live-Daten für Deep Dive (Versuch ${attempt})...`);
            const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
            const response = await fetch(WIKIDATA_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/sparql-results+json',
                    'User-Agent': 'Nodges/Build-10 (localhost)'
                },
                body: new URLSearchParams({ query: sparqlQuery })
            });

            if (response.ok) {
                const rawWikidataResponse = await response.json();
                if (rawWikidataResponse.results && rawWikidataResponse.results.bindings) {
                    if (rawWikidataResponse.results.bindings.length > 0) {
                        const limitedBindings = rawWikidataResponse.results.bindings.slice(0, 100).map((b: any) => {
                            const clean: any = {};
                            for (const key in b) {
                                clean[key] = b[key].value;
                            }
                            return clean;
                        });
                        groundingContext = `=== WIKIDATA DEEP-DIVE FAKTEN FÜR ${nodeLabel} (${qId}) ===\n${JSON.stringify(limitedBindings, null, 2)}`;
                        success = true;
                    } else {
                        if (onProgress) onProgress(`Wikidata: 0 Ergebnisse. Fordere Korrektur an...`);
                        currentSparqlUserPrompt += `\n\n=== LETZTER VERSUCH ===\nDeine generierte Query lief zwar fehlerfrei, gab aber exakt 0 Ergebnisse zurück. Überprüfe die Query.`;
                    }
                }
            } else {
                const errorText = await response.text();
                if (onProgress) onProgress(`Wikidata: Syntax-Fehler. Fordere Korrektur an...`);
                currentSparqlUserPrompt += `\n\n=== LETZTER VERSUCH ===\nDeine generierte Query erzeugte einen Syntax-Fehler auf dem Server: ${errorText.substring(0, 200)}. Bitte korrigiere die Query. Stelle sicher, dass du keine überflüssigen Klammern benutzt.`;
            }
        }

        if (!success && !groundingContext) {
            throw new Error(`Wikidata Server-Fehler oder leere Ergebnisse nach ${maxRetries} Versuchen.`);
        }

        if (onProgress) onProgress('Generiere neues Graph-JSON aus den Daten...');
        const build6PromptRawStr = build6PromptRaw || '';
        
        const finalPrompt = `Wir machen einen Deep Dive für den Knoten "${nodeLabel}".
${groundingContext}
Erstelle die Entities und Relationships für diese neuen Daten. Halte dich an das mitgelieferte bestehende Datenmodell! Achte darauf, dass der Hauptknoten "${nodeLabel}" vorhanden ist und verknüpfe die neuen Fakten mit ihm. Falls die Fakten Wikidata-URIs enthalten, extrahiere die Q-ID und lege sie als "wikidata_id" an.

Hier ist das bestehende Datenmodell deines Netzwerks:
${JSON.stringify(existingGraphData.dataModel, null, 2)}`;

        const nodgesDataSchema = zodToJsonSchema(GraphDataSchema);
        let schemaToPass: any = JSON.parse(JSON.stringify(nodgesDataSchema));
        delete schemaToPass.$schema;
        
        const newGraphData = await this._executeLLMCall(build6PromptRawStr, finalPrompt, provider, model, this.makeSchemaStrict(schemaToPass));
        
        return newGraphData;
    }
}
