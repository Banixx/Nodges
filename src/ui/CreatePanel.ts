/**
 * CreatePanel - UI component for the "Create" tab
 * Allows users to generate new nodes and edges using an LLM.
 */
import { IStateManager } from '../core/interfaces';
import type { App } from '../App';
import { LLMService, LLMProvider, LLMModel } from '../utils/LLMService';
import { deduplicateGraph, getSemanticSearchMatches } from '../utils/VectorStoreManager';
import * as THREE from 'three';
import pkg from '../../package.json';


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
    private generateBtn!: HTMLButtonElement;
    private statusText!: HTMLElement;
    private interactionModeCheckbox!: HTMLInputElement;
    private chatLog!: HTMLDivElement;
    private clarificationHistory: {role: 'user'|'assistant', content: string}[] = [];

    // Build 10 Properties
    private build10Container!: HTMLElement;
    private b10GroundingSelect!: HTMLSelectElement;
    private b10QaSelect!: HTMLSelectElement;
    private b10RatingSelect!: HTMLSelectElement;

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
        if (this.generateBtn) {
            this.generateBtn.textContent = 'Netzwerk Generieren';
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
        keyTitle.textContent = '1. LLM API Key & Anbieter (BYOK)';

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
        keyDesc.style.fontSize = '11px';
        keyDesc.style.color = 'var(--text-muted)';
        keyDesc.style.marginBottom = '8px';
        keyDesc.textContent = 'Dein Key wird im LocalStorage des Browsers gespeichert. Du bist dort verantwortlich. Ich empfehle grundsätzlich limitierte Keys zu verwenden. ';
        
        const freeBtn = document.createElement('button');
        freeBtn.textContent = 'Free';
        freeBtn.className = 'action-button secondary';
        freeBtn.style.padding = '2px 6px';
        freeBtn.style.fontSize = '10px';
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
        providerLabel.style.fontSize = '11px';
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
        this.providerSelect.style.fontFamily = 'inherit';

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
        keyInputLabel.style.fontSize = '11px';
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

        // --- GENERATOR SECTION ---
        const genSection = document.createElement('section');
        genSection.className = 'panel-section';

        const genHeader = document.createElement('h4');
        genHeader.className = 'section-header';
        genHeader.textContent = 'Netzwerk per KI generieren';
        genSection.appendChild(genHeader);

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
        this.modelInput.style.fontFamily = 'inherit';
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
        this.pipelineSelect.style.fontFamily = 'inherit';

        const pipelines = [
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
        b10Title.style.fontSize = '12px';
        this.build10Container.appendChild(b10Title);

        // Grounding Dropdown
        const grLabel = document.createElement('label');
        grLabel.textContent = 'Grounding / Wissensquelle:';
        grLabel.style.display = 'block';
        grLabel.style.fontSize = '11px';
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
        this.b10GroundingSelect.style.fontSize = '11px';
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
        qaLabel.style.fontSize = '11px';
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
        this.b10QaSelect.style.fontSize = '11px';
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
        rtLabel.style.fontSize = '11px';
        rtLabel.style.marginBottom = '4px';
        rtLabel.style.color = 'var(--text-muted)';
        this.build10Container.appendChild(rtLabel);

        this.b10RatingSelect = document.createElement('select');
        this.b10RatingSelect.className = 'form-control';
        this.b10RatingSelect.style.width = '100%';
        this.b10RatingSelect.style.backgroundColor = 'rgba(0,0,0,0.3)';
        this.b10RatingSelect.style.border = '1px solid rgba(255,255,255,0.1)';
        this.b10RatingSelect.style.color = 'var(--text-color)';
        this.b10RatingSelect.style.fontSize = '11px';
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

        this.pipelineSelect.addEventListener('change', () => {
            this.build10Container.style.display = this.pipelineSelect.value === 'build10' ? 'block' : 'none';
        });

        // Set initial visibility
        this.build10Container.style.display = this.pipelineSelect.value === 'build10' ? 'block' : 'none';

        genSection.appendChild(this.build10Container);

        // --- Interaction Mode Switch ---
        const modeLabel = document.createElement('label');
        modeLabel.style.display = 'flex';
        modeLabel.style.alignItems = 'center';
        modeLabel.style.marginBottom = '15px';
        modeLabel.style.color = 'var(--text-color)';
        modeLabel.style.cursor = 'pointer';
        modeLabel.style.fontSize = '12px';
        modeLabel.title = 'Wechsle zwischen Autonomen Modus und Chat Modus';

        this.interactionModeCheckbox = document.createElement('input');
        this.interactionModeCheckbox.type = 'checkbox';
        this.interactionModeCheckbox.style.marginRight = '8px';
        this.interactionModeCheckbox.style.accentColor = 'var(--accent-color)';
        this.interactionModeCheckbox.style.cursor = 'pointer';
        this.interactionModeCheckbox.style.width = '16px';
        this.interactionModeCheckbox.style.height = '16px';
        
        const modeText = document.createElement('span');
        modeText.textContent = 'Modus: Auto (Autonome Expansion)';
        
        this.interactionModeCheckbox.onchange = () => {
            modeText.textContent = this.interactionModeCheckbox.checked ? 'Modus: Chat (Interaktive Rückfragen)' : 'Modus: Auto (Autonome Expansion)';
            this.resetChatState();
        };

        modeLabel.appendChild(this.interactionModeCheckbox);
        modeLabel.appendChild(modeText);
        
        genSection.appendChild(modeLabel);

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
        this.promptTextarea.style.fontFamily = 'inherit';
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
        pasteBtn.style.padding = '2px 8px';
        pasteBtn.style.fontSize = '11px';
        pasteBtn.style.marginBottom = '5px';
        pasteBtn.textContent = '📋 Paste';
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
        loadUrlBtn.textContent = '🌐 Laden';
        loadUrlBtn.style.padding = '4px 10px';
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
        this.ragTextarea.style.fontFamily = 'inherit';
        genSection.appendChild(this.ragTextarea);

        this.generateBtn = document.createElement('button');
        this.generateBtn.className = 'action-button';
        this.generateBtn.textContent = ' Generieren & Hinzufügen';
        this.generateBtn.onclick = this.handleGenerate.bind(this);
        genSection.appendChild(this.generateBtn);

        this.statusText = document.createElement('div');
        this.statusText.style.marginTop = '15px';
        this.statusText.style.fontSize = '12px';
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
        searchInput.style.fontFamily = 'inherit';
        searchInput.style.boxSizing = 'border-box';
        searchSection.appendChild(searchInput);

        // Threshold Slider
        const thresholdContainer = document.createElement('div');
        thresholdContainer.style.display = 'flex';
        thresholdContainer.style.justifyContent = 'space-between';
        thresholdContainer.style.alignItems = 'center';
        thresholdContainer.style.marginBottom = '10px';
        thresholdContainer.style.fontSize = '12px';

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
        searchBtn.className = 'action-button secondary';
        searchBtn.textContent = '🔍 Suchen';
        searchBtn.style.width = '100%';
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
                    item.style.fontSize = '12px';
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
            empty.style.fontSize = '12px';
            this.modelDropdown.appendChild(empty);
            return;
        }

        const renderGroup = (title: string, models: typeof this.currentModelsList) => {
            if (models.length === 0) return;
            if (title) {
                const groupHeader = document.createElement('div');
                groupHeader.textContent = title;
                groupHeader.style.padding = '4px 8px';
                groupHeader.style.fontSize = '10px';
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
                opt.style.fontSize = '13px';
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
                    link.style.fontSize = '14px';
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

    private async handleGenerate(): Promise<void> {
        let prompt = this.promptTextarea.value.trim();
        if (!prompt) {
            this.setStatus('Bitte gib ein Prompt ein.', 'error');
            return;
        }

        const mode = this.interactionModeCheckbox.checked ? 'chat' : 'auto';
        const provider = this.providerSelect.value as LLMProvider;
        const model = this.selectedModelId;
        const pipeline = this.pipelineSelect.value;

        if (mode === 'chat') {
            if (this.clarificationHistory.length === 0) {
                // Erster Klick: KI fragt nach
                this.clarificationHistory.push({ role: 'user', content: prompt });
                this.updateChatUI();
                
                this.setStatus('Generiere Rückfrage...', 'info');
                this.generateBtn.disabled = true;
                
                try {
                    const question = await LLMService.askClarification(this.clarificationHistory, provider, model);
                    this.clarificationHistory.push({ role: 'assistant', content: question });
                    this.promptTextarea.value = ''; 
                    this.generateBtn.textContent = 'Antworten & Generieren';
                    this.updateChatUI();
                    this.setStatus('Bitte beantworte die Rückfrage.', 'info');
                } catch (error: any) {
                    this.setStatus(`Fehler bei Rückfrage: ${error.message}`, 'error');
                } finally {
                    this.generateBtn.disabled = false;
                }
                return;
            } else {
                // Zweiter Klick: User hat geantwortet, wir bauen den finalen Prompt zusammen
                this.clarificationHistory.push({ role: 'user', content: prompt });
                this.updateChatUI();
                this.generateBtn.textContent = 'Netzwerk Generieren';
                
                prompt = this.clarificationHistory.map(msg => `${msg.role === 'user' ? 'USER' : 'KI'}: ${msg.content}`).join('\n\n');
                
                // Wir resetten den Chat noch NICHT, damit der User sieht, was er generiert hat.
                // Er wird erst resettet, wenn er den Modus wechselt oder neu lädt.
            }
        }

        // --- Frontend NSFW Filter (mittelstreng) ---
        const nsfwKeywords = [
            'porn', 'sex', 'nude', 'nsfw', 'gore', 'murder', 'rape', 'pedophile', 
            'porno', 'nackt', 'sexuell', 'vergewaltigung', 'mord', 'töten', 'schlampe', 
            'hure', 'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cock', 'pussy', 'vagina', 
            'penis', 'hitler', 'nazi', 'terrorist', 'bomb'
        ];
        
        const lowerPrompt = prompt.toLowerCase();
        for (const word of nsfwKeywords) {
            // Regex um das Wort als ganzes Wort zu matchen (verhindert False Positives wie "cocktail")
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            if (regex.test(lowerPrompt)) {
                this.setStatus('Fehler: Die Anfrage verstösst gegen die Inhaltsrichtlinien (NSFW-Filter).', 'error');
                return;
            }
        }
        // -------------------------------------------

        const ragText = this.ragTextarea?.value.trim();
        if (ragText) {
            prompt += `\n\n=== VERFUEGBARER KONTEXT / ROHDATEN (RAG) ===\n${ragText}\n==============================================\nNutze ZWINGEND diese Rohdaten als Faktenbasis fuer die Generierung der Knoten und Kanten.`;
        }



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

        try {
            let graphData: any;

            if (pipeline === 'build10') {
                const config = {
                    grounding: this.b10GroundingSelect.value as any,
                    qualityAssurance: this.b10QaSelect.value as any,
                    ratingMethod: this.b10RatingSelect.value as any
                };
                graphData = await LLMService.generateGraphDataBuild10(
                    prompt,
                    config,
                    provider,
                    model,
                    onProgressWithLog,
                    (step: number, name: string, content: string, ext: string) => {
                        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
                        const mime = ext === 'json' ? 'application/json' : (ext === 'md' ? 'text/markdown' : 'text/plain');
                        this.app.exportManager?.downloadFile(content, `${step}_${name}_${timestamp}.${ext}`, mime);
                    }
                );
            } else if (pipeline === 'build9') {
                onProgressWithLog('Schritt 1/2: Generiere Roh-Netzwerk via LLM...');
                const rawGraph = await LLMService.generateGraphDataBuild6(prompt, provider, model, onProgressWithLog);
                
                onProgressWithLog('Schritt 2/2: Führe semantische Deduplizierung (Entity Resolution) aus...');
                graphData = await deduplicateGraph(rawGraph, provider, 'google/gemini-embedding-2', 0.85, onProgressWithLog);
            } else if (pipeline === 'build8') {
                graphData = await LLMService.generateGraphDataBuild8(
                    prompt, 
                    provider, 
                    model, 
                    onProgressWithLog, 
                    (step: number, name: string, content: string, ext: string) => {
                        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
                        const mime = ext === 'json' ? 'application/json' : (ext === 'md' ? 'text/markdown' : 'text/plain');
                        this.app.exportManager?.downloadFile(content, `${step}_${name}_${timestamp}.${ext}`, mime);
                    }
                );
            } else if (pipeline === 'build6') {
                graphData = await LLMService.generateGraphDataBuild6(prompt, provider, model, onProgressWithLog);
            } else if (pipeline === 'build5') {
                graphData = await LLMService.generateGraphDataMultiStepBuild5(prompt, provider, model, onProgressWithLog);
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
            }

            const endTime = performance.now();
            generationLog.timestampEnd = new Date().toISOString();
            generationLog.durationMs = Math.round(endTime - startTime);
            generationLog.durationSec = (generationLog.durationMs / 1000).toFixed(2);
            generationLog.status = 'success';

            // --- Inject generation metadata directly into the JSON graphData ---
            if (graphData) {
                if (!graphData.metadata) graphData.metadata = {};
                
                // 1. Schema-Version
                graphData.metadata.schemaVersion = graphData.metadata.schemaVersion || "5.0";

                // 2. Nodges-Version aus package.json
                graphData.metadata.nodgesVersion = pkg.version;

                // 3. Verwendeter Build (Pipeline)
                graphData.metadata.build = pipeline;

                // 4. Prompt
                graphData.metadata.prompt = prompt;

                // 5. Build-spezifische Parameter
                const buildParams: Record<string, any> = {
                    provider: provider,
                    model: model,
                    interactionMode: mode,
                    hasRagContext: !!ragText
                };

                if (pipeline === 'build10') {
                    buildParams.grounding = this.b10GroundingSelect.value;
                    buildParams.qualityAssurance = this.b10QaSelect.value;
                    buildParams.ratingMethod = this.b10RatingSelect.value;
                } else if (pipeline === 'build9') {
                    buildParams.deduplicationThreshold = 0.85;
                    buildParams.embeddingModel = 'google/gemini-embedding-2';
                } else if (pipeline === 'build8') {
                    buildParams.wikidataGrounding = true;
                    buildParams.sparqlPipeline = true;
                } else if (pipeline === 'build5') {
                    buildParams.multiStep = {
                        ontology: 'build_5_ontology_prompt.md',
                        data: 'build_5_data_prompt.md',
                        visuals: 'build_5_visual_prompt.md'
                    };
                }

                graphData.metadata.buildParameters = buildParams;

                // Behalte das alte generationDetails zur Kompatibilität
                graphData.metadata.generationDetails = {
                    prompt: prompt,
                    context: ragText || null,
                    provider: provider,
                    model: model,
                    pipeline: pipeline,
                    durationMs: generationLog.durationMs,
                    timestamp: generationLog.timestampEnd
                };
            }

            this.setStatus('Graph generiert! Lade in Visualizer...', 'info');

            // Load data into graph
            if (graphData) {
                const processLoadedGraph = async (dataToLoad: any) => {
                    if (pipeline === 'refine') {
                        const sourceName = 'AI_Refined_' + Date.now();
                        await this.app.loadGraphData(dataToLoad, sourceName, false);
                    } else {
                        const sourceName = 'AI_Generation_' + Date.now();
                        await this.app.loadGraphData(dataToLoad, sourceName, true);
                    }

                    // --- Auto-Save & Logging Feature ---
                    try {
                        if (dataToLoad && this.app?.currentGraphData && this.app?.exportManager) {
                            this.setStatus('Graph geladen! Speichere in Projekt-Dateien...', 'info');
                            const exportOptions: any = { 
                                currentEntities: this.app.currentEntities || [],
                                activeVisualMappings: this.app.visualMappingEngine?.getVisualMappings() || null,
                                activeDataModel: this.app.currentGraphData.dataModel || null
                            };
                            const jsonStr = this.app.exportManager.exportNodgesJSON(this.app.currentGraphData, exportOptions);
                            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
                            
                            const filename = `AI_Generation_${timestamp}.json`;
                            
                            try {
                                const response = await fetch('/api/save_graph', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ filename, content: jsonStr })
                                });
                                const responseText = await response.text();
                                if (!response.ok || responseText.includes('<!DOCTYPE html>')) {
                                    console.warn("Failed to save to server", responseText);
                                    // Fallback to download if server save fails
                                    this.app.exportManager.downloadFile(jsonStr, `Nodges_AutoSave_${timestamp}.json`, 'application/json');
                                } else {
                                    // Automatically add to available files list in UI without reload if possible
                                    const filePanel = (this.app as any).uiManager?.panels?.get('file');
                                    if (filePanel && filePanel.availableFiles) {
                                        filePanel.availableFiles.push(`generated/${filename}`);
                                        // Trigger a re-render of the file panel
                                        const currentFiles = this.app.stateManager.state.loadedFiles || [];
                                        this.app.stateManager.setLoadedFiles([...currentFiles]);
                                    }
                                }
                            } catch (e) {
                                 // Fallback to download
                                 this.app.exportManager.downloadFile(jsonStr, `Nodges_AutoSave_${timestamp}.json`, 'application/json');
                            }
                            
                            // Log JSON
                            generationLog.generatedNodes = dataToLoad?.data?.entities?.length || 0;
                            generationLog.generatedEdges = dataToLoad?.data?.relationships?.length || 0;
                            generationLog.responsePayloadSizeKB = dataToLoad ? (JSON.stringify(dataToLoad).length / 1024).toFixed(2) : "0";
                            
                            const logStr = JSON.stringify(generationLog, null, 2);
                            
                            // Save Log to server as well
                            try {
                                const logFilename = `AI_GenerationLog_${timestamp}.json`;
                                const logResponse = await fetch('/api/save_graph', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ filename: logFilename, content: logStr })
                                });
                                const logResponseText = await logResponse.text();
                                if (!logResponse.ok || logResponseText.includes('<!DOCTYPE html>')) {
                                    this.app.exportManager.downloadFile(logStr, logFilename, 'application/json');
                                }
                            } catch(e) {
                                this.app.exportManager.downloadFile(logStr, `AI_GenerationLog_${timestamp}.json`, 'application/json');
                            }
                        }
                    } catch (e) {
                        console.warn('Auto-save or logging failed:', e);
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
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
                this.app.exportManager?.downloadFile(logStr, `Nodges_ErrorLog_${timestamp}.json`, 'application/json');
            } catch(e) {}

            this.setStatus(error.message || 'Ein unbekannter Fehler ist aufgetreten.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    private setLoading(isLoading: boolean): void {
        this.generateBtn.disabled = isLoading;
        this.generateBtn.style.opacity = isLoading ? '0.5' : '1';
        this.generateBtn.textContent = isLoading ? '⏳ Verarbeite...' : '✨ Generieren & Hinzufügen';
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
            labelInput.style.fontSize = '12px';
            labelInput.style.padding = '3px';
            labelInput.style.backgroundColor = 'rgba(0,0,0,0.3)';
            labelInput.style.border = '1px solid rgba(255,255,255,0.1)';
            labelInput.style.color = 'var(--text-color)';
            labelInput.addEventListener('input', () => {
                ent.label = labelInput.value;
            });

            const delBtn = document.createElement('button');
            delBtn.textContent = '❌';
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
            connText.style.fontSize = '11px';
            connText.style.color = 'var(--text-muted)';
            connText.style.width = '100px';

            const labelInput = document.createElement('input');
            labelInput.value = rel.label || '';
            labelInput.className = 'form-control';
            labelInput.style.flex = '1';
            labelInput.style.fontSize = '12px';
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
