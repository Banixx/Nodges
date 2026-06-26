/**
 * LayoutGUI - Benutzerfreundliche GUI fuer Layout-Algorithmen
 * 
 * Features:
 * - Dropdown-Menue fuer Layout-Auswahl
 * - Parameter-Einstellungen fuer jeden Algorithmus
 * - Animation-Kontrollen
 * - Preset-Verwaltung
 */

import * as THREE from 'three';
import { LayoutManager } from '../core/LayoutManager';

interface LayoutParameter {
    type: string;
    min: number;
    max: number;
    default: number;
    step: number;
}

interface LayoutParameters {
    [layoutName: string]: {
        [paramName: string]: LayoutParameter;
    };
}

interface Preset {
    layout: string;
    params: {
        [key: string]: number;
    };
}

// Interface to avoid circular dependency with App.ts
interface IApp {
    layoutManager: LayoutManager;
    stateManager: any; // StateManager
    currentEntities: any[];
    currentRelationships: any[];
    scene: THREE.Scene;
    highlightManager: any;
    updateNodePositions: () => void;
    currentGraphData?: any;
}

export class LayoutGUI {
    private app: IApp;
    private layoutManager: LayoutManager;
    private container: HTMLElement;
    private layoutSelect: HTMLSelectElement | null;
    private parameterContainer: HTMLElement | null;
    private animationControls: HTMLElement | null;
    private contentContainer: HTMLElement | null;

    private layoutParameters: LayoutParameters;
    private presets: { [name: string]: Preset };
    private currentParameters: { [key: string]: number };

    constructor(app: IApp, container: HTMLElement) {
        this.app = app;
        this.container = container;
        this.layoutManager = app.layoutManager;

        // GUI-Elemente
        this.layoutSelect = null;
        this.parameterContainer = null;
        this.animationControls = null;
        this.contentContainer = null;


        // Layout-Parameter fuer verschiedene Algorithmen
        this.layoutParameters = {
            'force-directed': {
                maxIterations: { type: 'range', min: 100, max: 2000, default: 500, step: 50 },
                repulsionStrength: { type: 'range', min: 100, max: 5000, default: 1000, step: 100 },
                attractionStrength: { type: 'range', min: 0.01, max: 1, default: 0.1, step: 0.01 },
                damping: { type: 'range', min: 0.1, max: 1, default: 0.9, step: 0.05 }
            },
            'fruchterman-reingold': {
                maxIterations: { type: 'range', min: 100, max: 1000, default: 500, step: 50 },
                area: { type: 'range', min: 100, max: 1000, default: 400, step: 50 },
                temperature: { type: 'range', min: 1, max: 50, default: 10, step: 1 }
            },
            'spring-embedder': {
                maxIterations: { type: 'range', min: 100, max: 2000, default: 1000, step: 100 },
                springConstant: { type: 'range', min: 0.01, max: 1, default: 0.1, step: 0.01 },
                repulsionConstant: { type: 'range', min: 100, max: 5000, default: 1000, step: 100 },
                damping: { type: 'range', min: 0.1, max: 1, default: 0.95, step: 0.05 },
                naturalLength: { type: 'range', min: 0.5, max: 10, default: 2, step: 0.5 }
            },
            'hierarchical': {
                levelHeight: { type: 'range', min: 1, max: 10, default: 3, step: 0.5 },
                nodeSpacing: { type: 'range', min: 0.5, max: 5, default: 2, step: 0.1 }
            },
            'tree': {
                levelHeight: { type: 'range', min: 1, max: 10, default: 3, step: 0.5 },
                nodeSpacing: { type: 'range', min: 0.5, max: 5, default: 2, step: 0.1 }
            },
            'circular': {
                radius: { type: 'range', min: 5, max: 50, default: 10, step: 1 },
                height: { type: 'range', min: -10, max: 10, default: 0, step: 0.5 }
            },
            'grid': {
                spacing: { type: 'range', min: 0.5, max: 10, default: 2, step: 0.1 }
            },
            'random': {
                minBound: { type: 'range', min: -50, max: 0, default: -10, step: 1 },
                maxBound: { type: 'range', min: 0, max: 50, default: 10, step: 1 }
            }
        };

        // Presets fuer schnelle Anwendung
        this.presets = {
            'Kleine Netzwerke': {
                layout: 'force-directed',
                params: { maxIterations: 300, repulsionStrength: 800 }
            },
            'Grosse Netzwerke': {
                layout: 'fruchterman-reingold',
                params: { maxIterations: 200, area: 600 }
            },
            'Hierarchische Struktur': {
                layout: 'hierarchical',
                params: { levelHeight: 4, nodeSpacing: 3 }
            },
            'Kreisfoermig': {
                layout: 'circular',
                params: { radius: 15 }
            },
            'Raster': {
                layout: 'grid',
                params: { spacing: 3 }
            }
        };

        this.currentParameters = {};
        this.init();
    }

