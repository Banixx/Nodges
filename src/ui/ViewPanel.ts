/**
 * ViewPanel - UI component for the "Ansicht" (View) tab
 * Controls label visibility, color scheme selection, and other visual settings.
 */
import { IStateManager } from '../core/interfaces';
import type { State } from '../core/StateManager';

interface ColorScheme {
    id: string;
    name: string;
    bgColor: string;
    panelBg: string;
    accentColor: string;
    textColor?: string;
    textMuted?: string;
}

const COLOR_SCHEMES: ColorScheme[] = [
    {
        id: 'start-olive',
        name: 'Start Olive',
        bgColor: '#8fa649',
        panelBg: '#2a2a28',
        accentColor: '#a08060',
        textColor: '#f5f5f5',
        textMuted: '#9a9a9a'
    },
    {
        id: 'caramel-light',
        name: 'Light Caramel',
        bgColor: '#f5e6d3',
        panelBg: '#ffffff',
        accentColor: '#d2691e',
        textColor: '#2c2c2c',
        textMuted: '#666666'
    },
    {
        id: 'ocher-gold',
        name: 'Golden Ocher',
        bgColor: '#fdf5e6',
        panelBg: '#ffffff',
        accentColor: '#daa520',
        textColor: '#333333',
        textMuted: '#777777'
    },
    {
        id: 'aquamarine-soft',
        name: 'Soft Aquamarine',
        bgColor: '#e0f7fa',
        panelBg: '#ffffff',
        accentColor: '#00838f',
        textColor: '#004d40',
        textMuted: '#00695c'
    },
    {
        id: 'modern-white',
        name: 'Ivory Clean',
        bgColor: '#faf9f6',
        panelBg: '#ffffff',
        accentColor: '#c2b280',
        textColor: '#1a1a1a',
        textMuted: '#888888'
    }
];

export class ViewPanel {
    private container: HTMLElement;
    private stateManager: IStateManager;

    constructor(containerId: string, stateManager: IStateManager) {
        const el = document.getElementById(containerId);
        if (!el) {
            console.warn(`[ViewPanel] Container '${containerId}' not found. Creating stub.`);
            this.container = document.createElement('div');
        } else {
            this.container = el;
        }
        this.stateManager = stateManager;

        this.render();

        // Subscribe to state changes to keep UI in sync
        this.stateManager.subscribe((state) => {
            this.updateUI(state);
            // Highlight the active swatch if the scheme changed from elsewhere
            this.updateActiveSwatch(state.activeColorScheme);
        }, 'view_panel');

        // Apply initial scheme based on state
        const initialScheme = COLOR_SCHEMES.find(s => s.id === this.stateManager.state.activeColorScheme) || COLOR_SCHEMES[0];
        this.applyColorScheme(initialScheme);
    }

    private render(): void {
        this.container.innerHTML = '';

        // --- LABELS SECTION ---
        const labelSection = document.createElement('section');
        labelSection.className = 'panel-section';

        const labelHeader = document.createElement('h4');
        labelHeader.className = 'section-header';
        labelHeader.textContent = 'Beschriftungen';
        labelSection.appendChild(labelHeader);

        // Checkbox: Show Labels Always
        const alwaysRow = this.createCheckboxRow(
            'Namen immer anzeigen',
            'showLabelsAlways',
            this.stateManager.state.showLabelsAlways
        );
        labelSection.appendChild(alwaysRow);

        // Checkbox: Show Labels on Hover
        const hoverRow = this.createCheckboxRow(
            'Namen bei Hover',
            'showLabelsOnHover',
            this.stateManager.state.showLabelsOnHover
        );
        labelSection.appendChild(hoverRow);

        this.container.appendChild(labelSection);

        // --- VISUAL BALANCE SECTION ---
        const balanceSection = document.createElement('section');
        balanceSection.className = 'panel-section';

        const balanceHeader = document.createElement('h4');
        balanceHeader.className = 'section-header';
        balanceHeader.textContent = 'Darstellungsgröße';
        balanceSection.appendChild(balanceHeader);

        // Slider: Visual Scale Exponent (Dämpfung)
        const dampeningRow = this.createSliderRow(
            'Werte-Dämpfung',
            'visualScaleExponent',
            this.stateManager.state.visualScaleExponent,
            0.1, 1.0, 0.05
        );
        balanceSection.appendChild(dampeningRow);

        // Slider: Visual Scale Multiplier (Globale Skalierung)
        const scaleRow = this.createSliderRow(
            'Globale Skalierung',
            'visualScaleMultiplier',
            this.stateManager.state.visualScaleMultiplier,
            0.1, 5.0, 0.1
        );
        balanceSection.appendChild(scaleRow);

        this.container.appendChild(balanceSection);

        // --- COLOR SCHEME SECTION ---
        const colorSection = document.createElement('section');
        colorSection.className = 'panel-section';

        const colorHeader = document.createElement('h4');
        colorHeader.className = 'section-header';
        colorHeader.textContent = 'Farbschema';
        colorSection.appendChild(colorHeader);

        const swatchGrid = document.createElement('div');
        swatchGrid.className = 'color-scheme-grid';
        swatchGrid.id = 'colorSchemeGrid';

        COLOR_SCHEMES.forEach(scheme => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = scheme.bgColor;
            swatch.title = scheme.name;
            swatch.dataset.schemeId = scheme.id;

            if (this.stateManager.state.activeColorScheme === scheme.id) {
                swatch.classList.add('active');
            }

            swatch.addEventListener('click', () => this.applyColorScheme(scheme));
            swatchGrid.appendChild(swatch);
        });

