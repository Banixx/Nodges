/**
 * InteractionManager - Fassade fuer alle Benutzerinteraktionen
 * Delegiert an spezialisierte Handler (Phase 3 Refactoring)
 *
 * Handler-Aufteilung:
 * - HoverHandler:          Hover-Events, Highlights, Tooltips
 * - SelectionHandler:      Click, Selektion, Deselektion, Fokus, Loeschung, Duplizierung
 * - DragHandler:           Node-Dragging im 3D-Raum
 * - KeyboardHandler:       Tastatur-Shortcuts
 * - ContextMenuHandler:    Kontextmenue
 * - NodeCreationHandler:   Node- und Edge-Erstellung
 */
import * as THREE from 'three';
import { IStateManager, IEventManager } from '../interfaces';
import { HighlightManager } from '../../effects/HighlightManager';
import { EntityData } from '../../types';
import type { ClickEventData, DoubleClickEventData, MouseDownEventData, MouseUpEventData, MouseMoveEventData, ContextMenuEventData, KeyDownEventData, KeyUpEventData } from '../events/EventTypes';

import { HoverHandler } from './HoverHandler';
import { SelectionHandler } from './SelectionHandler';
import { DragHandler } from './DragHandler';
import { KeyboardHandler } from './KeyboardHandler';
import { ContextMenuHandler } from './ContextMenuHandler';
import { NodeCreationHandler } from './NodeCreationHandler';

export class InteractionManager {
    private eventManager: IEventManager;
    private stateManager: IStateManager;
    private controls: any; // OrbitControls

    // Handler
    private hoverHandler: HoverHandler;
    private selectionHandler: SelectionHandler;
    private dragHandler: DragHandler;
    private keyboardHandler: KeyboardHandler;
    private contextMenuHandler: ContextMenuHandler;
    private nodeCreationHandler: NodeCreationHandler;

    // Interaction Modes
    public modes = {
        SELECT: 'select',
        HOVER: 'hover',
        DRAG: 'drag',
        PAN: 'pan',
        ZOOM: 'zoom'
    };

    public currentMode: string;
    public isEnabled: boolean;

    // Timing
    private lastInteractionTime: number;
    private interactionCooldown: number; // ms

    constructor(
        centralEventManager: IEventManager,
        stateManager: IStateManager,
        highlightManager: HighlightManager,
        camera: THREE.Camera,
        controls: any,
        scene: THREE.Scene,
        renderer: THREE.WebGLRenderer
    ) {
        this.eventManager = centralEventManager;
        this.stateManager = stateManager;
        this.controls = controls;

        this.currentMode = this.modes.SELECT;
        this.isEnabled = true;
        this.lastInteractionTime = 0;
        this.interactionCooldown = 50; // ms

        // Handler instanziieren
        this.hoverHandler = new HoverHandler(stateManager, highlightManager);
        this.selectionHandler = new SelectionHandler(stateManager, centralEventManager, camera, controls);
        this.dragHandler = new DragHandler(stateManager, camera, controls);
        this.nodeCreationHandler = new NodeCreationHandler(stateManager, camera, scene, renderer);
        this.keyboardHandler = new KeyboardHandler(stateManager, this.selectionHandler, this.nodeCreationHandler);
        this.contextMenuHandler = new ContextMenuHandler(stateManager, this.selectionHandler, this.nodeCreationHandler);

        this.initializeEventSubscriptions();
    }

    /**
     * Initialisiert Event-Subscriptions
     * Hover-, Drag- und Keyboard-Events werden direkt an Handler delegiert.
     * Click- und ContextMenu-Events werden hier verarbeitet (wegen Zustandslogik).
     */
    initializeEventSubscriptions() {
        // Hover Events -- direkt an Handler
        this.hoverHandler.registerEvents(this.eventManager);

        // Drag Events -- typsicher delegiert
        this.eventManager.subscribe('mousedown', (data: MouseDownEventData) => {
            if (!this.isEnabled) return;
            this.dragHandler.handleMouseDown(data);
        });
        this.eventManager.subscribe('mouseup', (data: MouseUpEventData) => {
            if (!this.isEnabled) return;
            this.dragHandler.handleMouseUp(data);
        });
        this.eventManager.subscribe('mousemove', (data: MouseMoveEventData) => {
            if (!this.isEnabled) return;
            this.dragHandler.handleMouseMove(data);
        });

        // Click Events -- hier verarbeitet wegen Cooldown, Drag-Check und Edge-Creation-State
        this.eventManager.subscribe('click', (data: ClickEventData) => {
            if (!this.isEnabled) return;
            this.handleClick(data);
        });
        this.eventManager.subscribe('doubleclick', (data: DoubleClickEventData) => {
            if (!this.isEnabled) return;
            this.handleDoubleClick(data);
        });

        // Context Menu -- delegiert
        this.eventManager.subscribe('contextmenu', (data: ContextMenuEventData) => {
            if (!this.isEnabled) return;
            this.contextMenuHandler.handleContextMenu(data);
        });

        // Keyboard -- delegiert mit isEnabled-Check
        this.eventManager.subscribe('keydown', (data: KeyDownEventData) => {
            if (!this.isEnabled) return;
            this.keyboardHandler.handleKeyDown(data);
        });
        this.eventManager.subscribe('keyup', (data: KeyUpEventData) => {
            if (!this.isEnabled) return;
            this.keyboardHandler.handleKeyUp(data);
        });
    }

