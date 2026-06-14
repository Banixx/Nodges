/**
 * CreatePanel - UI component for the "Create" tab
 * Allows users to generate new nodes and edges using an LLM.
 */
import { IStateManager } from '../core/interfaces';

import type { App } from '../App';
import { LLMService } from '../utils/LLMService';

export class CreatePanel {
    private container: HTMLElement;

    private app: App;

    private keyInput!: HTMLInputElement;
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

        // --- API KEY SECTION ---
        const keySection = document.createElement('section');
        keySection.className = 'panel-section';

        const keyHeader = document.createElement('h4');
        keyHeader.className = 'section-header';
        keyHeader.style.display = 'flex';
        keyHeader.style.justifyContent = 'space-between';
        keyHeader.style.cursor = 'pointer';
        
        const keyTitle = document.createElement('span');
        keyTitle.textContent = 'OpenRouter API Key (BYOK)';
        
        const keyToggle = document.createElement('span');
        keyToggle.textContent = '▾';
        
        keyHeader.appendChild(keyTitle);
        keyHeader.appendChild(keyToggle);

        const keyContent = document.createElement('div');
        keyContent.style.marginTop = '10px';
        keyContent.style.display = 'none'; // Collapsed by default if key exists

        const keyDesc = document.createElement('p');
        keyDesc.style.fontSize = '11px';
        keyDesc.style.color = 'var(--text-muted)';
        keyDesc.style.marginBottom = '8px';
        keyDesc.textContent = 'Dein Key wird sicher im LocalStorage des Browsers gespeichert und nie an unsere Server gesendet.';
        keyContent.appendChild(keyDesc);

        this.keyInput = document.createElement('input');
        this.keyInput.type = 'password';
        this.keyInput.placeholder = 'sk-or-v1-...';
        this.keyInput.className = 'form-control'; // Use app styles
        this.keyInput.style.width = '100%';
        this.keyInput.style.marginBottom = '8px';
        
        const savedKey = LLMService.getApiKey();
        if (savedKey) {
            this.keyInput.value = savedKey;
        } else {
            keyContent.style.display = 'block';
            keyToggle.textContent = '▴';
        }

        const saveKeyBtn = document.createElement('button');
        saveKeyBtn.className = 'action-button secondary';
        saveKeyBtn.textContent = 'Key Speichern';
        saveKeyBtn.onclick = () => {
            if (this.keyInput.value.trim()) {
                LLMService.setApiKey(this.keyInput.value);
                keyContent.style.display = 'none';
                keyToggle.textContent = '▾';
                this.setStatus('API-Key lokal gespeichert.', 'success');
            } else {
                LLMService.clearApiKey();
                this.setStatus('API-Key entfernt.', 'info');
            }
        };

        keyContent.appendChild(this.keyInput);
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

    private async handleGenerate(): Promise<void> {
        const prompt = this.promptTextarea.value.trim();
        if (!prompt) {
            this.setStatus('Bitte gib ein Prompt ein.', 'error');
            return;
        }

        if (!LLMService.getApiKey()) {
            this.setStatus('Bitte hinterlege zuerst deinen OpenRouter API-Key.', 'error');
            return;
        }

        this.setLoading(true);
        this.setStatus('Generiere Graph-Daten... (Das kann einige Sekunden dauern)', 'info');

        try {
            const graphData = await LLMService.generateGraphData(prompt);
            
            // Append data to existing graph
            // We prefix it with a timestamp to avoid ID collisions if needed, but DataParser handles prefixing inside loadGraphData
            const sourceName = 'AI_Generation_' + Date.now();
            await this.app.loadGraphData(graphData, sourceName, true);
            
            const nodeCount = graphData.data.entities?.length || 0;
            const edgeCount = graphData.data.relationships?.length || 0;
            
            this.setStatus(`Erfolgreich hinzugefügt: ${nodeCount} Knoten, ${edgeCount} Kanten.`, 'success');
            
            // Optionally clear the prompt
            // this.promptTextarea.value = '';
            
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
