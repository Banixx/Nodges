import * as THREE from 'three';
import { HighlightManager } from '../effects/HighlightManager';
import { IStateManager } from '../core/interfaces';

type Axis = 'y' | 'x' | 'z';

export class AxisPositionHelper {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;
    private stateManager: IStateManager;
    private highlightManager?: HighlightManager;

    private currentAxis: Axis = 'y';
    private helperLine: THREE.Line | null = null;
    private helperGrid: THREE.GridHelper | null = null;
    private previewNode: THREE.Mesh | null = null;
    private currentPosition: THREE.Vector3;
    private initialPosition: THREE.Vector3;

    private isActive: boolean = false;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    private lastHighlightedObject: THREE.Object3D | null = null;
    private tooltipElement: HTMLDivElement | null = null;

    // Achsen-Farben
    private axisColors = {
        x: 0xff0000, // Rot
        y: 0x00ff00, // Grün
        z: 0x0000ff  // Blau
    };

    constructor(
        scene: THREE.Scene,
        camera: THREE.Camera,
        renderer: THREE.WebGLRenderer,
        stateManager: IStateManager,
        highlightManager?: HighlightManager
    ) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.stateManager = stateManager;
        this.highlightManager = highlightManager;
        this.currentPosition = new THREE.Vector3();
        this.initialPosition = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    start(initialPosition: THREE.Vector3) {
        this.isActive = true;
        this.currentAxis = 'y';
        this.initialPosition.copy(initialPosition);
        this.currentPosition.copy(initialPosition);

        this.createPreviewNode();
        this.createAxisHelper();
        this.createTooltip();
    }

    /**
     * Erstellt das Tooltip-HTML-Element für die Koordinatenanzeige
     */
    private createTooltip() {
        if (this.tooltipElement) return;
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.style.position = 'fixed';
        this.tooltipElement.style.pointerEvents = 'none';
        this.tooltipElement.style.zIndex = '99999';
        this.tooltipElement.style.background = 'rgba(20, 20, 20, 0.85)';
        this.tooltipElement.style.backdropFilter = 'blur(4px)';
        this.tooltipElement.style.border = '1px solid rgba(255, 255, 255, 0.15)';
        this.tooltipElement.style.borderRadius = '6px';
        this.tooltipElement.style.padding = '4px 8px';
        this.tooltipElement.style.color = '#fff';
        this.tooltipElement.style.fontFamily = 'monospace';
        this.tooltipElement.style.fontSize = '12px';
        this.tooltipElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        this.tooltipElement.style.display = 'none';
        document.body.appendChild(this.tooltipElement);
    }

