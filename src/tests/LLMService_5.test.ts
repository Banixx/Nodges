// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LLMService } from '../utils/LLMService';

describe('LLMService (Build 5)', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        // Mock localStorage
        const store: Record<string, string> = {
            'llm_key_openrouter': 'test-key'
        };
        vi.stubGlobal('localStorage', {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, value: string) => { store[key] = value; },
            removeItem: (key: string) => { delete store[key]; }
        });
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.unstubAllGlobals();
    });

    it('sollte generateGraphDataMultiStepBuild5 erfolgreich ausführen, wenn die API antwortet', async () => {
        global.fetch = vi.fn().mockImplementation(async (url: string | URL | Request) => {
            const urlStr = url.toString();
            // Mock für die Prompt-Dateien
            if (urlStr.includes('.md')) {
                return new Response('Mocked system prompt', { status: 200 });
            }
            // Mock für OpenRouter API
            return new Response(JSON.stringify({
                choices: [{
                    message: {
                        content: JSON.stringify({
                            system: "Test",
                            data: { entities: [{ id: "n1" }], relationships: [] }
                        })
                    }
                }]
            }), { status: 200 });
        });

        const progressMock = vi.fn();
        const result = await LLMService.generateGraphDataMultiStepBuild5('Test prompt', 'openrouter', 'test-model', progressMock);
        
        expect(result).toBeDefined();
        expect(result.data.entities.length).toBe(1);
        expect(progressMock).toHaveBeenCalled();
    });

    it('sollte einen sauberen Fehler werfen, wenn die API einen HTTP Fehler (z.B. 429) zurückgibt', async () => {
        global.fetch = vi.fn().mockImplementation(async (url: string | URL | Request) => {
            const urlStr = url.toString();
            if (urlStr.includes('.md')) {
                return new Response('Mocked system prompt', { status: 200 });
            }
            return new Response(JSON.stringify({ error: { message: "Rate limit" } }), { status: 429, statusText: "Too Many Requests" });
        });

        await expect(
            LLMService.generateGraphDataMultiStepBuild5('Test prompt', 'openrouter', 'test-model')
        ).rejects.toThrow(/Rate-Limit/);
    });

    it('sollte Fehler werfen, wenn JSON nicht valide ist', async () => {
        global.fetch = vi.fn().mockImplementation(async (url: string | URL | Request) => {
            const urlStr = url.toString();
            if (urlStr.includes('.md')) {
                return new Response('Mocked system prompt', { status: 200 });
            }
            return new Response(JSON.stringify({
                choices: [{
                    message: {
                        content: "Dies ist kein JSON"
                    }
                }]
            }), { status: 200 });
        });

        await expect(
            LLMService.generateGraphDataMultiStepBuild5('Test prompt', 'openrouter', 'test-model')
        ).rejects.toThrow(/gültiges JSON/);
    });
});
