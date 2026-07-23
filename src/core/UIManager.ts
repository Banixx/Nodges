/**
 * UIManager - Manages all HTML UI components and interactions.
 * This class encapsulates all logic for panels, buttons, and other UI elements.
 */
import type { App } from '../App';
import { IStateManager } from './interfaces';
import type { State } from './StateManager';
import { EnvironmentPanel } from '../ui/EnvironmentPanel';
import { ViewPanel } from '../ui/ViewPanel';
import { StatsUI } from '../ui/StatsUI';

import { DevPanel } from '../ui/DevPanel';
import { LegendPanel } from '../ui/LegendPanel';
import { CreatePanel } from '../ui/CreatePanel';
import { FilePanelUI } from '../ui/FilePanelUI';
import { InfoPanelUI } from '../ui/InfoPanelUI';
import { EdgeControlsUI } from '../ui/EdgeControlsUI';
import { VisualMappings } from '../types';
import { MappingUI } from '../ui/MappingUI';
import { getAvailableProperties } from './BuildFormatUtils';
import { TimePlayerUI } from '../ui/TimePlayerUI';

interface Bounds {
    x: { min: number, max: number };
    y: { min: number, max: number };
    z: { min: number, max: number };
}

export class UIManager {
    private app: App;
    private stateManager: IStateManager;
    public mappingUI!: MappingUI;
    private legendPanel: LegendPanel;

    // New Components
    private statsUI: StatsUI;

    constructor(app: App) {
        this.app = app;
        this.stateManager = app.stateManager;

        // Initialize Sub-Components
        this.statsUI = new StatsUI(this.stateManager);

        // Initialize new FilePanelUI
        new FilePanelUI('filePanelContent', this.stateManager, this.app);

        // Initialize new InfoPanelUI
        new InfoPanelUI('infoPanel', this.stateManager, this.app);

        // Initialize new EdgeControlsUI
        new EdgeControlsUI(this.stateManager, this.app);

        // Initialize new ViewPanel for the 'Ansicht' tab (self-registers with StateManager)
        new ViewPanel('viewPanelContent', this.stateManager);

        // Initialize new interactive Mapping panel (floating overlay like minimap)
        const mappingContent = document.getElementById('mappingPanelContainer');
        if (mappingContent) {
            this.mappingUI = new MappingUI('mappingPanelContainer');
        } else {
            console.warn('mappingPanelContainer not found');
        }

        // Initialize Environment panel
        new EnvironmentPanel('environmentContent', this.stateManager);

        // Initialize Create panel
        new CreatePanel('createPanelContent', this.stateManager, this.app);

        // Initialize DevPanel
        new DevPanel('devPanelContent', this.stateManager);

        // Initialize Legend Panel
        this.legendPanel = new LegendPanel('legendContainer', this.stateManager);

        // Initialize Time Player UI (Build 4)
        new TimePlayerUI(this.stateManager, this.app);

        this.initModeSwitch();
        this.stateManager.subscribe(this.handleStateChange.bind(this), 'ui');
        this.updateUIForMode(this.stateManager.state.complexityMode);
    }

    init() {
        console.log('Initializing UIManager...');
    }

