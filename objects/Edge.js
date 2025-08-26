import * as THREE from 'three';

export class Edge {
    constructor(startPosition, endPosition, startNodeRadius, endNodeRadius, options = {}) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.startNodeRadius = startNodeRadius;
        this.endNodeRadius = endNodeRadius;
        this.options = options;
        this.tube = this.createTube();
    }

    createTube() {
        // Sicherstellen, dass die Positionen gültige THREE.Vector3 Objekte sind
        const startPos = new THREE.Vector3(
            this.startPosition.x || 0,
            this.startPosition.y || 0,
            this.startPosition.z || 0
        );
        
        const endPos = new THREE.Vector3(
            this.endPosition.x || 0,
            this.endPosition.y || 0,
            this.endPosition.z || 0
        );

        // Berechne die Mitte der Verbindung
        const midPoint = new THREE.Vector3().lerpVectors(
            startPos, 
            endPos, 
            0.5
        );

        // Berechne die Richtung der Verbindung
        const direction = new THREE.Vector3().subVectors(
            endPos, 
            startPos
        ).normalize();

        // Berechne senkrechte Richtung für den Bogen basierend auf der Anzahl der Kanten zwischen den Knoten
        let perpendicular = new THREE.Vector3(1, 0, 0).cross(direction);
        if (perpendicular.length() < 0.0001) {
            perpendicular.set(0, 1, 0).cross(direction);
        }
        perpendicular.normalize();

        // Berücksichtige die Anzahl der Kanten zwischen den Knoten
        const totalEdges = this.options.totalEdges || 1;
        const edgeIndex = this.options.index || 0;
        
        if (totalEdges > 1) {
            const angle = (2 * Math.PI) / totalEdges; // Winkel zwischen den Kanten
            const rotationAxis = direction.clone().normalize();
            const rotationMatrix = new THREE.Matrix4().makeRotationAxis(rotationAxis, angle * edgeIndex);
            perpendicular.applyMatrix4(rotationMatrix);
        }

        // Zufällige Höhe des Bogens basierend auf Kantenlänge und Index
        const curveFactor = 0.5 + (edgeIndex * 0.25); // Unterschiedliche Höhe für jede Kante
        const curveHeight = direction.length() * curveFactor;
        const controlPoint = midPoint.clone().add(perpendicular.multiplyScalar(curveHeight));

        this.curve = new THREE.QuadraticBezierCurve3(
            startPos,
            controlPoint,
            endPos
        );

        // TubeGeometry entlang der gespeicherten Kurve
        const tubeGeometry = new THREE.TubeGeometry(
            this.curve,
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
        
        // Füge userData hinzu, um das Material zu identifizieren
        material.userData = {
            originalColor: this.options.color || 0xb498db
        };

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
