import { describe, it } from 'vitest';
import * as fs from 'fs';
import { DataParser } from '../core/DataParser';
import * as path from 'path';

describe('DataParser Debug', () => {
    it('should parse a B10 json', () => {
        // Robust: beliebige vorhandene B10-JSON-Datei parsen.
        // Ohne vorhandene Datendatei wird der Test (mit Warnung) uebersprungen,
        // statt mit einem nicht vorhandenen Pfad zu scheitern.
        const dir = path.join(__dirname, '../../public/data/b10');
        if (!fs.existsSync(dir)) {
            console.warn('[debugParse] B10-Datenverzeichnis fehlt – Test wird uebersprungen.');
            return;
        }
        const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
        if (files.length === 0) {
            console.warn('[debugParse] Keine B10-JSON-Datei gefunden – Test wird uebersprungen.');
            return;
        }

        const filePath = path.join(dir, files[0]);
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        try {
            DataParser.parse(json);
        } catch (e: any) {
            console.error('Parse Error:', e.errors || e.message);
            throw e;
        }
    });
});