    /**
     * Erstellt einen Preview-Node
     */
    private createPreviewNode() {
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            wireframe: true
        });

        this.previewNode = new THREE.Mesh(geometry, material);
        this.previewNode.position.copy(this.currentPosition);
        this.scene.add(this.previewNode);
    }

    /**
     * Erstellt die Achsen-Hilfslinie
     */
    private createAxisHelper() {
        if (this.helperLine) {
            this.scene.remove(this.helperLine);
        }
        if (this.helperGrid) {
            this.scene.remove(this.helperGrid);
        }

        const points = [];
        const length = 100;

        switch (this.currentAxis) {
            case 'y':
                points.push(new THREE.Vector3(this.currentPosition.x, this.currentPosition.y - length, this.currentPosition.z));
                points.push(new THREE.Vector3(this.currentPosition.x, this.currentPosition.y + length, this.currentPosition.z));
                break;
            case 'x':
                points.push(new THREE.Vector3(this.currentPosition.x - length, this.currentPosition.y, this.currentPosition.z));
                points.push(new THREE.Vector3(this.currentPosition.x + length, this.currentPosition.y, this.currentPosition.z));
                break;
            case 'z':
                points.push(new THREE.Vector3(this.currentPosition.x, this.currentPosition.y, this.currentPosition.z - length));
                points.push(new THREE.Vector3(this.currentPosition.x, this.currentPosition.y, this.currentPosition.z + length));
                break;
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: this.axisColors[this.currentAxis],
            linewidth: 2,
            opacity: 0.8,
            transparent: true
        });

        this.helperLine = new THREE.Line(geometry, material);
        this.scene.add(this.helperLine);

        // Hilfsebene als GridHelper erstellen (100x100 Einheiten)
        const gridColor = this.axisColors[this.currentAxis];
        this.helperGrid = new THREE.GridHelper(100, 50, gridColor, gridColor);

        // Orientierung des Grids anpassen, damit es senkrecht zur Achse steht
        switch (this.currentAxis) {
            case 'y':
                // Y-Achse: Horizontal (standardmäßig X-Z Ebene)
                break;
            case 'x':
                // X-Achse: Vertikal (Y-Z Ebene)
                this.helperGrid.rotateZ(Math.PI / 2);
                break;
            case 'z':
                // Z-Achse: Vertikal (X-Y Ebene)
                this.helperGrid.rotateX(Math.PI / 2);
                break;
        }

        const gridMaterial = this.helperGrid.material as THREE.Material;
        gridMaterial.transparent = true;
        gridMaterial.opacity = 0.15;
        gridMaterial.depthWrite = false;

        this.helperGrid.position.copy(this.currentPosition);
        this.scene.add(this.helperGrid);
    }

    /**
     * Aktualisiert die Position basierend auf Mausbewegung
     */
    update(event: MouseEvent) {
        if (!this.isActive || !this.previewNode) return;

        // Mausposition normalisieren
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Raycaster aktualisieren
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Projektionsebene erstellen (senkrecht zur Kamera)
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);

        const plane = new THREE.Plane();
        plane.setFromNormalAndCoplanarPoint(cameraDirection, this.currentPosition);

        // Schnittpunkt mit Ebene finden
        const intersectionPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, intersectionPoint);

        if (intersectionPoint) {
            let targetHighlightedObject: THREE.Object3D | null = null;
            let snappedValue: number | null = null;
            let isSnappedToGrid = false;

            const lineThreshold = 1.2; // Toleranz für Abstand der Achsenlinie zum Objekt
            const snapThreshold = 0.8; // Toleranz für das Einrasten der Kugel

            // Kopiere aktuelle Position als Basis für Checks
            const checkPos = new THREE.Vector3().copy(this.currentPosition);
            switch (this.currentAxis) {
                case 'y': checkPos.y = intersectionPoint.y; break;
                case 'x': checkPos.x = intersectionPoint.x; break;
                case 'z': checkPos.z = intersectionPoint.z; break;
            }

            // --- 1. Snap auf Grundfläche (Y = 0) ---
            if (this.currentAxis === 'y') {
                if (Math.abs(intersectionPoint.y) < snapThreshold) {
                    snappedValue = 0;
                    isSnappedToGrid = true;
                }
            }

            // --- 2. Snap & Highlight für Nodes ---
            if (!isSnappedToGrid) {
                const nodes = this.stateManager.getEntities().filter(entity => 
                    entity.id !== (this.previewNode?.userData?.id || '')
                );

                let closestNodeEntity: any = null;
                let minDistToLine = lineThreshold;

                for (const node of nodes) {
                    const nodePos = new THREE.Vector3(
                        node.position?.x || 0,
                        node.position?.y || 0,
                        node.position?.z || 0
                    );

                    let distToLine = 0;
                    let valOnAxis = 0;

                    switch (this.currentAxis) {
                        case 'y':
                            distToLine = Math.hypot(nodePos.x - checkPos.x, nodePos.z - checkPos.z);
                            valOnAxis = nodePos.y;
                            break;
                        case 'x':
                            distToLine = Math.hypot(nodePos.y - checkPos.y, nodePos.z - checkPos.z);
                            valOnAxis = nodePos.x;
                            break;
                        case 'z':
                            distToLine = Math.hypot(nodePos.x - checkPos.x, nodePos.y - checkPos.y);
                            valOnAxis = nodePos.z;
                            break;
                    }

                    if (distToLine < minDistToLine) {
                        minDistToLine = distToLine;
                        closestNodeEntity = node;

                        let currentVal = 0;
                        switch (this.currentAxis) {
                            case 'y': currentVal = intersectionPoint.y; break;
                            case 'x': currentVal = intersectionPoint.x; break;
                            case 'z': currentVal = intersectionPoint.z; break;
                        }

                        if (Math.abs(currentVal - valOnAxis) < snapThreshold) {
                            snappedValue = valOnAxis;
                        }
                    }
                }

                if (closestNodeEntity) {
                    const realMesh = this.scene.children.find(child => 
                        child.userData.type === 'node' && 
                        child.userData.id === closestNodeEntity.id
                    );

                    if (realMesh) {
                        targetHighlightedObject = realMesh;
                    } else {
                        targetHighlightedObject = new THREE.Object3D();
                        targetHighlightedObject.position.set(
                            closestNodeEntity.position?.x || 0,
                            closestNodeEntity.position?.y || 0,
                            closestNodeEntity.position?.z || 0
                        );
                        targetHighlightedObject.userData = {
                            type: 'node',
                            nodeData: closestNodeEntity,
                            id: closestNodeEntity.id
                        };
                    }
                }
            }

            // --- 3. Snap & Highlight für Edges (wenn kein Node aktiv ist) ---
            if (!targetHighlightedObject && !isSnappedToGrid) {
                const edges = this.scene.children.filter(child => child.userData.type === 'edge');
                for (const edge of edges) {
                    const edgeData = edge.userData.edge || edge.userData.relationship;
                    if (!edgeData) continue;

                    const sourceNode = this.scene.children.find(child => 
                        child.userData.type === 'node' && 
                        (child.userData.id === edgeData.source || child.userData.nodeData?.id === edgeData.source)
                    );
                    const targetNode = this.scene.children.find(child => 
                        child.userData.type === 'node' && 
                        (child.userData.id === edgeData.target || child.userData.nodeData?.id === edgeData.target)
                    );

                    if (!sourceNode || !targetNode) continue;

                    const posA = new THREE.Vector3();
                    sourceNode.getWorldPosition(posA);

                    const posB = new THREE.Vector3();
                    targetNode.getWorldPosition(posB);

                    let minDistToLine = Infinity;
                    let closestPointOnEdge = new THREE.Vector3();

                    for (let i = 0; i <= 10; i++) {
                        const t = i / 10;
                        const point = new THREE.Vector3().lerpVectors(posA, posB, t);

                        let distToLine = 0;
                        switch (this.currentAxis) {
                            case 'y':
                                distToLine = Math.hypot(point.x - checkPos.x, point.z - checkPos.z);
                                break;
                            case 'x':
                                distToLine = Math.hypot(point.y - checkPos.y, point.z - checkPos.z);
                                break;
                            case 'z':
                                distToLine = Math.hypot(point.x - checkPos.x, point.y - checkPos.y);
                                break;
                        }

                        if (distToLine < minDistToLine) {
                            minDistToLine = distToLine;
                            closestPointOnEdge.copy(point);
                        }
                    }

                    if (minDistToLine < lineThreshold) {
                        targetHighlightedObject = edge;

                        let currentVal = 0;
                        let edgeVal = 0;
                        switch (this.currentAxis) {
                            case 'y': currentVal = intersectionPoint.y; edgeVal = closestPointOnEdge.y; break;
                            case 'x': currentVal = intersectionPoint.x; edgeVal = closestPointOnEdge.x; break;
                            case 'z': currentVal = intersectionPoint.z; edgeVal = closestPointOnEdge.z; break;
                        }

                        if (Math.abs(currentVal - edgeVal) < snapThreshold) {
                            snappedValue = edgeVal;
                            break;
                        }
                    }
                }
            }

            // --- 4. Position aktualisieren ---
            switch (this.currentAxis) {
                case 'y':
                    this.currentPosition.y = snappedValue !== null ? snappedValue : intersectionPoint.y;
                    break;
                case 'x':
                    this.currentPosition.x = snappedValue !== null ? snappedValue : intersectionPoint.x;
                    break;
                case 'z':
                    this.currentPosition.z = snappedValue !== null ? snappedValue : intersectionPoint.z;
                    break;
            }

            this.previewNode.position.copy(this.currentPosition);
            if (this.helperGrid) {
                this.helperGrid.position.copy(this.currentPosition);
            }

            // --- 5. Highlighting verwalten ---
            if (this.highlightManager) {
                if (this.lastHighlightedObject && this.lastHighlightedObject !== targetHighlightedObject) {
                    this.highlightManager.clearHighlight(this.lastHighlightedObject);
                }
                if (targetHighlightedObject && this.lastHighlightedObject !== targetHighlightedObject) {
                    this.highlightManager.applyHighlight(targetHighlightedObject, this.highlightManager.types.HOVER);
                }
                this.lastHighlightedObject = targetHighlightedObject;
            }

            // --- 6. Tooltip positionieren und befüllen ---
            if (this.tooltipElement) {
                this.tooltipElement.style.display = 'block';
                this.tooltipElement.style.left = `${event.clientX + 15}px`;
                this.tooltipElement.style.top = `${event.clientY + 15}px`;

                const xVal = this.currentPosition.x.toFixed(2);
                const yVal = this.currentPosition.y.toFixed(2);
                const zVal = this.currentPosition.z.toFixed(2);

                let xSpan = `X: ${xVal}`;
                let ySpan = `Y: ${yVal}`;
                let zSpan = `Z: ${zVal}`;

                if (this.currentAxis === 'x') {
                    xSpan = `<span style="color: #ff3333; font-weight: bold;">X: ${xVal}</span>`;
                } else if (this.currentAxis === 'y') {
                    ySpan = `<span style="color: #33ff33; font-weight: bold;">Y: ${yVal}</span>`;
                } else if (this.currentAxis === 'z') {
                    zSpan = `<span style="color: #3333ff; font-weight: bold;">Z: ${zVal}</span>`;
                }

                let snapText = '';
                if (snappedValue !== null) {
                    snapText = ` <span style="color: #00ffff; font-size: 10px; font-weight: bold; background: rgba(0,255,255,0.15); padding: 1px 4px; border-radius: 3px; margin-left: 5px;">SNAP</span>`;
                }

                this.tooltipElement.innerHTML = `${xSpan} | ${ySpan} | ${zSpan}${snapText}`;
            }
        }
    }

    /**
     * Bestätigt die aktuelle Achse und wechselt zur nächsten
     */
    confirmAxis(): boolean {
        switch (this.currentAxis) {
            case 'y':
                this.currentAxis = 'x';
                this.createAxisHelper();
                return false; // Noch nicht fertig
            case 'x':
                this.currentAxis = 'z';
                this.createAxisHelper();
                return false; // Noch nicht fertig
            case 'z':
                return true; // Fertig mit allen 3 Achsen
        }
    }

    /**
     * Beendet die Positionierung und gibt die finale Position zurück
     */
    finish(): THREE.Vector3 {
        this.cleanup();
        return this.currentPosition.clone();
    }

    /**
     * Bricht die Positionierung ab
     */
    cancel() {
        this.cleanup();
    }

    /**
     * Räumt alle visuellen Hilfsobjekte auf
     */
    private cleanup() {
        this.isActive = false;

        if (this.helperLine) {
            this.scene.remove(this.helperLine);
            this.helperLine = null;
        }

        if (this.helperGrid) {
            this.scene.remove(this.helperGrid);
            this.helperGrid = null;
        }

        if (this.previewNode) {
            this.scene.remove(this.previewNode);
            this.previewNode = null;
        }

        if (this.tooltipElement) {
            if (this.tooltipElement.parentNode) {
                this.tooltipElement.parentNode.removeChild(this.tooltipElement);
            }
            this.tooltipElement = null;
        }

        if (this.highlightManager && this.lastHighlightedObject) {
            this.highlightManager.clearHighlight(this.lastHighlightedObject);
            this.lastHighlightedObject = null;
        }
    }

    /**
     * Gibt zurück, ob der Helper aktiv ist
     */
    getIsActive(): boolean {
        return this.isActive;
    }

    /**
     * Gibt die aktuelle Achse zurück
     */
    getCurrentAxis(): Axis {
        return this.currentAxis;
    }
}
