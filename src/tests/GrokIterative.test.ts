// @vitest-environment happy-dom
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { LLMService } from '../utils/LLMService';
import fs from 'fs';
import path from 'path';

/**
 * Automatisierter iterativer Test für x-ai/grok-4.20.
 * Testet komplexe Features wie multiple Kanten und temporale Eigenschaften.
 */
describe('Iterativer Grok 4.20 Feature Test', () => {

    beforeAll(() => {
        // 1. Mock für LocalStorage (API Key injizieren)
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: (key: string) => {
                    if (key === 'llm_key_openrouter') {
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

            if (urlStr.includes('build_6_prompt.md')) {
                const promptPath = path.resolve(__dirname, '../../public/prompts/build_6_prompt.md');
                const content = fs.readFileSync(promptPath, 'utf-8');
                return new Response(content, { status: 200 });
            }

            return originalFetch(url, options);
        };
    });

    const modelId = 'x-ai/grok-4.20';

    const testPrompts = [
        {
            name: "1. Einfacher Graph",
            prompt: "Erstelle ein simples Sonnensystem mit der Sonne und drei Planeten."
        },
        {
            name: "2. Multiple Edges",
            prompt: "Ein soziales Netzwerk, in dem Personen MEHRERE verschiedene Beziehungen zueinander haben (z.B. 'kennt', 'arbeitet_mit', 'hasst'). Nutze multiple edges zwischen den gleichen Knoten."
        },
        {
            name: "3. Temporale Objekte",
            prompt: "Die Geschichte Roms. Nutze explizit temporale Eigenschaften (Startjahr, Endjahr) für die Knoten und Kanten, um Epochen abzubilden."
        },
        {
            name: "4. Komplexe visuelle Presets",
            prompt: "Ein Computernetzwerk. Nutze verschiedene visuelle Presets (Geometrie, Farbe, Größe), um Router, Server und Clients zu unterscheiden."
        },
        {
            name: "5. Rekursive und zirkuläre Beziehungen",
            prompt: "Ein komplexer Stammbaum von Göttern, bei dem Knoten auf sich selbst oder innerhalb der gleichen Familie komplexe zirkuläre Beziehungen haben."
        },
        {
            name: "6. Abstrakte Konzepte",
            prompt: "Die Entwicklung philosophischer Strömungen und deren gegenseitige Beeinflussung über die Zeit. Sehr abstrakt mit vielen Beziehungen."
        },
        {
            name: "7. Datenintensive Eigenschaften",
            prompt: "Eine Datenbank mit 5 Büchern. Jedes Buch hat mindestens 5 verschiedene Attribute in den Properties (Preis, Seiten, Autor, Genre, Bewertung)."
        },
        {
            name: "8. Hochgradig vernetztes Ökosystem",
            prompt: "Ein Waldökosystem, in dem jedes Tier/Pflanze mit vielen anderen über komplexe Kanten (frisst, bestäubt, parasitiert) verbunden ist."
        },
        {
            name: "9. Temporal + Multiple Edges",
            prompt: "Der zweite Weltkrieg als Graph. Nutze temporale Objekte und multiple Kanten für Bündnisse, Kriegserklärungen und Schlachten zwischen den gleichen Ländern."
        },
        {
            name: "10. Edge Cases (Unvollständige Datenstrukturen testen)",
            prompt: "Ein magisches Universum mit Knoten ohne Kanten, oder Kanten ohne Eigenschaften, und völlig ungewöhnlichen, extrem extrem langen Typnamen."
        }
    ];

    it.each(testPrompts)('sollte Iteration "$name" mit grok-4.20 generieren', async ({ name, prompt }) => {
        const apiKey = process.env.VITE_OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error('VITE_OPENROUTER_API_KEY ist in der .env nicht gesetzt!');
        }

        console.log(`\nStarte Iteration: ${name}`);
        const startTime = Date.now();

        let result;
        try {
            result = await LLMService.generateGraphDataBuild6(
                prompt,
                "openrouter",
                modelId
            );
        } catch (error: any) {
            console.warn(`[Fehler bei Iteration ${name}]: ${error.message}`);
            await new Promise(r => setTimeout(r, 8000));
            throw error;
        }

        const durationMs = Date.now() - startTime;
        
        // Cooldown
        await new Promise(r => setTimeout(r, 8000));

        // --- Validierung ---
        expect(result).toBeDefined();
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data.entities)).toBe(true);
        expect(Array.isArray(result.data.relationships)).toBe(true);

        // Komplettes result als eigene JSON-Datei speichern
        const iterationNumber = name.split('.')[0].trim().padStart(2, '0');
        const safeName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const jsonFileName = `grok_${iterationNumber}_${safeName}.json`;
        const outputPath = path.resolve(__dirname, '../../doc/', jsonFileName);
        
        const outputData = {
            _testMeta: {
                iteration: name,
                prompt: prompt,
                model: modelId,
                durationMs: durationMs,
                durationSec: parseFloat((durationMs / 1000).toFixed(2)),
                entityCount: result.data.entities.length,
                relationshipCount: result.data.relationships.length,
                timestamp: new Date().toISOString()
            },
            ...result
        };
        
        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

        console.log(`✅ Erfolg: ${name} (${result.data.entities.length} Nodes, ${result.data.relationships.length} Edges, Dauer: ${(durationMs / 1000).toFixed(2)}s)`);

    }, 240000); 
});
