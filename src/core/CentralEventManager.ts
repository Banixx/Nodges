/**
 * CentralEventManager - Unified Event System
 * Zentraler Event-Handler fuer alle Maus- und Keyboard-Interaktionen
 * Ersetzt die verteilten Event-Handler in main.js und rollover.js
 */

import * as THREE from 'three';
// @ts-ignore
import { RaycastManager } from '../utils/RaycastManager';
import { StateManager } from './StateManager';
// @ts-ignore
// @ts-ignore
import { NodeManager } from './NodeManager';
// @ts-ignore
import { EdgeObjectsManager } from './EdgeObjectsManager';
import { HoverInfoPanel } from '../utils/HoverInfoPanel';

interface EventHandlerData {
    eventType: string;
    element: HTMLElement | Window | Document;
    handler: EventListenerOrEventListenerObject;
    active: boolean;
}

interface EventConfig {
    hoverDelay: number;
    clickDelay: number;
    doubleClickThreshold: number;
}

export class CentralEventManager {
    private renderer: THREE.WebGLRenderer;
    private stateManager: StateManager;
    private raycastManager: any; // RaycastManager
    private hoverInfoPanel: HoverInfoPanel;
    // private nodeManager: NodeManager; // Unused
    // private edgeObjectsManager: EdgeObjectsManager; // Unused

    private eventHandlers: Map<string, EventHandlerData | Set<Function>>;
    private activeListeners: Set<string>;

    private currentHoveredObject: THREE.Object3D | null;
    private currentSelectedObject: THREE.Object3D | null;
    private lastMousePosition: { x: number, y: number };
    private isMouseDown: boolean;
    private mouseDownTime: number;

    private lastMouseMoveTime: number;
    private mouseMoveThrottle: number;

    private hoverTimeout: any;
    private clickTimeout: any;

    private config: EventConfig;

    constructor(
        camera: THREE.Camera,
        renderer: THREE.WebGLRenderer,
        stateManager: StateManager,
        nodeManager: NodeManager,
        edgeObjectsManager: EdgeObjectsManager,
        scene?: THREE.Scene
    ) {
        this.renderer = renderer;
        this.stateManager = stateManager;
        // this.nodeManager = nodeManager;
        // this.edgeObjectsManager = edgeObjectsManager;

        // Einziger RaycastManager
        this.raycastManager = new RaycastManager(camera, nodeManager, edgeObjectsManager);

        // Hover Info Panel mit Camera und Scene für intelligente Positionierung
        this.hoverInfoPanel = new HoverInfoPanel(camera, scene);

        // Event-Handler Registry
        this.eventHandlers = new Map();
        this.activeListeners = new Set();

        // State-Tracking
        this.currentHoveredObject = null;
        this.currentSelectedObject = null;
        this.lastMousePosition = { x: 0, y: 0 };
        this.isMouseDown = false;
        this.mouseDownTime = 0;

        // Performance-Throttling - ERHOEHT fuer weniger Events
        this.lastMouseMoveTime = 0;
        this.mouseMoveThrottle = 50; // Reduziert auf 20fps fuer weniger Events

        // Timeouts fuer delayed actions
        this.hoverTimeout = null;
        this.clickTimeout = null;

        // Configuration
        this.config = {
            hoverDelay: 50,
            clickDelay: 100,
            doubleClickThreshold: 300
        };

        this.initializeEventListeners();
    }

    /**
     * Initialisiert alle Event-Listener
     */
    initializeEventListeners() {
        const canvas = this.renderer.domElement;

        // Mouse Events
        this.addEventHandler('mousemove', canvas, this.handleMouseMove.bind(this) as EventListener);
        this.addEventHandler('mousedown', canvas, this.handleMouseDown.bind(this) as EventListener);
        this.addEventHandler('mouseup', canvas, this.handleMouseUp.bind(this) as EventListener);
        this.addEventHandler('click', canvas, this.handleClick.bind(this) as EventListener);
        this.addEventHandler('dblclick', canvas, this.handleDoubleClick.bind(this) as EventListener);

        // Context menu prevention
        this.addEventHandler('contextmenu', canvas, this.handleContextMenu.bind(this) as EventListener);

        // Window events
        this.addEventHandler('resize', window, this.handleResize.bind(this) as EventListener);

        // Keyboard events
        this.addEventHandler('keydown', document, this.handleKeyDown.bind(this) as EventListener);
        this.addEventHandler('keyup', document, this.handleKeyUp.bind(this) as EventListener);
    }

    /**
     * Fuegt einen Event-Handler hinzu und verwaltet ihn
     */
    addEventHandler(eventType: string, element: HTMLElement | Window | Document, handler: EventListenerOrEventListenerObject): string {
        const handlerId = `${eventType}_${(element as any).tagName || 'window'}_${Date.now()}`;

        element.addEventListener(eventType, handler, false);

        this.eventHandlers.set(handlerId, {
            eventType,
            element,
            handler,
            active: true
        });

        this.activeListeners.add(handlerId);

        return handlerId;
    }

