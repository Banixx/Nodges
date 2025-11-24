// Realistische Force-Directed-Layout-Berechnung im Hintergrundthread
console.log('Layout Worker loaded');
self.onmessage = function (event) {
    try {
        console.log('Worker received message:', event.data);
        const { nodes, edges, algorithm, options } = event.data;

        if (!nodes || !Array.isArray(nodes)) {
            throw new Error('Nodes missing or invalid');
        }

        let positions = nodes.map(node => ({
            x: node.x || (Math.random() - 0.5) * 10,
            y: node.y || (Math.random() - 0.5) * 10,
            z: node.z || (Math.random() - 0.5) * 10
        }));

        const velocities = positions.map(() => ({ x: 0, y: 0, z: 0 }));

        if (algorithm === 'force-directed') {
            // Standardwerte für Optionen
            const repulsionStrength = options.repulsionStrength || 75;
            const attractionStrength = options.attractionStrength || 0.1;
            const damping = options.damping || 0.9;
            const maxIterations = options.maxIterations || 100;
            const minEnergyThreshold = options.minEnergyThreshold || 0.001;

            for (let iter = 0; iter < maxIterations; iter++) {
                // Kräfte zurücksetzen
                const forces = positions.map(() => ({ x: 0, y: 0, z: 0 }));
                let totalEnergy = 0;

                // Coulomb-Abstoßung zwischen allen Knotenpaaren
                for (let i = 0; i < positions.length; i++) {
                    for (let j = i + 1; j < positions.length; j++) {
                        const dx = positions[i].x - positions[j].x;
                        const dy = positions[i].y - positions[j].y;
                        const dz = positions[i].z - positions[j].z;
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.01;

                        // Abstoßungskraft (Coulomb'sches Gesetz)
                        const force = repulsionStrength / (distance * distance);
                        const nx = dx / distance;
                        const ny = dy / distance;
                        const nz = dz / distance;

                        forces[i].x += nx * force;
                        forces[i].y += ny * force;
                        forces[i].z += nz * force;

                        forces[j].x -= nx * force;
                        forces[j].y -= ny * force;
                        forces[j].z -= nz * force;

                        totalEnergy += Math.abs(force);
                    }
                }

                // Hooke-Anziehung entlang der Kanten
                for (const edge of edges) {
                    const i = edge.start;
                    const j = edge.end;
                    if (i >= positions.length || j >= positions.length) continue;

                    const dx = positions[i].x - positions[j].x;
                    const dy = positions[i].y - positions[j].y;
                    const dz = positions[i].z - positions[j].z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.01;

                    // Anziehungskraft (Hooke'sches Gesetz)
                    const force = attractionStrength * distance;
                    const nx = dx / distance;
                    const ny = dy / distance;
                    const nz = dz / distance;

                    forces[i].x -= nx * force;
                    forces[i].y -= ny * force;
                    forces[i].z -= nz * force;

                    forces[j].x += nx * force;
                    forces[j].y += ny * force;
                    forces[j].z += nz * force;

                    totalEnergy += Math.abs(force);
                }

                // Positionen und Geschwindigkeiten aktualisieren
                for (let i = 0; i < positions.length; i++) {
                    // Geschwindigkeit aktualisieren
                    velocities[i].x = (velocities[i].x + forces[i].x) * damping;
                    velocities[i].y = (velocities[i].y + forces[i].y) * damping;
                    velocities[i].z = (velocities[i].z + forces[i].z) * damping;

                    // Position aktualisieren
                    positions[i].x += velocities[i].x;
                    positions[i].y += velocities[i].y;
                    positions[i].z += velocities[i].z;
                }

                // Frühes Beenden bei geringer Energie
                if (totalEnergy < minEnergyThreshold) {
                    break;
                }
            }
        }

        // Ergebnisse zurück an den Hauptthread senden
        self.postMessage({ positions });
    } catch (error) {
        console.error('Worker Internal Error:', error);
        // Send error back to main thread if possible, or just rely on console
    }
};
