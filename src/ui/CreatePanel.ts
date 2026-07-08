/**
 * CreatePanel - UI component for the "Create" tab
 * Allows users to generate new nodes and edges using an LLM.
 */
import { IStateManager } from '../core/interfaces';
import type { App } from '../App';
import { LLMService, LLMProvider, LLMModel } from '../utils/LLMService';

export class CreatePanel {
    private container: HTMLElement;
    private app: App;
    private stateManager: IStateManager;

    private providerSelect!: HTMLSelectElement;
    private keyInput!: HTMLInputElement;
    private modelSelect!: HTMLSelectElement;
    private pipelineSelect!: HTMLSelectElement;
    private ragTextarea!: HTMLTextAreaElement;
    private urlInput!: HTMLInputElement;
    private promptTextarea!: HTMLTextAreaElement;
    private generateBtn!: HTMLButtonElement;
    private statusText!: HTMLElement;

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
        keyDesc.textContent = 'Dein Key wird im LocalStorage des Browsers gespeichert. Du bist dort verantwortlich. Ich empfehle grundsätzlich limitierte Keys zu verwenden.';
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

        this.modelSelect = document.createElement('select');
        this.modelSelect.className = 'form-control';
        this.modelSelect.style.width = '100%';
        this.modelSelect.style.marginBottom = '15px';
        this.modelSelect.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        this.modelSelect.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        this.modelSelect.style.color = 'var(--text-color)';
        this.modelSelect.style.padding = '6px';
        this.modelSelect.style.borderRadius = '4px';
        this.modelSelect.style.fontFamily = 'inherit';
        genSection.appendChild(this.modelSelect);

        // Populate models initially
        this.updateModelOptions(activeProvider);

        // Event listeners
        this.providerSelect.onchange = () => {
            const provider = this.providerSelect.value as LLMProvider;
            LLMService.setActiveProvider(provider);
            const key = LLMService.getApiKey(provider);
            this.keyInput.value = key || '';
            this.updateModelOptions(provider);
        };

        this.modelSelect.onchange = () => {
            const provider = this.providerSelect.value as LLMProvider;
            LLMService.setActiveModel(provider, this.modelSelect.value);
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
            { value: 'build5', label: 'Neu: Build 5 (3-stufig: Ontologie -> Daten -> Mapping)' },
            { value: 'refine', label: 'Update: Iterativ (Bestehendes Netzwerk anpassen)' }
        ];

