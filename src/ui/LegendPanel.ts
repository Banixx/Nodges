import { VisualMappings, VisualMapping } from '../types';
import { IStateManager } from '../core/interfaces';

export class LegendPanel {
    private container: HTMLElement;
    private stateManager: IStateManager;
    private mappings: VisualMappings | null = null;

    constructor(elementId: string, stateManager: IStateManager) {
        const el = document.getElementById(elementId);
        if (!el) {
            console.warn(`Element ${elementId} not found for LegendPanel`);
            this.container = document.createElement('div');
        } else {
            this.container = el;
        }
        this.stateManager = stateManager;

        // Subscribe to state changes to update mappings and re-render if data changes
        this.stateManager.subscribe((state) => {
            let needsRender = false;
            if (state.visualMappings !== this.mappings) {
                this.mappings = state.visualMappings;
                needsRender = true;
            }
            
            // Re-render if graph data changed (to update used types)
            // Note: We could check for deep equality but usually StateManager 
            // replaces the object on data change anyway.
            needsRender = true; // For now, keep it simple and reactive

            if (needsRender) {
                this.render();
            }
        }, 'legend_panel');
    }

    public updateMappings(mappings: VisualMappings) {
        this.mappings = mappings;
        this.render();
    }

    private render() {
        if (!this.mappings || !this.mappings.defaultPresets) {
            this.container.innerHTML = '<div class="loading-text">Keine Legende verfügbar.</div>';
            return;
        }

        this.container.innerHTML = '';
        
        const mainTitle = document.createElement('h4');
        mainTitle.textContent = 'Legende';
        mainTitle.className = 'section-header';
        mainTitle.style.marginTop = '15px';
        this.container.appendChild(mainTitle);

        // Nodes Section
        const nodesSection = this.createSection('Knoten (Nodes)');
        this.populateSection(nodesSection, 'node');
        this.container.appendChild(nodesSection);

        // Edges Section
        const edgesSection = this.createSection('Kanten (Edges)');
        this.populateSection(edgesSection, 'edge');
        this.container.appendChild(edgesSection);
    }

    private createSection(titleText: string): HTMLElement {
        const section = document.createElement('section');
        section.className = 'panel-section';
        section.style.marginBottom = '20px';

        const title = document.createElement('h4');
        title.className = 'section-header';
        title.textContent = titleText;
        section.appendChild(title);

        return section;
    }

    private populateSection(section: HTMLElement, baseType: 'node' | 'edge') {
        if (!this.mappings) return;

        const state = this.stateManager.state;
        const presets = this.mappings.defaultPresets;
        
        // Find types that are actually used in the current graph data
        const usedTypes = new Set<string>();
        if (baseType === 'node') {
            state.graphData.entities.forEach(e => usedTypes.add(e.type));
        } else {
            state.graphData.relationships.forEach(r => usedTypes.add(r.type));
        }

        // Also include types defined in presets even if not currently in data (optional, but good for "initial overview")
        const presetTypes = Object.keys(presets).filter(type => {
            const preset = presets[type];
            // If it's already in usedTypes, we keep it
            if (usedTypes.has(type)) return true;
            
            // Heuristic fallback if data is empty
            if (baseType === 'node') {
                return 'size' in preset || 'geometry' in preset || 'shape' in preset;
            } else {
                return 'thickness' in preset || 'curvature' in preset || 'source' in preset; // relationships usually have source/target but presets don't
            }
        });

        // Combine both
        const allRelevantTypes = Array.from(new Set([...Array.from(usedTypes), ...presetTypes])).filter(type => {
            // Final check: does it have a preset?
            return !!presets[type];
        });

        if (allRelevantTypes.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'info-row';
            empty.innerHTML = '<span class="info-label">Keine Daten</span>';
            section.appendChild(empty);
            return;
        }

        allRelevantTypes.forEach(type => {
            const typeGroup = document.createElement('div');
            typeGroup.className = 'legend-type-group';
            typeGroup.style.marginBottom = '15px';
            typeGroup.style.padding = '8px';
            typeGroup.style.backgroundColor = 'rgba(255,255,255,0.03)';
            typeGroup.style.borderRadius = '4px';

            const typeTitle = document.createElement('div');
            typeTitle.style.fontWeight = 'bold';
            typeTitle.style.color = 'var(--accent-color)';
            typeTitle.style.marginBottom = '8px';
            typeTitle.style.fontSize = '0.9em';
            typeTitle.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            typeTitle.style.paddingBottom = '4px';
            typeTitle.textContent = type.toUpperCase();
            typeGroup.appendChild(typeTitle);

            const preset = presets[type];
            
            // Render specific mappings
            Object.entries(preset).forEach(([prop, mapping]) => {
                if (['attraction', 'repulsion', 'inertia'].includes(prop)) return;
                if (typeof mapping === 'object' && mapping !== null && 'source' in mapping) {
                    const row = this.createLegendRow(prop, mapping as VisualMapping, type, baseType);
                    typeGroup.appendChild(row);
                }
            });

            section.appendChild(typeGroup);
        });
    }

