import * as THREE from 'three';

export class EdgeLabelManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.labels = new Map(); // Map von Edge-IDs zu Label-Objekten
        this.labelGroup = new THREE.Group();
        this.labelGroup.name = 'edgeLabels';
        this.scene.add(this.labelGroup);
        
        // Konfiguration
        this.config = {
            fontSize: 0.3,
            color: 0x000000,
            backgroundColor: 0xffffff,
            backgroundOpacity: 0.7,
            padding: 0.05,
            visible: true,
            alwaysVisible: false,
            distanceThreshold: 15 // Maximale Entfernung für Sichtbarkeit
        };
        
        // Bind update method to use in animation loop
        this.update = this.update.bind(this);
    }
    
    /**
     * Erstellt oder aktualisiert ein Label für eine Kante
     * @param {Edge} edge - Die Kante, für die ein Label erstellt werden soll
     * @param {string} text - Der anzuzeigende Text
     */
    createOrUpdateLabel(edge, text) {
        if (!edge || !edge.line || !text) return;
        
        const edgeId = edge.line.id;
        
        // Wenn bereits ein Label für diese Kante existiert, entferne es
        if (this.labels.has(edgeId)) {
            this.removeLabel(edgeId);
        }
        
        // Erstelle ein Canvas für das Label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Setze die Größe des Canvas
        const fontSize = 24;
        context.font = `${fontSize}px Arial`;
        const textWidth = context.measureText(text).width;
        const padding = 8;
        canvas.width = textWidth + padding * 2;
        canvas.height = fontSize + padding * 2;
        
        // Zeichne den Hintergrund
        context.fillStyle = `rgba(255, 255, 255, ${this.config.backgroundOpacity})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Zeichne den Text
        context.font = `${fontSize}px Arial`;
        context.fillStyle = '#000000';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Erstelle eine Textur aus dem Canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        // Erstelle ein Material mit der Textur
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        
        // Erstelle ein Sprite mit dem Material
        const sprite = new THREE.Sprite(material);
        
        // Skaliere das Sprite basierend auf der Textgröße
        const scale = this.config.fontSize;
        sprite.scale.set(scale * canvas.width / fontSize, scale, 1);
        
        // Positioniere das Sprite in der Mitte der Kante
        this.updateLabelPosition(sprite, edge);
        
        // Füge das Sprite zur Szene hinzu
        this.labelGroup.add(sprite);
        
        // Speichere das Label in der Map
        this.labels.set(edgeId, {
            sprite: sprite,
            edge: edge,
            text: text
        });
        
        return sprite;
    }
    
    /**
     * Aktualisiert die Position eines Labels basierend auf der Kantenposition
     * @param {THREE.Sprite} sprite - Das Label-Sprite
     * @param {Edge} edge - Die zugehörige Kante
     */
    updateLabelPosition(sprite, edge) {
        if (!sprite || !edge || !edge.line) return;
        
        // Berechne die Position in der Mitte der Kante
        const startPos = edge.startNode.mesh.position;
        const endPos = edge.endNode.mesh.position;
        
        // Mittelpunkt der Kante
        const midPoint = new THREE.Vector3(
            (startPos.x + endPos.x) / 2,
            (startPos.y + endPos.y) / 2,
            (startPos.z + endPos.z) / 2
        );
        
        // Berücksichtige den Offset der Kante
        if (edge.options && edge.options.offset !== 0) {
            const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
            const offsetDirection = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
            midPoint.addScaledVector(offsetDirection, edge.options.offset);
            
            // Füge etwas Höhe hinzu, damit das Label über der Kante schwebt
            midPoint.y += 0.5;
        }
        
        // Setze die Position des Sprites
        sprite.position.copy(midPoint);
    }
    
    /**
     * Entfernt ein Label basierend auf der Kanten-ID
     * @param {number} edgeId - Die ID der Kante
     */
    removeLabel(edgeId) {
        if (!this.labels.has(edgeId)) return;
        
        const label = this.labels.get(edgeId);
        this.labelGroup.remove(label.sprite);
        
        // Bereinige die Ressourcen
        if (label.sprite.material) {
            if (label.sprite.material.map) {
                label.sprite.material.map.dispose();
            }
            label.sprite.material.dispose();
        }
        
        this.labels.delete(edgeId);
    }
    
    /**
     * Entfernt alle Labels
     */
    removeAllLabels() {
        this.labels.forEach((label, edgeId) => {
            this.removeLabel(edgeId);
        });
    }
    
    /**
     * Aktualisiert die Sichtbarkeit und Position aller Labels
     * Sollte im Animation-Loop aufgerufen werden
     */
    update() {
        if (!this.config.visible) {
            this.labelGroup.visible = false;
            return;
        }
        
        this.labelGroup.visible = true;
        
        // Aktualisiere jedes Label
        this.labels.forEach((label, edgeId) => {
            // Aktualisiere die Position
            this.updateLabelPosition(label.sprite, label.edge);
            
            // Bestimme die Sichtbarkeit basierend auf der Entfernung zur Kamera
            if (!this.config.alwaysVisible) {
                const distance = this.camera.position.distanceTo(label.sprite.position);
                label.sprite.visible = distance < this.config.distanceThreshold;
            } else {
                label.sprite.visible = true;
            }
            
            // Drehe das Sprite zur Kamera
            label.sprite.quaternion.copy(this.camera.quaternion);
        });
    }
    
    /**
     * Aktualisiert die Konfiguration des Label-Managers
     * @param {Object} config - Neue Konfigurationseinstellungen
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        
        // Aktualisiere alle Labels, wenn sich die Konfiguration ändert
        if (config.fontSize || config.color || config.backgroundColor || config.backgroundOpacity) {
            this.refreshAllLabels();
        }
    }
    
    /**
     * Aktualisiert alle Labels mit den aktuellen Einstellungen
     */
    refreshAllLabels() {
        const labelsToRefresh = [];
        
        // Sammle alle Label-Informationen
        this.labels.forEach((label, edgeId) => {
            labelsToRefresh.push({
                edge: label.edge,
                text: label.text
            });
        });
        
        // Entferne alle Labels
        this.removeAllLabels();
        
        // Erstelle die Labels neu
        labelsToRefresh.forEach(item => {
            this.createOrUpdateLabel(item.edge, item.text);
        });
    }
    
    /**
     * Erstellt Labels für alle Kanten im Netzwerk
     * @param {Array} edges - Array von Kanten-Objekten
     */
    createLabelsForAllEdges(edges) {
        // Entferne zuerst alle vorhandenen Labels
        this.removeAllLabels();
        
        // Erstelle neue Labels für alle Kanten
        edges.forEach(edge => {
            if (edge && edge.line) {
                // Bestimme den anzuzeigenden Text
                let labelText = edge.name;
                
                // Wenn kein Name vorhanden ist, verwende andere Eigenschaften
                if (!labelText && edge.metadata) {
                    if (edge.metadata.type) {
                        labelText = edge.metadata.type;
                    } else if (edge.metadata.name) {
                        labelText = edge.metadata.name;
                    }
                }
                
                // Fallback, wenn kein Text gefunden wurde
                if (!labelText) {
                    labelText = `Edge ${edge.line.id}`;
                }
                
                this.createOrUpdateLabel(edge, labelText);
            }
        });
    }
}