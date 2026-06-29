import * as THREE from 'three';
import { EntityData, RelationshipData } from '../types';
import { VisualMappingEngine } from './VisualMappingEngine';
import { IStateManager } from './interfaces';
import { ServiceContainer } from './di/ServiceContainer';

// Interface für Edge Objekte
interface EdgeObject {
    tube: THREE.Mesh;
    curve: THREE.QuadraticBezierCurve3;
    options: {
        index: number;
        totalEdges: number;
        color: number;
        start: string | number;
        end: string | number;
        thickness?: number;
    };
    updatePositions: (startPos: THREE.Vector3, endPos: THREE.Vector3) => void;
    dispose: () => void;
}

export class EdgeObjectsManager {
    private scene: THREE.Scene;
    private visualMappingEngine: VisualMappingEngine;
    private stateManager: IStateManager;
    private edges: EdgeObject[] = [];
    private animatedEdges: {
        baseColor: THREE.Color;
        pulse: any;
        obj: EdgeObject;
    }[] = [];

    // Map connection key to all edge objects with that connection
    private connectionToEdges: Map<string, EdgeObject[]>;

    constructor(container: ServiceContainer) {
        [this.scene, this.visualMappingEngine, this.stateManager] = 
            container.resolve<THREE.Scene, VisualMappingEngine, IStateManager>(
                'Scene', 'VisualMappingEngine', 'IStateManager'
            );
            
        this.connectionToEdges = new Map();

        // Reactive Rendering
        this.stateManager.subscribe(() => {
            this.updateEdges();
        }, 'data_changed');
    }

