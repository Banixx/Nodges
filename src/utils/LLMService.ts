import { GraphData } from '../types';

export class LLMService {
    private static readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    private static readonly DEFAULT_MODEL = 'openai/gpt-4o-mini'; // Fast, cheap, and good at JSON

    /**
     * Retrieves the API key from localStorage.
     */
    public static getApiKey(): string | null {
        return localStorage.getItem('openrouter_api_key');
    }

    /**
     * Saves the API key to localStorage.
     */
    public static setApiKey(key: string): void {
        localStorage.setItem('openrouter_api_key', key.trim());
    }

    /**
     * Removes the API key from localStorage.
     */
    public static clearApiKey(): void {
        localStorage.removeItem('openrouter_api_key');
    }

    /**
     * Sends a prompt to the LLM and parses the JSON response into GraphData.
     */
    public static async generateGraphData(prompt: string, model: string = this.DEFAULT_MODEL): Promise<GraphData> {
        const apiKey = this.getApiKey();
        
        if (!apiKey) {
            throw new Error('Kein API-Key gefunden. Bitte gib deinen OpenRouter API-Key ein.');
        }

        const systemPrompt = `
Du bist ein Assistent, der Daten für eine 3D-Netzwerk-Visualisierung generiert.
Deine Antwort MUSS ausschließlich gültiges JSON sein, ohne Markdown-Formatierung wie \`\`\`json.
Die JSON-Struktur muss zwingend folgendem Schema entsprechen:
{
    "system": "Nodges",
    "metadata": {
        "description": "Eine kurze Beschreibung des generierten Netzwerks"
    },
    "data": {
        "entities": [
            { "id": "eindeutige_id_1", "type": "Node", "label": "Knoten Name 1" },
            { "id": "eindeutige_id_2", "type": "Node", "label": "Knoten Name 2" }
        ],
        "relationships": [
            { "id": "rel_1", "source": "eindeutige_id_1", "target": "eindeutige_id_2", "type": "Edge", "label": "Verbindung" }
        ]
    }
}
Jeder Knoten (Entity) muss eine eindeutige 'id', einen 'type' (z.B. "Person", "Concept") und ein 'label' haben.
Jede Kante (Relationship) muss eine 'source' und ein 'target' haben, die auf die IDs der Entities verweisen.
Generiere sinnvolle Knoten und Kanten basierend auf dem Prompt des Nutzers.
Versuche, ein interessantes und gut verbundenes Netzwerk zu erstellen.
`;

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.href, // OpenRouter requirement
                    'X-Title': 'Nodges 3D Graph', // OpenRouter requirement
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
                console.error('OpenRouter API Error:', errorData);
                throw new Error(`API Fehler: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            if (!content) {
                throw new Error('Das Modell hat keine Antwort zurückgegeben.');
            }

            let parsedData: GraphData;
            try {
                parsedData = JSON.parse(content) as GraphData;
            } catch (e) {
                console.error("Failed to parse JSON:", content);
                throw new Error('Das Modell hat kein gültiges JSON zurückgegeben.');
            }

            // Basic validation
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
