/**
 * UIManager - Manages all HTML UI components and interactions.
 * This class encapsulates all logic for panels, buttons, and other UI elements.
 */
import type { App } from '../App';
import { IStateManager } from './interfaces';
import type { State } from './StateManager';
import { VisualMappingPanel } from '../ui/VisualMappingPanel';
import { EnvironmentPanel } from '../ui/EnvironmentPanel';
import { ViewPanel } from '../ui/ViewPanel';
import { StatsUI } from '../ui/StatsUI';
import { ToolsUI } from '../ui/ToolsUI';
import { DevPanel } from '../ui/DevPanel';
import { LegendPanel } from '../ui/LegendPanel';
import { VisualMappings } from '../types';

interface Bounds {
    x: { min: number, max: number };
    y: { min: number, max: number };
    z: { min: number, max: number };
}

export class UIManager {
    private app: App;
    private stateManager: IStateManager;
    private panels: { [key: string]: HTMLElement | null };
    private panelToggles: { [key: string]: HTMLElement | null };
    private filePanelContent: HTMLElement | null;
    private infoPanelContent: HTMLElement | null;
    private visualMappingPanel: VisualMappingPanel;
    private legendPanel: LegendPanel;
    private availableFiles: string[] = [];
    private isRenderFilePanelPending: boolean = false;

    // New Components
    private statsUI: StatsUI;
    public toolsUI: ToolsUI; // Public/used to suppress warning for now, or use it later


    constructor(app: App) {
        this.app = app;
        this.stateManager = app.stateManager;

        // Initialize Sub-Components
        this.statsUI = new StatsUI(this.stateManager);
        this.toolsUI = new ToolsUI(this.stateManager);

        // New sidebar-based panel references
        this.panels = {
            mainSidebar: document.getElementById('mainSidebar'),
            info: document.getElementById('infoPanel'),
            // Legacy references (may be null in new structure)
            fileInfo: document.getElementById('fileInfoPanel'),
            file: document.getElementById('filePanel'),
            visualMapping: document.getElementById('visualMappingPanel'),
            environment: document.getElementById('environmentPanel'),
            dev: document.getElementById('devPanel'),
            layout: null // Initialized by LayoutGUI
        };

        this.panelToggles = {
            fileInfo: document.getElementById('fileInfoToggle'),
            file: document.getElementById('filePanelToggle'),
            visualMapping: document.getElementById('visualMappingToggle'),
            environment: document.getElementById('environmentToggle'),
            info: document.getElementById('infoPanelToggle'),
            dev: document.getElementById('devPanelToggle')
        };

        this.filePanelContent = document.getElementById('filePanelContent');
        this.infoPanelContent = document.getElementById('infoPanelContent');

        // Initialize new ViewPanel for the 'Ansicht' tab (self-registers with StateManager)
        new ViewPanel('viewPanelContent', this.stateManager);

        // Initialize Visual Mapping panel (now in its own tab)
        const vmContent = document.getElementById('visualMappingContainer');
        if (vmContent) {
            this.visualMappingPanel = new VisualMappingPanel('visualMappingContainer');
        } else {
            console.warn('visualMappingContainer not found');
            this.visualMappingPanel = null as any;
        }

        // Initialize Environment panel
        new EnvironmentPanel('environmentContent', this.stateManager);

        // Initialize floating info panel close button
        this.initInfoPanelClose();

        // Initialize DevPanel
        new DevPanel('devPanelContent', this.stateManager);

        // Initialize Legend Panel
        this.legendPanel = new LegendPanel('legendContainer', this.stateManager);

        this.stateManager.subscribe(this.handleStateChange.bind(this), 'ui');
        this.stateManager.subscribe(() => {
            if (!this.isRenderFilePanelPending) {
                this.isRenderFilePanelPending = true;
                requestAnimationFrame(() => {
                    this.renderFilePanel();
                    this.isRenderFilePanelPending = false;
                });
            }
        }, 'data_changed');
    }

    private sliderToCurvature(val: number): number {
        // Logarithmic scale: slider 0 -> curvature 0, slider 100 -> curvature ~99.0
        if (val === 0) return 0;
        return Math.pow(10, val / 50) - 1;
    }

    private curvatureToSlider(val: number): number {
        // Inverse of sliderToCurvature
        if (val <= 0) return 0;
        return Math.log10(val + 1) * 50;
    }