    /**
     * Entfernt einen Event-Handler
     */
    removeEventHandler(handlerId: string) {
        const handlerData = this.eventHandlers.get(handlerId) as EventHandlerData;
        if (handlerData) {
            handlerData.element.removeEventListener(handlerData.eventType, handlerData.handler);
            this.eventHandlers.delete(handlerId);
            this.activeListeners.delete(handlerId);
        }
    }

    /**
     * Haupthandler fuer Mouse-Move Events
     */
    handleMouseMove(event: MouseEvent) {
        // Performance-Throttling
        const now = performance.now();
        if (now - this.lastMouseMoveTime < this.mouseMoveThrottle) {
            // Auch bei Throttling: HoverInfoPanel-Position aktualisieren wenn sichtbar
            if (this.hoverInfoPanel.isVisible() && this.currentHoveredObject) {
                this.hoverInfoPanel.updatePosition(event.clientX, event.clientY);
            }
            return;
        }
        this.lastMouseMoveTime = now;

        // Mausposition aktualisieren
        this.updateMousePosition(event);

        // Raycast durchfuehren
        this.raycastManager.updateMousePosition(event);
        const hoveredObject = this.raycastManager.findIntersectedObject();

        // Hover-State aktualisieren
        if (hoveredObject !== this.currentHoveredObject) {
            console.log('[CentralEventManager] Hover state changed:', hoveredObject?.userData);
            this.updateHoverState(hoveredObject, event.clientX, event.clientY);
        } else if (hoveredObject) {
            // Gleiches Objekt, aber Position aktualisieren
            this.hoverInfoPanel.updatePosition(event.clientX, event.clientY);
        }

        // Cursor aktualisieren
        this.updateCursor(hoveredObject);

        // Event an Subscriber weiterleiten
        this.notifySubscribers('mousemove', {
            event,
            hoveredObject,
            mousePosition: this.lastMousePosition
        });
    }

    /**
     * Handler fuer Mouse-Down Events
     */
    handleMouseDown(event: MouseEvent) {
        this.isMouseDown = true;
        this.mouseDownTime = performance.now();

        // Raycast fuer clicked object
        this.raycastManager.updateMousePosition(event);
        const clickedObject = this.raycastManager.findIntersectedObject();

        this.notifySubscribers('mousedown', {
            event,
            clickedObject,
            button: event.button
        });
    }

    /**
     * Handler fuer Mouse-Up Events
     */
    handleMouseUp(event: MouseEvent) {
        const wasMouseDown = this.isMouseDown;
        const downDuration = performance.now() - this.mouseDownTime;

        this.isMouseDown = false;
        this.mouseDownTime = 0;

        this.notifySubscribers('mouseup', {
            event,
            wasMouseDown,
            downDuration,
            button: event.button
        });
    }

    /**
     * Handler fuer Click Events
     */
    handleClick(event: MouseEvent) {
        // Ignoriere Klicks, wenn gerade eine Box-Selektion stattfindet oder gerade abgeschlossen wurde
        if (this.stateManager.state.isBoxSelecting) {
            console.log('[CentralEventManager] Click ignored due to active BoxSelecting');
            return;
        }

        // Verhindere mehrfache Clicks
        if (this.clickTimeout) {
            clearTimeout(this.clickTimeout);
        }

        this.clickTimeout = setTimeout(() => {
            this.processClick(event);
            this.clickTimeout = null;
        }, this.config.clickDelay);
    }

    /**
     * Verarbeitet Click-Events
     */
    processClick(event: MouseEvent) {
        this.raycastManager.updateMousePosition(event);
        const clickedObject = this.raycastManager.findIntersectedObject();

        this.updateSelectionState(clickedObject);

        this.notifySubscribers('click', {
            event,
            clickedObject,
            button: event.button
        });
    }

    /**
     * Handler fuer Double-Click Events
     */
    handleDoubleClick(event: MouseEvent) {
        // Cancle pending single click
        if (this.clickTimeout) {
            clearTimeout(this.clickTimeout);
            this.clickTimeout = null;
        }

        this.raycastManager.updateMousePosition(event);
        const clickedObject = this.raycastManager.findIntersectedObject();

        this.notifySubscribers('doubleclick', {
            event,
            clickedObject
        });
    }

    /**
     * Handler fuer Context Menu Events
     */
    handleContextMenu(event: MouseEvent) {
        event.preventDefault();

        this.raycastManager.updateMousePosition(event);
        const clickedObject = this.raycastManager.findIntersectedObject();

        this.notifySubscribers('contextmenu', {
            event,
            clickedObject
        });
    }

    /**
     * Handler fuer Resize Events
     */
    handleResize(event: UIEvent) {
        this.notifySubscribers('resize', { event });
    }

