/**
 * UIManager - Manages all HTML UI components and interactions.
 * This class encapsulates all logic for panels, buttons, and other UI elements.
 */
import type { App } from '../App';
import { StateManager } from './StateManager';

interface Bounds {
    x: { min: number, max: number };
    y: { min: number, max: number };
    z: { min: number, max: number };
}

export class UIManager {
    private app: App;
    private stateManager: StateManager;
    private panels: { [key: string]: HTMLElement | null };
    private panelToggles: { [key: string]: HTMLElement | null };
    private filePanelContent: HTMLElement | null;
    private infoPanelContent: HTMLElement | null;

    constructor(app: App) {
        this.app = app;
        this.stateManager = app.stateManager;

        this.panels = {
            fileInfo: document.getElementById('fileInfoPanel'),
            file: document.getElementById('filePanel'),
            info: document.getElementById('infoPanel'),
            dev: document.getElementById('devPanel'),
            layout: null // Initialized by LayoutGUI
        };

        this.panelToggles = {
            fileInfo: document.getElementById('fileInfoToggle'),
            file: document.getElementById('filePanelToggle'),
            info: document.getElementById('infoPanelToggle'),
            dev: document.getElementById('devPanelToggle')
        };

        this.filePanelContent = document.getElementById('filePanelContent');
        this.infoPanelContent = document.getElementById('infoPanelContent');

        this.stateManager.subscribe(this.handleStateChange.bind(this), 'ui');
    }

    init() {
        console.log('Initializing UIManager...');
        this.initPanelToggling();
        this.initPanelPositioning();
        this.initHighlightToggle();
        this.loadAvailableFiles();
        // The search panel is initialized in main.js, this could also be moved here later.
    }

    handleStateChange(state: any) {
        // Handle changes related to UI, e.g., showing/hiding panels based on selected objects.
        if (state.selectedObject) {
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
                toggle.addEventListener('mouseenter', () => toggle.style.backgroundColor = 'rgba(128, 128, 128, 0.2)');
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
        const mainStackOrder = ['fileInfo', 'file', 'layout', 'dev'];
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
                slider.style.backgroundColor = '#4CAF50';
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

        const files = await this.fetchDirectoryContents();
        this.createFileButtons(files);
        // Refresh button could be added here if desired
    }

    async fetchDirectoryContents(): Promise<string[]> {
        // Use Vite's import.meta.glob to dynamically discover all JSON files in public/data/
        // This is evaluated at build time, so it automatically finds all files
        const dataFiles = import.meta.glob('/public/data/*.json');

        // Extract filenames without path and extension
        const filenames = Object.keys(dataFiles).map(path => {
            // Extract filename from '/public/data/filename.json'
            const match = path.match(/\/public\/data\/(.+)\.json$/);
            return match ? match[1] : '';
        }).filter(name => name !== ''); // Remove empty strings

        console.log('Discovered data files:', filenames);
        return filenames.sort(); // Sort alphabetically
    }

    createFileButtons(filenames: string[]) {
        if (!this.filePanelContent) return;

        this.filePanelContent.innerHTML = '';
        if (filenames.length === 0) {
            this.filePanelContent.innerHTML = '<div style="padding: 10px; text-align: center; color: #999;">No files found</div>';
            return;
        }

        filenames.forEach(filename => {
            const button = document.createElement('div');
            button.className = 'file-item';
            button.textContent = this.createDisplayName(filename);

            button.onclick = (event) => {
                // Remove active class from all other buttons
                document.querySelectorAll('.file-item.active').forEach(item => item.classList.remove('active'));
                // Add active class to clicked button
                (event.target as HTMLElement).classList.add('active');
                // Load data
                this.app.loadData(`data/${filename}.json`);
            };

            this.filePanelContent!.appendChild(button);
        });
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

    updateFileInfo(filename: string, nodeCount: number, edgeCount: number, bounds: Bounds) {
        const elFilename = document.getElementById('fileFilename');
        if (elFilename) elFilename.textContent = `Dateiname: ${filename}`;

        const elNodeCount = document.getElementById('fileNodeCount');
        if (elNodeCount) elNodeCount.textContent = `Anzahl Knoten: ${nodeCount}`;

        const elEdgeCount = document.getElementById('fileEdgeCount');
        if (elEdgeCount) elEdgeCount.textContent = `Anzahl Kanten: ${edgeCount}`;

        if (bounds) {
            const elX = document.getElementById('fileXAxis');
            if (elX) elX.textContent = `X-Achse: ${bounds.x.min.toFixed(2)} bis ${bounds.x.max.toFixed(2)}`;

            const elY = document.getElementById('fileYAxis');
            if (elY) elY.textContent = `Y-Achse: ${bounds.y.min.toFixed(2)} bis ${bounds.y.max.toFixed(2)}`;

            const elZ = document.getElementById('fileZAxis');
            if (elZ) elZ.textContent = `Z-Achse: ${bounds.z.min.toFixed(2)} bis ${bounds.z.max.toFixed(2)}`;
        }
    }

    updateFps(fps: number) {
        const fpsElement = document.getElementById('fileFPS');
        if (fpsElement) {
            fpsElement.textContent = `FPS: ${fps}`;
        }
    }

    showInfoPanelFor(object: any) {
        if (!this.panels.info || !this.infoPanelContent) return;

        let content = '';
        if (object.userData.type === 'node') {
            const { nodeData, geometryType } = object.userData;
            const geometryInfo = this.app.nodeObjectsManager.getNodeTypeInfo(geometryType);
            content = `
                <p><strong>Typ:</strong> Node</p>
                <p><strong>Name:</strong> ${nodeData.name || 'Unbenannt'}</p>
                <p><strong>ID:</strong> ${nodeData.id || 'Unbekannt'}</p>
                <p><strong>Geometrie:</strong> ${geometryInfo.name} (${geometryInfo.faces} Flächen)</p>
            `;
        } else if (object.userData.type === 'edge') {
            const { name, start, end, index } = object.userData;
            content = `
                <p><strong>Typ:</strong> Edge</p>
                <p><strong>Name:</strong> ${name || 'Unbenannt'}</p>
                <p><strong>Verbindung:</strong> Knoten ${start} ↔ Knoten ${end}</p>
                <p><strong>Index:</strong> ${index || 'Unbekannt'}</p>
            `;
        } else {
            content = '<p>Keine Detailansicht für dieses Objekt.</p>';
        }

        this.infoPanelContent.innerHTML = content;
        this.panels.info.classList.remove('collapsed');
        if (this.panelToggles.info) this.panelToggles.info.innerHTML = 'v';
    }

    collapseInfoPanel() {
        if (!this.panels.info) return;
        // Do not auto-collapse the panel
        // this.panels.info.classList.add('collapsed');
        // if (this.panelToggles.info) this.panelToggles.info.innerHTML = '>';
        if (this.infoPanelContent) this.infoPanelContent.innerHTML = '<p>Kein Objekt ausgewählt</p>';
    }
}
