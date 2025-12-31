/**
 * InteractionManager - Unified Interaction System
 * Verwaltet alle Benutzerinteraktionen (Hover, Click, Selection, etc.)
 * Arbeitet mit CentralEventManager und StateManager zusammen
 */
import * as THREE from 'three';
import { StateManager } from './StateManager';
// @ts-ignore
import { CentralEventManager } from './CentralEventManager';
import { HighlightManager } from '../effects/HighlightManager';

export class InteractionManager {
    private eventManager: CentralEventManager;
    private stateManager: StateManager;
    private highlightManager: HighlightManager;
    private camera: THREE.Camera;
    private controls: any; // OrbitControls
    private scene: THREE.Scene;

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
    public isDragging: boolean;
    private dragStartPosition: { x: number, y: number } | null;
    private dragThreshold: number; // Pixel

    // Timing
    private lastInteractionTime: number;
    private interactionCooldown: number; // ms

    constructor(
        centralEventManager: CentralEventManager,
        stateManager: StateManager,
        highlightManager: HighlightManager,
        camera: THREE.Camera,
        controls: any,
        scene: THREE.Scene
    ) {
        this.eventManager = centralEventManager;
        this.stateManager = stateManager;
        this.highlightManager = highlightManager;
        this.camera = camera;
        this.controls = controls;
        this.scene = scene;

        this.currentMode = this.modes.SELECT;

        // Interaction State
        this.isEnabled = true;
        this.isDragging = false;
        this.dragStartPosition = null;
        this.dragThreshold = 5; // Pixel

        // Timing
        this.lastInteractionTime = 0;
        this.interactionCooldown = 50; // ms

        this.initializeEventSubscriptions();
    }

    /**
     * Initialisiert Event-Subscriptions
     */
    initializeEventSubscriptions() {
        // Hover Events
        this.eventManager.subscribe('hover_start', this.handleHoverStart.bind(this));
        this.eventManager.subscribe('hover_end', this.handleHoverEnd.bind(this));

        // Selection Events
        this.eventManager.subscribe('click', this.handleClick.bind(this));
        this.eventManager.subscribe('doubleclick', this.handleDoubleClick.bind(this));

        // Mouse Events
        this.eventManager.subscribe('mousedown', this.handleMouseDown.bind(this));
        this.eventManager.subscribe('mouseup', this.handleMouseUp.bind(this));
        this.eventManager.subscribe('mousemove', this.handleMouseMove.bind(this));

        // Context Menu
        this.eventManager.subscribe('contextmenu', this.handleContextMenu.bind(this));

        // Keyboard Events
        this.eventManager.subscribe('keydown', this.handleKeyDown.bind(this));
        this.eventManager.subscribe('keyup', this.handleKeyUp.bind(this));
    }

    /**
     * Handler fuer Hover Start
     */
    handleHoverStart(data: any) {
        if (!this.isEnabled) return;

        const { object } = data;

        if (object) {
            // Highlight anwenden
            this.highlightManager.highlightHoveredObject(object);

            // Tooltip anzeigen (optional)
            this.showTooltip(object);
        }
    }

    /**
     * Handler fuer Hover End
     */
    handleHoverEnd(data: any) {
        if (!this.isEnabled) return;

        const { object } = data;

        if (object) {
            // Highlight entfernen (nur wenn nicht selektiert)
            if (!this.stateManager.isObjectSelected(object)) {
                this.highlightManager.removeHighlight(object);
            }

            // Tooltip verstecken
            this.hideTooltip();
        }
    }

    /**
     * Handler fuer Click Events
     */
    handleClick(data: any) {
        if (!this.isEnabled) return;

        const { clickedObject } = data;

        // Cooldown check
        const now = performance.now();
        if (now - this.lastInteractionTime < this.interactionCooldown) {
            return;
        }
        this.lastInteractionTime = now;

        // Drag-Check: War es ein Drag oder ein echter Click?
        if (this.isDragging) {
            this.isDragging = false;
            return;
        }

        if (clickedObject) {
            this.selectObject(clickedObject);
        } else {
            this.deselectAll();
        }
    }

    /**
     * Handler fuer Double-Click Events
     */
    handleDoubleClick(data: any) {
        if (!this.isEnabled) return;

        const { clickedObject } = data;

        if (clickedObject) {
            this.focusOnObject(clickedObject);
        }
    }

    /**
     * Handler fuer Mouse Down
     */
    handleMouseDown(data: any) {
        if (!this.isEnabled) return;

        const { event } = data;

        this.dragStartPosition = {
            x: event.clientX,
            y: event.clientY
        };

        this.isDragging = false;
    }

    /**
     * Handler fuer Mouse Up
     */
    handleMouseUp(_data: any) {
        if (!this.isEnabled) return;

        this.isDragging = false;
        this.dragStartPosition = null;
    }

    /**
     * Handler fuer Mouse Move
     */
    handleMouseMove(data: any) {
        if (!this.isEnabled) return;

        const { event } = data;

        // Drag-Detection
        if (this.dragStartPosition && !this.isDragging) {
            const deltaX = Math.abs(event.clientX - this.dragStartPosition.x);
            const deltaY = Math.abs(event.clientY - this.dragStartPosition.y);

            if (deltaX > this.dragThreshold || deltaY > this.dragThreshold) {
                this.isDragging = true;
            }
        }
    }

    /**
     * Handler fuer Context Menu
     */
    handleContextMenu(data: any) {
        if (!this.isEnabled) return;

        const { event, clickedObject } = data;

        if (clickedObject) {
            this.showContextMenu(clickedObject, event);
        }
    }

