import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export interface ParsedSourceDocument {
    filename: string;
    text: string;
    pageCount?: number;
    characterCount: number;
}

const SUPPORTED_EXTENSIONS = new Set(['pdf', 'txt', 'csv', 'md', 'markdown']);
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function isSupportedSourceDocument(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    return SUPPORTED_EXTENSIONS.has(extension);
}

export async function parseSourceDocument(file: File): Promise<ParsedSourceDocument> {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Die Datei ist groesser als 50 MB: ${file.name}`);
    }
    if (!isSupportedSourceDocument(file)) {
        throw new Error(`Nicht unterstuetztes Quellenformat: ${file.name}. Erlaubt sind PDF, TXT, CSV und Markdown.`);
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'pdf') {
        const text = await file.text();
        if (!text.trim()) {
            throw new Error(`Die Datei enthaelt keinen lesbaren Text: ${file.name}`);
        }
        return { filename: file.name, text, characterCount: text.length };
    }

    // PDF.js wird erst beim ersten PDF dynamisch geladen, damit normale
    // Nodges-Starts und Textdatei-Importe nicht das grosse PDF-Bundle laden.
    const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');
    GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const loadingTask = getDocument({ data: bytes });
    const document = await loadingTask.promise;
    const pages: string[] = [];

    try {
        for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
            const page = await document.getPage(pageNumber);
            const content = await page.getTextContent();
            const lines: string[] = [];
            let currentLine = '';
            let lastY: number | null = null;

            for (const item of content.items) {
                if (!('str' in item)) continue;
                const y = item.transform?.[5] ?? null;
                if (lastY !== null && y !== null && Math.abs(y - lastY) > 3 && currentLine.trim()) {
                    lines.push(currentLine.trim());
                    currentLine = '';
                }
                currentLine += `${currentLine ? ' ' : ''}${item.str}`;
                if (item.hasEOL && currentLine.trim()) {
                    lines.push(currentLine.trim());
                    currentLine = '';
                }
                lastY = y;
            }
            if (currentLine.trim()) lines.push(currentLine.trim());
            pages.push(`[Seite ${pageNumber}]\n${lines.join('\n')}`);
            page.cleanup();
        }
    } finally {
        await document.destroy();
    }

    const text = pages.join('\n\n').trim();
    const textWithoutPageMarkers = text.replace(/\[Seite \d+\]/g, '').trim();
    if (!textWithoutPageMarkers) {
        throw new Error(`In ${file.name} wurde kein eingebetteter Text gefunden. Die PDF ist vermutlich eingescannt und benoetigt zuerst OCR.`);
    }

    return {
        filename: file.name,
        text,
        pageCount: pages.length,
        characterCount: textWithoutPageMarkers.length
    };
}
