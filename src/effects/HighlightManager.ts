import * as THREE from 'three';
import { IStateManager } from '../core/interfaces';
import type { State } from '../core/StateManager';
import { GlowEffect } from './GlowEffect';
import { NodeManager } from '../core/NodeManager';
import { EdgeObjectsManager } from '../core/EdgeObjectsManager';
import { ServiceContainer } from '../core/di/ServiceContainer';

interface MaterialBackup {
    color: THREE.Color;
    emissive: THREE.Color | null;
    emissiveIntensity: number;
    opacity: number;
    transparent: boolean;
    wasShared: boolean;
}

interface HighlightData {
    type: string;
    object: THREE.Object3D;
    originalMaterial: MaterialBackup | null;
    options: any;
    timestamp: number;
}

export class HighlightManager {
    private stateManager: IStateManager;
    private glowEffect: GlowEffect;
    private scene: THREE.Scene;
    private nodeManager: NodeManager | null;
    private edgeObjectsManager: EdgeObjectsManager | null;

    private highlightRegistry: Map<THREE.Object3D, HighlightData>;
    private materialBackups: Map<THREE.Object3D, MaterialBackup>;
    private cleanupTimers: Map<THREE.Object3D, any>;

    // Performance: Track previous state to avoid unnecessary updates
    private previousHoveredObject: THREE.Object3D | null = null;
    private previousSelectedObject: THREE.Object3D | null = null;
    private previousSelectedObjectsSize: number = 0;

    private dimmedNodes: Set<string> = new Set();
    private dimmedEdges: Set<THREE.Object3D> = new Set();
    public currentNeighborhoodNodes: Set<string> = new Set();

    // Highlight Types
    public readonly types = {
        HOVER: 'hover',
        SELECTION: 'selection',
        SEARCH: 'search',
        PATH: 'path',
        GROUP: 'group'
    };

    constructor(container: ServiceContainer) {
        [this.stateManager, this.glowEffect, this.scene, this.nodeManager, this.edgeObjectsManager] = 
            container.resolve<IStateManager, GlowEffect, THREE.Scene, NodeManager, EdgeObjectsManager>(
                'IStateManager', 'GlowEffect', 'Scene', 'NodeManager', 'EdgeObjectsManager'
            );

        // Registry
        this.highlightRegistry = new Map();
        this.materialBackups = new Map();
        this.cleanupTimers = new Map();

        // State subscription
        this.stateManager.subscribe(this.handleStateChange.bind(this), 'highlight');
    }

    handleStateChange(state: State) {
        // Performance optimization: Only update if relevant state actually changed
        // This prevents expensive updates when only glowIntensity changes (every frame!)
        const hoveredChanged = state.hoveredObject !== this.previousHoveredObject;
        const selectedChanged = state.selectedObject !== this.previousSelectedObject;
        const selectedSetChanged = (state.selectedObjects?.size || 0) !== this.previousSelectedObjectsSize;

        if (!hoveredChanged && !selectedChanged && !selectedSetChanged) {
            return; // Nothing relevant changed, skip expensive update
        }

        // Update tracking
        this.previousHoveredObject = state.hoveredObject;
        this.previousSelectedObject = state.selectedObject;
        this.previousSelectedObjectsSize = state.selectedObjects?.size || 0;

        this.updateHighlights(state);
    }

