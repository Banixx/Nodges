import {
    VisualMappings,
    VisualMapping,
    MappingFunction
} from '../types';

export class VisualMappingPanel {
    private container: HTMLElement;
    private mappings: VisualMappings | null = null;
    private onUpdate: ((mappings: VisualMappings) => void) | null = null;

    constructor(elementId: string) {
        const el = document.getElementById(elementId);
        if (!el) throw new Error(`Element ${elementId} not found`);
        this.container = el;
    }

    public bind(mappings: VisualMappings, onUpdate: (newMappings: VisualMappings) => void) {
        this.mappings = mappings;
        this.onUpdate = onUpdate;
        this.render();
    }

    private render() {
        if (!this.mappings || !this.mappings.defaultPresets) {
            this.container.innerHTML = '<div style="padding: 10px; color: #888;">No mappings loaded</div>';
            return;
        }

        this.container.innerHTML = '';

        Object.entries(this.mappings.defaultPresets).forEach(([type, preset]) => {
            const section = document.createElement('div');
            section.className = 'mapping-section';
            section.style.marginBottom = '20px';
            section.style.borderBottom = '1px solid #444';
            section.style.paddingBottom = '10px';

            const title = document.createElement('h4');
            title.textContent = `${type} Mappings`;
            title.style.margin = '0 0 10px 0';
            title.style.color = '#00aaff';
            section.appendChild(title);

            // Iterate through visual properties (size, color, etc.)
            Object.entries(preset).forEach(([prop, mapping]) => {
                // Check if mapping is a valid object (VisualMapping)
                if (typeof mapping === 'object' && mapping !== null && 'source' in mapping) {
                    const row = this.createMappingRow(type, prop, mapping as VisualMapping);
                    section.appendChild(row);
                }
            });

            this.container.appendChild(section);
        });
    }

    private createMappingRow(type: string, prop: string, mapping: VisualMapping): HTMLElement {
        const row = document.createElement('div');
        row.className = 'mapping-row';
        row.style.display = 'flex';
        row.style.flexDirection = 'column';
        row.style.marginBottom = '12px';
        row.style.backgroundColor = 'rgba(255,255,255,0.05)';
        row.style.padding = '8px';
        row.style.borderRadius = '4px';

        // Header: Property Name
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.marginBottom = '6px';

        const label = document.createElement('span');
        label.textContent = prop.charAt(0).toUpperCase() + prop.slice(1);
        label.style.fontWeight = 'bold';
        header.appendChild(label);

        row.appendChild(header);

        // Inputs Container
        const inputs = document.createElement('div');
        inputs.style.display = 'grid';
        inputs.style.gridTemplateColumns = '1fr 1fr';
        inputs.style.gap = '8px';

        // Source Input
        const sourceGroup = document.createElement('div');
        const sourceLabel = document.createElement('label');
        sourceLabel.textContent = 'Source Field';
        sourceLabel.style.fontSize = '0.8em';
        sourceLabel.style.color = '#aaa';
        const sourceInput = document.createElement('input');
        sourceInput.type = 'text';
        sourceInput.value = mapping.source;
        sourceInput.style.width = '100%';
        sourceInput.style.backgroundColor = '#222';
        sourceInput.style.border = '1px solid #444';
        sourceInput.style.color = '#eee';
        sourceInput.style.padding = '4px';

        sourceInput.onchange = (e) => {
            const val = (e.target as HTMLInputElement).value;
            this.updateMapping(type, prop, { source: val });
        };
        sourceGroup.appendChild(sourceLabel);
        sourceGroup.appendChild(sourceInput);
        inputs.appendChild(sourceGroup);

        // Function Select
        const funcGroup = document.createElement('div');
        const funcLabel = document.createElement('label');
        funcLabel.textContent = 'Function';
        funcLabel.style.fontSize = '0.8em';
        funcLabel.style.color = '#aaa';
        const funcSelect = document.createElement('select');
        funcSelect.style.width = '100%';
        funcSelect.style.backgroundColor = '#222';
        funcSelect.style.border = '1px solid #444';
        funcSelect.style.color = '#eee';
        funcSelect.style.padding = '4px';

        const functions: MappingFunction[] = ['linear', 'exponential', 'logarithmic', 'heatmap', 'bipolar', 'pulse', 'sphereComplexity'];
        functions.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f;
            opt.textContent = f;
            opt.selected = mapping.function === f;
            funcSelect.appendChild(opt);
        });

        funcSelect.onchange = (e) => {
            const val = (e.target as HTMLSelectElement).value as MappingFunction;
            this.updateMapping(type, prop, { function: val });
        };
        funcGroup.appendChild(funcLabel);
        funcGroup.appendChild(funcSelect);
        inputs.appendChild(funcGroup);

        // Range inputs (Min/Max) if applicable
        if (mapping.range || ['linear', 'exponential', 'logarithmic'].includes(mapping.function)) {
            const rangeGroup = document.createElement('div');
            rangeGroup.style.gridColumn = '1 / -1';
            rangeGroup.style.display = 'flex';
            rangeGroup.style.gap = '8px';
            rangeGroup.style.marginTop = '4px';

            const minInput = document.createElement('input');
            minInput.type = 'number';
            minInput.placeholder = 'Min';
            minInput.value = mapping.range ? String(mapping.range[0]) : '0';
            minInput.style.width = '50%';
            minInput.style.backgroundColor = '#222';
            minInput.style.border = '1px solid #444';
            minInput.style.color = '#eee';

            const maxInput = document.createElement('input');
            maxInput.type = 'number';
            maxInput.placeholder = 'Max';
            maxInput.value = mapping.range ? String(mapping.range[1]) : '1';
            maxInput.style.width = '50%';
            maxInput.style.backgroundColor = '#222';
            maxInput.style.border = '1px solid #444';
            maxInput.style.color = '#eee';

            const updateRange = () => {
                const min = parseFloat(minInput.value);
                const max = parseFloat(maxInput.value);
                if (!isNaN(min) && !isNaN(max)) {
                    this.updateMapping(type, prop, { range: [min, max] });
                }
            };

            minInput.onchange = updateRange;
            maxInput.onchange = updateRange;

            rangeGroup.appendChild(minInput);
            rangeGroup.appendChild(maxInput);
            inputs.appendChild(rangeGroup);
        }

        row.appendChild(inputs);
        return row;
    }

    private updateMapping(type: string, prop: string, updates: Partial<VisualMapping>) {
        if (!this.mappings || !this.mappings.defaultPresets[type]) return;

        const preset = this.mappings.defaultPresets[type] as any;
        if (!preset[prop]) return; // Should not happen

        // Merge updates
        preset[prop] = { ...preset[prop], ...updates };

        // Notify
        if (this.onUpdate) {
            this.onUpdate(this.mappings);
        }
    }
}
