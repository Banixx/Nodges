/**
 * ViewPanel - UI component for the "Ansicht" (View) tab
 * Controls label visibility, color scheme selection, and other visual settings.
 */
import { StateManager } from '../core/StateManager';

interface ColorScheme {
    id: string;
    name: string;
    bgColor: string;
    panelBg: string;
    accentColor: string;
}

const COLOR_SCHEMES: ColorScheme[] = [
    {
        id: 'slate-earth',
        name: 'Slate Earth',
        bgColor: '#1e1e1c',
        panelBg: '#2a2a28',
        accentColor: '#a08060'
    },
    {
        id: 'terracotta',
        name: 'Terracotta',
        bgColor: '#1a1512',
        panelBg: '#2b221d',
        accentColor: '#c67a4f'
    },
    {
        id: 'ocean',
        name: 'Deep Ocean',
        bgColor: '#2c3e50',
        panelBg: '#34495e',
        accentColor: '#1abc9c'
    },
    {
        id: 'midnight',
        name: 'Midnight',
        bgColor: '#19101f',
        panelBg: '#2d1e36',
        accentColor: '#9b59b6'
    },
    {
        id: 'forest',
        name: 'Forest',
        bgColor: '#0f1a15',
        panelBg: '#16261f',
        accentColor: '#27ae60'
    }
];

export class ViewPanel {
    private container: HTMLElement;
    private stateManager: StateManager;

    constructor(containerId: string, stateManager: StateManager) {
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
        }, 'view_panel');
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

        // --- DATA MAP SECTION ---
        // Container for VisualMappingPanel to render into
        const mappingSection = document.createElement('section');
        mappingSection.className = 'panel-section';
        const mappingTitle = document.createElement('h4');
        mappingTitle.className = 'section-header';
        mappingTitle.textContent = 'Daten-Visualisierung';
        mappingSection.appendChild(mappingTitle);

        const vmContainer = document.createElement('div');
        vmContainer.id = 'visualMappingContainer';
        mappingSection.appendChild(vmContainer);
        this.container.appendChild(mappingSection);
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

    private applyColorScheme(scheme: ColorScheme): void {
        // Update CSS variables on root
        const root = document.documentElement;
        root.style.setProperty('--bg-color', scheme.bgColor);
        root.style.setProperty('--panel-bg-solid', scheme.panelBg);
        root.style.setProperty('--panel-bg', `rgba(${this.hexToRgb(scheme.panelBg)}, 0.95)`);
        root.style.setProperty('--accent-color', scheme.accentColor);

        // Also update the 3D scene background color via stateManager
        this.stateManager.update({
            activeColorScheme: scheme.id,
            backgroundColor: scheme.bgColor
        });

        // Update swatch active state
        const grid = document.getElementById('colorSchemeGrid');
        if (grid) {
            grid.querySelectorAll('.color-swatch').forEach(sw => {
                sw.classList.remove('active');
                if ((sw as HTMLElement).dataset.schemeId === scheme.id) {
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

    private updateUI(state: any): void {
        // Sync checkboxes with state
        const alwaysCheck = document.getElementById('checkbox-showLabelsAlways') as HTMLInputElement;
        const hoverCheck = document.getElementById('checkbox-showLabelsOnHover') as HTMLInputElement;

        if (alwaysCheck && alwaysCheck.checked !== state.showLabelsAlways) {
            alwaysCheck.checked = state.showLabelsAlways;
        }
        if (hoverCheck && hoverCheck.checked !== state.showLabelsOnHover) {
            hoverCheck.checked = state.showLabelsOnHover;
        }
    }
}