        pipelines.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.value;
            opt.textContent = p.label;
            this.pipelineSelect.appendChild(opt);
        });
        genSection.appendChild(this.pipelineSelect);

        const promptLabel = document.createElement('label');
        promptLabel.textContent = 'Dein Prompt:';
        promptLabel.style.display = 'block';
        promptLabel.style.marginBottom = '5px';
        promptLabel.style.color = 'var(--text-muted)';
        genSection.appendChild(promptLabel);

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
    }

    private async updateModelOptions(provider: LLMProvider): Promise<void> {
        this.modelSelect.innerHTML = '';
        this.modelSelect.disabled = true;

        const loadingOpt = document.createElement('option');
        loadingOpt.textContent = 'Lade Modelle...';
        loadingOpt.disabled = true;
        loadingOpt.selected = true;
        this.modelSelect.appendChild(loadingOpt);

        let models: LLMModel[] = [];
        let recommendedModels: LLMModel[] = [];
        const activeModel = LLMService.getActiveModel(provider);

        if (provider === 'openrouter') {
            // Fetch models from OpenRouter dynamically
            models = await LLMService.fetchOpenRouterModels();
            recommendedModels = LLMService.PROVIDER_MODELS.openrouter;
        } else {
            // Use static lists for OpenAI/Anthropic
            models = LLMService.PROVIDER_MODELS[provider] || [];
            recommendedModels = [];
        }

        // Guard: If provider changed while fetching, ignore the result
        if (this.providerSelect.value !== provider) {
            return;
        }

        this.modelSelect.innerHTML = '';
        this.modelSelect.disabled = false;

        if (recommendedModels.length > 0) {
            // Group recommended models
            const recGroup = document.createElement('optgroup');
            recGroup.label = 'Empfohlen';
            recommendedModels.forEach(model => {
                const opt = document.createElement('option');
                opt.value = model.id;
                opt.textContent = model.name;
                if (model.id === activeModel) {
                    opt.selected = true;
                }
                recGroup.appendChild(opt);
            });
            this.modelSelect.appendChild(recGroup);

            // Group all other models
            const allGroup = document.createElement('optgroup');
            allGroup.label = 'Alle OpenRouter Modelle';
            models.forEach(model => {
                // Skip if already in recommended
                if (recommendedModels.some(r => r.id === model.id)) {
                    return;
                }
                const opt = document.createElement('option');
                opt.value = model.id;
                opt.textContent = model.name;
                if (model.id === activeModel) {
                    opt.selected = true;
                }
                allGroup.appendChild(opt);
            });
            this.modelSelect.appendChild(allGroup);
        } else {
            // Just populate list directly
            models.forEach(model => {
                const opt = document.createElement('option');
                opt.value = model.id;
                opt.textContent = model.name;
                if (model.id === activeModel) {
                    opt.selected = true;
                }
                this.modelSelect.appendChild(opt);
            });
        }

        // Ensure active model is selected, or fallback to first option
        if (this.modelSelect.value === '' && this.modelSelect.options.length > 0) {
            this.modelSelect.selectedIndex = 0;
            LLMService.setActiveModel(provider, this.modelSelect.value);
        }
    }

    private async handleGenerate(): Promise<void> {
        let prompt = this.promptTextarea.value.trim();
        if (!prompt) {
            this.setStatus('Bitte gib ein Prompt ein.', 'error');
            return;
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

        const provider = this.providerSelect.value as LLMProvider;
        const model = this.modelSelect.value;
        const pipeline = this.pipelineSelect.value;

        if (!LLMService.getApiKey(provider)) {
            this.setStatus(`Bitte hinterlege zuerst deinen API-Key für ${provider}.`, 'error');
            return;
        }

        this.setLoading(true);
        this.setStatus('Bereite Generierung vor...', 'info');

        try {
            let graphData: any;

            if (pipeline === 'build5') {
                graphData = await LLMService.generateGraphDataMultiStepBuild5(prompt, provider, model, (msg) => {
                    this.setStatus(msg, 'info');
                });
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
                graphData = await LLMService.refineGraphData(existingData as any, prompt, provider, model, '/prompts/build_5_data_prompt.md', (msg) => {
                    this.setStatus(msg, 'info');
                });
            }

            this.setStatus('Graph generiert! Lade in Visualizer...', 'info');

            // Load data into graph
            if (pipeline === 'refine') {
                const sourceName = 'AI_Refined_' + Date.now();
                await this.app.loadGraphData(graphData, sourceName, false);
            } else {
                const sourceName = 'AI_Generation_' + Date.now();
                await this.app.loadGraphData(graphData, sourceName, true);
            }

            // --- Auto-Save Feature ---
            try {
                if (this.app.currentGraphData && this.app.exportManager) {
                    this.setStatus('Graph geladen! Speichere Backup-Datei...', 'info');
                    const exportOptions: any = { 
                        currentEntities: this.app.currentEntities,
                        activeVisualMappings: this.app.visualMappingEngine?.getVisualMappings() || null,
                        activeDataModel: this.app.currentGraphData.dataModel || null
                    };
                    const jsonStr = this.app.exportManager.exportNodgesJSON(this.app.currentGraphData, exportOptions);
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
                    this.app.exportManager.downloadFile(jsonStr, `Nodges_AutoSave_${timestamp}.json`, 'application/json');
                }
            } catch (e) {
                console.warn('Auto-save failed:', e);
            }

            const nodeCount = graphData.data.entities?.length || 0;
            const edgeCount = graphData.data.relationships?.length || 0;

            this.setStatus(`Erfolgreich generiert: ${nodeCount} Knoten, ${edgeCount} Kanten. Auto-Save durchgeführt!`, 'success');

        } catch (error: any) {
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
}
