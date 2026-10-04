import * as THREE from 'three';
import type { IApp } from '../core/IApp';
import { IStateManager } from '../core/interfaces';
import { PanelUtils } from '../utils/PanelUtils';

export class InfoPanelUI {
    private app: IApp;
    private stateManager: IStateManager;
    private infoPanel: HTMLElement | null;
    private infoPanelContent: HTMLElement | null;

    constructor(containerId: string, stateManager: IStateManager, app: IApp) {
        this.stateManager = stateManager;
        this.app = app;
        
        // infoPanel is the wrapper, containerId should be 'infoPanel'
        this.infoPanel = document.getElementById(containerId);
        this.infoPanelContent = document.getElementById('infoPanelContent');

        this.init();

        if (this.infoPanel) {
            const header = this.infoPanel.querySelector('.floating-panel-header') as HTMLElement;
            if (header) {
                PanelUtils.makeDraggableAndResizable(this.infoPanel, header, { minWidth: 200, minHeight: 150 });
            }
        }

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

        // Add listener for group create button
        this.infoPanelContent.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.id === 'createGroupBtn') {
                const currentSelection = this.stateManager.state.selectedObjects;
                if (!currentSelection || currentSelection.size === 0) return;
                
                const groupNode = this.stateManager.createGroupNode('Neue Gruppe');
                currentSelection.forEach((obj: any) => {
                    const nodeId = obj.userData?.id || obj.userData?.nodeData?.id || obj.userData?.node?.id;
                    if (nodeId) {
                        this.stateManager.addNodeToGroup(nodeId, groupNode.id);
                    }
                });

                // Feedback UI
                const originalText = target.textContent;
                target.textContent = 'Gruppe erstellt!';
                target.style.backgroundColor = '#4CAF50';
                setTimeout(() => {
                    if (target) {
                        target.textContent = originalText;
                        target.style.backgroundColor = '';
                    }
                }, 2000);
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
                if (nodeData.entity_type) {
                    content += `<p><strong>Entitaets-Typ:</strong> <span style="color: var(--accent-color, #4ea8de); font-weight: bold;">${nodeData.entity_type}</span></p>`;
                }
                if (nodeData.description) {
                    content += `
                        <div style="margin: 8px 0; padding: 6px 10px; background: rgba(255,255,255,0.06); border-left: 3px solid #10b981; border-radius: 4px;">
                            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; margin-bottom: 2px;">Beschreibung</div>
                            <div style="font-size: 12px; line-height: 1.4;">${nodeData.description}</div>
                        </div>
                    `;
                }
                if (Array.isArray(nodeData.sources) && nodeData.sources.length > 0) {
                    content += `
                        <div style="margin: 6px 0;">
                            <span style="font-size: 11px; opacity: 0.7;">Quellen-Chunks (${nodeData.sources.length}):</span>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px;">
                                ${nodeData.sources.map((s: string) => `<span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 11px; font-family: monospace;">${s}</span>`).join('')}
                            </div>
                        </div>
                    `;
                }

                const customProps = Object.entries(nodeData).filter(([key]) => {
                    return !['id', 'type', 'label', 'name', 'position', 'entity_type', 'description', 'sources', 'belegzahl', 'herkunft', 'properties'].includes(key);
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
            const relText = edgeData?.relation || edgeData?.label || name || 'Unbenannt';

            content = `
                <p><strong>Typ:</strong> Kante (Edge)</p>
                <p><strong>Relation:</strong> <span style="color: var(--accent-color, #4ea8de); font-weight: bold;">${relText}</span></p>
                <p><strong>Verbindung:</strong> ${sourceInfo} &rarr; ${targetInfo}</p>
                ${edgeData?.weight !== undefined && edgeData?.weight !== null ? `<p><strong>Gewicht:</strong> ${edgeData.weight}</p>` : ''}
                ${edgeData?.belegzahl ? `<p><strong>Belegzahl:</strong> ${edgeData.belegzahl}</p>` : ''}
                ${index !== undefined ? `<p style="opacity: 0.6; font-size: 11px;">Index: ${index}</p>` : ''}
            `;

            // Build 14: Evidenz / Textbeleg
            const evidence = edgeData?.evidence || edgeData?.description;
            if (evidence) {
                content += `
                    <div style="margin: 10px 0; padding: 8px 10px; background: rgba(255,255,255,0.06); border-left: 3px solid var(--accent-color, #4ea8de); border-radius: 4px;">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; margin-bottom: 4px;">Evidenz / Textbeleg</div>
                        <div style="font-size: 12px; line-height: 1.4; font-style: italic;">"${evidence}"</div>
                    </div>
                `;
            }

            // Build 14: Quellen-Chunks
            if (Array.isArray(edgeData?.sources) && edgeData.sources.length > 0) {
                content += `
                    <div style="margin: 8px 0;">
                        <span style="font-size: 11px; opacity: 0.7;">Quellen-Chunks (${edgeData.sources.length}):</span>
                        <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px;">
                            ${edgeData.sources.map((s: string) => `<span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 11px; font-family: monospace;">${s}</span>`).join('')}
                        </div>
                    </div>
                `;
            }

            // Build 14: Keywords
            if (edgeData?.keywords_all || (Array.isArray(edgeData?.keywords) && edgeData.keywords.length > 0)) {
                const kwText = edgeData.keywords_all || edgeData.keywords.join(', ');
                content += `<p style="font-size: 12px; margin-top: 6px;"><strong>Keywords:</strong> <span style="opacity: 0.85;">${kwText}</span></p>`;
            }

            if (edgeData) {
                const customProps = Object.entries(edgeData).filter(([key]) => {
                    return !['id', 'type', 'label', 'name', 'source', 'target', 'start', 'end', 'offset', 'relation', 'weight', 'evidence', 'evidence_all', 'evidence_parts', 'description', 'sources', 'source_id', 'keywords', 'keywords_all', 'keyword_raw', 'belegzahl', 'paarung', 'typisiert', 'herkunft', 'file_path', 'properties'].includes(key);
                });
                if (customProps.length > 0) {
                    content += `<hr style="border: 0; border-top: 1px dashed rgba(255,255,255,0.15); margin: 8px 0;">`;
                    content += `<p style="font-weight: bold; color: var(--accent-color); margin-bottom: 4px;">Weitere Attribute:</p>`;
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
            <button id="createGroupBtn" class="action-button" style="margin-top: 15px; font-size: 11px;">Gruppe erstellen</button>
        `;

        this.infoPanelContent.innerHTML = content;

        const titleEl = document.getElementById('infoPanelTitle');
        if (titleEl) {
            titleEl.textContent = 'Multiselect';
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
