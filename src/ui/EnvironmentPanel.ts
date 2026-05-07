import { IStateManager } from '../core/interfaces';

export class EnvironmentPanel {
    private container: HTMLElement;
    private stateManager: IStateManager;

    constructor(elementId: string, stateManager: IStateManager) {
        const el = document.getElementById(elementId);
        if (!el) throw new Error(`Element ${elementId} not found`);
        this.container = el;
        this.stateManager = stateManager;

        this.render();
    }

    private render() {
        this.container.innerHTML = '';

        const section = document.createElement('div');
        section.className = 'environment-section';
        section.style.padding = '10px';

        // Ambient Light Intensity
        const ambientRow = this.createSliderRow('Ambient Light', 'ambientLightIntensity', 0, 2, 0.1);
        section.appendChild(ambientRow);

        // Directional Light Intensity
        const directionalRow = this.createSliderRow('Directional Light', 'directionalLightIntensity', 0, 2, 0.1);
        section.appendChild(directionalRow);

        this.container.appendChild(section);
    }

    private createSliderRow(label: string, stateKey: string, min: number, max: number, step: number): HTMLElement {
        const row = document.createElement('div');
        row.style.marginBottom = '15px';

        const labelRow = document.createElement('div');
        labelRow.style.display = 'flex';
        labelRow.style.justifyContent = 'space-between';
        labelRow.style.marginBottom = '5px';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.fontSize = '12px';
        labelEl.style.fontWeight = 'bold';
        labelRow.appendChild(labelEl);

        const valueEl = document.createElement('span');
        valueEl.textContent = Number(this.stateManager.state[stateKey]).toFixed(1);
        valueEl.style.fontSize = '11px';
        valueEl.style.fontFamily = 'monospace';
        labelRow.appendChild(valueEl);

        row.appendChild(labelRow);

        const input = document.createElement('input');
        input.type = 'range';
        input.min = String(min);
        input.max = String(max);
        input.step = String(step);
        input.value = String(this.stateManager.state[stateKey]);
        input.style.width = '100%';

        input.oninput = (e) => {
            const val = parseFloat((e.target as HTMLInputElement).value);
            valueEl.textContent = val.toFixed(1);
            this.stateManager.update({ [stateKey]: val });
        };

        row.appendChild(input);
        return row;
    }
}
