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
            distanceThreshold: 50,
            constantScreenSize: true,
            screenSizeScale: 0.005
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

        let text = String(entity.id);
        if (typeof entity.label === 'string') {
            text = entity.label;
        } else if (typeof entity.name === 'string') {
            text = entity.name;
        }

        // If label exists, remove it first
        if (this.labels.has(entityId)) {
            this.removeLabel(entityId);
        }

        // Create canvas for the label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        // Set canvas size
        const fontSize = 32;
        context.font = `${fontSize}px Arial`;
        const textMetrics = context.measureText(text);
        const textWidth = textMetrics.width;
        const padding = 12;
        canvas.width = textWidth + padding * 2;
        canvas.height = fontSize + padding * 2;

        // Draw background
        context.fillStyle = `rgba(0, 0, 0, ${this.config.backgroundOpacity})`;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text
        context.font = `${fontSize}px Arial`;
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create material
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

        // Create sprite
        const sprite = new THREE.Sprite(material);

        // Scale sprite based on text size
        const scale = this.config.fontSize;
        sprite.scale.set(scale * canvas.width / fontSize, scale, 1);

        // Position sprite above the node -- dynamischer Offset basierend auf Node-Groesse
        const effectiveRadius = nodeRadius !== undefined ? nodeRadius : 0.5;
        const labelOffset = effectiveRadius + 0.4;
        sprite.position.copy(position);
        sprite.position.y += labelOffset;

        // Speichere Canvas-Dimensionen und Offset fuer spaetere Updates
        sprite.userData.canvasWidth = canvas.width;
        sprite.userData.canvasFontSize = fontSize;
        sprite.userData.labelOffset = labelOffset;

        // Add sprite to group
        this.labelGroup.add(sprite);

        // Store label data
        this.labels.set(entityId, {
            sprite: sprite,
            entity: entity,
            text: text
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
        label.sprite.position.copy(position);
        label.sprite.position.y += labelOffset;
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

            // Check distance visibility
            if (!this.config.alwaysVisible) {
                const distance = this.camera.position.distanceTo(label.sprite.position);
                label.sprite.visible = distance < this.config.distanceThreshold;
            } else {
                label.sprite.visible = true;
            }

            if (label.sprite.visible) {
                label.sprite.material.opacity = layerOpacity;
                label.sprite.material.transparent = layerOpacity < 1.0;

                // Konstante Bildschirmgroesse: Skalierung proportional zur Kamera-Distanz
                if (this.config.constantScreenSize) {
                    const distance = this.camera.position.distanceTo(label.sprite.position);
                    const cw = label.sprite.userData.canvasWidth || 100;
                    const cf = label.sprite.userData.canvasFontSize || 32;
                    const s = this.config.screenSizeScale * distance;
                    label.sprite.scale.set(s * cw / cf, s, 1);
                }
            }

            // Face camera
            label.sprite.quaternion.copy(this.camera.quaternion);
        });
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
                position: label.sprite.position.clone()
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
