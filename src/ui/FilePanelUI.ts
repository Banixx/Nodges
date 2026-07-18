import type { App } from '../App';
import { IStateManager } from '../core/interfaces';

export class FilePanelUI {
    private app: App;
    private stateManager: IStateManager;
    private filePanelContent: HTMLElement | null;
    private availableFiles: string[] = [];
    private currentDirectory: string = '';
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
        
        let pathLabel = this.currentDirectory === '' ? 'Verfügbare Dateien' : `Verfügbare Dateien (${this.currentDirectory})`;
        availableHeader.innerHTML = `
            <span>${pathLabel}</span>
            <button id="addFileBtn" class="file-action-btn add" style="width: 20px; height: 20px; padding: 0; font-size: 14px;" title="Datei hinzufügen">+</button>
        `;
        this.filePanelContent.appendChild(availableHeader);

        if (this.availableFiles.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'loading-text';
            empty.textContent = 'Keine Dateien gefunden';
            this.filePanelContent.appendChild(empty);
        } else {
            if (this.currentDirectory !== '') {
                const backContainer = document.createElement('div');
                backContainer.className = 'file-item-container';
                const backBtn = document.createElement('div');
                backBtn.className = 'file-item';
                backBtn.textContent = '..';
                backBtn.style.cursor = 'pointer';
                backBtn.onclick = () => {
                    const parts = this.currentDirectory.split('/');
                    parts.pop();
                    this.currentDirectory = parts.join('/');
                    this.renderFilePanel();
                };
                backContainer.appendChild(backBtn);
                this.filePanelContent.appendChild(backContainer);
            }

            const itemsToShow = new Map<string, { type: 'file' | 'directory', path: string, name: string }>();
            
            this.availableFiles.forEach(filepath => {
                if (this.currentDirectory === '') {
                    const parts = filepath.split('/');
                    if (parts.length === 1) {
                        itemsToShow.set(filepath, { type: 'file', path: filepath, name: parts[0] });
                    } else {
                        itemsToShow.set(parts[0], { type: 'directory', path: parts[0], name: parts[0] });
                    }
                } else {
                    if (filepath.startsWith(this.currentDirectory + '/')) {
                        const remaining = filepath.substring(this.currentDirectory.length + 1);
                        const parts = remaining.split('/');
                        if (parts.length === 1) {
                            itemsToShow.set(filepath, { type: 'file', path: filepath, name: parts[0] });
                        } else {
                            const dirPath = this.currentDirectory + '/' + parts[0];
                            itemsToShow.set(dirPath, { type: 'directory', path: dirPath, name: parts[0] });
                        }
                    }
                }
            });

            const sortedItems = Array.from(itemsToShow.values()).sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'directory' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });

            sortedItems.forEach(item => {
                const container = document.createElement('div');
                container.className = 'file-item-container';

                const button = document.createElement('div');
                if (item.type === 'directory') {
                    button.className = 'file-item';
                    button.textContent = item.name + '/';
                    button.style.cursor = 'pointer';
                    button.onclick = () => {
                        this.currentDirectory = item.path;
                        this.renderFilePanel();
                    };
                    container.appendChild(button);
                } else {
                    const isLoaded = loadedFiles.some((f: any) => f.id === `data/${item.path}` || f.id === item.path);
                    button.className = `file-item ${isLoaded ? 'active' : ''}`;
                    button.textContent = this.createDisplayName(item.name.replace('.json', ''));
                    button.style.cursor = 'pointer';
                    button.onclick = () => {
                        this.app.loadData(`data/${item.path}`);
                    };

                    const addBtn = document.createElement('button');
                    addBtn.className = 'file-action-btn add';
                    addBtn.innerHTML = '+';
                    addBtn.title = 'Zur Szene hinzufügen';
                    addBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.app.addData(`data/${item.path}`);
                    };

                    container.appendChild(button);
                    container.appendChild(addBtn);
                }

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
        try {
            const response = await fetch('/api/list_files');
            if (response.ok) {
                const paths = await response.json();
                return paths.sort();
            }
        } catch (e) {
            console.warn('[FilePanelUI] Failed to fetch directory contents dynamically, falling back to glob:', e);
        }

        // Fallback to import.meta.glob for prod or if API fails
        const dataFiles = import.meta.glob('/public/data/**/*.json');
        const paths = Object.keys(dataFiles).map(path => {
            return path.replace('/public/data/', '');
        }).filter(name => name !== '');

        return paths.sort();
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
            <input type="checkbox" id="includeVizStateCheckbox" class="nodges-toggle" checked>
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
            // (checkbox reserved for future use)

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

            // Close dialog

            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }

            // Execute export
            try {
                if (format === 'json') {
                    // Nativer Nodges-Export: erhält alle Build-3/4-Daten
                    const graphData = this.app.currentGraphData;
                    if (!graphData) {
                        alert('Keine Graphdaten geladen.');
                        return;
                    }
                    const exportOptions: any = { 
                        currentEntities: this.app.currentEntities,
                        activeVisualMappings: this.app.visualMappingEngine?.getVisualMappings() || null,
                        activeDataModel: graphData.dataModel || null
                    };
                    const jsonStr = this.app.fileHandler['exportManager'].exportNodgesJSON(graphData, exportOptions);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                } else {
                    // Legacy-Export für GEXF, GraphML, CSV
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
                        options: { color: rel.color || rel.options?.color }
                    }));
                    const legacyOptions: any = {};
                    await this.app.fileHandler.exportNetwork(currentNodes, currentEdges, format, filename, legacyOptions);
                }
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