        colorSection.appendChild(swatchGrid);
        this.container.appendChild(colorSection);

    }

    private createCheckboxRow(label: string, stateKey: string, initialValue: boolean): HTMLElement {
        const row = document.createElement('label');
        row.className = 'checkbox-row';
        row.style.cursor = 'pointer';
        row.style.marginBottom = '8px';

        const labelSpan = document.createElement('span');
        labelSpan.textContent = label;
        labelSpan.style.fontSize = '12px';
        row.appendChild(labelSpan);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = initialValue;
        checkbox.id = `checkbox-${stateKey}`;

        checkbox.addEventListener('change', () => {
            this.stateManager.update({ [stateKey]: checkbox.checked });
        });

        row.appendChild(checkbox);
        return row;
    }

    private createSliderRow(label: string, stateKey: string, initialValue: number, min: number, max: number, step: number): HTMLElement {
        const row = document.createElement('div');
        row.className = 'slider-row';
        row.style.marginBottom = '12px';
        row.style.display = 'flex';
        row.style.flexDirection = 'column';
        row.style.gap = '4px';

        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.justifyContent = 'space-between';
        
        const labelSpan = document.createElement('span');
        labelSpan.textContent = label;
        labelSpan.style.fontSize = '12px';

        const valueSpan = document.createElement('span');
        valueSpan.textContent = initialValue.toFixed(2);
        valueSpan.style.fontSize = '12px';
        valueSpan.style.color = 'var(--text-muted)';
        
        headerDiv.appendChild(labelSpan);
        headerDiv.appendChild(valueSpan);
        row.appendChild(headerDiv);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min.toString();
        slider.max = max.toString();
        slider.step = step.toString();
        slider.value = initialValue.toString();
        slider.id = `slider-${stateKey}`;
        slider.style.width = '100%';

        slider.addEventListener('input', () => {
            const val = parseFloat(slider.value);
            valueSpan.textContent = val.toFixed(2);
            this.stateManager.update({ [stateKey]: val });
        });

        row.appendChild(slider);
        return row;
    }

    private applyColorScheme(scheme: ColorScheme): void {
        // Update CSS variables on root
        const root = document.documentElement;
        root.style.setProperty('--bg-color', scheme.bgColor);
        root.style.setProperty('--panel-bg-solid', scheme.panelBg);
        root.style.setProperty('--panel-bg', `rgba(${this.hexToRgb(scheme.panelBg)}, 0.95)`);
        root.style.setProperty('--accent-color', scheme.accentColor);

        // Optional text colors for light/dark mode support
        if (scheme.textColor) {
            root.style.setProperty('--text-color', scheme.textColor);
        }
        if (scheme.textMuted) {
            root.style.setProperty('--text-muted', scheme.textMuted);
        }

        // Also update the 3D scene background color via stateManager
        this.stateManager.update({
            activeColorScheme: scheme.id,
            backgroundColor: scheme.bgColor
        });

        // Update swatch active state
        this.updateActiveSwatch(scheme.id);
    }

    private updateActiveSwatch(schemeId: string): void {
        const grid = document.getElementById('colorSchemeGrid');
        if (grid) {
            grid.querySelectorAll('.color-swatch').forEach(sw => {
                sw.classList.remove('active');
                if ((sw as HTMLElement).dataset.schemeId === schemeId) {
                    sw.classList.add('active');
                }
            });
        }
    }

    private hexToRgb(hex: string): string {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
        }
        return '30, 30, 30';
    }

    private updateUI(state: State): void {
        // Sync checkboxes with state
        const alwaysCheck = document.getElementById('checkbox-showLabelsAlways') as HTMLInputElement;
        const hoverCheck = document.getElementById('checkbox-showLabelsOnHover') as HTMLInputElement;

        if (alwaysCheck && alwaysCheck.checked !== state.showLabelsAlways) {
            alwaysCheck.checked = state.showLabelsAlways;
        }
        if (hoverCheck && hoverCheck.checked !== state.showLabelsOnHover) {
            hoverCheck.checked = state.showLabelsOnHover;
        }

        // Sync sliders with state
        const dampeningSlider = document.getElementById('slider-visualScaleExponent') as HTMLInputElement;
        const scaleSlider = document.getElementById('slider-visualScaleMultiplier') as HTMLInputElement;

        if (dampeningSlider && parseFloat(dampeningSlider.value) !== state.visualScaleExponent) {
            dampeningSlider.value = state.visualScaleExponent.toString();
            const valueSpan = dampeningSlider.previousElementSibling?.querySelector('span:last-child');
            if (valueSpan) valueSpan.textContent = state.visualScaleExponent.toFixed(2);
        }
        if (scaleSlider && parseFloat(scaleSlider.value) !== state.visualScaleMultiplier) {
            scaleSlider.value = state.visualScaleMultiplier.toString();
            const valueSpan = scaleSlider.previousElementSibling?.querySelector('span:last-child');
            if (valueSpan) valueSpan.textContent = state.visualScaleMultiplier.toFixed(2);
        }
    }
}
