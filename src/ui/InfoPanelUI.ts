import * as THREE from 'three';
import type { App } from '../App';
import { IStateManager } from '../core/interfaces';

export class InfoPanelUI {
    private app: App;
    private stateManager: IStateManager;
    private infoPanel: HTMLElement | null;
    private infoPanelContent: HTMLElement | null;

    constructor(containerId: string, stateManager: IStateManager, app: App) {
        this.stateManager = stateManager;
        this.app = app;
        
        // infoPanel is the wrapper, containerId should be 'infoPanel'
        this.infoPanel = document.getElementById(containerId);
        this.infoPanelContent = document.getElementById('infoPanelContent');

        this.init();

        this.stateManager.subscribe((state) => {
            if (state.selectedObjects && state.selectedObjects.size > 1) {
                this.showMultiSelectionInfo(state.selectedObjects);
            } else if (state.selectedObject) {
                this.showInfoPanelFor(state.selectedObject);
            } else {
                this.collapseInfoPanel();
            }
        }, 'ui');
    }

    private init() {
        this.initInfoPanelClose();
        this.initInfoPanelInteractions();
    }

    private initInfoPanelClose(): void {
        const closeBtn = document.getElementById('infoPanelClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideInfoPanel());
        }
    }

    private hideInfoPanel(): void {
        if (this.infoPanel) {
            this.infoPanel.classList.add('hidden');
        }
        this.stateManager.setSelectedObject(null);
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

    private showInfoPanelFor(object: any) {
        if (!this.infoPanel || !this.infoPanelContent) return;

        let content = '';
        if (object.userData.type === 'node' || object.userData.geometryType) {
            const nodeData = object.userData.nodeData || object.userData.entity;
            const geometryType = object.userData.geometryType || 'sphere';
            const geometryInfo = this.app.nodeManager.getNodeTypeInfo ?
                this.app.nodeManager.getNodeTypeInfo(geometryType) : { name: geometryType, faces: 0 };

            content = `
                <p><strong>Typ:</strong> Node</p>
                <p><strong>Name:</strong> ${nodeData?.name || nodeData?.label || 'Unbenannt'}</p>
                <p><strong>ID:</strong> ${nodeData?.id || 'Unbekannt'}</p>
                <p><strong>Geometrie:</strong> ${geometryInfo.name} (${geometryInfo.faces} Vertices/Faces)</p>
            `;

            if (nodeData) {
                const customProps = Object.entries(nodeData).filter(([key]) => {
                    return !['id', 'type', 'label', 'name', 'position'].includes(key);
                });
                if (customProps.length > 0) {
                    content += `<hr style="border: 0; border-top: 1px dashed rgba(255,255,255,0.15); margin: 8px 0;">`;
                    content += `<p style="font-weight: bold; color: var(--accent-color); margin-bottom: 4px;">Daten-Attribute:</p>`;
                    customProps.forEach(([key, val]) => {
                        const displayVal = typeof val === 'object' ? JSON.stringify(val) : val;
                        content += `<p><strong>${key}:</strong> ${displayVal}</p>`;
                    });
                }
            }
        } else if (object.userData.type === 'edge') {
            const { name, index } = object.userData;
            const edgeData = object.userData.edge;
            const sourceInfo = edgeData ? (edgeData.source || edgeData.start) : 'Unknown';
            const targetInfo = edgeData ? (edgeData.target || edgeData.end) : 'Unknown';

            content = `
                <p><strong>Typ:</strong> Edge</p>
                <p><strong>Name:</strong> ${name || edgeData?.label || 'Unbenannt'}</p>
                <p><strong>Verbindung:</strong> ${sourceInfo} ↔ ${targetInfo}</p>
                <p><strong>Index:</strong> ${index !== undefined ? index : 'Unbekannt'}</p>
            `;

            if (edgeData) {
                const customProps = Object.entries(edgeData).filter(([key]) => {
                    return !['id', 'type', 'label', 'name', 'source', 'target', 'start', 'end', 'offset'].includes(key);
                });
                if (customProps.length > 0) {
                    content += `<hr style="border: 0; border-top: 1px dashed rgba(255,255,255,0.15); margin: 8px 0;">`;
                    content += `<p style="font-weight: bold; color: var(--accent-color); margin-bottom: 4px;">Daten-Attribute:</p>`;
                    customProps.forEach(([key, val]) => {
                        const displayVal = typeof val === 'object' ? JSON.stringify(val) : val;
                        content += `<p><strong>${key}:</strong> ${displayVal}</p>`;
                    });
                }
            }
        } else {
            content = '<p>Keine Detailansicht für dieses Objekt.</p>';
        }

        this.infoPanelContent.innerHTML = content;
        this.infoPanel.classList.remove('hidden');
        this.infoPanel.classList.remove('collapsed');

        const titleEl = document.getElementById('infoPanelTitle');
        if (titleEl) {
            const nodeData = object.userData.nodeData || object.userData.entity;
            const name = nodeData?.name || nodeData?.label || object.userData.name || 'Info';
            titleEl.textContent = name;
        }
    }

    private showMultiSelectionInfo(objects: Set<THREE.Object3D>) {
        if (!this.infoPanel || !this.infoPanelContent) return;

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

        this.infoPanel.classList.remove('hidden');
        this.infoPanel.classList.remove('collapsed');
    }

    private collapseInfoPanel() {
        if (!this.infoPanel) return;
        this.infoPanel.classList.add('hidden');
        
        const titleEl = document.getElementById('infoPanelTitle');
        if (titleEl) {
            titleEl.textContent = 'Info';
        }

        if (this.infoPanelContent) this.infoPanelContent.innerHTML = '';
    }
}
