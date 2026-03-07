/**
 * NotificationService - Zentraler Benachrichtigungsdienst fuer Nodges
 *
 * Ersetzt verstreute console.error()-Aufrufe durch sichtbare UI-Benachrichtigungen.
 * Singleton-Pattern fuer globalen Zugriff.
 *
 * Phase 7: Fehlerbehandlung und Cleanup
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
    /** Anzeigedauer in ms (Standard: 5000) */
    duration?: number;
    /** Ob die Benachrichtigung auch in der Konsole geloggt werden soll */
    logToConsole?: boolean;
    /** Zusaetzliche technische Details (nur in Konsole) */
    details?: unknown;
}

/** Einzelne Notification-Instanz */
interface ActiveNotification {
    element: HTMLElement;
    timeoutId: ReturnType<typeof setTimeout>;
}

export class NotificationService {
    private static instance: NotificationService | null = null;
    private activeNotifications: ActiveNotification[] = [];
    private container: HTMLElement | null = null;
    private stylesInjected = false;

    /** Maximale Anzahl gleichzeitiger Benachrichtigungen */
    private readonly MAX_NOTIFICATIONS = 5;
    /** Standard-Anzeigedauer in ms */
    private readonly DEFAULT_DURATION = 5000;

    private constructor() {
        // Singleton
    }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    /**
     * Zeigt eine Benachrichtigung an.
     */
    show(title: string, message: string, type: NotificationType = 'info', options: NotificationOptions = {}): void {
        const duration = options.duration ?? this.DEFAULT_DURATION;
        const logToConsole = options.logToConsole ?? true;

        // Konsolen-Logging
        if (logToConsole) {
            const logFn = type === 'error' ? console.error
                : type === 'warning' ? console.warn
                    : console.log;
            logFn(`[Nodges ${type.toUpperCase()}] ${title}: ${message}`);
            if (options.details) {
                logFn('[Nodges Details]', options.details);
            }
        }

        // In Umgebungen ohne DOM (Tests, Worker) nur loggen
        if (typeof document === 'undefined') return;

        // UI-Container und Styles erstellen (lazy)
        this.ensureContainer();
        this.ensureStyles();

        // Aelteste Benachrichtigung entfernen falls Maximum erreicht
        while (this.activeNotifications.length >= this.MAX_NOTIFICATIONS) {
            this.dismissNotification(this.activeNotifications[0]);
        }

        // Notification-Element erstellen
        const notification = this.createNotificationElement(title, message, type);
        this.container!.appendChild(notification);

        // Auto-Dismiss nach Dauer
        const timeoutId = setTimeout(() => {
            this.animateOut(notification, () => {
                this.removeFromActive(notification);
            });
        }, duration);

        // Klick zum Schliessen
        notification.addEventListener('click', () => {
            clearTimeout(timeoutId);
            this.animateOut(notification, () => {
                this.removeFromActive(notification);
            });
        });

        this.activeNotifications.push({ element: notification, timeoutId });
    }

    // --- Convenience-Methoden ---

    success(title: string, message: string, options?: NotificationOptions): void {
        this.show(title, message, 'success', options);
    }

    error(title: string, message: string, options?: NotificationOptions): void {
        this.show(title, message, 'error', { duration: 8000, ...options });
    }

    warning(title: string, message: string, options?: NotificationOptions): void {
        this.show(title, message, 'warning', { duration: 6000, ...options });
    }

    info(title: string, message: string, options?: NotificationOptions): void {
        this.show(title, message, 'info', options);
    }

    /** Alle aktiven Benachrichtigungen entfernen */
    clearAll(): void {
        for (const n of [...this.activeNotifications]) {
            clearTimeout(n.timeoutId);
            if (n.element.parentNode) {
                n.element.parentNode.removeChild(n.element);
            }
        }
        this.activeNotifications = [];
    }

    // --- Private Methoden ---

    private ensureContainer(): void {
        if (this.container && document.body.contains(this.container)) return;

        this.container = document.createElement('div');
        this.container.id = 'nodges-notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 10001;
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-width: 420px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    private ensureStyles(): void {
        if (this.stylesInjected) return;
        if (document.getElementById('nodges-notification-styles')) {
            this.stylesInjected = true;
            return;
        }

        const style = document.createElement('style');
        style.id = 'nodges-notification-styles';
        style.textContent = `
            @keyframes nodges-slide-in {
                from { transform: translateX(120%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes nodges-slide-out {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(120%); opacity: 0; }
            }
            .nodges-notification {
                pointer-events: auto;
                cursor: pointer;
                padding: 14px 18px;
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
                font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
                animation: nodges-slide-in 0.3s ease forwards;
                backdrop-filter: blur(8px);
                border-left: 4px solid transparent;
                transition: transform 0.15s ease;
            }
            .nodges-notification:hover {
                transform: scale(1.02);
            }
            .nodges-notification--success {
                background: rgba(46, 125, 50, 0.92);
                border-left-color: #66bb6a;
            }
            .nodges-notification--error {
                background: rgba(198, 40, 40, 0.92);
                border-left-color: #ef5350;
            }
            .nodges-notification--warning {
                background: rgba(230, 150, 0, 0.92);
                border-left-color: #ffa726;
                color: #1a1a1a;
            }
            .nodges-notification--info {
                background: rgba(30, 90, 160, 0.92);
                border-left-color: #42a5f5;
            }
            .nodges-notification__title {
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 4px;
                color: white;
            }
            .nodges-notification--warning .nodges-notification__title {
                color: #1a1a1a;
            }
            .nodges-notification__message {
                font-size: 13px;
                line-height: 1.4;
                opacity: 0.9;
                color: white;
            }
            .nodges-notification--warning .nodges-notification__message {
                color: #333;
            }
        `;
        document.head.appendChild(style);
        this.stylesInjected = true;
    }

    private createNotificationElement(title: string, message: string, type: NotificationType): HTMLElement {
        const el = document.createElement('div');
        el.className = `nodges-notification nodges-notification--${type}`;

        const titleEl = document.createElement('div');
        titleEl.className = 'nodges-notification__title';
        titleEl.textContent = title;

        const messageEl = document.createElement('div');
        messageEl.className = 'nodges-notification__message';
        messageEl.textContent = message;

        el.appendChild(titleEl);
        el.appendChild(messageEl);

        return el;
    }

    private animateOut(element: HTMLElement, onComplete: () => void): void {
        element.style.animation = 'nodges-slide-out 0.3s ease forwards';
        setTimeout(onComplete, 300);
    }

    private dismissNotification(notification: ActiveNotification): void {
        clearTimeout(notification.timeoutId);
        if (notification.element.parentNode) {
            notification.element.parentNode.removeChild(notification.element);
        }
        this.removeFromActive(notification.element);
    }

    private removeFromActive(element: HTMLElement): void {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        this.activeNotifications = this.activeNotifications.filter(n => n.element !== element);
    }
}

/**
 * Globale Convenience-Funktion fuer schnellen Zugriff.
 * Verwendung: notify.error('Titel', 'Nachricht')
 */
export const notify = NotificationService.getInstance();
