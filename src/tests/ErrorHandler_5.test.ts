import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorHandler } from '../core/ErrorHandler';
import { notify } from '../core/NotificationService';

// Mock NotificationService
vi.mock('../core/NotificationService', () => ({
    notify: {
        show: vi.fn(),
    }
}));

describe('ErrorHandler (Build 5)', () => {
    let errorHandler: ErrorHandler;

    beforeEach(() => {
        errorHandler = ErrorHandler.getInstance();
        errorHandler.clearLog();
        vi.clearAllMocks();
    });

    it('sollte notify.show aufrufen, wenn ein Fehler behandelt wird', () => {
        const error = new Error('Test Fehler');
        errorHandler.handle(error, { category: 'llm_pipeline' as any, severity: 'error', userMessage: 'Die LLM-Pipeline ist fehlgeschlagen.' });

        expect(notify.show).toHaveBeenCalledTimes(1);
        expect(notify.show).toHaveBeenCalledWith(
            expect.any(String), // Titel
            'Die LLM-Pipeline ist fehlgeschlagen.',
            'error',
            expect.objectContaining({ details: error })
        );
    });

    it('sollte wrapSync ausführen und Fehler abfangen ohne abzustürzen', () => {
        const failingFunction = () => {
            throw new Error('Sync Error');
        };

        const result = errorHandler.wrapSync(failingFunction, { category: 'general' }, 'fallback');

        expect(result).toBe('fallback');
        expect(notify.show).toHaveBeenCalledTimes(1);
    });

    it('sollte wrapAsync ausführen und Fehler abfangen ohne abzustürzen', async () => {
        const failingAsyncFunction = async () => {
            throw new Error('Async Error');
        };

        const result = await errorHandler.wrapAsync(failingAsyncFunction, { category: 'general' }, 'fallback_async');

        expect(result).toBe('fallback_async');
        expect(notify.show).toHaveBeenCalledTimes(1);
    });

    it('sollte einen Recovery-Callback ausführen, wenn er bereitgestellt wird', () => {
        const recoverMock = vi.fn();
        errorHandler.handle(new Error('Test'), { category: 'layout', recover: recoverMock });

        expect(recoverMock).toHaveBeenCalledTimes(1);
    });
});
