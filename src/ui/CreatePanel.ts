/**
 * CreatePanel - UI component for the "Create" tab
 * Allows users to generate new nodes and edges using an LLM.
 */
import { IStateManager } from '../core/interfaces';
import type { App } from '../App';
import { LLMService, LLMProvider, LLMModel } from '../utils/LLMService';
import { LightRAGService } from '../utils/LightRAGService';
import { DataParser } from '../core/DataParser';
import { deduplicateGraph, getSemanticSearchMatches } from '../utils/VectorStoreManager';
import * as THREE from 'three';
import { GraphGenerationService } from '../utils/GraphGenerationService';

export class CreatePanel {
    private container: HTMLElement;
    private app: App;
    private stateManager: IStateManager;

    private providerSelect!: HTMLSelectElement;
    private keyInput!: HTMLInputElement;
    private modelContainer!: HTMLElement;
    private modelInput!: HTMLInputElement;
    private modelDropdown!: HTMLElement;
    private selectedModelId: string = '';
    private currentModelsList: { id: string, name: string, isRecommended: boolean }[] = [];
    private pipelineSelect!: HTMLSelectElement;
    private ragTextarea!: HTMLTextAreaElement;
    private urlInput!: HTMLInputElement;
    private promptTextarea!: HTMLTextAreaElement;
    private modifyBtn!: HTMLButtonElement;
    private regenerateBtn!: HTMLButtonElement;
    private statusText!: HTMLElement;
    private chatLog!: HTMLDivElement;
    private clarificationHistory: {role: 'user'|'assistant', content: string}[] = [];

    // Build 10 Properties
    private build10Container!: HTMLElement;
    private b10GroundingSelect!: HTMLSelectElement;
    private b10QaSelect!: HTMLSelectElement;
    private b10RatingSelect!: HTMLSelectElement;
    private saveStepsToggle!: HTMLInputElement;

    // Advanced LLM Properties
    private llmParamsContainer!: HTMLElement;
    private tempSlider!: HTMLInputElement;
    private topPSlider!: HTMLInputElement;
    private topKSlider!: HTMLInputElement;

    // Relation Set Properties
    private activeRelationSet: { id: string; label: string; description?: string; enabled: boolean }[] = [];
    private relationListContainer!: HTMLElement;

    // Generation Naming Helper
    private generationCounter = 1;

    private getFormattedFileSuffix(): string {
        const counter = String(this.generationCounter++).padStart(2, '0');
        const day = String(new Date().getDate()).padStart(2, '0');
        return `${counter}_${day}`;
    }

    constructor(containerId: string, _stateManager: IStateManager, app: App) {
        const el = document.getElementById(containerId);
        if (!el) {
            console.warn(`[CreatePanel] Container '${containerId}' not found. Creating stub.`);
            this.container = document.createElement('div');
        } else {
            this.container = el;
        }

        this.stateManager = _stateManager;
        this.app = app;
        this.render();
    }

    private resetChatState() {
        this.clarificationHistory = [];
        if (this.chatLog) {
            this.chatLog.style.display = 'none';
            this.chatLog.innerHTML = '';
        }
        if (this.modifyBtn) {
            this.modifyBtn.textContent = 'Modifizieren';
        }
        if (this.regenerateBtn) {
            this.regenerateBtn.textContent = 'Neu Generieren';
        }
    }

    private updateChatUI() {
        if (this.clarificationHistory.length === 0) {
            this.chatLog.style.display = 'none';
            return;
        }
        this.chatLog.style.display = 'flex';
        this.chatLog.innerHTML = '';
        this.clarificationHistory.forEach(msg => {
            const bubble = document.createElement('div');
            bubble.style.padding = '8px';
            bubble.style.borderRadius = '4px';
            bubble.style.marginBottom = '4px';
            bubble.style.maxWidth = '90%';
            if (msg.role === 'user') {
                bubble.style.backgroundColor = 'rgba(0, 120, 255, 0.2)';
                bubble.style.alignSelf = 'flex-end';
                bubble.textContent = `Du: ${msg.content}`;
            } else {
                bubble.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                bubble.style.alignSelf = 'flex-start';
                bubble.textContent = `KI: ${msg.content}`;
            }
            this.chatLog.appendChild(bubble);
        });
        this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }

    public getActiveRelationLabels(): string[] {
        return this.activeRelationSet.filter(r => r.enabled).map(r => r.label || r.id);
    }

