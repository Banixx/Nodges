import * as THREE from 'three';
// import { NodeObject } from '../types';

export interface LabelConfig {
    fontSize: number;
    color: number;
    backgroundColor: number;
    backgroundOpacity: number;
    padding: number;
    visible: boolean;
    alwaysVisible: boolean;
    distanceThreshold: number;
}

interface EdgeWithPosition {
    line?: THREE.Object3D;
    startNode: { mesh: THREE.Object3D };
    endNode: { mesh: THREE.Object3D };
    name?: string;
    metadata?: any;
    options?: {
        offset?: number;
    };
}

interface LabelData {
    sprite: THREE.Sprite;
    edge: EdgeWithPosition;
    text: string;
}

export class EdgeLabelManager {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private labels: Map<number, LabelData>; // Map from Edge ID (object id) to LabelData
    private labelGroup: THREE.Group;
    public config: LabelConfig;

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;
        this.labels = new Map();
        this.labelGroup = new THREE.Group();
        this.labelGroup.name = 'edgeLabels';
        this.scene.add(this.labelGroup);

        // Configuration
        this.config = {
            fontSize: 0.3,
            color: 0x000000,
            backgroundColor: 0xffffff,
            backgroundOpacity: 0.7,
            padding: 0.05,
            visible: true,
            alwaysVisible: false,
            distanceThreshold: 15
        };

        // Bind update method to use in animation loop
        this.update = this.update.bind(this);
    }

    /**
     * Create or update a label for an edge
     */
    createOrUpdateLabel(edge: EdgeWithPosition, text: string): THREE.Sprite | undefined {
        if (!edge || !edge.line || !text) return;

        const edgeId = edge.line.id;

        // If label exists, remove it first
        if (this.labels.has(edgeId)) {
            this.removeLabel(edgeId);
        }

        // Create canvas for the label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        // Set canvas size
        const fontSize = 24;
        context.font = `${fontSize}px Arial`;
        const textMetrics = context.measureText(text);
        const textWidth = textMetrics.width;
        const padding = 8;
        canvas.width = textWidth + padding * 2;
        canvas.height = fontSize + padding * 2;

        // Draw background
        context.fillStyle = `rgba(255, 255, 255, ${this.config.backgroundOpacity})`;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text
        context.font = `${fontSize}px Arial`;
        context.fillStyle = '#000000';
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

        // Position sprite
        this.updateLabelPosition(sprite, edge);

        // Add sprite to group
        this.labelGroup.add(sprite);

        // Store label logic
        this.labels.set(edgeId, {
            sprite: sprite,
            edge: edge,
            text: text
        });

        return sprite;
    }

    /**
     * Update label position based on edge position
     */
    updateLabelPosition(sprite: THREE.Sprite, edge: EdgeWithPosition) {
        if (!sprite || !edge || !edge.line) return;

        // Calculate midpoint
        const startPos = edge.startNode.mesh.position;
        const endPos = edge.endNode.mesh.position;

        const midPoint = new THREE.Vector3(
            (startPos.x + endPos.x) / 2,
            (startPos.y + endPos.y) / 2,
            (startPos.z + endPos.z) / 2
        );

        // Apply offset if exists
        if (edge.options && edge.options.offset && edge.options.offset !== 0) {
            const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
            // Calculate perpendicular vector for offset
            const offsetDirection = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
            midPoint.addScaledVector(offsetDirection, edge.options.offset);

            // Add some height
            midPoint.y += 0.5;
        }

        sprite.position.copy(midPoint);
    }

    /**
     * Remove label by edge ID
     */
    removeLabel(edgeId: number) {
        if (!this.labels.has(edgeId)) return;

        const label = this.labels.get(edgeId)!;
        this.labelGroup.remove(label.sprite);

        // Cleanup resources
        if (label.sprite.material) {
            if (label.sprite.material.map) {
                label.sprite.material.map.dispose();
            }
            label.sprite.material.dispose();
        }

        this.labels.delete(edgeId);
    }

    /**
     * Remove all labels
     */
    removeAllLabels() {
        // Create a copy of keys to iterate safely while deleting
        const edgeIds = Array.from(this.labels.keys());
        edgeIds.forEach(edgeId => {
            this.removeLabel(edgeId);
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

        // Update each label
        this.labels.forEach((label) => {
            // Update position
            this.updateLabelPosition(label.sprite, label.edge);

            // Check distance visibility
            if (!this.config.alwaysVisible) {
                const distance = this.camera.position.distanceTo(label.sprite.position);
                label.sprite.visible = distance < this.config.distanceThreshold;
            } else {
                label.sprite.visible = true;
            }

            // Face camera
            label.sprite.quaternion.copy(this.camera.quaternion);
        });
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<LabelConfig>) {
        this.config = { ...this.config, ...config };

        // attributes triggering redraw
        if (config.fontSize || config.color || config.backgroundColor || config.backgroundOpacity) {
            this.refreshAllLabels();
        }
    }

    /**
     * Refresh all labels
     */
    refreshAllLabels() {
        const labelsToRefresh: { edge: EdgeWithPosition, text: string }[] = [];

        this.labels.forEach((label) => {
            labelsToRefresh.push({
                edge: label.edge,
                text: label.text
            });
        });

        this.removeAllLabels();

        labelsToRefresh.forEach(item => {
            this.createOrUpdateLabel(item.edge, item.text);
        });
    }

    /**
     * Create labels for all edges
     */
    createLabelsForAllEdges(edges: EdgeWithPosition[]) {
        this.removeAllLabels();

        edges.forEach(edge => {
            if (edge && edge.line) {
                let labelText = edge.name;

                if (!labelText && edge.metadata) {
                    if (edge.metadata.type) {
                        labelText = edge.metadata.type;
                    } else if (edge.metadata.name) {
                        labelText = edge.metadata.name;
                    }
                }

                if (!labelText) {
                    labelText = `Edge ${edge.line.id}`;
                }

                this.createOrUpdateLabel(edge, labelText);
            }
        });
    }
}
