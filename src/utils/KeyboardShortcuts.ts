/**
 * KeyboardShortcuts - Displays and manages keyboard shortcuts
 * Shows help overlay with all available shortcuts
 */

interface ShortcutMap {
    [category: string]: {
        [key: string]: string;
    }
}

export class KeyboardShortcuts {
    private shortcuts: ShortcutMap;
    private helpOverlay: HTMLDivElement | null;
    private isVisible: boolean;

    constructor() {
        this.shortcuts = {
            'Selection': {
                'Strg + Click': 'Mehrfachauswahl (Multi-Select)',
                'Shift + Drag': 'Box-Auswahl (Bereich auswaehlen)',
                'Strg + A': 'Alle auswaehlen',
                'Escape': 'Auswahl aufheben',
                'Delete': 'Ausgewaehlte Objekte loeschen'
            },
            'Navigation': {
                'Linke Maustaste + Ziehen': 'Kamera rotieren',
                'Rechte Maustaste + Ziehen': 'Kamera schwenken',
                'Mausrad': 'Zoom'
            },
            'General': {
                'F1': 'Diese Hilfe anzeigen',
                'Strg + Z': 'Rueckgaengig (Batch-Operationen)',
                'Strg + S': 'Netzwerk exportieren (geplant)',
                'Strg + O': 'Datei importieren (geplant)'
            }
        };

        this.helpOverlay = null;
        this.isVisible = false;

        this.setupEventListeners();
    }

    /**
     * Setup keyboard event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.toggleHelp();
            }
        });
    }

    /**
     * Toggle help overlay
     */
    toggleHelp() {
        if (this.isVisible) {
            this.hideHelp();
        } else {
            this.showHelp();
        }
    }

    /**
     * Show help overlay
     */
    showHelp() {
        if (this.helpOverlay) {
            this.hideHelp();
        }

        this.helpOverlay = document.createElement('div');
        this.helpOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: 'Courier New', monospace;
        `;

        const helpContent = document.createElement('div');
        helpContent.style.cssText = `
            background: rgba(20, 20, 20, 0.95);
            padding: 30px;
            border-radius: 10px;
            border: 2px solid #00ff00;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        `;

        let html = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #00ff00; margin: 0; font-size: 24px;">Keyboard Shortcuts</h2>
                <p style="margin: 5px 0; opacity: 0.8;">Nodges 0.88 - Multi-Select & Batch Operations</p>
            </div>
        `;

        Object.entries(this.shortcuts).forEach(([category, shortcuts]) => {
            html += `
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #ffff00; margin: 0 0 10px 0; font-size: 18px; border-bottom: 1px solid #333;">
                        ${category}
                    </h3>
                    <table style="width: 100%; border-collapse: collapse;">
            `;

            Object.entries(shortcuts).forEach(([key, description]) => {
                html += `
                    <tr>
                        <td style="padding: 5px 15px 5px 0; color: #00ff00; font-weight: bold; white-space: nowrap;">
                            ${key}
                        </td>
                        <td style="padding: 5px 0; color: #ffffff;">
                            ${description}
                        </td>
                    </tr>
                `;
            });

            html += `
                    </table>
                </div>
            `;
        });

        html += `
            <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #333;">
                <p style="margin: 0; opacity: 0.6; font-size: 14px;">
                    Druecke F1 oder klicke irgendwo, um diese Hilfe zu schliessen
                </p>
            </div>
        `;

        helpContent.innerHTML = html;
        this.helpOverlay.appendChild(helpContent);
        if (document.body) {
            document.body.appendChild(this.helpOverlay);
        }

        // Close on click
        this.helpOverlay.addEventListener('click', () => this.hideHelp());

        this.isVisible = true;
    }

    /**
     * Hide help overlay
     */
    hideHelp() {
        if (this.helpOverlay && this.helpOverlay.parentNode) {
            this.helpOverlay.parentNode.removeChild(this.helpOverlay);
            this.helpOverlay = null;
        }
        this.isVisible = false;
    }

    /**
     * Add custom shortcut
     */
    addShortcut(category: string, key: string, description: string) {
        if (!this.shortcuts[category]) {
            this.shortcuts[category] = {};
        }
        this.shortcuts[category][key] = description;
    }

    /**
     * Remove shortcut
     */
    removeShortcut(category: string, key: string) {
        if (this.shortcuts[category] && this.shortcuts[category][key]) {
            delete this.shortcuts[category][key];
        }
    }

    /**
     * Get all shortcuts
     */
    getAllShortcuts(): ShortcutMap {
        return this.shortcuts;
    }
}