    updateHighlights(state: State) {
        const { hoveredObject, selectedObject, selectedObjects } = state;

        // Cleanup unused highlights
        this.cleanupUnusedHighlights(hoveredObject, selectedObject, selectedObjects);

        // Clear previous dimming
        this.clearDimming();
        this.currentNeighborhoodNodes.clear();

        // Calculate neighborhood if a single object is selected
        if (selectedObjects && selectedObjects.size === 1) {
            const selected = Array.from(selectedObjects)[0];
            if (selected.userData.type === 'node' && selected.userData.nodeData) {
                const nodeId = String(selected.userData.nodeData.id);
                const neighborhood = this.findNeighborhood(nodeId);
                
                this.currentNeighborhoodNodes = neighborhood.nodes;

                // Apply hover effect to connected edges so they get an aura
                neighborhood.edges.forEach(edgeObj => {
                    this.applyHighlight(edgeObj.tube, this.types.HOVER);
                });

                // Dim others
                this.dimNonNeighborhood(neighborhood.nodes, neighborhood.edges);
            } else if (selected.userData.type === 'edge' && selected.userData.edgeData) {
                // If an edge is selected, just keep its start/end nodes in neighborhood
                const s = selected.userData.edgeData.source !== undefined ? selected.userData.edgeData.source : selected.userData.edgeData.start;
                const t = selected.userData.edgeData.target !== undefined ? selected.userData.edgeData.target : selected.userData.edgeData.end;
                
                const neighborhoodNodes = new Set<string>();
                neighborhoodNodes.add(String(s));
                neighborhoodNodes.add(String(t));
                this.currentNeighborhoodNodes = neighborhoodNodes;
                
                let edgeObjFromManager = null;
                if (this.edgeObjectsManager) {
                    const allEdges = this.edgeObjectsManager.getEdges();
                    edgeObjFromManager = allEdges.find(e => e.tube === selected);
                }
                const neighborhoodEdges = edgeObjFromManager ? [edgeObjFromManager] : [];
                this.dimNonNeighborhood(neighborhoodNodes, neighborhoodEdges);
            }
        }

        // Apply selection highlights
        if (selectedObjects && selectedObjects.size > 0) {
            selectedObjects.forEach((obj: THREE.Object3D) => {
                this.applyHighlight(obj, this.types.SELECTION);
            });
        }
        else if (selectedObject) {
            this.applyHighlight(selectedObject, this.types.SELECTION);
        }

        if (hoveredObject && !state.selectedObjects?.has(hoveredObject) && hoveredObject !== selectedObject) {
            this.applyHighlight(hoveredObject, this.types.HOVER);
        }
    }

    findNeighborhood(centerNodeId: string): { nodes: Set<string>, edges: any[] } {
        const nodes = new Set<string>();
        const edges: any[] = [];
        
        nodes.add(centerNodeId);
        
        const graphEdges = this.stateManager.state.graphData?.relationships || [];
        
        const connectedEdgeIds = new Set<string | number>();
        graphEdges.forEach(e => {
            const s = e.source !== undefined ? e.source : e.start;
            const t = e.target !== undefined ? e.target : e.end;
            if (String(s) === centerNodeId || String(t) === centerNodeId) {
                connectedEdgeIds.add(e.id);
                nodes.add(String(s));
                nodes.add(String(t));
            }
        });

        if (this.edgeObjectsManager) {
            const allEdges = this.edgeObjectsManager.getEdges();
            allEdges.forEach(edgeObj => {
                if (edgeObj.tube.userData.edgeData && connectedEdgeIds.has(edgeObj.tube.userData.edgeData.id)) {
                    edges.push(edgeObj);
                }
            });
        }
        
        return { nodes, edges };
    }

    dimNonNeighborhood(neighborhoodNodes: Set<string>, neighborhoodEdges: any[]) {
        const edgeTubes = new Set(neighborhoodEdges.map(e => e.tube));
        
        if (this.nodeManager) {
            const allNodes = this.stateManager.state.graphData?.entities || [];
            allNodes.forEach(node => {
                const id = String(node.id);
                if (!neighborhoodNodes.has(id)) {
                    this.nodeManager!.setNodeColor(id, 0x444444);
                    this.dimmedNodes.add(id);
                }
            });
        }
        
        if (this.edgeObjectsManager) {
            this.edgeObjectsManager.getEdges().forEach(edgeObj => {
                if (!edgeTubes.has(edgeObj.tube)) {
                    if ((edgeObj.tube as any).material) {
                        ((edgeObj.tube as any).material as THREE.MeshPhongMaterial).color.setHex(0x333333);
                        this.dimmedEdges.add(edgeObj.tube);
                    }
                }
            });
        }
    }

    clearDimming() {
        if (this.nodeManager) {
            this.dimmedNodes.forEach(id => {
                this.nodeManager!.resetNodeColor(id);
            });
        }
        this.dimmedNodes.clear();
        
        this.dimmedEdges.forEach(tube => {
            if ((tube as any).material) {
                ((tube as any).material as THREE.MeshPhongMaterial).color.setHex(0xffffff);
            }
        });
        this.dimmedEdges.clear();
    }