    /**
     * Handler fuer Keyboard Events
     */
    handleKeyDown(event: KeyboardEvent) {
        this.notifySubscribers('keydown', { event });
    }

    handleKeyUp(event: KeyboardEvent) {
        this.notifySubscribers('keyup', { event });
    }

    /**
     * Aktualisiert den Hover-State
     */
    updateHoverState(newHoveredObject: THREE.Object3D | null, mouseX?: number, mouseY?: number) {
        const oldHoveredObject = this.currentHoveredObject;

        // Hover-Timeout zuruecksetzen
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }

        // Altes Objekt "unhover"
        if (oldHoveredObject) {
            this.notifySubscribers('hover_end', {
                object: oldHoveredObject
            });
            // HoverInfoPanel verstecken
            this.hoverInfoPanel.hide();
        }

        // Neues Objekt setzen
        this.currentHoveredObject = newHoveredObject;

        // StateManager aktualisieren
        this.stateManager.setHoveredObject(newHoveredObject);

        // Neues Objekt "hover" mit Delay
        if (newHoveredObject) {
            this.hoverTimeout = setTimeout(() => {
                this.notifySubscribers('hover_start', {
                    object: newHoveredObject
                });
                this.hoverTimeout = null;
            }, this.config.hoverDelay);

            // HoverInfoPanel anzeigen
            if (mouseX !== undefined && mouseY !== undefined) {
                this.hoverInfoPanel.show(newHoveredObject, mouseX, mouseY);
            }
        }
    }

    /**
     * Aktualisiert den Selection-State
     */
    updateSelectionState(newSelectedObject: THREE.Object3D | null) {
        const oldSelectedObject = this.currentSelectedObject;

        // Altes Objekt deselektieren
        if (oldSelectedObject) {
            this.notifySubscribers('selection_end', {
                object: oldSelectedObject
            });
        }

        // Neues Objekt setzen
        this.currentSelectedObject = newSelectedObject;

        // StateManager aktualisieren
        this.stateManager.setSelectedObject(newSelectedObject);

        // Neues Objekt selektieren
        if (newSelectedObject) {
            this.notifySubscribers('selection_start', {
                object: newSelectedObject
            });
        }
    }

    /**
     * Aktualisiert die Mausposition
     */
    updateMousePosition(event: MouseEvent) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.lastMousePosition.x = event.clientX - rect.left;
        this.lastMousePosition.y = event.clientY - rect.top;
    }

    /**
     * Aktualisiert den Cursor
     */
    updateCursor(hoveredObject: THREE.Object3D | null) {
        if (hoveredObject) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
    }

    /**
     * Event-Subscription System
     */
    subscribe(eventType: string, callback: Function) {
        if (!this.eventHandlers.has(`subscribers_${eventType}`)) {
            this.eventHandlers.set(`subscribers_${eventType}`, new Set());
        }

        const subscribers = this.eventHandlers.get(`subscribers_${eventType}`) as Set<Function>;
        subscribers.add(callback);

        return () => subscribers.delete(callback);
    }

    /**
     * Benachrichtigt alle Subscriber eines Event-Types
     */
    notifySubscribers(eventType: string, data: any) {
        const subscribers = this.eventHandlers.get(`subscribers_${eventType}`) as Set<Function>;
        if (subscribers) {
            subscribers.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[CentralEventManager] Fehler in Subscriber fuer ${eventType}:`, error);
                }
            });
        }
    }

    /**
     * Verffentlicht ein benutzerdefiniertes Event (Alias fr notifySubscribers)
     */
    publish(eventType: string, data: any) {
        this.notifySubscribers(eventType, data);
    }

    /**
     * Aktiviert/Deaktiviert Event-Handling
     */
    setEnabled(enabled: boolean) {
        this.activeListeners.forEach(handlerId => {
            const handlerData = this.eventHandlers.get(handlerId) as EventHandlerData;
            if (handlerData) {
                handlerData.active = enabled;
            }
        });
    }

    /**
     * Cleanup - entfernt alle Event-Listener
     */
    destroy() {
        // Alle Timeouts clearen
        if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
        if (this.clickTimeout) clearTimeout(this.clickTimeout);

        // HoverInfoPanel cleanup
        this.hoverInfoPanel.destroy();

        // Alle Event-Listener entfernen
        this.activeListeners.forEach(handlerId => {
            this.removeEventHandler(handlerId);
        });

        // Cleanup
        this.eventHandlers.clear();
        this.activeListeners.clear();
    }

    /**
     * Debug-Informationen
     */
    getDebugInfo() {
        return {
            activeListeners: this.activeListeners.size,
            currentHoveredObject: this.currentHoveredObject?.userData?.type || null,
            currentSelectedObject: this.currentSelectedObject?.userData?.type || null,
            lastMousePosition: this.lastMousePosition,
            isMouseDown: this.isMouseDown
        };
    }
}
