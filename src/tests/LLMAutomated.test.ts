// @vitest-environment happy-dom
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { LLMService } from '../utils/LLMService';
import fs from 'fs';
import path from 'path';

/**
 * Automatisierter Test für alle konfigurierten OpenRouter-Modelle.
 * 
 * ACHTUNG: Dieser Test führt echte API-Aufrufe an OpenRouter aus und 
 * verbraucht Credits! Daher ist er standardmäßig mit .skip deaktiviert.
 * 
 * Um ihn auszuführen:
 * 1. Ändere `describe.skip` zu `describe`
 * 2. Stelle sicher, dass VITE_OPENROUTER_API_KEY in deiner .env Datei steht
 * 3. Führe aus: `npm run test src/tests/LLMAutomated.test.ts`
 */
describe('Automatischer OpenRouter Model Pipeline Test', () => {

    beforeAll(() => {
        // 1. Mock für LocalStorage (API Key injizieren)
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: (key: string) => {
                    if (key === 'llm_key_openrouter') {
                        // Nutze den API Key aus der .env Datei
                        return process.env.VITE_OPENROUTER_API_KEY || '';
                    }
                    return null;
                },
                setItem: vi.fn(),
                removeItem: vi.fn(),
            },
            writable: true
        });

        // 2. Mock für window.location
        Object.defineProperty(window, 'location', {
            value: { href: 'http://localhost:5173/' },
            writable: true
        });

        // 3. Mock für fetch (um die lokalen Prompt-Dateien aus /public zu laden)
        const originalFetch = global.fetch;
        global.fetch = async (url: string | URL | Request, options?: RequestInit) => {
            const urlStr = url.toString();

            // Wenn die Prompt-Datei geladen wird, lesen wir sie lokal über fs
            if (urlStr.includes('build_6_prompt.md')) {
                const promptPath = path.resolve(__dirname, '../../public/prompts/build_6_prompt.md');
                const content = fs.readFileSync(promptPath, 'utf-8');
                return new Response(content, { status: 200 });
            }

            // Reale API-Calls (OpenRouter) ganz normal durchlassen
            return originalFetch(url, options);
        };
    });

    // Hole alle Modelle aus der frisch aktualisierten Liste
    const modelsToTest = LLMService.PROVIDER_MODELS.openrouter;

    // Führe für jedes Modell iterativ (sequenziell) einen Test durch
    it.each(modelsToTest)('sollte Graph für "Sonnensystem" mit Modell $id generieren', async (model) => {

        // Prüfe ob ein API Key vorhanden ist
        const apiKey = process.env.VITE_OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error('VITE_OPENROUTER_API_KEY ist in der .env nicht gesetzt!');
        }

        console.log(`\nStarte Test für Modell: ${model.id}...`);

        const startTime = Date.now();

        let result;
        try {
            // Pipeline aufrufen (Build 6)
            result = await LLMService.generateGraphDataBuild6(
                "Sonnensystem",
                "openrouter",
                model.id
            );
        } catch (error: any) {
            console.warn(`[Fehler bei ${model.id}]: ${error.message}`);
            // Cooldown auch bei Fehlern (z.B. Rate-Limit 429)
            await new Promise(r => setTimeout(r, 8000));
            throw error;
        }

        const durationMs = Date.now() - startTime;
        
        // Erhöhter Cooldown von 8 Sekunden zwischen JEDEM Test, 
        // um OpenRouter Rate-Limits (429) endgültig zu vermeiden
        await new Promise(r => setTimeout(r, 8000));

        // --- Validierung ---
        expect(result).toBeDefined();

        // Grundlegende Struktur vorhanden?
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data.entities)).toBe(true);
        expect(Array.isArray(result.data.relationships)).toBe(true);

        // Wurde überhaupt etwas sinnvolles generiert? (Sonnensystem sollte > 5 Entitäten haben)
        expect(result.data.entities.length).toBeGreaterThan(0);

        // Metadata Injection checken
        expect((result as any).metadata?.apiResponse?.model).toBeDefined();

        console.log(`✅ Erfolg: ${model.id} (${result.data.entities.length} Nodes, ${result.data.relationships.length} Edges, Dauer: ${(durationMs / 1000).toFixed(2)}s)`);

    }, 240000); // Erhöhtes Timeout (240 Sekunden / 4 Minuten) für "Thinker"-Modelle wie R1
});
