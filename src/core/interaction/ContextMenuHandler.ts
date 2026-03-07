/**
 * ContextMenuHandler - Verwaltet Kontextmenue-Anzeige und -Optionen
 * Extrahiert aus InteractionManager (Phase 3)
 */
import * as THREE from 'three';
import { IStateManager } from '../interfaces';
import { ContextMenu } from '../../utils/ContextMenu';
import { DataEditor } from '../../utils/DataEditor';
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
        const hasSelection = this.stateManager.getSelectedObjects().size > 0;
        const hasNodeSelection = Array.from(this.stateManager.getSelectedObjects())
            .some(obj => obj.userData.type === 'node');

        const options: any[] = [
            {
                label: 'Neuer Node',
                action: () => this.nodeCreationHandler.createNewNode(event)
            },
            {
                label: 'Neue Edge',
                action: () => this.nodeCreationHandler.startEdgeCreationMode(),
                disabled: !hasNodeSelection
            },
            {
                label: 'Duplizieren',
                action: () => this.selectionHandler.duplicateSelected(),
                disabled: !hasSelection
            }
        ];

        // Wenn ein Objekt angeklickt wurde, fuege objektspezifische Optionen hinzu
        if (object) {
            options.unshift({
                label: 'Data',
                action: () => {
                    const data = object.userData.nodeData || object.userData.edge || object.userData.entity || {};
                    this.dataEditor.show(data, (updatedData: any) => {
                        if (object.userData.type === 'node') {
                            const id = object.userData.id || object.userData.nodeData?.id;
                            if (id) {
                                this.stateManager.updateNode(id, updatedData);
                            }
                        } else if (object.userData.type === 'edge') {
                            const edgeData = object.userData.edge || object.userData.relationship;
                            const id = edgeData?.id;
                            if (id) {
                                this.stateManager.updateEdge(id, updatedData);
                            }
                        }
                        // Update selection state to trigger UI refresh if needed
                        this.stateManager.setSelectedObject(object);
                    });
                }
            });
        }

        this.contextMenu.show(event.clientX, event.clientY, options);
    }
}
