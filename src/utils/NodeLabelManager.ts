import * as THREE from 'three';
import { EntityData } from '../types';
import { ServiceContainer } from '../core/di/ServiceContainer';

export interface NodeLabelConfig {
    fontSize: number;
    color: number;
    backgroundColor: number;
    backgroundOpacity: number;
    padding: number;
    visible: boolean;
    alwaysVisible: boolean;
    distanceThreshold: number;
    constantScreenSize: boolean;
    screenSizeScale: number;
}

interface LabelData {
    sprite: THREE.Sprite;
    entity: EntityData;
    text: string;
}

export class NodeLabelManager {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private labels: Map<string, LabelData>; // Map from Entity ID to LabelData
    private labelGroup: THREE.Group;
    public config: NodeLabelConfig;

    // Hilfsvektoren zur performanten Berechnung der dynamischen Positionen
    private tempPos = new THREE.Vector3();
    private cameraRight = new THREE.Vector3();
    private cameraUp = new THREE.Vector3();
    private dirToCamera = new THREE.Vector3();

    constructor(container: ServiceContainer) {
        const [scene, camera] = 
            container.resolve<THREE.Scene, THREE.Camera>(
                'Scene', 'Camera'
            );
            
        this.scene = scene;
        this.camera = camera;
        this.labels = new Map();
        this.labelGroup = new THREE.Group();
        this.labelGroup.name = 'nodeLabels';
        this.scene.add(this.labelGroup);

        // Configuration
        this.config = {
            fontSize: 0.5,
            color: 0xffffff,
            backgroundColor: 0x000000,
            backgroundOpacity: 0.7,
            padding: 0.1,
            visible: true,
            alwaysVisible: false,
            distanceThreshold: 35, // Niedriger, damit Labels bei weitem Abstand ausgeblendet werden
            constantScreenSize: true, // Wieder aktiviert!
            screenSizeScale: 0.025 // Erhoeht (von 0.015), damit sie beim Heranzoomen gross genug sind
        };

        // Bind update method to use in animation loop
        this.update = this.update.bind(this);
    }

    /**
     * Create or update a label for a node
     */
    createOrUpdateLabel(entity: EntityData, position: THREE.Vector3, nodeRadius?: number): THREE.Sprite | undefined {
        if (!entity || !entity.id) return;

        const entityId = String(entity.id);

        let mainText = String(entity.id);
        if (typeof entity.label === 'string') {
            mainText = entity.label;
        } else if (typeof entity.name === 'string') {
            mainText = entity.name;
        }

        // Hole den aktuellen State für labelLines
        const state = (window as any).app?.stateManager?.state;
        const labelLines = state?.labelLines !== undefined ? state.labelLines : 1;
        const maxSubTexts = Math.max(0, labelLines - 1);

        // Finde interessante Attribute fuer den Untertitel
        const subTexts: string[] = [];
        if (maxSubTexts > 0) {
            const skipKeys = ['id', 'label', 'name', 'type', 'position', 'fx', 'fy', 'fz', 'vx', 'vy', 'vz', 'index', 'color', 'size', 'layer', 'width', 'height', 'depth'];
            
            // Typ immer als erstes
            if (entity.type && typeof entity.type === 'string' && subTexts.length < maxSubTexts) {
                subTexts.push(`[${entity.type}]`);
            }

            for (const key in entity) {
                if (subTexts.length >= maxSubTexts) break;
                if (!skipKeys.includes(key) && typeof entity[key] !== 'object' && typeof entity[key] !== 'function') {
                    const val = entity[key];
                    const valStr = String(val).length > 20 ? String(val).substring(0, 20) + '...' : String(val);
                    subTexts.push(`${key}: ${valStr}`);
                }
            }
        }

        // If label exists, remove it first
        if (this.labels.has(entityId)) {
            this.removeLabel(entityId);
        }

        // Create canvas for the label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        // Settings for text
        const fontSize = 32;
        const subFontSize = 20;
        const padding = 16;
        const lineSpacing = 8;
        
        // Berechne maximale Breite
        context.font = `bold ${fontSize}px Arial`;
        let maxTextWidth = context.measureText(mainText).width;

        context.font = `${subFontSize}px Arial`;
        subTexts.forEach(sub => {
            const width = context.measureText(sub).width;
            if (width > maxTextWidth) maxTextWidth = width;
        });

        // Setze Canvas Groesse
        canvas.width = maxTextWidth + padding * 2;
        canvas.height = padding * 2 + fontSize + (subTexts.length > 0 ? lineSpacing + subTexts.length * (subFontSize + lineSpacing) : 0);

        // Draw background
        context.fillStyle = `rgba(0, 0, 0, ${this.config.backgroundOpacity})`;
        if (typeof context.roundRect === 'function') {
            context.beginPath();
            context.roundRect(0, 0, canvas.width, canvas.height, 8);
            context.fill();
        } else {
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw main text
        context.textAlign = 'center';
        context.textBaseline = 'top';
        let currentY = padding;
        
        context.font = `bold ${fontSize}px Arial`;
        context.fillStyle = '#ffffff';
        context.fillText(mainText, canvas.width / 2, currentY);
        currentY += fontSize + lineSpacing;

        // Draw subtexts
        context.font = `${subFontSize}px Arial`;
        context.fillStyle = '#b0bec5'; // hellgrau/blau
        subTexts.forEach(sub => {
            context.fillText(sub, canvas.width / 2, currentY);
            currentY += subFontSize + lineSpacing;
        });

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create material
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });

