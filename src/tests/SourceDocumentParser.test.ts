// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { isSupportedSourceDocument, parseSourceDocument } from '../utils/SourceDocumentParser';

describe('SourceDocumentParser', () => {
    it('erkennt die unterstuetzten Quellenformate', () => {
        expect(isSupportedSourceDocument(new File(['x'], 'quelle.pdf'))).toBe(true);
        expect(isSupportedSourceDocument(new File(['x'], 'daten.CSV'))).toBe(true);
        expect(isSupportedSourceDocument(new File(['x'], 'notizen.md'))).toBe(true);
        expect(isSupportedSourceDocument(new File(['x'], 'bild.png'))).toBe(false);
    });

    it('liest eine Textquelle aus', async () => {
        const parsed = await parseSourceDocument(new File(['Erste Zeile\nZweite Zeile'], 'quelle.txt', { type: 'text/plain' }));
        expect(parsed.filename).toBe('quelle.txt');
        expect(parsed.text).toContain('Zweite Zeile');
        expect(parsed.characterCount).toBe(24);
    });

    it('weist nicht unterstuetzte Dateien zurueck', async () => {
        await expect(parseSourceDocument(new File(['x'], 'bild.png'))).rejects.toThrow('Nicht unterstuetztes Quellenformat');
    });
});
