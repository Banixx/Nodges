import * as THREE from 'three';
import { HighlightManager } from '../effects/HighlightManager';
import { IStateManager } from '../core/interfaces';
import { EntityData } from '../types';

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
    private groundIntersectionLine: THREE.Mesh | null = null;
    private previewNode: THREE.Mesh | null = null;
    private currentPosition: THREE.Vector3;
    private initialPosition: THREE.Vector3;
    private previewEdges: {
        mesh: THREE.Mesh;
        curve: THREE.QuadraticBezierCurve3;
        otherPos: THREE.Vector3;
        isSource: boolean;
        tubularSegments: number;
        radialSegments: number;
        finalThickness: number;
    }[] = [];

    private isActive: boolean = false;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    private lastHighlightedObject: THREE.Object3D | null = null;
    private tooltipElement: HTMLDivElement | null = null;
    public isTransitioning: boolean = false;

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

    start(initialPosition: THREE.Vector3, nodeId?: string) {
        this.isActive = true;
        this.currentAxis = 'y';
        this.initialPosition.copy(initialPosition);
        this.currentPosition.copy(initialPosition);

        this.createPreviewNode();
        this.createAxisHelper();
        this.createTooltip();
        this.createPreviewEdges(nodeId);
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
        if (this.groundIntersectionLine) {
            this.scene.remove(this.groundIntersectionLine);
            this.groundIntersectionLine = null;
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

        // Schnittlinie am Boden (Y = 0) anzeigen, wenn das Gitter vertikal steht (X- oder Z-Achse)
        if (this.currentAxis === 'x' || this.currentAxis === 'z') {
            let intersectionGeom;
            if (this.currentAxis === 'x') {
                // Y-Z Ebene: Schnittlinie verläuft entlang Z-Achse (Dicke 0.15, Länge 100)
                intersectionGeom = new THREE.BoxGeometry(0.15, 0.15, 100);
            } else {
                // X-Y Ebene: Schnittlinie verläuft entlang X-Achse (Länge 100, Dicke 0.15)
                intersectionGeom = new THREE.BoxGeometry(100, 0.15, 0.15);
            }
            const intersectionMat = new THREE.MeshBasicMaterial({
                color: gridColor,
                transparent: true,
                opacity: 0.6,
                depthWrite: false
            });
            this.groundIntersectionLine = new THREE.Mesh(intersectionGeom, intersectionMat);
            this.groundIntersectionLine.position.set(
                this.currentPosition.x,
                0,
                this.currentPosition.z
            );
            this.groundIntersectionLine.visible = Math.abs(this.currentPosition.y) <= 50;
            this.scene.add(this.groundIntersectionLine);
        }
    }

    /**
     * Aktualisiert die Position basierend auf Mausbewegung
     */
    update(event: MouseEvent) {
        if (!this.isActive || !this.previewNode || this.isTransitioning) return;

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

            // --- 0. Direct Hit Raycast ---
            const interactables = this.scene.children.filter(child => 
                (child.userData.type === 'node' || child.userData.type === 'edge') &&
                child.userData.id !== (this.previewNode?.userData?.id || '')
            );
            const intersects = this.raycaster.intersectObjects(interactables, true);
            let directHitFound = false;

            if (intersects.length > 0) {
                let hitObj = intersects[0].object;
                while (hitObj && hitObj.userData.type !== 'node' && hitObj.userData.type !== 'edge' && hitObj.parent) {
                    hitObj = hitObj.parent;
                }
                if (hitObj && (hitObj.userData.type === 'node' || hitObj.userData.type === 'edge')) {
                    targetHighlightedObject = hitObj;
                    directHitFound = true;
                    if (hitObj.userData.type === 'node') {
                        const pos = new THREE.Vector3();
                        hitObj.getWorldPosition(pos);
                        snappedValue = this.currentAxis === 'y' ? pos.y : (this.currentAxis === 'x' ? pos.x : pos.z);
                    } else {
                        // Bei Kanten nehmen wir den Raycast-Trefferpunkt
                        snappedValue = this.currentAxis === 'y' ? intersects[0].point.y : (this.currentAxis === 'x' ? intersects[0].point.x : intersects[0].point.z);
                    }
                }
            }

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
            if (!directHitFound && this.currentAxis === 'y') {
                if (Math.abs(intersectionPoint.y) < snapThreshold) {
                    snappedValue = 0;
                    isSnappedToGrid = true;
                }
            }

            // --- 2. Snap & Highlight für Nodes (3D Distanz) ---
            if (!directHitFound && !isSnappedToGrid) {
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

            // --- 3. Snap & Highlight für Edges (wenn kein Node aktiv ist) (3D Distanz) ---
            if (!directHitFound && !targetHighlightedObject && !isSnappedToGrid) {
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
            this.updatePreviewEdges();
            if (this.helperGrid) {
                this.helperGrid.position.copy(this.currentPosition);
            }
            if (this.groundIntersectionLine) {
                if (Math.abs(this.currentPosition.y) <= 50) {
                    this.groundIntersectionLine.position.set(
                        this.currentPosition.x,
                        0,
                        this.currentPosition.z
                    );
                    this.groundIntersectionLine.visible = true;
                } else {
                    this.groundIntersectionLine.visible = false;
                }
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
     * Bestätigt die aktuelle Achse und wechselt zur nächsten (Async Version für 300ms Delay)
     */
    async confirmAxisAsync(): Promise<boolean> {
        this.isTransitioning = true;

        // Visuelles Feedback
        if (this.helperLine) {
            const mat = this.helperLine.material as THREE.LineBasicMaterial;
            mat.color.setHex(0xffffff);
            mat.linewidth = 3;
            mat.needsUpdate = true;
        }
        if (this.helperGrid) {
            const mat = this.helperGrid.material as THREE.Material;
            mat.opacity = 0.5;
            mat.needsUpdate = true;
        }
        if (this.tooltipElement) {
            this.tooltipElement.style.border = '2px solid #fff';
            this.tooltipElement.style.boxShadow = '0 0 15px rgba(255,255,255,0.8)';
            this.tooltipElement.innerHTML = `<span style="color:#fff; font-weight:bold;">POS SET</span>`;
        }

        await new Promise(resolve => setTimeout(resolve, 300));
        this.isTransitioning = false;

        // Tooltip Styles zurücksetzen
        if (this.tooltipElement) {
            this.tooltipElement.style.border = '1px solid rgba(255, 255, 255, 0.15)';
            this.tooltipElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        }

        switch (this.currentAxis) {
            case 'y':
                this.currentAxis = 'x';
                this.createAxisHelper();
                return false;
            case 'x':
                this.currentAxis = 'z';
                this.createAxisHelper();
                return false;
            case 'z':
                return true;
        }
        return true;
    }

    /**
     * Bestätigt die aktuelle Achse und wechselt zur nächsten (Legacy synchron)
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

        if (this.groundIntersectionLine) {
            this.scene.remove(this.groundIntersectionLine);
            this.groundIntersectionLine = null;
        }

        if (this.previewNode) {
            this.scene.remove(this.previewNode);
            this.previewNode = null;
        }

        if (this.previewEdges && this.previewEdges.length > 0) {
            this.previewEdges.forEach(item => {
                this.scene.remove(item.mesh);
                item.mesh.geometry.dispose();
                if (item.mesh.material) {
                    if (Array.isArray(item.mesh.material)) {
                        item.mesh.material.forEach(m => m.dispose());
                    } else {
                        item.mesh.material.dispose();
                    }
                }
            });
            this.previewEdges = [];
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
     * Erstellt Wireframe-Preview-Kanten für alle Verbindungen des Knotens
     */
    private createPreviewEdges(nodeId?: string) {
        this.previewEdges = [];
        if (!nodeId) return;

        const relationships = this.stateManager.getRelationships();
        const entities = this.stateManager.getEntities();
        const state = this.stateManager.state;

        // Map to quickly find other nodes
        const nodeMap = new Map<string, EntityData>();
        entities.forEach(n => nodeMap.set(String(n.id), n));

        // Scan scene to find existing edge geometries and extract their exact parameters
        const sceneEdges = new Map<string, { radius: number; radialSegments: number; tubularSegments: number }>();
        this.scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh && obj.userData && obj.userData.type === 'edge') {
                const edge = obj.userData.edge;
                if (edge) {
                    const sNode = String(edge.source !== undefined ? edge.source : edge.start);
                    const tNode = String(edge.target !== undefined ? edge.target : edge.end);
                    const key = `${sNode}_${tNode}`;
                    
                    if (obj.geometry && (obj.geometry as any).parameters) {
                        const params = (obj.geometry as any).parameters;
                        if (typeof params.radius === 'number') {
                            const data = {
                                radius: params.radius,
                                radialSegments: params.radialSegments || 8,
                                tubularSegments: params.tubularSegments || 20
                            };
                            sceneEdges.set(key, data);
                            if (edge.id) {
                                sceneEdges.set(String(edge.id), data);
                            }
                        }
                    }
                }
            }
        });

        // Find all connected relationships
        const connectedRels = relationships.filter(rel => {
            const s = String(rel.source !== undefined ? rel.source : rel.start);
            const t = String(rel.target !== undefined ? rel.target : rel.end);
            return s === nodeId || t === nodeId;
        });

        connectedRels.forEach(rel => {
            const s = String(rel.source !== undefined ? rel.source : rel.start);
            const t = String(rel.target !== undefined ? rel.target : rel.end);
            
            const isSource = s === nodeId;
            const otherNodeId = isSource ? t : s;
            const otherNode = nodeMap.get(otherNodeId);

            if (otherNode) {
                const otherPos = new THREE.Vector3(
                    otherNode.position?.x || 0,
                    otherNode.position?.y || 0,
                    otherNode.position?.z || 0
                );

                const startPos = isSource ? this.currentPosition : otherPos;
                const endPos = isSource ? otherPos : this.currentPosition;

                // Berechne Mitte und Bogen
                const midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, 0.5);
                const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();

                let perpendicular = new THREE.Vector3(1, 0, 0).cross(direction);
                if (perpendicular.length() < 0.0001) {
                    perpendicular.set(0, 1, 0).cross(direction);
                }
                perpendicular.normalize();

                const curveFactor = state.edgeCurveFactor !== undefined ? state.edgeCurveFactor : 0.15;
                const curveHeight = direction.length() * curveFactor;
                const controlPoint = midPoint.clone().add(perpendicular.multiplyScalar(curveHeight));

                const curve = new THREE.QuadraticBezierCurve3(
                    startPos.clone(),
                    controlPoint,
                    endPos.clone()
                );

                // Default values
                let finalThickness = 0.2;
                let radialSegments = state.edgeRadialSegments || 8;
                let tubularSegments = state.edgeTubularSegments || 20;

                // Try to find parameters of the actual edge in the scene
                const key = `${s}_${t}`;
                let params: { radius: number; radialSegments: number; tubularSegments: number } | undefined;
                if (rel.id && sceneEdges.has(String(rel.id))) {
                    params = sceneEdges.get(String(rel.id));
                } else if (sceneEdges.has(key)) {
                    params = sceneEdges.get(key);
                }

                if (params) {
                    finalThickness = params.radius;
                    radialSegments = params.radialSegments;
                    tubularSegments = params.tubularSegments;
                } else {
                    const thickness = state.edgeThickness || 0.2;
                    const exponent = state.visualScaleExponent !== undefined ? state.visualScaleExponent : 1.0;
                    const multiplier = state.visualScaleMultiplier !== undefined ? state.visualScaleMultiplier : 1.0;
                    finalThickness = Math.pow(thickness * 1.0, exponent) * multiplier;
                }

                const tubeGeometry = new THREE.TubeGeometry(
                    curve,
                    tubularSegments,
                    finalThickness,
                    radialSegments,
                    false
                );

                const material = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.4,
                    wireframe: true
                });

                const mesh = new THREE.Mesh(tubeGeometry, material);
                this.scene.add(mesh);

                this.previewEdges.push({
                    mesh,
                    curve,
                    otherPos,
                    isSource,
                    tubularSegments,
                    radialSegments,
                    finalThickness
                });
            }
        });
    }

    /**
     * Aktualisiert die Position der Preview-Kanten
     */
    private updatePreviewEdges() {
        if (!this.previewEdges || this.previewEdges.length === 0) return;

        const state = this.stateManager.state;
        const curveFactor = state.edgeCurveFactor !== undefined ? state.edgeCurveFactor : 0.15;

        this.previewEdges.forEach(item => {
            const startPos = item.isSource ? this.currentPosition : item.otherPos;
            const endPos = item.isSource ? item.otherPos : this.currentPosition;

            // Re-calculate the quadratic bezier curve
            const midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, 0.5);
            const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();

            let perpendicular = new THREE.Vector3(1, 0, 0).cross(direction);
            if (perpendicular.length() < 0.0001) {
                perpendicular.set(0, 1, 0).cross(direction);
            }
            perpendicular.normalize();

            const curveHeight = direction.length() * curveFactor;
            const controlPoint = midPoint.clone().add(perpendicular.multiplyScalar(curveHeight));

            item.curve.v0.copy(startPos);
            item.curve.v1.copy(controlPoint);
            item.curve.v2.copy(endPos);

            // Recreate geometry to update the tube path
            const newGeometry = new THREE.TubeGeometry(
                item.curve,
                item.tubularSegments,
                item.finalThickness,
                item.radialSegments,
                false
            );

            item.mesh.geometry.dispose();
            item.mesh.geometry = newGeometry;
        });
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