    cleanupUnusedHighlights(hoveredObject: THREE.Object3D | null, selectedObject: THREE.Object3D | null, selectedObjects: Set<THREE.Object3D> | null = null) {
        const toRemove: THREE.Object3D[] = [];

        for (const [object, highlightData] of this.highlightRegistry) {
            const isSelected = (object === selectedObject) || (selectedObjects && selectedObjects.has(object));

            const shouldKeep = (
                (object === hoveredObject && highlightData.type === this.types.HOVER) ||
                (isSelected && highlightData.type === this.types.SELECTION) ||
                (highlightData.type === this.types.SEARCH) ||
                (highlightData.type === this.types.PATH) ||
                (highlightData.type === this.types.GROUP)
            );

            if (!shouldKeep) {
                // Verzögere das Entfernen von Hover-Highlights (150ms).
                // Das überbrückt die Lücke (clickDelay = 100ms) zwischen "Mausklick beginnt" (hover-Verlust)
                // und der tatsächlichen Selektion. Verhindert ein kurzes Flackern auf die Originalfarbe.
                if (highlightData.type === this.types.HOVER) {
                    if (!this.cleanupTimers.has(object)) {
                        const timer = setTimeout(() => {
                            // Prüfe nach 150ms erneut, ob das Objekt gelöscht werden soll
                            const isStillHovered = this.stateManager.state.hoveredObject === object;
                            const isStillSelected = this.stateManager.state.selectedObject === object || (this.stateManager.state.selectedObjects && this.stateManager.state.selectedObjects.has(object));
                            
                            if (!isStillHovered && !isStillSelected) {
                                this.clearHighlight(object);
                            }
                            this.cleanupTimers.delete(object);
                        }, 150);
                        this.cleanupTimers.set(object, timer);
                    }
                } else {
                    toRemove.push(object);
                }
            } else {
                // Wenn das Objekt behalten werden soll, evtl. laufende Cleanup-Timer abbrechen
                if (this.cleanupTimers.has(object)) {
                    clearTimeout(this.cleanupTimers.get(object));
                    this.cleanupTimers.delete(object);
                }
            }
        }

        toRemove.forEach(object => this.clearHighlight(object));
    }

    /**
     * Unified Highlight Application
     */
    applyHighlight(object: THREE.Object3D, type: string, options: any = {}) {
        // Check if effects are enabled
        if (!this.stateManager.state.highlightEffectsEnabled) return;

        if (!object) return;
        // Allow objects without material if they are proxy objects (like edges)
        if (!(object as any).material && object.userData.type !== 'edge' && object.userData.type !== 'node') return;

        // Remove old highlight if exists
        this.clearHighlight(object);

        // Backup material (only if material exists)
        let originalMaterial: MaterialBackup | null = null;
        if ((object as any).material) {
            originalMaterial = this.backupMaterial(object);
        }

        // Create Highlight Data
        const highlightData: HighlightData = {
            type,
            object,
            originalMaterial,
            options,
            timestamp: performance.now()
        };

        // Register
        this.highlightRegistry.set(object, highlightData);

        // Apply visual effect
        this.applyVisualHighlight(highlightData);
    }

    /**
     * Legacy Compatibility Methods
     */
    highlightHoveredObject(object: THREE.Object3D) {
        this.applyHighlight(object, this.types.HOVER);
    }

    highlightSelectedObject(object: THREE.Object3D) {
        this.applyHighlight(object, this.types.SELECTION);
    }

    applyNodeHoverHighlight(_node: THREE.Object3D) {
        // Legacy unused
    }

    applyEdgeHoverHighlight(_edge: THREE.Object3D) {
        // Legacy unused
    }

