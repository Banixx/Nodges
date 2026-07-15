/**
 * ViewPanel - UI component for the "Ansicht" (View) tab
 * test
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
            this.updateActiveSwatch(state.activeColorScheme);
        }, 'ui');


        // Apply initial scheme based on state
        const initialScheme = COLOR_SCHEMES.find(s => s.id === this.stateManager.state.activeColorScheme) || COLOR_SCHEMES[0];
        this.applyColorScheme(initialScheme);

        // Update attribute list when data changes
        this.stateManager.subscribe((state) => {
            this.updateAvailableAttributes(state.graphData.entities);
        }, 'data_changed');
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
            'Label',
            'showLabelsAlways',
            this.stateManager.state.showLabelsAlways
        );
        labelSection.appendChild(alwaysRow);

        const linesRow = this.createSliderRow(
            'Detailgrad',
            'labelLines',
            this.stateManager.state.labelLines,
            1, 5, 1, 0
        );
        labelSection.appendChild(linesRow);

        // Checkbox: Show Labels on Hover
        const hoverRow = this.createCheckboxRow(
            'Namen bei Hover',
            'showLabelsOnHover',
            this.stateManager.state.showLabelsOnHover
        );
        labelSection.appendChild(hoverRow);

        // --- LABEL FILTER ---
        const filterHeader = document.createElement('h5');
        filterHeader.textContent = 'Label Filter (Datenbasiert)';
        filterHeader.style.fontSize = '12px';
        filterHeader.style.marginTop = '15px';
        filterHeader.style.marginBottom = '5px';
        filterHeader.style.color = 'var(--accent-color, #ac3838)';
        labelSection.appendChild(filterHeader);
        
        // Select for Attribute
        const attrSelectRow = this.createSelectRow(
            'Attribut',
            'labelFilterAttribute',
            this.stateManager.state.labelFilterAttribute,
            [{ value: '', label: '-- Keines --' }] // Populated by data_changed
        );
        labelSection.appendChild(attrSelectRow);

        // Select for Mode
        const modeSelectRow = this.createSelectRow(
            'Modus',
            'labelFilterMode',
            this.stateManager.state.labelFilterMode,
            [
                { value: 'visibility', label: 'Sichtbarkeit (Schwelle)' },
                { value: 'fade', label: 'Ausblenden (Fade)' },
                { value: 'size', label: 'Größe (Skalierung)' },
                { value: 'glow', label: 'Leuchten (Glow)' }
            ]
        );
        labelSection.appendChild(modeSelectRow);

        // Slider for Threshold
        const thresholdRow = this.createSliderRow(
            'Filter / Stärke',
            'labelFilterThreshold',
            this.stateManager.state.labelFilterThreshold,
            0, 1, 0.01, 2
        );
        labelSection.appendChild(thresholdRow);

        // Label Info Text (count)
        const labelCountInfo = document.createElement('div');
        labelCountInfo.id = 'labelCountInfo';
        labelCountInfo.style.fontSize = '11px';
        labelCountInfo.style.color = 'var(--text-muted)';
        labelCountInfo.style.marginTop = '5px';
        labelCountInfo.style.textAlign = 'right';
        labelCountInfo.textContent = `Sichtbar: ${this.stateManager.state.visibleLabelsCount} / ${this.stateManager.state.totalLabelsCount}`;
        labelSection.appendChild(labelCountInfo);

        this.container.appendChild(labelSection);

        // --- VISUAL BALANCE SECTION ---
        const balanceSection = document.createElement('section');
        balanceSection.className = 'panel-section';

        const balanceHeader = document.createElement('h4');
        balanceHeader.className = 'section-header';
        balanceHeader.textContent = 'Darstellungsgröße';
        balanceSection.appendChild(balanceHeader);

        // 1. Sliders first
        const dampeningRow = this.createSliderRow(
            'Werte-Dämpfung',
            'visualScaleExponent',
            this.stateManager.state.visualScaleExponent,
            0.1, 1.0, 0.05
        );
        balanceSection.appendChild(dampeningRow);

        const scaleRow = this.createSliderRow(
            'Globale Skalierung',
            'visualScaleMultiplier',
            this.stateManager.state.visualScaleMultiplier,
            0.1, 5.0, 0.1
        );
        balanceSection.appendChild(scaleRow);

        // Separator
        const separator = document.createElement('div');
        separator.style.height = '1px';
        separator.style.backgroundColor = 'rgba(255,255,255,0.1)';
        separator.style.margin = '15px 0 10px 0';
        balanceSection.appendChild(separator);

        // 2. Toggles
        const autoBalanceRow = this.createCheckboxRow(
            'Auto-Balancing beim Laden',
            'autoBalanceEnabled',
            this.stateManager.state.autoBalanceEnabled
        );
        balanceSection.appendChild(autoBalanceRow);

        const normalizeRow = this.createCheckboxRow(
            'Koordinaten normalisieren',
            'normalizeCoordinatesEnabled',
            this.stateManager.state.normalizeCoordinatesEnabled
        );
        balanceSection.appendChild(normalizeRow);

        // 3. Action Button
        const autoBalanceBtn = document.createElement('button');
        autoBalanceBtn.className = 'action-button primary'; // Use primary class if exists, or style it
        autoBalanceBtn.style.marginTop = '15px';
        autoBalanceBtn.style.width = '100%';
        autoBalanceBtn.style.padding = '8px';
        autoBalanceBtn.style.backgroundColor = 'var(--accent-color, #ac3838)';
        autoBalanceBtn.style.color = 'white';
        autoBalanceBtn.style.border = 'none';
        autoBalanceBtn.style.borderRadius = '4px';
        autoBalanceBtn.style.cursor = 'pointer';
        autoBalanceBtn.style.fontWeight = '600';
        autoBalanceBtn.style.transition = 'all 0.2s ease';
        autoBalanceBtn.textContent = 'Balance jetzt optimieren';

        autoBalanceBtn.onmouseenter = () => autoBalanceBtn.style.filter = 'brightness(1.2)';
        autoBalanceBtn.onmouseleave = () => autoBalanceBtn.style.filter = 'none';

        autoBalanceBtn.onclick = () => {
            if (window.app && window.app.applyVisualBalance) {
                window.app.applyVisualBalance();
            }
        };
        balanceSection.appendChild(autoBalanceBtn);


        this.container.appendChild(balanceSection);

        // --- CAMERA CONTROLS SECTION ---
        const cameraSection = document.createElement('section');
        cameraSection.className = 'panel-section';

        const cameraHeader = document.createElement('h4');
        cameraHeader.className = 'section-header';
        cameraHeader.textContent = 'Kamerasteuerung';
        cameraSection.appendChild(cameraHeader);

        const marginRow = this.createSliderRow(
            'Auto-Fit Randfaktor',
            'cameraFitMargin',
            this.stateManager.state.cameraFitMargin,
            1.0, 3.0, 0.1, 1
        );
        cameraSection.appendChild(marginRow);

        const durationRow = this.createSliderRow(
            'Animationsdauer (ms)',
            'cameraTransitionDuration',
            this.stateManager.state.cameraTransitionDuration,
            0, 5000, 100, 0
        );
        cameraSection.appendChild(durationRow);

        this.container.appendChild(cameraSection);

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
        checkbox.className = 'nodges-toggle';
        checkbox.checked = initialValue;
        checkbox.id = `checkbox-${stateKey}`;

        checkbox.addEventListener('change', () => {
            this.stateManager.update({ [stateKey]: checkbox.checked });
        });

        row.appendChild(checkbox);
        return row;
    }

    private createSelectRow(label: string, stateKey: string, initialValue: string, options: { value: string, label: string }[]): HTMLElement {
        const row = document.createElement('label');
        row.className = 'select-row';
        row.style.cursor = 'pointer';
        row.style.marginBottom = '8px';
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';

        const labelSpan = document.createElement('span');
        labelSpan.textContent = label;
        labelSpan.style.fontSize = '12px';
        row.appendChild(labelSpan);

        const select = document.createElement('select');
        select.id = `select-${stateKey}`;
        select.style.fontSize = '12px';
        select.style.padding = '2px 4px';
        select.style.backgroundColor = 'var(--panel-bg-solid, #333)';
        select.style.color = 'inherit';
        select.style.border = '1px solid rgba(255,255,255,0.2)';
        select.style.borderRadius = '4px';
        select.style.maxWidth = '120px';

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.value === initialValue) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.addEventListener('change', () => {
            this.stateManager.update({ [stateKey]: select.value });
        });

        row.appendChild(select);
        return row;
    }

    private createSliderRow(label: string, stateKey: string, initialValue: number, min: number, max: number, step: number, decimals: number = 2): HTMLElement {
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
        valueSpan.textContent = initialValue.toFixed(decimals);
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
            valueSpan.textContent = val.toFixed(decimals);
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
        const linesSlider = document.getElementById('slider-labelLines') as HTMLInputElement;
        const thresholdSlider = document.getElementById('slider-labelFilterThreshold') as HTMLInputElement;

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
        if (linesSlider && parseFloat(linesSlider.value) !== state.labelLines) {
            linesSlider.value = state.labelLines.toString();
            const valueSpan = linesSlider.previousElementSibling?.querySelector('span:last-child');
            if (valueSpan) valueSpan.textContent = state.labelLines.toFixed(0);
        }
        if (thresholdSlider && parseFloat(thresholdSlider.value) !== state.labelFilterThreshold) {
            thresholdSlider.value = state.labelFilterThreshold.toString();
            const valueSpan = thresholdSlider.previousElementSibling?.querySelector('span:last-child');
            if (valueSpan) valueSpan.textContent = state.labelFilterThreshold.toFixed(2);
        }

        const marginSlider = document.getElementById('slider-cameraFitMargin') as HTMLInputElement;
        const durationSlider = document.getElementById('slider-cameraTransitionDuration') as HTMLInputElement;

        if (marginSlider && parseFloat(marginSlider.value) !== state.cameraFitMargin) {
            marginSlider.value = state.cameraFitMargin.toString();
            const valueSpan = marginSlider.previousElementSibling?.querySelector('span:last-child');
            if (valueSpan) valueSpan.textContent = state.cameraFitMargin.toFixed(1);
        }
        if (durationSlider && parseFloat(durationSlider.value) !== state.cameraTransitionDuration) {
            durationSlider.value = state.cameraTransitionDuration.toString();
            const valueSpan = durationSlider.previousElementSibling?.querySelector('span:last-child');
            if (valueSpan) valueSpan.textContent = state.cameraTransitionDuration.toFixed(0);
        }

        // Sync selects
        const attrSelect = document.getElementById('select-labelFilterAttribute') as HTMLSelectElement;
        const modeSelect = document.getElementById('select-labelFilterMode') as HTMLSelectElement;

        if (attrSelect && attrSelect.value !== state.labelFilterAttribute) {
            // Check if option exists before setting
            const exists = Array.from(attrSelect.options).some(o => o.value === state.labelFilterAttribute);
            if (exists) attrSelect.value = state.labelFilterAttribute;
        }
        if (modeSelect && modeSelect.value !== state.labelFilterMode) {
            modeSelect.value = state.labelFilterMode;
        }

        // Sync count info
        const labelCountInfo = document.getElementById('labelCountInfo');
        if (labelCountInfo) {
            labelCountInfo.textContent = `Sichtbar: ${state.visibleLabelsCount} / ${state.totalLabelsCount}`;
        }

        // Sync new checkboxes
        const autoBalanceCheck = document.getElementById('checkbox-autoBalanceEnabled') as HTMLInputElement;
        const normalizeCheck = document.getElementById('checkbox-normalizeCoordinatesEnabled') as HTMLInputElement;

        if (autoBalanceCheck && autoBalanceCheck.checked !== state.autoBalanceEnabled) {
            autoBalanceCheck.checked = state.autoBalanceEnabled;
        }
        if (normalizeCheck && normalizeCheck.checked !== state.normalizeCoordinatesEnabled) {
            normalizeCheck.checked = state.normalizeCoordinatesEnabled;
        }

        // --- UPDATE DEPENDENT CONTROLS STATE ---
        const labelsEnabled = state.showLabelsAlways || state.showLabelsOnHover;
        const labelControls = [
            linesSlider?.closest('.slider-row') as HTMLElement,
            attrSelect?.closest('.select-row') as HTMLElement,
            modeSelect?.closest('.select-row') as HTMLElement,
            thresholdSlider?.closest('.slider-row') as HTMLElement,
            labelCountInfo as HTMLElement
        ];

        labelControls.forEach(ctrl => {
            if (ctrl) {
                ctrl.style.opacity = labelsEnabled ? '1' : '0.4';
                ctrl.style.pointerEvents = labelsEnabled ? 'auto' : 'none';
                ctrl.style.transition = 'opacity 0.2s ease';
            }
        });
    }

    private updateAvailableAttributes(entities: any[]): void {
        const select = document.getElementById('select-labelFilterAttribute') as HTMLSelectElement;
        if (!select) return;

        const currentVal = this.stateManager.state.labelFilterAttribute;
        const attrs = new Set<string>();

        // Sammle alle numerischen Attribute (die sich als Label-Filter eignen)
        let sampleSize = Math.min(entities.length, 100);
        for (let i = 0; i < sampleSize; i++) {
            const e = entities[i];
            for (const key in e) {
                if (typeof e[key] === 'number') {
                    // Ignoriere interne Attribute
                    if (!['id', 'x', 'y', 'z', 'fx', 'fy', 'fz', 'vx', 'vy', 'vz', 'index'].includes(key)) {
                        attrs.add(key);
                    }
                }
            }
        }

        const sortedAttrs = Array.from(attrs).sort();

        // Nur updaten, wenn sich die Liste geaendert hat
        const currentOptions = Array.from(select.options).map(o => o.value).filter(v => v !== '');
        if (currentOptions.join(',') === sortedAttrs.join(',')) {
            return;
        }

        select.innerHTML = '<option value="">-- Keines --</option>';
        sortedAttrs.forEach(attr => {
            const opt = document.createElement('option');
            opt.value = attr;
            opt.textContent = attr;
            if (attr === currentVal) opt.selected = true;
            select.appendChild(opt);
        });
    }

}