    init() {
        this.createPanel();
        this.createLayoutSelector();
        this.createParameterControls();
        this.createAnimationControls();
        this.createPresetControls();
        this.createActionButtons();

        // Initial Layout auswaehlen
        this.selectLayout('force-directed');

        // Initial Layout-Status setzen (deaktiviert)
        this.updateLayoutState();
    }

    createPanel() {
        // Sidebar-Integration: Container direkt verwenden
        this.contentContainer = this.container;
        this.contentContainer.innerHTML = '';
    }

    createLayoutSelector() {
        if (!this.contentContainer) return;

        // Auto-Layout Toggle oben
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'control-group checkbox-row';

        const toggleLabel = document.createElement('label');
        toggleLabel.textContent = 'Layout-Engine';
        toggleLabel.title = 'Aktiviert die Layout-Engine zur Anordnung der Knoten';

        // Toggle Switch
        const toggleSwitch = document.createElement('input');
        toggleSwitch.type = 'checkbox';
        toggleSwitch.id = 'layoutToggleInput';
        toggleSwitch.addEventListener('change', (e: Event) => {
            const enabled = (e.target as HTMLInputElement).checked;
            this.app.stateManager.update({ layoutEnabled: enabled });
            this.updateLayoutState();
        });

        // this.layoutToggleSwitch = toggleSwitch;

        toggleContainer.appendChild(toggleLabel);
        toggleContainer.appendChild(toggleSwitch);
        this.contentContainer.appendChild(toggleContainer);

        // Layout-Selector
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'control-group';

        const label = document.createElement('label');
        label.textContent = 'Layout-Algorithmus';
        label.title = 'Wähle den Algorithmus zur Anordnung der Knoten';

        this.layoutSelect = document.createElement('select');
        this.layoutSelect.id = 'layoutSelectInput';

        // Layout-Optionen hinzufuegen
        const layouts = this.layoutManager.getAvailableLayouts();
        layouts.forEach((layout: string) => {
            const option = document.createElement('option');
            option.value = layout;
            option.textContent = this.getLayoutDisplayName(layout);
            if (this.layoutSelect) this.layoutSelect.appendChild(option);
        });

        this.layoutSelect.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLSelectElement;
            this.selectLayout(target.value);
        });

        selectorContainer.appendChild(label);
        selectorContainer.appendChild(this.layoutSelect);
        this.contentContainer.appendChild(selectorContainer);
    }

    createParameterControls() {
        if (!this.contentContainer) return;

        this.parameterContainer = document.createElement('div');
        this.parameterContainer.style.marginBottom = '8px';

        // Title removed as requested

        this.contentContainer.appendChild(this.parameterContainer);
    }

    createAnimationControls() {
        if (!this.contentContainer) return;

        this.animationControls = document.createElement('div');
        this.animationControls.className = 'panel-section';

        const title = document.createElement('h4');
        title.className = 'section-header';
        title.textContent = 'Animation';

        // Animation-Geschwindigkeit
        const speedContainer = document.createElement('div');
        speedContainer.className = 'control-group';

        const labelRow = document.createElement('div');
        labelRow.className = 'label-row';

        const speedLabel = document.createElement('label');
        speedLabel.textContent = 'Geschwindigkeit (ms)';

        const speedValue = document.createElement('span');
        speedValue.className = 'value-display';
        speedValue.textContent = '2000';

        labelRow.appendChild(speedLabel);
        labelRow.appendChild(speedValue);

        const speedRow = document.createElement('div');
        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.min = '500';
        speedSlider.max = '5000';
        speedSlider.value = '2000';
        speedSlider.step = '250';
        speedSlider.style.width = '100%';

        speedSlider.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const value = target.value;
            speedValue.textContent = value;
            this.layoutManager.setAnimationDuration(parseInt(value));
        });

        speedRow.appendChild(speedSlider);
        speedContainer.appendChild(labelRow);
        speedContainer.appendChild(speedRow);

        this.animationControls.appendChild(title);
        this.animationControls.appendChild(speedContainer);
        this.contentContainer.appendChild(this.animationControls);
    }

    createPresetControls() {
        if (!this.contentContainer) return;

        const presetContainer = document.createElement('div');
        presetContainer.className = 'panel-section';

        const title = document.createElement('h4');
        title.className = 'section-header';
        title.textContent = 'Presets';

        const presetSelect = document.createElement('select');
        presetSelect.id = 'presetSelectInput';

        // Default-Option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Preset auswaehlen --';
        presetSelect.appendChild(defaultOption);

        // Preset-Optionen
        Object.keys(this.presets).forEach(presetName => {
            const option = document.createElement('option');
            option.value = presetName;
            option.textContent = presetName;
            presetSelect.appendChild(option);
        });

        presetSelect.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLSelectElement;
            if (target.value) {
                this.applyPreset(target.value);
                target.value = ''; // Reset selection
            }
        });

        presetContainer.appendChild(title);
        presetContainer.appendChild(presetSelect);
        this.contentContainer.appendChild(presetContainer);
    }

    createActionButtons() {
        if (!this.contentContainer) return;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.marginTop = '15px';

        // Layout anwenden Button
        const applyButton = document.createElement('button');
        applyButton.className = 'action-button';
        applyButton.textContent = 'Anwenden';
        applyButton.style.flex = '1';

        applyButton.addEventListener('click', () => {
            if (this.app.stateManager.state.layoutEnabled) {
                this.applyCurrentLayout();
            }
        });

        // Stop Button
        const stopButton = document.createElement('button');
        stopButton.className = 'action-button secondary';
        stopButton.textContent = 'Stop';

        stopButton.addEventListener('click', () => {
            if (this.app.stateManager.state.layoutEnabled) {
                this.layoutManager.stopAnimation();
            }
        });

        buttonContainer.appendChild(applyButton);
        buttonContainer.appendChild(stopButton);
        this.contentContainer.appendChild(buttonContainer);
    }

    selectLayout(layoutName: string) {
        if (this.layoutSelect) {
            this.layoutSelect.value = layoutName;
            this.updateParameterControls(layoutName);
        }
    }

    updateParameterControls(layoutName: string) {
        if (!this.parameterContainer) return;

        // Parameter-Container leeren
        this.parameterContainer.innerHTML = '';

        const parameters = this.layoutParameters[layoutName] || {};
        this.currentParameters = {};

        Object.keys(parameters).forEach(paramName => {
            const param = parameters[paramName];
            const container = document.createElement('div');
            container.className = 'control-group';

            if (param.type === 'range') {
                const labelRow = document.createElement('div');
                labelRow.className = 'label-row';

                const label = document.createElement('label');
                label.textContent = this.getParameterDisplayName(paramName);

                const valueDisplay = document.createElement('span');
                valueDisplay.className = 'value-display';
                valueDisplay.textContent = param.default.toString();

                labelRow.appendChild(label);
                labelRow.appendChild(valueDisplay);

                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = param.min.toString();
                slider.max = param.max.toString();
                slider.value = param.default.toString();
                slider.step = param.step.toString();

                slider.addEventListener('input', (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseFloat(target.value);
                    valueDisplay.textContent = value.toString();
                    this.currentParameters[paramName] = value;
                });

                // Initial value setzen
                this.currentParameters[paramName] = param.default;

                container.appendChild(labelRow);
                container.appendChild(slider);
            }

            if (this.parameterContainer) this.parameterContainer.appendChild(container);
        });
    }

    applyPreset(presetName: string) {
        const preset = this.presets[presetName];
        if (!preset) return;

        // Layout auswaehlen
        this.selectLayout(preset.layout);

        // Parameter setzen
        Object.keys(preset.params).forEach(paramName => {
            this.currentParameters[paramName] = preset.params[paramName];

            // GUI aktualisieren
            if (this.parameterContainer) {
                // Find all sliders
                const sliders = this.parameterContainer.querySelectorAll('input[type="range"]');
                sliders.forEach((slider: Element) => {
                    const input = slider as HTMLInputElement;
                    // Check if this slider corresponds to the parameter
                    // This is a bit fragile based on DOM structure, but follows previous logic
                    // The label is in the parent's previous sibling
                    const parent = input.parentElement;
                    if (parent) {
                        const label = parent.previousElementSibling;
                        if (label && label.textContent && label.textContent.includes(this.getParameterDisplayName(paramName))) {
                            input.value = preset.params[paramName].toString();
                            if (input.nextElementSibling) {
                                input.nextElementSibling.textContent = preset.params[paramName].toString();
                            }
                        }
                    }
                });
            }
        });

    }

    async applyCurrentLayout() {
        const layoutName = this.layoutSelect ? this.layoutSelect.value : 'force-directed';

        if (this.app && this.app.layoutManager && this.app.currentEntities && this.app.currentRelationships) {
            const success = await this.app.layoutManager.applyLayout(
                layoutName,
                this.app.currentEntities,
                this.app.currentRelationships,
                this.app.currentGraphData?.fields || [],
                this.currentParameters
            );

            if (success) {
                // Inform the state manager about the new graph data (Source of Truth)
                // This triggers 'data_changed' which handles updating Nodes and Edges automatically
                if (this.app.stateManager) {
                    this.app.stateManager.setGraphData(this.app.currentEntities, this.app.currentRelationships);
                }
                if (this.app.updateNodePositions) {
                    this.app.updateNodePositions();
                }
            }
        }
    }

    getLayoutDisplayName(layoutName: string): string {
        const displayNames: { [key: string]: string } = {
            'force-directed': 'Force-Directed',
            'fruchterman-reingold': 'Fruchterman-Reingold',
            'spring-embedder': 'Spring-Embedder',
            'hierarchical': 'Hierarchisch',
            'tree': 'Baum',
            'circular': 'Kreisfoermig',
            'grid': 'Raster',
            'random': 'Zufaellig'
        };

        return displayNames[layoutName] || layoutName;
    }

    getParameterDisplayName(paramName: string): string {
        const displayNames: { [key: string]: string } = {
            maxIterations: 'Max. Iterationen',
            repulsionStrength: 'Abstossungskraft',
            attractionStrength: 'Anziehungskraft',
            damping: 'Daempfung',
            area: 'Flaeche',
            temperature: 'Temperatur',
            springConstant: 'Federkonstante',
            repulsionConstant: 'Abstossungskonstante',
            naturalLength: 'Natuerliche Laenge',
            levelHeight: 'Ebenen-Hoehe',
            nodeSpacing: 'Knoten-Abstand',
            radius: 'Radius',
            height: 'Hoehe',
            spacing: 'Abstand',
            minBound: 'Min. Grenze',
            maxBound: 'Max. Grenze'
        };

        return displayNames[paramName] || paramName;
    }

    // Layout-Status aktualisieren
    updateLayoutState() {
        if (!this.contentContainer) return;

        const applyButton = this.contentContainer.querySelectorAll('button')[0] as HTMLElement;
        const stopButton = this.contentContainer.querySelectorAll('button')[1] as HTMLElement;
        const toggleCheckbox = document.getElementById('layoutToggleInput') as HTMLInputElement;

        const isEnabled = this.app.stateManager.state.layoutEnabled;

        if (toggleCheckbox) {
            toggleCheckbox.checked = isEnabled;
        }

        if (isEnabled) {
            // Layout aktiviert - Buttons aktivieren
            if (applyButton) {
                (applyButton as HTMLButtonElement).disabled = false;
                applyButton.classList.remove('disabled');
                applyButton.style.opacity = '1';
                applyButton.style.pointerEvents = 'auto';
            }
            if (stopButton) {
                (stopButton as HTMLButtonElement).disabled = false;
                stopButton.classList.remove('disabled');
                stopButton.style.opacity = '1';
                stopButton.style.pointerEvents = 'auto';
            }
        } else {
            // Layout deaktiviert - Buttons deaktivieren
            if (applyButton) {
                (applyButton as HTMLButtonElement).disabled = true;
                applyButton.classList.add('disabled');
                applyButton.style.opacity = '0.5';
                applyButton.style.pointerEvents = 'none';
            }
            if (stopButton) {
                (stopButton as HTMLButtonElement).disabled = true;
                stopButton.classList.add('disabled');
                stopButton.style.opacity = '0.5';
                stopButton.style.pointerEvents = 'none';
            }
        }
    }
}
