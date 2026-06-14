/**
 * NodeCreationHandler - Verwaltet Node- und Edge-Erstellung
 * Extrahiert aus InteractionManager (Phase 3)
 */
import * as THREE from 'three';
import { IStateManager } from '../interfaces';
import { AxisPositionHelper } from '../../utils/AxisPositionHelper';
import { HighlightManager } from '../../effects/HighlightManager';
import { EntityData, RelationshipData } from '../../types';

export class NodeCreationHandler {
    private stateManager: IStateManager;
    private camera: THREE.Camera;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private axisPositionHelper: AxisPositionHelper;

    // Edge-Creation State
    public edgeSourceNode: THREE.Object3D | null = null;
    public isCreatingEdge: boolean = false;

    constructor(
        stateManager: IStateManager,
        camera: THREE.Camera,
        scene: THREE.Scene,
        renderer: THREE.WebGLRenderer,
        highlightManager?: HighlightManager
    ) {
        this.stateManager = stateManager;
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.axisPositionHelper = new AxisPositionHelper(scene, camera, renderer, stateManager, highlightManager);
    }

    /**
     * Erstellt einen neuen Node mit Achsen-Positionierung
     */
    createNewNode(event: MouseEvent, callback?: (pos: THREE.Vector3) => void) {
        // Prüfe ob eine Edge selektiert ist (Snapping)
        const selectedEdges = Array.from(this.stateManager.getSelectedObjects())
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
        const distance = 10;
        const planePoint = new THREE.Vector3().addVectors(
            this.camera.position,
            cameraDirection.multiplyScalar(distance)
        );
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(cameraDirection, planePoint);

        const intersectionPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectionPoint);

        if (intersectionPoint) {
            this.axisPositionHelper.start(intersectionPoint);

            const startTime = performance.now();
            const mouseMoveHandler = (e: MouseEvent) => {
                this.axisPositionHelper.update(e);
            };

            const clickHandler = (e: MouseEvent) => {
                if (performance.now() - startTime < 100) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                const isFinished = this.axisPositionHelper.confirmAxis();

                if (isFinished) {
                    const finalPosition = this.axisPositionHelper.finish();

                    if (callback) {
                        callback(finalPosition);
                    } else {
                        this.finishNodeCreation(finalPosition);
                    }

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

        // Bestimme welcher Endpunkt naeher zur Maus ist
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

        // Erstelle Node direkt an der Position
        this.finishNodeCreation(snapPosition);
    }

    /**
     * Entfernt alle Event-Listener fuer Node-Erstellung
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
     * Beendet die Node-Erstellung und aktualisiert State
     */
    finishNodeCreation(position: THREE.Vector3) {
        const newEntity: EntityData = {
            id: `node_${Date.now()}`,
            type: 'node',
            label: 'Neuer Node',
            position: {
                x: position.x,
                y: position.y,
                z: position.z
            },
            properties: {}
        };
        this.stateManager.addNode(newEntity);
    }

    /**
     * Startet Edge-Erstellung
     */
    startEdgeCreationMode() {
        this.isCreatingEdge = true;
        document.body.style.cursor = 'crosshair';

        // Nutze den ersten selektierten Node als Source (falls vorhanden)
        const selectedNodes = Array.from(this.stateManager.getSelectedObjects())
            .filter(obj => obj.userData.type === 'node');

        if (selectedNodes.length > 0) {
            this.edgeSourceNode = selectedNodes[0];
            console.log('[NodeCreationHandler] Edge creation started with source. Select target node.');
        } else {
            this.edgeSourceNode = null;
            console.log('[NodeCreationHandler] Edge creation started. Select source node (or click empty space).');
        }
    }

    /**
     * Beendet Edge-Erstellung
     */
    finishEdgeCreation(targetNode: THREE.Object3D) {
        if (!this.edgeSourceNode) return;

        const sourceId = this.edgeSourceNode.userData.id || this.edgeSourceNode.userData.nodeData?.id;
        const targetId = targetNode.userData.id || targetNode.userData.nodeData?.id;

        if (sourceId && targetId) {
            const newEdge: RelationshipData = {
                id: `e${Date.now()}`,
                type: 'connection',
                source: sourceId,
                target: targetId,
                label: 'Neue Verbindung'
            };
            this.stateManager.addEdge(newEdge);
        }

        this.cancelEdgeCreation();
    }

    /**
     * Bricht Edge-Erstellung ab
     */
    cancelEdgeCreation() {
        this.edgeSourceNode = null;
        this.isCreatingEdge = false;
        document.body.style.cursor = 'default';
    }

    /**
     * Verschiebt einen existierenden Node mit Achsen-Positionierung
     */
    moveExistingNode(node: THREE.Object3D) {
        const nodeId = node.userData.id || node.userData.nodeData?.id;
        if (!nodeId) return;

        const initialPos = new THREE.Vector3();
        node.getWorldPosition(initialPos);

        this.axisPositionHelper.start(initialPos);

        const startTime = performance.now();
        const mouseMoveHandler = (e: MouseEvent) => {
            this.axisPositionHelper.update(e);
        };

        const clickHandler = (e: MouseEvent) => {
            if (performance.now() - startTime < 100) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            const isFinished = this.axisPositionHelper.confirmAxis();

            if (isFinished) {
                const finalPosition = this.axisPositionHelper.finish();

                this.stateManager.updateNode(nodeId, {
                    position: {
                        x: finalPosition.x,
                        y: finalPosition.y,
                        z: finalPosition.z
                    }
                });

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

    /**
     * Erstellt einen Proxy fuer einen Node (aehnlich RaycastManager)
     */
    createNodeProxy(entityData: any): THREE.Object3D {
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
}
