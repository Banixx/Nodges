/**
 * LayoutGUI - Benutzerfreundliche GUI für Layout-Algorithmen
 * 
 * Features:
 * - Dropdown-Menü für Layout-Auswahl
 * - Parameter-Einstellungen für jeden Algorithmus
 * - Animation-Kontrollen
 * - Preset-Verwaltung
 */

export class LayoutGUI {
    constructor(layoutManager, container) {
        this.layoutManager = layoutManager;
        this.container = container;
        
        // GUI-Elemente
        this.panel = null;
        this.layoutSelect = null;
        this.parameterContainer = null;
        this.animationControls = null;
        
        // Layout-Parameter für verschiedene Algorithmen
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
        
        // Presets für schnelle Anwendung
        this.presets = {
            'Kleine Netzwerke': {
                layout: 'force-directed',
                params: { maxIterations: 300, repulsionStrength: 800 }
            },
            'Große Netzwerke': {
                layout: 'fruchterman-reingold',
                params: { maxIterations: 200, area: 600 }
            },
            'Hierarchische Struktur': {
                layout: 'hierarchical',
                params: { levelHeight: 4, nodeSpacing: 3 }
            },
            'Kreisförmig': {
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
        
        // Initial Layout auswählen
        this.selectLayout('force-directed');
        
        console.log('🎨 LayoutGUI initialisiert');
    }
    
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'layoutPanel';
        this.panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 320px;
            background-color: rgba(255, 255, 255, 0.95);
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        const title = document.createElement('h3');
        title.textContent = 'Layout Algorithmen';
        title.style.cssText = `
            margin: 0 0 15px 0;
            color: #333;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 5px;
        `;
        
        this.panel.appendChild(title);
        // Panel zum DOM hinzufügen
        if (document.body) {
            document.body.appendChild(this.panel);
        } else {
            console.warn('LayoutGUI: document.body not available');
        }
    }
    
    createLayoutSelector() {
        const selectorContainer = document.createElement('div');
        selectorContainer.style.marginBottom = '15px';
        
        const label = document.createElement('label');
        label.textContent = 'Layout-Algorithmus:';
        label.style.cssText = `
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        `;
        
        this.layoutSelect = document.createElement('select');
        this.layoutSelect.style.cssText = `
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: white;
        `;
        
        // Layout-Optionen hinzufügen
        const layouts = this.layoutManager.getAvailableLayouts();
        layouts.forEach(layout => {
            const option = document.createElement('option');
            option.value = layout;
            option.textContent = this.getLayoutDisplayName(layout);
            this.layoutSelect.appendChild(option);
        });
        
        this.layoutSelect.addEventListener('change', (e) => {
            this.selectLayout(e.target.value);
        });
        
        selectorContainer.appendChild(label);
        selectorContainer.appendChild(this.layoutSelect);
        this.panel.appendChild(selectorContainer);
    }
    
    createParameterControls() {
        this.parameterContainer = document.createElement('div');
        this.parameterContainer.style.marginBottom = '15px';
        
        const title = document.createElement('h4');
        title.textContent = 'Parameter:';
        title.style.cssText = `
            margin: 0 0 10px 0;
            color: #555;
        `;
        
        this.parameterContainer.appendChild(title);
        this.panel.appendChild(this.parameterContainer);
    }
    
    createAnimationControls() {
        this.animationControls = document.createElement('div');
        this.animationControls.style.marginBottom = '15px';
        
        const title = document.createElement('h4');
        title.textContent = 'Animation:';
        title.style.cssText = `
            margin: 0 0 10px 0;
            color: #555;
        `;
        
        // Animation-Geschwindigkeit
        const speedContainer = document.createElement('div');
        speedContainer.style.marginBottom = '10px';
        
        const speedLabel = document.createElement('label');
        speedLabel.textContent = 'Geschwindigkeit (ms):';
        speedLabel.style.cssText = `
            display: block;
            margin-bottom: 5px;
            font-size: 12px;
        `;
        
        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.min = 500;
        speedSlider.max = 5000;
        speedSlider.value = 2000;
        speedSlider.step = 250;
        speedSlider.style.width = '100%';
        
        const speedValue = document.createElement('span');
        speedValue.textContent = '2000ms';
        speedValue.style.cssText = `
            font-size: 12px;
            color: #666;
            margin-left: 10px;
        `;
        
        speedSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            speedValue.textContent = value + 'ms';
            this.layoutManager.setAnimationDuration(parseInt(value));
        });
        
