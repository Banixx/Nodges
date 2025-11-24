/**
 * LayoutGUI - Benutzerfreundliche GUI fuer Layout-Algorithmen
 * 
 * Features:
 * - Dropdown-Menue fuer Layout-Auswahl
 * - Parameter-Einstellungen fuer jeden Algorithmus
 * - Animation-Kontrollen
 * - Preset-Verwaltung
 */

export class LayoutGUI {
    constructor(app, container) {
        this.app = app;
        this.layoutManager = app.layoutManager;
        this.container = container;

        // GUI-Elemente
        this.panel = null;
        this.layoutSelect = null;
        this.parameterContainer = null;
        this.animationControls = null;
        this.toggleButton = null;
        this.contentContainer = null;
        this.isCollapsed = true; // Standardmaessig kollabiert
        this.layoutToggleSwitch = null;
        this.layoutEnabled = false; // Standardmaessig ausgeschaltet

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

        // Initial collapsed state setzen
        if (this.isCollapsed) {
            this.contentContainer.style.maxHeight = '0px';
            this.contentContainer.style.opacity = '0';
            this.contentContainer.style.display = 'none';
            this.toggleButton.innerHTML = '>';
        } else {
            this.contentContainer.style.maxHeight = '1000px';
            this.contentContainer.style.opacity = '1';
            this.contentContainer.style.display = 'block';
            this.toggleButton.innerHTML = 'v';
        }
    }

    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'layoutPanel';
        this.panel.className = 'ui-panel collapsed'; // Start collapsed

        // Header
        const header = document.createElement('div');
        header.className = 'ui-panel-header';

        const title = document.createElement('h3');
        title.textContent = 'Layout';
        header.appendChild(title);