    public updateEdges(edges?: RelationshipData[], nodes?: EntityData[]) {
        const edgesToRender = edges || this.stateManager.getRelationships();
        const nodesToUse = nodes || this.stateManager.getEntities();

        // 1. Clear existing
        this.dispose();

        // 2. Map nodes for fast lookup
        const nodeMap = new Map<string, EntityData>();
        nodesToUse.forEach(node => nodeMap.set(String(node.id), node));

        // 3. Group edges by connection (start-end) to identify duplicates
        const connectionMap = new Map<string, RelationshipData[]>();

        const processEdge = (s: any, t: any, edgeData: any) => {
            if (s === undefined || t === undefined) return;
            const start = s < t ? s : t;
            const end = s < t ? t : s;
            const key = `${start}-${end}`;

            if (!connectionMap.has(key)) {
                connectionMap.set(key, []);
            }
            connectionMap.get(key)!.push({ ...edgeData, source: s, target: t });
        };

        edgesToRender.forEach((edge: any) => {
            if (edge.nodes && Array.isArray(edge.nodes)) {
                for (let i = 0; i < edge.nodes.length; i++) {
                    for (let j = i + 1; j < edge.nodes.length; j++) {
                        processEdge(edge.nodes[i], edge.nodes[j], edge);
                    }
                }
            } else {
                const s = edge.source !== undefined ? edge.source : edge.start;
                const t = edge.target !== undefined ? edge.target : edge.end;
                processEdge(s, t, edge);
            }
        });

        // 4. Render all edges as curved
        connectionMap.forEach((group, connectionKey) => {
            group.forEach((edgeData: any, index) => {
                const s = String(edgeData.source !== undefined ? edgeData.source : edgeData.start);
                const t = String(edgeData.target !== undefined ? edgeData.target : edgeData.end);

                const startNode = nodeMap.get(s);
                const endNode = nodeMap.get(t);

                if (startNode && endNode) {
                    // Layer Visibility Check
                    const state = this.stateManager.state;
                    const layeringAttr = state.layeringAttribute || 'layer';

                    // Start node layer
                    const startRawVal = startNode[layeringAttr];
                    const startNodeVal = startRawVal !== undefined ? String(startRawVal) : '';
                    let startLayer = 0;
                    if (startNodeVal === state.layer1Value) startLayer = 1;
                    else if (startNodeVal === state.layer2Value) startLayer = 2;
                    else if (startNodeVal === state.layer3Value) startLayer = 3;
                    else if (startNodeVal === state.layer4Value) startLayer = 4;

                    // End node layer
                    const endRawVal = endNode[layeringAttr];
                    const endNodeVal = endRawVal !== undefined ? String(endRawVal) : '';
                    let endLayer = 0;
                    if (endNodeVal === state.layer1Value) endLayer = 1;
                    else if (endNodeVal === state.layer2Value) endLayer = 2;
                    else if (endNodeVal === state.layer3Value) endLayer = 3;
                    else if (endNodeVal === state.layer4Value) endLayer = 4;

                    const isStartLayerVisible = startLayer === 0 || state[`layer${startLayer}Visible`] !== false;
                    const isEndLayerVisible = endLayer === 0 || state[`layer${endLayer}Visible`] !== false;

                    if (!isStartLayerVisible || !isEndLayerVisible) {
                        return; // Skip rendering this edge entirely
                    }

                    const startLayerOpacity = startLayer === 0 
                        ? 1.0 
                        : (state[`layer${startLayer}Opacity`] !== undefined ? Number(state[`layer${startLayer}Opacity`]) : 1.0);
                    const endLayerOpacity = endLayer === 0 
                        ? 1.0 
                        : (state[`layer${endLayer}Opacity`] !== undefined ? Number(state[`layer${endLayer}Opacity`]) : 1.0);
                    
                    const edgeOpacity = Math.min(startLayerOpacity, endLayerOpacity);
                    if (edgeOpacity === 0) {
                        return; // Skip rendering if opacity is 0
                    }

                    const startPos = this.getNodePosition(startNode);
                    const endPos = this.getNodePosition(endNode);

                    // Apply Visual Mapping
                    const visual = this.visualMappingEngine.applyToRelationship(edgeData as RelationshipData);

                    // Determine color: priority to visual mapping, then direct color property, then default
                    let colorHex = 0xaaaaaa;
                    let baseColor = new THREE.Color(0xaaaaaa);

                    const directColor = (edgeData as any).color || (edgeData as any).visualColor;
                    if (visual.color && visual.color instanceof THREE.Color && visual.color.getHex() !== 0xb498db) {
                        // Mapped color (different from default)
                        baseColor.copy(visual.color);
                        colorHex = baseColor.getHex();
                    } else if (directColor) {
                        // Direct color from JSON
                        baseColor.set(directColor);
                        colorHex = baseColor.getHex();
                    } else if (visual.color) {
                        // Default mapped color
                        if (visual.color instanceof THREE.Color) baseColor.copy(visual.color);
                        else baseColor.set(visual.color);
                        colorHex = baseColor.getHex();
                    }

                    const visualThickness = visual.thickness !== undefined ? visual.thickness : 1.0;

                    // Create curved edge mesh
                    const edgeObj = this.createEdgeMesh(
                        new THREE.Vector3(startPos.x, startPos.y, startPos.z),
                        new THREE.Vector3(endPos.x, endPos.y, endPos.z),
                        {
                            index: index,
                            totalEdges: group.length,
                            color: colorHex,
                            start: s,
                            end: t,
                            thickness: visualThickness
                        }
                    );

                    // Add metadata for interaction
                    edgeObj.tube.userData = {
                        type: 'edge',
                        edge: edgeData,
                        curve: edgeObj.curve,
                        start: startPos,
                        end: endPos,
                        color: colorHex,
                        connectionKey: connectionKey,
                        edgeData: edgeData,
                        visualColor: colorHex
                    };

                    // Opacity
                    const finalOpacity = (typeof visual.opacity === 'number' ? visual.opacity : 1.0) * edgeOpacity;
                    if (finalOpacity < 1.0) {
                        (edgeObj.tube.material as THREE.MeshPhongMaterial).transparent = true;
                        (edgeObj.tube.material as THREE.MeshPhongMaterial).opacity = finalOpacity;
                    }

                    // Animation Detection (Pulse)
                    // Priority: Explicit pulse object in data, then mapped animation/glow
                    let pulseAnim = (edgeData as any).pulse;
                    if (pulseAnim) {
                        if (typeof pulseAnim === 'object' && !pulseAnim.type) {
                            pulseAnim = { ...pulseAnim, type: 'pulse' };
                        }
                        console.log(`[Pulse] Found direct pulse for edge ${edgeData.id}`, pulseAnim);
                    } else {
                        const mappedAnim = visual.animation; // Removed visual.glow dependency
                        if (mappedAnim && typeof mappedAnim === 'object' && (mappedAnim.type === 'pulse')) {
                            pulseAnim = mappedAnim;
                        }
                    }

                    if (pulseAnim && (pulseAnim.type === 'pulse' || pulseAnim.frequency)) {
                        console.log(`[EdgeObjectsManager] Registering animated edge: ${edgeData.id || index}, type: ${pulseAnim.type}`);
                        this.animatedEdges.push({
                            baseColor: baseColor.clone(),
                            pulse: pulseAnim,
                            obj: edgeObj
                        });
                    }

                    // Add to connection map
                    if (!this.connectionToEdges.has(connectionKey)) {
                        this.connectionToEdges.set(connectionKey, []);
                    }
                    this.connectionToEdges.get(connectionKey)!.push(edgeObj);
                    edgeObj.tube.layers.enable(1); // Enable for minimap (Layer 1)
                    this.scene.add(edgeObj.tube);
                    this.edges.push(edgeObj);
                }
            });
        });
    }

