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
import { ContextMenu } from '../utils/ContextMenu';
import { DataEditor } from '../utils/DataEditor';
import { AxisPositionHelper } from '../utils/AxisPositionHelper';

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

    // UI Utilities
    private contextMenu: ContextMenu;
    private dataEditor: DataEditor;
    private axisPositionHelper: AxisPositionHelper;

    // Creation State
    private edgeSourceNode: THREE.Object3D | null = null;
    private isCreatingEdge: boolean = false;
    private renderer: THREE.WebGLRenderer;

    constructor(
        centralEventManager: CentralEventManager,
        stateManager: StateManager,
        highlightManager: HighlightManager,
        camera: THREE.Camera,
        controls: any,
        scene: THREE.Scene,
        renderer: THREE.WebGLRenderer
    ) {
        this.eventManager = centralEventManager;
        this.stateManager = stateManager;
        this.highlightManager = highlightManager;
        this.camera = camera;
        this.controls = controls;
        this.scene = scene;
        this.renderer = renderer;

        this.currentMode = this.modes.SELECT;

        // Interaction State
        this.isEnabled = true;
        this.isDragging = false;
        this.dragStartPosition = null;
        this.dragThreshold = 5; // Pixel

        // Timing
        this.lastInteractionTime = 0;
        this.interactionCooldown = 50; // ms

        // UI Utilities
        this.contextMenu = new ContextMenu();
        this.dataEditor = new DataEditor();
        this.axisPositionHelper = new AxisPositionHelper(scene, camera, renderer);

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
            // Wenn wir gerade eine Kante erstellen, ist dieser Klick Quelle oder Ziel
            if (this.isCreatingEdge && clickedObject.userData.type === 'node') {
                if (!this.edgeSourceNode) {
                    this.edgeSourceNode = clickedObject;
                    console.log('[InteractionManager] Source node selected. Select target node.');
                } else {
                    this.finishEdgeCreation(clickedObject);
                }
                return;
            }

            // Die Daten kommen von CentralEventManager via notifySubscribers
            const isAdditive = !!(data.event?.ctrlKey || data.event?.shiftKey);
            this.selectObject(clickedObject, isAdditive);
        } else {
            if (this.isCreatingEdge) {
                // Klick ins Leere während Kanten-Erstellung -> Neuen Node an dieser Stelle erstellen
                this.createNewNode(data.event, (position) => {
                    const newNodeId = `node_${Date.now()}`;

                    // Node erstellen
                    this.eventManager.publish('node_created', {
                        position: position,
                        data: { id: newNodeId, name: 'Neuer Node' }
                    });

                    if (!this.edgeSourceNode) {
                        console.log('[InteractionManager] New node created as source. Please select target node or click empty space again.');
                        const sub = this.eventManager.subscribe('node_added_to_scene', (nodeData: any) => {
                            if (nodeData.id === newNodeId) {
                                this.edgeSourceNode = this.createNodeProxy(nodeData.entity);
                                this.isCreatingEdge = true;
                                document.body.style.cursor = 'crosshair';
                                sub();
                            }
                        });
                    } else {
                        const sub = this.eventManager.subscribe('node_added_to_scene', (nodeData: any) => {
                            if (nodeData.id === newNodeId) {
                                const targetProxy = this.createNodeProxy(nodeData.entity);
                                this.finishEdgeCreation(targetProxy);
                                sub();
                            }
                        });
                    }
                });
                return;
            }
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

        // Zeige Kontextmenü immer, auch ohne Objekt
        this.showContextMenu(clickedObject, event);
    }

    /**
     * Handler fuer Keyboard Events
     */
    handleKeyDown(data: any) {
        if (!this.isEnabled) return;

        const { event } = data;

        switch (event.key) {
            case 'Escape':
                if (this.isCreatingEdge) {
                    this.cancelEdgeCreation();
                }
                this.deselectAll();
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
    selectObject(object: THREE.Object3D, isAdditive: boolean = false) {
        if (isAdditive) {
            const currentSelection = new Set(this.stateManager.state.selectedObjects);
            const equivalent = this.findEquivalentObject(currentSelection, object);

            if (equivalent) {
                currentSelection.delete(equivalent);
                // Also update primary selectedObject if it was the one removed
                if (this.stateManager.state.selectedObject === equivalent) {
                    const nextPrimary = currentSelection.size > 0 ? Array.from(currentSelection)[0] : null;
                    this.stateManager.update({ selectedObject: nextPrimary });
                }
            } else {
                currentSelection.add(object);
            }
            this.stateManager.setSelectedObjects(currentSelection);
        } else {
            // Standard replacement
            this.stateManager.setSelectedObject(object);
        }

        this.highlightManager.updateHighlights(this.stateManager.state);
    }

    /**
     * Hilfsmethode um ein gleichwertiges Objekt in einem Set zu finden (ID-basiert fuer Proxys)
     */
    private findEquivalentObject(set: Set<THREE.Object3D>, obj: THREE.Object3D): THREE.Object3D | null {
        if (set.has(obj)) return obj;

        const objId = obj.userData.id;
        const objType = obj.userData.type;

        if (!objId || !objType) return null;

        for (const item of set) {
            if (item.userData.type === objType && item.userData.id === objId) {
                return item;
            }
        }
        return null;
    }

    /**
     * Deselektiert alle Objekte
     */
    deselectAll() {
        this.stateManager.setSelectedObjects(new Set());
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
        const selectedObjects = Array.from(this.stateManager.state.selectedObjects);
        if (selectedObjects.length > 0) {
            selectedObjects.forEach(obj => {
                // Lsche das Objekt aus der Szene
                this.scene.remove(obj);

                // Entferne Highlight und Ressourcen
                this.highlightManager.removeHighlight(obj);

                // Freigabe von Geometrie und Material
                if ((obj as any).geometry) {
                    (obj as any).geometry.dispose();
                }
                if ((obj as any).material) {
                    (obj as any).material.dispose();
                }

                // Event verffentlichen
                this.eventManager.publish('object_deleted', { object: obj });
            });

            // Deselektiere alle
            this.deselectAll();
        }
    }

    /**
     * Zeigt Tooltip an
     */
    showTooltip(object: THREE.Object3D) {
        if (!object || !object.userData) return;

        const content = this.generateTooltipContent(object);
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
    showContextMenu(object: THREE.Object3D | null, event: any) {
        const hasSelection = this.stateManager.state.selectedObjects.size > 0;
        const hasNodeSelection = Array.from(this.stateManager.state.selectedObjects)
            .some(obj => obj.userData.type === 'node');

        const options: any[] = [
            {
                label: 'Neuer Node',
                action: () => this.createNewNode(event)
            },
            {
                label: 'Neue Edge',
                action: () => this.startEdgeCreationMode(),
                disabled: !hasNodeSelection
            },
            {
                label: 'Duplizieren',
                action: () => this.duplicateSelected(),
                disabled: !hasSelection
            }
        ];

        // Wenn ein Objekt angeklickt wurde, füge objektspezifische Optionen hinzu
        if (object) {
            options.unshift({
                label: 'Data',
                action: () => {
                    const data = object.userData.nodeData || object.userData.edge || object.userData.entity || {};
                    this.dataEditor.show(data, (updatedData) => {
                        this.eventManager.publish('data_updated', { object, updatedData });
                        this.stateManager.update({ selectedObject: object });
                    });
                }
            });
        }

        this.contextMenu.show(event.clientX, event.clientY, options);
    }

    private finishEdgeCreation(targetNode: THREE.Object3D) {
        if (!this.edgeSourceNode) return;

        const sourceId = this.edgeSourceNode.userData.id || this.edgeSourceNode.userData.nodeData?.id;
        const targetId = targetNode.userData.id || targetNode.userData.nodeData?.id;

        if (sourceId && targetId) {
            this.eventManager.publish('edge_created', {
                source: sourceId,
                target: targetId
            });
        }

        this.cancelEdgeCreation();
    }

    private cancelEdgeCreation() {
        this.edgeSourceNode = null;
        this.isCreatingEdge = false;
        document.body.style.cursor = 'default';
    }

    /**
     * Erstellt einen neuen Node mit Achsen-Positionierung
     */
    private createNewNode(event: MouseEvent, callback?: (pos: THREE.Vector3) => void) {
        // Prüfe ob eine Edge selektiert ist (Snapping)
        const selectedEdges = Array.from(this.stateManager.state.selectedObjects)
            .filter(obj => obj.userData.type === 'edge');

        if (selectedEdges.length > 0 && !callback) {
            // Edge-Snapping: Node an Edge-Endpunkt einrasten
            this.createNodeAtEdgeEndpoint(selectedEdges[0], event);
            return;
        }

        // Initiale Position aus Raycast ermitteln
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        // Erstelle eine Ebene senkrecht zur Kamera
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        const distance = 10; // Abstand von der Kamera
        const planePoint = new THREE.Vector3().addVectors(
            this.camera.position,
            cameraDirection.multiplyScalar(distance)
        );
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(cameraDirection, planePoint);

        const intersectionPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectionPoint);

        if (intersectionPoint) {
            this.axisPositionHelper.start(intersectionPoint);

            // Event-Listener für Mausbewegung und Klick hinzufügen
            const mouseMoveHandler = (e: MouseEvent) => {
                this.axisPositionHelper.update(e);
            };

            const clickHandler = (e: MouseEvent) => {
                e.preventDefault();
                const isFinished = this.axisPositionHelper.confirmAxis();

                if (isFinished) {
                    // Positionierung abgeschlossen
                    const finalPosition = this.axisPositionHelper.finish();

                    if (callback) {
                        callback(finalPosition);
                    } else {
                        this.finishNodeCreation(finalPosition);
                    }

                    // Event-Listener entfernen
                    this.removeNodeCreationListeners(mouseMoveHandler, clickHandler, cancelHandler, escapeHandler);
                }
            };

            const cancelHandler = (e: MouseEvent) => {
                e.preventDefault();
                this.axisPositionHelper.cancel();
                this.removeNodeCreationListeners(mouseMoveHandler, clickHandler, cancelHandler, escapeHandler);
            };

            const escapeHandler = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.axisPositionHelper.cancel();
                    this.removeNodeCreationListeners(mouseMoveHandler, clickHandler, cancelHandler, escapeHandler);
                }
            };

            window.addEventListener('mousemove', mouseMoveHandler);
            window.addEventListener('click', clickHandler, true); // Capture phase
            window.addEventListener('contextmenu', cancelHandler);
            window.addEventListener('keydown', escapeHandler);
        }
    }

    /**
     * Erstellt einen Node an einem Edge-Endpunkt
     */
    private createNodeAtEdgeEndpoint(edge: THREE.Object3D, event: MouseEvent) {
        const edgeData = edge.userData.edge || edge.userData.relationship;
        if (!edgeData) return;

        // Finde Source- und Target-Nodes
        const sourceNode = this.scene.children.find(obj =>
            obj.userData.type === 'node' &&
            (obj.userData.id === edgeData.source || obj.userData.nodeData?.id === edgeData.source)
        );
        const targetNode = this.scene.children.find(obj =>
            obj.userData.type === 'node' &&
            (obj.userData.id === edgeData.target || obj.userData.nodeData?.id === edgeData.target)
        );

        if (!sourceNode || !targetNode) return;

        // Bestimme welcher Endpunkt näher zur Maus ist
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const sourcePos = new THREE.Vector3();
        sourceNode.getWorldPosition(sourcePos);
        const sourceScreen = sourcePos.clone().project(this.camera);
        const sourceScreenX = (sourceScreen.x + 1) / 2 * rect.width;
        const sourceScreenY = (-sourceScreen.y + 1) / 2 * rect.height;

        const targetPos = new THREE.Vector3();
        targetNode.getWorldPosition(targetPos);
        const targetScreen = targetPos.clone().project(this.camera);
        const targetScreenX = (targetScreen.x + 1) / 2 * rect.width;
        const targetScreenY = (-targetScreen.y + 1) / 2 * rect.height;

        const distToSource = Math.hypot(mouseX - sourceScreenX, mouseY - sourceScreenY);
        const distToTarget = Math.hypot(mouseX - targetScreenX, mouseY - targetScreenY);

        const snapPosition = distToSource < distToTarget ? sourcePos : targetPos;

        // Erstelle Node direkt an der Position (ein Klick beendet)
        this.finishNodeCreation(snapPosition);
    }

    /**
     * Entfernt alle Event-Listener für Node-Erstellung
     */
    private removeNodeCreationListeners(
        mouseMoveHandler: (e: MouseEvent) => void,
        clickHandler: (e: MouseEvent) => void,
        cancelHandler: (e: MouseEvent) => void,
        escapeHandler: (e: KeyboardEvent) => void
    ) {
        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('click', clickHandler, true);
        window.removeEventListener('contextmenu', cancelHandler);
        window.removeEventListener('keydown', escapeHandler);
    }

    /**
     * Beendet die Node-Erstellung und publiziert Event
     */
    private finishNodeCreation(position: THREE.Vector3) {
        this.eventManager.publish('node_created', {
            position: position,
            data: {
                id: `node_${Date.now()}`,
                name: 'Neuer Node'
            }
        });
    }

    /**
     * Startet Edge-Erstellung
     */
    private startEdgeCreationMode() {
        this.isCreatingEdge = true;
        document.body.style.cursor = 'crosshair';

        // Nutze den ersten selektierten Node als Source (falls vorhanden)
        const selectedNodes = Array.from(this.stateManager.state.selectedObjects)
            .filter(obj => obj.userData.type === 'node');

        if (selectedNodes.length > 0) {
            this.edgeSourceNode = selectedNodes[0];
            console.log('[InteractionManager] Edge creation started with source. Select target node.');
        } else {
            this.edgeSourceNode = null;
            console.log('[InteractionManager] Edge creation started. Select source node (or click empty space).');
        }
    }

    /**
     * Erstellt einen Proxy für einen Node (ähnlich RaycastManager)
     */
    private createNodeProxy(entityData: any): THREE.Object3D {
        const dummyNode = new THREE.Object3D();
        if (entityData.position) {
            dummyNode.position.set(entityData.position.x || 0, entityData.position.y || 0, entityData.position.z || 0);
        }

        dummyNode.userData = {
            type: 'node',
            node: { data: entityData },
            nodeData: entityData,
            id: entityData.id
        };

        return dummyNode;
    }

    /**
     * Dupliziert alle selektierten Objekte
     */
    private duplicateSelected() {
        const selectedObjects = Array.from(this.stateManager.state.selectedObjects);

        if (selectedObjects.length === 0) return;

        selectedObjects.forEach(obj => {
            if (obj.userData.type === 'node') {
                this.duplicateNode(obj);
            } else if (obj.userData.type === 'edge') {
                this.duplicateEdge(obj);
            }
        });
    }

    /**
     * Dupliziert einen einzelnen Node
     */
    private duplicateNode(node: THREE.Object3D) {
        const position = new THREE.Vector3();
        node.getWorldPosition(position);

        // Offset für Sichtbarkeit
        position.x += 2;
        position.y += 2;

        const nodeData = node.userData.nodeData || node.userData.entity || {};

        this.eventManager.publish('node_created', {
            position: position,
            data: {
                ...nodeData,
                id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: `${nodeData.name || 'Node'} (Kopie)`
            }
        });
    }

    /**
     * Dupliziert eine einzelne Edge
     */
    private duplicateEdge(edge: THREE.Object3D) {
        const edgeData = edge.userData.edge || edge.userData.relationship || {};

        this.eventManager.publish('edge_created', {
            source: edgeData.source,
            target: edgeData.target,
            data: {
                ...edgeData,
                id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: `${edgeData.name || 'Edge'} (Kopie)`
            }
        });
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
