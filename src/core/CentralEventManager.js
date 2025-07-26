/**
 * CentralEventManager - Unified Event System
 * Zentraler Event-Handler fuer alle Maus- und Keyboard-Interaktionen
 * Ersetzt die verteilten Event-Handler in main.js und rollover.js
 */

import { RaycastManager } from '../utils/RaycastManager.js';

export class CentralEventManager {
    constructor(scene, camera, renderer, stateManager) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.stateManager = stateManager;
        
        // Einziger RaycastManager
        this.raycastManager = new RaycastManager(camera, scene);
        
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
            clickDelay: 200,
            doubleClickThreshold: 300
        };
        
        this.initializeEventListeners();
        
        console.log('[CentralEventManager] Initialisiert');
    }
    
    /**
     * Initialisiert alle Event-Listener
     */
    initializeEventListeners() {
        const canvas = this.renderer.domElement;
        
        // Mouse Events
        this.addEventHandler('mousemove', canvas, this.handleMouseMove.bind(this));
        this.addEventHandler('mousedown', canvas, this.handleMouseDown.bind(this));
        this.addEventHandler('mouseup', canvas, this.handleMouseUp.bind(this));
        this.addEventHandler('click', canvas, this.handleClick.bind(this));
        this.addEventHandler('dblclick', canvas, this.handleDoubleClick.bind(this));
        
        // Context menu prevention
        this.addEventHandler('contextmenu', canvas, this.handleContextMenu.bind(this));
        
        // Window events
        this.addEventHandler('resize', window, this.handleResize.bind(this));
        
        // Keyboard events
        this.addEventHandler('keydown', document, this.handleKeyDown.bind(this));
        this.addEventHandler('keyup', document, this.handleKeyUp.bind(this));
        
        console.log('[CentralEventManager] Event-Listener registriert');
    }
    
    /**
     * Fuegt einen Event-Handler hinzu und verwaltet ihn
     */
    addEventHandler(eventType, element, handler) {
        const handlerId = `${eventType}_${element.tagName || 'window'}_${Date.now()}`;
        
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
    removeEventHandler(handlerId) {
        const handlerData = this.eventHandlers.get(handlerId);
        if (handlerData) {
            handlerData.element.removeEventListener(handlerData.eventType, handlerData.handler);
            this.eventHandlers.delete(handlerId);
            this.activeListeners.delete(handlerId);
        }
    }
    
    /**
     * Haupthandler fuer Mouse-Move Events
     */
    handleMouseMove(event) {
        // Performance-Throttling
        const now = performance.now();
        if (now - this.lastMouseMoveTime < this.mouseMoveThrottle) {
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
            this.updateHoverState(hoveredObject);
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
    handleMouseDown(event) {
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
    handleMouseUp(event) {
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
    handleClick(event) {
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
    processClick(event) {
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
    handleDoubleClick(event) {
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
    handleContextMenu(event) {
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
    handleResize(event) {
        this.notifySubscribers('resize', { event });
    }
    
    /**
     * Handler fuer Keyboard Events
     */
    handleKeyDown(event) {
        this.notifySubscribers('keydown', { event });
    }
    
    handleKeyUp(event) {
        this.notifySubscribers('keyup', { event });
    }
    
    /**
     * Aktualisiert den Hover-State
     */
    updateHoverState(newHoveredObject) {
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
        }
    }
    
    /**
     * Aktualisiert den Selection-State
     */
    updateSelectionState(newSelectedObject) {
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
    updateMousePosition(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.lastMousePosition.x = event.clientX - rect.left;
        this.lastMousePosition.y = event.clientY - rect.top;
    }
    
    /**
     * Aktualisiert den Cursor
     */
    updateCursor(hoveredObject) {
        if (hoveredObject) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
    }
    
    /**
     * Event-Subscription System
     */
    subscribe(eventType, callback) {
        if (!this.eventHandlers.has(`subscribers_${eventType}`)) {
            this.eventHandlers.set(`subscribers_${eventType}`, new Set());
        }
        
        const subscribers = this.eventHandlers.get(`subscribers_${eventType}`);
        subscribers.add(callback);
        
        return () => subscribers.delete(callback);
    }
    
    /**
     * Benachrichtigt alle Subscriber eines Event-Types
     */
    notifySubscribers(eventType, data) {
        const subscribers = this.eventHandlers.get(`subscribers_${eventType}`);
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
     * Aktiviert/Deaktiviert Event-Handling
     */
    setEnabled(enabled) {
        this.activeListeners.forEach(handlerId => {
            const handlerData = this.eventHandlers.get(handlerId);
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
        
        // Alle Event-Listener entfernen
        this.activeListeners.forEach(handlerId => {
            this.removeEventHandler(handlerId);
        });
        
        // Cleanup
        this.eventHandlers.clear();
        this.activeListeners.clear();
        
        console.log('[CentralEventManager] Cleanup abgeschlossen');
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