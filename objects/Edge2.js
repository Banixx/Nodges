import * as THREE from 'three';

export class Edge2 {
    constructor(startPosition, endPosition, startNodeRadius, endNodeRadius, options = {}) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.startNodeRadius = startNodeRadius;
        this.endNodeRadius = endNodeRadius;
        this.options = options;
        this.tube = this.createTube();
    }

    createTube() {
        // Berechne die Mitte der Verbindung
        const midPoint = new THREE.Vector3().lerpVectors(
            this.startPosition, 
            this.endPosition, 
            0.5
        );

        // Berechne die Richtung der Verbindung
        const direction = new THREE.Vector3().subVectors(
            this.endPosition, 
            this.startPosition
        ).normalize();

        // Berechne senkrechte Richtung für den Bogen
        const perpendicular = new THREE.Vector3(1, 0, 0).cross(direction);
        if (perpendicular.length() < 0.0001) {
            perpendicular.set(0, 1, 0).cross(direction);
        }
        perpendicular.normalize();

        // Höhe des Bogens basierend auf Kantenlänge
        const curveHeight = direction.length() * (this.options.curveFactor || 0.7); 
        const controlPoint = midPoint.clone().add(perpendicular.multiplyScalar(curveHeight));

        // Quadratische Bézier-Kurve mit 3 Punkten
        const curve = new THREE.QuadraticBezierCurve3(
            this.startPosition,
            controlPoint,
            this.endPosition
        );

        // TubeGeometry entlang der Kurve
        const tubeGeometry = new THREE.TubeGeometry(
            curve,
            5,       // tubularSegments (5 wie angefordert)
            0.1,     // radius der Röhre
            8,       // radialSegments
            false    // geschlossen?
        );

        // Material mit Standard- oder Optionsfarbe
        const material = new THREE.MeshBasicMaterial({
            color: this.options.color || 0xb498db,
            side: THREE.DoubleSide
        });

        return new THREE.Mesh(tubeGeometry, material);
    }

    updatePositions(startPosition, endPosition, startNodeRadius, endNodeRadius) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.startNodeRadius = startNodeRadius;
        this.endNodeRadius = endNodeRadius;
        
        // Ersetze die Geometrie komplett (einfacher als Update)
        this.tube.geometry.dispose();
        this.tube.geometry = this.createTube().geometry;
    }

    dispose() {
        if (this.tube) {
            this.tube.geometry.dispose();
            this.tube.material.dispose();
            this.tube = null;
        }
    }
}
