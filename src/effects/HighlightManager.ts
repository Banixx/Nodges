import * as THREE from 'three';
import { StateManager } from '../core/StateManager';
import { GlowEffect } from './GlowEffect';
import { NodeManager } from '../core/NodeManager';
import { EdgeObjectsManager } from '../core/EdgeObjectsManager';

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
    private stateManager: StateManager;
    private glowEffect: GlowEffect;
    private scene: THREE.Scene;
    private nodeManager: NodeManager | null;
    private edgeObjectsManager: EdgeObjectsManager | null;

    private highlightRegistry: Map<THREE.Object3D, HighlightData>;
    private materialBackups: Map<THREE.Object3D, MaterialBackup>;

    // Highlight Types
    public readonly types = {
        HOVER: 'hover',
        SELECTION: 'selection',
        SEARCH: 'search',
        PATH: 'path',
        GROUP: 'group'
    };

    constructor(
        stateManager: StateManager,
        glowEffect: GlowEffect,
        scene: THREE.Scene,
        nodeManager: NodeManager | null = null,
        edgeObjectsManager: EdgeObjectsManager | null = null
    ) {
        this.stateManager = stateManager;
        this.glowEffect = glowEffect;
        this.scene = scene;
        this.nodeManager = nodeManager;
        this.edgeObjectsManager = edgeObjectsManager;

        // Registry
        this.highlightRegistry = new Map();
        this.materialBackups = new Map();

        // State subscription
        this.stateManager.subscribe(this.handleStateChange.bind(this), 'highlight');
    }

    handleStateChange(state: any) {
        this.updateHighlights(state);
    }

    updateHighlights(state: any) {
        const { hoveredObject, selectedObject, selectedObjects } = state;

        // Cleanup unused highlights
        this.cleanupUnusedHighlights(hoveredObject, selectedObject, selectedObjects);

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
                toRemove.push(object);
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
            if (edge.userData.color) {
                outlineColor = edge.userData.color;
            } else if (edge.userData.edge && edge.userData.edge.color) {
                outlineColor = edge.userData.edge.color;
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

    addNodeOutline(object: THREE.Object3D) {
        if (!object || !object.userData || !object.userData.nodeData) return;
        if (object.userData.outline) return;

        const nodeData = object.userData.nodeData;
        const size = (nodeData.val || 1) * (nodeData.scale || 1);
        const visualScale = size * 0.5;
        const outlineScale = visualScale * 1.4;

        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            depthWrite: false,
            emissive: new THREE.Color(0x000000),
            emissiveIntensity: 0
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
            color: material.color.clone(),
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

    applyHoverEffect(object: THREE.Object3D, _options: any = {}) {
        if (!object) return;

        if (object.userData.type === 'node') {
            if (this.nodeManager && object.userData.nodeData) {
                const nodeId = object.userData.nodeData.id;
                const color = new THREE.Color(0x5dade2); // Lighter blue
                this.nodeManager.setNodeColor(String(nodeId), color.getHex());
            }
            this.addNodeOutline(object);
        } else if (object.userData.type === 'edge') {
            this.addEdgeOutline(object);

            if (this.edgeObjectsManager && object.userData.connectionKey) {
                const relatedEdges = this.edgeObjectsManager.getRelatedEdges(object.userData.connectionKey);
                relatedEdges.forEach((edgeInfo: any) => {
                    if (edgeInfo.type === 'curved' && edgeInfo.edgeObj && edgeInfo.edgeObj.tube) {
                        const curvedEdgeProxy = edgeInfo.edgeObj.tube;
                        if (curvedEdgeProxy.userData && !curvedEdgeProxy.userData.outline) {
                            this.addEdgeOutline(curvedEdgeProxy);
                        }
                    }
                });
            }
        }
    }

    applySelectionEffect(object: THREE.Object3D, _options: any = {}) {
        this.glowEffect.applySelectionGlow(object);

        if (object.userData.type === 'node') {
            this.addNodeOutline(object);

            // If the node object has no material (it's a proxy for an instanced node),
            // apply the selection glow directly to the outline mesh instead
            if (!(object as any).material && object.userData.outline) {
                this.glowEffect.applySelectionGlow(object.userData.outline);
            }
        } else if (object.userData.type === 'edge') {
            this.addEdgeOutline(object, { color: 0x00ff00, isSelection: true });
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
        this.materialBackups.clear();
    }
}
