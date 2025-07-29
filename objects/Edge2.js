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

        // Berechne senkrechte Richtung für den Bogen basierend auf der Anzahl der Kanten zwischen den Knoten
        let perpendicular = new THREE.Vector3(1, 0, 0).cross(direction);
        if (perpendicular.length() < 0.0001) {
            perpendicular.set(0, 1, 0).cross(direction);
        }
        perpendicular.normalize();

        // Berücksichtige die Anzahl der Kanten zwischen den Knoten
        if (this.options.totalEdges > 1) {
            const angle = (2 * Math.PI) / this.options.totalEdges; // Winkel zwischen den Kanten
            const rotationAxis = direction.clone().normalize();
            const rotationMatrix = new THREE.Matrix4().makeRotationAxis(rotationAxis, angle * this.options.index);
            perpendicular.applyMatrix4(rotationMatrix);
        }

        // Zufällige Höhe des Bogens basierend auf Kantenlänge und Index
        const curveFactor = 0.5 + (this.options.index * 0.25); // Unterschiedliche Höhe für jede Kante
        const curveHeight = direction.length() * curveFactor;
        const controlPoint = midPoint.clone().add(perpendicular.multiplyScalar(curveHeight));

        // Quadratische Bézier-Kurve mit 3 Punkten
        console.log('Erstelle Kante mit folgenden Parametern:');
        console.log('Startposition:', this.startPosition);
        console.log('Endposition:', this.endPosition);
        console.log('Anzahl Kanten zwischen Knoten:', this.options.totalEdges);
        console.log('Index dieser Kante:', this.options.index);
        console.log('Richtung:', direction);
        console.log('Senkrechte Richtung:', perpendicular);
        console.log('Kontrollpunkt:', controlPoint);
        console.log('Kurvenhöhe:', curveHeight);
        console.log('Mittelpunkt:', midPoint);
        console.log('Berechnete senkrechte Richtung:', perpendicular);
        console.log('Berechnete Richtung:', direction);
        console.log('Berechneter Kontrollpunkt:', controlPoint);

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

        const tube = new THREE.Mesh(tubeGeometry, material);
        
        // WICHTIG: userData fuer Edge-Erkennung setzen
        tube.userData = {
            type: 'edge',
            edge: this,
            name: this.options.name || 'Unbenannte Kante'
        };

        return tube;
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
