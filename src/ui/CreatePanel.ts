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

    private providerSelect!: HTMLSelectElement;
    private keyInput!: HTMLInputElement;
    private modelSelect!: HTMLSelectElement;
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

        this.app = app;
        this.render();
    }

    private render(): void {
        this.container.innerHTML = '';

        const activeProvider = LLMService.getActiveProvider();

        // --- API KEY SECTION ---
        const keySection = document.createElement('section');
        keySection.className = 'panel-section';

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
        keyDesc.style.fontSize = '11px';
        keyDesc.style.color = 'var(--text-muted)';
        keyDesc.style.marginBottom = '8px';
        keyDesc.textContent = 'Dein Key wird sicher im LocalStorage des Browsers gespeichert und nie an unsere Server gesendet.';
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
        this.keyInput.placeholder = 'Schlüssel hier einfügen...';
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

        this.generateBtn = document.createElement('button');
        this.generateBtn.className = 'action-button';
        this.generateBtn.textContent = '✨ Generieren & Hinzufügen';
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
        const prompt = this.promptTextarea.value.trim();
        if (!prompt) {
            this.setStatus('Bitte gib ein Prompt ein.', 'error');
            return;
        }

        const provider = this.providerSelect.value as LLMProvider;
        const model = this.modelSelect.value;

        if (!LLMService.getApiKey(provider)) {
            this.setStatus(`Bitte hinterlege zuerst deinen API-Key für ${provider}.`, 'error');
            return;
        }

        this.setLoading(true);
        this.setStatus('Generiere Graph-Daten... (Das kann einige Sekunden dauern)', 'info');

        try {
            const graphData = await LLMService.generateGraphData(prompt, provider, model);
            
            // Append data to existing graph
            const sourceName = 'AI_Generation_' + Date.now();
            await this.app.loadGraphData(graphData, sourceName, true);
            
            const nodeCount = graphData.data.entities?.length || 0;
            const edgeCount = graphData.data.relationships?.length || 0;
            
            this.setStatus(`Erfolgreich hinzugefügt: ${nodeCount} Knoten, ${edgeCount} Kanten.`, 'success');
            
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