    /**
     * Handler fuer Keyboard Events
     */
    handleKeyDown(data: any) {
        if (!this.isEnabled) return;

        const { event } = data;

        switch (event.key) {
            case 'Escape':
                this.deselectAll();
                // this.hideInfoPanel(); // Handled by deselectAll -> state change
                break;
            case 'Delete':
                this.deleteSelected();
                break;
            case 'f':
            case 'F':
                if (this.stateManager.state.selectedObject) {
                    this.focusOnObject(this.stateManager.state.selectedObject);
                }
                break;
        }
    }

    handleKeyUp(_data: any) {
        // Placeholder fuer Key-Up Events
    }

    /**
     * Selektiert ein Objekt
     */
    selectObject(object: THREE.Object3D) {
        // Altes Objekt deselektieren
        const oldSelected = this.stateManager.state.selectedObject;
        if (oldSelected && oldSelected !== object) {
            this.highlightManager.removeHighlight(oldSelected);
        }

        // Neues Objekt selektieren
        this.stateManager.setSelectedObject(object);
        this.highlightManager.highlightSelectedObject(object);

        // Info Panel logic is now handled by UIManager observing StateManager
    }

    /**
     * Deselektiert alle Objekte
     */
    deselectAll() {
        const selectedObject = this.stateManager.state.selectedObject;
        if (selectedObject) {
            this.highlightManager.removeHighlight(selectedObject);
        }

        this.stateManager.setSelectedObject(null);
    }

    /**
     * Fokussiert auf ein Objekt (Kamera-Bewegung)
     */
    focusOnObject(object: THREE.Object3D) {
        if (!this.camera || !this.controls || !object) return;

        // Berechne die Position des Objekts
        const position = new THREE.Vector3();
        object.getWorldPosition(position);

        // Berechne die Entfernung basierend auf der Objektgre
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3()).length();
        const distance = Math.max(size * 2, 5); // Mindestabstand von 5 Einheiten

        // Berechne die neue Kameraposition
        const direction = new THREE.Vector3()
            .subVectors(this.camera.position, this.controls.target)
            .normalize();

        const newPosition = position.clone().addScaledVector(direction, distance);

        // Setze die neue Kamera-Position und das Ziel
        this.camera.position.copy(newPosition);
        this.controls.target.copy(position);
        this.controls.update();

        // Anpassung der Zoom-Strke basierend auf der Objektgre
        const zoomFactor = Math.max(1, size / 5);
        this.controls.zoomSpeed = 1.5 / zoomFactor;
    }

    /**
     * Loescht selektierte Objekte
     */
    deleteSelected() {
        const selectedObject = this.stateManager.state.selectedObject;
        if (selectedObject) {
            // Lsche das Objekt aus der Szene
            this.scene.remove(selectedObject);

            // Entferne Highlight und Ressourcen
            this.highlightManager.removeHighlight(selectedObject);

            // Freigabe von Geometrie und Material
            if ((selectedObject as any).geometry) {
                (selectedObject as any).geometry.dispose();
            }
            if ((selectedObject as any).material) {
                (selectedObject as any).material.dispose();
            }

            // Deselektiere das Objekt
            this.deselectAll();

            // Event verffentlichen
            this.eventManager.publish('object_deleted', { object: selectedObject });
        }
    }

    /**
     * Zeigt Tooltip an
     */
    showTooltip(object: THREE.Object3D) {
        if (!object || !object.userData) return;

        const content = this.generateTooltipContent(object);
        // Tooltip-Position wird vom Event-System bereitgestellt
        // Note: Position handling needs to be verified in CentralEventManager
        this.stateManager.showTooltip(content, { x: 0, y: 0 }); // Placeholder pos
    }

    /**
     * Versteckt Tooltip
     */
    hideTooltip() {
        this.stateManager.hideTooltip();
    }

    /**
     * Generiert Tooltip-Inhalt
     */
    generateTooltipContent(object: THREE.Object3D): string {
        if (object.userData.type === 'node') {
            return object.userData.nodeData?.name || object.name || 'Unbenannter Knoten';
        } else if (object.userData.type === 'edge') {
            return object.userData.edge?.options?.name || object.name || 'Unbenannte Kante';
        }
        return 'Unbekanntes Objekt';
    }

    /**
     * Zeigt Context Menu an
     */
    showContextMenu(_object: THREE.Object3D, _event: any) {
        // Context Menu Implementierung - spaeter
    }

    /**
     * Setzt Interaction Mode
     */
    setMode(mode: string) {
        if (Object.values(this.modes).includes(mode)) {
            this.currentMode = mode;
            this.stateManager.setCurrentTool(mode);
        }
    }

    /**
     * Aktiviert/Deaktiviert Interaktionen
     */
    setEnabled(enabled: boolean) {
        this.isEnabled = enabled;
        this.stateManager.setInteractionEnabled(enabled);
    }

    /**
     * Debug-Informationen
     */
    getDebugInfo() {
        return {
            isEnabled: this.isEnabled,
            currentMode: this.currentMode,
            isDragging: this.isDragging,
            dragStartPosition: this.dragStartPosition,
            lastInteractionTime: this.lastInteractionTime,
            infoPanelVisible: this.stateManager.state.infoPanelVisible,
            selectedObject: this.stateManager.state.selectedObject?.userData?.type || null,
            hoveredObject: this.stateManager.state.hoveredObject?.userData?.type || null
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        // Event-Subscriptions werden automatisch durch CentralEventManager bereinigt
        this.hideTooltip();
    }
}
