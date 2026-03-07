/**
 * DragHandler - Verwaltet Node-Dragging im 3D-Raum
 * Extrahiert aus InteractionManager (Phase 3)
 */
import * as THREE from 'three';
import { IStateManager, IEventManager } from '../interfaces';
import type { MouseDownEventData, MouseUpEventData, MouseMoveEventData } from '../events/EventTypes';

export class DragHandler {
    private stateManager: IStateManager;
    private camera: THREE.Camera;
    private controls: any; // OrbitControls

    // Dragging State
    public isDragging: boolean = false;
    public wasDragging: boolean = false; // Flag fuer Click-Handler
    private dragStartPosition: { x: number; y: number } | null = null;
    private dragThreshold: number = 5; // Pixel
    private dragObject: THREE.Object3D | null = null;
    private dragPlane: THREE.Plane = new THREE.Plane();
    private dragOffset: THREE.Vector3 = new THREE.Vector3();
    private raycaster: THREE.Raycaster = new THREE.Raycaster();

    constructor(
        stateManager: IStateManager,
        camera: THREE.Camera,
        controls: any
    ) {
        this.stateManager = stateManager;
        this.camera = camera;
        this.controls = controls;
    }

    /**
     * Registriert Drag-Events beim EventManager
     */
    registerEvents(eventManager: IEventManager) {
        eventManager.subscribe('mousedown', this.handleMouseDown.bind(this));
        eventManager.subscribe('mouseup', this.handleMouseUp.bind(this));
        eventManager.subscribe('mousemove', this.handleMouseMove.bind(this));
    }

    /**
     * Handler fuer Mouse Down -- initiiert Dragging
     */
    handleMouseDown(data: MouseDownEventData) {
        const { event, clickedObject: object } = data;

        this.dragStartPosition = {
            x: event.clientX,
            y: event.clientY
        };

        // Drag Init
        if (object && object.userData.type === 'node') {
            this.isDragging = true;
            this.controls.enabled = false; // Disable OrbitControls
            this.dragObject = object;

            // Plane mit Normal = Camera View Direction, durch Objekt-Position
            this.dragPlane.setFromNormalAndCoplanarPoint(
                this.camera.getWorldDirection(new THREE.Vector3()),
                object.position
            );

            // Exakten Punkt auf der Plane finden fuer Offset
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
            this.raycaster.setFromCamera(mouse, this.camera);
            const intersectPoint = new THREE.Vector3();
            this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);

            if (intersectPoint) {
                this.dragOffset.subVectors(object.position, intersectPoint);
            }
        }
    }

    /**
     * Handler fuer Mouse Up -- beendet Dragging
     */
    handleMouseUp(_data: MouseUpEventData) {
        if (this.dragObject) {
            // Final Commit
            const pos = this.dragObject.position;
            const id = this.dragObject.userData.id;
            const nodeId = id || (this.dragObject.userData.nodeData ? this.dragObject.userData.nodeData.id : null);

            if (nodeId) {
                this.stateManager.updateNode(
                    nodeId,
                    { position: { x: pos.x, y: pos.y, z: pos.z } },
                    false // History-Eintrag erstellen
                );
            }

            this.dragObject = null;
            this.controls.enabled = true;
        }

        // Drag-Status fuer Click-Handler speichern
        if (this.isDragging) {
            this.wasDragging = true;
        }
        this.isDragging = false;
        this.dragStartPosition = null;
    }

    /**
     * Handler fuer Mouse Move -- fuehrt Dragging aus
     * Gibt true zurueck wenn das Event konsumiert wurde (Drag aktiv)
     */
    handleMouseMove(data: MouseMoveEventData): boolean {
        const { event } = data;

        // 1. Dragging Logic
        if (this.dragObject && this.isDragging) {
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
            this.raycaster.setFromCamera(mouse, this.camera);
            const intersectPoint = new THREE.Vector3();

            if (this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint)) {
                const newPos = intersectPoint.add(this.dragOffset);
                this.dragObject.position.copy(newPos);

                // Transient Update (ohne History)
                const nodeId = this.dragObject.userData.id || this.dragObject.userData.nodeData?.id;
                if (nodeId) {
                    this.stateManager.updateNode(
                        nodeId,
                        { position: { x: newPos.x, y: newPos.y, z: newPos.z } },
                        true // skipHistory
                    );
                }
            }
            return true; // Event konsumiert
        }

        // 2. Drag Start Detection
        if (this.dragStartPosition && !this.isDragging) {
            const deltaX = Math.abs(event.clientX - this.dragStartPosition.x);
            const deltaY = Math.abs(event.clientY - this.dragStartPosition.y);

            if (deltaX > this.dragThreshold || deltaY > this.dragThreshold) {
                this.isDragging = true;
            }
        }

        return false;
    }

    /**
     * Setzt das wasDragging-Flag zurueck (wird vom Click-Handler aufgerufen)
     */
    resetWasDragging() {
        this.wasDragging = false;
    }
}
