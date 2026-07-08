import { GraphData } from '../types';

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
            { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (OpenAI)' },
            { id: 'google/gemini-flash-1.5', name: 'Gemini 1.5 Flash (Google)' },
            { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (Anthropic)' },
            { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)' },
            { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B (Alibaba)' },
            { id: 'zhipu/glm-4', name: 'GLM 4 (Zhipu)' },
            { id: 'qwen/qwen3.6-plus', name: 'Qwen 3.6 Plus (Alibaba)' },
            { id: 'z-ai/glm-5.2', name: 'GLM 5.2 (Zhipu)' },
            { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek V4 Pro' },
            { id: 'mistralai/mistral-nemo', name: 'Mistral Nemo' },
            { id: 'tencent/hy3m', name: 'Tencent HY3M' },
            { id: 'moonshotai/kimi-k2.7-code', name: 'Kimi K2.7 Code (Moonshot)' }
        ],
        openai: [
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
            { id: 'gpt-4o', name: 'GPT-4o' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
        ],
        anthropic: [
            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
            { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
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

    /**
     * Retrieves the API key for a specific provider from localStorage.
     */
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
            // Temporaerer Key fuer öffentliche Nutzung ohne eigene Eingabe
            return localStorage.getItem('llm_key_openrouter') || '';
        }
        return localStorage.getItem(`llm_key_${provider}`);
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
     * Sends a prompt to the LLM and parses the JSON response into GraphData.
     */
    private static async _executeLLMCall(
        systemPrompt: string,
        userPrompt: string,
        provider: LLMProvider,
        model: string
    ): Promise<GraphData> {
        const apiKey = this.getApiKey(provider);
        if (!apiKey) {
            throw new Error(`Kein API-Key für ${provider} gefunden. Bitte gib deinen API-Key ein.`);
        }

        let responseText = '';

        if (provider === 'openrouter') {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`OpenRouter API Fehler: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            responseText = data.choices[0]?.message?.content;

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
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`OpenAI API Fehler: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            responseText = data.choices[0]?.message?.content;

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
                throw new Error(`Anthropic API Fehler: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            responseText = data.content[0]?.text;
        }

        if (!responseText) {
            throw new Error('Das Modell hat keine Antwort zurückgegeben.');
        }

        let cleanResponse = responseText.trim();
        if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }

        let parsedData: any;
        try {
            parsedData = JSON.parse(cleanResponse);
        } catch (e) {
            console.error("Failed to parse JSON:", responseText);
            throw new Error('Das Modell hat kein gültiges JSON zurückgegeben.');
        }

        // Flexiblere Validierung: Es muss ENTWEDER data.entities/relationships geben ODER ein dataModel ODER visualMappings (fuer Multi-Step)
        const hasData = parsedData.data && Array.isArray(parsedData.data.entities) && Array.isArray(parsedData.data.relationships);
        const hasDataModel = parsedData.dataModel && typeof parsedData.dataModel === 'object';
        const hasVisualMappings = parsedData.visualMappings && typeof parsedData.visualMappings === 'object';

        if (!hasData && !hasDataModel && !hasVisualMappings) {
            console.error("Invalid JSON structure:", parsedData);
            throw new Error('Das generierte JSON hat nicht die erwartete Struktur (weder Daten, noch Schema, noch Visual Mappings gefunden).');
        }

        return parsedData as GraphData;
    }

    public static async generateGraphData(
        prompt: string, 
        provider: LLMProvider, 
        model: string,
        formatFile: string = '/nodges_build_4.md'
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
        const schemaPromptFile = '/prompts/build_5_ontology_prompt.md';
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
        
        const dataPromptFile = '/prompts/build_5_data_prompt.md';
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
        
        const visualPromptFile = '/prompts/build_5_visual_prompt.md';
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

    public static async generateGraphDataMultiStep(
        prompt: string, 
        provider: LLMProvider, 
        model: string,
        onProgress?: (msg: string) => void
    ): Promise<GraphData> {
        const ontologyPromptFile = '/prompts/ontology_prompt.md';
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
        
        const dataPromptFile = '/prompts/build_4_prompt.md';
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
        formatFile: string = '/prompts/build_4_prompt.md',
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
