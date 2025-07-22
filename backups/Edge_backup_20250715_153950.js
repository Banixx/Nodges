import * as THREE from 'three';

export class Edge {
    // Statischer Cache nur für Geometrien (Materialien werden nicht mehr gecacht)
    static geometryCache = new Map();
    
    // Cache-Reset-Methode
    static clearCache() {
        Edge.geometryCache.clear();
        console.log('[CACHE] Edge geometry cache cleared');
    }

    constructor(startNode, endNode, options = {}) {
        this.startNode = startNode;
        this.endNode = endNode;
        
        // Adaptive Qualität basierend auf Netzwerkgrösse
        const adaptiveSettings = this.calculateAdaptiveSettings(options.totalEdges || 10);
        
        this.options = {
            color: options.color || 0x0000ff,
            style: options.style || 'solid', // solid, dashed, dotted, pulsing, flowing
            curveHeight: options.curveHeight || 2,
            offset: options.offset || 0,
            segments: options.segments || adaptiveSettings.segments,
            radius: options.radius || adaptiveSettings.radius,
            radialSegments: options.radialSegments || adaptiveSettings.radialSegments,
            dashSize: options.dashSize || 0.5,
            gapSize: 0.3,
            ...options
        };

        // Speichere den Namen der Kante
        this.name = options.name || `Edge ${startNode?.name || 'start'}-${endNode?.name || 'end'}`;
        
        // Erstelle die Linie
        this.line = this.createLine();
        this.line.userData.type = 'edge';
        this.line.userData.edge = this;
        this.line.name = this.name;
        this.line.glow = null;
        
        // Speichere Metadaten
        this.metadata = { ...options };
        this.line.metadata = this.metadata;
        
        // Animation properties
        this.animationPhase = 0;
        this.animationSpeed = options.animationSpeed || 1;
        
        // Deaktiviere Animationen bei grossen Netzwerken fuer Performance
        const totalEdges = options.totalEdges || 10;
        const allowAnimations = totalEdges <= 50; // Nur bei kleinen/mittleren Netzwerken
        
        this.animationActive = allowAnimations && (this.options.style === 'pulsing' || this.options.style === 'flowing');
    }

    // Berechnet adaptive Einstellungen basierend auf der Anzahl der Edges
    calculateAdaptiveSettings(totalEdges) {
        let segments, radius, radialSegments;
        
        if (totalEdges <= 10) {
            // Kleine Netzwerke: Hohe Qualität
            segments = 4;
            radius = 0.24;
            radialSegments = 3;
        } else if (totalEdges <= 50) {
            // Mittlere Netzwerke: Mittlere Qualität
            segments = 3;
            radius = 0.18;
            radialSegments = 3;
        } else if (totalEdges <= 200) {
            // Grosse Netzwerke: Reduzierte Qualität
            segments = 2;
            radius = 0.12;
            radialSegments = 3;
        } else {
            // Mega Netzwerke: Ultra-minimale Qualität für Performance
            segments = 1;
            radius = 0.06;
            radialSegments = 2;
        }
        
        console.log('Edge-Qualitaet fuer ' + totalEdges + ' Edges: segments=' + segments + ', radius=' + radius + ', radialSegments=' + radialSegments);
        
        return { segments, radius, radialSegments };
    }

    createLine() {
        const curve = this.createCurve();
        const geometry = this.createGeometry(curve);
        const material = this.createMaterial();
        
        const line = new THREE.Mesh(geometry, material);
        line.castShadow = true;
        line.receiveShadow = true;
        return line;
    }

    createCurve() {
        const start = this.startNode.mesh.position.clone();
        const end = this.endNode.mesh.position.clone();
    
        const midPoint = new THREE.Vector3(
            (start.x + end.x) / 2,
            (start.y + end.y) / 2 + this.options.curveHeight,
            (start.z + end.z) / 2
        );
    
        // Seitlichen Versatz hinzufügen
        if (this.options.offset !== 0) {
            const direction = new THREE.Vector3().subVectors(end, start).normalize();
            const offsetDirection = new THREE.Vector3(-direction.z, 0, direction.x).normalize(); // Senkrechte Richtung
            midPoint.addScaledVector(offsetDirection, this.options.offset);
        }
    
        return new THREE.QuadraticBezierCurve3(
            start,
            midPoint,
            end
        );
    }