        // Create sprite
        const sprite = new THREE.Sprite(material);
        sprite.renderOrder = 999;

        // Scale sprite based on text size (verhindert vertikale Stauchung)
        const scale = this.config.fontSize;
        sprite.scale.set(scale * canvas.width / fontSize, scale * canvas.height / fontSize, 1);

        // Position sprite -- dynamischer Offset basierend auf Node-Groesse
        const effectiveRadius = nodeRadius !== undefined ? nodeRadius : 0.5;
        const labelOffset = effectiveRadius + 0.4;
        
        // Speichere Canvas-Dimensionen, Offset und Basis-Position fuer spaetere Updates
        sprite.userData.canvasWidth = canvas.width;
        sprite.userData.canvasHeight = canvas.height;
        sprite.userData.canvasFontSize = fontSize;
        sprite.userData.labelOffset = labelOffset;
        sprite.userData.basePosition = position.clone();

        // Initial Position (wird in update() noch exakt relativ zur Kamera ausgerichtet)
        sprite.position.copy(position);
        sprite.position.y += labelOffset;

        // Add sprite to group
        this.labelGroup.add(sprite);

        // Store label data
        this.labels.set(entityId, {
            sprite: sprite,
            entity: entity,
            text: mainText
        });

        return sprite;
    }

    /**
     * Update label position for an entity
     */
    updateLabelPosition(entityId: string, position: THREE.Vector3, nodeRadius?: number) {
        const label = this.labels.get(String(entityId));
        if (!label) return;

        const labelOffset = nodeRadius !== undefined ? (nodeRadius + 0.4) : (label.sprite.userData.labelOffset || 1.5);
        label.sprite.userData.labelOffset = labelOffset;
        
        if (label.sprite.userData.basePosition) {
            label.sprite.userData.basePosition.copy(position);
        } else {
            label.sprite.userData.basePosition = position.clone();
        }
    }

    /**
     * Remove label by entity ID
     */
    removeLabel(entityId: string) {
        const label = this.labels.get(String(entityId));
        if (!label) return;

        this.labelGroup.remove(label.sprite);

        // Cleanup resources
        if (label.sprite.material) {
            if (label.sprite.material.map) {
                label.sprite.material.map.dispose();
            }
            label.sprite.material.dispose();
        }

        this.labels.delete(String(entityId));
    }

    /**
     * Remove all labels
     */
    removeAllLabels() {
        const entityIds = Array.from(this.labels.keys());
        entityIds.forEach(entityId => {
            this.removeLabel(entityId);
        });
    }

    /**
     * Create labels for all entities
     */
    createLabelsForAllEntities(entities: EntityData[]) {
        this.removeAllLabels();

        entities.forEach(entity => {
            if (entity && entity.position) {
                const position = new THREE.Vector3(
                    entity.position.x || 0,
                    entity.position.y || 0,
                    entity.position.z || 0
                );
                this.createOrUpdateLabel(entity, position);
            }
        });
    }

    /**
     * Update visibility and orientation of all labels
     */
    update() {
        if (!this.config.visible) {
            this.labelGroup.visible = false;
            return;
        }

        this.labelGroup.visible = true;

        const state = (window as any).app?.stateManager?.state;
        const app = (window as any).app;
        const highlightedNeighborhoodNodes = app?.highlightManager?.currentNeighborhoodNodes;
        const hasSelection = state?.selectedObjects && state.selectedObjects.size === 1;

        // --- FILTER LOGIC ---
        const filterAttr = state?.labelFilterAttribute;
        const filterMode = state?.labelFilterMode || 'visibility';
        const filterThreshold = state?.labelFilterThreshold || 0;
        
        let minVal = Infinity;
        let maxVal = -Infinity;
        if (filterAttr) {
            this.labels.forEach((lbl) => {
                const val = lbl.entity[filterAttr];
                if (typeof val === 'number') {
                    if (val < minVal) minVal = val;
                    if (val > maxVal) maxVal = val;
                }
            });
        }

        const thresholdValue = filterAttr && minVal !== Infinity 
            ? minVal + (maxVal - minVal) * Math.pow(filterThreshold, 3) 
            : 0;

        let visibleCount = 0;
        const totalCount = this.labels.size;

        // Kamera-Vektoren einmal pro Frame ermitteln
        this.camera.matrixWorld.extractBasis(this.cameraRight, this.cameraUp, this.dirToCamera);

        // Update each label
        this.labels.forEach((label) => {
            const layeringAttr = state?.layeringAttribute || 'layer';
            const rawVal = label.entity[layeringAttr];
            const nodeVal = rawVal !== undefined ? String(rawVal) : '';

            let layerNum = 0;
            if (state) {
                if (nodeVal === state.layer1Value) layerNum = 1;
                else if (nodeVal === state.layer2Value) layerNum = 2;
                else if (nodeVal === state.layer3Value) layerNum = 3;
                else if (nodeVal === state.layer4Value) layerNum = 4;
            }

            const isLayerVisible = layerNum === 0 || (state ? state[`layer${layerNum}Visible`] !== false : true);
            const layerOpacity = layerNum === 0
                ? 1.0
                : (state ? (state[`layer${layerNum}Opacity`] !== undefined ? Number(state[`layer${layerNum}Opacity`]) : 1.0) : 1.0);

            if (!isLayerVisible || layerOpacity === 0) {
                label.sprite.visible = false;
                return;
            }

            const basePos = label.sprite.userData.basePosition || label.sprite.position;

            // Berechne Distanz zur Kamera
            const distance = this.camera.position.distanceTo(basePos);
            const isSmallNetwork = this.labels.size <= 50;

            // Sichtbarkeit und weiches Ausblenden (Fade-Out)
            let currentOpacity = layerOpacity;
            if (!this.config.alwaysVisible && !isSmallNetwork) {
                if (distance > this.config.distanceThreshold) {
                    label.sprite.visible = false;
                    return; // Label ist zu weit weg
                } else {
                    label.sprite.visible = true;
                    // Fade out in den letzten 15 Einheiten vor dem Threshold
                    const fadeStart = this.config.distanceThreshold - 15;
                    if (distance > fadeStart) {
                        const fadeFactor = 1.0 - ((distance - fadeStart) / 15);
                        currentOpacity *= Math.max(0, fadeFactor);
                    }
                }
            } else {
                label.sprite.visible = true;
            }

            // Neu: Labels ausblenden, wenn sie beim Selektieren verblassen sollen
            if (label.sprite.visible && hasSelection && highlightedNeighborhoodNodes) {
                if (!highlightedNeighborhoodNodes.has(String(label.entity.id))) {
                    label.sprite.visible = false;
                }
            }

            // Apply Data Filter
            let filterOpacityFactor = 1.0;
            let filterScaleFactor = 1.0;
            if (label.sprite.visible && filterAttr && minVal !== Infinity) {
                const val = label.entity[filterAttr];
                if (typeof val === 'number') {
                    if (filterMode === 'visibility') {
                        if (val < thresholdValue) label.sprite.visible = false;
                    } else if (filterMode === 'fade') {
                        if (val < thresholdValue) {
                            const range = thresholdValue - minVal;
                            filterOpacityFactor = range > 0 ? Math.max(0, (val - minVal) / range) : 0;
                            if (filterOpacityFactor <= 0.05) label.sprite.visible = false;
                        }
                    } else if (filterMode === 'size') {
                        if (val < thresholdValue) label.sprite.visible = false;
                        else {
                            const t = maxVal > thresholdValue ? (val - thresholdValue) / (maxVal - thresholdValue) : 0;
                            filterScaleFactor = 1.0 + t * 1.5; // Scales up to 2.5x
                        }
                    } else if (filterMode === 'glow') {
                        if (val < thresholdValue) label.sprite.visible = false;
                        else {
                            const t = maxVal > thresholdValue ? (val - thresholdValue) / (maxVal - thresholdValue) : 0;
                            label.sprite.material.color.setHSL(0.1, 1.0, 1.0 - t * 0.4); // Tint slightly orange
                            filterScaleFactor = 1.0 + t * 0.5;
                        }
                    }
                } else {
                    label.sprite.visible = false;
                }
            }
            
            if (filterMode !== 'glow') {
                label.sprite.material.color.setHex(0xffffff);
            }

            if (label.sprite.visible) {
                visibleCount++;
                label.sprite.material.opacity = currentOpacity * filterOpacityFactor;

                // Konstante Bildschirmgroesse: Skalierung proportional zur Kamera-Distanz
                let s = 1;
                if (this.config.constantScreenSize) {
                    const cw = label.sprite.userData.canvasWidth || 100;
                    const ch = label.sprite.userData.canvasHeight || 56;
                    const cf = label.sprite.userData.canvasFontSize || 32;
                    s = this.config.screenSizeScale * distance * filterScaleFactor;
                    label.sprite.scale.set(s * cw / cf, s * ch / cf, 1);
                } else {
                    label.sprite.scale.multiplyScalar(filterScaleFactor);
                }

                // Dynamische Positionierung exakt am Rand des Nodes (rechts oben von Kamera aus)
                if (label.sprite.userData.basePosition) {
                    this.tempPos.copy(label.sprite.userData.basePosition);
                    
                    // Der urspruengliche nodeRadius wurde als (labelOffset - 0.4) gespeichert
                    const baseOffset = label.sprite.userData.labelOffset || 0.9;
                    const nodeRadius = baseOffset - 0.4;
                    
                    // Padding skaliert mit Distanz, wird beim nahen Zoomen aber ueberproportional kleiner,
                    // damit die Labels optisch naeher an die Nodes ruecken.
                    const zoomFactor = Math.min(1.0, Math.max(0.1, distance / 30.0));
                    const padding = this.config.constantScreenSize ? (distance * 0.002 * zoomFactor) : 0.1;

                    // Die Dimensionen des Sprites im 3D-Raum
                    const labelWidthIn3D = label.sprite.scale.x;
                    const labelHeightIn3D = label.sprite.scale.y;
                    
                    // 0.707 ist cos(45deg) - genaue Kante des Kreises oben rechts
                    // Auch der label offset wird leicht mit dem zoomFactor reduziert
                    const offsetRight = (nodeRadius * 0.707) + padding + (labelWidthIn3D * 0.5 * zoomFactor);
                    const offsetUp = (nodeRadius * 0.707) + padding + (labelHeightIn3D * 0.5 * zoomFactor);

                    // Wende die Offsets auf die Kamera-Achsen an
                    this.tempPos.addScaledVector(this.cameraRight, offsetRight);
                    this.tempPos.addScaledVector(this.cameraUp, offsetUp);
                    
                    // Bewege etwas in Richtung Kamera (+Z Achse im Kamera-Space) damit es vor der Kugel liegt
                    this.tempPos.addScaledVector(this.dirToCamera, nodeRadius * 0.5);
                    
                    label.sprite.position.copy(this.tempPos);
                }
            }

            // Face camera
            label.sprite.quaternion.copy(this.camera.quaternion);
        });

        // Update UI counters if changed
        if (state && (state.visibleLabelsCount !== visibleCount || state.totalLabelsCount !== totalCount)) {
            const app = (window as any).app;
            if (app && app.stateManager) {
                app.stateManager.update({
                    visibleLabelsCount: visibleCount,
                    totalLabelsCount: totalCount
                });
            }
        }
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<NodeLabelConfig>) {
        this.config = { ...this.config, ...config };

        // Attributes triggering redraw
        if (config.fontSize || config.color || config.backgroundColor || config.backgroundOpacity) {
            this.refreshAllLabels();
        }
    }

    /**
     * Refresh all labels (recreate them)
     */
    refreshAllLabels() {
        const labelsToRefresh: { entity: EntityData, position: THREE.Vector3 }[] = [];

        this.labels.forEach((label) => {
            labelsToRefresh.push({
                entity: label.entity,
                position: label.sprite.userData.basePosition ? label.sprite.userData.basePosition.clone() : label.sprite.position.clone()
            });
        });

        this.removeAllLabels();

        labelsToRefresh.forEach(item => {
            this.createOrUpdateLabel(item.entity, item.position);
        });
    }

    /**
     * Set visibility for all labels
     */
    setVisible(visible: boolean) {
        this.config.visible = visible;
        this.labelGroup.visible = visible;
    }

    /**
     * Set always visible mode
     */
    setAlwaysVisible(alwaysVisible: boolean) {
        this.config.alwaysVisible = alwaysVisible;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.removeAllLabels();
        if (this.labelGroup.parent) {
            this.labelGroup.parent.remove(this.labelGroup);
        }
    }
}
