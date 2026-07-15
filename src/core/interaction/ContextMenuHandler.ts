/**
 * ContextMenuHandler - Verwaltet Kontextmenue-Anzeige und -Optionen
 * Extrahiert aus InteractionManager (Phase 3)
 */
import * as THREE from 'three';
import { IStateManager } from '../interfaces';
import { ContextMenu } from '../../ui/ContextMenu';
import { DataEditor } from '../../ui/DataEditor';
import { SelectionHandler } from './SelectionHandler';
import { NodeCreationHandler } from './NodeCreationHandler';

export class ContextMenuHandler {
    private stateManager: IStateManager;
    private contextMenu: ContextMenu;
    private dataEditor: DataEditor;
    private selectionHandler: SelectionHandler;
    private nodeCreationHandler: NodeCreationHandler;

    constructor(
        stateManager: IStateManager,
        selectionHandler: SelectionHandler,
        nodeCreationHandler: NodeCreationHandler
    ) {
        this.stateManager = stateManager;
        this.selectionHandler = selectionHandler;
        this.nodeCreationHandler = nodeCreationHandler;

        this.contextMenu = new ContextMenu();
        this.dataEditor = new DataEditor();
    }

    /**
     * Handler fuer Context Menu Events
     */
    handleContextMenu(data: any) {
        const { event, clickedObject } = data;
        this.showContextMenu(clickedObject, event);
    }

    /**
     * Zeigt Context Menu an
     */
    showContextMenu(object: THREE.Object3D | null, event: any) {
        const options: any[] = [];

        if (object && object.userData.type === 'node') {
            options.push({
                label: 'Data',
                action: () => {
                    const data = object.userData.nodeData || object.userData.entity || {};
                    this.dataEditor.show(data, (updatedData: any) => {
                        const id = object.userData.id || object.userData.nodeData?.id;
                        if (id) {
                            this.stateManager.updateNode(id, updatedData);
                        }
                        this.stateManager.setSelectedObject(object);
                    });
                }
            });
            options.push({
                label: 'Move',
                action: () => {
                    this.nodeCreationHandler.moveExistingNode(object);
                }
            });
            options.push({
                label: 'Delete',
                action: () => {
                    this.stateManager.setSelectedObject(object);
                    this.selectionHandler.deleteSelected();
                }
            });
            options.push({
                label: 'Duplicate',
                action: () => {
                    this.stateManager.setSelectedObject(object);
                    this.selectionHandler.duplicateSelected();
                }
            });
            options.push({
                label: 'Deep Dive',
                action: () => {
                    const data = object.userData.nodeData || object.userData.entity || {};
                    const label = data.label || 'Unbekannt';
                    const qId = data.wikidata_id || '';
                    console.log(`Starte Deep Dive fuer: ${label} (${qId})`);
                    
                    // Wir feuern ein CustomEvent, das von der UI-Schicht (z.B. Sidebar/LLMService)
                    // abgefangen werden kann, um die Pipeline zu starten
                    document.dispatchEvent(new CustomEvent('nodges-deep-dive', {
                        detail: { label, qId, data }
                    }));
                }
            });
        } else if (object && object.userData.type === 'edge') {
            options.push({
                label: 'Data',
                action: () => {
                    const data = object.userData.edge || object.userData.relationship || {};
                    this.dataEditor.show(data, (updatedData: any) => {
                        const edgeData = object.userData.edge || object.userData.relationship;
                        const id = edgeData?.id;
                        if (id) {
                            this.stateManager.updateEdge(id, updatedData);
                        }
                        this.stateManager.setSelectedObject(object);
                    });
                }
            });
            options.push({
                label: 'Delete',
                action: () => {
                    this.stateManager.setSelectedObject(object);
                    this.selectionHandler.deleteSelected();
                }
            });
            options.push({
                label: 'Duplicate',
                action: () => {
                    this.stateManager.setSelectedObject(object);
                    this.selectionHandler.duplicateSelected();
                }
            });
        } else {
            const hasSelection = this.stateManager.getSelectedObjects().size > 0;
            const hasNodeSelection = Array.from(this.stateManager.getSelectedObjects())
                .some(obj => obj.userData.type === 'node');

            options.push({
                label: 'Neuer Node',
                action: () => this.nodeCreationHandler.createNewNode(event)
            });
            options.push({
                label: 'Neue Edge',
                action: () => this.nodeCreationHandler.startEdgeCreationMode(),
                disabled: !hasNodeSelection
            });
            options.push({
                label: 'Duplizieren',
                action: () => this.selectionHandler.duplicateSelected(),
                disabled: !hasSelection
            });
        }

        this.contextMenu.show(event.clientX, event.clientY, options);
    }
}