        // Toggle Button
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'ui-panel-toggle';
        this.toggleButton.innerHTML = '>';
        this.toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleCollapse();
        });
        header.appendChild(this.toggleButton);

        this.panel.appendChild(header);

        // Panel Click (Expand when collapsed)
        this.panel.addEventListener('click', (e) => {
            if (this.isCollapsed) {
                this.toggleCollapse();
            }
        });

        // Title Click (Toggle)
        title.style.cursor = 'pointer';
        title.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleCollapse();
        });

        // Content
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'ui-panel-content';
        this.panel.appendChild(this.contentContainer);

        // Add to DOM
        if (document.body) {
            document.body.appendChild(this.panel);
            if (this.app.uiManager) {
                this.app.uiManager.panels.layout = this.panel;
                this.app.uiManager.updateAllPanelPositions();
            }
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

        // Layout-Optionen hinzufuegen
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
        this.contentContainer.appendChild(selectorContainer);
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
        this.contentContainer.appendChild(this.parameterContainer);
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
        this.contentContainer.appendChild(this.animationControls);
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
        defaultOption.textContent = '-- Preset auswaehlen --';
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
        this.contentContainer.appendChild(presetContainer);
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
        applyButton.textContent = 'Anwenden';
        applyButton.style.cssText = `
            flex: 1;
            padding: 8px;
            background-color: #808080;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-size: 11px;
        `;

        applyButton.addEventListener('click', () => {
            if (this.layoutEnabled) {
                this.applyCurrentLayout();
            }
        });

        applyButton.addEventListener('mouseenter', () => {
            if (this.layoutEnabled) {
                applyButton.style.backgroundColor = '#606060';
            }
        });

        applyButton.addEventListener('mouseleave', () => {
            applyButton.style.backgroundColor = this.layoutEnabled ? '#808080' : '#cccccc';
        });

        // Stop Button
        const stopButton = document.createElement('button');
        stopButton.textContent = 'Stop';
        stopButton.style.cssText = `
            padding: 8px 12px;
            background-color: #999999;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
        `;

        stopButton.addEventListener('click', () => {
            if (this.layoutEnabled) {
                this.layoutManager.stopAnimation();
            }
        });

        stopButton.addEventListener('mouseenter', () => {
            if (this.layoutEnabled) {
                stopButton.style.backgroundColor = '#777777';
            }
        });

        stopButton.addEventListener('mouseleave', () => {
            stopButton.style.backgroundColor = this.layoutEnabled ? '#999999' : '#cccccc';
        });

        buttonContainer.appendChild(applyButton);
        buttonContainer.appendChild(stopButton);
        this.contentContainer.appendChild(buttonContainer);
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

        // Layout auswaehlen
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

    }

    async applyCurrentLayout() {
        const layoutName = this.layoutSelect.value;

        // Direkt LayoutManager aufrufen statt Event
        if (this.app && this.app.layoutManager) {
            const nodeObjects = this.app.nodeObjects; // Access directly from app
            const edgeObjects = this.app.edgeObjects; // Access directly from app

            const nodes = nodeObjects.map(nodeObj => ({
                x: nodeObj.position.x,
                y: nodeObj.position.y,
                z: nodeObj.position.z,
                id: nodeObj.id || Math.random().toString(36)
            }));

            const edges = edgeObjects.map(edgeObj => ({
                start: {
                    x: edgeObj.startNode.position.x,
                    y: edgeObj.startNode.position.y,
                    z: edgeObj.startNode.position.z,
                    id: edgeObj.startNode.id || Math.random().toString(36)
                },
                end: {
                    x: edgeObj.endNode.position.x,
                    y: edgeObj.endNode.position.y,
                    z: edgeObj.endNode.position.z,
                    id: edgeObj.endNode.id || Math.random().toString(36)
                }
            }));

            const success = this.app.layoutManager.applyLayout(
                layoutName,
                nodes,
                edges,
                this.currentParameters
            );

            if (success) {
                // Knoten-Positionen in 3D-Objekten aktualisieren
                this.updateNodePositions(nodeObjects, nodes);
                // Edges aktualisieren
                this.updateEdgePositions(edgeObjects);
            }
        }
    }

    updateNodePositions(nodeObjects, nodes) {
        nodeObjects.forEach((nodeObj, index) => {
            if (nodes[index] && nodeObj.mesh) {
                const newX = nodes[index].x || 0;
                const newY = nodes[index].y || 0;
                const newZ = nodes[index].z || 0;

                nodeObj.mesh.position.set(newX, newY, newZ);

                // Auch die Node-Position aktualisieren
                nodeObj.position.x = newX;
                nodeObj.position.y = newY;
                nodeObj.position.z = newZ;
            }
        });
    }

    updateEdgePositions(edgeObjects) {
        edgeObjects.forEach((edgeObj, index) => {
            if (edgeObj.line && edgeObj.startNode && edgeObj.endNode) {
                // Edge komplett neu erstellen statt Geometrie zu modifizieren
                const scene = this.app.scene;

                // Alte Edge aus Scene entfernen
                scene.remove(edgeObj.line);

                // Entferne alte Edge aus HighlightManager falls selektiert
                if (this.app && this.app.highlightManager) {
                    this.app.highlightManager.removeHighlight(edgeObj.line);
                    this.app.highlightManager.highlightedObjects.delete(edgeObj.line);
                }

                edgeObj.line.geometry?.dispose();
                edgeObj.line.material?.dispose();

                // Neue Edge erstellen
                edgeObj.line = edgeObj.createLine();

                // Neue Edge zur Scene hinzufuegen
                if (edgeObj.line) {
                    scene.add(edgeObj.line);
                }
            }
        });
    }

    getLayoutDisplayName(layoutName) {
        const displayNames = {
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

    getParameterDisplayName(paramName) {
        const displayNames = {
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

    // Panel ein-/ausblenden
    toggle() {
        this.panel.style.display = this.panel.style.display === 'none' ? 'block' : 'none';
    }

    // Panel anzeigen
    show() {
        this.panel.style.display = 'block';
        // Beim ersten Anzeigen ausgeklappt starten fuer bessere UX
        if (this.isCollapsed === undefined) {
            this.isCollapsed = false;
            this.contentContainer.style.maxHeight = '1000px';
            this.contentContainer.style.opacity = '1';
            this.toggleButton.innerHTML = '▼';
        }
        this.updatePosition();
    }

    // Panel verstecken
    hide() {
        this.panel.style.display = 'none';
    }

    // Content ein-/ausklappen (wie bei Info Panel)
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;

        if (this.isCollapsed) {
            // Einklappen
            this.panel.classList.add('collapsed');
            this.contentContainer.style.maxHeight = '0px';
            this.contentContainer.style.opacity = '0';
            this.contentContainer.style.display = 'none';
            this.toggleButton.innerHTML = '>';
        } else {
            // Ausklappen
            this.panel.classList.remove('collapsed');
            this.contentContainer.style.maxHeight = '1000px';
            this.contentContainer.style.opacity = '1';
            this.contentContainer.style.display = 'block';
            this.toggleButton.innerHTML = 'v';
        }

        // Notify UIManager to update positions
        if (this.app.uiManager) {
            // Wait for transition
            setTimeout(() => this.app.uiManager.updateAllPanelPositions(), 350);
        }
    }

    // Layout-Status aktualisieren
    updateLayoutState() {
        const applyButton = this.contentContainer.querySelector('button');
        const stopButton = this.contentContainer.querySelectorAll('button')[1];

        if (this.layoutEnabled) {
            // Layout aktiviert - Buttons aktivieren
            if (applyButton) {
                applyButton.style.backgroundColor = '#808080';
                applyButton.style.cursor = 'pointer';
                applyButton.style.opacity = '1';
            }
            if (stopButton) {
                stopButton.style.backgroundColor = '#999999';
                stopButton.style.cursor = 'pointer';
                stopButton.style.opacity = '1';
            }
        } else {
            // Layout deaktiviert - Buttons deaktivieren
            if (applyButton) {
                applyButton.style.backgroundColor = '#cccccc';
                applyButton.style.cursor = 'not-allowed';
                applyButton.style.opacity = '0.6';
            }
            if (stopButton) {
                stopButton.style.backgroundColor = '#cccccc';
                stopButton.style.cursor = 'not-allowed';
                stopButton.style.opacity = '0.6';
            }
        }
    }

    // Positionierung unter fileInfoPanel
    // Positionierung entfernt - wird nun vom UIManager uebernommen

    // Cleanup
    destroy() {
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
    }
}
