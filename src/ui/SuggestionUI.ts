import { DataModel, VisualMappings } from '../types';
import { PanelUtils } from '../utils/PanelUtils';

export class SuggestionUI {
    private container: HTMLElement;
    private onApplyMapping: ((mapping: VisualMappings) => void) | null = null;
    private onPreviewMapping: ((mapping: VisualMappings | null) => void) | null = null;

    private originalMappings: VisualMappings | null = null;
    private dataModel: DataModel | null = null;

    constructor(containerId: string) {
        let el = document.getElementById(containerId);
        if (!el) {
            el = document.createElement('div');
            el.id = containerId;
            el.className = 'glass-panel';
            el.style.cssText = `
                position: absolute;
                bottom: 20px;
                right: 350px;
                width: 300px;
                max-height: 400px;
                display: flex;
                flex-direction: column;
                z-index: 9999;
                display: none;
                background: var(--panel-bg);
                backdrop-filter: var(--glass-blur);
                -webkit-backdrop-filter: var(--glass-blur);
                border: var(--panel-border);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-md);
            `;
            document.body.appendChild(el);
        }
        this.container = el;

        this.container.innerHTML = `
            <div class="mapping-header" style="cursor: grab; display: flex; justify-content: space-between; align-items: center;">
                <span>Suggestion Mappings</span>
                <div class="panel-toggle" style="cursor: pointer; color: var(--text-muted); font-size: 12px; padding: 2px 6px;">▼</div>
            </div>
            <div class="panel-content" style="padding: 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
            </div>
        `;

        const header = this.container.querySelector('.mapping-header') as HTMLElement;
        const toggle = this.container.querySelector('.panel-toggle') as HTMLElement;
        const content = this.container.querySelector('.panel-content') as HTMLElement;

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (content.style.display === 'none') {
                content.style.display = 'flex';
                toggle.textContent = '▼';
            } else {
                content.style.display = 'none';
                toggle.textContent = '▲';
            }
        });

        PanelUtils.makeDraggableAndResizable(this.container, header, { minWidth: 250, minHeight: 100 });
    }

    public bind(
        dataModel: DataModel | null,
        originalMappings: VisualMappings | null,
        onApply: (mapping: VisualMappings) => void,
        onPreview: (mapping: VisualMappings | null) => void
    ) {
        this.dataModel = dataModel;
        this.originalMappings = originalMappings;
        this.onApplyMapping = onApply;
        this.onPreviewMapping = onPreview;

        this.renderSuggestions();
        this.container.style.display = 'flex'; // Show panel when data is bound
    }

    private renderSuggestions() {
        const content = this.container.querySelector('.panel-content') as HTMLElement;
        content.innerHTML = '';

        const suggestions: { label: string, desc: string, mapping: VisualMappings, isOriginal?: boolean }[] = [];

        // 1. Original Mappings from file
        if (this.originalMappings && Object.keys(this.originalMappings.defaultPresets || {}).length > 0) {
            suggestions.push({
                label: 'Mapping aus Vorlage',
                desc: 'Die in der geladenen Datei definierten Visualisierungen.',
                mapping: this.originalMappings,
                isOriginal: true
            });
        }

        // 2. Auto-generated suggestions based on DataModel
        if (this.dataModel) {
            // Check for categorical property to color by
            let categoricalProp = '';
            let entityType = 'global_node';
            
            if (this.dataModel.properties) {
                for (const [propName, propDef] of Object.entries(this.dataModel.properties)) {
                    const pDef = propDef as any;
                    if (pDef && pDef.type === 'categorical') {
                        categoricalProp = propName;
                        break;
                    }
                }
            }

            if (categoricalProp) {
                const autoMap: VisualMappings = {
                    defaultPresets: {
                        [entityType]: {
                            color: { source: 'categorical', function: 'categorical', field: categoricalProp, palette: 'category10' },
                            size: { source: 'constant', function: 'constant', value: 1.5 }
                        }
                    }
                };
                suggestions.push({
                    label: `Farbe nach ${categoricalProp}`,
                    desc: `Gruppiert die Knoten farblich nach dem Attribut "${categoricalProp}".`,
                    mapping: autoMap
                });
            }

            // Continuous property
            let continuousProp = '';
            if (this.dataModel.properties) {
                for (const [propName, propDef] of Object.entries(this.dataModel.properties)) {
                    const pDef = propDef as any;
                    if (pDef && pDef.type === 'continuous') {
                        continuousProp = propName;
                        break;
                    }
                }
            }

            if (continuousProp) {
                const autoMap: VisualMappings = {
                    defaultPresets: {
                        [entityType]: {
                            size: { source: 'continuous', function: 'linear', field: continuousProp, range: [0.5, 3.0] },
                            color: { source: 'continuous', function: 'heatmap', field: continuousProp, palette: 'viridis' }
                        }
                    }
                };
                suggestions.push({
                    label: `Größe/Farbe nach ${continuousProp}`,
                    desc: `Skaliert und färbt Knoten nach dem Wert "${continuousProp}".`,
                    mapping: autoMap
                });
            }
        }

        // 3. Fallback/Default suggestion
        const defaultMap: VisualMappings = {
            defaultPresets: {
                'global_node': {
                    color: { source: 'constant', function: 'constant', params: { color: '#00aaff' } },
                    size: { source: 'constant', function: 'constant', value: 1.0 }
                },
                'global_edge': {
                    color: { source: 'constant', function: 'constant', params: { color: '#ffffff' } },
                    thickness: { source: 'constant', function: 'constant', value: 0.2 }
                }
            }
        };
        suggestions.push({
            label: 'Standard-Ansicht',
            desc: 'Neutrale blaue Knoten und weiße Kanten.',
            mapping: defaultMap
        });

        // Render them
        const cards: HTMLElement[] = [];

        const setActiveCard = (activeLabel: string) => {
            cards.forEach(c => {
                const isActive = c.dataset.label === activeLabel;
                if (isActive) {
                    c.style.borderWidth = '2px';
                    c.style.borderColor = 'var(--accent-color)';
                    c.style.boxShadow = '0 0 8px rgba(160, 128, 96, 0.4)';
                } else {
                    c.style.borderWidth = '1px';
                    c.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    c.style.boxShadow = 'none';
                }
            });
        };

        suggestions.forEach(s => {
            const card = document.createElement('div');
            card.dataset.label = s.label;
            card.style.cssText = `
                box-sizing: border-box;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                padding: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            `;

            let cardHtml = `
                <div style="font-weight: bold; font-size: 12px; color: #fff;">${s.label}</div>
                <div style="font-size: 10px; color: #aaa; margin-top: 4px;">${s.desc}</div>
            `;
            if (s.isOriginal) {
                cardHtml += `
                <button class="takeover-btn" style="margin-top: 8px; width: 100%; background: var(--accent-color); color: #fff; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;">
                    Mapping aus Vorlage übernehmen
                </button>`;
            }
            card.innerHTML = cardHtml;

            // Hover -> Preview
            card.addEventListener('mouseenter', () => {
                if (card.style.borderWidth !== '2px') {
                    card.style.background = 'rgba(255, 255, 255, 0.1)';
                }
                if (this.onPreviewMapping) this.onPreviewMapping(s.mapping);
            });

            card.addEventListener('mouseleave', () => {
                if (card.style.borderWidth !== '2px') {
                    card.style.background = 'rgba(255, 255, 255, 0.05)';
                }
                if (this.onPreviewMapping) this.onPreviewMapping(null);
            });

            // Click -> Apply
            card.addEventListener('click', () => {
                if (this.onApplyMapping) this.onApplyMapping(s.mapping);
                
                setActiveCard(s.label);
                
                // Visual feedback
                const origBg = card.style.background;
                card.style.background = 'rgba(0, 255, 0, 0.3)';
                setTimeout(() => {
                    card.style.background = origBg;
                }, 300);
            });

            cards.push(card);
            content.appendChild(card);
        });

        // Set initial active card
        if (this.originalMappings && Object.keys(this.originalMappings.defaultPresets || {}).length > 0) {
            setActiveCard('Mapping aus Vorlage');
        } else {
            setActiveCard('Standard-Ansicht');
        }
    }
}
