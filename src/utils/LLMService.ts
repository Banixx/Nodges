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
            { id: 'meta-llama/llama-3-8b-instruct:free', name: 'Llama 3 8B (Free)' },
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Anthropic)' },
            { id: 'google/gemini-flash-1.5', name: 'Gemini 1.5 Flash (Google)' }
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

    private static cachedOpenRouterModels: LLMModel[] | null = null;

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
        if (this.cachedOpenRouterModels) {
            return this.cachedOpenRouterModels;
        }

        try {
            const response = await fetch('https://openrouter.ai/api/v1/models');
            if (!response.ok) {
                throw new Error(`HTTP Fehler ${response.status}`);
            }
            const data = await response.json();
            if (data && Array.isArray(data.data)) {
                const models: LLMModel[] = data.data.map((m: any) => ({
                    id: m.id,
                    name: m.name || m.id
                }));
                // Sort alphabetically
                models.sort((a, b) => a.name.localeCompare(b.name));
                this.cachedOpenRouterModels = models;
                return models;
            }
        } catch (error) {
            console.warn('Fehler beim Laden der OpenRouter-Modelle, benutze Fallback:', error);
        }

        return this.PROVIDER_MODELS.openrouter;
    }

    /**
     * Sends a prompt to the LLM and parses the JSON response into GraphData.
     */
    public static async generateGraphData(
        prompt: string, 
        provider: LLMProvider, 
        model: string
    ): Promise<GraphData> {
        const apiKey = this.getApiKey(provider);
        
        if (!apiKey) {
            throw new Error(`Kein API-Key für ${provider} gefunden. Bitte gib deinen API-Key ein.`);
        }

        const systemPrompt = `Du bist ein hochpraeziser Daten-Generator fuer Nodges, eine 3D-Netzwerk-Visualisierung.
Deine Antwort MUSS ausschliesslich gueltiges JSON sein, ohne Markdown-Formatierung.

PFLICHTSTRUKTUR (alle Top-Level-Felder sind PFLICHT):
{
  "system": "Systemname",
  "metadata": { "description": "Beschreibung", "version": "1.0", "author": "AI" },
  "dataModel": {
    "entities": {
      "<EntityTyp>": {
        "properties": {
          "<kategorisches_attribut>": { "type": "categorical", "values": ["Wert1", "Wert2", "Wert3"] },
          "<numerisches_attribut>": { "type": "continuous", "range": [0, 100] }
        }
      }
    },
    "relationships": {
      "<RelTyp>": { "properties": {} }
    }
  },
  "visualMappings": {
    "defaultPresets": {
      "<EntityTyp>": {
        "color": { "source": "<kategorisches_attribut>", "function": "categorical" },
        "size": { "source": "<numerisches_attribut>", "function": "linear", "range": [0.5, 1.5] }
      },
      "<RelTyp>": {
        "color": { "source": "constant", "function": "constant", "params": { "color": "#hexcode" } },
        "thickness": { "source": "constant", "function": "constant", "range": [0.08, 0.08] }
      }
    }
  },
  "data": {
    "entities": [
      { "id": "unique_id", "type": "<EntityTyp>", "label": "Anzeigename",
        "<kategorisches_attribut>": "Wert1", "<numerisches_attribut>": 42,
        "position": { "x": 0, "y": 5, "z": 0 } }
    ],
    "relationships": [
      { "id": "rel_id", "type": "<RelTyp>", "source": "id1", "target": "id2", "label": "Beschreibung" }
    ]
  }
}

WICHTIGE REGELN:
1. FARBVIELFALT: Verwende IMMER "function": "categorical" fuer Entity-Farben, gemappt auf ein kategorisches Attribut mit mindestens 3 verschiedenen Werten. Jeder Entity-Typ braucht ein color-Mapping.
2. GROESSEN-DIFFERENZIERUNG: Verwende "function": "linear" fuer Entity-Groessen, gemappt auf ein numerisches Attribut. Der range MUSS [0.5, 1.5] sein.
3. DATENREICHTUM: Jede Entity muss 3-5 semantische Attribute als flache Felder haben (NICHT in einem verschachtelten properties-Objekt). Alle Attribute muessen im dataModel definiert sein.
4. POSITIONEN: Setze fuer JEDE Entity ein position-Objekt mit x, y, z. Y-Achse = Hierarchie/Wichtigkeit (oben=wichtig, Bereich 0-30). X und Z verteilen die Nodes raeumlich (Bereich -20 bis +20). Mindestabstand 5 Einheiten zwischen Nodes.
5. VERSCHIEDENE EDGE-TYPEN: Nutze mindestens 2 verschiedene Relationship-Typen mit unterschiedlichen Farben. Jeder Typ braucht einen Eintrag in visualMappings.defaultPresets.
6. UMFANG: Generiere mindestens 10 Entities und 15 Relationships.
7. EDGE-CURVATURE: Bei mehreren Edge-Typen nutze unterschiedliche curvature-Werte (0.0, 0.25, 0.5) damit sich Linien nicht ueberlagern.
8. Jede Entity-ID und Relationship-ID muss eindeutig sein. Keine Leerzeichen in IDs.
9. Alle source/target Werte in Relationships MUESSEN auf existierende Entity-IDs verweisen.
10. Fuer jeden verwendeten type (Entity oder Relationship) MUSS ein Eintrag in visualMappings.defaultPresets existieren.
`;

        try {
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
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: prompt }
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
                            { role: 'user', content: prompt }
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
                            { role: 'user', content: prompt }
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

            let parsedData: GraphData;
            try {
                parsedData = JSON.parse(cleanResponse) as GraphData;
            } catch (e) {
                console.error("Failed to parse JSON:", responseText);
                throw new Error('Das Modell hat kein gültiges JSON zurückgegeben.');
            }

            if (!parsedData.data || !Array.isArray(parsedData.data.entities) || !Array.isArray(parsedData.data.relationships)) {
                throw new Error('Das generierte JSON hat nicht die erwartete Struktur (data.entities und data.relationships fehlen).');
            }

            return parsedData;

        } catch (error) {
            console.error('LLM Generation Error:', error);
            throw error;
        }
    }
}
