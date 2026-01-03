import * as THREE from 'three';
import { EntityData, RelationshipData } from '../types';
import { VisualMappingEngine } from './VisualMappingEngine';
import { StateManager } from './StateManager';

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
    };
    updatePositions: (startPos: THREE.Vector3, endPos: THREE.Vector3) => void;
    dispose: () => void;
}

export class EdgeObjectsManager {
    private scene: THREE.Scene;
    private visualMappingEngine: VisualMappingEngine;
    private stateManager: StateManager;
    private edges: EdgeObject[] = [];
    private animatedEdges: {
        baseColor: THREE.Color;
        pulse: any;
        obj: EdgeObject;
    }[] = [];

    // Map connection key to all edge objects with that connection
    private connectionToEdges: Map<string, EdgeObject[]>;

    constructor(scene: THREE.Scene, visualMappingEngine: VisualMappingEngine, stateManager: StateManager) {
        this.scene = scene;
        this.visualMappingEngine = visualMappingEngine;
        this.stateManager = stateManager;
        this.connectionToEdges = new Map();
    }

    public updateEdges(edges: RelationshipData[], nodes: EntityData[]) {
        // 1. Clear existing
        this.dispose();

        // 2. Map nodes for fast lookup
        const nodeMap = new Map<string | number, EntityData>();
        nodes.forEach(node => nodeMap.set(node.id, node));

        // 3. Group edges by connection (start-end) to identify duplicates
        const connectionMap = new Map<string, RelationshipData[]>();

        edges.forEach((edge: any) => {
            const s = edge.source !== undefined ? edge.source : edge.start;
            const t = edge.target !== undefined ? edge.target : edge.end;

            const start = s < t ? s : t;
            const end = s < t ? t : s;
            const key = `${start}-${end}`;

            if (!connectionMap.has(key)) {
                connectionMap.set(key, []);
            }
            connectionMap.get(key)!.push(edge);
        });

        // 4. Render all edges as curved
        connectionMap.forEach((group, connectionKey) => {
            group.forEach((edgeData: any, index) => {
                const s = edgeData.source !== undefined ? edgeData.source : edgeData.start;
                const t = edgeData.target !== undefined ? edgeData.target : edgeData.end;

                const startNode = nodeMap.get(s);
                const endNode = nodeMap.get(t);

                if (startNode && endNode) {
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

                    // Create curved edge mesh
                    const edgeObj = this.createEdgeMesh(
                        new THREE.Vector3(startPos.x, startPos.y, startPos.z),
                        new THREE.Vector3(endPos.x, endPos.y, endPos.z),
                        {
                            index: index,
                            totalEdges: group.length,
                            color: colorHex,
                            start: s,
                            end: t
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
                    if (typeof visual.opacity === 'number' && visual.opacity < 1) {
                        (edgeObj.tube.material as THREE.MeshPhongMaterial).transparent = true;
                        (edgeObj.tube.material as THREE.MeshPhongMaterial).opacity = visual.opacity;
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

                    this.scene.add(edgeObj.tube);
                    this.edges.push(edgeObj);
                }
            });
        });
    }

    public updateEdgePositions(nodes: EntityData[]) {
        const nodeMap = new Map<string | number, EntityData>();
        nodes.forEach(node => nodeMap.set(node.id, node));

        this.edges.forEach(edgeObj => {
            const startNode = nodeMap.get(edgeObj.options.start);
            const endNode = nodeMap.get(edgeObj.options.end);

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

        // TubeGeometry entlang der Kurve
        const tubeGeometry = new THREE.TubeGeometry(
            curve,
            state.edgeTubularSegments,    // tubularSegments
            state.edgeThickness,          // radius der Röhre
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
            side: THREE.DoubleSide
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
                end: options.end
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
                const newCurve = new THREE.QuadraticBezierCurve3(newStartPos.clone(), newControlPoint, newEndPos.clone());
                const newGeometry = new THREE.TubeGeometry(
                    newCurve,
                    state.edgeTubularSegments,
                    state.edgeThickness,
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

    public getMeshes(): THREE.Object3D[] {
        return this.edges.map(edge => edge.tube);
    }

    // Get all edges with the same connection (for highlighting related edges)
    public getRelatedEdges(connectionKey: string): EdgeObject[] {
        return this.connectionToEdges.get(connectionKey) || [];
    }
}
