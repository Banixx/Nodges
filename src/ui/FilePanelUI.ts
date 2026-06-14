import type { App } from '../App';
import { IStateManager } from '../core/interfaces';

export class FilePanelUI {
    private app: App;
    private stateManager: IStateManager;
    private filePanelContent: HTMLElement | null;
    private availableFiles: string[] = [];
    private isRenderFilePanelPending: boolean = false;

    constructor(containerId: string, stateManager: IStateManager, app: App) {
        this.stateManager = stateManager;
        this.app = app;
        this.filePanelContent = document.getElementById(containerId);

        if (!this.filePanelContent) {
            console.warn(`[FilePanelUI] Container '${containerId}' not found.`);
        }

        this.init();

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

    private async init() {
        await this.loadAvailableFiles();
    }

    public async loadAvailableFiles() {
        if (!this.filePanelContent) return;

        this.filePanelContent.innerHTML = '<div id="fileLoadingIndicator">Loading files...</div>';

        this.availableFiles = await this.fetchDirectoryContents();
        this.renderFilePanel();
    }

    private renderFilePanel() {
        if (!this.filePanelContent) return;
        this.filePanelContent.innerHTML = '';

        // --- ACTION BUTTONS (NEW / OPEN / SAVE AS) ---
        const actionsHeader = document.createElement('h4');
        actionsHeader.className = 'section-header';
        actionsHeader.textContent = 'Projekt-Aktionen';
        this.filePanelContent.appendChild(actionsHeader);

        const actionsRow = document.createElement('div');
        actionsRow.className = 'file-actions-row';
        actionsRow.style.display = 'flex';
        actionsRow.style.gap = '8px';
        actionsRow.style.marginBottom = '15px';

        const newBtn = document.createElement('button');
        newBtn.className = 'action-button secondary';
        newBtn.style.marginTop = '0';
        newBtn.style.flex = '1';
        newBtn.style.fontSize = '12px';
        newBtn.style.padding = '8px 4px';
        newBtn.textContent = 'Neu';
        newBtn.onclick = () => {
            this.showConfirmDialog(
                'Neues Projekt',
                'Möchten Sie wirklich ein neues Projekt starten? Ungespeicherte Änderungen gehen verloren.',
                () => this.app.newGraph()
            );
        };

        const openBtn = document.createElement('button');
        openBtn.className = 'action-button secondary';
        openBtn.style.marginTop = '0';
        openBtn.style.flex = '1';
        openBtn.style.fontSize = '12px';
        openBtn.style.padding = '8px 4px';
        openBtn.textContent = 'Öffnen';
        openBtn.onclick = () => {
            this.app.fileHandler.openImportDialog();
        };

        const saveBtn = document.createElement('button');
        saveBtn.className = 'action-button';
        saveBtn.style.marginTop = '0';
        saveBtn.style.flex = '1';
        saveBtn.style.fontSize = '12px';
        saveBtn.style.padding = '8px 4px';
        saveBtn.textContent = 'Speichern als';
        saveBtn.onclick = () => {
            this.showSaveAsDialog();
        };

        actionsRow.appendChild(newBtn);
        actionsRow.appendChild(openBtn);
        actionsRow.appendChild(saveBtn);
        this.filePanelContent.appendChild(actionsRow);

        const loadedFiles = this.stateManager.state.loadedFiles || [];

        // --- GELADENE DATEIEN ---
        if (loadedFiles.length > 0) {
            const loadedHeader = document.createElement('h4');
            loadedHeader.className = 'section-header';
            loadedHeader.textContent = 'Geladene Dateien';
            this.filePanelContent.appendChild(loadedHeader);

            loadedFiles.forEach((file: any) => {
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
                const isLoaded = loadedFiles.some((f: any) => f.id === `${filename}.json`);

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

    private async fetchDirectoryContents(): Promise<string[]> {
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

    private createDisplayName(filename: string): string {
        const nameMap: { [key: string]: string } = {
            'small': 'Small Network', 'medium': 'Medium Network', 'large': 'Large Network',
            'mega': 'Mega Network', 'family': 'Family Tree', 'architektur': 'Architecture',
            'royal_family': 'Royal Family', 'us_legal_system_actors': 'US Legal System'
        };
        return nameMap[filename] || filename.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    private showSaveAsDialog() {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';

        // Create modal content container
        const modal = document.createElement('div');
        modal.className = 'modal-content';

        // Header
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = '<h3>Netzwerk speichern unter...</h3>';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => document.body.removeChild(overlay);
        header.appendChild(closeBtn);

        // Body
        const body = document.createElement('div');
        body.className = 'modal-body';

        // Filename Input
        const nameGroup = document.createElement('div');
        nameGroup.className = 'form-group';
        nameGroup.style.display = 'flex';
        nameGroup.style.flexDirection = 'column';
        nameGroup.style.marginBottom = '12px';
        nameGroup.innerHTML = `
            <label style="margin-bottom: 4px; color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Dateiname</label>
            <input type="text" id="saveFilenameInput" value="netzwerk_export" style="margin-bottom: 0; width: 100%; box-sizing: border-box;">
        `;
        body.appendChild(nameGroup);

        // Format Select
        const formatGroup = document.createElement('div');
        formatGroup.className = 'form-group';
        formatGroup.style.display = 'flex';
        formatGroup.style.flexDirection = 'column';
        formatGroup.style.marginBottom = '12px';
        formatGroup.innerHTML = `
            <label style="margin-bottom: 4px; color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Format</label>
            <select id="saveFormatSelect" style="margin-bottom: 0; width: 100%; box-sizing: border-box; background: var(--bg-dark); color: var(--text-color); border: 1px solid var(--border-color); padding: 8px; border-radius: 4px;">
                <option value="json">JSON (.json)</option>
                <option value="gexf">GEXF (.gexf)</option>
                <option value="graphml">GraphML (.graphml)</option>
                <option value="csv">CSV (.csv)</option>
            </select>
        `;
        body.appendChild(formatGroup);

        // JSON options (include viz state checkbox)
        const optionsGroup = document.createElement('div');
        optionsGroup.id = 'jsonOptionsGroup';
        optionsGroup.className = 'form-group';
        optionsGroup.style.marginBottom = '12px';
        
        const checkboxRow = document.createElement('div');
        checkboxRow.className = 'checkbox-row';
        checkboxRow.style.display = 'flex';
        checkboxRow.style.justifyContent = 'space-between';
        checkboxRow.style.alignItems = 'center';
        checkboxRow.innerHTML = `
            <label for="includeVizStateCheckbox" style="font-size: 13px;">Visualisierungszustand einbeziehen</label>
            <input type="checkbox" id="includeVizStateCheckbox" checked style="accent-color: var(--accent-color); cursor: pointer;">
        `;
        optionsGroup.appendChild(checkboxRow);
        body.appendChild(optionsGroup);

        // Add change listener to format select to toggle options
        const formatSelect = formatGroup.querySelector('#saveFormatSelect') as HTMLSelectElement;
        formatSelect.onchange = () => {
            if (formatSelect.value === 'json') {
                optionsGroup.style.display = 'block';
            } else {
                optionsGroup.style.display = 'none';
            }
        };

        // Footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        footer.style.display = 'flex';
        footer.style.gap = '10px';
        footer.style.justifyContent = 'flex-end';

        const saveConfirmBtn = document.createElement('button');
        saveConfirmBtn.className = 'action-button';
        saveConfirmBtn.style.marginTop = '0';
        saveConfirmBtn.style.width = 'auto';
        saveConfirmBtn.style.padding = '8px 16px';
        saveConfirmBtn.textContent = 'Speichern';
        saveConfirmBtn.onclick = async () => {
            const filenameInput = nameGroup.querySelector('#saveFilenameInput') as HTMLInputElement;
            const includeVizStateCheckbox = checkboxRow.querySelector('#includeVizStateCheckbox') as HTMLInputElement;

            let filename = filenameInput.value.trim();
            if (!filename) {
                alert('Bitte geben Sie einen Dateinamen ein.');
                return;
            }

            const format = formatSelect.value;
            const ext = `.${format}`;
            if (!filename.toLowerCase().endsWith(ext)) {
                filename += ext;
            }

            const options: any = {};
            if (format === 'json') {
                options.includeVisualizationState = includeVizStateCheckbox.checked;
            }

            // Construct currentNodes and currentEdges in the format expected by ExportManager.getCurrentNetworkData
            const currentNodes = this.app.currentEntities.map((entity: any) => ({
                id: entity.id,
                mesh: {
                    name: entity.label || entity.name || entity.id,
                    position: entity.position || { x: 0, y: 0, z: 0 }
                },
                metadata: { ...entity },
                options: {
                    color: entity.color || entity.options?.color,
                    size: entity.size || entity.options?.size,
                    type: entity.type || entity.options?.type || entity.geometryType
                }
            }));

            const currentEdges = this.app.currentRelationships.map((rel: any) => ({
                startNode: { id: rel.source },
                endNode: { id: rel.target },
                name: rel.name || rel.type || rel.label || '',
                metadata: { ...rel },
                options: {
                    color: rel.color || rel.options?.color
                }
            }));

            // Close dialog
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }

            // Execute export
            try {
                await this.app.fileHandler.exportNetwork(currentNodes, currentEdges, format, filename, options);
            } catch (error: any) {
                console.error('[FilePanelUI] Export error:', error);
            }
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'action-button secondary';
        cancelBtn.style.marginTop = '0';
        cancelBtn.style.width = 'auto';
        cancelBtn.style.padding = '8px 16px';
        cancelBtn.textContent = 'Abbrechen';
        cancelBtn.onclick = () => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        };

        footer.appendChild(saveConfirmBtn);
        footer.appendChild(cancelBtn);

        modal.appendChild(header);
        modal.appendChild(body);
        modal.appendChild(footer);
        overlay.appendChild(modal);

        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }
        };

        document.body.appendChild(overlay);
    }

    private showConfirmDialog(title: string, message: string, onConfirm: () => void) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';

        const modal = document.createElement('div');
        modal.className = 'modal-content';
        modal.style.maxWidth = '400px';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `<h3>${title}</h3>`;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        };
        header.appendChild(closeBtn);

        const body = document.createElement('div');
        body.className = 'modal-body';
        body.innerHTML = `<p style="margin: 0; line-height: 1.5; color: var(--text-color);">${message}</p>`;

        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        footer.style.display = 'flex';
        footer.style.gap = '10px';
        footer.style.justifyContent = 'flex-end';

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'action-button';
        confirmBtn.style.marginTop = '0';
        confirmBtn.style.width = 'auto';
        confirmBtn.style.padding = '8px 16px';
        confirmBtn.textContent = 'Bestätigen';
        confirmBtn.onclick = () => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
            onConfirm();
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'action-button secondary';
        cancelBtn.style.marginTop = '0';
        cancelBtn.style.width = 'auto';
        cancelBtn.style.padding = '8px 16px';
        cancelBtn.textContent = 'Abbrechen';
        cancelBtn.onclick = () => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        };

        footer.appendChild(confirmBtn);
        footer.appendChild(cancelBtn);

        modal.appendChild(header);
        modal.appendChild(body);
        modal.appendChild(footer);
        overlay.appendChild(modal);

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }
        };

        document.body.appendChild(overlay);
    }
}