    private initModeSwitch() {
        const radios = document.querySelectorAll('input[name="mainUiMode"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const mode = (e.target as HTMLInputElement).value as any;
                if (mode) {
                    this.stateManager.update({ complexityMode: mode });
                }
            });
        });
    }

    private updateUIForMode(mode: 'simple' | 'expert' | 'dev') {
        // 1. Update body class
        document.body.classList.remove('ui-mode-simple', 'ui-mode-expert', 'ui-mode-dev');
        document.body.classList.add(`ui-mode-${mode}`);

        // 2. Sync UI radio inputs (CSS takes care of the thumb and colors)
        const inputs = document.querySelectorAll('.nodges-slide-toggle input[name="mainUiMode"]') as NodeListOf<HTMLInputElement>;
        inputs.forEach(input => {
            if (input.value === mode) {
                input.checked = true;
            }
        });

        // 3. Check if currently active tab has been hidden

        // 4. Update horizontal scrollbar for tabs
        const activeTabButton = document.querySelector('.sidebar-tab.active');
        if (activeTabButton) {
            const minMode = activeTabButton.getAttribute('data-min-mode') || 'simple';
            let isVisible = true;
            if (mode === 'simple' && minMode !== 'simple') isVisible = false;
            if (mode === 'expert' && minMode === 'dev') isVisible = false;

            if (!isVisible) {
                // Switch to default system tab
                const systemTabBtn = document.querySelector('.sidebar-tab[data-tab="tab-system"]') as HTMLElement;
                if (systemTabBtn) {
                    systemTabBtn.click();
                }
            }
        }

        // 4. Update horizontal scrollbar for tabs
        const tabsContainer = document.querySelector('.sidebar-tabs') as HTMLElement;
        const scrollbar = document.getElementById('sidebarTabsScrollbar');
        const scrollbarThumb = document.getElementById('sidebarTabsScrollbarThumb');
        if (tabsContainer && scrollbar && scrollbarThumb) {
            const clientWidth = tabsContainer.clientWidth;
            const scrollWidth = tabsContainer.scrollWidth;
            const scrollLeft = tabsContainer.scrollLeft;

            if (scrollWidth <= clientWidth) {
                scrollbar.style.display = 'none';
            } else {
                scrollbar.style.display = 'block';
                const ratio = clientWidth / scrollWidth;
                const thumbWidth = clientWidth * ratio;
                const maxScrollLeft = scrollWidth - clientWidth;
                const maxThumbLeft = clientWidth - thumbWidth;
                const thumbLeft = maxScrollLeft > 0 ? (scrollLeft / maxScrollLeft) * maxThumbLeft : 0;

                scrollbarThumb.style.width = `${thumbWidth}px`;
                scrollbarThumb.style.transform = `translateX(${thumbLeft}px)`;
            }
        }
    }

    handleStateChange(state: State) {
        // Only set cursor based on hover, InfoPanel handles the rest
        document.body.style.cursor = state.hoveredObject ? 'pointer' : 'default';

        if (state.complexityMode) {
            this.updateUIForMode(state.complexityMode);
        }
    }

    // --- Public API for main.js ---

    public updateFileInfo(filename: string, nodeCount: number, edgeCount: number, bounds: Bounds, schemaVersion?: string) {
        const elFilename = document.getElementById('fileFilename');
        if (elFilename) elFilename.textContent = filename;

        // Build-Label aus schemaVersion ableiten
        const sv = schemaVersion || '3.0';
        let buildLabel: string;
        if (sv.includes('4') || sv === '4.0') {
            buildLabel = 'Build 4';
        } else if (sv.includes('3') || sv === '3.0') {
            buildLabel = 'Build 3';
        } else {
            buildLabel = `Schema: ${sv}`;
        }

        const elSchema = document.getElementById('fileSchemaVersion');
        if (elSchema) elSchema.textContent = buildLabel;
        
        if (this.mappingUI) {
            this.mappingUI.updateSchema(buildLabel);
        }

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

    public getAvailableAttributes(): Record<string, string[]> {
        const result: Record<string, string[]> = {};
        const graphData = (this.app as any).currentGraphData;
        if (!graphData) return result;

        const dataModel = graphData.dataModel;

        const allNodeAttrs = new Set<string>([
            'constant', 'id', 
            'position',
            'algo:force-directed', 'algo:fruchterman-reingold', 'algo:spring-embedder', 
            'algo:hierarchical', 'algo:tree', 'algo:circular', 'algo:grid', 'algo:random'
        ]);
        const allEdgeAttrs = new Set<string>(['constant', 'id', 'source', 'target']);

        const entities = graphData.data?.entities || [];
        entities.forEach((e: any) => {
            getAvailableProperties(dataModel, undefined, e).forEach(k => {
                allNodeAttrs.add(k);
            });
        });

        const relationships = graphData.data?.relationships || [];
        relationships.forEach((r: any) => {
            getAvailableProperties(dataModel, undefined, r).forEach(k => {
                if (k !== 'offset') allEdgeAttrs.add(k);
            });
        });

        // Add global types only
        result['global_node'] = Array.from(allNodeAttrs);
        result['global_edge'] = Array.from(allEdgeAttrs);

        return result;
    }

    updateVisualMappings(mappings: VisualMappings) {
        const availableAttributes = this.getAvailableAttributes();

        if (this.mappingUI) {
            const dataModel = (this.app as any).currentGraphData?.dataModel || null;
            const entities = (this.app as any).currentGraphData?.data?.entities || [];
            const relationships = (this.app as any).currentGraphData?.data?.relationships || [];
            const originalMappings = (this.app as any).originalVisualMappings || null;
            this.mappingUI.bind(mappings, availableAttributes, dataModel, entities, relationships, originalMappings, (newMappings) => {
                if (this.app.updateVisualMappings) {
                    this.app.updateVisualMappings(newMappings);
                } else {
                    console.warn('App does not implement updateVisualMappings');
                }
            });
        }

        if (this.legendPanel) {
            this.legendPanel.updateMappings(mappings);
        }
    }
}
