/**
 * SelectionHandler - Verwaltet Objekt-Selektion, Deselektion, Fokus und Loeschung
 * Extrahiert aus InteractionManager (Phase 3)
 */
import * as THREE from 'three';
import { IStateManager } from '../interfaces';

export class SelectionHandler {
    private stateManager: IStateManager;
    private camera: THREE.Camera;
    private controls: any; // OrbitControls

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
     * Selektiert ein Objekt
     * Note: HighlightManager wird automatisch ueber StateManager-Subscription benachrichtigt
     */
    selectObject(object: THREE.Object3D, isAdditive: boolean = false) {
        if (isAdditive) {
            const currentSelection = new Set(this.stateManager.getSelectedObjects());
            const equivalent = this.findEquivalentObject(currentSelection, object);

            if (equivalent) {
                currentSelection.delete(equivalent);
                // Also update primary selectedObject if it was the one removed
                if (this.stateManager.state.selectedObject === equivalent) {
                    const nextPrimary = currentSelection.size > 0 ? Array.from(currentSelection)[0] : null;
                    this.stateManager.setSelectedObject(nextPrimary);
                }
            } else {
                currentSelection.add(object);
            }
            this.stateManager.setSelectedObjects(currentSelection);
        } else {
            // Standard replacement
            this.stateManager.setSelectedObject(object);
        }
    }

    /**
     * Hilfsmethode um ein gleichwertiges Objekt in einem Set zu finden (ID-basiert fuer Proxys)
     */
    findEquivalentObject(set: Set<THREE.Object3D>, obj: THREE.Object3D): THREE.Object3D | null {
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

        // Berechne die Entfernung basierend auf der Objektgroesse
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

        // Anpassung der Zoom-Staerke basierend auf der Objektgroesse
        const zoomFactor = Math.max(1, size / 5);
        this.controls.zoomSpeed = 1.5 / zoomFactor;
    }

    /**
     * Loescht selektierte Objekte
     */
    deleteSelected() {
        const selectedObjects = Array.from(this.stateManager.getSelectedObjects());
        if (selectedObjects.length > 0) {

            this.stateManager.beginTransaction(`Delete ${selectedObjects.length} Objects`);

            // Erst deselektieren (entfernt Highlights)
            this.deselectAll();

            selectedObjects.forEach(obj => {
                if (obj.userData.type === 'node') {
                    const id = obj.userData.id || obj.userData.nodeData?.id;
                    if (id) {
                        this.stateManager.removeNode(id);
                    }
                } else if (obj.userData.type === 'edge') {
                    const edgeData = obj.userData.edge || obj.userData.relationship;
                    const id = edgeData?.id;
                    if (id) {
                        this.stateManager.removeEdge(id);
                    }
                }
            });

            this.stateManager.commitTransaction();
        }
    }

    /**
     * Dupliziert alle selektierten Objekte
     */
    duplicateSelected() {
        const selectedObjects = Array.from(this.stateManager.getSelectedObjects());

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

        // Offset fuer Sichtbarkeit
        position.x += 2;
        position.y += 2;

        const nodeData = node.userData.nodeData || node.userData.entity || {};

        const newEntity: any = {
            ...nodeData,
            id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            label: nodeData.label ? `${nodeData.label} (Kopie)` : (nodeData.name ? `${nodeData.name} (Kopie)` : 'Node Kopie'),
            position: {
                x: position.x,
                y: position.y,
                z: position.z
            }
        };

        if (newEntity.name) {
            newEntity.name = `${newEntity.name} (Kopie)`;
        }

        this.stateManager.addNode(newEntity);
    }

    /**
     * Dupliziert eine einzelne Edge
     */
    private duplicateEdge(edge: THREE.Object3D) {
        const edgeData = edge.userData.edge || edge.userData.relationship || {};

        const newEdge: any = {
            ...edgeData,
            id: `edge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            label: edgeData.label ? `${edgeData.label} (Kopie)` : (edgeData.name ? `${edgeData.name} (Kopie)` : 'Verbindung Kopie')
        };

        if (newEdge.name) {
            newEdge.name = `${newEdge.name} (Kopie)`;
        }

        this.stateManager.addEdge(newEdge);
    }
}