    public updateEdgePositions(nodes: EntityData[]) {
        const nodeMap = new Map<string, EntityData>();
        nodes.forEach(node => nodeMap.set(String(node.id), node));

        this.edges.forEach(edgeObj => {
            const startNode = nodeMap.get(String(edgeObj.options.start));
            const endNode = nodeMap.get(String(edgeObj.options.end));

            if (startNode && endNode) {
                const startPos = this.getNodePosition(startNode);
                const endPos = this.getNodePosition(endNode);

                edgeObj.updatePositions(
                    new THREE.Vector3(startPos.x, startPos.y, startPos.z),
                    new THREE.Vector3(endPos.x, endPos.y, endPos.z)
                );
            }
        });
    }

    public animate() {
        if (this.animatedEdges.length === 0) return;

        const time = Date.now() * 0.001;
        const state = this.stateManager.state;
        const mode = state.edgeAnimationMode;

        const highlightColor = new THREE.Color(0xffffff);
        const tempColor = new THREE.Color();

        this.animatedEdges.forEach(item => {
            const mesh = item.obj.tube;
            if (!mesh || !mesh.geometry) return;

            const geometry = mesh.geometry as THREE.TubeGeometry;
            const colors = geometry.attributes.color;
            if (!colors) return;

            const tubularSegments = geometry.parameters.tubularSegments;
            const radialSegments = geometry.parameters.radialSegments;
            const vertexCount = colors.count;

            const baseFreq = item.pulse.frequency === 'heartbeat' ? 2.0 : (parseFloat(item.pulse.frequency) || 1.0);
            const freq = baseFreq * state.edgePulseSpeed;

            if (mode === 'pulse') {
                // Klassisches Pulsieren (Material-Farbe)
                const intensity = (Math.sin(time * freq * Math.PI) + 1) * 0.5;
                tempColor.copy(item.baseColor).lerp(highlightColor, intensity * 0.7);
                (mesh.material as THREE.MeshPhongMaterial).color.copy(tempColor);

                // Reset Vertex Colors falls vorher ein anderer Mode aktiv war
                if (colors.needsUpdate === false) {
                    for (let i = 0; i < vertexCount; i++) {
                        colors.setXYZ(i, 1, 1, 1); // Materialfarbe dominiert
                    }
                    colors.needsUpdate = true;
                }
            } else {
                // Vertex-basierte Animationen
                (mesh.material as THREE.MeshPhongMaterial).color.set(0xffffff); // Basis Weiß

                for (let t = 0; t <= tubularSegments; t++) {
                    let segmentIntensity = 0;
                    tempColor.copy(item.baseColor);

                    if (mode === 'sequential') {
                        // Welle: Phasenverschiebung pro Segment
                        const phase = (time * freq * Math.PI) - (t / tubularSegments * Math.PI * 4);
                        segmentIntensity = (Math.sin(phase) + 1) * 0.5;
                        tempColor.lerp(highlightColor, segmentIntensity * 0.9);
                    }
                    else if (mode === 'flow') {
                        // Lauflicht: Ein Paket wandert
                        const pos = (time * freq * 0.5) % 1.5 - 0.25; // 0..1 (mit Puffer)
                        const dist = Math.abs(t / tubularSegments - pos);
                        segmentIntensity = Math.max(0, 1 - dist * 4); // Scharfer Punkt
                        tempColor.lerp(highlightColor, segmentIntensity);
                    }
                    else if (mode === 'segments') {
                        // Bunte Segmente: Jedes Segment eine andere Farbe
                        const hue = (t / tubularSegments + time * freq * 0.1) % 1;
                        tempColor.setHSL(hue, 0.8, 0.5);
                        // Optionales Blinken
                        const pulse = (Math.sin(time * freq * Math.PI + t) + 1) * 0.5;
                        tempColor.lerp(highlightColor, pulse * 0.3);
                    }

                    // Wende Farbe auf alle Vertices dieses Rings an
                    for (let r = 0; r <= radialSegments; r++) {
                        const index = t * (radialSegments + 1) + r;
                        if (index < vertexCount) {
                            colors.setXYZ(index, tempColor.r, tempColor.g, tempColor.b);
                        }
                    }
                }
                colors.needsUpdate = true;
            }
        });
    }