    private createLegendRow(prop: string, mapping: VisualMapping, type: string, baseType: 'node' | 'edge'): HTMLElement {
        const row = document.createElement('div');
        row.className = 'info-row';
        row.style.fontSize = '0.85em';
        row.style.padding = '4px 0';
        row.style.alignItems = 'flex-start';

        const label = document.createElement('span');
        label.className = 'info-label';
        label.style.width = '80px';
        label.style.minWidth = '80px';
        label.textContent = this.translateProp(prop) + ':';
        
        const value = document.createElement('span');
        value.className = 'info-value';
        value.style.flex = '1';
        value.style.textAlign = 'left';
        
        if (mapping.source === 'constant') {
            const desc = document.createElement('span');
            desc.textContent = 'Konstant';
            value.appendChild(desc);
            
            if (prop === 'color' && mapping.params?.color) {
                const swatch = this.createSwatch(mapping.params.color);
                value.prepend(swatch);
            }
        } else if (mapping.function === 'categorical' && mapping.params) {
            // Show categories
            const container = document.createElement('div');
            container.innerHTML = `<div style="margin-bottom: 4px; color: var(--text-muted);">Basiert auf <i>${mapping.source}</i>:</div>`;
            
            const grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = '1fr';
            grid.style.gap = '4px';
            grid.style.marginTop = '4px';
            grid.style.paddingLeft = '10px';

            // Special handling for swiss politics or generic "enrichment"
            let categories = Object.entries(mapping.params);
            
            // Enrichment logic: check if these categories have associated numeric values in the data
            const enrichedCategories = categories.map(([cat, val]) => {
                let numericValue: number | null = null;
                let unit = '';
                
                // For swiss politics: find waehleranteil if mapping.source is label
                if (mapping.source === 'label' || mapping.source === 'id') {
                    const state = this.stateManager.state;
                    const entities = baseType === 'node' ? state.graphData.entities : state.graphData.relationships;
                    const entity = entities.find(e => e.type === type && (e.label === cat || e.id === cat));
                    
                    if (entity) {
                        // Look for typical numeric properties
                        if ('waehleranteil' in entity) {
                            numericValue = entity.waehleranteil as number;
                            unit = '%';
                        } else if ('value' in entity) {
                            numericValue = entity.value as number;
                        }
                    }
                }
                
                return { cat, val, numericValue, unit };
            });

            // Sorting logic: if enriched with numeric values, sort descending
            if (enrichedCategories.some(c => c.numericValue !== null)) {
                enrichedCategories.sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0));
            }

            enrichedCategories.forEach(({ cat, val, numericValue, unit }) => {
                const item = document.createElement('div');
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.fontSize = '0.9em';

                if (prop === 'color') {
                    item.appendChild(this.createSwatch(val as string));
                }
                
                const catLabel = document.createElement('span');
                if (numericValue !== null) {
                    catLabel.innerHTML = `${cat}: <b>${numericValue}${unit}</b>`;
                } else {
                    catLabel.textContent = cat;
                }
                item.appendChild(catLabel);
                grid.appendChild(item);
            });
            container.appendChild(grid);
            value.appendChild(container);
        } else {
            let mappingDesc = `Basiert auf <i>${mapping.source}</i> (${mapping.function})`;
            
            if (prop === 'color') {
                const indicator = document.createElement('div');
                indicator.className = 'legend-color-indicator';
                if (mapping.function === 'heatmap') {
                    indicator.style.background = 'linear-gradient(to right, blue, cyan, green, yellow, red)';
                } else if (mapping.function === 'bipolar') {
                    const pos = mapping.params?.positive || '#ff0000';
                    const neg = mapping.params?.negative || '#0000ff';
                    indicator.style.background = `linear-gradient(to right, ${neg}, #ffffff, ${pos})`;
                }
                value.appendChild(indicator);
            }

            const textSpan = document.createElement('span');
            textSpan.innerHTML = mappingDesc;
            value.appendChild(textSpan);
        }

        row.appendChild(label);
        row.appendChild(value);
        return row;
    }

    private createSwatch(color: string): HTMLElement {
        const swatch = document.createElement('div');
        swatch.className = 'legend-color-indicator';
        swatch.style.backgroundColor = color;
        return swatch;
    }

    private translateProp(prop: string): string {
        const translations: { [key: string]: string } = {
            'size': 'Größe',
            'color': 'Farbe',
            'geometry': 'Form',
            'thickness': 'Dicke',
            'curvature': 'Krümmung',
            'opacity': 'Transparenz',
            'glow': 'Leuchten',
            'animation': 'Animation'
        };
        return translations[prop] || prop;
    }
}