    /**
     * Adds an outline to an edge
     */
    addEdgeOutline(edge: THREE.Object3D, options: any = {}) {
        if (!edge || !edge.userData) return;

        // Check if outline exists
        if (edge.userData.outline) {
            // If color changes (e.g. Hover -> Selection), remove old
            const outlineMesh = edge.userData.outline as THREE.Mesh;
            const mat = outlineMesh.material as THREE.MeshBasicMaterial;
            if (options.color && mat.color.getHex() !== options.color) {
                this.removeEdgeOutline(edge);
            } else {
                return; // Exists and color matches
            }
        }

        let curve: THREE.Curve<THREE.Vector3> | undefined;

        // Get curve from userData
        if (edge.userData.curve) {
            curve = edge.userData.curve;
        }
        else if (edge.userData.edge && edge.userData.edge.curve) {
            curve = edge.userData.edge.curve;
        }

        if (!curve) return; // No curve available

        // Get geometry parameters
        const edgeParams = (edge as any).geometry?.parameters;
        const state = this.stateManager?.state;

        const tubularSegments = edgeParams?.tubularSegments || state?.edgeTubularSegments || 40;
        const radialSegments = edgeParams?.radialSegments || state?.edgeRadialSegments || 8;
        const originalRadius = edgeParams?.radius || state?.edgeThickness || 0.1;

        // Highlight radius proportional to original
        const highlightPercent = state?.highlightThickness || 10;
        const selectionPercent = state?.selectionThickness || 20;

        let multiplier = 1 + highlightPercent / 100;
        if (options.isSelection) {
            multiplier *= (1 + selectionPercent / 100);
        }

        const highlightRadius = originalRadius * multiplier;

        const outlineGeometry = new THREE.TubeGeometry(
            curve,
            tubularSegments,
            highlightRadius,
            radialSegments,
            false
        );

        let outlineColor = options.color || 0x00aaff;

        if (!options.color) {
            // Standard-Hover-Farbe für Kanten (Hellblau statt Grau)
            outlineColor = options.isSelection ? 0x00ffff : 0x5dade2;
            
            // Wenn das Objekt eine eigene Farbe hat und es KEIN Standard-Hover ist, nutzen wir diese
            if (!options.isSelection && edge.userData.color && edge.userData.color !== 0x888888) {
                outlineColor = edge.userData.color;
            }
        }

        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: outlineColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });

        const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outlineMesh.userData = { type: 'edge_outline' };

        edge.userData.outline = outlineMesh;

        if (this.scene) {
            this.scene.add(outlineMesh);
        }
    }

    removeEdgeOutline(edge: THREE.Object3D) {
        if (!edge || !edge.userData) return;

        const outlineMesh = edge.userData.outline as THREE.Mesh;
        if (!outlineMesh) return;

        if (this.scene) {
            this.scene.remove(outlineMesh);
        } else if (outlineMesh.parent) {
            outlineMesh.parent.remove(outlineMesh);
        }

        if (outlineMesh.geometry) outlineMesh.geometry.dispose();
        if (outlineMesh.material) (outlineMesh.material as THREE.Material).dispose();

        delete edge.userData.outline;
    }

    addNodeOutline(object: THREE.Object3D, options: any = {}) {
        if (!object || !object.userData || !object.userData.nodeData) return;
        
        // Wenn Outline existiert, aber Typ (Hover vs Selection) sich ändert, neu erstellen
        if (object.userData.outline) {
            const mat = (object.userData.outline as THREE.Mesh).material as THREE.Material;
            // Wir nutzen die opacity als Indikator: Selection hat opacity > 0.6
            const isCurrentlySelection = mat.opacity > 0.6;
            if (isCurrentlySelection !== !!options.isSelection) {
                this.removeNodeOutline(object);
            } else {
                return;
            }
        }

        const nodeData = object.userData.nodeData;
        const size = (nodeData.val || 1) * (nodeData.scale || 1);
        const visualScale = size * 0.5;
        // Aura bei Selektion deutlich größer machen, damit sie erkennbar ist
        const outlineScale = options.isSelection ? visualScale * 1.8 : visualScale * 1.4;

        const geometry = new THREE.SphereGeometry(1, 16, 16);
        // MeshBasicMaterial reagiert nicht auf Licht, was das "Grau-Werden" im Schatten verhindert
        const material = new THREE.MeshBasicMaterial({
            color: options.isSelection ? 0x00ffff : 0x2980b9, // Cyan bei Klick, kräftiges Blau bei Hover
            transparent: true,
            opacity: options.isSelection ? 0.7 : 0.4, // Weniger transparent für bessere Sichtbarkeit
            depthWrite: false
        });
        
        const outlineMesh = new THREE.Mesh(geometry, material);
        outlineMesh.position.copy(object.position);
        outlineMesh.scale.set(outlineScale, outlineScale, outlineScale);
        outlineMesh.userData = { type: 'node_outline' };

        object.userData.outline = outlineMesh;

        if (this.scene) {
            this.scene.add(outlineMesh);
        }
    }

    removeNodeOutline(object: THREE.Object3D) {
        if (!object || !object.userData || !object.userData.outline) return;

        const outlineMesh = object.userData.outline as THREE.Mesh;

        if (this.scene) {
            this.scene.remove(outlineMesh);
        }

        if (outlineMesh.geometry) outlineMesh.geometry.dispose();
        if (outlineMesh.material) (outlineMesh.material as THREE.Material).dispose();

        delete object.userData.outline;
    }

    clearHighlight(object: THREE.Object3D) {
        const highlightData = this.highlightRegistry.get(object);
        if (!highlightData) return;

        // Remove special outline effect for edges
        if (object.userData.type === 'edge') {
            this.removeEdgeOutline(object);

            if (this.edgeObjectsManager && object.userData.connectionKey) {
                const relatedEdges = this.edgeObjectsManager.getRelatedEdges(object.userData.connectionKey);
                relatedEdges.forEach((edgeInfo: any) => {
                    if (edgeInfo.type === 'curved' && edgeInfo.edgeObj && edgeInfo.edgeObj.tube) {
                        const curvedEdgeProxy = edgeInfo.edgeObj.tube;
                        if (curvedEdgeProxy.userData && curvedEdgeProxy.userData.outline) {
                            this.removeEdgeOutline(curvedEdgeProxy);
                        }
                    }
                });
            }
        } else if (object.userData.type === 'node') {
            this.removeNodeOutline(object);
        }

        // Restore node color via NodeManager
        if (object.userData.type === 'node' && this.nodeManager && object.userData.nodeData) {
            const nodeId = object.userData.nodeData.id;
            this.nodeManager.resetNodeColor(String(nodeId));
        }

        // CRITICAL: Remove Glow FIRST
        this.glowEffect.removeGlow(object);

        // THEN Restore Material (restores original color/opacity)
        if (highlightData.originalMaterial) {
            this.restoreMaterial(object, highlightData.originalMaterial);
        }

        this.highlightRegistry.delete(object);
        
        // Timer aufräumen, falls einer lief
        if (this.cleanupTimers.has(object)) {
            clearTimeout(this.cleanupTimers.get(object));
            this.cleanupTimers.delete(object);
        }
    }

    removeHighlight(object: THREE.Object3D) {
        this.clearHighlight(object);
    }

    highlightPath(objects: THREE.Object3D[]) {
        objects.forEach(object => {
            // In TS conversion we handle highlighting directly
            // Legacy code checked `this.highlightedObjects.has(object)`
            // We can just apply the effect
            this.applyPathEffect(object);
        });
    }

    highlightGroup(objects: THREE.Object3D[], color: number) {
        objects.forEach(object => {
            this.applyGroupEffect(object, { color });
        });
    }

    backupMaterial(object: THREE.Object3D): MaterialBackup | null {
        if (!(object as any).material) return null;
        const material = (object as any).material;

        const materialIsShared = this.isMaterialShared(object);
        if (materialIsShared) {
            (object as any).material = material.clone();
        }

        const backup: MaterialBackup = {
            color: material.color ? material.color.clone() : new THREE.Color(),
            emissive: material.emissive ? material.emissive.clone() : null,
            emissiveIntensity: material.emissiveIntensity || 0,
            opacity: material.opacity || 1,
            transparent: material.transparent || false,
            wasShared: materialIsShared
        };

        this.materialBackups.set(object, backup);
        return backup;
    }

    isMaterialShared(object: THREE.Object3D): boolean {
        const material = (object as any).material;
        return material.userData && material.userData.cacheKey;
    }

    restoreMaterial(object: THREE.Object3D, backup: MaterialBackup) {
        if (!(object as any).material || !backup) return;

        const material = (object as any).material;

        material.color.copy(backup.color);
        if (backup.emissive && material.emissive) {
            material.emissive.copy(backup.emissive);
        }
        material.emissiveIntensity = backup.emissiveIntensity;
        material.opacity = backup.opacity;
        material.transparent = backup.transparent;

        // Restore original edge color from userData if it exists
        if (object.userData.type === 'edge' && material.userData && material.userData.originalColor) {
            material.color.setHex(material.userData.originalColor);
        }

        this.materialBackups.delete(object);
    }

    applyVisualHighlight(highlightData: HighlightData) {
        const { object, type, options } = highlightData;

        switch (type) {
            case this.types.HOVER:
                this.applyHoverEffect(object, options);
                break;
            case this.types.SELECTION:
                this.applySelectionEffect(object, options);
                break;
            case this.types.SEARCH:
                this.applySearchEffect(object, options);
                break;
            case this.types.PATH:
                this.applyPathEffect(object, options);
                break;
            case this.types.GROUP:
                this.applyGroupEffect(object, options);
                break;
        }
    }

    applyHoverEffect(object: THREE.Object3D, options: any = {}) {
        if (!object) return;

        if (object.userData.type === 'node') {
            if (this.nodeManager && object.userData.nodeData) {
                const nodeId = object.userData.nodeData.id;
                const color = new THREE.Color(0x5dade2); // Angenehmes Hellblau
                this.nodeManager.setNodeColor(String(nodeId), color.getHex());
            }
            this.addNodeOutline(object, { ...options, isSelection: false });
        } else if (object.userData.type === 'edge') {
            this.addEdgeOutline(object, { ...options, color: 0x5dade2, isSelection: false });

            if (this.edgeObjectsManager && object.userData.connectionKey) {
                const relatedEdges = this.edgeObjectsManager.getRelatedEdges(object.userData.connectionKey);
                relatedEdges.forEach((edgeInfo: any) => {
                    if (edgeInfo.type === 'curved' && edgeInfo.edgeObj && edgeInfo.edgeObj.tube) {
                        const curvedEdgeProxy = edgeInfo.edgeObj.tube;
                        if (curvedEdgeProxy.userData && !curvedEdgeProxy.userData.outline) {
                            this.addEdgeOutline(curvedEdgeProxy, { ...options, color: 0x5dade2, isSelection: false });
                        }
                    }
                });
            }
        }
    }

    applySelectionEffect(object: THREE.Object3D, options: any = {}) {
        this.glowEffect.applySelectionGlow(object);

        if (object.userData.type === 'node') {
            if (this.nodeManager && object.userData.nodeData) {
                const nodeId = object.userData.nodeData.id;
                const color = new THREE.Color(0x00ffff); // Cyan
                this.nodeManager.setNodeColor(String(nodeId), color.getHex());
            }
            this.addNodeOutline(object, { ...options, isSelection: true });

            // If the node object has no material (it's a proxy for an instanced node),
            // apply the selection glow directly to the outline mesh instead
            if (!(object as any).material && object.userData.outline) {
                this.glowEffect.applySelectionGlow(object.userData.outline);
            }
        } else if (object.userData.type === 'edge') {
            this.addEdgeOutline(object, { ...options, color: 0x00ffff, isSelection: true });
        }
    }

    applySearchEffect(object: THREE.Object3D, options: any = {}) {
        const color = options.color || 0xffff00;
        if ((object as any).material) {
            (object as any).material.color.setHex(color);
        }
        this.glowEffect.applyHighlightGlow(object);
    }

    applyPathEffect(object: THREE.Object3D, options: any = {}) {
        const color = options.color || 0x00ffff;
        if ((object as any).material) {
            (object as any).material.color.setHex(color);
        }
        this.glowEffect.applyHighlightGlow(object);
    }

    applyGroupEffect(object: THREE.Object3D, options: any = {}) {
        const color = options.color || 0xff00ff;
        if ((object as any).material) {
            (object as any).material.color.setHex(color);
        }
        this.glowEffect.applyHighlightGlow(object);
    }

    clearAllHighlights() {
        const objectsToRemove = Array.from(this.highlightRegistry.keys());
        objectsToRemove.forEach(object => this.clearHighlight(object));
    }

    getDebugInfo() {
        const typeCount: any = {};
        for (const [_, data] of this.highlightRegistry) {
            typeCount[data.type] = (typeCount[data.type] || 0) + 1;
        }

        return {
            totalHighlights: this.highlightRegistry.size,
            typeBreakdown: typeCount,
            materialBackups: this.materialBackups.size
        };
    }

    destroy() {
        this.clearAllHighlights();
        this.clearDimming();
        this.materialBackups.clear();
        this.cleanupTimers.forEach(timer => clearTimeout(timer));
        this.cleanupTimers.clear();
    }
}