    private async loadRelationSetFile(filename: string) {
        try {
            const baseUrl = import.meta.env.BASE_URL || '/';
            const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
            const url = `${cleanBase}relationsets/${filename}`;
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`HTTP Error ${res.status}`);
            }
            const data = await res.json();
            if (data.relations && Array.isArray(data.relations)) {
                this.activeRelationSet = data.relations.map((r: any) => ({
                    id: r.id || r.label,
                    label: r.label || r.id,
                    description: r.description || '',
                    enabled: r.enabled !== false
                }));
                this.renderRelationList();
                this.triggerLiveRelationNormalization();
                this.setStatus(`Relation Set '${data.name || filename}' geladen (${this.activeRelationSet.length} Einträge).`, 'info');
            }
        } catch (err) {
            console.warn(`[CreatePanel] Error loading relation set ${filename}:`, err);
            this.setStatus(`Fehler beim Laden von ${filename}.`, 'info');
        }
    }

    private triggerLiveRelationNormalization() {
        if (!this.app || !this.app.stateManager) return;
        const currentData = this.app.stateManager.state.currentGraphData;
        if (currentData && currentData.data && Array.isArray(currentData.data.relationships)) {
            const parsed = DataParser.parse(currentData);
            this.app.stateManager.setGraphData(parsed.data.entities, parsed.data.relationships);
        }
    }

    private saveRelationSetFile() {
        const data = {
            name: `Custom Relation Set (${new Date().toLocaleDateString()})`,
            description: 'Benutzerdefiniertes Beziehungs-Set aus Nodges',
            relations: this.activeRelationSet
        };
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `custom_relations_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.setStatus('Relation Set als JSON heruntergeladen.', 'success');
    }

    private renderRelationList() {
        if (!this.relationListContainer) return;
        this.relationListContainer.innerHTML = '';

        if (this.activeRelationSet.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'Keine Beziehungen definiert.';
            emptyMsg.style.color = 'var(--text-muted)';
            emptyMsg.style.fontSize = '11px';
            emptyMsg.style.margin = '4px';
            this.relationListContainer.appendChild(emptyMsg);
            return;
        }

        this.activeRelationSet.forEach((item, index) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.justifyContent = 'space-between';
            row.style.padding = '6px 4px';
            row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

            const left = document.createElement('div');
            left.style.display = 'flex';
            left.style.alignItems = 'center';
            left.style.gap = '8px';
            left.style.flex = '1';
            left.style.minWidth = '0';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.enabled;
            checkbox.style.cursor = 'pointer';
            checkbox.style.flexShrink = '0';
            checkbox.onchange = () => {
                item.enabled = checkbox.checked;
                label.style.color = item.enabled ? 'var(--text-color)' : 'var(--text-muted)';
                this.triggerLiveRelationNormalization();
            };

            const textWrapper = document.createElement('div');
            textWrapper.style.display = 'flex';
            textWrapper.style.flexDirection = 'column';
            textWrapper.style.minWidth = '0';
            textWrapper.style.overflow = 'hidden';

            const label = document.createElement('span');
            label.textContent = item.label || item.id;
            label.style.fontWeight = '600';
            label.style.fontSize = '12px';
            label.style.whiteSpace = 'nowrap';
            label.style.overflow = 'hidden';
            label.style.textOverflow = 'ellipsis';
            label.style.color = item.enabled ? 'var(--text-color)' : 'var(--text-muted)';

            textWrapper.appendChild(label);

            if (item.description) {
                const desc = document.createElement('span');
                desc.textContent = item.description;
                desc.style.fontSize = '10px';
                desc.style.color = 'rgba(255,255,255,0.4)';
                desc.style.whiteSpace = 'nowrap';
                desc.style.overflow = 'hidden';
                desc.style.textOverflow = 'ellipsis';
                textWrapper.appendChild(desc);
            }

            left.appendChild(checkbox);
            left.appendChild(textWrapper);

            const delBtn = document.createElement('button');
            delBtn.textContent = '×';
            delBtn.style.border = 'none';
            delBtn.style.background = 'transparent';
            delBtn.style.color = 'rgba(255,100,100,0.7)';
            delBtn.style.cursor = 'pointer';
            delBtn.style.fontSize = '16px';
            delBtn.style.padding = '0 6px';
            delBtn.style.flexShrink = '0';
            delBtn.onclick = () => {
                this.activeRelationSet.splice(index, 1);
                this.renderRelationList();
            };

            row.appendChild(left);
            row.appendChild(delBtn);
            this.relationListContainer.appendChild(row);
        });
    }

    private render(): void {
        this.container.innerHTML = '';

        const activeProvider = LLMService.getActiveProvider();

        // --- API KEY SECTION ---
        const keySection = document.createElement('section');
        keySection.className = 'panel-section';
        keySection.style.display = 'block';

        const keyHeader = document.createElement('h4');
        keyHeader.className = 'section-header';
        keyHeader.style.display = 'flex';
        keyHeader.style.justifyContent = 'space-between';
        keyHeader.style.cursor = 'pointer';

        const keyTitle = document.createElement('span');
        keyTitle.textContent = 'LLM API Key & Anbieter (BYOK)';

        const keyToggle = document.createElement('span');
        keyToggle.textContent = '▾';

        keyHeader.appendChild(keyTitle);
        keyHeader.appendChild(keyToggle);

        const keyContent = document.createElement('div');
        keyContent.style.marginTop = '10px';

        const savedKey = LLMService.getApiKey(activeProvider);
        if (savedKey) {
            keyContent.style.display = 'none';
        } else {
            keyContent.style.display = 'block';
            keyToggle.textContent = '▴';
        }

        const keyDesc = document.createElement('p');
        keyDesc.style.color = 'var(--text-muted)';
        keyDesc.style.marginBottom = '8px';
        keyDesc.textContent = 'Dein Key wird im LocalStorage des Browsers gespeichert. Du bist dort verantwortlich. Ich empfehle grundsätzlich limitierte Keys zu verwenden. ';
        
        const freeBtn = document.createElement('button');
        freeBtn.textContent = 'Free';
        freeBtn.className = 'action-button secondary';
        freeBtn.style.padding = '2px 6px';
        freeBtn.style.marginLeft = '5px';
        freeBtn.onclick = () => {
            this.providerSelect.value = 'openrouter';
            LLMService.setActiveProvider('openrouter');
            this.keyInput.value = '';
            LLMService.clearApiKey('openrouter');
            this.updateModelOptions('openrouter');
            
            keyContent.style.display = 'none';
            keyToggle.textContent = '▾';
            this.setStatus('Free-Modus aktiviert (Nutze Deno Proxy).', 'info');
        };
        keyDesc.appendChild(freeBtn);
        
        keyContent.appendChild(keyDesc);

        // Provider Select
        const providerLabel = document.createElement('label');
        providerLabel.textContent = 'Anbieter / Key-Herkunft:';
        providerLabel.style.display = 'block';
        providerLabel.style.color = 'var(--text-muted)';
        providerLabel.style.marginBottom = '4px';
        keyContent.appendChild(providerLabel);

        this.providerSelect = document.createElement('select');
        this.providerSelect.className = 'form-control';
        this.providerSelect.style.width = '100%';
        this.providerSelect.style.marginBottom = '8px';
        this.providerSelect.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        this.providerSelect.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        this.providerSelect.style.color = 'var(--text-color)';
        this.providerSelect.style.padding = '6px';
        this.providerSelect.style.borderRadius = '4px';

        LLMService.PROVIDERS.forEach(provider => {
            const opt = document.createElement('option');
            opt.value = provider.id;
            opt.textContent = provider.name;
            if (provider.id === activeProvider) {
                opt.selected = true;
            }
            this.providerSelect.appendChild(opt);
        });
        keyContent.appendChild(this.providerSelect);

        // Key Input
        const keyInputLabel = document.createElement('label');
        keyInputLabel.textContent = 'API Key:';
        keyInputLabel.style.display = 'block';
        keyInputLabel.style.color = 'var(--text-muted)';
        keyInputLabel.style.marginBottom = '4px';
        keyContent.appendChild(keyInputLabel);

        this.keyInput = document.createElement('input');
        this.keyInput.type = 'password';
        this.keyInput.placeholder = 'Key hier einfügen...';
        this.keyInput.className = 'form-control';
        this.keyInput.style.width = '100%';
        this.keyInput.style.marginBottom = '8px';
        this.keyInput.value = savedKey || '';
        keyContent.appendChild(this.keyInput);

        const saveKeyBtn = document.createElement('button');
        saveKeyBtn.className = 'action-button secondary';
        saveKeyBtn.textContent = 'Key Speichern';
        saveKeyBtn.onclick = () => {
            const provider = this.providerSelect.value as LLMProvider;
            if (this.keyInput.value.trim()) {
                LLMService.setApiKey(provider, this.keyInput.value);
                keyContent.style.display = 'none';
                keyToggle.textContent = '▾';
                this.setStatus(`API-Key für ${provider} lokal gespeichert.`, 'success');
            } else {
                LLMService.clearApiKey(provider);
                this.setStatus(`API-Key für ${provider} entfernt.`, 'info');
            }
        };
        keyContent.appendChild(saveKeyBtn);

        keyHeader.onclick = () => {
            const isHidden = keyContent.style.display === 'none';
            keyContent.style.display = isHidden ? 'block' : 'none';
            keyToggle.textContent = isHidden ? '▴' : '▾';
        };

        keySection.appendChild(keyHeader);
        keySection.appendChild(keyContent);
        this.container.appendChild(keySection);

        // --- RELATION SET SECTION ---
        const relSection = document.createElement('section');
        relSection.className = 'panel-section';

        const relHeader = document.createElement('h4');
        relHeader.className = 'section-header';
        relHeader.style.display = 'flex';
        relHeader.style.justifyContent = 'space-between';
        relHeader.style.cursor = 'pointer';

        const relTitle = document.createElement('span');
        relTitle.textContent = 'Relation Set';

        const relToggle = document.createElement('span');
        relToggle.textContent = '▾';

        relHeader.appendChild(relTitle);
        relHeader.appendChild(relToggle);

        const relContent = document.createElement('div');
        relContent.style.marginTop = '10px';
        relContent.style.display = 'block';

        relHeader.onclick = () => {
            const isHidden = relContent.style.display === 'none';
            relContent.style.display = isHidden ? 'block' : 'none';
            relToggle.textContent = isHidden ? '▾' : '▴';
        };

        // Preset Selector (Full Width Row)
        const presetSelectRow = document.createElement('div');
        presetSelectRow.style.marginBottom = '6px';

        const relPresetSelect = document.createElement('select');
        relPresetSelect.className = 'form-control';
        relPresetSelect.style.width = '100%';
        relPresetSelect.style.backgroundColor = 'rgba(0,0,0,0.3)';
        relPresetSelect.style.border = '1px solid rgba(255,255,255,0.1)';
        relPresetSelect.style.color = 'var(--text-color)';
        relPresetSelect.style.padding = '6px';
        relPresetSelect.style.borderRadius = '4px';
        relPresetSelect.style.boxSizing = 'border-box';

        const presets = [
            { value: 'schweizer_politik_relations.json', name: 'Schweizer Politik & Governance' },
            { value: 'standard_generic_relations.json', name: 'Standard Generisch' },
            { value: 'organisation_und_struktur_relations.json', name: 'Organisation & Struktur' }
        ];
        presets.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.value;
            opt.textContent = p.name;
            relPresetSelect.appendChild(opt);
        });
        presetSelectRow.appendChild(relPresetSelect);
        relContent.appendChild(presetSelectRow);

        // Open / Save Button Row (50% / 50%)
        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.gap = '6px';
        btnRow.style.marginBottom = '8px';

        const openBtn = document.createElement('button');
        openBtn.className = 'action-button secondary';
        openBtn.textContent = 'Laden';
        openBtn.style.flex = '1';
        openBtn.style.padding = '6px';
        openBtn.onclick = () => this.loadRelationSetFile(relPresetSelect.value);

        const saveBtn = document.createElement('button');
        saveBtn.className = 'action-button secondary';
        saveBtn.textContent = 'Speichern';
        saveBtn.style.flex = '1';
        saveBtn.style.padding = '6px';
        saveBtn.onclick = () => this.saveRelationSetFile();

        btnRow.appendChild(openBtn);
        btnRow.appendChild(saveBtn);
        relContent.appendChild(btnRow);

        // Select All / Deselect All Row (50% / 50%)
        const actionRow = document.createElement('div');
        actionRow.style.display = 'flex';
        actionRow.style.gap = '6px';
        actionRow.style.marginBottom = '8px';

        const selectAllBtn = document.createElement('button');
        selectAllBtn.className = 'action-button secondary';
        selectAllBtn.textContent = 'Alle an';
        selectAllBtn.style.flex = '1';
        selectAllBtn.style.padding = '4px 6px';
        selectAllBtn.onclick = () => {
            this.activeRelationSet.forEach(r => r.enabled = true);
            this.renderRelationList();
            this.triggerLiveRelationNormalization();
        };

        const deselectAllBtn = document.createElement('button');
        deselectAllBtn.className = 'action-button secondary';
        deselectAllBtn.textContent = 'Alle aus';
        deselectAllBtn.style.flex = '1';
        deselectAllBtn.style.padding = '4px 6px';
        deselectAllBtn.onclick = () => {
            this.activeRelationSet.forEach(r => r.enabled = false);
            this.renderRelationList();
            this.triggerLiveRelationNormalization();
        };

        actionRow.appendChild(selectAllBtn);
        actionRow.appendChild(deselectAllBtn);
        relContent.appendChild(actionRow);

        // List Container for Checkboxes
        this.relationListContainer = document.createElement('div');
        this.relationListContainer.style.maxHeight = '180px';
        this.relationListContainer.style.overflowY = 'auto';
        this.relationListContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        this.relationListContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        this.relationListContainer.style.borderRadius = '4px';
        this.relationListContainer.style.padding = '6px';
        this.relationListContainer.style.marginBottom = '8px';
        relContent.appendChild(this.relationListContainer);

        // Add Custom Relation Term Row (Full Width Stack)
        const addRow = document.createElement('div');
        addRow.style.display = 'flex';
        addRow.style.flexDirection = 'column';
        addRow.style.gap = '6px';

        const addInput = document.createElement('input');
        addInput.type = 'text';
        addInput.placeholder = 'Neuer Beziehungstyp...';
        addInput.className = 'form-control';
        addInput.style.width = '100%';
        addInput.style.backgroundColor = 'rgba(0,0,0,0.3)';
        addInput.style.border = '1px solid rgba(255,255,255,0.1)';
        addInput.style.color = 'var(--text-color)';
        addInput.style.padding = '6px';
        addInput.style.borderRadius = '4px';
        addInput.style.boxSizing = 'border-box';

        const addBtn = document.createElement('button');
        addBtn.className = 'action-button secondary';
        addBtn.textContent = '+ Hinzufügen';
        addBtn.style.width = '100%';
        addBtn.style.padding = '6px';
        addBtn.onclick = () => {
            const val = addInput.value.trim();
            if (val) {
                this.activeRelationSet.push({ id: val.toUpperCase(), label: val, enabled: true });
                addInput.value = '';
                this.renderRelationList();
            }
        };

        addRow.appendChild(addInput);
        addRow.appendChild(addBtn);
        relContent.appendChild(addRow);

        relSection.appendChild(relHeader);
        relSection.appendChild(relContent);
        this.container.appendChild(relSection);

        // Auto load default set
        this.loadRelationSetFile('schweizer_politik_relations.json');

        // --- GENERATOR SECTION ---
        const genSection = document.createElement('section');
        genSection.className = 'panel-section';

        const genHeader = document.createElement('h4');
        genHeader.className = 'section-header';
        genHeader.style.display = 'flex';
        genHeader.style.justifyContent = 'space-between';
        genHeader.style.cursor = 'pointer';

        const genTitle = document.createElement('span');
        genTitle.textContent = 'Netzwerk per KI generieren';

        const genToggle = document.createElement('span');
        genToggle.textContent = '▾';

        genHeader.appendChild(genTitle);
        genHeader.appendChild(genToggle);

        const genContent = document.createElement('div');
        genContent.style.marginTop = '10px';
        genContent.style.display = 'block';

        genHeader.onclick = () => {
            const isHidden = genContent.style.display === 'none';
            genContent.style.display = isHidden ? 'block' : 'none';
            genToggle.textContent = isHidden ? '▾' : '▴';
        };

        genSection.appendChild(genHeader);
        genSection.appendChild(genContent);

        // Model Select
        const modelLabel = document.createElement('label');
        modelLabel.textContent = 'Modell:';
        modelLabel.style.display = 'block';
        modelLabel.style.marginBottom = '5px';
        modelLabel.style.color = 'var(--text-muted)';
        genSection.appendChild(modelLabel);

        this.modelContainer = document.createElement('div');
        this.modelContainer.style.position = 'relative';
        this.modelContainer.style.width = '100%';
        this.modelContainer.style.marginBottom = '15px';

        this.modelInput = document.createElement('input');
        this.modelInput.type = 'text';
        this.modelInput.className = 'form-control';
        this.modelInput.placeholder = 'Modell suchen...';
        this.modelInput.style.width = '100%';
        this.modelInput.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        this.modelInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        this.modelInput.style.color = 'var(--text-color)';
        this.modelInput.style.padding = '6px';
        this.modelInput.style.borderRadius = '4px';
        this.modelInput.style.boxSizing = 'border-box';

        this.modelDropdown = document.createElement('div');
        this.modelDropdown.style.position = 'absolute';
        this.modelDropdown.style.top = '100%';
        this.modelDropdown.style.left = '0';
        this.modelDropdown.style.right = '0';
        this.modelDropdown.style.maxHeight = '250px';
        this.modelDropdown.style.overflowY = 'auto';
        this.modelDropdown.style.backgroundColor = '#1e1e1e';
        this.modelDropdown.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        this.modelDropdown.style.borderRadius = '4px';
        this.modelDropdown.style.zIndex = '1000';
        this.modelDropdown.style.display = 'none';
        this.modelDropdown.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';

        this.modelContainer.appendChild(this.modelInput);
        this.modelContainer.appendChild(this.modelDropdown);
        genSection.appendChild(this.modelContainer);

        // --- Advanced LLM Parameters Toggle ---
        const advParamsDetails = document.createElement('details');
        advParamsDetails.style.marginBottom = '15px';
        advParamsDetails.style.marginTop = '10px';
        
        const advParamsSummary = document.createElement('summary');
        advParamsSummary.textContent = 'Erweiterte LLM Parameter';
        advParamsSummary.style.cursor = 'pointer';
        advParamsSummary.style.color = 'var(--text-muted)';
        advParamsSummary.style.userSelect = 'none';
        advParamsDetails.appendChild(advParamsSummary);

        this.llmParamsContainer = document.createElement('div');
        this.llmParamsContainer.style.padding = '10px';
        this.llmParamsContainer.style.backgroundColor = 'rgba(0,0,0,0.2)';
        this.llmParamsContainer.style.borderRadius = '4px';
        this.llmParamsContainer.style.marginTop = '5px';
        this.llmParamsContainer.style.display = 'flex';
        this.llmParamsContainer.style.flexDirection = 'column';
        this.llmParamsContainer.style.gap = '10px';

        const createSlider = (id: string, label: string, min: string, max: string, step: string, defValue: string) => {
            const wrapper = document.createElement('div');
            
            const labelEl = document.createElement('div');
            labelEl.style.display = 'flex';
            labelEl.style.justifyContent = 'space-between';
            labelEl.style.marginBottom = '4px';
            
            const titleSpan = document.createElement('span');
            titleSpan.textContent = label;
            titleSpan.style.color = 'var(--text-muted)';
            titleSpan.style.fontSize = '0.9em';
            
            const valueSpan = document.createElement('span');
            valueSpan.textContent = defValue;
            valueSpan.style.color = 'var(--text-color)';
            valueSpan.style.fontSize = '0.9em';
            
            labelEl.appendChild(titleSpan);
            labelEl.appendChild(valueSpan);
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = id;
            slider.min = min;
            slider.max = max;
            slider.step = step;
            slider.value = defValue;
            slider.style.width = '100%';
            
            slider.addEventListener('input', () => {
                valueSpan.textContent = slider.value;
                localStorage.setItem(`nodges_llm_${id}`, slider.value);
            });
            
            wrapper.appendChild(labelEl);
            wrapper.appendChild(slider);
            
            return { wrapper, slider, valueSpan };
        };

        const storedTemp = localStorage.getItem('nodges_llm_temp') || '0.2';
        const storedTopP = localStorage.getItem('nodges_llm_topp') || '1.0';
        const storedTopK = localStorage.getItem('nodges_llm_topk') || '0';

        const tempObj = createSlider('temp', 'Temperature (0 = deterministisch)', '0', '2', '0.1', storedTemp);
        const topPObj = createSlider('topp', 'Top-P (1 = alle)', '0', '1', '0.05', storedTopP);
        const topKObj = createSlider('topk', 'Top-K (0 = deaktiviert)', '0', '100', '1', storedTopK);

        this.tempSlider = tempObj.slider;
        this.topPSlider = topPObj.slider;
        this.topKSlider = topKObj.slider;

        this.llmParamsContainer.appendChild(tempObj.wrapper);
        this.llmParamsContainer.appendChild(topPObj.wrapper);
        this.llmParamsContainer.appendChild(topKObj.wrapper);

        advParamsDetails.appendChild(this.llmParamsContainer);
        genSection.appendChild(advParamsDetails);

        // Populate models initially
        this.updateModelOptions(activeProvider);

        // Search/Filter logic
        this.modelInput.addEventListener('input', () => {
            this.modelDropdown.style.display = 'block';
            this.renderModelDropdown(this.modelInput.value);
        });
        
        this.modelInput.addEventListener('focus', () => {
            this.modelDropdown.style.display = 'block';
            this.modelInput.select();
            this.renderModelDropdown('');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.modelContainer.contains(e.target as Node)) {
                this.modelDropdown.style.display = 'none';
                // Reset input to selected model name if needed
                const model = this.currentModelsList.find(m => m.id === this.selectedModelId);
                if (model) {
                    this.modelInput.value = model.name;
                }
            }
        });

        // Event listeners
        this.providerSelect.onchange = () => {
            const provider = this.providerSelect.value as LLMProvider;
            LLMService.setActiveProvider(provider);
            const key = LLMService.getApiKey(provider);
            this.keyInput.value = key || '';
            this.updateModelOptions(provider);
        };

        // Pipeline Select (Ersetzt die alte Format-Version komplett)
        const pipelineLabel = document.createElement('label');
        pipelineLabel.textContent = 'Generierungs-Modus:';
        pipelineLabel.style.display = 'block';
        pipelineLabel.style.marginBottom = '5px';
        pipelineLabel.style.color = 'var(--text-muted)';
        genSection.appendChild(pipelineLabel);

        this.pipelineSelect = document.createElement('select');
        this.pipelineSelect.className = 'form-control';
        this.pipelineSelect.style.width = '100%';
        this.pipelineSelect.style.marginBottom = '15px';
        this.pipelineSelect.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        this.pipelineSelect.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        this.pipelineSelect.style.color = 'var(--text-color)';
        this.pipelineSelect.style.padding = '6px';
        this.pipelineSelect.style.borderRadius = '4px';

        const pipelines = [
            { value: 'build12_lightrag', label: 'Build 12: LightRAG (Lokaler Graph-RAG Microservice)' },
            { value: 'build10', label: 'Build 10 (Modulare Pipeline - Konfigurierbar)' },
            { value: 'build9', label: 'Build 9 (RAG & Vektorstore Deduplizierung)' },
            { value: 'build8', label: 'Build 8 (Semantic Web / Wikidata)' },
            { value: 'build6', label: 'Build 6 (Schnelle Single-Step Zod Pipeline)' },
            { value: 'build5', label: 'Legacy: Build 5 (3-stufig: Ontologie -> Daten -> Mapping)' },
            { value: 'refine', label: 'Update: Iterativ (Bestehendes Netzwerk anpassen)' }
        ];

        pipelines.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.value;
            opt.textContent = p.label;
            this.pipelineSelect.appendChild(opt);
        });
        genSection.appendChild(this.pipelineSelect);

        // Toggle für Zwischenschritte
        const toggleContainer = document.createElement('div');
        toggleContainer.style.display = 'flex';
        toggleContainer.style.alignItems = 'center';
        toggleContainer.style.marginBottom = '15px';
        toggleContainer.style.gap = '8px';

        this.saveStepsToggle = document.createElement('input');
        this.saveStepsToggle.type = 'checkbox';
        this.saveStepsToggle.className = 'nodges-toggle';
        this.saveStepsToggle.id = 'saveStepsToggle';
        this.saveStepsToggle.checked = true; // standardmäßig aktiviert

        const toggleLabel = document.createElement('label');
        toggleLabel.htmlFor = 'saveStepsToggle';
        toggleLabel.textContent = 'Zwischenschritte speichern (Dev)';
        toggleLabel.style.cursor = 'pointer';
        toggleLabel.style.transition = 'color 0.2s';
        toggleLabel.style.color = 'var(--text-color)'; // Init as checked

        this.saveStepsToggle.addEventListener('change', () => {
            toggleLabel.style.color = this.saveStepsToggle.checked ? 'var(--text-color)' : 'var(--text-muted)';
        });

        toggleContainer.appendChild(this.saveStepsToggle);
        toggleContainer.appendChild(toggleLabel);
        genSection.appendChild(toggleContainer);

        // --- Build 10 Modulare Einstellungen ---
        this.build10Container = document.createElement('div');
        this.build10Container.style.display = 'none';
        this.build10Container.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        this.build10Container.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        this.build10Container.style.borderRadius = '4px';
        this.build10Container.style.padding = '10px';
        this.build10Container.style.marginBottom = '15px';

        const b10Title = document.createElement('h5');
        b10Title.textContent = 'Build 10 Pipeline-Konfiguration:';
        b10Title.style.marginTop = '0';
        b10Title.style.marginBottom = '10px';
        b10Title.style.color = 'var(--accent-color)';
        this.build10Container.appendChild(b10Title);

        // Grounding Dropdown
        const grLabel = document.createElement('label');
        grLabel.textContent = 'Grounding / Wissensquelle:';
        grLabel.style.display = 'block';
        grLabel.style.marginBottom = '4px';
        grLabel.style.color = 'var(--text-muted)';
        this.build10Container.appendChild(grLabel);

        this.b10GroundingSelect = document.createElement('select');
        this.b10GroundingSelect.className = 'form-control';
        this.b10GroundingSelect.style.width = '100%';
        this.b10GroundingSelect.style.marginBottom = '10px';
        this.b10GroundingSelect.style.backgroundColor = 'rgba(0,0,0,0.3)';
        this.b10GroundingSelect.style.border = '1px solid rgba(255,255,255,0.1)';
        this.b10GroundingSelect.style.color = 'var(--text-color)';
        this.b10GroundingSelect.style.padding = '4px';
        this.b10GroundingSelect.style.borderRadius = '3px';

        const grOptions = [
            { value: 'none', label: 'Kein Grounding (Schema-Constrained)' },
            { value: 'wikidata', label: 'Wikidata-Suche & SPARQL' },
            { value: 'rag', label: 'RAG (Rohdaten aus Textfeld unten)' },
            { value: 'dedup', label: 'Semantische Vektor-Deduplizierung' }
        ];
        grOptions.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o.value;
            opt.textContent = o.label;
            this.b10GroundingSelect.appendChild(opt);
        });
        this.build10Container.appendChild(this.b10GroundingSelect);

        // Quality Assurance Dropdown
        const qaLabel = document.createElement('label');
        qaLabel.textContent = 'Qualitätssicherung:';
        qaLabel.style.display = 'block';
        qaLabel.style.marginBottom = '4px';
        qaLabel.style.color = 'var(--text-muted)';
        this.build10Container.appendChild(qaLabel);

        this.b10QaSelect = document.createElement('select');
        this.b10QaSelect.className = 'form-control';
        this.b10QaSelect.style.width = '100%';
        this.b10QaSelect.style.marginBottom = '10px';
        this.b10QaSelect.style.backgroundColor = 'rgba(0,0,0,0.3)';
        this.b10QaSelect.style.border = '1px solid rgba(255,255,255,0.1)';
        this.b10QaSelect.style.color = 'var(--text-color)';
        this.b10QaSelect.style.padding = '4px';
        this.b10QaSelect.style.borderRadius = '3px';

        const qaOptions = [
            { value: 'none', label: 'Keine zusätzliche Prüfung' },
            { value: 'critic', label: 'Generator + Kritiker (Zwei-Agenten)' },
            { value: 'human', label: 'Human-in-the-loop (Voransicht & Bearbeitung)' }
        ];
        qaOptions.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o.value;
            opt.textContent = o.label;
            this.b10QaSelect.appendChild(opt);
        });
        this.build10Container.appendChild(this.b10QaSelect);

        // Rating Method Dropdown
        const rtLabel = document.createElement('label');
        rtLabel.textContent = 'Bewertungsmethode (Beziehungsstärke):';
        rtLabel.style.display = 'block';
        rtLabel.style.marginBottom = '4px';
        rtLabel.style.color = 'var(--text-muted)';
        this.build10Container.appendChild(rtLabel);

        this.b10RatingSelect = document.createElement('select');
        this.b10RatingSelect.className = 'form-control';
        this.b10RatingSelect.style.width = '100%';
        this.b10RatingSelect.style.backgroundColor = 'rgba(0,0,0,0.3)';
        this.b10RatingSelect.style.border = '1px solid rgba(255,255,255,0.1)';
        this.b10RatingSelect.style.color = 'var(--text-color)';
        this.b10RatingSelect.style.padding = '4px';
        this.b10RatingSelect.style.borderRadius = '3px';

        const rtOptions = [
            { value: 'llm', label: 'Freie LLM-Schätzung (0-100)' },
            { value: 'taxonomy', label: 'Feste Taxonomie (Stärke 1-5, feste Kanten)' },
            { value: 'embeddings', label: 'Embedding Kosinus-Ähnlichkeit' }
        ];
        rtOptions.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o.value;
            opt.textContent = o.label;
            this.b10RatingSelect.appendChild(opt);
        });
        this.build10Container.appendChild(this.b10RatingSelect);

        genSection.appendChild(this.build10Container);

        // --- Build 12 LightRAG Modul Einstellungen ---
        const lightragContainer = document.createElement('div');
        lightragContainer.style.display = 'none';
        lightragContainer.style.backgroundColor = 'rgba(0, 150, 255, 0.08)';
        lightragContainer.style.border = '1px solid rgba(0, 150, 255, 0.2)';
        lightragContainer.style.borderRadius = '4px';
        lightragContainer.style.padding = '10px';
        lightragContainer.style.marginBottom = '15px';

        const lrTitle = document.createElement('h5');
        lrTitle.textContent = 'Build 12 LightRAG Status & Aktionen:';
        lrTitle.style.marginTop = '0';
        lrTitle.style.marginBottom = '8px';
        lrTitle.style.color = '#3498db';
        lightragContainer.appendChild(lrTitle);

        const lrStatusDiv = document.createElement('div');
        lrStatusDiv.style.fontSize = '0.85em';
        lrStatusDiv.style.marginBottom = '8px';
        lrStatusDiv.style.color = 'var(--text-muted)';
        lrStatusDiv.textContent = 'Server Status: Prüfe...';
        lightragContainer.appendChild(lrStatusDiv);

        const lrBtnRow = document.createElement('div');
        lrBtnRow.style.display = 'flex';
        lrBtnRow.style.gap = '8px';

        const lrCheckBtn = document.createElement('button');
        lrCheckBtn.className = 'action-button secondary';
        lrCheckBtn.textContent = 'Server-Status prüfen';
        lrCheckBtn.style.padding = '4px 8px';
        lrCheckBtn.style.fontSize = '0.85em';
        lrCheckBtn.onclick = async () => {
            const status = await LightRAGService.checkHealth();
            if (status.online) {
                lrStatusDiv.textContent = `Server Status: Online (Engine: ${status.engineActive ? 'Aktiv' : 'Mock-Modus'})`;
                lrStatusDiv.style.color = '#2ecc71';
            } else {
                lrStatusDiv.textContent = 'Server Status: Offline (http://localhost:8000 nicht erreichbar)';
                lrStatusDiv.style.color = '#e74c3c';
            }
        };
        lrBtnRow.appendChild(lrCheckBtn);

        const lrInsertBtn = document.createElement('button');
        lrInsertBtn.className = 'action-button primary';
        lrInsertBtn.textContent = 'Text in KB einspeisen';
        lrInsertBtn.style.padding = '4px 8px';
        lrInsertBtn.style.fontSize = '0.85em';
        lrInsertBtn.onclick = async () => {
            const text = this.ragTextarea.value.trim();
            if (!text) {
                this.setStatus('Bitte gib zuerst Text im Kontextfeld ein.', 'error');
                return;
            }
            try {
                this.setStatus('Sende Text an LightRAG Knowledge Base...', 'info');
                const res = await LightRAGService.insertText(text);
                this.setStatus(`Einspeisung erfolgreich: ${res.message}`, 'success');
            } catch (err: any) {
                this.setStatus(`Fehler beim Einspeisen: ${err.message}`, 'error');
            }
        };
        lrBtnRow.appendChild(lrInsertBtn);

        lightragContainer.appendChild(lrBtnRow);
        genSection.appendChild(lightragContainer);

        const updatePipelineContainers = () => {
            const val = this.pipelineSelect.value;
            this.build10Container.style.display = val === 'build10' ? 'block' : 'none';
            lightragContainer.style.display = val === 'build12_lightrag' ? 'block' : 'none';
            if (val === 'build12_lightrag') {
                lrCheckBtn.click();
            }
        };

        this.pipelineSelect.addEventListener('change', updatePipelineContainers);
        updatePipelineContainers();

        // --- Interaction Mode Slidebutton ---
        const genModeLabel = document.createElement('label');
        genModeLabel.textContent = 'Interaktions-Modus (Generierung):';
        genModeLabel.style.display = 'block';
        genModeLabel.style.marginBottom = '5px';
        genModeLabel.style.color = 'var(--text-muted)';
        genSection.appendChild(genModeLabel);

        const interactionModeToggleContainer = document.createElement('div');
        interactionModeToggleContainer.innerHTML = `
            <div class="nodges-slide-toggle">
                <input type="radio" name="createInteractionMode" id="cmode_auto" value="auto" checked>
                <input type="radio" name="createInteractionMode" id="cmode_chat" value="chat">
                <input type="radio" name="createInteractionMode" id="cmode_strict" value="strict">
                
                <label for="cmode_auto" title="Expandiert Ideen eigenständig">Auto-Pilot</label>
                <label for="cmode_chat" title="Fragt bei Unklarheiten nach">Co-Pilot</label>
                <label for="cmode_strict" title="Führt exakt nur Prompt aus">Strikt</label>
                
                <div class="nodges-slide-thumb"></div>
            </div>
        `;
        genSection.appendChild(interactionModeToggleContainer);

        const modeRadios = interactionModeToggleContainer.querySelectorAll('input[name="createInteractionMode"]');
        modeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.resetChatState();
            });
        });

        const promptLabel = document.createElement('label');
        promptLabel.textContent = 'Dein Prompt:';
        promptLabel.style.display = 'block';
        promptLabel.style.marginBottom = '5px';
        promptLabel.style.color = 'var(--text-muted)';
        genSection.appendChild(promptLabel);

        // --- Chat Log UI ---
        this.chatLog = document.createElement('div');
        this.chatLog.style.display = 'none';
        this.chatLog.style.flexDirection = 'column';
        this.chatLog.style.gap = '8px';
        this.chatLog.style.marginBottom = '10px';
        this.chatLog.style.maxHeight = '200px';
        this.chatLog.style.overflowY = 'auto';
        this.chatLog.style.padding = '10px';
        this.chatLog.style.backgroundColor = 'rgba(0,0,0,0.2)';
        this.chatLog.style.borderRadius = '4px';
        genSection.appendChild(this.chatLog);

        this.promptTextarea = document.createElement('textarea');
        this.promptTextarea.placeholder = 'z.B. Erstelle ein Netzwerk aus 5 miteinander verbundenen Konzepten aus der Quantenphysik...';
        this.promptTextarea.style.width = '100%';
        this.promptTextarea.style.minHeight = '120px';
        this.promptTextarea.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        this.promptTextarea.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        this.promptTextarea.style.borderRadius = '4px';
        this.promptTextarea.style.color = 'var(--text-color)';
        this.promptTextarea.style.padding = '8px';
        this.promptTextarea.style.marginBottom = '15px';
        this.promptTextarea.style.resize = 'vertical';
        this.promptTextarea.style.boxSizing = 'border-box';
        genSection.appendChild(this.promptTextarea);

        // --- RAG SECTION ---
        const ragLabel = document.createElement('label');
        ragLabel.textContent = 'Kontext / Rohdaten (RAG):';
        ragLabel.style.display = 'block';
        ragLabel.style.marginBottom = '5px';
        ragLabel.style.color = 'var(--text-muted)';
        
        const ragHeader = document.createElement('div');
        ragHeader.style.display = 'flex';
        ragHeader.style.justifyContent = 'space-between';
        ragHeader.style.alignItems = 'center';
        ragHeader.appendChild(ragLabel);
        
        const pasteBtn = document.createElement('button');
        pasteBtn.className = 'action-button secondary';
        pasteBtn.style.padding = '4px 8px';
        pasteBtn.style.marginBottom = '5px';
        pasteBtn.textContent = 'Paste';
        pasteBtn.onclick = async () => {
            try {
                const text = await navigator.clipboard.readText();
                this.ragTextarea.value = (this.ragTextarea.value ? this.ragTextarea.value + '\n' : '') + text;
                this.setStatus('Aus Zwischenablage eingefügt.', 'success');
            } catch (err) {
                this.setStatus('Konnte nicht aus Zwischenablage lesen (Berechtigung?).', 'error');
            }
        };
        ragHeader.appendChild(pasteBtn);
        genSection.appendChild(ragHeader);

        // URL Loader
        const urlContainer = document.createElement('div');
        urlContainer.style.display = 'flex';
        urlContainer.style.gap = '8px';
        urlContainer.style.marginBottom = '10px';
        urlContainer.style.width = '100%';

        this.urlInput = document.createElement('input');
        this.urlInput.type = 'text';
        this.urlInput.className = 'form-control';
        this.urlInput.placeholder = 'Website URL laden...';
        this.urlInput.style.flex = '1 1 auto';
        this.urlInput.style.minWidth = '0';
        this.urlInput.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        this.urlInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        this.urlInput.style.color = 'var(--text-color)';
        this.urlInput.style.padding = '6px';
        this.urlInput.style.borderRadius = '4px';
        
        const loadUrlBtn = document.createElement('button');
        loadUrlBtn.className = 'action-button secondary';
        loadUrlBtn.textContent = 'Laden';
        loadUrlBtn.style.padding = '4px 10px';
        loadUrlBtn.style.height = '30px';
        this.urlInput.style.height = '30px';
        loadUrlBtn.onclick = async () => {
            const url = this.urlInput.value.trim();
            if (!url) return;
            try {
                this.setStatus('Lade Website-Inhalt...', 'info');
                // Use corsproxy to bypass browser restrictions
                const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
                const res = await fetch(proxyUrl);
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const html = await res.text();
                
                // Very basic HTML to Text extraction
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const text = doc.body.textContent || '';
                // Clean up excessive whitespace
                const cleanText = text.replace(/\s+/g, ' ').trim();
                
                // Cut at 20000 chars to avoid extreme token limits
                const truncated = cleanText.substring(0, 20000);
                this.ragTextarea.value = (this.ragTextarea.value ? this.ragTextarea.value + '\n\n' : '') + `[Quelle: ${url}]\n${truncated}`;
                this.urlInput.value = '';
                this.setStatus('Website geladen und in Kontext eingefügt.', 'success');
            } catch (err) {
                this.setStatus('Fehler beim Laden der URL (CORS / Netzwerk).', 'error');
            }
        };
        
        urlContainer.appendChild(this.urlInput);
        urlContainer.appendChild(loadUrlBtn);
        genSection.appendChild(urlContainer);

        this.ragTextarea = document.createElement('textarea');
        this.ragTextarea.placeholder = 'Hier manuell CSV-Listen, Notizen oder Rohdaten einfügen...';
        this.ragTextarea.style.width = '100%';
        this.ragTextarea.style.minHeight = '80px';
        this.ragTextarea.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        this.ragTextarea.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        this.ragTextarea.style.borderRadius = '4px';
        this.ragTextarea.style.color = 'var(--text-color)';
        this.ragTextarea.style.padding = '8px';
        this.ragTextarea.style.marginBottom = '15px';
        this.ragTextarea.style.resize = 'vertical';
        this.ragTextarea.style.boxSizing = 'border-box';
        genSection.appendChild(this.ragTextarea);

        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '8px';
        btnContainer.style.marginBottom = '15px';

        this.modifyBtn = document.createElement('button');
        this.modifyBtn.className = 'action-button secondary';
        this.modifyBtn.style.flex = '1';
        this.modifyBtn.style.padding = '8px';
        this.modifyBtn.textContent = 'Modifizieren';
        this.modifyBtn.onclick = () => this.handleGenerate('modify');

        this.regenerateBtn = document.createElement('button');
        this.regenerateBtn.className = 'action-button primary';
        this.regenerateBtn.style.flex = '1';
        this.regenerateBtn.style.padding = '8px';
        this.regenerateBtn.textContent = 'Neu Generieren';
        this.regenerateBtn.onclick = () => this.handleGenerate('new');

        btnContainer.appendChild(this.regenerateBtn);
        btnContainer.appendChild(this.modifyBtn);
        genSection.appendChild(btnContainer);

        this.statusText = document.createElement('div');
        this.statusText.style.marginTop = '15px';
        this.statusText.style.minHeight = '20px';
        genSection.appendChild(this.statusText);

        this.container.appendChild(genSection);

        // --- SEMANTISCHE SUCHE SECTION ---
        const searchSection = document.createElement('section');
        searchSection.className = 'panel-section';
        searchSection.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
        searchSection.style.paddingTop = '15px';
        searchSection.style.marginTop = '15px';

        const searchHeader = document.createElement('h4');
        searchHeader.className = 'section-header';
        searchHeader.textContent = 'Semantische Suche (Vektor)';
        searchSection.appendChild(searchHeader);

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'form-control';
        searchInput.placeholder = 'Begriff semantisch suchen...';
        searchInput.style.width = '100%';
        searchInput.style.marginBottom = '10px';
        searchInput.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        searchInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        searchInput.style.color = 'var(--text-color)';
        searchInput.style.padding = '6px';
        searchInput.style.borderRadius = '4px';
        searchInput.style.boxSizing = 'border-box';
        searchSection.appendChild(searchInput);

        // Threshold Slider
        const thresholdContainer = document.createElement('div');
        thresholdContainer.style.display = 'flex';
        thresholdContainer.style.justifyContent = 'space-between';
        thresholdContainer.style.alignItems = 'center';
        thresholdContainer.style.marginBottom = '10px';

        const thresholdLabel = document.createElement('span');
        thresholdLabel.textContent = 'Minimale Aehnlichkeit: 0.50';
        thresholdLabel.style.color = 'var(--text-muted)';

        const thresholdSlider = document.createElement('input');
        thresholdSlider.type = 'range';
        thresholdSlider.min = '0';
        thresholdSlider.max = '1';
        thresholdSlider.step = '0.05';
        thresholdSlider.value = '0.5';
        thresholdSlider.style.width = '100px';
        thresholdSlider.oninput = () => {
            thresholdLabel.textContent = `Minimale Aehnlichkeit: ${parseFloat(thresholdSlider.value).toFixed(2)}`;
        };

        thresholdContainer.appendChild(thresholdLabel);
        thresholdContainer.appendChild(thresholdSlider);
        searchSection.appendChild(thresholdContainer);

        const searchBtn = document.createElement('button');
        searchBtn.className = 'action-button primary';
        searchBtn.textContent = 'Suchen';
        searchBtn.style.width = '100%';
        searchBtn.style.padding = '8px';
        searchBtn.style.marginBottom = '10px';
        searchSection.appendChild(searchBtn);

        // Results Container
        const resultsContainer = document.createElement('div');
        resultsContainer.style.maxHeight = '150px';
        resultsContainer.style.overflowY = 'auto';
        resultsContainer.style.backgroundColor = 'rgba(0,0,0,0.2)';
        resultsContainer.style.borderRadius = '4px';
        resultsContainer.style.padding = '5px';
        resultsContainer.style.display = 'none';
        searchSection.appendChild(resultsContainer);

        searchBtn.onclick = async () => {
            const query = searchInput.value.trim();
            if (!query) {
                this.setStatus('Bitte Suchbegriff eingeben.', 'error');
                return;
            }

            const activeEntities = this.stateManager.getEntities();
            if (activeEntities.length === 0) {
                this.setStatus('Keine Knoten im Netzwerk vorhanden.', 'error');
                return;
            }

            this.setStatus('Generiere Vektor fuer Suchanfrage...', 'info');
            searchBtn.disabled = true;
            try {
                const queryVector = await LLMService.generateEmbedding(
                    query,
                    this.providerSelect.value as LLMProvider,
                    'google/gemini-embedding-2'
                );

                this.setStatus('Berechne semantische Aehnlichkeiten...', 'info');
                const matches = await getSemanticSearchMatches(
                    queryVector,
                    activeEntities,
                    this.providerSelect.value as LLMProvider,
                    'google/gemini-embedding-2',
                    (msg) => this.setStatus(msg, 'info')
                );

                // Clear previous highlights
                if (this.app.highlightManager) {
                    this.app.highlightManager.clearAllHighlights();
                }

                resultsContainer.innerHTML = '';
                resultsContainer.style.display = 'block';
                const minSim = parseFloat(thresholdSlider.value);
                let matchCount = 0;

                matches.forEach(match => {
                    const entity = activeEntities.find(e => e.id === match.id);
                    if (!entity) return;

                    // If above threshold, highlight in 3D scene
                    if (match.similarity >= minSim) {
                        matchCount++;
                        // Find node in 3D scene
                        this.app.scene.traverse((object) => {
                            if (object.userData && object.userData.type === 'node' && object.userData.id === match.id) {
                                this.app.highlightManager.applyHighlight(
                                    object,
                                    this.app.highlightManager.types.SEARCH,
                                    { color: 0xffff00 }
                                );
                            }
                        });
                    }

                    // Add item to results UI list
                    const item = document.createElement('div');
                    item.style.padding = '4px 6px';
                    item.style.cursor = 'pointer';
                    item.style.display = 'flex';
                    item.style.justifyContent = 'space-between';
                    item.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                    item.style.color = match.similarity >= minSim ? '#f1c40f' : 'var(--text-color)';
                    
                    const labelSpan = document.createElement('span');
                    labelSpan.textContent = entity.label || (entity as any).name || entity.id;
                    item.appendChild(labelSpan);

                    const simSpan = document.createElement('span');
                    simSpan.textContent = `${(match.similarity * 100).toFixed(0)}%`;
                    simSpan.style.color = 'var(--text-muted)';
                    item.appendChild(simSpan);

                    item.onclick = () => {
                        // Focus camera on node
                        this.app.scene.traverse((object) => {
                            if (object.userData && object.userData.type === 'node' && object.userData.id === match.id) {
                                this.app.controls.target.copy(object.position);
                                this.app.camera.position.copy(object.position).add(new THREE.Vector3(15, 15, 15));
                                this.app.controls.update();
                                
                                // Select it
                                if (this.app.selectionManager) {
                                    this.app.selectionManager.setSingleSelection(object);
                                }
                            }
                        });
                    };

                    resultsContainer.appendChild(item);
                });

                this.setStatus(`Suche beendet: ${matchCount} Knoten hervorgehoben.`, 'success');
            } catch (e: any) {
                this.setStatus(`Suche fehlgeschlagen: ${e.message}`, 'error');
            } finally {
                searchBtn.disabled = false;
            }
        };

        this.container.appendChild(searchSection);
    }

    private renderModelDropdown(filterText: string = '') {
        this.modelDropdown.innerHTML = '';
        const lowerFilter = filterText.toLowerCase();
        
        const filteredModels = this.currentModelsList.filter(m => 
            m.name.toLowerCase().includes(lowerFilter) || m.id.toLowerCase().includes(lowerFilter)
        );

        if (filteredModels.length === 0) {
            const empty = document.createElement('div');
            empty.textContent = 'Keine Modelle gefunden';
            empty.style.padding = '8px';
            empty.style.color = 'var(--text-muted)';
            this.modelDropdown.appendChild(empty);
            return;
        }

        const renderGroup = (title: string, models: typeof this.currentModelsList) => {
            if (models.length === 0) return;
            if (title) {
                const groupHeader = document.createElement('div');
                groupHeader.textContent = title;
                groupHeader.style.padding = '4px 8px';
                groupHeader.style.textTransform = 'uppercase';
                groupHeader.style.color = 'var(--text-muted)';
                groupHeader.style.backgroundColor = 'rgba(0,0,0,0.2)';
                groupHeader.style.fontWeight = 'bold';
                this.modelDropdown.appendChild(groupHeader);
            }

            models.forEach(model => {
                const opt = document.createElement('div');
                opt.style.display = 'flex';
                opt.style.justifyContent = 'space-between';
                opt.style.alignItems = 'center';
                opt.style.padding = '6px 8px';
                opt.style.cursor = 'pointer';
                opt.style.color = model.id === this.selectedModelId ? '#fff' : 'var(--text-color)';
                opt.style.backgroundColor = model.id === this.selectedModelId ? 'rgba(52, 152, 219, 0.3)' : 'transparent';
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = model.name;
                opt.appendChild(nameSpan);

                const provider = this.providerSelect.value as LLMProvider;
                if (provider === 'openrouter') {
                    const link = document.createElement('a');
                    link.href = `https://openrouter.ai/${model.id}`;
                    link.target = '_blank';
                    link.textContent = '↗';
                    link.title = 'Auf OpenRouter ansehen';
                    link.style.textDecoration = 'none';
                    link.style.color = 'var(--text-muted)';
                    link.style.padding = '0 4px';
                    
                    link.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                    link.addEventListener('mouseenter', () => {
                        link.style.color = '#3498db';
                    });
                    link.addEventListener('mouseleave', () => {
                        link.style.color = 'var(--text-muted)';
                    });
                    opt.appendChild(link);
                }
                
                opt.addEventListener('mouseenter', () => {
                    opt.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                });
                opt.addEventListener('mouseleave', () => {
                    opt.style.backgroundColor = model.id === this.selectedModelId ? 'rgba(52, 152, 219, 0.3)' : 'transparent';
                });
                
                opt.addEventListener('click', () => {
                    this.selectedModelId = model.id;
                    this.modelInput.value = model.name;
                    this.modelDropdown.style.display = 'none';
                    LLMService.setActiveModel(provider, model.id);
                });
                this.modelDropdown.appendChild(opt);
            });
        };

        const recommended = filteredModels.filter(m => m.isRecommended);
        const others = filteredModels.filter(m => !m.isRecommended);

        if (recommended.length > 0) {
            renderGroup('Empfohlen', recommended);
        }
        if (others.length > 0) {
            renderGroup(recommended.length > 0 ? 'Alle Modelle' : '', others);
        }
    }

    private async updateModelOptions(provider: LLMProvider): Promise<void> {
        this.modelInput.value = 'Lade Modelle...';
        this.modelInput.disabled = true;

        let models: LLMModel[] = [];
        let recommendedModels: LLMModel[] = [];
        const activeModel = LLMService.getActiveModel(provider);

        if (provider === 'openrouter') {
            models = await LLMService.fetchOpenRouterModels();
            recommendedModels = LLMService.PROVIDER_MODELS.openrouter;
        } else if (provider === 'ollama' || provider === 'lmstudio') {
            models = await LLMService.fetchModelsForProvider(provider);
            recommendedModels = [];
        } else {
            models = LLMService.PROVIDER_MODELS[provider] || [];
            recommendedModels = [];
        }

        if (this.providerSelect.value !== provider) {
            return;
        }

        this.currentModelsList = models.map(m => ({
            id: m.id,
            name: m.name,
            isRecommended: recommendedModels.some(r => r.id === m.id)
        }));

        this.modelInput.disabled = false;
        
        this.selectedModelId = activeModel || (models.length > 0 ? models[0].id : '');
        const selectedModel = this.currentModelsList.find(m => m.id === this.selectedModelId);
        this.modelInput.value = selectedModel ? selectedModel.name : '';

        if (!activeModel && this.selectedModelId) {
            LLMService.setActiveModel(provider, this.selectedModelId);
        }
    }

    private async handleGenerate(action: 'new' | 'modify' = 'new'): Promise<void> {
        let prompt = this.promptTextarea.value.trim();
        if (!prompt) {
            this.setStatus('Bitte gib ein Prompt ein.', 'error');
            return;
        }

        const modeRadio = document.querySelector('input[name="createInteractionMode"]:checked') as HTMLInputElement;
        const mode = modeRadio ? modeRadio.value : 'auto';
        const provider = this.providerSelect.value as LLMProvider;
        const model = this.selectedModelId;
        const pipeline = this.pipelineSelect.value;
        const saveSteps = this.saveStepsToggle.checked;

        if (mode === 'chat') {
            if (this.clarificationHistory.length === 0) {
                // Erster Klick: KI fragt nach
                this.clarificationHistory.push({ role: 'user', content: prompt });
                this.updateChatUI();
                
                this.setStatus('Generiere Rückfrage...', 'info');
                this.setLoading(true);
                
                try {
                    const question = await LLMService.askClarification(this.clarificationHistory, provider, model);
                    this.clarificationHistory.push({ role: 'assistant', content: question });
                    this.promptTextarea.value = ''; 
                    if (action === 'modify') {
                        this.modifyBtn.textContent = 'Antworten & Modifizieren';
                    } else {
                        this.regenerateBtn.textContent = 'Antworten & Generieren';
                    }
                    this.updateChatUI();
                    this.setStatus('Bitte beantworte die Rückfrage.', 'info');
                } catch (error: any) {
                    this.setStatus(`Fehler bei Rückfrage: ${error.message}`, 'error');
                } finally {
                    this.setLoading(false);
                }
                return;
            } else {
                // Zweiter Klick: User hat geantwortet, wir bauen den finalen Prompt zusammen
                this.clarificationHistory.push({ role: 'user', content: prompt });
                this.updateChatUI();
                this.modifyBtn.textContent = 'Modifizieren';
                this.regenerateBtn.textContent = 'Neu Generieren';
                
                prompt = this.clarificationHistory.map(msg => `${msg.role === 'user' ? 'USER' : 'KI'}: ${msg.content}`).join('\n\n');
                
                // Wir resetten den Chat noch NICHT, damit der User sieht, was er generiert hat.
                // Er wird erst resettet, wenn er den Modus wechselt oder neu lädt.
            }
        }

        // --- Frontend NSFW Filter (mittelstreng) ---
        if (GraphGenerationService.checkNSFW(prompt)) {
            this.setStatus('Fehler: Die Anfrage verstoesst gegen die Inhaltsrichtlinien (NSFW-Filter).', 'error');
            return;
        }
        // -------------------------------------------

        const ragText = this.ragTextarea?.value.trim();
        const activeRelLabels = this.getActiveRelationLabels();
        prompt = GraphGenerationService.assemblePrompt(prompt, ragText, activeRelLabels);



        if (!LLMService.getApiKey(provider) && provider !== 'openrouter') {
            this.setStatus(`Bitte hinterlege zuerst deinen API-Key für ${provider}.`, 'error');
            return;
        }

        this.setLoading(true);
        this.setStatus('Bereite Generierung vor...', 'info');

        const generationLog: any = {
            timestampStart: new Date().toISOString(),
            prompt: prompt,
            ragText: ragText || null,
            provider: provider,
            model: model,
            pipeline: pipeline,
            systemInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                appVersion: 'Nodges Build 6'
            },
            steps: []
        };
        const startTime = performance.now();

        const onProgressWithLog = (msg: string) => {
            generationLog.steps.push({
                time: new Date().toISOString(),
                offsetMs: Math.round(performance.now() - startTime),
                message: msg
            });
            this.setStatus(msg, 'info');
        };

        const fileSuffix = this.getFormattedFileSuffix();

        try {
            let graphData: any;
            
            const llmOptions = {
                temperature: parseFloat(this.tempSlider.value),
                top_p: parseFloat(this.topPSlider.value),
                top_k: parseInt(this.topKSlider.value, 10)
            };
            if (llmOptions.top_k === 0) delete (llmOptions as any).top_k; // Disable top_k if 0

            if (pipeline === 'build10') {
                const config = {
                    grounding: this.b10GroundingSelect.value as any,
                    qualityAssurance: this.b10QaSelect.value as any,
                    ratingMethod: this.b10RatingSelect.value as any
                };
                
                let gCode = 'K';
                if (config.grounding === 'wikidata') gCode = 'W';
                if (config.grounding === 'rag') gCode = 'R';
                if (config.grounding === 'dedup') gCode = 'S';

                let qCode = 'K';
                if (config.qualityAssurance === 'critic') qCode = 'G';
                if (config.qualityAssurance === 'human') qCode = 'H';

                let bCode = 'F';
                if (config.ratingMethod === 'taxonomy') bCode = 'T';
                if (config.ratingMethod === 'embeddings') bCode = 'E';

                const tCode = llmOptions.temperature.toString().replace(/\./g, '');
                const pCode = llmOptions.top_p.toString().replace(/\./g, '');
                const kCode = llmOptions.top_k !== undefined ? llmOptions.top_k : 0;

                const devPrefix = `B10_T${tCode}_P${pCode}_K${kCode}_G${gCode}_Q${qCode}_B${bCode}`;

                graphData = await LLMService.generateGraphDataBuild10(
                    prompt,
                    config,
                    provider,
                    model,
                    saveSteps ? devPrefix : null,
                    onProgressWithLog,
                    (step: number, name: string, content: string, ext: string) => {
                        // The download itself is triggered here ONLY if saveSteps is true, which is fine since the callback is only triggered if devPrefix is passed
                        if (saveSteps) {
                            this.downloadStep(step, name, content, ext, devPrefix, true);
                        }
                    },
                    llmOptions
                );
            } else if (pipeline === 'build9') {
                onProgressWithLog('Schritt 1/2: Generiere Roh-Netzwerk via LLM...');
                const rawGraph = await LLMService.generateGraphDataBuild6(prompt, provider, model, onProgressWithLog, llmOptions);
                if (saveSteps) {
                    this.app.exportManager?.downloadFile(JSON.stringify(rawGraph, null, 2), `01_Raw_Graph_${fileSuffix}.json`, 'application/json');
                }
                
                onProgressWithLog('Schritt 2/2: Führe semantische Deduplizierung (Entity Resolution) aus...');
                graphData = await deduplicateGraph(rawGraph, provider, 'google/gemini-embedding-2', 0.85, onProgressWithLog);
                if (saveSteps) {
                    this.app.exportManager?.downloadFile(JSON.stringify(graphData, null, 2), `02_Deduplicated_Graph_${fileSuffix}.json`, 'application/json');
                }
            } else if (pipeline === 'build8') {
                graphData = await LLMService.generateGraphDataBuild8(
                    prompt, 
                    provider, 
                    model, 
                    onProgressWithLog, 
                    (step: number, name: string, content: string, ext: string) => {
                        if (saveSteps) {
                            this.downloadStep(step, name, content, ext, fileSuffix);
                        }
                    }
                );
            } else if (pipeline === 'build12_lightrag') {
                onProgressWithLog('Frage lokalen LightRAG Microservice an...');

                if (ragText) {
                    onProgressWithLog('Sende Rohdaten an LightRAG Knowledge Base...');
                    await LightRAGService.insertText(ragText);
                    if (saveSteps) {
                        try {
                            await this.saveGraphFile(`../b12/B12_01_Rohdaten_${fileSuffix}.txt`, ragText);
                        } catch (e) { console.warn('[CreatePanel] Operation fehlgeschlagen:', e); }
                    }
                }
                const lightRagResult = await LightRAGService.queryGraph(prompt, 'hybrid');
                onProgressWithLog(`LightRAG Antwort empfangen: ${lightRagResult.answer.substring(0, 80)}...`);
                graphData = {
                    metadata: lightRagResult.graphData.metadata || { schemaVersion: "5.2" },
                    dataModel: lightRagResult.graphData.dataModel || { entities: {}, relationships: {} },
                    visualMappings: lightRagResult.graphData.visualMappings || { defaultPresets: {} },
                    data: lightRagResult.graphData.data
                };

                // Injiere vollständige Metadaten vor dem Speichern/Exportieren
                const buildConfig = {
                    grounding: this.b10GroundingSelect?.value,
                    qualityAssurance: this.b10QaSelect?.value,
                    ratingMethod: this.b10RatingSelect?.value
                };
                GraphGenerationService.enrichGraphMetadata(graphData, pipeline, prompt, provider, model, mode, ragText, startTime, buildConfig);

                // Immer in public/data/b12/ speichern
                try {
                    await this.saveGraphFile(`../b12/B12_Graph_${fileSuffix}.json`, JSON.stringify(graphData, null, 2));
                    onProgressWithLog(`Datei unter public/data/b12/B12_Graph_${fileSuffix}.json gespeichert.`);
                } catch (e) {
                    console.warn('[CreatePanel] Fehler beim Speichern der B12 Graph-Datei:', e);
                }

                if (saveSteps) {
                    try {
                        await this.saveGraphFile(`../b12/B12_02_Antwort_${fileSuffix}.json`, JSON.stringify(lightRagResult, null, 2));
                    } catch (e) { console.warn('[CreatePanel] Operation fehlgeschlagen:', e); }
                    this.app.exportManager?.downloadFile(JSON.stringify(graphData, null, 2), `B12_Graph_${fileSuffix}.json`, 'application/json');
                }
            } else if (pipeline === 'build6') {
                graphData = await LLMService.generateGraphDataBuild6(prompt, provider, model, onProgressWithLog, llmOptions);
                if (saveSteps) {
                    this.app.exportManager?.downloadFile(JSON.stringify(graphData, null, 2), `01_SingleStep_Graph_${fileSuffix}.json`, 'application/json');
                }
            } else if (pipeline === 'build5') {
                graphData = await LLMService.generateGraphDataMultiStepBuild5(
                    prompt, 
                    provider, 
                    model, 
                    onProgressWithLog,
                    (step: number, name: string, content: string, ext: string) => {
                        if (saveSteps) {
                            this.downloadStep(step, name, content, ext, fileSuffix);
                        }
                    }
                );
            } else if (pipeline === 'refine') {
                const existingData = {
                    metadata: { schemaVersion: "5.0" },
                    dataModel: this.app.currentGraphData?.dataModel || { entities: {}, relationships: {} },
                    visualMappings: this.app.currentGraphData?.visualMappings || { defaultPresets: {} },
                    data: {
                        entities: this.stateManager.getEntities(),
                        relationships: this.stateManager.getRelationships()
                    }
                };
                graphData = await LLMService.refineGraphData(existingData as any, prompt, provider, model, import.meta.env.BASE_URL + 'prompts/refine_prompt.md', onProgressWithLog);
                if (saveSteps) {
                    this.app.exportManager?.downloadFile(JSON.stringify(graphData, null, 2), `01_Refined_Graph_${fileSuffix}.json`, 'application/json');
                }
            }

            const endTime = performance.now();
            generationLog.timestampEnd = new Date().toISOString();
            generationLog.durationMs = Math.round(endTime - startTime);
            generationLog.durationSec = (generationLog.durationMs / 1000).toFixed(2);
            generationLog.status = 'success';

            // --- Inject generation metadata directly into the JSON graphData ---
            const buildConfig = {
                grounding: this.b10GroundingSelect?.value,
                qualityAssurance: this.b10QaSelect?.value,
                ratingMethod: this.b10RatingSelect?.value
            };
            GraphGenerationService.enrichGraphMetadata(graphData, pipeline, prompt, provider, model, mode, ragText, startTime, buildConfig);

            this.setStatus('Graph generiert! Lade in Visualizer...', 'info');

            // Load data into graph
            if (graphData) {
                const processLoadedGraph = async (dataToLoad: any) => {
                    const shouldAppend = action === 'modify' && pipeline !== 'refine';
                    const sourceName = (pipeline === 'refine' ? 'AI_Refined_' : 'AI_Generation_') + Date.now();
                    await this.app.loadGraphData(dataToLoad, sourceName, shouldAppend);

                    // --- Auto-Save & Logging Feature ---
                    if (!saveSteps) {
                        // Wenn Dev Create DEAKTIVIERT ist: Nur ein normaler Download am Ende
                        try {
                            if (dataToLoad && this.app?.currentGraphData && this.app?.exportManager) {
                                this.setStatus('Graph geladen! Speichere in Projekt-Dateien...', 'info');
                                const exportOptions: any = { 
                                    currentEntities: this.app.currentEntities || [],
                                    activeVisualMappings: this.app.visualMappingEngine?.getVisualMappings() || null,
                                    activeDataModel: this.app.currentGraphData.dataModel || null
                                };
                                const jsonStr = this.app.exportManager.exportNodgesJSON(this.app.currentGraphData, exportOptions);
                                this.app.exportManager.downloadFile(jsonStr, `AI_Generation_${fileSuffix}.json`, 'application/json');
                                
                                // Optional: Update loaded files in UI panel (but no server save)
                                const filePanel = (this.app as any).uiManager?.panels?.get('file');
                                if (filePanel && filePanel.availableFiles) {
                                    const currentFiles = this.app.stateManager.state.loadedFiles || [];
                                    this.app.stateManager.setLoadedFiles([...currentFiles]);
                                }
                                
                                // Log JSON export
                                generationLog.generatedNodes = dataToLoad?.data?.entities?.length || 0;
                                generationLog.generatedEdges = dataToLoad?.data?.relationships?.length || 0;
                                generationLog.responsePayloadSizeKB = dataToLoad ? (JSON.stringify(dataToLoad).length / 1024).toFixed(2) : "0";
                                const logStr = JSON.stringify(generationLog, null, 2);
                                this.app.exportManager.downloadFile(logStr, `AI_GenerationLog_${fileSuffix}.json`, 'application/json');
                            }
                        } catch (e) {
                            console.warn('Auto-save or logging failed:', e);
                        }
                    } else {
                        // Wenn Dev Create AKTIV ist: Auto-Save wird übersprungen, da bereits alle Steps gedownloadet/gesaved wurden.
                        this.setStatus('Graph geladen! (Auto-Save übersprungen wg. Dev Create)', 'info');
                    }

                    const nodeCount = dataToLoad?.data?.entities?.length || 0;
                    const edgeCount = dataToLoad?.data?.relationships?.length || 0;

                    this.setStatus(`Erfolgreich generiert: ${nodeCount} Knoten, ${edgeCount} Kanten. Dauer: ${generationLog.durationSec}s. Gespeichert!`, 'success');
                    
                    setTimeout(() => {
                        this.setStatus('', 'info');
                        if (this.app && typeof this.app.fitCameraToScene === 'function') {
                            this.app.fitCameraToScene();
                        }
                    }, 500);
                };

                if (pipeline === 'build10' && this.b10QaSelect.value === 'human') {
                    this.setLoading(false);
                    this.setStatus('Review erforderlich...', 'info');
                    this.showHumanInTheLoopReview(graphData, (finalData) => {
                        this.setLoading(true);
                        this.setStatus('Lade korrigierten Graphen...', 'info');
                        processLoadedGraph(finalData);
                    });
                } else {
                    await processLoadedGraph(graphData);
                }
            }

        } catch (error: any) {
            generationLog.timestampEnd = new Date().toISOString();
            generationLog.durationMs = Math.round(performance.now() - startTime);
            generationLog.durationSec = (generationLog.durationMs / 1000).toFixed(2);
            generationLog.status = 'error';
            generationLog.errorMessage = error.message || String(error);
            
            try {
                const logStr = JSON.stringify(generationLog, null, 2);
                this.app.exportManager?.downloadFile(logStr, `Nodges_ErrorLog_${fileSuffix}.json`, 'application/json');
            } catch(e) { console.warn('[CreatePanel] Operation fehlgeschlagen:', e); }

            this.setStatus(error.message || 'Ein unbekannter Fehler ist aufgetreten.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    private setLoading(isLoading: boolean): void {
        if (this.modifyBtn) {
            this.modifyBtn.disabled = isLoading;
            this.modifyBtn.style.opacity = isLoading ? '0.5' : '1';
            this.modifyBtn.textContent = isLoading ? '' : 'Modifizieren';
        }
        if (this.regenerateBtn) {
            this.regenerateBtn.disabled = isLoading;
            this.regenerateBtn.style.opacity = isLoading ? '0.5' : '1';
            this.regenerateBtn.textContent = isLoading ? 'Verarbeite...' : 'Neu Generieren';
        }
    }

    private setStatus(message: string, type: 'info' | 'success' | 'error'): void {
        this.statusText.textContent = message;
        switch (type) {
            case 'info':
                this.statusText.style.color = 'var(--text-color)';
                break;
            case 'success':
                this.statusText.style.color = '#2ecc71'; // Green
                break;
            case 'error':
                this.statusText.style.color = '#e74c3c'; // Red
                break;
        }
    }

    private async saveGraphFile(filename: string, content: string): Promise<void> {
        try {
            await fetch('/api/save_graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, content })
            });
        } catch (e) {
            console.warn('[CreatePanel] Fehler beim Speichern:', e);
        }
    }

    private downloadStep(step: number, name: string, content: string, ext: string, prefixOrSuffix: string, isPrefix: boolean = false): void {
        const mime = ext === 'json' ? 'application/json' : (ext === 'md' ? 'text/markdown' : 'text/plain');
        const formattedStep = String(step).padStart(2, '0');
        const filename = isPrefix 
            ? `${prefixOrSuffix}_${formattedStep}_${name}.${ext}`
            : `${formattedStep}_${name}_${prefixOrSuffix}.${ext}`;
        this.app.exportManager?.downloadFile(content, filename, mime);
    }
    private showHumanInTheLoopReview(graphData: any, onSave: (finalData: any) => void) {
        const modal = document.createElement('div');
        modal.id = 'b10-review-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.backdropFilter = 'blur(10px)';
        modal.style.zIndex = '99999';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';

        const box = document.createElement('div');
        box.style.backgroundColor = '#1a1a1a';
        box.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        box.style.borderRadius = '8px';
        box.style.width = '80%';
        box.style.maxWidth = '900px';
        box.style.height = '80%';
        box.style.display = 'flex';
        box.style.flexDirection = 'column';
        box.style.padding = '20px';
        box.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)';

        const header = document.createElement('h3');
        header.textContent = 'Human-in-the-loop: Graph-Review';
        header.style.marginTop = '0';
        header.style.color = 'var(--accent-color)';
        box.appendChild(header);

        const content = document.createElement('div');
        content.style.flex = '1';
        content.style.overflowY = 'auto';
        content.style.marginBottom = '20px';
        content.style.display = 'grid';
        content.style.gridTemplateColumns = '1fr 1fr';
        content.style.gap = '20px';

        // Entities Column
        const entCol = document.createElement('div');
        const entTitle = document.createElement('h4');
        entTitle.textContent = `Knoten (Entities: ${graphData.data.entities.length})`;
        entCol.appendChild(entTitle);

        const entList = document.createElement('div');
        entList.style.display = 'flex';
        entList.style.flexDirection = 'column';
        entList.style.gap = '8px';

        const tempEntities = [...graphData.data.entities];
        tempEntities.forEach((ent) => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.gap = '5px';
            item.style.alignItems = 'center';
            item.style.backgroundColor = 'rgba(255,255,255,0.05)';
            item.style.padding = '5px';
            item.style.borderRadius = '3px';

            const idInput = document.createElement('input');
            idInput.value = ent.id;
            idInput.disabled = true;
            idInput.style.width = '60px';
            idInput.style.backgroundColor = 'transparent';
            idInput.style.border = 'none';
            idInput.style.color = 'var(--text-muted)';
            
            const labelInput = document.createElement('input');
            labelInput.value = ent.label || '';
            labelInput.className = 'form-control';
            labelInput.style.flex = '1';
            labelInput.style.padding = '3px';
            labelInput.style.backgroundColor = 'rgba(0,0,0,0.3)';
            labelInput.style.border = '1px solid rgba(255,255,255,0.1)';
            labelInput.style.color = 'var(--text-color)';
            labelInput.addEventListener('input', () => {
                ent.label = labelInput.value;
            });

            const delBtn = document.createElement('button');
            delBtn.textContent = 'X';
            delBtn.style.background = 'none';
            delBtn.style.border = 'none';
            delBtn.style.cursor = 'pointer';
            delBtn.addEventListener('click', () => {
                tempEntities.splice(tempEntities.indexOf(ent), 1);
                item.remove();
            });

            item.appendChild(idInput);
            item.appendChild(labelInput);
            item.appendChild(delBtn);
            entList.appendChild(item);
        });
        entCol.appendChild(entList);
        content.appendChild(entCol);

        // Relationships Column
        const relCol = document.createElement('div');
        const relTitle = document.createElement('h4');
        relTitle.textContent = `Kanten (Relationships: ${graphData.data.relationships.length})`;
        relCol.appendChild(relTitle);

        const relList = document.createElement('div');
        relList.style.display = 'flex';
        relList.style.flexDirection = 'column';
        relList.style.gap = '8px';

        const tempRelationships = [...graphData.data.relationships];
        tempRelationships.forEach((rel) => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.gap = '5px';
            item.style.alignItems = 'center';
            item.style.backgroundColor = 'rgba(255,255,255,0.05)';
            item.style.padding = '5px';
            item.style.borderRadius = '3px';

            const connText = document.createElement('span');
            connText.textContent = `${rel.source} ➔ ${rel.target}`;
            connText.style.color = 'var(--text-muted)';
            connText.style.width = '100px';

            const labelInput = document.createElement('input');
            labelInput.value = rel.label || '';
            labelInput.className = 'form-control';
            labelInput.style.flex = '1';
            labelInput.style.padding = '3px';
            labelInput.style.backgroundColor = 'rgba(0,0,0,0.3)';
            labelInput.style.border = '1px solid rgba(255,255,255,0.1)';
            labelInput.style.color = 'var(--text-color)';
            labelInput.addEventListener('input', () => {
                rel.label = labelInput.value;
            });

            const delBtn = document.createElement('button');
            delBtn.textContent = '❌';
            delBtn.style.background = 'none';
            delBtn.style.border = 'none';
            delBtn.style.cursor = 'pointer';
            delBtn.addEventListener('click', () => {
                tempRelationships.splice(tempRelationships.indexOf(rel), 1);
                item.remove();
            });

            item.appendChild(connText);
            item.appendChild(labelInput);
            item.appendChild(delBtn);
            relList.appendChild(item);
        });
        relCol.appendChild(relList);
        content.appendChild(relCol);

        box.appendChild(content);

        // Footer buttons
        const footer = document.createElement('div');
        footer.style.display = 'flex';
        footer.style.justifyContent = 'flex-end';
        footer.style.gap = '10px';

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Verwerfen';
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Visualisieren';
        saveBtn.className = 'btn btn-primary';
        saveBtn.addEventListener('click', () => {
            graphData.data.entities = tempEntities;
            graphData.data.relationships = tempRelationships;
            onSave(graphData);
            modal.remove();
        });

        footer.appendChild(cancelBtn);
        footer.appendChild(saveBtn);
        box.appendChild(footer);

        modal.appendChild(box);
        document.body.appendChild(modal);
    }

}