    createGeometry(curve) {
        const segments = this.options.segments;
        const curveHeight = this.options.curveHeight;
        const offset = this.options.offset;
        const radius = this.options.radius || 0.5;
        const radialSegments = this.options.radialSegments || 3;
        
        // CACHE TEMPORAER DEAKTIVIERT - Jede Edge wird neu erstellt
        const geometry = new THREE.TubeGeometry(curve, segments, radius, radialSegments, false);
        return geometry;
        
        // Alter Cache-Code (deaktiviert):
        // const startId = this.startNode?.id || this.startNode?.mesh?.name || 'unknown';
        // const endId = this.endNode?.id || this.endNode?.mesh?.name || 'unknown';
        // const cacheKey = `curve-${startId}-${endId}-${segments}-${curveHeight}-${offset}-${radius}-${radialSegments}-${this.name}`;
        // if (Edge.geometryCache.has(cacheKey)) {
        //     return Edge.geometryCache.get(cacheKey);
        // }
        // Edge.geometryCache.set(cacheKey, geometry);
    }

    createMaterial() {
        const color = this.options.color;
        const style = this.options.style;
        
        // Erstelle für jede Edge ein einzigartiges Material ohne Caching
        // Das verhindert das Problem, dass mehrere Edges das gleiche Material teilen
        let material;

        switch(style) {
            case 'dashed':
                material = new THREE.MeshPhongMaterial({
                    color: color,
                    transparent: true,
                    opacity: 1,
					side: THREE.DoubleSide,
					shininess: 30
                });
                break;
            case 'dotted':
                material = new THREE.MeshPhongMaterial({
                    color: color,
                    transparent: true,
                    opacity: 1,
					side: THREE.DoubleSide,
					shininess: 30
                });
                break;
            default:
                material = new THREE.MeshPhongMaterial({
                    color: color,
					side: THREE.DoubleSide,
					shininess: 30
                });
                break;
        }
        
        // Speichere die ursprüngliche Farbe für Reset-Funktionen
        material.userData = {
            originalColor: color,
            originalStyle: style
        };
        
        return material;
    }

    setColor(color) {
        this.options.color = color;
    }

    setStyle(style) {
        this.options.style = style;
    }

    resetHighlight() {
        // Verwende die ursprüngliche Farbe aus den Material-UserData
        const originalColor = this.line.material.userData?.originalColor || this.options.color;
        const originalStyle = this.line.material.userData?.originalStyle || this.options.style;
        
        this.line.material.color.setHex(originalColor);
        this.line.material.transparent = (originalStyle === 'dashed' || originalStyle === 'dotted');
        
        // Stelle auch die Opacity zurück, falls sie verändert wurde
        if (originalStyle !== 'dashed' && originalStyle !== 'dotted') {
            this.line.material.opacity = 1.0;
        }
    }

    // Methode zum Aktualisieren der Geometrie-Parameter
    updateGeometry(newOptions = {}) {
        // Aktualisiere die Optionen
        Object.assign(this.options, newOptions);
        
        // Erstelle neue Geometrie
        const curve = this.createCurve();
        const newGeometry = new THREE.TubeGeometry(
            curve,
            this.options.segments,
            this.options.radius,
            this.options.radialSegments,
            false
        );
        
        // Ersetze die alte Geometrie
        this.line.geometry.dispose();
        this.line.geometry = newGeometry;
    }

    // Getter für aktuelle Geometrie-Parameter
    getGeometryParams() {
        return {
            segments: this.options.segments,
            radius: this.options.radius,
            radialSegments: this.options.radialSegments
        };
    }
    
    update(deltaTime) {
        if (!this.animationActive) return;
        
        // Update animation phase
        this.animationPhase += deltaTime * this.animationSpeed;
        if (this.animationPhase > 1) this.animationPhase -= 1;
        
        switch (this.options.style) {
            case 'pulsing':
                this.updatePulsingAnimation();
                break;
            case 'flowing':
                this.updateFlowingAnimation();
                break;
        }
    }
    
    updatePulsingAnimation() {
        // Pulsing effect: change opacity based on sine wave
        const opacity = 0.3 + 0.7 * Math.sin(this.animationPhase * Math.PI * 2) ** 2;
        
        if (!this.line.material.transparent) {
            this.line.material.transparent = true;
        }
        
        this.line.material.opacity = opacity;
    }
    
    updateFlowingAnimation() {
        // Flowing effect: move texture along the edge
        if (!this.line.material.map) {
            // Create a flowing texture if it doesn't exist
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 1;
            const ctx = canvas.getContext('2d');
            
            // Create gradient pattern
            const gradient = ctx.createLinearGradient(0, 0, 64, 0);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 1);
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(5, 1);
            
            // Apply texture to material
            this.line.material = new THREE.MeshPhongMaterial({
                color: this.options.color,
                map: texture,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide,
                shininess: 30
            });
        }
        
        // Animate texture offset
        this.line.material.map.offset.x = this.animationPhase;
    }
}
