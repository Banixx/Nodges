import { GraphData, GraphDataSchema } from '../types';
import { zodToJsonSchema } from 'zod-to-json-schema';

export type LLMProvider = 'openrouter' | 'openai' | 'anthropic';

export interface LLMModel {
    id: string;
    name: string;
}

export class LLMService {
    public static readonly PROVIDERS: { id: LLMProvider; name: string }[] = [
        { id: 'openrouter', name: 'OpenRouter' },
        { id: 'openai', name: 'OpenAI' },
        { id: 'anthropic', name: 'Anthropic' }
    ];

    public static readonly PROVIDER_MODELS: Record<LLMProvider, LLMModel[]> = {
        openrouter: [
            { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Meta: Llama 3.3 70B Instruct (free)' },
            { id: 'qwen/qwen3-coder:free', name: 'Qwen: Qwen3 Coder (free)' },
            { id: 'openai/gpt-oss-120b:free', name: 'OpenAI: gpt-oss-120b (free)' },
            { id: 'google/gemma-4-31b-it:free', name: 'Google: Gemma 4 31B (free)' },
            { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Nous: Hermes 3 405B Instruct (free)' },
            { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek: DeepSeek V4 Flash' },
            { id: 'mistralai/mistral-small-3.2-24b-instruct', name: 'Mistral: Mistral Small 3.2 24B' },
            { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta: Llama 3.3 70B Instruct' },
            { id: 'openai/gpt-4o-mini', name: 'OpenAI: GPT-4o-mini' },
            { id: 'deepseek/deepseek-chat', name: 'DeepSeek: DeepSeek V3' },
            { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek: DeepSeek V4 Pro' },
            { id: 'qwen/qwen3.7-plus', name: 'Qwen: Qwen3.7 Plus' },
            { id: 'mistralai/mistral-large-2512', name: 'Mistral: Mistral Large 3 2512' },
            { id: 'google/gemini-3.1-flash-lite', name: 'Google: Gemini 3.1 Flash Lite' },
            { id: 'openai/gpt-4.1-mini', name: 'OpenAI: GPT-4.1 Mini' },
            { id: 'x-ai/grok-4.20', name: 'xAI: Grok 4.20' },
            { id: 'google/gemini-2.5-flash', name: 'Google: Gemini 2.5 Flash' },
            { id: 'deepseek/deepseek-r1', name: 'DeepSeek: R1' },
            { id: 'qwen/qwen3-max', name: 'Qwen: Qwen3 Max' },
            { id: 'openai/o3-mini', name: 'OpenAI: o3 Mini' },
            { id: 'openai/o4-mini', name: 'OpenAI: o4 Mini' },
            { id: 'anthropic/claude-haiku-4.5', name: 'Anthropic: Claude Haiku 4.5' }
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
        return '';
    }

    /**
     * Set the active model for a provider in localStorage
     */
    public static setActiveModel(provider: LLMProvider, model: string): void {
        localStorage.setItem(`llm_model_${provider}`, model);
    }

    public static getApiKey(provider: LLMProvider): string | null {
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
     * Converts a permissive JSON schema into a strict schema required by OpenAI/OpenRouter (strict: true).
     * This recursively removes any invalid constraints and sets additionalProperties: false.
     */
    private static makeSchemaStrict(schema: any): any {
        if (typeof schema !== 'object' || schema === null) return schema;
        const newSchema = { ...schema };
        
        // Remove properties that cause errors with strict schema
        delete newSchema.default;
        
        if (newSchema.type === 'object') {
            newSchema.additionalProperties = false;
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
                        response_format: jsonSchema 
                            ? { type: 'json_schema', json_schema: { name: 'GraphData', strict: true, schema: jsonSchema } }
                            : { type: 'json_object' }
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
                if (!responseText) {
                    throw new Error(`Die API hat keine gültigen 'choices' zurückgegeben. Antwort-Struktur: ${JSON.stringify(rawApiData).substring(0, 200)}...`);
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
                        response_format: jsonSchema 
                            ? { type: 'json_schema', json_schema: { name: 'GraphData', strict: true, schema: jsonSchema } }
                            : { type: 'json_object' }
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
            throw new Error('Das Modell hat kein gültiges JSON zurückgegeben.');
        }

        // Fix common LLM issue where it wraps output in the schema name
        if (parsedData.GraphDataSchema && typeof parsedData.GraphDataSchema === 'object') {
            parsedData = parsedData.GraphDataSchema;
        }

        // Flexiblere Validierung: Es muss ENTWEDER data.entities/relationships geben ODER ein dataModel ODER visualMappings (fuer Multi-Step)
        const hasData = parsedData.data && Array.isArray(parsedData.data.entities) && Array.isArray(parsedData.data.relationships);
        const hasDataModel = parsedData.dataModel && typeof parsedData.dataModel === 'object';
        const hasVisualMappings = parsedData.visualMappings && typeof parsedData.visualMappings === 'object';

        if (!hasData && !hasDataModel && !hasVisualMappings) {
            console.error("Invalid JSON structure:", parsedData);
            throw new Error('Das generierte JSON hat nicht die erwartete Struktur (weder Daten, noch Schema, noch Visual Mappings gefunden).');
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
        onProgress?: (msg: string) => void
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
        const step1Data = await this._executeLLMCall(schemaSystemPrompt, step1UserPrompt, provider, model);
        
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
        
        const step2Data = await this._executeLLMCall(dataSystemPrompt, step2UserPrompt, provider, model);
        
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
        
        const step3Data = await this._executeLLMCall(visualSystemPrompt, step3UserPrompt, provider, model);
        
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
      "<TypName>": { "properties": { "<propName>": { "type": "continuous", "range": [0, 100] } } }
    },
    "relationships": {
      "<KantenTyp>": { "properties": {} }
    }
  },
  "data": {
    "entities": [
      { "id": "unique_id", "type": "<TypName>", "label": "...", "<propName>": 42 }
    ],
    "relationships": [
      { "id": "rel_1", "type": "<KantenTyp>", "source": "id_a", "target": "id_b", "label": "..." }
    ]
  },
  "visualMappings": {
    "defaultPresets": {
      "<TypName>": {
        "size": { "source": "<propName>", "function": "linear", "range": [0.5, 3] },
        "color": { "source": "type", "function": "categorical" },
        "geometry": { "source": "constant", "function": "constant", "params": { "geometry": "sphere" } }
      },
      "<KantenTyp>": {
        "color": { "source": "constant", "function": "constant", "params": { "color": "#FFD700" } },
        "thickness": { "source": "constant", "function": "constant", "params": { "size": 0.1 } }
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

        return this._executeLLMCall(systemPrompt, prompt, provider, model, schemaToPass);
    }

    public static async generateGraphDataMultiStep(
        prompt: string, 
        provider: LLMProvider, 
        model: string,
        onProgress?: (msg: string) => void
    ): Promise<GraphData> {
        const ontologyPromptFile = import.meta.env.BASE_URL + 'prompts/ontology_prompt.md';
        let ontologySystemPrompt = '';
        try {
            const res = await fetch(ontologyPromptFile);
            if (!res.ok) throw new Error();
            ontologySystemPrompt = await res.text();
        } catch {
            throw new Error(`Konnte Ontology-Format-Datei nicht laden: ${ontologyPromptFile}`);
        }
        
        if (onProgress) onProgress('Schritt 1/2: Ontologie (Schema) wird entworfen...');
        
        // Call 1: Generate Ontology
        const ontologyData = await this._executeLLMCall(ontologySystemPrompt, prompt, provider, model);
        
        if (onProgress) onProgress('Schritt 2/2: Datenpunkte werden basierend auf Schema generiert...');
        
        const dataPromptFile = import.meta.env.BASE_URL + 'prompts/build_4_prompt.md';
        let dataSystemPrompt = '';
        try {
            const res = await fetch(dataPromptFile);
            if (!res.ok) throw new Error();
            dataSystemPrompt = await res.text();
        } catch {
            throw new Error(`Konnte Data-Format-Datei nicht laden: ${dataPromptFile}`);
        }

        const step2UserPrompt = `
Nutze EXAKT das folgende Schema (Ontologie), um die Daten zu generieren. Erfinde keine neuen Entity-Typen oder Attribute, die nicht im Schema stehen!
Befuelle nun die data.entities und data.relationships Arrays basierend auf der Originalanfrage.

=== ONTOLOGIE ===
${JSON.stringify(ontologyData, null, 2)}
=================

USER PROMPT (Thema): ${prompt}
`;
        
        // Call 2: Generate Data
        return this._executeLLMCall(dataSystemPrompt, step2UserPrompt, provider, model);
    }

    public static async refineGraphData(
        existingData: GraphData,
        prompt: string, 
        provider: LLMProvider, 
        model: string,
        formatFile: string = import.meta.env.BASE_URL + 'prompts/build_4_prompt.md',
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

        return this._executeLLMCall(systemPrompt, refineUserPrompt, provider, model);
    }
}
