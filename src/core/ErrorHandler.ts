/**
 * ErrorHandler - Zentrales Error-Boundary-Konzept fuer Nodges
 *
 * Faengt Fehler aus verschiedenen Bereichen ab und leitet sie
 * an den NotificationService weiter. Bietet Graceful Degradation
 * fuer Layout-Fehler und Import/Export-Fehler.
 *
 * Phase 7: Fehlerbehandlung und Cleanup
 */

import { notify, NotificationType } from './NotificationService';

/** Fehler-Kategorien fuer strukturierte Behandlung */
export type ErrorCategory =
    | 'import'
    | 'export'
    | 'layout'
    | 'render'
    | 'worker'
    | 'initialization'
    | 'interaction'
    | 'general'
    | 'llm_pipeline'
    | 'network';

/** Schweregrad des Fehlers */
export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

interface ErrorContext {
    category: ErrorCategory;
    severity?: ErrorSeverity;
    /** Benutzerfreundliche Fehlerbeschreibung */
    userMessage?: string;
    /** Technische Details (nur Konsole) */
    technicalDetails?: unknown;
    /** Callback fuer Recovery/Fallback */
    recover?: () => void;
}

export class ErrorHandler {
    private static instance: ErrorHandler | null = null;
    /** Fehler-Historie fuer Debugging */
    private errorLog: Array<{ timestamp: number; category: ErrorCategory; message: string }> = [];
    private readonly MAX_LOG_SIZE = 100;

    private constructor() {
        this.setupGlobalHandlers();
    }

    static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    /**
     * Zentraler Fehlerbehandlungs-Einstiegspunkt.
     * Alle Fehler in der Anwendung sollten hierueber laufen.
     */
    handle(error: unknown, context: ErrorContext): void {
        const severity = context.severity ?? 'error';
        const message = this.extractMessage(error);
        const userMessage = context.userMessage ?? this.getDefaultUserMessage(context.category, message);

        // In Fehler-Historie speichern
        this.logError(context.category, message);

        // Notification-Typ basierend auf Schweregrad
        const notificationType = this.severityToNotificationType(severity);

        // Titel basierend auf Kategorie
        const title = this.getCategoryTitle(context.category);

        // Benutzerbenachrichtigung
        notify.show(title, userMessage, notificationType, {
            details: context.technicalDetails ?? error,
            duration: severity === 'fatal' ? 10000 : undefined,
        });

        // Recovery-Callback ausfuehren wenn vorhanden
        if (context.recover) {
            try {
                context.recover();
            } catch (recoveryError) {
                console.error('[ErrorHandler] Recovery fehlgeschlagen:', recoveryError);
            }
        }
    }

    /**
     * Wickelt eine async-Funktion in Fehlerbehandlung ein.
     * Ermoeglicht Graceful Degradation mit optionalem Fallback-Wert.
     */
    async wrapAsync<T>(
        fn: () => Promise<T>,
        context: ErrorContext,
        fallbackValue?: T
    ): Promise<T | undefined> {
        try {
            return await fn();
        } catch (error) {
            this.handle(error, context);
            return fallbackValue;
        }
    }

    /**
     * Wickelt eine synchrone Funktion in Fehlerbehandlung ein.
     */
    wrapSync<T>(
        fn: () => T,
        context: ErrorContext,
        fallbackValue?: T
    ): T | undefined {
        try {
            return fn();
        } catch (error) {
            this.handle(error, context);
            return fallbackValue;
        }
    }

    /**
     * Gibt die letzten N Fehler zurueck (fuer Debugging).
     */
    getRecentErrors(count: number = 10): typeof this.errorLog {
        return this.errorLog.slice(-count);
    }

    /**
     * Fehler-Log leeren.
     */
    clearLog(): void {
        this.errorLog = [];
    }

    // --- Private Methoden ---

    private setupGlobalHandlers(): void {
        // Unbehandelte Promise-Rejections auffangen
        if (typeof window !== 'undefined') {
            window.addEventListener('unhandledrejection', (event) => {
                this.handle(event.reason, {
                    category: 'general',
                    severity: 'error',
                    userMessage: 'Ein unerwarteter Fehler ist aufgetreten.',
                });
                event.preventDefault();
            });
        }
    }

    private extractMessage(error: unknown): string {
        if (error instanceof Error) return error.message;
        if (typeof error === 'string') return error;
        return String(error);
    }

    private getDefaultUserMessage(category: ErrorCategory, technicalMessage: string): string {
        switch (category) {
            case 'import':
                return `Die Datei konnte nicht importiert werden: ${technicalMessage}`;
            case 'export':
                return `Der Export ist fehlgeschlagen: ${technicalMessage}`;
            case 'layout':
                return 'Das Layout konnte nicht berechnet werden. Das vorherige Layout wird beibehalten.';
            case 'render':
                return 'Ein Darstellungsfehler ist aufgetreten.';
            case 'worker':
                return `Die Hintergrundberechnung ist fehlgeschlagen: ${technicalMessage}`;
            case 'initialization':
                return 'Die Anwendung konnte nicht vollstaendig initialisiert werden.';
            case 'interaction':
                return 'Bei der Interaktion ist ein Fehler aufgetreten.';
            case 'llm_pipeline':
                return `Fehler bei der KI-Generierung: ${technicalMessage}`;
            case 'network':
                return `Netzwerkfehler: ${technicalMessage}`;
            default:
                return `Ein Fehler ist aufgetreten: ${technicalMessage}`;
        }
    }

    private getCategoryTitle(category: ErrorCategory): string {
        const titles: Record<ErrorCategory, string> = {
            import: 'Import-Fehler',
            export: 'Export-Fehler',
            layout: 'Layout-Fehler',
            render: 'Darstellungsfehler',
            worker: 'Worker-Fehler',
            initialization: 'Initialisierungsfehler',
            interaction: 'Interaktionsfehler',
            general: 'Fehler',
            llm_pipeline: 'KI-Pipeline Fehler',
            network: 'Netzwerk-Fehler',
        };
        return titles[category] || 'Fehler';
    }

    private severityToNotificationType(severity: ErrorSeverity): NotificationType {
        switch (severity) {
            case 'fatal': return 'error';
            case 'error': return 'error';
            case 'warning': return 'warning';
            case 'info': return 'info';
        }
    }

    private logError(category: ErrorCategory, message: string): void {
        this.errorLog.push({
            timestamp: Date.now(),
            category,
            message,
        });

        // Log-Groesse begrenzen
        if (this.errorLog.length > this.MAX_LOG_SIZE) {
            this.errorLog = this.errorLog.slice(-this.MAX_LOG_SIZE);
        }
    }
}

/**
 * Globale Convenience-Variable fuer Fehlerbehandlung.
 * Verwendung: errorHandler.handle(error, { category: 'import' })
 */
export const errorHandler = ErrorHandler.getInstance();