    private sliderToHighlightPercent(s: number): number {
        // Range 1% to 200%, middle (50) is 30%
        const B = 170 / 29;
        const P = 841 / 141;
        const Q = -700 / 141;
        return P * Math.pow(B, s / 50) + Q;
    }

    private highlightPercentToSlider(v: number): number {
        const B = 170 / 29;
        const P = 841 / 141;
        const Q = -700 / 141;
        if (v <= Q) return 0;
        return 50 * Math.log((v - Q) / P) / Math.log(B);
    }

    private initInfoPanelClose(): void {
        const closeBtn = document.getElementById('infoPanelClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideInfoPanel();
            });
        }
    }

    private hideInfoPanel(): void {
        const infoPanel = this.panels.info;
        if (infoPanel) {
            infoPanel.classList.add('hidden');
        }
        this.stateManager.setSelectedObject(null);
    }

    init() {
        console.log('Initializing UIManager...');
        this.initPanelToggling();
        this.initPanelPositioning();
        this.initHighlightToggle();
        this.initEdgeControls();
        this.loadAvailableFiles();
        this.initInfoPanelInteractions();
    }

    private initInfoPanelInteractions() {
        if (!this.infoPanelContent) return;

        this.infoPanelContent.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const row = target.closest('.selectable-row');
            if (!row) return;

            const targetId = row.getAttribute('data-id');
            if (!targetId) return;

            const currentSelection = this.stateManager.state.selectedObjects;
            if (!currentSelection) return;

            let foundObject: THREE.Object3D | null = null;
            for (const obj of currentSelection) {
                if (obj.uuid === targetId) {
                    foundObject = obj;
                    break;
                }
            }

            if (foundObject) {
                this.stateManager.setSelectedObject(foundObject);
            }
        });
    }

    handleStateChange(state: State) {
        // Handle changes related to UI, e.g., showing/hiding panels based on selected objects.
        if (state.selectedObjects && state.selectedObjects.size > 1) {
            this.showMultiSelectionInfo(state.selectedObjects);
        } else if (state.selectedObject) {
            this.showInfoPanelFor(state.selectedObject);
        } else {
            this.collapseInfoPanel();
        }

        document.body.style.cursor = state.hoveredObject ? 'pointer' : 'default';
    }

    initPanelToggling() {
        for (const panelName in this.panelToggles) {
            const toggle = this.panelToggles[panelName];
            const panel = this.panels[panelName];
            if (toggle && panel) {
                // Toggle Button Click
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.togglePanel(panel, toggle);
                });

                // Panel Click (Expand when collapsed)
                panel.addEventListener('click', (_e) => {
                    if (panel.classList.contains('collapsed')) {
                        this.togglePanel(panel, toggle);
                    }
                });

                // Title Click (Collapse/Toggle)
                const title = panel.querySelector('.ui-panel-header h3') as HTMLElement;
                if (title) {
                    title.style.cursor = 'pointer';
                    title.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // If expanded, collapse. If collapsed, expand (toggle).
                        this.togglePanel(panel, toggle);
                    });
                }

                // Add hover effects
                toggle.addEventListener('mouseenter', () => toggle.style.backgroundColor = 'rgba(172, 56, 56, 0.83)');
                toggle.addEventListener('mouseleave', () => toggle.style.backgroundColor = 'transparent');
            }
        }
    }

    togglePanel(panel: HTMLElement, toggle: HTMLElement) {
        panel.classList.toggle('collapsed');
        toggle.innerHTML = panel.classList.contains('collapsed') ? '>' : 'v';
        // After a toggle, panel positions might need to be recalculated.
        setTimeout(() => this.updateAllPanelPositions(), 350);
    }

    initPanelPositioning() {
        // Initial positioning
        this.updateAllPanelPositions();

        // Update on window resize
        window.addEventListener('resize', () => this.updateAllPanelPositions());

        // Use observers to detect changes in panel sizes (e.g., when content is added)
        const fileInfoPanel = this.panels.fileInfo;
        if (fileInfoPanel) {
            const observer = new ResizeObserver(() => this.updateAllPanelPositions());
            observer.observe(fileInfoPanel);
        }

        const visualMappingPanel = this.panels.visualMapping;
        if (visualMappingPanel) {
            const observer = new ResizeObserver(() => this.updateAllPanelPositions());
            observer.observe(visualMappingPanel);
        }

        const environmentPanel = this.panels.environment;
        if (environmentPanel) {
            const observer = new ResizeObserver(() => this.updateAllPanelPositions());
            observer.observe(environmentPanel);
        }

        // We need to wait for LayoutGUI to create the layout panel, then observe it.
        const checkForLayoutPanel = setInterval(() => {
            const layoutPanel = document.getElementById('layoutPanel');
            if (layoutPanel) {
                this.panels.layout = layoutPanel;
                clearInterval(checkForLayoutPanel);
                const observer = new ResizeObserver(() => this.updateAllPanelPositions());
                observer.observe(layoutPanel);
                this.updateAllPanelPositions();
            }
        }, 500);
    }

    updateAllPanelPositions() {
        // Main stack (Right column)
        const mainStackOrder = ['fileInfo', 'file', 'visualMapping', 'environment', 'layout', 'dev'];
        let currentTop = 20; // Start margin from top
        const gap = 10; // Gap between panels

        mainStackOrder.forEach(name => {
            const panel = this.panels[name];
            if (panel && panel.style.display !== 'none') {
                // Set the top position
                panel.style.top = `${currentTop}px`;
                panel.style.right = '20px'; // Standard right position

                // Calculate height for the next panel
                const rect = panel.getBoundingClientRect();
                currentTop += rect.height + gap;
            }
        });

        // Secondary stack (Left of main stack) - Info Panel
        // Positioned at the top, to the left of the main stack
        const infoPanel = this.panels.info;
        if (infoPanel && infoPanel.style.display !== 'none') {
            infoPanel.style.top = '20px';
            // 20px (right margin) + 250px (panel width) + 10px (gap) = 280px
            infoPanel.style.right = '280px';
        }
    }

    initHighlightToggle() {
        const highlightToggleInput = document.getElementById('highlightToggleInput') as HTMLInputElement;
        if (highlightToggleInput) {
            // Set initial state from StateManager
            highlightToggleInput.checked = this.stateManager.state.highlightEffectsEnabled;
            this.updateHighlightToggleVisuals(highlightToggleInput.checked);

            // Listen for changes
            highlightToggleInput.addEventListener('change', (e) => {
                const isEnabled = (e.target as HTMLInputElement).checked;
                this.updateHighlightToggleVisuals(isEnabled);
                this.stateManager.update({ highlightEffectsEnabled: isEnabled });
            });
        }
    }

    updateHighlightToggleVisuals(isEnabled: boolean) {
        const slider = document.getElementById('highlightToggleSlider');
        const button = document.getElementById('highlightToggleButton');
        if (slider && button) {
            if (isEnabled) {
                slider.style.backgroundColor = '#292f42ff';
                button.style.transform = 'translateX(16px)';
            } else {
                slider.style.backgroundColor = '#ccc';
                button.style.transform = 'translateX(0px)';
            }
        }
    }

    async loadAvailableFiles() {
        if (!this.filePanelContent) return;

        this.filePanelContent.innerHTML = '<div id="fileLoadingIndicator">Loading files...</div>';

        this.availableFiles = await this.fetchDirectoryContents();
        this.renderFilePanel();
    }

    renderFilePanel() {
        if (!this.filePanelContent) return;
        this.filePanelContent.innerHTML = '';

        const loadedFiles = this.stateManager.state.loadedFiles || [];

        // --- GELADENE DATEIEN ---
        if (loadedFiles.length > 0) {
            const loadedHeader = document.createElement('h4');
            loadedHeader.className = 'section-header';
            loadedHeader.textContent = 'Geladene Dateien';
            this.filePanelContent.appendChild(loadedHeader);

            loadedFiles.forEach(file => {
                const container = document.createElement('div');
                container.className = 'file-item-container';

                const item = document.createElement('div');
                item.className = 'file-item active';
                item.textContent = this.createDisplayName(file.name);
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'file-action-btn remove';
                removeBtn.innerHTML = '×';
                removeBtn.title = 'Entfernen';
                removeBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.app.removeData(file.id);
                };

                container.appendChild(item);
                container.appendChild(removeBtn);
                this.filePanelContent!.appendChild(container);
            });
        }

        // --- VERFÜGBARE DATEIEN ---
        const availableHeader = document.createElement('h4');
        availableHeader.className = 'section-header';
        availableHeader.style.marginTop = '15px';
        availableHeader.innerHTML = `
            <span>Verfügbare Dateien</span>
            <button id="addFileBtn" class="file-action-btn add" style="width: 20px; height: 20px; padding: 0; font-size: 14px;" title="Datei hinzufügen">+</button>
        `;
        this.filePanelContent.appendChild(availableHeader);

        if (this.availableFiles.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'loading-text';
            empty.textContent = 'Keine Dateien gefunden';
            this.filePanelContent.appendChild(empty);
        } else {
            this.availableFiles.forEach(filename => {
                // Don't show in available if already loaded (optional)
                const isLoaded = loadedFiles.some(f => f.id === `${filename}.json`);

                const container = document.createElement('div');
                container.className = 'file-item-container';

                const button = document.createElement('div');
                button.className = `file-item ${isLoaded ? 'active' : ''}`;
                button.textContent = this.createDisplayName(filename);
                button.onclick = () => {
                    this.app.loadData(`data/${filename}.json`);
                };

                const addBtn = document.createElement('button');
                addBtn.className = 'file-action-btn add';
                addBtn.innerHTML = '+';
                addBtn.title = 'Zur Szene hinzufügen';
                addBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.app.addData(`data/${filename}.json`);
                };

                container.appendChild(button);
                container.appendChild(addBtn);
                this.filePanelContent!.appendChild(container);
            });
        }

        // Global Add Button Logic
        const mainAddBtn = document.getElementById('addFileBtn');
        if (mainAddBtn) {
            mainAddBtn.onclick = () => {
                // For now, it just scrolls to available files or could open a dialog
                console.log('Main add button clicked');
            };
        }
    }

    async fetchDirectoryContents(): Promise<string[]> {
        // Use Vite's import.meta.glob to dynamically discover all JSON files in public/data/
        // This is evaluated at build time
        const dataFiles = import.meta.glob('/public/data/*.json');

        // Extract filenames without path and extension
        const filenames = Object.keys(dataFiles).map(path => {
            // Extract filename from '/public/data/filename.json'
            const parts = path.split('/');
            const lastPart = parts[parts.length - 1];
            return lastPart.replace('.json', '');
        }).filter(name => name !== '');

        return filenames.sort(); // Sort alphabetically
    }

    createFileButtons(_filenames: string[]) {
        // Deprecated, using renderFilePanel instead
    }

    createDisplayName(filename: string): string {
        const nameMap: { [key: string]: string } = {
            'small': 'Small Network', 'medium': 'Medium Network', 'large': 'Large Network',
            'mega': 'Mega Network', 'family': 'Family Tree', 'architektur': 'Architecture',
            'royal_family': 'Royal Family', 'us_legal_system_actors': 'US Legal System'
        };
        return nameMap[filename] || filename.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // --- Public API for main.js ---

    public updateFileInfo(filename: string, nodeCount: number, edgeCount: number, bounds: Bounds) {
        const elFilename = document.getElementById('fileFilename');
        if (elFilename) elFilename.textContent = `Dateiname: ${filename}`;

        if (this.statsUI) {
            this.statsUI.updateGraphStats(nodeCount, edgeCount);
            if (bounds) this.statsUI.updateBounds(bounds);
        }
    }

    public updateFps(fps: number) {
        if (this.statsUI) {
            this.statsUI.updateFps(fps);
        }
    }
    // ... rest of methods

    updateVisualMappings(mappings: VisualMappings) {
        if (!this.visualMappingPanel) return; // Not available in new sidebar structure

        this.visualMappingPanel.bind(mappings, (newMappings) => {
            if (this.app.updateVisualMappings) {
                this.app.updateVisualMappings(newMappings);
            } else {
                console.warn('App does not implemented updateVisualMappings');
            }
        });

        if (this.legendPanel) {
            this.legendPanel.updateMappings(mappings);
        }

        this.updateAllPanelPositions();
    }

    showInfoPanelFor(object: any) {
        if (!this.panels.info || !this.infoPanelContent) return;

        let content = '';
        if (object.userData.type === 'node' || object.userData.geometryType) { // Handle node mesh or helper
            // Use nodeManager instead of nodeObjectsManager
            const nodeData = object.userData.nodeData || object.userData.entity;
            const geometryType = object.userData.geometryType || 'sphere';
            // Correct call to nodeManager
            const geometryInfo = this.app.nodeManager.getNodeTypeInfo ?
                this.app.nodeManager.getNodeTypeInfo(geometryType) : { name: geometryType, faces: 0 };

            content = `
                <p><strong>Typ:</strong> Node</p>
                <p><strong>Name:</strong> ${nodeData?.name || nodeData?.label || 'Unbenannt'}</p>
                <p><strong>ID:</strong> ${nodeData?.id || 'Unbekannt'}</p>
                <p><strong>Geometrie:</strong> ${geometryInfo.name} (${geometryInfo.faces} Vertices/Faces)</p>
            `;
        } else if (object.userData.type === 'edge') {
            const { name, index } = object.userData;
            // start/end might be Vector3 in new EdgeObjectsManager.
            // But we might have 'edge' data in userData.edge
            const edgeData = object.userData.edge;
            const sourceInfo = edgeData ? (edgeData.source || edgeData.start) : 'Unknown';
            const targetInfo = edgeData ? (edgeData.target || edgeData.end) : 'Unknown';

            content = `
                <p><strong>Typ:</strong> Edge</p>
                <p><strong>Name:</strong> ${name || edgeData?.label || 'Unbenannt'}</p>
                <p><strong>Verbindung:</strong> ${sourceInfo} ↔ ${targetInfo}</p>
                <p><strong>Index:</strong> ${index !== undefined ? index : 'Unbekannt'}</p>
            `;
        } else {
            content = '<p>Keine Detailansicht für dieses Objekt.</p>';
        }

        this.infoPanelContent.innerHTML = content;
        // Show floating panel (remove hidden class)
        this.panels.info.classList.remove('hidden');
        this.panels.info.classList.remove('collapsed');

        // Update title based on object type
        const titleEl = document.getElementById('infoPanelTitle');
        if (titleEl) {
            const nodeData = object.userData.nodeData || object.userData.entity;
            const name = nodeData?.name || nodeData?.label || object.userData.name || 'Info';
            titleEl.textContent = name;
        }
    }

    showMultiSelectionInfo(objects: Set<THREE.Object3D>) {
        if (!this.panels.info || !this.infoPanelContent) return;

        let rows = '';
        objects.forEach(obj => {
            const type = obj.userData.type || 'Unknown';
            let name = 'Unbenannt';

            if (type === 'node') {
                const nodeData = obj.userData.nodeData || obj.userData.entity;
                name = nodeData?.name || nodeData?.label || name;
            } else if (type === 'edge') {
                const edgeData = obj.userData.edge;
                name = obj.userData.name || edgeData?.label || name;
            }

            rows += `
                <tr class="selectable-row" data-id="${obj.uuid}" style="cursor: pointer;" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor=''">
                    <td>${name}</td>
                    <td><span class="type-tag ${type}">${type}</span></td>
                </tr>
            `;
        });

        const content = `
            <p style="margin-bottom: 10px; font-weight: 600; color: var(--accent-color);">
                ${objects.size} Objekte ausgewählt
            </p>
            <table class="selection-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
            <button class="action-button" style="margin-top: 15px; font-size: 11px;">Gruppe erstellen (Beta)</button>
        `;

        this.infoPanelContent.innerHTML = content;

        const titleEl = document.getElementById('infoPanelTitle');
        if (titleEl) {
            titleEl.textContent = 'Mehrfachauswahl';
        }

        this.panels.info.classList.remove('hidden');
        this.panels.info.classList.remove('collapsed');
        if (this.panelToggles.info) this.panelToggles.info.innerHTML = 'v';
    }

    initEdgeControls() {
        const thicknessSlider = document.getElementById('edgeThicknessSlider') as HTMLInputElement;
        const thicknessValue = document.getElementById('edgeThicknessValue') as HTMLSpanElement;
        const tubularSlider = document.getElementById('edgeSegmentsSlider') as HTMLInputElement;
        const tubularValue = document.getElementById('edgeSegmentsValue') as HTMLSpanElement;
        const radialSlider = document.getElementById('edgeRadialSlider') as HTMLInputElement;
        const radialValue = document.getElementById('edgeRadialValue') as HTMLSpanElement;
        const highlightSlider = document.getElementById('edgeHighlightSlider') as HTMLInputElement;
        const highlightValue = document.getElementById('edgeHighlightValue') as HTMLSpanElement;
        const selectionSlider = document.getElementById('edgeSelectionSlider') as HTMLInputElement;
        const selectionValue = document.getElementById('edgeSelectionValue') as HTMLSpanElement;
        const curveSlider = document.getElementById('edgeCurveSlider') as HTMLInputElement;
        const curveValue = document.getElementById('edgeCurveValue') as HTMLSpanElement;
        const pulseSlider = document.getElementById('edgePulseSlider') as HTMLInputElement;
        const pulseValue = document.getElementById('edgePulseValue');
        const animModeSelect = document.getElementById('edgeAnimModeSelect') as HTMLSelectElement;
        const opacitySlider = document.getElementById('edgeOpacitySlider') as HTMLInputElement;
        const opacityValue = document.getElementById('edgeOpacityValue');
        const resetButton = document.getElementById('resetEdgeControls');

        const updateStateAndRefresh = (key: string, value: State[keyof State]) => {
            this.stateManager.update({ [key]: value });
            if (this.app.edgeObjectsManager) {
                if (this.app.currentEntities && this.app.currentRelationships) {
                    this.app.edgeObjectsManager.updateEdges(this.app.currentRelationships, this.app.currentEntities);
                }
            }
        };

        if (thicknessSlider && thicknessValue) {
            thicknessValue.textContent = parseFloat(thicknessSlider.value).toFixed(2);
            thicknessSlider.addEventListener('input', (e) => {
                const value = parseFloat((e.target as HTMLInputElement).value);
                thicknessValue.textContent = value.toFixed(2);
                updateStateAndRefresh('edgeThickness', value);
            });
        }

        if (tubularSlider && tubularValue) {
            tubularValue.textContent = tubularSlider.value;
            tubularSlider.addEventListener('input', (e) => {
                const value = parseInt((e.target as HTMLInputElement).value);
                tubularValue.textContent = value.toString();
                updateStateAndRefresh('edgeTubularSegments', value);
            });
        }

        if (radialSlider && radialValue) {
            radialValue.textContent = radialSlider.value;
            radialSlider.addEventListener('input', (e) => {
                const value = parseInt((e.target as HTMLInputElement).value);
                radialValue.textContent = value.toString();
                updateStateAndRefresh('edgeRadialSegments', value);
            });
        }

        if (curveSlider && curveValue) {
            curveValue.textContent = this.sliderToCurvature(parseFloat(curveSlider.value)).toFixed(2);
            curveSlider.addEventListener('input', (e) => {
                const sliderVal = parseFloat((e.target as HTMLInputElement).value);
                const curvature = this.sliderToCurvature(sliderVal);
                curveValue.textContent = curvature.toFixed(2);
                updateStateAndRefresh('edgeCurveFactor', curvature);
            });
        }

        if (highlightSlider && highlightValue) {
            const initialVal = this.stateManager.state.highlightThickness;
            highlightSlider.value = this.highlightPercentToSlider(initialVal).toString();
            highlightValue.textContent = `${initialVal.toFixed(0)}%`;

            highlightSlider.addEventListener('input', (e) => {
                const sliderVal = parseFloat((e.target as HTMLInputElement).value);
                const percent = this.sliderToHighlightPercent(sliderVal);
                highlightValue.textContent = `${percent.toFixed(0)}%`;
                this.stateManager.update({ highlightThickness: percent });
                // Note: We don't always need to refresh all edges, but highlighting is dynamic anyway.
                // However, if an object is already highlighted, we might want to refresh it.
                if (this.app.highlightManager) {
                    this.app.highlightManager.updateHighlights(this.stateManager.state);
                }
            });
        }

        if (selectionSlider && selectionValue) {
            const initialVal = this.stateManager.state.selectionThickness;
            selectionSlider.value = initialVal.toString();
            selectionValue.textContent = `${initialVal.toFixed(0)}%`;

            selectionSlider.addEventListener('input', (e) => {
                const value = parseFloat((e.target as HTMLInputElement).value);
                selectionValue.textContent = `${value.toFixed(0)}%`;
                this.stateManager.update({ selectionThickness: value });
                if (this.app.highlightManager) {
                    this.app.highlightManager.updateHighlights(this.stateManager.state);
                }
            });
        }

        if (pulseSlider && pulseValue) {
            pulseValue.textContent = parseFloat(pulseSlider.value).toFixed(2);
            pulseSlider.addEventListener('input', (e) => {
                const value = parseFloat((e.target as HTMLInputElement).value);
                pulseValue.textContent = value.toFixed(2);
                updateStateAndRefresh('edgePulseSpeed', value);
            });
        }

        if (animModeSelect) {
            animModeSelect.addEventListener('change', (e) => {
                const value = (e.target as HTMLSelectElement).value;
                updateStateAndRefresh('edgeAnimationMode', value);
            });
        }

        if (opacitySlider && opacityValue) {
            opacityValue.textContent = parseFloat(opacitySlider.value).toFixed(2);
            opacitySlider.addEventListener('input', (e) => {
                const value = parseFloat((e.target as HTMLInputElement).value);
                opacityValue.textContent = value.toFixed(2);
                this.updateEdgeOpacity(value);
            });
        }

        if (resetButton) {
            resetButton.addEventListener('click', () => {
                const defaults = {
                    edgeThickness: 0.1,
                    edgeTubularSegments: 20,
                    edgeRadialSegments: 8,
                    edgeCurveFactor: 0.4,
                    edgePulseSpeed: 1.0,
                    highlightThickness: 10,
                    selectionThickness: 20,
                    edgeAnimationMode: 'pulse',
                    edgeOpacity: 1.0
                };

                // Update UI elements
                if (thicknessSlider) thicknessSlider.value = defaults.edgeThickness.toString();
                if (thicknessValue) thicknessValue.textContent = defaults.edgeThickness.toFixed(2);
                if (tubularSlider) tubularSlider.value = defaults.edgeTubularSegments.toString();
                if (tubularValue) tubularValue.textContent = defaults.edgeTubularSegments.toString();
                if (radialSlider) radialSlider.value = defaults.edgeRadialSegments.toString();
                if (radialValue) radialValue.textContent = defaults.edgeRadialSegments.toString();
                if (curveSlider) curveSlider.value = this.curvatureToSlider(defaults.edgeCurveFactor).toString();
                if (curveValue) curveValue.textContent = defaults.edgeCurveFactor.toFixed(2);
                if (pulseSlider) pulseSlider.value = defaults.edgePulseSpeed.toString();
                if (pulseValue) pulseValue.textContent = defaults.edgePulseSpeed.toFixed(2);
                if (highlightSlider) highlightSlider.value = this.highlightPercentToSlider(defaults.highlightThickness).toString();
                if (highlightValue) highlightValue.textContent = `${defaults.highlightThickness}%`;
                if (selectionSlider) selectionSlider.value = defaults.selectionThickness.toString();
                if (selectionValue) selectionValue.textContent = `${defaults.selectionThickness}%`;
                if (animModeSelect) animModeSelect.value = defaults.edgeAnimationMode;
                if (opacitySlider) opacitySlider.value = defaults.edgeOpacity.toString();
                if (opacityValue) opacityValue.textContent = defaults.edgeOpacity.toFixed(2);

                // Update State and refresh
                this.stateManager.update(defaults);
                if (this.app.edgeObjectsManager && this.app.currentEntities && this.app.currentRelationships) {
                    this.app.edgeObjectsManager.updateEdges(this.app.currentRelationships, this.app.currentEntities);
                }
                this.updateEdgeOpacity(defaults.edgeOpacity);
            });
        }
    }

    updateEdgeThickness(_thickness: number) {
        // This is now handled within initEdgeControls via updateStateAndRefresh
    }

    updateEdgeOpacity(opacity: number) {
        if (this.app.edgeObjectsManager) {
            // Update opacity for existing edge meshes
            const edgeMeshes = this.app.edgeObjectsManager.getMeshes();
            edgeMeshes.forEach((mesh: any) => {
                if (mesh.material) {
                    mesh.material.transparent = opacity < 1.0;
                    mesh.material.opacity = opacity;
                    mesh.material.needsUpdate = true;
                }
            });
        }
    }

    collapseInfoPanel() {
        if (!this.panels.info) return;
        this.panels.info.classList.add('hidden');
        
        const titleEl = document.getElementById('infoPanelTitle');
        if (titleEl) {
            titleEl.textContent = 'Info';
        }

        if (this.infoPanelContent) this.infoPanelContent.innerHTML = '';
    }
}
