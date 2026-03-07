/**
 * KeyboardHandler - Verwaltet Tastatur-Shortcuts
 * Extrahiert aus InteractionManager (Phase 3)
 */
import { IEventManager, IStateManager } from '../interfaces';
import { SelectionHandler } from './SelectionHandler';
import { NodeCreationHandler } from './NodeCreationHandler';
import type { KeyDownEventData, KeyUpEventData } from '../events/EventTypes';

export class KeyboardHandler {
    private stateManager: IStateManager;
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
    }

    /**
     * Registriert Keyboard-Events beim EventManager
     */
    registerEvents(eventManager: IEventManager) {
        eventManager.subscribe('keydown', this.handleKeyDown.bind(this));
        eventManager.subscribe('keyup', this.handleKeyUp.bind(this));
    }

    /**
     * Handler fuer Keyboard Events
     */
    handleKeyDown(data: KeyDownEventData) {
        const { event } = data;

        switch (event.key) {
            case 'Escape':
                if (this.nodeCreationHandler.isCreatingEdge) {
                    this.nodeCreationHandler.cancelEdgeCreation();
                }
                this.selectionHandler.deselectAll();
                break;
            case 'Delete':
            case 'Backspace':
                this.selectionHandler.deleteSelected();
                break;
            case 'f':
            case 'F':
                if (this.stateManager.state.selectedObject) {
                    this.selectionHandler.focusOnObject(this.stateManager.state.selectedObject);
                }
                break;
        }
    }

    /**
     * Handler fuer Key Up Events
     */
    handleKeyUp(_data: KeyUpEventData) {
        // Placeholder fuer Key-Up Events
    }
}