    private getNodePosition(node: any): { x: number, y: number, z: number } {
        if (node.position) {
            return node.position;
        } else {
            return { x: node.x || 0, y: node.y || 0, z: node.z || 0 };
        }
    }

    /**
     * Erstellt ein gekrümmtes Kanten-Mesh
     * Die Kurve wird als QuadraticBezierCurve3 berechnet
     */
    private createEdgeMesh(
        startPosition: THREE.Vector3,
        endPosition: THREE.Vector3,
        options: {
            index: number;
            totalEdges: number;
            color: number;
            start: string | number;
            end: string | number;
            thickness?: number;
        }
    ): EdgeObject {
        // Berechne die Mitte der Verbindung
        const midPoint = new THREE.Vector3().lerpVectors(startPosition, endPosition, 0.5);

        // Berechne die Richtung der Verbindung
        const direction = new THREE.Vector3().subVectors(endPosition, startPosition).normalize();

        // Berechne senkrechte Richtung für den Bogen
        let perpendicular = new THREE.Vector3(1, 0, 0).cross(direction);
        if (perpendicular.length() < 0.0001) {
            perpendicular.set(0, 1, 0).cross(direction);
        }
        perpendicular.normalize();

        // Berücksichtige die Anzahl der Kanten zwischen den Knoten
        const totalEdges = options.totalEdges || 1;
        const edgeIndex = options.index || 0;

        if (totalEdges > 1) {
            const angle = (2 * Math.PI) / totalEdges;
            const rotationAxis = direction.clone().normalize();
            const rotationMatrix = new THREE.Matrix4().makeRotationAxis(rotationAxis, angle * edgeIndex);
            perpendicular.applyMatrix4(rotationMatrix);
        }

        // Höhe des Bogens basierend auf Kantenlänge und Index
        // Bei nur einer Edge: konfigurierbarer Faktor, bei mehreren: größere zur Unterscheidung
        const state = this.stateManager.state;
        const curveFactor = totalEdges === 1 ? state.edgeCurveFactor : (2.8 + (edgeIndex * 0.5));
        const curveHeight = direction.length() * curveFactor;
        const controlPoint = midPoint.clone().add(perpendicular.multiplyScalar(curveHeight));

        // Erstelle die Bezier-Kurve
        const curve = new THREE.QuadraticBezierCurve3(
            startPosition.clone(),
            controlPoint,
            endPosition.clone()
        );


        let tubularSegments = state.edgeTubularSegments;
        if (window.app && window.app.performanceMonitor) {
            tubularSegments = window.app.performanceMonitor.getRecommendedTubularSegments(tubularSegments);
        }

        const visualThickness = options.thickness !== undefined ? options.thickness : 1.0;
        const finalThickness = Math.pow(state.edgeThickness * visualThickness, state.visualScaleExponent) * state.visualScaleMultiplier;

        // TubeGeometry entlang der Kurve
        const tubeGeometry = new THREE.TubeGeometry(
            curve,
            tubularSegments,    // tubularSegments
            finalThickness,               // radius der Röhre
            state.edgeRadialSegments,     // radialSegments
            false                         // geschlossen?
        );

        // Initialisiere Vertex-Farben
        const count = tubeGeometry.attributes.position.count;
        const colors = new Float32Array(count * 3);
        const baseColor = new THREE.Color(options.color || 0xb498db);
        for (let i = 0; i < count; i++) {
            colors[i * 3] = baseColor.r;
            colors[i * 3 + 1] = baseColor.g;
            colors[i * 3 + 2] = baseColor.b;
        }
        tubeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Material mit Vertex-Farben Support
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff, // Basis-Multiplikator Weiß
            vertexColors: true,
            shininess: 30,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
        });

        material.userData = {
            originalColor: options.color || 0xb498db
        };

        const tube = new THREE.Mesh(tubeGeometry, material);
        tube.castShadow = true;
        tube.receiveShadow = true;

        // Erstelle das EdgeObject
        const edgeObject: EdgeObject = {
            tube,
            curve,
            options: {
                index: options.index,
                totalEdges: options.totalEdges,
                color: options.color,
                start: options.start,
                end: options.end,
                thickness: options.thickness
            },
            updatePositions: (newStartPos: THREE.Vector3, newEndPos: THREE.Vector3) => {
                // Berechne neue Kurve
                const newMidPoint = new THREE.Vector3().lerpVectors(newStartPos, newEndPos, 0.5);
                const newDirection = new THREE.Vector3().subVectors(newEndPos, newStartPos).normalize();

                let newPerpendicular = new THREE.Vector3(1, 0, 0).cross(newDirection);
                if (newPerpendicular.length() < 0.0001) {
                    newPerpendicular.set(0, 1, 0).cross(newDirection);
                }
                newPerpendicular.normalize();

                if (totalEdges > 1) {
                    const angle = (2 * Math.PI) / totalEdges;
                    const rotationAxis = newDirection.clone().normalize();
                    const rotationMatrix = new THREE.Matrix4().makeRotationAxis(rotationAxis, angle * edgeIndex);
                    newPerpendicular.applyMatrix4(rotationMatrix);
                }

                const newCurveHeight = newDirection.length() * (this.edges[0]?.options.totalEdges === 1 ? this.stateManager.state.edgeCurveFactor : (2.8 + (edgeIndex * 0.5)));
                const newControlPoint = newMidPoint.clone().add(newPerpendicular.multiplyScalar(newCurveHeight));

                const state = this.stateManager.state;
                let tubularSegments = state.edgeTubularSegments;
                if (window.app && window.app.performanceMonitor) {
                    tubularSegments = window.app.performanceMonitor.getRecommendedTubularSegments(tubularSegments);
                }

                const currentVisualThickness = options.thickness !== undefined ? options.thickness : 1.0;
                const currentFinalThickness = Math.pow(state.edgeThickness * currentVisualThickness, state.visualScaleExponent) * state.visualScaleMultiplier;

                const newCurve = new THREE.QuadraticBezierCurve3(newStartPos.clone(), newControlPoint, newEndPos.clone());
                const newGeometry = new THREE.TubeGeometry(
                    newCurve,
                    tubularSegments,
                    currentFinalThickness,
                    state.edgeRadialSegments,
                    false
                );

                // Initialisiere Vertex-Farben für neue Geometrie
                const count = newGeometry.attributes.position.count;
                const colors = new Float32Array(count * 3);
                const baseColor = (tube.material as any).userData?.originalColor ? new THREE.Color((tube.material as any).userData.originalColor) : new THREE.Color(0xaaaaaa);
                for (let i = 0; i < count; i++) {
                    colors[i * 3] = baseColor.r;
                    colors[i * 3 + 1] = baseColor.g;
                    colors[i * 3 + 2] = baseColor.b;
                }
                newGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

                tube.geometry.dispose();
                tube.geometry = newGeometry;

                // Aktualisiere die Kurven-Referenz in userData
                if (tube.userData) {
                    tube.userData.curve = newCurve;
                }
            },
            dispose: () => {
                tube.geometry.dispose();
                (tube.material as THREE.Material).dispose();
            }
        };

        return edgeObject;
    }

    public dispose() {
        this.edges.forEach(edge => {
            if (edge.tube) this.scene.remove(edge.tube);
            if (edge.dispose) edge.dispose();
        });
        this.edges = [];
        this.animatedEdges = [];
        this.connectionToEdges.clear();
    }

    public getEdges(): EdgeObject[] {
        return this.edges;
    }

    public getMeshes(): THREE.Object3D[] {
        return this.edges.map(edge => edge.tube);
    }

    // Get all edges with the same connection (for highlighting related edges)
    public getRelatedEdges(connectionKey: string): EdgeObject[] {
        return this.connectionToEdges.get(connectionKey) || [];
    }
}