        speedContainer.appendChild(speedLabel);
        const speedRow = document.createElement('div');
        speedRow.style.display = 'flex';
        speedRow.style.alignItems = 'center';
        speedRow.appendChild(speedSlider);
        speedRow.appendChild(speedValue);
        speedContainer.appendChild(speedRow);
        
        this.animationControls.appendChild(title);
        this.animationControls.appendChild(speedContainer);
        this.panel.appendChild(this.animationControls);
    }
    
    createPresetControls() {
        const presetContainer = document.createElement('div');
        presetContainer.style.marginBottom = '15px';
        
        const title = document.createElement('h4');
        title.textContent = 'Presets:';
        title.style.cssText = `
            margin: 0 0 10px 0;
            color: #555;
        `;
        
        const presetSelect = document.createElement('select');
        presetSelect.style.cssText = `
            width: 100%;
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: white;
            margin-bottom: 8px;
        `;
        
        // Default-Option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Preset auswählen --';
        presetSelect.appendChild(defaultOption);
        
        // Preset-Optionen
        Object.keys(this.presets).forEach(presetName => {
            const option = document.createElement('option');
            option.value = presetName;
            option.textContent = presetName;
            presetSelect.appendChild(option);
        });
        
        presetSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                this.applyPreset(e.target.value);
                e.target.value = ''; // Reset selection
            }
        });
        
        presetContainer.appendChild(title);
        presetContainer.appendChild(presetSelect);
        this.panel.appendChild(presetContainer);
    }
    
    createActionButtons() {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 15px;
        `;
        
        // Layout anwenden Button
        const applyButton = document.createElement('button');
        applyButton.textContent = 'Layout anwenden';
        applyButton.style.cssText = `
            flex: 1;
            padding: 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        `;
        
        applyButton.addEventListener('click', () => {
            this.applyCurrentLayout();
        });
        
        applyButton.addEventListener('mouseenter', () => {
            applyButton.style.backgroundColor = '#45a049';
        });
        
        applyButton.addEventListener('mouseleave', () => {
            applyButton.style.backgroundColor = '#4CAF50';
        });
        
        // Stop Button
        const stopButton = document.createElement('button');
        stopButton.textContent = 'Stop';
        stopButton.style.cssText = `
            padding: 10px 15px;
            background-color: #f44336;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        
        stopButton.addEventListener('click', () => {
            this.layoutManager.stopAnimation();
        });
        
        stopButton.addEventListener('mouseenter', () => {
            stopButton.style.backgroundColor = '#da190b';
        });
        
        stopButton.addEventListener('mouseleave', () => {
            stopButton.style.backgroundColor = '#f44336';
        });
        
        buttonContainer.appendChild(applyButton);
        buttonContainer.appendChild(stopButton);
        this.panel.appendChild(buttonContainer);
    }
    
    selectLayout(layoutName) {
        this.layoutSelect.value = layoutName;
        this.updateParameterControls(layoutName);
    }
    
    updateParameterControls(layoutName) {
        // Parameter-Container leeren
        const title = this.parameterContainer.querySelector('h4');
        this.parameterContainer.innerHTML = '';
        this.parameterContainer.appendChild(title);
        
        const parameters = this.layoutParameters[layoutName] || {};
        this.currentParameters = {};
        
        Object.keys(parameters).forEach(paramName => {
            const param = parameters[paramName];
            const container = document.createElement('div');
            container.style.marginBottom = '10px';
            
            const label = document.createElement('label');
            label.textContent = this.getParameterDisplayName(paramName) + ':';
            label.style.cssText = `
                display: block;
                margin-bottom: 3px;
                font-size: 12px;
                color: #666;
            `;
            
            if (param.type === 'range') {
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = param.min;
                slider.max = param.max;
                slider.value = param.default;
                slider.step = param.step;
                slider.style.width = '70%';
                
                const valueDisplay = document.createElement('span');
                valueDisplay.textContent = param.default;
                valueDisplay.style.cssText = `
                    margin-left: 10px;
                    font-size: 12px;
                    color: #333;
                    font-weight: bold;
                `;
                
                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    valueDisplay.textContent = value;
                    this.currentParameters[paramName] = value;
                });
                
                // Initial value setzen
                this.currentParameters[paramName] = param.default;
                
                const controlRow = document.createElement('div');
                controlRow.style.display = 'flex';
                controlRow.style.alignItems = 'center';
                controlRow.appendChild(slider);
                controlRow.appendChild(valueDisplay);
                
                container.appendChild(label);
                container.appendChild(controlRow);
            }
            
            this.parameterContainer.appendChild(container);
        });
    }
    
    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) return;
        
        // Layout auswählen
        this.selectLayout(preset.layout);
        
        // Parameter setzen
        Object.keys(preset.params).forEach(paramName => {
            this.currentParameters[paramName] = preset.params[paramName];
            
            // GUI aktualisieren
            const slider = this.parameterContainer.querySelector(`input[type="range"]`);
            if (slider && slider.parentElement.previousElementSibling.textContent.includes(this.getParameterDisplayName(paramName))) {
                slider.value = preset.params[paramName];
                slider.nextElementSibling.textContent = preset.params[paramName];
            }
        });
        
        console.log(`🎨 Preset "${presetName}" angewendet`);
    }
    
    async applyCurrentLayout() {
        const layoutName = this.layoutSelect.value;
        
        // Event für Layout-Anwendung auslösen
        const event = new CustomEvent('applyLayout', {
            detail: {
                layoutName: layoutName,
                parameters: { ...this.currentParameters }
            }
        });
        
        document.dispatchEvent(event);
    }
    
    getLayoutDisplayName(layoutName) {
        const displayNames = {
            'force-directed': 'Force-Directed',
            'fruchterman-reingold': 'Fruchterman-Reingold',
            'spring-embedder': 'Spring-Embedder',
            'hierarchical': 'Hierarchisch',
            'tree': 'Baum',
            'circular': 'Kreisförmig',
            'grid': 'Raster',
            'random': 'Zufällig'
        };
        
        return displayNames[layoutName] || layoutName;
    }
    
    getParameterDisplayName(paramName) {
        const displayNames = {
            maxIterations: 'Max. Iterationen',
            repulsionStrength: 'Abstoßungskraft',
            attractionStrength: 'Anziehungskraft',
            damping: 'Dämpfung',
            area: 'Fläche',
            temperature: 'Temperatur',
            springConstant: 'Federkonstante',
            repulsionConstant: 'Abstoßungskonstante',
            naturalLength: 'Natürliche Länge',
            levelHeight: 'Ebenen-Höhe',
            nodeSpacing: 'Knoten-Abstand',
            radius: 'Radius',
            height: 'Höhe',
            spacing: 'Abstand',
            minBound: 'Min. Grenze',
            maxBound: 'Max. Grenze'
        };
        
        return displayNames[paramName] || paramName;
    }
    
    // Panel ein-/ausblenden
    toggle() {
        this.panel.style.display = this.panel.style.display === 'none' ? 'block' : 'none';
    }
    
    // Panel anzeigen
    show() {
        this.panel.style.display = 'block';
    }
    
    // Panel verstecken
    hide() {
        this.panel.style.display = 'none';
    }
    
    // Cleanup
    destroy() {
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
    }
}