    /**
     * Handler fuer Click Events
     * Verbleibt in der Fassade wegen Cooldown-, Drag- und Edge-Creation-Logik
     */
    private handleClick(data: ClickEventData) {
        const { clickedObject } = data;

        // Cooldown check
        const now = performance.now();
        if (now - this.lastInteractionTime < this.interactionCooldown) {
            return;
        }
        this.lastInteractionTime = now;

        // Drag-Check
        if (this.dragHandler.wasDragging) {
            this.dragHandler.resetWasDragging();
            return;
        }

        if (clickedObject) {
            // Wenn wir gerade eine Kante erstellen
            if (this.nodeCreationHandler.isCreatingEdge && clickedObject.userData.type === 'node') {
                if (!this.nodeCreationHandler.edgeSourceNode) {
                    this.nodeCreationHandler.edgeSourceNode = clickedObject;
                    console.log('[InteractionManager] Source node selected. Select target node.');
                } else {
                    this.nodeCreationHandler.finishEdgeCreation(clickedObject);
                }
                return;
            }

            const isAdditive = !!(data.event?.ctrlKey || data.event?.shiftKey);
            this.selectionHandler.selectObject(clickedObject, isAdditive);
        } else {
            if (this.nodeCreationHandler.isCreatingEdge) {
                this.nodeCreationHandler.createNewNode(data.event, (position: THREE.Vector3) => {
                    const newNodeId = `node_${Date.now()}`;

                    const newEntity: EntityData = {
                        id: newNodeId,
                        type: 'node',
                        label: 'Neuer Node',
                        position: { x: position.x, y: position.y, z: position.z },
                        properties: {}
                    };

                    this.stateManager.addNode(newEntity);

                    if (!this.nodeCreationHandler.edgeSourceNode) {
                        console.log('[InteractionManager] New node created as source. Please select target node.');
                        this.nodeCreationHandler.edgeSourceNode = this.nodeCreationHandler.createNodeProxy(newEntity);
                        this.nodeCreationHandler.isCreatingEdge = true;
                        document.body.style.cursor = 'crosshair';
                    } else {
                        const targetProxy = this.nodeCreationHandler.createNodeProxy(newEntity);
                        this.nodeCreationHandler.finishEdgeCreation(targetProxy);
                    }
                });
                return;
            }
            this.selectionHandler.deselectAll();
        }
    }

    /**
     * Handler fuer Double-Click Events
     */
    private handleDoubleClick(data: DoubleClickEventData) {
        const { clickedObject } = data;

        if (clickedObject) {
            this.selectionHandler.focusOnObject(clickedObject);
        }
    }

    // --- Oeffentliche API (Abwaertskompatibilitaet) ---

    /**
     * Getter fuer isDragging (delegiert an DragHandler)
     */
    get isDragging(): boolean {
        return this.dragHandler.isDragging;
    }

    public setMode(mode: string) {
        this.currentMode = mode;
        this.eventManager.publish('mode_changed', { mode });
        if (mode === this.modes.PAN) {
            this.controls.enablePan = true;
        } else {
            this.controls.enablePan = false;
        }
    }

    public setEnabled(enabled: boolean) {
        this.isEnabled = enabled;
        this.controls.enabled = enabled;
    }

    public getDebugInfo() {
        return {
            mode: this.currentMode,
            isEnabled: this.isEnabled,
            selectedCount: this.stateManager.state.selectedObjects.size
        };
    }

    public destroy() {
        // Cleanup subscriptions if needed
    }
}
